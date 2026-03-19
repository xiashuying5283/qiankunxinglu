import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name1, name2, bazi1, bazi2, score, level, shengxiaoMatch, baziMatch } = body;

    // 参数验证
    if (!name1 || !name2 || !bazi1 || !bazi2 || score === undefined) {
      return new Response(JSON.stringify({ error: '参数不完整' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 构建 prompt
    const systemPrompt = `你是一位专业的姻缘命理大师，精通八字命理、生肖配对、五行生克等传统命理学。
请根据以下信息，为用户生成一段专业、温馨、个性化的姻缘解读。

要求：
1. 语言优美，富有文采，但不要过于玄奥
2. 结合双方八字特点，给出有针对性的分析
3. 提供切实可行的感情建议
4. 语气要积极正面，即使分数不高也要给予鼓励
5. 输出格式使用Markdown，包含以下几个部分：
   - ## 缘分总评
   - ## 命理分析
   - ## 感情建议
   - ## 美好祝愿

注意：不要使用表情符号，保持专业严谨的风格。`;

    const userPrompt = `请为以下两位进行姻缘解读：

**第一位：${name1}**
- 生肖：${bazi1.shengxiao}
- 八字：${bazi1.year.gan}${bazi1.year.zhi}年 ${bazi1.month.gan}${bazi1.month.zhi}月 ${bazi1.day.gan}${bazi1.day.zhi}日 ${bazi1.hour.gan}${bazi1.hour.zhi}时
- 五行分布：金${bazi1.wuxing['金']} 木${bazi1.wuxing['木']} 水${bazi1.wuxing['水']} 火${bazi1.wuxing['火']} 土${bazi1.wuxing['土']}
- 最旺五行：${bazi1.dominantWuXing}${bazi1.missingWuXing.length > 0 ? `，缺${bazi1.missingWuXing.join('、')}` : ''}

**第二位：${name2}**
- 生肖：${bazi2.shengxiao}
- 八字：${bazi2.year.gan}${bazi2.year.zhi}年 ${bazi2.month.gan}${bazi2.month.zhi}月 ${bazi2.day.gan}${bazi2.day.zhi}日 ${bazi2.hour.gan}${bazi2.hour.zhi}时
- 五行分布：金${bazi2.wuxing['金']} 木${bazi2.wuxing['木']} 水${bazi2.wuxing['水']} 火${bazi2.wuxing['火']} 土${bazi2.wuxing['土']}
- 最旺五行：${bazi2.dominantWuXing}${bazi2.missingWuXing.length > 0 ? `，缺${bazi2.missingWuXing.join('、')}` : ''}

**配对结果：**
- 匹配分数：${score}分
- 匹配等级：${level}
- 生肖关系：${shengxiaoMatch.relation}（${shengxiaoMatch.description}）
- 八字分析：${baziMatch.description}

请生成详细的姻缘解读。`;

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化 LLM 客户端
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    // 创建流式响应
    const stream = client.stream(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.8
    });

    // 创建 ReadableStream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              // SSE 格式
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }
          // 发送结束信号
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '生成失败' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('AI interpretation error:', error);
    return new Response(JSON.stringify({ error: 'AI解读失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
