'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, History, Moon, Heart, Clock, Trash2, ChevronRight, Loader2, BookOpen, Star, Scroll, PenTool, Sparkles } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { LoginRequiredDialog } from '@/components/auth/LoginRequiredDialog';

interface DivinationRecord {
  id: number;
  type: 'iching' | 'tarot' | 'fortune_stick' | 'char' | 'plum_blossom';
  category: 'divination';
  title: string;
  question: string | null;
  result: { [key: string]: unknown };
  aiInterpretation: string | null;
  createdAt: string;
}

interface DreamRecord {
  id: number;
  type: 'dream';
  category: 'dream';
  title: string;
  content: string;
  interpretation: string;
  createdAt: string;
}

interface MatchRecord {
  id: number;
  type: 'match';
  category: 'match';
  title: string;
  score: number;
  level: string;
  shengxiaoMatch: {
    score: number;
    relation: string;
    description: string;
  };
  baziMatch: {
    score: number;
  };
  aiInterpretation: string | null;
  createdAt: string;
}

type Record = DivinationRecord | DreamRecord | MatchRecord;

export default function HistoryPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadRecords();
  }, []);

  const checkAuthAndLoadRecords = async () => {
    try {
      // 检查登录状态
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      
      if (!meData.user) {
        setIsLoggedIn(false);
        setIsLoading(false);
        setShowLoginDialog(true);
        return;
      }

      setIsLoggedIn(true);

      // 加载历史记录
      const res = await fetch('/api/history');
      const data = await res.json();
      
      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = async (id: number, type: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      let endpoint = '/api/divination/records';
      if (type === 'dream') endpoint = '/api/dream/records';
      else if (type === 'match') endpoint = '/api/match/records';
      
      const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setRecords(records.filter(r => !(r.id === id && r.type === type)));
      }
    } catch (error) {
      console.error('删除记录失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'iching':
        return { icon: <BookOpen className="w-5 h-5" />, label: '周易占卜', color: 'text-amber-400', bgColor: 'bg-amber-500/20' };
      case 'tarot':
        return { icon: <Star className="w-5 h-5" />, label: '塔罗占卜', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
      case 'fortune_stick':
        return { icon: <Scroll className="w-5 h-5" />, label: '观音灵签', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
      case 'char':
        return { icon: <PenTool className="w-5 h-5" />, label: '测字算卦', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' };
      case 'plum_blossom':
        return { icon: <Sparkles className="w-5 h-5" />, label: '梅花易数', color: 'text-pink-400', bgColor: 'bg-pink-500/20' };
      case 'dream':
        return { icon: <Moon className="w-5 h-5" />, label: '周公解梦', color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' };
      case 'match':
        return { icon: <Heart className="w-5 h-5" />, label: '姻缘匹配', color: 'text-rose-400', bgColor: 'bg-rose-500/20' };
      default:
        return { icon: <History className="w-5 h-5" />, label: '占卜记录', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
    }
  };

  const renderExpandedContent = (record: Record) => {
    if (record.type === 'dream') {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-purple-200 mb-2">梦境内容</h4>
            <p className="text-purple-100/90 leading-relaxed">{record.content}</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-purple-200 mb-2">解读结果</h4>
            <div className="bg-purple-950/40 rounded-lg p-4 text-purple-100/90 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
              {record.interpretation}
            </div>
          </div>
        </div>
      );
    }

    if (record.type === 'match') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-rose-950/30 rounded-lg p-3">
              <div className="text-sm text-rose-200/60 mb-1">生肖配对</div>
              <div className="text-rose-100">{record.shengxiaoMatch.relation} - {record.shengxiaoMatch.score}分</div>
            </div>
            <div className="bg-rose-950/30 rounded-lg p-3">
              <div className="text-sm text-rose-200/60 mb-1">八字配对</div>
              <div className="text-rose-100">{record.baziMatch.score}分</div>
            </div>
          </div>
          {record.aiInterpretation && (
            <div>
              <h4 className="text-sm font-bold text-rose-200 mb-2">AI解读</h4>
              <div className="bg-rose-950/40 rounded-lg p-4 text-rose-100/90 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {record.aiInterpretation}
              </div>
            </div>
          )}
        </div>
      );
    }

    // 占卜记录
    return (
      <div className="space-y-4">
        {record.question && (
          <div>
            <h4 className="text-sm font-bold text-purple-200 mb-2">问题</h4>
            <p className="text-purple-100/90">{record.question}</p>
          </div>
        )}
        {record.aiInterpretation && (
          <div>
            <h4 className="text-sm font-bold text-purple-200 mb-2">AI解读</h4>
            <div className="bg-purple-950/40 rounded-lg p-4 text-purple-100/90 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
              {record.aiInterpretation}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 星空背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="stars absolute w-full h-full bg-[radial-gradient(2px_2px_at_20px_30px,white,transparent),radial-gradient(2px_2px_at_40px_70px,rgba(255,255,255,0.8),transparent),radial-gradient(1px_1px_at_90px_40px,white,transparent),radial-gradient(2px_2px_at_160px_120px,rgba(255,255,255,0.9),transparent)] bg-[length:350px_200px] animate-twinkle opacity-30"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          
          <UserMenu />
        </div>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <History className="w-10 h-10 text-purple-300 mr-3" />
            <h1 className="text-4xl font-bold text-white">历史记录</h1>
            <History className="w-10 h-10 text-purple-300 ml-3" />
          </div>
          <p className="text-purple-200/80">查看您的所有占卜记录</p>
        </div>

        {/* 内容区域 */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-purple-300 animate-spin mb-4" />
                <p className="text-purple-200">加载中...</p>
              </CardContent>
            </Card>
          ) : !isLoggedIn ? (
            <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <History className="w-16 h-16 text-purple-300/50 mb-4" />
                <p className="text-purple-200 mb-4">请登录后查看历史记录</p>
                <Button
                  onClick={() => setShowLoginDialog(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  立即登录
                </Button>
              </CardContent>
            </Card>
          ) : records.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-purple-300/30">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <History className="w-16 h-16 text-purple-300/50 mb-4" />
                <p className="text-purple-200 mb-4">暂无历史记录</p>
                <p className="text-purple-200/60 text-sm">开始您的占卜之旅，记录将保存在这里</p>
                <Link href="/">
                  <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    开始占卜
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record) => {
                const typeInfo = getTypeInfo(record.type);
                const recordKey = `${record.type}-${record.id}`;
                const isExpanded = expandedRecord === recordKey;
                
                return (
                  <Card 
                    key={recordKey} 
                    className="bg-white/10 backdrop-blur-md border-purple-300/30 overflow-hidden"
                  >
                    <CardHeader className="cursor-pointer" onClick={() => setExpandedRecord(isExpanded ? null : recordKey)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                            <span className={typeInfo.color}>{typeInfo.icon}</span>
                          </div>
                          <div>
                            <h3 className="text-lg text-white font-medium">{record.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${typeInfo.bgColor} ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                              {record.type === 'match' && (
                                <span className="text-rose-300 font-bold">{record.score}分</span>
                              )}
                              <span className="text-purple-300/60 text-xs flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(record.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRecord(record.id, record.type);
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <ChevronRight className={`w-5 h-5 text-purple-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </CardHeader>
                    
                    {isExpanded && (
                      <CardContent className="border-t border-purple-300/20 pt-4">
                        {renderExpandedContent(record)}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 暂未登录提示弹窗 */}
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        message="您暂未登录，即将跳转到登录页面"
        redirectPath="/login"
      />

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
