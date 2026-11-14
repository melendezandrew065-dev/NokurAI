import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          id: '/',
          name: 'NokurAI - Smart Spaced Repetition Study & Flashcards',
          short_name: 'NokurAI',
          description: 'AI-powered study platform that automatically transforms lecture notes and PDFs into step-by-step topic walkthroughs and spaced repetition flashcards with gamification, end-to-end encryption, and offline sync.',
          theme_color: '#4f46e5',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          navigateFallbackDenylist: [
            /^\/api\//,
            /^\/privacy$/,
            /^\/terms$/,
            /^\/about$/,
            /^\/contact$/,
            /^\/cookie-policy$/,
            /^\/ads\.txt$/,
            /^\/app-ads\.txt$/,
            /^\/robots\.txt$/,
            /^\/sitemap\.xml$/,
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio to prevent WebSocket connection errors behind Cloud Run proxies
      hmr: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
