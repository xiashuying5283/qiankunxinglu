import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 基础周易科普词条数据
const GLOSSARY_DATA = [
  // 周易基础术语
  {
    term: '卦',
    category: 'iching',
    short_desc: '周易的基本符号单位，由六爻组成，共六十四卦。',
    full_desc: `卦是《周易》的核心概念，由阴爻（--）和阳爻（—）两种基本符号组成。

六爻自下而上排列，形成六十四种不同的组合，即六十四卦。每一卦代表一种特定的情境或状态，蕴含着天地万物的变化规律。

卦的组成包括：
• 下卦（内卦）：下面三爻
• 上卦（外卦）：上面三爻

通过卦象，古人总结出一套认识世界、指导行为的智慧体系。`,
    origin: '《周易·系辞》："易有太极，是生两仪，两仪生四象，四象生八卦。"',
    examples: ['乾卦代表天、刚健', '坤卦代表地、柔顺', '坎卦代表水、险陷'],
    related_terms: ['爻', '八卦', '六十四卦'],
    references: [
      { title: '周易正义', author: '王弼 注，孔颖达 疏', publisher: '中华书局', year: '1980' },
      { title: '周易本义', author: '朱熹', publisher: '中华书局', year: '2009' },
    ],
  },
  {
    term: '爻',
    category: 'iching',
    short_desc: '组成卦的基本符号，分阴爻和阳爻两种。',
    full_desc: `爻是构成卦象的基本单位，分为阴爻和阳爻：

• 阳爻（—）：代表阳刚、主动、创造性
• 阴爻（--）：代表阴柔、被动、承接性

每卦六爻，自下而上依次为：初爻、二爻、三爻、四爻、五爻、上爻。

爻的位置和性质决定了一卦的含义：
• 初爻：代表事物开始
• 二爻：代表积蓄力量
• 三爻：代表小有成就
• 四爻：代表进入高层
• 五爻：代表事业巅峰
• 上爻：代表事物终结`,
    origin: '《周易·系辞》："爻者，言乎变者也。"',
    examples: ['初九为阳爻居初位', '六二为阴爻居二位'],
    related_terms: ['卦', '阴爻', '阳爻', '爻位'],
    references: [
      { title: '周易正义', author: '王弼 注，孔颖达 疏', publisher: '中华书局', year: '1980' },
    ],
  },
  {
    term: '本卦',
    category: 'iching',
    short_desc: '占卜时最初得出的卦象，代表事物的初始状态。',
    full_desc: `本卦是占卜过程中最初形成的卦象，代表问事时事物的初始状态或当前状况。

在占卜实践中：
• 本卦反映问题的现状和背景
• 通过分析本卦的卦辞、爻辞来理解当前处境
• 本卦是解卦的主要依据

本卦与变卦的关系：
• 无变爻时，只看本卦卦辞
• 有变爻时，本卦与变卦结合解读
• 本卦为"体"，变卦为"用"`,
    examples: ['占得乾卦为本卦，代表刚健进取的状态', '占得坤卦为本卦，代表柔顺承载的状态'],
    related_terms: ['变卦', '卦辞', '爻辞'],
    references: [
      { title: '易经入门', author: '傅佩荣', publisher: '新星出版社', year: '2011' },
    ],
  },
  {
    term: '变卦',
    category: 'iching',
    short_desc: '由动爻变化后形成的新卦，代表事物的发展趋势。',
    full_desc: `变卦是由本卦中的动爻（老阳、老阴）变化后形成的新卦象，代表事物未来的发展方向和结果。

变卦的形成：
• 老阳（○）变为阴爻
• 老阴（×）变为阳爻
• 少阳、少阴不变

变卦的解读：
• 变卦揭示事物发展的趋向
• 结合本卦与变卦判断吉凶
• 变卦体现"变易"的哲学思想`,
    origin: '《周易·系辞》："易之为书也不可远，为道也屡迁，变动不居，周流六虚。"',
    examples: ['本卦乾卦变坤卦，由刚转柔', '本卦坎卦变离卦，由险转明'],
    related_terms: ['本卦', '动爻', '老阳', '老阴'],
  },
  {
    term: '动爻',
    category: 'iching',
    short_desc: '占卜时出现的变化之爻，决定变卦的形成。',
    full_desc: `动爻是占卜过程中出现老阳或老阴的爻位，代表事物变化的契机和关键。

动爻的判断：
• 老阳（九）：三枚铜钱皆正，阳极必变阴
• 老阴（六）：三枚铜钱皆反，阴极必变阳

动爻的解卦规则：
• 一爻动：以本卦动爻爻辞为主
• 二爻动：以本卦上动爻爻辞为主
• 三爻动：以本卦、变卦卦辞合看
• 四爻动：以变卦下静爻爻辞为主
• 五爻动：以变卦静爻爻辞为主
• 六爻动：乾坤看用辞，余卦以变卦卦辞为主`,
    origin: '《周易·系辞》："爻象动乎内，吉凶见乎外。"',
    examples: ['初爻动，事物刚开始就有变化', '五爻动，核心位置发生变化'],
    related_terms: ['老阳', '老阴', '变卦', '爻辞'],
  },
  {
    term: '卦辞',
    category: 'iching',
    short_desc: '解释全卦含义的文字，是解卦的重要依据。',
    full_desc: `卦辞是每卦后面的总括性文字，概括了该卦的整体含义和吉凶判断。

卦辞的特点：
• 言简意赅，寓意深远
• 包含吉凶、利弊、行事建议
• 结合卦象的象征意义

卦辞的作用：
• 提供整体判断依据
• 指导行为方向
• 揭示事物发展规律`,
    origin: '《周易》每卦皆有卦辞，如乾卦："元亨利贞。"',
    examples: ['乾卦卦辞：元亨利贞', '坤卦卦辞：元亨，利牝马之贞'],
    related_terms: ['爻辞', '彖传', '象传'],
  },
  {
    term: '爻辞',
    category: 'iching',
    short_desc: '解释每一爻含义的文字，针对具体位置和情境。',
    full_desc: `爻辞是每爻后面的解释性文字，说明该爻所处位置的意义和行为指导。

爻辞的特点：
• 每卦六爻，各有爻辞
• 针对具体情境，更为细致
• 常用比喻和象征

爻位与爻辞的关系：
• 初爻：事之始，多潜藏
• 二爻：得中位，多誉辞
• 三爻：多凶险，需谨慎
• 四爻：近君位，多恐惧
• 五爻：君位，多功成
• 上爻：事之终，多亢悔`,
    origin: '《周易》每爻皆有爻辞，如乾卦初九："潜龙勿用。"',
    examples: ['乾卦九三："君子终日乾乾，夕惕若，厉无咎。"', '坤卦六二："直方大，不习无不利。"' ],
    related_terms: ['卦辞', '动爻', '爻位'],
  },
  {
    term: '八卦',
    category: 'iching',
    short_desc: '由三爻组成的基本卦象，是六十四卦的基础。',
    full_desc: `八卦是由三爻组成的基本卦象，代表八种自然现象和基本力量。

八卦的组成：
• 乾（☰）：天，刚健
• 坤（☷）：地，柔顺
• 震（☳）：雷，动
• 巽（☴）：风，入
• 坎（☵）：水，险
• 离（☲）：火，明
• 艮（☶）：山，止
• 兑（☱）：泽，悦

八卦的记忆口诀：
"乾三连，坤六断，震仰仰盂，艮覆碗，离中虚，坎中满，兑上缺，巽下断。"

两两相重，形成六十四卦。`,
    origin: '《周易·说卦》详细论述了八卦的象征意义。',
    examples: ['乾坤为天地定位', '坎离为水火不相射'],
    related_terms: ['六十四卦', '卦', '爻'],
  },
  {
    term: '体用',
    category: 'iching',
    short_desc: '梅花易数中的核心概念，体卦为主，用卦为客。',
    full_desc: `体用是梅花易数断卦的核心方法，通过区分体卦和用卦来判断吉凶。

体卦与用卦的确定：
• 有动爻的八卦为用卦
• 无动爻的八卦为体卦
• 体卦代表自己，用卦代表他人或环境

体用生克关系：
• 用生体：大吉，有助益
• 体用比和：吉，互助互利
• 体生用：凶，消耗自己
• 用克体：大凶，受到伤害

体用关系是梅花易数断卦的主要依据。`,
    origin: '梅花易数为宋代邵雍所创，以体用生克为核心方法。',
    examples: ['体卦为乾金，用卦为坤土，土生金，用生体为吉', '体卦为震木，用卦为兑金，金克木，用克体为凶'],
    related_terms: ['梅花易数', '生克', '八卦'],
  },
  {
    term: '元亨利贞',
    category: 'iching',
    short_desc: '乾卦卦辞，代表四种德性和完美状态。',
    full_desc: `元亨利贞是乾卦的卦辞，被历代学者解读为四种德性：

• 元：始，万物创始，对应春天
• 亨：通，通达顺畅，对应夏天
• 利：和，和谐有利，对应秋天
• 贞：正，坚守正道，对应冬天

四种德性的内涵：
• 元者，善之长也——仁
• 亨者，嘉之会也——礼
• 利者，义之和也——义
• 贞者，事之干也——智

元亨利贞代表了事物发展的完整过程：创始、发展、成熟、收藏。`,
    origin: '《周易·乾卦》："乾，元亨利贞。"',
    examples: ['乾卦以元亨利贞示人以天道', '君子行四德则无不利'],
    related_terms: ['乾卦', '卦辞', '四德'],
  },
  {
    term: '老阳',
    category: 'iching',
    short_desc: '占卜中三枚铜钱皆正的结果，阳极变阴。',
    full_desc: `老阳是铜钱占卜法中的一种结果，代表阳爻发展到了极点。

老阳的形成：
• 三枚铜钱皆为正面（字面）
• 在卦象中记为"○"或"九"
• 阳极必反，故变而为阴

老阳的意义：
• 代表阳刚之力达到顶峰
• 物极必反，即将转为阴柔
• 在解卦时以本卦爻辞为主`,
    origin: '《周易》以"九"称阳爻，老阳为"老阳之数九"。',
    examples: ['占得老阳于初爻，初爻由阳变阴', '老阳代表事物发展到顶点'],
    related_terms: ['老阴', '动爻', '变卦'],
  },
  {
    term: '老阴',
    category: 'iching',
    short_desc: '占卜中三枚铜钱皆反的结果，阴极变阳。',
    full_desc: `老阴是铜钱占卜法中的一种结果，代表阴爻发展到了极点。

老阴的形成：
• 三枚铜钱皆为反面（花面）
• 在卦象中记为"×"或"六"
• 阴极必反，故变而为阳

老阴的意义：
• 代表阴柔之力达到顶峰
• 物极必反，即将转为阳刚
• 在解卦时以本卦爻辞为主`,
    origin: '《周易》以"六"称阴爻，老阴为"老阴之数六"。',
    examples: ['占得老阴于三爻，三爻由阴变阳', '老阴代表事物积蓄待发'],
    related_terms: ['老阳', '动爻', '变卦'],
  },
  {
    term: '六十四卦',
    category: 'iching',
    short_desc: '八卦相重形成的完整卦象体系，涵盖天地万物变化。',
    full_desc: `六十四卦是由八卦两两相重形成的完整卦象体系，共六十四种组合。

六十四卦的分类：
• 上经三十卦：从乾坤到坎离，侧重天道
• 下经三十四卦：从咸恒到既济未济，侧重人事

六十四卦的排列：
• 反映事物发展的规律
• 相邻之卦常互为反对
• 体现阴阳消长变化

六十四卦涵盖天地人生各种情境，是古人智慧的结晶。`,
    origin: '《周易》经文分上下两篇，共六十四卦。',
    examples: ['乾坤为六十四卦之首', '既济未济为六十四卦之终'],
    related_terms: ['八卦', '卦', '上经', '下经'],
  },
  {
    term: '生克',
    category: 'iching',
    short_desc: '五行之间的相生相克关系，是判断吉凶的重要依据。',
    full_desc: `生克是五行学说中的核心概念，描述事物之间的相互关系。

五行相生：
• 木生火
• 火生土
• 土生金
• 金生水
• 水生木

五行相克：
• 木克土
• 土克水
• 水克火
• 火克金
• 金克木

在梅花易数中的应用：
• 用生体：大吉
• 体用比和：吉
• 体生用：小凶
• 用克体：大凶`,
    origin: '五行学说源于古代对自然现象的观察总结。',
    examples: ['金生水，用金生体水为吉', '水克火，用水克体火为凶'],
    related_terms: ['五行', '体用', '梅花易数'],
  },
];

/**
 * 初始化科普词条数据
 * POST /api/glossary/init
 */
export async function POST() {
  try {
    const client = getSupabaseClient();
    
    // 先检查表是否存在，如果不存在则尝试创建
    const { error: checkError } = await client
      .from('glossary')
      .select('id')
      .limit(1);
    
    if (checkError) {
      // 表不存在，需要通过 db upgrade 创建
      console.log('Glossary table check:', checkError.message);
    }
    
    // 检查是否已有数据
    const { data: existing } = await client
      .from('glossary')
      .select('id')
      .limit(1);
    
    if (existing && existing.length > 0) {
      // 数据已存在，尝试更新参考文献
      let updated = 0;
      for (const item of GLOSSARY_DATA) {
        if (item.references && item.references.length > 0) {
          try {
            const { error: updateError } = await client
              .from('glossary')
              .update({ references: item.references })
              .eq('term', item.term);
            if (!updateError) updated++;
          } catch {
            // references 列可能不存在，跳过
          }
        }
      }
      return NextResponse.json({ 
        message: '数据已存在，参考文献已更新',
        count: existing.length,
        updated
      });
    }
    
    // 插入数据
    const { error } = await client
      .from('glossary')
      .insert(GLOSSARY_DATA);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      message: '初始化成功',
      count: GLOSSARY_DATA.length 
    });
  } catch (error) {
    console.error('初始化科普词条失败:', error);
    return NextResponse.json({ 
      error: '初始化失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
