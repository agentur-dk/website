#!/usr/bin/env node
// ABGELEITETE DATEI — nicht hier bearbeiten.
// Quelle: Code/dk-basis/pruefen/pflichtliste.mjs
// Nachziehen mit: bash ../dk-basis/verteilen.sh
//
// Kopiert statt als Paket eingebunden, damit ein Klon aus sich heraus baut.

/**
 * Was jede Seite vor dem Livegang tragen muss und sich am gebauten HTML
 * prüfen lässt (Pflichtliste in Claude-Projekte/CLAUDE.md):
 *
 *   404-Seite vorhanden
 *   jede Seite verweist auf Impressum und Datenschutz     § 5 DDG, Art. 13 DSGVO
 *   jedes Formular, das Daten verschickt, auf Datenschutz Art. 13 DSGVO
 *   keine Schriften von Google                            IP vor der Einwilligung
 *   Favicon gesetzt und vorhanden
 *
 * Erkannt wird über die Verweise, nicht über feste Dateinamen: mehrsprachige
 * Projekte heißen dort „imprint" oder „privacy".
 *
 *   node tools/basis/pflichtliste.mjs [--dist=dist]
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { findeDatei } from './server.mjs';
import { alsUrl } from './seiten.mjs';
import { ausnahmen } from './ausnahmen.mjs';

const DIST = process.argv.find((a) => a.startsWith('--dist='))?.slice(7) ?? 'dist';
const IMPRESSUM = /impressum|imprint|legal-notice|mentions-legales/i;
const DATENSCHUTZ = /datenschutz|privacy|privacidad|confidentialite/i;

function alle(ordner, endung) {
  return readdirSync(ordner).flatMap((e) => {
    const voll = join(ordner, e);
    return statSync(voll).isDirectory() ? alle(voll, endung) : (e.endsWith(endung) ? [voll] : []);
  });
}

const befunde = [];
const ausgenommen = ausnahmen('pflichtliste');
const melde = (wo, was) => befunde.push(`${wo}: ${was}`);

if (!existsSync(join(DIST, '404.html'))) befunde.push('404.html fehlt');

const htmlDateien = alle(DIST, '.html');
for (const voll of htmlDateien) {
  const url = alsUrl(voll.slice(DIST.length + 1));
  if (ausgenommen.gilt(url)) continue;
  const html = readFileSync(voll, 'utf8');
  const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);

  if (!IMPRESSUM.test(url) && !hrefs.some((h) => IMPRESSUM.test(h))) melde(url, 'kein Verweis auf ein Impressum');
  if (!DATENSCHUTZ.test(url) && !hrefs.some((h) => DATENSCHUTZ.test(h))) melde(url, 'kein Verweis auf eine Datenschutzerklärung');

  for (const [form] of html.matchAll(/<form\b[^>]*method="post"[\s\S]*?<\/form>/gi)) {
    const formHrefs = [...form.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
    if (!formHrefs.some((h) => DATENSCHUTZ.test(h))) {
      // Die Kennung steht im <form>-Tag selbst — nicht im ersten Feld darin.
      const tag = form.match(/^<form\b[^>]*>/)[0];
      const name = tag.match(/\bid="([^"]+)"/)?.[1] ?? tag.match(/\baction="([^"]+)"/)?.[1] ?? 'ohne Kennung';
      melde(url, `Formular (${name}) verschickt Daten, verweist aber nicht auf die Datenschutzerklärung`);
    }
  }

  if (/fonts\.(googleapis|gstatic)\.com/.test(html)) melde(url, 'lädt Schriften von Google');

  const icon = html.match(/<link[^>]*rel="(?:shortcut )?icon"[^>]*href="([^"]+)"/)?.[1]
            ?? html.match(/<link[^>]*href="([^"]+)"[^>]*rel="(?:shortcut )?icon"/)?.[1];
  if (!icon) melde(url, 'kein Favicon');
  else if (!/^(https?:|data:)/.test(icon) && !findeDatei(DIST, icon.startsWith('/') ? icon : new URL(icon, `http://x${url}`).pathname)) {
    melde(url, `Favicon ${icon} fehlt im Build`);
  }
}

for (const css of alle(DIST, '.css')) {
  if (/fonts\.(googleapis|gstatic)\.com/.test(readFileSync(css, 'utf8'))) melde(css.slice(DIST.length + 1), 'lädt Schriften von Google');
}

if (befunde.length) {
  console.error(`\n✗ Pflichtliste: ${befunde.length} Befund(e) auf ${htmlDateien.length} Seiten\n`);
  for (const b of befunde) console.error('  ' + b);
  ausgenommen.melden();
  process.exit(1);
}
console.log(`✓ Pflichtliste: ${htmlDateien.length} Seiten — Impressum, Datenschutz, Formularhinweis, Schriften, Favicon, 404`);
ausgenommen.melden();
