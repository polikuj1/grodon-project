# Google OAuth 2.0 設定完整指引

## 🎯 **目標**
為您的應用設定 Google OAuth 2.0 登入功能

## 📋 **預備資料**
- 您的 Google 帳號
- 瀏覽器
- 大約 10-15 分鐘時間

---

## 📝 **步驟 1: 創建 Google Cloud 專案**

### 1.1 前往 Google Cloud Console
👉 **[打開 Google Cloud Console](https://console.cloud.google.com/)**

### 1.2 創建新專案
1. 點擊頂部的專案選擇器
2. 點擊 **「新增專案」**
3. 輸入專案名稱：`grodon-oauth-project` (或您喜歡的名稱)
4. 點擊 **「建立」**

---

## 🔧 **步驟 2: 啟用 Google+ API**

### 2.1 啟用必要的 API
1. 在 Google Cloud Console 中，確保選擇了正確的專案
2. 前往 **「API 和服務」** → **「程式庫」**
3. 搜尋 **「Google+ API」**
4. 點擊並啟用
5. 也搜尋並啟用 **「Google Identity Services API」**

---

## 🔑 **步驟 3: 創建 OAuth 2.0 憑證**

### 3.1 前往憑證頁面
1. 前往 **「API 和服務」** → **「憑證」**
2. 點擊 **「+ 建立憑證」**
3. 選擇 **「OAuth 2.0 用戶端 ID」**

### 3.2 設定 OAuth 同意畫面 (如果還沒設定)
如果提示需要設定 OAuth 同意畫面：

1. 點擊 **「設定同意畫面」**
2. 選擇 **「外部」** (適用於任何 Google 帳號)
3. 填寫必要資訊：
   - **應用程式名稱**: `Grodon Project`
   - **用戶支援電子郵件**: 您的 Gmail 地址
   - **開發人員聯絡資訊**: 您的 Gmail 地址
4. 點擊 **「儲存並繼續」**
5. 範圍頁面直接點擊 **「儲存並繼續」**
6. 測試使用者頁面也直接點擊 **「儲存並繼續」**

### 3.3 建立 OAuth 2.0 用戶端 ID
1. 選擇應用程式類型：**「網路應用程式」**
2. 名稱：`Grodon Web Client`
3. 在 **「授權的 JavaScript 來源」** 點擊 **「+ 新增 URI」**：
   ```
   http://localhost:5173
   ```
4. 再點擊 **「+ 新增 URI」** 添加：
   ```
   http://127.0.0.1:5173
   ```
5. 點擊 **「建立」**

### 3.4 保存憑證
創建完成後會顯示：
- **用戶端 ID**: 以 `.apps.googleusercontent.com` 結尾的長字串
- **用戶端密鑰**: 以 `GOCSPX-` 開頭的字串

**重要**: 請複製這兩個值！

---

## ⚙️ **步驟 4: 配置應用程式**

### 4.1 更新 .env 文件
在您的專案根目錄中，編輯 `.env` 文件：

```bash
# Vite 環境變數必須以 VITE_ 開頭
VITE_GOOGLE_CLIENT_ID=您的用戶端ID
GOOGLE_SECRET_KEY=您的用戶端密鑰

VITE_HOST=http://localhost:5173/

# JWT_SECRET (後端使用)
JWT_SECRET=AABBCC
```

### 4.2 重新啟動開發服務器
```bash
npm run dev
```

---

## 🧪 **步驟 5: 測試登入功能**

### 5.1 訪問應用
打開瀏覽器訪問：`http://localhost:5173`

### 5.2 測試登入
1. 點擊 Google 登入按鈕
2. 選擇您的 Google 帳號
3. 允許權限
4. 確認登入成功

---

## ⚠️ **常見問題解決**

### 問題 1: "授權的 JavaScript 來源無效"
**解決方案**: 確保在 Google Console 中只添加了：
- `http://localhost:5173`
- `http://127.0.0.1:5173`

不要添加內部 IP 地址 (如 192.168.x.x, 10.x.x.x)

### 問題 2: "redirect_uri_mismatch"
**解決方案**: 檢查您訪問的網址是否與 Google Console 中設定的完全一致

### 問題 3: 登入後無回應
**解決方案**: 檢查瀏覽器 Console (F12) 是否有錯誤訊息

---

## 🔄 **如果需要重新配置**

如果需要修改設定：
1. 回到 Google Cloud Console
2. 前往 **「API 和服務」** → **「憑證」**
3. 點擊您的 OAuth 2.0 用戶端 ID
4. 修改授權的 JavaScript 來源
5. 點擊 **「儲存」**
6. 等待 5-10 分鐘讓更改生效

---

## 📞 **需要協助？**

如果遇到問題：
1. 檢查瀏覽器 Console (F12) 的錯誤訊息
2. 確認 `.env` 文件配置正確
3. 確認 Google Console 中的設定正確
4. 等待 Google 的配置更改生效（通常需要 5-10 分鐘）

---

## ✅ **完成檢查清單**

- [ ] Google Cloud 專案已創建
- [ ] Google+ API 已啟用
- [ ] OAuth 同意畫面已設定
- [ ] OAuth 2.0 用戶端 ID 已創建
- [ ] 授權的 JavaScript 來源已正確設定
- [ ] `.env` 文件已更新
- [ ] 開發服務器已重新啟動
- [ ] 登入功能測試成功

完成以上所有步驟後，您的 Google OAuth 登入功能就可以正常使用了！