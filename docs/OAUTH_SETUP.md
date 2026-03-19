# OAuth 登录配置说明

本项目支持 Google 和 GitHub 第三方账号登录。要启用这些功能，需要配置相应的 OAuth 应用并设置环境变量。

## Google OAuth 配置

### 1. 创建 Google OAuth 应用

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 进入 "API 和服务" > "凭据"
4. 点击 "创建凭据" > "OAuth 客户端 ID"
5. 应用类型选择 "Web 应用"
6. 配置授权重定向 URI：
   - 开发环境：`http://localhost:5000/api/auth/oauth/google/callback`
   - 生产环境：`https://你的域名/api/auth/oauth/google/callback`
7. 记录 **客户端 ID** 和 **客户端密钥**

### 2. 配置环境变量

```bash
# Google OAuth
GOOGLE_CLIENT_ID=你的客户端ID
GOOGLE_CLIENT_SECRET=你的客户端密钥
```

## GitHub OAuth 配置

### 1. 创建 GitHub OAuth 应用

1. 访问 [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - Application name：应用名称（如：占卜问卦）
   - Homepage URL：应用首页 URL
     - 开发环境：`http://localhost:5000`
     - 生产环境：`https://你的域名`
   - Authorization callback URL：
     - 开发环境：`http://localhost:5000/api/auth/oauth/github/callback`
     - 生产环境：`https://你的域名/api/auth/oauth/github/callback`
4. 创建后，记录 **Client ID**
5. 点击 "Generate a new client secret" 生成密钥，记录 **Client Secret**

### 2. 配置环境变量

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=你的客户端ID
GITHUB_CLIENT_SECRET=你的客户端密钥
```

## 环境变量配置方式

### 开发环境

在项目根目录创建 `.env.local` 文件：

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 生产环境

在生产环境中，通过平台的环境变量设置功能配置：

- **Vercel**：Settings > Environment Variables
- **Docker**：使用 `-e` 参数或 `.env` 文件
- **其他平台**：参考平台文档

## 功能说明

### 用户绑定逻辑

- 如果用户通过 OAuth 登录，系统会自动创建账号
- 如果用户已有邮箱账号，且 OAuth 返回的邮箱匹配，则自动绑定
- 用户头像会自动从第三方平台获取

### 登录流程

1. 用户点击 "使用 Google 登录" 或 "使用 GitHub 登录"
2. 跳转到第三方授权页面
3. 用户授权后，重定向回应用
4. 系统自动创建/更新用户信息并登录

## 安全注意事项

1. **State 参数**：系统使用 state 参数防止 CSRF 攻击
2. **密钥保护**：客户端密钥不要暴露在前端代码中
3. **HTTPS**：生产环境必须使用 HTTPS
4. **回调 URL**：确保回调 URL 配置正确，避免安全风险
