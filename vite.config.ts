import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    host: true,
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000', 'https://gptengineer.app', 'https://lovable.dev'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['@react-pdf/renderer', 'react-pdf', 'pdfjs-dist']
  },
  build: {
    commonjsOptions: {
      include: [/@react-pdf\/renderer/, /react-pdf/, /pdfjs-dist/]
    }
  }
}));
