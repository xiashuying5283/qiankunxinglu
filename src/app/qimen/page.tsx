'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Compass, Clock, Calendar, Sparkles, RefreshCw, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { Disclaimer } from '@/components/Disclaimer';
import { GlossaryTerm } from '@/components/GlossaryTerm';
import { calculateQiMenDunJia, type QiMenDunJiaBoard, type Palace } from '@/lib/qimen-calculator';

export default function QiMenDunJiaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [board, setBoard] = useState<QiMenDunJiaBoard | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [expandedPalaces, setExpandedPalaces] = useState<Set<number>>(new Set());
  const [showGuide, setShowGuide] = useState(false);

  // 计算奇门遁甲盘
  const calculate = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        const result = calculateQiMenDunJia(selectedDate);
        setBoard(result);
      } catch (error) {
        console.error('计算失败:', error);
      } finally {
        setIsCalculating(false);
      }
    }, 500);
  };

  // 切换宫位展开状态
  const togglePalace = (index: number) => {
    setExpandedPalaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 初始加载
  useEffect(() => {
    calculate();
  }, []);

  // 获取九星颜色
  const getNineStarColor = (luck: string): string => {
    switch (luck) {
      case '大吉': return 'text-green-400';
      case '小吉': return 'text-green-300';
      case '小凶': return 'text-orange-400';
      case '大凶': return 'text-red-400';
      default: return 'text-amber-200';
    }
  };

  // 获取八门颜色
  const getEightDoorColor = (luck: string): string => {
    switch (luck) {
      case '吉': return 'text-green-400';
      case '凶': return 'text-red-400';
      case '中': return 'text-amber-300';
      default: return 'text-amber-200';
    }
  };

  // 获取八神颜色
  const getEightGodColor = (nature: string): string => {
    return nature === '吉' ? 'text-blue-400' : 'text-purple-400';
  };

  // 渲染单个宫位
  const renderPalace = (palace: Palace) => {
    const isExpanded = expandedPalaces.has(palace.position);
    const isCenter = palace.position === 5;
    
    return (
      <div
        key={palace.position}
        className={`relative rounded-lg border-2 transition-all duration-300 cursor-pointer ${
          isCenter 
            ? 'bg-amber-950/60 border-amber-500/50' 
            : 'bg-amber-900/40 border-amber-400/30 hover:border-amber-400/60'
        }`}
        onClick={() => !isCenter && togglePalace(palace.position)}
      >
        {/* 宫位名称 */}
        <div className="text-center py-2 border-b border-amber-400/20">
          <div className="text-amber-100 font-bold">{palace.name}</div>
          <div className="text-xs text-amber-300/60">{palace.direction} · {palace.wuXing}</div>
        </div>
        
        {/* 九宫内容 */}
        <div className="p-2 min-h-[120px]">
          {isCenter ? (
            // 中宫特殊显示
            <div className="text-center">
              <div className="text-amber-200 text-sm mb-1">天禽</div>
              {palace.nineStar && (
                <div className={`text-sm ${getNineStarColor(palace.nineStar.luck)}`}>
                  {palace.nineStar.luck}
                </div>
              )}
              {palace.diPan && (
                <div className="text-amber-400 text-lg font-bold mt-1">{palace.diPan}</div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 text-xs">
              {/* 天盘三奇六仪 */}
              <div className="col-span-3 text-center py-1 bg-amber-800/40 rounded">
                <span className="text-amber-300">天：</span>
                <span className="text-amber-100 font-bold text-lg mx-1">{palace.tianPan}</span>
              </div>
              
              {/* 九星 */}
              {palace.nineStar && (
                <div className="col-span-3 text-center py-1">
                  <span className={`font-bold ${getNineStarColor(palace.nineStar.luck)}`}>
                    {palace.nineStar.name}
                  </span>
                  <span className="text-amber-300/60 ml-1">({palace.nineStar.luck})</span>
                </div>
              )}
              
              {/* 八门 */}
              {palace.eightDoor && (
                <div className="text-center py-1 bg-amber-700/30 rounded">
                  <span className={`font-bold ${getEightDoorColor(palace.eightDoor.luck)}`}>
                    {palace.eightDoor.name}
                  </span>
                </div>
              )}
              
              {/* 地盘三奇六仪 */}
              <div className="text-center py-1">
                <span className="text-amber-300">地：</span>
                <span className="text-amber-100 font-bold">{palace.diPan}</span>
              </div>
              
              {/* 八神 */}
              {palace.eightGod && (
                <div className="text-center py-1 bg-amber-600/30 rounded">
                  <span className={`font-bold ${getEightGodColor(palace.eightGod.nature)}`}>
                    {palace.eightGod.name}
                  </span>
                </div>
              )}
              
              {/* 展开后的详细信息 */}
              {isExpanded && (
                <div className="col-span-3 mt-2 pt-2 border-t border-amber-400/20 space-y-1">
                  {palace.nineStar && (
                    <div className="text-amber-200">
                      九星：{palace.nineStar.name}（{palace.nineStar.wuXing}）
                      <span className={`ml-1 ${getNineStarColor(palace.nineStar.luck)}`}>
                        {palace.nineStar.luck}
                      </span>
                    </div>
                  )}
                  {palace.eightDoor && (
                    <div className="text-amber-200">
                      八门：{palace.eightDoor.name}（{palace.eightDoor.wuXing}）
                      <span className={`ml-1 ${getEightDoorColor(palace.eightDoor.luck)}`}>
                        {palace.eightDoor.luck}
                      </span>
                    </div>
                  )}
                  {palace.eightGod && (
                    <div className="text-amber-200">
                      八神：{palace.eightGod.name}
                      <span className={`ml-1 ${getEightGodColor(palace.eightGod.nature)}`}>
                        {palace.eightGod.nature}
                      </span>
                    </div>
                  )}
                  <div className="text-amber-200">
                    天盘：{palace.tianPan} · 地盘：{palace.diPan}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 展开提示 */}
        {!isCenter && (
          <div className="absolute bottom-1 right-1 text-amber-400/40">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </div>
    );
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
          
          <UserMenu />
        </div>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Compass className="w-10 h-10 text-amber-300 mr-3" />
            <h1 className="text-4xl font-bold text-amber-100">奇门遁甲</h1>
            <Compass className="w-10 h-10 text-amber-300 ml-3" />
          </div>
          <p className="text-amber-200/80">帝王之学，预测之巅，探天地玄机</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* 时间选择器 */}
          <Card className="bg-white/10 backdrop-blur-md border-amber-300/30 mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-amber-100 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                选择时间
              </CardTitle>
              <CardDescription className="text-amber-200/60">
                奇门遁甲以时辰排盘，不同时间有不同的格局
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <input
                    type="datetime-local"
                    value={selectedDate.toISOString().slice(0, 16)}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="bg-amber-900/50 border border-amber-400/30 rounded px-3 py-2 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>
                
                <Button
                  onClick={calculate}
                  disabled={isCalculating}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      排盘中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      排盘
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowGuide(!showGuide)}
                  className="border-amber-400/30 text-amber-200 hover:bg-amber-500/10"
                >
                  <Info className="w-4 h-4 mr-2" />
                  使用指南
                </Button>
              </div>
              
              {/* 使用指南 */}
              {showGuide && (
                <div className="mt-4 bg-amber-950/50 rounded-lg p-4 text-sm text-amber-200/80 space-y-2">
                  <p><strong className="text-amber-100">奇门遁甲</strong>是中国古代术数之首，号称"帝王之学"。</p>
                  <p>• <strong>局数</strong>：根据节气和日干支确定，共18局（阳遁9局+阴遁9局）</p>
                  <p>• <strong>三奇六仪</strong>：乙丙丁为三奇（吉），戊己庚辛壬癸为六仪</p>
                  <p>• <strong>九星</strong>：天蓬、天芮、天冲、天辅、天禽、天心、天柱、天任、天英</p>
                  <p>• <strong>八门</strong>：休、生、伤、杜、景、死、惊、开，吉门为宜</p>
                  <p>• <strong>八神</strong>：值符、腾蛇、太阴、六合、白虎、玄武、九地、九天</p>
                  <p className="text-xs text-amber-300/60">点击各宫可查看详细信息</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 盘面显示 */}
          {board && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
                <CardContent className="py-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-xs text-amber-300/60">公历</div>
                      <div className="text-amber-100 font-bold">{board.solarDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-300/60">农历</div>
                      <div className="text-amber-100 font-bold">{board.lunarDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-300/60">节气</div>
                      <div className="text-amber-100 font-bold">{board.jieQi}</div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-300/60">局数</div>
                      <div className={`font-bold ${board.dunType === '阳遁' ? 'text-red-400' : 'text-blue-400'}`}>
                        {board.juShuDesc}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-center mt-4 pt-4 border-t border-amber-400/20">
                    <div>
                      <div className="text-xs text-amber-300/60">年柱</div>
                      <div className="text-amber-100 font-bold">{board.ganZhi.year}</div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-300/60">月柱</div>
                      <div className="text-amber-100 font-bold">{board.ganZhi.month}</div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-300/60">日柱</div>
                      <div className="text-amber-100 font-bold">{board.ganZhi.day}</div>
                    </div>
                    <div>
                      <div className="text-xs text-amber-300/60">时柱</div>
                      <div className="text-amber-100 font-bold">{board.ganZhi.hour}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 旬首、值符、值使 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-amber-100">核心要素</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-amber-900/40 rounded-lg p-3">
                      <div className="text-xs text-amber-300/60 mb-1">旬首</div>
                      <div className="text-2xl font-bold text-amber-100">{board.xunShou}</div>
                      <div className="text-xs text-amber-200/60 mt-1">时辰旬首六仪</div>
                    </div>
                    <div className="bg-amber-900/40 rounded-lg p-3">
                      <div className="text-xs text-amber-300/60 mb-1">值符</div>
                      <div className="text-2xl font-bold text-green-400">{board.zhiFu}</div>
                      <div className="text-xs text-amber-200/60 mt-1">当前值班九星</div>
                    </div>
                    <div className="bg-amber-900/40 rounded-lg p-3">
                      <div className="text-xs text-amber-300/60 mb-1">值使</div>
                      <div className="text-2xl font-bold text-blue-400">{board.zhiShi}</div>
                      <div className="text-xs text-amber-200/60 mt-1">当前值班八门</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 九宫格 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100 flex items-center">
                    <Compass className="w-5 h-5 mr-2" />
                    奇门盘
                  </CardTitle>
                  <CardDescription className="text-amber-200/60">
                    点击各宫查看详细信息，天盘为三奇六仪，地盘为基础，九星八门为用神
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 九宫布局 */}
                  <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
                    {/* 巽四宫 | 离九宫 | 坤二宫 */}
                    {renderPalace(board.palaces[3])}
                    {renderPalace(board.palaces[8])}
                    {renderPalace(board.palaces[1])}
                    
                    {/* 震三宫 | 中五宫 | 兑七宫 */}
                    {renderPalace(board.palaces[2])}
                    {renderPalace(board.palaces[4])}
                    {renderPalace(board.palaces[6])}
                    
                    {/* 艮八宫 | 坎一宫 | 乾六宫 */}
                    {renderPalace(board.palaces[7])}
                    {renderPalace(board.palaces[0])}
                    {renderPalace(board.palaces[5])}
                  </div>
                </CardContent>
              </Card>

              {/* 格局判断 */}
              {board.geJu.length > 0 && (
                <Card className="bg-gradient-to-r from-green-900/40 to-amber-900/40 border-green-400/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-100 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      格局判断
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {board.geJu.map((ge, i) => (
                        <span
                          key={i}
                          className="bg-green-800/40 text-green-200 px-3 py-1 rounded-full text-sm"
                        >
                          {ge}
                        </span>
                      ))}
                    </div>
                    <p className="text-green-200/60 text-sm mt-2">
                      以上格局为吉格，主事业顺遂、贵人相助
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 解读建议 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100">盘面解读</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-amber-950/50 rounded-lg p-4 text-amber-200 whitespace-pre-line leading-relaxed">
                    {board.advice}
                  </div>
                </CardContent>
              </Card>

              {/* 知识科普 */}
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/30">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-100">奇门遁甲知识</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-amber-900/40 rounded-lg p-4">
                      <h4 className="text-amber-100 font-bold mb-2">
                        <GlossaryTerm term="三奇">三奇</GlossaryTerm>
                      </h4>
                      <p className="text-amber-200/80 text-sm">
                        乙为日奇、丙为月奇、丁为星奇，合称三奇。
                        三奇所临之宫，百事皆宜，逢凶化吉。
                      </p>
                    </div>
                    <div className="bg-amber-900/40 rounded-lg p-4">
                      <h4 className="text-amber-100 font-bold mb-2">
                        <GlossaryTerm term="六仪">六仪</GlossaryTerm>
                      </h4>
                      <p className="text-amber-200/80 text-sm">
                        戊己庚辛壬癸为六仪，用于纪时和定局。
                        其中庚为仇敌，辛为罪人，需避之。
                      </p>
                    </div>
                    <div className="bg-amber-900/40 rounded-lg p-4">
                      <h4 className="text-amber-100 font-bold mb-2">
                        <GlossaryTerm term="八门">八门</GlossaryTerm>
                      </h4>
                      <p className="text-amber-200/80 text-sm">
                        休、生、开为三吉门；伤、杜、景为平门；死、惊为凶门。
                        吉门所临宜进取，凶门所临宜守静。
                      </p>
                    </div>
                    <div className="bg-amber-900/40 rounded-lg p-4">
                      <h4 className="text-amber-100 font-bold mb-2">
                        <GlossaryTerm term="九星">九星</GlossaryTerm>
                      </h4>
                      <p className="text-amber-200/80 text-sm">
                        天辅、天禽、天心为大吉；天冲、天任为小吉；
                        天蓬、天芮为大凶；天柱、天英为小凶。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 免责声明 */}
              <Disclaimer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
