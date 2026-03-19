declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getXingZuo(): string;
    getLunar(): Lunar;
  }

  export class LunarTime {
    getGan(): string;
    getZhi(): string;
    getGanZhi(): string;
    getMinHm(): string;
    getMaxHm(): string;
    getTianShenType(): string;
    getYi(): string[];
    getJi(): string[];
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
    getDayChongShengXiao(): string;
    getDayChongDesc(): string;
    getDaySha(): string;
    getDayYi(): string[];
    getDayJi(): string[];
    getTimes(): LunarTime[];
    getPengZuGan(): string;
    getPengZuZhi(): string;
    getDayPositionTai(): string;
    getDayPositionFuDesc(): string;
    getDayPositionCaiDesc(): string;
    getDayPositionXiDesc(): string;
    getDayPositionYangGuiDesc(): string;
    getPrevJieQi(): { getName(): string } | null;
    getXiu(): string;
    getXiuSong(): string;
    getDayJiShen(): string[];
    getDayXiongSha(): string[];
  }

  export const LunarUtil: {
    WU_XING_GAN: Record<string, string>;
    WU_XING_ZHI: Record<string, string>;
  };
}
