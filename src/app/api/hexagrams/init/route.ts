import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hexagrams as hexagramsSource, trigrams as trigramsSource, type LineText } from '@/lib/hexagram-data';
import { clearCache } from '@/lib/cache';

// 缓存键（与 route.ts 保持一致）
const CACHE_KEY = 'hexagrams_data';

export async function POST() {
  try {
    const client = getSupabaseClient();

    // 检查是否已有数据
    const { data: existingHexagrams } = await client
      .from('hexagrams')
      .select('id')
      .limit(1);

    if (existingHexagrams && existingHexagrams.length > 0) {
      return NextResponse.json({ 
        message: '数据已存在，无需初始化',
        hint: '如需重新初始化，请先清空数据库中的 hexagrams 和 trigrams 表'
      });
    }

    // 准备八卦数据
    const trigramsData = trigramsSource.map((t, index) => ({
      number: index + 1,
      name: t.name,
      symbol: t.symbol,
      nature: t.nature,
      attribute: t.attribute,
    }));

    // 插入八卦数据
    const { error: trigramsError } = await client
      .from('trigrams')
      .insert(trigramsData);

    if (trigramsError) {
      console.error('插入八卦数据失败:', trigramsError);
      return NextResponse.json({ error: trigramsError.message }, { status: 500 });
    }

    // 准备64卦数据
    const hexagramsData = hexagramsSource.map(h => ({
      number: h.number,
      name: h.name,
      symbol: h.symbol,
      upper_trigram: h.upperTrigram,
      lower_trigram: h.lowerTrigram,
      binary: h.binary,
      judgement: h.judgement,
      judgement_meaning: h.judgementMeaning,
      image: h.image,
      image_meaning: h.imageMeaning,
      lines: h.lines as unknown as LineText[],
    }));

    // 分批插入（每次10条）
    const batchSize = 10;
    for (let i = 0; i < hexagramsData.length; i += batchSize) {
      const batch = hexagramsData.slice(i, i + batchSize);
      const { error } = await client.from('hexagrams').insert(batch);
      if (error) {
        console.error(`插入卦象数据失败 (batch ${i}):`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // 清除缓存，确保下次请求获取最新数据
    clearCache(CACHE_KEY);

    return NextResponse.json({ 
      success: true,
      message: '数据初始化成功',
      trigramsCount: trigramsData.length,
      hexagramsCount: hexagramsData.length
    });
  } catch (error) {
    console.error('初始化数据失败:', error);
    return NextResponse.json({ error: '初始化失败' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const client = getSupabaseClient();
    
    // 清空数据（按依赖顺序删除）
    await client.from('hexagrams').delete().neq('id', 0);
    await client.from('trigrams').delete().neq('id', 0);
    
    // 清除缓存
    clearCache(CACHE_KEY);
    
    return NextResponse.json({ 
      success: true,
      message: '数据已清空'
    });
  } catch (error) {
    console.error('清空数据失败:', error);
    return NextResponse.json({ error: '清空失败' }, { status: 500 });
  }
}
