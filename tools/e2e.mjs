#!/usr/bin/env node
/**
 * Prüft die Strecke, auf der aus einem Besucher eine Anfrage wird: das
 * Formular ausfüllen und absenden, mit und ohne JavaScript.
 *
 *   npm run build && npm run check:e2e
 *
 * Kein Aufruf verlässt den Rechner: Zeitstempel-Signatur und Absenden werden
 * abgefangen, sonst entstünden auf vorschau.dk-dk.de echte Nachrichten und
 * Zählstände. Geprüft wird die Anfrage, nicht die Antwort.
 *
 * Mit reduzierter Bewegung, weil der Testläufer sonst mitten im Scrollen
 * misst. Ohne Playwright wird übersprungen statt fehlzuschlagen.
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

const ergebnisse = [];
const pruefe = (name, bedingung, hinweis = '') => {
  ergebnisse.push({ name, ok: Boolean(bedingung), hinweis });
  console.log(`  ${bedingung ? 'OK  ' : 'FEHL'} ${name}${bedingung || !hinweis ? '' : ` — ${hinweis}`}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: 'reduce' });

/*
 * Die Einwilligung mitbringen: Der Dialog mit `disablePageInteraction` würde
 * jeden Klick abfangen. Ändert CookieConsent den Aufbau des Cookies,
 * erscheint der Dialog wieder und die Prüfung fällt auf, statt still etwas
 * anderes zu messen.
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

await page.locator('.lf-topic__input').first().check();
await page.locator('[data-next="2"]').click();
pruefe('mit Thema geht es zu Schritt 2', await page.locator('#lf-step-2').isVisible());

await page.locator('#lf-message').fill('Testnachricht aus der E2E-Pruefung.');
await page.locator('[data-next="3"]').click();
pruefe('Schritt 3 erscheint', await page.locator('#lf-step-3').isVisible());

const topf = page.locator('input[name="hp_email"]');
pruefe('Honigtopf vorhanden', await topf.count() === 1);
pruefe('Honigtopf für Menschen unsichtbar', !(await topf.isVisible()));

await page.locator('#lf-vorname').fill('Maria');
await page.locator('#lf-nachname').fill('Testerin');
await page.locator('#lf-email').fill('keine-adresse');
await page.locator('#lf-form button[type="submit"]').click();
await sleep(300);
pruefe('unbrauchbare E-Mail wird nicht abgeschickt', gesendet.length === 0,
  `es gingen ${gesendet.length} Anfragen hinaus`);

/* Die Rechenprobe wird gelesen und gerechnet, nicht fest verdrahtet —
   sonst prüft der Test nichts. */
await page.locator('#lf-email').fill('maria@example.invalid');
const aufgabe = (await page.locator('#lf-rechnung-frage, [id*="rechnung"]').first().textContent()) ?? '';
const [, a, b] = /(\d+)\s*\+\s*(\d+)/.exec(aufgabe) ?? [];
pruefe('die Rechenprobe wird gestellt', Boolean(a && b), `gelesen: „${aufgabe.trim()}"`);
if (a && b) await page.locator('#lf-rechenprobe').fill(String(Number(a) + Number(b)));
const zustimmung = page.locator('#lf-form input[type="checkbox"][required]');
if (await zustimmung.count()) await zustimmung.first().check();

/* Unter drei Sekunden gilt eine Anfrage als Bot und wird still verworfen;
   ein Test, der das nicht abwartet, sieht nichts. */
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

{
  const ohne = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  const seite = await ohne.newPage();

  const gesendetOhneJs = [];
  await seite.route('**/formular/send.php**', async (route) => {
    gesendetOhneJs.push(route.request().postData() ?? '');
    await route.fulfill({ status: 303, headers: { location: `${ORIGIN}/danke.html` }, body: '' });
  });

  await seite.goto(`${ORIGIN}/`, { waitUntil: 'domcontentloaded' });

  pruefe('ohne JavaScript: alle drei Schritte stehen da',
    await seite.locator('#lf-step-1').isVisible()
    && await seite.locator('#lf-step-2').isVisible()
    && await seite.locator('#lf-step-3').isVisible());

  pruefe('ohne JavaScript: keine Schrittzähler',
    !(await seite.locator('[data-step-count]').first().isVisible()));

  pruefe('ohne JavaScript: keine Weiter-Knöpfe, die nichts tun',
    !(await seite.locator('[data-next="2"]').isVisible()));

  pruefe('ohne JavaScript: das Formular kennt sein Ziel',
    (await seite.locator('#lf-form').getAttribute('action'))?.includes('send.php')
    && (await seite.locator('#lf-form').getAttribute('method'))?.toLowerCase() === 'post');

  pruefe('ohne JavaScript prüft der Browser die Pflichtfelder',
    (await seite.locator('#lf-form').getAttribute('novalidate')) === null,
    'novalidate steht schon im Markup — dann prüft ohne Skript niemand');

  await seite.locator('.lf-topic__input').first().check();
  await seite.locator('#lf-message').fill('Testnachricht ohne JavaScript.');
  await seite.locator('#lf-vorname').fill('Maria');
  await seite.locator('#lf-nachname').fill('Testerin');
  await seite.locator('#lf-email').fill('maria@example.invalid');
  const haken = seite.locator('#lf-form input[type="checkbox"][required]');
  if (await haken.count()) await haken.first().check();
  await seite.locator('#lf-form button[type="submit"]').click();
  await seite.waitForURL('**/danke.html', { timeout: 5000 }).catch(() => {});

  pruefe('ohne JavaScript geht die Anfrage hinaus', gesendetOhneJs.length === 1,
    `${gesendetOhneJs.length} statt einer`);
  pruefe('und der Besucher landet auf der Dankeseite',
    seite.url().endsWith('/danke.html'), `steht auf ${seite.url()}`);
  if (gesendetOhneJs[0]) {
    pruefe('sie nennt dem Endpunkt das Weiterleitungsziel',
      gesendetOhneJs[0].includes('weiter=') && gesendetOhneJs[0].includes('danke.html'));
  }

  await ohne.close();
}

await browser.close();
server.kill();

const fehl = ergebnisse.filter((e) => !e.ok);
console.log(`\n${ergebnisse.length - fehl.length}/${ergebnisse.length} bestanden.`);
process.exit(fehl.length > 0 ? 1 : 0);
