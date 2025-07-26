import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5405, // For dev server
  },
  preview: {
    port: 5405, // For preview (after build)
  },
});
