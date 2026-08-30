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
 *
 * Zur Herkunft: Die Bayer-Matrix ist ein Standard aus der Drucktechnik —
 * dieselben 16 bzw. 64 Zahlen stehen in jeder Implementierung geordneten
 * Ditherings. Die Felder darunter sind dagegen eigene Konstruktionen. Eine
 * erste Fassung hatte die Formeln der Seite nachgebaut, an der wir uns
 * gestalterisch orientiert haben; das war zu nah. Was hier steht, bewegt
 * sich anders: Moiré aus gedrehten Gittern statt überlagerter Sinusbänder,
 * zwei interferierende Ringquellen statt einer, fallende Spalten statt
 * waagerechter Fäden.
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

/** Nachkommaanteil, auch für negative Zahlen in [0,1) — JS' % liefert dort
 *  ein negatives Ergebnis und macht aus einem Gittermuster eine Asymmetrie. */
function frac(v: number): number {
  return ((v % 1) + 1) % 1;
}

/** Abstand zur Gittermitte als Linie: 1 auf der Linie, 0 dazwischen. */
function linie(v: number, schaerfe: number): number {
  return Math.pow(1 - Math.min(1, Math.abs(frac(v) - 0.5) * 2), schaerfe);
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
 * Denkender Kern — die Fläche im Kopf der Startseite.
 *
 * Eine beleuchtete Kugel, auf deren Oberfläche ein Adergeflecht liegt. Das
 * Geflecht entsteht aus Rauschen in Kugelkoordinaten: Weil die Länge mit
 * der Zeit wächst, dreht sich das Muster um die Achse, während die Kugel
 * stehen bleibt — wie ein Globus, nicht wie ein rotierender Ball.
 *
 * Dazu zwei Atemzüge in unterschiedlichem Takt: Der Radius weitet sich um
 * zwei Prozent, die Helligkeit der Adern schwillt an und ab. Weil beide
 * Perioden teilerfremd sind, wiederholt sich der Gesamteindruck erst nach
 * gut zwei Minuten — man sieht keine Schleife.
 */
const brain: Field = (x, y, w, h, t) => {
  const puls = Math.sin(t * 0.00042);
  const r = Math.min(w, h) * 0.44 * (1 + 0.02 * puls);
  const dx = x - w * 0.5;
  const dy = y - h * 0.5;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > r) {
    // Streulicht, quadratisch abfallend — der Rand soll ausfransen, nicht abreißen.
    const abfall = Math.max(0, 1 - (dist - r) / (r * 0.42));
    return 0.02 + abfall * abfall * 0.06;
  }

  const u = dx / r;
  const v = dy / r;
  const z = Math.sqrt(Math.max(0, 1 - u * u - v * v));

  // Kugelkoordinaten. Die Länge wandert mit der Zeit: das Muster dreht sich.
  const laenge = Math.atan2(u, z) + t * 0.00011;
  const breite = Math.asin(Math.max(-1, Math.min(1, v)));

  // Zwei Oktaven Rauschen auf der Oberfläche, die zweite gegenläufig
  // verschoben, damit die Adern nicht in Reihen stehen.
  const n =
    0.62 * valueNoise(laenge * 3.1, breite * 3.1, 11) +
    0.38 * valueNoise(laenge * 7.3 + 4.2, breite * 6.7 - 1.8, 29);

  // Grate statt Flächen: Der Betrag um 0,5 herum invertiert das Rauschen zu
  // einem Netz aus Linien — das ist es, was wie ein Geflecht aussieht.
  const adern = Math.pow(1 - Math.min(1, Math.abs(n - 0.5) * 2.9), 1.6);

  // Beleuchtung von links oben, feststehend. Bewegung kommt aus dem Muster,
  // nicht aus dem Licht — ein wanderndes Licht läse sich als Scheinwerfer.
  const lambert = Math.max(0, u * -0.42 + v * -0.46 + z * 0.78);

  const atem = 0.86 + 0.14 * Math.sin(t * 0.00068 + 1.1);
  return Math.min(0.97, (0.14 + 0.7 * lambert) * (0.34 + 0.92 * adern) * atem);
};

/**
 * Moiré aus zwei gedrehten Gittern. Der Winkel des zweiten Gitters wandert
 * langsam, dadurch laufen die Schwebungsstreifen über die Fläche.
 */
const weave: Field = (x, y, _w, _h, t) => {
  const a1 = 0.42;
  const a2 = 0.42 + 0.34 * Math.sin(t * 0.00023);
  const g1 = Math.sin((x * Math.cos(a1) + y * Math.sin(a1)) * 0.62);
  const g2 = Math.sin((x * Math.cos(a2) + y * Math.sin(a2)) * 0.58 + t * 0.0009);
  // Das Produkt zweier Sinus liegt im Mittel bei null; ohne die Potenz
  // stünde die halbe Fläche bei 0,5 und die Schwelle machte daraus ein
  // gleichmäßiges Schachbrett — sichtbar als Flimmern, nicht als Muster.
  // Die Potenz drückt alles Mittlere ins Dunkle; hell bleiben die Stellen,
  // an denen beide Gitter zugleich im Maximum stehen.
  return 0.05 + 0.9 * Math.pow(0.5 + 0.5 * g1 * g2, 3.2);
};

/**
 * Wolken, die einer gekrümmten Strömung folgen: Die Abtaststelle wird vor
 * dem Rauschen entlang einer Sinuskurve verschoben, statt das Rauschen nur
 * zu verschieben. Das gibt der Bewegung einen Drall.
 */
const drift: Field = (x, y, _w, h, t) => {
  const v = y / h;
  const strom = x / 26 + 2.4 * Math.sin(v * 2.7 + t * 0.00034);
  const quer = v * 5.2 + 0.6 * Math.sin(x / 90 - t * 0.00021);
  // Nur die oberen Rauschwerte werden zu Schwaden. Ohne diese Schwelle
  // liegt das Feld im Mittel bei 0,5, und ein Feld bei 0,5 ist nach dem
  // Dithering eine geschlossene helle Fläche, kein Muster.
  const roh = valueNoise(strom, quer, 43);
  const schwaden = Math.pow(Math.max(0, roh - 0.44) / 0.56, 1.7);
  return 0.04 + 0.84 * schwaden * (0.45 + 0.62 * (1 - Math.abs(v - 0.5) * 2));
};

/**
 * Zwei Ringquellen, die sich überlagern. Eine steht, die andere wandert
 * waagerecht; wo sich die Wellen treffen, entstehen Knoten.
 */
const pulse: Field = (x, y, w, h, t) => {
  const y2 = (y - h * 0.5) * 2.2;
  const q1x = x - w * 0.32;
  const q2x = x - w * (0.68 + 0.12 * Math.sin(t * 0.00019));
  const d1 = Math.sqrt(q1x * q1x + y2 * y2);
  const d2 = Math.sqrt(q2x * q2x + y2 * y2);
  // Nur die gemeinsamen Wellenberge leuchten. Die Summe zweier Sinus
  // liegt im Mittel bei null; wer sie auf 0,5 schiebt, bekommt eine zur
  // Hälfte weiße Fläche statt Ringe.
  const berg = (Math.sin(d1 * 0.11 - t * 0.0017) + Math.sin(d2 * 0.13 - t * 0.0021)) * 0.5;
  return 0.04 + 0.86 * Math.pow(Math.max(0, berg), 2.4);
};

/**
 * Fallende Spalten. Jede Spalte bekommt aus ihrem Index eine eigene
 * Geschwindigkeit und einen eigenen Startpunkt, dadurch fällt nichts im
 * Gleichschritt. Innerhalb einer Spalte verläuft die Helligkeit als Schweif.
 */
const rain: Field = (x, y, _w, h, t) => {
  const spalte = Math.floor(x / 2);
  const tempo = 0.018 + 0.042 * ((spalte * 2654435761) % 997) / 997;
  const versatz = ((spalte * 40503) % 1009) / 1009;
  const laenge = 0.35 + 0.4 * (((spalte * 22695477) % 733) / 733);
  const kopf = (versatz + t * 0.001 * tempo * 60) % 1;
  let d = kopf - y / h;
  if (d < 0) d += 1;
  return d < laenge ? 0.12 + 0.85 * Math.pow(1 - d / laenge, 2.4) : 0.05;
};

/**
 * Perspektivisches Gitter. Die Querlinien rücken nach unten zusammen, die
 * Längslinien laufen auf einen Fluchtpunkt zu. Ohne Zeitanteil.
 */
const mesh: Field = (x, y, w, h) => {
  // Tiefe wächst nach unten; der Horizont liegt knapp über der Oberkante.
  const tiefe = 0.1 + 0.9 * (y / h);
  // Querlinien stehen in Weltkoordinaten gleichmäßig — perspektivisch
  // rücken sie zum Horizont hin zusammen.
  const quer = linie((1 / tiefe) * 1.35, 10);
  // Längslinien laufen auf den Fluchtpunkt in der Mitte zu.
  const laengs = linie(((x / w - 0.5) / tiefe) * 2.4, 10);
  return 0.03 + 0.82 * Math.max(quer, laengs) * (0.25 + 0.75 * (y / h));
};

/** Verlauf über die Diagonale. Bewusst ohne Zeitanteil: bleibt statisch. */
const fade: Field = (x, y, w, h) =>
  0.04 + 0.66 * (0.62 * (x / (w - 1 || 1)) + 0.38 * (1 - y / (h - 1 || 1)));

export const FIELDS = { brain, drift, fade, mesh, pulse, rain, weave } as const;

/** Erlaubte Werte für `<Dither field="…" />`. */
export type FieldName = keyof typeof FIELDS;

/** Felder ohne Zeitanteil — für sie lohnt keine Animationsschleife. */
export const STATIC_FIELDS: readonly FieldName[] = ['fade', 'mesh'];

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
