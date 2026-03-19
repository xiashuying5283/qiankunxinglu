import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 生成随机令牌
function generateResetToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 获取基础 URL
function getBaseUrl(): string {
  return process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
}

/**
 * 请求重置密码
 * POST /api/auth/forgot-password
 * 
 * 接收邮箱地址，生成重置令牌并发送重置链接
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // 参数验证
    if (!email) {
      return NextResponse.json(
        { error: '请输入邮箱地址' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查找用户
    const { data: user, error } = await client
      .from('users')
      .select('id, email, name, is_guest, provider')
      .eq('email', email)
      .single();

    // 即使用户不存在也返回成功（安全考虑，不暴露用户是否存在）
    if (error || !user) {
      return NextResponse.json({
        success: true,
        message: '如果该邮箱已注册，您将收到重置密码的邮件',
      });
    }

    // 游客账户不能重置密码
    if (user.is_guest) {
      return NextResponse.json({
        success: true,
        message: '如果该邮箱已注册，您将收到重置密码的邮件',
      });
    }

    // 第三方登录账户提示
    if (user.provider) {
      return NextResponse.json({
        success: true,
        message: '该账户使用第三方登录，请直接使用对应的登录方式',
      });
    }

    // 生成重置令牌（有效期1小时）
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // 保存令牌到数据库
    await client
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires,
      })
      .eq('id', user.id);

    // 生成重置链接
    const resetUrl = `${getBaseUrl()}/reset-password?token=${resetToken}`;

    // 在生产环境中，这里应该发送邮件
    // 由于当前环境可能没有配置邮件服务，我们在开发模式下直接返回链接
    const isDev = process.env.NODE_ENV === 'development' || process.env.COZE_PROJECT_ENV === 'DEV';

    if (isDev) {
      // 开发模式：直接返回重置链接（方便测试）
      console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
      
      return NextResponse.json({
        success: true,
        message: '重置链接已生成',
        // 仅在开发环境返回链接
        dev_reset_url: resetUrl,
      });
    }

    // 生产环境：发送邮件（需要配置邮件服务）
    // TODO: 实现邮件发送逻辑
    // await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({
      success: true,
      message: '如果该邮箱已注册，您将收到重置密码的邮件',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: '请求失败，请稍后重试' },
      { status: 500 }
    );
  }
}
