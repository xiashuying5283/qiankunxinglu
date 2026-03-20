import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST /api/books/init - 确保书籍数据存在
export async function POST() {
  const client = getSupabaseClient();
  const logs: string[] = [];
  
  try {
    logs.push(`Environment: ${process.env.COZE_PROJECT_ENV || 'unknown'}`);
    logs.push(`Supabase URL: ${process.env.COZE_SUPABASE_URL || 'not set'}`);
    logs.push(`Time: ${new Date().toISOString()}`);
    
    // 检查是否已有数据
    const { data: existing, error: checkErr } = await client.from('books').select('id').limit(1);
    
    if (checkErr) {
      logs.push(`⚠️ 检查书籍表失败: ${checkErr.message}`);
      logs.push(`错误详情: ${JSON.stringify(checkErr)}`);
      // 表可能不存在，继续尝试创建
    } else {
      logs.push(`✓ 书籍表检查成功，现有记录: ${existing?.length || 0}`);
    }
    
    if (existing && existing.length > 0) {
      logs.push('数据已存在，跳过初始化');
      return NextResponse.json({ success: true, message: '数据已存在', logs });
    }
    
    logs.push('开始创建书籍数据...');
    
    // 创建书籍
    const { data: book, error: bookErr } = await client.from('books').insert({
      title: '周易正义',
      title_pinyin: 'zhou yi zheng yi',
      author: '孔颖达',
      dynasty: '唐代',
      category: '经',
      description: '《周易正义》是唐代孔颖达奉诏编纂的《五经正义》之一，综合了魏晋南北朝时期易学研究的成果，是研究周易的重要文献。全书分为上下两经，共六十四卦，每卦包含卦辞、爻辞及注疏。',
      total_chapters: 3,
      sort_order: 1,
      status: 'active',
    }).select().single();
    
    if (bookErr || !book) {
      logs.push(`❌ 创建书籍失败: ${bookErr?.message}`);
      logs.push(`错误详情: ${JSON.stringify(bookErr)}`);
      return NextResponse.json({ success: false, error: bookErr?.message, logs }, { status: 500 });
    }
    
    logs.push(`✓ 创建书籍成功: ${book.title} (id=${book.id})`);
    
    // 创建章节
    const { data: ch1, error: ch1Err } = await client.from('chapters').insert({
      book_id: book.id, title: '上经卷', slug: 'shang-jing', chapter_order: 1, level: 1, is_leaf: false,
    }).select().single();
    
    if (ch1Err) {
      logs.push(`❌ 创建上经卷失败: ${ch1Err.message}`);
      logs.push(`错误详情: ${JSON.stringify(ch1Err)}`);
    } else {
      logs.push(`✓ 创建上经卷成功 (id=${ch1?.id})`);
    }
    
    const { data: ch2, error: ch2Err } = await client.from('chapters').insert({
      book_id: book.id, title: '下经卷', slug: 'xia-jing', chapter_order: 2, level: 1, is_leaf: false,
    }).select().single();
    
    if (ch2Err) {
      logs.push(`❌ 创建下经卷失败: ${ch2Err.message}`);
    } else {
      logs.push(`✓ 创建下经卷成功 (id=${ch2?.id})`);
    }
    
    if (!ch1) {
      logs.push('❌ 上经卷创建失败，无法继续创建卦象');
      return NextResponse.json({ success: false, error: '章节创建失败', logs }, { status: 500 });
    }
    
    const { data: guas, error: guasErr } = await client.from('chapters').insert([
      { book_id: book.id, parent_id: ch1.id, title: '乾卦', slug: 'qian-gua', chapter_order: 1, level: 2, is_leaf: true, word_count: 89 },
      { book_id: book.id, parent_id: ch1.id, title: '坤卦', slug: 'kun-gua', chapter_order: 2, level: 2, is_leaf: true },
      { book_id: book.id, parent_id: ch1.id, title: '屯卦', slug: 'tun-gua', chapter_order: 3, level: 2, is_leaf: true },
    ]).select();
    
    if (guasErr) {
      logs.push(`❌ 创建卦象章节失败: ${guasErr.message}`);
      logs.push(`错误详情: ${JSON.stringify(guasErr)}`);
    } else {
      logs.push(`✓ 创建卦象章节成功: ${guas?.length || 0}条`);
    }
    
    const qianGua = guas?.[0];
    
    // 创建内容
    if (qianGua) {
      logs.push(`开始创建乾卦内容 (chapter_id=${qianGua.id})...`);
      const { error: contentErr } = await client.from('book_contents').insert([
        { chapter_id: qianGua.id, content_type: 'original', content: '【乾】元亨利贞。', source: '周易原文', content_order: 1 },
        { chapter_id: qianGua.id, content_type: 'original', content: '【初九】潜龙勿用。', source: '周易原文', content_order: 2 },
        { chapter_id: qianGua.id, content_type: 'original', content: '【九二】见龙在田，利见大人。', source: '周易原文', content_order: 3 },
        { chapter_id: qianGua.id, content_type: 'original', content: '【九三】君子终日乾乾，夕惕若，厉无咎。', source: '周易原文', content_order: 4 },
        { chapter_id: qianGua.id, content_type: 'original', content: '【九四】或跃在渊，无咎。', source: '周易原文', content_order: 5 },
        { chapter_id: qianGua.id, content_type: 'original', content: '【九五】飞龙在天，利见大人。', source: '周易原文', content_order: 6 },
        { chapter_id: qianGua.id, content_type: 'original', content: '【上九】亢龙有悔。', source: '周易原文', content_order: 7 },
        { chapter_id: qianGua.id, content_type: 'original', content: '【用九】见群龙无首，吉。', source: '周易原文', content_order: 8 },
        { chapter_id: qianGua.id, content_type: 'note', content: '【注】乾者，天也，健也。元者，善之长也。亨者，嘉之会也。利者，义之和也。贞者，事之干也。', source: '孔颖达疏', content_order: 10 },
        { chapter_id: qianGua.id, content_type: 'commentary', content: '【疏】正义曰：乾卦之名，以天为象。天者，乾之象也，以乾为天者，乾是卦名，天是卦象。天能运转，四时行焉，百物生焉，故以天为乾象也。', source: '孔颖达正义', content_order: 20 },
        { chapter_id: qianGua.id, content_type: 'translation', content: '【译文】乾卦象征天，元始、通达、和谐、贞正。这四种德性是天道的体现，也是君子应当追求的品质。', source: '现代译文', content_order: 30 },
      ]);
      
      if (contentErr) {
        logs.push(`❌ 创建乾卦内容失败: ${contentErr.message}`);
        logs.push(`错误详情: ${JSON.stringify(contentErr)}`);
      } else {
        logs.push(`✓ 创建乾卦内容成功: 11条`);
      }
    } else {
      logs.push('❌ 乾卦章节不存在，跳过内容创建');
    }
    
    // 最终验证
    const { data: finalBooks } = await client.from('books').select('id');
    const { data: finalChapters } = await client.from('chapters').select('id');
    const { data: finalContents } = await client.from('book_contents').select('id');
    
    logs.push('📊 最终统计:');
    logs.push(`   - 书籍: ${finalBooks?.length || 0} 条`);
    logs.push(`   - 章节: ${finalChapters?.length || 0} 条`);
    logs.push(`   - 内容: ${finalContents?.length || 0} 条`);
    logs.push('✅ 数据初始化完成');
    
    return NextResponse.json({ success: true, message: '数据初始化完成', logs });
  } catch (e) {
    logs.push(`❌ 异常: ${String(e)}`);
    return NextResponse.json({ success: false, error: String(e), logs }, { status: 500 });
  }
}
