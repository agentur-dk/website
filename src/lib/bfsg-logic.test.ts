import { describe, it, expect } from 'vitest';
import { getResult, getFootnotes, getFootnote, FOOTNOTES, DISCLAIMER, QUESTIONS } from './bfsg-logic';

describe('getResult – Pfad 1: nicht betroffen', () => {
  it('q1=nein → nicht_betroffen', () => {
    const r = getResult({ q1: 'nein', q2: null, q3: null, q4: null });
    expect(r.path).toBe('nicht_betroffen');
    expect(r.title).toBe('Voraussichtlich nicht betroffen');
    expect(r.text).toContain('BFSG');
  });

  it('q1=nein ignoriert alle anderen Antworten', () => {
    const r = getResult({ q1: 'nein', q2: 'ja', q3: 'ja', q4: 'ja' });
    expect(r.path).toBe('nicht_betroffen');
  });
});

describe('getResult – Pfad 2: Kleinstunternehmen', () => {
  it('q1=ja, q2=nein, q3=nein → kleinstunternehmen', () => {
    const r = getResult({ q1: 'ja', q2: 'nein', q3: 'nein', q4: null });
    expect(r.path).toBe('kleinstunternehmen');
    expect(r.title).toBe('Kleinstunternehmen-Regelung');
    expect(r.text).toContain('10 MA');
  });

  it('kleinstunternehmen unabhängig von q4', () => {
    const r = getResult({ q1: 'ja', q2: 'nein', q3: 'nein', q4: 'ja' });
    expect(r.path).toBe('kleinstunternehmen');
  });
});

describe('getResult – Pfad 3: betroffen', () => {
  it('q1=ja, q2=ja → betroffen', () => {
    const r = getResult({ q1: 'ja', q2: 'ja', q3: null, q4: null });
    expect(r.path).toBe('betroffen');
    expect(r.title).toBe('Wahrscheinlich betroffen');
    expect(r.text).toContain('28. Juni 2025');
  });

  it('q1=ja, q2=nein, q3=ja → betroffen', () => {
    const r = getResult({ q1: 'ja', q2: 'nein', q3: 'ja', q4: null });
    expect(r.path).toBe('betroffen');
  });

  it('alle ja → betroffen', () => {
    const r = getResult({ q1: 'ja', q2: 'ja', q3: 'ja', q4: 'ja' });
    expect(r.path).toBe('betroffen');
  });
});

describe('Fußnoten', () => {
  it('getFootnotes gibt 15 Einträge zurück', () => {
    expect(getFootnotes()).toHaveLength(15);
  });

  it('alle Fußnoten sind nicht leer', () => {
    getFootnotes().forEach((fn, i) => {
      expect(fn.length, `Fußnote ${i + 1}`).toBeGreaterThan(0);
    });
  });

  it('getFootnote(1) gibt die erste Fußnote zurück', () => {
    expect(getFootnote(1)).toBe(FOOTNOTES[0]);
  });

  it('getFootnote(15) gibt die letzte Fußnote zurück', () => {
    expect(getFootnote(15)).toBe(FOOTNOTES[14]);
  });

  it('getFootnote(0) gibt leeren String zurück', () => {
    expect(getFootnote(0)).toBe('');
  });

  it('getFootnote(16) gibt leeren String zurück', () => {
    expect(getFootnote(16)).toBe('');
  });
});

describe('QUESTIONS & DISCLAIMER', () => {
  it('hat 4 Fragen', () => {
    expect(QUESTIONS).toHaveLength(4);
  });

  it('Frage 1 hat footnoteIndex 1', () => {
    expect(QUESTIONS[0]?.footnoteIndex).toBe(1);
  });

  it('DISCLAIMER ist nicht leer', () => {
    expect(DISCLAIMER.length).toBeGreaterThan(10);
  });
});
