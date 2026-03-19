'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const LAST_OAUTH_ACCOUNT_KEY = 'last_oauth_account';

/**
 * 处理 OAuth 登录成功后的状态刷新
 * 需要用 Suspense 包裹，因为使用了 useSearchParams
 */
export function OAuthHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser, user } = useAuth();

  useEffect(() => {
    const loginStatus = searchParams.get('login');
    const error = searchParams.get('error');

    if (loginStatus === 'success') {
      // 刷新用户状态
      refreshUser();
      // 清除 URL 参数
      router.replace('/');
    }

    if (error) {
      console.error('OAuth login error:', error);
    }
  }, [searchParams, refreshUser, router]);

  // 登录成功后存储 OAuth 账号信息
  useEffect(() => {
    if (user && !user.isGuest && (user.provider === 'google' || user.provider === 'github')) {
      const accountInfo = {
        provider: user.provider,
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
      };
      localStorage.setItem(LAST_OAUTH_ACCOUNT_KEY, JSON.stringify(accountInfo));
    }
  }, [user]);

  return null;
}
