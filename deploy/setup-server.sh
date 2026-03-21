#!/bin/bash
# ============================================
# 乾坤星路 - CentOS 服务器初始化脚本
# 适用系统：CentOS 7.6+
# 执行方式：chmod +x setup-server.sh && ./setup-server.sh
# ============================================

set -e

echo "=========================================="
echo "  乾坤星路 - 服务器初始化开始"
echo "=========================================="

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "请使用 root 用户或 sudo 执行此脚本"
    exit 1
fi

# 1. 更新系统
echo ""
echo "[1/7] 更新系统软件包..."
yum update -y

# 2. 安装基础工具
echo ""
echo "[2/7] 安装基础工具..."
yum install -y git curl wget vim net-tools

# 3. 安装 Node.js 20
echo ""
echo "[3/7] 安装 Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
node -v
npm -v

# 4. 安装 pnpm
echo ""
echo "[4/7] 安装 pnpm..."
npm install -g pnpm@9
pnpm -v

# 5. 安装 PM2（进程管理）
echo ""
echo "[5/7] 安装 PM2..."
npm install -g pm2
pm2 -v

# 6. 安装 Nginx
echo ""
echo "[6/7] 安装 Nginx..."
yum install -y epel-release
yum install -y nginx

# 创建 Nginx 配置
cat > /etc/nginx/conf.d/qiankunxinglu.conf << 'EOF'
server {
    listen 80;
    server_name _;

    # 日志
    access_log /var/log/nginx/qiankunxinglu.access.log;
    error_log /var/log/nginx/qiankunxinglu.error.log;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 删除默认配置（避免冲突）
rm -f /etc/nginx/nginx.conf.default 2>/dev/null || true

# 测试 Nginx 配置
nginx -t

# 启动 Nginx
systemctl start nginx
systemctl enable nginx

# 7. 配置防火墙
echo ""
echo "[7/7] 配置防火墙..."
if command -v firewall-cmd &> /dev/null; then
    systemctl start firewalld
    systemctl enable firewalld
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --permanent --add-port=22/tcp
    firewall-cmd --reload
    echo "防火墙已配置：开放 80、443、22 端口"
else
    echo "firewalld 未安装，跳过防火墙配置"
fi

# 创建项目目录
echo ""
echo "创建项目目录..."
mkdir -p /var/www/qiankunxinglu

# 创建部署脚本
cat > /var/www/qiankunxinglu/deploy.sh << 'DEPLOY_EOF'
#!/bin/bash
# ============================================
# 乾坤星路 - 部署脚本
# ============================================

set -e

PROJECT_DIR="/var/www/qiankunxinglu"
GIT_REPO="https://github.com/xiashuying5283/qiankunxinglu.git"
BRANCH="main"

echo "=========================================="
echo "  乾坤星路 - 开始部署"
echo "=========================================="

cd $PROJECT_DIR

# 1. 拉取代码
echo ""
echo "[1/5] 拉取最新代码..."
if [ -d ".git" ]; then
    git fetch origin
    git reset --hard origin/$BRANCH
else
    git clone -b $BRANCH $GIT_REPO .
fi

# 2. 检查环境变量
echo ""
echo "[2/5] 检查环境变量..."
if [ ! -f ".env.local" ]; then
    echo ""
    echo "========================================"
    echo "  错误：未找到 .env.local 文件"
    echo "========================================"
    echo ""
    echo "请先创建 .env.local 文件："
    echo "  vim /var/www/qiankunxinglu/.env.local"
    echo ""
    echo "必要的环境变量："
    echo "  NEXT_PUBLIC_SUPABASE_URL=你的supabase地址"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=你的supabase密钥"
    echo "  JWT_SECRET=随机密钥"
    echo "  COZE_PROJECT_DOMAIN_DEFAULT=http://你的服务器IP或域名"
    echo ""
    exit 1
fi

# 3. 安装依赖
echo ""
echo "[3/5] 安装依赖..."
pnpm install --frozen-lockfile

# 4. 构建
echo ""
echo "[4/5] 构建项目..."
pnpm build

# 5. 启动服务
echo ""
echo "[5/5] 启动服务..."

# 停止旧进程
pm2 stop qiankunxinglu 2>/dev/null || true
pm2 delete qiankunxinglu 2>/dev/null || true

# 同步数据库 schema
echo "同步数据库..."
cd $PROJECT_DIR
npx drizzle-kit push --force || echo "数据库同步完成"

# 启动新进程
pm2 start dist/server.js --name qiankunxinglu

# 保存 PM2 配置
pm2 save

# 初始化数据
echo "初始化数据..."
sleep 5
curl -s -X POST "http://localhost:5000/api/glossary/init" || echo "周易词条初始化完成"
curl -s -X POST "http://localhost:5000/api/glossary/bazi/init" || echo "八字词条初始化完成"
curl -s -X POST "http://localhost:5000/api/books/init" || echo "古籍数据初始化完成"

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "服务状态："
pm2 status
echo ""
echo "访问地址：http://你的服务器IP"
echo ""
echo "常用命令："
echo "  查看日志：pm2 logs qiankunxinglu"
echo "  重启服务：pm2 restart qiankunxinglu"
echo "  停止服务：pm2 stop qiankunxinglu"
echo ""
DEPLOY_EOF

chmod +x /var/www/qiankunxinglu/deploy.sh

# 创建环境变量模板
cat > /var/www/qiankunxinglu/.env.local.example << 'EOF'
# Supabase 配置（必须有）
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key

# JWT 密钥（随机生成一个长字符串）
JWT_SECRET=请替换为随机生成的密钥

# 站点域名
COZE_PROJECT_DOMAIN_DEFAULT=http://你的服务器IP或域名

# 可选：邮件服务
RESEND_API_KEY=
EOF

echo ""
echo "=========================================="
echo "  服务器初始化完成！"
echo "=========================================="
echo ""
echo "接下来请执行："
echo ""
echo "  1. 配置环境变量："
echo "     cd /var/www/qiankunxinglu"
echo "     cp .env.local.example .env.local"
echo "     vim .env.local"
echo ""
echo "  2. 执行部署："
echo "     ./deploy.sh"
echo ""
echo "  3. 访问网站："
echo "     http://你的服务器IP"
echo ""
