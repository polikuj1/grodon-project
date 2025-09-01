<template>
  <div class="login-container">
    <!-- 錯誤提示 -->
    <div v-if="errorMessage" class="error-alert">
      <div class="error-icon">⚠️</div>
      <div class="error-content">
        <div class="error-title">Google OAuth 登入問題</div>
        <div class="error-message">{{ errorMessage }}</div>

        <!-- CORS 特定錯誤的詳細幫助 -->
        <div v-if="showCorsHelp" class="error-help">
          <p><strong>🚨 CORS 錯誤 - 立即修復步驟：</strong></p>

          <div class="fix-section">
            <p><strong>方法1 - 立即解決 (0分鐘)：</strong></p>
            <div class="quick-fix">
              <p>點擊以下連結重新載入頁面：</p>
              <div class="url-buttons">
                <button @click="redirectToLocalhost" class="url-button">
                  📍 使用 localhost:5173
                </button>
                <button @click="redirectTo127" class="url-button">
                  📍 使用 127.0.0.1:5173
                </button>
              </div>
            </div>
          </div>

          <div class="fix-section">
            <p><strong>方法2 - Google Console 配置 (5-10分鐘)：</strong></p>
            <ol>
              <li>
                打開
                <a href="https://console.cloud.google.com/" target="_blank"
                  >Google Cloud Console</a
                >
              </li>
              <li>APIs & Services → Credentials</li>
              <li>編輯 OAuth 2.0 客戶端 ID</li>
              <li>
                在「授權的 JavaScript 來源」只添加：
                <div class="code-block">
                  http://localhost:5173<br />
                  http://127.0.0.1:5173
                </div>
              </li>
              <li>儲存並等待 5-10 分鐘生效</li>
            </ol>
          </div>

          <div class="warning-section">
            <p><strong>🚫 不要添加內部 IP 地址：</strong></p>
            <p>如 10.x.x.x, 172.x.x.x, 192.168.x.x (Google 會拒絕)</p>
          </div>
        </div>

        <div class="error-actions">
          <button @click="clearError" class="error-dismiss">關閉</button>
          <button @click="checkConsole" class="console-button">
            查看 Console 詳細診斷
          </button>
        </div>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <span>正在載入...</span>
    </div>

    <!-- 未登入狀態 - 顯示登入按鈕 -->
    <div v-else-if="!isAuthenticated" class="login-section">
      <h3>歡迎使用我們的服務</h3>
      <p>請使用 Google 帳號登入以繼續</p>

      <!-- Google 登入按鈕容器 -->
      <div id="google-signin-button" class="google-button-container"></div>

      <!-- 備用登入按鈕 -->
      <button
        @click="handleLogin"
        class="custom-login-btn"
        :disabled="isLoading"
      >
        <svg class="google-icon" viewBox="0 0 24 24">
          <path
            fill="#4285f4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34a853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#fbbc05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#ea4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        使用 Google 登入
      </button>
    </div>

    <!-- 已登入狀態 - 顯示歡迎訊息 -->
    <div v-else class="welcome-section">
      <div class="welcome-message">
        <img :src="userAvatar" :alt="userDisplayName" class="user-avatar" />
        <div class="welcome-text">
          <h3>歡迎回來，{{ userDisplayName }}！</h3>
          <p>{{ userEmail }}</p>
        </div>
      </div>

      <button @click="handleLogout" class="logout-btn">登出</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useAuth } from "../composables/useAuth.js";
import googleAuthService from "../services/googleAuth.js";

// 使用認證 composable
const {
  isLoading,
  isAuthenticated,
  userAvatar,
  userDisplayName,
  userEmail,
  initAuth,
  login,
  logout,
  renderGoogleButton,
} = useAuth();

// 錯誤狀態
const errorMessage = ref("");
const showCorsHelp = computed(() => {
  return (
    errorMessage.value.includes("CORS") ||
    errorMessage.value.includes("網域") ||
    errorMessage.value.includes("授權")
  );
});
console.log("test ci");

// 清除錯誤
const clearError = () => {
  errorMessage.value = "";
};

// 重定向到 localhost
const redirectToLocalhost = () => {
  const currentUrl = new URL(window.location.href);
  window.location.href = `http://localhost:${currentUrl.port || "5173"}${
    currentUrl.pathname
  }${currentUrl.search}`;
};

// 重定向到 127.0.0.1
const redirectTo127 = () => {
  const currentUrl = new URL(window.location.href);
  window.location.href = `http://127.0.0.1:${currentUrl.port || "5173"}${
    currentUrl.pathname
  }${currentUrl.search}`;
};

// 提示用戶查看 Console
const checkConsole = () => {
  alert(
    "請打開瀏覽器開發者工具 (F12) → Console 標籤，查看詳細的診斷資訊和修復指引。"
  );
};

// 處理登入
const handleLogin = async () => {
  try {
    clearError();
    await login();
  } catch (error) {
    console.error("登入失敗:", error);
    errorMessage.value = error.message || "登入過程中發生未知錯誤";
  }
};

// 處理登出
const handleLogout = () => {
  try {
    clearError();
    logout();
  } catch (error) {
    console.error("登出失敗:", error);
    errorMessage.value = error.message || "登出過程中發生錯誤";
  }
};

// 組件掛載時初始化
onMounted(async () => {
  try {
    // 設置錯誤處理器
    googleAuthService.onLoginError = (error) => {
      errorMessage.value = error;
    };

    googleAuthService.onInitializationError = (error) => {
      errorMessage.value = `初始化失敗: ${error}`;
    };

    googleAuthService.onGoogleError = (error) => {
      errorMessage.value = error;
    };

    // 初始化認證
    await initAuth();

    // 如果未登入，渲染 Google 按鈕
    if (!isAuthenticated.value) {
      await nextTick();
      renderGoogleButton("google-signin-button");
    }
  } catch (error) {
    console.error("初始化失敗:", error);
    errorMessage.value = `初始化失敗: ${error.message || error}`;
  }
});
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 錯誤提示樣式 */
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
}

.error-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
}

.error-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.error-help {
  font-size: 0.85rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 4px;
}

.error-help p {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.error-help ol {
  margin: 0;
  padding-left: 1.25rem;
}

.error-help li {
  margin-bottom: 0.25rem;
}

.error-dismiss {
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.error-dismiss:hover {
  background: #b91c1c;
}

/* 修復步驟樣式 */
.fix-section {
  margin: 1rem 0;
  padding: 0.75rem;
  border-left: 3px solid #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 0 4px 4px 0;
}

.quick-fix {
  margin: 0.5rem 0;
}

.url-buttons {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
  flex-wrap: wrap;
}

.url-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex: 1;
  min-width: 150px;
}

.url-button:hover {
  background: #2563eb;
}

.code-block {
  background: #1f2937;
  color: #f9fafb;
  padding: 0.5rem;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  white-space: pre-line;
}

.warning-section {
  margin: 1rem 0;
  padding: 0.75rem;
  border-left: 3px solid #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0 4px 4px 0;
}

.warning-section p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.error-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.console-button {
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.console-button:hover {
  background: #4f46e5;
}

.fix-section ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.fix-section li {
  margin: 0.5rem 0;
  line-height: 1.4;
}

.fix-section a {
  color: #3b82f6;
  text-decoration: underline;
}

.fix-section a:hover {
  color: #2563eb;
}

/* 載入狀態 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 登入區域 */
.login-section {
  text-align: center;
}

.login-section h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.login-section p {
  color: #666;
  margin-bottom: 2rem;
}

.google-button-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

/* 自定義登入按鈕 */
.custom-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  color: #3c4043;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-login-btn:hover {
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3);
  border-color: #d2e3fc;
}

.custom-login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.google-icon {
  width: 18px;
  height: 18px;
}

/* 歡迎區域 */
.welcome-section {
  text-align: center;
}

.welcome-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.welcome-text {
  flex: 1;
  text-align: left;
}

.welcome-text h3 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.1rem;
}

.welcome-text p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.logout-btn {
  padding: 10px 20px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  color: #3c4043;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #f8f9fa;
  box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3);
}

/* 響應式設計 */
@media (max-width: 480px) {
  .login-container {
    margin: 1rem;
    padding: 1.5rem;
  }

  .welcome-message {
    flex-direction: column;
    text-align: center;
  }

  .welcome-text {
    text-align: center;
  }
}
</style>
