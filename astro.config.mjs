// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.recoplas.com.ar',
  output: 'server',
  adapter: netlify(),

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap({
    filter: (page) => !page.includes('/carrito') && !page.includes('/checkout') && !page.includes('/mi-cuenta'),
  })]
});