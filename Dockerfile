# 构建阶段
FROM node:20-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 配置 npm 镜像源
RUN pnpm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# 复制源码
COPY . .

# 构建
RUN pnpm build

# 运行阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production
ENV PORT=5000

# 安装 pnpm
RUN npm install -g pnpm

# 配置 npm 镜像源
RUN pnpm config set registry https://registry.npmmirror.com

# 复制必要文件
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/dist ./dist

# 只安装生产依赖
RUN pnpm install --prod

# 暴露端口
EXPOSE 5000

# 启动
CMD ["node", "dist/server.js"]
