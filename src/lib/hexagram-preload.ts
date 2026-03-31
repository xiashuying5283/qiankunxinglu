/**
 * 卦象数据预加载服务
 * 在应用启动时预加载卦象数据，避免首次使用时的等待
 */

// 类型定义
export interface LineText {
  text: string;
  meaning: string;
}

export interface HexagramData {
  number: number;
  name: string;
  symbol: string;
  upperTrigram: string;
  lowerTrigram: string;
  binary: string;
  judgement: string;
  judgementMeaning: string;
  image: string;
  imageMeaning: string;
  lines: LineText[];
}

export interface TrigramData {
  name: string;
  symbol: string;
  nature: string;
  attribute: string;
}

// 数据状态
type DataState = {
  hexagrams: HexagramData[];
  trigrams: TrigramData[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  needsLogin: boolean; // 是否需要登录
};

// 初始状态
const initialState: DataState = {
  hexagrams: [],
  trigrams: [],
  isLoading: false,
  isInitialized: false,
  error: null,
  needsLogin: false,
};

// 全局状态（单例）
let dataState: DataState = { ...initialState };
let loadPromise: Promise<void> | null = null;
const listeners: Set<() => void> = new Set();

// 通知所有监听器
function notifyListeners() {
  listeners.forEach(listener => listener());
}

// 获取当前状态
export function getHexagramState(): DataState {
  return { ...dataState };
}

// 订阅状态变化
export function subscribeHexagramState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// 加载数据
async function fetchData(): Promise<void> {
  // 如果已经在加载中，返回已有的 Promise
  if (loadPromise) {
    return loadPromise;
  }

  // 如果已经初始化成功，直接返回
  if (dataState.isInitialized && dataState.hexagrams.length > 0) {
    return;
  }

  loadPromise = (async () => {
    try {
      dataState = { ...dataState, isLoading: true, error: null, needsLogin: false };
      notifyListeners();

      const response = await fetch('/api/hexagrams');
      
      // 检查是否需要登录（401 错误）
      if (response.status === 401) {
        dataState = {
          ...dataState,
          isLoading: false,
          needsLogin: true,
          error: '暂未登录',
        };
        notifyListeners();
        return;
      }
      
      const data = await response.json();

      if (data.needsInit) {
        // 需要初始化
        const initResponse = await fetch('/api/hexagrams/init', { method: 'POST' });
        
        // 检查初始化是否需要登录
        if (initResponse.status === 401) {
          dataState = {
            ...dataState,
            isLoading: false,
            needsLogin: true,
            error: '暂未登录',
          };
          notifyListeners();
          return;
        }
        
        const initData = await initResponse.json();

        if (initData.success) {
          const retryResponse = await fetch('/api/hexagrams');
          const retryData = await retryResponse.json();
          
          dataState = {
            hexagrams: retryData.hexagrams || [],
            trigrams: retryData.trigrams || [],
            isLoading: false,
            isInitialized: true,
            error: null,
            needsLogin: false,
          };
        } else {
          dataState = {
            ...dataState,
            isLoading: false,
            error: '数据初始化失败',
            needsLogin: false,
          };
        }
      } else if (data.hexagrams && data.hexagrams.length > 0) {
        dataState = {
          hexagrams: data.hexagrams,
          trigrams: data.trigrams || [],
          isLoading: false,
          isInitialized: true,
          error: null,
          needsLogin: false,
        };
      } else {
        dataState = {
          ...dataState,
          isLoading: false,
          error: data.error || '加载数据失败',
          needsLogin: false,
        };
      }
    } catch (err) {
      console.error('预加载卦象数据失败:', err);
      dataState = {
        ...dataState,
        isLoading: false,
        error: '加载数据失败',
        needsLogin: false,
      };
    } finally {
      loadPromise = null;
      notifyListeners();
    }
  })();

  return loadPromise;
}

// 预加载数据（在应用启动时调用）
export function preloadHexagramData(): void {
  // 只在客户端执行
  if (typeof window === 'undefined') return;
  
  // 如果已经初始化或正在加载，不重复执行
  if (dataState.isInitialized || dataState.isLoading) return;
  
  fetchData();
}

// 确保数据已加载（在页面使用时调用）
export async function ensureHexagramDataLoaded(): Promise<DataState> {
  await fetchData();
  return getHexagramState();
}

// 强制刷新数据
export async function refreshHexagramData(): Promise<DataState> {
  dataState = { ...initialState };
  loadPromise = null;
  await fetchData();
  return getHexagramState();
}

// React Hook：使用卦象数据
export function useHexagramData() {
  const [state, setState] = useState<DataState>(getHexagramState);

  useEffect(() => {
    // 订阅状态变化
    const unsubscribe = subscribeHexagramState(() => {
      setState(getHexagramState());
    });

    // 确保数据加载
    ensureHexagramDataLoaded();

    return unsubscribe;
  }, []);

  return {
    ...state,
    refresh: refreshHexagramData,
  };
}

// 为了避免循环依赖，需要从 react 导入
import { useState, useEffect } from 'react';
