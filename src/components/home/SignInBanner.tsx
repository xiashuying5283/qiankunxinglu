'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Coins, Gift, Flame, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/** 签到奖励配置 */
const SIGN_IN_REWARDS = [10, 15, 20, 25, 30, 35, 50];

interface SignInStatus {
  hasSignedIn: boolean;
  continuousDays: number;
  totalDays: number;
  todayRewards: number;
}

interface SignInBannerProps {
  onOpenDialog: () => void;
}

export function SignInBanner({ onOpenDialog }: SignInBannerProps) {
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [status, setStatus] = useState<SignInStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // 检查是否今天已关闭过（使用 localStorage）
  useEffect(() => {
    const today = new Date().toDateString();
    const dismissedDate = localStorage.getItem('signInBannerDismissed');
    if (dismissedDate === today) {
      setDismissed(true);
    }
  }, []);

  // 获取签到状态
  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      fetchStatus();
    } else if (!isAuthLoading && !isLoggedIn) {
      setLoading(false);
    }
  }, [isAuthLoading, isLoggedIn]);

  const fetchStatus = async () => {
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

  // 关闭横幅（当天不再显示）
  const handleDismiss = () => {
    const today = new Date().toDateString();
    localStorage.setItem('signInBannerDismissed', today);
    setDismissed(true);
  };

  // 加载中或未登录时不显示
  if (loading || isAuthLoading || !isLoggedIn) {
    return null;
  }

  // 已签到且已关闭
  if (status?.hasSignedIn && dismissed) {
    return null;
  }

  // 已签到 - 显示简洁的成功状态（可关闭）
  if (status?.hasSignedIn) {
    return (
      <div className="bg-gradient-to-r from-green-900/60 to-emerald-900/60 border-b border-green-500/20">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-200">今日已签到</span>
              </div>
              <div className="h-4 w-px bg-green-500/30" />
              <div className="flex items-center gap-1 text-sm text-green-300/80">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>连续 {status.continuousDays} 天</span>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-green-500/20 rounded transition-colors"
            >
              <X className="w-4 h-4 text-green-400/60" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 未签到 - 显示引导横幅
  const nextReward = SIGN_IN_REWARDS[Math.min(status?.continuousDays || 0, 6)];
  const milestoneDay = [3, 7, 14, 30].find(d => (status?.continuousDays || 0) + 1 === d);

  return (
    <div className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 border-b border-amber-500/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：签到信息 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/30 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-100">
                  今日签到可获得
                </p>
                <p className="text-xs text-amber-300/80 flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  <span className="font-bold text-amber-200">+{nextReward}</span> 卦币
                  {milestoneDay && (
                    <>
                      <span className="mx-1">·</span>
                      <Gift className="w-3 h-3 text-rose-400" />
                      <span className="text-rose-300">里程碑奖励</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            {/* 连续签到进度 */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-950/40 rounded-lg">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-amber-300">已连续</span>
              <span className="text-sm font-bold text-amber-100">{status?.continuousDays || 0}</span>
              <span className="text-xs text-amber-300">天</span>
            </div>
          </div>

          {/* 右侧：签到按钮 */}
          <Button
            onClick={onOpenDialog}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium px-5 py-2 h-9"
          >
            <Calendar className="w-4 h-4 mr-2" />
            立即签到
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
