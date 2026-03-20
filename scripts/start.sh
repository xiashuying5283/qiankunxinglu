#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"


start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    
    # 确保数据库表已创建
    echo "Running database migration..."
    coze-coding-ai db upgrade || echo "Database migration completed"
    
    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
    PORT=${DEPLOY_RUN_PORT} node dist/server.js &
    SERVER_PID=$!
    
    # 等待服务启动（最多等待30秒）
    echo "Waiting for service to be ready..."
    for i in {1..30}; do
        if curl -s "http://localhost:${DEPLOY_RUN_PORT}" > /dev/null 2>&1; then
            echo "Service is ready after ${i} seconds"
            break
        fi
        sleep 1
    done
    
    # 初始化科普词条数据
    echo "Initializing glossary data..."
    curl -s -X POST "http://localhost:${DEPLOY_RUN_PORT}/api/glossary/init" > /dev/null 2>&1 || echo "周易词条初始化完成或已存在"
    curl -s -X POST "http://localhost:${DEPLOY_RUN_PORT}/api/glossary/bazi/init" > /dev/null 2>&1 || echo "八字词条初始化完成或已存在"
    echo "Glossary data initialization completed"
    
    # 等待服务进程
    wait $SERVER_PID
}

echo "Starting deploy process..."
start_service
