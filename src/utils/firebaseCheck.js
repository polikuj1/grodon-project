// Firebase 配置檢查工具
import { getStorage, ref as storageRef, uploadBytes } from 'firebase/storage'
import { getDatabase, ref as dbRef, set } from 'firebase/database'
import { app } from '../firebase.js'

export class FirebaseChecker {
  constructor() {
    this.storage = getStorage(app)
    this.database = getDatabase(app)
  }

  /**
   * 檢查 Firebase Storage 連接和權限
   */
  async checkStorageAccess() {
    try {
      console.log('🔍 檢查 Firebase Storage 存取權限...')
      
      // 創建一個測試檔案
      const testBlob = new Blob(['test'], { type: 'text/plain' })
      const testRef = storageRef(this.storage, 'test/access_test.txt')
      
      // 嘗試上傳測試檔案
      await uploadBytes(testRef, testBlob)
      
      console.log('✅ Firebase Storage 存取正常')
      return { success: true, message: 'Storage 連接正常' }
    } catch (error) {
      console.error('❌ Firebase Storage 存取失敗:', error)
      
      let message = 'Storage 存取失敗'
      if (error.code === 'storage/unauthorized') {
        message = 'Storage 權限不足，請檢查安全規則'
      } else if (error.code === 'storage/unauthenticated') {
        message = 'Storage 需要認證，請檢查安全規則'
      } else if (error.message.includes('CORS')) {
        message = 'CORS 錯誤，請檢查 Firebase 配置'
      }
      
      return { success: false, error: error.code, message }
    }
  }

  /**
   * 檢查 Firebase Database 連接和權限
   */
  async checkDatabaseAccess() {
    try {
      console.log('🔍 檢查 Firebase Database 存取權限...')
      
      // 嘗試寫入測試資料
      const testRef = dbRef(this.database, 'test/access_test')
      await set(testRef, {
        timestamp: Date.now(),
        message: 'access test'
      })
      
      console.log('✅ Firebase Database 存取正常')
      return { success: true, message: 'Database 連接正常' }
    } catch (error) {
      console.error('❌ Firebase Database 存取失敗:', error)
      
      let message = 'Database 存取失敗'
      if (error.code === 'PERMISSION_DENIED') {
        message = 'Database 權限不足，請檢查安全規則'
      }
      
      return { success: false, error: error.code, message }
    }
  }

  /**
   * 執行完整的 Firebase 連接檢查
   */
  async runFullCheck() {
    console.log('🚀 開始 Firebase 連接檢查...')
    
    const results = {
      storage: await this.checkStorageAccess(),
      database: await this.checkDatabaseAccess()
    }
    
    const allSuccess = results.storage.success && results.database.success
    
    console.log('📊 Firebase 檢查結果:', results)
    
    if (allSuccess) {
      console.log('🎉 Firebase 配置完全正常！')
    } else {
      console.log('⚠️ Firebase 配置有問題，請檢查：')
      if (!results.storage.success) {
        console.log('- Storage:', results.storage.message)
      }
      if (!results.database.success) {
        console.log('- Database:', results.database.message)
      }
    }
    
    return { success: allSuccess, results }
  }
}

// 創建單例
const firebaseChecker = new FirebaseChecker()
export default firebaseChecker