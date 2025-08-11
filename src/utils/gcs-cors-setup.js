// GCS CORS 程式化設定工具 (需要適當權限)
export class GCSCorsSetup {
  constructor(projectId, bucketName) {
    this.projectId = projectId
    this.bucketName = bucketName
    this.baseUrl = 'https://storage.googleapis.com/storage/v1'
  }

  /**
   * 設定 CORS 政策
   * @param {string} accessToken - Google 存取 token
   * @param {Array} corsRules - CORS 規則陣列
   */
  async setCorsPolicy(accessToken, corsRules) {
    try {
      const url = `${this.baseUrl}/b/${this.bucketName}?fields=cors`
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cors: corsRules
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`CORS 設定失敗 (${response.status}): ${error}`)
      }

      const result = await response.json()
      console.log('✅ CORS 政策設定成功:', result.cors)
      return result.cors
    } catch (error) {
      console.error('❌ CORS 設定錯誤:', error)
      throw error
    }
  }

  /**
   * 獲取當前 CORS 政策
   * @param {string} accessToken - Google 存取 token
   */
  async getCorsPolicy(accessToken) {
    try {
      const url = `${this.baseUrl}/b/${this.bucketName}?fields=cors`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`獲取 CORS 設定失敗: ${response.status}`)
      }

      const result = await response.json()
      return result.cors || []
    } catch (error) {
      console.error('❌ 獲取 CORS 設定錯誤:', error)
      throw error
    }
  }

  /**
   * 生成推薦的 CORS 規則
   */
  getRecommendedCorsRules() {
    return [
      {
        origin: [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'https://your-production-domain.com' // 請替換為實際域名
        ],
        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        responseHeader: [
          'Content-Type',
          'Authorization',
          'x-goog-resumable',
          'x-goog-content-length-range'
        ],
        maxAgeSeconds: 3600
      }
    ]
  }
}

// 使用範例
export async function setupGCSCors() {
  try {
    console.log('🔧 開始設定 GCS CORS...')
    
    const corsSetup = new GCSCorsSetup('premium-catbird-365712', 'geo105_gordon')
    
    // 注意：這需要有效的 Google 存取 token
    // 在生產環境中，應該通過後端 API 來處理
    console.warn('⚠️ 此功能需要後端支援或有效的存取 token')
    
    const recommendedRules = corsSetup.getRecommendedCorsRules()
    console.log('💡 推薦的 CORS 規則:', recommendedRules)
    
    return recommendedRules
  } catch (error) {
    console.error('❌ CORS 設定過程錯誤:', error)
    throw error
  }
}