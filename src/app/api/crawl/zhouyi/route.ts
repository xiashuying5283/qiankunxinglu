import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 64卦章节URL列表
const CHAPTER_URLS = [
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/01%E4%B9%BE', title: '乾卦', volume: '上经干传卷一', order: 1 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/01%E5%9D%A4', title: '坤卦', volume: '上经干传卷一', order: 2 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/01%E5%B1%AF', title: '屯卦', volume: '上经干传卷一', order: 3 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/01%E8%92%99', title: '蒙卦', volume: '上经干传卷一', order: 4 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E9%9C%80', title: '需卦', volume: '上经需传卷二', order: 5 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E8%A8%9F', title: '讼卦', volume: '上经需传卷二', order: 6 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E5%B8%AB', title: '师卦', volume: '上经需传卷二', order: 7 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E6%AF%94', title: '比卦', volume: '上经需传卷二', order: 8 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E5%B0%8F%E7%95%9C', title: '小畜卦', volume: '上经需传卷二', order: 9 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E5%B1%A5', title: '履卦', volume: '上经需传卷二', order: 10 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E6%B3%B0', title: '泰卦', volume: '上经需传卷二', order: 11 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E5%90%A6', title: '否卦', volume: '上经需传卷二', order: 12 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E5%90%8C%E4%BA%BA', title: '同人卦', volume: '上经需传卷二', order: 13 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E5%A4%A7%E6%9C%89', title: '大有卦', volume: '上经需传卷二', order: 14 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E8%AC%99', title: '谦卦', volume: '上经需传卷二', order: 15 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/02%E8%B1%AB', title: '豫卦', volume: '上经需传卷二', order: 16 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E9%9A%A8', title: '随卦', volume: '上经随传卷三', order: 17 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E8%A0%B1', title: '蛊卦', volume: '上经随传卷三', order: 18 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E8%87%A8', title: '临卦', volume: '上经随传卷三', order: 19 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E8%A7%80', title: '观卦', volume: '上经随传卷三', order: 20 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E5%99%AC%E5%97%91', title: '噬嗑卦', volume: '上经随传卷三', order: 21 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E8%B3%81', title: '贲卦', volume: '上经随传卷三', order: 22 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E5%89%9D', title: '剥卦', volume: '上经随传卷三', order: 23 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E5%BE%A9', title: '复卦', volume: '上经随传卷三', order: 24 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E7%84%A1%E5%A6%84', title: '无妄卦', volume: '上经随传卷三', order: 25 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E5%A4%A7%E7%95%9C', title: '大畜卦', volume: '上经随传卷三', order: 26 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E9%A0%A4', title: '颐卦', volume: '上经随传卷三', order: 27 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E5%A4%A7%E9%81%8E', title: '大过卦', volume: '上经随传卷三', order: 28 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E5%9D%8E', title: '坎卦', volume: '上经随传卷三', order: 29 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/03%E9%9B%A2', title: '离卦', volume: '上经随传卷三', order: 30 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E5%92%B8', title: '咸卦', volume: '下经咸传卷四', order: 31 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E6%81%92', title: '恒卦', volume: '下经咸传卷四', order: 32 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E9%81%AF', title: '遁卦', volume: '下经咸传卷四', order: 33 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E5%A4%A7%E5%A3%AF', title: '大壮卦', volume: '下经咸传卷四', order: 34 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E6%99%89', title: '晋卦', volume: '下经咸传卷四', order: 35 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E6%98%8E%E5%A4%B7', title: '明夷卦', volume: '下经咸传卷四', order: 36 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E5%AE%B6%E4%BA%BA', title: '家人卦', volume: '下经咸传卷四', order: 37 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E7%9D%BD', title: '睽卦', volume: '下经咸传卷四', order: 38 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E8%B9%87', title: '蹇卦', volume: '下经咸传卷四', order: 39 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E8%A7%A3', title: '解卦', volume: '下经咸传卷四', order: 40 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E6%90%8D', title: '损卦', volume: '下经咸传卷四', order: 41 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/04%E7%9B%8A', title: '益卦', volume: '下经咸传卷四', order: 42 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E5%A4%AC', title: '夬卦', volume: '下经夬传卷五', order: 43 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E5%A7%A4', title: '姤卦', volume: '下经夬传卷五', order: 44 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E8%90%83', title: '萃卦', volume: '下经夬传卷五', order: 45 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E5%8D%87', title: '升卦', volume: '下经夬传卷五', order: 46 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E5%9B%B0', title: '困卦', volume: '下经夬传卷五', order: 47 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E4%BA%95', title: '井卦', volume: '下经夬传卷五', order: 48 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E9%9D%A9', title: '革卦', volume: '下经夬传卷五', order: 49 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E9%BC%8E', title: '鼎卦', volume: '下经夬传卷五', order: 50 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E9%9C%87', title: '震卦', volume: '下经夬传卷五', order: 51 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E8%89%AE', title: '艮卦', volume: '下经夬传卷五', order: 52 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E6%BC%B8', title: '渐卦', volume: '下经夬传卷五', order: 53 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/05%E6%AD%B8%E5%A6%B9', title: '归妹卦', volume: '下经夬传卷五', order: 54 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/06%E8%B1%90', title: '丰卦', volume: '下经丰传卷六', order: 55 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/06%E6%97%85', title: '旅卦', volume: '下经丰传卷六', order: 56 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/06%E5%B7%BD', title: '巽卦', volume: '下经丰传卷六', order: 57 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/06%E5%85%8C', title: '兑卦', volume: '下经丰传卷六', order: 58 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/06%E6%B8%99', title: '涣卦', volume: '下经丰传卷六', order: 59 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/06%E7%AF%80', title: '节卦', volume: '下经丰传卷六', order: 60 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/06%E4%B8%AD%E5%AD%9A', title: '中孚卦', volume: '下经丰传卷六', order: 61 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/06%E5%B0%8F%E9%81%8E', title: '小过卦', volume: '下经丰传卷六', order: 62 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/06%E6%97%A2%E6%BF%9F', title: '既济卦', volume: '下经丰传卷六', order: 63 },
  { url: 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/06%E6%9C%AA%E6%BF%9F', title: '未济卦', volume: '下经丰传卷六', order: 64 },
];

// 解析HTML内容
function parseContent(html: string): { original: string[]; notes: string[]; commentaries: string[] } {
  const original: string[] = [];
  const notes: string[] = [];
  const commentaries: string[] = [];

  // 提取 [疏] 开头的疏文
  const 疏Regex = /\[疏\]([\s\S]*?)(?=\[疏\]|$)/g;
  let match;
  while ((match = 疏Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 20) {
      commentaries.push(text.substring(0, 2000)); // 限制长度
    }
  }

  // 提取 < > 中的注文  
  const 注Regex = /〈([^〉]+)〉/g;
  while ((match = 注Regex.exec(html)) !== null) {
    const text = match[1].trim();
    if (text.length > 5) {
      notes.push(text);
    }
  }

  return { original, notes, commentaries };
}

// GET /api/crawl/zhouyi - 爬取周易正义
export async function GET() {
  const client = getSupabaseClient();
  const logs: string[] = [];
  
  try {
    logs.push(`开始爬取周易正义...`);
    logs.push(`共 ${CHAPTER_URLS.length} 个章节`);
    
    // 获取书籍ID
    const { data: book } = await client
      .from('books')
      .select('id')
      .eq('title', '周易正义')
      .single();
    
    if (!book) {
      return NextResponse.json({ success: false, error: '书籍不存在' });
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < CHAPTER_URLS.length; i++) {
      const chapterInfo = CHAPTER_URLS[i];
      logs.push(`[${i + 1}/${CHAPTER_URLS.length}] 爬取: ${chapterInfo.title}`);
      
      try {
        const response = await fetch(chapterInfo.url);
        const html = await response.text();
        
        const { original, notes, commentaries } = parseContent(html);
        
        // 创建或更新章节
        const { data: existingChapter } = await client
          .from('chapters')
          .select('id')
          .eq('book_id', book.id)
          .eq('title', chapterInfo.title)
          .single();
        
        let chapterId = existingChapter?.id;
        
        if (!chapterId) {
          const { data: newChapter } = await client
            .from('chapters')
            .insert({
              book_id: book.id,
              title: chapterInfo.title,
              slug: `gua-${chapterInfo.order}`,
              chapter_order: chapterInfo.order,
              level: 2,
              is_leaf: true,
            })
            .select()
            .single();
          
          chapterId = newChapter?.id;
        }
        
        if (chapterId) {
          // 删除旧内容
          await client.from('book_contents').delete().eq('chapter_id', chapterId);
          
          // 插入新内容
          const contents = [];
          let order = 1;
          
          for (const text of original) {
            contents.push({ chapter_id: chapterId, content_type: 'original', content: text, content_order: order++ });
          }
          for (const text of notes) {
            contents.push({ chapter_id: chapterId, content_type: 'note', content: text, source: '王弼注', content_order: order++ });
          }
          for (const text of commentaries) {
            contents.push({ chapter_id: chapterId, content_type: 'commentary', content: text, source: '孔颖达疏', content_order: order++ });
          }
          
          if (contents.length > 0) {
            await client.from('book_contents').insert(contents);
          }
          
          logs.push(`  ✓ 原文${original.length} 注${notes.length} 疏${commentaries.length}`);
          successCount++;
        }
        
        // 延迟避免请求过快
        await new Promise(r => setTimeout(r, 500));
        
      } catch (e) {
        logs.push(`  ✗ 错误: ${e}`);
        failCount++;
      }
    }
    
    logs.push(`完成！成功: ${successCount}, 失败: ${failCount}`);
    
    return NextResponse.json({ success: true, logs, successCount, failCount });
    
  } catch (e) {
    logs.push(`异常: ${e}`);
    return NextResponse.json({ success: false, error: String(e), logs }, { status: 500 });
  }
}
