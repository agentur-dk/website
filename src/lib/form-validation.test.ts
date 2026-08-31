import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateName,
  validateMessage,
  isHoneypotFilled,
  isSpamSubmit,
  validateMathAnswer,
  validateContactForm,
} from './form-validation';

describe('validateEmail', () => {
  it('gültige E-Mail', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.de')).toBe(true);
    expect(validateEmail('  user@example.org  ')).toBe(true);
  });

  it('ungültige E-Mail – kein @', () => {
    expect(validateEmail('keineat')).toBe(false);
  });

  it('ungültige E-Mail – kein Domain-Teil', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('ungültige E-Mail – leerer String', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('ungültige E-Mail – nur Leerzeichen', () => {
    expect(validateEmail('   ')).toBe(false);
  });

  it('ungültige E-Mail – kein Punkt im Domain', () => {
    expect(validateEmail('user@domain')).toBe(false);
  });
});

describe('validateName', () => {
  it('nicht-leerer Name', () => {
    expect(validateName('Max Mustermann')).toBe(true);
  });

  it('Name mit nur Leerzeichen → ungültig', () => {
    expect(validateName('   ')).toBe(false);
  });

  it('leerer String → ungültig', () => {
    expect(validateName('')).toBe(false);
  });
});

describe('validateMessage', () => {
  it('Nachricht mit 10+ Zeichen → gültig', () => {
    expect(validateMessage('Das ist eine Testnachricht')).toBe(true);
  });

  it('Nachricht mit genau 10 Zeichen → gültig', () => {
    expect(validateMessage('1234567890')).toBe(true);
  });

  it('Nachricht mit 9 Zeichen → ungültig', () => {
    expect(validateMessage('123456789')).toBe(false);
  });

  it('leere Nachricht → ungültig', () => {
    expect(validateMessage('')).toBe(false);
  });

  it('benutzerdefinierte minLength', () => {
    expect(validateMessage('Kurz', 3)).toBe(true);
    expect(validateMessage('Hi', 5)).toBe(false);
  });
});

describe('isHoneypotFilled', () => {
  it('leerer Honeypot → kein Bot', () => {
    expect(isHoneypotFilled('')).toBe(false);
  });

  it('gefüllter Honeypot → Bot', () => {
    expect(isHoneypotFilled('bot-inhalt')).toBe(true);
  });
});

describe('isSpamSubmit', () => {
  it('Abgabe nach < 2,5 s → Spam', () => {
    const now = Date.now();
    expect(isSpamSubmit(now - 1000, now)).toBe(true);
  });

  it('Abgabe nach ≥ 2,5 s → kein Spam', () => {
    const now = Date.now();
    expect(isSpamSubmit(now - 3000, now)).toBe(false);
  });

  it('startedAt = 0 → kein Spam (kein Zeitstempel)', () => {
    expect(isSpamSubmit(0, Date.now())).toBe(false);
  });

  it('benutzerdefiniertes Minimum', () => {
    const now = Date.now();
    expect(isSpamSubmit(now - 500, now, 1000)).toBe(true);
    expect(isSpamSubmit(now - 1500, now, 1000)).toBe(false);
  });
});

describe('validateContactForm', () => {
  const validData = {
    name: 'Max Mustermann',
    email: 'max@example.de',
    website: '',
    message: 'Das ist eine Testnachricht.',
    honeypot: '',
    startedAt: Date.now() - 5000,
  };

  it('valides Formular → keine Fehler', () => {
    const errors = validateContactForm(validData);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('fehlender Name → Fehler', () => {
    const errors = validateContactForm({ ...validData, name: '' });
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeUndefined();
  });

  it('ungültige E-Mail → Fehler', () => {
    const errors = validateContactForm({ ...validData, email: 'kein-at' });
    expect(errors.email).toBeTruthy();
  });

  it('zu kurze Nachricht → Fehler', () => {
    const errors = validateContactForm({ ...validData, message: 'kurz' });
    expect(errors.message).toBeTruthy();
  });

  it('ungültige Website-URL → Fehler', () => {
    const errors = validateContactForm({ ...validData, website: 'keine-url' });
    expect(errors.website).toBeTruthy();
  });

  it('leere optionale Website → kein Fehler', () => {
    const errors = validateContactForm({ ...validData, website: '' });
    expect(errors.website).toBeUndefined();
  });

  it('gültige Website-URL → kein Fehler', () => {
    const errors = validateContactForm({ ...validData, website: 'https://example.de' });
    expect(errors.website).toBeUndefined();
  });
});

describe('validateMathAnswer', () => {
  it('nimmt die richtige Summe an', () => {
    expect(validateMathAnswer(7, 4, '11')).toBe(true);
  });

  it('lehnt eine falsche Summe ab', () => {
    expect(validateMathAnswer(7, 4, '10')).toBe(false);
  });

  it('stört sich nicht an Leerzeichen, Pluszeichen oder Komma', () => {
    // Wer „ 11 " eintippt, hat die Aufgabe gelöst — das ist kein Bot.
    expect(validateMathAnswer(7, 4, ' 11 ')).toBe(true);
    expect(validateMathAnswer(7, 4, '+11')).toBe(true);
    expect(validateMathAnswer(3, 4, '7,0')).toBe(true);
  });

  it('lehnt Leeres und Text ab', () => {
    expect(validateMathAnswer(7, 4, '')).toBe(false);
    expect(validateMathAnswer(7, 4, '   ')).toBe(false);
    expect(validateMathAnswer(7, 4, 'elf')).toBe(false);
  });

  it('lehnt Zahlen mit Anhang ab', () => {
    expect(validateMathAnswer(7, 4, '11abc')).toBe(false);
  });
});
