import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取观音灵签
 * GET /api/fortune-sticks - 获取所有灵签
 * GET /api/fortune-sticks?number=X - 获取指定签
 * GET /api/fortune-sticks?random=true - 随机抽取一签
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const numberParam = searchParams.get('number');
    const randomParam = searchParams.get('random');

    // 获取指定签号
    if (numberParam) {
      const number = parseInt(numberParam, 10);
      if (isNaN(number) || number < 1 || number > 100) {
        return NextResponse.json(
          { success: false, message: '签号必须在1-100之间' },
          { status: 400 }
        );
      }

      const { data, error } = await client
        .from('fortune_sticks')
        .select('*')
        .eq('number', number)
        .limit(1);

      if (error) {
        return NextResponse.json(
          { success: false, message: '查询失败', error: error.message },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        return NextResponse.json(
          { success: false, message: '未找到该签' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data[0]
      });
    }

    // 随机抽取一签
    if (randomParam === 'true') {
      const { data, error } = await client
        .rpc('get_random_fortune_stick');

      // 如果 RPC 函数不存在，使用替代方案
      if (error) {
        // 先获取总数
        const { count } = await client
          .from('fortune_sticks')
          .select('*', { count: 'exact', head: true });

        if (!count || count === 0) {
          return NextResponse.json(
            { success: false, message: '暂无灵签数据，请先初始化' },
            { status: 404 }
          );
        }

        // 随机选择一个签号
        const randomNumber = Math.floor(Math.random() * count) + 1;
        
        const { data: stick, error: stickError } = await client
          .from('fortune_sticks')
          .select('*')
          .eq('number', randomNumber)
          .limit(1);

        if (stickError || !stick || stick.length === 0) {
          return NextResponse.json(
            { success: false, message: '获取失败' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          data: stick[0]
        });
      }

      if (!data) {
        return NextResponse.json(
          { success: false, message: '暂无灵签数据，请先初始化' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data
      });
    }

    // 获取所有灵签
    const { data, error } = await client
      .from('fortune_sticks')
      .select('*')
      .order('number');

    if (error) {
      return NextResponse.json(
        { success: false, message: '获取失败', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data
    });
  } catch (error) {
    console.error('获取灵签失败:', error);
    return NextResponse.json(
      { success: false, message: '获取失败', error: String(error) },
      { status: 500 }
    );
  }
}
