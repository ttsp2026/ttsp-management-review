import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // This allows you to use process.env.GEMINI_API_KEY in your code
      // Make sure GEMINI_API_KEY is added to Vercel Environment Variables!
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        // Fix: Use process.cwd() because __dirname doesn't work in "type": "module"
        '@': path.resolve(process.cwd(), './'), 
      },
    },
  };
});