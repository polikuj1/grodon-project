// 儲存服務連接測試
import storageService, { STORAGE_PROVIDERS } from './storageService.js'

export class StorageTestService {
  /**
   * 執行儲存服務連接測試
   * @returns {Promise<Object>} 測試結果
   */
  async runConnectionTest() {
    const results = {
      firebase: { connection: false, upload: false, provider: STORAGE_PROVIDERS.FIREBASE },
      gcsBrowser: { connection: false, upload: false, provider: STORAGE_PROVIDERS.GCS_BROWSER },
      selectedProvider: null,
      smartSelection: false,
      errors: [],
      details: {}
    }

    try {
      console.log('🔍 開始多重儲存服務連接測試...')

      // 1. 測試 Firebase Storage
      console.log('1️⃣ 測試 Firebase Storage...')
      try {
        storageService.setProvider(STORAGE_PROVIDERS.FIREBASE)
        results.firebase.connection = await storageService.testConnection()
        
        if (results.firebase.connection) {
          console.log('✅ Firebase Storage 連接成功')
          
          // 測試上傳功能
          const testFile = this.createTestFile()
          const testFileName = `test_firebase_${Date.now()}.txt`
          
          try {
            const uploadUrl = await storageService.uploadFile(testFile, testFileName, 'test')
            results.firebase.upload = true
            results.details.firebaseTestUrl = uploadUrl
            console.log('✅ Firebase 上傳測試成功')
            
            // 清理測試檔案
            await storageService.deleteFile(uploadUrl)
          } catch (uploadError) {
            console.log('⚠️ Firebase 上傳測試失敗:', uploadError.message)
            results.errors.push(`Firebase 上傳失敗: ${uploadError.message}`)
          }
        } else {
          console.log('❌ Firebase Storage 連接失敗')
          results.errors.push('Firebase Storage 連接失敗')
        }
      } catch (error) {
        console.error('❌ Firebase Storage 測試錯誤:', error)
        results.errors.push(`Firebase 測試錯誤: ${error.message}`)
      }

      // 2. 測試 GCS 瀏覽器版本
      console.log('2️⃣ 測試 GCS 瀏覽器版本...')
      try {
        storageService.setProvider(STORAGE_PROVIDERS.GCS_BROWSER)
        results.gcsBrowser.connection = await storageService.testConnection()
        
        if (results.gcsBrowser.connection) {
          console.log('✅ GCS 瀏覽器版本連接成功')
          
          // 測試上傳功能
          const testFile = this.createTestFile()
          const testFileName = `test_gcs_${Date.now()}.txt`
          
          try {
            const uploadUrl = await storageService.uploadFile(testFile, testFileName, 'test')
            results.gcsBrowser.upload = true
            results.details.gcsTestUrl = uploadUrl
            console.log('✅ GCS 瀏覽器上傳測試成功')
            
            // GCS 刪除可能需要認證，暫時跳過
            console.log('ℹ️ GCS 測試檔案清理跳過（需要認證）')
          } catch (uploadError) {
            console.log('⚠️ GCS 上傳測試失敗:', uploadError.message)
            results.errors.push(`GCS 上傳失敗: ${uploadError.message}`)
          }
        } else {
          console.log('❌ GCS 瀏覽器版本連接失敗')
          results.errors.push('GCS 瀏覽器版本連接失敗')
        }
      } catch (error) {
        console.error('❌ GCS 瀏覽器測試錯誤:', error)
        results.errors.push(`GCS 測試錯誤: ${error.message}`)
      }

      // 3. 測試智能選擇
      console.log('3️⃣ 測試智能提供者選擇...')
      try {
        results.selectedProvider = await storageService.selectBestProvider()
        results.smartSelection = true
        results.details.recommendedProvider = results.selectedProvider
        console.log('✅ 智能選擇成功，推薦提供者:', results.selectedProvider)
      } catch (error) {
        console.error('❌ 智能選擇失敗:', error)
        results.errors.push(`智能選擇失敗: ${error.message}`)
      }

      // 測試總結
      const hasWorkingProvider = results.firebase.connection || results.gcsBrowser.connection
      if (hasWorkingProvider && results.smartSelection) {
        console.log('🎉 儲存服務測試通過，至少有一個可用的提供者!')
      } else {
        console.log('⚠️ 儲存服務測試部分失敗，請檢查配置')
      }

      return results

    } catch (error) {
      console.error('❌ 儲存服務測試過程發生錯誤:', error)
      results.errors.push(`測試過程錯誤: ${error.message}`)
      return results
    }
  }

  /**
   * 建立測試用的檔案
   * @returns {Blob} 測試檔案
   */
  createTestFile() {
    const testContent = `Storage Service Test File
Created at: ${new Date().toISOString()}
Test content for multi-provider storage service validation.`
    
    return new Blob([testContent], { type: 'text/plain' })
  }

  /**
   * 格式化測試結果為可讀的報告
   * @param {Object} results 測試結果
   * @returns {string} 格式化報告
   */
  formatTestReport(results) {
    let report = '📊 GCS 連接測試報告\n'
    report += '='.repeat(30) + '\n\n'

    // 測試結果摘要
    report += `🔍 基本連接: ${results.connection ? '✅ 通過' : '❌ 失敗'}\n`
    report += `🗂️  桶存取: ${results.bucket ? '✅ 通過' : '❌ 失敗'}\n`
    report += `📤 檔案上傳: ${results.upload ? '✅ 通過' : '❌ 失敗'}\n`
    report += `🗑️  檔案刪除: ${results.delete ? '✅ 通過' : '❌ 失敗'}\n\n`

    // 詳細資訊
    if (Object.keys(results.details).length > 0) {
      report += '📋 詳細資訊:\n'
      for (const [key, value] of Object.entries(results.details)) {
        report += `   ${key}: ${value}\n`
      }
      report += '\n'
    }

    // 錯誤資訊
    if (results.errors.length > 0) {
      report += '❌ 錯誤列表:\n'
      results.errors.forEach((error, index) => {
        report += `   ${index + 1}. ${error}\n`
      })
      report += '\n'
    }

    // 建議
    const allPassed = results.connection && results.bucket && results.upload && results.delete
    if (allPassed) {
      report += '🎉 恭喜！所有測試都通過了，GCS 設定正確。\n'
      report += '   你現在可以開始使用圖片上傳功能了。'
    } else {
      report += '⚠️  測試未完全通過，請檢查以下設定：\n'
      report += '   1. .env 檔案中的 GCS 配置是否正確\n'
      report += '   2. credentials/gcs-key.json 檔案是否存在且有效\n'
      report += '   3. GCS 服務帳戶是否有適當權限\n'
      report += '   4. 桶名稱是否正確且可存取'
    }

    return report
  }

  /**
   * 檢查環境配置
   * @returns {Object} 配置檢查結果
   */
  checkEnvironmentConfig() {
    const config = {
      projectId: import.meta.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: import.meta.env.GOOGLE_CLOUD_KEYFILE || process.env.GOOGLE_CLOUD_KEYFILE,
      bucketName: import.meta.env.GCS_BUCKET_NAME || process.env.GCS_BUCKET_NAME
    }

    const issues = []
    
    if (!config.projectId) {
      issues.push('缺少 GOOGLE_CLOUD_PROJECT_ID 環境變數')
    }
    
    if (!config.keyFilename) {
      issues.push('缺少 GOOGLE_CLOUD_KEYFILE 環境變數')
    }
    
    if (!config.bucketName) {
      issues.push('缺少 GCS_BUCKET_NAME 環境變數')
    }

    return {
      config,
      valid: issues.length === 0,
      issues
    }
  }
}

// 建立單例實例
const storageTestService = new StorageTestService()
export default storageTestService