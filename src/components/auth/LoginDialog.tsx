'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Mail, Lock, ShieldCheck, ExternalLink } from 'lucide-react';
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

interface LastOAuthAccount {
  provider: 'github';
  name: string;
  email?: string;
  avatar?: string;
}

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onLoginSuccess?: () => void;
}

const LAST_OAUTH_ACCOUNT_KEY = 'last_oauth_account';

export function LoginDialog({
  open,
  onOpenChange,
  title = '登录后查看占卜结果',
  description = '登录后可以保存您的占卜记录，随时查看历史',
  onLoginSuccess,
}: LoginDialogProps) {
  const { login, register } = useAuth();

  // 表单状态
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 上次 OAuth 登录的账号信息
  const [lastOAuthAccount, setLastOAuthAccount] = useState<LastOAuthAccount | null>(null);

  // 验证码状态
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [pendingAction, setPendingAction] = useState<'login' | 'register' | 'oauth'>('login');

  // OAuth 状态
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>({ github: false });
  const [pendingOAuthProvider, setPendingOAuthProvider] = useState<'github' | null>(null);

  // 获取 OAuth 配置状态
  useEffect(() => {
    const fetchOAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/oauth/status');
        const data = await response.json();
        setOauthStatus({ github: data.github || false });
      } catch (error) {
        console.error('Failed to fetch OAuth status:', error);
      }
    };

    if (open) {
      fetchOAuthStatus();
      // 读取上次 OAuth 登录的账号信息
      try {
        const stored = localStorage.getItem(LAST_OAUTH_ACCOUNT_KEY);
        if (stored) {
          setLastOAuthAccount(JSON.parse(stored));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [open]);

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
      case 'oauth':
        if (pendingOAuthProvider) {
          triggerOAuthLogin(pendingOAuthProvider);
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
      onOpenChange(false);
      resetForm();
      onLoginSuccess?.();
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
      onOpenChange(false);
      resetForm();
      onLoginSuccess?.();
    } else {
      setError(result.error || '注册失败');
    }
  };

  // 触发 OAuth 登录
  const triggerOAuthLogin = (provider: 'github') => {
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  // 处理登录（显示验证码）
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingAction('login');
    setShowCaptcha(true);
  };

  // 处理注册（显示验证码）
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPendingAction('register');
    setShowCaptcha(true);
  };

  // 处理 OAuth 登录（显示验证码）
  const handleOAuthLogin = (provider: 'github') => {
    setPendingOAuthProvider(provider);
    setPendingAction('oauth');
    setShowCaptcha(true);
  };

  // 重置表单
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    resetCaptchaState();
  };

  // 获取 OAuth 提供商的中文名称
  const getOAuthProviderName = (provider: 'github') => {
    return 'GitHub';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* 验证码区域 */}
        {showCaptcha && !captchaVerified && (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="font-medium">请完成安全验证</span>
            </div>
            <SliderCaptcha 
              onVerify={handleCaptchaVerify}
              onRefresh={() => setCaptchaVerified(false)}
            />
            
            <Button 
              variant="ghost" 
              className="w-full mt-4"
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
            
            <p className="text-center text-lg font-medium mb-2">验证通过</p>
            
            {/* OAuth 登录确认 */}
            {pendingAction === 'oauth' && pendingOAuthProvider && (
              <div className="space-y-4">
                {/* 显示上次登录的账号 */}
                {lastOAuthAccount && lastOAuthAccount.provider === pendingOAuthProvider ? (
                  <div className="p-4 rounded-lg bg-muted/50 border mb-4">
                    <p className="text-xs text-muted-foreground mb-2">上次登录的账号</p>
                    <div className="flex items-center gap-3">
                      {lastOAuthAccount.avatar ? (
                        <img 
                          src={lastOAuthAccount.avatar} 
                          alt="" 
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <GitHubIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{lastOAuthAccount.name}</p>
                        {lastOAuthAccount.email && (
                          <p className="text-sm text-muted-foreground truncate">{lastOAuthAccount.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    即将跳转到 {getOAuthProviderName(pendingOAuthProvider)} 进行授权
                  </p>
                )}
                
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
                    onClick={() => triggerOAuthLogin(pendingOAuthProvider)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    确认
                  </Button>
                </div>
              </div>
            )}
            
            {/* 邮箱登录/注册确认 */}
            {pendingAction !== 'oauth' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground text-center">
                    {pendingAction === 'login' && '即将使用邮箱密码登录'}
                    {pendingAction === 'register' && '即将创建新账号'}
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
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
            )}
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
                    <a
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      忘记密码？
                    </a>
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
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">或者</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthLogin('github')}
                >
                  <GitHubIcon className="w-5 h-5 mr-2" />
                  使用 GitHub 登录
                </Button>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
