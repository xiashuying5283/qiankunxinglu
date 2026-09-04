#!/bin/bash

# ============================================
# 环境变量配置脚本
# ============================================

ENV_FILE=".env"

echo "============================================"
echo "配置生产环境变量"
echo "============================================"
echo ""

# 检查是否已存在 .env 文件
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  发现已存在的 .env 文件"
    read -p "是否覆盖？(y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "取消操作"
        exit 0
    fi
fi

echo "请按提示输入配置信息（直接回车使用默认值）"
echo ""

# 创建 .env 文件
cat > $ENV_FILE << 'EOF'
# ============================================
# 占卜应用生产环境配置
# ============================================

EOF

# 应用域名
echo "-------------------------------------------"
echo "【应用域名】"
echo "请输入你的域名（如：divination.example.com）"
echo "不要带 http:// 或 https://"
read -p "域名: " domain
if [ -z "$domain" ]; then
    domain="localhost:5000"
fi
echo "NEXT_PUBLIC_SITE_URL=https://$domain" >> $ENV_FILE
echo "" >> $ENV_FILE

# PostgreSQL 配置
echo "-------------------------------------------"
echo "【PostgreSQL 数据库配置】（必需）"
echo "请输入 PostgreSQL 连接串，例如："
echo "  postgres://user:password@host:5432/database"
echo ""
read -p "PGDATABASE_URL: " pgdatabase_url

cat >> $ENV_FILE << EOF
# PostgreSQL 数据库配置
PGDATABASE_URL=$pgdatabase_url

EOF

# OpenAI 配置
echo "-------------------------------------------"
echo "【OpenAI API 配置】（AI 功能必需）"
echo "支持火山方舟或兼容 OpenAI 格式的接口"
echo ""
read -p "OPENAI_API_KEY: " openai_key
read -p "OPENAI_BASE_URL (默认: https://ark.cn-beijing.volces.com/api/v3): " openai_base
openai_base=${openai_base:-https://ark.cn-beijing.volces.com/api/v3}
read -p "OPENAI_MODEL (默认: doubao-seed-2-0-pro-260215): " openai_model
openai_model=${openai_model:-doubao-seed-2-0-pro-260215}

cat >> $ENV_FILE << EOF
# OpenAI API 配置
OPENAI_API_KEY=$openai_key
OPENAI_BASE_URL=$openai_base
OPENAI_MODEL=$openai_model

EOF

# JWT Secret
echo "-------------------------------------------"
echo "【JWT 密钥】"
echo "用于用户登录态加密，建议使用随机字符串"
read -p "JWT_SECRET (回车自动生成): " jwt_secret
if [ -z "$jwt_secret" ]; then
    jwt_secret=$(openssl rand -hex 32)
fi
echo "JWT_SECRET=$jwt_secret" >> $ENV_FILE
echo "" >> $ENV_FILE

# OAuth 配置（可选）
echo "-------------------------------------------"
echo "【GitHub OAuth 配置】（可选，回车跳过）"
echo "如需 GitHub 登录，请前往 https://github.com/settings/developers 创建 OAuth App"
echo "回调地址: https://$domain/api/auth/oauth/github/callback"
echo ""
read -p "GITHUB_CLIENT_ID (可选): " github_id
if [ -n "$github_id" ]; then
    read -p "GITHUB_CLIENT_SECRET: " github_secret
    cat >> $ENV_FILE << EOF
# GitHub OAuth 配置
GITHUB_CLIENT_ID=$github_id
GITHUB_CLIENT_SECRET=$github_secret

EOF
fi

# 管理员配置（可选）
echo "-------------------------------------------"
echo "【管理员配置】（可选）"
echo "设置管理员用户 ID（用户注册后从数据库获取）"
read -p "ADMIN_USER_IDS (可选，逗号分隔): " admin_ids
if [ -n "$admin_ids" ]; then
    echo "ADMIN_USER_IDS=$admin_ids" >> $ENV_FILE
    echo "" >> $ENV_FILE
fi

# ICP 备案（可选）
echo "-------------------------------------------"
echo "【ICP 备案】（可选）"
read -p "ICP_BEIAN (可选): " icp
if [ -n "$icp" ]; then
    echo "ICP_BEIAN=$icp" >> $ENV_FILE
fi

echo ""
echo "============================================"
echo "配置完成！"
echo "============================================"
echo ""
echo "配置文件已保存到: $ENV_FILE"
echo ""
echo "内容预览:"
echo "-------------------------------------------"
cat $ENV_FILE
echo "-------------------------------------------"
echo ""
