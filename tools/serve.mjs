#!/usr/bin/env node
/**
 * tools/serve.mjs — statischer Server für dist/, der GitHub Pages nachbildet.
 *
 * `astro preview` liefert unkomprimiert aus. Lighthouse misst dann eine
 * FCP, die es in Produktion nie gibt: GitHub Pages sendet gzip, wodurch
 * die eingebettete CSS von 128 kB auf rund 27 kB schrumpft. Für belastbare
 * Zahlen muss lokal genauso ausgeliefert werden.
 *
 *   node tools/serve.mjs [port]
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createGzip } from 'node:zlib';

const ROOT = 'dist';
const PORT = Number(process.argv[2] ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.woff2':'font/woff2',
};
// Bereits komprimierte Formate erneut zu packen kostet nur CPU.
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg']);

createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = join(ROOT, normalize(url).replace(/^(\.\.[/\\])+/, ''));
  if (url.endsWith('/')) file = join(file, 'index.html');

  if (!existsSync(file) || !statSync(file).isFile()) {
    const notFound = join(ROOT, '404.html');
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    return existsSync(notFound) ? createReadStream(notFound).pipe(res) : res.end('404');
  }

  const ext = extname(file);
  const headers = {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    // Wie GitHub Pages: Assets mit Hash lange, HTML kurz cachen.
    'Cache-Control': ext === '.html' ? 'max-age=600' : 'max-age=31536000',
  };

  const wantsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
  if (wantsGzip && COMPRESSIBLE.has(ext)) {
    res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' });
    createReadStream(file).pipe(createGzip({ level: 9 })).pipe(res);
  } else {
    res.writeHead(200, headers);
    createReadStream(file).pipe(res);
  }
}).listen(PORT, () => console.log(`dist/ auf http://localhost:${PORT} (gzip aktiv)`));
