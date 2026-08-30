#!/usr/bin/env node
/**
 * tools/wcag-manual.mjs — prüft die WCAG-2.2-Kriterien, die axe-core nicht
 * abdeckt. axe findet je nach Quelle 30–40 % der Verstöße; alles, was von
 * Layout, Zoom, Fokusreihenfolge oder Zeigergröße abhängt, muss gemessen
 * werden.
 *
 * Geprüft wird:
 *   1.4.10 Reflow           — kein horizontales Scrollen bei 320 px / 400 % Zoom
 *   1.4.12 Textabstand      — kein Inhaltsverlust bei erhöhten Abständen
 *   2.4.11 Fokus nicht verdeckt — sticky Header verdeckt kein fokussiertes Element
 *   2.5.8  Zielgröße        — interaktive Elemente mindestens 24 × 24 px
 *   1.4.3  Text über Raster  — kein Text über einer gerasterten Fläche
 *
 * Voraussetzung: `node tools/serve.mjs` oder `npm run preview` läuft.
 */
import { chromium } from 'playwright';

const ORIGIN = process.env.LH_ORIGIN ?? 'http://localhost:4321';
const BASE   = process.env.LH_BASE ?? '/';

const ALL_PAGES = [
  'index', 'leistungen', 'bfsg-wordpress-website-agentur', 'wordpress-entwicklung',
  'website-leasing', 'seo-geo', 'online-marketing', 'social-recruiting',
  'corporate-design', 'ki-services', 'projekte', 'ueber-uns',
  'barrierefreiheit', 'impressum', 'datenschutz', '404',
];
const argPages = process.argv.find((a) => a.startsWith('--pages='));
const pages = argPages ? argPages.split('=')[1].split(',') : ALL_PAGES;

/** WCAG 1.4.12: die vom Kriterium geforderten Mindestabstände. */
const TEXT_SPACING = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important; }
  p { margin-bottom: 2em !important; }`;

const findings = [];
const add = (sc, page, detail) => findings.push({ sc, page, detail });

const browser = await chromium.launch();

for (const name of pages) {
  const url = `${ORIGIN}${BASE}${name}.html`;

  // ---- 1.4.3 Text über einer gerasterten Fläche ------------------------
  // axe-core kann das nicht finden: Es liest die CSS-Hintergrundfarbe, und
  // die ist unter einem <canvas> unverändert dunkel. Was das Canvas dorthin
  // malt, sieht es nicht. Genau so ist es passiert — die Fläche im Footer
  // lag unter 17 Textelementen, axe meldete null Verstöße.
  //
  // Das Kontrastverhältnis allein hilft hier auch nicht weiter: Es setzt
  // einen gleichmäßigen Grund voraus. Ein 1-Bit-Raster erreicht als
  // Mittelwert brauchbare Zahlen und ist trotzdem unlesbar, weil zwischen
  // den Buchstaben Pixel aufblitzen. Deshalb wird nicht gerechnet, sondern
  // die Überlappung selbst untersagt.
  // Zwei Breiten, weil die Flächen umbrechen: Die Kugel im Kopf steht am
  // Desktop neben dem Satz und rutscht darunter, sobald die Zweispaltigkeit
  // fällt. Ein Durchlauf bei 1440 allein hätte das nie gesehen.
  for (const breite of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    // Bis ans Seitenende scrollen, damit jede Fläche gezeichnet wurde —
    // gezeichnet wird erst beim Sichtbarwerden. `scroll-behavior: smooth`
    // muss dafür aus: Sonst animiert jeder Sprung, 60 ms reichen nicht, und
    // die Schleife kommt über die ersten 200 px nicht hinaus.
    await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
    await page.evaluate(async () => {
      const schritt = window.innerHeight * 0.8;
      for (let y = 0; y <= document.documentElement.scrollHeight; y += schritt) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
    });
    const ueberdeckt = await page.evaluate(() => {
      const flaechen = [...document.querySelectorAll('canvas[data-dither]')]
        .map((c) => ({ el: c, r: c.getBoundingClientRect() }))
        .filter((f) => f.r.width > 2 && f.r.height > 2);
      if (!flaechen.length) return [];

      /**
       * Deckt ein Element zwischen Text und Fläche den Text ab?
       *
       * Nur Vorfahren *unterhalb* des gemeinsamen Vorfahren können das:
       * Alles ab dem gemeinsamen Vorfahren aufwärts malt hinter dem
       * Canvas, weil das Canvas selbst darin liegt. Ohne diese Grenze
       * schirmt <body> mit seiner Hintergrundfarbe jeden Text ab und die
       * Prüfung findet nie etwas — genau so ist sie beim ersten Versuch
       * an der Gegenprobe gescheitert.
       */
      const abgeschirmt = (el, canvas) => {
        let gemeinsam = el;
        while (gemeinsam && !gemeinsam.contains(canvas)) gemeinsam = gemeinsam.parentElement;
        for (let n = el; n && n !== gemeinsam; n = n.parentElement) {
          const m = getComputedStyle(n).backgroundColor.match(/rgba?\(([^)]+)\)/);
          if (!m) continue;
          const teile = m[1].split(',').map((v) => parseFloat(v));
          if ((teile.length > 3 ? teile[3] : 1) >= 0.9) return true;
        }
        return false;
      };

      const treffer = new Set();
      const laeuft = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = laeuft.nextNode(); n; n = laeuft.nextNode()) {
        if (!n.nodeValue || !n.nodeValue.trim()) continue;
        const el = n.parentElement;
        if (!el || el.closest('[aria-hidden="true"]')) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;

        const bereich = document.createRange();
        bereich.selectNodeContents(n);
        for (const kasten of bereich.getClientRects()) {
          if (kasten.width < 2 || kasten.height < 2) continue;
          for (const f of flaechen) {
            if (kasten.left < f.r.right && kasten.right > f.r.left &&
                kasten.top < f.r.bottom && kasten.bottom > f.r.top &&
                // Der Header liegt als klebende Leiste über dem Hero, hat
                // aber eine eigene deckende Fläche.
                !abgeschirmt(el, f.el)) {
              treffer.add(n.nodeValue.trim().slice(0, 32));
            }
          }
        }
      }
      return [...treffer];
    });
    if (ueberdeckt.length) {
      add('1.4.3 Text über Raster', name,
          `bei ${breite}px liegen ${ueberdeckt.length} Textstelle(n) über einer ` +
          `Dither-Fläche: ` + ueberdeckt.slice(0, 4).map((t) => `„${t}"`).join(', '));
    }
    await ctx.close();
  }

  // ---- 1.4.10 Reflow bei 320 px ----------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 640 } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const bad = [];
      if (doc.scrollWidth > doc.clientWidth + 1) {
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          // Elemente, die über den Viewport hinausragen und selbst nicht scrollen
          if (r.width > 0 && (r.right > doc.clientWidth + 1 || r.left < -1)) {
            const cs = getComputedStyle(el);
            if (cs.overflowX === 'visible' && cs.position !== 'fixed') {
              bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ` +
                       `(${Math.round(r.left)}–${Math.round(r.right)}px)`);
            }
          }
        });
      }
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, bad: [...new Set(bad)].slice(0, 5) };
    });
    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      add('1.4.10 Reflow', name,
          `horizontal scrollbar bei 320px (${overflow.scrollWidth} > ${overflow.clientWidth}): ${overflow.bad.join(', ')}`);
    }
    await ctx.close();
  }

  // ---- 1.4.12 Textabstand ----------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const clipped = await page.evaluate((css) => {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      const bad = [];
      document.querySelectorAll('main p, main h1, main h2, main h3, main li, main button, main a').forEach((el) => {
        // Absichtlich nur für Screenreader sichtbare Elemente sind per
        // Definition auf 1px geklemmt — kein Inhaltsverlust.
        if (el.closest('.u-sr-only, .sr-only')) return;
        // Abgeschnittener Text: Inhalt größer als der Kasten, ohne Scrollmöglichkeit
        if (el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflowY === 'hidden') {
          bad.push(`${el.tagName.toLowerCase()}: "${el.textContent.trim().slice(0, 40)}"`);
        }
      });
      return [...new Set(bad)].slice(0, 5);
    }, TEXT_SPACING);
    if (clipped.length) add('1.4.12 Textabstand', name, `Inhalt abgeschnitten: ${clipped.join(' | ')}`);
    await ctx.close();
  }

  // ---- 2.5.8 Zielgröße --------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const small = await page.evaluate(() => {
      const bad = [];
      const sel = 'a[href], button, input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])';
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;              // unsichtbar
        if (getComputedStyle(el).display === 'inline') return;    // Ausnahme „inline" in 2.5.8
        // Nicht bedienbare bzw. für AT verborgene Elemente sind keine Ziele:
        // Honeypots (tabindex=-1 + aria-hidden) und visuell versteckte
        // Radios, deren zugehöriges <label> das eigentliche Ziel ist.
        if (el.closest('[aria-hidden="true"]') || el.getAttribute('tabindex') === '-1') return;
        const label = el.closest('label');
        if (label) {
          const lr = label.getBoundingClientRect();
          if (lr.width >= 24 && lr.height >= 24) return;
        }
        if (r.width < 24 || r.height < 24) {
          bad.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ` +
                   `${Math.round(r.width)}×${Math.round(r.height)} — "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`);
        }
      });
      return [...new Set(bad)].slice(0, 8);
    });
    if (small.length) add('2.5.8 Zielgröße', name, small.join(' | '));
    await ctx.close();
  }

  // ---- 2.4.11 Fokus nicht verdeckt --------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const obscured = await page.evaluate(async () => {
      const header = document.querySelector('.site-header');
      if (!header) return [];
      const bad = [];
      // Zu jedem Sprungziel scrollen und prüfen, ob der sticky Header es abdeckt.
      const targets = [...document.querySelectorAll('main [id]')].slice(0, 25);
      for (const t of targets) {
        t.scrollIntoView();
        await new Promise((r) => requestAnimationFrame(r));
        const hb = header.getBoundingClientRect();
        const tb = t.getBoundingClientRect();
        if (tb.top < hb.bottom && tb.bottom > hb.top && tb.height < 2000) {
          bad.push(`#${t.id} (Oberkante ${Math.round(tb.top)}px, Header bis ${Math.round(hb.bottom)}px)`);
        }
      }
      return bad.slice(0, 5);
    });
    if (obscured.length) add('2.4.11 Fokus verdeckt', name, obscured.join(' | '));
    await ctx.close();
  }
}

await browser.close();

if (!findings.length) {
  console.log(`✓ WCAG-Zusatzprüfung: keine Befunde auf ${pages.length} Seiten`);
  console.log('  geprüft: 1.4.3 Text über Raster · 1.4.10 Reflow · 1.4.12 Textabstand ·');
  console.log('           2.4.11 Fokus · 2.5.8 Zielgröße');
  process.exit(0);
}

const bySc = new Map();
for (const f of findings) {
  if (!bySc.has(f.sc)) bySc.set(f.sc, []);
  bySc.get(f.sc).push(f);
}
for (const [sc, list] of bySc) {
  console.log(`\n${sc} — ${list.length} Seite(n)`);
  for (const f of list) console.log(`   ${f.page}: ${f.detail}`);
}
console.log(`\n${findings.length} Befunde.`);
process.exit(1);
