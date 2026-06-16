import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { sitemapPlugin } from './scripts/vite-plugin-sitemap.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), sitemapPlugin()],
  base: '/keebo/',
})
