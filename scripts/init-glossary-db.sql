-- 科普词典数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 为 glossary 表添加 references 列（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'glossary' AND column_name = 'references'
  ) THEN
    ALTER TABLE glossary ADD COLUMN references JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 2. 创建参考文献表（如果不存在）
CREATE TABLE IF NOT EXISTS glossary_references (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100),
  publisher VARCHAR(100),
  year VARCHAR(20),
  isbn VARCHAR(20),
  url TEXT,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建用户贡献表（如果不存在）
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

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS glossary_references_category_idx ON glossary_references(category);
CREATE INDEX IF NOT EXISTS glossary_contributions_status_idx ON glossary_contributions(status);
CREATE INDEX IF NOT EXISTS glossary_contributions_term_idx ON glossary_contributions(term);
CREATE INDEX IF NOT EXISTS glossary_contributions_user_idx ON glossary_contributions(user_id);

-- 5. 插入参考文献数据（如果不存在）
INSERT INTO glossary_references (title, author, publisher, year, category, description)
VALUES 
  ('周易正义', '王弼 注，孔颖达 疏', '中华书局', '1980', 'iching', '魏王弼注，唐孔颖达疏，为《周易》最权威的注疏本，收入《十三经注疏》。'),
  ('周易本义', '朱熹', '中华书局', '2009', 'iching', '南宋朱熹所著，以义理解易，对后世影响深远。'),
  ('梅花易数', '邵雍', '华龄出版社', '2008', 'iching', '北宋邵雍所创占卜方法，以体用生克为核心，简便易学。'),
  ('易经入门', '傅佩荣', '新星出版社', '2011', 'iching', '现代学者傅佩荣所著，适合初学者的易经入门读物。'),
  ('渊海子平', '徐子平', '中州古籍出版社', '2012', 'bazi', '八字命理学的奠基之作，宋代徐子平所著，系统论述四柱命理。'),
  ('三命通会', '万民英', '中医古籍出版社', '2010', 'bazi', '明代万民英编撰，集八字命理之大成，内容详尽丰富。'),
  ('滴天髓', '刘伯温', '华龄出版社', '2009', 'bazi', '传为明代刘伯温所著，以格局论命，为命理学经典。'),
  ('穷通宝鉴', '余春台', '华龄出版社', '2010', 'bazi', '清余春台编撰，专论调候用神，为命理学者必读。'),
  ('尚书·洪范', '佚名', '中华书局', '1980', 'general', '《尚书》篇章，最早记载五行学说：水、火、木、金、土。'),
  ('史记·律书', '司马迁', '中华书局', '1959', 'general', '《史记》律书篇，记载天干地支与天文历法的关系。'),
  ('黄帝内经', '佚名', '人民卫生出版社', '2012', 'general', '中医经典，论述阴阳五行学说在医学中的应用。')
ON CONFLICT (title) DO NOTHING;

-- 完成
SELECT 'Database initialization completed!' AS message;
