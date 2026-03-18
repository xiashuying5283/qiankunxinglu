'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';

export default function MatchPage() {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    level: string;
    description: string;
    advice: string;
    elements: {
      name1: { element: string; nature: string };
      name2: { element: string; nature: string };
    };
  } | null>(null);

  // 根据名字计算五行属性（简化版）
  const getElementByName = (name: string) => {
    const charCode = name.charCodeAt(0);
    const elements = ['金', '木', '水', '火', '土'];
    const natures = ['刚毅果断', '仁慈宽厚', '智慧灵活', '热情奔放', '稳重踏实'];
    const index = charCode % 5;
    return {
      element: elements[index],
      nature: natures[index],
    };
  };

  // 计算匹配分数
  const calculateScore = () => {
    const base = 50;
    const name1Bonus = name1.length * 3;
    const name2Bonus = name2.length * 3;
    const compatibility = (name1.charCodeAt(0) + name2.charCodeAt(0)) % 30;
    return Math.min(99, base + name1Bonus + name2Bonus + compatibility);
  };

  // 获取匹配等级
  const getMatchLevel = (score: number): string => {
    if (score >= 90) return '天作之合';
    if (score >= 80) return '良缘佳配';
    if (score >= 70) return '情投意合';
    if (score >= 60) return '缘分颇深';
    if (score >= 50) return '有缘相识';
    return '缘分未至';
  };

  // 生成匹配描述
  const generateDescription = (level: string, element1: string, element2: string): string => {
    const descriptions: Record<string, string[]> = {
      '天作之合': [
        '两人缘分深厚，仿佛前世已定，今生重逢。',
        '命中注定的相遇，天造地设的一对。',
        '月老早已为你们牵上红线，只待今朝相遇。',
      ],
      '良缘佳配': [
        '缘分让你们相遇，珍惜这份来之不易的情缘。',
        '你们的相遇是命运的安排，值得用心经营。',
        '良缘天注定，珍惜眼前人。',
      ],
      '情投意合': [
        '彼此性格相合，有进一步发展的可能。',
        '缘分让你们相识，用心经营定能开花结果。',
        '心意相通，是缘分最好的证明。',
      ],
      '缘分颇深': [
        '两人之间有着不解之缘，值得深入交往。',
        '命中注定的相遇，用心感受这份缘分。',
        '缘分的种子已播下，用心浇灌定能发芽。',
      ],
      '有缘相识': [
        '相遇即是缘，珍惜这份相识的缘分。',
        '人生若只如初见，愿你们能珍惜这份缘分。',
        '有缘千里来相会，愿你们能珍惜这份相遇。',
      ],
      '缘分未至': [
        '缘分有时需要等待，不必急于求成。',
        '也许缘分还未成熟，保持开放的心态。',
        '命运有时的安排让人捉摸不透，但美好总在前方。',
      ],
    };
    
    const levelDescs = descriptions[level] || descriptions['有缘相识'];
    const baseDesc = levelDescs[Math.floor(Math.random() * levelDescs.length)];
    
    // 五行相生相克分析
    const elementRelation = getElementRelation(element1, element2);
    
    return `${baseDesc} ${element1}命与${element2}命${elementRelation}。`;
  };

  // 五行关系
  const getElementRelation = (e1: string, e2: string): string => {
    const relations: Record<string, Record<string, string>> = {
      '金': { '金': '相合相助', '木': '相克相制', '水': '相生相济', '火': '相克相炼', '土': '相生相养' },
      '木': { '金': '相克相制', '木': '相合相助', '水': '相生相养', '火': '相生相济', '土': '相克相制' },
      '水': { '金': '相生相养', '木': '相生相济', '水': '相合相助', '火': '相克相制', '土': '相克相制' },
      '火': { '金': '相克相炼', '木': '相生相济', '水': '相克相制', '火': '相合相助', '土': '相生相养' },
      '土': { '金': '相生相养', '木': '相克相制', '水': '相克相制', '火': '相生相济', '土': '相合相助' },
    };
    return relations[e1]?.[e2] || '缘分交织';
  };

  // 生成建议
  const generateAdvice = (score: number): string => {
    if (score >= 80) {
      return '珍惜这段缘分，用心经营感情，幸福就在眼前。多沟通交流，互相理解包容，爱情会长长久久。';
    } else if (score >= 60) {
      return '这段感情有发展的潜力，需要双方共同努力。建议多花时间了解对方，培养共同兴趣，增进感情。';
    } else {
      return '缘分需要时间来证明，不必急于求成。保持开放的心态，也许转角就会遇到更好的缘分。';
    }
  };

  // 开始匹配
  const startMatch = async () => {
    if (!name1.trim() || !name2.trim()) {
      alert('请输入双方姓名');
      return;
    }

    setIsMatching(true);
    
    // 模拟匹配过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const element1 = getElementByName(name1);
    const element2 = getElementByName(name2);
    const score = calculateScore();
    const level = getMatchLevel(score);
    const description = generateDescription(level, element1.element, element2.element);
    const advice = generateAdvice(score);

    setResult({
      score,
      level,
      description,
      advice,
      elements: {
        name1: element1,
        name2: element2,
      },
    });

    setIsMatching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-rose-200 hover:text-rose-100 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-rose-300 mr-3 fill-rose-400" />
            <h1 className="text-4xl font-bold text-rose-100">姻缘匹配</h1>
            <Heart className="w-10 h-10 text-rose-300 ml-3 fill-rose-400" />
          </div>
          <p className="text-rose-200/80">千里姻缘一线牵，测算你们的缘分指数</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* 输入区域 */}
          {!result && !isMatching && (
            <Card className="bg-white/10 backdrop-blur-md border-rose-300/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-rose-100">输入双方姓名</CardTitle>
                <CardDescription className="text-rose-200/60">
                  根据姓名五行属性，测算你们的姻缘匹配度
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-rose-200">第一位</label>
                    <Input
                      type="text"
                      value={name1}
                      onChange={(e) => setName1(e.target.value)}
                      placeholder="请输入姓名"
                      className="bg-white/10 border-rose-300/30 text-rose-100 placeholder:text-rose-200/40 text-center text-xl h-14"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-rose-200">第二位</label>
                    <Input
                      type="text"
                      value={name2}
                      onChange={(e) => setName2(e.target.value)}
                      placeholder="请输入姓名"
                      className="bg-white/10 border-rose-300/30 text-rose-100 placeholder:text-rose-200/40 text-center text-xl h-14"
                    />
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Button
                    onClick={startMatch}
                    disabled={!name1.trim() || !name2.trim()}
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
                <p className="text-sm text-rose-200/60 mt-2">月老正在为您牵红线</p>
              </CardContent>
            </Card>
          )}

          {/* 结果显示 */}
          {result && !isMatching && (
            <div className="space-y-6">
              {/* 匹配分数 */}
              <Card className="bg-white/10 backdrop-blur-md border-rose-300/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-pink-500/20 pointer-events-none" />
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
                    <div className="text-rose-200/80">{name1} & {name2}</div>
                  </div>
                </CardContent>
              </Card>

              {/* 五行分析 */}
              <Card className="bg-white/10 backdrop-blur-md border-rose-300/30">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-100">五行分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{result.elements.name1.element}</span>
                      </div>
                      <div className="text-lg text-rose-100 mb-1">{name1}</div>
                      <div className="text-sm text-rose-200/60">{result.elements.name1.nature}</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{result.elements.name2.element}</span>
                      </div>
                      <div className="text-lg text-rose-100 mb-1">{name2}</div>
                      <div className="text-sm text-rose-200/60">{result.elements.name2.nature}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 缘分解读 */}
              <Card className="bg-white/10 backdrop-blur-md border-rose-300/30">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-100">缘分解读</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-rose-100 leading-relaxed">{result.description}</p>
                </CardContent>
              </Card>

              {/* 感情建议 */}
              <Card className="bg-gradient-to-r from-rose-900/60 to-pink-900/60 border-rose-400/30">
                <CardHeader>
                  <CardTitle className="text-xl text-rose-100">感情建议</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-rose-100 leading-relaxed">{result.advice}</p>
                </CardContent>
              </Card>

              {/* 重新匹配 */}
              <div className="text-center">
                <Button
                  onClick={() => {
                    setName1('');
                    setName2('');
                    setResult(null);
                  }}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-12 py-6 text-lg"
                >
                  <Heart className="w-5 h-5 mr-2 fill-white" />
                  重新匹配
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
