import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/NiftyIsland-p2e-Calculator/',
  assetsInclude: ['**/*.svg', '**/*.jpeg', '**/*.jpg'],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
