
# --------------------- 第一阶段：构建阶段 ---------------------
# 使用 Node.js 官方镜像（slim 版本减小体积）
FROM 192.168.0.220:8443/library/node:20-slim AS builder

# 设置淘宝 NPM 镜像（加速安装）

RUN npm install -g cnpm  --registry=https://registry.npmmirror.com

# 设置工作目录
WORKDIR /app

# 优先复制依赖文件（利用 Docker 缓存优化构建速度）
COPY package*.json ./

# 安装依赖（生产依赖 + 开发依赖）
RUN cnpm install 

# 复制源码并构建
COPY . .
RUN cnpm run build:pc # 假设你的项目构建命令是 "npm run build:pc"

# --------------------- 第二阶段：生产镜像 ---------------------
# 使用官方 Nginx Alpine 镜像（极简体积）
FROM nginx:1.25-alpine

# 删除默认的 Nginx 配置
RUN rm -rf /etc/nginx/conf.d/default.conf

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/

# 从构建阶段复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx（非后台模式，保持容器运行）
CMD ["nginx", "-g", "daemon off;"]