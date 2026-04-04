import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api-auth';
import { gameService } from '@/lib/game-service';

/**
 * 获取用户游戏状态
 * GET /api/game/status
 */
export async function GET(request: NextRequest) {
  // 验证登录状态
  const authResult = await verifyAuth(request);
  
  if (!authResult.success || !authResult.userId) {
    return NextResponse.json(
      { error: '请先登录' },
      { status: 401 }
    );
  }
  
  try {
    // 获取货币信息
    const currency = await gameService.getCurrency(authResult.userId);
    
    // 获取等级信息
    const level = await gameService.getLevel(authResult.userId);
    
    // 获取签到状态
    const signInStatus = await gameService.getSignInStatus(authResult.userId);
    
    return NextResponse.json({
      success: true,
      data: {
        currency,
        level,
        signIn: signInStatus,
      },
    });
  } catch (error) {
    console.error('获取游戏状态失败:', error);
    return NextResponse.json(
      { error: '获取游戏状态失败' },
      { status: 500 }
    );
  }
}
