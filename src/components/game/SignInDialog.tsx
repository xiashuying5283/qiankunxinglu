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
  Calendar, Coins, Gift, Flame, CheckCircle2, 
  ChevronLeft, ChevronRight
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
  
  // 日历导航
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth() + 1);

  // 获取签到状态和记录
  useEffect(() => {
    if (open) {
      fetchData();
      setViewYear(new Date().getFullYear());
      setViewMonth(new Date().getMonth() + 1);
    }
  }, [open]);

  // 获取当月记录
  useEffect(() => {
    if (open) {
      fetchRecords(viewYear, viewMonth);
    }
  }, [viewYear, viewMonth, open]);

  const fetchData = async () => {
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

  const fetchRecords = async (year: number, month: number) => {
    try {
      const res = await fetch(`/api/game/sign-in/records?year=${year}&month=${month}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.records);
      }
    } catch (error) {
      console.error('获取签到记录失败:', error);
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
        fetchRecords(viewYear, viewMonth);
        onSignInSuccess?.();
      }
    } catch (error) {
      console.error('签到失败:', error);
    } finally {
      setSigningIn(false);
    }
  };

  // 生成日历数据
  const calendarData = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1);
    const lastDay = new Date(viewYear, viewMonth, 0);
    const daysInMonth = lastDay.getDate();
    
    // 获取月份第一天是星期几（0=周日，转换后0=周一）
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const today = new Date().toISOString().split('T')[0];
    const days: Array<{
      date: string;
      day: number;
      record?: { continuousDays: number; guaCoinsEarned: number; bonusAwarded: boolean };
      isToday: boolean;
      isPast: boolean;
    }> = [];
    
    // 填充空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: '', day: 0, isToday: false, isPast: true });
    }
    
    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        day,
        record: records[dateStr],
        isToday: dateStr === today,
        isPast: dateStr < today,
      });
    }
    
    return days;
  }, [viewYear, viewMonth, records]);

  const goToPrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-amber-900/95 to-orange-900/95 border-amber-400/30 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              每日签到
            </span>
            {status && (
              <span className="text-sm font-normal flex items-center gap-1 text-amber-300">
                <Flame className="w-4 h-4 text-orange-400" />
                连续 {status.continuousDays} 天 | 累计 {status.totalDays} 天
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-amber-200">加载中...</div>
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
              <div className="bg-amber-500/20 rounded-lg p-4">
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
          <div className="space-y-4">
            {/* 签到日历 */}
            <div className="bg-amber-950/40 rounded-lg p-4">
              {/* 月份导航 */}
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevMonth}
                  className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-500/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-bold text-amber-200">
                  {viewYear}年 {monthNames[viewMonth - 1]}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextMonth}
                  className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-500/20"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {/* 星期标题 */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {weekDays.map((day, i) => (
                  <div key={day} className={`text-center text-xs py-1 ${i >= 5 ? 'text-orange-400/70' : 'text-amber-400/70'}`}>
                    {day}
                  </div>
                ))}
              </div>
              
              {/* 日历格子 */}
              <div className="grid grid-cols-7 gap-1">
                {calendarData.map((day, index) => {
                  if (!day.date) {
                    return <div key={index} className="h-8" />;
                  }
                  
                  let bgClass = 'bg-amber-950/30';
                  let textClass = 'text-amber-400/50';
                  
                  if (day.record) {
                    bgClass = 'bg-green-500/20';
                    textClass = 'text-green-400 font-bold';
                  } else if (day.isToday) {
                    bgClass = 'bg-amber-500/30 ring-2 ring-amber-400';
                    textClass = 'text-amber-300 font-bold';
                  } else if (day.isPast) {
                    textClass = 'text-red-400/50';
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`h-8 rounded flex items-center justify-center text-xs relative ${bgClass}`}
                      title={
                        day.record
                          ? `已签到 · +${day.record.guaCoinsEarned}卦币`
                          : day.isToday
                          ? '今天'
                          : day.isPast
                          ? '未签到'
                          : ''
                      }
                    >
                      <span className={textClass}>{day.day}</span>
                      {day.record && <CheckCircle2 className="w-2.5 h-2.5 text-green-400 absolute bottom-0.5 right-0.5" />}
                    </div>
                  );
                })}
              </div>
              
              {/* 图例 */}
              <div className="flex items-center justify-center gap-4 text-xs text-amber-400/60 mt-3 pt-2 border-t border-amber-400/20">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500/20" />
                  <span>已签到</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-amber-500/30 ring-1 ring-amber-400" />
                  <span>今天</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-amber-950/50" />
                  <span>未签到</span>
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
                {/* 今日奖励 */}
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

                {/* 签到按钮 */}
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
