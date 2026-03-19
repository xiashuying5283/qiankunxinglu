'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './button';

interface SliderCaptchaProps {
  onVerify: (success: boolean) => void;
  onRefresh?: () => void;
}

export function SliderCaptcha({ onVerify, onRefresh }: SliderCaptchaProps) {
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'success' | 'fail' | null>(null);
  const [targetPosition, setTargetPosition] = useState(0);
  const [bgPosition, setBgPosition] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const TOLERANCE = 10; // 允许的误差范围（像素）

  // 初始化验证码
  const initCaptcha = useCallback(() => {
    // 生成随机目标位置 (50-200 之间)
    const randomTarget = Math.floor(Math.random() * 150) + 50;
    setTargetPosition(randomTarget);
    
    // 随机背景位置
    setBgPosition(Math.floor(Math.random() * 100) + 50);
    
    setSliderValue(0);
    setIsVerified(false);
    setVerifyResult(null);
  }, []);

  useEffect(() => {
    initCaptcha();
  }, [initCaptcha]);

  // 处理拖动开始
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isVerified) return;
    
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX - sliderValue;
    
    // 阻止文本选择
    e.preventDefault();
  }, [sliderValue, isVerified]);

  // 处理拖动
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || isVerified) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const containerWidth = containerRef.current?.offsetWidth || 280;
    const sliderWidth = 40;
    const maxValue = containerWidth - sliderWidth;
    
    let newValue = clientX - startXRef.current;
    newValue = Math.max(0, Math.min(newValue, maxValue));
    
    setSliderValue(newValue);
  }, [isDragging, isVerified]);

  // 处理拖动结束
  const handleDragEnd = useCallback(() => {
    if (!isDragging || isVerified) return;
    
    setIsDragging(false);
    
    // 验证位置
    const diff = Math.abs(sliderValue - targetPosition);
    if (diff <= TOLERANCE) {
      setIsVerified(true);
      setVerifyResult('success');
      onVerify(true);
    } else {
      setVerifyResult('fail');
      onVerify(false);
      // 失败后延迟重置
      setTimeout(() => {
        initCaptcha();
      }, 1000);
    }
  }, [isDragging, isVerified, sliderValue, targetPosition, onVerify, initCaptcha]);

  // 绑定全局事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // 刷新验证码
  const handleRefresh = () => {
    initCaptcha();
    onRefresh?.();
  };

  return (
    <div className="w-full select-none">
      {/* 验证码图片区域 */}
      <div 
        ref={containerRef}
        className="relative w-full h-[120px] rounded-lg overflow-hidden border border-border"
        style={{
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        }}
      >
        {/* 装饰性图案 */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 280 120">
            {/* 八卦图案 */}
            <circle cx="140" cy="60" r="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
            <path d="M140 20 A40 40 0 0 1 140 100" fill="rgba(255,255,255,0.2)"/>
            <circle cx="140" cy="40" r="10" fill="rgba(255,255,255,0.3)"/>
            <circle cx="140" cy="80" r="10" fill="rgba(102,126,234,0.5)"/>
            
            {/* 星星装饰 */}
            <text x="30" y="30" fill="rgba(255,255,255,0.4)" fontSize="14">✦</text>
            <text x="250" y="50" fill="rgba(255,255,255,0.4)" fontSize="10">✧</text>
            <text x="60" y="100" fill="rgba(255,255,255,0.3)" fontSize="12">✦</text>
            <text x="220" y="90" fill="rgba(255,255,255,0.4)" fontSize="16">✦</text>
          </svg>
        </div>
        
        {/* 目标缺口 */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-md"
          style={{ 
            left: `${targetPosition}px`,
            background: 'rgba(0,0,0,0.5)',
            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.2)',
          }}
        >
          {/* 缺口内部装饰 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 rounded-full" />
          </div>
        </div>
        
        {/* 滑块拼图 */}
        <div 
          ref={sliderRef}
          className={`absolute top-1/2 -translate-y-1/2 w-[50px] h-[50px] rounded-md cursor-grab transition-shadow
            ${isVerified ? 'bg-green-500/80' : 'bg-white/90'}
            ${isDragging ? 'cursor-grabbing shadow-lg' : ''}
            ${verifyResult === 'fail' ? 'animate-shake bg-red-500/80' : ''}
          `}
          style={{ 
            left: `${sliderValue}px`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {/* 拼图内部装饰 - 对齐目标缺口 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isVerified ? (
              <span className="text-white text-lg">✓</span>
            ) : (
              <div className="w-6 h-6 border-2 border-gray-400/50 rounded-full" />
            )}
          </div>
        </div>
        
        {/* 验证结果提示 */}
        {verifyResult && (
          <div className={`absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium
            ${verifyResult === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          `}>
            {verifyResult === 'success' ? '验证成功' : '验证失败，请重试'}
          </div>
        )}
        
        {/* 刷新按钮 */}
        <button
          onClick={handleRefresh}
          className="absolute top-2 right-2 p-1 rounded bg-black/20 hover:bg-black/30 transition-colors"
          title="刷新验证码"
        >
          <RefreshCw className="w-4 h-4 text-white" />
        </button>
      </div>
      
      {/* 滑动提示 */}
      <div className="mt-3 relative h-10 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        {/* 背景文字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm ${isVerified ? 'text-green-600' : 'text-gray-400'}`}>
            {isVerified ? '验证成功' : '向右滑动完成验证'}
          </span>
        </div>
        
        {/* 进度条 */}
        <div 
          className={`absolute left-0 top-0 h-full transition-all duration-100
            ${isVerified ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}
          `}
          style={{ width: `${(sliderValue / (containerRef.current?.offsetWidth || 280)) * 100}%` }}
        />
        
        {/* 滑块按钮 */}
        <div 
          className={`absolute top-0 left-0 w-10 h-10 rounded-full flex items-center justify-center
            bg-white shadow-md cursor-grab active:cursor-grabbing
            ${isDragging ? 'shadow-lg' : ''}
            ${isVerified ? 'bg-green-500 text-white' : ''}
          `}
          style={{ 
            transform: `translateX(${sliderValue}px)`,
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {isVerified ? (
            <span className="text-lg">✓</span>
          ) : (
            <span className="text-gray-400">→</span>
          )}
        </div>
      </div>
    </div>
  );
}
