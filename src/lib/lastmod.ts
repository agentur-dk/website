/**
 * Letztes Änderungsdatum einer Seite — aus der Git-Historie.
 *
 * `lastmod` in der Sitemap ist für Google nur dann ein Signal, wenn es
 * stimmt; ein bei jedem Build neu gesetztes Datum wird ignoriert. Deshalb
 * fragen wir den letzten Commit ab, der die Datei berührt hat.
 *
 * Läuft ausschließlich zur Build-Zeit (Node). Fällt auf das heutige Datum
 * zurück, wenn kein Git-Kontext vorhanden ist (z. B. Tarball-Deploy).
 */
import { execFileSync } from 'node:child_process';

const cache = new Map<string, string>();

export function lastModified(relPath: string): string {
  const hit = cache.get(relPath);
  if (hit) return hit;

  let iso: string;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', relPath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    iso = /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : new Date().toISOString().slice(0, 10);
  } catch {
    iso = new Date().toISOString().slice(0, 10);
  }

  cache.set(relPath, iso);
  return iso;
}

/** Änderungsdatum für einen Seiten-Slug ('' → index). */
export const pageLastModified = (slug: string): string =>
  lastModified(`src/pages/${slug === '' ? 'index' : slug}.astro`);
