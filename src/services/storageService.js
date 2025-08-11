// 統一的儲存服務 - 支援多種後端
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { app } from '../firebase.js'

// 初始化 Firebase Storage
const firebaseStorage = getStorage(app)

// 儲存提供者類型
const STORAGE_PROVIDERS = {
  FIREBASE: 'firebase',
  GCS_BROWSER: 'gcs-browser',
  GCS_SERVER: 'gcs-server'
}

// 儲存服務類 - 支援多種後端
export class StorageService {
  constructor() {
    // 設定預設提供者為 Firebase (瀏覽器兼容性最好)
    this.provider = STORAGE_PROVIDERS.FIREBASE
    this.firebaseStorage = firebaseStorage
    
    console.log('📦 儲存服務初始化，使用提供者:', this.provider)
  }

  /**
   * 上傳檔案
   * @param {File|Blob} file - 要上傳的檔案
   * @param {string} fileName - 檔案名稱
   * @param {string} folder - 資料夾名稱 (預設: photos)
   * @returns {Promise<string>} - 下載 URL
   */
  async uploadFile(file, fileName, folder = 'photos') {
    switch (this.provider) {
      case STORAGE_PROVIDERS.FIREBASE:
        return await this.uploadToFirebase(file, fileName, folder)
      
      case STORAGE_PROVIDERS.GCS_BROWSER:
        return await this.uploadToGCSBrowser(file, fileName, folder)
      
      default:
        throw new Error(`不支援的儲存提供者: ${this.provider}`)
    }
  }

  /**
   * 上傳到 Firebase Storage
   * @param {File|Blob} file - 檔案
   * @param {string} fileName - 檔案名稱  
   * @param {string} folder - 資料夾
   * @returns {Promise<string>} - 下載 URL
   */
  async uploadToFirebase(file, fileName, folder) {
    try {
      console.log('📤 上傳檔案到 Firebase Storage:', fileName)
      
      const filePath = `${folder}/${fileName}`
      const fileRef = storageRef(this.firebaseStorage, filePath)
      
      // 上傳檔案
      const snapshot = await uploadBytes(fileRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name || fileName
        }
      })
      
      // 獲取下載 URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      console.log('✅ Firebase 上傳成功:', downloadURL)
      return downloadURL
    } catch (error) {
      console.error('❌ Firebase 上傳失敗:', error)
      
      // 詳細的錯誤處理
      if (error.code) {
        switch (error.code) {
          case 'storage/unauthorized':
            throw new Error('沒有上傳權限。請檢查 Firebase Storage 安全規則。')
          case 'storage/canceled':
            throw new Error('上傳已取消')
          case 'storage/quota-exceeded':
            throw new Error('儲存空間已滿')
          case 'storage/unauthenticated':
            throw new Error('用戶未認證。請重新登入。')
          case 'storage/retry-limit-exceeded':
            throw new Error('上傳重試次數超限，請稍後再試')
          case 'storage/invalid-format':
            throw new Error('檔案格式不支援')
          default:
            throw new Error(`Firebase Storage 錯誤 (${error.code}): ${error.message}`)
        }
      } else {
        throw new Error(`檔案上傳失敗: ${error.message}`)
      }
    }
  }

  /**
   * 上傳到 GCS (瀏覽器版本)
   * @param {File|Blob} file - 檔案
   * @param {string} fileName - 檔案名稱
   * @param {string} folder - 資料夾
   * @returns {Promise<string>} - 下載 URL
   */
  async uploadToGCSBrowser(file, fileName, folder) {
    // 動態載入 GCS 瀏覽器服務
    const { default: gcsServiceBrowser } = await import('./gcsServiceBrowser.js')
    
    if (!gcsServiceBrowser) {
      throw new Error('GCS 瀏覽器服務未初始化，回退到 Firebase Storage')
    }
    
    return await gcsServiceBrowser.uploadFile(file, fileName, folder)
  }

  /**
   * 刪除檔案
   * @param {string} fileUrl - 檔案 URL
   * @returns {Promise<void>}
   */
  async deleteFile(fileUrl) {
    try {
      switch (this.provider) {
        case STORAGE_PROVIDERS.FIREBASE:
          const fileRef = storageRef(this.firebaseStorage, this.getFilePathFromFirebaseUrl(fileUrl))
          await deleteObject(fileRef)
          break
        
        case STORAGE_PROVIDERS.GCS_BROWSER:
          const { default: gcsServiceBrowser } = await import('./gcsServiceBrowser.js')
          if (gcsServiceBrowser) {
            const filePath = gcsServiceBrowser.getFilePathFromUrl(fileUrl)
            const pathParts = filePath.split('/')
            const fileName = pathParts.pop()
            const folder = pathParts.join('/')
            await gcsServiceBrowser.deleteFile(fileName, folder)
          }
          break
        
        default:
          throw new Error(`不支援的儲存提供者: ${this.provider}`)
      }
      
      console.log('✅ 檔案刪除成功:', fileUrl)
    } catch (error) {
      console.error('❌ 檔案刪除失敗:', error)
      
      if (error.code === 'storage/object-not-found') {
        console.warn('⚠️ 檔案不存在，可能已被刪除')
        return // 檔案不存在時不拋出錯誤
      }
      
      throw new Error(`檔案刪除失敗: ${error.message}`)
    }
  }

  /**
   * 從 Firebase Storage URL 中提取路徑
   * @param {string} url - Firebase Storage URL
   * @returns {string} - 檔案路徑
   */
  getFilePathFromFirebaseUrl(url) {
    try {
      const urlObj = new URL(url)
      const path = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0])
      return path
    } catch (error) {
      console.error('❌ 解析 Firebase URL 失敗:', error)
      throw new Error(`URL 解析失敗: ${error.message}`)
    }
  }

  /**
   * 設定儲存提供者
   * @param {string} provider - 提供者類型
   */
  setProvider(provider) {
    if (!Object.values(STORAGE_PROVIDERS).includes(provider)) {
      throw new Error(`無效的儲存提供者: ${provider}`)
    }
    
    this.provider = provider
    console.log('🔄 儲存提供者已更改為:', provider)
  }

  /**
   * 獲取當前提供者
   * @returns {string} - 當前提供者
   */
  getProvider() {
    return this.provider
  }

  /**
   * 測試連接
   * @returns {Promise<boolean>} - 連接是否成功
   */
  async testConnection() {
    try {
      console.log('🔍 測試儲存服務連接，提供者:', this.provider)
      
      switch (this.provider) {
        case STORAGE_PROVIDERS.FIREBASE:
          // Firebase Storage 連接測試
          const testRef = storageRef(this.firebaseStorage, 'test-connection')
          // 嘗試獲取 metadata (不會實際下載檔案)
          try {
            await getDownloadURL(testRef)
          } catch (error) {
            // 檔案不存在是正常的，表示連接正常
            if (error.code === 'storage/object-not-found') {
              return true
            }
            throw error
          }
          return true
        
        case STORAGE_PROVIDERS.GCS_BROWSER:
          const { default: gcsServiceBrowser } = await import('./gcsServiceBrowser.js')
          return gcsServiceBrowser ? await gcsServiceBrowser.testConnection() : false
        
        default:
          return false
      }
    } catch (error) {
      console.error('❌ 儲存服務連接測試失敗:', error)
      return false
    }
  }

  /**
   * 智能提供者選擇 - 根據環境和可用性自動選擇最佳提供者
   * @returns {Promise<string>} - 選擇的提供者
   */
  async selectBestProvider() {
    console.log('🤖 開始智能提供者選擇...')
    
    // 1. 測試 Firebase Storage
    this.setProvider(STORAGE_PROVIDERS.FIREBASE)
    const firebaseWorks = await this.testConnection()
    
    if (firebaseWorks) {
      console.log('✅ Firebase Storage 可用，選擇 Firebase')
      return STORAGE_PROVIDERS.FIREBASE
    }
    
    // 2. 測試 GCS 瀏覽器版本
    this.setProvider(STORAGE_PROVIDERS.GCS_BROWSER)
    const gcsBrowserWorks = await this.testConnection()
    
    if (gcsBrowserWorks) {
      console.log('✅ GCS 瀏覽器版本可用，選擇 GCS')
      return STORAGE_PROVIDERS.GCS_BROWSER
    }
    
    // 3. 回退到 Firebase (即使測試失敗也嘗試使用)
    console.log('⚠️ 所有提供者測試都失敗，回退到 Firebase Storage')
    this.setProvider(STORAGE_PROVIDERS.FIREBASE)
    return STORAGE_PROVIDERS.FIREBASE
  }
}

// 建立單例實例
const storageService = new StorageService()

// 導出提供者常數以供外部使用
export { STORAGE_PROVIDERS }
export default storageService