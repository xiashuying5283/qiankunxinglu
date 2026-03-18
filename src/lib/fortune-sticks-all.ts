// 观音灵签100签完整数据

import { FortuneStickData } from './fortune-sticks-data';
import { fortuneSticksDataPart2 } from './fortune-sticks-data-part2';
import { fortuneSticksDataPart3 } from './fortune-sticks-data-part3';
import { fortuneSticksDataPart4 } from './fortune-sticks-data-part4';
import { fortuneSticksDataPart5 } from './fortune-sticks-data-part5';

// 原始文件中已有的第1-20签
import { fortuneSticksData } from './fortune-sticks-data';

// 合并所有100签数据
export const allFortuneSticksData: FortuneStickData[] = [
  ...fortuneSticksData,      // 第1-20签
  ...fortuneSticksDataPart2, // 第21-40签
  ...fortuneSticksDataPart3, // 第41-60签
  ...fortuneSticksDataPart4, // 第61-80签
  ...fortuneSticksDataPart5  // 第81-100签
];
