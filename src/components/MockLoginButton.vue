<template>
  <div class="mock-login-container">
    <!-- 環境提示 -->
    <div class="env-notice">
      <span class="env-icon">🔧</span>
      <span class="env-text">開發模式 - 使用 Mock 認證</span>
    </div>
    
    <!-- 載入中狀態 -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <span>正在登入...</span>
    </div>
    
    <!-- 未登入狀態 -->
    <div v-else-if="!isAuthenticated" class="login-section">
      <h3>歡迎回來！</h3>
      <p>點擊下方按鈕直接登入</p>
      
      <button 
        @click="handleLogin" 
        class="mock-login-btn"
        :disabled="isLoading"
      >
        <span class="btn-icon">👤</span>
        快速登入 (測試模式)
      </button>
    </div>
    
    <!-- 已登入狀態 -->
    <div v-else class="welcome-section">
      <div class="welcome-message">
        <img :src="userAvatar" :alt="userDisplayName" class="user-avatar" />
        <div class="welcome-text">
          <h3>{{ userDisplayName }}</h3>
          <p>{{ userEmail }}</p>
        </div>
      </div>
      
      <button @click="handleLogout" class="logout-btn">
        登出
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'

// 使用認證 composable
const {
  isLoading,
  isAuthenticated,
  userAvatar,
  userDisplayName,
  userEmail,
  login,
  logout
} = useAuth()

// 處理登入
const handleLogin = async () => {
  try {
    await login()
  } catch (error) {
    console.error('登入失敗:', error)
  }
}

// 處理登出
const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    console.error('登出失敗:', error)
  }
}
</script>

<style scoped>
.mock-login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  text-align: center;
}

/* 環境提示 */
.env-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 0.875rem;
  font-weight: 500;
}

.env-icon {
  font-size: 1rem;
}

.env-text {
  font-weight: 600;
}

/* 載入狀態 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 登入區域 */
.login-section h3 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.login-section p {
  color: #64748b;
  margin-bottom: 2rem;
}

.mock-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mock-login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.mock-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.2rem;
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
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #667eea;
}

.welcome-text {
  flex: 1;
  text-align: left;
}

.welcome-text h3 {
  margin: 0 0 0.25rem 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.welcome-text p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.logout-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #374151;
}

/* 響應式設計 */
@media (max-width: 480px) {
  .mock-login-container {
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