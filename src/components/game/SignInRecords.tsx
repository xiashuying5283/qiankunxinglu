'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Flame, 
  Calendar as CalendarIcon,
  Gift,
  Coins
} from 'lucide-react';

interface SignInRecordsProps {
  className?: string;
}

interface SignInStats {
  totalDays: number;
  currentStreak: number;
  year: number;
  month: number;
}

interface DayRecord {
  continuousDays: number;
  guaCoinsEarned: number;
  bonusAwarded: boolean;
}

export function SignInRecords({ className }: SignInRecordsProps) {
  const [stats, setStats] = useState<SignInStats | null>(null);
  const [records, setRecords] = useState<Record<string, DayRecord>>({});
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchRecords(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const fetchRecords = async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/game/sign-in/records?year=${year}&month=${month}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.records);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('获取签到记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成日历数据
  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    
    // 获取月份第一天是星期几（0=周日，1=周一...）
    let startDayOfWeek = firstDay.getDay();
    // 转换为周一开始（0=周一，6=周日）
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    const days: Array<{
      date: string;
      day: number;
      isCurrentMonth: boolean;
      record?: DayRecord;
      isToday: boolean;
      isPast: boolean;
    }> = [];
    
    // 填充上个月的空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        date: '',
        day: 0,
        isCurrentMonth: false,
        isToday: false,
        isPast: true,
      });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // 填充当月日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        record: records[dateStr],
        isToday: dateStr === today,
        isPast: dateStr < today,
      });
    }
    
    return days;
  }, [currentYear, currentMonth, records]);

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(new Date().getFullYear());
    setCurrentMonth(new Date().getMonth() + 1);
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  if (loading && !stats) {
    return (
      <Card className={`bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-400/30 ${className}`}>
        <CardContent className="py-8 text-center text-amber-300">
          加载中...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-400/30 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-100">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            签到日历
          </CardTitle>
          
          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-amber-300">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>连续 <strong className="text-amber-100">{stats?.currentStreak || 0}</strong> 天</span>
            </div>
            <div className="flex items-center gap-1 text-amber-300">
              <Check className="w-4 h-4 text-green-400" />
              <span>累计 <strong className="text-amber-100">{stats?.totalDays || 0}</strong> 天</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 月份导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevMonth}
              className="text-amber-300 hover:text-amber-100 hover:bg-amber-500/20"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-lg font-bold text-amber-100 min-w-[120px] text-center">
              {currentYear}年 {monthNames[currentMonth - 1]}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              className="text-amber-300 hover:text-amber-100 hover:bg-amber-500/20"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="border-amber-400/50 text-amber-300 hover:bg-amber-500/20 hover:text-amber-100"
          >
            今天
          </Button>
        </div>
        
        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                i >= 5 ? 'text-orange-400/70' : 'text-amber-300/70'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 日历格子 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, index) => {
            if (!day.isCurrentMonth) {
              return <div key={index} className="h-10" />;
            }
            
            let bgClass = 'bg-amber-950/30';
            let textClass = 'text-amber-400/50';
            let borderClass = '';
            
            if (day.record) {
              // 已签到
              bgClass = 'bg-green-500/20';
              textClass = 'text-green-400 font-bold';
            } else if (day.isToday) {
              // 今天
              bgClass = 'bg-amber-500/30';
              textClass = 'text-amber-300 font-bold';
              borderClass = 'ring-2 ring-amber-400';
            } else if (day.isPast) {
              // 过去未签到
              bgClass = 'bg-amber-950/50';
              textClass = 'text-red-400/60';
            }
            
            return (
              <div
                key={index}
                className={`h-10 rounded-lg flex flex-col items-center justify-center relative ${bgClass} ${borderClass} transition-all hover:scale-105 cursor-default`}
                title={
                  day.record
                    ? `已签到 · 连续${day.record.continuousDays}天 · 获得${day.record.guaCoinsEarned}卦币${day.record.bonusAwarded ? ' · 🎁里程碑奖励' : ''}`
                    : day.isToday
                    ? '今天'
                    : day.isPast
                    ? '未签到'
                    : ''
                }
              >
                <span className={textClass}>{day.day}</span>
                {day.record && (
                  <Check className="w-3 h-3 text-green-400 absolute bottom-0.5" />
                )}
                {day.record?.bonusAwarded && (
                  <Gift className="w-3 h-3 text-amber-400 absolute top-0.5 right-0.5" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* 图例 */}
        <div className="flex items-center justify-center gap-6 text-xs text-amber-300/70 pt-2 border-t border-amber-400/20">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-500/20" />
            <span>已签到</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-amber-500/30 ring-1 ring-amber-400" />
            <span>今天</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-amber-950/50" />
            <span>未签到</span>
          </div>
          <div className="flex items-center gap-1">
            <Gift className="w-3 h-3 text-amber-400" />
            <span>里程碑奖励</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
