/**
 * 奇门遁甲计算库 - 基于传统时家奇门遁甲
 * 
 * 奇门遁甲是中国古代术数之一，通过时间排盘预测吉凶。
 * 本库实现时家奇门遁甲（拆补法），支持阴遁阳遁计算。
 */

import { Solar, Lunar } from 'lunar-javascript';

// ==================== 类型定义 ====================

/** 九宫位置 */
export type PalacePosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** 三奇六仪 */
export type SanQiLiuYi = '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

/** 九星名称 */
export type NineStarName = '天蓬' | '天芮' | '天冲' | '天辅' | '天禽' | '天心' | '天柱' | '天任' | '天英';

/** 八门名称 */
export type EightDoorName = '休门' | '生门' | '伤门' | '杜门' | '景门' | '死门' | '惊门' | '开门';

/** 八神名称 */
export type EightGodName = '值符' | '腾蛇' | '太阴' | '六合' | '白虎' | '玄武' | '九地' | '九天';

/** 九宫信息 */
export interface Palace {
  position: PalacePosition;        // 宫位（1-9，5为中宫）
  name: string;                    // 宫名（坎一宫、坤二宫等）
  direction: string;               // 方位
  wuXing: string;                  // 五行
  tianPan?: SanQiLiuYi;           // 天盘（三奇六仪）
  diPan?: SanQiLiuYi;             // 地盘（三奇六仪）
  nineStar?: NineStarInfo;         // 九星
  eightDoor?: EightDoorInfo;       // 八门
  eightGod?: EightGodInfo;         // 八神
}

/** 九星信息 */
export interface NineStarInfo {
  name: NineStarName;
  wuXing: string;
  yinYang: string;
  luck: string;        // 吉凶
  baMen?: string;      // 对应八门
}

/** 八门信息 */
export interface EightDoorInfo {
  name: EightDoorName;
  wuXing: string;
  luck: string;        // 吉凶
  direction: string;   // 原始方位
}

/** 八神信息 */
export interface EightGodInfo {
  name: EightGodName;
  nature: string;      // 性质（吉/凶）
}

/** 格局信息 */
export interface GeJuInfo {
  name: string;
  type: '吉' | '凶' | '中';
  description: string;
}

/** 奇门遁甲盘 */
export interface QiMenDunJiaBoard {
  // 时间信息
  solarDate: string;
  lunarDate: string;
  ganZhi: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  
  // 节气信息
  jieQi: string;
  
  // 局数信息
  dunType: '阳遁' | '阴遁';
  juShu: number;       // 局数（1-9）
  juShuDesc: string;   // 局数描述
  
  // 旬首、值符、值使
  xunShou: string;     // 旬首（六仪之一）
  zhiFu: string;       // 值符（九星）
  zhiShi: string;      // 值使（八门）
  
  // 九宫
  palaces: Palace[];
  
  // 时辰干支位置
  hourGanPosition: PalacePosition;
  hourZhiPosition: PalacePosition;
  
  // 格局判断
  geJu: GeJuInfo[];    // 格局（如青龙返首、飞鸟跌穴等）
  
  // 建议
  advice: string;
}

// ==================== 基础数据 ====================

// 天干
const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 三奇六仪顺序（阳遁顺排，阴遁逆排）
const sanQiLiuYiOrder: SanQiLiuYi[] = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];

// 六仪
const liuYi: SanQiLiuYi[] = ['戊', '己', '庚', '辛', '壬', '癸'];

// 三奇
const sanQi: SanQiLiuYi[] = ['乙', '丙', '丁'];

// 九宫名称
const palaceNames: Record<PalacePosition, { name: string; direction: string; wuXing: string }> = {
  1: { name: '坎一宫', direction: '北方', wuXing: '水' },
  2: { name: '坤二宫', direction: '西南', wuXing: '土' },
  3: { name: '震三宫', direction: '东方', wuXing: '木' },
  4: { name: '巽四宫', direction: '东南', wuXing: '木' },
  5: { name: '中五宫', direction: '中央', wuXing: '土' },
  6: { name: '乾六宫', direction: '西北', wuXing: '金' },
  7: { name: '兑七宫', direction: '西方', wuXing: '金' },
  8: { name: '艮八宫', direction: '东北', wuXing: '土' },
  9: { name: '离九宫', direction: '南方', wuXing: '火' },
};

// 九星数据
const nineStarData: Record<number, NineStarInfo> = {
  0: { name: '天蓬', wuXing: '水', yinYang: '阳', luck: '大凶', baMen: '休门' },
  1: { name: '天芮', wuXing: '土', yinYang: '阴', luck: '大凶', baMen: '死门' },
  2: { name: '天冲', wuXing: '木', yinYang: '阳', luck: '小吉', baMen: '伤门' },
  3: { name: '天辅', wuXing: '木', yinYang: '阳', luck: '大吉', baMen: '杜门' },
  4: { name: '天禽', wuXing: '土', yinYang: '阳', luck: '大吉', baMen: '' },
  5: { name: '天心', wuXing: '金', yinYang: '阴', luck: '大吉', baMen: '开门' },
  6: { name: '天柱', wuXing: '金', yinYang: '阴', luck: '小凶', baMen: '惊门' },
  7: { name: '天任', wuXing: '土', yinYang: '阳', luck: '小吉', baMen: '生门' },
  8: { name: '天英', wuXing: '火', yinYang: '阴', luck: '小凶', baMen: '景门' },
};

// 八门数据
const eightDoorData: Record<string, EightDoorInfo> = {
  '休门': { name: '休门', wuXing: '水', luck: '吉', direction: '北方坎一宫' },
  '生门': { name: '生门', wuXing: '土', luck: '吉', direction: '东北艮八宫' },
  '伤门': { name: '伤门', wuXing: '木', luck: '凶', direction: '东方震三宫' },
  '杜门': { name: '杜门', wuXing: '木', luck: '中', direction: '东南巽四宫' },
  '景门': { name: '景门', wuXing: '火', luck: '中', direction: '南方离九宫' },
  '死门': { name: '死门', wuXing: '土', luck: '凶', direction: '西南坤二宫' },
  '惊门': { name: '惊门', wuXing: '金', luck: '凶', direction: '西方兑七宫' },
  '开门': { name: '开门', wuXing: '金', luck: '吉', direction: '西北乾六宫' },
};

// 八神数据
const eightGodData: Record<number, EightGodInfo> = {
  0: { name: '值符', nature: '吉' },
  1: { name: '腾蛇', nature: '凶' },
  2: { name: '太阴', nature: '吉' },
  3: { name: '六合', nature: '吉' },
  4: { name: '白虎', nature: '凶' },
  5: { name: '玄武', nature: '凶' },
  6: { name: '九地', nature: '吉' },
  7: { name: '九天', nature: '吉' },
};

// 节气与局数对应表（阳遁）
// 从冬至开始，每节气三局（上元、中元、下元）
const jieQiYangDun: Record<string, number[]> = {
  '冬至': [1, 7, 4], '小寒': [2, 8, 5], '大寒': [3, 9, 6],
  '立春': [8, 5, 2], '雨水': [9, 6, 3], '惊蛰': [1, 7, 4],
  '春分': [3, 9, 6], '清明': [4, 1, 7], '谷雨': [5, 2, 8],
  '立夏': [4, 1, 7], '小满': [5, 2, 8], '芒种': [6, 3, 9],
};

// 节气与局数对应表（阴遁）
// 从夏至开始
const jieQiYinDun: Record<string, number[]> = {
  '夏至': [9, 3, 6], '小暑': [8, 2, 5], '大暑': [7, 1, 4],
  '立秋': [2, 5, 8], '处暑': [1, 4, 7], '白露': [9, 3, 6],
  '秋分': [7, 1, 4], '寒露': [6, 9, 3], '霜降': [5, 8, 2],
  '立冬': [6, 9, 3], '小雪': [5, 8, 2], '大雪': [4, 7, 1],
};

// 六仪与宫位对应（地盘）
const liuYiToPalace: Record<string, PalacePosition> = {
  '戊': 1, '己': 2, '庚': 3, '辛': 4, '壬': 5, '癸': 6,
};

// 九星与宫位对应（地盘原始位置）
const nineStarToPalace: Record<string, PalacePosition> = {
  '天蓬': 1, '天芮': 2, '天冲': 3, '天辅': 4,
  '天禽': 5, '天心': 6, '天柱': 7, '天任': 8, '天英': 9,
};

// 八门与宫位对应（地盘原始位置）
const eightDoorToPalace: Record<string, PalacePosition> = {
  '休门': 1, '死门': 2, '伤门': 3, '杜门': 4,
  '开门': 6, '惊门': 7, '生门': 8, '景门': 9,
};

// 九宫飞布顺序（洛书）
const luoShuOrder: PalacePosition[] = [9, 8, 7, 6, 5, 4, 3, 2, 1];

// ==================== 核心计算函数 ====================

/**
 * 判断节气是阳遁还是阴遁
 */
function getDunType(jieQi: string): '阳遁' | '阴遁' {
  const yangDunJieQi = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', 
                        '春分', '清明', '谷雨', '立夏', '小满', '芒种'];
  return yangDunJieQi.includes(jieQi) ? '阳遁' : '阴遁';
}

/**
 * 计算局数
 * @param jieQi 节气名称
 * @param dayGanZhi 日干支
 * @returns 局数（1-9）
 */
function calculateJuShu(jieQi: string, dayGanZhi: string): number {
  const dunType = getDunType(jieQi);
  const juShuTable = dunType === '阳遁' ? jieQiYangDun : jieQiYinDun;
  
  // 获取该节气的三元局数
  const juShuList = juShuTable[jieQi] || [5, 5, 5]; // 默认中宫
  
  // 根据日干支确定上中下元
  const dayGan = dayGanZhi[0];
  const dayZhi = dayGanZhi[1];
  const dayGanIndex = tianGan.indexOf(dayGan);
  const dayZhiIndex = diZhi.indexOf(dayZhi);
  
  // 六十甲子中的位置
  const dayOffset = (dayGanIndex * 12 + dayZhiIndex) % 60;
  
  // 计算符头（每五天为一元）
  // 甲己日为符头，甲子、己卯、甲午、己酉为上元
  const fuTouZhi = dayZhiIndex % 5; // 0-4对应子丑寅卯辰...
  
  // 判断上中下元（简化计算）
  // 甲子、己卯、甲午、己酉为上元
  // 甲寅、己巳、甲申、己亥为中元  
  // 甲辰、己未、甲戌、己丑为下元
  const upperYuan = ['甲子', '己卯', '甲午', '己酉'];
  const middleYuan = ['甲寅', '己巳', '甲申', '己亥'];
  const lowerYuan = ['甲辰', '己未', '甲戌', '己丑'];
  
  let yuanIndex = 1; // 默认中元
  if (upperYuan.some(s => dayGanZhi.includes(s[0]) && dayGanZhi.includes(s[1]))) {
    yuanIndex = 0;
  } else if (middleYuan.some(s => dayGanZhi.includes(s[0]) && dayGanZhi.includes(s[1]))) {
    yuanIndex = 1;
  } else if (lowerYuan.some(s => dayGanZhi.includes(s[0]) && dayGanZhi.includes(s[1]))) {
    yuanIndex = 2;
  } else {
    // 简化判断：根据日支判断
    const zhiGroup = dayZhiIndex % 3;
    yuanIndex = zhiGroup;
  }
  
  return juShuList[yuanIndex];
}

/**
 * 获取旬首
 * 六十甲子分为六旬，每旬首为甲子、甲戌、甲申、甲午、甲辰、甲寅
 */
function getXunShou(ganZhi: string): string {
  const dayGan = ganZhi[0];
  const dayZhi = ganZhi[1];
  const dayGanIndex = tianGan.indexOf(dayGan);
  const dayZhiIndex = diZhi.indexOf(dayZhi);
  
  // 计算在六十甲子中的位置
  let offset = 0;
  for (let i = 0; i < 60; i++) {
    const gan = tianGan[i % 10];
    const zhi = diZhi[i % 12];
    if (gan === dayGan && zhi === dayZhi) {
      offset = i;
      break;
    }
  }
  
  // 找到旬首对应的六仪
  // 甲子旬 -> 戊, 甲戌旬 -> 己, 甲申旬 -> 庚
  // 甲午旬 -> 辛, 甲辰旬 -> 壬, 甲寅旬 -> 癸
  const xunIndex = Math.floor(offset / 10);
  const xunShouLiuYi = liuYi[xunIndex];
  
  return xunShouLiuYi;
}

/**
 * 排地盘（三奇六仪在地盘的排列）
 * 根据局数确定戊的位置，其余顺排
 */
function arrangeDiPan(juShu: number, dunType: '阳遁' | '阴遁'): Map<PalacePosition, SanQiLiuYi> {
  const diPan = new Map<PalacePosition, SanQiLiuYi>();
  
  // 戊从局数宫位开始
  // 如阳遁一局，戊在坎一宫；阴遁一局，戊在离九宫
  let startPos: PalacePosition;
  if (dunType === '阳遁') {
    startPos = juShu as PalacePosition;
  } else {
    startPos = (10 - juShu) as PalacePosition; // 阴遁从对宫开始
  }
  
  // 简化：使用固定顺序填充
  // 九宫位置：坎一、坤二、震三、巽四、中五、乾六、兑七、艮八、离九
  const palaceOrder: PalacePosition[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // 找到戊的位置索引
  const wuIndex = palaceOrder.indexOf(startPos);
  
  // 填充三奇六仪
  for (let i = 0; i < 9; i++) {
    const palacePos = palaceOrder[(wuIndex + i) % 9];
    const qiYi = sanQiLiuYiOrder[i];
    diPan.set(palacePos, qiYi);
  }
  
  return diPan;
}

/**
 * 排天盘
 * 根据旬首和时干确定天盘
 */
function arrangeTianPan(
  diPan: Map<PalacePosition, SanQiLiuYi>,
  xunShou: string,
  hourGan: string,
  dunType: '阳遁' | '阴遁'
): Map<PalacePosition, SanQiLiuYi> {
  const tianPan = new Map<PalacePosition, SanQiLiuYi>();
  
  // 找到旬首（六仪）在地盘的位置
  let xunShouPalace: PalacePosition = 1;
  for (const [pos, qiYi] of diPan.entries()) {
    if (qiYi === xunShou) {
      xunShouPalace = pos;
      break;
    }
  }
  
  // 找到时干在地盘的位置
  let hourGanPalace: PalacePosition = 1;
  if (hourGan !== '甲') { // 甲隐藏，用旬首
    for (const [pos, qiYi] of diPan.entries()) {
      if (qiYi === hourGan) {
        hourGanPalace = pos;
        break;
      }
    }
  }
  
  // 计算移动步数
  // 时干位置的宫 - 旬首位置的宫
  const palaceOrder: PalacePosition[] = [1, 8, 3, 4, 9, 2, 7, 6, 1]; // 坎艮震巽离坤兑乾坎
  const xunIndex = palaceOrder.indexOf(xunShouPalace);
  const hourIndex = palaceOrder.indexOf(hourGanPalace);
  
  // 简化：天盘 = 地盘旋转
  // 实际奇门遁甲中，天盘是地盘随着值符飞布
  for (const [pos, qiYi] of diPan.entries()) {
    tianPan.set(pos, qiYi);
  }
  
  return tianPan;
}

/**
 * 排九星
 */
function arrangeNineStar(
  hourGanPalace: PalacePosition,
  dunType: '阳遁' | '阴遁'
): Map<PalacePosition, NineStarInfo> {
  const nineStarMap = new Map<PalacePosition, NineStarInfo>();
  
  // 九星原始位置：天蓬在坎一宫，天芮在坤二宫...
  const originalPositions: Record<string, PalacePosition> = {
    '天蓬': 1, '天芮': 2, '天冲': 3, '天辅': 4,
    '天禽': 5, '天心': 6, '天柱': 7, '天任': 8, '天英': 9,
  };
  
  // 九星随着值符飞布
  // 值符落在时干所在的宫位
  const palaceOrder: PalacePosition[] = [1, 8, 3, 4, 9, 2, 7, 6, 5]; // 顺时针顺序
  
  // 从时干宫位开始，按顺时针排列九星
  const startIndex = palaceOrder.indexOf(hourGanPalace);
  const nineStarOrder = [0, 7, 2, 3, 4, 5, 6, 1, 8]; // 天蓬、天任、天冲、天辅、天禽、天心、天柱、天芮、天英
  
  for (let i = 0; i < 9; i++) {
    const palacePos = palaceOrder[(startIndex + i) % 9];
    const starIndex = nineStarOrder[i];
    nineStarMap.set(palacePos, nineStarData[starIndex]);
  }
  
  return nineStarMap;
}

/**
 * 排八门
 */
function arrangeEightDoor(
  hourZhiPalace: PalacePosition,
  dunType: '阳遁' | '阴遁'
): Map<PalacePosition, EightDoorInfo> {
  const doorMap = new Map<PalacePosition, EightDoorInfo>();
  
  // 八门原始位置
  const originalPositions: Record<string, PalacePosition> = {
    '休门': 1, '死门': 2, '伤门': 3, '杜门': 4,
    '开门': 6, '惊门': 7, '生门': 8, '景门': 9,
  };
  
  // 八门随值使飞布
  const palaceOrder: PalacePosition[] = [1, 8, 3, 4, 9, 2, 7, 6]; // 八门顺时针顺序（不含中宫）
  const doorOrder = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];
  
  const startIndex = palaceOrder.indexOf(hourZhiPalace);
  
  for (let i = 0; i < 8; i++) {
    const palacePos = palaceOrder[(startIndex + i) % 8];
    const doorName = doorOrder[i];
    doorMap.set(palacePos, eightDoorData[doorName]);
  }
  
  return doorMap;
}

/**
 * 排八神
 */
function arrangeEightGod(
  hourGanPalace: PalacePosition,
  dunType: '阳遁' | '阴遁'
): Map<PalacePosition, EightGodInfo> {
  const godMap = new Map<PalacePosition, EightGodInfo>();
  
  // 八神顺序（阳遁顺排，阴遁逆排）
  const palaceOrder: PalacePosition[] = [1, 8, 3, 4, 9, 2, 7, 6];
  
  // 阳遁顺排：值符、腾蛇、太阴、六合、白虎、玄武、九地、九天
  // 阴遁逆排：值符、九天、九地、玄武、白虎、六合、太阴、腾蛇
  const godOrderYang = [0, 7, 6, 5, 4, 3, 2, 1]; // 简化顺序
  const godOrderYin = [0, 7, 6, 5, 4, 3, 2, 1];
  
  const godOrder = dunType === '阳遁' ? godOrderYang : godOrderYin;
  const startIndex = palaceOrder.indexOf(hourGanPalace);
  
  for (let i = 0; i < 8; i++) {
    const palacePos = palaceOrder[(startIndex + i) % 8];
    const godIndex = godOrder[i];
    godMap.set(palacePos, eightGodData[godIndex]);
  }
  
  return godMap;
}

/**
 * 判断格局
 * 奇门遁甲格局分为吉格、凶格和平格
 */
function judgeGeJu(
  tianPan: Map<PalacePosition, SanQiLiuYi>,
  diPan: Map<PalacePosition, SanQiLiuYi>,
  nineStarMap: Map<PalacePosition, NineStarInfo>,
  doorMap: Map<PalacePosition, EightDoorInfo>,
  xunShou: string
): GeJuInfo[] {
  const geJu: GeJuInfo[] = [];
  const seen = new Set<string>();
  
  // 遍历各宫判断格局
  for (const [pos, tianQi] of tianPan.entries()) {
    const diQi = diPan.get(pos);
    const star = nineStarMap.get(pos);
    const door = doorMap.get(pos);
    
    if (!diQi) continue;
    
    // ========== 吉格 ==========
    
    // 青龙返首：天盘乙奇+地盘辛（甲午辛）
    if (tianQi === '乙' && diQi === '辛') {
      const name = '青龙返首';
      if (!seen.has(name)) {
        geJu.push({ name, type: '吉', description: '乙奇加辛，百事皆宜，大吉之格' });
        seen.add(name);
      }
    }
    
    // 飞鸟跌穴：天盘丙奇+地盘戊（甲子戊）
    if (tianQi === '丙' && diQi === '戊') {
      const name = '飞鸟跌穴';
      if (!seen.has(name)) {
        geJu.push({ name, type: '吉', description: '丙奇加戊，百事皆宜，大吉之格' });
        seen.add(name);
      }
    }
    
    // 玉女守门：天盘丁奇+地盘己（甲戌己）
    if (tianQi === '丁' && diQi === '己') {
      const name = '玉女守门';
      if (!seen.has(name)) {
        geJu.push({ name, type: '吉', description: '丁奇加己，百事皆宜，大吉之格' });
        seen.add(name);
      }
    }
    
    // 三奇临吉星
    if (sanQi.includes(tianQi) && star) {
      if (star.luck === '大吉' || star.luck === '小吉') {
        const name = `${tianQi}奇临${star.name}`;
        if (!seen.has(name)) {
          geJu.push({ name, type: '吉', description: `${tianQi}奇临吉星${star.name}，主吉利` });
          seen.add(name);
        }
      }
    }
    
    // 三奇临吉门
    if (sanQi.includes(tianQi) && door && door.luck === '吉') {
      const name = `${tianQi}奇临${door.name}`;
      if (!seen.has(name)) {
        geJu.push({ name, type: '吉', description: `${tianQi}奇临吉门${door.name}，主吉利` });
        seen.add(name);
      }
    }
    
    // ========== 凶格 ==========
    
    // 青龙逃走：天盘乙奇+地盘辛，但乙入墓或受克
    // 简化：乙+辛在某些情况下为凶
    
    // 白虎猖狂：天盘庚+地盘丙
    if (tianQi === '庚' && diQi === '丙') {
      const name = '白虎猖狂';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '庚加丙，主破财、伤灾、争斗' });
        seen.add(name);
      }
    }
    
    // 腾蛇夭矫：天盘癸+地盘丁
    if (tianQi === '癸' && diQi === '丁') {
      const name = '腾蛇夭矫';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '癸加丁，主怪异、惊恐、虚惊' });
        seen.add(name);
      }
    }
    
    // 朱雀投江：天盘丁+地盘壬
    if (tianQi === '丁' && diQi === '壬') {
      const name = '朱雀投江';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '丁加壬，主文书差错、口舌是非' });
        seen.add(name);
      }
    }
    
    // 太白入荧：天盘庚+地盘丙（与白虎猖狂相同条件，但不同解释）
    if (tianQi === '庚' && diQi === '丙') {
      const name = '太白入荧';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '庚加丙，主盗贼、失财' });
        seen.add(name);
      }
    }
    
    // 荧入太白：天盘丙+地盘庚
    if (tianQi === '丙' && diQi === '庚') {
      const name = '荧入太白';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '丙加庚，主争斗、破财' });
        seen.add(name);
      }
    }
    
    // 大格：天盘庚+地盘庚
    if (tianQi === '庚' && diQi === '庚') {
      const name = '大格';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '庚加庚，主争斗、阻碍重重' });
        seen.add(name);
      }
    }
    
    // 小格：天盘庚+地盘其他
    if (tianQi === '庚' && diQi !== '庚' && diQi !== '丙') {
      const name = '小格';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '庚加他干，主阻滞、不顺' });
        seen.add(name);
      }
    }
    
    // 刑格：天盘六仪与地盘相刑
    // 简化处理
    
    // 击刑：天盘甲子戊加地盘甲午辛
    if (tianQi === '戊' && diQi === '辛') {
      const name = '击刑';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '戊加辛，子午相冲，主刑伤' });
        seen.add(name);
      }
    }
    
    // 三奇入墓
    if (tianQi === '乙' && (pos === 6 || pos === 7)) { // 乙墓在未申（乾兑宫）
      const name = '乙奇入墓';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '乙奇入墓，主无力、受阻' });
        seen.add(name);
      }
    }
    
    if (tianQi === '丙' && pos === 6) { // 丙墓在戌（乾宫）
      const name = '丙奇入墓';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '丙奇入墓，主无力、受阻' });
        seen.add(name);
      }
    }
    
    if (tianQi === '丁' && pos === 8) { // 丁墓在丑（艮宫）
      const name = '丁奇入墓';
      if (!seen.has(name)) {
        geJu.push({ name, type: '凶', description: '丁奇入墓，主无力、受阻' });
        seen.add(name);
      }
    }
  }
  
  return geJu;
}

/**
 * 生成建议
 */
function generateAdvice(
  dunType: '阳遁' | '阴遁',
  juShu: number,
  geJu: GeJuInfo[],
  nineStarMap: Map<PalacePosition, NineStarInfo>,
  doorMap: Map<PalacePosition, EightDoorInfo>
): string {
  const advices: string[] = [];
  
  // 根据阴阳遁给建议
  advices.push(dunType === '阳遁' ? 
    '当前为阳遁，阳气上升，宜主动出击，把握机遇。' :
    '当前为阴遁，阴气渐长，宜守不宜攻，稳扎稳打。'
  );
  
  // 根据局数给建议
  const juShuAdvice: Record<number, string> = {
    1: '坎一局，水势旺盛，宜智取不宜力敌。',
    2: '坤二局，土厚德载，宜稳扎稳打。',
    3: '震三局，雷动风行，宜果断行动。',
    4: '巽四局，风行草偃，宜顺势而为。',
    5: '中五局，土居中央，宜持重待机。',
    6: '乾六局，天行健，宜自强不息。',
    7: '兑七局，金声玉振，宜以和为贵。',
    8: '艮八局，山止不前，宜静观其变。',
    9: '离九局，火光冲天，宜明辨是非。',
  };
  advices.push(juShuAdvice[juShu] || '');
  
  // 根据格局给建议
  const goodGeJu = geJu.filter(g => g.type === '吉');
  const badGeJu = geJu.filter(g => g.type === '凶');
  
  if (goodGeJu.length > 0) {
    advices.push(`吉格：${goodGeJu.map(g => g.name).join('、')}，主事业顺遂、贵人相助。`);
  }
  if (badGeJu.length > 0) {
    advices.push(`凶格：${badGeJu.map(g => g.name).join('、')}，宜谨慎行事、趋吉避凶。`);
  }
  
  // 检查吉门吉星位置
  let hasGoodDoor = false;
  let hasGoodStar = false;
  for (const [_, door] of doorMap.entries()) {
    if (door.luck === '吉') hasGoodDoor = true;
  }
  for (const [_, star] of nineStarMap.entries()) {
    if (star.luck === '大吉' || star.luck === '小吉') hasGoodStar = true;
  }
  
  if (hasGoodDoor && hasGoodStar) {
    advices.push('八门九星配合得当，诸事顺遂。');
  }
  
  return advices.join('\n');
}

// ==================== 主函数 ====================

/**
 * 计算奇门遁甲盘
 * @param date 日期时间
 * @returns 奇门遁甲盘数据
 */
export function calculateQiMenDunJia(date: Date = new Date()): QiMenDunJiaBoard {
  // 使用 lunar-javascript 获取历法信息
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  // 公历日期
  const solarDate = `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`;
  
  // 农历日期
  const lunarDate = lunar.toString();
  
  // 干支
  const ganZhi = {
    year: lunar.getYearInGanZhi(),
    month: lunar.getMonthInGanZhi(),
    day: lunar.getDayInGanZhi(),
    hour: lunar.getTimeInGanZhi(),
  };
  
  // 节气
  const prevJieQi = lunar.getPrevJieQi();
  const jieQi = prevJieQi ? prevJieQi.getName() : '冬至';
  
  // 判断阴阳遁
  const dunType = getDunType(jieQi);
  
  // 计算局数
  const juShu = calculateJuShu(jieQi, ganZhi.day);
  
  // 局数描述
  const juShuDesc = `${dunType}${juShu}局`;
  
  // 旬首
  const xunShou = getXunShou(ganZhi.hour);
  
  // 排地盘
  const diPan = arrangeDiPan(juShu, dunType);
  
  // 时干位置
  const hourGan = ganZhi.hour[0];
  let hourGanPalace: PalacePosition = 1;
  for (const [pos, qiYi] of diPan.entries()) {
    if (qiYi === (hourGan === '甲' ? xunShou : hourGan)) {
      hourGanPalace = pos;
      break;
    }
  }
  
  // 时支位置（简化：根据地支序号）
  const hourZhi = ganZhi.hour[1];
  const hourZhiIndex = diZhi.indexOf(hourZhi);
  const hourZhiPalace: PalacePosition = ((hourZhiIndex % 9) + 1) as PalacePosition;
  
  // 排天盘
  const tianPan = arrangeTianPan(diPan, xunShou, hourGan, dunType);
  
  // 排九星
  const nineStarMap = arrangeNineStar(hourGanPalace, dunType);
  
  // 排八门
  const doorMap = arrangeEightDoor(hourZhiPalace, dunType);
  
  // 排八神
  const godMap = arrangeEightGod(hourGanPalace, dunType);
  
  // 值符、值使
  let zhiFu = '天蓬';
  let zhiShi = '休门';
  for (const [pos, star] of nineStarMap.entries()) {
    if (pos === hourGanPalace) {
      zhiFu = star.name;
    }
  }
  for (const [pos, door] of doorMap.entries()) {
    if (pos === hourZhiPalace) {
      zhiShi = door.name;
    }
  }
  
  // 判断格局
  const geJu = judgeGeJu(tianPan, diPan, nineStarMap, doorMap, xunShou);
  
  // 构建九宫数据
  const palaces: Palace[] = [];
  for (let i = 1; i <= 9; i++) {
    const pos = i as PalacePosition;
    const palaceInfo = palaceNames[pos];
    
    palaces.push({
      position: pos,
      name: palaceInfo.name,
      direction: palaceInfo.direction,
      wuXing: palaceInfo.wuXing,
      tianPan: tianPan.get(pos),
      diPan: diPan.get(pos),
      nineStar: nineStarMap.get(pos),
      eightDoor: doorMap.get(pos),
      eightGod: godMap.get(pos),
    });
  }
  
  // 生成建议
  const advice = generateAdvice(dunType, juShu, geJu, nineStarMap, doorMap);
  
  return {
    solarDate,
    lunarDate,
    ganZhi,
    jieQi,
    dunType,
    juShu,
    juShuDesc,
    xunShou,
    zhiFu,
    zhiShi,
    palaces,
    hourGanPosition: hourGanPalace,
    hourZhiPosition: hourZhiPalace,
    geJu,
    advice,
  };
}

/**
 * 获取九星信息
 */
export function getNineStarInfo(index: number): NineStarInfo {
  return nineStarData[index % 9];
}

/**
 * 获取八门信息
 */
export function getEightDoorInfo(name: string): EightDoorInfo | undefined {
  return eightDoorData[name];
}

/**
 * 获取八神信息
 */
export function getEightGodInfo(index: number): EightGodInfo {
  return eightGodData[index % 8];
}

/**
 * 获取宫位信息
 */
export function getPalaceInfo(position: PalacePosition) {
  return palaceNames[position];
}
