/**
 * 八字计算库 - 基于 lunar-javascript 精确算法
 * 支持公历/农历输入，提供专业的命理数据
 */

import { Solar, Lunar } from 'lunar-javascript';

// ==================== 类型定义 ====================

export interface Pillar {
  gan: string;  // 天干
  zhi: string;  // 地支
}

export interface BaziData {
  year: Pillar;      // 年柱
  month: Pillar;     // 月柱
  day: Pillar;       // 日柱
  hour: Pillar;      // 时柱
  shengxiao: string; // 生肖
  wuxing: Record<string, number>; // 五行统计
  dominantWuXing: string;         // 最旺五行
  missingWuXing: string[];        // 缺失五行
}

export interface DetailedBaziData extends BaziData {
  // 纳音
  nayin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  // 十神
  shishen: {
    yearGan: string;
    monthGan: string;
    hourGan: string;
    yearZhi: string[];
    monthZhi: string[];
    dayZhi: string[];
    hourZhi: string[];
  };
  // 神煞
  shensha: string[];
  // 胎元
  taiyuan: string;
  // 命宫
  minggong: string;
  // 节气
  jieqi: {
    prev: string;
    next: string;
  };
}

export interface CalendarType {
  isLunar: boolean;  // true=农历, false=公历
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
}

// ==================== 基础数据 ====================

// 天干
export const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
export const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行
export const wuXing = ['金', '木', '水', '火', '土'];

// 十二生肖
export const shengXiao = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 天干五行
export const tianGanWuXing: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// 地支五行
export const diZhiWuXing: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 地支生肖
export const diZhiShengXiao: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔', '辰': '龙', '巳': '蛇',
  '午': '马', '未': '羊', '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
};

// 时辰对应表
export const shiChenMap: Record<number, { name: string; zhi: string; start: number; end: number }> = {
  0: { name: '子时', zhi: '子', start: 23, end: 1 },
  1: { name: '丑时', zhi: '丑', start: 1, end: 3 },
  2: { name: '丑时', zhi: '丑', start: 1, end: 3 },
  3: { name: '寅时', zhi: '寅', start: 3, end: 5 },
  4: { name: '寅时', zhi: '寅', start: 3, end: 5 },
  5: { name: '卯时', zhi: '卯', start: 5, end: 7 },
  6: { name: '卯时', zhi: '卯', start: 5, end: 7 },
  7: { name: '辰时', zhi: '辰', start: 7, end: 9 },
  8: { name: '辰时', zhi: '辰', start: 7, end: 9 },
  9: { name: '巳时', zhi: '巳', start: 9, end: 11 },
  10: { name: '巳时', zhi: '巳', start: 9, end: 11 },
  11: { name: '午时', zhi: '午', start: 11, end: 13 },
  12: { name: '午时', zhi: '午', start: 11, end: 13 },
  13: { name: '未时', zhi: '未', start: 13, end: 15 },
  14: { name: '未时', zhi: '未', start: 13, end: 15 },
  15: { name: '申时', zhi: '申', start: 15, end: 17 },
  16: { name: '申时', zhi: '申', start: 15, end: 17 },
  17: { name: '酉时', zhi: '酉', start: 17, end: 19 },
  18: { name: '酉时', zhi: '酉', start: 17, end: 19 },
  19: { name: '戌时', zhi: '戌', start: 19, end: 21 },
  20: { name: '戌时', zhi: '戌', start: 19, end: 21 },
  21: { name: '亥时', zhi: '亥', start: 21, end: 23 },
  22: { name: '亥时', zhi: '亥', start: 21, end: 23 },
  23: { name: '子时', zhi: '子', start: 23, end: 1 },
};

// ==================== 核心计算函数 ====================

/**
 * 根据时辰获取时柱
 */
function getHourPillar(dayGan: string, hour: number): Pillar {
  const shiChen = shiChenMap[hour];
  const zhi = shiChen.zhi;
  
  // 根据日干推算时干
  // 甲己日起甲子时，乙庚日起丙子时，丙辛日起戊子时，丁壬日起庚子时，戊癸日起壬子时
  const dayGanIndex = tianGan.indexOf(dayGan);
  const baseGanIndex = (dayGanIndex % 5) * 2; // 甲0, 乙2, 丙4, 丁6, 戊8 -> 0, 2, 4, 6, 8 -> 0, 0, 0, 2, 4 -> 0, 2, 4, 6, 8
  
  const zhiIndex = diZhi.indexOf(zhi);
  const ganIndex = (baseGanIndex + zhiIndex) % 10;
  
  return {
    gan: tianGan[ganIndex],
    zhi: zhi
  };
}

/**
 * 五行分析
 */
function analyzeWuXing(bazi: Pillar[]): Record<string, number> {
  const count: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
  
  bazi.forEach(pillar => {
    const ganWX = tianGanWuXing[pillar.gan];
    const zhiWX = diZhiWuXing[pillar.zhi];
    if (ganWX) count[ganWX]++;
    if (zhiWX) count[zhiWX]++;
  });
  
  return count;
}

/**
 * 计算基础八字（用于姻缘匹配）
 */
export function calculateBazi(input: CalendarType): BaziData {
  let lunar: Lunar;
  
  if (input.isLunar) {
    // 农历输入
    const solar = Lunar.fromYmd(input.year, input.month, input.day).getSolar();
    lunar = Solar.fromYmdHms(solar.getYear(), solar.getMonth(), solar.getDay(), input.hour, input.minute || 0, 0).getLunar();
  } else {
    // 公历输入
    const solar = Solar.fromYmdHms(input.year, input.month, input.day, input.hour, input.minute || 0, 0);
    lunar = solar.getLunar();
  }
  
  // 获取四柱
  const yearPillar: Pillar = {
    gan: lunar.getYearGan(),
    zhi: lunar.getYearZhi()
  };
  
  const monthPillar: Pillar = {
    gan: lunar.getMonthGan(),
    zhi: lunar.getMonthZhi()
  };
  
  const dayPillar: Pillar = {
    gan: lunar.getDayGan(),
    zhi: lunar.getDayZhi()
  };
  
  const hourPillar = getHourPillar(dayPillar.gan, input.hour);
  
  const bazi = [yearPillar, monthPillar, dayPillar, hourPillar];
  const wuxing = analyzeWuXing(bazi);
  
  // 找出最旺和缺失的五行
  const sortedWuXing = Object.entries(wuxing).sort((a, b) => b[1] - a[1]);
  const dominantWuXing = sortedWuXing[0][0];
  const missingWuXing = sortedWuXing.filter(([_, count]) => count === 0).map(([name]) => name);
  
  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    shengxiao: lunar.getYearShengXiao(),
    wuxing,
    dominantWuXing,
    missingWuXing
  };
}

/**
 * 计算详细八字（用于生辰八字页面）
 */
export function calculateDetailedBazi(input: CalendarType): DetailedBaziData {
  let lunar: Lunar;
  
  if (input.isLunar) {
    // 农历输入 - 先转公历再转农历
    const solar = Lunar.fromYmd(input.year, input.month, input.day).getSolar();
    lunar = Solar.fromYmdHms(solar.getYear(), solar.getMonth(), solar.getDay(), input.hour, input.minute || 0, 0).getLunar();
  } else {
    // 公历输入
    const solar = Solar.fromYmdHms(input.year, input.month, input.day, input.hour, input.minute || 0, 0);
    lunar = solar.getLunar();
  }
  
  // 基础八字
  const basicBazi = calculateBazi(input);
  
  // 纳音
  const nayin = {
    year: lunar.getYearNaYin(),
    month: lunar.getMonthNaYin(),
    day: lunar.getDayNaYin(),
    hour: lunar.getTimeNaYin()
  };
  
  // 十神（日主为基准）
  const dayGan = lunar.getDayGan();
  const shishen = {
    yearGan: getShiShen(dayGan, lunar.getYearGan()),
    monthGan: getShiShen(dayGan, lunar.getMonthGan()),
    hourGan: getShiShen(dayGan, basicBazi.hour.gan),
    yearZhi: getDiZhiShiShen(dayGan, lunar.getYearZhi()),
    monthZhi: getDiZhiShiShen(dayGan, lunar.getMonthZhi()),
    dayZhi: getDiZhiShiShen(dayGan, lunar.getDayZhi()),
    hourZhi: getDiZhiShiShen(dayGan, basicBazi.hour.zhi)
  };
  
  // 神煞
  const shensha: string[] = [];
  
  // 天乙贵人
  const tianYiGuiRen = getTianYiGuiRen(dayGan);
  if (tianYiGuiRen.some(ren => 
    lunar.getYearZhi() === ren || lunar.getMonthZhi() === ren || 
    lunar.getDayZhi() === ren || basicBazi.hour.zhi === ren
  )) {
    shensha.push('天乙贵人');
  }
  
  // 文昌贵人
  const wenChang = getWenChang(dayGan);
  if (wenChang && (
    lunar.getYearZhi() === wenChang || lunar.getMonthZhi() === wenChang ||
    lunar.getDayZhi() === wenChang || basicBazi.hour.zhi === wenChang
  )) {
    shensha.push('文昌贵人');
  }
  
  // 桃花
  const taoHua = getTaoHua(lunar.getYearZhi());
  if (taoHua && (
    lunar.getMonthZhi() === taoHua || lunar.getDayZhi() === taoHua || basicBazi.hour.zhi === taoHua
  )) {
    shensha.push('桃花');
  }
  
  // 驿马
  const yiMa = getYiMa(lunar.getYearZhi());
  if (yiMa && (
    lunar.getMonthZhi() === yiMa || lunar.getDayZhi() === yiMa || basicBazi.hour.zhi === yiMa
  )) {
    shensha.push('驿马');
  }
  
  // 华盖
  const huaGai = getHuaGai(lunar.getYearZhi());
  if (huaGai && (
    lunar.getMonthZhi() === huaGai || lunar.getDayZhi() === huaGai || basicBazi.hour.zhi === huaGai
  )) {
    shensha.push('华盖');
  }
  
  // 胎元（手动计算：月干后一位，月支后三位）
  const monthGanIndex = tianGan.indexOf(lunar.getMonthGan());
  const monthZhiIndex = diZhi.indexOf(lunar.getMonthZhi());
  const taiyuanGan = tianGan[(monthGanIndex + 1) % 10];
  const taiyuanZhi = diZhi[(monthZhiIndex + 3) % 12];
  const taiyuan = taiyuanGan + taiyuanZhi;
  
  // 命宫（简化计算）
  const minggong = calculateMingGong(lunar.getMonthZhi(), lunar.getTimeZhi());
  
  // 节气
  const prevJie = lunar.getPrevJieQi();
  const nextJie = lunar.getNextJieQi();
  const jieqi = {
    prev: prevJie ? `${prevJie.getName()} (${prevJie.getSolar().toYmd()})` : '',
    next: nextJie ? `${nextJie.getName()} (${nextJie.getSolar().toYmd()})` : ''
  };
  
  return {
    ...basicBazi,
    nayin,
    shishen,
    shensha,
    taiyuan,
    minggong,
    jieqi
  };
}

/**
 * 计算命宫（简化算法）
 */
function calculateMingGong(monthZhi: string, hourZhi: string): string {
  const monthIndex = diZhi.indexOf(monthZhi);
  const hourIndex = diZhi.indexOf(hourZhi);
  
  // 命宫 = (月支序号 + 时支序号) % 12，然后从子开始逆推
  // 简化：命宫地支
  const mingGongIndex = (14 - monthIndex - hourIndex) % 12;
  // 命宫天干（简化）
  const mingGongGan = tianGan[mingGongIndex % 10];
  
  return mingGongGan + diZhi[mingGongIndex];
}

// ==================== 辅助函数 ====================

/**
 * 获取天干十神
 */
function getShiShen(dayGan: string, targetGan: string): string {
  if (dayGan === targetGan) return '比肩';
  
  const dayWuXing = tianGanWuXing[dayGan];
  const targetWuXing = tianGanWuXing[targetGan];
  
  // 阴阳判断
  const dayYinYang = tianGan.indexOf(dayGan) % 2; // 0阳1阴
  const targetYinYang = tianGan.indexOf(targetGan) % 2;
  const sameYinYang = dayYinYang === targetYinYang;
  
  // 五行生克关系
  const shengMap: Record<string, string> = { '金': '水', '水': '木', '木': '火', '火': '土', '土': '金' };
  const keMap: Record<string, string> = { '金': '木', '木': '土', '土': '水', '水': '火', '火': '金' };
  
  if (shengMap[dayWuXing] === targetWuXing) {
    // 我生
    return sameYinYang ? '食神' : '伤官';
  } else if (shengMap[targetWuXing] === dayWuXing) {
    // 生我
    return sameYinYang ? '偏印' : '正印';
  } else if (keMap[dayWuXing] === targetWuXing) {
    // 我克
    return sameYinYang ? '偏财' : '正财';
  } else if (keMap[targetWuXing] === dayWuXing) {
    // 克我
    return sameYinYang ? '七杀' : '正官';
  } else {
    // 同五行
    return sameYinYang ? '比肩' : '劫财';
  }
}

/**
 * 获取地支藏干十神
 */
function getDiZhiShiShen(dayGan: string, zhi: string): string[] {
  // 地支藏干
  const zhiCangGan: Record<string, string[]> = {
    '子': ['癸'],
    '丑': ['己', '辛', '癸'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['戊', '乙', '癸'],
    '巳': ['丙', '戊', '庚'],
    '午': ['丁', '己'],
    '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'],
    '酉': ['辛'],
    '戌': ['戊', '辛', '丁'],
    '亥': ['壬', '甲']
  };
  
  const cangGan = zhiCangGan[zhi] || [];
  return cangGan.map(gan => getShiShen(dayGan, gan));
}

/**
 * 获取天乙贵人
 */
function getTianYiGuiRen(dayGan: string): string[] {
  const map: Record<string, string[]> = {
    '甲': ['丑', '未'],
    '乙': ['子', '申'],
    '丙': ['亥', '酉'],
    '丁': ['亥', '酉'],
    '戊': ['丑', '未'],
    '己': ['子', '申'],
    '庚': ['丑', '未'],
    '辛': ['午', '寅'],
    '壬': ['卯', '巳'],
    '癸': ['卯', '巳']
  };
  return map[dayGan] || [];
}

/**
 * 获取文昌贵人
 */
function getWenChang(dayGan: string): string {
  const map: Record<string, string> = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
    '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯'
  };
  return map[dayGan] || '';
}

/**
 * 获取桃花
 */
function getTaoHua(yearZhi: string): string {
  const map: Record<string, string> = {
    '寅': '卯', '午': '卯', '戌': '卯',
    '申': '酉', '子': '酉', '辰': '酉',
    '巳': '午', '酉': '午', '丑': '午',
    '亥': '子', '卯': '子', '未': '子'
  };
  return map[yearZhi] || '';
}

/**
 * 获取驿马
 */
function getYiMa(yearZhi: string): string {
  const map: Record<string, string> = {
    '寅': '申', '午': '申', '戌': '申',
    '申': '寅', '子': '寅', '辰': '寅',
    '巳': '亥', '酉': '亥', '丑': '亥',
    '亥': '巳', '卯': '巳', '未': '巳'
  };
  return map[yearZhi] || '';
}

/**
 * 获取华盖
 */
function getHuaGai(yearZhi: string): string {
  const map: Record<string, string> = {
    '寅': '戌', '午': '戌', '戌': '戌',
    '申': '辰', '子': '辰', '辰': '辰',
    '巳': '丑', '酉': '丑', '丑': '丑',
    '亥': '未', '卯': '未', '未': '未'
  };
  return map[yearZhi] || '';
}

/**
 * 农历转公历
 */
export function lunarToSolar(year: number, month: number, day: number): { year: number; month: number; day: number } | null {
  try {
    const lunar = Lunar.fromYmd(year, month, day);
    const solar = lunar.getSolar();
    return {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay()
    };
  } catch {
    return null;
  }
}

/**
 * 公历转农历
 */
export function solarToLunar(year: number, month: number, day: number): { year: number; month: number; day: number; monthName: string } | null {
  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    return {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      monthName: lunar.getMonthInChinese()
    };
  } catch {
    return null;
  }
}

/**
 * 验证日期有效性
 */
export function validateDate(isLunar: boolean, year: number, month: number, day: number): boolean {
  try {
    if (isLunar) {
      Lunar.fromYmd(year, month, day);
    } else {
      Solar.fromYmd(year, month, day);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取农历月份名称
 */
export function getLunarMonthName(month: number, isLeap: boolean = false): string {
  const names = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  const name = names[month - 1] || '';
  return isLeap ? `闰${name}月` : `${name}月`;
}

/**
 * 获取农历日期名称
 */
export function getLunarDayName(day: number): string {
  const names = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                 '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                 '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  return names[day - 1] || '';
}
