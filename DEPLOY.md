# 選民服務管理系統 - Lightsail 部署指南

## 伺服器資訊

- **IP**: 18.181.71.46
- **域名**: crm.harvestwize.com (需設定 DNS)
- **應用端口**: 3001 (內部)

## 隔離設計

| 資源 | 名稱 | 說明 |
|------|------|------|
| 網路 | `crm-network` | 獨立 Docker 網路 |
| 資料庫 | `crm-db` | 獨立 PostgreSQL 16 |
| Volume | `crm-postgres-data` | 資料庫持久化 |
| Volume | `crm-uploads` | 檔案上傳 |
| 應用 | `crm-app` | Next.js 應用 |

## 部署步驟

### 1. 設定 GitHub Secrets

到 [GitHub Repository Settings](https://github.com/tzustu63/publicwork/settings/secrets/actions) 新增：

| Secret | 值 |
|--------|-----|
| `LIGHTSAIL_HOST` | `18.181.71.46` |
| `LIGHTSAIL_USER` | `ubuntu` |
| `LIGHTSAIL_SSH_KEY` | SSH 私鑰內容 |

### 2. 首次部署 - 伺服器設定

SSH 連線到伺服器：

```bash
ssh -i "LightsailDefaultKey-ap-northeast-1.pem" ubuntu@18.181.71.46
```

執行初始化：

```bash
# 建立目錄
sudo mkdir -p /opt/constituent-crm
sudo chown ubuntu:ubuntu /opt/constituent-crm
cd /opt/constituent-crm

# 下載 docker-compose 檔案
curl -sO https://raw.githubusercontent.com/tzustu63/publicwork/main/docker-compose.lightsail.yml

# 建立環境變數
cat > .env << 'EOF'
# 資料庫密碼（請修改）
DB_PASSWORD=YourSecurePassword123

# NextAuth 設定
NEXTAUTH_URL=https://crm.harvestwize.com
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters-long
EOF

# 登入 GitHub Container Registry
# 需要 Personal Access Token (PAT) 有 read:packages 權限
echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u tzustu63 --password-stdin

# 啟動服務
docker compose -f docker-compose.lightsail.yml pull
docker compose -f docker-compose.lightsail.yml up -d

# 等待資料庫啟動
sleep 15

# 執行資料庫遷移
docker compose -f docker-compose.lightsail.yml exec crm-app npx prisma migrate deploy

# 執行種子資料
docker compose -f docker-compose.lightsail.yml exec crm-app npx prisma db seed
```

### 3. 設定 Nginx 反向代理

```bash
# 複製 Nginx 配置
sudo cp /opt/constituent-crm/nginx-crm.conf /etc/nginx/sites-available/crm.harvestwize.com
sudo ln -sf /etc/nginx/sites-available/crm.harvestwize.com /etc/nginx/sites-enabled/

# 申請 SSL 憑證
sudo certbot --nginx -d crm.harvestwize.com

# 重啟 Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 4. DNS 設定

在 DNS 管理介面新增 A 記錄：
- **主機名**: `crm`
- **類型**: `A`
- **值**: `18.181.71.46`

## 常用指令

```bash
cd /opt/constituent-crm

# 查看服務狀態
docker compose -f docker-compose.lightsail.yml ps

# 查看日誌
docker compose -f docker-compose.lightsail.yml logs -f
docker compose -f docker-compose.lightsail.yml logs -f crm-app

# 重啟服務
docker compose -f docker-compose.lightsail.yml restart

# 停止服務
docker compose -f docker-compose.lightsail.yml down

# 重新部署（拉取最新映像）
docker compose -f docker-compose.lightsail.yml pull
docker compose -f docker-compose.lightsail.yml up -d

# 進入應用容器
docker compose -f docker-compose.lightsail.yml exec crm-app sh

# 進入資料庫
docker compose -f docker-compose.lightsail.yml exec crm-db psql -U crm_user -d constituent_crm
```

## 資料庫備份

```bash
# 建立備份
docker compose -f docker-compose.lightsail.yml exec -T crm-db \
  pg_dump -U crm_user constituent_crm > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢復備份
cat backup_20250609.sql | docker compose -f docker-compose.lightsail.yml exec -T crm-db \
  psql -U crm_user constituent_crm
```

## 驗證部署

```bash
# 檢查容器
docker ps | grep crm

# 檢查網路
docker network ls | grep crm

# 檢查 Volume
docker volume ls | grep crm

# 健康檢查
curl http://localhost:3001/api/health

# 測試登入頁面
curl -I http://localhost:3001/login
```

## 測試帳號

- **管理員**: admin@example.com / admin123
- **助理**: staff@example.com / admin123
