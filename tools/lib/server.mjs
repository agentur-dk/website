/**
 * Ein eigener Server für eine einzelne Prüfung, auf einem freien Port. Ein
 * fest vereinbarter Port kann von einem fremden Projekt belegt sein, dessen
 * Antworten dann wie eigene Befunde aussehen.
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
