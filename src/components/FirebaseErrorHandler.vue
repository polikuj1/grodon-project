<template>
  <div v-if="showError" class="firebase-error-modal">
    <div class="error-overlay" @click="closeError"></div>
    <div class="error-content">
      <div class="error-header">
        <div class="error-icon">🔥</div>
        <h3 class="error-title">Firebase 連接問題</h3>
        <button @click="closeError" class="close-btn">✕</button>
      </div>
      
      <div class="error-body">
        <p class="error-message">{{ errorMessage }}</p>
        
        <div v-if="errorCode === 'storage/unauthorized'" class="error-help">
          <h4>🔧 解決方案：</h4>
          <ol>
            <li>前往 <a href="https://console.firebase.google.com/" target="_blank">Firebase Console</a></li>
            <li>選擇專案 → Storage → Rules</li>
            <li>將規則改為：
              <pre class="code-block">rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}</pre>
            </li>
            <li>點擊「發布」並等待 5-10 分鐘生效</li>
          </ol>
        </div>
        
        <div v-else-if="errorMessage.includes('CORS')" class="error-help">
          <h4>🌐 CORS 問題解決：</h4>
          <ul>
            <li>檢查 <strong>Firebase Storage 安全規則</strong>是否正確</li>
            <li>確認專案域名已加入 Firebase 授權域名列表</li>
            <li>等待 5-10 分鐘讓設定生效</li>
            <li>清除瀏覽器快取後重試</li>
          </ul>
        </div>
        
        <div v-else class="error-help">
          <h4>🔍 其他解決方案：</h4>
          <ul>
            <li>檢查網路連接是否正常</li>
            <li>確認 Firebase 專案配置正確</li>
            <li>稍後再試或聯繫技術支援</li>
          </ul>
        </div>
      </div>
      
      <div class="error-actions">
        <button @click="retryOperation" class="retry-btn" v-if="onRetry">
          🔄 重試上傳
        </button>
        <button @click="closeError" class="close-action-btn">
          關閉
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  error: {
    type: [Error, String, null],
    default: null
  },
  onRetry: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['close', 'retry'])

const showError = computed(() => !!props.error)

const errorMessage = computed(() => {
  if (!props.error) return ''
  return typeof props.error === 'string' ? props.error : props.error.message
})

const errorCode = computed(() => {
  if (!props.error || typeof props.error === 'string') return ''
  return props.error.code || ''
})

const closeError = () => {
  emit('close')
}

const retryOperation = () => {
  emit('retry')
  if (props.onRetry) {
    props.onRetry()
  }
}
</script>

<style scoped>
.firebase-error-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.error-content {
  position: relative;
  max-width: 600px;
  max-height: 80vh;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-bottom: 1px solid #fecaca;
}

.error-icon {
  font-size: 2rem;
}

.error-title {
  flex: 1;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #dc2626;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

.error-body {
  padding: 2rem;
  overflow-y: auto;
  max-height: 50vh;
}

.error-message {
  font-size: 1rem;
  color: #374151;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.error-help {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.error-help h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
}

.error-help ol,
.error-help ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #475569;
}

.error-help li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.code-block {
  background: #1e293b;
  color: #f1f5f9;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  margin: 0.5rem 0;
  overflow-x: auto;
  white-space: pre;
}

.error-help a {
  color: #3b82f6;
  text-decoration: underline;
}

.error-help a:hover {
  color: #2563eb;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem 2rem 2rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.retry-btn,
.close-action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.retry-btn {
  background: #3b82f6;
  color: white;
}

.retry-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.close-action-btn {
  background: #6b7280;
  color: white;
}

.close-action-btn:hover {
  background: #4b5563;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .firebase-error-modal {
    padding: 1rem;
  }
  
  .error-content {
    max-height: 90vh;
  }
  
  .error-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .error-body {
    padding: 1.5rem;
  }
  
  .error-actions {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    flex-direction: column;
  }
  
  .retry-btn,
  .close-action-btn {
    width: 100%;
  }
}
</style>