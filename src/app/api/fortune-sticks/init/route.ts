import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { allFortuneSticksData } from '@/lib/fortune-sticks-all';

/**
 * 初始化观音灵签数据
 * POST /api/fortune-sticks/init
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 检查是否已有数据
    const { data: existing } = await client
      .from('fortune_sticks')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, message: '灵签数据已存在，无需重复初始化' },
        { status: 400 }
      );
    }

    // 准备插入数据
    const sticksData = allFortuneSticksData.map(stick => ({
      number: stick.number,
      title: stick.title,
      poem: stick.poem,
      meaning: stick.meaning,
      level: stick.level,
      story: stick.story || null,
      interpretation: stick.interpretation,
    }));

    // 分批插入（每次20条）
    const batchSize = 20;
    let insertedCount = 0;
    for (let i = 0; i < sticksData.length; i += batchSize) {
      const batch = sticksData.slice(i, i + batchSize);
      const { error } = await client.from('fortune_sticks').insert(batch);
      if (error) {
        console.error(`插入灵签数据失败 (batch ${i}):`, error);
        return NextResponse.json(
          { success: false, message: '插入失败', error: error.message },
          { status: 500 }
        );
      }
      insertedCount += batch.length;
    }

    return NextResponse.json({
      success: true,
      message: '灵签数据初始化成功',
      count: insertedCount
    });
  } catch (error) {
    console.error('初始化灵签数据失败:', error);
    return NextResponse.json(
      { success: false, message: '初始化失败', error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * 获取初始化状态
 * GET /api/fortune-sticks/init
 */
export async function GET() {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('fortune_sticks')
      .select('id');
    
    if (error) {
      return NextResponse.json(
        { success: false, message: '查询失败', error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      initialized: (data?.length || 0) > 0,
      count: data?.length || 0,
      expected: 100
    });
  } catch (error) {
    console.error('查询灵签数据状态失败:', error);
    return NextResponse.json(
      { success: false, message: '查询失败', error: String(error) },
      { status: 500 }
    );
  }
}
