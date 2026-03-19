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
    lines?: { text: string; meaning: string }[];
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

【重要】解卦规则（必须严格遵守）：
根据变爻数量，采用不同的解卦方法：

1. **无变爻（0个）**：以本卦卦辞为主进行解读，不涉及爻辞。

2. **一个变爻**：以本卦该变爻的爻辞为主进行解读，卦辞为辅。

3. **两个变爻**：以本卦两个变爻的爻辞为主，上爻（爻位数字大的）为主，下爻为辅。

4. **三个变爻**：以本卦和变卦的卦辞为主，本卦为主、变卦为辅。结合两卦卦辞综合判断。

5. **四个变爻**：以变卦中不变的两个爻的爻辞为主进行解读。

6. **五个变爻**：以变卦中唯一不变的那一爻的爻辞为主进行解读。

7. **六个变爻（全变）**：
   - 若是乾卦或坤卦，以"用九"或"用六"为主
   - 其他卦以变卦的卦辞为主进行解读

解读原则：
1. **严格遵守解卦规则**：根据变爻数量选择正确的解读依据
2. **紧扣所问之事**：必须围绕用户提出的问题进行解读，不可泛泛而谈
3. **结合卦象特质**：根据卦象的特点（上下卦组合、卦辞含义）进行针对性分析
4. **给出具体建议**：解读要有实用性，给出可行的行动建议
5. **语言通俗有文采**：既要有传统文化的底蕴，又要让现代人能理解

回复格式要求（使用Markdown）：
## 卦象总览
（简要说明卦象的基本含义和组成）

## 解卦依据
（明确说明本次占卜有几个变爻，根据规则应以什么为主进行解读）

## 针对您的问题
（直接回应用户所问之事，结合解卦依据进行分析）

## 卦爻启示
（根据解卦规则，引用并解读相关的卦辞或爻辞）

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
      
      // 计算不变爻位置
      const allLines = [1, 2, 3, 4, 5, 6];
      const unchangedLines = allLines.filter(l => !ichingData.changingLines.includes(l));
      
      userPrompt = `请为以下周易占卜结果进行解读：

**用户所问之事**：${ichingData.question}

**本卦信息**：
- 卦名：第${ichingData.hexagram.number}卦 ${ichingData.hexagram.name}卦（${ichingData.hexagram.symbol}）
- 组成：上卦为${ichingData.hexagram.upperTrigram}，下卦为${ichingData.hexagram.lowerTrigram}
- 卦辞：${ichingData.hexagram.judgement}
- 卦辞释义：${ichingData.hexagram.judgementMeaning}
- 象辞：${ichingData.hexagram.image}
- 象辞释义：${ichingData.hexagram.imageMeaning}

**变爻数量**：${ichingData.changingLines.length}个

${ichingData.changingLines.length > 0 ? `
**动爻信息**（本卦中变化的爻）：
${ichingData.changingLines.map(lineNum => 
  `- 第${lineNum}爻：${ichingData.hexagram.lines[lineNum - 1].text}
  释义：${ichingData.hexagram.lines[lineNum - 1].meaning}`
).join('\n')}
` : '**无动爻**：以本卦卦辞为主进行解读'}

${ichingData.changingLines.length > 0 && ichingData.changingLines.length < 6 ? `
**不变爻信息**（本卦中不变的爻）：
${unchangedLines.map(lineNum => 
  `- 第${lineNum}爻：${ichingData.hexagram.lines[lineNum - 1].text}
  释义：${ichingData.hexagram.lines[lineNum - 1].meaning}`
).join('\n')}
` : ''}

${ichingData.changedHexagram ? `
**变卦信息**：
- 本卦${ichingData.hexagram.name}变为${ichingData.changedHexagram.name}
- 变卦卦辞：${ichingData.changedHexagram.judgement}
- 变卦卦辞释义：${ichingData.changedHexagram.judgementMeaning}
${ichingData.changedHexagram.lines ? `
- 变卦爻辞：
${ichingData.changedHexagram.lines.map((line, idx) => 
  `  第${idx + 1}爻：${line.text}
  释义：${line.meaning}`
).join('\n')}` : ''}
` : ''}

${ichingData.changingLines.length === 6 ? `
**全变提示**：
${ichingData.hexagram.name === '乾' ? '乾卦全变，请以"用九"为主进行解读：用九，见群龙无首，吉。' : 
  ichingData.hexagram.name === '坤' ? '坤卦全变，请以"用六"为主进行解读：用六，利永贞。' : 
  '六爻皆变，请以变卦卦辞为主进行解读。'}
` : ''}

请严格按照【解卦规则】，根据变爻数量${ichingData.changingLines.length}个，选择正确的解卦方法进行解读。`;

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
