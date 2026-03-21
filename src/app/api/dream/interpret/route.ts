import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyAuth } from '@/lib/api-auth';

// 系统提示词
const SYSTEM_PROMPT = `你是一位专业的周公解梦大师，精通中国传统解梦文化和现代心理学。你的任务是根据用户描述的梦境，给出专业、细致、有温度的解析。

解梦原则：
1. 结合中国传统文化中的梦境象征意义
2. 融入现代心理学对梦境的理解
3. 给出积极正面的引导和建议
4. 语言温和亲切，给人以安慰和希望

回复格式要求（使用JSON格式）：
{
  "summary": "梦境整体概括（一句话）",
  "symbols": [
    {"symbol": "梦境元素", "meaning": "象征意义"}
  ],
  "interpretation": "详细的梦境解析（2-3句话）",
  "psychology": "心理学角度分析（1-2句话）",
  "advice": "给用户的建议和指引（2-3句话）",
  "fortune": {
    "overall": "整体运势（吉/中吉/小吉/平/小凶）",
    "career": "事业运",
    "love": "感情运",
    "wealth": "财运",
    "health": "健康运"
  }
}

注意：
- 只返回JSON，不要有其他文字
- 确保JSON格式正确
- 内容要具体、有针对性
- 建议要实用可行`;

/**
 * AI智能解梦API（流式输出）
 * POST /api/dream/interpret
 * 
 * 需要 API Key 鉴权
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  // API Key 鉴权
  const authResult = await verifyAuth(request);
  
  if (!authResult.success) {
    return new Response(
      JSON.stringify({ 
        error: authResult.error,
        code: 'UNAUTHORIZED'
      }),
      { 
        status: authResult.statusCode || 401, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
  
  // 检查游客限制
  if (authResult.isGuest && authResult.guestLimitReached) {
    return new Response(
      JSON.stringify({ 
        error: `游客每日仅限 10 次大模型解析，今日已用完。注册账户后可无限使用。`,
        code: 'GUEST_LIMIT_REACHED',
        guestUsageCount: authResult.guestUsageCount,
        guestLimit: 10,
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    const body = await request.json();
    const { dreamContent, sessionId, saveRecord } = body;

    if (!dreamContent || dreamContent.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: '请输入梦境内容' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 如果是游客，增加使用次数
    if (authResult.isGuest && authResult.userId) {
      const { incrementGuestUsage } = await import('@/lib/api-auth');
      await incrementGuestUsage(authResult.userId);
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: `请解析我做的这个梦：${dreamContent}` }
    ];

    // 创建流式响应
    const encoder = new TextEncoder();
    let fullContent = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(messages, {
            model: 'doubao-seed-1-6-251015',
            temperature: 0.7,
          });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              fullContent += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }

          // 流结束，发送完成信号
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, fullContent })}\n\n`));
          controller.close();

          // 保存记录（异步，不阻塞响应）
          if (saveRecord && sessionId) {
            saveDreamRecord(sessionId, dreamContent, fullContent).catch(console.error);
          }
        } catch (error) {
          console.error('LLM流式输出错误:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI解梦失败:', error);
    return new Response(
      JSON.stringify({ error: '解梦失败，请稍后重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 保存梦境记录
async function saveDreamRecord(sessionId: string, dreamContent: string, interpretation: string) {
  try {
    const client = getSupabaseClient();

    // 尝试解析JSON提取关键词和建议
    let keywords: string[] = [];
    let advice = '';
    
    try {
      const parsed = JSON.parse(interpretation);
      if (parsed.symbols && Array.isArray(parsed.symbols)) {
        keywords = parsed.symbols.map((s: { symbol: string }) => s.symbol);
      }
      if (parsed.advice) {
        advice = parsed.advice;
      } else {
        advice = interpretation;
      }
    } catch {
      advice = interpretation;
    }

    await client.from('dream_records').insert({
      session_id: sessionId,
      dream_content: dreamContent,
      keywords,
      interpretation: interpretation,
      advice,
    });
  } catch (error) {
    console.error('保存梦境记录失败:', error);
  }
}
