declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getXingZuo(): string;
    getLunar(): Lunar;
  }

  export interface JiShi {
    getMinHm(): string;
    getMaxHm(): string;
    getNameInGanZhi(): string;
  }

  export class Lunar {
    toString(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getZhiXing(): string;
    getDayChong(): string;
    getDayChongGanZhi(): string;
    getDaySha(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayJiShi(): JiShi[];
    getDayXiongShi(): JiShi[];
    getPengZuGan(): string;
    getPengZuZhi(): string;
    getDayTaiShen(): string;
    getFuShen(): string;
    getCaiShen(): string;
    getXiShen(): string;
    getYangGui(): string;
    getTaiYang(): string;
    getPrevJieQi(): { getName(): string } | null;
    getXiu(): string;
    getXiuSong(): string;
    getYearPo(): string;
    getMonthPo(): string;
  }

  export const LunarUtil: {
    WU_XING_GAN: Record<string, string>;
    WU_XING_ZHI: Record<string, string>;
  };
}
