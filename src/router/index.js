import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

// 頁面組件 (懶加載)
const LoginView = () => import('../views/LoginView.vue')
const TimelineView = () => import('../views/TimelineView.vue')
const UploadView = () => import('../views/UploadView.vue')

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { 
      requiresAuth: false,
      title: '登入 - Photo Timeline'
    }
  },
  {
    path: '/',
    name: 'timeline',
    component: TimelineView,
    meta: { 
      requiresAuth: true,
      title: '時間軸 - Photo Timeline'
    }
  },
  {
    path: '/upload',
    name: 'upload',
    component: UploadView,
    meta: { 
      requiresAuth: true,
      title: '上傳照片 - Photo Timeline'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守衛
router.beforeEach(async (to, from, next) => {
  // 設置頁面標題
  document.title = to.meta.title || 'Photo Timeline'
  
  const { isAuthenticated, initAuth } = useAuth()
  
  // 初始化認證狀態
  if (!isAuthenticated.value) {
    try {
      await initAuth()
    } catch (error) {
      console.error('認證初始化失敗:', error)
    }
  }
  
  // 檢查路由權限
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login')
  } else if (to.name === 'login' && isAuthenticated.value) {
    next('/')
  } else {
    next()
  }
})

export default router