'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sun, Star, TrendingUp, Heart, Briefcase, Coins, Calendar, Clock, Compass, Sparkles, Bookmark, Moon } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { Disclaimer } from '@/components/Disclaimer';
import { Solar, Lunar, LunarUtil } from 'lunar-javascript';

// 十二生肖数据
const zodiacs = [
  { name: '鼠', emoji: '🐭', earthlyBranch: '子' },
  { name: '牛', emoji: '🐮', earthlyBranch: '丑' },
  { name: '虎', emoji: '🐯', earthlyBranch: '寅' },
  { name: '兔', emoji: '🐰', earthlyBranch: '卯' },
  { name: '龙', emoji: '🐲', earthlyBranch: '辰' },
  { name: '蛇', emoji: '🐍', earthlyBranch: '巳' },
  { name: '马', emoji: '🐴', earthlyBranch: '午' },
  { name: '羊', emoji: '🐏', earthlyBranch: '未' },
  { name: '猴', emoji: '🐵', earthlyBranch: '申' },
  { name: '鸡', emoji: '🐔', earthlyBranch: '酉' },
  { name: '狗', emoji: '🐶', earthlyBranch: '戌' },
  { name: '猪', emoji: '🐷', earthlyBranch: '亥' },
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
  healthScore: number;
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  advice: string;
}

// 精确的老黄历数据
interface HuangLi {
  dateStr: string;
  lunarDateStr: string;
  ganZhiYear: string;
  ganZhiMonth: string;
  ganZhiDay: string;
  wuXingYear: string;
  wuXingMonth: string;
  wuXingDay: string;
  zhiShen: string;
  chong: string;
  sha: string;
  yi: string[];
  ji: string[];
  jiShi: string[];
  xiongShi: string[];
  taiShen: string;
  pengZuGan: string;
  pengZuZhi: string;
  fuShen: string;
  caiShen: string;
  xiShen: string;
  yangGui: string;
  taiYang: string;
  jieQi: string;
  xingZuo: string;
  xingSu: string;
  erShiBaXiu: string;
  naYin: string;
  suiPo: string;
  yuePo: string;
}

// 根据日期生成伪随机数（用于运势部分，保持一致性）
const getSeededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// 使用 lunar-javascript 生成精确老黄历
const generateHuangLi = (date: Date): HuangLi => {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  // 干支
  const ganZhiYear = lunar.getYearInGanZhi();
  const ganZhiMonth = lunar.getMonthInGanZhi();
  const ganZhiDay = lunar.getDayInGanZhi();
  
  // 五行
  const wuXingYear = LunarUtil.WU_XING_GAN[lunar.getYearGan()] + LunarUtil.WU_XING_ZHI[lunar.getYearZhi()];
  const wuXingMonth = LunarUtil.WU_XING_GAN[lunar.getMonthGan()] + LunarUtil.WU_XING_ZHI[lunar.getMonthZhi()];
  const wuXingDay = LunarUtil.WU_XING_GAN[lunar.getDayGan()] + LunarUtil.WU_XING_ZHI[lunar.getDayZhi()];
  
  // 宜忌（从协纪辨方书提取的真数据）
  const yi = lunar.getDayYi();
  const ji = lunar.getDayJi();
  
  // 吉时凶时
  const jiShi = lunar.getDayJiShi().map(s => s.getMinHm().substring(0, 2) + ':' + s.getMaxHm().substring(0, 2) + ' ' + s.getNameInGanZhi() + '时');
  const xiongShi = lunar.getDayXiongShi().map(s => s.getMinHm().substring(0, 2) + ':' + s.getMaxHm().substring(0, 2) + ' ' + s.getNameInGanZhi() + '时');
  
  // 值神（青龙、明堂等十二值神）
  const zhiShen = lunar.getZhiXing();
  
  // 冲煞
  const chong = lunar.getDayChong() + '(' + lunar.getDayChongGanZhi() + ')';
  const sha = lunar.getDaySha();
  
  // 彭祖百忌
  const pengZuGan = lunar.getPengZuGan();
  const pengZuZhi = lunar.getPengZuZhi();
  
  // 胎神
  const taiShen = lunar.getDayTaiShen();
  
  // 方位神煞
  const fuShen = lunar.getFuShen();
  const caiShen = lunar.getCaiShen();
  const xiShen = lunar.getXiShen();
  const yangGui = lunar.getYangGui();
  const taiYang = lunar.getTaiYang();
  
  // 节气
  const jieQi = lunar.getPrevJieQi()?.getName() || '';
  
  // 星座
  const xingZuo = solar.getXingZuo();
  
  // 星宿
  const xingSu = lunar.getXiu();
  
  // 二十八宿
  const erShiBaXiu = lunar.getXiuSong();
  
  // 纳音
  const naYin = lunar.getYearNaYin() + ' ' + lunar.getMonthNaYin() + ' ' + lunar.getDayNaYin();
  
  // 岁破、月破
  const suiPo = lunar.getYearPo();
  const yuePo = lunar.getMonthPo();
  
  return {
    dateStr: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
    lunarDateStr: lunar.toString(),
    ganZhiYear: ganZhiYear + '年',
    ganZhiMonth: ganZhiMonth + '月',
    ganZhiDay: ganZhiDay + '日',
    wuXingYear,
    wuXingMonth,
    wuXingDay,
    zhiShen,
    chong,
    sha,
    yi: yi.slice(0, 12), // 限制显示数量
    ji: ji.slice(0, 8),
    jiShi: jiShi.slice(0, 4),
    xiongShi: xiongShi.slice(0, 3),
    taiShen,
    pengZuGan,
    pengZuZhi,
    fuShen,
    caiShen,
    xiShen,
    yangGui,
    taiYang,
    jieQi,
    xingZuo,
    xingSu,
    erShiBaXiu,
    naYin,
    suiPo,
    yuePo,
  };
};

// 生成运势
const generateFortune = (zodiac: typeof zodiacs[0], date: Date, huangLi: HuangLi): DailyFortune => {
  const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const zodiacIndex = zodiacs.findIndex(z => z.name === zodiac.name);
  const seed = dateSeed + zodiacIndex;

  const pickRandom = (arr: string[]) => arr[Math.floor(getSeededRandom(seed * arr.length) * arr.length)];
  const pickScore = (base: number) => Math.floor(getSeededRandom(seed * base) * 5) + 1;
  
  // 根据值神调整运势基础分
  const zhiShenBonus: Record<string, number> = {
    '青龙': 1, '明堂': 1, '金匮': 1, '天德': 1, '玉堂': 1, '司命': 1,
    '天刑': -1, '朱雀': -1, '白虎': -1, '天牢': -1, '玄武': -1, '勾陈': -1,
  };
  const bonus = zhiShenBonus[huangLi.zhiShen] || 0;
  
  const overallScore = Math.min(5, Math.max(1, pickScore(1) + bonus));
  
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

  return {
    zodiac,
    overall: pickRandom(fortunes.overall),
    overallScore,
    career: pickRandom(fortunes.career),
    careerScore: Math.min(5, Math.max(1, pickScore(2) + bonus)),
    love: pickRandom(fortunes.love),
    loveScore: Math.min(5, Math.max(1, pickScore(3) + bonus)),
    wealth: pickRandom(fortunes.wealth),
    wealthScore: Math.min(5, Math.max(1, pickScore(4) + bonus)),
    health: pickRandom(fortunes.health),
    healthScore: pickScore(5),
    luckyColor: pickRandom(luckyElements.colors),
    luckyNumber: pickRandom(luckyElements.numbers),
    luckyDirection: pickRandom(luckyElements.directions),
    advice: pickRandom(adviceList),
  };
};

const STORAGE_KEY = 'daily-fortune-zodiac';

export default function DailyFortunePage() {
  const [selectedZodiac, setSelectedZodiac] = useState<typeof zodiacs[0] | null>(null);
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [huangLi, setHuangLi] = useState<HuangLi | null>(null);
  const [rememberZodiac, setRememberZodiac] = useState(false);
  const [showZodiacSelector, setShowZodiacSelector] = useState(true);

  // 页面加载时读取存储的生肖
  useEffect(() => {
    const savedZodiacName = localStorage.getItem(STORAGE_KEY);
    if (savedZodiacName) {
      const savedZodiac = zodiacs.find(z => z.name === savedZodiacName);
      if (savedZodiac) {
        setSelectedZodiac(savedZodiac);
        setRememberZodiac(true);
        setShowZodiacSelector(false);
        const today = new Date();
        const hl = generateHuangLi(today);
        setHuangLi(hl);
        setFortune(generateFortune(savedZodiac, today, hl));
      }
    }
  }, []);

  // 保存/清除生肖偏好
  useEffect(() => {
    if (rememberZodiac && selectedZodiac) {
      localStorage.setItem(STORAGE_KEY, selectedZodiac.name);
    } else if (!rememberZodiac) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [rememberZodiac, selectedZodiac]);

  const handleSelect = (zodiac: typeof zodiacs[0]) => {
    setSelectedZodiac(zodiac);
    setShowZodiacSelector(false);
    const today = new Date();
    const hl = generateHuangLi(today);
    setHuangLi(hl);
    setFortune(generateFortune(zodiac, today, hl));
    setRememberZodiac(true);
  };

  const handleReset = () => {
    setShowZodiacSelector(true);
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
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-sky-200 hover:text-sky-100 hover:bg-white/10">
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
            <Sun className="w-10 h-10 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-bold text-sky-100">每日运势</h1>
            <Sun className="w-10 h-10 text-yellow-400 ml-3" />
          </div>
          <p className="text-sky-200/80">精确老黄历 · 十二生肖运势 · 今日宜忌</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* 生肖选择 */}
          {showZodiacSelector && (
            <Card className="bg-sky-800/40 backdrop-blur-md border-sky-400/40">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">选择您的生肖</CardTitle>
                <CardDescription className="text-sky-100">
                  点击生肖查看今日详细运势与老黄历
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {zodiacs.map((zodiac) => (
                    <button
                      key={zodiac.name}
                      onClick={() => handleSelect(zodiac)}
                      className="flex flex-col items-center p-4 rounded-lg bg-sky-700/40 hover:bg-sky-600/50 transition-all hover:scale-105 border border-sky-400/30 hover:border-sky-300/50"
                    >
                      <span className="text-3xl mb-1">{zodiac.emoji}</span>
                      <span className="text-sm text-white font-medium">{zodiac.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 运势结果 */}
          {selectedZodiac && fortune && huangLi && !showZodiacSelector && (
            <div className="space-y-6">
              {/* 老黄历头部 */}
              <Card className="bg-gradient-to-r from-red-900/70 to-orange-900/70 backdrop-blur-md border-red-400/50">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Calendar className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">老黄历</h2>
                  </div>
                  
                  {/* 公历农历 */}
                  <div className="text-center mb-4">
                    <p className="text-yellow-100 text-lg">{huangLi.dateStr}</p>
                    <p className="text-yellow-200/80 mt-1 flex items-center justify-center gap-2">
                      <Moon className="w-4 h-4" />
                      {huangLi.lunarDateStr}
                      {huangLi.jieQi && <span className="text-green-300">· {huangLi.jieQi}</span>}
                    </p>
                  </div>
                  
                  {/* 干支纪年 */}
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <span className="bg-red-800/60 px-3 py-1.5 rounded text-yellow-100 font-medium">{huangLi.ganZhiYear}</span>
                      <span className="bg-red-800/60 px-3 py-1.5 rounded text-yellow-100 font-medium">{huangLi.ganZhiMonth}</span>
                      <span className="bg-red-800/60 px-3 py-1.5 rounded text-yellow-100 font-medium">{huangLi.ganZhiDay}</span>
                    </div>
                  </div>
                  
                  {/* 基本信息 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-200/80 mb-1">值神</p>
                      <p className="font-bold text-white">{huangLi.zhiShen}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-200/80 mb-1">日冲</p>
                      <p className="font-bold text-white">{huangLi.chong}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-200/80 mb-1">日煞</p>
                      <p className="font-bold text-white">{huangLi.sha}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-200/80 mb-1">星宿</p>
                      <p className="font-bold text-white">{huangLi.xingSu}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 今日宜忌 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 宜 */}
                <Card className="bg-green-800/50 backdrop-blur-md border-green-400/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-100 flex items-center gap-2">
                      <span className="text-2xl">✓</span> 今日宜
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {huangLi.yi.length > 0 ? huangLi.yi.map((item, i) => (
                        <span key={i} className="bg-green-700/50 px-3 py-1 rounded-full text-green-100 text-sm">
                          {item}
                        </span>
                      )) : <span className="text-green-200/60 text-sm">今日诸事不宜</span>}
                    </div>
                  </CardContent>
                </Card>

                {/* 忌 */}
                <Card className="bg-red-800/50 backdrop-blur-md border-red-400/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-red-100 flex items-center gap-2">
                      <span className="text-2xl">✗</span> 今日忌
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {huangLi.ji.length > 0 ? huangLi.ji.map((item, i) => (
                        <span key={i} className="bg-red-700/50 px-3 py-1 rounded-full text-red-100 text-sm">
                          {item}
                        </span>
                      )) : <span className="text-red-200/60 text-sm">今日百无禁忌</span>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 吉时凶时 */}
              <Card className="bg-sky-800/40 backdrop-blur-md border-sky-400/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" /> 吉时凶时
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-green-300 text-sm mb-2 flex items-center gap-1">
                        <span>🕐</span> 吉时（宜办重要之事）
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {huangLi.jiShi.length > 0 ? huangLi.jiShi.map((item, i) => (
                          <span key={i} className="bg-green-700/50 px-3 py-1 rounded text-green-100 text-sm">
                            {item}
                          </span>
                        )) : <span className="text-green-200/60 text-sm">今日无吉时</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-red-300 text-sm mb-2 flex items-center gap-1">
                        <span>⏰</span> 凶时（宜静不宜动）
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {huangLi.xiongShi.length > 0 ? huangLi.xiongShi.map((item, i) => (
                          <span key={i} className="bg-red-700/50 px-3 py-1 rounded text-red-100 text-sm">
                            {item}
                          </span>
                        )) : <span className="text-red-200/60 text-sm">今日无凶时</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 方位吉凶 */}
              <Card className="bg-sky-800/40 backdrop-blur-md border-sky-400/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Compass className="w-5 h-5" /> 方位神煞
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                    <div className="bg-yellow-900/40 rounded-lg p-3">
                      <p className="text-xs text-yellow-200/80 mb-1">财神</p>
                      <p className="font-bold text-yellow-100">{huangLi.caiShen}</p>
                    </div>
                    <div className="bg-purple-900/40 rounded-lg p-3">
                      <p className="text-xs text-purple-200/80 mb-1">福神</p>
                      <p className="font-bold text-purple-100">{huangLi.fuShen}</p>
                    </div>
                    <div className="bg-pink-900/40 rounded-lg p-3">
                      <p className="text-xs text-pink-200/80 mb-1">喜神</p>
                      <p className="font-bold text-pink-100">{huangLi.xiShen}</p>
                    </div>
                    <div className="bg-blue-900/40 rounded-lg p-3">
                      <p className="text-xs text-blue-200/80 mb-1">阳贵</p>
                      <p className="font-bold text-blue-100">{huangLi.yangGui}</p>
                    </div>
                    <div className="bg-orange-900/40 rounded-lg p-3">
                      <p className="text-xs text-orange-200/80 mb-1">太阴</p>
                      <p className="font-bold text-orange-100">{huangLi.taiYang}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 生肖运势 */}
              <Card className="bg-sky-800/40 backdrop-blur-md border-sky-400/40">
                <CardContent className="py-6">
                  <div className="text-center mb-6">
                    <span className="text-5xl mb-2 block">{fortune.zodiac.emoji}</span>
                    <h2 className="text-2xl font-bold text-white">{fortune.zodiac.name}生肖今日运势</h2>
                    
                    {/* 记住生肖选项 */}
                    <label className="flex items-center justify-center gap-2 mt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberZodiac}
                        onChange={(e) => setRememberZodiac(e.target.checked)}
                        className="w-4 h-4 rounded border-sky-400"
                      />
                      <span className="text-sm text-sky-200 flex items-center gap-1">
                        <Bookmark className="w-4 h-4" />
                        记住我的生肖
                      </span>
                    </label>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 rounded-lg">
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
                <Card className="bg-sky-800/40 backdrop-blur-md border-sky-400/40">
                  <CardContent className="py-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                        <span className="font-bold text-white">事业运</span>
                      </div>
                      <StarRating score={fortune.careerScore} />
                    </div>
                    <p className="text-sky-100 text-sm">{fortune.career}</p>
                  </CardContent>
                </Card>

                {/* 爱情运 */}
                <Card className="bg-sky-800/40 backdrop-blur-md border-sky-400/40">
                  <CardContent className="py-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        <span className="font-bold text-white">爱情运</span>
                      </div>
                      <StarRating score={fortune.loveScore} />
                    </div>
                    <p className="text-sky-100 text-sm">{fortune.love}</p>
                  </CardContent>
                </Card>

                {/* 财运 */}
                <Card className="bg-sky-800/40 backdrop-blur-md border-sky-400/40">
                  <CardContent className="py-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold text-white">财运</span>
                      </div>
                      <StarRating score={fortune.wealthScore} />
                    </div>
                    <p className="text-sky-100 text-sm">{fortune.wealth}</p>
                  </CardContent>
                </Card>

                {/* 健康运 */}
                <Card className="bg-sky-800/40 backdrop-blur-md border-sky-400/40">
                  <CardContent className="py-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="font-bold text-white">健康运</span>
                      </div>
                      <StarRating score={fortune.healthScore} />
                    </div>
                    <p className="text-sky-100 text-sm">{fortune.health}</p>
                  </CardContent>
                </Card>
              </div>

              {/* 幸运元素 */}
              <Card className="bg-sky-800/40 backdrop-blur-md border-sky-400/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" /> 今日幸运元素
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-center">
                    <div className="bg-sky-950/60 rounded-lg p-4">
                      <div className="text-2xl mb-1">🎨</div>
                      <div className="text-xs text-sky-200/80 mb-1">幸运颜色</div>
                      <div className="font-bold text-white">{fortune.luckyColor}</div>
                    </div>
                    <div className="bg-sky-950/60 rounded-lg p-4">
                      <div className="text-2xl mb-1">🔢</div>
                      <div className="text-xs text-sky-200/80 mb-1">幸运数字</div>
                      <div className="font-bold text-white">{fortune.luckyNumber}</div>
                    </div>
                    <div className="bg-sky-950/60 rounded-lg p-4">
                      <div className="text-2xl mb-1">🧭</div>
                      <div className="text-xs text-sky-200/80 mb-1">幸运方位</div>
                      <div className="font-bold text-white">{fortune.luckyDirection}</div>
                    </div>
                    <div className="bg-sky-950/60 rounded-lg p-4">
                      <div className="text-2xl mb-1">⭐</div>
                      <div className="text-xs text-sky-200/80 mb-1">星座</div>
                      <div className="font-bold text-white">{huangLi.xingZuo}</div>
                    </div>
                    <div className="bg-sky-950/60 rounded-lg p-4">
                      <div className="text-2xl mb-1">🌟</div>
                      <div className="text-xs text-sky-200/80 mb-1">纳音</div>
                      <div className="font-bold text-white text-sm">{huangLi.naYin.split(' ')[2]}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 彭祖百忌 */}
              <Card className="bg-amber-900/50 backdrop-blur-md border-amber-400/50">
                <CardContent className="py-4">
                  <h4 className="font-bold text-amber-100 mb-2 flex items-center gap-2">
                    <span>📜</span> 彭祖百忌
                  </h4>
                  <p className="text-amber-100/90 text-sm leading-relaxed">
                    {huangLi.pengZuGan}。{huangLi.pengZuZhi}。
                  </p>
                </CardContent>
              </Card>

              {/* 二十八宿 */}
              <Card className="bg-indigo-900/50 backdrop-blur-md border-indigo-400/50">
                <CardContent className="py-4">
                  <h4 className="font-bold text-indigo-100 mb-2 flex items-center gap-2">
                    <span>🌟</span> 二十八宿
                  </h4>
                  <p className="text-indigo-100/90 text-sm leading-relaxed">{huangLi.erShiBaXiu}</p>
                </CardContent>
              </Card>

              {/* 今日建议 */}
              <Card className="bg-gradient-to-r from-sky-700/60 to-blue-700/60 border-sky-400/40">
                <CardContent className="py-4">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <span>💡</span> 今日建议
                  </h4>
                  <p className="text-white/90">{fortune.advice}</p>
                </CardContent>
              </Card>

              {/* 重新选择 */}
              <div className="text-center pt-4">
                <Button
                  onClick={handleReset}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-2 font-medium"
                >
                  选择其他生肖
                </Button>
              </div>

              {/* 免责声明 */}
              <Disclaimer variant="compact" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
