import { NextResponse } from 'next/server';
import { isOAuthConfigured } from '@/lib/oauth';

/**
 * 获取 OAuth 配置状态
 * GET /api/auth/oauth/status
 * 
 * 返回哪些第三方登录已配置
 * 注意：Google 登录暂时禁用（服务器无法访问 Google API）
 */
export async function GET() {
  return NextResponse.json({
    google: false, // 暂时禁用 Google 登录
    github: isOAuthConfigured('github'),
  });
}
