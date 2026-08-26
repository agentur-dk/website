// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

/**
 * Produktion läuft auf GitHub Pages hinter der Custom Domain dk-dk.de
 * (public/CNAME). Custom Domains liefern an der Wurzel aus — deshalb
 * base: '/' und nicht '/website/'.
 *
 * Für einen Preview-Deploy ohne Custom Domain:
 *   SITE_URL=https://agentur-dk.github.io BASE_PATH=/website/ npm run build
 */
const SITE = process.env.SITE_URL ?? 'https://dk-dk.de';
const BASE = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  build: {
    // Legacy-URLs bleiben erhalten: /leistungen.html statt /leistungen/
    format: 'file',
    // Ein einziger 49-kB-Stylesheet-Request blockierte das Rendering (~700 ms
    // auf Mobile). Inline gestellt entfällt der Roundtrip komplett.
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
    build: { cssMinify: 'lightningcss' },
  },
});
