FROM alpine:edge

# 安装最新的 Chromium 及相关依赖
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    npm \
    tor

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV NODE_ENV production
ENV YOUTUBE_VIEWER_FORCE_DEBUG false

# 设置工作目录
WORKDIR /app

# 复制应用文件和依赖
COPY ./core ./core
COPY ./handlers ./handlers
COPY ./helpers ./helpers
COPY ./services ./services
COPY ./utils ./utils
COPY ./index.js .
COPY ./package.json .
COPY ./urls.txt .

# 安装 npm 依赖
RUN npm install

# 启动命令
CMD ["node", "index", "--color=16m"]