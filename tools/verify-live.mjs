#!/usr/bin/env node
/**
 * tools/verify-live.mjs — startet den gzip-Server und fährt die drei
 * Prüfungen, die einen laufenden Server brauchen: axe-core, die manuellen
 * WCAG-Kriterien und Lighthouse.
 *
 * Eigener Port, damit ein parallel laufender Dev-Server nicht kollidiert.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = Number(process.env.VERIFY_PORT ?? 4399);
const ORIGIN = `http://localhost:${PORT}`;

const server = spawn('node', ['tools/serve.mjs', String(PORT)], { stdio: 'ignore' });
const shutdown = () => { try { server.kill(); } catch { /* schon beendet */ } };
process.on('exit', shutdown);
process.on('SIGINT', () => { shutdown(); process.exit(130); });

// Warten, bis der Server antwortet, statt blind zu schlafen.
for (let i = 0; i < 50; i++) {
  try { if ((await fetch(ORIGIN + '/')).ok) break; } catch { /* noch nicht bereit */ }
  await sleep(100);
}

const run = (script) => new Promise((resolve) => {
  const p = spawn('node', [script], {
    stdio: 'inherit',
    env: { ...process.env, LH_ORIGIN: ORIGIN, LH_BASE: '/' },
  });
  p.on('close', resolve);
});

let failed = 0;
for (const script of ['tools/a11y.mjs', 'tools/wcag-manual.mjs', 'tools/lighthouse.mjs']) {
  console.log(`\n── ${script}`);
  if (await run(script)) failed++;
}

shutdown();
process.exit(failed ? 1 : 0);
