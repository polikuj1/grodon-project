<template>
  <div class="user-profile">
    <!-- 載入中狀態 -->
    <div v-if="isLoading" class="loading-indicator">
      <div class="loading-spinner"></div>
    </div>
    
    <!-- 未登入狀態 -->
    <div v-else-if="!isAuthenticated" class="login-prompt">
      <button @click="handleLogin" class="login-btn">
        <svg class="login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10,17 15,12 10,7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        登入
      </button>
    </div>
    
    <!-- 已登入狀態 - 用戶資訊 -->
    <div v-else class="user-info">
      <!-- 用戶下拉選單 -->
      <div class="user-dropdown" @click="toggleDropdown" ref="dropdownRef">
        <div class="user-avatar-container">
          <img 
            :src="userAvatar" 
            :alt="userDisplayName" 
            class="user-avatar"
            @error="handleImageError"
          />
          <div class="online-indicator"></div>
        </div>
        
        <div class="user-basic-info">
          <span class="user-name">{{ userDisplayName }}</span>
          <span class="user-status">線上</span>
        </div>
        
        <svg class="dropdown-arrow" :class="{ 'rotated': isDropdownOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </div>
      
      <!-- 下拉選單內容 -->
      <transition name="dropdown">
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <div class="dropdown-header">
            <img :src="userAvatar" :alt="userDisplayName" class="dropdown-avatar" />
            <div class="dropdown-user-info">
              <div class="dropdown-name">{{ userDisplayName }}</div>
              <div class="dropdown-email">{{ userEmail }}</div>
              <div class="login-time">登入時間: {{ formatLoginTime }}</div>
            </div>
          </div>
          
          <div class="dropdown-divider"></div>
          
          <div class="dropdown-actions">
            <button @click="viewProfile" class="dropdown-item">
              <svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              查看個人資料
            </button>
            
            <button @click="viewSettings" class="dropdown-item">
              <svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
              </svg>
              設定
            </button>
            
            <div class="dropdown-divider"></div>
            
            <button @click="handleLogout" class="dropdown-item logout-item">
              <svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              登出
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'

// 使用認證 composable
const {
  isLoading,
  isAuthenticated,
  userAvatar,
  userDisplayName,
  userEmail,
  user,
  initAuth,
  login,
  logout
} = useAuth()

// 下拉選單狀態
const isDropdownOpen = ref(false)
const dropdownRef = ref(null)

// 切換下拉選單
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 關閉下拉選單
const closeDropdown = () => {
  isDropdownOpen.value = false
}

// 處理登入
const handleLogin = async () => {
  try {
    await login()
  } catch (error) {
    console.error('登入失敗:', error)
  }
}

// 處理登出
const handleLogout = () => {
  try {
    logout()
    closeDropdown()
  } catch (error) {
    console.error('登出失敗:', error)
  }
}

// 查看個人資料
const viewProfile = () => {
  console.log('查看個人資料')
  closeDropdown()
  // 這裡可以導航到個人資料頁面
}

// 查看設定
const viewSettings = () => {
  console.log('查看設定')
  closeDropdown()
  // 這裡可以導航到設定頁面
}

// 處理頭像載入錯誤
const handleImageError = (event) => {
  event.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userDisplayName.value || 'User') + '&background=4285f4&color=fff'
}

// 格式化登入時間
const formatLoginTime = computed(() => {
  if (!user.value?.loginTime) return ''
  
  const loginTime = new Date(user.value.loginTime)
  return loginTime.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// 點擊外部關閉下拉選單
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// 組件掛載
onMounted(async () => {
  await initAuth()
  document.addEventListener('click', handleClickOutside)
})

// 組件卸載
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.user-profile {
  position: relative;
  z-index: 1000;
}

/* 載入指示器 */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 登入提示 */
.login-prompt .login-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  border: 1px solid #dadce0;
  border-radius: 20px;
  background: white;
  color: #3c4043;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: #f8f9fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.login-icon {
  width: 16px;
  height: 16px;
}

/* 用戶資訊區域 */
.user-info {
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 6px 12px;
  border-radius: 20px;
  background: white;
  border: 1px solid #dadce0;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 180px;
}

.user-dropdown:hover {
  background: #f8f9fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-avatar-container {
  position: relative;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  background: #34a853;
  border: 2px solid white;
  border-radius: 50%;
}

.user-basic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 12px;
  color: #34a853;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  color: #5f6368;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* 下拉選單 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1001;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-user-info {
  flex: 1;
  min-width: 0;
}

.dropdown-name {
  font-size: 16px;
  font-weight: 500;
  color: #3c4043;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.dropdown-email {
  font-size: 14px;
  color: #5f6368;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

.login-time {
  font-size: 12px;
  color: #80868b;
}

.dropdown-divider {
  height: 1px;
  background: #e8eaed;
  margin: 0;
}

.dropdown-actions {
  padding: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #3c4043;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.logout-item {
  color: #d93025;
}

.logout-item:hover {
  background: #fce8e6;
}

.item-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 下拉動畫 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
  transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .user-dropdown {
    min-width: 120px;
  }
  
  .dropdown-menu {
    width: 260px;
    right: -20px;
  }
  
  .user-basic-info {
    display: none;
  }
}

@media (max-width: 480px) {
  .dropdown-menu {
    width: 240px;
    right: -40px;
  }
}
</style>