import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// JWT 密钥（从环境变量获取或使用默认值）
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'divination-app-secret-key-2024';
  return new TextEncoder().encode(secret);
};

// 用户信息接口
export interface UserPayload {
  id: string;
  email?: string;
  name?: string;
  isGuest: boolean;
  sessionId?: string;
  [key: string]: unknown;
}

// 生成 JWT Token
export async function generateToken(payload: UserPayload): Promise<string> {
  const secretKey = getSecretKey();
  
  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7天过期
    .sign(secretKey);
  
  return token;
}

// 验证 JWT Token
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

// 从请求中获取当前用户
export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// 设置认证 Cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/',
  });
}

// 清除认证 Cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

// 生成会话ID
export function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// 生成用户ID
export function generateUserId(): string {
  return crypto.randomUUID();
}
