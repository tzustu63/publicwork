# 選民服務管理系統 (Constituent CRM)

民代辦公室選民服務與關係管理系統

## 功能特色

- 📋 **選民管理** - 選民資料庫、標籤系統、關係分級 (A/B/C)
- 📝 **案件管理** - 陳情協調、公共建設會勘、法律/行政諮詢追蹤
- 📅 **活動管理** - 紅白帖追蹤、地方活動出席管理
- 💬 **通訊中心** - SMS/LINE 訊息發送、範本管理
- 📊 **分析報表** - 選民統計、案件分析、服務覆蓋率
- 📱 **行動端支援** - PWA 支援，手機可直接拍照上傳

## 技術架構

- **前端**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **後端**: Next.js API Routes
- **資料庫**: PostgreSQL + Prisma ORM
- **認證**: NextAuth.js
- **部署**: Docker + Amazon Lightsail

## 快速開始

### 前置需求

- Node.js 20+
- Docker & Docker Compose

### 安裝步驟

```bash
# 1. 複製專案
git clone https://github.com/your-repo/constituent-crm.git
cd constituent-crm

# 2. 安裝依賴
npm install

# 3. 設定環境變數
cp .env.example .env
# 編輯 .env 設定資料庫連線等

# 4. 啟動資料庫 (Docker)
npm run docker:dev

# 5. 執行資料庫遷移與種子資料
npx prisma migrate dev
npx prisma db seed

# 6. 啟動開發伺服器
npm run dev
```

### 測試帳號

- 管理員：admin@example.com / admin123
- 助理：staff@example.com / admin123

## 專案結構

```
constituent-crm/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # 需登入的頁面
│   │   ├── api/                # API Routes
│   │   └── login/              # 登入頁
│   ├── components/             # React 元件
│   │   ├── ui/                 # shadcn/ui 元件
│   │   └── layout/             # 版面元件
│   ├── lib/                    # 共用函式庫
│   └── types/                  # TypeScript 型別
├── prisma/
│   ├── schema.prisma           # 資料庫 Schema
│   └── seed.ts                 # 種子資料
├── public/                     # 靜態資源
├── docker-compose.yml          # 生產環境
├── docker-compose.dev.yml      # 開發環境
└── Dockerfile                  # Docker 映像檔
```

## 部署

### 使用 Docker Compose

```bash
# 建置並啟動
docker compose up -d --build

# 執行資料庫遷移
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

### GitHub Actions CI/CD

專案已設定 GitHub Actions，推送到 main 分支會自動：
1. 執行 lint 和 build
2. 建置 Docker 映像檔
3. 部署到 Amazon Lightsail

需要設定以下 GitHub Secrets：
- `LIGHTSAIL_HOST` - Lightsail 伺服器 IP
- `LIGHTSAIL_USER` - SSH 使用者名稱
- `LIGHTSAIL_SSH_KEY` - SSH 私鑰

## 開發指令

```bash
npm run dev           # 開發伺服器
npm run build         # 建置生產版本
npm run lint          # 執行 ESLint
npm run db:studio     # Prisma Studio (資料庫管理介面)
npm run db:migrate    # 執行遷移
npm run db:seed       # 執行種子資料
npm run docker:dev    # 啟動開發用 PostgreSQL
npm run docker:down   # 停止 Docker 容器
```

## 授權

MIT License
