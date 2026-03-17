'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sun, Star, TrendingUp, Heart, Briefcase, Coins, Users } from 'lucide-react';

// 十二生肖数据
const zodiacs = [
  { name: '鼠', emoji: '🐭' },
  { name: '牛', emoji: '🐮' },
  { name: '虎', emoji: '🐯' },
  { name: '兔', emoji: '🐰' },
  { name: '龙', emoji: '🐲' },
  { name: '蛇', emoji: '🐍' },
  { name: '马', emoji: '🐴' },
  { name: '羊', emoji: '🐏' },
  { name: '猴', emoji: '🐵' },
  { name: '鸡', emoji: '🐔' },
  { name: '狗', emoji: '🐶' },
  { name: '猪', emoji: '🐷' },
];

// 运势文案库
const fortunes = {
  overall: ['大吉大利', '运势上佳', '平稳顺利', '小有波折', '需谨慎行事', '宜静不宜动'],
  career: ['事业顺遂，贵人相助', '工作顺利，有升职机会', '团队合作愉快', '需注意细节', '可能有变动', '宜保守行事'],
  love: ['桃花运旺，姻缘将至', '感情甜蜜，关系稳定', '可遇良人', '需要沟通', '感情平淡', '宜独处静心'],
  wealth: ['财运亨通，收入可观', '偏财运佳，可小试手气', '正财稳定', '不宜投资', '注意开支', '理财为宜'],
  health: ['精力充沛，身体康健', '精神状态佳', '注意休息', '小心感冒', '宜多运动', '注意饮食'],
};

// 幸运元素
const luckyElements = {
  colors: ['红色', '黄色', '蓝色', '绿色', '紫色', '白色', '金色', '粉色', '橙色'],
  numbers: ['1', '3', '5', '6', '8', '9', '2', '4', '7'],
  directions: ['东方', '南方', '西方', '北方', '东南', '西南', '东北', '西北'],
};

interface DailyFortune {
  zodiac: typeof zodiacs[0];
  overall: string;
  overallScore: number;
  career: string;
  careerScore: number;
  love: string;
  loveScore: number;
  wealth: string;
  wealthScore: number;
  health: string;
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  advice: string;
}

export default function DailyFortunePage() {
  const [selectedZodiac, setSelectedZodiac] = useState<typeof zodiacs[0] | null>(null);
  const [fortune, setFortune] = useState<DailyFortune | null>(null);

  // 根据日期生成伪随机数
  const getSeededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // 生成运势
  const generateFortune = (zodiac: typeof zodiacs[0]) => {
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const zodiacIndex = zodiacs.findIndex(z => z.name === zodiac.name);
    const seed = dateSeed + zodiacIndex;

    const pickRandom = (arr: string[]) => arr[Math.floor(getSeededRandom(seed * arr.length) * arr.length)];
    const pickScore = (base: number) => Math.floor(getSeededRandom(seed * base) * 5) + 1;
    
    const overallScore = pickScore(1);
    const adviceList = [
      '今日宜积极进取，把握机会。',
      '适合开展新计划，好运相伴。',
      '保持平常心，稳中求进。',
      '注意休息，调整状态。',
      '宜静不宜动，谨慎行事。',
      '多与朋友交流，会有收获。',
      '专注于重要事务，避免分心。',
      '保持乐观心态，好运自来。',
    ];

    setFortune({
      zodiac,
      overall: pickRandom(fortunes.overall),
      overallScore,
      career: pickRandom(fortunes.career),
      careerScore: pickScore(2),
      love: pickRandom(fortunes.love),
      loveScore: pickScore(3),
      wealth: pickRandom(fortunes.wealth),
      wealthScore: pickScore(4),
      health: pickRandom(fortunes.health),
      luckyColor: pickRandom(luckyElements.colors),
      luckyNumber: pickRandom(luckyElements.numbers),
      luckyDirection: pickRandom(luckyElements.directions),
      advice: pickRandom(adviceList),
    });
  };

  const handleSelect = (zodiac: typeof zodiacs[0]) => {
    setSelectedZodiac(zodiac);
    generateFortune(zodiac);
  };

  // 星星评分
  const StarRating = ({ score, max = 5 }: { score: number; max?: number }) => (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400/30'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-sky-200 hover:text-sky-100 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sun className="w-10 h-10 text-sky-300 mr-3" />
            <h1 className="text-4xl font-bold text-sky-100">每日运势</h1>
            <Sun className="w-10 h-10 text-sky-300 ml-3" />
          </div>
          <p className="text-sky-200/80">选择您的生肖，查看今日运势</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 生肖选择 */}
          {!selectedZodiac && (
            <Card className="bg-white/10 backdrop-blur-md border-sky-300/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-sky-100">选择您的生肖</CardTitle>
                <CardDescription className="text-sky-200/60">
                  点击生肖查看今日详细运势
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {zodiacs.map((zodiac) => (
                    <button
                      key={zodiac.name}
                      onClick={() => handleSelect(zodiac)}
                      className="flex flex-col items-center p-4 rounded-lg bg-white/5 hover:bg-white/15 transition-all hover:scale-105 border border-transparent hover:border-sky-400/30"
                    >
                      <span className="text-3xl mb-1">{zodiac.emoji}</span>
                      <span className="text-sm text-sky-200">{zodiac.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 运势结果 */}
          {selectedZodiac && fortune && (
            <div className="space-y-6">
              {/* 生肖和整体运势 */}
              <Card className="bg-white/10 backdrop-blur-md border-sky-300/30">
                <CardContent className="py-8">
                  <div className="text-center mb-6">
                    <span className="text-6xl mb-2 block">{fortune.zodiac.emoji}</span>
                    <h2 className="text-3xl font-bold text-sky-100">{fortune.zodiac.name}生肖</h2>
                    <p className="text-sky-200/60 mt-1">
                      {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-block bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-3 rounded-lg">
                      <span className="text-xl font-bold text-white">今日运势：{fortune.overall}</span>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <StarRating score={fortune.overallScore} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 分项运势 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 事业运 */}
                <Card className="bg-white/10 backdrop-blur-md border-sky-300/30">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                        <span className="font-bold text-sky-100">事业运</span>
                      </div>
                      <StarRating score={fortune.careerScore} />
                    </div>
                    <p className="text-sky-200 text-sm">{fortune.career}</p>
                  </CardContent>
                </Card>

                {/* 爱情运 */}
                <Card className="bg-white/10 backdrop-blur-md border-sky-300/30">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        <span className="font-bold text-sky-100">爱情运</span>
                      </div>
                      <StarRating score={fortune.loveScore} />
                    </div>
                    <p className="text-sky-200 text-sm">{fortune.love}</p>
                  </CardContent>
                </Card>

                {/* 财运 */}
                <Card className="bg-white/10 backdrop-blur-md border-sky-300/30">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold text-sky-100">财运</span>
                      </div>
                      <StarRating score={fortune.wealthScore} />
                    </div>
                    <p className="text-sky-200 text-sm">{fortune.wealth}</p>
                  </CardContent>
                </Card>

                {/* 健康运 */}
                <Card className="bg-white/10 backdrop-blur-md border-sky-300/30">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-sky-100">健康运</span>
                      </div>
                    </div>
                    <p className="text-sky-200 text-sm">{fortune.health}</p>
                  </CardContent>
                </Card>
              </div>

              {/* 幸运元素 */}
              <Card className="bg-white/10 backdrop-blur-md border-sky-300/30">
                <CardHeader>
                  <CardTitle className="text-lg text-sky-100">今日幸运元素</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-sky-900/40 rounded-lg p-4">
                      <div className="text-2xl mb-1">🎨</div>
                      <div className="text-xs text-sky-200/60 mb-1">幸运颜色</div>
                      <div className="font-bold text-sky-100">{fortune.luckyColor}</div>
                    </div>
                    <div className="bg-sky-900/40 rounded-lg p-4">
                      <div className="text-2xl mb-1">🔢</div>
                      <div className="text-xs text-sky-200/60 mb-1">幸运数字</div>
                      <div className="font-bold text-sky-100">{fortune.luckyNumber}</div>
                    </div>
                    <div className="bg-sky-900/40 rounded-lg p-4">
                      <div className="text-2xl mb-1">🧭</div>
                      <div className="text-xs text-sky-200/60 mb-1">幸运方位</div>
                      <div className="font-bold text-sky-100">{fortune.luckyDirection}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 今日建议 */}
              <Card className="bg-gradient-to-r from-sky-600/20 to-blue-600/20 border-sky-400/30">
                <CardContent className="py-6">
                  <h4 className="font-bold text-sky-100 mb-2">💡 今日建议</h4>
                  <p className="text-sky-200">{fortune.advice}</p>
                </CardContent>
              </Card>

              {/* 重新选择 */}
              <div className="text-center">
                <Button
                  onClick={() => setSelectedZodiac(null)}
                  className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-12 py-6 text-lg"
                >
                  选择其他生肖
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
