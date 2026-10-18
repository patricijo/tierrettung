import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { tierrettungApiPlugin } from './server/apiPlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tierrettungApiPlugin()],
})


