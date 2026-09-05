#!/usr/bin/env node
/**
 * tools/e2e.mjs — die Strecke, auf der aus einem Besucher eine Anfrage wird.
 *
 *   npm run build && npm run check:e2e
 *
 * Warum es das gibt: Geprüft wird bisher, dass das PHP syntaktisch in Ordnung
 * ist (`check:php`), dass Links stimmen, dass axe-core nichts findet und dass
 * Lighthouse 100 meldet. Ob ein Mensch das Formular ausfüllen und absenden
 * kann, prüfte niemand — und das ist der einzige Weg, auf dem jemand hier
 * Kontakt aufnimmt.
 *
 * ── Zwei Dinge am Aufbau, die Absicht sind ──────────────────────────
 *
 * **Kein Aufruf verlässt den Rechner.** Der Endpunkt liegt auf
 * `vorschau.dk-dk.de`; jeder Lauf würde dort echte Nachrichten und echte
 * Zählstände erzeugen. Beide Aufrufe — die Zeitstempel-Signatur und das
 * Absenden — werden abgefangen und beantwortet. Was zählt, ist die Anfrage,
 * nicht die Antwort.
 *
 * **Reduzierte Bewegung.** Sonst scrollt der Testläufer vor jedem Klick, misst
 * die Position zweimal und findet sie mitten in der Bewegung nie gleich.
 * Nebenbei prüft es den Pfad, den Menschen mit dieser Einstellung sehen.
 *
 * Ohne Playwright wird übersprungen statt fehlzuschlagen: Auf einem Rechner
 * ohne Browser soll `npm run verify` nicht rot werden.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = Number(process.env.E2E_PORT ?? 4398);
const ORIGIN = `http://127.0.0.1:${PORT}`;

if (!existsSync('dist/index.html')) {
  console.error('dist/ fehlt — erst `npm run build`.');
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.log('Playwright nicht installiert — E2E übersprungen.');
  process.exit(0);
}

/* ── Server ──────────────────────────────────────────────────────────── */

const server = spawn('node', ['tools/serve.mjs', String(PORT)], { stdio: 'ignore' });
const beenden = () => server.kill();
process.on('exit', beenden);
process.on('SIGINT', () => { beenden(); process.exit(130); });

for (let versuch = 0; versuch < 40; versuch++) {
  try {
    const antwort = await fetch(`${ORIGIN}/`);
    if (antwort.ok) break;
  } catch { /* noch nicht da */ }
  await sleep(150);
}

/* ── Prüfungen ───────────────────────────────────────────────────────── */

const ergebnisse = [];
const pruefe = (name, bedingung, hinweis = '') => {
  ergebnisse.push({ name, ok: Boolean(bedingung), hinweis });
  console.log(`  ${bedingung ? 'OK  ' : 'FEHL'} ${name}${bedingung || !hinweis ? '' : ` — ${hinweis}`}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: 'reduce' });

/*
 * Die Einwilligung mitbringen.
 *
 * Der Dialog legt sich mit `disablePageInteraction` über die Seite — Absicht,
 * und anderswo geprüft. Hier wäre er nur eine Quelle von Zufall: Jeder Klick
 * liefe in einen Überzug. Der Aufbau des Cookies ist der von CookieConsent;
 * ändert die Bibliothek ihn, erscheint der Dialog wieder und die Prüfung
 * fällt auf, statt still etwas anderes zu messen.
 */
const jetzt = new Date().toISOString();
await context.addCookies([{
  name: 'dk_consent_v2',
  value: encodeURIComponent(JSON.stringify({
    categories: ['necessary'],
    revision: 0,
    data: null,
    consentTimestamp: jetzt,
    consentId: '00000000-0000-4000-8000-000000000000',
    services: { necessary: [] },
    languageCode: 'de',
    lastConsentTimestamp: jetzt,
    expirationTime: Date.now() + 180 * 24 * 3600 * 1000,
  })),
  domain: '127.0.0.1',
  path: '/',
}]);

const page = await context.newPage();

/* Der Endpunkt bleibt unberührt. Beide Aufrufe werden hier beantwortet. */
const gesendet = [];
await page.route('**/formular/send.php**', async (route) => {
  const url = route.request().url();
  if (url.includes('challenge=1')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ts: Math.floor(Date.now() / 1000), sig: 'testsignatur' }),
    });
    return;
  }
  gesendet.push(route.request().postData() ?? '');
  await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
});

await page.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' });

const formular = page.locator('#lf-form');
pruefe('das Formular steht auf der Startseite', await formular.count() === 1);

/* Schritt 1 — ohne Auswahl geht es nicht weiter. */
await page.locator('[data-next="2"]').click();
pruefe(
  'ohne Thema kein zweiter Schritt',
  await page.locator('#lf-topics-error').isVisible(),
  'die Fehlermeldung blieb versteckt',
);
pruefe(
  'Schritt 1 bleibt stehen',
  await page.locator('#lf-step-1').isVisible(),
);

/* Mit Auswahl weiter. */
await page.locator('.lf-topic__input').first().check();
await page.locator('[data-next="2"]').click();
pruefe('mit Thema geht es zu Schritt 2', await page.locator('#lf-step-2').isVisible());

await page.locator('#lf-message').fill('Testnachricht aus der E2E-Pruefung.');
await page.locator('[data-next="3"]').click();
pruefe('Schritt 3 erscheint', await page.locator('#lf-step-3').isVisible());

/* Der Honigtopf ist für Menschen unsichtbar — und trotzdem im Markup. */
const topf = page.locator('input[name="hp_email"]');
pruefe('Honigtopf vorhanden', await topf.count() === 1);
pruefe('Honigtopf für Menschen unsichtbar', !(await topf.isVisible()));

/* Fehleingabe: eine unbrauchbare Adresse hält das Formular fest. */
await page.locator('#lf-vorname').fill('Maria');
await page.locator('#lf-nachname').fill('Testerin');
await page.locator('#lf-email').fill('keine-adresse');
await page.locator('#lf-form button[type="submit"]').click();
await sleep(300);
pruefe('unbrauchbare E-Mail wird nicht abgeschickt', gesendet.length === 0,
  `es gingen ${gesendet.length} Anfragen hinaus`);

/* Und der ganze Weg bis zum Versand.
   Die Rechenprobe ist der Spamschutz an dieser Stelle: eine Summe aus zwei
   Ziffern, die das Skript beim Öffnen des dritten Schritts stellt. Sie wird
   hier gelesen und gerechnet — wer sie fest verdrahtet, prüft nichts. */
await page.locator('#lf-email').fill('maria@example.invalid');
const aufgabe = (await page.locator('#lf-rechnung-frage, [id*="rechnung"]').first().textContent()) ?? '';
const [, a, b] = /(\d+)\s*\+\s*(\d+)/.exec(aufgabe) ?? [];
pruefe('die Rechenprobe wird gestellt', Boolean(a && b), `gelesen: „${aufgabe.trim()}"`);
if (a && b) await page.locator('#lf-rechenprobe').fill(String(Number(a) + Number(b)));
const zustimmung = page.locator('#lf-form input[type="checkbox"][required]');
if (await zustimmung.count()) await zustimmung.first().check();

/* Die Zeitfalle: Wer schneller als drei Sekunden ausfüllt, gilt als Bot und
   wird still verworfen — ohne Fehlermeldung, damit ein Bot nicht lernt, woran
   er scheiterte. Ein Test, der das nicht abwartet, sieht dasselbe wie der Bot:
   nichts. */
await sleep(3200);
await page.locator('#lf-form button[type="submit"]').click();
await sleep(1500);

/* Beim Fehlschlag zeigen, was das Formular bemängelt — sonst sucht man im
   Dunkeln, welches Pflichtfeld noch offen ist. */
if (gesendet.length === 0) {
  const sichtbareFehler = await page.locator('.lf-error:visible').allTextContents();
  const stand = (await page.locator('#lf-status').textContent())?.trim();
  console.log(`       offen: ${sichtbareFehler.join(' | ') || '(keine Meldung)'} — Status: ${stand || '(leer)'}`);
}

pruefe('die Anfrage erreicht den Endpunkt', gesendet.length === 1,
  `${gesendet.length} statt einer`);
if (gesendet[0]) {
  pruefe('sie trägt die Angaben mit', /maria%40example\.invalid|maria@example\.invalid/.test(gesendet[0]));
  pruefe('sie trägt die Zeitstempel-Signatur mit', gesendet[0].includes('testsignatur'));
}
pruefe('der Erfolg wird angesagt',
  (await page.locator('#lf-status').textContent())?.trim().length > 0);

await browser.close();
server.kill();

/* ── Ergebnis ────────────────────────────────────────────────────────── */

const fehl = ergebnisse.filter((e) => !e.ok);
console.log(`\n${ergebnisse.length - fehl.length}/${ergebnisse.length} bestanden.`);
process.exit(fehl.length > 0 ? 1 : 0);
