import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    proxy: {
      '/api/ocr': {
        target: 'https://apisix.commeet.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ocr/, '/ocr')
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/lndata_logo_en.png'],
      manifest: {
        name: 'GHG Data App',
        short_name: 'GHG Data',
        description: 'Greenhouse Gas Data Collection Application',
        theme_color: '#4976CB',
        icons: [
          {
            src: 'assets/lndata_logo_en.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
