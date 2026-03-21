import { NextRequest, NextResponse } from 'next/server';
import { 
  createApiKey, 
  getUserApiKeys, 
  revokeApiKey 
} from '@/lib/api-auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取用户的所有 API Key
 * GET /api/api-keys
 */
export async function GET(request: NextRequest) {
  try {
    // 从 cookie 或 header 获取用户 ID（这里简化处理，实际应该验证 session）
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    
    const keys = await getUserApiKeys(userId);
    
    // 隐藏敏感信息，只返回安全的数据
    const safeKeys = keys.map(key => ({
      id: key.id,
      prefix: key.key_prefix + '...', // 只显示前缀
      name: key.name,
      is_active: key.is_active && !key.revoked_at,
      rate_limit_per_day: key.rate_limit_per_day,
      last_used_at: key.last_used_at,
      expires_at: key.expires_at,
      created_at: key.created_at,
      revoked_at: key.revoked_at,
      revoked_reason: key.revoked_reason
    }));
    
    return NextResponse.json({ keys: safeKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

/**
 * 创建新的 API Key
 * POST /api/api-keys
 * Body: { name?: string, rate_limit_per_day?: number, expires_in_days?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    
    const body = await request.json().catch(() => ({}));
    const { name, rate_limit_per_day, expires_in_days } = body;
    
    const result = await createApiKey(
      userId,
      name,
      rate_limit_per_day,
      expires_in_days
    );
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true,
      key: result.key, // 这是唯一一次返回完整的 key
      message: '请立即保存此 Key，关闭后将无法再次查看完整内容'
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

/**
 * 撤销 API Key
 * DELETE /api/api-keys
 * Body: { key_id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    
    const body = await request.json();
    const { key_id } = body;
    
    if (!key_id) {
      return NextResponse.json({ error: '缺少 key_id 参数' }, { status: 400 });
    }
    
    const result = await revokeApiKey(userId, key_id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: 'API Key 已撤销' });
  } catch (error) {
    console.error('Revoke API key error:', error);
    return NextResponse.json({ error: '撤销失败' }, { status: 500 });
  }
}

/**
 * 从请求中获取用户 ID
 * 支持两种方式：
 * 1. 从 Authorization header 中的 session token
 * 2. 从 cookie 中的 session
 */
async function getUserId(request: NextRequest): Promise<string | null> {
  // 开发环境允许模拟用户
  if (process.env.COZE_PROJECT_ENV === 'DEV') {
    const devUser = request.headers.get('x-dev-user-id');
    if (devUser) return devUser;
    return 'dev-user';
  }
  
  // 从 cookie 获取 session
  const client = getSupabaseClient();
  
  // 尝试从 cookie 获取 access token
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...v] = c.trim().split('=');
      return [key, v.join('=')];
    })
  );
  
  // 查找 access token（Supabase 的 cookie 名称）
  const accessToken = cookies['sb-access-token'] || cookies['access_token'];
  
  if (accessToken) {
    try {
      // 验证 token 并获取用户
      const { data: { user } } = await client.auth.getUser(accessToken);
      if (user) return user.id;
    } catch {
      // Token 无效
    }
  }
  
  return null;
}
