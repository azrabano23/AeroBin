import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins:[react()], base:'./',
  build:{ outDir:'/tmp/claude-0/-home-user-AeroBin/a74bcf61-a625-58b4-9558-780009fe6adb/scratchpad/preview-dist', emptyOutDir:true, rollupOptions:{ input:'preview.html' } } })
