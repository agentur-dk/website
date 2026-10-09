#!/usr/bin/env node
// ABGELEITETE DATEI — nicht hier bearbeiten.
// Quelle: Code/dk-basis/pruefen/einwilligung.mjs
// Nachziehen mit: bash ../dk-basis/verteilen.sh
//
// Kopiert statt als Paket eingebunden, damit ein Klon aus sich heraus baut.

/**
 * Vor der Einwilligung verlässt keine Anfrage die eigene Seite, und es wird
 * kein Cookie gesetzt (§ 25 TDDDG) — auch nicht nach „Nur notwendige".
 *
 * Die Gegenprobe macht das Ergebnis belastbar: Nach „Alle akzeptieren" muss
 * eine fremde Anfrage zu sehen sein. Sieht der Test auch dann keine, sieht
 * er überhaupt keine, und „nichts gefunden" hieße nichts.
 *
 * Fremde Anfragen werden abgebrochen: Eine Prüfung schickt keine Daten an Dritte.
 *
 *   node tools/basis/einwilligung.mjs [--dist=dist]
 */
import { chromium } from 'playwright';
import { starteServer } from './server.mjs';
import { seiten, alsUrl, nebeneinander } from './seiten.mjs';
import { ausnahmen } from './ausnahmen.mjs';

const DIST = process.argv.find((a) => a.startsWith('--dist='))?.slice(7) ?? 'dist';
const { server, port } = await starteServer(DIST);
const browser = await chromium.launch();
const { auswahl, gesamt } = seiten(DIST);

async function besuche(url, entscheidung) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const fremd = new Set();
  await page.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    if (host === '127.0.0.1' || host === 'localhost') return route.continue();
    fremd.add(host);
    return route.abort();
  });
  // `load` statt `networkidle`: Eine Seite mit Video oder Dauerabfrage wird nie ruhig.
  await page.goto(`http://127.0.0.1:${port}${url}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(300);
  if (entscheidung) {
    const knopf = page.locator(`#cc-main button[data-role="${entscheidung}"]`).first();
    if (await knopf.count()) await knopf.click();
  }
  // Bis ans Ende scrollen: Eingebettetes lädt oft erst beim Sichtbarwerden.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
  });
  await page.waitForTimeout(800);
  const cookies = (await ctx.cookies()).map((c) => c.name);
  await ctx.close();
  return { fremd: [...fremd], cookies };
}

const befunde = [];
const ausgenommen = ausnahmen('einwilligung');
await nebeneinander(auswahl, 4, async (datei) => {
  const url = alsUrl(datei);
  if (ausgenommen.gilt(url)) return;
  let ohne, notwendig;
  try {
    ohne = await besuche(url, null);
    notwendig = await besuche(url, 'necessary');
  } catch (fehler) {
    befunde.push(`${url}: nicht messbar — ${String(fehler.message).split('\n')[0]}`);
    return;
  }
  if (ohne.fremd.length) befunde.push(`${url}: vor jeder Entscheidung angefragt → ${ohne.fremd.join(', ')}`);
  if (ohne.cookies.length) befunde.push(`${url}: vor jeder Entscheidung Cookie gesetzt → ${ohne.cookies.join(', ')}`);
  if (notwendig.fremd.length) befunde.push(`${url}: nach „Nur notwendige" angefragt → ${notwendig.fremd.join(', ')}`);
});

let gegenprobe = false;
for (const datei of auswahl) {
  if (ausgenommen.gilt(alsUrl(datei))) continue;
  try {
    if ((await besuche(alsUrl(datei), 'all')).fremd.length) { gegenprobe = true; break; }
  } catch { /* nicht messbare Seite ist oben schon gemeldet */ }
}

await browser.close();
server.close();

const umfang = auswahl.length === gesamt ? `${gesamt} Seiten` : `${auswahl.length} von ${gesamt} Seiten (je Vorlage)`;
if (!gegenprobe) {
  console.log(`○ Einwilligung: ${umfang} — keine fremde Anfrage, auch nach „Alle akzeptieren".`);
  console.log('  Entweder bindet die Seite keinen Dienst ein, oder der Test sieht keine Anfragen.');
}
if (befunde.length) {
  console.error(`\n✗ Einwilligung: ${befunde.length} Befund(e) auf ${umfang}\n`);
  for (const b of befunde.sort()) console.error('  ' + b);
  ausgenommen.melden();
  process.exit(1);
}
if (gegenprobe) console.log(`✓ Einwilligung: ${umfang}, vor der Wahl und nach „Nur notwendige" nichts Fremdes; Gegenprobe gesehen`);
ausgenommen.melden();
