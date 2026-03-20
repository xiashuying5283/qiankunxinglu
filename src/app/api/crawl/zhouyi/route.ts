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

// 解析HTML内容
function parseContent(html: string): { original: string[]; notes: string[]; commentaries: string[] } {
  const original: string[] = [];
  const notes: string[] = [];
  const commentaries: string[] = [];

  // 提取 [疏] 开头的疏文
  const shuRegex = /\[疏\]([\s\S]*?)(?=\[疏\]|$)/g;
  let match;
  while ((match = shuRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 20) {
      commentaries.push(text.substring(0, 2000)); // 限制长度
    }
  }

  // 提取 < > 中的注文  
  const zhuRegex = /〈([^〉]+)〉/g;
  while ((match = zhuRegex.exec(html)) !== null) {
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
