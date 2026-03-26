-- 游戏化系统数据库初始化脚本
-- 请在 Supabase SQL Editor 中执行此脚本

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

-- 5. 为 users 表添加索引（如果不存在）
CREATE INDEX IF NOT EXISTS users_id_idx ON users(id);

-- 完成
SELECT '游戏化系统表创建完成！' as message;
