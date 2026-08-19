import { build, createServer, preview } from "vite"
import fileConfig from "../vite.config.js"

const command = process.argv[2] || "dev"

// `configFile: false` plus a second copy of the settings inline meant
// vite.config.js was never loaded by anything — editing it looked like it
// worked and changed nothing. The config file is now the single source of
// truth; configFile stays false only so Vite does not go looking for it again.
const viteConfig = {
  ...(typeof fileConfig === "function" ? fileConfig({ command, mode: command }) : fileConfig),
  configFile: false,
  root: process.cwd(),
}

if (command === "build") {
  await build(viteConfig)
  try {
    console.log("Running sitemap generator...")
    await import("./generate-sitemap.mjs")
  } catch (err) {
    console.error("Failed to run sitemap generator:", err)
  }
} else if (command === "preview") {
  const server = await preview(viteConfig)
  server.printUrls()
} else if (command === "dev") {
  // `--lan` binds to every interface so a tablet or phone on the same network can
  // open the dev server and the notebook can be tried with a real stylus.
  // Off by default: it exposes the server to anyone on that network.
  const exposeToLan = process.argv.includes("--lan")
  const server = await createServer({
    ...viteConfig,
    server: {
      host: exposeToLan ? "0.0.0.0" : "127.0.0.1",
      // PORT lets a second instance run alongside one already on 5173.
      port: Number(process.env.PORT) || 5173,
      strictPort: false,
    },
  })
  await server.listen()
  server.printUrls()
} else {
  console.error(`Unknown command: ${command}`)
  process.exit(1)
}
