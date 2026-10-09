#!/usr/bin/env node
/**
 * Jedes Formular muss die Feldnamen benutzen, die der Endpunkt kennt. Fehlt
 * dort ein ausgewertetes Feld, verwirft er eine JSON-Anfrage still — kein
 * Fehler, kein Protokolleintrag.
 *
 * Ein Werkzeug nach dem Bau, kein Unit-Test: In der CI laufen die Tests vor
 * dem Build, dort gibt es kein dist/.
 *
 *     node tools/check-formular.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const hier = dirname(fileURLToPath(import.meta.url));
const dist = join(hier, '..', 'dist');
const sendPhp = join(hier, '..', 'formular', 'send.php');

/* Ohne diese beiden kommt nichts an: `form_started` entscheidet über die
   Zeitschranke, `page` darüber, ob in der Mail steht, woher die Anfrage
   kam. Beide sind in send.php namentlich verdrahtet. */
const PFLICHT = ['form_started', 'page'];

if (!existsSync(dist)) {
  console.error('✗ dist/ fehlt — erst `npm run build`, dann diese Prüfung.');
  process.exit(1);
}

const seiten = readdirSync(dist)
  .filter((d) => d.endsWith('.html'))
  .map((datei) => ({ datei, html: readFileSync(join(dist, datei), 'utf8') }))
  .filter((s) => /<form[\s>]/.test(s.html));

const felderVon = (html) => {
  const namen = new Set();
  for (const block of html.match(/<form[\s\S]*?<\/form>/g) ?? []) {
    for (const m of block.matchAll(/name="([a-zA-Z_][a-zA-Z0-9_[\]]*)"/g)) {
      namen.add(m[1]);
    }
  }
  return namen;
};

const fehler = [];

if (seiten.length === 0) {
  fehler.push('Keine einzige Seite mit <form> gefunden — stimmt der Bau?');
}

for (const { datei, html } of seiten) {
  const felder = felderVon(html);
  for (const feld of PFLICHT) {
    if (!felder.has(feld)) {
      fehler.push(`${datei}: '${feld}' fehlt — send.php verwirft die Anfrage stillschweigend`);
    }
  }
  if (!felder.has('hp_email') && !felder.has('_gotcha')) {
    fehler.push(`${datei}: kein Honigtopf im Formular`);
  }
}

/* Gegenprobe zur anderen Seite: Heißen die Felder im Endpunkt noch so? */
const php = readFileSync(sendPhp, 'utf8');
for (const feld of PFLICHT) {
  if (!php.includes(`'${feld}'`)) {
    fehler.push(`send.php erwähnt '${feld}' nicht mehr — Prüfung ist veraltet`);
  }
}

if (fehler.length) {
  console.error(`\nFormular-Prüfung: ${fehler.length} Beanstandung(en)\n`);
  for (const f of fehler) console.error(`  ✗ ${f}`);
  console.error('');
  process.exit(1);
}
console.log(`✓ Formular-Prüfung: ${seiten.length} Seite(n) mit Formular, alle Pflichtfelder und Honigtöpfe vorhanden`);
