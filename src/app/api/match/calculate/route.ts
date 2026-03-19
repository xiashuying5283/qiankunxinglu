import { NextRequest, NextResponse } from 'next/server';
import {
  parseBirthDate,
  calculateBaziFromSolar,
  analyzeMatch,
  type BaziResult
} from '@/lib/match-algorithm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name1, birth1, hour1, isLunar1,
      name2, birth2, hour2, isLunar2 
    } = body;

    // 参数验证
    if (!name1 || !birth1 || hour1 === undefined || !name2 || !birth2 || hour2 === undefined) {
      return NextResponse.json(
        { error: '请提供完整的双方信息' },
        { status: 400 }
      );
    }

    // 解析出生日期
    const date1 = parseBirthDate(birth1);
    const date2 = parseBirthDate(birth2);

    if (!date1 || !date2) {
      return NextResponse.json(
        { error: '日期格式错误，请使用 YYYY-MM-DD 格式' },
        { status: 400 }
      );
    }

    // 计算八字（使用 lunar-javascript 精确算法，支持公历/农历）
    const bazi1 = calculateBaziFromSolar(date1.year, date1.month, date1.day, hour1, isLunar1 || false);
    const bazi2 = calculateBaziFromSolar(date2.year, date2.month, date2.day, hour2, isLunar2 || false);

    // 进行匹配分析
    const matchResult = analyzeMatch(bazi1, bazi2);

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        name1,
        name2,
        bazi1: {
          year: bazi1.year,
          month: bazi1.month,
          day: bazi1.day,
          hour: bazi1.hour,
          shengxiao: bazi1.shengxiao,
          wuxing: bazi1.wuxing,
          dominantWuXing: bazi1.dominantWuXing,
          missingWuXing: bazi1.missingWuXing
        },
        bazi2: {
          year: bazi2.year,
          month: bazi2.month,
          day: bazi2.day,
          hour: bazi2.hour,
          shengxiao: bazi2.shengxiao,
          wuxing: bazi2.wuxing,
          dominantWuXing: bazi2.dominantWuXing,
          missingWuXing: bazi2.missingWuXing
        },
        score: matchResult.score,
        level: matchResult.level,
        shengxiaoMatch: matchResult.shengxiaoMatch,
        baziMatch: matchResult.baziMatch
      }
    });
  } catch (error) {
    console.error('Match calculation error:', error);
    return NextResponse.json(
      { error: '匹配计算失败，请稍后重试' },
      { status: 500 }
    );
  }
}
