import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { copyFileSync, existsSync } from 'fs'

export default defineConfig({
  base: '',
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
    dedupe: ['react', 'react-dom'],
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'no-crossorigin',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html.replaceAll(' crossorigin', '')
        },
      },
    },
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
    modulePreload: false,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        popup: resolve(__dirname, 'popup.html'),
        'background/serviceWorker': resolve(__dirname, 'src/background/serviceWorker.ts'),
        'content/instagram': resolve(__dirname, 'src/content/instagram.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background/serviceWorker') return 'background/serviceWorker.js'
          if (chunk.name === 'content/instagram') return 'content/instagram.js'
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
})
