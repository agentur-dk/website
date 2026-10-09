/**
 * Änderungsdatum einer Seite aus der Git-Historie. Ein bei jedem Build neu
 * gesetztes `lastmod` ignoriert Google; nur ein stimmendes ist ein Signal.
 * Ohne Git-Kontext (etwa beim Tarball-Deploy) fällt es auf heute zurück.
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
