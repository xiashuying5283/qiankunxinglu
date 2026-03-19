/**
 * 姻缘匹配算法库
 * 包含：八字计算（基于lunar-javascript）、生肖配对、八字配对、综合评分
 */

import {
  calculateBazi as calculateBaziFromLunar,
  type BaziData,
  type CalendarType,
  tianGan,
  diZhi,
  wuXing,
  shengXiao,
  tianGanWuXing,
  diZhiWuXing,
  diZhiShengXiao
} from './bazi-calculator';

// ==================== 生肖配对数据 ====================

// 六合（最佳配对）- 互相吸引，天生一对
export const liuHe: Record<string, string> = {
  '鼠': '牛', '牛': '鼠',
  '虎': '猪', '猪': '虎',
  '兔': '狗', '狗': '兔',
  '龙': '鸡', '鸡': '龙',
  '蛇': '猴', '猴': '蛇',
  '马': '羊', '羊': '马'
};

// 三合（良好配对）- 性格相投，和谐相处
export const sanHe: Record<string, string[]> = {
  '鼠': ['龙', '猴'], '龙': ['鼠', '猴'], '猴': ['鼠', '龙'], // 水局
  '牛': ['蛇', '鸡'], '蛇': ['牛', '鸡'], '鸡': ['牛', '蛇'], // 金局
  '虎': ['马', '狗'], '马': ['虎', '狗'], '狗': ['虎', '马'], // 火局
  '兔': ['羊', '猪'], '羊': ['兔', '猪'], '猪': ['兔', '羊']  // 木局
};

// 相冲（不宜配对）- 性格冲突，矛盾较多
export const xiangChong: Record<string, string> = {
  '鼠': '马', '马': '鼠',
  '牛': '羊', '羊': '牛',
  '虎': '猴', '猴': '虎',
  '兔': '鸡', '鸡': '兔',
  '龙': '狗', '狗': '龙',
  '蛇': '猪', '猪': '蛇'
};

// 相害（中等不利）- 易有矛盾，需要磨合
export const xiangHai: Record<string, string> = {
  '鼠': '羊', '羊': '鼠',
  '牛': '马', '马': '牛',
  '虎': '蛇', '蛇': '虎',
  '兔': '龙', '龙': '兔',
  '猴': '猪', '猪': '猴',
  '鸡': '狗', '狗': '鸡'
};

// 相刑（需要注意）- 可能有不和
export const xiangXing: [string, string, string][] = [
  ['虎', '蛇', '猴'], // 寅巳申三刑
  ['牛', '狗', '羊'], // 丑戌未三刑
];

// ==================== 类型导出 ====================

// 导出 BaziResult 类型（与 BaziData 相同）
export type BaziResult = BaziData;

// ==================== 八字计算函数 ====================

/**
 * 计算完整八字（使用 lunar-javascript 精确算法）
 * @param year 公历年
 * @param month 公历月
 * @param day 公历日
 * @param hour 时辰（0-23）
 * @param isLunar 是否农历（默认 false）
 */
export function calculateBaziFromSolar(
  year: number, 
  month: number, 
  day: number, 
  hour: number,
  isLunar: boolean = false
): BaziResult {
  const input: CalendarType = {
    isLunar,
    year,
    month,
    day,
    hour
  };
  
  return calculateBaziFromLunar(input);
}

// 保持原有函数签名兼容（公历输入）
export function calculateBazi(year: number, month: number, day: number, hour: number): BaziResult {
  return calculateBaziFromSolar(year, month, day, hour, false);
}

// ==================== 生肖配对分析 ====================

export interface ShengXiaoMatchResult {
  score: number;
  relation: string;
  description: string;
}

export function analyzeShengXiaoMatch(sx1: string, sx2: string): ShengXiaoMatchResult {
  // 六合 - 最佳配对
  if (liuHe[sx1] === sx2) {
    return {
      score: 95,
      relation: '六合',
      description: `${sx1}与${sx2}属六合生肖，天生一对，性格互补，感情和谐美满。彼此吸引力强，相处融洽，是最好的生肖配对之一。`
    };
  }
  
  // 三合 - 良好配对
  if (sanHe[sx1]?.includes(sx2)) {
    return {
      score: 85,
      relation: '三合',
      description: `${sx1}与${sx2}属三合生肖，性格相投，志同道合。两人相处和谐，互相支持，是很好的生肖配对。`
    };
  }
  
  // 相冲 - 不宜配对
  if (xiangChong[sx1] === sx2) {
    return {
      score: 40,
      relation: '相冲',
      description: `${sx1}与${sx2}属相冲生肖，性格差异较大，容易产生矛盾和冲突。需要更多的理解、包容和沟通才能维系感情。`
    };
  }
  
  // 相害 - 中等不利
  if (xiangHai[sx1] === sx2) {
    return {
      score: 55,
      relation: '相害',
      description: `${sx1}与${sx2}属相害生肖，相处中可能会有一些摩擦和误解。需要多沟通、多理解，用心经营感情。`
    };
  }
  
  // 相刑
  for (const group of xiangXing) {
    if (group.includes(sx1) && group.includes(sx2)) {
      return {
        score: 50,
        relation: '相刑',
        description: `${sx1}与${sx2}存在相刑关系，感情路上可能有些波折。需要互相体谅，共同面对困难。`
      };
    }
  }
  
  // 普通 - 中等匹配
  return {
    score: 70,
    relation: '普通',
    description: `${sx1}与${sx2}生肖关系一般，没有特别的相合或相冲。感情的成败更多取决于双方的努力和经营。`
  };
}

// ==================== 八字配对分析 ====================

export interface BaziMatchResult {
  score: number;
  dayPillarRelation: string;
  wuxingComplement: string;
  description: string;
}

// 五行相生关系
const wuXingSheng: Record<string, string> = {
  '金': '水', '水': '木', '木': '火', '火': '土', '土': '金'
};

// 五行相克关系
const wuXingKe: Record<string, string> = {
  '金': '木', '木': '土', '土': '水', '水': '火', '火': '金'
};

// 日干合化（天干五合）
const tianGanHe: Record<string, string> = {
  '甲': '己', '己': '甲', // 甲己合土
  '乙': '庚', '庚': '乙', // 乙庚合金
  '丙': '辛', '辛': '丙', // 丙辛合水
  '丁': '壬', '壬': '丁', // 丁壬合木
  '戊': '癸', '癸': '戊'  // 戊癸合火
};

// 地支六合
const diZhiLiuHe: Record<string, string> = {
  '子': '丑', '丑': '子', // 子丑合土
  '寅': '亥', '亥': '寅', // 寅亥合木
  '卯': '戌', '戌': '卯', // 卯戌合火
  '辰': '酉', '酉': '辰', // 辰酉合金
  '巳': '申', '申': '巳', // 巳申合水
  '午': '未', '未': '午'  // 午未合土
};

export function analyzeBaziMatch(bazi1: BaziResult, bazi2: BaziResult): BaziMatchResult {
  let score = 60; // 基础分
  const details: string[] = [];
  
  // 1. 日柱配对分析
  const dayGan1 = bazi1.day.gan;
  const dayGan2 = bazi2.day.gan;
  const dayZhi1 = bazi1.day.zhi;
  const dayZhi2 = bazi2.day.zhi;
  
  // 日干相合（天干五合）
  if (tianGanHe[dayGan1] === dayGan2) {
    score += 15;
    details.push('日干相合');
  }
  
  // 日支相合（地支六合）
  if (diZhiLiuHe[dayZhi1] === dayZhi2) {
    score += 10;
    details.push('日支相合');
  }
  
  // 日支相冲
  const dayZhiIndex1 = diZhi.indexOf(dayZhi1);
  const dayZhiIndex2 = diZhi.indexOf(dayZhi2);
  if (Math.abs(dayZhiIndex1 - dayZhiIndex2) === 6) {
    score -= 10;
    details.push('日支相冲');
  }
  
  // 2. 五行互补分析
  const wx1 = bazi1.wuxing;
  const wx2 = bazi2.wuxing;
  
  // 找出各自缺失的五行
  const missing1 = Object.entries(wx1).filter(([_, count]) => count === 0).map(([name]) => name);
  const missing2 = Object.entries(wx2).filter(([_, count]) => count === 0).map(([name]) => name);
  
  // 找出各自旺盛的五行
  const strong1 = Object.entries(wx1).filter(([_, count]) => count >= 3).map(([name]) => name);
  const strong2 = Object.entries(wx2).filter(([_, count]) => count >= 3).map(([name]) => name);
  
  // 互补评分
  let complementScore = 0;
  const complementDetails: string[] = [];
  
  // 一方旺盛的五行正好是另一方缺失的
  for (const s of strong1) {
    if (missing2.includes(s)) {
      complementScore += 8;
      complementDetails.push(`${bazi1.shengxiao}${s}旺补${bazi2.shengxiao}缺${s}`);
    }
  }
  for (const s of strong2) {
    if (missing1.includes(s)) {
      complementScore += 8;
      complementDetails.push(`${bazi2.shengxiao}${s}旺补${bazi1.shengxiao}缺${s}`);
    }
  }
  
  // 五行相生关系
  const dom1 = bazi1.dominantWuXing;
  const dom2 = bazi2.dominantWuXing;
  
  if (wuXingSheng[dom1] === dom2) {
    complementScore += 5;
    complementDetails.push(`${dom1}生${dom2}`);
  }
  if (wuXingSheng[dom2] === dom1) {
    complementScore += 5;
    complementDetails.push(`${dom2}生${dom1}`);
  }
  
  // 五行相克扣分
  if (wuXingKe[dom1] === dom2) {
    complementScore -= 5;
  }
  if (wuXingKe[dom2] === dom1) {
    complementScore -= 5;
  }
  
  score += complementScore;
  score = Math.max(30, Math.min(98, score)); // 限制在30-98之间
  
  // 生成描述
  let dayPillarRelation = details.length > 0 ? details.join('，') : '日柱无明显冲合';
  
  let wuxingComplement = '五行分析：';
  if (complementDetails.length > 0) {
    wuxingComplement += complementDetails.join('；');
  } else {
    wuxingComplement += `${bazi1.shengxiao}五行以${dom1}为主，${bazi2.shengxiao}五行以${dom2}为主。`;
  }
  
  // 生成综合描述
  let description = '';
  if (score >= 85) {
    description = `八字命盘显示两人缘分深厚。${dayPillarRelation}，${wuxingComplement}。天作之合，感情运势良好。`;
  } else if (score >= 70) {
    description = `八字命盘显示两人有不错的缘分。${dayPillarRelation}，${wuxingComplement}。用心经营，感情可期。`;
  } else if (score >= 55) {
    description = `八字命盘显示两人缘分一般。${dayPillarRelation}，${wuxingComplement}。需要多沟通理解，共同成长。`;
  } else {
    description = `八字命盘显示两人存在一些挑战。${dayPillarRelation}，${wuxingComplement}。需要更多的包容和努力。`;
  }
  
  return {
    score,
    dayPillarRelation,
    wuxingComplement,
    description
  };
}

// ==================== 综合匹配分析 ====================

export interface MatchAnalysis {
  score: number;
  level: string;
  shengxiaoMatch: ShengXiaoMatchResult;
  baziMatch: BaziMatchResult;
}

export function analyzeMatch(bazi1: BaziResult, bazi2: BaziResult): MatchAnalysis {
  // 生肖配对
  const shengxiaoMatch = analyzeShengXiaoMatch(bazi1.shengxiao, bazi2.shengxiao);
  
  // 八字配对
  const baziMatch = analyzeBaziMatch(bazi1, bazi2);
  
  // 综合评分（生肖占40%，八字占60%）
  const score = Math.round(shengxiaoMatch.score * 0.4 + baziMatch.score * 0.6);
  
  // 确定等级
  let level: string;
  if (score >= 90) level = '天作之合';
  else if (score >= 80) level = '良缘佳配';
  else if (score >= 70) level = '情投意合';
  else if (score >= 60) level = '缘分颇深';
  else if (score >= 50) level = '有缘相识';
  else level = '缘分未至';
  
  return {
    score,
    level,
    shengxiaoMatch,
    baziMatch
  };
}

// ==================== 辅助函数 ====================

// 解析日期字符串
export function parseBirthDate(dateStr: string): { year: number; month: number; day: number } | null {
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;
  
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  const day = parseInt(match[3]);
  
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  
  return { year, month, day };
}

// 获取匹配等级描述
export function getLevelDescription(level: string): string {
  const descriptions: Record<string, string> = {
    '天作之合': '命中注定的完美姻缘，缘分深厚，感情美满',
    '良缘佳配': '非常好的姻缘，值得珍惜和用心经营',
    '情投意合': '良好的缘分，彼此合适，有发展潜力',
    '缘分颇深': '有一定的缘分，需要双方共同努力',
    '有缘相识': '缘分一般，但仍有发展的可能',
    '缘分未至': '缘分较浅，需要更多的努力和机遇'
  };
  return descriptions[level] || '';
}

// 重新导出基础数据供其他模块使用
export { tianGan, diZhi, wuXing, shengXiao, tianGanWuXing, diZhiWuXing, diZhiShengXiao };
