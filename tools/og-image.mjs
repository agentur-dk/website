#!/usr/bin/env node
/**
 * Erzeugt public/images/og-image-website.png im Seitenverhältnis 1,91 : 1,
 * das Social-Karten und Google erwarten. Gerendert mit den echten Schriften
 * und Farben der Website, damit das Bild nicht von den Tokens abweicht.
 *
 *   node tools/og-image.mjs
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import sharp from 'sharp';

const W = 1200, H = 630;

const font = (f) =>
  `data:font/woff2;base64,${readFileSync(`public/fonts/${f}.woff2`).toString('base64')}`;

const portraet = `data:image/jpeg;base64,${readFileSync('src/assets/team/daniel-kontelis.jpg').toString('base64')}`;

const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face{font-family:MR;src:url('${font('manrope-v20-latin-500')}') format('woff2');font-weight:500}
  @font-face{font-family:MR;src:url('${font('manrope-v20-latin-700')}') format('woff2');font-weight:700}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${W}px;height:${H}px;background:#FBF8F3;color:#1B1B1F;
       font-family:MR,sans-serif;position:relative;overflow:hidden}
  .frame{position:absolute;inset:0;padding:60px 72px;display:grid;
         grid-template-columns:1fr 330px;gap:56px;align-items:center}
  .text{display:flex;flex-direction:column;height:100%;justify-content:space-between}
  .brand{display:flex;flex-direction:column;line-height:1.15}
  .brand b{font-size:30px;font-weight:700;letter-spacing:-.02em}
  .brand span{font-size:16px;font-weight:500;color:#55534E}
  .label{font-size:20px;font-weight:700;color:#1C60AD;margin-bottom:14px}
  h1{font-size:68px;font-weight:700;line-height:1.06;letter-spacing:-.03em;max-width:12ch}
  .angebot{display:flex;align-items:center;gap:16px}
  .knopf{background:#1C60AD;color:#fff;font-size:20px;font-weight:700;padding:14px 24px;border-radius:6px}
  .url{font-size:20px;font-weight:700;color:#1B1B1F}
  img{width:330px;height:330px;object-fit:cover;border-radius:16px;display:block}
  .bild span{display:block;margin-top:12px;font-size:17px;font-weight:500;color:#55534E}
  .rule{position:absolute;left:0;right:0;bottom:0;height:8px;background:#14365F}
</style>
<div class="frame">
  <div class="text">
    <div class="brand"><b>agentur dk</b><span>design &amp; kommunikation · Köln</span></div>
    <div>
      <p class="label">Für Betriebe mit 10 bis 50 Mitarbeitern</p>
      <h1>Wir machen Ihr Unternehmen sichtbar.</h1>
    </div>
    <div class="angebot"><span class="knopf">Sichtbarkeits-Check, kostenfrei</span><span class="url">dk-dk.de</span></div>
  </div>
  <div class="bild"><img src="${portraet}" alt=""><span>Daniel Kontelis, Ihr Ansprechpartner</span></div>
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
