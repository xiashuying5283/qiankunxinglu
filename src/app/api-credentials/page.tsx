'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Key, Plus, Trash2, Copy, Check, Eye, EyeOff, 
  Clock, AlertCircle, CheckCircle, Loader2, XCircle
} from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { useAuth } from '@/contexts/AuthContext';

interface Credential {
  id: string;
  access_key: string;
  name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  is_active: boolean;
  created_at: string;
  revoked_at: string | null;
  reviewed_at: string | null;
}

interface NewCredentialResult {
  accessKey: string;
  secretKey: string;
  message: string;
}

export default function ApiCredentialsPage() {
  const { isLoggedIn, isLoading: authLoading, user } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [newCredName, setNewCredName] = useState('');
  const [newCredReason, setNewCredReason] = useState('');
  const [newCredResult, setNewCredResult] = useState<NewCredentialResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // 加载凭证
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      setShowLoginDialog(true);
      setLoading(false);
      return;
    }
    
    if (isLoggedIn) {
      fetchCredentials();
    }
  }, [isLoggedIn, authLoading]);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/credentials');
      const data = await res.json();
      if (data.credentials) {
        setCredentials(data.credentials);
      } else if (data.error) {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCredential = async () => {
    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newCredName || undefined,
          reason: newCredReason || undefined,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setNewCredResult({
          accessKey: data.accessKey,
          secretKey: data.secretKey,
          message: data.message,
        });
        setNewCredName('');
        setNewCredReason('');
        fetchCredentials();
      } else {
        alert(data.error || '创建失败');
      }
    } catch (error) {
      console.error('Failed to create credential:', error);
      alert('创建失败');
    }
  };

  const revokeCredential = async (credentialId: string) => {
    if (!confirm('确定要撤销此凭证吗？撤销后无法恢复。')) {
      return;
    }
    
    try {
      const res = await fetch('/api/credentials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential_id: credentialId }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchCredentials();
      } else {
        alert(data.error || '撤销失败');
      }
    } catch (error) {
      console.error('Failed to revoke credential:', error);
      alert('撤销失败');
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 状态徽章
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />待审批</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />已批准</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />已拒绝</Badge>;
      default:
        return null;
    }
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
          description="登录后才能管理 API 凭证"
        />
      </div>
    );
  }

  // 游客
  if (user?.isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 max-w-md">
          <CardHeader>
            <CardTitle className="text-purple-100">游客无法使用此功能</CardTitle>
            <CardDescription className="text-purple-200">
              请注册账户后才能创建 API 凭证
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline" className="w-full">
                返回首页
              </Button>
            </Link>
          </CardContent>
        </Card>
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
            <h1 className="text-4xl font-bold text-purple-100">API 凭证管理</h1>
          </div>
          <p className="text-purple-200/80">创建凭证用于外部 API 调用（需管理员审批）</p>
        </div>

        {/* 新建凭证结果弹窗 */}
        {newCredResult && (
          <Card className="bg-green-900/40 border-green-400/30 mb-6 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-green-100 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                凭证创建成功
              </CardTitle>
              <CardDescription className="text-yellow-200 font-medium">
                {newCredResult.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-green-200 mb-1">AccessKey（公开标识）</label>
                <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg">
                  <code className="flex-1 text-green-100 font-mono text-sm break-all">
                    {newCredResult.accessKey}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(newCredResult.accessKey, 'access')}
                    className="text-green-200 hover:text-green-100"
                  >
                    {copied === 'access' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-green-200 mb-1">SecretKey（私密密钥，请妥善保管）</label>
                <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg">
                  <code className="flex-1 text-green-100 font-mono text-sm break-all">
                    {showSecret ? newCredResult.secretKey : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-green-200 hover:text-green-100"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(newCredResult.secretKey, 'secret')}
                    className="text-green-200 hover:text-green-100"
                  >
                    {copied === 'secret' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 mt-4">
                <p className="text-yellow-200 text-sm">
                  <strong>注意：</strong>凭证已提交审批申请，管理员审批通过后才能使用。请先保存 AccessKey 和 SecretKey。
                </p>
              </div>
              <Button
                className="mt-4"
                onClick={() => {
                  setNewCredResult(null);
                  setShowSecret(false);
                }}
              >
                我已保存，关闭
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 创建新凭证 */}
        <Card className="bg-white/10 backdrop-blur-md border-purple-300/30 mb-6 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-purple-100 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              创建新凭证
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm text-purple-200 mb-2">名称（可选）</label>
              <input
                type="text"
                value={newCredName}
                onChange={(e) => setNewCredName(e.target.value)}
                placeholder="例如：生产环境"
                className="w-full bg-white/10 border border-purple-300/30 rounded-lg px-4 py-2 text-purple-100 placeholder:text-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
            </div>
            <div>
              <label className="block text-sm text-purple-200 mb-2">申请理由（可选）</label>
              <Textarea
                value={newCredReason}
                onChange={(e) => setNewCredReason(e.target.value)}
                placeholder="请说明申请 API 凭证的用途..."
                className="bg-white/10 border-purple-300/30 text-purple-100 placeholder:text-purple-300/50 min-h-[80px]"
              />
              <p className="text-xs text-purple-300/60 mt-1">每个用户最多可创建 5 个凭证，创建后需管理员审批</p>
            </div>
            <Button
              onClick={createCredential}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建凭证
            </Button>
          </CardContent>
        </Card>

        {/* 凭证列表 */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-medium text-purple-100 mb-4">我的凭证</h2>
          
          {credentials.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-md border-purple-300/20">
              <CardContent className="py-8 text-center">
                <Key className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
                <p className="text-purple-200/60">暂无凭证，请创建一个</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {credentials.map((cred) => (
                <Card 
                  key={cred.id} 
                  className={`bg-white/10 backdrop-blur-md border-purple-300/30 ${
                    cred.status === 'rejected' || cred.revoked_at ? 'opacity-60' : ''
                  }`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <code className="text-purple-100 font-mono text-sm">{cred.access_key}</code>
                          <StatusBadge status={cred.status} />
                          {cred.revoked_at && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                              已撤销
                            </Badge>
                          )}
                        </div>
                        
                        {cred.name && (
                          <div className="text-sm text-purple-200/80 mb-1">
                            名称：{cred.name}
                          </div>
                        )}
                        
                        <div className="text-sm text-purple-300/70 space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            创建于 {formatDate(cred.created_at)}
                          </div>
                          {cred.reviewed_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              审批于 {formatDate(cred.reviewed_at)}
                            </div>
                          )}
                        </div>
                        
                        {cred.status === 'rejected' && cred.reason && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-400/30 rounded text-sm text-red-300">
                            拒绝原因：{cred.reason}
                          </div>
                        )}
                      </div>
                      
                      {!cred.revoked_at && cred.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => revokeCredential(cred.id)}
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
            <p><strong>审批流程：</strong>创建凭证后需等待管理员审批，审批通过后才能使用</p>
            <p><strong>签名算法：</strong>HMAC-SHA256</p>
            <p><strong>签名字符串格式：</strong><code className="bg-black/30 px-1 rounded">METHOD + "\n" + URL + "\n" + TIMESTAMP</code></p>
            <p><strong>有效期：</strong>签名时间戳前后 {900 / 60} 分钟内有效</p>
            <div className="bg-black/30 p-3 rounded-lg mt-4">
              <p className="text-purple-300 mb-2">调用示例（Python）：</p>
              <pre className="text-xs text-purple-100 overflow-x-auto whitespace-pre-wrap">{`import hmac
import hashlib
import time
import requests

access_key = "ak_xxx"
secret_key = "sk_xxx"
url = "/api/hexagrams"
timestamp = int(time.time())

# 生成签名
string_to_sign = f"GET\\n{url}\\n{timestamp}"
signature = hmac.new(
    secret_key.encode(), 
    string_to_sign.encode(), 
    hashlib.sha256
).hexdigest()

# 发送请求
response = requests.get(
    f"https://your-domain.com{url}",
    headers={
        "X-Access-Key": access_key,
        "X-Timestamp": str(timestamp),
        "X-Signature": signature,
    }
)`}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
