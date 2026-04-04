# 云服务器部署指南

## 目录

1. [服务器要求](#服务器要求)
2. [安装 Docker](#安装-docker)
3. [上传代码](#上传代码)
4. [配置环境变量](#配置环境变量)
5. [部署应用](#部署应用)
6. [配置域名和 HTTPS](#配置域名和-https)
7. [常用命令](#常用命令)

---

## 服务器要求

| 配置项 | 最低要求 | 推荐配置 |
|--------|----------|----------|
| CPU | 2 核 | 4 核 |
| 内存 | 4 GB | 8 GB |
| 磁盘 | 20 GB | 50 GB |
| 系统 | Ubuntu 20.04+ / Debian 10+ | Ubuntu 22.04 |

---

## 安装 Docker

### 方式一：使用脚本安装（推荐）

```bash
# 1. 下载脚本
curl -O https://raw.githubusercontent.com/your-repo/main/deploy/install-docker.sh

# 2. 添加执行权限
chmod +x install-docker.sh

# 3. 执行安装
./install-docker.sh

# 4. 使 docker 组生效
newgrp docker
```

### 方式二：手动安装

```bash
# 更新软件包
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt install -y curl wget gnupg lsb-release

# 添加 Docker 源
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list

# 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 安装 docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户加入 docker 组
sudo usermod -aG docker $USER
newgrp docker

# 验证安装
docker --version
docker-compose --version
```

---

## 上传代码

### 方式一：Git 克隆

```bash
# 安装 git
sudo apt install -y git

# 克隆代码
git clone https://github.com/your-username/qiankunxinglu.git
cd qiankunxinglu
```

### 方式二：SCP 上传

在本地电脑执行：

```bash
# 打包代码（排除 node_modules）
tar --exclude='node_modules' --exclude='.next' --exclude='.git' -czvf qiankunxinglu.tar.gz .

# 上传到服务器
scp qiankunxinglu.tar.gz user@your-server:/home/user/

# SSH 到服务器解压
ssh user@your-server
mkdir -p qiankunxinglu && tar -xzvf qiankunxinglu.tar.gz -C qiankunxinglu
cd qiankunxinglu
```

### 方式三：使用 rsync（推荐）

```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' ./ user@your-server:/home/user/qiankunxinglu/
```

---

## 配置环境变量

### 必需配置项

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `NEXT_PUBLIC_SITE_URL` | 应用域名 | `https://your-domain.com` |
| `SUPABASE_URL` | Supabase 项目 URL | [Supabase 控制台](https://supabase.com) > 项目设置 > API |
| `SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 同上 |
| `OPENAI_API_KEY` | OpenAI API 密钥 | [OpenAI 平台](https://platform.openai.com) > API Keys |
| `JWT_SECRET` | JWT 加密密钥 | 随机字符串（建议 32 位以上） |

### 可选配置项

| 变量名 | 说明 |
|--------|------|
| `OPENAI_BASE_URL` | API 地址（默认 OpenAI，可用兼容接口） |
| `OPENAI_MODEL` | 模型名称（默认 gpt-4o-mini） |
| `GITHUB_CLIENT_ID` | GitHub OAuth 登录 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 登录 |
| `ADMIN_USER_IDS` | 管理员用户 ID（逗号分隔） |
| `ICP_BEIAN` | ICP 备案号 |

### 方式一：交互式配置

```bash
chmod +x deploy/setup-env.sh
./deploy/setup-env.sh
```

### 方式二：手动创建

```bash
# 创建配置文件
nano .env
```

写入以下内容：

```env
# 应用域名
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Supabase 数据库（必需）
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI API（必需）
OPENAI_API_KEY=sk-xxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# JWT 密钥（必需）
JWT_SECRET=your-random-secret-key-at-least-32-chars

# GitHub OAuth（可选）
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret

# 管理员用户 ID（可选）
# ADMIN_USER_IDS=user-id-1,user-id-2

# ICP 备案（可选）
# ICP_BEIAN=京ICP备XXXXXXXX号
```

---

## 部署应用

### 一键部署

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

### 手动部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 配置域名和 HTTPS

### 前提条件

- 域名已解析到服务器 IP
- 应用已启动（端口 5000）

### 使用脚本配置

```bash
chmod +x deploy/setup-nginx.sh
./deploy/setup-nginx.sh
```

### 手动配置

```bash
# 安装 Nginx
sudo apt install -y nginx

# 创建配置
sudo nano /etc/nginx/sites-available/divination
```

写入：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/divination /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 配置 HTTPS
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 常用命令

```bash
# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 重新构建部署
docker-compose up -d --build

# 进入容器
docker exec -it divination-app sh

# 查看容器状态
docker-compose ps

# 查看资源使用
docker stats divination-app
```

---

## 故障排查

### 1. 容器无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查环境变量
docker-compose config
```

### 2. 数据库连接失败

- 检查 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 是否正确
- 确认 Supabase 项目未暂停
- 检查防火墙是否允许出站连接

### 3. AI 功能不工作

- 检查 `OPENAI_API_KEY` 是否有效
- 如果使用国内服务器，可能需要配置 `OPENAI_BASE_URL` 为兼容接口

### 4. OAuth 登录失败

- 检查 GitHub OAuth 应用的回调地址是否正确
- 回调地址格式：`https://your-domain.com/api/auth/oauth/github/callback`

---

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建部署
docker-compose up -d --build
```
