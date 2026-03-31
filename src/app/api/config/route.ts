import { NextResponse } from 'next/server';

/**
 * 获取公开配置（运行时环境变量）
 * 用于解决 NEXT_PUBLIC_ 变量需要重新构建的问题
 */
export async function GET() {
  return NextResponse.json({
    icpBeian: process.env.ICP_BEIAN || process.env.NEXT_PUBLIC_ICP_BEIAN || null,
    gonganBeian: process.env.GONGAN_BEIAN || process.env.NEXT_PUBLIC_GONGAN_BEIAN || null,
  });
}
