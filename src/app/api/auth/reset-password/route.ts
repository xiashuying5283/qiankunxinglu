import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPgClient } from '@/storage/database/pg-client';
import { generateToken, setAuthCookie } from '@/lib/auth';

/**
 * 验证重置令牌
 * GET /api/auth/reset-password?token=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        valid: false,
        error: '无效的重置链接',
      });
    }

    const client = getPgClient();

    // 查找有效的重置令牌
    const { data: user, error } = await client
      .from('users')
      .select('id, email, name, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (error || !user) {
      return NextResponse.json({
        valid: false,
        error: '无效的重置链接',
      });
    }

    // 检查令牌是否过期
    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: '重置链接已过期，请重新申请',
      });
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json({
      valid: false,
      error: '验证失败，请稍后重试',
    });
  }
}

/**
 * 重置密码
 * POST /api/auth/reset-password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // 参数验证
    if (!token || !password) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6位' },
        { status: 400 }
      );
    }

    const client = getPgClient();

    // 查找有效的重置令牌
    const { data: user, error: findError } = await client
      .from('users')
      .select('id, email, name, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { error: '无效的重置链接' },
        { status: 400 }
      );
    }

    // 检查令牌是否过期
    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      return NextResponse.json(
        { error: '重置链接已过期，请重新申请' },
        { status: 400 }
      );
    }

    // 哈希新密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 更新密码并清除重置令牌
    const { error: updateError } = await client
      .from('users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update password error:', updateError);
      return NextResponse.json(
        { error: '密码重置失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 生成 Token 并自动登录
    const authToken = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      isGuest: false,
    });

    // 设置 Cookie
    await setAuthCookie(authToken);

    return NextResponse.json({
      success: true,
      message: '密码重置成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isGuest: false,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: '密码重置失败，请稍后重试' },
      { status: 500 }
    );
  }
}
