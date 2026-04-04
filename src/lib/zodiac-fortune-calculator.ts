/**
 * 生肖运势计算器 - 基于传统命理学真实计算
 * 
 * 计算要素：
 * 1. 地支关系（三合、六合、六冲、六害、三刑）
 * 2. 五行生克关系
 * 3. 值神吉凶
 * 4. 方位神煞
 */

import { Solar, Lunar, LunarUtil } from 'lunar-javascript';

// ==================== 类型定义 ====================

/** 生肖信息 */
export interface ZodiacInfo {
  name: string;           // 名称
  emoji: string;          // 表情
  earthlyBranch: string;  // 地支
  wuXing: string;         // 五行
}

/** 运势结果 */
export interface ZodiacFortune {
  zodiac: ZodiacInfo;
  overall: string;        // 整体运势描述
  overallScore: number;   // 整体运势分数 1-5
  career: string;         // 事业运描述
  careerScore: number;
  love: string;           // 爱情运描述
  loveScore: number;
  wealth: string;         // 财运描述
  wealthScore: number;
  health: string;         // 健康运描述
  healthScore: number;
  luckyColor: string;     // 幸运颜色
  luckyNumber: string;    // 幸运数字
  luckyDirection: string; // 幸运方位
  advice: string;         // 今日建议
  analysis: string;       // 运势分析（为何吉凶）
}

/** 地支关系类型 */
type ZhiRelationType = '三合' | '六合' | '六冲' | '六害' | '三刑' | '无';

/** 地支关系结果 */
interface ZhiRelation {
  type: ZhiRelationType;
  bonus: number;
  description: string;
}

// ==================== 基础数据 ====================

/** 十二生肖完整信息 */
export const ZODIAC_DATA: ZodiacInfo[] = [
  { name: '鼠', emoji: '🐭', earthlyBranch: '子', wuXing: '水' },
  { name: '牛', emoji: '🐮', earthlyBranch: '丑', wuXing: '土' },
  { name: '虎', emoji: '🐯', earthlyBranch: '寅', wuXing: '木' },
  { name: '兔', emoji: '🐰', earthlyBranch: '卯', wuXing: '木' },
  { name: '龙', emoji: '🐲', earthlyBranch: '辰', wuXing: '土' },
  { name: '蛇', emoji: '🐍', earthlyBranch: '巳', wuXing: '火' },
  { name: '马', emoji: '🐴', earthlyBranch: '午', wuXing: '火' },
  { name: '羊', emoji: '🐏', earthlyBranch: '未', wuXing: '土' },
  { name: '猴', emoji: '🐵', earthlyBranch: '申', wuXing: '金' },
  { name: '鸡', emoji: '🐔', earthlyBranch: '酉', wuXing: '金' },
  { name: '狗', emoji: '🐶', earthlyBranch: '戌', wuXing: '土' },
  { name: '猪', emoji: '🐷', earthlyBranch: '亥', wuXing: '水' },
];

/** 地支五行 */
const ZHI_WU_XING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

/** 天干五行 */
const GAN_WU_XING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

/** 五行相生关系：生者 → 被生者 */
const WU_XING_SHENG: Record<string, string> = {
  '木': '火',  // 木生火
  '火': '土',  // 火生土
  '土': '金',  // 土生金
  '金': '水',  // 金生水
  '水': '木',  // 水生木
};

/** 五行相克关系：克者 → 被克者 */
const WU_XING_KE: Record<string, string> = {
  '木': '土',  // 木克土
  '土': '水',  // 土克水
  '水': '火',  // 水克火
  '火': '金',  // 火克金
  '金': '木',  // 金克木
};

/** 三合局 */
const SAN_HE: Record<string, string[]> = {
  '申子辰': ['申', '子', '辰'],  // 水局
  '亥卯未': ['亥', '卯', '未'],  // 木局
  '寅午戌': ['寅', '午', '戌'],  // 火局
  '巳酉丑': ['巳', '酉', '丑'],  // 金局
};

/** 六合 */
const LIU_HE: [string, string][] = [
  ['子', '丑'],  // 鼠牛合
  ['寅', '亥'],  // 虎猪合
  ['卯', '戌'],  // 兔狗合
  ['辰', '酉'],  // 龙鸡合
  ['巳', '申'],  // 蛇猴合
  ['午', '未'],  // 马羊合
];

/** 六冲 */
const LIU_CHONG: [string, string][] = [
  ['子', '午'],  // 鼠马冲
  ['丑', '未'],  // 牛羊冲
  ['寅', '申'],  // 虎猴冲
  ['卯', '酉'],  // 兔鸡冲
  ['辰', '戌'],  // 龙狗冲
  ['巳', '亥'],  // 蛇猪冲
];

/** 六害 */
const LIU_HAI: [string, string][] = [
  ['子', '未'],  // 鼠羊害
  ['丑', '午'],  // 牛马害
  ['寅', '巳'],  // 虎蛇害
  ['卯', '辰'],  // 兔龙害
  ['申', '亥'],  // 猪猴害
  ['酉', '戌'],  // 鸡狗害
];

/** 三刑 */
const SAN_XING: [string, string, string][] = [
  ['寅', '巳', '申'],  // 无恩之刑
  ['丑', '戌', '未'],  // 恃势之刑
  ['子', '卯', ''],    // 无礼之刑
];

/** 吉值神 */
const JI_ZHI_SHEN = ['青龙', '明堂', '金匮', '天德', '玉堂', '司命'];

/** 凶值神 */
const XIONG_ZHI_SHEN = ['天刑', '朱雀', '白虎', '天牢', '玄武', '勾陈'];

/** 五行对应的颜色 */
const WU_XING_COLORS: Record<string, string[]> = {
  '木': ['绿色', '青色'],
  '火': ['红色', '紫色', '粉色'],
  '土': ['黄色', '棕色', '咖啡色'],
  '金': ['白色', '金色', '银色'],
  '水': ['蓝色', '黑色', '灰色'],
};

/** 五行对应的数字 */
const WU_XING_NUMBERS: Record<string, string[]> = {
  '木': ['3', '8'],
  '火': ['2', '7'],
  '土': ['5', '0'],
  '金': ['4', '9'],
  '水': ['1', '6'],
};

/** 五行对应的方位 */
const WU_XING_DIRECTIONS: Record<string, string[]> = {
  '木': ['东方', '东南'],
  '火': ['南方'],
  '土': ['中央', '东北', '西南'],
  '金': ['西方', '西北'],
  '水': ['北方'],
};

/** 运势文案 */
const FORTUNE_TEXTS = {
  level5: {
    overall: '大吉大利，万事亨通',
    career: '事业顺遂，贵人提携，升职加薪可期',
    love: '桃花运旺，姻缘美满，感情甜蜜',
    wealth: '财运亨通，正财偏财皆旺',
    health: '精力充沛，身心康健',
    advice: '今日宜积极进取，把握良机，大胆行动必有收获。',
  },
  level4: {
    overall: '运势上佳，把握机遇',
    career: '工作顺利，有贵人相助，可展宏图',
    love: '感情顺遂，可遇良人或增进感情',
    wealth: '财运不错，可小试手气',
    health: '精神状态佳，宜多运动',
    advice: '今日运势不错，适合开展新计划，把握机会。',
  },
  level3: {
    overall: '平稳顺利，稳中求进',
    career: '工作平稳，按部就班即可',
    love: '感情平淡，宜多沟通',
    wealth: '正财稳定，不宜冒险',
    health: '注意休息，保持作息',
    advice: '今日运势平稳，适合处理日常事务，稳扎稳打。',
  },
  level2: {
    overall: '小有波折，谨慎行事',
    career: '工作有小阻，需耐心应对',
    love: '感情有波折，宜冷静沟通',
    wealth: '财运欠佳，注意开支',
    health: '小心感冒，注意饮食',
    advice: '今日运势欠佳，宜谨慎行事，避免冲动决定。',
  },
  level1: {
    overall: '宜静不宜动，韬光养晦',
    career: '事业受阻，宜守不宜攻',
    love: '感情不顺，宜独处静心',
    wealth: '财运低迷，不宜投资',
    health: '注意身体，宜静养',
    advice: '今日运势低迷，宜静不宜动，韬光养晦，待时而动。',
  },
};

// ==================== 核心计算函数 ====================

/**
 * 获取地支关系
 */
function getZhiRelation(zodiacZhi: string, dayZhi: string): ZhiRelation {
  // 1. 检查三合
  for (const [group, zhis] of Object.entries(SAN_HE)) {
    if (zhis.includes(zodiacZhi) && zhis.includes(dayZhi)) {
      return {
        type: '三合',
        bonus: 1.5,
        description: `${zodiacZhi}${dayZhi}三合（${group}局），大吉`,
      };
    }
  }
  
  // 2. 检查六合
  for (const [zhi1, zhi2] of LIU_HE) {
    if ((zhi1 === zodiacZhi && zhi2 === dayZhi) || (zhi2 === zodiacZhi && zhi1 === dayZhi)) {
      return {
        type: '六合',
        bonus: 1,
        description: `${zodiacZhi}${dayZhi}六合，吉祥`,
      };
    }
  }
  
  // 3. 检查六冲
  for (const [zhi1, zhi2] of LIU_CHONG) {
    if ((zhi1 === zodiacZhi && zhi2 === dayZhi) || (zhi2 === zodiacZhi && zhi1 === dayZhi)) {
      return {
        type: '六冲',
        bonus: -2,
        description: `${zodiacZhi}${dayZhi}相冲，大凶`,
      };
    }
  }
  
  // 4. 检查六害
  for (const [zhi1, zhi2] of LIU_HAI) {
    if ((zhi1 === zodiacZhi && zhi2 === dayZhi) || (zhi2 === zodiacZhi && zhi1 === dayZhi)) {
      return {
        type: '六害',
        bonus: -1,
        description: `${zodiacZhi}${dayZhi}相害，不利`,
      };
    }
  }
  
  // 5. 检查三刑
  for (const [zhi1, zhi2, zhi3] of SAN_XING) {
    const xingGroup = [zhi1, zhi2, zhi3].filter(z => z);
    if (xingGroup.includes(zodiacZhi) && xingGroup.includes(dayZhi)) {
      return {
        type: '三刑',
        bonus: -1,
        description: `${zodiacZhi}${dayZhi}相刑，有阻`,
      };
    }
  }
  
  return {
    type: '无',
    bonus: 0,
    description: `${zodiacZhi}${dayZhi}无特殊关系`,
  };
}

/**
 * 获取五行生克关系
 */
function getWuXingRelation(zodiacWuXing: string, dayGanWuXing: string): { bonus: number; description: string } {
  // 相同
  if (zodiacWuXing === dayGanWuXing) {
    return { bonus: 0.3, description: `五行比和（同属${zodiacWuXing}），互助` };
  }
  
  // 日干生生肖
  if (WU_XING_SHENG[dayGanWuXing] === zodiacWuXing) {
    return { bonus: 0.5, description: `日干${dayGanWuXing}生生肖${zodiacWuXing}，得助` };
  }
  
  // 生肖生日干
  if (WU_XING_SHENG[zodiacWuXing] === dayGanWuXing) {
    return { bonus: 0.2, description: `生肖${zodiacWuXing}生日干${dayGanWuXing}，付出有得` };
  }
  
  // 生肖克日干
  if (WU_XING_KE[zodiacWuXing] === dayGanWuXing) {
    return { bonus: -0.3, description: `生肖${zodiacWuXing}克日干${dayGanWuXing}，克制` };
  }
  
  // 日干克生肖
  if (WU_XING_KE[dayGanWuXing] === zodiacWuXing) {
    return { bonus: -0.5, description: `日干${dayGanWuXing}克生肖${zodiacWuXing}，受压` };
  }
  
  return { bonus: 0, description: '五行关系正常' };
}

/**
 * 获取值神影响
 */
function getZhiShenBonus(zhiShen: string): { bonus: number; description: string } {
  if (JI_ZHI_SHEN.includes(zhiShen)) {
    return { bonus: 0.5, description: `${zhiShen}值日，主吉` };
  }
  if (XIONG_ZHI_SHEN.includes(zhiShen)) {
    return { bonus: -0.5, description: `${zhiShen}值日，主凶` };
  }
  return { bonus: 0, description: '值神中性' };
}

/**
 * 根据分数获取运势文案
 */
function getFortuneText(score: number): typeof FORTUNE_TEXTS.level3 {
  if (score >= 4.5) return FORTUNE_TEXTS.level5;
  if (score >= 3.5) return FORTUNE_TEXTS.level4;
  if (score >= 2.5) return FORTUNE_TEXTS.level3;
  if (score >= 1.5) return FORTUNE_TEXTS.level2;
  return FORTUNE_TEXTS.level1;
}

/**
 * 计算幸运颜色
 * 原则：取生助生肖五行的颜色
 */
function calculateLuckyColor(zodiacWuXing: string): string {
  // 找到生生肖五行的五行
  let shengWuXing = '';
  for (const [wx, target] of Object.entries(WU_XING_SHENG)) {
    if (target === zodiacWuXing) {
      shengWuXing = wx;
      break;
    }
  }
  
  // 优先取生者的颜色，其次取自己的颜色
  const colors = shengWuXing ? WU_XING_COLORS[shengWuXing] : WU_XING_COLORS[zodiacWuXing];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 计算幸运数字
 */
function calculateLuckyNumber(zodiacWuXing: string): string {
  let shengWuXing = '';
  for (const [wx, target] of Object.entries(WU_XING_SHENG)) {
    if (target === zodiacWuXing) {
      shengWuXing = wx;
      break;
    }
  }
  
  const numbers = shengWuXing ? WU_XING_NUMBERS[shengWuXing] : WU_XING_NUMBERS[zodiacWuXing];
  return numbers[Math.floor(Math.random() * numbers.length)];
}

/**
 * 计算幸运方位
 */
function calculateLuckyDirection(zodiacWuXing: string, caiShenDirection: string): string {
  // 优先使用财神方位
  if (caiShenDirection) {
    return caiShenDirection;
  }
  
  // 否则取生方
  let shengWuXing = '';
  for (const [wx, target] of Object.entries(WU_XING_SHENG)) {
    if (target === zodiacWuXing) {
      shengWuXing = wx;
      break;
    }
  }
  
  const directions = shengWuXing ? WU_XING_DIRECTIONS[shengWuXing] : WU_XING_DIRECTIONS[zodiacWuXing];
  return directions[Math.floor(Math.random() * directions.length)];
}

/**
 * 计算分项运势额外加成
 */
function calculateExtraBonus(
  type: 'career' | 'love' | 'wealth' | 'health',
  zodiacZhi: string,
  lunar: Lunar
): number {
  let bonus = 0;
  
  const dayGan = lunar.getDayGan();
  const dayZhi = lunar.getDayZhi();
  const dayGanWuXing = GAN_WU_XING[dayGan];
  
  switch (type) {
    case 'career':
      // 官星/印星加持
      // 官星：克我者（如木生肖，金为官）
      const guanWuXing = Object.keys(WU_XING_KE).find(k => WU_XING_KE[k] === ZHI_WU_XING[zodiacZhi]);
      if (guanWuXing === dayGanWuXing) bonus += 0.3;
      // 印星：生我者
      const yinWuXing = Object.keys(WU_XING_SHENG).find(k => WU_XING_SHENG[k] === ZHI_WU_XING[zodiacZhi]);
      if (yinWuXing === dayGanWuXing) bonus += 0.2;
      break;
      
    case 'love':
      // 桃花位：子午卯酉为桃花
      const taoHua = ['子', '午', '卯', '酉'];
      if (taoHua.includes(dayZhi)) bonus += 0.3;
      // 六合日利感情
      for (const [zhi1, zhi2] of LIU_HE) {
        if ((zhi1 === zodiacZhi && zhi2 === dayZhi) || (zhi2 === zodiacZhi && zhi1 === dayZhi)) {
          bonus += 0.2;
        }
      }
      break;
      
    case 'wealth':
      // 财星：我克者（如木生肖，土为财）
      const caiWuXing = WU_XING_KE[ZHI_WU_XING[zodiacZhi]];
      if (caiWuXing === dayGanWuXing) bonus += 0.3;
      // 财神方位相关
      const caiShen = lunar.getDayPositionCaiDesc();
      if (caiShen) bonus += 0.1;
      break;
      
    case 'health':
      // 无冲克则健康运好
      let hasChong = false;
      for (const [zhi1, zhi2] of LIU_CHONG) {
        if ((zhi1 === zodiacZhi && zhi2 === dayZhi) || (zhi2 === zodiacZhi && zhi1 === dayZhi)) {
          hasChong = true;
        }
      }
      if (!hasChong) bonus += 0.2;
      // 天芮星（病星）不临生肖方位
      // 简化处理：若无相害，健康运稍好
      let hasHai = false;
      for (const [zhi1, zhi2] of LIU_HAI) {
        if ((zhi1 === zodiacZhi && zhi2 === dayZhi) || (zhi2 === zodiacZhi && zhi1 === dayZhi)) {
          hasHai = true;
        }
      }
      if (!hasHai) bonus += 0.1;
      break;
  }
  
  return bonus;
}

// ==================== 主函数 ====================

/**
 * 计算生肖运势
 */
export function calculateZodiacFortune(
  zodiacName: string,
  date: Date = new Date()
): ZodiacFortune {
  // 获取生肖信息
  const zodiac = ZODIAC_DATA.find(z => z.name === zodiacName);
  if (!zodiac) {
    throw new Error(`未知生肖: ${zodiacName}`);
  }
  
  // 获取历法信息
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  const dayGan = lunar.getDayGan();
  const dayZhi = lunar.getDayZhi();
  const dayGanWuXing = GAN_WU_XING[dayGan];
  const zhiShen = lunar.getZhiXing();
  const caiShenDirection = lunar.getDayPositionCaiDesc();
  
  // 1. 计算地支关系
  const zhiRelation = getZhiRelation(zodiac.earthlyBranch, dayZhi);
  
  // 2. 计算五行生克
  const wuXingRelation = getWuXingRelation(zodiac.wuXing, dayGanWuXing);
  
  // 3. 计算值神影响
  const zhiShenEffect = getZhiShenBonus(zhiShen);
  
  // 4. 计算基础分数（基准3分）
  let baseScore = 3;
  baseScore += zhiRelation.bonus;
  baseScore += wuXingRelation.bonus;
  baseScore += zhiShenEffect.bonus;
  
  // 5. 限制在 1-5 分
  const clampScore = (s: number) => Math.max(1, Math.min(5, s));
  
  // 6. 计算各分项运势
  const careerBonus = calculateExtraBonus('career', zodiac.earthlyBranch, lunar);
  const loveBonus = calculateExtraBonus('love', zodiac.earthlyBranch, lunar);
  const wealthBonus = calculateExtraBonus('wealth', zodiac.earthlyBranch, lunar);
  const healthBonus = calculateExtraBonus('health', zodiac.earthlyBranch, lunar);
  
  const overallScore = clampScore(baseScore);
  const careerScore = clampScore(baseScore + careerBonus);
  const loveScore = clampScore(baseScore + loveBonus);
  const wealthScore = clampScore(baseScore + wealthBonus);
  const healthScore = clampScore(baseScore + healthBonus);
  
  // 7. 获取文案
  const texts = getFortuneText(overallScore);
  const careerTexts = getFortuneText(careerScore);
  const loveTexts = getFortuneText(loveScore);
  const wealthTexts = getFortuneText(wealthScore);
  const healthTexts = getFortuneText(healthScore);
  
  // 8. 生成分析说明
  const analysis = [
    zhiRelation.description,
    wuXingRelation.description,
    zhiShenEffect.description,
  ].filter(s => !s.includes('无特殊') && !s.includes('正常') && !s.includes('中性')).join('；');
  
  return {
    zodiac,
    overall: texts.overall,
    overallScore,
    career: careerTexts.career,
    careerScore,
    love: loveTexts.love,
    loveScore,
    wealth: wealthTexts.wealth,
    wealthScore,
    health: healthTexts.health,
    healthScore,
    luckyColor: calculateLuckyColor(zodiac.wuXing),
    luckyNumber: calculateLuckyNumber(zodiac.wuXing),
    luckyDirection: calculateLuckyDirection(zodiac.wuXing, caiShenDirection),
    advice: texts.advice,
    analysis: analysis || '今日运势平稳，无特殊吉凶。',
  };
}

/**
 * 获取生肖列表
 */
export function getZodiacList(): ZodiacInfo[] {
  return ZODIAC_DATA;
}

/**
 * 根据出生年份获取生肖
 */
export function getZodiacByBirthYear(year: number): ZodiacInfo {
  // 生肖对应的地支序号（从子鼠开始）
  const zodiacOrder = (year - 4) % 12; // 公元4年为鼠年
  return ZODIAC_DATA[zodiacOrder >= 0 ? zodiacOrder : zodiacOrder + 12];
}
