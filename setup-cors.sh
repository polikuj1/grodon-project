#!/bin/bash

# Google Cloud Storage CORS 設定腳本
# 使用前請確保已安裝並設定 Google Cloud SDK

echo "🔧 開始設定 Google Cloud Storage CORS..."

# 檢查是否已安裝 gcloud
if ! command -v gcloud &> /dev/null; then
    echo "❌ 錯誤：請先安裝 Google Cloud SDK"
    echo "📖 安裝指南：https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# 檢查是否已安裝 gsutil
if ! command -v gsutil &> /dev/null; then
    echo "❌ 錯誤：gsutil 未找到，請確認 Google Cloud SDK 安裝完整"
    exit 1
fi

# 設定變數
PROJECT_ID="premium-catbird-365712"
BUCKET_NAME="geo105_gordon"
CORS_FILE="cors-policy.json"

echo "📋 使用設定："
echo "   專案 ID: $PROJECT_ID"
echo "   Bucket: $BUCKET_NAME"
echo "   CORS 檔案: $CORS_FILE"

# 檢查 CORS 設定檔案是否存在
if [[ ! -f "$CORS_FILE" ]]; then
    echo "❌ 錯誤：找不到 CORS 設定檔案 ($CORS_FILE)"
    echo "請確認檔案存在於當前目錄"
    exit 1
fi

# 設定專案
echo "🔑 設定 Google Cloud 專案..."
gcloud config set project "$PROJECT_ID"

# 檢查是否已驗證
echo "🔍 檢查 Google Cloud 驗證狀態..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 > /dev/null; then
    echo "❌ 請先進行 Google Cloud 驗證："
    echo "   gcloud auth login"
    exit 1
fi

# 檢查 bucket 是否存在
echo "🗂️  檢查 Storage Bucket..."
if ! gsutil ls -b "gs://$BUCKET_NAME" > /dev/null 2>&1; then
    echo "❌ 錯誤：無法存取 bucket gs://$BUCKET_NAME"
    echo "請確認："
    echo "   1. Bucket 名稱是否正確"
    echo "   2. 你是否有存取權限"
    echo "   3. 專案 ID 是否正確"
    exit 1
fi

# 顯示當前 CORS 設定
echo "📖 目前的 CORS 設定："
gsutil cors get "gs://$BUCKET_NAME" || echo "   (無 CORS 設定)"

# 套用新的 CORS 設定
echo "⚙️  套用新的 CORS 設定..."
if gsutil cors set "$CORS_FILE" "gs://$BUCKET_NAME"; then
    echo "✅ CORS 設定成功！"
else
    echo "❌ CORS 設定失敗"
    exit 1
fi

# 驗證新設定
echo "🔍 驗證新的 CORS 設定："
gsutil cors get "gs://$BUCKET_NAME"

echo ""
echo "🎉 CORS 設定完成！"
echo "📝 現在你的 bucket 支援以下來源的跨域請求："
echo "   - http://localhost:5173 (開發環境)"
echo "   - http://localhost:3000 (備用開發環境)"
echo "   - https://your-production-domain.com (生產環境，請替換為實際域名)"
echo ""
echo "💡 提示：如果仍然遇到 CORS 錯誤，請："
echo "   1. 等待幾分鐘讓設定生效"
echo "   2. 清除瀏覽器快取"
echo "   3. 重新啟動開發服務器"