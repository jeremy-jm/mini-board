import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev server only: proxy /api to local backend or Docker service (see docker-compose.dev.yml).
const proxyTarget =
  process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:3001'

function getPackageNameFromModuleId(moduleId: string): string | null {
  const marker = "/node_modules/";
  const markerIndex = moduleId.lastIndexOf(marker);
  if (markerIndex < 0) return null;
  const subPath = moduleId.slice(markerIndex + marker.length);
  const parts = subPath.split("/");
  if (!parts[0]) return null;
  if (parts[0].startsWith("@")) {
    return parts.length > 1 ? `${parts[0]}/${parts[1]}` : null;
  }
  return parts[0];
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const packageName = getPackageNameFromModuleId(id);
          if (!packageName) return;

          if (
            packageName === "react" ||
            packageName === "react-dom" ||
            packageName === "scheduler"
          ) {
            return "react-vendor";
          }
          if (
            packageName === "@reduxjs/toolkit" ||
            packageName === "react-redux" ||
            packageName === "redux"
          ) {
            return "redux-vendor";
          }
          if (packageName.startsWith("@dnd-kit/")) {
            return "dnd-vendor";
          }
          if (packageName === "antd" || packageName.startsWith("rc-")) {
            return "antd-vendor";
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
