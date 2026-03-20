'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Sparkles, User, Star, Compass } from 'lucide-react';
import { SiteHeader } from '@/components/SiteHeader';
import { BirthDateSelector } from '@/components/BirthDateSelector';
import { 
  calculateDetailedBazi, 
  type DetailedBaziData,
  type CalendarType,
  tianGanWuXing,
  diZhiShengXiao,
  getLunarMonthName,
  getLunarDayName
} from '@/lib/bazi-calculator';

export default function BaziPage() {
  const [birthDate, setBirthDate] = useState<CalendarType>({
    isLunar: false,
    year: 0,
    month: 0,
    day: 0,
    hour: 12
  });
  const [result, setResult] = useState<DetailedBaziData | null>(null);

  const calculate = () => {
    if (!birthDate.year || !birthDate.month || !birthDate.day) {
      alert('请输入完整的出生日期');
      return;
    }

    if (birthDate.year < 1900 || birthDate.year > 2100) {
      alert('请输入有效的年份（1900-2100）');
      return;
    }

    try {
      const baziResult = calculateDetailedBazi(birthDate);
      setResult(baziResult);
    } catch (error) {
      console.error('计算错误:', error);
      alert('计算失败，请检查日期是否正确');
    }
  };

  // 五行性格特征
  const getWuXingCharacter = (wx: string): string => {
    const chars: Record<string, string> = {
      '金': '刚毅果断、讲义气、有领导力',
      '木': '仁慈善良、有爱心、富有创造力',
      '水': '聪明机智、灵活变通、善于沟通',
      '火': '热情奔放、积极向上、有感染力',
      '土': '稳重踏实、诚实守信、有责任感'
    };
    return chars[wx] || '';
  };

  // 生肖性格特征
  const getShengXiaoCharacter = (sx: string): string => {
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
  };

  // 五行颜色
  const wuXingColors: Record<string, string> = {
    '金': 'from-yellow-500 to-yellow-600',
    '木': 'from-green-500 to-green-600',
    '水': 'from-blue-500 to-blue-600',
    '火': 'from-red-500 to-red-600',
    '土': 'from-amber-500 to-amber-600'
  };

  // 十神颜色
  const shiShenColors: Record<string, string> = {
    '比肩': 'text-blue-300',
    '劫财': 'text-blue-400',
    '食神': 'text-green-300',
    '伤官': 'text-green-400',
    '正财': 'text-yellow-300',
    '偏财': 'text-yellow-400',
    '正官': 'text-purple-300',
    '七杀': 'text-purple-400',
    '正印': 'text-pink-300',
    '偏印': 'text-pink-400'
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="w-10 h-10 text-amber-500 mr-3" />
            <h1 className="text-4xl font-bold text-amber-100">生辰八字</h1>
            <Calendar className="w-10 h-10 text-amber-500 ml-3" />
          </div>
          <p className="text-gray-400">基于 lunar-javascript 精确算法，输入出生时间推算八字命盘</p>
          <p className="text-xs text-gray-500 mt-1">精确计算：年柱以立春为界，月柱以节气为界</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 输入区域 */}
          <Card className="bg-[#1a1a1a]/50 border-amber-500/20 mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-amber-100">输入出生信息</CardTitle>
              <CardDescription className="text-gray-500">
                支持公历（阳历）和农历（阴历）输入
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BirthDateSelector
                value={birthDate}
                onChange={setBirthDate}
              />

              <div className="text-center mt-6">
                <Button
                  onClick={calculate}
                  className="bg-amber-500 hover:bg-amber-600 text-black px-12 py-6 text-lg"
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
              <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-amber-100">八字命盘</CardTitle>
                  <CardDescription className="text-gray-500">
                    生肖：{result.shengxiao} | 日主：{result.day.gan}（{tianGanWuXing[result.day.gan]}命）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    {[
                      { label: '年柱', pillar: result.year, shishen: result.shishen.yearGan, nayin: result.nayin.year },
                      { label: '月柱', pillar: result.month, shishen: result.shishen.monthGan, nayin: result.nayin.month },
                      { label: '日柱', pillar: result.day, shishen: '日主', nayin: result.nayin.day },
                      { label: '时柱', pillar: result.hour, shishen: result.shishen.hourGan, nayin: result.nayin.hour }
                    ].map((item, i) => (
                      <div key={i} className="bg-[#0a0a0a] rounded-lg p-4 border border-amber-500/10">
                        <div className="text-xs text-gray-500 mb-2">{item.label}</div>
                        <div className="text-3xl font-bold text-amber-100 mb-1">{item.pillar.gan}</div>
                        <div className="text-3xl font-bold text-amber-100">{item.pillar.zhi}</div>
                        <div className={`text-xs mt-2 ${shiShenColors[item.shishen] || 'text-amber-400'}`}>
                          {item.shishen}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{item.nayin}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 节气信息 */}
              <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100 flex items-center">
                    <Compass className="w-5 h-5 mr-2" />
                    节气信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-amber-500/10">
                      <div className="text-sm text-gray-500 mb-1">上一个节气</div>
                      <div className="text-amber-100">{result.jieqi.prev || '无'}</div>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-amber-500/10">
                      <div className="text-sm text-gray-500 mb-1">下一个节气</div>
                      <div className="text-amber-100">{result.jieqi.next || '无'}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    * 年柱以立春为界，月柱以节气为界。这是精确计算的关键。
                  </p>
                </CardContent>
              </Card>

              {/* 五行分析 */}
              <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100">五行分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {['金', '木', '水', '火', '土'].map((wx) => (
                      <div key={wx} className="text-center">
                        <div className={`w-full h-24 rounded-lg bg-gradient-to-b ${wuXingColors[wx]} flex items-center justify-center`}>
                          <span className="text-3xl font-bold text-white">{result.wuxing[wx]}</span>
                        </div>
                        <div className="text-sm text-gray-400 mt-2">{wx}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] rounded-lg p-4 border border-amber-500/10">
                      <div className="text-sm text-gray-500 mb-1">最旺五行</div>
                      <div className="text-lg font-bold text-amber-100">{result.dominantWuXing}</div>
                      <div className="text-xs text-gray-400 mt-1">{getWuXingCharacter(result.dominantWuXing)}</div>
                    </div>
                    
                    {result.missingWuXing.length > 0 && (
                      <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/20">
                        <div className="text-sm text-red-400 mb-1">⚠️ 缺失五行</div>
                        <div className="text-lg font-bold text-red-300">{result.missingWuXing.join('、')}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 神煞信息 */}
              {result.shensha.length > 0 && (
                <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-amber-100 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      神煞
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.shensha.map((ss, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-sm border border-purple-500/20"
                        >
                          {ss}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      <p>• 天乙贵人：逢凶化吉，有贵人相助</p>
                      <p>• 文昌贵人：聪明好学，利于学业考试</p>
                      <p>• 桃花：人缘好，异性缘佳</p>
                      <p>• 驿马：奔波走动，适合外出发展</p>
                      <p>• 华盖：孤独清高，有艺术天赋</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 胎元命宫 */}
              <Card className="bg-[#1a1a1a]/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100">胎元 · 命宫</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-amber-500/10">
                      <div className="text-sm text-gray-500 mb-1">胎元</div>
                      <div className="text-xl font-bold text-amber-100">{result.taiyuan}</div>
                      <div className="text-xs text-gray-500 mt-1">受胎之月，先天体质</div>
                    </div>
                    <div className="bg-[#0a0a0a] rounded-lg p-3 border border-amber-500/10">
                      <div className="text-sm text-gray-500 mb-1">命宫</div>
                      <div className="text-xl font-bold text-amber-100">{result.minggong}</div>
                      <div className="text-xs text-gray-500 mt-1">命运归宿，人生方向</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 命理分析 */}
              <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    命理分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-300 leading-relaxed">
                      您的八字中，{result.dominantWuXing}气较旺，性格上可能表现为{getWuXingCharacter(result.dominantWuXing)}。
                    </p>
                    {result.missingWuXing.length > 0 ? (
                      <p className="text-gray-300 leading-relaxed">
                        五行缺{result.missingWuXing.join('、')}，建议通过姓名、饰品或日常行为来补足。
                      </p>
                    ) : (
                      <p className="text-gray-300 leading-relaxed">
                        五行齐全，人生较为平衡。
                      </p>
                    )}
                    <p className="text-gray-300 leading-relaxed">
                      生肖属{result.shengxiao}，为人{getShengXiaoCharacter(result.shengxiao)}。
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      日主为{result.day.gan}，代表自身，五行属{tianGanWuXing[result.day.gan]}，纳音{result.nayin.day}。
                    </p>
                    {result.shensha.length > 0 && (
                      <p className="text-gray-300 leading-relaxed">
                        命带{result.shensha.join('、')}等吉星，是命局中的亮点。
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 温馨提示 */}
              <div className="bg-[#0a0a0a] rounded-lg p-4 text-center border border-amber-500/10">
                <p className="text-xs text-gray-500">
                  本命盘基于 lunar-javascript 精确算法计算，年柱以立春为界，月柱以节气为界。
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
