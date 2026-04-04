'use client';

import { Suspense, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Mail, Lock, UserCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { SliderCaptcha } from '@/components/ui/slider-captcha';

// GitHub SVG 图标
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

interface OAuthStatus {
  github: boolean;
}

function LoginContent() {
  const router = useRouter();
  const { login, register, loginAsGuest } = useAuth();

  // 表单状态
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  // 验证码状态
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [pendingAction, setPendingAction] = useState<'login' | 'register' | 'guest' | 'oauth'>('login');

  // OAuth 状态
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>({ github: false });
  const [pendingOAuthProvider, setPendingOAuthProvider] = useState<'github' | null>(null);

  // 获取 OAuth 配置状态
  useState(() => {
    fetch('/api/auth/oauth/status')
      .then(res => res.json())
      .then(data => setOauthStatus({ github: data.github || false }))
      .catch(() => {});
  });

  // 处理验证码验证
  const handleCaptchaVerify = (success: boolean) => {
    if (success) {
      setCaptchaVerified(true);
    }
  };

  // 执行待处理的操作
  const executePendingAction = async () => {
    switch (pendingAction) {
      case 'login':
        await executeLogin();
        break;
      case 'register':
        await executeRegister();
        break;
      case 'guest':
        await executeGuestLogin();
        break;
      case 'oauth':
        if (pendingOAuthProvider) {
          window.location.href = `/api/auth/oauth/${pendingOAuthProvider}`;
        }
        break;
    }
    resetCaptchaState();
  };

  // 重置验证码状态
  const resetCaptchaState = () => {
    setShowCaptcha(false);
    setCaptchaVerified(false);
    setPendingAction('login');
    setPendingOAuthProvider(null);
  };

  // 执行登录
  const executeLogin = async () => {
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      // 登录成功，返回首页
      router.push('/');
    } else {
      setError(result.error || '登录失败');
    }
  };

  // 执行注册
  const executeRegister = async () => {
    setIsLoading(true);
    const result = await register(email, password, name);
    setIsLoading(false);

    if (result.success) {
      // 注册成功，返回首页
      router.push('/');
    } else {
      setError(result.error || '注册失败');
    }
  };

  // 执行游客登录
  const executeGuestLogin = async () => {
    setIsGuestLoading(true);
    const result = await loginAsGuest();
    setIsGuestLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || '游客登录失败');
    }
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingAction('login');
    setShowCaptcha(true);
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingAction('register');
    setShowCaptcha(true);
  };

  // 处理游客登录
  const handleGuestLogin = () => {
    setError('');
    setPendingAction('guest');
    setShowCaptcha(true);
  };

  // 处理 OAuth 登录
  const handleOAuthLogin = (provider: 'github') => {
    setPendingOAuthProvider(provider);
    setPendingAction('oauth');
    setShowCaptcha(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* 星空背景效果 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* 返回首页 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* 登录卡片 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">欢迎回来</h1>
            <p className="text-gray-400">登录后即可使用全部功能</p>
          </div>

          {/* 验证码区域 */}
          {showCaptcha && !captchaVerified && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-medium text-white">请完成安全验证</span>
              </div>
              <SliderCaptcha
                onVerify={handleCaptchaVerify}
                onRefresh={() => setCaptchaVerified(false)}
              />

              <Button
                variant="ghost"
                className="w-full mt-4 text-white"
                onClick={resetCaptchaState}
              >
                返回
              </Button>
            </div>
          )}

          {/* 验证成功确认区域 */}
          {showCaptcha && captchaVerified && (
            <div className="py-4">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <p className="text-center text-lg font-medium mb-2 text-white">验证通过</p>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-400 text-center">
                    {pendingAction === 'login' && '即将使用邮箱密码登录'}
                    {pendingAction === 'register' && '即将创建新账号'}
                    {pendingAction === 'guest' && '即将以游客身份登录'}
                    {pendingAction === 'oauth' && `即将跳转到 ${pendingOAuthProvider === 'github' ? 'GitHub' : ''} 进行授权`}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={resetCaptchaState}
                  >
                    取消
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={executePendingAction}
                    disabled={isLoading || isGuestLoading}
                  >
                    {(isLoading || isGuestLoading) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      '确认'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 主登录表单 */}
          {!showCaptcha && (
            <>
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'register'); setError(''); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">登录</TabsTrigger>
                  <TabsTrigger value="register">注册</TabsTrigger>
                </TabsList>

                {/* 登录表单 */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="邮箱"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="密码"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {/* 忘记密码链接 */}
                    <div className="flex justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        忘记密码？
                      </Link>
                    </div>

                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          登录中...
                        </>
                      ) : (
                        '登录'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* 注册表单 */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="昵称（可选）"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="邮箱"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="密码（至少6位）"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          注册中...
                        </>
                      ) : (
                        '注册'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* GitHub 登录按钮 */}
              {oauthStatus.github && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-900 px-2 text-muted-foreground">或者</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-white border-white/20 hover:bg-white/10"
                    onClick={() => handleOAuthLogin('github')}
                  >
                    <GitHubIcon className="w-5 h-5 mr-2" />
                    使用 GitHub 登录
                  </Button>
                </>
              )}

              {/* 游客登录 */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-muted-foreground">或者</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full text-white border-white/20 hover:bg-white/10"
                onClick={handleGuestLogin}
                disabled={isGuestLoading}
              >
                {isGuestLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    游客登录
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-2">
                游客无法创建 API 凭证
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-white">加载中...</div></div>}>
      <LoginContent />
    </Suspense>
  );
}
