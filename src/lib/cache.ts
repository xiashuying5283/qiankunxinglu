/**
 * 内存缓存工具
 * 用于缓存数据库查询结果，减少首次加载时间
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // 缓存有效期（毫秒）
}

// 内存缓存存储
const cache = new Map<string, CacheItem<unknown>>();

/**
 * 获取缓存数据
 */
export function getCache<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  
  // 检查是否过期
  if (Date.now() - item.timestamp > item.ttl) {
    cache.delete(key);
    return null;
  }
  
  return item.data as T;
}

/**
 * 设置缓存数据
 * @param key 缓存键
 * @param data 缓存数据
 * @param ttl 缓存有效期（毫秒），默认 5 分钟
 */
export function setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * 清除指定缓存
 */
export function clearCache(key: string): void {
  cache.delete(key);
}

/**
 * 清除所有缓存
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * 带缓存的异步数据获取
 * 如果缓存存在且未过期，返回缓存数据；否则执行 fetcher 函数获取数据并缓存
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  // 先尝试从缓存获取
  const cached = getCache<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  // 执行获取函数
  const data = await fetcher();
  
  // 存入缓存
  setCache(key, data, ttl);
  
  return data;
}
