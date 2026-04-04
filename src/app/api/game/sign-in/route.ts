import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { gameService } from '@/lib/game-service';

/**
 * 执行签到
 * POST /api/game/sign-in
 */
export async function POST(request: NextRequest) {
  // 验证登录状态
  const authResult = await verifyAuth(request);
  
  if (!authResult.success || !authResult.userId) {
    return NextResponse.json(
      { error: '请先登录' },
      { status: 401 }
    );
  }
  
  try {
    const result = await gameService.signIn(authResult.userId);
    
    if (result.alreadySignedIn) {
      return NextResponse.json({
        success: false,
        message: '今日已签到',
        data: result,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `签到成功！获得 ${result.guaCoinsEarned} 卦币`,
      data: result,
    });
  } catch (error) {
    console.error('签到失败:', error);
    return NextResponse.json(
      { error: '签到失败，请稍后重试' },
      { status: 500 }
    );
  }
}
