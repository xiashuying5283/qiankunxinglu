#!/usr/bin/env node
/**
 * 爬取《梅花易数》并导入数据库
 * 数据来源：中华文库 https://www.zhonghuashu.com/wiki/梅花易數
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const OpenCC = require('opencc-js');
const { execSync } = require('child_process');

// 加载 Coze 环境变量
function loadCozeEnv() {
  try {
    const pythonCode = `
import os
import sys
try:
    from coze_workload_identity import Client
    client = Client()
    env_vars = client.get_project_env_vars()
    client.close()
    for env_var in env_vars:
        print(f"{env_var.key}={env_var.value}")
except Exception as e:
    print(f"# Error: {e}", file=sys.stderr)
`;

    const output = execSync(`python3 -c '${pythonCode.replace(/'/g, "'\"'\"'")}'`, {
      encoding: 'utf-8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const eqIndex = line.indexOf('=');
      if (eqIndex > 0) {
        const key = line.substring(0, eqIndex);
        let value = line.substring(eqIndex + 1);
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (e) {
    console.error('加载 Coze 环境变量失败:', e.message);
  }
}

// 加载环境变量
loadCozeEnv();

// 初始化繁简转换器
const converter = OpenCC.Converter({ from: 'tw', to: 'cn' });

// 数据库连接
const supabaseUrl = process.env.COZE_SUPABASE_URL;
const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('请设置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 书籍信息
const BOOK_INFO = {
  title: '梅花易数',
  title_pinyin: 'meihua-yishu',
  author: '邵雍',
  dynasty: '北宋',
  category: '术数',
  description: '《梅花易数》相传为宋代易学家邵雍所著，是一部以易学中的数学为基础，结合象学进行占卜的书。相传邵雍运用时每卦必中，屡试不爽。梅花易数依先天八卦数理，即乾一，兑二，离三，震四，巽五，坎六，艮七，坤八，随时随地皆可起卦，取卦方式多种多样。',
  cover_url: null,
  total_chapters: 3,
  status: 'active',
  sort_order: 2
};

// 卷信息
const VOLUMES = [
  { title: '卷一', slug: 'juan-yi', url: 'https://www.zhonghuashu.com/wiki/%E6%A2%85%E8%8A%B1%E6%98%93%E6%95%B8/%E5%8D%B7%E4%B8%80' },
  { title: '卷二', slug: 'juan-er', url: 'https://www.zhonghuashu.com/wiki/%E6%A2%85%E8%8A%B1%E6%98%93%E6%95%B8/%E5%8D%B7%E4%BA%8C' },
  { title: '卷三', slug: 'juan-san', url: 'https://www.zhonghuashu.com/wiki/%E6%A2%85%E8%8A%B1%E6%98%93%E6%95%B8/%E5%8D%B7%E4%B8%89' }
];

const MAIN_PAGE = 'https://www.zhonghuashu.com/wiki/%E6%A2%85%E8%8A%B1%E6%98%93%E6%95%B8';

/**
 * 清理文本 - 移除HTML标签和多余空白
 */
function cleanText(html) {
  if (!html) return '';
  
  let text = html
    // 移除script和style标签及其内容
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // 移除注释
    .replace(/<!--[\s\S]*?-->/g, '')
    // 移除nav、toc等导航元素
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<div class="toc[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '')
    // 移除链接但保留文本
    .replace(/<a[^>]*>([^<]*)<\/a>/gi, '$1')
    // 换行处理
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    // 移除其他HTML标签
    .replace(/<[^>]+>/g, '')
    // 解码HTML实体
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // 清理多余空白
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  return text;
}

/**
 * 获取页面HTML内容
 */
async function fetchPage(url) {
  console.log(`正在获取: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.text();
}

/**
 * 解析主页获取序言
 */
function parseMainPage(html) {
  const sections = [];
  
  // 提取序言部分
  const prefaceMatch = html.match(/<span class="mw-headline" id="序">序<\/span>[\s\S]*?<\/section>/);
  if (prefaceMatch) {
    const content = cleanText(prefaceMatch[0]);
    if (content && content.length > 50) {
      sections.push({
        title: '序',
        content: converter(content)
      });
    }
  }
  
  return sections;
}

/**
 * 解析卷页面获取章节内容
 */
function parseVolumePage(html, volumeTitle) {
  const sections = [];
  
  // 提取内容区域
  const contentMatch = html.match(/<div class="mw-parser-output">([\s\S]*?)<\/div>\s*<\/article>/);
  if (!contentMatch) {
    console.log('未找到内容区域');
    return sections;
  }
  
  const contentHtml = contentMatch[1];
  
  // 提取所有h2, h3标题
  const headingPattern = /<h([23])[^>]*>(.*?)<\/h\1>/g;
  
  const headings = [];
  let match;
  while ((match = headingPattern.exec(contentHtml)) !== null) {
    const level = parseInt(match[1]);
    const fullHeading = match[2];
    
    // 提取标题文本 - 优先从 mw-headline 类的 span 中提取
    let title = '';
    const headlineMatch = fullHeading.match(/<span class="mw-headline"[^>]*>([^<]*)<\/span>/);
    if (headlineMatch) {
      title = headlineMatch[1];
    } else {
      // 回退：直接提取文本
      title = fullHeading.replace(/<[^>]+>/g, '').trim();
    }
    
    if (title && title !== '目录' && title !== '目錄') {
      headings.push({
        level,
        title,
        fullMatch: match[0],
        index: match.index
      });
    }
  }
  
  console.log(`  找到 ${headings.length} 个章节标题`);
  
  // 提取每个标题对应的内容
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const nextIndex = i < headings.length - 1 ? headings[i + 1].index : contentHtml.length;
    
    // 跳过"目录"标题
    if (heading.title === '目錄' || heading.title === '目录') continue;
    
    // 跳过卷标题（如"卷一"）
    if (/^卷[一二三四五六七八九十]+$/.test(heading.title)) continue;
    
    const sectionHtml = contentHtml.substring(heading.index, nextIndex);
    
    // 提取内容部分（在标题之后的p标签）
    const contentParts = [];
    const pPattern = /<p[^>]*>([\s\S]*?)<\/p>/g;
    let pMatch;
    while ((pMatch = pPattern.exec(sectionHtml)) !== null) {
      const text = cleanText(pMatch[0]);
      if (text && text.length > 5) {
        contentParts.push(text);
      }
    }
    
    // 也提取列表内容
    const ulPattern = /<ul[^>]*>([\s\S]*?)<\/ul>/g;
    let ulMatch;
    while ((ulMatch = ulPattern.exec(sectionHtml)) !== null) {
      const ulHtml = ulMatch[1];
      const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/g;
      let liMatch;
      while ((liMatch = liPattern.exec(ulHtml)) !== null) {
        const text = cleanText(liMatch[1]);
        if (text && text.length > 3) {
          contentParts.push('• ' + text);
        }
      }
    }
    
    // 提取表格内容
    const tablePattern = /<table[^>]*>([\s\S]*?)<\/table>/g;
    let tableMatch;
    while ((tableMatch = tablePattern.exec(sectionHtml)) !== null) {
      const tableHtml = tableMatch[1];
      const trPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
      let trMatch;
      while ((trMatch = trPattern.exec(tableHtml)) !== null) {
        const trHtml = trMatch[1];
        const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/g;
        const cells = [];
        let tdMatch;
        while ((tdMatch = tdPattern.exec(trHtml)) !== null) {
          cells.push(cleanText(tdMatch[1]));
        }
        if (cells.length > 0) {
          contentParts.push(cells.join(' | '));
        }
      }
    }
    
    if (contentParts.length > 0) {
      const content = contentParts.join('\n\n');
      sections.push({
        title: converter(heading.title),
        content: converter(content)
      });
    }
  }
  
  return sections;
}

/**
 * 插入书籍数据到数据库
 */
async function insertBook() {
  console.log('\n=== 插入书籍信息 ===');
  
  // 检查是否已存在
  const { data: existing } = await supabase
    .from('books')
    .select('id')
    .eq('title', BOOK_INFO.title)
    .single();
  
  if (existing) {
    console.log(`书籍已存在，ID: ${existing.id}`);
    return existing.id;
  }
  
  const { data, error } = await supabase
    .from('books')
    .insert(BOOK_INFO)
    .select('id')
    .single();
  
  if (error) {
    throw new Error(`插入书籍失败: ${error.message}`);
  }
  
  console.log(`书籍插入成功，ID: ${data.id}`);
  return data.id;
}

/**
 * 插入章节和内容
 */
async function insertChaptersAndContents(bookId, allSections) {
  console.log('\n=== 插入章节和内容 ===');
  
  let chapterOrder = 0;
  let contentOrder = 0;
  
  // 先创建卷章节
  for (let vIndex = 0; vIndex < VOLUMES.length; vIndex++) {
    const volume = VOLUMES[vIndex];
    const volumeSections = allSections[volume.title] || [];
    
    if (volumeSections.length === 0) {
      console.log(`跳过空卷: ${volume.title}`);
      continue;
    }
    
    // 插入卷章节（作为父章节）
    const { data: volumeChapter, error: vError } = await supabase
      .from('chapters')
      .insert({
        book_id: bookId,
        parent_id: null,
        title: volume.title,
        slug: volume.slug,
        chapter_order: chapterOrder++,
        level: 1,
        is_leaf: false,
        word_count: null
      })
      .select('id')
      .single();
    
    if (vError) {
      console.error(`插入卷章节失败: ${vError.message}`);
      continue;
    }
    
    console.log(`插入卷: ${volume.title} (ID: ${volumeChapter.id})`);
    
    // 插入该卷下的所有小节
    for (const section of volumeSections) {
      const { data: chapter, error: cError } = await supabase
        .from('chapters')
        .insert({
          book_id: bookId,
          parent_id: volumeChapter.id,
          title: section.title,
          slug: null,
          chapter_order: chapterOrder++,
          level: 2,
          is_leaf: true,
          word_count: section.content.length
        })
        .select('id')
        .single();
      
      if (cError) {
        console.error(`插入章节失败: ${section.title} - ${cError.message}`);
        continue;
      }
      
      // 插入内容
      const { error: contentError } = await supabase
        .from('book_contents')
        .insert({
          chapter_id: chapter.id,
          content_type: 'original',
          content: section.content,
          source: '中华文库',
          content_order: contentOrder++,
          note: null,
          commentary: null
        });
      
      if (contentError) {
        console.error(`插入内容失败: ${section.title} - ${contentError.message}`);
      } else {
        console.log(`  插入章节: ${section.title} (${section.content.length}字)`);
      }
    }
  }
  
  // 更新书籍章节总数
  await supabase
    .from('books')
    .update({ total_chapters: chapterOrder })
    .eq('id', bookId);
  
  console.log(`\n总计插入 ${chapterOrder} 个章节`);
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('《梅花易数》爬虫脚本');
  console.log('========================================\n');
  
  try {
    // 1. 爬取主页获取序言
    console.log('步骤 1: 爬取主页...');
    const mainHtml = await fetchPage(MAIN_PAGE);
    const prefaceSections = parseMainPage(mainHtml);
    console.log(`找到 ${prefaceSections.length} 个序言章节`);
    
    // 2. 爬取各卷内容
    console.log('\n步骤 2: 爬取各卷内容...');
    const allSections = {};
    
    // 将序言放入卷一
    allSections['卷一'] = [...prefaceSections];
    
    for (const volume of VOLUMES) {
      console.log(`\n爬取 ${volume.title}...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 礼貌延迟
      
      const html = await fetchPage(volume.url);
      const sections = parseVolumePage(html, volume.title);
      console.log(`${volume.title} 找到 ${sections.length} 个章节`);
      
      if (allSections[volume.title]) {
        allSections[volume.title].push(...sections);
      } else {
        allSections[volume.title] = sections;
      }
    }
    
    // 3. 插入数据库
    console.log('\n步骤 3: 插入数据库...');
    const bookId = await insertBook();
    await insertChaptersAndContents(bookId, allSections);
    
    console.log('\n========================================');
    console.log('爬取完成！');
    console.log('========================================');
    
  } catch (error) {
    console.error('\n错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
