/**
 * 1-Bit-Dithering für die Flächen dieser Website.
 *
 * Die Flächen sehen aus wie ein Zeichenraster, sind aber keins: Gezeichnet
 * wird auf ein absichtlich winziges Canvas — ein Canvas-Pixel entspricht
 * `cell` CSS-Pixeln — und der Browser skaliert es mit
 * `image-rendering: pixelated` hoch. Ein 1200 px breites Band rechnet bei
 * `cell: 3` also nur 400 Spalten.
 *
 * Aus dem Grauwert eines Feldes wird per Bayer-Schwellenmatrix ein
 * Schwarz-Weiß-Entscheid: `an = wert > matrix[y % n][x % n]`. Das ist
 * geordnetes Dithering — dieselbe Technik, mit der Bilder auf 1-Bit-Displays
 * kamen. Kein WebGL, keine Bibliothek, keine Bilddatei.
 *
 * Die Felder sind reine Funktionen (x, y, Breite, Höhe, Zeit) → 0…1 und
 * damit ohne Browser prüfbar; src/lib/dither.test.ts tut das.
 */

/** Grauwert an einer Rasterstelle. Rückgabe außerhalb 0…1 wird geklemmt. */
export type Field = (x: number, y: number, w: number, h: number, t: number) => number;

/** Normalisiert eine Bayer-Matrix auf Schwellen in (0,1). */
function normalize(m: readonly (readonly number[])[]): number[][] {
  const n = m.length * m[0].length;
  return m.map((row) => row.map((v) => (v + 0.5) / n));
}

/** 4×4 — kräftiges Raster, sichtbare Struktur. */
export const BAYER4: readonly (readonly number[])[] = normalize([
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]);

/** 8×8 — feinere Abstufung für weiche Verläufe. */
export const BAYER8: readonly (readonly number[])[] = normalize([
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
]);

/** Deterministischer Hash → 0…1. Ersetzt Math.random: gleiche Eingabe, gleiches Bild. */
function hash(x: number, y: number, seed: number): number {
  let n = Math.imul(x, 0x165667b1) + Math.imul(y, 0x27d4eb2f) + Math.imul(seed, 0x9e3779b1);
  n = Math.imul(n ^ (n >>> 13), 0x4bf19f61);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}

/** Bilinear geglättetes Gitterrauschen mit Smoothstep-Kante. */
export function valueNoise(x: number, y: number, seed = 0): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  return (
    hash(xi, yi, seed) * (1 - sx) * (1 - sy) +
    hash(xi + 1, yi, seed) * sx * (1 - sy) +
    hash(xi, yi + 1, seed) * (1 - sx) * sy +
    hash(xi + 1, yi + 1, seed) * sx * sy
  );
}

/**
 * Lambert-beleuchtete Kugel. Der Lichtvektor kreist langsam, dadurch
 * wandert die Lichtkante über die Kugel, statt dass sich das Bild dreht.
 */
const sphere: Field = (x, y, w, h, t) => {
  const r = Math.min(w, h) * 0.42;
  const dx = x - w * 0.5;
  const dy = y - h * 0.48;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > r) {
    // Halo: quadratischer Abfall, damit der Rand nicht hart abreißt.
    const falloff = Math.max(0, 1 - (dist - r) / (r * 0.55));
    return 0.03 + falloff * falloff * 0.05;
  }
  const u = dx / r;
  const v = dy / r;
  const z = Math.sqrt(Math.max(0, 1 - u * u - v * v));
  const lx = 0.55 * Math.cos(t * 0.00035);
  const len = Math.sqrt(lx * lx + 0.25 + 0.5184);
  const lambert = (u * lx + v * -0.5 + z * 0.72) / len;
  return Math.min(0.05 + 0.94 * Math.pow(Math.max(0, lambert), 1.15), 0.97);
};

/** Zwei überlagerte Sinusbänder — ruhiges Fließen, für breite Trenner. */
const wave: Field = (x, y, _w, h, t) => {
  const rel = y / h;
  const a = 0.5 + 0.26 * Math.sin(x * 0.05 - t * 0.0022) * Math.sin(x * 0.011 + t * 0.0009);
  const b = 0.5 + 0.14 * Math.sin(x * 0.09 + t * 0.0016);
  return Math.max(1 - 7 * Math.abs(rel - a), (1 - 10 * Math.abs(rel - b)) * 0.7);
};

/** Zwei Oktaven Rauschen, gegenläufig driftend; nach rechts heller. */
const noise: Field = (x, y, w, _h, t) => {
  const u = x / 22;
  const v = y / 22;
  const drift = t * 0.00018;
  return (
    (0.6 * valueNoise(u + drift, v, 7) + 0.4 * valueNoise(2 * u - drift, 2 * v + drift, 19)) *
    (0.5 + (x / w) * 0.55)
  );
};

/** Konzentrische Ringe, die nach außen laufen. */
const ripple: Field = (x, y, w, h, t) => {
  const dx = x - w / 2;
  const dy = (y - h / 2) * 2.4;
  return 0.5 + 0.46 * Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.14 - t * 0.0026);
};

/** Waagerechte Fäden — Zeilen aus Rauschen, langsam nach links ziehend. */
const stream: Field = (x, y, _w, _h, t) => {
  return (0.5 * Math.sin(y * 0.55) + 0.5) * (0.35 + 0.75 * valueNoise(x / 40 - t * 0.0011, y / 6, 5));
};

/** Landschaftskante mit drei Sinus-Oktaven; darüber heller Himmel. */
const horizon: Field = (x, y, w, h, _t) => {
  const u = x / w;
  const v = y / h;
  const kante =
    0.4 + 0.09 * Math.sin(u * 4.6 + 1.4) + 0.035 * Math.sin(u * 11.3) + 0.015 * Math.sin(u * 23.1 + 0.7);
  return v < kante ? Math.max(0, 0.04 - (kante - v) * 0.3) : Math.min(0.12 + (v - kante) * 0.7, 0.5);
};

/** Reiner Verlauf links → rechts. Bewusst ohne Zeitanteil: bleibt statisch. */
const gradient: Field = (x, _y, w) => x / (w - 1 || 1);

export const FIELDS = { gradient, horizon, noise, ripple, sphere, stream, wave } as const;

/** Erlaubte Werte für `<Dither field="…" />`. */
export type FieldName = keyof typeof FIELDS;

/** Felder ohne Zeitanteil — für sie lohnt keine Animationsschleife. */
export const STATIC_FIELDS: readonly FieldName[] = ['gradient', 'horizon'];

export interface PaintOptions {
  /** Kantenlänge einer Rasterzelle in CSS-Pixeln. Größer = grober = billiger. */
  cell?: number;
  /** Schwellenmatrix; BAYER4 (kräftig) oder BAYER8 (fein). */
  matrix?: readonly (readonly number[])[];
  /** Gelöschte Pixel transparent lassen, statt sie zu füllen. */
  transparent?: boolean;
  /** Farbe der gesetzten Pixel als [r, g, b]. */
  rgb?: readonly [number, number, number];
}

/**
 * Zeichnet ein Feld als 1-Bit-Raster in das Canvas.
 *
 * Gibt die tatsächliche Rastergröße zurück oder null, wenn das Element
 * (noch) keine Fläche hat — das passiert bei `display: none` und beim
 * ersten Frame vor dem Layout.
 */
export function paintDither(
  canvas: HTMLCanvasElement,
  field: Field,
  t: number,
  options: PaintOptions = {}
): { w: number; h: number } | null {
  const cell = options.cell ?? 3;
  const matrix = options.matrix ?? BAYER4;
  const transparent = options.transparent ?? true;
  const [r, g, b] = options.rgb ?? [243, 243, 243];

  const rect = canvas.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;

  const w = Math.max(1, Math.round(rect.width / cell));
  const h = Math.max(1, Math.round(rect.height / cell));
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const rows = matrix.length;
  const cols = matrix[0].length;
  const bild = ctx.createImageData(w, h);
  const px = bild.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let wert = field(x, y, w, h, t);
      if (wert < 0) wert = 0;
      else if (wert > 1) wert = 1;

      const i = (y * w + x) * 4;
      if (wert > matrix[y % rows][x % cols]) {
        px[i] = r;
        px[i + 1] = g;
        px[i + 2] = b;
        px[i + 3] = 255;
      } else if (!transparent) {
        px[i] = 11;
        px[i + 1] = 11;
        px[i + 2] = 11;
        px[i + 3] = 255;
      }
    }
  }

  ctx.putImageData(bild, 0, 0);
  return { w, h };
}
