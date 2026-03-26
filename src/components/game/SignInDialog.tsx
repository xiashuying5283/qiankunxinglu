'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Coins, Gift, Flame, CheckCircle2, Star } from 'lucide-react';

/** 签到日历数据 */
const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];

/** 签到奖励配置 */
const SIGN_IN_REWARDS = [10, 15, 20, 25, 30, 35, 50];

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignInSuccess?: () => void;
}

interface SignInStatus {
  hasSignedIn: boolean;
  continuousDays: number;
  totalDays: number;
  todayRewards: number;
}

export function SignInDialog({ open, onOpenChange, onSignInSuccess }: SignInDialogProps) {
  const [status, setStatus] = useState<SignInStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signInResult, setSignInResult] = useState<{
    guaCoinsEarned: number;
    continuousDays: number;
    bonusAwarded: boolean;
    bonusDescription?: string;
  } | null>(null);

  // 获取签到状态
  useEffect(() => {
    if (open) {
      fetchStatus();
    }
  }, [open]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/game/status');
      const data = await res.json();
      if (data.success) {
        setStatus(data.data.signIn);
      }
    } catch (error) {
      console.error('获取签到状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      const res = await fetch('/api/game/sign-in', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setSignInResult({
          guaCoinsEarned: data.data.guaCoinsEarned,
          continuousDays: data.data.continuousDays,
          bonusAwarded: data.data.bonusAwarded,
          bonusDescription: data.data.bonusDescription,
        });
        fetchStatus();
        onSignInSuccess?.();
      }
    } catch (error) {
      console.error('签到失败:', error);
    } finally {
      setSigningIn(false);
    }
  };

  // 计算本周签到状态
  const getWeekStatus = () => {
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1; // 转换为周一=0的索引
    
    return WEEK_DAYS.map((day, index) => {
      const isToday = index === todayIndex;
      const isPast = index < todayIndex;
      const continuousDays = status?.continuousDays || 0;
      
      // 计算这天是否已签到（简化逻辑：根据连续天数判断）
      const signedIn = isPast && continuousDays > (todayIndex - index);
      
      return {
        day,
        isToday,
        isPast,
        signedIn,
        reward: SIGN_IN_REWARDS[index],
      };
    });
  };

  const weekStatus = getWeekStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-900/95 to-orange-900/95 border-amber-400/30 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            每日签到
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-amber-200">
            加载中...
          </div>
        ) : signInResult ? (
          // 签到成功界面
          <div className="py-6 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-bold text-amber-100">签到成功！</p>
              <p className="text-amber-200">
                获得 <span className="text-amber-400 font-bold text-xl">{signInResult.guaCoinsEarned}</span> 卦币
              </p>
              <p className="text-sm text-amber-300/80">
                已连续签到 <span className="text-amber-400 font-bold">{signInResult.continuousDays}</span> 天
              </p>
            </div>

            {signInResult.bonusAwarded && (
              <div className="bg-amber-500/20 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Gift className="w-5 h-5" />
                  <span className="font-bold">里程碑奖励！</span>
                </div>
                <p className="text-amber-200 mt-2">{signInResult.bonusDescription}</p>
              </div>
            )}

            <Button
              onClick={() => onOpenChange(false)}
              className="mt-4 bg-amber-600 hover:bg-amber-500 text-white"
            >
              确定
            </Button>
          </div>
        ) : (
          // 签到主界面
          <div className="space-y-6">
            {/* 本周签到日历 */}
            <div className="bg-amber-950/40 rounded-lg p-4">
              <p className="text-sm text-amber-300 mb-3 flex items-center gap-1">
                <Flame className="w-4 h-4" /> 本周签到进度
              </p>
              <div className="grid grid-cols-7 gap-2">
                {weekStatus.map((day, index) => (
                  <div
                    key={index}
                    className={`text-center p-2 rounded-lg transition-all ${
                      day.isToday
                        ? 'bg-amber-500/30 ring-2 ring-amber-400'
                        : day.signedIn
                        ? 'bg-green-500/20'
                        : 'bg-amber-900/30'
                    }`}
                  >
                    <p className={`text-xs ${day.isToday ? 'text-amber-300 font-bold' : 'text-amber-400/60'}`}>
                      周{day.day}
                    </p>
                    <p className={`text-sm font-bold mt-1 ${
                      day.signedIn ? 'text-green-400' : day.isToday ? 'text-amber-300' : 'text-amber-400/40'
                    }`}>
                      {day.signedIn ? '✓' : `+${day.reward}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 签到状态 */}
            {status?.hasSignedIn ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <p className="text-amber-100 font-medium">今日已签到</p>
                <p className="text-amber-300/70 text-sm mt-1">
                  已连续签到 {status.continuousDays} 天
                </p>
              </div>
            ) : (
              <>
                {/* 今日奖励 */}
                <div className="bg-gradient-to-r from-amber-600/30 to-orange-600/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-300 text-sm">今日签到可获得</p>
                      <p className="text-2xl font-bold text-amber-100 flex items-center gap-1 mt-1">
                        <Coins className="w-5 h-5 text-amber-400" />
                        +{status?.todayRewards || 10} 卦币
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-300 text-sm">连续签到</p>
                      <p className="text-lg font-bold text-amber-100">
                        第 {(status?.continuousDays || 0) + 1} 天
                      </p>
                    </div>
                  </div>
                </div>

                {/* 签到按钮 */}
                <Button
                  onClick={handleSignIn}
                  disabled={signingIn}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-6 text-lg"
                >
                  {signingIn ? '签到中...' : '立即签到'}
                </Button>
              </>
            )}

            {/* 里程碑奖励提示 */}
            <div className="text-center text-xs text-amber-400/60">
              <p>连续签到7天可获得额外奖励</p>
              <p className="mt-1">累计签到30天解锁免费八字报告</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
