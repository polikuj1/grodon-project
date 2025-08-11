// Google OAuth 服務
import { jwtDecode } from 'jwt-decode'

class GoogleAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '49119909089-gce853rk5ldc30dvfdirdh8tosoarqp0.apps.googleusercontent.com'
    this.isInitialized = false
  }

  // 初始化 Google API
  async init() {
    if (this.isInitialized) return

    return new Promise((resolve, reject) => {
      // 載入 Google API 腳本
      if (!window.google) {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
          this.initializeGoogleAuth()
            .then(resolve)
            .catch(reject)
        }
        script.onerror = reject
        document.head.appendChild(script)
      } else {
        this.initializeGoogleAuth()
          .then(resolve)
          .catch(reject)
      }
    })
  }

  // 初始化 Google Auth
  async initializeGoogleAuth() {
    try {
      // 檢查當前域名是否被授權
      const currentOrigin = window.location.origin
      console.log('當前網域:', currentOrigin)
      
      // 檢查潛在的 CORS 問題
      const corsCheck = this.checkCorsIssue()
      if (!corsCheck) {
        console.warn('⚠️ 檢測到潛在的 CORS 問題')
      }
      
      // 檢查是否支援 FedCM 並決定配置
      const fedcmSupported = this.checkFedCMSupport()
      const shouldUseFedCM = fedcmSupported && this.shouldEnableFedCM()
      
      // 初始化 Google Identity Services
      const config = {
        client_id: this.clientId,
        callback: this.handleGoogleResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'popup',
        context: 'signin',
        itp_support: true
      }
      
      // 根據情況決定是否使用 FedCM
      if (shouldUseFedCM) {
        console.log('✅ 啟用 FedCM 支援')
        // FedCM 在支援的環境中啟用
      } else {
        config.use_fedcm_for_prompt = false
        console.log('⚠️ 停用 FedCM (臨時解決方案)')
      }
      
      window.google.accounts.id.initialize(config)
      
      this.isInitialized = true
      console.log('✅ Google Auth 初始化成功')
      return true
    } catch (error) {
      console.error('❌ Google Auth 初始化失敗:', error)
      this.handleInitializationError(error)
      throw error
    }
  }

  // 處理 Google 登入回應
  handleGoogleResponse(response) {
    try {
      console.log('Google 登入回應:', response)
      
      if (response.credential) {
        // 解碼 JWT token
        const decoded = jwtDecode(response.credential)
        console.log('解碼的用戶資料:', decoded)
        
        // 儲存 token 和用戶資料
        this.saveAuthData(response.credential, decoded)
        
        // 觸發登入成功事件
        this.onLoginSuccess(decoded)
      } else if (response.error) {
        // 處理 Google 回應中的錯誤
        console.error('Google 登入錯誤:', response.error)
        this.handleGoogleError(response.error)
      }
    } catch (error) {
      console.error('處理 Google 登入失敗:', error)
      this.onLoginError(error)
    }
  }

  // 顯示登入按鈕
  renderSignInButton(elementId) {
    if (!this.isInitialized) {
      console.error('Google Auth 尚未初始化')
      return
    }

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 250
      }
    )
  }

  // 一鍵登入
  async signIn() {
    if (!this.isInitialized) {
      await this.init()
    }
    
    window.google.accounts.id.prompt()
  }

  // 登出
  signOut() {
    // 清除本地儲存
    localStorage.removeItem('google_jwt_token')
    localStorage.removeItem('user_profile')
    
    // Google 登出
    if (window.google) {
      window.google.accounts.id.disableAutoSelect()
    }
    
    // 觸發登出事件
    this.onLogout()
    
    console.log('✅ 用戶已登出')
    return true
  }

  // 儲存認證資料
  saveAuthData(token, userProfile) {
    try {
      // 儲存 JWT token
      localStorage.setItem('google_jwt_token', token)
      
      // 儲存用戶資料
      const userData = {
        id: userProfile.sub,
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        given_name: userProfile.given_name,
        family_name: userProfile.family_name,
        email_verified: userProfile.email_verified,
        loginTime: new Date().toISOString()
      }
      
      localStorage.setItem('user_profile', JSON.stringify(userData))
      console.log('✅ 認證資料已儲存')
      
      return userData
    } catch (error) {
      console.error('❌ 儲存認證資料失敗:', error)
      throw error
    }
  }

  // 獲取儲存的用戶資料
  getUserProfile() {
    try {
      const userProfile = localStorage.getItem('user_profile')
      return userProfile ? JSON.parse(userProfile) : null
    } catch (error) {
      console.error('獲取用戶資料失敗:', error)
      return null
    }
  }

  // 獲取 JWT token
  getToken() {
    return localStorage.getItem('google_jwt_token')
  }

  // 檢查是否已登入
  isAuthenticated() {
    const token = this.getToken()
    const userProfile = this.getUserProfile()
    
    if (!token || !userProfile) {
      return false
    }

    try {
      // 檢查 token 是否過期
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000
      
      if (decoded.exp < currentTime) {
        // Token 已過期，清除資料
        this.signOut()
        return false
      }
      
      return true
    } catch (error) {
      console.error('檢查認證狀態失敗:', error)
      this.signOut()
      return false
    }
  }

  // 處理初始化錯誤
  handleInitializationError(error) {
    const errorMessage = this.getErrorMessage(error)
    console.error('Google Auth 初始化錯誤:', errorMessage)
    
    // 觸發初始化錯誤事件
    this.onInitializationError(errorMessage)
  }

  // 處理 Google 特定錯誤
  handleGoogleError(error) {
    const errorMessage = this.getGoogleErrorMessage(error)
    console.error('Google 認證錯誤:', errorMessage)
    
    // 觸發 Google 錯誤事件
    this.onGoogleError(errorMessage)
  }

  // 獲取錯誤訊息
  getErrorMessage(error) {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    return '未知錯誤'
  }

  // 獲取 Google 特定錯誤訊息
  getGoogleErrorMessage(error) {
    const errorMessages = {
      'popup_closed_by_user': '用戶關閉了登入視窗',
      'access_denied': '用戶拒絕了授權請求',
      'network_error': '網路連接錯誤，請檢查網路設定',
      'popup_blocked': '瀏覽器阻止了彈出視窗，請允許彈出視窗',
      'cors_error': 'CORS 錯誤：網域未被授權，請聯繫管理員',
      'invalid_client': '無效的客戶端 ID，請檢查配置',
      'origin_not_allowed': '網域未被授權：請在 Google Cloud Console 中設定授權的 JavaScript 來源',
      'fedcm_disabled': 'FedCM 已停用，但這可能在未來造成問題'
    }
    
    // 特殊處理常見錯誤模式
    if (typeof error === 'string') {
      if (error.includes('origin is not allowed')) {
        return `❌ 網域授權錯誤：當前網域 ${window.location.origin} 未在 Google Cloud Console 中設定為授權來源。請到 Google Cloud Console → APIs & Services → Credentials 中添加此網域。`
      }
      if (error.includes('FedCM')) {
        return `⚠️ FedCM 相關警告：${error}。建議更新代碼以符合新的 FedCM 要求。`
      }
    }
    
    return errorMessages[error] || `Google 認證錯誤: ${error}`
  }

  // 檢查 FedCM 支援
  checkFedCMSupport() {
    try {
      // 檢查瀏覽器是否支援 FedCM
      return 'IdentityCredential' in window && 'navigator' in window && 'credentials' in navigator
    } catch (error) {
      console.warn('FedCM 支援檢查失敗:', error)
      return false
    }
  }

  // 決定是否應該啟用 FedCM
  shouldEnableFedCM() {
    // 檢查當前日期，如果接近 2024年10月則建議啟用
    const currentDate = new Date()
    const fedcmMandatoryDate = new Date('2024-10-01')
    
    // 如果是 HTTPS 或 localhost，且接近強制日期，則啟用
    const isSecureContext = window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1'
    
    const isNearMandatoryDate = currentDate >= new Date('2024-09-01')
    
    if (isNearMandatoryDate) {
      console.log('⚠️ 接近 FedCM 強制日期，建議啟用 FedCM')
    }
    
    // 目前保守策略：只在安全上下文且接近強制日期時啟用
    return isSecureContext && isNearMandatoryDate
  }

  // 檢查 CORS 問題
  checkCorsIssue() {
    const currentOrigin = window.location.origin
    const validOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://localhost:5173',
      'https://127.0.0.1:5173'
    ]
    
    // 檢查是否為有效的開發環境來源
    const isValidOrigin = validOrigins.includes(currentOrigin)
    
    if (!isValidOrigin) {
      // 檢查是否為內部 IP (Google 不支援)
      const isInternalIP = /^https?:\/\/(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.)/.test(currentOrigin)
      
      if (isInternalIP) {
        console.warn(`⚠️ 內部 IP 網域問題：${currentOrigin} 不被 Google OAuth 支援`)
        console.warn('💡 解決方案：請使用 http://localhost:5173 或 http://127.0.0.1:5173 訪問')
        this.suggestOriginFix(currentOrigin)
        return false
      } else {
        console.warn(`⚠️ 可能的 CORS 問題：當前網域 ${currentOrigin} 可能未在 Google Cloud Console 中授權`)
        return false
      }
    }
    
    return true
  }

  // 建議來源修復方案
  suggestOriginFix(currentOrigin) {
    const port = new URL(currentOrigin).port || '5173'
    const suggestedUrls = [
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`
    ]
    
    console.log('🔧 建議的解決方案：')
    console.log('1. 使用以下網址之一訪問應用：')
    suggestedUrls.forEach(url => console.log(`   - ${url}`))
    console.log('2. 在 Google Cloud Console 中只需設定這兩個授權來源：')
    suggestedUrls.forEach(url => console.log(`   - ${url}`))
  }

  // 事件處理器 (可被外部覆蓋)
  onLoginSuccess(userProfile) {
    console.log('登入成功:', userProfile)
    // 可被外部覆蓋
  }

  onLoginError(error) {
    console.error('登入失敗:', error)
    // 可被外部覆蓋
  }

  onInitializationError(error) {
    console.error('初始化失敗:', error)
    // 可被外部覆蓋
  }

  onGoogleError(error) {
    console.error('Google 錯誤:', error)
    // 可被外部覆蓋
  }

  onLogout() {
    console.log('已登出')
    // 可被外部覆蓋
  }
}

// 創建單例實例
const googleAuthService = new GoogleAuthService()

export default googleAuthService