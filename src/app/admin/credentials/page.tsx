'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Key, 
  User, 
  Calendar,
  Mail,
  FileText
} from 'lucide-react';

interface Credential {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  access_key: string;
  name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reason: string | null;
  is_active: boolean;
  created_at: string;
  revoked_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export default function AdminCredentialsPage() {
  const [pendingCredentials, setPendingCredentials] = useState<Credential[]>([]);
  const [allCredentials, setAllCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);

  // 获取凭证列表
  const fetchCredentials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取待审批凭证
      const pendingRes = await fetch('/api/admin/credentials?status=pending');
      const pendingData = await pendingRes.json();
      
      if (!pendingRes.ok) {
        if (pendingRes.status === 401) {
          setError('请先登录');
        } else if (pendingRes.status === 403) {
          setError('无权限访问，请联系管理员配置 ADMIN_USER_IDS 环境变量');
        } else {
          setError(pendingData.error || '获取失败');
        }
        return;
      }
      
      setPendingCredentials(pendingData.credentials || []);
      
      // 获取所有凭证
      const allRes = await fetch('/api/admin/credentials');
      const allData = await allRes.json();
      if (allRes.ok) {
        setAllCredentials(allData.credentials || []);
      }
    } catch (error) {
      console.error('Fetch credentials error:', error);
      setError('获取凭证列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  // 审批凭证
  const handleReview = async (credentialId: string, approved: boolean, rejectReason?: string) => {
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential_id: credentialId,
          approved,
          reject_reason: rejectReason,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message);
        fetchCredentials();
      } else {
        toast.error(data.error || '审批失败');
      }
    } catch (error) {
      console.error('Review credential error:', error);
      toast.error('审批失败');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN', {
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
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />待审批</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />已批准</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />已拒绝</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 凭证卡片
  const CredentialCard = ({ credential, showActions = false }: { credential: Credential; showActions?: boolean }) => (
    <Card key={credential.id} className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Key className="w-4 h-4 text-muted-foreground" />
              <code className="text-sm bg-muted px-2 py-0.5 rounded">{credential.access_key}</code>
              <StatusBadge status={credential.status} />
            </div>
            
            {credential.name && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">名称:</span>
                <span>{credential.name}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">用户:</span>
              <span>{credential.user_name || credential.user_email || credential.user_id}</span>
              {credential.user_email && (
                <>
                  <Mail className="w-4 h-4 text-muted-foreground ml-2" />
                  <span className="text-muted-foreground">{credential.user_email}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">创建时间:</span>
              <span>{formatDate(credential.created_at)}</span>
            </div>
            
            {credential.reason && (
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <span className="text-muted-foreground">申请理由:</span>
                <p className="mt-1">{credential.reason}</p>
              </div>
            )}
            
            {credential.status === 'rejected' && credential.reason && (
              <div className="mt-2 p-2 bg-red-500/10 rounded text-sm">
                <span className="text-red-600 dark:text-red-400">拒绝原因:</span>
                <p className="mt-1 text-red-600 dark:text-red-400">{credential.reason}</p>
              </div>
            )}
            
            {credential.reviewed_at && (
              <div className="text-xs text-muted-foreground mt-2">
                审批时间: {formatDate(credential.reviewed_at)}
              </div>
            )}
          </div>
          
          {showActions && credential.status === 'pending' && (
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleReview(credential.id, true)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                批准
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setSelectedCredentialId(credential.id)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    拒绝
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>拒绝凭证申请</AlertDialogTitle>
                    <AlertDialogDescription>
                      请输入拒绝原因（可选），此原因将显示给用户。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    placeholder="拒绝原因..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setRejectReason('')}>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleReview(credential.id, false, rejectReason);
                        setRejectReason('');
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      确认拒绝
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[#d4af37]" />
            API 凭证审批管理
          </CardTitle>
        </CardHeader>
      </Card>
      
      {error && (
        <Card className="bg-red-500/10 border-red-500/30 mb-6">
          <CardContent className="py-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {!error && (
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="pending" className="data-[state=active]:bg-background">
              待审批 ({pendingCredentials.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-background">
              全部凭证 ({allCredentials.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : pendingCredentials.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center text-muted-foreground">
                  暂无待审批的凭证
                </CardContent>
              </Card>
            ) : (
              pendingCredentials.map((credential) => (
                <CredentialCard key={credential.id} credential={credential} showActions />
              ))
            )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : allCredentials.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center text-muted-foreground">
                暂无凭证记录
              </CardContent>
            </Card>
          ) : (
            allCredentials.map((credential) => (
              <CredentialCard key={credential.id} credential={credential} />
            ))
          )}
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
