'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Moon, Search, Sparkles } from 'lucide-react';

// 梦境解析数据
const dreamInterpretations: Record<string, { meaning: string; advice: string }> = {
  // 自然类
  '水': { meaning: '梦见水通常象征情感、财运或生命力。清水代表好运和财运，浑水则预示困难。', advice: '近期注意情绪管理，财运方面可能有转机。' },
  '火': { meaning: '梦见火象征热情、愤怒或变革。大火代表财运，小火代表内心的焦虑。', advice: '注意控制情绪，事业上可能有新的机遇。' },
  '山': { meaning: '梦见山象征困难、目标或成就感。登山代表克服困难，下山代表压力减轻。', advice: '面对困难要勇敢，成功就在前方。' },
  '天': { meaning: '梦见天空象征心境、理想或未来。晴空代表心情愉快，阴天代表忧虑。', advice: '保持乐观心态，前途光明。' },
  '月': { meaning: '梦见月亮象征女性、情感或直觉。满月代表圆满，新月代表新的开始。', advice: '情感方面可能有新的发展，相信直觉。' },
  '日': { meaning: '梦见太阳象征光明、希望和成功。阳光明媚代表好运，烈日当空代表压力。', advice: '事业运势上升，把握机会。' },
  '星': { meaning: '梦见星星象征希望、灵感和指引。繁星点点代表好运，流星代表愿望成真。', advice: '保持希望，贵人即将出现。' },
  '雨': { meaning: '梦见下雨象征洗涤、情感或阻碍。细雨代表好运，暴雨代表困难。', advice: '近期可能有转机，耐心等待。' },
  '雪': { meaning: '梦见下雪象征纯洁、安静或困难。瑞雪代表丰收，暴雪代表阻碍。', advice: '保持内心平静，静待花开。' },
  
  // 动物类
  '龙': { meaning: '梦见龙是大吉之兆，象征权力、成功和好运。代表事业腾飞，贵人相助。', advice: '事业运势极佳，大胆行动。' },
  '蛇': { meaning: '梦见蛇有不同含义，通常象征变化、智慧或小人。大蛇代表贵人，小蛇代表小人。', advice: '注意身边的人和事，防范小人。' },
  '虎': { meaning: '梦见老虎象征力量、权威或困难。骑虎代表成功，被虎追代表压力。', advice: '勇敢面对挑战，胜利在望。' },
  '马': { meaning: '梦见马象征事业、速度和自由。骑马代表事业顺利，马跑代表进展快速。', advice: '事业进展顺利，把握机遇。' },
  '狗': { meaning: '梦见狗象征忠诚、友谊或保护。温顺的狗代表朋友，凶狗代表冲突。', advice: '珍惜友情，注意人际交往。' },
  '猫': { meaning: '梦见猫象征灵性、独立或女性。温顺的猫代表好运，野猫代表不安。', advice: '相信直觉，注意身边女性。' },
  '鸟': { meaning: '梦见鸟象征自由、消息或灵感。飞鸟代表好消息，笼中鸟代表束缚。', advice: '近期可能有喜讯传来。' },
  '鱼': { meaning: '梦见鱼象征财富、机遇或情感。大鱼代表财运，小鱼代表小利。', advice: '财运上升，把握机会。' },
  
  // 人物类
  '死人': { meaning: '梦见死人并不凶险，反而可能代表新生或改变的开始。', advice: '不要害怕，这可能预示新的开始。' },
  '婴儿': { meaning: '梦见婴儿象征新生、希望或纯真。健康的婴儿代表好运，哭泣的婴儿代表烦恼。', advice: '新的机遇即将出现，保持纯真的心。' },
  '老人': { meaning: '梦见老人象征智慧、经验或需要帮助。慈祥的老人代表贵人，生病的老人代表忧虑。', advice: '多听取长辈建议，珍惜亲情。' },
  '亲人': { meaning: '梦见亲人象征思念、关心或家庭关系。愉快的相聚代表和谐，争吵代表需要沟通。', advice: '多关心家人，加强沟通。' },
  '朋友': { meaning: '梦见朋友象征友情、帮助或回忆。欢乐相聚代表友谊长久，争吵代表需要和解。', advice: '珍惜友情，主动联系朋友。' },
  '结婚': { meaning: '梦见结婚象征承诺、合作或新阶段。自己结婚代表新的开始，他人结婚代表喜讯。', advice: '新的阶段即将开始，做好准备。' },
  
  // 情景类
  '飞': { meaning: '梦见飞翔象征自由、成功或逃避。自由飞翔代表心胸开阔，艰难飞行代表压力。', advice: '放飞心灵，追求自由。' },
  '掉牙': { meaning: '梦见掉牙象征改变、焦虑或人际关系。无痛掉牙代表自然变化，疼痛掉牙代表烦恼。', advice: '注意人际关系，保持良好心态。' },
  '考试': { meaning: '梦见考试象征考验、压力或自我评估。考试顺利代表自信，考试失败代表焦虑。', advice: '放松心情，相信自己的能力。' },
  '迷路': { meaning: '梦见迷路象征困惑、选择或方向感缺失。找到出路代表解决困难，一直迷路代表迷茫。', advice: '冷静思考，明确方向。' },
  '追赶': { meaning: '梦见被追赶象征压力、恐惧或逃避。成功逃脱代表克服困难，被追上代表需要面对。', advice: '勇敢面对问题，不要逃避。' },
  '坠落': { meaning: '梦见坠落象征失控、不安或压力。坠落到底代表解脱，中途惊醒代表焦虑。', advice: '注意调整节奏，不要过于紧张。' },
  '怀孕': { meaning: '梦见怀孕象征新生、创意或期待。自己怀孕代表新的计划，他人怀孕代表喜讯。', advice: '新的项目或计划可能正在孕育中。' },
  '死亡': { meaning: '梦见死亡象征结束、转变或重生。自己的死亡代表新生，他人的死亡代表改变。', advice: '不要恐惧，这是改变的信号。' },
  
  // 物品类
  '钱': { meaning: '梦见钱象征价值、成功或机会。得到钱代表好运，失去钱代表担忧。', advice: '财运方面可能有变化，注意理财。' },
  '房子': { meaning: '梦见房子象征自我、家庭或安全感。新房代表新的开始，破房代表不安。', advice: '关注家庭和内心需求。' },
  '车': { meaning: '梦见车象征前进、控制或人生方向。开车代表掌控，坐车代表依赖。', advice: '把握人生方向，主动前进。' },
  '书': { meaning: '梦见书象征知识、智慧或秘密。读书代表学习，买书代表求知欲。', advice: '学习新知识，充实自己。' },
  '花': { meaning: '梦见花象征美好、爱情或成就。鲜花盛开代表好运，凋谢的花代表失落。', advice: '美好事物即将来临，保持期待。' },
  '食物': { meaning: '梦见食物象征需求、满足或欲望。美味佳肴代表满足，难吃的食物代表不满。', advice: '关注内心需求，适当满足自己。' },
};

export default function DreamInterpretPage() {
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<{ keyword: string; meaning: string; advice: string } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // 搜索建议
  const handleInput = (value: string) => {
    setKeyword(value);
    if (value.length > 0) {
      const matches = Object.keys(dreamInterpretations)
        .filter(key => key.includes(value))
        .slice(0, 6);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  // 解梦
  const interpret = () => {
    if (!keyword.trim()) return;
    
    const key = Object.keys(dreamInterpretations).find(
      k => k === keyword.trim() || keyword.trim().includes(k)
    );
    
    if (key) {
      setResult({
        keyword: key,
        meaning: dreamInterpretations[key].meaning,
        advice: dreamInterpretations[key].advice,
      });
    } else {
      setResult({
        keyword: keyword.trim(),
        meaning: '暂无此梦境的解析记录。梦境解析仅供参考，建议您结合自己的实际情况进行理解。梦境往往是潜意识的反映，可能与您最近的经历、情绪或想法有关。',
        advice: '建议您放松心情，保持良好的作息习惯。如果经常做相似的梦，可以尝试记录下来，分析可能的触发因素。',
      });
    }
    setSuggestions([]);
  };

  // 常见梦境
  const commonDreams = ['水', '蛇', '掉牙', '飞', '结婚', '死人', '钱', '龙'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-indigo-200 hover:text-indigo-100 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </Link>

        {/* 标题 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Moon className="w-10 h-10 text-indigo-300 mr-3" />
            <h1 className="text-4xl font-bold text-indigo-100">周公解梦</h1>
            <Moon className="w-10 h-10 text-indigo-300 ml-3" />
          </div>
          <p className="text-indigo-200/80">探索梦境的奥秘，解读潜意识的密码</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* 搜索区域 */}
          <Card className="bg-white/10 backdrop-blur-md border-indigo-300/30 mb-6">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-indigo-100">输入梦境关键词</CardTitle>
              <CardDescription className="text-indigo-200/60">
                输入梦中出现的事物、场景或情节，获取梦境解析
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  value={keyword}
                  onChange={(e) => handleInput(e.target.value)}
                  placeholder="例如：水、蛇、掉牙、飞..."
                  className="bg-white/10 border-indigo-300/30 text-indigo-100 placeholder:text-indigo-200/40 text-center text-xl h-14 pr-12"
                  onKeyDown={(e) => e.key === 'Enter' && interpret()}
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300/60" />
                
                {/* 搜索建议 */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-indigo-900/90 backdrop-blur-md rounded-lg border border-indigo-400/30 overflow-hidden z-10">
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 text-indigo-200 hover:bg-indigo-500/20 cursor-pointer"
                        onClick={() => {
                          setKeyword(s);
                          setSuggestions([]);
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center pt-2">
                <Button
                  onClick={interpret}
                  disabled={!keyword.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-12 py-6 text-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  开始解梦
                </Button>
              </div>

              {/* 常见梦境 */}
              <div className="pt-4">
                <p className="text-sm text-indigo-200/60 mb-3 text-center">常见梦境关键词：</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {commonDreams.map((dream) => (
                    <Button
                      key={dream}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setKeyword(dream);
                        interpret();
                      }}
                      className="bg-white/5 border-indigo-300/20 text-indigo-200 hover:bg-white/10 hover:text-indigo-100"
                    >
                      {dream}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 解梦结果 */}
          {result && (
            <Card className="bg-white/10 backdrop-blur-md border-indigo-300/30">
              <CardHeader>
                <CardTitle className="text-2xl text-indigo-100 text-center">
                  梦见「{result.keyword}」
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-indigo-950/60 rounded-lg p-6">
                  <h4 className="text-sm font-bold text-indigo-100 mb-3 flex items-center">
                    <Moon className="w-4 h-4 mr-2" />
                    梦境解析
                  </h4>
                  <p className="text-indigo-100 leading-relaxed">{result.meaning}</p>
                </div>

                <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 rounded-lg p-6 border border-indigo-400/30">
                  <h4 className="text-sm font-bold text-indigo-100 mb-3">💡 温馨提示</h4>
                  <p className="text-indigo-100 leading-relaxed">{result.advice}</p>
                </div>

                <div className="bg-indigo-950/50 rounded-lg p-4 text-center">
                  <p className="text-xs text-indigo-200/80">
                    梦境解析仅供参考，切勿过度迷信。保持良好心态，积极面对生活。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
