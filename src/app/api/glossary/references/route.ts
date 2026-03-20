import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 专业参考文献数据
const DEFAULT_REFERENCES = [
  // 周易经典
  {
    title: '周易正义',
    author: '王弼 注，孔颖达 疏',
    publisher: '中华书局',
    year: '1980',
    category: 'iching',
    description: '魏王弼注，唐孔颖达疏，为《周易》最权威的注疏本，收入《十三经注疏》。',
  },
  {
    title: '周易本义',
    author: '朱熹',
    publisher: '中华书局',
    year: '2009',
    category: 'iching',
    description: '南宋朱熹所著，以义理解易，对后世影响深远。',
  },
  {
    title: '梅花易数',
    author: '邵雍',
    publisher: '华龄出版社',
    year: '2008',
    category: 'iching',
    description: '北宋邵雍所创占卜方法，以体用生克为核心，简便易学。',
  },
  {
    title: '易经入门',
    author: '傅佩荣',
    publisher: '新星出版社',
    year: '2011',
    category: 'iching',
    description: '现代学者傅佩荣所著，适合初学者的易经入门读物。',
  },
  // 八字命理
  {
    title: '渊海子平',
    author: '徐子平',
    publisher: '中州古籍出版社',
    year: '2012',
    category: 'bazi',
    description: '八字命理学的奠基之作，宋代徐子平所著，系统论述四柱命理。',
  },
  {
    title: '三命通会',
    author: '万民英',
    publisher: '中医古籍出版社',
    year: '2010',
    category: 'bazi',
    description: '明代万民英编撰，集八字命理之大成，内容详尽丰富。',
  },
  {
    title: '滴天髓',
    author: '刘伯温',
    publisher: '华龄出版社',
    year: '2009',
    category: 'bazi',
    description: '传为明代刘伯温所著，以格局论命，为命理学经典。',
  },
  {
    title: '穷通宝鉴',
    author: '余春台',
    publisher: '华龄出版社',
    year: '2010',
    category: 'bazi',
    description: '清余春台编撰，专论调候用神，为命理学者必读。',
  },
  // 通用经典
  {
    title: '尚书·洪范',
    author: '佚名',
    publisher: '中华书局',
    year: '1980',
    category: 'general',
    description: '《尚书》篇章，最早记载五行学说：水、火、木、金、土。',
  },
  {
    title: '史记·律书',
    author: '司马迁',
    publisher: '中华书局',
    year: '1959',
    category: 'general',
    description: '《史记》律书篇，记载天干地支与天文历法的关系。',
  },
  {
    title: '黄帝内经',
    author: '佚名',
    publisher: '人民卫生出版社',
    year: '2012',
    category: 'general',
    description: '中医经典，论述阴阳五行学说在医学中的应用。',
  },
];

/**
 * 获取参考文献列表
 * GET /api/glossary/references
 * 
 * Query params:
 * - category: 分类筛选
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const client = getSupabaseClient();
    
    let query = client
      .from('glossary_references')
      .select('*')
      .order('title', { ascending: true });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      // 表可能不存在，返回默认数据
      return NextResponse.json(DEFAULT_REFERENCES.map(ref => ({
        ...ref,
        examples: [],
        relatedTerms: [],
      })));
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('获取参考文献失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

/**
 * 初始化参考文献数据
 * POST /api/glossary/references
 */
export async function POST() {
  try {
    const client = getSupabaseClient();
    
    // 检查是否已有数据
    const { data: existing } = await client
      .from('glossary_references')
      .select('id')
      .limit(1);
    
    if (existing && existing.length > 0) {
      return NextResponse.json({
        message: '数据已存在，跳过初始化',
        count: existing.length
      });
    }
    
    // 插入数据
    const { error } = await client
      .from('glossary_references')
      .insert(DEFAULT_REFERENCES);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      message: '初始化成功',
      count: DEFAULT_REFERENCES.length
    });
  } catch (error) {
    console.error('初始化参考文献失败:', error);
    return NextResponse.json({
      error: '初始化失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
