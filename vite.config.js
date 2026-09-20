import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 1000, // ปรับเพดานเตือนเป็น 1000 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          // แยก Vue และ Vue Router ออกเป็นไฟล์แยก (Firebase ถูกรื้อระบบออกแล้ว)
          if (id.includes('node_modules/vue')) {
            return 'vue-vendor'
          }
        }
      }
    }
  }
})