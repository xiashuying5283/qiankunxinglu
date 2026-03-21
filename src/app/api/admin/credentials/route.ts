import { NextRequest, NextResponse } from 'next/server';
import { 
  getPendingCredentials,
  getAllCredentials,
  reviewCredential,
  getSessionUserId
} from '@/lib/api-auth';

// 管理员用户ID列表（从环境变量获取）
// 如果未配置，则所有登录用户都可以访问（开发环境）
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

/**
 * 检查是否为管理员
 */
async function isAdmin(userId: string): Promise<boolean> {
  // 开发环境：所有用户都是管理员
  if (isDev) {
    return true;
  }
  // 生产环境：需要配置 ADMIN_USER_IDS
  if (ADMIN_USER_IDS.length === 0) {
    console.warn('ADMIN_USER_IDS not configured');
    return false;
  }
  return ADMIN_USER_IDS.includes(userId);
}

/**
 * 获取凭证列表
 * GET /api/admin/credentials?status=pending
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let credentials;
    if (status === 'pending') {
      credentials = await getPendingCredentials();
    } else {
      credentials = await getAllCredentials();
    }
    
    // 隐藏敏感信息
    const safeCredentials = credentials.map(cred => ({
      id: cred.id,
      user_id: cred.user_id,
      user_email: cred.user_email,
      user_name: cred.user_name,
      access_key: cred.access_key,
      name: cred.name,
      status: cred.status,
      reason: cred.reason,
      is_active: cred.is_active,
      created_at: cred.created_at,
      revoked_at: cred.revoked_at,
      reviewed_at: cred.reviewed_at,
      reviewed_by: cred.reviewed_by,
    }));
    
    return NextResponse.json({ credentials: safeCredentials });
  } catch (error) {
    console.error('Get admin credentials error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

/**
 * 审批凭证
 * POST /api/admin/credentials
 * Body: { credential_id: string, approved: boolean, reject_reason?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }
    
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: '无权限访问' }, { status: 403 });
    }
    
    const body = await request.json();
    const { credential_id, approved, reject_reason } = body;
    
    if (!credential_id) {
      return NextResponse.json({ error: '缺少 credential_id 参数' }, { status: 400 });
    }
    
    if (typeof approved !== 'boolean') {
      return NextResponse.json({ error: '缺少 approved 参数' }, { status: 400 });
    }
    
    const result = await reviewCredential(credential_id, userId, approved, reject_reason);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: approved ? '凭证已批准' : '凭证已拒绝' 
    });
  } catch (error) {
    console.error('Review credential error:', error);
    return NextResponse.json({ error: '审批失败' }, { status: 500 });
  }
}
