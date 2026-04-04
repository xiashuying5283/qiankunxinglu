#!/bin/bash

# ============================================
# 一键部署脚本
# ============================================

set -e

echo "============================================"
echo "       占卜应用 - 一键部署脚本"
echo "============================================"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 未检测到 Docker，请先运行 install-docker.sh 安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ 未检测到 docker-compose，请先运行 install-docker.sh 安装"
    exit 1
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 配置文件"
    echo "请先运行 setup-env.sh 配置环境变量"
    echo ""
    read -p "是否现在配置？(y/N): " setup_now
    if [ "$setup_now" = "y" ] || [ "$setup_now" = "Y" ]; then
        ./setup-env.sh
    else
        exit 1
    fi
fi

# 确认部署
echo "即将执行以下操作："
echo "  1. 构建 Docker 镜像"
echo "  2. 启动容器服务"
echo ""
read -p "确认部署？(y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "取消部署"
    exit 0
fi

echo ""
echo "[1/3] 停止旧容器..."
docker-compose down 2>/dev/null || true

echo ""
echo "[2/3] 构建镜像（首次可能需要几分钟）..."
docker-compose build

echo ""
echo "[3/3] 启动服务..."
docker-compose up -d

echo ""
echo "等待服务启动..."
sleep 5

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "============================================"
    echo "✅ 部署成功！"
    echo "============================================"
    echo ""
    echo "应用已在端口 5000 运行"
    echo ""
    echo "常用命令:"
    echo "  查看日志:   docker-compose logs -f"
    echo "  重启服务:   docker-compose restart"
    echo "  停止服务:   docker-compose down"
    echo "  重新部署:   docker-compose up -d --build"
    echo ""
    
    # 提示配置 Nginx
    if command -v nginx &> /dev/null; then
        echo "检测到已安装 Nginx，是否配置反向代理？"
        read -p "(y/N): " setup_nginx
        if [ "$setup_nginx" = "y" ] || [ "$setup_nginx" = "Y" ]; then
            ./setup-nginx.sh
        fi
    fi
else
    echo ""
    echo "============================================"
    echo "❌ 部署失败"
    echo "============================================"
    echo ""
    echo "请检查日志:"
    echo "  docker-compose logs"
fi
