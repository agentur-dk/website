import { describe, it, expect } from 'vitest';
import { BAYER4, BAYER8, FIELDS, STATIC_FIELDS, valueNoise, type FieldName } from './dither';

const NAMEN = Object.keys(FIELDS) as FieldName[];

describe('Bayer-Matrizen', () => {
  it('BAYER4 ist 4×4, BAYER8 ist 8×8', () => {
    expect(BAYER4).toHaveLength(4);
    expect(BAYER4[0]).toHaveLength(4);
    expect(BAYER8).toHaveLength(8);
    expect(BAYER8[0]).toHaveLength(8);
  });

  it('alle Schwellen liegen echt zwischen 0 und 1', () => {
    // Bei 0 oder 1 wäre eine Zelle immer bzw. nie gesetzt — das Raster
    // verlöre genau die Stufe, für die es da ist.
    for (const matrix of [BAYER4, BAYER8]) {
      for (const zeile of matrix) {
        for (const wert of zeile) {
          expect(wert).toBeGreaterThan(0);
          expect(wert).toBeLessThan(1);
        }
      }
    }
  });

  it('jede Schwelle kommt genau einmal vor', () => {
    for (const matrix of [BAYER4, BAYER8]) {
      const werte = matrix.flat();
      expect(new Set(werte).size).toBe(werte.length);
    }
  });
});

describe('valueNoise', () => {
  it('bleibt im Bereich 0…1', () => {
    for (let i = 0; i < 500; i++) {
      const v = valueNoise(i * 0.37, i * 0.11, 7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('ist deterministisch — gleicher Eingang, gleiches Bild', () => {
    // Wichtig für reproduzierbare Builds und für das Standbild bei
    // prefers-reduced-motion: kein Math.random im Spiel.
    expect(valueNoise(3.25, 8.5, 19)).toBe(valueNoise(3.25, 8.5, 19));
  });

  it('trennt Seeds', () => {
    expect(valueNoise(3.25, 8.5, 1)).not.toBe(valueNoise(3.25, 8.5, 2));
  });

  it('ist stetig — kleine Schritte, kleine Sprünge', () => {
    let max = 0;
    for (let i = 0; i < 200; i++) {
      const x = i * 0.02;
      max = Math.max(max, Math.abs(valueNoise(x + 0.02, 4, 3) - valueNoise(x, 4, 3)));
    }
    expect(max).toBeLessThan(0.2);
  });
});

describe('Felder', () => {
  it('liefern für jede Rasterstelle eine endliche Zahl', () => {
    for (const name of NAMEN) {
      const feld = FIELDS[name];
      for (const t of [0, 1600, 45000]) {
        for (let y = 0; y < 24; y++) {
          for (let x = 0; x < 64; x++) {
            const v = feld(x, y, 64, 24, t);
            expect(Number.isFinite(v), `${name} bei (${x},${y},t=${t})`).toBe(true);
          }
        }
      }
    }
  });

  it('nutzen die Fläche wirklich aus — nicht alles gleich hell', () => {
    for (const name of NAMEN) {
      const feld = FIELDS[name];
      const werte: number[] = [];
      for (let y = 0; y < 24; y++) {
        for (let x = 0; x < 64; x++) werte.push(Math.min(1, Math.max(0, feld(x, y, 64, 24, 1600))));
      }
      const spanne = Math.max(...werte) - Math.min(...werte);
      expect(spanne, `${name} ist eine gleichmäßige Fläche`).toBeGreaterThan(0.25);
    }
  });

  it('überstehen eine 1×1-Fläche ohne NaN', () => {
    // Beim ersten Frame und bei zusammengeklappten Containern kommt genau das vor.
    for (const name of NAMEN) {
      expect(Number.isFinite(FIELDS[name](0, 0, 1, 1, 0)), name).toBe(true);
    }
  });
});

describe('STATIC_FIELDS', () => {
  it('nennt genau die Felder, die sich über die Zeit nicht ändern', () => {
    for (const name of NAMEN) {
      const feld = FIELDS[name];
      let bewegt = false;
      for (let y = 0; y < 16 && !bewegt; y++) {
        for (let x = 0; x < 32; x++) {
          if (Math.abs(feld(x, y, 32, 16, 0) - feld(x, y, 32, 16, 9000)) > 1e-9) {
            bewegt = true;
            break;
          }
        }
      }
      expect(bewegt, `${name} bewegt sich`).toBe(!STATIC_FIELDS.includes(name));
    }
  });
});
