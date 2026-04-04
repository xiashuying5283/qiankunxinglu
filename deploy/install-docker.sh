#!/bin/bash

# ============================================
# Docker 安装脚本
# 适用于 Ubuntu 20.04+ / Debian 10+
# ============================================

set -e

echo "============================================"
echo "开始安装 Docker..."
echo "============================================"

# 更新软件包
echo "[1/5] 更新软件包列表..."
sudo apt-get update

# 安装依赖
echo "[2/5] 安装依赖包..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    wget

# 添加 Docker 官方 GPG 密钥
echo "[3/5] 添加 Docker GPG 密钥..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 软件源
echo "[4/5] 添加 Docker 软件源..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
echo "[5/5] 安装 Docker..."
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动 Docker
echo "启动 Docker 服务..."
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户加入 docker 组（免 sudo）
echo "将当前用户加入 docker 组..."
sudo usermod -aG docker $USER

# 安装 docker-compose（独立版本，兼容性更好）
echo "安装 docker-compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
echo ""
echo "============================================"
echo "Docker 安装完成！"
echo "============================================"
echo ""
docker --version
docker-compose --version
echo ""
echo "⚠️  重要提示："
echo "请执行以下命令使 docker 组生效："
echo ""
echo "    newgrp docker"
echo ""
echo "或者重新登录服务器。"
echo ""
