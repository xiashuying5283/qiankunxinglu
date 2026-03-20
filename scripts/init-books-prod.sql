-- 生产环境书籍数据初始化脚本
-- 在 Supabase 的 SQL Editor 中执行此脚本

-- 1. 插入书籍
INSERT INTO books (title, title_pinyin, author, dynasty, category, description, total_chapters, sort_order, status, created_at, updated_at)
VALUES ('周易正义', 'zhou yi zheng yi', '孔颖达', '唐代', '经', '《周易正义》是唐代孔颖达奉诏编纂的《五经正义》之一，综合了魏晋南北朝时期易学研究的成果，是研究周易的重要文献。全书分为上下两经，共六十四卦，每卦包含卦辞、爻辞及注疏。', 3, 1, 'active', NOW(), NOW())
ON CONFLICT DO NOTHING
RETURNING id;

-- 2. 获取书籍ID并插入章节
DO $$
DECLARE
    book_id_val INTEGER;
    ch1_id INTEGER;
    ch2_id INTEGER;
    qian_gua_id INTEGER;
BEGIN
    SELECT id INTO book_id_val FROM books WHERE title = '周易正义' LIMIT 1;
    
    IF book_id_val IS NULL THEN
        RAISE EXCEPTION 'Book not found';
    END IF;
    
    -- 插入一级章节
    INSERT INTO chapters (book_id, title, slug, chapter_order, level, is_leaf, word_count, created_at, updated_at)
    VALUES (book_id_val, '上经卷', 'shang-jing', 1, 1, false, 0, NOW(), NOW())
    RETURNING id INTO ch1_id;
    
    INSERT INTO chapters (book_id, title, slug, chapter_order, level, is_leaf, word_count, created_at, updated_at)
    VALUES (book_id_val, '下经卷', 'xia-jing', 2, 1, false, 0, NOW(), NOW())
    RETURNING id INTO ch2_id;
    
    -- 插入二级章节（卦象）
    INSERT INTO chapters (book_id, parent_id, title, slug, chapter_order, level, is_leaf, word_count, created_at, updated_at)
    VALUES 
        (book_id_val, ch1_id, '乾卦', 'qian-gua', 1, 2, true, 89, NOW(), NOW()),
        (book_id_val, ch1_id, '坤卦', 'kun-gua', 2, 2, true, 0, NOW(), NOW()),
        (book_id_val, ch1_id, '屯卦', 'tun-gua', 3, 2, true, 0, NOW(), NOW())
    RETURNING id INTO qian_gua_id;
    
    -- 插入乾卦内容
    INSERT INTO book_contents (chapter_id, content_type, content, source, content_order, created_at, updated_at)
    VALUES 
        (qian_gua_id, 'original', '【乾】元亨利贞。', '周易原文', 1, NOW(), NOW()),
        (qian_gua_id, 'original', '【初九】潜龙勿用。', '周易原文', 2, NOW(), NOW()),
        (qian_gua_id, 'original', '【九二】见龙在田，利见大人。', '周易原文', 3, NOW(), NOW()),
        (qian_gua_id, 'original', '【九三】君子终日乾乾，夕惕若，厉无咎。', '周易原文', 4, NOW(), NOW()),
        (qian_gua_id, 'original', '【九四】或跃在渊，无咎。', '周易原文', 5, NOW(), NOW()),
        (qian_gua_id, 'original', '【九五】飞龙在天，利见大人。', '周易原文', 6, NOW(), NOW()),
        (qian_gua_id, 'original', '【上九】亢龙有悔。', '周易原文', 7, NOW(), NOW()),
        (qian_gua_id, 'original', '【用九】见群龙无首，吉。', '周易原文', 8, NOW(), NOW()),
        (qian_gua_id, 'note', '【注】乾者，天也，健也。元者，善之长也。亨者，嘉之会也。利者，义之和也。贞者，事之干也。', '孔颖达疏', 10, NOW(), NOW()),
        (qian_gua_id, 'commentary', '【疏】正义曰：乾卦之名，以天为象。天者，乾之象也，以乾为天者，乾是卦名，天是卦象。天能运转，四时行焉，百物生焉，故以天为乾象也。', '孔颖达正义', 20, NOW(), NOW()),
        (qian_gua_id, 'translation', '【译文】乾卦象征天，元始、通达、和谐、贞正。这四种德性是天道的体现，也是君子应当追求的品质。', '现代译文', 30, NOW(), NOW());
    
    RAISE NOTICE 'Books data initialized successfully!';
END $$;

-- 验证数据
SELECT 'Books:' as table_name, COUNT(*) as count FROM books
UNION ALL
SELECT 'Chapters:', COUNT(*) FROM chapters
UNION ALL
SELECT 'Book Contents:', COUNT(*) FROM book_contents;
