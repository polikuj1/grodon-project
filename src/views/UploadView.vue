<template>
  <div class="upload-view">
    <!-- 頁面標題列 -->
    <div class="upload-header">
      <div class="header-content">
        <div class="title-section">
          <button @click="goBack" class="back-btn">
            <span class="back-icon">←</span>
          </button>
          <div class="title-group">
            <h1 class="page-title">
              <span class="title-icon">📤</span>
              上傳照片
            </h1>
            <p class="page-subtitle">分享您的美好時光</p>
          </div>
        </div>
        
        <div class="header-actions">
          <button 
            @click="toggleGcsTest" 
            class="gcs-test-btn"
            :class="{ 'testing': isTestingStorage, 'active': showStorageTest }"
          >
            <span v-if="isTestingStorage" class="test-spinner"></span>
            <span class="test-icon">🧪</span>
            儲存測試
          </button>
          <UserProfile />
        </div>
      </div>
    </div>
    
    <!-- 儲存測試結果面板 -->
    <div v-if="showStorageTest" class="storage-test-panel">
      <div class="test-container">
        <div class="test-header">
          <h3 class="test-title">
            <span class="test-icon">🧪</span>
            多重儲存服務連接測試
          </h3>
          <button @click="runStorageTest" class="refresh-test-btn" :disabled="isTestingStorage">
            <span v-if="isTestingStorage" class="test-spinner"></span>
            <span v-else class="refresh-icon">🔄</span>
            重新測試
          </button>
        </div>
        
        <div v-if="isTestingStorage" class="test-loading">
          <div class="loading-spinner"></div>
          <p>正在測試多重儲存服務連接...</p>
        </div>
        
        <div v-else-if="storageTestResults" class="test-results">
          <div class="providers-grid">
            <!-- Firebase Storage 結果 -->
            <div class="provider-result">
              <h4 class="provider-title">
                🔥 Firebase Storage
              </h4>
              <div class="provider-status">
                <div class="status-item" :class="{ 'success': storageTestResults.firebase.connection, 'failure': !storageTestResults.firebase.connection }">
                  <span class="status-icon">{{ storageTestResults.firebase.connection ? '✅' : '❌' }}</span>
                  <span class="status-text">連接</span>
                </div>
                <div class="status-item" :class="{ 'success': storageTestResults.firebase.upload, 'failure': !storageTestResults.firebase.upload }">
                  <span class="status-icon">{{ storageTestResults.firebase.upload ? '✅' : '❌' }}</span>
                  <span class="status-text">上傳</span>
                </div>
              </div>
            </div>
            
            <!-- GCS Browser 結果 -->
            <div class="provider-result">
              <h4 class="provider-title">
                ☁️ Google Cloud Storage
              </h4>
              <div class="provider-status">
                <div class="status-item" :class="{ 'success': storageTestResults.gcsBrowser.connection, 'failure': !storageTestResults.gcsBrowser.connection }">
                  <span class="status-icon">{{ storageTestResults.gcsBrowser.connection ? '✅' : '❌' }}</span>
                  <span class="status-text">連接</span>
                </div>
                <div class="status-item" :class="{ 'success': storageTestResults.gcsBrowser.upload, 'failure': !storageTestResults.gcsBrowser.upload }">
                  <span class="status-icon">{{ storageTestResults.gcsBrowser.upload ? '✅' : '❌' }}</span>
                  <span class="status-text">上傳</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 推薦提供者 -->
          <div v-if="storageTestResults.selectedProvider" class="recommended-provider">
            <h4 class="recommendation-title">🤖 智能推薦</h4>
            <div class="recommendation-content">
              推薦使用：<strong>{{ 
                storageTestResults.selectedProvider === 'firebase' ? 'Firebase Storage' : 
                storageTestResults.selectedProvider === 'gcs-browser' ? 'Google Cloud Storage' : 
                storageTestResults.selectedProvider 
              }}</strong>
            </div>
          </div>
          
          <div v-if="storageTestResults.errors.length > 0" class="test-errors">
            <h4 class="errors-title">❌ 錯誤訊息</h4>
            <ul class="errors-list">
              <li v-for="(error, index) in storageTestResults.errors" :key="index" class="error-item">
                {{ error }}
              </li>
            </ul>
          </div>
          
          <div class="test-summary">
            <div v-if="storageTestResults.firebase.connection || storageTestResults.gcsBrowser.connection" 
                 class="summary-success">
              🎉 至少有一個儲存服務可用，可以開始使用圖片上傳功能。
            </div>
            <div v-else class="summary-warning">
              ⚠️ 所有儲存服務都無法使用，請檢查網路連接和配置設定。
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上傳表單內容 -->
    <div class="upload-content">
      <div class="upload-container">
        <form @submit.prevent="handleSubmit" class="upload-form">
          <!-- 照片上傳區域 -->
          <div class="form-section">
            <h2 class="section-title">選擇照片</h2>
            <div class="photo-upload-area">
              <div 
                class="upload-dropzone"
                :class="{ 'dragover': isDragOver, 'has-image': selectedImage }"
                @drop="handleDrop"
                @dragover.prevent="isDragOver = true"
                @dragleave="isDragOver = false"
                @click="triggerFileInput"
              >
                <!-- 圖片預覽 -->
                <div v-if="selectedImage" class="image-preview">
                  <img :src="imagePreviewUrl" alt="Preview" class="preview-image" />
                  <div class="image-overlay">
                    <button type="button" @click.stop="removeImage" class="remove-btn">
                      <span class="remove-icon">✕</span>
                    </button>
                  </div>
                </div>
                
                <!-- 上傳提示 -->
                <div v-else class="upload-prompt">
                  <div class="upload-icon">📷</div>
                  <p class="upload-text">點擊或拖拽照片到此處</p>
                  <p class="upload-hint">支援 JPG、PNG 格式，最大 10MB</p>
                </div>
              </div>
              
              <input 
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                class="file-input"
              />
            </div>
          </div>
          
          <!-- 照片資訊表單 -->
          <div class="form-section">
            <h2 class="section-title">照片資訊</h2>
            <div class="form-fields">
              <!-- 標題 -->
              <div class="field-group">
                <label for="title" class="field-label">
                  <span class="label-icon">✏️</span>
                  標題 *
                </label>
                <input 
                  id="title"
                  v-model="formData.title"
                  type="text"
                  class="form-input"
                  placeholder="輸入照片標題..."
                  required
                />
              </div>
              
              <!-- 拍照日期 -->
              <div class="field-group">
                <label for="photoDate" class="field-label">
                  <span class="label-icon">📅</span>
                  拍照日期 *
                </label>
                <input 
                  id="photoDate"
                  v-model="formData.photoDate"
                  type="date"
                  class="form-input"
                  required
                />
              </div>
              
              <!-- 主辦人 -->
              <div class="field-group">
                <label for="organizer" class="field-label">
                  <span class="label-icon">👤</span>
                  主辦人 *
                </label>
                <input 
                  id="organizer"
                  v-model="formData.organizer"
                  type="text"
                  class="form-input"
                  placeholder="輸入主辦人姓名..."
                  required
                />
              </div>
              
              <!-- 參與人員 -->
              <div class="field-group">
                <label for="participants" class="field-label">
                  <span class="label-icon">👥</span>
                  參與人員
                </label>
                <div class="participants-input">
                  <input 
                    v-model="newParticipant"
                    type="text"
                    class="form-input"
                    placeholder="輸入參與者姓名..."
                    @keydown.enter.prevent="addParticipant"
                  />
                  <button 
                    type="button" 
                    @click="addParticipant"
                    class="add-participant-btn"
                    :disabled="!newParticipant.trim()"
                  >
                    <span class="btn-icon">➕</span>
                  </button>
                </div>
                
                <!-- 參與者標籤 -->
                <div v-if="formData.participants.length > 0" class="participants-tags">
                  <span 
                    v-for="(participant, index) in formData.participants"
                    :key="index"
                    class="participant-tag"
                  >
                    {{ participant }}
                    <button 
                      type="button"
                      @click="removeParticipant(index)"
                      class="tag-remove-btn"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 提交按鈕 -->
          <div class="form-actions">
            <button type="button" @click="goBack" class="cancel-btn">
              取消
            </button>
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="!canSubmit || isUploading"
            >
              <span v-if="isUploading" class="loading-spinner"></span>
              <span class="btn-text">
                {{ isUploading ? uploadStatus : '上傳照片' }}
              </span>
              <div v-if="isUploading" class="progress-bar">
                <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Firebase 錯誤處理 -->
    <FirebaseErrorHandler 
      :error="firebaseError"
      :onRetry="retryUpload"
      @close="clearFirebaseError"
      @retry="retryUpload"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserProfile from '../components/UserProfile.vue'
import FirebaseErrorHandler from '../components/FirebaseErrorHandler.vue'
import photoService from '../services/photoService.js'
import storageTestService from '../services/gcsTest.js'
import { useAuth } from '../composables/useAuth.js'
import firebaseChecker from '../utils/firebaseCheck.js'

const router = useRouter()
const { user } = useAuth()

// 響應式資料
const selectedImage = ref(null)
const imagePreviewUrl = ref('')
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const firebaseError = ref(null)
const fileInput = ref(null)
const newParticipant = ref('')
const lastUploadData = ref(null)

// 儲存測試相關
const showStorageTest = ref(false)
const storageTestResults = ref(null)
const isTestingStorage = ref(false)

const formData = ref({
  title: '',
  photoDate: '',
  organizer: '',
  participants: []
})

// 計算屬性
const canSubmit = computed(() => {
  return selectedImage.value &&
         formData.value.title.trim() &&
         formData.value.photoDate &&
         formData.value.organizer.trim()
})

// 方法
const goBack = () => {
  router.push('/')
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file) => {
  // 檢查檔案類型
  if (!file.type.startsWith('image/')) {
    alert('請選擇圖片檔案')
    return
  }
  
  // 檢查檔案大小 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    alert('檔案大小不能超過 10MB')
    return
  }
  
  selectedImage.value = file
  
  // 創建預覽圖片
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreviewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeImage = () => {
  selectedImage.value = null
  imagePreviewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const addParticipant = () => {
  const participant = newParticipant.value.trim()
  if (participant && !formData.value.participants.includes(participant)) {
    formData.value.participants.push(participant)
    newParticipant.value = ''
  }
}

const removeParticipant = (index) => {
  formData.value.participants.splice(index, 1)
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  try {
    isUploading.value = true
    uploadProgress.value = 0
    uploadStatus.value = '開始上傳...'
    firebaseError.value = null
    
    // 準備照片資料
    const photoData = {
      title: formData.value.title.trim(),
      photoDate: formData.value.photoDate,
      organizer: formData.value.organizer.trim(),
      participants: formData.value.participants,
      uploadedBy: user.value?.id || user.value?.email || 'unknown'
    }
    
    // 儲存上傳資料以供重試使用
    lastUploadData.value = {
      image: selectedImage.value,
      data: photoData
    }
    
    console.log('🚀 開始上傳照片到 GCS...')
    uploadProgress.value = 20
    uploadStatus.value = '準備圖片...'
    
    // 使用 photoService 上傳照片 (現在使用 GCS)
    uploadProgress.value = 40
    uploadStatus.value = '上傳到 Google Cloud Storage...'
    
    const photoId = await photoService.uploadPhoto(selectedImage.value, photoData)
    
    uploadProgress.value = 100
    uploadStatus.value = '上傳完成！'
    
    console.log('✅ 照片上傳成功，ID:', photoId)
    
    // 清空表單
    selectedImage.value = null
    imagePreviewUrl.value = ''
    formData.value = {
      title: '',
      photoDate: new Date().toISOString().split('T')[0],
      organizer: '',
      participants: []
    }
    newParticipant.value = ''
    
    // 顯示成功訊息並跳轉
    alert('🎉 照片已成功上傳到 Google Cloud Storage！即將返回時間軸頁面。')
    router.push('/')
    
  } catch (error) {
    console.error('❌ 上傳失敗:', error)
    
    // 設置錯誤以顯示詳細的錯誤對話框
    firebaseError.value = error
    
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    uploadStatus.value = ''
  }
}

// Firebase 錯誤處理方法
const clearFirebaseError = () => {
  firebaseError.value = null
}

const retryUpload = async () => {
  if (!lastUploadData.value) return
  
  console.log('🔄 重試上傳...')
  clearFirebaseError()
  
  try {
    isUploading.value = true
    uploadProgress.value = 20
    uploadStatus.value = '重新上傳中...'
    
    const photoId = await photoService.uploadPhoto(
      lastUploadData.value.image, 
      lastUploadData.value.data
    )
    
    uploadProgress.value = 100
    uploadStatus.value = '上傳完成！'
    
    console.log('✅ 重試上傳成功，ID:', photoId)
    
    // 清空表單
    selectedImage.value = null
    imagePreviewUrl.value = ''
    formData.value = {
      title: '',
      photoDate: new Date().toISOString().split('T')[0],
      organizer: '',
      participants: []
    }
    newParticipant.value = ''
    lastUploadData.value = null
    
    alert('🎉 照片上傳成功！即將返回時間軸頁面。')
    router.push('/')
    
  } catch (error) {
    console.error('❌ 重試上傳失敗:', error)
    firebaseError.value = error
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    uploadStatus.value = ''
  }
}

// 儲存測試功能
const runStorageTest = async () => {
  try {
    isTestingStorage.value = true
    storageTestResults.value = null
    
    console.log('🧪 開始多重儲存服務連接測試...')
    const results = await storageTestService.runConnectionTest()
    storageTestResults.value = results
    
    const report = storageTestService.formatTestReport(results)
    console.log(report)
    
  } catch (error) {
    console.error('❌ 儲存測試失敗:', error)
    storageTestResults.value = {
      firebase: { connection: false, upload: false },
      gcsBrowser: { connection: false, upload: false },
      selectedProvider: null,
      smartSelection: false,
      errors: [error.message],
      details: {}
    }
  } finally {
    isTestingStorage.value = false
  }
}

const toggleGcsTest = () => {
  showStorageTest.value = !showStorageTest.value
  if (showStorageTest.value && !storageTestResults.value) {
    runStorageTest()
  }
}

// 生命週期
onMounted(async () => {
  // 設定預設日期為今天
  const today = new Date().toISOString().split('T')[0]
  formData.value.photoDate = today
  
  // 檢查 Firebase 連接（靜默模式）
  try {
    await firebaseChecker.runFullCheck()
  } catch (error) {
    console.warn('⚠️ Firebase 連接檢查失敗:', error)
  }
  
  // 檢查儲存服務環境配置
  const envCheck = storageTestService.checkEnvironmentConfig()
  if (!envCheck.valid) {
    console.warn('⚠️ 儲存服務環境配置問題:', envCheck.issues)
  }
})
</script>

<style scoped>
.upload-view {
  min-height: 100vh;
  background: #f8fafc;
}

/* 頁面標題列 */
.upload-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #f8fafc;
  color: #374151;
}

.back-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.title-group {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 2rem;
}

.page-subtitle {
  color: #64748b;
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* GCS 測試按鈕 */
.gcs-test-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gcs-test-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.gcs-test-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.gcs-test-btn.testing {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
  cursor: not-allowed;
}

.test-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.test-icon {
  font-size: 1rem;
}

/* 儲存測試面板 */
.storage-test-panel {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
}

.test-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.test-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.refresh-test-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-test-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.refresh-test-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 1rem;
}

.test-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #64748b;
}

.test-results {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.providers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.provider-result {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.provider-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.provider-status {
  display: flex;
  gap: 0.5rem;
}

.recommended-provider {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.recommendation-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0c4a6e;
}

.recommendation-content {
  color: #075985;
  font-size: 0.875rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid;
  transition: all 0.2s ease;
}

.status-item.success {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #166534;
}

.status-item.failure {
  background: #fef2f2;
  border-color: #ef4444;
  color: #991b1b;
}

.status-icon {
  font-size: 1.5rem;
}

.status-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.test-errors {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
}

.errors-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #991b1b;
}

.errors-list {
  margin: 0;
  padding-left: 1.25rem;
  color: #7f1d1d;
}

.error-item {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.error-item:last-child {
  margin-bottom: 0;
}

.test-summary {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.summary-success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.summary-warning {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

/* 上傳內容 */
.upload-content {
  padding: 2rem;
}

.upload-container {
  max-width: 800px;
  margin: 0 auto;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 照片上傳區域 */
.photo-upload-area {
  position: relative;
}

.upload-dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.upload-dropzone:hover {
  border-color: #667eea;
  background: #f1f5f9;
}

.upload-dropzone.dragover {
  border-color: #667eea;
  background: #e0e7ff;
}

.upload-dropzone.has-image {
  padding: 0;
  border: none;
  background: transparent;
}

.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.remove-icon {
  font-size: 1rem;
  font-weight: bold;
}

.upload-prompt {
  color: #64748b;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.upload-text {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.upload-hint {
  font-size: 0.875rem;
  margin: 0;
}

.file-input {
  display: none;
}

/* 表單欄位 */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.label-icon {
  font-size: 1rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #374151;
  background: white;
  transition: all 0.2s ease;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.participants-input {
  display: flex;
  gap: 0.5rem;
}

.participants-input .form-input {
  flex: 1;
}

.add-participant-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 48px;
}

.add-participant-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.add-participant-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1rem;
}

.participants-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.participant-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.tag-remove-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0;
  margin-left: 0.25rem;
  transition: color 0.2s ease;
}

.tag-remove-btn:hover {
  color: #ef4444;
}

/* 表單操作 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.cancel-btn {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.cancel-btn:hover {
  background: #f9fafb;
  color: #374151;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  transition: width 0.3s ease;
  transform-origin: left;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .title-section {
    justify-content: center;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .upload-content {
    padding: 1rem;
  }
  
  .form-section {
    padding: 1.5rem;
  }
  
  .upload-dropzone {
    padding: 2rem 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>