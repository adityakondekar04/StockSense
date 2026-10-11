import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    // Increase warning limit slightly and split vendor chunks for better caching
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React + router into their own chunk
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Separate recharts (large) into its own chunk
          "vendor-charts": ["recharts"],
          // Core math library
          "vendor-core": ["zod"],
        },
      },
    },
  },
});
