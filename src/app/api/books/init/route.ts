import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST /api/books/init - 初始化书籍数据
export async function POST() {
  const client = getSupabaseClient();
  
  try {
    // 检查是否已有数据
    const { data: existingBooks } = await client
      .from('books')
      .select('id')
      .limit(1);
    
    if (existingBooks && existingBooks.length > 0) {
      return NextResponse.json({
        success: true,
        message: '书籍数据已存在，跳过初始化',
      });
    }
    
    // 插入周易正义书籍
    const { data: book, error: bookError } = await client
      .from('books')
      .insert({
        title: '周易正义',
        title_pinyin: 'zhou yi zheng yi',
        author: '孔颖达',
        dynasty: '唐代',
        category: '经',
        description: '《周易正义》是唐代孔颖达奉诏编纂的《五经正义》之一，综合了魏晋南北朝时期易学研究的成果，是研究周易的重要文献。全书分为上下两经，共六十四卦，每卦包含卦辞、爻辞及注疏。',
        total_chapters: 3,
        sort_order: 1,
      })
      .select()
      .single();
    
    if (bookError || !book) {
      return NextResponse.json({
        success: false,
        error: '创建书籍失败: ' + (bookError?.message || '未知错误'),
      }, { status: 500 });
    }
    
    // 插入章节
    const { data: chapters, error: chaptersError } = await client
      .from('chapters')
      .insert([
        { book_id: book.id, parent_id: null, title: '上经卷', slug: 'shang-jing', chapter_order: 1, level: 1, is_leaf: false },
        { book_id: book.id, parent_id: null, title: '下经卷', slug: 'xia-jing', chapter_order: 2, level: 1, is_leaf: false },
      ])
      .select();
    
    if (chaptersError || !chapters) {
      return NextResponse.json({
        success: false,
        error: '创建章节失败',
      }, { status: 500 });
    }
    
    const shangJingId = chapters[0].id;
    
    // 插入卦象章节
    const { data: guaChapters, error: guaError } = await client
      .from('chapters')
      .insert([
        { book_id: book.id, parent_id: shangJingId, title: '乾卦', slug: 'qian-gua', chapter_order: 1, level: 2, is_leaf: true, word_count: 89 },
        { book_id: book.id, parent_id: shangJingId, title: '坤卦', slug: 'kun-gua', chapter_order: 2, level: 2, is_leaf: true, word_count: 0 },
        { book_id: book.id, parent_id: shangJingId, title: '屯卦', slug: 'tun-gua', chapter_order: 3, level: 2, is_leaf: true, word_count: 0 },
      ])
      .select();
    
    if (guaError || !guaChapters) {
      return NextResponse.json({
        success: false,
        error: '创建卦象章节失败',
      }, { status: 500 });
    }
    
    const qianGuaId = guaChapters[0].id;
    
    // 插入乾卦内容
    const { error: contentError } = await client
      .from('book_contents')
      .insert([
        // 原文
        { chapter_id: qianGuaId, content_type: 'original', content: '【乾】元亨利贞。', source: '周易原文', content_order: 1 },
        { chapter_id: qianGuaId, content_type: 'original', content: '【初九】潜龙勿用。', source: '周易原文', content_order: 2 },
        { chapter_id: qianGuaId, content_type: 'original', content: '【九二】见龙在田，利见大人。', source: '周易原文', content_order: 3 },
        { chapter_id: qianGuaId, content_type: 'original', content: '【九三】君子终日乾乾，夕惕若，厉无咎。', source: '周易原文', content_order: 4 },
        { chapter_id: qianGuaId, content_type: 'original', content: '【九四】或跃在渊，无咎。', source: '周易原文', content_order: 5 },
        { chapter_id: qianGuaId, content_type: 'original', content: '【九五】飞龙在天，利见大人。', source: '周易原文', content_order: 6 },
        { chapter_id: qianGuaId, content_type: 'original', content: '【上九】亢龙有悔。', source: '周易原文', content_order: 7 },
        { chapter_id: qianGuaId, content_type: 'original', content: '【用九】见群龙无首，吉。', source: '周易原文', content_order: 8 },
        // 注
        { chapter_id: qianGuaId, content_type: 'note', content: '【注】乾者，天也，健也。元者，善之长也。亨者，嘉之会也。利者，义之和也。贞者，事之干也。', source: '孔颖达疏', content_order: 10 },
        // 疏
        { chapter_id: qianGuaId, content_type: 'commentary', content: '【疏】正义曰：乾卦之名，以天为象。天者，乾之象也，以乾为天者，乾是卦名，天是卦象。天能运转，四时行焉，百物生焉，故以天为乾象也。', source: '孔颖达正义', content_order: 20 },
        // 译文
        { chapter_id: qianGuaId, content_type: 'translation', content: '【译文】乾卦象征天，元始、通达、和谐、贞正。这四种德性是天道的体现，也是君子应当追求的品质。', source: '现代译文', content_order: 30 },
      ]);
    
    if (contentError) {
      return NextResponse.json({
        success: false,
        error: '创建内容失败: ' + contentError.message,
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: '书籍数据初始化成功',
      data: {
        book: book.title,
        chapters: chapters.length + guaChapters.length,
      },
    });
  } catch (error) {
    console.error('初始化书籍数据失败:', error);
    return NextResponse.json({
      success: false,
      error: '初始化失败',
    }, { status: 500 });
  }
}
