#!/bin/bash
# ============================================
# 乾坤星路 - 部署脚本
# 使用：chmod +x deploy.sh && ./deploy.sh
# ============================================

set -e

PROJECT_DIR="/var/www/qiankunxinglu"
GIT_REPO="https://github.com/xiashuying5283/qiankunxinglu.git"
BRANCH="main"

echo "=========================================="
echo "  乾坤星路 - 开始部署"
echo "=========================================="

# 如果不在项目目录，先克隆
if [ ! -d "$PROJECT_DIR" ]; then
    echo "项目目录不存在，开始克隆..."
    mkdir -p $PROJECT_DIR
    git clone -b $BRANCH $GIT_REPO $PROJECT_DIR
fi

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
    echo "  cp .env.local.example .env.local"
    echo "  vim .env.local"
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
npx drizzle-kit push --force || echo "数据库同步完成"

# 启动新进程
PORT=5000 pm2 start dist/server.js --name qiankunxinglu

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
