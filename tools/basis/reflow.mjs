#!/usr/bin/env node
// ABGELEITETE DATEI — nicht hier bearbeiten.
// Quelle: Code/dk-basis/pruefen/reflow.mjs
// Nachziehen mit: bash ../dk-basis/verteilen.sh
//
// Kopiert statt als Paket eingebunden, damit ein Klon aus sich heraus baut.

/**
 * Kein waagerechter Überlauf bei 320, 390 und 768 px (WCAG 1.4.10).
 *
 * Gemessen wird mit GESCHLOSSENEM Einwilligungsdialog: Offen setzt er
 * `overflow: hidden` an <html>, und `scrollWidth` meldet dann jeden Überlauf
 * als Fensterbreite. Der Dialog selbst wird vorher für sich geprüft — solange
 * er offen ist, ist er die Seite.
 *
 *   node tools/basis/reflow.mjs [--dist=dist]
 */
import { chromium } from 'playwright';
import { starteServer } from './server.mjs';
import { seiten, alsUrl, nebeneinander } from './seiten.mjs';
import { ausnahmen } from './ausnahmen.mjs';

const DIST = process.argv.find((a) => a.startsWith('--dist='))?.slice(7) ?? 'dist';
const BREITEN = [320, 390, 768];
const { server, port } = await starteServer(DIST);
const browser = await chromium.launch();
const { auswahl, gesamt } = seiten(DIST);
const befunde = [];
const ausgenommen = ausnahmen('reflow');

async function oeffne(ctx, url) {
  const page = await ctx.newPage();
  // Fremde Anfragen abbrechen: keine Daten an Dritte, und ein hängender
  // Fremddienst hält die Messung nicht auf.
  await page.route('**/*', (r) => (['127.0.0.1', 'localhost'].includes(new URL(r.request().url()).hostname) ? r.continue() : r.abort()));
  // `load` statt `networkidle`: Eine Seite mit Video oder Dauerabfrage wird nie ruhig.
  await page.goto(`http://127.0.0.1:${port}${url}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(300);
  return page;
}

await nebeneinander(auswahl, 4, async (datei) => {
  const url = alsUrl(datei);
  if (ausgenommen.gilt(url)) return;
  for (const breite of BREITEN) {
    const ctx = await browser.newContext({ viewport: { width: breite, height: 800 } });
    try {
    const page = await oeffne(ctx, url);

    // Nicht über offsetParent erkennen: Der Dialog ist position: fixed, und
    // dafür ist offsetParent immer null — er gälte dann stets als geschlossen.
    const dialog = await page.evaluate(() => {
      const d = document.querySelector('#cc-main .cm');
      if (!d) return null;
      const r = d.getBoundingClientRect();
      if (r.width === 0 || getComputedStyle(d).visibility === 'hidden') return null;
      return { links: Math.round(r.left), rechts: Math.round(r.right) };
    });
    if (dialog && (dialog.links < 0 || dialog.rechts > breite)) {
      befunde.push(`${url} @${breite}px: Einwilligungsdialog ragt über den Rand (${dialog.links}–${dialog.rechts}px)`);
    }
    const knopf = page.locator('#cc-main button[data-role="necessary"]').first();
    if (await knopf.count() && await knopf.isVisible()) {
      await knopf.click();
      await page.waitForFunction(() => !document.documentElement.classList.contains('show--consent'));
    }

    const r = await page.evaluate(() => {
      const doc = document.documentElement;
      if (doc.scrollWidth <= doc.clientWidth + 1) return null;
      const zu = [...document.querySelectorAll('body *')]
        .filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.right > doc.clientWidth + 1 && getComputedStyle(el).position !== 'fixed'; })
        .filter((el) => !el.parentElement?.closest('[style*="overflow"], .overflow-hidden') )
        .slice(0, 3)
        .map((el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}`);
      return { breit: doc.scrollWidth, zu };
    });
    if (r) befunde.push(`${url} @${breite}px: ${r.breit}px breit — ${r.zu.join(', ')}`);
    } catch (fehler) {
      befunde.push(`${url} @${breite}px: nicht messbar — ${String(fehler.message).split('\n')[0]}`);
    } finally {
      await ctx.close();
    }
  }
});

await browser.close();
server.close();

const umfang = auswahl.length === gesamt ? `${gesamt} Seiten` : `${auswahl.length} von ${gesamt} Seiten (je Vorlage)`;
if (befunde.length) {
  console.error(`\n✗ Überlauf: ${befunde.length} Befund(e) auf ${umfang}\n`);
  for (const b of befunde.sort()) console.error('  ' + b);
  ausgenommen.melden();
  process.exit(1);
}
console.log(`✓ Überlauf: ${umfang} bei ${BREITEN.join(' / ')} px ohne waagerechte Bildlaufleiste`);
ausgenommen.melden();
