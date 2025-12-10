# 選民服務管理系統 - Production Dockerfile

# ============ Stage 1: Dependencies ============
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 複製 package files
COPY package.json package-lock.json ./
# 安裝所有依賴（包含 devDependencies）用於 build
RUN npm ci

# ============ Stage 2: Builder ============
FROM node:20-alpine AS builder
WORKDIR /app

# 複製依賴
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 產生 Prisma Client
RUN npx prisma generate

# 建置 Next.js（使用 webpack 避免 Turbopack 問題）
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -- --webpack

# ============ Stage 3: Runner ============
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 建立非 root 用戶
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製必要檔案
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 安裝 curl 用於健康檢查
RUN apk add --no-cache curl

# 建立上傳目錄
RUN mkdir -p uploads && chown -R nextjs:nodejs uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
