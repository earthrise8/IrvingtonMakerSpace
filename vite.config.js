import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/IrvingtonMakerSpace/',
  server: {
    port: 4000,
    open: true,
  },
})
