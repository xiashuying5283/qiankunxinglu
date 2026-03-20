import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 从目录页面动态获取所有章节URL
async function fetchChapterUrls(): Promise<{ url: string; title: string; order: number }[]> {
  try {
    const response = await fetch('https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9');
    const html = await response.text();
    
    // 提取所有章节链接
    const regex = /href="(\/wiki\/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9\/[^"]+)"/g;
    const urls: { url: string; title: string; order: number }[] = [];
    const seen = new Set<string>();
    let match;
    let order = 1;
    
    while ((match = regex.exec(html)) !== null) {
      const path = match[1];
      if (!seen.has(path)) {
        seen.add(path);
        // 从URL提取标题
        const fullUrl = `https://www.zhonghuashu.com${path}`;
        // 获取页面标题
        urls.push({ url: fullUrl, title: '', order: order++ });
      }
    }
    
    // 获取每个页面的标题
    for (const item of urls) {
      try {
        const pageResponse = await fetch(item.url);
        const pageHtml = await pageResponse.text();
        
        // 从页面标题提取，格式: 周易正义-乾卦-孔颖达-疏 - 中华文库
        const titleMatch = pageHtml.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) {
          const parts = titleMatch[1].split('-');
          // 第二部分通常是卦名或章节名
          if (parts.length >= 2) {
            let title = parts[1].trim();
            // 如果标题包含"卷"，说明是卷名，需要从其他地方获取
            if (title.includes('卷') || title.includes('中华文库')) {
              // 尝试从导航表格中间部分获取
              const navMatch = pageHtml.match(/<b><a[^>]*>周易正义<\/a><\/b><br\/>([^<]+)<br\/>/);
              if (navMatch && !navMatch[1].includes('卷')) {
                title = navMatch[1].trim();
              }
            }
            item.title = title;
          }
        }
        
        // 如果标题还是不对，从slug提取
        if (!item.title || item.title.includes('卷') || item.title === '中华文库' || item.title.startsWith('.')) {
          const slugPart = item.url.split('/').pop();
          if (slugPart) {
            const decoded = decodeURIComponent(slugPart);
            // 判断是卦还是系辞等
            if (/^0[1-6]/.test(decoded)) {
              // 六十四卦 (01乾, 02需, 等)
              const guaName = decoded.substring(2);
              item.title = guaName + '卦';
            } else if (decoded.startsWith('07.')) {
              // 系辞上
              const num = decoded.split('.')[1].replace(/^0/, '');
              item.title = '系辞上之' + num;
            } else if (decoded.startsWith('08.')) {
              // 系辞下
              const num = decoded.split('.')[1];
              item.title = '系辞下之' + num;
            } else if (decoded.startsWith('09.')) {
              // 说卦等
              const num = decoded.split('.')[1].replace(/^0/, '');
              item.title = '说卦之' + num;
            } else {
              item.title = decoded;
            }
          }
        }
      } catch {
        // 忽略错误
      }
    }
    
    return urls;
  } catch (e) {
    console.error('获取目录失败:', e);
    return [];
  }
}

// 清理HTML标签和无关内容
function cleanText(text: string): string {
  // 1. 先删除透明文字标签及其内容（这些是隐藏的广告/追踪内容）
  text = text.replace(/<span[^>]*color:\s*transparent[^>]*>[\s\S]*?<\/span>/gi, '');
  // 2. 删除所有HTML标签
  text = text.replace(/<[^>]+>/g, '');
  // 3. 清理HTML实体
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&quot;/g, '"');
  // 4. 清理多余的空白
  text = text.replace(/\s+/g, ' ').trim();
  // 5. 删除开头可能残留的不完整标签
  text = text.replace(/^[^a-zA-Z\u4e00-\u9fa5\[\(（【「『〈《]*/, '');
  return text.trim();
}

// 解析HTML内容
function parseContent(html: string): { original: string[]; notes: string[]; commentaries: string[] } {
  const original: string[] = [];
  const notes: string[] = [];
  const commentaries: string[] = [];

  // 1. 提取所有段落内容
  const paragraphRegex = /<p>([\s\S]*?)<\/p>/g;
  const paragraphs: string[] = [];
  let match;
  while ((match = paragraphRegex.exec(html)) !== null) {
    paragraphs.push(match[1]);
  }

  // 2. 处理每个段落
  for (const para of paragraphs) {
    // 跳过导航链接段落
    if (para.includes('<a href') && (para.includes('周易') || para.includes('中华文库'))) {
      continue;
    }
    
    // 检查是否是疏（以[疏]开头）
    if (para.includes('[疏]')) {
      // 提取疏的内容
      const shuMatch = para.match(/\[疏\]([\s\S]*)$/);
      if (shuMatch) {
        const text = cleanText(shuMatch[1]);
        if (text.length > 20) {
          commentaries.push(text.substring(0, 2000));
        }
      }
      continue;
    }
    
    // 检查是否包含注（<small>标签）
    if (para.includes('<small')) {
      // 提取<small>标签内的内容作为注
      const smallRegex = /<small[^>]*>([\s\S]*?)<\/small>/g;
      let smallMatch;
      while ((smallMatch = smallRegex.exec(para)) !== null) {
        const noteText = cleanText(smallMatch[1]);
        if (noteText.length > 5) {
          notes.push(noteText);
        }
      }
      
      // 提取<small>标签之前的内容作为原文
      const beforeSmall = para.split('<small')[0];
      const originalText = cleanText(beforeSmall);
      if (originalText.length > 2) {
        // 原文通常包含爻辞，如"初九：潜龙勿用。"等
        original.push(originalText);
      }
      continue;
    }
    
    // 普通段落可能是原文（经文）
    // 原文特征：包含卦辞、爻辞等，如"干下干上"、"元、亨、利、贞"、"九二：见龙在田"等
    const text = cleanText(para);
    if (text.length > 2 && !text.startsWith('[')) {
      // 排除导航性文字
      if (!text.includes('上一页') && !text.includes('下一页') && !text.includes('目录')) {
        original.push(text);
      }
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
    
    // 动态获取所有章节URL
    const chapterUrls = await fetchChapterUrls();
    logs.push(`共 ${chapterUrls.length} 个章节`);
    
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
    
    for (let i = 0; i < chapterUrls.length; i++) {
      const chapterInfo = chapterUrls[i];
      logs.push(`[${i + 1}/${chapterUrls.length}] 爬取: ${chapterInfo.title || chapterInfo.url.split('/').pop()}`);
      
      try {
        const response = await fetch(chapterInfo.url);
        const html = await response.text();
        
        const { original, notes, commentaries } = parseContent(html);
        
        // 从URL中提取章节标识
        const slug = chapterInfo.url.split('/').pop() || `chapter-${chapterInfo.order}`;
        const title = chapterInfo.title || slug;
        
        // 创建或更新章节
        const { data: existingChapter } = await client
          .from('chapters')
          .select('id')
          .eq('book_id', book.id)
          .eq('slug', decodeURIComponent(slug))
          .single();
        
        let chapterId = existingChapter?.id;
        
        if (!chapterId) {
          const { data: newChapter } = await client
            .from('chapters')
            .insert({
              book_id: book.id,
              title: title,
              slug: decodeURIComponent(slug),
              chapter_order: chapterInfo.order,
              level: 1,
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
        await new Promise(r => setTimeout(r, 300));
        
      } catch (e) {
        logs.push(`  ✗ 错误: ${e}`);
        failCount++;
      }
    }
    
    logs.push(`完成！成功: ${successCount}, 失败: ${failCount}`);
    
    return NextResponse.json({ success: true, logs, successCount, failCount });
    
  } catch (e) {
    logs.push(`异常: ${e}`);
    return NextResponse.json({ success: false, logs, error: String(e) }, { status: 500 });
  }
}
