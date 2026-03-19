import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { generateToken, setAuthCookie, getCurrentUser } from '@/lib/auth';

/**
 * 用户登录 API
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 参数验证
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查找用户
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 400 }
      );
    }

    // 游客账户不能通过邮箱密码登录
    if (user.is_guest) {
      return NextResponse.json(
        { error: '该账户是游客账户，请使用其他邮箱注册' },
        { status: 400 }
      );
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 400 }
      );
    }

    // 生成 Token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      isGuest: false,
    });

    // 设置 Cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isGuest: false,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * 获取当前登录用户
 * GET /api/auth/login
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ user: null });
  }
}
