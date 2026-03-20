import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 六十四卦数据
const HEXAGRAMS_UPPER = [
  { name: '乾', slug: 'qian', order: 1 },
  { name: '坤', slug: 'kun', order: 2 },
  { name: '屯', slug: 'tun', order: 3 },
  { name: '蒙', slug: 'meng', order: 4 },
  { name: '需', slug: 'xu', order: 5 },
  { name: '讼', slug: 'song', order: 6 },
  { name: '师', slug: 'shi', order: 7 },
  { name: '比', slug: 'bi', order: 8 },
  { name: '小畜', slug: 'xiaochu', order: 9 },
  { name: '履', slug: 'lv', order: 10 },
  { name: '泰', slug: 'tai', order: 11 },
  { name: '否', slug: 'pi', order: 12 },
  { name: '同人', slug: 'tongren', order: 13 },
  { name: '大有', slug: 'dayou', order: 14 },
  { name: '谦', slug: 'qian2', order: 15 },
  { name: '豫', slug: 'yu', order: 16 },
  { name: '随', slug: 'sui', order: 17 },
  { name: '蛊', slug: 'gu', order: 18 },
  { name: '临', slug: 'lin', order: 19 },
  { name: '观', slug: 'guan', order: 20 },
  { name: '噬嗑', slug: 'shihe', order: 21 },
  { name: '贲', slug: 'bi', order: 22 },
  { name: '剥', slug: 'bo', order: 23 },
  { name: '复', slug: 'fu', order: 24 },
  { name: '无妄', slug: 'wuwang', order: 25 },
  { name: '大畜', slug: 'dachu', order: 26 },
  { name: '颐', slug: 'yi', order: 27 },
  { name: '大过', slug: 'daguo', order: 28 },
  { name: '坎', slug: 'kan', order: 29 },
  { name: '离', slug: 'li', order: 30 },
];

const HEXAGRAMS_LOWER = [
  { name: '咸', slug: 'xian', order: 31 },
  { name: '恒', slug: 'heng', order: 32 },
  { name: '遁', slug: 'dun', order: 33 },
  { name: '大壮', slug: 'dazhuang', order: 34 },
  { name: '晋', slug: 'jin', order: 35 },
  { name: '明夷', slug: 'mingyi', order: 36 },
  { name: '家人', slug: 'jiaren', order: 37 },
  { name: '睽', slug: 'kui', order: 38 },
  { name: '蹇', slug: 'jian', order: 39 },
  { name: '解', slug: 'jie', order: 40 },
  { name: '损', slug: 'sun', order: 41 },
  { name: '益', slug: 'yi2', order: 42 },
  { name: '夬', slug: 'guai', order: 43 },
  { name: '姤', slug: 'gou', order: 44 },
  { name: '萃', slug: 'cui', order: 45 },
  { name: '升', slug: 'sheng', order: 46 },
  { name: '困', slug: 'kun2', order: 47 },
  { name: '井', slug: 'jing', order: 48 },
  { name: '革', slug: 'ge', order: 49 },
  { name: '鼎', slug: 'ding', order: 50 },
  { name: '震', slug: 'zhen', order: 51 },
  { name: '艮', slug: 'gen', order: 52 },
  { name: '渐', slug: 'jian2', order: 53 },
  { name: '归妹', slug: 'guimei', order: 54 },
  { name: '丰', slug: 'feng', order: 55 },
  { name: '旅', slug: 'lv2', order: 56 },
  { name: '巽', slug: 'xun', order: 57 },
  { name: '兑', slug: 'dui', order: 58 },
  { name: '涣', slug: 'huan', order: 59 },
  { name: '节', slug: 'jie2', order: 60 },
  { name: '中孚', slug: 'zhongfu', order: 61 },
  { name: '小过', slug: 'xiaoguo', order: 62 },
  { name: '既济', slug: 'jiji', order: 63 },
  { name: '未济', slug: 'weiji', order: 64 },
];

// 乾卦完整内容
const QIAN_CONTENT = [
  {
    type: 'original',
    source: '卦辞',
    content: '乾：元、亨、利、贞。',
    order: 1,
  },
  {
    type: 'original',
    source: '彖传',
    content: '彖曰：大哉乾元，万物资始，乃统天。云行雨施，品物流形。大明终始，六位时成，时乘六龙以御天。乾道变化，各正性命，保合太和，乃利贞。首出庶物，万国咸宁。',
    order: 2,
  },
  {
    type: 'original',
    source: '象传',
    content: '象曰：天行健，君子以自强不息。',
    order: 3,
  },
  {
    type: 'original',
    source: '爻辞',
    content: `初九：潜龙勿用。
九二：见龙在田，利见大人。
九三：君子终日乾乾，夕惕若厉，无咎。
九四：或跃在渊，无咎。
九五：飞龙在天，利见大人。
上九：亢龙有悔。
用九：见群龙无首，吉。`,
    order: 4,
  },
  {
    type: 'note',
    source: '王弼注',
    content: `"乾"者，此卦之名。谓之卦者，《易纬》云："卦者挂也，言县挂物象，以示於人，故谓之卦。"但二画之体，虽象阴阳之气，未成万物之象，未得成卦，必三画以象三才，写天、地、雷、风、水、火、山、泽之象，乃谓之卦也。`,
    order: 5,
  },
  {
    type: 'commentary',
    source: '孔颖达疏',
    content: `正义曰："乾"者，此卦之名。谓之卦者，《易纬》云："卦者挂也，言县挂物象，以示於人，故谓之卦。"但二画之体，虽象阴阳之气，未成万物之象，未得成卦，必三画以象三才，写天、地、雷、风、水、火、山、泽之象，乃谓之卦也。故系辞云"八卦成列，象在其中矣"是也。但初有三画，虽有万物之象，於万物变通之理，犹有未尽，故更重之而有六画，备万物之形象，穷天下之能事，故六画成卦也。此乾卦本以象天，天乃积诸阳气而成天，故此卦六爻皆阳画成卦也。`,
    order: 6,
  },
];

// 建表SQL（需要在 Supabase 控制台执行）
const CREATE_TABLES_SQL = `
-- 1. 书籍表
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_pinyin VARCHAR(255),
  author VARCHAR(100),
  dynasty VARCHAR(50),
  category VARCHAR(50),
  description TEXT,
  cover_url VARCHAR(500),
  total_chapters INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 章节表
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100),
  chapter_order INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  is_leaf BOOLEAN DEFAULT false,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 内容表
CREATE TABLE IF NOT EXISTS book_contents (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  source VARCHAR(100),
  content_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_parent_id ON chapters(parent_id);
CREATE INDEX IF NOT EXISTS idx_book_contents_chapter_id ON book_contents(chapter_id);
`;

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    
    // 1. 检查是否已有数据
    const { data: existingBooks, error: checkError } = await client
      .from('books')
      .select('id')
      .eq('title', '周易正义')
      .limit(1);
    
    // 如果查询出错，可能是表不存在
    if (checkError) {
      return NextResponse.json({
        success: false,
        message: '数据库表可能不存在，请先在 Supabase 控制台执行以下 SQL 创建表',
        sql: CREATE_TABLES_SQL,
      });
    }
    
    if (existingBooks && existingBooks.length > 0) {
      return NextResponse.json({
        success: true,
        message: '数据已存在，跳过初始化',
        bookId: existingBooks[0].id,
      });
    }
    
    // 2. 插入书籍
    const { data: book, error: bookError } = await client
      .from('books')
      .insert({
        title: '周易正义',
        title_pinyin: 'zhouyi zhengyi',
        author: '孔颖达',
        dynasty: '唐',
        category: '经',
        description: '《周易正义》是唐代孔颖达奉敕编纂的《五经正义》之一，采王弼、韩康伯注，加以疏解，为唐代以后科举取士的标准用书。',
        total_chapters: 64,
        status: 'active',
        sort_order: 1,
      })
      .select()
      .single();
    
    if (bookError || !book) {
      return NextResponse.json({
        success: false,
        message: '插入书籍失败，请检查数据库连接',
        error: bookError?.message,
      });
    }
    
    // 3. 插入上经、下经卷
    const { data: shangjing } = await client
      .from('chapters')
      .insert({
        book_id: book.id,
        parent_id: null,
        title: '上经',
        slug: 'shangjing',
        chapter_order: 1,
        level: 1,
        is_leaf: false,
      })
      .select()
      .single();
    
    const { data: xiajing } = await client
      .from('chapters')
      .insert({
        book_id: book.id,
        parent_id: null,
        title: '下经',
        slug: 'xiajing',
        chapter_order: 2,
        level: 1,
        is_leaf: false,
      })
      .select()
      .single();
    
    // 4. 插入上经三十卦
    const upperChapters = HEXAGRAMS_UPPER.map(hex => ({
      book_id: book.id,
      parent_id: shangjing?.id || null,
      title: `${hex.name}卦`,
      slug: hex.slug,
      chapter_order: hex.order,
      level: 2,
      is_leaf: true,
    }));
    
    await client.from('chapters').insert(upperChapters);
    
    // 5. 插入下经三十四卦
    const lowerChapters = HEXAGRAMS_LOWER.map(hex => ({
      book_id: book.id,
      parent_id: xiajing?.id || null,
      title: `${hex.name}卦`,
      slug: hex.slug,
      chapter_order: hex.order,
      level: 2,
      is_leaf: true,
    }));
    
    await client.from('chapters').insert(lowerChapters);
    
    // 6. 插入乾卦内容
    const { data: qianChapter } = await client
      .from('chapters')
      .select('id')
      .eq('book_id', book.id)
      .eq('slug', 'qian')
      .single();
    
    if (qianChapter) {
      const contents = QIAN_CONTENT.map(c => ({
        chapter_id: qianChapter.id,
        content_type: c.type,
        content: c.content,
        source: c.source,
        content_order: c.order,
      }));
      
      await client.from('book_contents').insert(contents);
    }
    
    return NextResponse.json({
      success: true,
      message: '古籍数据初始化成功',
      book: {
        id: book.id,
        title: book.title,
        chapters: 64,
      },
    });
    
  } catch (error: any) {
    console.error('初始化失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '初始化失败' },
      { status: 500 }
    );
  }
}

// GET 方法返回建表 SQL
export async function GET() {
  return NextResponse.json({
    success: true,
    message: '请在 Supabase 控制台执行以下 SQL 创建表，然后使用 POST 方法初始化数据',
    sql: CREATE_TABLES_SQL,
  });
}
