/**
 * 数据库迁移脚本：更新 glossary_contributions 表结构
 * 添加缺失的列
 */

const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: process.env.PGDATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // 检查表是否存在
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'glossary_contributions'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Table glossary_contributions does not exist, creating...');
      
      await client.query(`
        CREATE TABLE glossary_contributions (
          id SERIAL PRIMARY KEY,
          term VARCHAR(50) NOT NULL,
          category VARCHAR(20) NOT NULL,
          short_desc TEXT NOT NULL,
          full_desc TEXT NOT NULL,
          origin TEXT,
          examples JSONB DEFAULT '[]'::jsonb,
          related_terms JSONB DEFAULT '[]'::jsonb,
          refs JSONB DEFAULT '[]'::jsonb,
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
        )
      `);
      
      // 创建索引
      await client.query(`
        CREATE INDEX IF NOT EXISTS glossary_contributions_status_idx ON glossary_contributions(status);
        CREATE INDEX IF NOT EXISTS glossary_contributions_term_idx ON glossary_contributions(term);
        CREATE INDEX IF NOT EXISTS glossary_contributions_user_idx ON glossary_contributions(user_id);
      `);
      
      console.log('Table created successfully');
    } else {
      console.log('Table exists, checking for missing columns...');
      
      // 获取现有列
      const columnsResult = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'glossary_contributions'
      `);
      const existingColumns = new Set(columnsResult.rows.map(r => r.column_name));
      
      // 定义需要添加的列
      const columnsToAdd = [
        { name: 'origin', sql: 'ADD COLUMN IF NOT EXISTS origin TEXT' },
        { name: 'examples', sql: "ADD COLUMN IF NOT EXISTS examples JSONB DEFAULT '[]'::jsonb" },
        { name: 'related_terms', sql: "ADD COLUMN IF NOT EXISTS related_terms JSONB DEFAULT '[]'::jsonb" },
        { name: 'refs', sql: "ADD COLUMN IF NOT EXISTS refs JSONB DEFAULT '[]'::jsonb" },
        { name: 'contribution_type', sql: "ADD COLUMN IF NOT EXISTS contribution_type VARCHAR(20) DEFAULT 'add'" },
        { name: 'original_term_id', sql: 'ADD COLUMN IF NOT EXISTS original_term_id INTEGER' },
        { name: 'user_name', sql: 'ADD COLUMN IF NOT EXISTS user_name VARCHAR(50)' },
        { name: 'reviewer_id', sql: 'ADD COLUMN IF NOT EXISTS reviewer_id VARCHAR(36)' },
        { name: 'review_note', sql: 'ADD COLUMN IF NOT EXISTS review_note TEXT' },
        { name: 'reviewed_at', sql: 'ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ' },
        { name: 'updated_at', sql: 'ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()' },
      ];
      
      // 添加缺失的列
      for (const col of columnsToAdd) {
        if (!existingColumns.has(col.name)) {
          console.log(`Adding column: ${col.name}`);
          await client.query(`ALTER TABLE glossary_contributions ${col.sql}`);
        }
      }
      
      // 创建索引（如果不存在）
      await client.query(`
        CREATE INDEX IF NOT EXISTS glossary_contributions_status_idx ON glossary_contributions(status);
        CREATE INDEX IF NOT EXISTS glossary_contributions_term_idx ON glossary_contributions(term);
        CREATE INDEX IF NOT EXISTS glossary_contributions_user_idx ON glossary_contributions(user_id);
      `);
      
      console.log('Migration completed');
    }
    
    // 显示最终表结构
    const finalColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'glossary_contributions'
      ORDER BY ordinal_position
    `);
    console.log('\nFinal table structure:');
    finalColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default || 'none'})`);
    });

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
