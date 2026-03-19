'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sun, Star, TrendingUp, Heart, Briefcase, Coins, Calendar, Clock, Compass, Sparkles, Bookmark } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { Disclaimer } from '@/components/Disclaimer';

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

// 天干地支
const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 宜忌事项库
const yiItems = [
  '祈福', '祭祀', '求嗣', '开光', '出行', '解除', '纳采', '冠笄',
  '嫁娶', '纳婿', '安床', '移徙', '入宅', '安香', '拆卸', '动土',
  '挂匾', '开市', '立券', '纳财', '沐浴', '理发', '安门', '修造',
  '盖屋', '合脊', '起基', '定磉', '安碓硙', '放水', '掘井', '破土',
  '安葬', '启钻', '除服', '成服', '开生坟', '合寿木', '入殓', '移柩',
];

const jiItems = [
  '嫁娶', '安葬', '出行', '动土', '开市', '入宅', '移徙', '祭祀',
  '祈福', '开光', '纳采', '安床', '掘井', '破土', '诉讼', '作灶',
];

// 值神
const zhiShen = ['青龙', '明堂', '天刑', '朱雀', '金匮', '天德', '白虎', '玉堂', '天牢', '玄武', '司命', '勾陈'];

// 吉时
const jiShiList = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

// 胎神方位
const taiShenFangWei = [
  '占门碓外东南', '占碓磨外东南', '占炉外东南', '占门炉外西北', '占门鸡栖外西北',
  '占门床房内南', '占碓磨房内北', '占门厕外正南', '占门碓外东南', '占房床内西北',
];

// 彭祖百忌
const pengZuBaiJi = [
  '甲不开仓财物耗散', '乙不栽植千株不长', '丙不修灶必见灾殃', '丁不剃头头必生疮',
  '戊不受田田主不祥', '己不破券二比并亡', '庚不经络织机虚张', '辛不合酱主人不尝',
  '壬不泱水更难提防', '癸不词讼理弱敌强', '子不问卜自惹祸殃', '丑不冠带主不还乡',
  '寅不祭祀神鬼不尝', '卯不穿井水泉不香', '辰不哭泣必主重丧', '巳不远行财物伏藏',
  '午不苫盖屋主更张', '未不服药毒气入肠', '申不安床鬼祟入房', '酉不宴客醉坐颠狂',
  '戌不吃犬作怪上床', '亥不嫁娶不利新郎',
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

// 五行
const wuXing = ['金', '木', '水', '火', '土'];

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

interface HuangLi {
  dateStr: string;
  ganZhiYear: string;
  ganZhiMonth: string;
  ganZhiDay: string;
  wuXing: string;
  zhiShen: string;
  chongSha: string;
  yi: string[];
  ji: string[];
  jiShi: string[];
  xiongShi: string[];
  taiShen: string;
  pengZu: string;
  fuShen: string;
  caiShen: string;
}

// 根据日期生成伪随机数
const getSeededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// 生成老黄历数据
const generateHuangLi = (date: Date): HuangLi => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 简化的干支计算（实际应用中应该使用精确的历法算法）
  const yearIndex = (year - 4) % 60;
  const ganYearIndex = yearIndex % 10;
  const zhiYearIndex = yearIndex % 12;
  
  const monthIndex = (year * 12 + month + 13) % 60;
  const dayIndex = Math.floor((date.getTime() / 86400000) + 1) % 60;
  
  const seed = year * 10000 + month * 100 + day;
  
  // 生成宜忌
  const yiCount = Math.floor(getSeededRandom(seed * 1) * 6) + 4;
  const jiCount = Math.floor(getSeededRandom(seed * 2) * 4) + 2;
  
  const shuffledYi = [...yiItems].sort(() => getSeededRandom(seed * 3) - 0.5);
  const shuffledJi = [...jiItems].sort(() => getSeededRandom(seed * 4) - 0.5);
  
  const yi = shuffledYi.slice(0, yiCount);
  const ji = shuffledJi.slice(0, jiCount);
  
  // 生成吉时
  const jiShiCount = Math.floor(getSeededRandom(seed * 5) * 3) + 3;
  const shuffledJiShi = [...jiShiList].sort(() => getSeededRandom(seed * 6) - 0.5);
  const jiShi = shuffledJiShi.slice(0, jiShiCount);
  const xiongShi = jiShiList.filter(s => !jiShi.includes(s)).slice(0, 3);
  
  // 日冲生肖
  const dayZhiIndex = dayIndex % 12;
  const chongZhiIndex = (dayZhiIndex + 6) % 12;
  const chongZodiac = zodiacs.find(z => z.earthlyBranch === diZhi[chongZhiIndex]);
  
  return {
    dateStr: `${year}年${month}月${day}日`,
    ganZhiYear: `${tianGan[ganYearIndex]}${diZhi[zhiYearIndex]}年`,
    ganZhiMonth: `${tianGan[monthIndex % 10]}${diZhi[monthIndex % 12]}月`,
    ganZhiDay: `${tianGan[dayIndex % 10]}${diZhi[dayIndex % 12]}日`,
    wuXing: wuXing[Math.floor(getSeededRandom(seed * 7) * 5)],
    zhiShen: zhiShen[Math.floor(getSeededRandom(seed * 8) * 12)],
    chongSha: `冲${chongZodiac?.name || '鼠'}(${diZhi[chongZhiIndex]})煞${getSeededRandom(seed * 9) > 0.5 ? '东' : '西'}`,
    yi,
    ji,
    jiShi,
    xiongShi,
    taiShen: taiShenFangWei[Math.floor(getSeededRandom(seed * 10) * taiShenFangWei.length)],
    pengZu: `${pengZuBaiJi[dayIndex % 10]} ${pengZuBaiJi[10 + (dayIndex % 12)]}`,
    fuShen: luckyElements.directions[Math.floor(getSeededRandom(seed * 11) * 8)],
    caiShen: luckyElements.directions[Math.floor(getSeededRandom(seed * 12) * 8)],
  };
};

// 生成运势
const generateFortune = (zodiac: typeof zodiacs[0], date: Date): DailyFortune => {
  const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
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

  return {
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
        setFortune(generateFortune(savedZodiac, today));
        setHuangLi(generateHuangLi(today));
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
    setFortune(generateFortune(zodiac, today));
    setHuangLi(generateHuangLi(today));
    setRememberZodiac(true); // 默认记住
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
          <p className="text-sky-200/80">老黄历 · 十二生肖运势 · 今日宜忌</p>
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
              <Card className="bg-gradient-to-r from-red-900/60 to-orange-900/60 backdrop-blur-md border-red-400/40">
                <CardContent className="py-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Calendar className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-white">老黄历</h2>
                  </div>
                  
                  {/* 干支纪年 */}
                  <div className="text-center mb-4">
                    <p className="text-yellow-100 text-lg">{huangLi.dateStr}</p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <span className="bg-red-800/60 px-3 py-1 rounded text-yellow-100">{huangLi.ganZhiYear}</span>
                      <span className="bg-red-800/60 px-3 py-1 rounded text-yellow-100">{huangLi.ganZhiMonth}</span>
                      <span className="bg-red-800/60 px-3 py-1 rounded text-yellow-100">{huangLi.ganZhiDay}</span>
                    </div>
                  </div>
                  
                  {/* 基本信息 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-200/80 mb-1">值神</p>
                      <p className="font-bold text-white">{huangLi.zhiShen}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-200/80 mb-1">五行</p>
                      <p className="font-bold text-white">{huangLi.wuXing}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-200/80 mb-1">冲煞</p>
                      <p className="font-bold text-white">{huangLi.chongSha}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-200/80 mb-1">胎神</p>
                      <p className="font-bold text-white text-sm">{huangLi.taiShen}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 今日宜忌 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 宜 */}
                <Card className="bg-green-800/40 backdrop-blur-md border-green-400/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-100 flex items-center gap-2">
                      <span className="text-2xl">✓</span> 今日宜
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {huangLi.yi.map((item, i) => (
                        <span key={i} className="bg-green-700/40 px-3 py-1 rounded-full text-green-100 text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 忌 */}
                <Card className="bg-red-800/40 backdrop-blur-md border-red-400/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-red-100 flex items-center gap-2">
                      <span className="text-2xl">✗</span> 今日忌
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {huangLi.ji.map((item, i) => (
                        <span key={i} className="bg-red-700/40 px-3 py-1 rounded-full text-red-100 text-sm">
                          {item}
                        </span>
                      ))}
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
                        <span>🕐</span> 吉时
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {huangLi.jiShi.map((item, i) => (
                          <span key={i} className="bg-green-700/40 px-3 py-1 rounded text-green-100 text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-red-300 text-sm mb-2 flex items-center gap-1">
                        <span>⏰</span> 凶时
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {huangLi.xiongShi.map((item, i) => (
                          <span key={i} className="bg-red-700/40 px-3 py-1 rounded text-red-100 text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
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
                      <div className="text-2xl mb-1">💰</div>
                      <div className="text-xs text-sky-200/80 mb-1">财神方位</div>
                      <div className="font-bold text-white">{huangLi.caiShen}</div>
                    </div>
                    <div className="bg-sky-950/60 rounded-lg p-4">
                      <div className="text-2xl mb-1">🙏</div>
                      <div className="text-xs text-sky-200/80 mb-1">福神方位</div>
                      <div className="font-bold text-white">{huangLi.fuShen}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 彭祖百忌 */}
              <Card className="bg-amber-900/40 backdrop-blur-md border-amber-400/40">
                <CardContent className="py-4">
                  <h4 className="font-bold text-amber-100 mb-2 flex items-center gap-2">
                    <span>📜</span> 彭祖百忌
                  </h4>
                  <p className="text-amber-100/90 text-sm leading-relaxed">{huangLi.pengZu}</p>
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
