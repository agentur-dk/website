/**
 * Formular-Endpunkt von dk-dk.de als Cloudflare Worker.
 *
 * Die Website liegt auf GitHub Pages und liefert nur Dateien aus. Dieser
 * Worker ist der Rechner dazwischen: Er hält den MailerSend-Schlüssel,
 * prüft die Anfrage und ruft die MailerSend-API auf.
 *
 * Versendet wird über die API — kein Mailer, kein SMTP. Der Worker
 * existiert allein deshalb, weil der Aufruf
 * `Authorization: Bearer <Token>` braucht: Stünde er im JavaScript der
 * Website, stünde der Token im Quelltext jeder Seite.
 *
 * Zwei Wege:
 *   GET  ?challenge=1   gibt einen signierten Zeitstempel aus
 *   POST                nimmt die Anfrage entgegen
 *
 * Antworten sind wortkarg, und was als maschinell erkannt wird, bekommt
 * einen gespielten Erfolg: Wer erfährt, woran er gescheitert ist, baut es
 * beim nächsten Versuch nach.
 */

import { feld, istEmail, signiere, spamPunkte, zeitInOrdnung } from './pruefungen.js';

/** JSON-Antwort mit den Kopfzeilen für die Domaingrenze. */
function antwort(daten, status, herkunft) {
  const kopf = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  };
  if (herkunft) {
    kopf['Access-Control-Allow-Origin'] = herkunft;
    kopf['Vary'] = 'Origin';
  }
  return new Response(JSON.stringify(daten), { status, headers: kopf });
}

/** Gespielter Erfolg für alles, was als maschinell erkannt wurde. */
const gespielterErfolg = (herkunft) => antwort({ ok: true }, 200, herkunft);

/**
 * Schlüssel für die Zeitstempel-Signatur.
 *
 * Wer ihn eigens setzen will, kann das (`SIGNATUR_GEHEIMNIS`). Sonst wird
 * er aus dem MailerSend-Token abgeleitet. Das ist kein Kompromiss bei der
 * Geheimhaltung — beide lägen ohnehin im selben Secret-Speicher —, spart
 * aber einen Einrichtungsschritt. Das Präfix sorgt dafür, dass der
 * abgeleitete Wert nie zufällig dem Token gleicht.
 */
function signaturSchluessel(env) {
  return env.SIGNATUR_GEHEIMNIS || `zeitstempel:${env.MAILERSEND_TOKEN}`;
}

export default {
  async fetch(anfrage, env) {
    const herkunft = anfrage.headers.get('Origin') ?? '';
    const erlaubt = (env.ERLAUBTE_HERKUNFT ?? '')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);
    const herkunftOk = erlaubt.includes(herkunft);

    // Vorabanfrage des Browsers
    if (anfrage.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...(herkunftOk ? { 'Access-Control-Allow-Origin': herkunft, Vary: 'Origin' } : {}),
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (!herkunftOk) return antwort({ ok: false }, 403, null);

    /* ---- GET: signierten Zeitstempel ausgeben ---- */

    if (anfrage.method === 'GET') {
      const url = new URL(anfrage.url);
      if (!url.searchParams.has('challenge')) return antwort({ ok: false }, 400, herkunft);
      const ts = Math.floor(Date.now() / 1000);
      return antwort({ ts, sig: await signiere(ts, signaturSchluessel(env)) }, 200, herkunft);
    }

    if (anfrage.method !== 'POST') return antwort({ ok: false }, 405, herkunft);

    /* ---- Eingang lesen ---- */

    let d;
    try {
      const roh = await anfrage.text();
      if (roh.length > 20000) return antwort({ ok: false }, 413, herkunft);
      d = JSON.parse(roh);
    } catch {
      return antwort({ ok: false }, 400, herkunft);
    }
    if (typeof d !== 'object' || d === null) return antwort({ ok: false }, 400, herkunft);

    /* ---- Stufe 1: Honigtöpfe ---- */

    for (const topf of ['hp_email', '_gotcha']) {
      if (feld(d, topf) !== '') return gespielterErfolg(herkunft);
    }

    /* ---- Stufe 2: Zeit ---- */

    if (!(await zeitInOrdnung(d, signaturSchluessel(env)))) return gespielterErfolg(herkunft);

    /* ---- Stufe 3: Bedienungsnachweis ---- */

    if (feld(d, 'interaktion') !== '1') return gespielterErfolg(herkunft);

    /* ---- Stufe 4: Rate Limit (nur wenn ein Zähler gebunden ist) ----
     * Optional, damit die Einrichtung ohne Datenbank auskommt: Ist kein
     * KV-Namensraum gebunden, entfällt diese Stufe und die übrigen fünf
     * greifen weiter. Wer sie will, legt den Namensraum an und trägt ihn
     * in die wrangler.toml ein — siehe README.
     *
     * Gespeichert wird nur ein Hash der IP und nur für die Dauer des
     * Zeitfensters; KV räumt den Eintrag danach selbst weg. Berechtigtes
     * Interesse an der Abwehr missbräuchlicher Nutzung, Art. 6 Abs. 1
     * lit. f DSGVO. Hochgezählt wird erst kurz vor dem Versand, sonst
     * verbraucht jeder Tippfehler in der Adresse einen Versuch.
     */
    const grenze = Number(env.LIMIT_PRO_STUNDE ?? 5);
    let zaehlerSchluessel = null;
    let stand = 0;
    if (env.RATE_LIMIT) {
      const ip = anfrage.headers.get('CF-Connecting-IP') ?? '0.0.0.0';
      zaehlerSchluessel = 'ip:' + (await signiere(ip, signaturSchluessel(env))).slice(0, 32);
      stand = Number((await env.RATE_LIMIT.get(zaehlerSchluessel)) ?? '0');
      if (stand >= grenze) return antwort({ ok: false, fehler: 'zu_viele' }, 429, herkunft);
    }

    /* ---- Stufe 5: Inhalt ---- */

    const vorname = feld(d, 'vorname', 80);
    const nachname = feld(d, 'nachname', 80);
    const email = feld(d, 'email', 200);
    const nachricht = feld(d, 'message', 5000);

    if (!vorname || !nachname || !nachricht) {
      return antwort({ ok: false, fehler: 'unvollstaendig' }, 422, herkunft);
    }
    if (!istEmail(email)) return antwort({ ok: false, fehler: 'email' }, 422, herkunft);
    if (spamPunkte(nachricht, `${vorname} ${nachname}`) >= 3) return gespielterErfolg(herkunft);

    /* ---- Zustellung über die MailerSend-API ---- */

    const zeilen = {
      Seite: feld(d, 'page', 120),
      Adresse: feld(d, 'page_url', 400),
      Anliegen: feld(d, 'interesse[]', 400),
      Freitext: feld(d, 'anliegen_text', 1000),
      Firma: feld(d, 'firma', 120),
      Website: feld(d, 'website_url', 300),
    };

    let text = 'Neue Anfrage über das Website-Formular\n\n'
      + 'Name:     ' + `${vorname} ${nachname}\n`
      + 'E-Mail:   ' + `${email}\n`;
    for (const [bezeichnung, wert] of Object.entries(zeilen)) {
      if (wert) text += (bezeichnung + ':').padEnd(10) + wert + '\n';
    }
    text += `\nNachricht:\n${nachricht}\n`;

    if (zaehlerSchluessel) {
      // 3600 s ist die kürzeste Lebensdauer, die KV zulässt — passt genau
      // auf das Zeitfenster des Limits.
      await env.RATE_LIMIT.put(zaehlerSchluessel, String(stand + 1), { expirationTtl: 3600 });
    }

    const versand = await fetch(env.API_URL ?? 'https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.MAILERSEND_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify({
        from: { email: env.VON_ADRESSE, name: env.VON_NAME ?? 'Website-Formular' },
        to: [{ email: env.AN_ADRESSE, name: env.AN_NAME ?? 'agentur dk' }],
        reply_to: { email, name: `${vorname} ${nachname}` },
        subject: 'Anfrage über dk-dk.de' + (zeilen.Seite ? ' — ' + zeilen.Seite : ''),
        text,
      }),
    });

    if (!versand.ok) {
      console.log('MailerSend', versand.status, await versand.text());
      return antwort({ ok: false, fehler: 'versand' }, 502, herkunft);
    }

    return antwort({ ok: true }, 200, herkunft);
  },
};
