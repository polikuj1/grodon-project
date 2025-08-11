// 用戶認證狀態管理
import { ref, computed } from 'vue'
import googleAuthService from '../services/googleAuth.js'
import firebaseAuthService from '../services/mockFirebaseAuth.js'

// 環境配置
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

// 全局狀態
const user = ref(null)
const isLoggedIn = ref(false)
const isLoading = ref(true)

// Mock 用戶資料
const mockUser = {
  id: 'mock-user-123',
  name: '測試使用者',
  given_name: '測試',
  family_name: '使用者',
  email: 'test@example.com',
  picture: 'https://ui-avatars.com/api/?name=測試使用者&background=667eea&color=fff',
  loginTime: new Date().toISOString()
}

export function useAuth() {
  // 初始化認證狀態
  const initAuth = async () => {
    try {
      isLoading.value = true
      
      if (USE_MOCK_AUTH) {
        // Mock 認證模式
        console.log('🔧 使用 Mock 認證模式')
        
        // 初始化 Firebase 匿名認證（用於 Storage 存取）
        try {
          await firebaseAuthService.initMockAuth()
          console.log('✅ Firebase 認證初始化完成')
        } catch (error) {
          console.warn('⚠️ Firebase 認證初始化失敗:', error)
        }
        
        // 檢查本地儲存
        const savedUser = localStorage.getItem('mockUser')
        if (savedUser) {
          user.value = JSON.parse(savedUser)
          isLoggedIn.value = true
          console.log('✅ 恢復 Mock 登入狀態:', user.value.name)
        }
      } else {
        // Google OAuth 模式
        console.log('🔐 使用 Google OAuth 認證模式')
        
        try {
          await googleAuthService.init()
          console.log('✅ Google OAuth 服務初始化成功')
          
          const isAuthenticated = googleAuthService.isAuthenticated()
          if (isAuthenticated) {
            const userProfile = googleAuthService.getUserProfile()
            if (userProfile) {
              user.value = userProfile
              isLoggedIn.value = true
              console.log('✅ 恢復 Google 登入狀態:', userProfile.name)
            }
          }
        } catch (error) {
          console.error('❌ Google OAuth 初始化失敗:', error)
          // 不拋出錯誤，允許用戶手動登入
        }
      }
    } catch (error) {
      console.error('❌ 初始化認證失敗:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 登入
  const login = async () => {
    try {
      isLoading.value = true
      
      if (USE_MOCK_AUTH) {
        // Mock 登入
        console.log('🔧 執行 Mock 登入')
        
        // 確保 Firebase 認證已初始化
        try {
          await firebaseAuthService.initMockAuth()
          console.log('✅ Firebase 認證確認完成')
        } catch (error) {
          console.warn('⚠️ Firebase 認證失敗:', error)
        }
        
        // 模擬登入延遲
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        user.value = mockUser
        isLoggedIn.value = true
        
        // 儲存到本地存儲
        localStorage.setItem('mockUser', JSON.stringify(mockUser))
        
        console.log('✅ Mock 登入成功:', mockUser.name)
      } else {
        // Google OAuth 登入
        console.log('🔐 開始 Google OAuth 登入流程')
        
        googleAuthService.onLoginSuccess = (userProfile) => {
          user.value = userProfile
          isLoggedIn.value = true
          console.log('✅ Google 登入成功:', userProfile.name)
        }
        
        googleAuthService.onLoginError = (error) => {
          console.error('❌ Google 登入失敗:', error)
          user.value = null
          isLoggedIn.value = false
          throw error // 讓上層處理錯誤
        }
        
        await googleAuthService.signIn()
      }
      
    } catch (error) {
      console.error('❌ 登入過程出錯:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      if (USE_MOCK_AUTH) {
        // Mock 登出
        console.log('🔧 執行 Mock 登出')
        
        // Firebase 登出
        try {
          await firebaseAuthService.signOut()
          console.log('✅ Firebase 登出完成')
        } catch (error) {
          console.warn('⚠️ Firebase 登出失敗:', error)
        }
        
        user.value = null
        isLoggedIn.value = false
        localStorage.removeItem('mockUser')
        console.log('✅ Mock 登出成功')
      } else {
        // Google OAuth 登出
        console.log('🔐 開始 Google OAuth 登出流程')
        
        googleAuthService.onLogout = () => {
          user.value = null
          isLoggedIn.value = false
          console.log('✅ Google 登出成功')
        }
        
        googleAuthService.signOut()
      }
      
    } catch (error) {
      console.error('❌ 登出失敗:', error)
    }
  }

  // 渲染 Google 登入按鈕
  const renderGoogleButton = (elementId) => {
    if (USE_MOCK_AUTH) {
      console.log('🔧 Mock 模式下不需要渲染 Google 按鈕')
      return
    }
    
    try {
      console.log('🔘 準備渲染 Google 登入按鈕:', elementId)
      googleAuthService.renderSignInButton(elementId)
    } catch (error) {
      console.error('❌ 渲染 Google 按鈕失敗:', error)
    }
  }

  // 獲取用戶頭像
  const userAvatar = computed(() => {
    return user.value?.picture || '/default-avatar.png'
  })

  // 獲取用戶顯示名稱
  const userDisplayName = computed(() => {
    return user.value?.name || user.value?.given_name || '未知用戶'
  })

  // 獲取用戶 email
  const userEmail = computed(() => {
    return user.value?.email || ''
  })

  // 檢查是否為認證用戶
  const isAuthenticated = computed(() => {
    return isLoggedIn.value && user.value !== null
  })

  // 獲取 JWT token
  const getToken = () => {
    return googleAuthService.getToken()
  }

  return {
    // 狀態
    user,
    isLoggedIn,
    isLoading,
    
    // 計算屬性
    userAvatar,
    userDisplayName,
    userEmail,
    isAuthenticated,
    
    // 方法
    initAuth,
    login,
    logout,
    renderGoogleButton,
    getToken
  }
}

// 在組件外部初始化 (確保全局狀態一致性)
export const authStore = {
  user,
  isLoggedIn,
  isLoading
}