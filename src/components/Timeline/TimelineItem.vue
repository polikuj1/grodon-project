<template>
  <div class="timeline-item" @click="$emit('click')">
    <div class="photo-container">
      <img 
        :src="photo.thumbnailUrl || photo.imageUrl" 
        :alt="photo.title"
        class="photo-thumbnail"
        loading="lazy"
      />
      <div class="photo-overlay">
        <div class="overlay-icon">🔍</div>
      </div>
    </div>
    
    <div class="photo-info">
      <h3 class="photo-title">{{ photo.title }}</h3>
      <div class="photo-meta">
        <div class="meta-item">
          <span class="meta-icon">📅</span>
          <span class="meta-text">{{ formatDate(photo.photoDate) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">👤</span>
          <span class="meta-text">{{ photo.organizer }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">👥</span>
          <span class="meta-text">{{ photo.participants.length }}人</span>
        </div>
      </div>
      
      <div class="participants-preview">
        <div class="participants-list">
          <span 
            v-for="(participant, index) in displayParticipants" 
            :key="participant"
            class="participant-tag"
          >
            {{ participant }}
          </span>
          <span v-if="remainingCount > 0" class="more-participants">
            +{{ remainingCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  photo: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 顯示的參與者（最多3個）
const displayParticipants = computed(() => {
  return props.photo.participants.slice(0, 3)
})

// 剩餘參與者數量
const remainingCount = computed(() => {
  return Math.max(0, props.photo.participants.length - 3)
})
</script>

<style scoped>
.timeline-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.timeline-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.photo-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.photo-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.timeline-item:hover .photo-thumbnail {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.timeline-item:hover .photo-overlay {
  opacity: 1;
}

.overlay-icon {
  font-size: 2rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.photo-info {
  padding: 1.5rem;
}

.photo-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.photo-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.meta-icon {
  font-size: 1rem;
  width: 1.2rem;
  text-align: center;
}

.meta-text {
  font-weight: 500;
}

.participants-preview {
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.participant-tag {
  display: inline-block;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  line-height: 1.4;
}

.more-participants {
  display: inline-block;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  line-height: 1.4;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .photo-container {
    height: 180px;
  }
  
  .photo-info {
    padding: 1rem;
  }
  
  .photo-title {
    font-size: 1rem;
  }
  
  .meta-item {
    font-size: 0.8125rem;
  }
}
</style>