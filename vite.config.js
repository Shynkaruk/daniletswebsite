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
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) return "vendor-react";
          if (id.includes("node_modules/react-router")) return "vendor-router";
          if (id.includes("node_modules/swiper")) return "vendor-swiper";
          if (id.includes("node_modules/@stripe")) return "vendor-stripe";
          if (id.includes("node_modules/react-icons")) return "vendor-icons";
          if (id.includes("node_modules/@react-oauth")) return "vendor-google-auth";
          if (id.includes("node_modules/@whop")) return "vendor-whop";
          if (id.includes("node_modules/axios")) return "vendor-axios";
        },
      },
    },
  },
});
