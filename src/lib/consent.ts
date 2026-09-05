export const STORAGE_KEY = 'dk_consent_v1';

export interface ConsentSettings {
  necessary: boolean;
  statistics: boolean;
  /* `| undefined` ausdruecklich: Mit `exactOptionalPropertyTypes` ist ein
     fehlender Schluessel nicht dasselbe wie einer mit dem Wert `undefined`,
     und hier wird er gesetzt. */
  timestamp?: string | undefined;
}

export function parseConsent(raw: string | null): ConsentSettings | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    if (typeof obj['necessary'] !== 'boolean') return null;
    if (typeof obj['statistics'] !== 'boolean') return null;
    return {
      necessary: obj['necessary'] as boolean,
      statistics: obj['statistics'] as boolean,
      timestamp: typeof obj['timestamp'] === 'string' ? obj['timestamp'] : undefined,
    };
  } catch {
    return null;
  }
}

export function serializeConsent(settings: ConsentSettings): string {
  return JSON.stringify({ ...settings, timestamp: new Date().toISOString() });
}

export function mayLoadGA(settings: ConsentSettings | null): boolean {
  return settings !== null && settings.statistics === true;
}

export function defaultSettings(statistics: boolean): ConsentSettings {
  return { necessary: true, statistics };
}
