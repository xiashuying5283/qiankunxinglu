import { NextRequest, NextResponse } from 'next/server';
import { getPgClient } from '@/storage/database/pg-client';
import { isMailConfigured, sendPasswordResetEmail } from '@/lib/mail';

// 生成随机令牌
function generateResetToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 获取基础 URL
function getBaseUrl(): string {
  return process.env.APP_URL || 'http://localhost:5000';
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

    const client = getPgClient();

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
        message: '如果该邮箱已注册，您将收到重置密码的邮件',
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

    // 检查邮件服务是否已配置
    const mailConfigured = isMailConfigured();
    const isDev = process.env.NODE_ENV === 'development';

    if (mailConfigured) {
      // 发送邮件
      const result = await sendPasswordResetEmail(email, resetUrl);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: '重置密码邮件已发送，请查收邮件',
        });
      } else {
        // 邮件发送失败，开发环境下返回链接
        if (isDev) {
          console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
          return NextResponse.json({
            success: true,
            message: '邮件发送失败，请使用下方链接',
            dev_reset_url: resetUrl,
          });
        }
        
        return NextResponse.json({
          success: false,
          error: '邮件发送失败，请稍后重试',
        });
      }
    }

    // 邮件服务未配置，开发环境下返回链接
    if (isDev) {
      console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
      return NextResponse.json({
        success: true,
        message: '重置链接已生成（邮件服务未配置）',
        dev_reset_url: resetUrl,
      });
    }

    // 生产环境但未配置邮件服务
    return NextResponse.json({
      success: false,
      error: '邮件服务未配置，请联系管理员',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: '请求失败，请稍后重试' },
      { status: 500 }
    );
  }
}
