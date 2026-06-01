import react from "@vitejs/plugin-react"
import { build, createServer, preview } from "vite"

const command = process.argv[2] || "dev"

const viteConfig = {
  root: process.cwd(),
  configFile: false,
  plugins: [react()],
}

if (command === "build") {
  await build(viteConfig)
} else if (command === "preview") {
  const server = await preview(viteConfig)
  server.printUrls()
} else if (command === "dev") {
  const server = await createServer({
    ...viteConfig,
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: false,
    },
  })
  await server.listen()
  server.printUrls()
} else {
  console.error(`Unknown command: ${command}`)
  process.exit(1)
}
