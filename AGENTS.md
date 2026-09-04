# 易学占卜平台 - AGENTS.md

## 项目概览

基于传统易学智慧的在线占卜平台，提供多种占卜方式、历史记录管理、科普词典、古籍阅读功能和游戏化成长体系。

### 技术栈

- **框架**: Next.js 16 (App Router)
- **核心**: React 19
- **语言**: TypeScript 5
- **数据库**: PostgreSQL (`pg` 直连)
- **UI组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **农历库**: lunar-javascript
- **ORM**: drizzle-orm
- **繁简转换**: opencc-js

### 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── api/                # API 路由
│   │   ├── game/           # 游戏化系统 API
│   │   │   ├── sign-in/    # 签到相关
│   │   │   │   └── records/route.ts  # 签到记录查询
│   │   │   └── route.ts    # 游戏状态
│   ├── profile/            # 个人中心页面
│   ├── glossary/           # 术语词典
│   ├── books/              # 古籍阅读
│   └── ...
├── components/
│   ├── game/               # 游戏化组件
│   │   ├── SignInDialog.tsx    # 签到对话框
│   │   ├── SignInRecords.tsx   # 签到日历组件
│   │   └── GameStatsPanel.tsx  # 游戏统计面板
│   └── ui/                 # shadcn/ui 组件
├── lib/                    # 工具函数
│   ├── game-service.ts     # 游戏化服务
│   └── api-auth.ts         # API 鉴权
└── storage/                # 数据存储
    └── database/
        └── pg-client.ts
```

## 核心功能模块

### 1. 签到系统

- **位置**: `src/components/game/SignInDialog.tsx`
- **API**: 
  - `POST /api/game/sign-in` - 执行签到
  - `GET /api/game/sign-in/records?year=YYYY&month=M` - 获取签到记录
- **数据表**: `sign_in_records`
  - 字段: id, user_id, sign_in_date, continuous_days, gua_coins_earned, bonus_awarded, bonus_type, created_at
- **功能特性**:
  - 显示最近7天签到记录
  - 连续签到天数显示
  - 已签到显示绿色勾，未签到显示灰色

### 2. 用户等级系统

- **7个等级**: 入门弟子 → 六爻学徒 → 周易卦师 → 精通大师 → 一代宗师 → 玄学泰斗 → 天人合一
- **经验获取**: 签到(+10)、占卜(+5)、阅读知识(+2)、分享(+20)
- **数据表**: `user_levels`

### 3. 虚拟货币系统

- **货币类型**: 卦币(用于占卜)、灵石(用于高级功能)
- **数据表**: `user_currency`, `currency_transactions`

### 4. API 鉴权

- 支持两种方式:
  1. **登录态**: 前端页面访问
  2. **HMAC签名**: 外部API调用，有效期15分钟

### 5. 游客限制

- 每日限制10次大模型调用（占卜、解梦、八字合婚合计）

## 编码规范

- **风格**: Airbnb
- **包管理器**: pnpm（禁止使用 npm/yarn）
- **端口**: 5000（唯一服务端口）

## 常用命令

```bash
# 安装依赖
pnpm install

# 开发环境
pnpm dev

# 构建检查
npx tsc --noEmit

# 初始化游戏化数据库表
node scripts/init-game-tables.js
```

## 数据库字段命名规范

- 数据库使用 `snake_case`（如 `sign_in_date`, `continuous_days`）
- 前端通过转换函数映射为 `camelCase`

## 关键决策记录

1. **禁用 Google 登录**: 国内服务器无法访问 Google API
2. **OAuth 需手动确认**: 验证通过后显示确认界面
3. **开发环境自动登录**: 自动设置模拟用户
4. **签到记录持久化**: 使用数据库存储，支持历史查询
5. **大模型如实解读**: 要求如实反馈凶卦，不编造虚假正面解读

## 常见问题

### Q: 签到日历不显示？
A: 检查 `sign_in_records` 表是否存在，运行 `node scripts/init-game-tables.js` 初始化

### Q: API 返回 401？
A: 检查用户登录态或 HMAC 签名是否正确

### Q: 等级不更新？
A: 检查 `user_levels` 表和经验值计算逻辑

## 最近更新

- 2026-03: 添加占卜分享图功能，支持周易、塔罗、求签结果分享
- 2026-03: 签到功能简化为最近7天视图
- 2026-03: 术语词典改为字典式列表展示，词条详情独立页面
