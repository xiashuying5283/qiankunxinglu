declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    toYmd(): string;
    toYmdHms(): string;
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

  export class JieQi {
    getName(): string;
    getSolar(): Solar;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar;
    static fromSolar(solar: Solar): Lunar;
    static fromDate(date: Date): Lunar;
    
    getSolar(): Solar;
    toString(): string;
    toFullString(): string;
    
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    
    getYearShengXiao(): string;
    getMonthInChinese(): string;
    
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    
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
    
    getPrevJieQi(): JieQi | null;
    getNextJieQi(): JieQi | null;
    
    getDayJiShen(): string[];
    getDayXiongSha(): string[];
    getXiu(): string;
    getXiuSong(): string;
  }

  export const LunarUtil: {
    WU_XING_GAN: Record<string, string>;
    WU_XING_ZHI: Record<string, string>;
  };
}
