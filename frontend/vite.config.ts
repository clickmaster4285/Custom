import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import * as path from "path"
import * as fs from "fs"

const projectRoot = path.resolve(__dirname)

// Ensure dist/icon.svg exists so vite:css-analysis doesn't throw ENOENT when resolving /icon.svg
function ensureDistIconPlugin() {
  return {
    name: "ensure-dist-icon",
    configResolved() {
      const distIcon = path.join(projectRoot, "dist", "icon.svg")
      const publicIcon = path.join(projectRoot, "public", "icon.svg")
      if (!fs.existsSync(distIcon) && fs.existsSync(publicIcon)) {
        const distDir = path.dirname(distIcon)
        if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })
        fs.copyFileSync(publicIcon, distIcon)
      }
    },
  }
}

export default defineConfig({
  root: projectRoot,
  publicDir: path.join(projectRoot, "public"),
  plugins: [ensureDistIconPlugin(), react()],
  resolve: {
    alias: {
      "@": path.join(projectRoot, "src"),
    },
  },
  server: {
    port: 3000,
  },
})
