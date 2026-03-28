'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Coins, Gift, Flame, CheckCircle2
} from 'lucide-react';

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

interface SignInRecords {
  [date: string]: {
    continuousDays: number;
    guaCoinsEarned: number;
    bonusAwarded: boolean;
  };
}

export function SignInDialog({ open, onOpenChange, onSignInSuccess }: SignInDialogProps) {
  const [status, setStatus] = useState<SignInStatus | null>(null);
  const [records, setRecords] = useState<SignInRecords>({});
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signInResult, setSignInResult] = useState<{
    guaCoinsEarned: number;
    continuousDays: number;
    bonusAwarded: boolean;
    bonusDescription?: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取游戏状态
      const statusRes = await fetch('/api/game/status');
      const statusData = await statusRes.json();
      if (statusData.success) {
        setStatus(statusData.data.signIn);
      }
      
      // 获取最近7天记录
      const today = new Date();
      const dates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }
      
      const recordsRes = await fetch(`/api/game/sign-in/records?year=${today.getFullYear()}&month=${today.getMonth() + 1}`);
      const recordsData = await recordsRes.json();
      if (recordsData.success) {
        setRecords(recordsData.data.records);
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
        fetchData();
        onSignInSuccess?.();
      }
    } catch (error) {
      console.error('签到失败:', error);
    } finally {
      setSigningIn(false);
    }
  };

  // 计算最近7天的数据
  const last7Days = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: d.getDate(),
        weekday: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
        record: records[dateStr],
        isToday: i === 0,
        isPast: i > 0,
      });
    }
    return days;
  }, [records]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-900/95 to-orange-900/95 border-amber-400/30 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              每日签到
            </span>
            {status && (
              <span className="text-sm font-normal flex items-center gap-1 text-amber-300">
                <Flame className="w-4 h-4 text-orange-400" />
                连续 {status.continuousDays} 天
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-amber-200">加载中...</div>
        ) : signInResult ? (
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
              <div className="bg-amber-500/20 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Gift className="w-5 h-5" />
                  <span className="font-bold">里程碑奖励！</span>
                </div>
                <p className="text-amber-200 mt-2">{signInResult.bonusDescription}</p>
              </div>
            )}

            <Button onClick={() => onOpenChange(false)} className="mt-4 bg-amber-600 hover:bg-amber-500 text-white">
              确定
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 最近7天签到记录 */}
            <div className="bg-amber-950/40 rounded-lg p-4">
              <p className="text-sm text-amber-300 mb-3">最近7天签到</p>
              <div className="grid grid-cols-7 gap-1.5">
                {last7Days.map((day, index) => {
                  let bgClass = 'bg-amber-950/30';
                  let textClass = 'text-amber-400/50';
                  
                  if (day.record) {
                    bgClass = 'bg-green-500/20';
                    textClass = 'text-green-400';
                  } else if (day.isToday) {
                    bgClass = 'bg-amber-500/30 ring-2 ring-amber-400';
                    textClass = 'text-amber-300 font-bold';
                  } else if (day.isPast) {
                    textClass = 'text-red-400/40';
                  }
                  
                  return (
                    <div key={index} className="text-center">
                      <p className="text-xs text-amber-400/60 mb-1">周{day.weekday}</p>
                      <div
                        className={`h-9 rounded-lg flex items-center justify-center relative ${bgClass}`}
                        title={day.record ? `已签到 +${day.record.guaCoinsEarned}卦币` : day.isToday ? '今天' : day.isPast ? '未签到' : ''}
                      >
                        <span className={`text-sm ${textClass}`}>{day.day}</span>
                        {day.record && <CheckCircle2 className="w-2.5 h-2.5 text-green-400 absolute -bottom-0.5 -right-0.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-amber-400/60 mt-3 pt-2 border-t border-amber-400/20">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500/20" />
                  <span>已签到</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-amber-500/30 ring-1 ring-amber-400" />
                  <span>今天</span>
                </div>
              </div>
            </div>

            {/* 签到状态/按钮 */}
            {status?.hasSignedIn ? (
              <div className="text-center py-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-8 h-8 mx-auto text-green-400 mb-2" />
                <p className="text-amber-100 font-medium">今日已签到</p>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-amber-600/30 to-orange-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-300 text-xs">今日签到可获得</p>
                      <p className="text-lg font-bold text-amber-100 flex items-center gap-1">
                        <Coins className="w-4 h-4 text-amber-400" />
                        +{status?.todayRewards || 10} 卦币
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-300 text-xs">连续签到</p>
                      <p className="text-base font-bold text-amber-100">第 {(status?.continuousDays || 0) + 1} 天</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSignIn}
                  disabled={signingIn}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-5 text-lg"
                >
                  {signingIn ? '签到中...' : '立即签到'}
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
