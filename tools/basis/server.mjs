// ABGELEITETE DATEI — nicht hier bearbeiten.
// Quelle: Code/dk-basis/pruefen/server.mjs
// Nachziehen mit: bash ../dk-basis/verteilen.sh
//
// Kopiert statt als Paket eingebunden, damit ein Klon aus sich heraus baut.

/**
 * Statischer Server für die Prüfungen, auf einem freien Port: Ein fest
 * vereinbarter Port kann von einem fremden Projekt belegt sein, dessen
 * Antworten dann wie eigene Befunde aussehen.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const TYPEN = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

export function datei(wurzel, pfad) {
  const sauber = normalize(pfad).replace(/^(\.\.[/\\])+/, '');
  for (const kandidat of [sauber, `${sauber}.html`, join(sauber, 'index.html')]) {
    const voll = join(wurzel, kandidat);
    if (existsSync(voll) && statSync(voll).isFile()) return voll;
  }
  return null;
}

/** Wie ein Besucher die Adresse aufruft — Projekte mit Basispfad (base: '/projekt/') liefern dist/ trotzdem an der Wurzel aus. */
export function findeDatei(wurzel, pfad) {
  return datei(wurzel, pfad) ?? datei(wurzel, pfad.replace(/^\/[^/]+(?=\/)/, ''));
}

export async function starteServer(wurzel) {
  const server = createServer((req, res) => {
    const pfad = decodeURIComponent((req.url ?? '/').split('?')[0].split('#')[0]);
    const treffer = findeDatei(wurzel, pfad);
    if (!treffer) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('nicht gefunden'); }
    res.writeHead(200, { 'content-type': TYPEN[extname(treffer)] ?? 'application/octet-stream' });
    createReadStream(treffer).pipe(res);
  });
  await new Promise((fertig) => server.listen(0, '127.0.0.1', fertig));
  return { server, port: server.address().port };
}
