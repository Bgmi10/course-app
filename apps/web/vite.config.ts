import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['!../../packages/ui/**'],  // Ensure that Vite watches for changes in the `ui` package
    },
  },
});

