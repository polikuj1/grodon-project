// Firebase 認證服務 (支援 Google OAuth)
import { getAuth, signInWithCredential, GoogleAuthProvider, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { app } from '../firebase.js'

class FirebaseAuthService {
  constructor() {
    this.auth = getAuth(app)
    this.isInitialized = false
  }

  /**
   * 使用 Google OAuth 憑證登入 Firebase
   * @param {string} idToken - Google OAuth ID Token
   */
  async signInWithGoogleCredential(idToken) {
    try {
      console.log('🔐 使用 Google 憑證登入 Firebase...')
      
      // 建立 Google 認證憑證
      const credential = GoogleAuthProvider.credential(idToken)
      
      // 使用憑證登入 Firebase
      const userCredential = await signInWithCredential(this.auth, credential)
      const user = userCredential.user
      
      console.log('✅ Firebase Google 登入成功:', user.uid)
      this.isInitialized = true
      
      return user
    } catch (error) {
      console.error('❌ Firebase Google 登入失敗:', error)
      throw error
    }
  }

  /**
   * 初始化 Firebase 認證 (備用匿名登入)
   */
  async initMockAuth() {
    try {
      console.log('🔐 初始化 Firebase 認證...')
      
      // 檢查是否已經有用戶登入
      if (this.auth.currentUser) {
        console.log('✅ Firebase 用戶已存在:', this.auth.currentUser.uid)
        return this.auth.currentUser
      }
      
      // 使用匿名登入作為備用方案
      const userCredential = await signInAnonymously(this.auth)
      const user = userCredential.user
      
      console.log('✅ Firebase 匿名登入成功:', user.uid)
      this.isInitialized = true
      
      return user
    } catch (error) {
      console.error('❌ Firebase 匿名登入失敗:', error)
      throw error
    }
  }

  /**
   * 監聽認證狀態變化
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(this.auth, callback)
  }

  /**
   * 獲取當前用戶
   */
  getCurrentUser() {
    return this.auth.currentUser
  }

  /**
   * 登出
   */
  async signOut() {
    try {
      await this.auth.signOut()
      console.log('✅ Firebase 登出成功')
    } catch (error) {
      console.error('❌ Firebase 登出失敗:', error)
    }
  }
}

// 創建單例
const firebaseAuthService = new FirebaseAuthService()
export default firebaseAuthService