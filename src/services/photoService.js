// 智能照片服務 - 多重儲存後端支援 + Firebase 資料庫
import { 
  getDatabase, 
  ref as dbRef, 
  push, 
  set, 
  get, 
  query, 
  orderByChild, 
  remove 
} from 'firebase/database'
import { app } from '../firebase.js'
import storageService, { STORAGE_PROVIDERS } from './storageService.js'

// 初始化 Firebase 資料庫
const database = getDatabase(app)

// 照片服務類
export class PhotoService {
  constructor() {
    this.storageService = storageService
    this.database = database
  }

  /**
   * 上傳圖片到儲存服務 (智能選擇後端)
   * @param {File} file - 圖片檔案
   * @param {string} fileName - 檔案名稱
   * @returns {Promise<string>} - 圖片下載連結
   */
  async uploadImage(file, fileName) {
    try {
      console.log('📤 開始上傳檔案:', fileName, '大小:', file.size, 'bytes')
      console.log('🔧 當前儲存提供者:', this.storageService.getProvider())
      
      // 使用統一儲存服務上傳檔案
      const downloadURL = await this.storageService.uploadFile(file, fileName, 'photos')
      console.log('✅ 檔案上傳完成:', downloadURL)
      
      return downloadURL
    } catch (error) {
      console.error('❌ 圖片上傳失敗:', error)
      throw error // 儲存服務已經處理了詳細的錯誤訊息
    }
  }

  /**
   * 創建縮圖（簡化版本 - 使用 canvas 壓縮）
   * @param {File} file - 原始圖片檔案
   * @param {number} maxWidth - 最大寬度
   * @param {number} maxHeight - 最大高度
   * @param {number} quality - 壓縮品質 (0-1)
   * @returns {Promise<Blob>} - 壓縮後的圖片 Blob
   */
  async createThumbnail(file, maxWidth = 300, maxHeight = 300, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 計算縮放比例
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
        const width = img.width * ratio
        const height = img.height * ratio
        
        // 設置 canvas 尺寸
        canvas.width = width
        canvas.height = height
        
        // 繪製並壓縮圖片
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 保存照片資料到 Firebase Database
   * @param {Object} photoData - 照片資料
   * @returns {Promise<string>} - 照片ID
   */
  async savePhotoData(photoData) {
    try {
      // 創建照片資料結構
      const photoRecord = {
        ...photoData,
        uploadedAt: new Date().toISOString(),
        id: null // 會由 Firebase 自動生成
      }
      
      // 推送到 photos 節點
      const photosRef = dbRef(this.database, 'photos')
      const newPhotoRef = push(photosRef)
      
      // 設置 ID
      photoRecord.id = newPhotoRef.key
      
      // 保存資料
      await set(newPhotoRef, photoRecord)
      
      console.log('✅ 照片資料保存成功:', newPhotoRef.key)
      return newPhotoRef.key
    } catch (error) {
      console.error('❌ 照片資料保存失敗:', error)
      throw new Error(`資料保存失敗: ${error.message}`)
    }
  }

  /**
   * 獲取所有照片
   * @returns {Promise<Array>} - 照片列表
   */
  async getAllPhotos() {
    try {
      const photosRef = dbRef(this.database, 'photos')
      const photosQuery = query(photosRef, orderByChild('photoDate'))
      
      const snapshot = await get(photosQuery)
      
      if (!snapshot.exists()) {
        console.log('📷 沒有找到照片資料')
        return []
      }
      
      const photos = []
      snapshot.forEach((childSnapshot) => {
        const photo = childSnapshot.val()
        photos.push(photo)
      })
      
      // 按日期降序排列（最新的在前）
      photos.sort((a, b) => new Date(b.photoDate) - new Date(a.photoDate))
      
      console.log(`✅ 成功獲取 ${photos.length} 張照片`)
      return photos
    } catch (error) {
      console.error('❌ 獲取照片失敗:', error)
      throw new Error(`獲取照片失敗: ${error.message}`)
    }
  }

  /**
   * 根據ID獲取單張照片
   * @param {string} photoId - 照片ID
   * @returns {Promise<Object>} - 照片資料
   */
  async getPhotoById(photoId) {
    try {
      const photoRef = dbRef(this.database, `photos/${photoId}`)
      const snapshot = await get(photoRef)
      
      if (!snapshot.exists()) {
        throw new Error('照片不存在')
      }
      
      return snapshot.val()
    } catch (error) {
      console.error('❌ 獲取照片失敗:', error)
      throw new Error(`獲取照片失敗: ${error.message}`)
    }
  }

  /**
   * 刪除照片
   * @param {string} photoId - 照片ID
   * @param {string} imageUrl - 圖片URL
   * @param {string} thumbnailUrl - 縮圖URL (可選)
   */
  async deletePhoto(photoId, imageUrl, thumbnailUrl = null) {
    try {
      // 刪除資料庫記錄
      const photoRef = dbRef(this.database, `photos/${photoId}`)
      await remove(photoRef)
      
      // 使用統一儲存服務刪除圖片
      if (imageUrl) {
        await this.storageService.deleteFile(imageUrl)
      }
      
      // 刪除縮圖
      if (thumbnailUrl) {
        await this.storageService.deleteFile(thumbnailUrl)
      }
      
      console.log('✅ 照片刪除成功:', photoId)
    } catch (error) {
      console.error('❌ 照片刪除失敗:', error)
      throw new Error(`照片刪除失敗: ${error.message}`)
    }
  }

  /**
   * 從存儲 URL 中提取路徑 (委派給儲存服務)
   * @param {string} url - 儲存 URL
   * @returns {string} - Storage 路徑
   */
  getStoragePathFromUrl(url) {
    // 根據 URL 格式判斷是哪種儲存服務
    if (url.includes('firebasestorage.googleapis.com')) {
      return this.storageService.getFilePathFromFirebaseUrl(url)
    } else if (url.includes('storage.googleapis.com')) {
      // 需要動態載入 GCS 服務來解析 URL
      return url.replace('https://storage.googleapis.com/', '').split('/').slice(1).join('/')
    } else {
      console.warn('⚠️ 未知的儲存 URL 格式:', url)
      return url
    }
  }

  /**
   * 完整的照片上傳流程 (智能儲存選擇)
   * @param {File} imageFile - 圖片檔案
   * @param {Object} photoData - 照片元資料
   * @returns {Promise<string>} - 照片ID
   */
  async uploadPhoto(imageFile, photoData) {
    let selectedProvider = null
    
    try {
      console.log('🚀 開始照片上傳流程...')
      
      // 智能選擇最佳儲存提供者
      selectedProvider = await this.storageService.selectBestProvider()
      console.log('🤖 自動選擇儲存提供者:', selectedProvider)
      
      // 生成唯一檔名
      const timestamp = Date.now()
      const fileExtension = imageFile.name.split('.').pop()
      const fileName = `photo_${timestamp}.${fileExtension}`
      const thumbnailName = `thumbnail_${timestamp}.${fileExtension}`
      
      // 上傳原圖
      console.log('📤 上傳原圖...')
      const imageUrl = await this.uploadImage(imageFile, fileName)
      
      // 創建和上傳縮圖
      console.log('🖼️ 創建並上傳縮圖...')
      const thumbnailBlob = await this.createThumbnail(imageFile)
      const thumbnailUrl = await this.uploadImage(thumbnailBlob, thumbnailName)
      
      // 準備完整的照片資料
      const completePhotoData = {
        ...photoData,
        imageUrl,
        thumbnailUrl,
        fileName,
        thumbnailName,
        fileSize: imageFile.size,
        fileType: imageFile.type,
        storageProvider: selectedProvider // 記錄實際使用的提供者
      }
      
      // 保存到 Firebase 資料庫
      console.log('💾 保存照片資料到 Firebase Database...')
      const photoId = await this.savePhotoData(completePhotoData)
      
      console.log(`✅ 照片上傳完成! ${selectedProvider.toUpperCase()} 儲存 + Firebase 資料庫`, photoId)
      return photoId
    } catch (error) {
      console.error('❌ 照片上傳流程失敗:', error)
      
      // 如果是特定儲存提供者失敗，嘗試備用方案
      if (selectedProvider === STORAGE_PROVIDERS.GCS_BROWSER) {
        console.log('🔄 GCS 上傳失敗，嘗試 Firebase Storage 備用方案...')
        try {
          this.storageService.setProvider(STORAGE_PROVIDERS.FIREBASE)
          return await this.uploadPhoto(imageFile, photoData)
        } catch (fallbackError) {
          console.error('❌ Firebase 備用方案也失敗:', fallbackError)
          throw new Error('所有儲存選項都失敗了，請稍後再試')
        }
      }
      
      throw error
    }
  }
}

// 創建單例實例
const photoService = new PhotoService()
export default photoService