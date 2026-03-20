'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, Sparkles, History, Trash2, User, ChevronDown, ChevronUp, Moon, Sun } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { SiteHeader } from '@/components/SiteHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Disclaimer } from '@/components/Disclaimer';
import { 
  solarToLunar, 
  lunarToSolar, 
  getLunarMonthName, 
  getLunarDayName,
  type CalendarType
} from '@/lib/bazi-calculator';

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

// 出生日期状态
interface BirthDateState {
  year: number;
  month: number;
  day: number;
  hour: number;
  isLunar: boolean;
  lunarDisplay: string;
}

export default function MatchPage() {
  const { isLoggedIn } = useAuth();
  
  // 表单状态 - 支持公农历
  const [name1, setName1] = useState('');
  const [birth1, setBirth1] = useState<BirthDateState>({
    year: 0, month: 0, day: 0, hour: 12, isLunar: false, lunarDisplay: ''
  });
  const [name2, setName2] = useState('');
  const [birth2, setBirth2] = useState<BirthDateState>({
    year: 0, month: 0, day: 0, hour: 12, isLunar: false, lunarDisplay: ''
  });

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

  // 更新农历显示
  const updateLunarDisplay = (birth: BirthDateState, setBirth: (b: BirthDateState) => void) => {
    if (!birth.year || !birth.month || !birth.day) {
      setBirth({ ...birth, lunarDisplay: '' });
      return;
    }

    if (birth.isLunar) {
      const solar = lunarToSolar(birth.year, birth.month, birth.day);
      if (solar) {
        setBirth({ 
          ...birth, 
          lunarDisplay: `公历 ${solar.year}年${solar.month}月${solar.day}日` 
        });
      }
    } else {
      const lunar = solarToLunar(birth.year, birth.month, birth.day);
      if (lunar) {
        setBirth({ 
          ...birth, 
          lunarDisplay: `农历 ${getLunarMonthName(lunar.month)}${getLunarDayName(lunar.day)}` 
        });
      }
    }
  };

  // 切换公农历
  const toggleCalendarType = (birth: BirthDateState, setBirth: (b: BirthDateState) => void) => {
    const newIsLunar = !birth.isLunar;
    
    if (birth.year && birth.month && birth.day) {
      if (newIsLunar) {
        // 公历转农历
        const lunar = solarToLunar(birth.year, birth.month, birth.day);
        if (lunar) {
          const newBirth: BirthDateState = {
            ...birth,
            isLunar: newIsLunar,
            year: lunar.year,
            month: lunar.month,
            day: lunar.day,
            lunarDisplay: `公历 ${birth.year}年${birth.month}月${birth.day}日`
          };
          setBirth(newBirth);
        } else {
          setBirth({ ...birth, isLunar: newIsLunar, lunarDisplay: '' });
        }
      } else {
        // 农历转公历
        const solar = lunarToSolar(birth.year, birth.month, birth.day);
        if (solar) {
          const newBirth: BirthDateState = {
            ...birth,
            isLunar: newIsLunar,
            year: solar.year,
            month: solar.month,
            day: solar.day,
            lunarDisplay: `农历 ${getLunarMonthName(birth.month)}${getLunarDayName(birth.day)}`
          };
          setBirth(newBirth);
        } else {
          setBirth({ ...birth, isLunar: newIsLunar, lunarDisplay: '' });
        }
      }
    } else {
      setBirth({ ...birth, isLunar: newIsLunar });
    }
  };

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
    if (!name1.trim() || !birth1.year || !birth1.month || !birth1.day ||
        !name2.trim() || !birth2.year || !birth2.month || !birth2.day) {
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
          birth1: `${birth1.year}-${birth1.month}-${birth1.day}`,
          hour1: birth1.hour,
          isLunar1: birth1.isLunar,
          name2: name2.trim(),
          birth2: `${birth2.year}-${birth2.month}-${birth2.day}`,
          hour2: birth2.hour,
          isLunar2: birth2.isLunar
        })
      });

      const calcData = await calcRes.json();

      if (!calcData.success) {
        throw new Error(calcData.error || '计算失败');
      }

      setResult(calcData.data);

      // 检查登录状态
      if (!isLoggedIn) {
        setPendingMatchData(calcData.data);
        setShowLoginDialog(true);
        setIsMatching(false);
      } else {
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
              await saveRecord(matchData, fullText);
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullText += parsed.content;
                setAiInterpretation(fullText);
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
    setBirth1({ year: 0, month: 0, day: 0, hour: 12, isLunar: false, lunarDisplay: '' });
    setName2('');
    setBirth2({ year: 0, month: 0, day: 0, hour: 12, isLunar: false, lunarDisplay: '' });
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

  // 日期输入组件
  const DateInput = ({ 
    birth, 
    setBirth, 
    label 
  }: { 
    birth: BirthDateState; 
    setBirth: (b: BirthDateState) => void;
    label: string;
  }) => (
    <div className="space-y-3">
      {/* 日历类型切换 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {birth.isLunar ? (
            <Moon className="w-4 h-4 text-amber-500" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span className="text-sm text-gray-400">
            {birth.isLunar ? '农历' : '公历'}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => toggleCalendarType(birth, setBirth)}
          className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 h-7 px-2 text-xs"
        >
          切换为{birth.isLunar ? '公历' : '农历'}
        </Button>
      </div>

      {/* 日期输入 */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Input
            type="number"
            value={birth.year || ''}
            onChange={(e) => {
              const year = parseInt(e.target.value) || 0;
              const newBirth = { ...birth, year };
              setBirth(newBirth);
              updateLunarDisplay(newBirth, setBirth);
            }}
            placeholder="年"
            className="bg-[#0a0a0a] border-amber-500/20 text-amber-100 placeholder:text-gray-500 text-center h-10"
          />
        </div>
        <div>
          <Input
            type="number"
            value={birth.month || ''}
            onChange={(e) => {
              const month = parseInt(e.target.value) || 0;
              const newBirth = { ...birth, month };
              setBirth(newBirth);
              updateLunarDisplay(newBirth, setBirth);
            }}
            placeholder="月"
            min="1"
            max="12"
            className="bg-[#0a0a0a] border-amber-500/20 text-amber-100 placeholder:text-gray-500 text-center h-10"
          />
        </div>
        <div>
          <Input
            type="number"
            value={birth.day || ''}
            onChange={(e) => {
              const day = parseInt(e.target.value) || 0;
              const newBirth = { ...birth, day };
              setBirth(newBirth);
              updateLunarDisplay(newBirth, setBirth);
            }}
            placeholder="日"
            min="1"
            max={birth.isLunar ? 30 : 31}
            className="bg-[#0a0a0a] border-amber-500/20 text-amber-100 placeholder:text-gray-500 text-center h-10"
          />
        </div>
      </div>

      {/* 时辰选择 */}
      <select
        value={birth.hour}
        onChange={(e) => setBirth({ ...birth, hour: parseInt(e.target.value) })}
        className="w-full h-10 rounded-md bg-[#0a0a0a] border border-amber-500/20 text-amber-100 px-3"
      >
        {hourOptions.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#1a1a1a] text-amber-100">
            {opt.label}
          </option>
        ))}
      </select>

      {/* 农历/公历对应显示 */}
      {birth.lunarDisplay && (
        <div className="text-xs text-amber-400 bg-amber-900/20 rounded px-3 py-2">
          对应{birth.isLunar ? '公历' : '农历'}：{birth.lunarDisplay}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-amber-500 mr-3 fill-amber-500" />
            <h1 className="text-4xl font-bold text-amber-100">姻缘匹配</h1>
            <Heart className="w-10 h-10 text-amber-500 ml-3 fill-amber-500" />
          </div>
          <p className="text-gray-400">基于 lunar-javascript 精确算法，支持公农历输入</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* 历史记录切换 */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={toggleHistory}
              className="w-full text-gray-400 hover:text-amber-100 hover:bg-amber-500/10 justify-between"
            >
              <span className="flex items-center">
                <History className="w-4 h-4 mr-2" />
                查看历史记录 ({historyRecords.length})
              </span>
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {showHistory && (
              <Card className="mt-2 bg-[#1a1a1a]/50 border-amber-500/20">
                <CardContent className="p-4">
                  {isLoadingHistory ? (
                    <p className="text-center text-gray-500 py-4">加载中...</p>
                  ) : historyRecords.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">暂无历史记录</p>
                  ) : (
                    <div className="space-y-3">
                      {historyRecords.map(record => (
                        <div
                          key={record.id}
                          className="bg-[#0a0a0a] rounded-lg p-4 border border-amber-500/10"
                        >
                          <div className="flex justify-between items-center">
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-amber-100 font-medium">{record.name1}</span>
                                <Heart className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="text-amber-100 font-medium">{record.name2}</span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {new Date(record.created_at).toLocaleString('zh-CN')}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-amber-100">{record.score}分</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRecord(record.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {expandedRecord === record.id && (
                            <div className="mt-4 pt-4 border-t border-amber-500/10">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">生肖关系：</span>
                                  <span className={getRelationColor(record.shengxiao_match.relation)}>
                                    {record.shengxiao_match.relation}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">匹配等级：</span>
                                  <span className="text-amber-100">{record.level}</span>
                                </div>
                              </div>
                              {record.ai_interpretation && (
                                <div className="mt-3 text-sm text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
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
            <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-amber-100">输入双方信息</CardTitle>
                <CardDescription className="text-gray-500">
                  支持公历（阳历）和农历（阴历）输入，系统将精确计算八字命盘
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* 第一人 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-300 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    第一位
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">姓名</label>
                      <Input
                        type="text"
                        value={name1}
                        onChange={(e) => setName1(e.target.value)}
                        placeholder="请输入姓名"
                        className="bg-[#0a0a0a] border-amber-500/20 text-amber-100 placeholder:text-gray-500 text-center h-12"
                      />
                    </div>
                    <DateInput birth={birth1} setBirth={setBirth1} label="出生日期" />
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-amber-500/20"></div>
                  <Heart className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <div className="flex-1 h-px bg-amber-500/20"></div>
                </div>

                {/* 第二人 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-300 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    第二位
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">姓名</label>
                      <Input
                        type="text"
                        value={name2}
                        onChange={(e) => setName2(e.target.value)}
                        placeholder="请输入姓名"
                        className="bg-[#0a0a0a] border-amber-500/20 text-amber-100 placeholder:text-gray-500 text-center h-12"
                      />
                    </div>
                    <DateInput birth={birth2} setBirth={setBirth2} label="出生日期" />
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button
                    onClick={startMatch}
                    disabled={!name1.trim() || !birth1.year || !name2.trim() || !birth2.year}
                    className="bg-amber-500 hover:bg-amber-600 text-black px-12 py-6 text-lg"
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
            <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <Heart className="w-20 h-20 text-amber-500 animate-pulse fill-amber-500" />
                  <Sparkles className="w-8 h-8 text-amber-400 absolute -top-2 -right-2 animate-spin" />
                </div>
                <p className="text-xl text-amber-100 mt-6">正在测算缘分...</p>
                <p className="text-sm text-gray-500 mt-2">使用 lunar-javascript 精确计算八字</p>
              </CardContent>
            </Card>
          )}

          {/* 结果显示 */}
          {result && !isMatching && (
            <div className="space-y-6">
              {/* 匹配分数 */}
              <Card className="bg-[#1a1a1a]/50 border-amber-500/20 overflow-hidden">
                <CardContent className="relative py-12">
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <svg className="w-40 h-40" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(212,175,55,0.2)"
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
                            <stop offset="0%" stopColor="#d4af37" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <div className="text-4xl font-bold text-amber-100">{result.score}</div>
                          <div className="text-sm text-gray-400">分</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-amber-100 mb-2">{result.level}</div>
                    <div className="text-gray-400">{result.name1} & {result.name2}</div>
                  </div>
                </CardContent>
              </Card>

              {/* 双方八字 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ name: result.name1, bazi: result.bazi1 }, { name: result.name2, bazi: result.bazi2 }].map((person, idx) => (
                  <Card key={idx} className="bg-[#1a1a1a]/50 border-amber-500/20">
                    <CardHeader>
                      <CardTitle className="text-xl text-amber-100 flex items-center justify-between">
                        <span>{person.name}</span>
                        <span className="text-sm font-normal px-2 py-1 bg-amber-500/20 rounded text-amber-400">
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
                          <div key={i} className="bg-[#0a0a0a] rounded-lg p-2 border border-amber-500/10">
                            <div className="text-xs text-gray-500">{item.label}</div>
                            <div className="text-xl font-bold text-amber-100">{item.pillar.gan}{item.pillar.zhi}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        {['金', '木', '水', '火', '土'].map(wx => (
                          <div key={wx} className="text-center">
                            <div className={`h-12 rounded bg-gradient-to-b ${wuXingColors[wx]} flex items-center justify-center`}>
                              <span className="text-lg font-bold text-white">{person.bazi.wuxing[wx]}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{wx}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-sm text-gray-400">
                        主命{person.bazi.dominantWuXing}
                        {person.bazi.missingWuXing.length > 0 && `，缺${person.bazi.missingWuXing.join('、')}`}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 生肖配对 */}
              <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100">生肖配对</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{result.bazi1.shengxiao}</div>
                      <div className="text-sm text-gray-400">{result.name1}</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getRelationColor(result.shengxiaoMatch.relation)}`}>
                        {result.shengxiaoMatch.relation}
                      </div>
                      <Heart className="w-8 h-8 text-amber-500 fill-amber-500 my-2" />
                      <div className="text-xl font-bold text-amber-100">{result.shengxiaoMatch.score}分</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">{result.bazi2.shengxiao}</div>
                      <div className="text-sm text-gray-400">{result.name2}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{result.shengxiaoMatch.description}</p>
                </CardContent>
              </Card>

              {/* 八字配对 */}
              <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100">八字配对</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-amber-500/10">
                      <div className="text-sm text-gray-500 mb-1">日柱关系</div>
                      <div className="text-amber-100">{result.baziMatch.dayPillarRelation}</div>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-amber-500/10">
                      <div className="text-sm text-gray-500 mb-1">八字评分</div>
                      <div className="text-xl font-bold text-amber-100">{result.baziMatch.score}分</div>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{result.baziMatch.description}</p>
                </CardContent>
              </Card>

              {/* AI解读 */}
              <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    大师解读
                    {isInterpreting && <span className="ml-2 text-sm text-amber-400 animate-pulse">生成中...</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-600/50 scrollbar-track-transparent">
                    <div className="prose prose-invert prose-amber max-w-none">
                      <div
                        className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: aiInterpretation
                            .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-amber-100 mt-4 mb-2">$1</h2>')
                            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-100">$1</strong>')
                        }}
                      />
                    </div>
                    <div ref={interpretationRef} />
                  </div>
                </CardContent>
              </Card>

              {/* 免责声明 */}
              <Disclaimer variant="full" />

              {/* 操作按钮 */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={reset}
                  variant="outline"
                  className="border-amber-500/20 text-amber-100 hover:bg-amber-500/10"
                >
                  重新匹配
                </Button>
                {savedRecordId && (
                  <div className="text-sm text-amber-400 flex items-center">
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
