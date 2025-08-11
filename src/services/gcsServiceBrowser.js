// 瀏覽器兼容的 Google Cloud Storage 服務
// 使用 REST API 而非 Node.js SDK

// 環境變數配置
const GCS_CONFIG = {
  projectId: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID,
  bucketName: import.meta.env.VITE_GCS_BUCKET_NAME,
  // 注意：瀏覽器環境不能直接使用服務帳戶金鑰檔案
  // 需要使用 Firebase Auth 或 Google Identity Services
}

console.log('🔧 瀏覽器 GCS 配置:', {
  projectId: GCS_CONFIG.projectId,
  bucketName: GCS_CONFIG.bucketName
})

// 瀏覽器版本的 Google Cloud Storage 服務類
export class GCSServiceBrowser {
  constructor() {
    if (!GCS_CONFIG.projectId || !GCS_CONFIG.bucketName) {
      throw new Error('缺少必要的 GCS 環境變數配置')
    }
    
    this.projectId = GCS_CONFIG.projectId
    this.bucketName = GCS_CONFIG.bucketName
    this.baseUrl = 'https://storage.googleapis.com/storage/v1'
    this.uploadUrl = 'https://storage.googleapis.com/upload/storage/v1'
    
    console.log('✅ 瀏覽器 GCS 服務初始化成功')
  }

  /**
   * 獲取 Google 身份驗證 token
   * 目前使用公開上傳，生產環境需要適當的身份驗證
   * @returns {Promise<string|null>} - Access token
   */
  async getAccessToken() {
    // TODO: 實現 Google Identity Services 或 Firebase Auth
    // 目前返回 null，使用公開 bucket 政策
    return null
  }

  /**
   * 上傳檔案到 Google Cloud Storage (使用 REST API)
   * @param {File|Blob} file - 要上傳的檔案
   * @param {string} fileName - 檔案名稱
   * @param {string} folder - 資料夾名稱 (預設: photos)
   * @returns {Promise<string>} - 公開存取 URL
   */
  async uploadFile(file, fileName, folder = 'photos') {
    try {
      console.log('📤 瀏覽器環境上傳檔案到 GCS:', fileName)
      
      const objectName = `${folder}/${fileName}`
      
      // 方法 1: 嘗試使用簡單上傳 (需要 CORS 設定)
      const uploadUrl = `${this.uploadUrl}/b/${this.bucketName}/o?uploadType=media&name=${encodeURIComponent(objectName)}`
      
      const uploadOptions = {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file
      }

      // 如果有 access token，加入 Authorization header
      const token = await this.getAccessToken()
      if (token) {
        uploadOptions.headers['Authorization'] = `Bearer ${token}`
      }

      console.log('🌐 發送上傳請求到:', uploadUrl)
      const response = await fetch(uploadUrl, uploadOptions)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ GCS 上傳失敗響應:', response.status, errorText)
        
        // 檢查是否為 CORS 問題
        if (response.status === 0 || !response.status) {
          throw new Error('CORS 錯誤：無法連接到 Google Cloud Storage。請檢查 CORS 設定。')
        }
        
        throw new Error(`上傳失敗 (${response.status}): ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ GCS 上傳成功:', result)

      // 生成公開存取 URL
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${objectName}`
      console.log('🔗 公開 URL:', publicUrl)
      
      return publicUrl
    } catch (error) {
      console.error('❌ 瀏覽器 GCS 上傳失敗:', error)
      
      // 如果是網路錯誤或 CORS 問題，提供替代方案提示
      if (error.message.includes('CORS') || error.name === 'TypeError') {
        throw new Error('GCS 上傳失敗：CORS 設定問題。建議使用 Firebase Storage 作為替代方案。')
      }
      
      throw error
    }
  }

  /**
   * 檢查檔案是否存在 (使用 REST API)
   * @param {string} fileName - 檔案名稱
   * @param {string} folder - 資料夾名稱 (預設: photos)
   * @returns {Promise<boolean>} - 檔案是否存在
   */
  async fileExists(fileName, folder = 'photos') {
    try {
      const objectName = `${folder}/${fileName}`
      const url = `${this.baseUrl}/b/${this.bucketName}/o/${encodeURIComponent(objectName)}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      return response.ok
    } catch (error) {
      console.error('❌ 檢查檔案存在性失敗:', error)
      return false
    }
  }

  /**
   * 生成公開存取 URL
   * @param {string} fileName - 檔案名稱
   * @param {string} folder - 資料夾名稱 (預設: photos)
   * @returns {string} - 公開 URL
   */
  getPublicUrl(fileName, folder = 'photos') {
    const objectName = `${folder}/${fileName}`
    return `https://storage.googleapis.com/${this.bucketName}/${objectName}`
  }

  /**
   * 從 GCS URL 中提取檔案路徑
   * @param {string} url - GCS 公開 URL
   * @returns {string} - 檔案路徑
   */
  getFilePathFromUrl(url) {
    try {
      const urlPattern = new RegExp(`https://storage.googleapis.com/${this.bucketName}/(.+)`)
      const match = url.match(urlPattern)
      
      if (!match) {
        throw new Error('無效的 GCS URL 格式')
      }
      
      return decodeURIComponent(match[1])
    } catch (error) {
      console.error('❌ 解析 GCS URL 失敗:', error)
      throw new Error(`URL 解析失敗: ${error.message}`)
    }
  }

  /**
   * 刪除檔案 (需要適當的身份驗證)
   * @param {string} fileName - 檔案名稱
   * @param {string} folder - 資料夾名稱 (預設: photos)
   * @returns {Promise<void>}
   */
  async deleteFile(fileName, folder = 'photos') {
    try {
      const objectName = `${folder}/${fileName}`
      const url = `${this.baseUrl}/b/${this.bucketName}/o/${encodeURIComponent(objectName)}`
      
      const token = await this.getAccessToken()
      if (!token) {
        throw new Error('刪除檔案需要身份驗證')
      }
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`刪除失敗: ${response.status}`)
      }
      
      console.log('✅ 檔案刪除成功:', objectName)
    } catch (error) {
      console.error('❌ 檔案刪除失敗:', error)
      throw error
    }
  }

  /**
   * 測試連接 (簡化版本)
   * @returns {Promise<boolean>} - 連接是否成功
   */
  async testConnection() {
    try {
      console.log('🔍 測試瀏覽器 GCS 連接...')
      
      // 嘗試列出 bucket (可能因權限失敗，但至少能測試網路連通性)
      const url = `${this.baseUrl}/b/${this.bucketName}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      // 即使是 403 (權限不足) 也表示連接正常
      const success = response.ok || response.status === 403
      
      if (success) {
        console.log('✅ 瀏覽器 GCS 連接測試成功')
      } else {
        console.log('❌ 瀏覽器 GCS 連接測試失敗:', response.status)
      }
      
      return success
    } catch (error) {
      console.error('❌ 瀏覽器 GCS 連接測試失敗:', error)
      return false
    }
  }
}

// 建立單例實例
let gcsServiceBrowser
try {
  gcsServiceBrowser = new GCSServiceBrowser()
} catch (error) {
  console.warn('⚠️ 瀏覽器 GCS 服務初始化失敗:', error)
  gcsServiceBrowser = null
}

export default gcsServiceBrowser