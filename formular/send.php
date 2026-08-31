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
$schluessel = array_values(array_unique(array_filter([
    $ausDatei('mailersend.key'),
    $k['mailersend_token'] ?? '',
])));

if ($schluessel === [] || $k['von_adresse'] === '') {
    http_response_code(500);
    exit('Kein Zugang zur Versand-API.');
}

/* ---------------------------------------------------------------- *
 *  Herkunft und Vorabanfrage
 * ---------------------------------------------------------------- */

$herkunft = $_SERVER['HTTP_ORIGIN'] ?? '';
$erlaubt  = in_array($herkunft, $k['erlaubte_herkunft'], true);

if ($erlaubt) {
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

/** Antwort und Ende. */
function antworte(int $code, array $daten): void
{
    http_response_code($code);
    echo json_encode($daten);
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

$roh = file_get_contents('php://input');
if ($roh === false || strlen($roh) > 20000) {
    antworte(413, ['ok' => false]);
}
$d = json_decode($roh, true);
if (!is_array($d)) {
    antworte(400, ['ok' => false]);
}

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
        stillVerwerfen();
    }
    if ((int) (microtime(true) * 1000) - $start < 3000) {
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

$zeilen = [
    'Projekt'     => $projekt,
    'Seite'       => feld($d, 'page', 120),
    'Adresse'     => feld($d, 'page_url', 400),
    'Anliegen'    => feld($d, 'interesse[]', 400),
    'Freitext'    => feld($d, 'anliegen_text', 1000),
    'Firma'       => feld($d, 'firma', 120),
    'Website'     => feld($d, 'website_url', 300),
];

$text = "Neue Anfrage über das Website-Formular\n\n"
      . str_pad('Name:', 10) . "{$vorname} {$nachname}\n"
      . str_pad('E-Mail:', 10) . "{$email}\n";
foreach ($zeilen as $bezeichnung => $wert) {
    if ($wert !== '') {
        $text .= str_pad($bezeichnung . ':', 10) . $wert . "\n";
    }
}
$text .= "\nNachricht:\n{$nachricht}\n";

$nutzlast = [
    'from'     => ['email' => $k['von_adresse'], 'name' => $k['von_name']],
    'to'       => [['email' => $k['an_adresse'], 'name' => $k['an_name']]],
    'reply_to' => ['email' => $email, 'name' => "{$vorname} {$nachname}"],
    'subject'  => 'Anfrage: ' . ($projekt !== '' ? $projekt : 'unbekanntes Projekt')
                  . ($zeilen['Seite'] !== '' ? ' — ' . $zeilen['Seite'] : ''),
    'text'     => $text,
];

// Jetzt zählt der Versuch: alles ist geprüft, gleich geht die Mail raus.
if (isset($zaehlerDatei)) {
    @file_put_contents($zaehlerDatei, (string) ($zaehlerStand + 1));
}

$rumpf = json_encode($nutzlast, JSON_UNESCAPED_UNICODE);
$ziel  = $k['api_url'] ?? 'https://api.mailersend.com/v1/email';

$status  = 0;
$antwort = '';
foreach ($schluessel as $nr => $token) {
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

// MailerSend antwortet mit 202 Accepted.
if ($status < 200 || $status >= 300) {
    error_log('MailerSend ' . $status . ': ' . (is_string($antwort) ? $antwort : ''));
    antworte(502, ['ok' => false, 'fehler' => 'versand']);
}

antworte(200, ['ok' => true]);
