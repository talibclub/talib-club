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
})
