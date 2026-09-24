#!/usr/bin/env node
/**
 * tools/check-kontrast.mjs — misst jede gerasterte Fläche gegen ihren Grund.
 *
 * Am 25.09.2026 fiel auf, dass die Flächen in den Kartenköpfen der
 * Startseite unsichtbar waren. Der Grund stand in dither.ts: Die Punkte
 * wurden fest in #f3f3f3 gezeichnet. Auf dunklem Grund war das richtig,
 * auf den weißen Karten zeichnete es Weiß auf Weiß.
 *
 * Gemessen an den ausgelieferten Pixeln:
 *   vorher   Muster rgb(220,220,220) auf Weiß   1,37 : 1
 *   nachher  Muster rgb(148,148,148) auf Weiß   3,03 : 1
 *
 * Seither nimmt das Raster `currentColor`. Damit entscheidet das CSS über
 * den Kontrast, und zwar dort, wo man sieht, worauf die Fläche liegt.
 *
 * Diese Prüfung rechnet nach, was dabei herauskommt: Sie öffnet jede
 * Seite, sucht jedes [data-dither], multipliziert die Opazitäten der
 * ganzen Elternkette, mischt die Punktfarbe über den ersten
 * undurchsichtigen Grund darunter und vergleicht.
 *
 * Die Schwelle ist 3 : 1 — die Schwelle aus WCAG 1.4.11 für grafische
 * Objekte. Für eine rein schmückende Fläche wäre sie verhandelbar; eine
 * Fläche, die man nicht sieht, ist aber keine Gestaltung, sondern
 * Rechenzeit. Auf ausdrückliche Anweisung vom 25.09.2026: dieses
 * Kontrastverhältnis nie wieder.
 *
 *   node tools/check-kontrast.mjs
 */
import { readdirSync } from 'fs';
import { chromium } from 'playwright';
import { starteServer } from './lib/server.mjs';

const DIST = 'dist';
const SCHWELLE = 3.0;

/** sRGB-Kanal → lineare Leuchtdichte. */
function kanal(v) {
  const x = v / 255;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}
const leuchtdichte = ([r, g, b]) => 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);

function kontrast(a, b) {
  const [hell, dunkel] = [leuchtdichte(a), leuchtdichte(b)].sort((x, y) => y - x);
  return (hell + 0.05) / (dunkel + 0.05);
}

const zahlen = (s) => (s.match(/\d+(?:\.\d+)?/g) ?? []).slice(0, 3).map(Number);

const { server, port } = await starteServer(DIST);
const browser = await chromium.launch();
const seiten = readdirSync(DIST).filter((f) => f.endsWith('.html'));

const befunde = [];
const gemessen = [];

for (const datei of seiten) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://127.0.0.1:${port}/${datei}`);

  // Der Einwilligungsdialog liegt über der Seite und hält das Rastern auf.
  const knopf = page.locator('#cc-main button[data-role="all"], #cc-main .cm__btn').first();
  if (await knopf.count()) { await knopf.click(); await page.waitForTimeout(200); }

  // Die Flächen rastern erst, wenn sie im Blickfeld waren.
  await page.evaluate(async () => {
    await new Promise((fertig) => {
      let y = 0;
      const t = setInterval(() => {
        window.scrollTo(0, y); y += 700;
        if (y > document.body.scrollHeight) { clearInterval(t); fertig(); }
      }, 30);
    });
  });
  // Warten, bis wirklich jede Fläche gerastert ist — nicht eine feste
  // Zeitspanne hoffen. Unter Last (npm run verify startet reichlich
  // Browser) meldete die feste Wartezeit sonst eine leere Leinwand als
  // Befund, und ein Wächter, der flackert, ist schlimmer als keiner.
  await page.waitForFunction(() => {
    const alle = [...document.querySelectorAll('canvas[data-dither]')];
    if (!alle.length) return true;
    return alle.every((c) => {
      const r = c.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return true;        // unsichtbar, zählt nicht
      if (!c.width || !c.height) return false;
      try {
        const d = c.getContext('2d', { willReadFrequently: true })
                   .getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < d.length; i += 4) if (d[i] >= 8) return true;
        return false;
      } catch (e) { return true; }
    });
  }, null, { timeout: 15000 }).catch(() => { /* Bericht erfolgt unten */ });

  const flaechen = await page.evaluate(() => {
    const aus = [];
    for (const c of document.querySelectorAll('canvas[data-dither]')) {
      // Opazität der ganzen Kette: Ein Elternteil mit 0.4 dimmt mit.
      let deckung = 1;
      let el = c;
      while (el && el !== document.documentElement) {
        const o = parseFloat(getComputedStyle(el).opacity);
        if (o < 1) deckung *= o;
        el = el.parentElement;
      }
      // Der Grund ist der erste Vorfahre, der wirklich etwas malt.
      let grund = 'rgb(255, 255, 255)';
      el = c.parentElement;
      while (el) {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { grund = bg; break; }
        el = el.parentElement;
      }
      // Die GEZEICHNETE Farbe, nicht die berechnete `color`.
      //
      // Der erste Entwurf dieser Prüfung las getComputedStyle(c).color und
      // rechnete aus, was herauskommen SOLLTE. Zur Gegenprobe wurde die
      // alte Fassung von dither.ts wiederhergestellt — die Prüfung meldete
      // weiter „alles in Ordnung", obwohl die Fläche wieder unsichtbar war.
      // Sie maß die Absicht im CSS, nicht das Ergebnis auf der Leinwand.
      // Jetzt zählt sie die Pixel, die tatsächlich im Canvas stehen.
      let gezeichnet = null;
      try {
        const ctx = c.getContext('2d', { willReadFrequently: true });
        const bild = ctx.getImageData(0, 0, c.width, c.height).data;
        const zaehler = new Map();
        for (let i = 0; i < bild.length; i += 4) {
          if (bild[i + 3] < 8) continue;               // durchsichtig zählt nicht
          const k = `${bild[i]},${bild[i + 1]},${bild[i + 2]},${bild[i + 3]}`;
          zaehler.set(k, (zaehler.get(k) ?? 0) + 1);
        }
        let beste = null, meiste = 0;
        for (const [k, n] of zaehler) if (n > meiste) { meiste = n; beste = k; }
        if (beste) {
          const [r0, g0, b0, a0] = beste.split(',').map(Number);
          gezeichnet = { rgb: [r0, g0, b0], alpha: a0 / 255, anteil: meiste / (c.width * c.height) };
        }
      } catch (e) { /* Leinwand nicht lesbar */ }

      const r = c.getBoundingClientRect();
      aus.push({
        klasse: String(c.className).trim().split(/\s+/).filter((x) => x !== 'dither').join('.')
                || String(c.parentElement?.className ?? '').trim().split(/\s+/)[0] || '(nur .dither)',
        gezeichnet,
        grund,
        deckung: Number(deckung.toFixed(3)),
        sichtbar: r.width >= 2 && r.height >= 2,
      });
    }
    return aus;
  });

  for (const f of flaechen) {
    if (!f.sichtbar) continue;
    if (!f.gezeichnet) {
      befunde.push(`${datei} — .${f.klasse}: nichts gezeichnet (Leinwand leer oder nicht lesbar)`);
      continue;
    }
    const grund = zahlen(f.grund);
    if (grund.length < 3) continue;
    // Die Punktfarbe mischt sich zweimal über den Grund: einmal mit der
    // Deckkraft der Pixel selbst, dann mit der Opazität der Elternkette.
    const gesamt = f.deckung * f.gezeichnet.alpha;
    const gemischt = f.gezeichnet.rgb.map((v, i) => Math.round(gesamt * v + (1 - gesamt) * grund[i]));
    const wert = kontrast(gemischt, grund);
    gemessen.push({ seite: datei, ...f, gemischt, wert });
    if (wert < SCHWELLE) {
      befunde.push(
        `${datei} — .${f.klasse}: ${wert.toFixed(2)} : 1` +
        `  (gezeichnet rgb(${f.gezeichnet.rgb}) → rgb(${gemischt}) auf ${f.grund}, Deckung ${f.deckung})`
      );
    }
  }
  await page.close();
}

await browser.close();
server.close();

if (befunde.length) {
  console.error(`\n✗ check-kontrast: ${befunde.length} Fläche(n) unter ${SCHWELLE} : 1\n`);
  for (const b of befunde) console.error('  ' + b);
  console.error(
    '\n  Die Punktfarbe kommt aus `currentColor`. Liegt eine Fläche zu' +
    '\n  blass, stimmt entweder die Textfarbe des Abschnitts nicht oder' +
    '\n  die Opazität ist zu niedrig für diesen Grund. Eine Fläche, die' +
    '\n  man nicht sieht, ist keine Gestaltung.\n'
  );
  process.exit(1);
}

const kleinste = gemessen.reduce((a, b) => (a.wert < b.wert ? a : b));
console.log(
  `✓ Kontrast-Prüfung: ${gemessen.length} gerasterte Flächen auf ${seiten.length} Seiten, ` +
  `alle ≥ ${SCHWELLE} : 1`
);
console.log(
  `  schwächste: .${kleinste.klasse} auf ${kleinste.seite} mit ${kleinste.wert.toFixed(2)} : 1`
);
