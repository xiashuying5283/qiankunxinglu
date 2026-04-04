import { NextRequest, NextResponse } from 'next/server';
import { 
  createCredential, 
  getUserCredentials, 
  revokeCredential,
  getSessionUserId 
} from '@/lib/api-auth';

/**
 * 获取用户的所有凭证
 * GET /api/credentials
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    
    // 检查是否为游客
    const { getSupabaseClient } = await import('@/storage/database/supabase-client');
    const client = getSupabaseClient();
    const { data: user } = await client
      .from('users')
      .select('is_guest')
      .eq('id', userId)
      .single();
    
    if (user?.is_guest) {
      return NextResponse.json({ error: '游客无法使用此功能，请先注册账户' }, { status: 403 });
    }
    
    const credentials = await getUserCredentials(userId);
    
    // 隐藏敏感信息
    const safeCredentials = credentials.map(cred => ({
      id: cred.id,
      access_key: cred.access_key,
      name: cred.name,
      status: cred.status, // pending, approved, rejected
      reason: cred.reason, // 申请理由或拒绝原因
      is_active: cred.is_active && !cred.revoked_at,
      created_at: cred.created_at,
      revoked_at: cred.revoked_at,
      reviewed_at: cred.reviewed_at,
    }));
    
    return NextResponse.json({ credentials: safeCredentials });
  } catch (error) {
    console.error('Get credentials error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

/**
 * 创建新凭证
 * POST /api/credentials
 * Body: { name?: string, reason?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    
    const body = await request.json().catch(() => ({}));
    const { name, reason } = body;
    
    const result = await createCredential(userId, name, reason);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true,
      accessKey: result.accessKey,
      secretKey: result.secretKey, // 只显示一次
      message: '请立即保存 SecretKey，关闭后将无法再次查看。凭证需要管理员审批后才能使用。'
    });
  } catch (error) {
    console.error('Create credential error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

/**
 * 撤销凭证
 * DELETE /api/credentials
 * Body: { credential_id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    
    const body = await request.json();
    const { credential_id } = body;
    
    if (!credential_id) {
      return NextResponse.json({ error: '缺少 credential_id 参数' }, { status: 400 });
    }
    
    const result = await revokeCredential(userId, credential_id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: '凭证已撤销' });
  } catch (error) {
    console.error('Revoke credential error:', error);
    return NextResponse.json({ error: '撤销失败' }, { status: 500 });
  }
}
