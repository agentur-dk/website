#!/usr/bin/env node
/**
 * tools/og-image.mjs — erzeugt public/images/og-image-website.png
 *
 * Das bisherige Bild war 1536×1024 (3:2). Social-Karten und Google
 * erwarten 1.91:1 — bei 3:2 wird oben und unten beschnitten. Außerdem
 * fehlte jedes Markenzeichen, obwohl das Bild in jeder Vorschau und in
 * KI-Zitatkarten auftaucht.
 *
 * Gerendert wird mit den echten Schriften und Farben der Website, damit
 * das Bild nicht auseinanderläuft, wenn Tokens sich ändern.
 *
 *   node tools/og-image.mjs
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import sharp from 'sharp';

const W = 1200, H = 630;

const font = (f) =>
  `data:font/woff2;base64,${readFileSync(`public/fonts/${f}.woff2`).toString('base64')}`;

const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face{font-family:SG;src:url('${font('space-grotesk-v3-latin-700')}') format('woff2');font-weight:700}
  @font-face{font-family:MR;src:url('${font('manrope-v20-latin-500')}') format('woff2');font-weight:500}
  @font-face{font-family:MR;src:url('${font('manrope-v20-latin-700')}') format('woff2');font-weight:700}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${W}px;height:${H}px;background:#121212;color:#e8e8e8;
       font-family:MR,sans-serif;position:relative;overflow:hidden}
  .glow{position:absolute;inset:auto -180px -320px auto;width:820px;height:820px;border-radius:50%;
        background:radial-gradient(circle,rgba(28,96,173,.55) 0%,rgba(28,96,173,0) 68%)}
  .frame{position:absolute;inset:0;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
  .brand{display:flex;flex-direction:column;line-height:1.15}
  .brand b{font-family:SG;font-size:34px;font-weight:700;letter-spacing:-.02em;color:#fff}
  .brand span{font-size:15px;color:#a8a8a8;letter-spacing:.02em}
  h1{font-family:SG;font-size:66px;font-weight:700;line-height:1.08;letter-spacing:-.025em;
     color:#fff;max-width:15ch}
  h1 mark{background:#1C60AD;color:#fff;padding:0 .12em;border-radius:4px}
  .meta{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  .tag{font-size:17px;font-weight:500;color:#d4d4d4;border:1px solid #333;
       border-radius:999px;padding:9px 18px}
  .url{margin-left:auto;font-size:19px;font-weight:700;color:#5090d0}
  .rule{position:absolute;left:0;right:0;bottom:0;height:6px;
        background:linear-gradient(to right,#1C60AD,#474078,#412848)}
</style>
<div class="glow"></div>
<div class="frame">
  <div class="brand"><b>agentur dk</b><span>design &amp; kommunikation · Köln</span></div>
  <h1>Barrierefreie Websites, die <mark>gefunden</mark> werden.</h1>
  <div class="meta">
    <span class="tag">BFSG &amp; WCAG 2.2 AA</span>
    <span class="tag">WordPress</span>
    <span class="tag">SEO &amp; GEO</span>
    <span class="url">dk-dk.de</span>
  </div>
</div>
<div class="rule"></div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const raw = await page.screenshot({ type: 'png' });
await browser.close();

// Palettenreduktion: das Motiv ist flächig, 256 Farben genügen und sparen ~80 %.
const out = await sharp(raw).png({ palette: true, quality: 90, effort: 10 }).toBuffer();
writeFileSync('public/images/og-image-website.png', out);
console.log(`og-image-website.png: ${W}×${H}, ${(out.length / 1024).toFixed(0)} KB`);
