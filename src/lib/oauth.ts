/**
 * OAuth 配置和工具函数
 * 支持 Google 和 GitHub 第三方登录
 */

// OAuth 提供商类型
export type OAuthProvider = 'google' | 'github';

// OAuth 配置接口
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
}

// OAuth 用户信息接口
export interface OAuthUserInfo {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  provider: OAuthProvider;
}

// 获取域名
const getBaseUrl = (): string => {
  return process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
};

// Google OAuth 配置
export const getGoogleConfig = (): OAuthConfig => ({
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: `${getBaseUrl()}/api/auth/oauth/google/callback`,
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  scope: 'openid email profile',
});

// GitHub OAuth 配置
export const getGitHubConfig = (): OAuthConfig => ({
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  redirectUri: `${getBaseUrl()}/api/auth/oauth/github/callback`,
  authorizationUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  userInfoUrl: 'https://api.github.com/user',
  scope: 'user:email',
});

// 获取 OAuth 配置
export const getOAuthConfig = (provider: OAuthProvider): OAuthConfig => {
  switch (provider) {
    case 'google':
      return getGoogleConfig();
    case 'github':
      return getGitHubConfig();
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
};

// 检查 OAuth 是否已配置
export const isOAuthConfigured = (provider: OAuthProvider): boolean => {
  const config = getOAuthConfig(provider);
  return !!(config.clientId && config.clientSecret);
};

// 生成 state 参数（用于防止 CSRF 攻击）
export function generateOAuthState(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// 生成授权 URL
export function generateAuthorizationUrl(provider: OAuthProvider, state: string): string {
  const config = getOAuthConfig(provider);
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

// 通过授权码获取访问令牌
export async function getAccessToken(
  provider: OAuthProvider,
  code: string,
  customRedirectUri?: string
): Promise<string | null> {
  const config = getOAuthConfig(provider);
  const redirectUri = customRedirectUri || config.redirectUri;

  console.log('[OAuth] Getting access token:', {
    provider,
    redirectUri,
    tokenUrl: config.tokenUrl,
    hasCode: !!code
  });

  try {
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OAuth] Failed to get access token:', {
        status: response.status,
        error: errorText
      });
      return null;
    }

    const data = await response.json();
    console.log('[OAuth] Access token obtained successfully');
    return data.access_token || data.access_token;
  } catch (error) {
    // 详细错误日志
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[OAuth] Request timeout for', provider);
      } else {
        console.error('[OAuth] Fetch error for', provider, ':', {
          message: error.message,
          name: error.name,
          cause: error.cause,
        });
      }
    } else {
      console.error('[OAuth] Unknown error:', error);
    }
    return null;
  }
}

// 获取 Google 用户信息
async function getGoogleUserInfo(accessToken: string): Promise<OAuthUserInfo | null> {
  try {
    console.log('[OAuth] Fetching Google user info...');
    
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('[OAuth] Google user info request failed:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('[OAuth] Google user info obtained:', { id: data.id, email: data.email });
    
    return {
      id: data.id,
      email: data.email || null,
      name: data.name || null,
      avatar: data.picture || null,
      provider: 'google',
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('[OAuth] Failed to get Google user info:', {
        message: error.message,
        name: error.name,
      });
    } else {
      console.error('[OAuth] Failed to get Google user info:', error);
    }
    return null;
  }
}

// 获取 GitHub 用户信息
async function getGitHubUserInfo(accessToken: string): Promise<OAuthUserInfo | null> {
  try {
    console.log('[OAuth] Fetching GitHub user info...');
    
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // 获取用户基本信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      signal: controller.signal,
    });

    if (!userResponse.ok) {
      console.error('[OAuth] GitHub user info request failed:', userResponse.status);
      return null;
    }

    const userData = await userResponse.json();

    // 如果用户没有公开邮箱，需要单独获取邮箱
    let email = userData.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        // 优先使用主邮箱和已验证邮箱
        const primaryEmail = emails.find((e: { primary: boolean; verified: boolean }) => e.primary && e.verified);
        email = primaryEmail?.email || emails[0]?.email;
      }
    }

    console.log('[OAuth] GitHub user info obtained:', { id: userData.id, login: userData.login });

    return {
      id: String(userData.id),
      email: email || null,
      name: userData.name || userData.login || null,
      avatar: userData.avatar_url || null,
      provider: 'github',
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('[OAuth] Failed to get GitHub user info:', {
        message: error.message,
        name: error.name,
      });
    } else {
      console.error('[OAuth] Failed to get GitHub user info:', error);
    }
    return null;
  }
}

// 获取 OAuth 用户信息
export async function getOAuthUserInfo(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthUserInfo | null> {
  switch (provider) {
    case 'google':
      return getGoogleUserInfo(accessToken);
    case 'github':
      return getGitHubUserInfo(accessToken);
    default:
      return null;
  }
}
