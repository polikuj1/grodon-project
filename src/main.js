import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
// 導入 Firebase 配置
import './firebase.js'

const app = createApp(App)
app.use(router)
app.mount('#app')
