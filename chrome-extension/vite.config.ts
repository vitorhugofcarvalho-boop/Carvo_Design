import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { copyFileSync, cpSync, existsSync } from 'fs'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        copyFileSync('manifest.json', 'dist/manifest.json')
        if (existsSync('public/icon.svg')) {
          copyFileSync('public/icon.svg', 'dist/icon.svg')
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        popup: resolve(__dirname, 'popup.html'),
        'background/serviceWorker': resolve(__dirname, 'src/background/serviceWorker.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background/serviceWorker') return 'background/serviceWorker.js'
          return 'assets/[name]-[hash].js'
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})
