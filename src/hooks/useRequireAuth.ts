'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 用于检查登录状态并显示登录弹窗的 hook
 */
export function useRequireAuth() {
  const { isLoggedIn } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  /**
   * 检查登录状态，如果未登录则显示登录弹窗
   * @param action 登录后要执行的操作
   * @returns 是否已登录
   */
  const requireAuth = useCallback((action?: () => void) => {
    if (isLoggedIn) {
      action?.();
      return true;
    }
    
    setPendingAction(() => action || null);
    setShowLoginDialog(true);
    return false;
  }, [isLoggedIn]);

  /**
   * 登录成功后的回调
   */
  const onLoginSuccess = useCallback(() => {
    setShowLoginDialog(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  return {
    isLoggedIn,
    showLoginDialog,
    setShowLoginDialog,
    requireAuth,
    onLoginSuccess,
  };
}
