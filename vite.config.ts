import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  // Deployed at the root of the domain (Vercel, Netlify, Cloudflare Pages
  // root deployments). MUST be '/' — a relative base like './' breaks
  // both BASE_URL-aware route checks and asset resolution on deep paths.
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
