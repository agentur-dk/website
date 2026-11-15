#!/usr/bin/env node
/**
 * Misst jede umrandete Fläche gegen ihren Grund: Karten, Kästen,
 * Eingabefelder. Ihre Kante muss sich mit mindestens 3 : 1 abheben, die
 * Schwelle aus WCAG 1.4.11. Auch Schmuckflächen müssen sie erreichen —
 * eine Fläche, die man nicht sieht, ist keine Gestaltung.
 *
 * Die Kante ist entweder der Rahmen oder die Fläche selbst: Ein blauer
 * Knopf braucht keinen sichtbaren Rahmen, seine Füllung hebt ihn ab.
 * Durchscheinende Rahmen werden über den Grund gemischt, denn gesehen wird
 * die Mischung, nicht die Farbangabe im CSS.
 *
 *   node tools/check-kontrast.mjs
 */
import { readdirSync } from 'fs';
import { chromium } from 'playwright';
import { starteServer } from './lib/server.mjs';

const DIST = 'dist';
const SCHWELLE = 3.0;
const BREITEN = [1440, 390];

function kanal(v) {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}
const leuchtdichte = ([r, g, b]) => 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
function kontrast(a, b) {
  const [hell, dunkel] = [leuchtdichte(a), leuchtdichte(b)].sort((x, y) => y - x);
  return (hell + 0.05) / (dunkel + 0.05);
}
const mische = ([r, g, b, a], grund) => [r, g, b].map((v, i) => Math.round(a * v + (1 - a) * grund[i]));

const { server, port } = await starteServer(DIST);
const browser = await chromium.launch();
const seiten = readdirSync(DIST).filter((f) => f.endsWith('.html'));

const befunde = new Map();
let anzahl = 0;
let kleinste = null;

for (const breite of BREITEN) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } });
  for (const datei of seiten) {
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/${datei}`);
    const knopf = page.locator('#cc-main button[data-role="necessary"]').first();
    if (await knopf.count()) { await knopf.click(); await page.waitForTimeout(150); }

    const kaesten = await page.evaluate(() => {
      const farbe = (s) => {
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const t = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
        return [t[0], t[1], t[2], t.length > 3 ? t[3] : 1];
      };
      const sichtbar = (el) => {
        for (let e = el; e; e = e.parentElement) {
          const cs = getComputedStyle(e);
          if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
          if (e.hidden) return false;
        }
        return true;
      };
      /* Der Grund ist der erste Vorfahre, der wirklich etwas malt. */
      const grundVon = (el) => {
        for (let e = el.parentElement; e; e = e.parentElement) {
          const f = farbe(getComputedStyle(e).backgroundColor);
          if (f && f[3] > 0.99) return f;
        }
        return [255, 255, 255, 1];
      };
      const name = (el) => {
        const k = String(el.className || '').trim().split(/\s+/).filter((c) => !c.startsWith('astro-'))[0];
        return el.tagName.toLowerCase() + (k ? '.' + k : '');
      };
      const aus = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('#cc-main')) continue;
        const cs = getComputedStyle(el);
        const seiten = ['Top', 'Right', 'Bottom', 'Left'];
        const umrandet = seiten.every((s) =>
          parseFloat(cs[`border${s}Width`]) >= 1 && cs[`border${s}Style`] !== 'none');
        if (!umrandet) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 12 || r.height < 12) continue;
        if (!sichtbar(el)) continue;
        const rahmen = farbe(cs.borderLeftColor);
        const flaeche = farbe(cs.backgroundColor);
        if (!rahmen) continue;
        aus.push({ name: name(el), rahmen, flaeche, grund: grundVon(el) });
      }
      return aus;
    });

    for (const k of kaesten) {
      const grund = k.grund.slice(0, 3);
      const kante = k.rahmen[3] > 0 ? kontrast(mische(k.rahmen, grund), grund) : 0;
      const fuellung = k.flaeche && k.flaeche[3] > 0 ? kontrast(mische(k.flaeche, grund), grund) : 0;
      const wert = Math.max(kante, fuellung);
      anzahl++;
      if (!kleinste || wert < kleinste.wert) kleinste = { wert, name: k.name, seite: datei };
      if (wert < SCHWELLE) {
        const schluessel = `${k.name} auf rgb(${grund})`;
        const eintrag = befunde.get(schluessel) ?? { wert, seiten: new Set() };
        eintrag.seiten.add(`${datei}@${breite}`);
        befunde.set(schluessel, eintrag);
      }
    }
    await page.close();
  }
  await ctx.close();
}

await browser.close();
server.close();

if (befunde.size) {
  console.error(`\n✗ check-kontrast: ${befunde.size} Fläche(n) mit Kante unter ${SCHWELLE} : 1\n`);
  for (const [k, v] of befunde) {
    const liste = [...v.seiten];
    console.error(`  ${k}: ${v.wert.toFixed(2)} : 1  (${liste.slice(0, 3).join(', ')}${liste.length > 3 ? ` und ${liste.length - 3} weitere` : ''})`);
  }
  console.error('\n  Rahmen oder Fläche müssen sich vom Grund abheben. Eine Fläche,\n  die man nicht sieht, ist keine Gestaltung.\n');
  process.exit(1);
}

console.log(`✓ Kontrast-Prüfung: ${anzahl} umrandete Flächen auf ${seiten.length} Seiten in ${BREITEN.length} Breiten, alle ≥ ${SCHWELLE} : 1`);
if (kleinste) console.log(`  schwächste: ${kleinste.name} auf ${kleinste.seite} mit ${kleinste.wert.toFixed(2)} : 1`);
