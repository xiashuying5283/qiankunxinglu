'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Key, Plus, Trash2, Copy, Check, Eye, EyeOff, 
  Clock, BarChart3, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { useAuth } from '@/contexts/AuthContext';

interface ApiKey {
  id: string;
  prefix: string;
  name: string | null;
  is_active: boolean;
  rate_limit_per_day: number;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
  revoked_reason: string | null;
}

interface NewKeyResult {
  key: string;
  message: string;
}

export default function ApiKeysPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(100);
  const [newKeyResult, setNewKeyResult] = useState<NewKeyResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // 加载 API Keys
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      setShowLoginDialog(true);
      setLoading(false);
      return;
    }
    
    if (isLoggedIn) {
      fetchKeys();
    }
  }, [isLoggedIn, authLoading]);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/api-keys');
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName || undefined,
          rate_limit_per_day: newKeyRateLimit
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setNewKeyResult({ key: data.key, message: data.message });
        setNewKeyName('');
        setNewKeyRateLimit(100);
        fetchKeys();
      } else {
        alert(data.error || '创建失败');
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      alert('创建失败');
    }
  };

  const revokeKey = async (keyId: string) => {
    if (!confirm('确定要撤销此 API Key 吗？撤销后无法恢复。')) {
      return;
    }
    
    try {
      const res = await fetch('/api/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_id: keyId })
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchKeys();
      } else {
        alert(data.error || '撤销失败');
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      alert('撤销失败');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '从未';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 加载中
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
          <CardContent className="py-12 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-purple-300 animate-spin mb-4" />
            <p className="text-purple-100">加载中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 未登录
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoginDialog
          open={showLoginDialog}
          onOpenChange={setShowLoginDialog}
          title="请先登录"
          description="登录后才能管理 API Key"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-purple-200 hover:text-purple-100 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Key className="w-10 h-10 text-purple-300 mr-3" />
            <h1 className="text-4xl font-bold text-purple-100">API Key 管理</h1>
          </div>
          <p className="text-purple-200/80">管理您的 API 密钥，用于调用占卜 API</p>
        </div>

        {/* 新建 Key 结果弹窗 */}
        {newKeyResult && (
          <Card className="bg-green-900/40 border-green-400/30 mb-6 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-green-100 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                API Key 创建成功
              </CardTitle>
              <CardDescription className="text-green-200">
                {newKeyResult.message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg">
                <code className="flex-1 text-green-100 font-mono text-sm break-all">
                  {showKey ? newKeyResult.key : '••••••••••••••••••••••••••••••••'}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowKey(!showKey)}
                  className="text-green-200 hover:text-green-100"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(newKeyResult.key)}
                  className="text-green-200 hover:text-green-100"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                className="mt-4"
                onClick={() => setNewKeyResult(null)}
              >
                我已保存，关闭
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 创建新 Key */}
        <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 mb-6 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-purple-100 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              创建新的 API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-purple-200 mb-2">名称（可选）</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="例如：生产环境"
                className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-purple-100 placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
            </div>
            <div>
              <label className="block text-sm text-purple-200 mb-2">每日调用限制</label>
              <input
                type="number"
                value={newKeyRateLimit}
                onChange={(e) => setNewKeyRateLimit(parseInt(e.target.value) || 100)}
                min="1"
                max="10000"
                className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
              <p className="text-xs text-purple-300/60 mt-1">每个用户最多可创建 5 个 Key</p>
            </div>
            <Button
              onClick={createKey}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建 API Key
            </Button>
          </CardContent>
        </Card>

        {/* API Key 列表 */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-medium text-purple-100 mb-4">我的 API Keys</h2>
          
          {keys.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-md border-purple-300/20">
              <CardContent className="py-8 text-center">
                <Key className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
                <p className="text-purple-200/60">暂无 API Key，请创建一个</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <Card 
                  key={key.id} 
                  className={`bg-white/10 backdrop-blur-md border-purple-300/30 ${
                    !key.is_active || key.revoked_at ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-purple-100 font-mono">{key.prefix}</code>
                          {key.name && (
                            <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded">
                              {key.name}
                            </span>
                          )}
                          {!key.is_active || key.revoked_at ? (
                            <span className="text-xs bg-red-500/30 text-red-200 px-2 py-0.5 rounded">
                              已撤销
                            </span>
                          ) : (
                            <span className="text-xs bg-green-500/30 text-green-200 px-2 py-0.5 rounded">
                              活跃
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-purple-300/70 space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              {key.rate_limit_per_day} 次/天
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              创建于 {formatDate(key.created_at)}
                            </span>
                          </div>
                          {key.last_used_at && (
                            <div>最后使用: {formatDate(key.last_used_at)}</div>
                          )}
                          {key.expires_at && (
                            <div>过期时间: {formatDate(key.expires_at)}</div>
                          )}
                          {key.revoked_reason && (
                            <div className="text-red-300">撤销原因: {key.revoked_reason}</div>
                          )}
                        </div>
                      </div>
                      {!key.revoked_at && key.is_active && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => revokeKey(key.id)}
                          className="text-red-300 hover:text-red-100 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <Card className="bg-white/5 backdrop-blur-md border-purple-300/20 mt-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-purple-100 text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              使用说明
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-purple-200/80 space-y-3">
            <p><strong>API Key 格式：</strong><code className="bg-black/30 px-1 rounded">sk_div_xxx...</code></p>
            <p><strong>调用方式：</strong>在请求头添加 <code className="bg-black/30 px-1 rounded">Authorization: Bearer YOUR_API_KEY</code></p>
            <p><strong>速率限制：</strong>每个 Key 每天有固定的调用次数限制，超限后需等待第二天重置</p>
            <p><strong>安全提示：</strong>请妥善保管 API Key，不要在客户端代码中暴露</p>
            <div className="bg-black/30 p-3 rounded-lg mt-4">
              <p className="text-purple-300 mb-2">示例请求：</p>
              <code className="text-xs text-purple-100">
                curl -X GET "https://your-domain.com/api/hexagrams" \<br/>
                &nbsp;&nbsp;-H "Authorization: Bearer sk_div_xxx..."
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
