import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    // 為了支援環境變數
    'process.env': process.env
  },
  server: {
    port: 5173,
    host: '0.0.0.0',  // 允許外部訪問
    strictPort: true,  // 確保使用指定端口
    cors: true,       // 啟用 CORS
    // 開發環境下的 HTTPS 設定（如需要）
    // https: false,
    // 確保正確的 origin 處理
    origin: 'http://localhost:5173'
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    cors: true
  }
})
