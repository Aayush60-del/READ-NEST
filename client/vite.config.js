import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
    },
  },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('pdfjs-dist') || id.includes('react-pdf')) return 'reader-pdf';
          if (id.includes('@rive-app')) return 'rive-runtime';
          if (id.includes('firebase')) return 'firebase';
          if (id.includes('framer-motion') || id.includes('gsap') || id.includes('lenis')) return 'motion';
          if (id.includes('lucide-react') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority') || id.includes('radix-ui')) return 'ui';
          if (id.includes('axios')) return 'api-client';
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'react-core';

          return 'vendor';
        },
      },
    },
  },
})
