'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, Star, Clock } from 'lucide-react';
import { trigrams, hexagrams, type Hexagram } from '@/lib/divination-data';

type Method = 'time' | 'number' | 'random';

export default function PlumBlossomPage() {
  const [method, setMethod] = useState<Method>('time');
  const [numberInput, setNumberInput] = useState({ num1: '', num2: '', num3: '' });
  const [result, setResult] = useState<{
    upperTrigram: typeof trigrams[0];
    lowerTrigram: typeof trigrams[0];
    hexagram: Hexagram;
    changingLine: number;
    method: string;
    numbers?: { upper: number; lower: number; change: number };
  } | null>(null);

  // 根据数字获取八卦
  const getTrigramByNumber = (num: number) => {
    const remainder = num % 8;
    return trigrams[remainder === 0 ? 7 : remainder - 1];
  };

  // 根据上下卦找到对应的六十四卦
  const findHexagram = (upperName: string, lowerName: string): Hexagram => {
    const found = hexagrams.find(
      h => h.upperTrigram === upperName && h.lowerTrigram === lowerName
    );
    return found || hexagrams[0];
  };

  // 时间起卦
  const divineByTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = Math.floor(now.getHours() / 2) + 1; // 时辰

    // 上卦 = (年+月+日) % 8
    const upperNum = (year + month + day) % 8;
    // 下卦 = (年+月+日+时) % 8
    const lowerNum = (year + month + day + hour) % 8;
    // 动爻 = (年+月+日+时) % 6
    const changingLine = ((year + month + day + hour) % 6) || 6;

    const upperTrigram = getTrigramByNumber(upperNum === 0 ? 8 : upperNum);
    const lowerTrigram = getTrigramByNumber(lowerNum === 0 ? 8 : lowerNum);
    const hexagram = findHexagram(upperTrigram.name, lowerTrigram.name);

    setResult({
      upperTrigram,
      lowerTrigram,
      hexagram,
      changingLine,
      method: `时间起卦：${year}年${month}月${day}日${hour}时`,
      numbers: {
        upper: upperNum === 0 ? 8 : upperNum,
        lower: lowerNum === 0 ? 8 : lowerNum,
        change: changingLine,
      },
    });
  };

  // 数字起卦（三个数字）
  const divineByNumber = () => {
    const num1 = parseInt(numberInput.num1) || 0;
    const num2 = parseInt(numberInput.num2) || 0;
    const num3 = parseInt(numberInput.num3) || 0;

    if (num1 <= 0 || num2 <= 0 || num3 <= 0) {
      alert('请输入三个有效的数字');
      return;
    }

    // 第一个数字取上卦
    const upperNum = num1 % 8;
    // 第二个数字取下卦
    const lowerNum = num2 % 8;
    // 第三个数字取动爻
    const changingLine = (num3 % 6) || 6;

    const upperTrigram = getTrigramByNumber(upperNum === 0 ? 8 : upperNum);
    const lowerTrigram = getTrigramByNumber(lowerNum === 0 ? 8 : lowerNum);
    const hexagram = findHexagram(upperTrigram.name, lowerTrigram.name);

    setResult({
      upperTrigram,
      lowerTrigram,
      hexagram,
      changingLine,
      method: `数字起卦：${num1}、${num2}、${num3}`,
      numbers: {
        upper: upperNum === 0 ? 8 : upperNum,
        lower: lowerNum === 0 ? 8 : lowerNum,
        change: changingLine,
      },
    });
  };

  // 随机起卦
  const divineRandom = () => {
    const upperNum = Math.floor(Math.random() * 8) + 1;
    const lowerNum = Math.floor(Math.random() * 8) + 1;
    const changingLine = Math.floor(Math.random() * 6) + 1;

    const upperTrigram = getTrigramByNumber(upperNum);
    const lowerTrigram = getTrigramByNumber(lowerNum);
    const hexagram = findHexagram(upperTrigram.name, lowerTrigram.name);

    setResult({
      upperTrigram,
      lowerTrigram,
      hexagram,
      changingLine,
      method: '随机起卦',
      numbers: {
        upper: upperNum,
        lower: lowerNum,
        change: changingLine,
      },
    });
  };

  const methods = [
    { id: 'time', name: '时间起卦', icon: Clock, description: '根据当前时间推算卦象' },
    { id: 'number', name: '数字起卦', icon: Star, description: '根据三个数字推算卦象' },
    { id: 'random', name: '随机起卦', icon: Sparkles, description: '随机生成卦象' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-rose-900 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-pink-200 hover:text-pink-100 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Star className="w-10 h-10 text-pink-300 mr-3" />
            <h1 className="text-4xl font-bold text-pink-100">梅花易数</h1>
            <Star className="w-10 h-10 text-pink-300 ml-3" />
          </div>
          <p className="text-pink-200/80">以数明理，以象言事，探索数字与命运的关联</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 选择方法 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {methods.map((m) => (
              <Card
                key={m.id}
                className={`cursor-pointer transition-all ${
                  method === m.id
                    ? 'bg-white/20 border-pink-400/50 scale-105'
                    : 'bg-white/10 border-pink-300/30 hover:bg-white/15'
                }`}
                onClick={() => setMethod(m.id as Method)}
              >
                <CardContent className="py-6 text-center">
                  <m.icon className={`w-8 h-8 mx-auto mb-2 ${method === m.id ? 'text-pink-200' : 'text-pink-300/60'}`} />
                  <div className="text-lg font-medium text-pink-100">{m.name}</div>
                  <div className="text-sm text-pink-200/60 mt-1">{m.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 输入区域 */}
          {!result && (
            <Card className="bg-white/10 backdrop-blur-md border-pink-300/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-pink-100">
                  {method === 'time' && '时间起卦'}
                  {method === 'number' && '数字起卦'}
                  {method === 'random' && '随机起卦'}
                </CardTitle>
                <CardDescription className="text-pink-200/60">
                  {method === 'time' && '使用当前日期时间为您推算卦象'}
                  {method === 'number' && '输入三个数字：第一个取上卦，第二个取下卦，第三个取动爻'}
                  {method === 'random' && '随机生成一组数字为您推算卦象'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {method === 'time' && (
                  <div className="text-center py-8">
                    <p className="text-pink-200 mb-6">
                      将使用当前的年、月、日、时为您起卦
                    </p>
                    <Button
                      onClick={divineByTime}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-12 py-6 text-lg"
                    >
                      <Clock className="w-5 h-5 mr-2" />
                      开始起卦
                    </Button>
                  </div>
                )}

                {method === 'number' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-pink-200 mb-2 block text-center">第一个数字（上卦）</label>
                        <Input
                          type="number"
                          value={numberInput.num1}
                          onChange={(e) => setNumberInput({ ...numberInput, num1: e.target.value })}
                          placeholder="上卦"
                          className="bg-white/10 border-pink-300/30 text-pink-100 placeholder:text-pink-200/40 text-center text-xl h-14"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-pink-200 mb-2 block text-center">第二个数字（下卦）</label>
                        <Input
                          type="number"
                          value={numberInput.num2}
                          onChange={(e) => setNumberInput({ ...numberInput, num2: e.target.value })}
                          placeholder="下卦"
                          className="bg-white/10 border-pink-300/30 text-pink-100 placeholder:text-pink-200/40 text-center text-xl h-14"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-pink-200 mb-2 block text-center">第三个数字（动爻）</label>
                        <Input
                          type="number"
                          value={numberInput.num3}
                          onChange={(e) => setNumberInput({ ...numberInput, num3: e.target.value })}
                          placeholder="动爻"
                          className="bg-white/10 border-pink-300/30 text-pink-100 placeholder:text-pink-200/40 text-center text-xl h-14"
                        />
                      </div>
                    </div>
                    <div className="text-center pt-4">
                      <Button
                        onClick={divineByNumber}
                        disabled={!numberInput.num1 || !numberInput.num2 || !numberInput.num3}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-12 py-6 text-lg"
                      >
                        <Star className="w-5 h-5 mr-2" />
                        开始起卦
                      </Button>
                    </div>
                  </div>
                )}

                {method === 'random' && (
                  <div className="text-center py-8">
                    <p className="text-pink-200 mb-6">
                      随机生成数字为您起卦
                    </p>
                    <Button
                      onClick={divineRandom}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-12 py-6 text-lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      随机起卦
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 结果显示 */}
          {result && (
            <div className="space-y-6">
              {/* 数字信息 */}
              {result.numbers && (
                <Card className="bg-white/10 backdrop-blur-md border-pink-300/30">
                  <CardContent className="py-6">
                    <div className="text-center">
                      <div className="text-lg text-pink-200 mb-2">{result.method}</div>
                      <div className="flex justify-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-100">{result.numbers.upper}</div>
                          <div className="text-xs text-pink-200/60">上卦数</div>
                        </div>
                        <div className="text-2xl text-pink-300">+</div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-100">{result.numbers.lower}</div>
                          <div className="text-xs text-pink-200/60">下卦数</div>
                        </div>
                        <div className="text-2xl text-pink-300">+</div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-100">{result.numbers.change}</div>
                          <div className="text-xs text-pink-200/60">动爻数</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 卦象显示 - 显示完整的六十四卦 */}
              <Card className="bg-white/10 backdrop-blur-md border-pink-300/30">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-pink-100">所成卦象</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 完整卦象 */}
                  <div className="text-center mb-6">
                    <div className="text-8xl mb-4">{result.hexagram.symbol}</div>
                    <div className="text-3xl font-bold text-pink-100 mb-2">
                      第{result.hexagram.number}卦 · {result.hexagram.name}卦
                    </div>
                    <div className="text-pink-200/80">
                      {result.upperTrigram.name}上{result.lowerTrigram.name}下
                    </div>
                  </div>

                  {/* 上下卦分解 */}
                  <div className="flex justify-center items-center gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl mb-1">{result.upperTrigram.symbol}</div>
                      <div className="text-sm text-pink-100">{result.upperTrigram.name}</div>
                      <div className="text-xs text-pink-200/60">上卦·{result.upperTrigram.nature}</div>
                    </div>
                    <div className="text-2xl text-pink-300">+</div>
                    <div className="text-center">
                      <div className="text-4xl mb-1">{result.lowerTrigram.symbol}</div>
                      <div className="text-sm text-pink-100">{result.lowerTrigram.name}</div>
                      <div className="text-xs text-pink-200/60">下卦·{result.lowerTrigram.nature}</div>
                    </div>
                    <div className="text-2xl text-pink-300">=</div>
                    <div className="text-center">
                      <div className="text-4xl mb-1">{result.hexagram.symbol}</div>
                      <div className="text-sm text-pink-100">{result.hexagram.name}</div>
                      <div className="text-xs text-pink-200/60">本卦</div>
                    </div>
                  </div>

                  {/* 卦辞 */}
                  <div className="bg-pink-900/40 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-bold text-pink-100 mb-2">卦辞</h4>
                    <p className="text-pink-200">{result.hexagram.judgement}</p>
                  </div>

                  {/* 象辞 */}
                  <div className="bg-pink-900/40 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-bold text-pink-100 mb-2">象辞</h4>
                    <p className="text-pink-200">{result.hexagram.image}</p>
                  </div>

                  {/* 动爻 */}
                  <div className="bg-pink-900/40 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-pink-100 mb-2">
                      动爻（第{result.changingLine}爻）
                    </h4>
                    <p className="text-pink-200">{result.hexagram.lines[result.changingLine - 1]}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 解读 */}
              <Card className="bg-gradient-to-r from-pink-900/60 to-rose-900/60 border-pink-400/30">
                <CardHeader>
                  <CardTitle className="text-xl text-pink-100">梅花易数解读</CardTitle>
                </CardHeader>
                <CardContent className="text-pink-100 leading-relaxed">
                  <p className="mb-4">
                    此卦为<strong className="text-pink-100">{result.hexagram.name}卦</strong>
                    （第{result.hexagram.number}卦），由{result.upperTrigram.name}卦（{result.upperTrigram.nature}）在上、
                    {result.lowerTrigram.name}卦（{result.lowerTrigram.nature}）在下组成。
                  </p>
                  <p className="mb-4">
                    上卦{result.upperTrigram.name}代表{result.upperTrigram.attribute}，
                    下卦{result.lowerTrigram.name}代表{result.lowerTrigram.attribute}。
                  </p>
                  <p className="mb-4">
                    第{result.changingLine}爻为动爻，象征事物发展的关键转折点。
                    动爻提示：{result.hexagram.lines[result.changingLine - 1].split('：')[1]}
                  </p>
                  <div className="mt-4 p-4 bg-pink-950/60 rounded-lg">
                    <p className="text-sm text-pink-100">
                      <strong className="text-pink-100">温馨提示：</strong>
                      梅花易数以数明理，仅供参考。人生道路需要自己把握，愿此卦带给您启示。
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 重新起卦 */}
              <div className="text-center">
                <Button
                  onClick={() => setResult(null)}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-12 py-6 text-lg"
                >
                  重新起卦
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
