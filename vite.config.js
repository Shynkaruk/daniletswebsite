import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5179",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), tailwindcss()],
  base: '/',                    // правильно для DO
  build: {
    outDir: 'dist',             // явно вказуємо (за замовчуванням і так)
    sourcemap: false,           // можна вимкнути в продакшені
  },
});