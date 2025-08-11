<template>
  <div class="login-view">
    <div class="login-container">
      <!-- 應用程式標題和說明 -->
      <div class="app-branding">
        <div class="app-icon">📸</div>
        <h1 class="app-title">Photo Timeline</h1>
        <p class="app-description">記錄美好時光的每一瞬間</p>
      </div>
      
      <!-- 登入組件 -->
      <div class="login-section">
        <MockLoginButton v-if="useMockAuth" />
        <LoginButton v-else />
      </div>
      
      <!-- 功能介紹 -->
      <div class="features-preview">
        <div class="feature-item">
          <span class="feature-icon">📷</span>
          <span class="feature-text">上傳照片</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">👥</span>
          <span class="feature-text">標記人員</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📅</span>
          <span class="feature-text">時間軸</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">💫</span>
          <span class="feature-text">即時同步</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginButton from '../components/LoginButton.vue'
import MockLoginButton from '../components/MockLoginButton.vue'
import { onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

// 環境配置
const useMockAuth = computed(() => import.meta.env.VITE_USE_MOCK_AUTH === 'true')

const router = useRouter()
const { isAuthenticated } = useAuth()

// 監聽登入狀態，自動跳轉
watch(isAuthenticated, (newVal) => {
  if (newVal) {
    router.push('/')
  }
})

onMounted(() => {
  // 如果已經登入，直接跳轉
  if (isAuthenticated.value) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  max-width: 400px;
  width: 100%;
  text-align: center;
}

/* 應用程式標題區域 */
.app-branding {
  margin-bottom: 3rem;
  color: white;
}

.app-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.app-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

/* 登入區域 */
.login-section {
  margin-bottom: 3rem;
}

/* 功能預覽 */
.features-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  color: white;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: transform 0.2s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
}

.feature-icon {
  font-size: 1.2rem;
}

.feature-text {
  font-size: 0.9rem;
  font-weight: 500;
}

/* 響應式設計 */
@media (max-width: 480px) {
  .login-view {
    padding: 1rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .app-description {
    font-size: 1rem;
  }
  
  .features-preview {
    grid-template-columns: 1fr;
  }
}
</style>