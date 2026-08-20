import { describe, it, expect } from 'vitest';
import { parseConsent, serializeConsent, mayLoadGA, defaultSettings, STORAGE_KEY } from './consent';

describe('STORAGE_KEY', () => {
  it('hat erwarteten Wert', () => {
    expect(STORAGE_KEY).toBe('dk_consent_v1');
  });
});

describe('parseConsent', () => {
  it('null → null', () => {
    expect(parseConsent(null)).toBeNull();
  });

  it('leerer String → null', () => {
    expect(parseConsent('')).toBeNull();
  });

  it('ungültiges JSON → null', () => {
    expect(parseConsent('{ungültig')).toBeNull();
  });

  it('JSON ohne necessary → null', () => {
    expect(parseConsent('{"statistics":true}')).toBeNull();
  });

  it('JSON ohne statistics → null', () => {
    expect(parseConsent('{"necessary":true}')).toBeNull();
  });

  it('valides Consent-Objekt (statistics=true)', () => {
    const result = parseConsent('{"necessary":true,"statistics":true}');
    expect(result).toEqual({ necessary: true, statistics: true });
  });

  it('valides Consent-Objekt (statistics=false)', () => {
    const result = parseConsent('{"necessary":true,"statistics":false}');
    expect(result?.statistics).toBe(false);
  });

  it('behält timestamp wenn vorhanden', () => {
    const result = parseConsent('{"necessary":true,"statistics":false,"timestamp":"2026-01-01T00:00:00.000Z"}');
    expect(result?.timestamp).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('serializeConsent', () => {
  it('serialisiert zu validem JSON', () => {
    const json = serializeConsent({ necessary: true, statistics: true });
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(parsed['necessary']).toBe(true);
    expect(parsed['statistics']).toBe(true);
    expect(typeof parsed['timestamp']).toBe('string');
  });

  it('fügt timestamp hinzu', () => {
    const before = Date.now();
    const json = serializeConsent({ necessary: true, statistics: false });
    const after = Date.now();
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const ts = new Date(parsed['timestamp'] as string).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

describe('mayLoadGA', () => {
  it('null → false', () => {
    expect(mayLoadGA(null)).toBe(false);
  });

  it('statistics=false → false', () => {
    expect(mayLoadGA({ necessary: true, statistics: false })).toBe(false);
  });

  it('statistics=true → true', () => {
    expect(mayLoadGA({ necessary: true, statistics: true })).toBe(true);
  });
});

describe('defaultSettings', () => {
  it('statistics=true → alles akzeptiert', () => {
    const s = defaultSettings(true);
    expect(s.necessary).toBe(true);
    expect(s.statistics).toBe(true);
  });

  it('statistics=false → nur notwendige', () => {
    const s = defaultSettings(false);
    expect(s.necessary).toBe(true);
    expect(s.statistics).toBe(false);
  });
});
