'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lock, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// 加载状态组件
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 w-full max-w-md">
        <CardContent className="py-12 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-purple-300 animate-spin mb-4" />
          <p className="text-purple-100">正在验证链接...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// 重置密码内容组件
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  // 验证令牌
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValid(false);
        setError('无效的重置链接');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (data.valid) {
          setIsValid(true);
          setEmail(data.email);
        } else {
          setIsValid(false);
          setError(data.error || '无效的重置链接');
        }
      } catch (err) {
        setIsValid(false);
        setError('验证失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // 提交新密码
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证密码
    if (password.length < 6) {
      setError('密码至少需要6位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // 刷新用户信息
        await refreshUser();
        // 3秒后跳转到首页
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setError(data.error || '密码重置失败');
      }
    } catch (err) {
      setError('密码重置失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 加载中
  if (isLoading) {
    return <LoadingState />;
  }

  // 成功页面
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 w-full max-w-md">
          <CardContent className="py-12 flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-purple-100 mb-2">密码重置成功</h2>
            <p className="text-purple-200/80 mb-4">您的密码已成功重置</p>
            <p className="text-purple-300/60 text-sm">即将自动跳转到首页...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 无效链接
  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 w-full max-w-md">
          <CardContent className="py-12 flex flex-col items-center text-center">
            <XCircle className="w-16 h-16 text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-purple-100 mb-2">链接无效</h2>
            <p className="text-purple-200/80 mb-6">{error || '该链接已过期或无效'}</p>
            <Link href="/forgot-password">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                重新申请重置链接
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 重置密码表单
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-100">重置密码</CardTitle>
          <CardDescription className="text-purple-200/60">
            为账户 {email} 设置新密码
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
                <Input
                  type="password"
                  placeholder="新密码（至少6位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/10 border-purple-300/30 text-purple-100 placeholder:text-purple-300/50"
                  required
                  minLength={6}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
                <Input
                  type="password"
                  placeholder="确认新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-white/10 border-purple-300/30 text-purple-100 placeholder:text-purple-300/50"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                '重置密码'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" className="text-purple-200 hover:text-purple-100 hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 主页面组件，用 Suspense 包裹
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
