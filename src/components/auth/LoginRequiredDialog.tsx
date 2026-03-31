'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn } from 'lucide-react';

interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
  redirectPath?: string;
}

/**
 * 暂未登录提示弹窗
 * 显示提示后自动跳转到登录页面
 */
export function LoginRequiredDialog({
  open,
  onOpenChange,
  message = '您暂未登录，即将跳转到登录页面',
  redirectPath = '/login',
}: LoginRequiredDialogProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!open) {
      setCountdown(3);
      setIsRedirecting(false);
      return;
    }

    // 倒计时
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRedirecting(true);
          // 跳转到登录页面
          router.push(redirectPath);
          onOpenChange(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, router, redirectPath, onOpenChange]);

  // 立即跳转
  const handleImmediateRedirect = () => {
    setIsRedirecting(true);
    router.push(redirectPath);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <DialogTitle className="text-xl">暂未登录</DialogTitle>
          <DialogDescription className="text-center">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            {isRedirecting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在跳转...
              </span>
            ) : (
              `${countdown} 秒后自动跳转`
            )}
          </p>
          <Button
            onClick={handleImmediateRedirect}
            disabled={isRedirecting}
            className="w-full"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                跳转中...
              </>
            ) : (
              '立即登录'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
