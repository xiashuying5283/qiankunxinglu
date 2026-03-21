import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { prompt, size } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await generateImage(prompt, { size });

    if (response.success && response.imageUrl) {
      return NextResponse.json({ 
        success: true, 
        imageUrl: response.imageUrl 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: response.error || 'Generation failed' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
