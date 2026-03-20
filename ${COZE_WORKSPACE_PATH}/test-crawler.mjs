// 测试爬虫解析逻辑
const TARGET_URL = 'https://www.zhonghuashu.com/wiki/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/01%E4%B9%BE';

// 清理HTML标签和无关内容
function cleanText(text) {
  text = text.replace(/<span[^>]*color:\s*transparent[^>]*>[\s\S]*?<\/span>/gi, '');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/^[^a-zA-Z\u4e00-\u9fa5\[\(（【「『〈《]*/, '');
  return text.trim();
}

// 解析HTML内容
function parseContent(html) {
  const original = [];
  const notes = [];
  const commentaries = [];

  const paragraphRegex = /<p>([\s\S]*?)<\/p>/g;
  const paragraphs = [];
  let match;
  while ((match = paragraphRegex.exec(html)) !== null) {
    paragraphs.push(match[1]);
  }

  console.log(`共提取到 ${paragraphs.length} 个段落\n`);

  for (const para of paragraphs) {
    // 跳过导航链接段落
    if (para.includes('<a href') && (para.includes('周易') || para.includes('中华文库'))) {
      continue;
    }
    
    // 检查是否是疏（以[疏]开头）
    if (para.includes('[疏]')) {
      const shuMatch = para.match(/\[疏\]([\s\S]*)$/);
      if (shuMatch) {
        const text = cleanText(shuMatch[1]);
        if (text.length > 20) {
          commentaries.push(text.substring(0, 200));
        }
      }
      continue;
    }
    
    // 检查是否包含注（<small>标签）
    if (para.includes('<small')) {
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
        original.push(originalText);
      }
      continue;
    }
    
    // 普通段落可能是原文（经文）
    const text = cleanText(para);
    if (text.length > 2 && !text.startsWith('[')) {
      if (!text.includes('上一页') && !text.includes('下一页') && !text.includes('目录')) {
        original.push(text);
      }
    }
  }

  return { original, notes, commentaries };
}

async function main() {
  console.log('正在获取页面内容...\n');
  const response = await fetch(TARGET_URL);
  const html = await response.text();
  
  const { original, notes, commentaries } = parseContent(html);
  
  console.log('=== 原文（经文）===');
  original.forEach((text, i) => {
    console.log(`${i + 1}. ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
  });
  
  console.log(`\n共 ${original.length} 条原文\n`);
  
  console.log('=== 注 ===');
  notes.forEach((text, i) => {
    console.log(`${i + 1}. ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
  });
  console.log(`\n共 ${notes.length} 条注\n`);
  
  console.log('=== 疏 ===');
  commentaries.forEach((text, i) => {
    console.log(`${i + 1}. ${text.substring(0, 100)}...`);
  });
  console.log(`\n共 ${commentaries.length} 条疏\n`);
}

main().catch(console.error);
