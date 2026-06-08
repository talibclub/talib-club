import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase/firestore") || id.includes("@firebase/firestore")) {
              return "vendor-firebase-firestore"
            }
            if (id.includes("firebase/auth") || id.includes("@firebase/auth")) {
              return "vendor-firebase-auth"
            }
            if (id.includes("firebase/storage") || id.includes("@firebase/storage")) {
              return "vendor-firebase-storage"
            }
            if (id.includes("firebase/app") || id.includes("@firebase/app")) {
              return "vendor-firebase-app"
            }
            if (id.includes("firebase")) {
              return "vendor-firebase-core"
            }
            if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
              return "vendor-react"
            }
            return "vendor-others"
          }
        },
      },
    },
  },
})
