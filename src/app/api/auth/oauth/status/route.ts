import { NextResponse } from 'next/server';
import { isOAuthConfigured } from '@/lib/oauth';

/**
 * 获取 OAuth 配置状态
 * GET /api/auth/oauth/status
 * 
 * 返回哪些第三方登录已配置
 */
export async function GET() {
  return NextResponse.json({
    google: isOAuthConfigured('google'),
    github: isOAuthConfigured('github'),
  });
}
