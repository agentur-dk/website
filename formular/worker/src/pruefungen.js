/**
 * Die Prüfungen des Formular-Endpunkts.
 *
 * Bewusst getrennt vom Worker-Einstieg und ohne Cloudflare-Abhängigkeiten:
 * So lassen sie sich unter Node testen, ohne dass eine Laufzeitumgebung
 * hochgefahren werden muss. Der Worker ruft sie nur der Reihe nach auf.
 */

/** Wie lange ein signierter Zeitstempel gilt (Sekunden). */
export const MIN_ALTER = 3;
export const MAX_ALTER = 7200;

const enc = new TextEncoder();

/** Hex-Darstellung eines Puffers. */
function hex(puffer) {
  return [...new Uint8Array(puffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** HMAC-SHA-256 über einen Text. */
export async function signiere(text, geheimnis) {
  const schluessel = await crypto.subtle.importKey(
    'raw', enc.encode(geheimnis), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return hex(await crypto.subtle.sign('HMAC', schluessel, enc.encode(String(text))));
}

/**
 * Vergleich in gleichbleibender Zeit.
 *
 * Ein `===` bricht beim ersten abweichenden Zeichen ab. Wer die Antwortzeit
 * misst, könnte eine Signatur damit Zeichen für Zeichen erraten. Das ist bei
 * einem Kontaktformular unwahrscheinlich, kostet aber nichts.
 */
export function gleich(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let abweichung = 0;
  for (let i = 0; i < a.length; i++) abweichung |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return abweichung === 0;
}

/** Feld als getrimmter Text, höchstens `max` Zeichen. */
export function feld(daten, name, max = 500) {
  const wert = daten?.[name];
  if (typeof wert !== 'string' && typeof wert !== 'number') return '';
  return String(wert).trim().slice(0, max);
}

/** Grobe Plausibilität einer E-Mail-Adresse. */
export function istEmail(wert) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert);
}

/**
 * Punkte für Spam-Merkmale. Ein Merkmal allein ist noch kein Beweis,
 * drei zusammen schon.
 */
export function spamPunkte(nachricht, name) {
  let punkte = 0;
  const links = (nachricht.match(/https?:\/\//gi) ?? []).length;
  punkte += Math.max(0, links - 2);
  if (/[Ѐ-ӿ一-鿿]/.test(nachricht)) punkte += 2;
  if (/\[url[=\]]|\[link/i.test(nachricht)) punkte += 2;
  if (nachricht.toLowerCase() === name.toLowerCase()) punkte += 2;
  return punkte;
}

/**
 * Prüft die Zeitangaben.
 *
 * Zurück kommt `true`, wenn die Anfrage weiterlaufen darf.
 *
 * Fehlen beide Zeitfelder, ist das kein Browser: Ein echter setzt
 * `form_started` beim Laden. Diese Bedingung fehlte in der ersten Fassung
 * des PHP-Endpunkts, und ein Skript, das stumpf POSTete, kam ungebremst
 * durch — deshalb steht sie hier an erster Stelle.
 */
export async function zeitInOrdnung(daten, geheimnis, jetztMs = Date.now()) {
  const ts = Number(feld(daten, 'ts_server'));
  const sig = feld(daten, 'ts_sig', 200);

  if (ts > 0 && sig !== '') {
    if (!gleich(await signiere(ts, geheimnis), sig)) return false;
    const alter = Math.floor(jetztMs / 1000) - ts;
    return alter >= MIN_ALTER && alter <= MAX_ALTER;
  }

  const start = Number(feld(daten, 'form_started'));
  if (!(start > 0)) return false;
  return jetztMs - start >= MIN_ALTER * 1000;
}
