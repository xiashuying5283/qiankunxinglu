'use client';

import { useEffect } from 'react';
import { preloadHexagramData } from '@/lib/hexagram-preload';

/**
 * 预加载 Provider
 * 在应用启动时预加载卦象等数据，避免首次使用时的等待
 */
export function PreloadProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 在应用启动时预加载卦象数据
    preloadHexagramData();
  }, []);

  return <>{children}</>;
}
