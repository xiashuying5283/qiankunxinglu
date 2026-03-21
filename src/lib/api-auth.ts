/**
 * API 鉴权工具
 * 提供 API Key 生成、验证、速率限制等功能
 * 
 * 支持两种鉴权方式：
 * 1. API Key 鉴权 - 用于外部调用
 * 2. 登录态鉴权 - 用于前端页面
 */

import { createHash, randomBytes } from 'crypto';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// API Key 前缀
const API_KEY_PREFIX = 'sk_div_';

// API Key 配置
export const API_KEY_CONFIG = {
  prefix: API_KEY_PREFIX,
  keyLength: 32, // 随机部分长度
  defaultRateLimit: 100, // 默认每日调用次数限制
  maxKeysPerUser: 5, // 每个用户最多创建的 Key 数量
};

// 鉴权结果类型
export interface AuthResult {
  success: boolean;
  error?: string;
  statusCode?: number;
  keyId?: string;
  userId?: string;
  rateLimitRemaining?: number;
  authType?: 'api_key' | 'session'; // 鉴权类型
}

// API Key 信息（数据库）
export interface ApiKeyData {
  id: string;
  user_id: string;
  key_hash: string;
  key_prefix: string;
  name: string | null;
  is_active: boolean;
  rate_limit_per_day: number;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
  revoked_reason: string | null;
}

/**
 * 判断请求是否来自开发环境
 * 通过检查 origin 或 referer 来判断
 */
function isDevelopmentRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // 检查是否来自 localhost
  if (origin?.includes('localhost') || referer?.includes('localhost')) {
    return true;
  }
  
  // 检查是否来自沙箱开发域名（.dev.coze.site）
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
      // URL 解析失败，忽略
    }
  }
  
  return false;
}

/**
 * 从请求中获取登录用户 ID
 * 用于前端页面的登录态鉴权
 * 
 * 开发环境支持模拟用户（通过 x-dev-user-id header）
 */
export async function getSessionUserId(request: Request): Promise<string | null> {
  // 开发环境支持模拟用户
  if (isDevelopmentRequest(request)) {
    const devUserId = request.headers.get('x-dev-user-id');
    if (devUserId) {
      return devUserId;
    }
    // 开发环境默认返回开发用户
    return 'dev-user-001';
  }
  
  // 从 cookie 获取 auth token
  const cookieHeader = request.headers.get('cookie') || '';
  
  // 解析 cookie
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(c => {
    const trimmed = c.trim();
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      cookies[trimmed.slice(0, eqIndex)] = trimmed.slice(eqIndex + 1);
    }
  });
  
  // 查找 auth token（应用使用 auth_token cookie）
  const authToken = cookies['auth_token'];
  
  if (authToken) {
    try {
      // 使用应用的 JWT 验证（与 lib/auth.ts 保持一致）
      const { jwtVerify } = await import('jose');
      const secret = process.env.JWT_SECRET || 'divination-app-secret-key-2024';
      const secretKey = new TextEncoder().encode(secret);
      
      const { payload } = await jwtVerify(authToken, secretKey);
      if (payload && typeof payload === 'object' && 'id' in payload) {
        return payload.id as string;
      }
    } catch {
      // Token 无效或过期
    }
  }
  
  return null;
}

/**
 * 生成 API Key
 * 返回明文 key（仅此一次）和存储信息
 */
export function generateApiKey(): { plainKey: string; keyHash: string; keyPrefix: string } {
  // 生成随机字节
  const randomPart = randomBytes(API_KEY_CONFIG.keyLength)
    .toString('base64')
    .replace(/[+/=]/g, '') // 移除特殊字符
    .slice(0, API_KEY_CONFIG.keyLength);
  
  const plainKey = `${API_KEY_PREFIX}${randomPart}`;
  const keyHash = hashApiKey(plainKey);
  const keyPrefix = plainKey.slice(0, 12); // 用于显示，如 sk_div_abc1...
  
  return { plainKey, keyHash, keyPrefix };
}

/**
 * 哈希 API Key（用于存储）
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * 验证 API Key 格式
 */
export function isValidKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  return key.startsWith(API_KEY_PREFIX) && key.length > API_KEY_PREFIX.length + 10;
}

/**
 * 从请求中提取 API Key
 */
export function extractApiKey(request: Request): string | null {
  // 1. 从 Authorization header 提取 (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  
  // 2. 从 X-API-Key header 提取
  const apiKeyHeader = request.headers.get('X-API-Key');
  if (apiKeyHeader) {
    return apiKeyHeader.trim();
  }
  
  // 3. 从查询参数提取（不推荐，但支持）
  const url = new URL(request.url);
  const queryKey = url.searchParams.get('api_key');
  if (queryKey) {
    return queryKey.trim();
  }
  
  return null;
}

/**
 * 获取客户端 IP
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

/**
 * 检查速率限制
 * 返回剩余调用次数，-1 表示已超限
 */
async function checkRateLimit(
  keyId: string, 
  rateLimitPerDay: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const client = getSupabaseClient();
  
  // 计算今天的开始时间（UTC）
  const now = new Date();
  const todayStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  
  // 查询今天的调用次数
  const { count, error } = await client
    .from('api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', keyId)
    .gte('created_at', todayStart.toISOString())
    .lt('created_at', tomorrowStart.toISOString());
  
  if (error) {
    console.error('Rate limit check error:', error);
    // 出错时允许通过，但记录日志
    return { allowed: true, remaining: rateLimitPerDay, resetAt: tomorrowStart };
  }
  
  const used = count || 0;
  const remaining = Math.max(0, rateLimitPerDay - used);
  
  return {
    allowed: used < rateLimitPerDay,
    remaining,
    resetAt: tomorrowStart
  };
}

/**
 * 记录 API 调用
 */
async function logApiUsage(
  keyId: string,
  endpoint: string,
  method: string,
  ipAddress: string,
  userAgent: string | null,
  statusCode: number,
  responseTimeMs: number,
  errorMessage?: string
): Promise<void> {
  const client = getSupabaseClient();
  
  try {
    await client.from('api_usage').insert({
      api_key_id: keyId,
      endpoint,
      method,
      ip_address: ipAddress,
      user_agent: userAgent,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      error_message: errorMessage || null
    });
    
    // 更新最后使用时间
    await client
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyId);
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}

/**
 * 验证 API Key 并检查速率限制
 * 这是最主要的鉴权函数
 */
export async function verifyApiKey(
  request: Request,
  options?: {
    skipRateLimit?: boolean;
    skipLogging?: boolean;
    requireApiKey?: boolean; // 强制要求 API Key，不使用登录态
  }
): Promise<AuthResult & { logUsage: (statusCode: number, responseTimeMs: number, error?: string) => Promise<void> }> {
  const startTime = Date.now();
  const { skipRateLimit = false, skipLogging = false, requireApiKey = false } = options || {};
  
  // 先检查是否提供了 API Key
  const apiKey = extractApiKey(request);
  
  // 如果提供了 API Key，优先使用 API Key 鉴权
  if (apiKey) {
    // 验证格式
    if (!isValidKeyFormat(apiKey)) {
      return {
        success: false,
        error: 'API Key 格式无效',
        statusCode: 401,
        logUsage: async () => {}
      };
    }
    
    const client = getSupabaseClient();
    const keyHash = hashApiKey(apiKey);
    
    // 查询 API Key
    const { data: keyData, error } = await client
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .single();
    
    if (error || !keyData) {
      return {
        success: false,
        error: 'API Key 无效或已撤销',
        statusCode: 401,
        logUsage: async () => {}
      };
    }
    
    const key = keyData as ApiKeyData;
    
    // 检查是否激活
    if (!key.is_active) {
      return {
        success: false,
        error: 'API Key 已被禁用',
        statusCode: 403,
        logUsage: async () => {}
      };
    }
    
    // 检查是否已撤销
    if (key.revoked_at) {
      return {
        success: false,
        error: `API Key 已撤销: ${key.revoked_reason || '原因未知'}`,
        statusCode: 403,
        logUsage: async () => {}
      };
    }
    
    // 检查是否过期
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return {
        success: false,
        error: 'API Key 已过期',
        statusCode: 403,
        logUsage: async () => {}
      };
    }
    
    // 检查速率限制
    if (!skipRateLimit) {
      const rateCheck = await checkRateLimit(key.id, key.rate_limit_per_day);
      
      if (!rateCheck.allowed) {
        return {
          success: false,
          error: `已达到每日调用限制 (${key.rate_limit_per_day} 次/天)，请明天再试`,
          statusCode: 429,
          keyId: key.id,
          userId: key.user_id,
          rateLimitRemaining: 0,
          authType: 'api_key',
          logUsage: async () => {}
        };
      }
      
      // 构建日志函数
      const endpoint = new URL(request.url).pathname;
      const method = request.method;
      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent');
      
      const logUsageFn = async (statusCode: number, responseTimeMs: number, errorMsg?: string) => {
        if (!skipLogging) {
          await logApiUsage(key.id, endpoint, method, ipAddress, userAgent, statusCode, responseTimeMs, errorMsg);
        }
      };
      
      return {
        success: true,
        keyId: key.id,
        userId: key.user_id,
        rateLimitRemaining: rateCheck.remaining,
        authType: 'api_key',
        logUsage: logUsageFn
      };
    }
    
    // 跳过速率限制的情况
    const endpoint = new URL(request.url).pathname;
    const method = request.method;
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent');
    
    const logUsageFn = async (statusCode: number, responseTimeMs: number, errorMsg?: string) => {
      if (!skipLogging) {
        await logApiUsage(key.id, endpoint, method, ipAddress, userAgent, statusCode, responseTimeMs, errorMsg);
      }
    };
    
    return {
      success: true,
      keyId: key.id,
      userId: key.user_id,
      authType: 'api_key',
      logUsage: logUsageFn
    };
  }
  
  // 没有 API Key，检查登录态（用于前端页面）
  if (!requireApiKey) {
    const sessionUserId = await getSessionUserId(request);
    if (sessionUserId) {
      // 使用登录态鉴权，不做速率限制
      const endpoint = new URL(request.url).pathname;
      const method = request.method;
      const ipAddress = getClientIp(request);
      const userAgent = request.headers.get('user-agent');
      
      const logUsageFn = async (statusCode: number, responseTimeMs: number, errorMsg?: string) => {
        // 登录态用户不记录到 api_usage
      };
      
      return {
        success: true,
        userId: sessionUserId,
        authType: 'session',
        logUsage: logUsageFn
      };
    }
  }
  
  // 没有 API Key 也没有登录态
  return {
    success: false,
    error: '缺少 API Key。请在请求头中添加 Authorization: Bearer <your-api-key> 或 X-API-Key: <your-api-key>',
    statusCode: 401,
    logUsage: async () => {}
  };
}

/**
 * 创建 API Key
 */
export async function createApiKey(
  userId: string,
  name?: string,
  rateLimitPerDay?: number,
  expiresInDays?: number
): Promise<{ success: boolean; key?: string; error?: string }> {
  const client = getSupabaseClient();
  
  // 检查用户的 Key 数量
  const { count, error: countError } = await client
    .from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('revoked_at', null);
  
  if (countError) {
    return { success: false, error: '检查 Key 数量失败' };
  }
  
  if (count && count >= API_KEY_CONFIG.maxKeysPerUser) {
    return { 
      success: false, 
      error: `每个用户最多只能创建 ${API_KEY_CONFIG.maxKeysPerUser} 个 API Key` 
    };
  }
  
  // 生成 Key
  const { plainKey, keyHash, keyPrefix } = generateApiKey();
  
  // 计算过期时间
  let expiresAt: string | null = null;
  if (expiresInDays && expiresInDays > 0) {
    expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  }
  
  // 存储 Key
  const { error: insertError } = await client.from('api_keys').insert({
    user_id: userId,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    name: name || null,
    rate_limit_per_day: rateLimitPerDay || API_KEY_CONFIG.defaultRateLimit,
    expires_at: expiresAt
  });
  
  if (insertError) {
    console.error('Failed to create API key:', insertError);
    return { success: false, error: '创建 API Key 失败' };
  }
  
  return { success: true, key: plainKey };
}

/**
 * 撤销 API Key
 */
export async function revokeApiKey(
  userId: string,
  keyId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from('api_keys')
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_reason: reason || '用户主动撤销'
    })
    .eq('id', keyId)
    .eq('user_id', userId);
  
  if (error) {
    return { success: false, error: '撤销失败' };
  }
  
  return { success: true };
}

/**
 * 获取用户的所有 API Key
 */
export async function getUserApiKeys(userId: string): Promise<ApiKeyData[]> {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Failed to get API keys:', error);
    return [];
  }
  
  return (data || []) as ApiKeyData[];
}

/**
 * 获取 API Key 使用统计
 */
export async function getApiKeyUsageStats(
  keyId: string,
  days: number = 7
): Promise<Array<{ date: string; count: number }>> {
  const client = getSupabaseClient();
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const { data, error } = await client
    .from('api_usage')
    .select('created_at')
    .eq('api_key_id', keyId)
    .gte('created_at', startDate.toISOString());
  
  if (error || !data) {
    return [];
  }
  
  // 按日期分组统计
  const stats: Record<string, number> = {};
  data.forEach(item => {
    const date = new Date(item.created_at).toISOString().slice(0, 10);
    stats[date] = (stats[date] || 0) + 1;
  });
  
  return Object.entries(stats).map(([date, count]) => ({ date, count }));
}
