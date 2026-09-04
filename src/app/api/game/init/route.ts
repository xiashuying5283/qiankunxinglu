import { NextResponse } from 'next/server';
import { getPgClient } from '@/storage/database/pg-client';

/**
 * 初始化游戏化系统数据库表
 * GET /api/game/init
 * POST /api/game/init - 强制初始化
 */
export async function POST() {
  const db = getPgClient();
  const results: { table: string; status: string; message: string }[] = [];
  
  // 创建表的SQL
  const createTableSQL = `
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
`;

  try {
    // 使用 RPC 执行创建表语句
    // 注意：PostgreSQL 需要足够权限才能创建表
    // 这里我们尝试通过检查表是否存在来确认
    const tables = ['user_currency', 'currency_transactions', 'user_levels', 'sign_in_records'];
    
    for (const table of tables) {
      try {
        const { error } = await db
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          results.push({
            table,
            status: 'missing',
            message: error.message || '表不存在',
          });
        } else {
          results.push({
            table,
            status: 'exists',
            message: '表已存在',
          });
        }
      } catch (e: any) {
        results.push({
          table,
          status: 'error',
          message: e.message || '检查失败',
        });
      }
    }
    
    const allExists = results.every(r => r.status === 'exists');
    
    if (!allExists) {
      return NextResponse.json({
        success: false,
        message: '部分表不存在，请在 PostgreSQL 数据库中执行 SQL 创建表',
        results,
        sql: createTableSQL,
        instructions: [
          '1. 连接 PostgreSQL 数据库',
          '2. 进入 SQL Editor',
          '3. 复制上面的 SQL 语句并执行',
          '4. 刷新页面重试',
        ],
      });
    }
    
    return NextResponse.json({
      success: true,
      message: '游戏化系统表检查完成，所有表已存在',
      results,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      sql: createTableSQL,
    }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
