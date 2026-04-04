/**
 * ID 混淆工具
 * 用于将数字ID转换为不可猜测的短字符串
 * 使用简单的加密算法：Base62编码 + 位置交换
 */

// Base62 字符集（数字+大小写字母）
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = CHARS.length;

// 混淆密钥（可以修改）
const SECRET_KEY = 'divination-books-2024';

/**
 * 简单哈希函数
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * 加密 ID（数字 -> 混淆字符串）
 * @param id 原始数字ID
 * @returns 混淆后的字符串
 */
export function encodeId(id: number): string {
  if (id <= 0) return '';
  
  // 添加混淆因子
  const hash = simpleHash(SECRET_KEY);
  const obfuscated = id ^ (hash % 1000000);
  
  // 转换为 Base62
  let result = '';
  let num = obfuscated;
  while (num > 0) {
    result = CHARS[num % BASE] + result;
    num = Math.floor(num / BASE);
  }
  
  // 添加校验位
  const checksum = CHARS[(id * 7 + 3) % BASE];
  
  return result + checksum;
}

/**
 * 解密 ID（混淆字符串 -> 数字）
 * @param encoded 混淆后的字符串
 * @returns 原始数字ID，无效返回 null
 */
export function decodeId(encoded: string): number | null {
  if (!encoded || encoded.length < 2) return null;
  
  try {
    // 分离校验位
    const checksum = encoded.slice(-1);
    const base62Part = encoded.slice(0, -1);
    
    // 从 Base62 转换回数字
    let num = 0;
    for (let i = 0; i < base62Part.length; i++) {
      const char = base62Part[i];
      const idx = CHARS.indexOf(char);
      if (idx === -1) return null;
      num = num * BASE + idx;
    }
    
    // 移除混淆因子
    const hash = simpleHash(SECRET_KEY);
    const id = num ^ (hash % 1000000);
    
    // 验证校验位
    const expectedChecksum = CHARS[(id * 7 + 3) % BASE];
    if (checksum !== expectedChecksum) return null;
    
    return id > 0 ? id : null;
  } catch {
    return null;
  }
}

/**
 * 批量加密 ID
 */
export function encodeIds(ids: number[]): string[] {
  return ids.map(encodeId);
}

/**
 * 批量解密 ID
 */
export function decodeIds(encodedIds: string[]): (number | null)[] {
  return encodedIds.map(decodeId);
}

/**
 * 检查是否为有效的混淆ID格式
 */
export function isValidEncodedId(str: string): boolean {
  if (!str || str.length < 2) return false;
  
  // 检查是否只包含 Base62 字符
  for (let i = 0; i < str.length; i++) {
    if (!CHARS.includes(str[i])) return false;
  }
  
  // 尝试解码验证
  return decodeId(str) !== null;
}
