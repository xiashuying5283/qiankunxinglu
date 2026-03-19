'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, Sparkles, User } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';

// 天干
const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 五行
const wuXing = ['金', '木', '水', '火', '土'];
// 十二生肖
const shengXiao = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 天干五行
const tianGanWuXing: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// 地支生肖
const diZhiShengXiao: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔', '辰': '龙', '巳': '蛇',
  '午': '马', '未': '羊', '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
};

// 地支五行
const diZhiWuXing: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 计算年柱
function getYearPillar(year: number): { gan: string; zhi: string } {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return {
    gan: tianGan[ganIndex >= 0 ? ganIndex : ganIndex + 10],
    zhi: diZhi[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12]
  };
}

// 计算月柱（简化计算）
function getMonthPillar(year: number, month: number): { gan: string; zhi: string } {
  const yearGanIndex = (year - 4) % 10;
  const ganIndex = (yearGanIndex % 5 * 2 + month) % 10;
  const zhiIndex = (month + 1) % 12;
  return {
    gan: tianGan[ganIndex],
    zhi: diZhi[zhiIndex]
  };
}

// 计算日柱（简化算法）
function getDayPillar(year: number, month: number, day: number): { gan: string; zhi: string } {
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const ganIndex = diffDays % 10;
  const zhiIndex = diffDays % 12;
  return {
    gan: tianGan[ganIndex >= 0 ? ganIndex : ganIndex + 10],
    zhi: diZhi[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12]
  };
}

// 计算时柱
function getHourPillar(dayGan: string, hour: number): { gan: string; zhi: string } {
  const dayGanIndex = tianGan.indexOf(dayGan);
  const zhiIndex = Math.floor((hour + 1) / 2) % 12;
  const ganIndex = (dayGanIndex % 5 * 2 + Math.floor(zhiIndex / 2)) % 10;
  return {
    gan: tianGan[ganIndex],
    zhi: diZhi[zhiIndex]
  };
}

// 五行分析
function analyzeWuXing(bazi: { gan: string; zhi: string }[]): Record<string, number> {
  const count: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  
  bazi.forEach(pillar => {
    const ganWX = tianGanWuXing[pillar.gan];
    const zhiWX = diZhiWuXing[pillar.zhi];
    if (ganWX) count[ganWX]++;
    if (zhiWX) count[zhiWX]++;
  });
  
  return count;
}

interface BaziResult {
  year: { gan: string; zhi: string };
  month: { gan: string; zhi: string };
  day: { gan: string; zhi: string };
  hour: { gan: string; zhi: string };
  shengXiao: string;
  wuXingCount: Record<string, number>;
  dominantWuXing: string;
  missingWuXing: string[];
  analysis: string;
}

export default function BaziPage() {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [result, setResult] = useState<BaziResult | null>(null);

  const calculate = () => {
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);
    const h = parseInt(hour) || 12;

    if (!y || !m || !d || y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
      alert('请输入有效的出生日期');
      return;
    }

    const yearPillar = getYearPillar(y);
    const monthPillar = getMonthPillar(y, m);
    const dayPillar = getDayPillar(y, m, d);
    const hourPillar = getHourPillar(dayPillar.gan, h);

    const bazi = [yearPillar, monthPillar, dayPillar, hourPillar];
    const wuXingCount = analyzeWuXing(bazi);
    
    // 找出最旺和缺失的五行
    const sortedWuXing = Object.entries(wuXingCount).sort((a, b) => b[1] - a[1]);
    const dominantWuXing = sortedWuXing[0][0];
    const missingWuXing = sortedWuXing.filter(([_, count]) => count === 0).map(([name]) => name);

    // 生成分析
    const analysisList = [
      `您的八字中，${dominantWuXing}气较旺，性格上可能表现为${getWuXingCharacter(dominantWuXing)}。`,
      missingWuXing.length > 0 
        ? `五行缺${missingWuXing.join('、')}，建议通过姓名、饰品或日常行为来补足。`
        : '五行齐全，人生较为平衡。',
      `生肖属${diZhiShengXiao[yearPillar.zhi]}，为人${getShengXiaoCharacter(diZhiShengXiao[yearPillar.zhi])}。`,
      `日主为${dayPillar.gan}，代表自身，五行属${tianGanWuXing[dayPillar.gan]}。`,
    ];

    setResult({
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
      shengXiao: diZhiShengXiao[yearPillar.zhi],
      wuXingCount,
      dominantWuXing,
      missingWuXing,
      analysis: analysisList.join('\n')
    });
  };

  // 五行性格特征
  function getWuXingCharacter(wx: string): string {
    const chars: Record<string, string> = {
      '金': '刚毅果断、讲义气、有领导力',
      '木': '仁慈善良、有爱心、富有创造力',
      '水': '聪明机智、灵活变通、善于沟通',
      '火': '热情奔放、积极向上、有感染力',
      '土': '稳重踏实、诚实守信、有责任感'
    };
    return chars[wx] || '';
  }

  // 生肖性格特征
  function getShengXiaoCharacter(sx: string): string {
    const chars: Record<string, string> = {
      '鼠': '机灵聪明，善于理财',
      '牛': '勤劳踏实，做事稳重',
      '虎': '勇敢果断，有领导力',
      '兔': '温柔善良，心思细腻',
      '龙': '志向远大，有抱负',
      '蛇': '智慧深沉，洞察力强',
      '马': '热情奔放，追求自由',
      '羊': '温和善良，有艺术气质',
      '猴': '聪明机灵，多才多艺',
      '鸡': '勤奋守信，注重仪表',
      '狗': '忠诚可靠，重情义',
      '猪': '憨厚善良，福气满满'
    };
    return chars[sx] || '';
  }

  // 五行颜色
  const wuXingColors: Record<string, string> = {
    '金': 'from-yellow-500 to-yellow-600',
    '木': 'from-green-500 to-green-600',
    '水': 'from-blue-500 to-blue-600',
    '火': 'from-red-500 to-red-600',
    '土': 'from-amber-500 to-amber-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-yellow-900">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-amber-200 hover:text-amber-100 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          
          {/* 用户菜单 */}
          <UserMenu />
        </div>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="w-10 h-10 text-amber-300 mr-3" />
            <h1 className="text-4xl font-bold text-amber-100">生辰八字</h1>
            <Calendar className="w-10 h-10 text-amber-300 ml-3" />
          </div>
          <p className="text-amber-200/80">输入出生时间，推算您的八字命盘</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 输入区域 */}
          <Card className="bg-white/10 backdrop-blur-md border-amber-300/30 mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-amber-100">输入出生信息</CardTitle>
              <CardDescription className="text-amber-200/60">
                请输入公历（阳历）出生日期和时间
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-amber-200 mb-2">年份</label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="1990"
                    className="bg-white/10 border-amber-300/30 text-amber-100 placeholder:text-amber-200/40 text-center h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-200 mb-2">月份</label>
                  <Input
                    type="number"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    placeholder="6"
                    min="1"
                    max="12"
                    className="bg-white/10 border-amber-300/30 text-amber-100 placeholder:text-amber-200/40 text-center h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-200 mb-2">日期</label>
                  <Input
                    type="number"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    placeholder="15"
                    min="1"
                    max="31"
                    className="bg-white/10 border-amber-300/30 text-amber-100 placeholder:text-amber-200/40 text-center h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm text-amber-200 mb-2">时辰</label>
                  <Input
                    type="number"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    placeholder="12"
                    min="0"
                    max="23"
                    className="bg-white/10 border-amber-300/30 text-amber-100 placeholder:text-amber-200/40 text-center h-12"
                  />
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={calculate}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-12 py-6 text-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  推算八字
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 结果区域 */}
          {result && (
            <div className="space-y-6">
              {/* 八字命盘 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-amber-100">八字命盘</CardTitle>
                  <CardDescription className="text-amber-200/60">
                    生肖：{result.shengXiao}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    {[
                      { label: '年柱', pillar: result.year },
                      { label: '月柱', pillar: result.month },
                      { label: '日柱', pillar: result.day },
                      { label: '时柱', pillar: result.hour }
                    ].map((item, i) => (
                      <div key={i} className="bg-amber-900/40 rounded-lg p-4">
                        <div className="text-xs text-amber-200/60 mb-2">{item.label}</div>
                        <div className="text-2xl font-bold text-amber-100 mb-1">{item.pillar.gan}</div>
                        <div className="text-2xl font-bold text-amber-100">{item.pillar.zhi}</div>
                        <div className="text-xs text-amber-300/80 mt-2">
                          {tianGanWuXing[item.pillar.gan]} · {diZhiShengXiao[item.pillar.zhi]}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 五行分析 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100">五行分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {wuXing.map((wx) => (
                      <div key={wx} className="text-center">
                        <div className={`w-full h-24 rounded-lg bg-gradient-to-b ${wuXingColors[wx]} flex items-center justify-center`}>
                          <span className="text-3xl font-bold text-white">{result.wuXingCount[wx]}</span>
                        </div>
                        <div className="text-sm text-amber-200 mt-2">{wx}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-amber-900/40 rounded-lg p-4 mt-4">
                    <div className="text-sm text-amber-200/60 mb-1">最旺五行</div>
                    <div className="text-lg font-bold text-amber-100">{result.dominantWuXing}</div>
                  </div>
                  
                  {result.missingWuXing.length > 0 && (
                    <div className="bg-red-900/30 rounded-lg p-4 mt-4 border border-red-400/30">
                      <div className="text-sm text-red-200/80 mb-1">⚠️ 缺失五行</div>
                      <div className="text-lg font-bold text-red-200">{result.missingWuXing.join('、')}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 命理分析 */}
              <Card className="bg-gradient-to-r from-amber-900/60 to-orange-900/60 border-amber-400/30">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    命理分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.analysis.split('\n').map((line, i) => (
                      <p key={i} className="text-amber-100 leading-relaxed">{line}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 温馨提示 */}
              <div className="bg-amber-950/50 rounded-lg p-4 text-center">
                <p className="text-xs text-amber-200/80">
                  八字命理仅供参考，命运掌握在自己手中。切勿过度迷信，应以积极乐观的态度面对人生。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
