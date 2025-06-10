import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      server: {
        proxy: {
          '/onboarding': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            secure: false
          }
        }
      }
    });