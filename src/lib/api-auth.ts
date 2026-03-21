/**
 * API 鉴权工具
 * 使用 HMAC 签名认证
 * 
 * 支持两种鉴权方式：
 * 1. HMAC 签名认证 - 用于外部 API 调用
 * 2. 登录态鉴权 - 用于前端页面
 */

import { createHash, createHmac, randomBytes } from 'crypto';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 配置
export const AUTH_CONFIG = {
  accessKeyPrefix: 'ak_',
  secretKeyPrefix: 'sk_',
  keyLength: 24,
  signatureExpireSeconds: 900, // 签名有效期 15 分钟
  maxCredentialsPerUser: 5,
  guestDailyLimit: 10, // 游客每日大模型调用次数限制
};

// 鉴权结果类型
export interface AuthResult {
  success: boolean;
  error?: string;
  statusCode?: number;
  userId?: string;
  credentialId?: string;
  authType?: 'hmac' | 'session';
  isGuest?: boolean; // 是否为游客
  guestUsageCount?: number; // 游客今日已使用次数
  guestLimitReached?: boolean; // 游客是否已达上限
  // 兼容旧接口，实际不做任何操作
  logUsage?: (statusCode: number, responseTimeMs: number, error?: string) => Promise<void>;
}

// 凭证信息（数据库）
export interface ApiCredential {
  id: string;
  user_id: string;
  access_key: string;
  secret_key_hash: string;
  name: string | null;
  is_active: boolean;
  created_at: string;
  revoked_at: string | null;
}

/**
 * 检查游客今日使用次数
 */
export async function checkGuestUsage(userId: string): Promise<{ count: number; limitReached: boolean }> {
  const client = getSupabaseClient();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  const { data, error } = await client
    .from('guest_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();
  
  if (error || !data) {
    return { count: 0, limitReached: false };
  }
  
  const count = data.count || 0;
  return {
    count,
    limitReached: count >= AUTH_CONFIG.guestDailyLimit,
  };
}

/**
 * 增加游客使用次数
 */
export async function incrementGuestUsage(userId: string): Promise<void> {
  const client = getSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);
  
  // 尝试更新
  const { data: existing } = await client
    .from('guest_usage')
    .select('id, count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();
  
  if (existing) {
    // 更新计数
    await client
      .from('guest_usage')
      .update({ count: (existing.count || 0) + 1 })
      .eq('id', existing.id);
  } else {
    // 插入新记录
    await client
      .from('guest_usage')
      .insert({
        user_id: userId,
        usage_date: today,
        count: 1,
      });
  }
}

/**
 * 检查用户是否为游客
 */
export async function checkIsGuest(userId: string): Promise<boolean> {
  const client = getSupabaseClient();
  
  const { data: user } = await client
    .from('users')
    .select('is_guest')
    .eq('id', userId)
    .single();
  
  return user?.is_guest || false;
}

/**
 * 判断请求是否来自开发环境
 */
function isDevelopmentRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  if (origin?.includes('localhost') || referer?.includes('localhost')) {
    return true;
  }
  
  const devDomainPattern = /\.dev\.coze\.site$/;
  if (origin && devDomainPattern.test(new URL(origin).hostname)) {
    return true;
  }
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (devDomainPattern.test(refererUrl.hostname)) {
        return true;
      }
    } catch {
      // URL 解析失败
    }
  }
  
  return false;
}

/**
 * 从请求中获取登录用户 ID（前端页面使用）
 */
export async function getSessionUserId(request: Request): Promise<string | null> {
  // 开发环境支持模拟用户
  if (isDevelopmentRequest(request)) {
    const devUserId = request.headers.get('x-dev-user-id');
    if (devUserId) return devUserId;
    return 'dev-user-001';
  }
  
  // 从 cookie 获取 auth token
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(c => {
    const trimmed = c.trim();
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      cookies[trimmed.slice(0, eqIndex)] = trimmed.slice(eqIndex + 1);
    }
  });
  
  const authToken = cookies['auth_token'];
  if (authToken) {
    try {
      const { jwtVerify } = await import('jose');
      const secret = process.env.JWT_SECRET || 'divination-app-secret-key-2024';
      const secretKey = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(authToken, secretKey);
      if (payload && typeof payload === 'object' && 'id' in payload) {
        return payload.id as string;
      }
    } catch {
      // Token 无效
    }
  }
  
  return null;
}

/**
 * 生成 AccessKey 和 SecretKey
 */
export function generateCredential(): { accessKey: string; secretKey: string } {
  const accessKey = AUTH_CONFIG.accessKeyPrefix + randomBytes(AUTH_CONFIG.keyLength)
    .toString('base64')
    .replace(/[+/=]/g, '')
    .slice(0, AUTH_CONFIG.keyLength);
  
  const secretKey = AUTH_CONFIG.secretKeyPrefix + randomBytes(AUTH_CONFIG.keyLength)
    .toString('base64')
    .replace(/[+/=]/g, '')
    .slice(0, AUTH_CONFIG.keyLength);
  
  return { accessKey, secretKey };
}

/**
 * 哈希 SecretKey（用于存储）
 */
export function hashSecretKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * 生成签名
 * 签名字符串格式: METHOD\nURL\nTIMESTAMP
 */
export function generateSignature(
  method: string,
  url: string,
  timestamp: number,
  secretKey: string
): string {
  const stringToSign = `${method.toUpperCase()}\n${url}\n${timestamp}`;
  return createHmac('sha256', secretKey).update(stringToSign).digest('hex');
}

/**
 * 验证签名
 */
export function verifySignature(
  method: string,
  url: string,
  timestamp: number,
  signature: string,
  secretKey: string
): boolean {
  // 检查时间戳是否在有效期内
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > AUTH_CONFIG.signatureExpireSeconds) {
    return false;
  }
  
  // 生成签名并比对
  const expectedSignature = generateSignature(method, url, timestamp, secretKey);
  return signature === expectedSignature;
}

/**
 * 从请求中提取签名认证信息
 */
export function extractSignatureAuth(request: Request): {
  accessKey: string | null;
  timestamp: number | null;
  signature: string | null;
} {
  const accessKey = request.headers.get('X-Access-Key');
  const timestampStr = request.headers.get('X-Timestamp');
  const signature = request.headers.get('X-Signature');
  
  return {
    accessKey,
    timestamp: timestampStr ? parseInt(timestampStr, 10) : null,
    signature,
  };
}

/**
 * 获取客户端 IP
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  
  return 'unknown';
}

/**
 * 统一鉴权函数
 */
export async function verifyAuth(request: Request): Promise<AuthResult> {
  // 1. 检查 HMAC 签名认证（外部 API 调用）
  const { accessKey, timestamp, signature } = extractSignatureAuth(request);
  
  if (accessKey && timestamp && signature) {
    const client = getSupabaseClient();
    
    // 查询凭证
    const { data: credential, error } = await client
      .from('api_credentials')
      .select('*')
      .eq('access_key', accessKey)
      .single();
    
    if (error || !credential) {
      return { success: false, error: '无效的 AccessKey', statusCode: 401 };
    }
    
    const cred = credential as ApiCredential;
    
    // 检查是否激活
    if (!cred.is_active || cred.revoked_at) {
      return { success: false, error: '凭证已被禁用或撤销', statusCode: 403 };
    }
    
    // 验证签名（需要原始 secretKey，这里我们存储的是 hash，所以需要换一种方式）
    // 实际上，签名验证需要用原始 secretKey，但我们只存储了 hash
    // 解决方案：存储 secretKey 的 hash 用于验证身份，但签名验证需要用户提供的 secretKey
    
    // 所以这里需要用户在调用时同时提供 secretKey，或者我们存储原始 secretKey
    // 为了安全性，我们让用户在请求头中也传递 SecretKey（通过签名间接验证）
    
    // 重新思考：用户端有 accessKey 和 secretKey
    // 调用时：accessKey 明文传递，secretKey 用于签名但不明文传递
    // 服务端需要根据 accessKey 找到 secretKey 来验证签名
    // 所以我们需要存储原始 secretKey（或可解密的加密形式）
    
    // 简化方案：存储 secretKey 的 hash 用于查找，但验证签名时需要原始 secretKey
    // 既然签名是用 secretKey 生成的，我们需要存储原始 secretKey
    
    // 让我重新设计：存储 secret_key（加密或明文）
    // 为简化，这里我们存储原始 secretKey（实际生产建议加密存储）
    
    // 查询时获取 secret_key
    const { data: credWithSecret } = await client
      .from('api_credentials')
      .select('id, user_id, secret_key, is_active, revoked_at')
      .eq('access_key', accessKey)
      .single();
    
    if (!credWithSecret || !credWithSecret.secret_key) {
      return { success: false, error: '凭证配置错误', statusCode: 500 };
    }
    
    // 验证签名
    const url = new URL(request.url).pathname + new URL(request.url).search;
    const isValid = verifySignature(
      request.method,
      url,
      timestamp,
      signature,
      credWithSecret.secret_key
    );
    
    if (!isValid) {
      return { success: false, error: '签名验证失败或已过期', statusCode: 401 };
    }
    
    return {
      success: true,
      userId: credWithSecret.user_id,
      credentialId: credWithSecret.id,
      authType: 'hmac',
      logUsage: async () => {}, // HMAC 认证不记录使用日志
    };
  }
  
  // 2. 检查登录态（前端页面）
  const sessionUserId = await getSessionUserId(request);
  if (sessionUserId) {
    // 检查是否为游客
    const isGuest = await checkIsGuest(sessionUserId);
    
    if (isGuest) {
      // 检查游客使用次数
      const { count, limitReached } = await checkGuestUsage(sessionUserId);
      
      return {
        success: true,
        userId: sessionUserId,
        authType: 'session',
        isGuest: true,
        guestUsageCount: count,
        guestLimitReached: limitReached,
        logUsage: async () => {},
      };
    }
    
    return {
      success: true,
      userId: sessionUserId,
      authType: 'session',
      isGuest: false,
      logUsage: async () => {},
    };
  }
  
  // 3. 鉴权失败
  return {
    success: false,
    error: '请提供有效的签名认证或登录后访问',
    statusCode: 401,
  };
}

/**
 * 创建 API 凭证
 */
export async function createCredential(
  userId: string,
  name?: string
): Promise<{ success: boolean; accessKey?: string; secretKey?: string; error?: string }> {
  const client = getSupabaseClient();
  
  // 检查用户的凭证数量
  const { count, error: countError } = await client
    .from('api_credentials')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('revoked_at', null);
  
  if (countError) {
    return { success: false, error: '检查凭证数量失败' };
  }
  
  if (count && count >= AUTH_CONFIG.maxCredentialsPerUser) {
    return { 
      success: false, 
      error: `每个用户最多只能创建 ${AUTH_CONFIG.maxCredentialsPerUser} 个凭证` 
    };
  }
  
  // 检查用户是否为游客
  const { data: user } = await client
    .from('users')
    .select('is_guest')
    .eq('id', userId)
    .single();
  
  if (user?.is_guest) {
    return { success: false, error: '游客无法创建 API 凭证，请先注册账户' };
  }
  
  // 生成凭证
  const { accessKey, secretKey } = generateCredential();
  const secretKeyHash = hashSecretKey(secretKey);
  
  // 存储（同时存储 secretKey 用于签名验证，以及 hash 用于验证）
  const { error: insertError } = await client.from('api_credentials').insert({
    user_id: userId,
    access_key: accessKey,
    secret_key: secretKey, // 存储原始 secretKey
    secret_key_hash: secretKeyHash, // 存储 hash
    name: name || null,
    is_active: true,
  });
  
  if (insertError) {
    console.error('Failed to create credential:', insertError);
    return { success: false, error: '创建凭证失败' };
  }
  
  return { success: true, accessKey, secretKey };
}

/**
 * 撤销 API 凭证
 */
export async function revokeCredential(
  userId: string,
  credentialId: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from('api_credentials')
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
    })
    .eq('id', credentialId)
    .eq('user_id', userId);
  
  if (error) {
    return { success: false, error: '撤销失败' };
  }
  
  return { success: true };
}

/**
 * 获取用户的所有凭证
 */
export async function getUserCredentials(userId: string): Promise<ApiCredential[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('api_credentials')
    .select('id, user_id, access_key, secret_key_hash, name, is_active, created_at, revoked_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Failed to get credentials:', error);
    return [];
  }
  
  return (data || []) as ApiCredential[];
}
