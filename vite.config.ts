import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    host: true,
    cors: mode === 'production' ? false : {
      origin: ['http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  optimizeDeps: {
    include: ['@react-pdf/renderer', 'react-pdf', 'pdfjs-dist', 'react', 'react-dom']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
}));
