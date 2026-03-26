import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 初始化游戏化系统数据库表
 * GET /api/game/init
 * 
 * 注意：Supabase 需要通过控制台或迁移创建表
 * 此 API 仅用于检查表是否存在并给出提示
 */
export async function GET() {
  const supabase = getSupabaseClient();
  const results: { table: string; status: string; message: string }[] = [];
  
  // 检查各个表是否存在
  const tables = ['user_currency', 'currency_transactions', 'user_levels', 'sign_in_records'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        results.push({
          table,
          status: 'missing',
          message: `表不存在，需要在Supabase控制台创建`,
        });
      } else {
        results.push({
          table,
          status: 'exists',
          message: '表已存在',
        });
      }
    } catch (e) {
      results.push({
        table,
        status: 'error',
        message: '检查失败',
      });
    }
  }
  
  const allExists = results.every(r => r.status === 'exists');
  
  // 如果表不存在，返回创建SQL
  if (!allExists) {
    return NextResponse.json({
      success: false,
      message: '部分表不存在，请在Supabase控制台执行以下SQL创建表',
      results,
      sql: getCreateTableSQL(),
    });
  }
  
  return NextResponse.json({
    success: true,
    message: '游戏化系统表检查完成，所有表已存在',
    results,
  });
}

/**
 * 获取创建表的SQL语句
 */
function getCreateTableSQL(): string {
  return `
-- 1. 用户货币表
CREATE TABLE IF NOT EXISTS user_currency (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  gua_coins INTEGER NOT NULL DEFAULT 0,
  spirit_stones INTEGER NOT NULL DEFAULT 0,
  total_gua_coins INTEGER NOT NULL DEFAULT 0,
  total_spirit_stones INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_currency_user_idx ON user_currency(user_id);

-- 2. 货币交易记录表
CREATE TABLE IF NOT EXISTS currency_transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  currency_type VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  transaction_type VARCHAR(30) NOT NULL,
  related_id VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS currency_transactions_user_idx ON currency_transactions(user_id);
CREATE INDEX IF NOT EXISTS currency_transactions_type_idx ON currency_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS currency_transactions_created_idx ON currency_transactions(created_at);

-- 3. 用户等级表
CREATE TABLE IF NOT EXISTS user_levels (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  total_experience INTEGER NOT NULL DEFAULT 0,
  divination_count INTEGER NOT NULL DEFAULT 0,
  sign_in_days INTEGER NOT NULL DEFAULT 0,
  read_knowledge_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_levels_user_idx ON user_levels(user_id);

-- 4. 签到记录表
CREATE TABLE IF NOT EXISTS sign_in_records (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  sign_in_date VARCHAR(10) NOT NULL,
  continuous_days INTEGER NOT NULL DEFAULT 1,
  gua_coins_earned INTEGER NOT NULL DEFAULT 0,
  bonus_awarded BOOLEAN DEFAULT FALSE,
  bonus_type VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sign_in_date)
);

CREATE INDEX IF NOT EXISTS sign_in_records_user_idx ON sign_in_records(user_id);
CREATE INDEX IF NOT EXISTS sign_in_records_date_idx ON sign_in_records(sign_in_date);
`;
}

