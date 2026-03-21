'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Compass, Calendar, Clock, BookOpen, Sparkles, ChevronRight, Info, RotateCcw } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Disclaimer } from '@/components/Disclaimer';
import { SliderCaptcha } from '@/components/ui/slider-captcha';
import { Lunar, Solar } from 'lunar-javascript';

// 九宫位置
const PALACE_POSITIONS = [
  { name: '巽宫', row: 0, col: 0, direction: '东南' },
  { name: '离宫', row: 0, col: 1, direction: '正南' },
  { name: '坤宫', row: 0, col: 2, direction: '西南' },
  { name: '震宫', row: 1, col: 0, direction: '正东' },
  { name: '中宫', row: 1, col: 1, direction: '中宫' },
  { name: '兑宫', row: 1, col: 2, direction: '正西' },
  { name: '艮宫', row: 2, col: 0, direction: '东北' },
  { name: '坎宫', row: 2, col: 1, direction: '正北' },
  { name: '乾宫', row: 2, col: 2, direction: '西北' },
];

// 九星
const NINE_STARS = [
  { name: '天蓬', element: '水', property: '凶', meaning: '盗贼、暗昧、欺诈' },
  { name: '天芮', element: '土', property: '凶', meaning: '疾病、阻滞、犹豫' },
  { name: '天冲', element: '木', property: '吉', meaning: '冲动、进取、竞争' },
  { name: '天辅', element: '木', property: '吉', meaning: '辅佐、文才、教育' },
  { name: '天禽', element: '土', property: '吉', meaning: '中正、稳定、权威' },
  { name: '天心', element: '金', property: '吉', meaning: '心计、医疗、领导' },
  { name: '天柱', element: '金', property: '凶', meaning: '惊恐、破坏、口舌' },
  { name: '天任', element: '土', property: '吉', meaning: '任劳任怨、诚信' },
  { name: '天英', element: '火', property: '凶', meaning: '火灾、血光、暴躁' },
];

// 八门
const EIGHT_DOORS = [
  { name: '休门', element: '水', property: '吉', meaning: '休息、养生、安逸' },
  { name: '生门', element: '土', property: '吉', meaning: '生发、创业、财运' },
  { name: '伤门', element: '木', property: '凶', meaning: '伤害、破财、争斗' },
  { name: '杜门', element: '木', property: '中', meaning: '杜绝、隐藏、阻隔' },
  { name: '景门', element: '火', property: '中', meaning: '光明、文书、谋划' },
  { name: '死门', element: '土', property: '凶', meaning: '死亡、闭塞、不动' },
  { name: '惊门', element: '金', property: '凶', meaning: '惊恐、口舌、官司' },
  { name: '开门', element: '金', property: '吉', meaning: '开放、通达、升迁' },
];

// 八神
const EIGHT_GODS = [
  { name: '值符', property: '吉', meaning: '领导、贵人、正直' },
  { name: '腾蛇', property: '凶', meaning: '虚惊、怪异、缠绕' },
  { name: '太阴', property: '吉', meaning: '阴私、暗谋、女性' },
  { name: '六合', property: '吉', meaning: '合作、婚姻、和合' },
  { name: '白虎', property: '凶', meaning: '凶猛、血光、道路' },
  { name: '玄武', property: '凶', meaning: '盗贼、欺骗、暗昧' },
  { name: '九地', property: '吉', meaning: '柔顺、潜藏、坚固' },
  { name: '九天', property: '吉', meaning: '刚健、张扬、远行' },
];

// 十天干
const TEN_STEMS = [
  { name: '甲', element: '木', meaning: '首领、栋梁、开创' },
  { name: '乙', element: '木', meaning: '花草、柔顺、艺术' },
  { name: '丙', element: '火', meaning: '太阳、光明、热烈' },
  { name: '丁', element: '火', meaning: '星火、文书、神秘' },
  { name: '戊', element: '土', meaning: '城墙、厚重、财富' },
  { name: '己', element: '土', meaning: '田园、包容、蓄积' },
  { name: '庚', element: '金', meaning: '刀剑、变革、阻碍' },
  { name: '辛', element: '金', meaning: '珠宝、变革、刑狱' },
  { name: '壬', element: '水', meaning: '江河、流动、智慧' },
  { name: '癸', element: '水', meaning: '雨露、滋润、隐秘' },
];

// 十二地支
const TWELVE_BRANCHES = [
  { name: '子', animal: '鼠', direction: '北' },
  { name: '丑', animal: '牛', direction: '东北' },
  { name: '寅', animal: '虎', direction: '东北' },
  { name: '卯', animal: '兔', direction: '东' },
  { name: '辰', animal: '龙', direction: '东南' },
  { name: '巳', animal: '蛇', direction: '东南' },
  { name: '午', animal: '马', direction: '南' },
  { name: '未', animal: '羊', direction: '西南' },
  { name: '申', animal: '猴', direction: '西南' },
  { name: '酉', animal: '鸡', direction: '西' },
  { name: '戌', animal: '狗', direction: '西北' },
  { name: '亥', animal: '猪', direction: '西北' },
];

interface QimenResult {
  dateStr: string;
  lunarDateStr: string;
  ganZhiYear: string;
  ganZhiMonth: string;
  ganZhiDay: string;
  ganZhiHour: string;
  ju: string; // 局数
  juType: string; // 阴阳遁
  yuan: string; // 元
  dun: string; // 遁
  palace: { [key: string]: { star: typeof NINE_STARS[0], door: typeof EIGHT_DOORS[0], god: typeof EIGHT_GODS[0], stems: string[] } };
  interpretation: string;
}

// 简化的奇门遁甲排盘算法
function calculateQimen(date: Date): QimenResult {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  // 获取干支
  const ganZhiYear = lunar.getYearInGanZhi();
  const ganZhiMonth = lunar.getMonthInGanZhi();
  const ganZhiDay = lunar.getDayInGanZhi();
  const ganZhiHour = lunar.getTimeInGanZhi();
  
  // 日干支
  const dayGan = lunar.getDayGan();
  const dayZhi = lunar.getDayZhi();
  
  // 确定阴阳遁
  // 冬至到夏至为阳遁，夏至到冬至为阴遁
  const jieQi = lunar.getPrevJieQi()?.getName() || '';
  const isYang = isYangDun(lunar);
  
  // 确定局数（简化算法）
  const juNumber = calculateJu(lunar, isYang);
  
  // 确定元
  const yuan = calculateYuan(dayZhi);
  
  // 布局九宫
  const palace = layoutPalace(juNumber, isYang, dayGan);
  
  // 综合解读
  const interpretation = generateInterpretation(palace, isYang, juNumber);
  
  return {
    dateStr: solar.toString(),
    lunarDateStr: lunar.toString(),
    ganZhiYear,
    ganZhiMonth,
    ganZhiDay,
    ganZhiHour,
    ju: `${juNumber}局`,
    juType: isYang ? '阳遁' : '阴遁',
    yuan,
    dun: isYang ? '阳遁' : '阴遁',
    palace,
    interpretation,
  };
}

// 判断是否阳遁
function isYangDun(lunar: any): boolean {
  // 简化判断：冬至（12月22日左右）到夏至（6月21日左右）为阳遁
  const jieQi = lunar.getPrevJieQi()?.getName() || '';
  const yangJieQi = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种'];
  return yangJieQi.includes(jieQi);
}

// 计算局数
function calculateJu(lunar: any, isYang: boolean): number {
  // 简化算法：根据节气和上中下元确定
  const jieQi = lunar.getPrevJieQi()?.getName() || '';
  
  // 节气对应局数表（简化）
  const jieQiJuMap: { [key: string]: number } = {
    '冬至': 1, '小寒': 2, '大寒': 3,
    '立春': 8, '雨水': 9, '惊蛰': 1,
    '春分': 3, '清明': 4, '谷雨': 5,
    '立夏': 4, '小满': 5, '芒种': 6,
    '夏至': 9, '小暑': 8, '大暑': 7,
    '立秋': 2, '处暑': 1, '白露': 9,
    '秋分': 7, '寒露': 6, '霜降': 5,
    '立冬': 6, '小雪': 5, '大雪': 4,
  };
  
  let ju = jieQiJuMap[jieQi] || 5;
  
  // 根据日干支调整
  const dayGan = lunar.getDayGan();
  const ganIndex = TEN_STEMS.findIndex(g => g.name === dayGan);
  if (ganIndex !== -1) {
    ju = ((ju + ganIndex - 1) % 9) || 9;
  }
  
  return ju;
}

// 计算元
function calculateYuan(dayZhi: string): string {
  const shangYuan = ['子', '卯', '午', '酉'];
  const zhongYuan = ['寅', '巳', '申', '亥'];
  const xiaYuan = ['丑', '辰', '未', '戌'];
  
  if (shangYuan.includes(dayZhi)) return '上元';
  if (zhongYuan.includes(dayZhi)) return '中元';
  if (xiaYuan.includes(dayZhi)) return '下元';
  return '中元';
}

// 布局九宫
function layoutPalace(juNumber: number, isYang: boolean, dayGan: string): QimenResult['palace'] {
  const palace: QimenResult['palace'] = {};
  
  // 根据局数确定值符落宫
  const valueFuPositions: { [key: number]: string } = {
    1: '坎宫', 2: '坤宫', 3: '震宫', 4: '巽宫',
    5: '中宫', 6: '乾宫', 7: '兑宫', 8: '艮宫', 9: '离宫',
  };
  
  // 分配九星、八门、八神到各宫
  PALACE_POSITIONS.forEach((pos, index) => {
    const starIndex = (index + juNumber - 1) % 9;
    const doorIndex = (index + juNumber) % 8;
    const godIndex = (index + juNumber + 1) % 8;
    
    palace[pos.name] = {
      star: NINE_STARS[starIndex],
      door: EIGHT_DOORS[doorIndex],
      god: EIGHT_GODS[godIndex],
      stems: [TEN_STEMS[(index + juNumber) % 10].name, TEN_STEMS[(index + juNumber + 5) % 10].name],
    };
  });
  
  return palace;
}

// 生成综合解读
function generateInterpretation(palace: QimenResult['palace'], isYang: boolean, juNumber: number): string {
  // 分析各宫吉凶
  let jiCount = 0;
  let xiongCount = 0;
  
  Object.values(palace).forEach(p => {
    if (p.star.property === '吉') jiCount++;
    if (p.star.property === '凶') xiongCount++;
    if (p.door.property === '吉') jiCount++;
    if (p.door.property === '凶') xiongCount++;
    if (p.god.property === '吉') jiCount++;
    if (p.god.property === '凶') xiongCount++;
  });
  
  let interpretation = `【${isYang ? '阳遁' : '阴遁'}${juNumber}局】\n\n`;
  
  if (jiCount > xiongCount * 1.5) {
    interpretation += '整体格局偏吉，利于进取。';
    interpretation += '\n\n【事业】有贵人相助，可把握机会推进项目。';
    interpretation += '\n\n【财运】财星得位，可尝试新的投资机会。';
    interpretation += '\n\n【感情】情感和谐，适合表白或增进感情。';
  } else if (xiongCount > jiCount * 1.5) {
    interpretation += '整体格局偏凶，宜守不宜攻。';
    interpretation += '\n\n【事业】阻碍较多，需谨慎行事，不宜冒进。';
    interpretation += '\n\n【财运】财星受阻，不宜大额投资，以守成为主。';
    interpretation += '\n\n【感情】情感波折，需多沟通，避免误会。';
  } else {
    interpretation += '整体格局平稳，吉凶参半。';
    interpretation += '\n\n【事业】有起有落，需把握时机，稳中求进。';
    interpretation += '\n\n【财运】财运平稳，可小试身手，不宜贪大。';
    interpretation += '\n\n【感情】感情平稳，需用心经营。';
  }
  
  interpretation += '\n\n【今日宜】规划、学习、思考、修身';
  interpretation += '\n\n【今日忌】冒进、争执、投机、远行';
  
  return interpretation;
}

export default function QimenPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [result, setResult] = useState<QimenResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('result');

  const handleVerified = async () => {
    setIsVerified(true);
    setIsLoading(true);
    
    // 模拟排盘计算
    setTimeout(() => {
      const qimenResult = calculateQimen(new Date());
      setResult(qimenResult);
      setIsLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    setIsVerified(false);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-amber-500/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 group-hover:border-amber-400 transition-colors" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500 group-hover:bg-amber-400 transition-colors" />
            </div>
            <span className="text-xl font-bold text-amber-100 group-hover:text-amber-50 transition-colors">
              乾坤星路
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Compass className="w-10 h-10 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold text-amber-100">奇门遁甲</h1>
            <Compass className="w-10 h-10 text-amber-500 ml-3" />
          </div>
          <p className="text-gray-400">帝王之学 · 运筹帷幄</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* 验证区域 */}
          {!isVerified && (
            <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-amber-100 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  奇门遁甲排盘
                </CardTitle>
                <CardDescription className="text-gray-500">
                  请先完成验证，开启奇门遁甲之旅
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <SliderCaptcha onVerify={handleVerified} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 加载中 */}
          {isLoading && (
            <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
              <CardContent className="py-12 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
                <p className="text-gray-400">正在排盘中...</p>
              </CardContent>
            </Card>
          )}

          {/* 结果展示 */}
          {result && !isLoading && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-500/20">
                <CardContent className="py-6">
                  <div className="text-center mb-4">
                    <p className="text-gray-200 text-lg">{result.dateStr}</p>
                    <p className="text-gray-400 mt-1">{result.lunarDateStr}</p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
                    <span className="bg-amber-900/40 border border-amber-500/30 px-3 py-1.5 rounded text-gray-200 font-medium">{result.ganZhiYear}年</span>
                    <span className="bg-amber-900/40 border border-amber-500/30 px-3 py-1.5 rounded text-gray-200 font-medium">{result.ganZhiMonth}月</span>
                    <span className="bg-amber-900/40 border border-amber-500/30 px-3 py-1.5 rounded text-gray-200 font-medium">{result.ganZhiDay}日</span>
                    <span className="bg-amber-900/40 border border-amber-500/30 px-3 py-1.5 rounded text-gray-200 font-medium">{result.ganZhiHour}时</span>
                  </div>
                  
                  <div className="text-center">
                    <Badge className="bg-amber-500 text-black text-lg px-4 py-2">
                      {result.juType} {result.ju} · {result.yuan}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 九宫图 */}
              <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100 flex items-center gap-2">
                    <Compass className="w-5 h-5" />
                    九宫布局
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {PALACE_POSITIONS.map((pos) => {
                      const palaceData = result.palace[pos.name];
                      return (
                        <div
                          key={pos.name}
                          className={`aspect-square border border-amber-500/20 rounded-lg p-2 ${
                            pos.name === '中宫' ? 'bg-amber-900/20' : 'bg-[#0a0a0a]'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-1">{pos.direction}</div>
                            <div className="text-sm font-bold text-amber-500 mb-1">{pos.name}</div>
                            {palaceData && (
                              <>
                                <div className={`text-xs ${
                                  palaceData.star.property === '吉' ? 'text-green-400' : 
                                  palaceData.star.property === '凶' ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                  ★{palaceData.star.name}
                                </div>
                                <div className={`text-xs ${
                                  palaceData.door.property === '吉' ? 'text-green-400' : 
                                  palaceData.door.property === '凶' ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                  门:{palaceData.door.name}
                                </div>
                                <div className={`text-xs ${
                                  palaceData.god.property === '吉' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  神:{palaceData.god.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {palaceData.stems.join(' ')}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 详细解读 */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a] border border-amber-500/20">
                  <TabsTrigger value="result" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-100 text-gray-400">
                    综合解读
                  </TabsTrigger>
                  <TabsTrigger value="stars" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-100 text-gray-400">
                    九星详解
                  </TabsTrigger>
                  <TabsTrigger value="doors" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-100 text-gray-400">
                    八门详解
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="result">
                  <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
                    <CardContent className="py-6">
                      <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed font-sans">
                        {result.interpretation}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stars">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {NINE_STARS.map((star) => (
                      <Card key={star.name} className="bg-[#1a1a1a]/50 border-amber-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-amber-100">{star.name}</CardTitle>
                            <Badge className={
                              star.property === '吉' ? 'bg-green-500/20 text-green-300' :
                              star.property === '凶' ? 'bg-red-500/20 text-red-300' :
                              'bg-amber-500/20 text-amber-300'
                            }>
                              {star.property}星
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-400">{star.meaning}</p>
                          <p className="text-xs text-gray-500 mt-2">五行：{star.element}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="doors">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {EIGHT_DOORS.map((door) => (
                      <Card key={door.name} className="bg-[#1a1a1a]/50 border-amber-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-amber-100">{door.name}</CardTitle>
                            <Badge className={
                              door.property === '吉' ? 'bg-green-500/20 text-green-300' :
                              door.property === '凶' ? 'bg-red-500/20 text-red-300' :
                              'bg-amber-500/20 text-amber-300'
                            }>
                              {door.property}门
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-400">{door.meaning}</p>
                          <p className="text-xs text-gray-500 mt-2">五行：{door.element}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* 重新排盘 */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重新排盘
                </Button>
              </div>
            </div>
          )}

          {/* 奇门遁甲简介 */}
          <Card className="bg-[#1a1a1a]/50 border-amber-500/20 mt-6">
            <CardHeader>
              <CardTitle className="text-xl text-amber-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                奇门遁甲简介
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 leading-relaxed">
              <p className="mb-4">
                奇门遁甲是中国古代最高层次的预测学，被誉为"帝王之学"。它融合了天文、地理、历法、阴阳五行学说，
                是中国古代术数中最为高深的学问之一。
              </p>
              <p className="mb-4">
                <strong className="text-amber-400">"奇"</strong>指三奇（乙、丙、丁），
                <strong className="text-amber-400">"门"</strong>指八门（休、生、伤、杜、景、死、惊、开），
                <strong className="text-amber-400">"遁甲"</strong>指将甲木隐藏于六仪之下。
              </p>
              <p className="mb-4">
                奇门遁甲以九宫为框架，结合天干地支、九星、八门、八神等要素，
                推演天地人三才的变化，用于择时、择方、决策等。
              </p>
              <div className="bg-amber-900/20 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-300">
                  <Info className="w-4 h-4 inline mr-1" />
                  本页面仅供民俗文化学习参考，不构成任何决策依据。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 免责声明 */}
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
