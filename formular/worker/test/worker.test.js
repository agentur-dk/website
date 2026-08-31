/**
 * Prüft den Worker ohne Cloudflare: Der Einstieg ist eine gewöhnliche
 * fetch-Funktion, Request und Response gibt es in Node seit 18.
 *
 *   node --test formular/worker/test/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';
import { signiere } from '../src/pruefungen.js';

const HERKUNFT = 'https://dk-dk.de';
const GEHEIMNIS = 'testgeheimnis';

/** Sammelt die Aufrufe an die vorgetäuschte MailerSend-API. */
function umgebung() {
  const gesendet = [];
  const speicher = new Map();
  return {
    gesendet,
    env: {
      ERLAUBTE_HERKUNFT: HERKUNFT,
      SIGNATUR_GEHEIMNIS: GEHEIMNIS,
      MAILERSEND_TOKEN: 'test-token',
      VON_ADRESSE: 'formular@test.example',
      AN_ADRESSE: 'ziel@dk-dk.de',
      LIMIT_PRO_STUNDE: '5',
      API_URL: 'https://api.test.invalid/email',
      RATE_LIMIT: {
        get: async (k) => speicher.get(k) ?? null,
        put: async (k, v) => void speicher.set(k, v),
      },
      _gesendet: gesendet,
    },
  };
}

/** fetch abfangen, damit kein echter Aufruf hinausgeht. */
function fetchAbfangen(gesendet, status = 202) {
  const echt = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    gesendet.push({ url: String(url), body: JSON.parse(init.body) });
    return new Response('{}', { status });
  };
  return () => { globalThis.fetch = echt; };
}

async function anfrage(env, koerper, kopf = {}) {
  return worker.fetch(new Request('https://w.example/', {
    method: 'POST',
    headers: { Origin: HERKUNFT, 'Content-Type': 'application/json', ...kopf },
    body: JSON.stringify(koerper),
  }), env);
}

async function gueltig(extra = {}) {
  const ts = Math.floor(Date.now() / 1000) - 10;
  return {
    vorname: 'Maria', nachname: 'Musterfrau', email: 'maria@beispiel.de',
    message: 'Wir planen einen Relaunch und brauchen Unterstützung.',
    interaktion: '1', ts_server: String(ts), ts_sig: await signiere(ts, GEHEIMNIS),
    ...extra,
  };
}

test('fremde Herkunft wird abgewiesen', async () => {
  const { env } = umgebung();
  const r = await worker.fetch(new Request('https://w.example/?challenge=1', {
    headers: { Origin: 'https://boese.example' },
  }), env);
  assert.equal(r.status, 403);
});

test('Vorabanfrage wird beantwortet', async () => {
  const { env } = umgebung();
  const r = await worker.fetch(new Request('https://w.example/', {
    method: 'OPTIONS', headers: { Origin: HERKUNFT },
  }), env);
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), HERKUNFT);
});

test('Zeitstempel wird signiert ausgegeben', async () => {
  const { env } = umgebung();
  const r = await worker.fetch(new Request('https://w.example/?challenge=1', {
    headers: { Origin: HERKUNFT },
  }), env);
  const { ts, sig } = await r.json();
  assert.equal(sig, await signiere(ts, GEHEIMNIS));
});

test('gültige Anfrage geht raus', async () => {
  const { env, gesendet } = umgebung();
  const zurueck = fetchAbfangen(gesendet);
  const r = await anfrage(env, await gueltig());
  zurueck();
  assert.equal(r.status, 200);
  assert.equal(gesendet.length, 1);
  assert.equal(gesendet[0].body.reply_to.email, 'maria@beispiel.de');
  assert.match(gesendet[0].body.text, /Maria Musterfrau/);
});

for (const [name, abweichung] of [
  ['Honigtopf hp_email',   { hp_email: 'bot@spam.example' }],
  ['Honigtopf _gotcha',    { _gotcha: 'x' }],
  ['ohne Bedienung',       { interaktion: '0' }],
  ['gefälschte Signatur',  { ts_sig: 'a'.repeat(64) }],
  ['ohne Zeitfelder',      { ts_server: '', ts_sig: '', form_started: '' }],
  ['Nachricht voller Links', { message: 'http://a.example http://b.example http://c.example [url=x]' }],
]) {
  test(`${name} wird verworfen, ohne zu senden`, async () => {
    const { env, gesendet } = umgebung();
    const zurueck = fetchAbfangen(gesendet);
    const r = await anfrage(env, await gueltig(abweichung));
    zurueck();
    assert.equal(r.status, 200, 'gespielter Erfolg');
    assert.equal(gesendet.length, 0, 'keine Mail');
  });
}

test('ungültige Adresse meldet 422 und verbraucht keinen Versuch', async () => {
  const { env, gesendet } = umgebung();
  const zurueck = fetchAbfangen(gesendet);
  for (let i = 0; i < 8; i++) {
    const r = await anfrage(env, await gueltig({ email: 'keine-adresse' }));
    assert.equal(r.status, 422);
  }
  const r = await anfrage(env, await gueltig());
  zurueck();
  assert.equal(r.status, 200);
  assert.equal(gesendet.length, 1, 'nach acht Tippfehlern geht die Anfrage noch durch');
});

test('Rate Limit greift ab dem sechsten Versand', async () => {
  const { env, gesendet } = umgebung();
  const zurueck = fetchAbfangen(gesendet);
  const codes = [];
  for (let i = 0; i < 6; i++) codes.push((await anfrage(env, await gueltig())).status);
  zurueck();
  assert.deepEqual(codes, [200, 200, 200, 200, 200, 429]);
  assert.equal(gesendet.length, 5);
});

test('läuft ohne eigenes Signatur-Geheimnis', async () => {
  // Der Schlüssel wird dann aus dem Token abgeleitet. Der Zeitstempel vom
  // GET-Weg muss trotzdem zum POST passen — sonst wäre die Ableitung
  // zwischen den beiden Aufrufen nicht stabil.
  const { env, gesendet } = umgebung();
  delete env.SIGNATUR_GEHEIMNIS;

  const g = await worker.fetch(new Request('https://w.example/?challenge=1', {
    headers: { Origin: HERKUNFT },
  }), env);
  const { ts, sig } = await g.json();

  const zurueck = fetchAbfangen(gesendet);
  const r = await worker.fetch(new Request('https://w.example/', {
    method: 'POST',
    headers: { Origin: HERKUNFT, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vorname: 'Maria', nachname: 'Musterfrau', email: 'maria@beispiel.de',
      message: 'Ohne eigenes Signatur-Geheimnis.', interaktion: '1',
      ts_server: String(ts - 10), ts_sig: sig,
    }),
  }), env);
  zurueck();
  // Der Zeitstempel wurde manipuliert (−10 s), die Signatur passt nicht mehr.
  assert.equal(gesendet.length, 0, 'manipulierter Zeitstempel wird erkannt');
  assert.equal(r.status, 200);
});

test('läuft ohne gebundenen Zähler', async () => {
  // Ohne KV entfällt das Rate Limit; die übrigen Stufen greifen weiter.
  const { env, gesendet } = umgebung();
  delete env.RATE_LIMIT;
  const zurueck = fetchAbfangen(gesendet);
  const gut = await anfrage(env, await gueltig());
  const bot = await anfrage(env, await gueltig({ hp_email: 'bot@spam.example' }));
  zurueck();
  assert.equal(gut.status, 200);
  assert.equal(bot.status, 200);
  assert.equal(gesendet.length, 1, 'nur die echte Anfrage geht raus');
});
