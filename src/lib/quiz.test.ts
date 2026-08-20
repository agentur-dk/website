import { describe, it, expect } from 'vitest';
import { getService, getStep2Config, hasStep2, STEP1_OPTIONS, SERVICES, STEP2_CONFIG } from './quiz';

describe('STEP1_OPTIONS', () => {
  it('hat 5 Optionen', () => {
    expect(STEP1_OPTIONS).toHaveLength(5);
  });

  it('alle Optionen haben key und label', () => {
    STEP1_OPTIONS.forEach((opt) => {
      expect(opt.key.length).toBeGreaterThan(0);
      expect(opt.label.length).toBeGreaterThan(0);
    });
  });
});

describe('getService', () => {
  it('gibt korrekten Service für mehr_umsatz zurück', () => {
    const s = getService('mehr_umsatz');
    expect(s?.title).toBe('Online-Marketing');
    expect(s?.formValue).toBe('Online-Marketing');
  });

  it('gibt korrekten Service für bfsg zurück', () => {
    const s = getService('bfsg');
    expect(s?.title).toBe('BFSG & Barrierefreiheit');
  });

  it('gibt null für unbekannten Key zurück', () => {
    expect(getService('unbekannt')).toBeNull();
  });

  it('alle SERVICES haben href ohne führenden Slash (relativ)', () => {
    Object.values(SERVICES).forEach((svc) => {
      expect(svc.href).not.toMatch(/^\//);
    });
  });
});

describe('hasStep2', () => {
  it('mehr_umsatz hat Step 2', () => {
    expect(hasStep2('mehr_umsatz')).toBe(true);
  });

  it('mitarbeiter hat Step 2', () => {
    expect(hasStep2('mitarbeiter')).toBe(true);
  });

  it('sichtbarkeit hat Step 2', () => {
    expect(hasStep2('sichtbarkeit')).toBe(true);
  });

  it('marke hat keinen Step 2', () => {
    expect(hasStep2('marke')).toBe(false);
  });

  it('bfsg hat keinen Step 2', () => {
    expect(hasStep2('bfsg')).toBe(false);
  });
});

describe('getStep2Config', () => {
  it('gibt Config für mehr_umsatz zurück', () => {
    const cfg = getStep2Config('mehr_umsatz');
    expect(cfg).not.toBeNull();
    expect(cfg?.question.length).toBeGreaterThan(0);
    expect(cfg?.options.length).toBeGreaterThan(0);
  });

  it('gibt null für marke zurück', () => {
    expect(getStep2Config('marke')).toBeNull();
  });

  it('gibt null für unbekannten Key zurück', () => {
    expect(getStep2Config('xyz')).toBeNull();
  });

  it('alle Step2-Configs haben mindestens 2 Optionen', () => {
    Object.values(STEP2_CONFIG).forEach((cfg) => {
      expect(cfg.options.length).toBeGreaterThanOrEqual(2);
    });
  });
});
