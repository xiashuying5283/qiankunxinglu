'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  // 提交请求
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('请输入邮箱地址');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // 开发环境下显示重置链接
        if (data.dev_reset_url) {
          setDevResetUrl(data.dev_reset_url);
        }
      } else {
        setError(data.error || '请求失败');
      }
    } catch (err) {
      setError('请求失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 成功页面
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 w-full max-w-md">
          <CardContent className="py-12 flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-purple-100 mb-2">请求已发送</h2>
            <p className="text-purple-200/80 mb-6">
              如果该邮箱已注册，您将收到重置密码的邮件
            </p>

            {/* 开发环境显示重置链接 */}
            {devResetUrl && (
              <div className="w-full mb-6 p-4 bg-amber-500/20 border border-amber-400/30 rounded-lg">
                <p className="text-amber-200 text-sm mb-2">开发模式：重置链接已生成</p>
                <a
                  href={devResetUrl}
                  className="text-amber-300 hover:text-amber-200 underline break-all text-sm"
                >
                  点击这里重置密码
                </a>
              </div>
            )}

            <div className="flex gap-4">
              <Link href="/">
                <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-500/20">
                  返回首页
                </Button>
              </Link>
              <Button
                onClick={() => router.push('/')}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                完成
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 请求表单
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-100">忘记密码</CardTitle>
          <CardDescription className="text-purple-200/60">
            输入您的邮箱地址，我们将发送重置密码的链接
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
              <Input
                type="email"
                placeholder="请输入注册邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/10 border-purple-300/30 text-purple-100 placeholder:text-purple-300/50"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  发送中...
                </>
              ) : (
                '发送重置链接'
              )}
            </Button>
          </form>

          <div className="mt-6 flex justify-between items-center">
            <Link href="/">
              <Button variant="ghost" className="text-purple-200 hover:text-purple-100 hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <Link href="/">
              <Button variant="link" className="text-purple-300 hover:text-purple-200">
                想起密码？去登录
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
