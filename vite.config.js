import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // ต้องเพิ่มบรรทัดนี้

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // เพิ่มส่วนนี้เพื่อให้ @/ ชี้ไปที่ src
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            return 'vendor-others';
          }
        }
      }
    }
  }
})
