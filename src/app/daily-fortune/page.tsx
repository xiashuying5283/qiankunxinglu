'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sun, Star, TrendingUp, Heart, Briefcase, Coins, Calendar, Clock, Compass, Sparkles, Bookmark, Moon, Info } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { Disclaimer } from '@/components/Disclaimer';
import { Solar, Lunar, LunarUtil } from 'lunar-javascript';
import { calculateZodiacFortune, getZodiacList, type ZodiacFortune, type ZodiacInfo } from '@/lib/zodiac-fortune-calculator';

// 十二生肖数据（从计算器获取）
const zodiacs = getZodiacList();

// 使用 ZodiacFortune 类型（从计算器导入）
type DailyFortune = ZodiacFortune;

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
  jiShen: string[];
  xiongSha: string[];
}

// generateFortune 函数已移除，改用 calculateZodiacFortune 真实计算

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
  
  // 吉时凶时（根据黄道黑道判断）
  const times = lunar.getTimes();
  const jiShi: string[] = [];
  const xiongShi: string[] = [];
  times.forEach(t => {
    const timeStr = t.getMinHm() + '-' + t.getMaxHm();
    const ganZhi = t.getGanZhi() + '时';
    const tianShenType = t.getTianShenType(); // 黄道或黑道
    if (tianShenType === '黄道') {
      jiShi.push(timeStr + ' ' + ganZhi);
    } else {
      xiongShi.push(timeStr + ' ' + ganZhi);
    }
  });
  
  // 值神（青龙、明堂等十二值神）
  const zhiShen = lunar.getZhiXing();
  
  // 冲煞
  const chong = '冲' + lunar.getDayChongShengXiao() + lunar.getDayChongDesc();
  const sha = lunar.getDaySha();
  
  // 彭祖百忌
  const pengZuGan = lunar.getPengZuGan();
  const pengZuZhi = lunar.getPengZuZhi();
  
  // 胎神
  const taiShen = lunar.getDayPositionTai();
  
  // 方位神煞
  const fuShen = lunar.getDayPositionFuDesc();
  const caiShen = lunar.getDayPositionCaiDesc();
  const xiShen = lunar.getDayPositionXiDesc();
  const yangGui = lunar.getDayPositionYangGuiDesc();
  const taiYang = yangGui; // 用阳贵代替
  
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
  
  // 吉神凶煞
  const jiShen = lunar.getDayJiShen();
  const xiongSha = lunar.getDayXiongSha();
  
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
    jiShen,
    xiongSha,
  };
};

// 生成运势（使用真实计算）
const generateFortune = (zodiac: ZodiacInfo, date: Date, huangLi: HuangLi): DailyFortune => {
  return calculateZodiacFortune(zodiac.name, date);
};

const STORAGE_KEY = 'daily-fortune-zodiac';

export default function DailyFortunePage() {
  const [selectedZodiac, setSelectedZodiac] = useState<ZodiacInfo | null>(null);
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

  const handleSelect = (zodiac: ZodiacInfo) => {
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

              {/* 运势分析 */}
              <Card className="bg-cyan-900/50 backdrop-blur-md border-cyan-400/50">
                <CardContent className="py-4">
                  <h4 className="font-bold text-cyan-100 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5" /> 运势分析
                  </h4>
                  <p className="text-cyan-100/90 text-sm leading-relaxed">{fortune.analysis}</p>
                  <p className="text-cyan-200/60 text-xs mt-2">
                    以上分析基于传统命理学，综合考量地支关系、五行生克、值神吉凶等因素。
                  </p>
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
