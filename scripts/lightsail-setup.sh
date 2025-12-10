#!/bin/bash
# 選民服務管理系統 - Lightsail 伺服器初始化腳本
# 使用方式: bash lightsail-setup.sh

set -e

echo "=========================================="
echo "選民服務管理系統 - Lightsail 部署腳本"
echo "=========================================="

# 變數設定
APP_DIR="/opt/constituent-crm"
GITHUB_REPO="https://github.com/tzustu63/publicwork.git"

# 檢查是否為 root 或有 sudo 權限
if [ "$EUID" -ne 0 ]; then
  SUDO="sudo"
else
  SUDO=""
fi

# 1. 建立應用目錄
echo ""
echo ">>> 1. 建立應用目錄..."
$SUDO mkdir -p $APP_DIR
$SUDO chown $USER:$USER $APP_DIR
cd $APP_DIR

# 2. 下載部署檔案
echo ""
echo ">>> 2. 下載部署配置..."
curl -sO https://raw.githubusercontent.com/tzustu63/publicwork/main/docker-compose.lightsail.yml

# 3. 建立環境變數檔案
echo ""
echo ">>> 3. 建立環境變數檔案..."
if [ ! -f .env ]; then
  # 產生隨機密碼
  DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
  
  cat > .env << EOF
# 選民服務管理系統 - 生產環境變數
# 自動產生於 $(date)

# 資料庫密碼
DB_PASSWORD=$DB_PASSWORD

# NextAuth 設定
NEXTAUTH_URL=https://crm.harvestwize.com
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
EOF

  echo "   已建立 .env 檔案（密碼已自動產生）"
  echo "   請確認 NEXTAUTH_URL 設定正確"
else
  echo "   .env 檔案已存在，跳過"
fi

# 4. 登入 GitHub Container Registry
echo ""
echo ">>> 4. 登入 GitHub Container Registry..."
echo "   請輸入您的 GitHub Personal Access Token (需要 read:packages 權限):"
read -s GITHUB_TOKEN
echo $GITHUB_TOKEN | docker login ghcr.io -u tzustu63 --password-stdin

# 5. 拉取並啟動容器
echo ""
echo ">>> 5. 拉取 Docker 映像檔..."
docker compose -f docker-compose.lightsail.yml pull

echo ""
echo ">>> 6. 啟動服務..."
docker compose -f docker-compose.lightsail.yml up -d

# 7. 等待服務啟動
echo ""
echo ">>> 7. 等待服務啟動..."
sleep 10

# 8. 執行資料庫遷移
echo ""
echo ">>> 8. 執行資料庫遷移..."
docker compose -f docker-compose.lightsail.yml exec -T crm-app npx prisma migrate deploy

# 9. 執行種子資料
echo ""
echo ">>> 9. 執行種子資料..."
docker compose -f docker-compose.lightsail.yml exec -T crm-app npx prisma db seed

# 10. 驗證部署
echo ""
echo ">>> 10. 驗證部署..."
echo ""
echo "容器狀態:"
docker ps | grep crm

echo ""
echo "網路狀態:"
docker network ls | grep crm

echo ""
echo "Volume 狀態:"
docker volume ls | grep crm

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "應用 URL: http://localhost:3001"
echo "測試帳號: admin@example.com / admin123"
echo ""
echo "下一步："
echo "1. 設定 Nginx 反向代理 (port 3001 -> domain)"
echo "2. 設定 SSL 憑證 (Let's Encrypt)"
echo ""
