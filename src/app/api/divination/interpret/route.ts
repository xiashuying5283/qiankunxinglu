import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 占卜类型
type DivinationType = 'iching' | 'tarot';

interface IChingData {
  type: 'iching';
  question: string;
  hexagram: {
    name: string;
    number: number;
    symbol: string;
    upperTrigram: string;
    lowerTrigram: string;
    judgement: string;
    judgementMeaning: string;
    image: string;
    imageMeaning: string;
    lines: { text: string; meaning: string }[];
  };
  changingLines: number[];
  changedHexagram?: {
    name: string;
    number: number;
    judgement: string;
    judgementMeaning: string;
  } | null;
}

interface TarotData {
  type: 'tarot';
  question: string;
  spreadType: 'single' | 'three' | 'celtic';
  cards: {
    name: string;
    isReversed: boolean;
    upright: string;
    reversed: string;
    keywords: string[];
    description: string;
    position?: string;
  }[];
}

type DivinationData = IChingData | TarotData;

// 周易占卜系统提示词
const ICHING_SYSTEM_PROMPT = `你是一位精通周易六十四卦的大师，擅长将古老的易经智慧与现代生活相结合，为求卦者提供有深度、有温度的解读。

解读原则：
1. **紧扣所问之事**：必须围绕用户提出的问题进行解读，不可泛泛而谈
2. **结合卦象特质**：根据卦象的特点（上下卦组合、卦辞含义、爻辞指引）进行针对性分析
3. **关注动爻变化**：如果有动爻，要特别分析动爻带来的变化启示
4. **给出具体建议**：解读要有实用性，给出可行的行动建议
5. **语言通俗有文采**：既要有传统文化的底蕴，又要让现代人能理解

回复格式要求（使用Markdown）：
## 卦象总览
（简要说明卦象的基本含义）

## 针对您的问题
（直接回应用户所问之事，结合卦象进行分析）

## 卦辞启示
（解读卦辞对用户问题的指引）

## 爻辞指引
（如果有动爻，解读动爻爻辞；如果没有，解读最相关的爻辞）

## 行动建议
（给出3-5条具体可行的建议）

## 注意事项
（提醒用户需要注意的方面）

注意：不要使用表情符号，保持专业严谨的风格。`;

// 塔罗占卜系统提示词
const TAROT_SYSTEM_PROMPT = `你是一位经验丰富的塔罗解读师，精通韦特塔罗牌的象征意义，能够将牌面信息与求问者的实际情况相结合，提供深刻而实用的解读。

解读原则：
1. **紧扣所问之事**：必须围绕用户提出的问题进行解读，不可泛泛而谈
2. **结合牌面含义**：根据每张牌的正逆位、关键词、象征意义进行分析
3. **考虑牌位关系**：在多张牌的牌阵中，要分析牌与牌之间的关联和故事线
4. **给出具体建议**：解读要有实用性，给出可行的行动建议
5. **语言温暖有力**：既要有神秘感，又要给人以力量和希望

回复格式要求（使用Markdown）：
## 牌面总览
（简要概括整体牌面呈现的信息）

## 针对您的问题
（直接回应用户所问之事，结合牌面进行分析）

## 逐牌解读
（逐张分析每张牌的含义及其与问题的关联）

## 整体启示
（综合所有牌面信息，给出整体性的解读）

## 行动建议
（给出3-5条具体可行的建议）

## 注意事项
（提醒用户需要注意的方面）

注意：不要使用表情符号，保持专业但温暖的风格。`;

/**
 * 占卜AI解读API（流式输出）
 * POST /api/divination/interpret
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body as DivinationData;

    if (!type || !data.question) {
      return new Response(
        JSON.stringify({ error: '参数不完整' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    let systemPrompt: string;
    let userPrompt: string;

    if (type === 'iching') {
      const ichingData = data as IChingData;
      systemPrompt = ICHING_SYSTEM_PROMPT;
      
      userPrompt = `请为以下周易占卜结果进行解读：

**用户所问之事**：${ichingData.question}

**本卦信息**：
- 卦名：第${ichingData.hexagram.number}卦 ${ichingData.hexagram.name}卦（${ichingData.hexagram.symbol}）
- 组成：上卦为${ichingData.hexagram.upperTrigram}，下卦为${ichingData.hexagram.lowerTrigram}
- 卦辞：${ichingData.hexagram.judgement}
- 卦辞释义：${ichingData.hexagram.judgementMeaning}
- 象辞：${ichingData.hexagram.image}
- 象辞释义：${ichingData.hexagram.imageMeaning}

**动爻信息**：
${ichingData.changingLines.length > 0 
  ? `有${ichingData.changingLines.length}个动爻：第${ichingData.changingLines.join('、')}爻
${ichingData.changingLines.map(lineNum => 
  `- 第${lineNum}爻：${ichingData.hexagram.lines[lineNum - 1].text}
  释义：${ichingData.hexagram.lines[lineNum - 1].meaning}`
).join('\n')}`
  : '无动爻，以卦辞为主进行解读'}

${ichingData.changedHexagram ? `
**变卦信息**：
- 本卦${ichingData.hexagram.name}变为${ichingData.changedHexagram.name}
- 变卦卦辞：${ichingData.changedHexagram.judgement}
- 变卦卦辞释义：${ichingData.changedHexagram.judgementMeaning}
` : ''}

请结合用户所问之事，对这卦进行全面解读。`;

    } else if (type === 'tarot') {
      const tarotData = data as TarotData;
      systemPrompt = TAROT_SYSTEM_PROMPT;
      
      const spreadTypeNames = {
        'single': '单张牌占卜',
        'three': '三张牌占卜（过去-现在-未来）',
        'celtic': '凯尔特十字占卜'
      };
      
      userPrompt = `请为以下塔罗占卜结果进行解读：

**用户所问之事**：${tarotData.question}

**牌阵类型**：${spreadTypeNames[tarotData.spreadType]}

**抽到的牌**：
${tarotData.cards.map((card, index) => {
  const positionInfo = card.position ? `【位置：${card.position}】` : '';
  return `
${index + 1}. ${card.name}（${card.isReversed ? '逆位' : '正位'}）${positionInfo}
   - 关键词：${card.keywords.join('、')}
   - ${card.isReversed ? '逆位含义' : '正位含义'}：${card.isReversed ? card.reversed : card.upright}
   - 牌意描述：${card.description}`;
}).join('\n')}

请结合用户所问之事，对这些牌进行全面解读。`;

    } else {
      return new Response(
        JSON.stringify({ error: '不支持的占卜类型' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
    let isClosed = false;
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (isClosed) break;
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }
          if (!isClosed) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            isClosed = true;
            controller.close();
          }
        } catch (error) {
          console.error('Stream error:', error);
          if (!isClosed) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '生成失败' })}\n\n`));
            isClosed = true;
            controller.close();
          }
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
    console.error('Divination interpretation error:', error);
    return new Response(
      JSON.stringify({ error: '解读失败，请稍后重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
