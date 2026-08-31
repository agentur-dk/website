<?php
/**
 * Endpunkt des Anfrageformulars von dk-dk.de.
 *
 * Versendet wird über die MailerSend-API — kein eigener Mailer, kein
 * PHPMailer, kein SMTP, kein mail(). Der Versand ist ein einziger
 * HTTPS-Aufruf an api.mailersend.com, ganz unten in dieser Datei.
 *
 * Warum es diese Datei überhaupt gibt: Der API-Aufruf braucht
 * `Authorization: Bearer <Token>`. Stünde er im JavaScript der Website,
 * stünde der Token im Quelltext jeder Seite — jeder könnte dann über
 * diesen Account und mit dieser Absenderdomain Mails verschicken. Der
 * Token muss also auf einem Rechner liegen, den ihr kontrolliert. Dieses
 * Skript ist genau das und sonst nichts: ein Türsteher vor dem einen
 * API-Aufruf.
 *
 * Die Website liegt auf GitHub Pages und liefert nur Dateien aus; das
 * Skript läuft deshalb getrennt davon auf dem goneo-Webspace unter
 * `vorschau.dk-dk.de` — einer Adresse, die es dort ohnehin schon gibt.
 *
 * Ein Endpunkt für alle Projekte. Welches Projekt gesendet hat, steht in
 * `page_url` und landet im Betreff; welche Adressen senden dürfen, steht
 * in `erlaubte_herkunft`. Ein neues Vorschau-Projekt braucht damit nur
 * einen Eintrag in dieser Liste und keinen eigenen Token.
 *
 * Zwei Wege:
 *   GET  ?challenge=1   gibt einen signierten Zeitstempel aus
 *   POST                nimmt die Anfrage entgegen
 *
 * Der signierte Zeitstempel ist der Teil, der im Browser allein nicht
 * geht: Dort ließe sich jeder Wert setzen. Hier bekommt er eine Signatur
 * mit einem Geheimnis, das nur auf diesem Server liegt — wer die Zeit
 * fälscht, fälscht die Signatur nicht mit.
 *
 * Antworten sind bewusst wortkarg. Wer erfährt, woran er gescheitert ist,
 * baut es beim nächsten Versuch nach.
 */

declare(strict_types=1);

/**
 * Wo liegt die Konfiguration?
 *
 * Bevorzugt in `_intern/` — der Ordner ist auf dem Server per
 * Serverkonfiguration gesperrt (geprüft: 403 auf alles, auch auf
 * `config.php` und `.env`). Das ist sicherer als eine `.htaccess` neben
 * dem Skript, weil es nicht davon abhängt, dass diese gelesen wird.
 *
 * PHP kommt trotzdem heran: Die Sperre gilt für Anfragen über das Web,
 * nicht für den Dateizugriff.
 *
 * Fällt zurück auf die Datei neben dem Skript, damit die Einrichtung auch
 * ohne `_intern` funktioniert.
 */
$kandidaten = [
    getenv('DK_FORMULAR_CONFIG') ?: null,
    dirname(__DIR__) . '/_intern/formular-config.php',
    dirname(__DIR__) . '/_intern/config.php',
    __DIR__ . '/config.php',
];

$k = null;
foreach ($kandidaten as $pfad) {
    if ($pfad !== null && is_file($pfad)) {
        $k = require $pfad;
        break;
    }
}
if (!is_array($k)) {
    http_response_code(500);
    exit('Keine Konfiguration.');
}

/**
 * Token und Absender aus den vorhandenen Dateien.
 *
 * In `_intern/` liegen auf diesem Webspace bereits `mailersend.key` und
 * `mailersend.from` — die Konvention, nach der die übrigen Projekte
 * arbeiten. Sie haben Vorrang vor allem, was in der Konfiguration steht.
 *
 * Damit gibt es genau eine Stelle für den Schlüssel. Ein zweites
 * Exemplar in einer Projektdatei wäre eine Stelle mehr zum Rotieren, zum
 * Vergessen und zum versehentlichen Mitversionieren.
 */
$ausDatei = static function (string $name): ?string {
    foreach ([dirname(__DIR__) . '/_intern/' . $name, __DIR__ . '/' . $name] as $pfad) {
        if (is_file($pfad) && is_readable($pfad)) {
            $wert = trim((string) file_get_contents($pfad));
            if ($wert !== '') {
                return $wert;
            }
        }
    }
    return null;
};

$k['von_adresse'] = $ausDatei('mailersend.from') ?? ($k['von_adresse'] ?? '');

/**
 * Welche Schlüssel kommen in Frage?
 *
 * Zuerst der aus `_intern/mailersend.key`, weil das die vorhandene
 * Konvention dieses Webspace ist. Steht in der Konfiguration ein anderer,
 * bleibt er als Rückfall stehen: `mailersend.key` ist dem Namen nach der
 * API-Token, nachgesehen habe ich aber nie — und ein Formular, das wegen
 * einer Namensvermutung nicht sendet, wäre der schlechtere Fehler.
 *
 * Lehnt MailerSend den ersten Schlüssel mit 401 oder 403 ab, wird der
 * zweite versucht und die Verwechslung ins Fehlerprotokoll geschrieben.
 * Sobald klar ist, welcher stimmt, kann der andere weg.
 */
// `mailersend.token` steht mit in der Liste, weil ein anderes Projekt auf
// diesem Webspace danach sucht. Die Datei existiert dort nicht — genau
// deshalb hier beide Namen: Wer sie eines Tages anlegt, wird gefunden.
$schluessel = array_values(array_unique(array_filter([
    $ausDatei('mailersend.key'),
    $ausDatei('mailersend.token'),
    $k['mailersend_token'] ?? '',
])));

if ($schluessel === [] || $k['von_adresse'] === '') {
    http_response_code(500);
    exit('Kein Zugang zur Versand-API.');
}

/* ---------------------------------------------------------------- *
 *  Herkunft und Vorabanfrage
 * ---------------------------------------------------------------- */

/**
 * Fehlerprotokoll.
 *
 * `error_log()` landet auf diesem Webspace in einem Protokoll, an das
 * man ohne Shell nicht herankommt — ein abgelehnter Versand war damit
 * praktisch unsichtbar. Deshalb zusätzlich eine eigene Datei.
 *
 * Sie liegt im Zählerverzeichnis (`_intern/.zaehler/`), und `_intern/`
 * ist serverseitig für Anfragen aus dem Web gesperrt. Sie wächst nicht
 * unbegrenzt: Ab 20 kB wird die vordere Hälfte abgeschnitten. Der
 * Antworttext wird auf 600 Zeichen gekürzt — für die Fehlermeldung von
 * MailerSend reicht das, und die Anfragedaten selbst stehen ohnehin
 * nicht darin.
 *
 * Steht bewusst weit oben, vor jedem Aufruf: Als sie weiter unten
 * zwischen zwei Anweisungen stand, hat ein Umbau sie mitgelöscht. Alle
 * vier Aufrufe liefen danach ins Leere, PHP brach fatal ab — und weil
 * auch der Haken für fatale Fehler sie aufruft, blieb das Protokoll
 * still. Genau der Fehler, den es sichtbar machen soll.
 */
function protokolliere(string $verzeichnis, string $zeile): void
{
    if ($verzeichnis === '' || !is_dir($verzeichnis) || !is_writable($verzeichnis)) {
        return;
    }
    $datei = $verzeichnis . '/fehler.log';
    if (is_file($datei) && filesize($datei) > 20000) {
        $inhalt = (string) file_get_contents($datei);
        @file_put_contents($datei, substr($inhalt, (int) (strlen($inhalt) / 2)));
    }
    @file_put_contents(
        $datei,
        gmdate('Y-m-d H:i:s') . ' UTC  ' . $zeile . "\n",
        FILE_APPEND
    );
}

/**
 * Fatale Fehler festhalten.
 *
 * Bricht PHP mit einem fatalen Fehler ab, geht die Antwort leer und mit
 * HTTP 500 raus — im Browser steht dann nur »Es ist ein Fehler
 * aufgetreten«, und woran es lag, ist von außen nicht zu erkennen.
 * Genau dieser Fall hat hier zwei Runden gekostet.
 *
 * Der Haken schreibt die Meldung deshalb in dieselbe geschützte Datei
 * wie ein abgelehnter Versand. Nach außen ändert sich nichts: Die
 * Meldung wird nirgends ausgegeben.
 */
register_shutdown_function(static function () use ($k): void {
    $fehler = error_get_last();
    if ($fehler === null
        || !in_array($fehler['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        return;
    }
    protokolliere(
        $k['zaehler_verzeichnis'] ?? '',
        'FATAL ' . $fehler['message'] . ' in ' . basename((string) $fehler['file'])
        . ':' . $fehler['line']
    );
});

/**
 * Woher kommt die Anfrage?
 *
 * `Origin` ist der verlässliche Wert und wird bevorzugt. Ein klassisches
 * Formular schickt ihn aber nicht in jedem Browser mit — die Kopfzeile
 * ist bei gleicher Herkunft nicht vorgeschrieben. Dann tritt der
 * `Referer` an ihre Stelle, auf Schema und Rechnername gekürzt; der Pfad
 * spielt keine Rolle, denn alle Vorschau-Projekte teilen sich eine
 * Adresse.
 *
 * Der Ersatz gilt nur für Formularsendungen. Eine JSON-Anfrage kommt aus
 * JavaScript, und dort setzt der Browser `Origin` immer — dort wäre der
 * Referer eine unnötige Lockerung.
 */
$herkunft = $_SERVER['HTTP_ORIGIN'] ?? '';
$echteHerkunft = $herkunft !== '';

if (!$echteHerkunft
    && !str_contains(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
    $teile = parse_url($_SERVER['HTTP_REFERER'] ?? '');
    if (isset($teile['scheme'], $teile['host'])) {
        $herkunft = $teile['scheme'] . '://' . $teile['host']
                  . (isset($teile['port']) ? ':' . $teile['port'] : '');
    }
}

$erlaubt = in_array($herkunft, $k['erlaubte_herkunft'], true);

// Der Freigabe-Kopf gehört nur zu einer echten Origin. Ihn für einen aus
// dem Referer erschlossenen Wert zu setzen, hieße dem Browser etwas über
// eine Anfrage zu sagen, die er gar nicht so gestellt hat.
if ($erlaubt && $echteHerkunft) {
    header('Access-Control-Allow-Origin: ' . $herkunft);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!$erlaubt) {
    http_response_code(403);
    exit(json_encode(['ok' => false]));
}

/* ---------------------------------------------------------------- *
 *  Hilfsmittel
 * ---------------------------------------------------------------- */

/** Signatur über einen Zeitstempel. */
function signiere(int $zeit, string $geheimnis): string
{
    return hash_hmac('sha256', (string) $zeit, $geheimnis);
}

/**
 * Wohin nach dem Absenden?
 *
 * Nur seiteneigene Pfade sind zulässig — beginnend mit einem einzelnen
 * Schrägstrich. Ohne diese Prüfung wäre das Formular eine offene
 * Weiterleitung: Wer `weiter=https://…` mitschickt, könnte über die
 * eigene Adresse auf eine fremde Seite lenken und damit Vertrauen
 * borgen, das ihm nicht gehört.
 */
function zielPfad(array $d, string $name, string $vorgabe): string
{
    $wert = isset($d[$name]) && is_scalar($d[$name]) ? trim((string) $d[$name]) : '';
    if ($wert === '' || $wert[0] !== '/' || str_starts_with($wert, '//')) {
        return $vorgabe;
    }
    return $wert;
}

/**
 * Antwort und Ende.
 *
 * Für JSON-Anfragen das gewohnte Objekt. Für ein klassisches Formular
 * eine Weiterleitung mit 303: Danach steht im Browser die Dankeseite,
 * nicht der Endpunkt — ein Neuladen schickt die Anfrage also nicht
 * ein zweites Mal ab.
 */
function antworte(int $code, array $daten): void
{
    global $istJson, $weiterGut, $weiterSchlecht;

    if ($istJson ?? true) {
        http_response_code($code);
        echo json_encode($daten);
        exit;
    }

    $ziel = ($daten['ok'] ?? false) ? ($weiterGut ?? '/') : ($weiterSchlecht ?? '/');
    if (!($daten['ok'] ?? false) && ($daten['fehler'] ?? '') !== '') {
        $ziel .= (str_contains($ziel, '?') ? '&' : '?') . 'fehler=' . rawurlencode((string) $daten['fehler']);
    }
    header('Location: ' . $ziel, true, 303);
    exit;
}

/**
 * Gespielter Erfolg.
 *
 * Für Anfragen, die als maschinell erkannt wurden. Der Absender sieht
 * dasselbe wie ein Mensch, zugestellt wird nichts. Eine Fehlermeldung
 * würde einem Bot verraten, dass er aufgeflogen ist.
 */
function stillVerwerfen(): void
{
    antworte(200, ['ok' => true]);
}

/* ---------------------------------------------------------------- *
 *  GET: signierten Zeitstempel ausgeben
 * ---------------------------------------------------------------- */

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    if (!isset($_GET['challenge'])) {
        antworte(400, ['ok' => false]);
    }
    $jetzt = time();
    antworte(200, [
        'ts'  => $jetzt,
        'sig' => signiere($jetzt, $k['signatur_geheimnis']),
    ]);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antworte(405, ['ok' => false]);
}

/* ---------------------------------------------------------------- *
 *  Eingang lesen
 * ---------------------------------------------------------------- */

/**
 * Zwei Wege hinein, und der Unterschied zieht sich durch die ganze Datei.
 *
 * JSON kommt von `client.js` und setzt JavaScript voraus. Ein klassisches
 * Formular — `method="post" action="…"` — kommt ohne aus, kann Dateien
 * mitschicken und erwartet keine JSON-Antwort, sondern eine
 * Weiterleitung. Beides muss gehen: Ein Formular, das ohne JavaScript
 * nicht absendet, ist ein Formular, das für einen Teil der Besucher
 * einfach nicht funktioniert.
 */
$istJson = str_contains(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json');

if ($istJson) {
    $roh = file_get_contents('php://input');
    if ($roh === false || strlen($roh) > 20000) {
        antworte(413, ['ok' => false]);
    }
    $d = json_decode($roh, true);
    if (!is_array($d)) {
        antworte(400, ['ok' => false]);
    }
} else {
    // Mehrfach belegte Namen (Ankreuzfelder) fasst PHP nur zusammen, wenn
    // der Name auf [] endet. Beides zu einem Text vereinen, weil der
    // Mailer an dieser Stelle immer eine Zeichenkette bekommen hat.
    $d = [];
    foreach ($_POST as $name => $wert) {
        $d[$name] = is_array($wert)
            ? implode(', ', array_map(static fn ($v) => (string) $v, $wert))
            : (string) $wert;
    }
}

// Weiterleitungsziele: was das Formular mitschickt, sonst die Vorgabe
// aus der Konfiguration. Nur seiteneigene Pfade, siehe zielPfad().
$weiterGut      = zielPfad($d, 'weiter',        $k['weiter_gut']     ?? '/danke/');
$weiterSchlecht = zielPfad($d, 'weiter_fehler', $k['weiter_fehler']  ?? '/');

/** Feld als getrimmter Text, höchstens $max Zeichen. */
function feld(array $d, string $name, int $max = 500): string
{
    $wert = isset($d[$name]) && is_scalar($d[$name]) ? (string) $d[$name] : '';
    return mb_substr(trim($wert), 0, $max);
}

/* ---------------------------------------------------------------- *
 *  Stufe 1: Honigtöpfe
 * ---------------------------------------------------------------- */

foreach (['hp_email', '_gotcha'] as $topf) {
    if (feld($d, $topf) !== '') {
        stillVerwerfen();
    }
}

/* ---------------------------------------------------------------- *
 *  Stufe 2: Zeit
 * ---------------------------------------------------------------- */

$ts  = (int) feld($d, 'ts_server');
$sig = feld($d, 'ts_sig', 200);

if ($ts > 0 && $sig !== '') {
    // Signierter Zeitstempel vom GET-Weg: fälschungssicher.
    $erwartet = signiere($ts, $k['signatur_geheimnis']);
    if (!hash_equals($erwartet, $sig)) {
        stillVerwerfen();
    }
    $alter = time() - $ts;
    // Unter 3 Sekunden ist maschinell, über zwei Stunden ist eine alte
    // Registerkarte oder ein wiederverwendeter Zeitstempel.
    if ($alter < 3 || $alter > 7200) {
        stillVerwerfen();
    }
} else {
    // Kein signierter Zeitstempel: Der Browser konnte den GET-Weg nicht
    // erreichen. Dann gilt der unsignierte Wert aus dem Formular — er ist
    // fälschbar, also nur eine schwache Schranke.
    //
    // Fehlt auch der, wird verworfen. Vorher war die Prüfung an
    // `$start > 0` geknüpft und damit wirkungslos für genau den Fall, der
    // sie am nötigsten hat: ein Skript, das stumpf POSTet und keines der
    // Zeitfelder mitschickt, kam ungebremst durch. Ein echter Browser
    // setzt `form_started` beim Laden — wer es weglässt, ist keiner.
    $start = (int) feld($d, 'form_started');
    if ($start <= 0) {
        // Ohne JavaScript gibt es weder einen signierten Zeitstempel noch
        // `form_started` — beide setzt erst ein Skript. Ein klassisches
        // Formular deshalb zu verwerfen hieße, es für genau die Besucher
        // abzuschalten, für die es ohne JavaScript gebaut wurde.
        //
        // Für sie tragen die übrigen Stufen: zwei Honigtöpfe, die
        // Inhaltsheuristik und die Sperre pro Stunde. Das ist schwächer
        // als mit Zeitprüfung, und das soll hier auch so dastehen. Eine
        // JSON-Anfrage kommt dagegen immer von client.js, und das setzt
        // die Felder — dort bleibt es beim Verwerfen.
        if ($istJson) {
            stillVerwerfen();
        }
        $start = 0;
    }
    if ($start > 0 && (int) (microtime(true) * 1000) - $start < 3000) {
        stillVerwerfen();
    }
}

/* ---------------------------------------------------------------- *
 *  Stufe 3: Bedienungsnachweis
 * ---------------------------------------------------------------- */

if (feld($d, 'interaktion') !== '1') {
    stillVerwerfen();
}

/* ---------------------------------------------------------------- *
 *  Stufe 4: Rate Limit pro IP
 *
 *  Die IP wird nicht gespeichert, nur ihr Hash — und der nur so lange,
 *  wie das Zeitfenster läuft. Berechtigtes Interesse an der Abwehr
 *  missbräuchlicher Nutzung, Art. 6 Abs. 1 lit. f DSGVO.
 * ---------------------------------------------------------------- */

$verzeichnis = $k['zaehler_verzeichnis'];
if (!is_dir($verzeichnis)) {
    @mkdir($verzeichnis, 0700, true);
}
if (is_dir($verzeichnis) && is_writable($verzeichnis)) {
    $ip    = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $datei = $verzeichnis . '/' . hash_hmac('sha256', $ip, $k['signatur_geheimnis']) . '.txt';

    // Abgelaufene Zähler wegräumen, damit nichts länger liegen bleibt als nötig.
    foreach (glob($verzeichnis . '/*.txt') ?: [] as $alt) {
        if (filemtime($alt) < time() - 3600) {
            @unlink($alt);
        }
    }

    $anzahl = 0;
    if (is_file($datei) && filemtime($datei) > time() - 3600) {
        $anzahl = (int) file_get_contents($datei);
    }
    if ($anzahl >= $k['limit_pro_stunde']) {
        antworte(429, ['ok' => false, 'fehler' => 'zu_viele']);
    }
    // Hochgezählt wird erst kurz vor dem Versand, nicht hier. Sonst
    // verbraucht jeder Tippfehler in der E-Mail-Adresse einen Versuch,
    // und wer sich dreimal vertippt, kommt gar nicht mehr durch.
    $zaehlerDatei = $datei;
    $zaehlerStand = $anzahl;
}

/* ---------------------------------------------------------------- *
 *  Stufe 5: Inhalt
 * ---------------------------------------------------------------- */

$vorname  = feld($d, 'vorname', 80);
$nachname = feld($d, 'nachname', 80);
$email    = feld($d, 'email', 200);
$nachricht = feld($d, 'message', 5000);

if ($vorname === '' || $nachname === '' || $nachricht === '') {
    antworte(422, ['ok' => false, 'fehler' => 'unvollstaendig']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    antworte(422, ['ok' => false, 'fehler' => 'email']);
}

// Punkte sammeln statt einzeln abweisen: Ein Merkmal allein ist noch kein
// Beweis, drei zusammen schon.
$punkte = 0;
$punkte += max(0, preg_match_all('~https?://~i', $nachricht) - 2);
if (preg_match('~[\x{0400}-\x{04FF}\x{4E00}-\x{9FFF}]~u', $nachricht)) {
    $punkte += 2;
}
if (preg_match('~\[url[=\]]|\[link~i', $nachricht)) {
    $punkte += 2;
}
if (mb_strtolower($nachricht) === mb_strtolower($vorname . ' ' . $nachname)) {
    $punkte += 2;
}
if ($punkte >= 3) {
    stillVerwerfen();
}

/* ---------------------------------------------------------------- *
 *  Zustellung über MailerSend
 * ---------------------------------------------------------------- */

/**
 * Aus welchem Projekt kam die Anfrage?
 *
 * Wird aus `page_url` abgeleitet: Host plus erster Pfadabschnitt, denn
 * die Vorschau-Projekte liegen als Unterverzeichnisse nebeneinander
 * (`vorschau.dk-dk.de/agora/…`). Das Formular muss dafür nichts
 * mitschicken, und ein neues Projekt taucht von selbst richtig auf.
 */
function projektName(string $url): string
{
    $teile = parse_url($url);
    $host = $teile['host'] ?? '';
    if ($host === '') {
        return '';
    }
    $pfad = trim($teile['path'] ?? '', '/');
    $erster = $pfad === '' ? '' : explode('/', $pfad)[0];
    // Auf einer Projektwurzel ist der erste Abschnitt schon die Seite
    // selbst („index.html"); dann sagt der Host genug.
    if ($erster === '' || str_contains($erster, '.')) {
        return $host;
    }
    return $host . '/' . $erster;
}

$projekt = projektName(feld($d, 'page_url', 400));

/**
 * Felder, die zur Technik gehören und in keiner Mail etwas zu suchen
 * haben — Honigtöpfe, Zeitstempel, Weiterleitungsziele — sowie die, die
 * weiter oben schon eine eigene Zeile bekommen.
 */
const INTERN = [
    'hp_email', '_gotcha', 'ts_server', 'ts_sig', 'form_started',
    'interaktion', 'weiter', 'weiter_fehler',
    'vorname', 'nachname', 'name', 'email', 'message',
    'page', 'page_url', 'interesse[]', 'anliegen_text', 'firma', 'website_url',
];

/** Aus `website_url` wird »Website Url«: lesbar, ohne Wörterbuch. */
function bezeichnung(string $name): string
{
    $text = str_replace(['_', '-', '[]'], [' ', ' ', ''], $name);
    $text = trim(preg_replace('~(?<!^)[A-Z]~u', ' $0', $text) ?? $text);
    return mb_convert_case($text, MB_CASE_TITLE, 'UTF-8');
}

$zeilen = [
    'Projekt'     => $projekt,
    'Seite'       => feld($d, 'page', 120),
    'Adresse'     => feld($d, 'page_url', 400),
    'Anliegen'    => feld($d, 'interesse[]', 400),
    'Freitext'    => feld($d, 'anliegen_text', 1000),
    'Firma'       => feld($d, 'firma', 120),
    'Website'     => feld($d, 'website_url', 300),
];

// Alles Weitere, was das Formular mitgeschickt hat. Ein Projekt mit ganz
// anderen Feldern — `immobilientyp`, `baujahr`, `subjectProduct` — muss
// dafür am Endpunkt nichts eintragen; sonst wäre es wieder eine
// Einrichtung pro Projekt, und genau die soll wegfallen.
foreach ($d as $name => $wert) {
    if (in_array($name, INTERN, true) || !is_scalar($wert)) {
        continue;
    }
    $text = feld($d, $name, 1000);
    if ($text !== '') {
        $zeilen[bezeichnung($name)] = $text;
    }
}

$text = "Neue Anfrage über das Website-Formular\n\n"
      . str_pad('Name:', 10) . "{$vorname} {$nachname}\n"
      . str_pad('E-Mail:', 10) . "{$email}\n";
$breite = 10;
foreach (array_keys($zeilen) as $b) {
    $breite = max($breite, mb_strlen($b) + 2);
}
foreach ($zeilen as $bezeichnung => $wert) {
    if ($wert !== '') {
        $text .= str_pad($bezeichnung . ':', $breite) . $wert . "\n";
    }
}
$text .= "\nNachricht:\n{$nachricht}\n";

/**
 * Dateianhänge.
 *
 * Nur bei einem klassischen Formular mit `enctype="multipart/form-data"`;
 * über JSON kommen keine Dateien. Die Grenzen sind bewusst eng: Der
 * Endpunkt ist ein Kontaktformular, kein Dateiablage-Dienst, und
 * MailerSend nimmt eine Nachricht nur bis 25 MB an — base64 bläht den
 * Inhalt um etwa ein Drittel auf.
 *
 * Geprüft wird der Typ am tatsächlichen Inhalt (`finfo`), nicht am
 * mitgeschickten Content-Type: Den bestimmt der Absender, und er kann
 * ihn frei behaupten.
 */
const ANHANG_TYPEN = [
    'application/pdf' => 'pdf',
    'image/jpeg'      => 'jpg',
    'image/png'       => 'png',
    'image/webp'      => 'webp',
    'text/plain'      => 'txt',
];
const ANHANG_ANZAHL = 5;
const ANHANG_BYTES  = 8388608;   // 8 MB zusammen, roh

$anhaenge = [];
if (!$istJson && $_FILES !== []) {
    $summe = 0;
    $pruefer = class_exists('finfo') ? new finfo(FILEINFO_MIME_TYPE) : null;

    foreach ($_FILES as $eingang) {
        // Ein Feld kann mehrere Dateien tragen; PHP dreht die Struktur
        // dabei um — statt einer Liste von Dateien eine Liste je Merkmal.
        $viele = is_array($eingang['name'] ?? null);
        $anzahl = $viele ? count($eingang['name']) : 1;

        for ($i = 0; $i < $anzahl; $i++) {
            $fehler = $viele ? $eingang['error'][$i] : $eingang['error'];
            if ($fehler !== UPLOAD_ERR_OK) {
                continue;
            }
            $pfad = $viele ? $eingang['tmp_name'][$i] : $eingang['tmp_name'];
            $name = basename((string) ($viele ? $eingang['name'][$i] : $eingang['name']));
            $groesse = (int) ($viele ? $eingang['size'][$i] : $eingang['size']);

            if (!is_uploaded_file($pfad)) {
                continue;
            }
            if (count($anhaenge) >= ANHANG_ANZAHL || $summe + $groesse > ANHANG_BYTES) {
                $zeilen['Hinweis'] = 'Weitere Anhänge wurden nicht übernommen (Grenze erreicht).';
                break 2;
            }
            $typ = $pruefer ? (string) $pruefer->file($pfad) : '';
            if (!isset(ANHANG_TYPEN[$typ])) {
                $zeilen['Hinweis'] = 'Ein Anhang wurde abgelehnt (Dateityp nicht zugelassen).';
                continue;
            }
            $inhalt = file_get_contents($pfad);
            if ($inhalt === false) {
                continue;
            }
            $summe += $groesse;
            $anhaenge[] = [
                'filename'    => preg_replace('~[^\w.\- ]~u', '_', $name) ?: ('anhang.' . ANHANG_TYPEN[$typ]),
                'content'     => base64_encode($inhalt),
                'disposition' => 'attachment',
            ];
        }
    }
    if ($anhaenge !== []) {
        $zeilen['Anhänge'] = count($anhaenge) . ' Datei(en)';
    }
}

$nutzlast = [
    'from'     => ['email' => $k['von_adresse'], 'name' => $k['von_name']],
    'to'       => [['email' => $k['an_adresse'], 'name' => $k['an_name']]],
    'reply_to' => ['email' => $email, 'name' => "{$vorname} {$nachname}"],
    'subject'  => 'Anfrage: ' . ($projekt !== '' ? $projekt : 'unbekanntes Projekt')
                  . ($zeilen['Seite'] !== '' ? ' — ' . $zeilen['Seite'] : ''),
    'text'     => $text,
];
if ($anhaenge !== []) {
    $nutzlast['attachments'] = $anhaenge;
}

// Jetzt zählt der Versuch: alles ist geprüft, gleich geht die Mail raus.
if (isset($zaehlerDatei)) {
    @file_put_contents($zaehlerDatei, (string) ($zaehlerStand + 1));
}

$rumpf = json_encode($nutzlast, JSON_UNESCAPED_UNICODE);
$ziel  = $k['api_url'] ?? 'https://api.mailersend.com/v1/email';

/** Ein Anlauf gegen die API. Gibt [Statuscode, Antworttext] zurück. */
function rufe(string $ziel, string $token, string $rumpf): array
{
    $ch = curl_init($ziel);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
            'X-Requested-With: XMLHttpRequest',
        ],
        CURLOPT_POSTFIELDS => $rumpf,
    ]);
    $antwort = curl_exec($ch);
    $status  = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return [$status, is_string($antwort) ? $antwort : ''];
}

$status  = 0;
$antwort = '';
try {
foreach ($schluessel as $nr => $token) {
    [$status, $antwort] = rufe($ziel, $token, $rumpf);

    // MailerSend begrenzt die Anfragen pro Minute. Zwei Absendungen kurz
    // hintereinander — etwa ein Test und eine echte Anfrage — reichen auf
    // einem Testkonto schon aus, und der zweite bekam bisher einen
    // Fehler, obwohl mit ihm alles in Ordnung war. Einmal kurz warten und
    // nachfassen löst das.
    //
    // Nur bei 429 wird nachgefasst, nicht bei 5xx: Ein 429 heißt
    // eindeutig »nicht angenommen«, ein Serverfehler dagegen kann die
    // Mail bereits ausgelöst haben. Dort wäre ein zweiter Versuch das
    // Risiko einer doppelten Zustellung.
    if ($status === 429) {
        usleep(2000000);
        [$status, $antwort] = rufe($ziel, $token, $rumpf);
    }

    // Nur bei abgelehntem Schlüssel weiterprobieren. Bei jedem anderen
    // Fehler hilft ein zweiter Versuch nicht und könnte die Mail doppeln.
    if ($status !== 401 && $status !== 403) {
        if ($nr > 0) {
            error_log('Formular: _intern/mailersend.key wurde abgelehnt, '
                    . 'der Schlüssel aus der Konfiguration hat funktioniert.');
        }
        break;
    }
}
} catch (Throwable $e) {
    protokolliere($verzeichnis, 'AUSNAHME ' . get_class($e) . ' — ' . $e->getMessage()
        . ' in ' . basename($e->getFile()) . ':' . $e->getLine());
    if (isset($zaehlerDatei)) {
        @file_put_contents($zaehlerDatei, (string) $zaehlerStand);
    }
    antworte(502, ['ok' => false, 'fehler' => 'versand']);
}

// MailerSend antwortet mit 202 Accepted.
if ($status < 200 || $status >= 300) {
    $meldung = 'MailerSend HTTP ' . $status . ' nach ' . count($schluessel)
             . ' Schluessel — '
             . mb_substr(is_string($antwort) ? $antwort : '(keine Antwort)', 0, 600);
    error_log($meldung);
    protokolliere($verzeichnis, $meldung);

    // Der Versuch wurde vor dem Absenden hochgezählt. Lag der Fehler
    // nicht am Absender, sondern an der Gegenstelle, darf er ihn nichts
    // kosten — sonst sperrt ihn ausgerechnet unser eigener Ausfall aus.
    // Genau das ist passiert: Nach drei fehlgeschlagenen Versänden war
    // das Stundenkontingent aufgebraucht, ohne dass je eine Mail
    // rausging. Bei 4xx bleibt die Zählung stehen; dort liegt es an der
    // Anfrage selbst, und dann soll sie auch begrenzt sein.
    if (isset($zaehlerDatei) && ($status === 429 || $status >= 500 || $status === 0)) {
        @file_put_contents($zaehlerDatei, (string) $zaehlerStand);
    }

    antworte(502, ['ok' => false, 'fehler' => 'versand']);
}

antworte(200, ['ok' => true]);
