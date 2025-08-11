<template>
  <div class="timeline-view">
    <!-- 頁面標題列 -->
    <div class="timeline-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <span class="title-icon">📸</span>
            我的照片時間軸
          </h1>
          <p class="page-subtitle">{{ totalPhotos }}張美好回憶</p>
        </div>
        
        <div class="header-actions">
          <button @click="refreshPhotos" class="refresh-btn" :disabled="loading">
            <span class="btn-icon">🔄</span>
            {{ loading ? '載入中...' : '重新整理' }}
          </button>
          <button @click="goToUpload" class="upload-btn">
            <span class="btn-icon">➕</span>
            上傳照片
          </button>
          <UserProfile />
        </div>
      </div>
    </div>
    
    <!-- 時間軸內容 -->
    <div class="timeline-content">
      <div class="timeline-container">
        <!-- 載入狀態 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>載入時間軸中...</p>
        </div>
        
        <!-- 空狀態 -->
        <div v-else-if="!loading && photoGroups.length === 0" class="empty-state">
          <div class="empty-icon">📷</div>
          <h3>還沒有任何照片</h3>
          <p>開始上傳您的第一張照片，記錄美好時光！</p>
          <button @click="goToUpload" class="empty-upload-btn">
            ➕ 上傳第一張照片
          </button>
        </div>
        
        <!-- 時間軸內容 -->
        <div v-else class="timeline-groups">
          <div 
            v-for="group in photoGroups" 
            :key="group.period" 
            class="time-group"
          >
            <div class="time-period">
              <span class="period-icon">🕐</span>
              <h2 class="period-title">{{ group.period }}</h2>
              <span class="period-count">{{ group.photos.length }}張照片</span>
            </div>
            
            <div class="photos-grid">
              <TimelineItem 
                v-for="photo in group.photos" 
                :key="photo.id"
                :photo="photo"
                @click="openPhotoModal(photo)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 照片詳情彈窗 -->
    <PhotoModal 
      v-if="selectedPhoto"
      :photo="selectedPhoto"
      @close="closePhotoModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserProfile from '../components/UserProfile.vue'
import TimelineItem from '../components/Timeline/TimelineItem.vue'
import PhotoModal from '../components/Timeline/PhotoModal.vue'
import photoService from '../services/photoService.js'

const router = useRouter()

// 響應式資料
const loading = ref(true)
const selectedPhoto = ref(null)
const photos = ref([])

// 計算屬性
const totalPhotos = computed(() => photos.value.length)

// 按時間分組的照片
const photoGroups = computed(() => {
  const groups = {}
  
  photos.value.forEach(photo => {
    const date = new Date(photo.photoDate)
    const period = `${date.getFullYear()}年${date.getMonth() + 1}月`
    
    if (!groups[period]) {
      groups[period] = []
    }
    groups[period].push(photo)
  })
  
  // 轉換為陣列並排序
  return Object.entries(groups)
    .map(([period, photos]) => ({
      period,
      photos: photos.sort((a, b) => new Date(b.photoDate) - new Date(a.photoDate))
    }))
    .sort((a, b) => {
      // 按時間降序排列（最新的在前）
      const [yearA, monthA] = a.period.replace(/年|月/g, ' ').trim().split(' ')
      const [yearB, monthB] = b.period.replace(/年|月/g, ' ').trim().split(' ')
      
      if (yearA !== yearB) {
        return parseInt(yearB) - parseInt(yearA)
      }
      return parseInt(monthB) - parseInt(monthA)
    })
})

// 方法
const goToUpload = () => {
  router.push('/upload')
}

const refreshPhotos = () => {
  loadPhotos()
}

const openPhotoModal = (photo) => {
  selectedPhoto.value = photo
}

const closePhotoModal = () => {
  selectedPhoto.value = null
}

const loadPhotos = async () => {
  try {
    loading.value = true
    console.log('📷 開始載入照片...')
    
    // 從 Firebase 載入照片
    const firebasePhotos = await photoService.getAllPhotos()
    
    if (firebasePhotos.length === 0) {
      console.log('📷 沒有找到照片，載入示範資料')
      // 如果沒有照片，顯示示範資料
      photos.value = [
        {
          id: 'demo-1',
          title: '歡迎使用 Photo Timeline！',
          imageUrl: 'https://picsum.photos/400/300?random=1',
          thumbnailUrl: 'https://picsum.photos/200/150?random=1',
          photoDate: new Date().toISOString().split('T')[0],
          organizer: '系統管理員',
          participants: ['歡迎用戶'],
          uploadedBy: 'system',
          uploadedAt: new Date().toISOString()
        }
      ]
    } else {
      photos.value = firebasePhotos
      console.log(`✅ 成功載入 ${firebasePhotos.length} 張照片`)
    }
    
  } catch (error) {
    console.error('❌ 載入照片失敗:', error)
    
    // 顯示錯誤訊息
    alert(`載入照片失敗: ${error.message}`)
    
    // 載入失敗時顯示空狀態
    photos.value = []
  } finally {
    loading.value = false
  }
}

// 生命週期
onMounted(() => {
  loadPhotos()
})
</script>

<style scoped>
.timeline-view {
  min-height: 100vh;
  background: #f8fafc;
}

/* 頁面標題列 */
.timeline-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 2rem;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.refresh-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #475569;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1.1rem;
}

/* 時間軸內容 */
.timeline-content {
  padding: 2rem;
}

.timeline-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 載入狀態 */
.loading-state {
  text-align: center;
  padding: 4rem 0;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 4rem 0;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.empty-state p {
  margin: 0 0 2rem 0;
  font-size: 1rem;
}

.empty-upload-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-upload-btn:hover {
  transform: translateY(-1px);
}

/* 時間軸分組 */
.timeline-groups {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.time-group {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.time-period {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
}

.period-icon {
  font-size: 1.5rem;
}

.period-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.period-count {
  font-size: 0.875rem;
  color: #64748b;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.photos-grid {
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 1.5rem;
    justify-content: center;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .timeline-content {
    padding: 1rem;
  }
  
  .time-period {
    padding: 1rem;
    flex-wrap: wrap;
  }
  
  .photos-grid {
    padding: 1rem;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>