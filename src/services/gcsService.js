// Google Cloud Storage 服務
import { Storage } from '@google-cloud/storage'

// 環境變數配置
const GCS_CONFIG = {
  projectId: import.meta.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: import.meta.env.GOOGLE_CLOUD_KEYFILE || process.env.GOOGLE_CLOUD_KEYFILE,
  bucketName: import.meta.env.GCS_BUCKET_NAME || process.env.GCS_BUCKET_NAME
}

console.log('🔧 GCS 配置:', {
  projectId: GCS_CONFIG.projectId,
  keyFilename: GCS_CONFIG.keyFilename,
  bucketName: GCS_CONFIG.bucketName
})

// Google Cloud Storage 服務類
export class GCSService {
  constructor() {
    try {
      // 初始化 Storage 客戶端
      this.storage = new Storage({
        projectId: GCS_CONFIG.projectId,
        keyFilename: GCS_CONFIG.keyFilename,
      })
      
      this.bucket = this.storage.bucket(GCS_CONFIG.bucketName)
      
      console.log('✅ GCS 服務初始化成功')
    } catch (error) {
      console.error('❌ GCS 初始化失敗:', error)
      throw new Error(`GCS 初始化失敗: ${error.message}`)
    }
  }

  /**
   * 上傳檔案到 Google Cloud Storage
   * @param {File|Blob} file - 要上傳的檔案
   * @param {string} fileName - 檔案名稱
   * @param {string} folder - 資料夾名稱 (預設: photos)
   * @returns {Promise<string>} - 公開存取 URL
   */
  async uploadFile(file, fileName, folder = 'photos') {
    try {
      console.log('📤 開始上傳檔案到 GCS:', fileName)
      
      // 建立檔案路徑
      const filePath = `${folder}/${fileName}`
      const gcsFile = this.bucket.file(filePath)
      
      // 將檔案轉換為 Buffer（處理 File 或 Blob）
      const buffer = await this.fileToBuffer(file)
      
      // 設定上傳選項
      const options = {
        metadata: {
          contentType: file.type || 'image/jpeg',
          cacheControl: 'public, max-age=31536000', // 1年快取
        },
        resumable: false, // 小檔案不需要斷點續傳
      }
      
      // 上傳檔案
      await gcsFile.save(buffer, options)
      
      // 設定檔案為公開讀取
      await gcsFile.makePublic()
      
      // 生成公開存取 URL
      const publicUrl = `https://storage.googleapis.com/${GCS_CONFIG.bucketName}/${filePath}`
      
      console.log('✅ 檔案上傳成功:', publicUrl)
      return publicUrl
    } catch (error) {
      console.error('❌ GCS 檔案上傳失敗:', error)
      
      // 詳細的錯誤處理
      if (error.code) {
        switch (error.code) {
          case 403:
            throw new Error('沒有上傳權限。請檢查 GCS 服務帳戶權限設定。')
          case 404:
            throw new Error('找不到指定的儲存桶。請檢查桶名稱是否正確。')
          case 401:
            throw new Error('身份驗證失敗。請檢查 GCS 金鑰檔案。')
          case 409:
            throw new Error('檔案衝突。請稍後再試或使用不同的檔名。')
          case 413:
            throw new Error('檔案太大。請壓縮檔案後再試。')
          case 429:
            throw new Error('請求過於頻繁。請稍後再試。')
          default:
            throw new Error(`GCS 上傳錯誤 (${error.code}): ${error.message}`)
        }
      } else {
        throw new Error(`檔案上傳失敗: ${error.message}`)
      }
    }
  }

  /**
   * 刪除 GCS 中的檔案
   * @param {string} fileName - 檔案名稱
   * @param {string} folder - 資料夾名稱 (預設: photos)
   * @returns {Promise<void>}
   */
  async deleteFile(fileName, folder = 'photos') {
    try {
      const filePath = `${folder}/${fileName}`
      const gcsFile = this.bucket.file(filePath)
      
      await gcsFile.delete()
      console.log('✅ GCS 檔案刪除成功:', filePath)
    } catch (error) {
      console.error('❌ GCS 檔案刪除失敗:', error)
      
      if (error.code === 404) {
        console.warn('⚠️ 檔案不存在，可能已被刪除')
        return // 檔案不存在時不拋出錯誤
      }
      
      throw new Error(`檔案刪除失敗: ${error.message}`)
    }
  }

  /**
   * 從 GCS URL 中提取檔案路徑
   * @param {string} url - GCS 公開 URL
   * @returns {string} - 檔案路徑
   */
  getFilePathFromUrl(url) {
    try {
      // GCS 公開 URL 格式: https://storage.googleapis.com/bucket-name/path/to/file
      const urlPattern = new RegExp(`https://storage.googleapis.com/${GCS_CONFIG.bucketName}/(.+)`)
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
   * 檢查檔案是否存在
   * @param {string} fileName - 檔案名稱
   * @param {string} folder - 資料夾名稱 (預設: photos)
   * @returns {Promise<boolean>} - 檔案是否存在
   */
  async fileExists(fileName, folder = 'photos') {
    try {
      const filePath = `${folder}/${fileName}`
      const gcsFile = this.bucket.file(filePath)
      
      const [exists] = await gcsFile.exists()
      return exists
    } catch (error) {
      console.error('❌ 檢查檔案存在性失敗:', error)
      return false
    }
  }

  /**
   * 獲取檔案的中繼資料
   * @param {string} fileName - 檔案名稱
   * @param {string} folder - 資料夾名稱 (預設: photos)
   * @returns {Promise<Object>} - 檔案中繼資料
   */
  async getFileMetadata(fileName, folder = 'photos') {
    try {
      const filePath = `${folder}/${fileName}`
      const gcsFile = this.bucket.file(filePath)
      
      const [metadata] = await gcsFile.getMetadata()
      return metadata
    } catch (error) {
      console.error('❌ 獲取檔案中繼資料失敗:', error)
      throw new Error(`獲取中繼資料失敗: ${error.message}`)
    }
  }

  /**
   * 列出資料夾中的所有檔案
   * @param {string} folder - 資料夾名稱 (預設: photos)
   * @param {number} maxResults - 最大結果數 (預設: 1000)
   * @returns {Promise<Array>} - 檔案列表
   */
  async listFiles(folder = 'photos', maxResults = 1000) {
    try {
      const options = {
        prefix: `${folder}/`,
        maxResults: maxResults,
      }
      
      const [files] = await this.bucket.getFiles(options)
      
      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        timeCreated: file.metadata.timeCreated,
        updated: file.metadata.updated,
        publicUrl: `https://storage.googleapis.com/${GCS_CONFIG.bucketName}/${file.name}`
      }))
    } catch (error) {
      console.error('❌ 列出檔案失敗:', error)
      throw new Error(`列出檔案失敗: ${error.message}`)
    }
  }

  /**
   * 將 File 或 Blob 轉換為 Buffer
   * @param {File|Blob} file - 檔案物件
   * @returns {Promise<Buffer>} - Buffer 資料
   */
  async fileToBuffer(file) {
    return new Promise((resolve, reject) => {
      if (file instanceof ArrayBuffer) {
        resolve(Buffer.from(file))
        return
      }
      
      const reader = new FileReader()
      
      reader.onload = () => {
        const arrayBuffer = reader.result
        resolve(Buffer.from(arrayBuffer))
      }
      
      reader.onerror = () => {
        reject(new Error('讀取檔案失敗'))
      }
      
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 測試 GCS 連接
   * @returns {Promise<boolean>} - 連接是否成功
   */
  async testConnection() {
    try {
      console.log('🔍 測試 GCS 連接...')
      
      // 嘗試獲取桶的中繼資料
      await this.bucket.getMetadata()
      
      console.log('✅ GCS 連接測試成功')
      return true
    } catch (error) {
      console.error('❌ GCS 連接測試失敗:', error)
      return false
    }
  }
}

// 創建單例實例
const gcsService = new GCSService()
export default gcsService