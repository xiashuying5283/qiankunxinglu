'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// 用户信息类型
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  isGuest: boolean;
  provider?: string; // oauth 提供商: google, github
}

// 认证上下文类型
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 开发环境模拟用户
const DEV_USER: User = {
  id: 'dev-user-001',
  email: 'dev@test.com',
  name: '开发者',
  avatar: undefined,
  isGuest: false,
  provider: 'dev',
};

// 是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 获取当前用户
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
    }
  }, []);

  // 初始化时获取用户信息
  useEffect(() => {
    // 开发环境自动登录
    if (isDev) {
      console.log('[DEV] 开发环境自动登录');
      setUser(DEV_USER);
      setIsLoading(false);
      return;
    }
    
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  // 注册
  const register = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      
      return { success: false, error: data.error || '注册失败' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: '注册失败，请稍后重试' };
    }
  }, []);

  // 登录
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      
      return { success: false, error: data.error || '登录失败' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '登录失败，请稍后重试' };
    }
  }, []);

  // 游客登录
  const loginAsGuest = useCallback(async () => {
    try {
      const sessionId = typeof window !== 'undefined' 
        ? localStorage.getItem('guest_session_id') || undefined
        : undefined;
      
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        // 保存 sessionId 到 localStorage
        if (typeof window !== 'undefined' && data.user.sessionId) {
          localStorage.setItem('guest_session_id', data.user.sessionId);
        }
        return { success: true };
      }
      
      return { success: false, error: data.error || '游客登录失败' };
    } catch (error) {
      console.error('Guest login error:', error);
      return { success: false, error: '游客登录失败，请稍后重试' };
    }
  }, []);

  // 登出
  const logout = useCallback(async () => {
    // 开发环境不允许登出
    if (isDev) {
      console.log('[DEV] 开发环境不允许登出');
      return;
    }
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
    login,
    register,
    loginAsGuest,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
