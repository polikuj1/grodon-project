<template>
  <div class="photo-modal-overlay" @click="closeModal">
    <div class="photo-modal" @click.stop>
      <!-- 關閉按鈕 -->
      <button class="close-btn" @click="closeModal">
        <span class="close-icon">✕</span>
      </button>
      
      <!-- 照片內容 -->
      <div class="modal-content">
        <!-- 照片區域 -->
        <div class="photo-section">
          <img 
            :src="photo.imageUrl" 
            :alt="photo.title"
            class="modal-photo"
          />
        </div>
        
        <!-- 資訊區域 -->
        <div class="info-section">
          <!-- 標題 -->
          <div class="photo-header">
            <h2 class="photo-title">{{ photo.title }}</h2>
            <div class="photo-date">
              <span class="date-icon">📅</span>
              {{ formatDate(photo.photoDate) }}
            </div>
          </div>
          
          <!-- 詳細資訊 -->
          <div class="photo-details">
            <div class="detail-group">
              <h3 class="detail-title">
                <span class="detail-icon">👤</span>
                主辦人
              </h3>
              <div class="detail-content">
                <span class="organizer-name">{{ photo.organizer }}</span>
              </div>
            </div>
            
            <div class="detail-group">
              <h3 class="detail-title">
                <span class="detail-icon">👥</span>
                參與人員 ({{ photo.participants.length }}人)
              </h3>
              <div class="detail-content">
                <div class="participants-grid">
                  <span 
                    v-for="participant in photo.participants" 
                    :key="participant"
                    class="participant-chip"
                  >
                    {{ participant }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="detail-group">
              <h3 class="detail-title">
                <span class="detail-icon">📤</span>
                上傳資訊
              </h3>
              <div class="detail-content">
                <div class="upload-info">
                  <p class="upload-text">
                    由 <strong>{{ photo.uploadedBy }}</strong> 上傳
                  </p>
                  <p class="upload-date">
                    {{ formatDateTime(photo.uploadedAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 操作按鈕 -->
          <div class="modal-actions">
            <button class="action-btn download-btn" @click="downloadPhoto">
              <span class="btn-icon">⬇️</span>
              下載照片
            </button>
            <button class="action-btn share-btn" @click="sharePhoto">
              <span class="btn-icon">📤</span>
              分享
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  photo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

// 關閉彈窗
const closeModal = () => {
  emit('close')
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 格式化日期時間
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 下載照片
const downloadPhoto = () => {
  const link = document.createElement('a')
  link.href = props.photo.imageUrl
  link.download = `${props.photo.title}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 分享照片
const sharePhoto = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: props.photo.title,
        text: `查看這張照片：${props.photo.title}`,
        url: props.photo.imageUrl
      })
    } catch (error) {
      console.log('分享取消或失敗:', error)
    }
  } else {
    // 降級方案：複製到剪貼簿
    try {
      await navigator.clipboard.writeText(props.photo.imageUrl)
      alert('照片連結已複製到剪貼簿')
    } catch (error) {
      console.error('複製失敗:', error)
      alert('無法分享照片')
    }
  }
}

// ESC 鍵關閉彈窗
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}

// 監聽鍵盤事件
document.addEventListener('keydown', handleKeydown)

// 清理事件監聽器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.photo-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  backdrop-filter: blur(4px);
}

.photo-modal {
  background: white;
  border-radius: 16px;
  max-width: 1000px;
  max-height: 90vh;
  width: 100%;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.close-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.modal-content {
  display: flex;
  height: 100%;
  max-height: 90vh;
}

.photo-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  min-height: 400px;
}

.modal-photo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.info-section {
  width: 350px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-left: 1px solid #e2e8f0;
}

.photo-header {
  margin-bottom: 2rem;
}

.photo-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.photo-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.date-icon {
  font-size: 1rem;
}

.photo-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-group {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1.5rem;
}

.detail-group:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.detail-icon {
  font-size: 1.1rem;
}

.detail-content {
  color: #64748b;
}

.organizer-name {
  font-weight: 600;
  color: #1e293b;
}

.participants-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.participant-chip {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.upload-info {
  font-size: 0.875rem;
}

.upload-text {
  margin: 0 0 0.25rem 0;
  color: #374151;
}

.upload-date {
  margin: 0;
  color: #64748b;
  font-size: 0.8125rem;
}

.modal-actions {
  margin-top: 2rem;
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.download-btn {
  background: #3b82f6;
  color: white;
}

.download-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.share-btn {
  background: #10b981;
  color: white;
}

.share-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .photo-modal-overlay {
    padding: 1rem;
  }
  
  .modal-content {
    flex-direction: column;
    max-height: 90vh;
  }
  
  .photo-section {
    min-height: 250px;
    max-height: 40vh;
  }
  
  .info-section {
    width: 100%;
    max-height: 50vh;
    padding: 1.5rem;
    border-left: none;
    border-top: 1px solid #e2e8f0;
  }
  
  .photo-title {
    font-size: 1.25rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .close-btn {
    top: 0.5rem;
    right: 0.5rem;
    width: 36px;
    height: 36px;
  }
}
</style>