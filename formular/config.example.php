<?php
/**
 * Vorlage für formular/config.php.
 *
 * ANLEITUNG
 *   1. Diese Datei auf dem Server nach `config.php` kopieren.
 *   2. Werte eintragen.
 *   3. `config.php` NICHT ins Repository geben — sie steht in .gitignore.
 *
 * Der MailerSend-Schlüssel gehört ausschließlich hierher. Läge er im
 * JavaScript der Website, könnte ihn jeder aus dem Quelltext lesen und
 * über euren Account E-Mails mit eurer Absenderdomain verschicken.
 */

return [
    // MailerSend → Integrations → API tokens. Recht „Email send" genügt.
    'mailersend_token' => 'PLATZHALTER_HIER_EINTRAGEN',

    // Absender. Muss zur verifizierten Sendedomain gehören.
    // Testdomain-Beispiel: formular@test-69oxl5e5802l785k.mlsender.net
    'von_adresse' => 'formular@test-69oxl5e5802l785k.mlsender.net',
    'von_name'    => 'Website-Formular',

    // Empfänger der Anfragen.
    // Achtung bei der Testdomain: MailerSend erlaubt dort in der Regel nur
    // die Adresse des Kontoinhabers als Empfänger. Vor dem Livegang die
    // eigene Domain verifizieren, dann fällt die Einschränkung weg.
    'an_adresse' => 'd.kontelis@dk-dk.de',
    'an_name'    => 'agentur dk',

    // Von welchen Adressen darf gesendet werden? Alles andere wird
    // abgewiesen. Ein neues Vorschau-Projekt braucht hier nur einen
    // Eintrag — keinen eigenen Token, keinen eigenen Endpunkt.
    'erlaubte_herkunft' => [
        'https://dk-dk.de',
        'https://www.dk-dk.de',
        'https://agentur-dk.github.io',   // Vorschau der neuen Seite
        'https://vorschau.dk-dk.de',      // alle Projekte dort
    ],

    // Geheimnis für die Signatur des Zeitstempels. Einmal erzeugen mit:
    //   php -r "echo bin2hex(random_bytes(32));"
    'signatur_geheimnis' => 'PLATZHALTER_HIER_EINTRAGEN',

    // Wie viele Anfragen pro IP und Stunde durchgehen.
    'limit_pro_stunde' => 5,

    // Nur für Tests umstellen: Adresse der Versand-API.
    'api_url' => 'https://api.mailersend.com/v1/email',

    // Verzeichnis für die Zähler des Rate Limits. Muss beschreibbar sein
    // und sollte außerhalb des öffentlichen Bereichs liegen.
    'zaehler_verzeichnis' => __DIR__ . '/.zaehler',
];
