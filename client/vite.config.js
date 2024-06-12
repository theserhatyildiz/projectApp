import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',  
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],  

      manifest: {  
        name: 'Galwin',  
              short_name: 'Galwin',  
              description: 'App to track your nutrition and weight',  
              theme_color: '#ffffff',  
              start_url: '/',  
              icons: [  
              {  
                src: 'pwa-192x192.png',  
                sizes: '192x192',  
                type: 'image/png',  
              },  
              {  
                src: 'pwa-512x512.png',  
                sizes: '512x512',  
                type: 'image/png',  
              },  
              {  
                src: 'pwa-512x512.png',  
                sizes: '512x512',  
                type: 'image/png',  
                purpose: 'maskable',  
              },  
              ],
              screenshots: [
                {
                  src: 'screenshot1.PNG',
                  sizes: '640x480',
                  type: 'image/png',
                  label: 'Home screen'
                },
                {
                  src: 'screenshot2.PNG',
                  sizes: '640x480',
                  type: 'image/png',
                  label: 'Home screen'
                },
              ],  
              },  
              workbox: {
                globPatterns: ['**/*.{js,css,html,png,jpg,svg}'],
                runtimeCaching: [
                  {
                    urlPattern: ({ url }) => url.pathname.startsWith('/'),
                    handler: 'NetworkFirst',
                    options: {
                      cacheName: 'api-cache',
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                    },
                  },
                ],
              },
            }),  
          ],  
        });
