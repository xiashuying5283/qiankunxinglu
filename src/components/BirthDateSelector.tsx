'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Moon, Sun } from 'lucide-react';
import { 
  solarToLunar, 
  lunarToSolar, 
  getLunarMonthName, 
  getLunarDayName,
  validateDate
} from '@/lib/bazi-calculator';

interface BirthDateSelectorProps {
  value: {
    year: number;
    month: number;
    day: number;
    hour: number;
    isLunar: boolean;
  };
  onChange: (value: {
    year: number;
    month: number;
    day: number;
    hour: number;
    isLunar: boolean;
  }) => void;
  showHour?: boolean;
  className?: string;
}

// 时辰选项
const hourOptions = [
  { value: 0, label: '子时 (23:00-01:00)' },
  { value: 1, label: '丑时 (01:00-03:00)' },
  { value: 2, label: '丑时 (01:00-03:00)' },
  { value: 3, label: '寅时 (03:00-05:00)' },
  { value: 4, label: '寅时 (03:00-05:00)' },
  { value: 5, label: '卯时 (05:00-07:00)' },
  { value: 6, label: '卯时 (05:00-07:00)' },
  { value: 7, label: '辰时 (07:00-09:00)' },
  { value: 8, label: '辰时 (07:00-09:00)' },
  { value: 9, label: '巳时 (09:00-11:00)' },
  { value: 10, label: '巳时 (09:00-11:00)' },
  { value: 11, label: '午时 (11:00-13:00)' },
  { value: 12, label: '午时 (11:00-13:00)' },
  { value: 13, label: '未时 (13:00-15:00)' },
  { value: 14, label: '未时 (13:00-15:00)' },
  { value: 15, label: '申时 (15:00-17:00)' },
  { value: 16, label: '申时 (15:00-17:00)' },
  { value: 17, label: '酉时 (17:00-19:00)' },
  { value: 18, label: '酉时 (17:00-19:00)' },
  { value: 19, label: '戌时 (19:00-21:00)' },
  { value: 20, label: '戌时 (19:00-21:00)' },
  { value: 21, label: '亥时 (21:00-23:00)' },
  { value: 22, label: '亥时 (21:00-23:00)' },
  { value: 23, label: '子时 (23:00-01:00)' },
];

export function BirthDateSelector({ value, onChange, showHour = true, className = '' }: BirthDateSelectorProps) {
  const [lunarDisplay, setLunarDisplay] = useState<string>('');

  // 当日期改变时，更新农历显示
  useEffect(() => {
    if (!value.isLunar && value.year && value.month && value.day) {
      const lunar = solarToLunar(value.year, value.month, value.day);
      if (lunar) {
        setLunarDisplay(`农历 ${getLunarMonthName(lunar.month)}${getLunarDayName(lunar.day)}`);
      } else {
        setLunarDisplay('');
      }
    } else if (value.isLunar && value.year && value.month && value.day) {
      const solar = lunarToSolar(value.year, value.month, value.day);
      if (solar) {
        setLunarDisplay(`公历 ${solar.year}年${solar.month}月${solar.day}日`);
      } else {
        setLunarDisplay('');
      }
    } else {
      setLunarDisplay('');
    }
  }, [value.year, value.month, value.day, value.isLunar]);

  // 切换公历/农历
  const toggleCalendarType = () => {
    const newIsLunar = !value.isLunar;
    
    // 如果有有效日期，则转换
    if (value.year && value.month && value.day) {
      if (newIsLunar) {
        // 公历转农历
        const lunar = solarToLunar(value.year, value.month, value.day);
        if (lunar) {
          onChange({ ...value, isLunar: newIsLunar, year: lunar.year, month: lunar.month, day: lunar.day });
        } else {
          onChange({ ...value, isLunar: newIsLunar });
        }
      } else {
        // 农历转公历
        const solar = lunarToSolar(value.year, value.month, value.day);
        if (solar) {
          onChange({ ...value, isLunar: newIsLunar, year: solar.year, month: solar.month, day: solar.day });
        } else {
          onChange({ ...value, isLunar: newIsLunar });
        }
      }
    } else {
      onChange({ ...value, isLunar: newIsLunar });
    }
  };

  return (
    <div className={className}>
      {/* 日历类型切换 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {value.isLunar ? (
            <Moon className="w-4 h-4 text-purple-300" />
          ) : (
            <Sun className="w-4 h-4 text-yellow-300" />
          )}
          <span className="text-sm text-amber-200">
            {value.isLunar ? '农历' : '公历'}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleCalendarType}
          className="text-amber-300 hover:text-amber-100 hover:bg-white/10 h-8 px-3"
        >
          <Calendar className="w-4 h-4 mr-1" />
          切换为{value.isLunar ? '公历' : '农历'}
        </Button>
      </div>

      {/* 日期输入 */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs text-amber-200/60 mb-1">年</label>
          <Input
            type="number"
            value={value.year || ''}
            onChange={(e) => {
              const year = parseInt(e.target.value) || 0;
              onChange({ ...value, year });
            }}
            placeholder={value.isLunar ? '一九九〇' : '1990'}
            className="bg-white/10 border-amber-300/30 text-amber-100 placeholder:text-amber-200/40 text-center h-10"
          />
        </div>
        <div>
          <label className="block text-xs text-amber-200/60 mb-1">月</label>
          <Input
            type="number"
            value={value.month || ''}
            onChange={(e) => {
              const month = parseInt(e.target.value) || 0;
              onChange({ ...value, month });
            }}
            placeholder={value.isLunar ? '五' : '6'}
            min="1"
            max={value.isLunar ? 12 : 12}
            className="bg-white/10 border-amber-300/30 text-amber-100 placeholder:text-amber-200/40 text-center h-10"
          />
        </div>
        <div>
          <label className="block text-xs text-amber-200/60 mb-1">日</label>
          <Input
            type="number"
            value={value.day || ''}
            onChange={(e) => {
              const day = parseInt(e.target.value) || 0;
              onChange({ ...value, day });
            }}
            placeholder={value.isLunar ? '廿三' : '15'}
            min="1"
            max={value.isLunar ? 30 : 31}
            className="bg-white/10 border-amber-300/30 text-amber-100 placeholder:text-amber-200/40 text-center h-10"
          />
        </div>
      </div>

      {/* 时辰选择 */}
      {showHour && (
        <div className="mb-3">
          <label className="block text-xs text-amber-200/60 mb-1">时辰</label>
          <select
            value={value.hour}
            onChange={(e) => {
              const hour = parseInt(e.target.value);
              onChange({ ...value, hour });
            }}
            className="w-full h-10 rounded-md bg-white/10 border border-amber-300/30 text-amber-100 px-3"
          >
            {hourOptions.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-amber-900 text-amber-100">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 农历/公历对应显示 */}
      {lunarDisplay && (
        <div className="text-xs text-amber-300/80 bg-amber-900/30 rounded px-3 py-2">
          对应{value.isLunar ? '公历' : '农历'}：{lunarDisplay}
        </div>
      )}
    </div>
  );
}
