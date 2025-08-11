# Google OAuth 設定檢查清單

## 🔐 Google Cloud Console 設定

### 1. OAuth 2.0 客戶端 ID 設定
前往 [Google Cloud Console](https://console.cloud.google.com/)：

1. **APIs & Services** → **Credentials**
2. 找到您的 OAuth 2.0 客戶端 ID
3. 點擊編輯 ✏️

### 2. 授權的 JavaScript 來源
確保以下網域已添加：
- ✅ `http://localhost:5173`
- ✅ `http://127.0.0.1:5173`
- ✅ `https://nodejs-4951c.web.app`
- ✅ `https://nodejs-4951c.firebaseapp.com`

**重要**：不要添加內部 IP（如 10.x.x.x, 172.x.x.x），Google 會拒絕！

### 3. 授權的重新導向 URI
通常不需要設定，但如果需要：
- `http://localhost:5173`
- `https://nodejs-4951c.web.app`

## 🧪 測試步驟

### 1. 本地測試
```bash
npm run dev
# 瀏覽器打開 http://localhost:5173
```

### 2. 檢查瀏覽器 Console
看看是否有錯誤訊息：
- ✅ Google OAuth 初始化成功
- ✅ 沒有 CORS 錯誤
- ✅ 沒有 "invalid_client" 錯誤

### 3. 測試登入流程
1. 點擊「使用 Google 登入」
2. 彈出 Google 登入視窗
3. 選擇 Google 帳號
4. 成功跳轉到時間軸頁面

## 🚨 常見問題解決

### 問題 1：CORS 錯誤
**症狀**：`blocked by CORS policy`
**解決**：
1. 檢查 Google Console 授權網域設定
2. 確認當前網域在授權列表中
3. 等待 5-10 分鐘讓設定生效

### 問題 2：Invalid Client
**症狀**：`invalid_client` 或 `unauthorized_client`
**解決**：
1. 檢查 Client ID 是否正確
2. 檢查 .env 檔案中的 VITE_GOOGLE_CLIENT_ID
3. 確認專案 ID 匹配

### 問題 3：Redirect URI Mismatch
**症狀**：`redirect_uri_mismatch`
**解決**：
1. 檢查 Google Console 重新導向 URI 設定
2. 確認當前網域已添加
3. 清除瀏覽器快取

## 📝 環境變數確認

`.env` 檔案應包含：
```
VITE_GOOGLE_CLIENT_ID=49119909089-gce853rk5ldc30dvfdirdh8tosoarqp0.apps.googleusercontent.com
VITE_USE_MOCK_AUTH=false
```

## 🔄 如果需要切回 Mock 認證

修改 `.env`：
```
VITE_USE_MOCK_AUTH=true
```

重新啟動開發服務器：
```bash
npm run dev
```