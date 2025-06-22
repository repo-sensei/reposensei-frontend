import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Use placeholders that will be replaced at runtime
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('VITE_SUPABASE_URL_PLACEHOLDER'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('VITE_SUPABASE_ANON_KEY_PLACEHOLDER'),
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify('VITE_BACKEND_URL_PLACEHOLDER'),
  },
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