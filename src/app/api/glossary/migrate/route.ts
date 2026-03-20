import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 数据库迁移：添加参考文献字段和用户贡献表
 * POST /api/glossary/migrate
 */
export async function POST() {
  const client = getSupabaseClient();
  const results: string[] = [];

  try {
    // 1. 为 glossary 表添加 references 字段
    try {
      await client.rpc('exec_sql', {
        query: `
          ALTER TABLE glossary 
          ADD COLUMN IF NOT EXISTS references JSONB DEFAULT '[]'::jsonb;
        `
      });
      results.push('✅ 添加 glossary.references 字段');
    } catch (e) {
      // 字段可能已存在，尝试直接更新
      results.push('⚠️ references 字段可能已存在');
    }

    // 2. 创建参考文献表
    const createReferencesTable = `
      CREATE TABLE IF NOT EXISTS glossary_references (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100),
        publisher VARCHAR(100),
        year VARCHAR(20),
        isbn VARCHAR(20),
        url TEXT,
        description TEXT,
        category VARCHAR(50) DEFAULT 'classic',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    try {
      await client.rpc('exec_sql', { query: createReferencesTable });
      results.push('✅ 创建 glossary_references 表');
    } catch (e) {
      results.push('⚠️ glossary_references 表可能已存在');
    }

    // 3. 创建用户贡献表
    const createContributionsTable = `
      CREATE TABLE IF NOT EXISTS glossary_contributions (
        id SERIAL PRIMARY KEY,
        term VARCHAR(50) NOT NULL,
        category VARCHAR(20) NOT NULL,
        short_desc TEXT NOT NULL,
        full_desc TEXT NOT NULL,
        origin TEXT,
        examples JSONB DEFAULT '[]'::jsonb,
        related_terms JSONB DEFAULT '[]'::jsonb,
        references JSONB DEFAULT '[]'::jsonb,
        contribution_type VARCHAR(20) DEFAULT 'add',
        original_term_id INTEGER,
        user_id VARCHAR(36),
        user_name VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        reviewer_id VARCHAR(36),
        review_note TEXT,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    try {
      await client.rpc('exec_sql', { query: createContributionsTable });
      results.push('✅ 创建 glossary_contributions 表');
    } catch (e) {
      results.push('⚠️ glossary_contributions 表可能已存在');
    }

    // 4. 创建索引
    try {
      await client.rpc('exec_sql', {
        query: `
          CREATE INDEX IF NOT EXISTS idx_glossary_contributions_status 
          ON glossary_contributions(status);
          CREATE INDEX IF NOT EXISTS idx_glossary_contributions_term 
          ON glossary_contributions(term);
          CREATE INDEX IF NOT EXISTS idx_glossary_references_category 
          ON glossary_references(category);
        `
      });
      results.push('✅ 创建索引');
    } catch (e) {
      results.push('⚠️ 索引可能已存在');
    }

    return NextResponse.json({
      message: '迁移完成',
      results
    });
  } catch (error) {
    console.error('迁移失败:', error);
    return NextResponse.json({
      message: '迁移部分完成',
      results,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
