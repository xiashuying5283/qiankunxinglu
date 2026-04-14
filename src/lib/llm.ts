import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set. Please check your .env.local or environment variables.');
    }

    openaiClient = new OpenAI({ apiKey, baseURL });
  }
  return openaiClient;
}

export function getDefaultModel(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

/**
 * 流式调用 LLM，返回异步可迭代的 { content: string } 块
 */
export async function* streamLLM(
  messages: { role: string; content: string }[],
  options?: { model?: string; temperature?: number }
): AsyncGenerator<{ content: string }> {
  const client = getClient();
  const model = options?.model || getDefaultModel();

  const stream = await client.chat.completions.create({
    model,
    messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
    temperature: options?.temperature ?? 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield { content };
    }
  }
}

/**
 * 生成图片
 */
export async function generateImage(prompt: string, options?: { size?: string }): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
}> {
  try {
    const client = getClient();

    const sizeMap = {
      '1K': '1024x1024',
      '2K': '1024x1024',
      '4K': '1792x1024',
    } as const;

    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: (options?.size ? sizeMap[options.size as keyof typeof sizeMap] : '1024x1024') as '1024x1024' | '1792x1024',
    });

    if (response.data && response.data.length > 0) {
      return { success: true, imageUrl: response.data[0].url };
    }

    return { success: false, error: 'No image generated' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed',
    };
  }
}
