/**
 * tools/lib/server.mjs — ein eigener Server für eine einzelne Prüfung.
 *
 * Die älteren Prüfungen (a11y, lighthouse) erwarten einen Server auf
 * Port 4321, den jemand vorher gestartet hat. Das hat am 24.09.2026
 * zweiunddreißig falsche Nullen erzeugt: Auf 4321 lief ein Server eines
 * ganz anderen Projekts, seit sechzehn Tagen, und beantwortete die
 * meisten Seiten mit 404. Lighthouse meldete daraufhin Wertungen von
 * 0 — was wie ein Einbruch der Seite aussieht und keiner war.
 *
 * Wer selbst einen Port zieht, kann das nicht passieren. Port 0 heißt
 * „irgendeiner, der frei ist"; das Betriebssystem sucht ihn aus.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.webp': 'image/webp',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.mp3':  'audio/mpeg',
  '.woff2': 'font/woff2',
};

/**
 * Startet einen statischen Server über `wurzel` auf einem freien Port.
 * Gibt den Server (zum Schließen) und den Port zurück.
 */
export async function starteServer(wurzel) {
  const server = createServer((req, res) => {
    let pfad = decodeURIComponent((req.url ?? '/').split('?')[0]);
    if (pfad.endsWith('/')) pfad += 'index.html';

    // Kein Ausbruch aus der Wurzel, auch nicht über ../
    const datei = join(wurzel, normalize(pfad).replace(/^(\.\.[/\\])+/, ''));
    if (!existsSync(datei) || statSync(datei).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      return res.end('nicht gefunden');
    }
    res.writeHead(200, { 'content-type': TYPEN[extname(datei)] ?? 'application/octet-stream' });
    createReadStream(datei).pipe(res);
  });

  await new Promise((fertig) => server.listen(0, fertig));
  return { server, port: server.address().port };
}
