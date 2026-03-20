import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 词条参考文献映射
const TERM_REFERENCES: Record<string, Array<{ title: string; author?: string; publisher?: string; year?: string }>> = {
  '卦': [
    { title: '周易正义', author: '王弼 注，孔颖达 疏', publisher: '中华书局', year: '1980' },
    { title: '周易本义', author: '朱熹', publisher: '中华书局', year: '2009' },
  ],
  '爻': [
    { title: '周易正义', author: '王弼 注，孔颖达 疏', publisher: '中华书局', year: '1980' },
  ],
  '本卦': [
    { title: '易经入门', author: '傅佩荣', publisher: '新星出版社', year: '2011' },
  ],
  '变卦': [
    { title: '易经入门', author: '傅佩荣', publisher: '新星出版社', year: '2011' },
  ],
  '动爻': [
    { title: '易经入门', author: '傅佩荣', publisher: '新星出版社', year: '2011' },
  ],
  '卦辞': [
    { title: '周易正义', author: '王弼 注，孔颖达 疏', publisher: '中华书局', year: '1980' },
  ],
  '爻辞': [
    { title: '周易正义', author: '王弼 注，孔颖达 疏', publisher: '中华书局', year: '1980' },
  ],
  '八卦': [
    { title: '周易正义', author: '王弼 注，孔颖达 疏', publisher: '中华书局', year: '1980' },
    { title: '周易本义', author: '朱熹', publisher: '中华书局', year: '2009' },
  ],
  '体用': [
    { title: '梅花易数', author: '邵雍', publisher: '华龄出版社', year: '2008' },
  ],
  '元亨利贞': [
    { title: '周易正义', author: '王弼 注，孔颖达 疏', publisher: '中华书局', year: '1980' },
  ],
  '老阳': [
    { title: '易经入门', author: '傅佩荣', publisher: '新星出版社', year: '2011' },
  ],
  '老阴': [
    { title: '易经入门', author: '傅佩荣', publisher: '新星出版社', year: '2011' },
  ],
  '六十四卦': [
    { title: '周易正义', author: '王弼 注，孔颖达 疏', publisher: '中华书局', year: '1980' },
  ],
  '生克': [
    { title: '黄帝内经', author: '佚名', publisher: '人民卫生出版社', year: '2012' },
    { title: '尚书·洪范', author: '佚名', publisher: '中华书局', year: '1980' },
  ],
  // 八字词条
  '八字': [
    { title: '渊海子平', author: '徐子平', publisher: '中州古籍出版社', year: '2012' },
  ],
  '天干': [
    { title: '史记·律书', author: '司马迁', publisher: '中华书局', year: '1959' },
    { title: '渊海子平', author: '徐子平', publisher: '中州古籍出版社', year: '2012' },
  ],
  '地支': [
    { title: '史记·律书', author: '司马迁', publisher: '中华书局', year: '1959' },
    { title: '渊海子平', author: '徐子平', publisher: '中州古籍出版社', year: '2012' },
  ],
  '日主': [
    { title: '渊海子平', author: '徐子平', publisher: '中州古籍出版社', year: '2012' },
    { title: '三命通会', author: '万民英', publisher: '中医古籍出版社', year: '2010' },
  ],
  '十神': [
    { title: '渊海子平', author: '徐子平', publisher: '中州古籍出版社', year: '2012' },
    { title: '三命通会', author: '万民英', publisher: '中医古籍出版社', year: '2010' },
  ],
  '五行': [
    { title: '尚书·洪范', author: '佚名', publisher: '中华书局', year: '1980' },
    { title: '黄帝内经', author: '佚名', publisher: '人民卫生出版社', year: '2012' },
  ],
  '神煞': [
    { title: '三命通会', author: '万民英', publisher: '中医古籍出版社', year: '2010' },
    { title: '滴天髓', author: '刘伯温', publisher: '华龄出版社', year: '2009' },
  ],
  '纳音': [
    { title: '三命通会', author: '万民英', publisher: '中医古籍出版社', year: '2010' },
  ],
};

/**
 * 为现有词条添加参考文献
 * POST /api/glossary/add-refs
 * 
 * 注意：需要先确保 glossary 表有 refs 列
 */
export async function POST() {
  try {
    const client = getSupabaseClient();
    const results: string[] = [];
    
    for (const [term, refs] of Object.entries(TERM_REFERENCES)) {
      try {
        const { error } = await client
          .from('glossary')
          .update({ refs: refs })
          .eq('term', term);
        
        if (error) {
          // 如果是列不存在错误，跳过
          if (error.message.includes('refs')) {
            results.push(`⚠️ ${term}: refs 列不存在，请先运行迁移`);
          } else {
            results.push(`❌ ${term}: ${error.message}`);
          }
        } else {
          results.push(`✅ ${term}: 添加 ${refs.length} 条参考文献`);
        }
      } catch (e) {
        results.push(`❌ ${term}: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
    
    return NextResponse.json({
      message: '参考文献添加完成',
      results,
      total: Object.keys(TERM_REFERENCES).length,
      note: '如果看到 "refs 列不存在"，请在 Supabase 控制台执行：ALTER TABLE glossary ADD COLUMN refs JSONB DEFAULT \'[]\'::jsonb;'
    });
  } catch (error) {
    console.error('添加参考文献失败:', error);
    return NextResponse.json({
      error: '操作失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
