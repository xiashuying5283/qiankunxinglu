import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPgClient } from '@/storage/database/pg-client';
import { generateToken, setAuthCookie } from '@/lib/auth';

/**
 * 用户注册 API
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 参数验证
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
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

    // 检查邮箱是否已注册
    const { data: existingUser } = await client
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: newUser, error } = await client
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        is_guest: false,
      })
      .select()
      .single();

    if (error || !newUser) {
      console.error('Create user error:', error);
      return NextResponse.json(
        { error: '注册失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 生成 Token
    const token = await generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      isGuest: false,
    });

    // 设置 Cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isGuest: false,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
