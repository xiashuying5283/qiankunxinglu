/**
 * API 鉴权配置
 * 定义哪些 API 需要鉴权，哪些可以公开访问
 */

// 不需要鉴权的 API 路径（公开访问）
export const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/guest',
  '/api/auth/oauth/github',
  '/api/auth/oauth/github/callback',
  '/api/auth/oauth/google',
  '/api/auth/oauth/google/callback',
  '/api/auth/oauth/status',
  '/api/api-keys', // API Key 管理使用登录验证
  // 健康检查
  '/api/health',
];

// 检查路径是否需要鉴权
export function requiresAuth(pathname: string): boolean {
  // 精确匹配
  if (PUBLIC_API_PATHS.includes(pathname)) {
    return false;
  }
  
  // API Key 管理 API 使用登录验证而非 API Key
  if (pathname.startsWith('/api/api-keys')) {
    return false;
  }
  
  // 所有其他 /api/* 路径都需要鉴权
  return pathname.startsWith('/api/');
}

// 高消耗 API（调用 LLM，需要更严格的限制）
export const HIGH_COST_API_PATHS = [
  '/api/divination/interpret',
  '/api/dream/interpret',
  '/api/match/interpret',
  '/api/generate-image',
];

// 检查是否是高消耗 API
export function isHighCostApi(pathname: string): boolean {
  return HIGH_COST_API_PATHS.includes(pathname);
}
