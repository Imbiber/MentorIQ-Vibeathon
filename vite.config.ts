import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: ['.replit.dev', '.repl.co'],
    hmr: process.env.REPLIT_DEV_DOMAIN ? {
      protocol: 'wss',
      host: process.env.REPLIT_DEV_DOMAIN,
      clientPort: 443,
    } : true, // Use default HMR when not on Replit
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/auth/google/exchange': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Note: /auth/google/callback and /auth/google/popup-callback
      // are NOT proxied - they're handled by React Router
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
