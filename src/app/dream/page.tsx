'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Moon, Search, Sparkles, History, Bot, BookOpen, Trash2, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';

// 解析结果类型
interface InterpretationResult {
  summary: string;
  symbols: { symbol: string; meaning: string }[];
  interpretation: string;
  psychology: string;
  advice: string;
  fortune: {
    overall: string;
    career: string;
    love: string;
    wealth: string;
    health: string;
  };
}

// 梦境记录类型
interface DreamRecord {
  id: number;
  session_id: string;
  dream_content: string;
  keywords: string[];
  interpretation: string;
  advice: string;
  created_at: string;
}

// 关键词数据类型
interface KeywordData {
  keyword: string;
  category: string;
  meaning: string;
  advice: string;
}

// 获取或创建会话ID
const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('dream_session_id');
  if (!sessionId) {
    sessionId = `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('dream_session_id', sessionId);
  }
  return sessionId;
};

export default function DreamInterpretPage() {
  const { isLoggedIn } = useAuth();
  const [mode, setMode] = useState<'keyword' | 'ai'>('ai'); // 默认AI模式
  const [keyword, setKeyword] = useState('');
  const [dreamContent, setDreamContent] = useState('');
  const [keywordResult, setKeywordResult] = useState<KeywordData | null>(null);
  const [aiResult, setAiResult] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<InterpretationResult | null>(null);
  const [suggestions, setSuggestions] = useState<KeywordData[]>([]);
  const [keywords, setKeywords] = useState<Record<string, KeywordData[]>>({});
  const [history, setHistory] = useState<DreamRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // 登录弹窗状态
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingDreamContent, setPendingDreamContent] = useState<string>('');
  
  const resultRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef('');

  // 初始化
  useEffect(() => {
    sessionId.current = getSessionId();
    initKeywords();
    loadHistory();
  }, []);

  // 初始化关键词数据
  const initKeywords = async () => {
    try {
      // 检查初始化状态
      const statusRes = await fetch('/api/dream-keywords?init=1');
      const statusData = await statusRes.json();

      if (!statusData.initialized) {
        // 自动初始化
        await fetch('/api/dream-keywords', { method: 'POST' });
      }

      // 获取关键词数据
      const res = await fetch('/api/dream-keywords');
      const data = await res.json();
      if (data.success) {
        setKeywords(data.data);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('初始化关键词失败:', error);
      setIsInitialized(true);
    }
  };

  // 加载历史记录
  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/dream/records?sessionId=${sessionId.current}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  };

  // 关键词搜索建议
  const handleKeywordInput = (value: string) => {
    setKeyword(value);
    if (value.length > 0 && Object.keys(keywords).length > 0) {
      const allKeywords = Object.values(keywords).flat();
      const matches = allKeywords
        .filter(k => k.keyword.includes(value) || k.meaning.includes(value))
        .slice(0, 8);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  // 关键词解梦
  const interpretKeyword = (kw: string) => {
    const allKeywords = Object.values(keywords).flat();
    const found = allKeywords.find(k => k.keyword === kw || kw.includes(k.keyword));
    
    if (found) {
      setKeywordResult(found);
    } else {
      setKeywordResult({
        keyword: kw,
        category: '其他',
        meaning: '暂无此梦境关键词的解析记录。梦境解析仅供参考，建议结合自己的实际情况理解。梦境往往是潜意识的反映，可能与最近的经历、情绪或想法有关。',
        advice: '建议您放松心情，保持良好的作息习惯。如果经常做相似的梦，可以尝试记录下来分析可能的触发因素。'
      });
    }
    setSuggestions([]);
    setAiResult('');
    setParsedResult(null);
  };

  // AI智能解梦
  const interpretWithAI = async () => {
    if (!dreamContent.trim() || isLoading) return;

    setIsLoading(true);
    setAiResult('');
    setParsedResult(null);
    setKeywordResult(null);

    try {
      const response = await fetch('/api/dream/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamContent,
          sessionId: sessionId.current,
          saveRecord: true
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应');
      }

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                // 不直接展示原始内容，让加载动画持续显示
                // setAiResult(fullContent);
              }
              if (data.done) {
                fullContent = data.fullContent || fullContent;
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      // 尝试解析JSON结果
      try {
        // 提取JSON部分
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setParsedResult(parsed);
        } else {
          // 如果不是JSON格式，设置原始内容
          setAiResult(fullContent);
        }
      } catch {
        // JSON解析失败，设置原始内容
        setAiResult(fullContent);
      }

      // 刷新历史记录
      loadHistory();

      // 滚动到结果区域
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      // 检查登录状态
      if (!isLoggedIn) {
        // 未登录，保存结果并显示登录弹窗
        setPendingDreamContent(dreamContent);
        setShowLoginDialog(true);
      }

    } catch (error) {
      console.error('AI解梦失败:', error);
      setAiResult('解梦过程中出现错误，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除历史记录
  const deleteRecord = async (id: number) => {
    try {
      await fetch(`/api/dream/records?id=${id}`, { method: 'DELETE' });
      setHistory(history.filter(h => h.id !== id));
    } catch (error) {
      console.error('删除记录失败:', error);
    }
  };

  // 查看历史记录详情
  const viewHistoryDetail = (record: DreamRecord) => {
    setDreamContent(record.dream_content);
    setAiResult(record.interpretation);
    try {
      const jsonMatch = record.interpretation.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setParsedResult(JSON.parse(jsonMatch[0]));
      }
    } catch {
      // 忽略
    }
    setKeywordResult(null);
    setShowHistory(false);
    setMode('ai');
  };

  // 获取运势颜色
  const getFortuneColor = (fortune: string) => {
    switch (fortune) {
      case '吉': return 'text-red-400';
      case '中吉': return 'text-orange-400';
      case '小吉': return 'text-yellow-400';
      case '平': return 'text-green-400';
      case '小凶': return 'text-gray-400';
      default: return 'text-indigo-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-indigo-200 hover:text-indigo-100 hover:bg-white/10">
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
            <Moon className="w-10 h-10 text-indigo-300 mr-3" />
            <h1 className="text-4xl font-bold text-indigo-100">周公解梦</h1>
            <Moon className="w-10 h-10 text-indigo-300 ml-3" />
          </div>
          <p className="text-indigo-200/80">探索梦境的奥秘，解读潜意识的密码</p>
        </div>

        {/* 模式切换和历史按钮 */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setMode('ai')}
              variant={mode === 'ai' ? 'default' : 'outline'}
              className={mode === 'ai' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                : 'bg-white/10 border-indigo-300/30 text-indigo-200 hover:bg-white/20'}
            >
              <Bot className="w-4 h-4 mr-2" />
              AI智能解梦
            </Button>
            <Button
              onClick={() => setMode('keyword')}
              variant={mode === 'keyword' ? 'default' : 'outline'}
              className={mode === 'keyword' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                : 'bg-white/10 border-indigo-300/30 text-indigo-200 hover:bg-white/20'}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              关键词查询
            </Button>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="outline"
              className="bg-white/10 border-indigo-300/30 text-indigo-200 hover:bg-white/20"
            >
              <History className="w-4 h-4 mr-2" />
              历史记录
              {history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-500 rounded-full">
                  {history.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* 历史记录面板 */}
          {showHistory && (
            <Card className="bg-white/10 backdrop-blur-md border-indigo-300/30 mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-100 flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  解梦历史
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-indigo-200/60 text-center py-8">暂无解梦记录</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {history.map((record) => (
                      <div
                        key={record.id}
                        className="bg-indigo-950/40 rounded-lg p-4 hover:bg-indigo-950/60 cursor-pointer transition-colors group"
                        onClick={() => viewHistoryDetail(record)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-indigo-100 text-sm line-clamp-2">
                              {record.dream_content}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-indigo-300/60">
                              <Clock className="w-3 h-3" />
                              {new Date(record.created_at).toLocaleString('zh-CN')}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRecord(record.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI智能解梦模式 */}
          {mode === 'ai' && (
            <Card className="bg-white/10 backdrop-blur-md border-indigo-300/30 mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-indigo-100 flex items-center justify-center">
                  <Bot className="w-6 h-6 mr-2" />
                  AI智能解梦
                </CardTitle>
                <CardDescription className="text-indigo-200/60">
                  详细描述您的梦境，AI将为您进行深度解析
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={dreamContent}
                  onChange={(e) => setDreamContent(e.target.value)}
                  placeholder="请详细描述您的梦境，包括场景、人物、情节、感受等。描述越详细，解析越准确..."
                  className="w-full h-40 bg-white/10 border border-indigo-300/30 rounded-lg p-4 text-indigo-100 placeholder:text-indigo-200/40 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                  disabled={isLoading}
                />
                <div className="text-center">
                  <Button
                    onClick={interpretWithAI}
                    disabled={!dreamContent.trim() || isLoading || !isInitialized}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-12 py-6 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        解析中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        开始解梦
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 关键词查询模式 */}
          {mode === 'keyword' && (
            <Card className="bg-white/10 backdrop-blur-md border-indigo-300/30 mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-indigo-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 mr-2" />
                  关键词查询
                </CardTitle>
                <CardDescription className="text-indigo-200/60">
                  输入梦境中出现的事物或场景关键词
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    value={keyword}
                    onChange={(e) => handleKeywordInput(e.target.value)}
                    placeholder="例如：水、蛇、掉牙、飞..."
                    className="bg-white/10 border-indigo-300/30 text-indigo-100 placeholder:text-indigo-200/40 text-center text-xl h-14 pr-12"
                    onKeyDown={(e) => e.key === 'Enter' && interpretKeyword(keyword)}
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300/60" />

                  {/* 搜索建议 */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-indigo-900/90 backdrop-blur-md rounded-lg border border-indigo-400/30 overflow-hidden z-10">
                      {suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="px-4 py-3 text-indigo-200 hover:bg-indigo-500/20 cursor-pointer flex justify-between"
                          onClick={() => {
                            setKeyword(s.keyword);
                            interpretKeyword(s.keyword);
                            setSuggestions([]);
                          }}
                        >
                          <span>{s.keyword}</span>
                          <span className="text-xs text-indigo-300/60">{s.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-center pt-2">
                  <Button
                    onClick={() => interpretKeyword(keyword)}
                    disabled={!keyword.trim()}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-12 py-6 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    开始解梦
                  </Button>
                </div>

                {/* 热门关键词 */}
                <div className="pt-4">
                  <p className="text-sm text-indigo-200/60 mb-3 text-center">热门关键词：</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['水', '蛇', '掉牙', '飞', '结婚', '死人', '钱', '龙'].map((kw) => (
                      <Button
                        key={kw}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setKeyword(kw);
                          interpretKeyword(kw);
                        }}
                        className="bg-white/5 border-indigo-300/20 text-indigo-200 hover:bg-white/10 hover:text-indigo-100"
                      >
                        {kw}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI解析中状态 */}
          {isLoading && !parsedResult && (
            <div ref={resultRef}>
              <Card className="bg-white/10 backdrop-blur-md border-indigo-300/30 mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl text-indigo-100 text-center flex items-center justify-center">
                    <Moon className="w-6 h-6 mr-2" />
                    梦境解析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-6">
                      <Moon className="w-20 h-20 text-indigo-400 animate-pulse" />
                      <Sparkles className="w-8 h-8 text-purple-400 absolute -top-2 -right-2 animate-spin" />
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-xl text-indigo-200 animate-pulse">大师正在思考中...</p>
                      <div className="flex items-center justify-center gap-1 mt-4">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <p className="text-sm text-indigo-300/60 mt-4">正在分析梦境符号与寓意</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI解析结果 - JSON格式化展示 */}
          {parsedResult && !isLoading && (
            <div ref={resultRef}>
              <Card className="bg-white/10 backdrop-blur-md border-indigo-300/30 mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl text-indigo-100 text-center flex items-center justify-center">
                    <Moon className="w-6 h-6 mr-2" />
                    梦境解析
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 梦境概括 */}
                  <div className="text-center">
                    <p className="text-xl text-indigo-100">{parsedResult.summary}</p>
                  </div>

                  {/* 梦境符号 */}
                  {parsedResult.symbols && parsedResult.symbols.length > 0 && (
                    <div className="bg-indigo-950/60 rounded-lg p-6">
                      <h4 className="text-sm font-bold text-indigo-100 mb-4 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        梦境符号解析
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {parsedResult.symbols.map((s, i) => (
                          <div key={i} className="bg-indigo-900/40 rounded-lg p-3 flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-indigo-100">{s.symbol}</span>
                              <span className="text-indigo-200/80 ml-2">{s.meaning}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 详细解析 */}
                  <div className="bg-indigo-950/60 rounded-lg p-6">
                    <h4 className="text-sm font-bold text-indigo-100 mb-3 flex items-center">
                      <Moon className="w-4 h-4 mr-2" />
                      详细解析
                    </h4>
                    <p className="text-indigo-100 leading-relaxed">{parsedResult.interpretation}</p>
                  </div>

                  {/* 心理学分析 */}
                  {parsedResult.psychology && (
                    <div className="bg-indigo-950/40 rounded-lg p-6 border border-indigo-400/20">
                      <h4 className="text-sm font-bold text-indigo-300 mb-3">心理学视角</h4>
                      <p className="text-indigo-100/90 leading-relaxed">{parsedResult.psychology}</p>
                    </div>
                  )}

                  {/* 运势预测 */}
                  {parsedResult.fortune && (
                    <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 rounded-lg p-6 border border-indigo-400/30">
                      <h4 className="text-sm font-bold text-indigo-100 mb-4 text-center">运势预测</h4>
                      <div className="grid grid-cols-5 gap-2 text-center">
                        <div>
                          <div className={`text-lg font-bold ${getFortuneColor(parsedResult.fortune.overall)}`}>
                            {parsedResult.fortune.overall}
                          </div>
                          <div className="text-xs text-indigo-300/60">整体</div>
                        </div>
                        <div>
                          <div className="text-sm text-indigo-100">{parsedResult.fortune.career}</div>
                          <div className="text-xs text-indigo-300/60">事业</div>
                        </div>
                        <div>
                          <div className="text-sm text-indigo-100">{parsedResult.fortune.love}</div>
                          <div className="text-xs text-indigo-300/60">感情</div>
                        </div>
                        <div>
                          <div className="text-sm text-indigo-100">{parsedResult.fortune.wealth}</div>
                          <div className="text-xs text-indigo-300/60">财运</div>
                        </div>
                        <div>
                          <div className="text-sm text-indigo-100">{parsedResult.fortune.health}</div>
                          <div className="text-xs text-indigo-300/60">健康</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 建议 */}
                  {parsedResult.advice && (
                    <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 rounded-lg p-6 border border-indigo-400/30">
                      <h4 className="text-sm font-bold text-indigo-100 mb-3">温馨建议</h4>
                      <p className="text-indigo-100 leading-relaxed">{parsedResult.advice}</p>
                    </div>
                  )}

                  <div className="bg-indigo-950/50 rounded-lg p-4 text-center">
                    <p className="text-xs text-indigo-200/80">
                      梦境解析仅供参考，切勿过度迷信。保持良好心态，积极面对生活。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI解析结果 - 原始内容（JSON解析失败时的备选展示） */}
          {aiResult && !parsedResult && !isLoading && (
            <div ref={resultRef}>
              <Card className="bg-white/10 backdrop-blur-md border-indigo-300/30 mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl text-indigo-100 text-center flex items-center justify-center">
                    <Moon className="w-6 h-6 mr-2" />
                    梦境解析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-indigo-950/60 rounded-lg p-6">
                    <p className="text-indigo-100 leading-relaxed whitespace-pre-wrap">{aiResult}</p>
                  </div>
                  <div className="bg-indigo-950/50 rounded-lg p-4 text-center mt-6">
                    <p className="text-xs text-indigo-200/80">
                      梦境解析仅供参考，切勿过度迷信。保持良好心态，积极面对生活。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 关键词解析结果 */}
          {keywordResult && mode === 'keyword' && (
            <Card className="bg-white/10 backdrop-blur-md border-indigo-300/30">
              <CardHeader>
                <CardTitle className="text-2xl text-indigo-100 text-center">
                  梦见「{keywordResult.keyword}」
                </CardTitle>
                <CardDescription className="text-center text-indigo-300/60">
                  分类：{keywordResult.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-indigo-950/60 rounded-lg p-6">
                  <h4 className="text-sm font-bold text-indigo-100 mb-3 flex items-center">
                    <Moon className="w-4 h-4 mr-2" />
                    梦境解析
                  </h4>
                  <p className="text-indigo-100 leading-relaxed">{keywordResult.meaning}</p>
                </div>

                <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 rounded-lg p-6 border border-indigo-400/30">
                  <h4 className="text-sm font-bold text-indigo-100 mb-3">💡 温馨提示</h4>
                  <p className="text-indigo-100 leading-relaxed">{keywordResult.advice}</p>
                </div>

                <div className="bg-indigo-950/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-indigo-200/80">
                    梦境解析仅供参考，切勿过度迷信。保持良好心态，积极面对生活。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 关键词分类浏览 */}
          {mode === 'keyword' && Object.keys(keywords).length > 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-indigo-300/30 mt-6">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-100">关键词分类</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(keywords).map(([category, kws]) => (
                  kws.length > 0 && (
                    <div key={category} className="mb-4">
                      <h4 className="text-sm font-bold text-indigo-300 mb-2">{category}类</h4>
                      <div className="flex flex-wrap gap-2">
                        {kws.slice(0, 10).map((k) => (
                          <Button
                            key={k.keyword}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setKeyword(k.keyword);
                              interpretKeyword(k.keyword);
                            }}
                            className="bg-white/5 border-indigo-300/20 text-indigo-200 hover:bg-white/10 hover:text-indigo-100"
                          >
                            {k.keyword}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 登录弹窗 */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="登录保存解梦记录"
        description="登录后可以保存您的解梦记录，随时查看历史"
      />
    </div>
  );
}
