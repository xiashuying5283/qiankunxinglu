'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Scroll } from 'lucide-react';

// 观音灵签数据（简化版，实际有100签）
const fortuneSticks = [
  { number: 1, title: '钟离成道', poem: '开天辟地作良缘，吉日良时万物全。若得此签非小可，人行忠正帝王宣。', meaning: '此签大吉，诸事皆顺。求财得财，求名得名，婚姻美满，事业亨通。', level: '上上签' },
  { number: 2, title: '苏武牧羊', poem: '鸟语花香景艳阳，心田未静强商量。如今且把归途看，切莫今朝恋晚芳。', meaning: '此签中平，不宜急进。守正待时，静候良机。凡事谨慎，切勿贪心。', level: '中平签' },
  { number: 3, title: '董永卖身', poem: '临风冒雨过前山，正是干戈战未闲。须向此时求善策，如今不必问容颜。', meaning: '此签中吉，先苦后甜。目前虽有困难，但只要坚持努力，终会苦尽甘来。', level: '中吉签' },
  { number: 4, title: '玄德请诸葛', poem: '千里迢迢往西求，前途美景自悠悠。问君但看前头路，万事俱成乐无忧。', meaning: '此签上吉，前途光明。出行大吉，求谋顺利，贵人相助，心想事成。', level: '上吉签' },
  { number: 5, title: '吕蒙正破窑', poem: '一箭射红心，人人说好音。高低且随分，荣华自有时。', meaning: '此签上吉，功名可求。虽有波折，终能成功。耐心等待，时机自到。', level: '上吉签' },
  { number: 6, title: '仁贵投军', poem: '投身岩下铜鸟居，须是还他大丈夫。早晚功名终有望，由天勿用自图谋。', meaning: '此签中平，顺其自然。不要强求，随缘而行。时机未到，宜守不宜进。', level: '中平签' },
  { number: 7, title: '苏秦刺股', poem: '奔波役役重重险，若要还时莫要贪。心正自然无伤害，出入求谋定不难。', meaning: '此签中吉，需经磨炼。勤奋努力，终有所成。切勿投机取巧，脚踏实地为上。', level: '中吉签' },
  { number: 8, title: '姜公渭水钓鱼', poem: '绿水青山景色新，前途渐渐见光明。若有贵人相助力，平地一声雷惊人。', meaning: '此签上吉，贵人相助。耐心等待时机，必有贵人出现，事业将有大的突破。', level: '上吉签' },
  { number: 9, title: '孔明入川', poem: '昔因路险要迷踪，今日前途尽许通。步步经营皆有利，前程大道任西东。', meaning: '此签上吉，前途畅通。过去的障碍已经消除，现在可以放心前行，一切顺利。', level: '上吉签' },
  { number: 10, title: '庞涓观阵', poem: '石小皆因块大难，前程莫把望高攀。若是有心勤作事，暂时忍耐自有还。', meaning: '此签中平，不宜好高骛远。脚踏实地，循序渐进。切勿贪大求全，稳扎稳打为上。', level: '中平签' },
  { number: 11, title: '韩信功劳', poem: '绿水青山色更鲜，逍遥景物正当前。若将此签来问我，财运亨通福禄全。', meaning: '此签上上，大吉大利。财运亨通，事业顺遂，家庭和睦，诸事皆宜。', level: '上上签' },
  { number: 12, title: '武则天登基', poem: '威风凛凛万人钦，莫道英雄非女身。若逢此签来相问，无事不成乐太平。', meaning: '此签上吉，事业有成。无论男女，皆可建功立业。把握机会，勇往直前。', level: '上吉签' },
  // 继续添加更多签...
  { number: 13, title: '罗通拜帅', poem: '不必心高不必忙，也须事事要商量。但愿一心皆稳静，家门安乐自荣昌。', meaning: '此签中平，安分为上。不要好高骛远，脚踏实地经营，家庭自然安乐。', level: '中平签' },
  { number: 14, title: '子牙弃官', poem: '卦逢吉兆在眼前，经营出入两俱全。生意滔滔如流水，财源滚滚似涌泉。', meaning: '此签上吉，财运亨通。经商大吉，投资顺利，财源广进，事业兴旺。', level: '上吉签' },
  { number: 15, title: '苏秦背剑', poem: '东风解冻雪消时，万物逢春发旧枝。这日若来求得意，花开正是太阳时。', meaning: '此签上吉，春回大地。困境将过，好运将至。把握时机，奋发向前。', level: '上吉签' },
  { number: 16, title: '叶梦雄朝帝', poem: '天开地阔志能伸，万事皆成贵人亲。时来运到人财旺，紫气东来满堂春。', meaning: '此签上上，万事如意。贵人相助，事业亨通，财运旺盛，前途无量。', level: '上上签' },
  { number: 17, title: '话梅止渴', poem: '渴望梅林只画饼，几番空想费精神。若要真正解焦渴，还须实地去寻津。', meaning: '此签下下，空想无益。不要只做白日梦，需要实际行动才能成功。', level: '下下签' },
  { number: 18, title: '曹操献刀', poem: '心中有事暗相猜，行事多疑费尽才。得此签者宜守正，莫教小辈把头抬。', meaning: '此签中平，宜守不宜进。凡事三思，谨慎行事。不要轻信他人，以免受骗。', level: '中平签' },
  { number: 19, title: '子仪封王', poem: '福星高照遇贵人，诸事呈祥福自临。前途无阻皆顺遂，荣华富贵耀门庭。', meaning: '此签上上，福星高照。贵人相助，万事顺遂，荣华富贵，前程似锦。', level: '上上签' },
  { number: 20, title: '姜维接印', poem: '秋来菊花正芬芳，事业功名渐渐昌。若遇贵人相助力，如同枯木又逢春。', meaning: '此签上吉，事业渐兴。贵人相助，如枯木逢春，事业将有大的发展。', level: '上吉签' },
];

export default function FortuneStickPage() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<typeof fortuneSticks[0] | null>(null);
  const [showResult, setShowResult] = useState(false);

  const drawStick = async () => {
    setIsDrawing(true);
    setShowResult(false);
    
    // 模拟抽签动画
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 随机抽取一签
    const randomIndex = Math.floor(Math.random() * fortuneSticks.length);
    setResult(fortuneSticks[randomIndex]);
    setIsDrawing(false);
    
    setTimeout(() => setShowResult(true), 100);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '上上签': return 'text-red-400';
      case '上吉签': return 'text-orange-400';
      case '中吉签': return 'text-yellow-400';
      case '中平签': return 'text-green-400';
      case '下下签': return 'text-gray-400';
      default: return 'text-amber-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-amber-200 hover:text-amber-100 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Scroll className="w-10 h-10 text-amber-300 mr-3" />
            <h1 className="text-4xl font-bold text-amber-100">观音灵签</h1>
            <Scroll className="w-10 h-10 text-amber-300 ml-3" />
          </div>
          <p className="text-amber-200/80">诚心祈愿，抽签问卦，指引迷津</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* 抽签区域 */}
          {!result ? (
            <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-amber-100">诚心祈愿</CardTitle>
                <CardDescription className="text-amber-200/60">
                  心中默念您想问的问题，点击下方按钮抽签
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                {/* 签筒 */}
                <div className="relative mb-8">
                  <div className="w-32 h-48 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-full border-4 border-amber-500 flex items-end justify-center pb-4">
                    <div className="text-amber-200 text-sm">签筒</div>
                  </div>
                  {isDrawing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="w-12 h-12 text-amber-300 animate-spin" />
                    </div>
                  )}
                </div>

                <Button
                  onClick={drawStick}
                  disabled={isDrawing}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-6 text-lg"
                >
                  {isDrawing ? '抽签中...' : '开始抽签'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* 签文显示 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30 overflow-hidden">
                {/* 签头 */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 py-4 text-center">
                  <div className="text-amber-100 text-lg">观音灵签</div>
                  <div className="text-amber-200 text-3xl font-bold">第 {result.number} 签</div>
                  <div className={`text-xl font-bold mt-1 ${getLevelColor(result.level)}`}>
                    {result.level}
                  </div>
                </div>

                <CardContent className="pt-6 space-y-6">
                  {/* 签题 */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-amber-100">{result.title}</h3>
                  </div>

                  {/* 签诗 */}
                  <div className="bg-amber-950/60 rounded-lg p-6 text-center">
                    <h4 className="text-sm font-bold text-amber-100 mb-3">签诗</h4>
                    <p className="text-xl text-amber-100 leading-loose whitespace-pre-line">
                      {result.poem}
                    </p>
                  </div>

                  {/* 解签 */}
                  <div className="bg-amber-950/60 rounded-lg p-6">
                    <h4 className="text-sm font-bold text-amber-100 mb-3">解签</h4>
                    <p className="text-amber-100 leading-relaxed">{result.meaning}</p>
                  </div>

                  {/* 签等级说明 */}
                  <div className="bg-gradient-to-r from-amber-900/60 to-orange-900/60 rounded-lg p-4 text-center border border-amber-400/30">
                    <p className="text-amber-100 text-sm">
                      此签为<strong className={getLevelColor(result.level)}>{result.level}</strong>
                      {result.level.includes('上上') && '，大吉大利，万事如意。'}
                      {result.level.includes('上吉') && '，运势上佳，宜积极进取。'}
                      {result.level.includes('中吉') && '，运势平稳，需努力经营。'}
                      {result.level.includes('中平') && '，安分守己，静待时机。'}
                      {result.level.includes('下下') && '，宜守不宜进，谨慎行事。'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 重新抽签 */}
              <div className="text-center">
                <Button
                  onClick={() => setResult(null)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-6 text-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  重新抽签
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
