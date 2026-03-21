# 乾坤星路 - 部署指南

## 服务器要求

- **系统**：CentOS 7.6+
- **内存**：至少 2GB（推荐 4GB）
- **硬盘**：至少 10GB

---

## 快速部署（三步搞定）

### 第一步：上传并执行初始化脚本

```bash
# 登录服务器后，创建脚本文件
vim setup-server.sh

# 粘贴 setup-server.sh 的内容，保存退出

# 添加执行权限
chmod +x setup-server.sh

# 执行（需要 root 权限）
./setup-server.sh
```

### 第二步：配置环境变量

```bash
# 进入项目目录
cd /var/www/qiankunxinglu

# 复制模板
cp .env.local.example .env.local

# 编辑配置
vim .env.local
```

**必须填写的配置：**

```env
# Supabase 配置（从你的 Supabase 项目获取）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT 密钥（随机生成一个长字符串，至少32位）
JWT_SECRET=your-random-secret-key-at-least-32-characters-long

# 你的服务器地址
COZE_PROJECT_DOMAIN_DEFAULT=http://你的服务器IP
```

### 第三步：执行部署

```bash
# 执行部署脚本
./deploy.sh
```

---

## 部署完成后

### 访问网站

打开浏览器访问：`http://你的服务器IP`

### 常用命令

```bash
# 查看服务状态
pm2 status

# 查看实时日志
pm2 logs qiankunxinglu

# 重启服务
pm2 restart qiankunxinglu

# 停止服务
pm2 stop qiankunxinglu
```

### 更新代码

```bash
cd /var/www/qiankunxinglu
./deploy.sh
```

---

## 配置域名（可选）

### 1. 域名解析

在域名服务商处添加 A 记录，指向服务器 IP。

### 2. 修改 Nginx 配置

```bash
vim /etc/nginx/conf.d/qiankunxinglu.conf
```

将 `server_name _;` 改为你的域名：

```nginx
server_name yourdomain.com www.yourdomain.com;
```

重启 Nginx：

```bash
nginx -t
systemctl restart nginx
```

### 3. 配置 HTTPS（推荐）

```bash
# 安装 certbot
yum install -y certbot python2-certbot-nginx

# 申请证书
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
systemctl enable certbot-renew.timer
```

---

## 故障排查

### 端口被占用

```bash
# 查看 5000 端口占用
netstat -tlnp | grep 5000

# 杀掉占用进程
kill -9 <PID>
```

### 内存不足

```bash
# 查看内存
free -m

# 添加 swap（如果内存小于 2GB）
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
```

### 查看错误日志

```bash
# 应用日志
pm2 logs qiankunxinglu --lines 100

# Nginx 日志
tail -100 /var/log/nginx/qiankunxinglu.error.log
```

---

## 项目结构

```
/var/www/qiankunxinglu/
├── .env.local          # 环境变量（需要配置）
├── deploy.sh           # 部署脚本
├── dist/               # 构建产物
├── src/                # 源代码
└── ...
```

---

## 技术栈

- Next.js 16
- React 19
- TypeScript 5
- Supabase（数据库）
- PM2（进程管理）
- Nginx（反向代理）
