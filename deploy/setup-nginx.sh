#!/bin/bash

# ============================================
# Nginx 反向代理配置脚本
# ============================================

set -e

echo "============================================"
echo "配置 Nginx 反向代理"
echo "============================================"
echo ""

# 检查 Nginx
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# 获取域名
if [ -f ".env" ]; then
    DOMAIN=$(grep NEXT_PUBLIC_SITE_URL .env | cut -d'=' -f2 | sed 's|https://||' | sed 's|http://||')
fi

if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "localhost:5000" ]; then
    echo "请输入你的域名（如：divination.example.com）"
    read -p "域名: " DOMAIN
fi

if [ -z "$DOMAIN" ]; then
    echo "❌ 域名不能为空"
    exit 1
fi

# 创建 Nginx 配置
CONFIG_FILE="/etc/nginx/sites-available/divination"

echo "创建 Nginx 配置..."
sudo tee $CONFIG_FILE > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # 反向代理到应用
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 启用配置
echo "启用配置..."
sudo ln -sf $CONFIG_FILE /etc/nginx/sites-enabled/

# 测试配置
echo "测试 Nginx 配置..."
sudo nginx -t

# 重启 Nginx
echo "重启 Nginx..."
sudo systemctl restart nginx

echo ""
echo "============================================"
echo "✅ Nginx 配置完成！"
echo "============================================"
echo ""
echo "你的应用现在可以通过 http://$DOMAIN 访问"
echo ""

# 询问是否配置 HTTPS
echo "是否配置 HTTPS 证书？(推荐)"
read -p "(y/N): " setup_ssl

if [ "$setup_ssl" = "y" ] || [ "$setup_ssl" = "Y" ]; then
    echo ""
    echo "安装 Certbot..."
    sudo apt-get install -y certbot python3-certbot-nginx
    
    echo ""
    echo "申请 SSL 证书..."
    sudo certbot --nginx -d $DOMAIN
    
    echo ""
    echo "✅ HTTPS 配置完成！"
    echo "你的应用现在可以通过 https://$DOMAIN 访问"
fi
