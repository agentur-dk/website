#!/usr/bin/env node
/**
 * tools/check-einwilligung.mjs — vor der Einwilligung verlässt keine Anfrage
 * die eigene Domain, und es wird kein Cookie gesetzt (§ 25 TDDDG).
 *
 * Je Seite drei Zustände, jeweils in einem frischen Browserprofil:
 *
 *   ohne Entscheidung   keine fremde Anfrage, kein Cookie
 *   „Nur notwendige"    keine fremde Anfrage
 *   „Alle akzeptieren"  mindestens eine fremde Anfrage — die Gegenprobe
 *
 * Die Gegenprobe ist der Grund, warum dem Ergebnis zu trauen ist: Sieht
 * der Test auch nach voller Zustimmung keine fremde Anfrage, sieht er
 * überhaupt keine, und „nichts gefunden" hieße nichts.
 *
 * Fremde Anfragen werden abgebrochen, nicht durchgelassen: Eine Prüfung
 * soll keine Daten an Google schicken.
 */
import { readdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { starteServer } from './lib/server.mjs';

const DIST = 'dist';
const EIGEN = new Set(['127.0.0.1', 'localhost']);

const { server, port } = await starteServer(DIST);
const browser = await chromium.launch();
const seiten = readdirSync(DIST).filter((f) => f.endsWith('.html')).sort();

const befunde = [];
let gegenprobeGesehen = false;

async function besuche(datei, entscheidung) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const fremd = new Set();
  await page.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    if (EIGEN.has(host)) return route.continue();
    fremd.add(host);
    return route.abort();
  });

  await page.goto(`http://127.0.0.1:${port}/${datei}`, { waitUntil: 'networkidle' });

  if (entscheidung) {
    const knopf = page.locator(`#cc-main button[data-role="${entscheidung}"]`).first();
    if (await knopf.count()) await knopf.click();
  }

  // Bis ans Ende scrollen: Eingebettetes und spät Geladenes hängt oft am Sichtbarwerden.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
  });
  await page.waitForLoadState('networkidle');

  const cookies = await ctx.cookies();
  await ctx.close();
  return { fremd: [...fremd], cookies: cookies.map((c) => c.name) };
}

for (const datei of seiten) {
  const ohne = await besuche(datei, null);
  if (ohne.fremd.length) befunde.push(`${datei}: vor jeder Entscheidung angefragt → ${ohne.fremd.join(', ')}`);
  if (ohne.cookies.length) befunde.push(`${datei}: vor jeder Entscheidung Cookie gesetzt → ${ohne.cookies.join(', ')}`);

  const notwendig = await besuche(datei, 'necessary');
  if (notwendig.fremd.length) befunde.push(`${datei}: nach „Nur notwendige" angefragt → ${notwendig.fremd.join(', ')}`);

  if (!gegenprobeGesehen) {
    const alle = await besuche(datei, 'all');
    if (alle.fremd.length) gegenprobeGesehen = true;
  }
}

await browser.close();
server.close();

if (!gegenprobeGesehen) {
  befunde.push('Gegenprobe fehlgeschlagen: auch nach „Alle akzeptieren" keine fremde Anfrage — der Test sieht keine Anfragen und sagt nichts aus');
}

if (befunde.length) {
  console.error(`\n✗ Einwilligung: ${befunde.length} Befund(e)\n`);
  for (const b of befunde) console.error('  ' + b);
  console.error('');
  process.exit(1);
}

console.log(`✓ Einwilligung: ${seiten.length} Seiten, vor der Entscheidung und nach „Nur notwendige" keine fremde Anfrage und kein Cookie`);
console.log('  Gegenprobe: nach „Alle akzeptieren" werden fremde Anfragen gesehen');
