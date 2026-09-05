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
  /* Eine Bayer-Matrix ist quadratisch und nie leer — der Typ weiss das nicht,
     seit jeder Indexzugriff als moeglicherweise leer gilt. */
  const n = m.length * (m[0]?.length ?? 0);
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
 * Drei Bewegungen, alle langsam und mit teilerfremden Perioden, damit sich
 * der Gesamteindruck erst nach Minuten wiederholt und man keine Schleife
 * sieht:
 *
 *  1. Der Kern dreht sich. Nicht die Kugel — das Adergeflecht auf ihrer
 *     Oberfläche wandert in Kugelkoordinaten, wie die Landmassen auf einem
 *     Globus. Eine Umdrehung dauert rund 78 Sekunden.
 *  2. Der Kern atmet: Radius ±2,5 % in 18 s, Helligkeit der Adern in 21 s.
 *  3. Ein Hof aus Punkten weitet sich vom Rand nach außen und zieht sich
 *     wieder zusammen — 30 s hin, 30 s zurück. Die Punkte sitzen auf
 *     Ringen, die beim Ausatmen auseinanderrücken; gleichzeitig dreht der
 *     ganze Hof gegenläufig zum Kern, sehr langsam.
 *
 * Der Hof ist nicht als Partikelliste gerechnet, sondern als Feld: Statt
 * die Punkte zu bewegen, wird der Abstand vor der Prüfung durch den
 * Atemfaktor geteilt. Für jeden Bildpunkt bleibt es damit bei etwas
 * Trigonometrie — eine Liste mit tausend Partikeln müsste pro Frame
 * durchlaufen werden.
 */
const brain: Field = (x, y, w, h, t) => {
  const atem = Math.sin(t * 0.00035);          // Kern, ~18 s
  const weite = Math.sin(t * 0.00021);         // Hof, ~30 s
  const radius = Math.min(w, h) * 0.4 * (1 + 0.025 * atem);
  const dx = x - w * 0.5;
  const dy = y - h * 0.5;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const winkel = Math.atan2(dy, dx) / (Math.PI * 2);

  if (dist > radius) {
    const aussen = (dist - radius) / radius;
    if (aussen > 1.3) return 0.012;
    // Den Abstand zurückrechnen, statt die Punkte zu verschieben.
    const r0 = aussen / (0.55 + 0.45 * (0.5 + 0.5 * weite));
    if (r0 > 1) return 0.012;
    // Weniger, dafür breitere Ringe und mehr Punkte je Ring: Das liest
    // sich als geordneter Hof. Mit dünnen Ringen und wenigen Punkten
    // sahen die Treffer aus wie verstreute Sprenkel.
    const ringe = linie(r0 * 4, 6);
    const punkte = linie(winkel * 34 - t * 0.00005, 5);
    return 0.012 + 0.9 * ringe * punkte * (1 - r0);
  }

  const u = dx / radius;
  const v = dy / radius;
  const z = Math.sqrt(Math.max(0, 1 - u * u - v * v));

  // Kugelkoordinaten; die Länge wandert mit der Zeit.
  const laenge = Math.atan2(u, z) + t * 0.00008;
  const breite = Math.asin(Math.max(-1, Math.min(1, v)));

  const n =
    0.62 * valueNoise(laenge * 3.1, breite * 3.1, 11) +
    0.38 * valueNoise(laenge * 7.3 + 4.2, breite * 6.7 - 1.8, 29);

  // Grate statt Flächen: Der Betrag um 0,5 herum macht aus dem Rauschen
  // ein Netz aus Linien — das ist es, was wie ein Geflecht aussieht.
  const adern = Math.pow(1 - Math.min(1, Math.abs(n - 0.5) * 2.9), 1.6);

  // Feststehendes Licht von links oben. Bewegung kommt aus dem Muster;
  // ein wanderndes Licht läse sich als Scheinwerfer.
  const lambert = Math.max(0, u * -0.42 + v * -0.46 + z * 0.78);

  const puls = 0.86 + 0.14 * Math.sin(t * 0.0003 + 1.1);
  return Math.min(0.97, (0.14 + 0.7 * lambert) * (0.34 + 0.92 * adern) * puls);
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

/**
 * Höhenlinien einer Landschaft. Drei Kämme in unterschiedlicher Höhe und
 * Phase, jeder nur als dünne Linie sichtbar — nicht als gefüllte Fläche,
 * sonst stünde die halbe Höhe des Bandes im Weiß.
 */
const dunes: Field = (x, y, w, h, t) => {
  const u = x / w;
  const v = y / h;
  let hell = 0.03;
  for (let i = 0; i < 3; i++) {
    const kamm =
      0.3 + i * 0.19 +
      0.07 * Math.sin(u * (3.1 + i * 2.3) + t * 0.00013 * (1 + i * 0.6) + i * 1.7) +
      0.02 * Math.sin(u * (9.4 + i * 3.1) - t * 0.00008);
    const linienbreite = 26 - i * 5;
    hell = Math.max(hell, 0.92 * Math.pow(Math.max(0, 1 - Math.abs(v - kamm) * linienbreite), 2));
  }
  return hell;
};

/**
 * Ein Balken, der von links nach rechts über die Fläche läuft, mit
 * waagerechter Zeilenstruktur darin — die Bewegung eines Abtastvorgangs.
 */
const scan: Field = (x, y, w, _h, t) => {
  const pos = (t * 0.00016) % 1;
  const abstand = Math.abs(x / w - pos);
  const balken = Math.pow(Math.max(0, 1 - abstand * 9), 3);
  const grund = 0.05 + 0.14 * valueNoise(x / 30, y / 12, 61);
  return grund + 0.8 * balken * (0.45 + 0.55 * Math.sin(y * 0.42));
};

/**
 * Punkte auf konzentrischen Ringen, die abwechselnd vor- und rückwärts
 * laufen. Die inneren Ringe drehen langsamer als die äußeren.
 */
const orbit: Field = (x, y, w, h, t) => {
  const radius = Math.min(w, h) * 0.46;
  const dx = (x - w * 0.5) / radius;
  const dy = (y - h * 0.5) / radius;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r > 1.06) return 0.02;

  const ring = linie(r * 4.2, 14);
  const nummer = Math.floor(r * 4.2);
  const tempo = 0.00045 * (1 + nummer * 0.7) * (nummer % 2 === 0 ? 1 : -1);
  const winkel = Math.atan2(dy, dx) / (Math.PI * 2);
  const punkte = linie(winkel * (6 + nummer * 4) + t * tempo, 6);
  return 0.03 + 0.92 * ring * (0.2 + 0.9 * punkte);
};

/**
 * Drahtgitter-Globus. Meridiane und Breitenkreise auf einer Kugel; die
 * Länge wandert mit der Zeit, also dreht sich das Gitter. Was nach hinten
 * zeigt, wird dunkler — sonst läge das Gitter flach auf der Scheibe.
 */
const lattice: Field = (x, y, w, h, t) => {
  const r = Math.min(w, h) * 0.44;
  const u = (x - w * 0.5) / r;
  const v = (y - h * 0.5) / r;
  const q = u * u + v * v;
  if (q > 1) return 0.014;
  const z = Math.sqrt(1 - q);
  const laenge = Math.atan2(u, z) / (Math.PI * 2) + t * 0.00007;
  const breite = Math.asin(Math.max(-1, Math.min(1, v))) / Math.PI;
  const gitter = Math.max(linie(laenge * 16, 5), linie(breite * 12, 5));
  return 0.02 + 0.92 * gitter * (0.25 + 0.75 * Math.sqrt(z));
};

/**
 * Atmender Schwarm. Punkte auf einem polaren Gitter, das mit Rauschen
 * verzogen ist, damit es nicht als Gitter zu erkennen ist. Die ganze
 * Wolke weitet sich und zieht sich wieder zusammen — 28 Sekunden hin,
 * 28 zurück — und dreht dabei sehr langsam.
 *
 * Bewegt werden nicht die Punkte, sondern die Abfrage: Der Abstand wird
 * vor der Prüfung durch den Atemfaktor geteilt. Damit kostet der Schwarm
 * pro Bildpunkt dasselbe wie ein Verlauf, statt eine Partikelliste je
 * Frame zu durchlaufen.
 *
 * Vorgänger an dieser Stelle war eine Doppelspirale. Sie las sich im
 * 1-Bit-Raster nicht: Ein Strang wird dort waagerecht, wo die Windung
 * umkehrt, und genau diese Kehren tragen im Raster am meisten Fläche —
 * das Bild bestand aus liegenden Strichen statt aus einer Spirale.
 */
const swarm: Field = (x, y, w, h, t) => {
  const aussen = Math.min(w, h) * 0.46;
  const dx = (x - w * 0.5) / aussen;
  const dy = (y - h * 0.5) / aussen;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r > 1.06) return 0.014;

  const atem = 0.58 + 0.42 * (0.5 + 0.5 * Math.sin(t * 0.00022));
  const r1 = r / atem;
  if (r1 > 1) return 0.014;

  const winkel = Math.atan2(dy, dx) / (Math.PI * 2) + t * 0.00004;
  // Weichere Schwellen als beim ersten Versuch: Mit 8 und 6 blieben nur
  // vereinzelte Pixel übrig, und neben `brain` oder `lattice` sah die
  // Fläche leer aus.
  const ringe = linie(r1 * 8.5 + 0.35 * valueNoise(winkel * 22, r1 * 6, 5), 5);
  const speichen = linie(winkel * 52 + 0.6 * valueNoise(r1 * 9, winkel * 16, 17), 4);
  const kern = 0.5 * Math.pow(Math.max(0, 1 - r1 * 3.4), 3);
  return 0.014 + Math.max(kern, 0.94 * ringe * speichen * Math.pow(1 - r1, 0.5));
};

/**
 * Strahlenkranz um einen atmenden Kern. Die Strahlen drehen sehr langsam,
 * der Kern schwillt in einem anderen Takt an und ab.
 */
const nova: Field = (x, y, w, h, t) => {
  const r0 = Math.min(w, h) * 0.46;
  const dx = (x - w * 0.5) / r0;
  const dy = (y - h * 0.5) / r0;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r > 1.04) return 0.014;
  const winkel = Math.atan2(dy, dx) / (Math.PI * 2);
  const strahlen = linie(winkel * 18 + t * 0.00006, 3);
  const kern = Math.pow(Math.max(0, 1 - r * 2.8), 2);
  const atem = 0.74 + 0.26 * Math.sin(t * 0.00027);
  const abfall = Math.pow(Math.max(0, 1 - r), 1.4);
  return 0.014 + 0.92 * Math.max(kern, strahlen * abfall * 0.85) * atem;
};

/** Verlauf über die Diagonale. Bewusst ohne Zeitanteil: bleibt statisch. */
const fade: Field = (x, y, w, h) =>
  0.04 + 0.66 * (0.62 * (x / (w - 1 || 1)) + 0.38 * (1 - y / (h - 1 || 1)));

export const FIELDS = { brain, drift, dunes, fade, lattice, mesh, nova, orbit, pulse, rain, scan, swarm, weave } as const;

/** Erlaubte Werte für `<Dither field="…" />`. */
export type FieldName = keyof typeof FIELDS;

/**
 * Die Formen, die als große Kugel im Kopf der Startseite funktionieren.
 * Bandfelder wie `rain` oder `dunes` gehören nicht dazu: Sie sind auf ein
 * breites, flaches Format gerechnet und ergeben im Quadrat kein Bild.
 */
export const HERO_FIELDS: readonly FieldName[] = ['brain', 'lattice', 'nova', 'orbit', 'swarm'];

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
  const cols = matrix[0]?.length ?? 0;
  const bild = ctx.createImageData(w, h);
  const px = bild.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let wert = field(x, y, w, h, t);
      if (wert < 0) wert = 0;
      else if (wert > 1) wert = 1;

      const i = (y * w + x) * 4;
      /* `rows` und `cols` stammen aus derselben Matrix; der Zugriff kann
         nicht danebengehen. Der Rueckfall haelt nur den Typ zufrieden. */
      if (wert > (matrix[y % rows]?.[x % cols] ?? 1)) {
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
