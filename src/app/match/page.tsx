'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, Sparkles, History, Trash2, Calendar, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';

// 生成唯一会话ID
function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 从localStorage获取或创建sessionId
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('match_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('match_session_id', sessionId);
  }
  return sessionId;
}

interface BaziData {
  year: { gan: string; zhi: string };
  month: { gan: string; zhi: string };
  day: { gan: string; zhi: string };
  hour: { gan: string; zhi: string };
  shengxiao: string;
  wuxing: Record<string, number>;
  dominantWuXing: string;
  missingWuXing: string[];
}

interface ShengXiaoMatch {
  score: number;
  relation: string;
  description: string;
}

interface BaziMatch {
  score: number;
  dayPillarRelation: string;
  wuxingComplement: string;
  description: string;
}

interface MatchResult {
  name1: string;
  name2: string;
  bazi1: BaziData;
  bazi2: BaziData;
  score: number;
  level: string;
  shengxiaoMatch: ShengXiaoMatch;
  baziMatch: BaziMatch;
}

interface MatchRecord {
  id: number;
  name1: string;
  name2: string;
  score: number;
  level: string;
  created_at: string;
  bazi1: BaziData;
  bazi2: BaziData;
  shengxiao_match: ShengXiaoMatch;
  bazi_match: BaziMatch;
  ai_interpretation: string | null;
}

// 时辰选项
const hourOptions = [
  { value: 0, label: '子时 (23:00-01:00)' },
  { value: 1, label: '丑时 (01:00-03:00)' },
  { value: 2, label: '丑时 (01:00-03:00)' },
  { value: 3, label: '寅时 (03:00-05:00)' },
  { value: 4, label: '寅时 (03:00-05:00)' },
  { value: 5, label: '卯时 (05:00-07:00)' },
  { value: 6, label: '卯时 (05:00-07:00)' },
  { value: 7, label: '辰时 (07:00-09:00)' },
  { value: 8, label: '辰时 (07:00-09:00)' },
  { value: 9, label: '巳时 (09:00-11:00)' },
  { value: 10, label: '巳时 (09:00-11:00)' },
  { value: 11, label: '午时 (11:00-13:00)' },
  { value: 12, label: '午时 (11:00-13:00)' },
  { value: 13, label: '未时 (13:00-15:00)' },
  { value: 14, label: '未时 (13:00-15:00)' },
  { value: 15, label: '申时 (15:00-17:00)' },
  { value: 16, label: '申时 (15:00-17:00)' },
  { value: 17, label: '酉时 (17:00-19:00)' },
  { value: 18, label: '酉时 (17:00-19:00)' },
  { value: 19, label: '戌时 (19:00-21:00)' },
  { value: 20, label: '戌时 (19:00-21:00)' },
  { value: 21, label: '亥时 (21:00-23:00)' },
  { value: 22, label: '亥时 (21:00-23:00)' },
  { value: 23, label: '子时 (23:00-01:00)' },
];

export default function MatchPage() {
  const { isLoggedIn } = useAuth();
  
  // 表单状态
  const [name1, setName1] = useState('');
  const [birth1, setBirth1] = useState('');
  const [hour1, setHour1] = useState(12);
  const [name2, setName2] = useState('');
  const [birth2, setBirth2] = useState('');
  const [hour2, setHour2] = useState(12);

  // UI状态
  const [isMatching, setIsMatching] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<number | null>(null);

  // 登录弹窗状态
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingMatchData, setPendingMatchData] = useState<MatchResult | null>(null);

  // 历史记录
  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<MatchRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);

  const sessionId = useRef<string>('');
  const interpretationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  // 获取历史记录
  const fetchHistory = async () => {
    if (!sessionId.current) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/match/records?sessionId=${sessionId.current}`);
      const data = await res.json();
      if (data.success) {
        setHistoryRecords(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 切换历史记录显示
  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      fetchHistory();
    }
  };

  // 删除记录
  const deleteRecord = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      const res = await fetch(`/api/match/records?id=${id}&sessionId=${sessionId.current}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setHistoryRecords(historyRecords.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  // 开始匹配
  const startMatch = async () => {
    if (!name1.trim() || !birth1 || !name2.trim() || !birth2) {
      alert('请填写完整的双方信息');
      return;
    }

    setIsMatching(true);
    setResult(null);
    setAiInterpretation('');
    setSavedRecordId(null);

    try {
      // 调用匹配计算API
      const calcRes = await fetch('/api/match/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name1: name1.trim(),
          birth1,
          hour1,
          name2: name2.trim(),
          birth2,
          hour2
        })
      });

      const calcData = await calcRes.json();

      if (!calcData.success) {
        throw new Error(calcData.error || '计算失败');
      }

      setResult(calcData.data);

      // 检查登录状态
      if (!isLoggedIn) {
        // 未登录，保存结果并显示登录弹窗
        setPendingMatchData(calcData.data);
        setShowLoginDialog(true);
        setIsMatching(false);
      } else {
        // 已登录，开始AI解读
        setIsInterpreting(true);
        await streamInterpretation(calcData.data);
      }

    } catch (error) {
      console.error('Match error:', error);
      alert(error instanceof Error ? error.message : '匹配失败，请稍后重试');
      setIsMatching(false);
    }
  };

  // 登录成功后继续解读
  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    if (pendingMatchData) {
      setIsInterpreting(true);
      streamInterpretation(pendingMatchData);
      setPendingMatchData(null);
    }
  };

  // 流式AI解读
  const streamInterpretation = async (matchData: MatchResult) => {
    try {
      const res = await fetch('/api/match/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // 保存记录
              await saveRecord(matchData, fullText);
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullText += parsed.content;
                setAiInterpretation(fullText);
                // 滚动到底部
                setTimeout(() => {
                  interpretationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 50);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('Interpretation error:', error);
      setAiInterpretation('AI解读生成失败，请稍后重试');
    } finally {
      setIsInterpreting(false);
    }
  };

  // 保存记录
  const saveRecord = async (matchData: MatchResult, interpretation: string) => {
    try {
      const res = await fetch('/api/match/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId.current,
          ...matchData,
          aiInterpretation: interpretation,
          advice: ''
        })
      });
      const data = await res.json();
      if (data.success) {
        setSavedRecordId(data.data.id);
      }
    } catch (error) {
      console.error('Save record error:', error);
    }
  };

  // 重置表单
  const reset = () => {
    setName1('');
    setBirth1('');
    setHour1(12);
    setName2('');
    setBirth2('');
    setHour2(12);
    setResult(null);
    setAiInterpretation('');
    setSavedRecordId(null);
  };

  // 五行颜色
  const wuXingColors: Record<string, string> = {
    '金': 'from-yellow-500 to-yellow-600',
    '木': 'from-green-500 to-green-600',
    '水': 'from-blue-500 to-blue-600',
    '火': 'from-red-500 to-red-600',
    '土': 'from-amber-500 to-amber-600'
  };

  // 生肖关系颜色
  const getRelationColor = (relation: string): string => {
    if (relation === '六合') return 'text-green-400';
    if (relation === '三合') return 'text-emerald-400';
    if (relation === '相冲') return 'text-red-400';
    if (relation === '相害' || relation === '相刑') return 'text-orange-400';
    return 'text-rose-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-rose-200 hover:text-rose-100 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          
          {/* 用户菜单 */}
          <UserMenu />
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-rose-300 mr-3 fill-rose-400" />
            <h1 className="text-4xl font-bold text-rose-100">姻缘匹配</h1>
            <Heart className="w-10 h-10 text-rose-300 ml-3 fill-rose-400" />
          </div>
          <p className="text-rose-200/80">基于八字命理与生肖配对，测算你们的缘分指数</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* 历史记录切换 */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={toggleHistory}
              className="w-full text-rose-200 hover:text-rose-100 hover:bg-white/10 justify-between"
            >
              <span className="flex items-center">
                <History className="w-4 h-4 mr-2" />
                查看历史记录 ({historyRecords.length})
              </span>
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {showHistory && (
              <Card className="mt-2 bg-white/10 backdrop-blur-md border-rose-300/30">
                <CardContent className="p-4">
                  {isLoadingHistory ? (
                    <p className="text-center text-rose-200/60 py-4">加载中...</p>
                  ) : historyRecords.length === 0 ? (
                    <p className="text-center text-rose-200/60 py-4">暂无历史记录</p>
                  ) : (
                    <div className="space-y-3">
                      {historyRecords.map(record => (
                        <div
                          key={record.id}
                          className="bg-rose-950/30 rounded-lg p-4 border border-rose-400/20"
                        >
                          <div className="flex justify-between items-center">
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-rose-100 font-medium">{record.name1}</span>
                                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                                <span className="text-rose-100 font-medium">{record.name2}</span>
                              </div>
                              <div className="text-sm text-rose-200/60 mt-1">
                                {new Date(record.created_at).toLocaleString('zh-CN')}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-rose-100">{record.score}分</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRecord(record.id)}
                                className="text-rose-300 hover:text-red-400 hover:bg-white/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {expandedRecord === record.id && (
                            <div className="mt-4 pt-4 border-t border-rose-400/20">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-rose-200/60">生肖关系：</span>
                                  <span className={getRelationColor(record.shengxiao_match.relation)}>
                                    {record.shengxiao_match.relation}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-rose-200/60">匹配等级：</span>
                                  <span className="text-rose-100">{record.level}</span>
                                </div>
                              </div>
                              {record.ai_interpretation && (
                                <div className="mt-3 text-sm text-rose-100 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                  {record.ai_interpretation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 输入区域 */}
          {!result && !isMatching && (
            <Card className="bg-white/10 backdrop-blur-md border-rose-300/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-rose-100">输入双方信息</CardTitle>
                <CardDescription className="text-rose-200/60">
                  请输入公历（阳历）出生日期和时辰，系统将计算八字命盘
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 第一人 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-rose-200 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    第一位
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-rose-200 mb-2">姓名</label>
                      <Input
                        type="text"
                        value={name1}
                        onChange={(e) => setName1(e.target.value)}
                        placeholder="请输入姓名"
                        className="bg-white/10 border-rose-300/30 text-rose-100 placeholder:text-rose-200/40 text-center h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-rose-200 mb-2">出生日期</label>
                      <Input
                        type="date"
                        value={birth1}
                        onChange={(e) => setBirth1(e.target.value)}
                        className="bg-white/10 border-rose-300/30 text-rose-100 h-12"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-rose-200 mb-2">出生时辰</label>
                      <select
                        value={hour1}
                        onChange={(e) => setHour1(parseInt(e.target.value))}
                        className="w-full h-12 rounded-md bg-white/10 border border-rose-300/30 text-rose-100 px-3"
                      >
                        {hourOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-rose-900 text-rose-100">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-rose-400/30"></div>
                  <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
                  <div className="flex-1 h-px bg-rose-400/30"></div>
                </div>

                {/* 第二人 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-rose-200 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    第二位
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-rose-200 mb-2">姓名</label>
                      <Input
                        type="text"
                        value={name2}
                        onChange={(e) => setName2(e.target.value)}
                        placeholder="请输入姓名"
                        className="bg-white/10 border-rose-300/30 text-rose-100 placeholder:text-rose-200/40 text-center h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-rose-200 mb-2">出生日期</label>
                      <Input
                        type="date"
                        value={birth2}
                        onChange={(e) => setBirth2(e.target.value)}
                        className="bg-white/10 border-rose-300/30 text-rose-100 h-12"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-rose-200 mb-2">出生时辰</label>
                      <select
                        value={hour2}
                        onChange={(e) => setHour2(parseInt(e.target.value))}
                        className="w-full h-12 rounded-md bg-white/10 border border-rose-300/30 text-rose-100 px-3"
                      >
                        {hourOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-rose-900 text-rose-100">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button
                    onClick={startMatch}
                    disabled={!name1.trim() || !birth1 || !name2.trim() || !birth2}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-12 py-6 text-lg"
                  >
                    <Heart className="w-5 h-5 mr-2 fill-white" />
                    开始匹配
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 匹配中动画 */}
          {isMatching && (
            <Card className="bg-white/10 backdrop-blur-md border-rose-300/30">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <Heart className="w-20 h-20 text-rose-400 animate-pulse fill-rose-400" />
                  <Sparkles className="w-8 h-8 text-rose-300 absolute -top-2 -right-2 animate-spin" />
                </div>
                <p className="text-xl text-rose-200 mt-6">正在测算缘分...</p>
                <p className="text-sm text-rose-200/60 mt-2">计算八字命盘与生肖配对</p>
              </CardContent>
            </Card>
          )}

          {/* 结果显示 */}
          {result && !isMatching && (
            <div className="space-y-6">
              {/* 匹配分数 */}
              <Card className="bg-white/10 backdrop-blur-md border-rose-300/30 overflow-hidden">
                <CardContent className="relative py-12">
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <svg className="w-40 h-40" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeDasharray={`${result.score * 2.83} 283`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f472b6" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <div className="text-4xl font-bold text-rose-100">{result.score}</div>
                          <div className="text-sm text-rose-200">分</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-rose-100 mb-2">{result.level}</div>
                    <div className="text-rose-200/80">{result.name1} & {result.name2}</div>
                  </div>
                </CardContent>
              </Card>

              {/* 双方八字 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ name: result.name1, bazi: result.bazi1 }, { name: result.name2, bazi: result.bazi2 }].map((person, idx) => (
                  <Card key={idx} className="bg-white/10 backdrop-blur-md border-rose-300/30">
                    <CardHeader>
                      <CardTitle className="text-xl text-rose-100 flex items-center justify-between">
                        <span>{person.name}</span>
                        <span className="text-sm font-normal px-2 py-1 bg-rose-500/30 rounded">
                          属{person.bazi.shengxiao}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-2 text-center mb-4">
                        {[
                          { label: '年', pillar: person.bazi.year },
                          { label: '月', pillar: person.bazi.month },
                          { label: '日', pillar: person.bazi.day },
                          { label: '时', pillar: person.bazi.hour }
                        ].map((item, i) => (
                          <div key={i} className="bg-rose-950/40 rounded-lg p-2">
                            <div className="text-xs text-rose-200/60">{item.label}</div>
                            <div className="text-xl font-bold text-rose-100">{item.pillar.gan}{item.pillar.zhi}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {['金', '木', '水', '火', '土'].map(wx => (
                          <div key={wx} className="text-center">
                            <div className={`h-12 rounded bg-gradient-to-b ${wuXingColors[wx]} flex items-center justify-center`}>
                              <span className="text-lg font-bold text-white">{person.bazi.wuxing[wx]}</span>
                            </div>
                            <div className="text-xs text-rose-200 mt-1">{wx}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-sm text-rose-200/60">
                        主命{person.bazi.dominantWuXing}
                        {person.bazi.missingWuXing.length > 0 && `，缺${person.bazi.missingWuXing.join('、')}`}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 生肖配对 */}
              <Card className="bg-white/10 backdrop-blur-md border-rose-300/30">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-100">生肖配对</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{result.bazi1.shengxiao}</div>
                      <div className="text-sm text-rose-200">{result.name1}</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getRelationColor(result.shengxiaoMatch.relation)}`}>
                        {result.shengxiaoMatch.relation}
                      </div>
                      <Heart className="w-8 h-8 text-rose-400 fill-rose-400 my-2" />
                      <div className="text-xl font-bold text-rose-100">{result.shengxiaoMatch.score}分</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{result.bazi2.shengxiao}</div>
                      <div className="text-sm text-rose-200">{result.name2}</div>
                    </div>
                  </div>
                  <p className="text-rose-100 leading-relaxed">{result.shengxiaoMatch.description}</p>
                </CardContent>
              </Card>

              {/* 八字配对 */}
              <Card className="bg-white/10 backdrop-blur-md border-rose-300/30">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-100">八字配对</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-rose-950/40 rounded-lg p-3">
                      <div className="text-sm text-rose-200/60 mb-1">日柱关系</div>
                      <div className="text-rose-100">{result.baziMatch.dayPillarRelation}</div>
                    </div>
                    <div className="bg-rose-950/40 rounded-lg p-3">
                      <div className="text-sm text-rose-200/60 mb-1">八字评分</div>
                      <div className="text-xl font-bold text-rose-100">{result.baziMatch.score}分</div>
                    </div>
                  </div>
                  <p className="text-rose-100 leading-relaxed">{result.baziMatch.description}</p>
                </CardContent>
              </Card>

              {/* AI解读 - 固定高度 */}
              <Card className="bg-gradient-to-r from-rose-900/60 to-pink-900/60 border-rose-400/30">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-100 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    大师解读
                    {isInterpreting && <span className="ml-2 text-sm text-rose-300 animate-pulse">生成中...</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rose-600/50 scrollbar-track-transparent">
                    <div className="prose prose-invert prose-rose max-w-none">
                      <div
                        className="text-rose-100 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: aiInterpretation
                            .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-rose-200 mt-4 mb-2">$1</h2>')
                            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-rose-200">$1</strong>')
                        }}
                      />
                    </div>
                    <div ref={interpretationRef} />
                  </div>
                </CardContent>
              </Card>

              {/* 操作按钮 */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={reset}
                  variant="outline"
                  className="border-rose-300/30 text-rose-200 hover:bg-white/10"
                >
                  重新匹配
                </Button>
                {savedRecordId && (
                  <div className="text-sm text-rose-300 flex items-center">
                    <History className="w-4 h-4 mr-1" />
                    已保存到历史记录
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 登录弹窗 */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="登录查看姻缘解读"
        description="登录后可以获得AI大师解读，并保存您的匹配记录"
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
