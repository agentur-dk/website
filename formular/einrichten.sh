#!/usr/bin/env bash
#
# Erzeugt formular/config.php.
#
# Der MailerSend-Token wird verdeckt eingegeben: Er erscheint nicht auf
# dem Bildschirm, nicht in der Shell-History und nicht in einem Log. Die
# fertige Datei steht in der .gitignore und darf dort auch bleiben.
#
#   bash formular/einrichten.sh
#
set -euo pipefail

verzeichnis="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ziel="$verzeichnis/config.php"

if [ -e "$ziel" ]; then
  printf 'Es gibt bereits %s.\n' "$ziel"
  read -r -p 'Überschreiben? [j/N] ' antwort
  [ "${antwort,,}" = "j" ] || { echo 'Abgebrochen.'; exit 0; }
fi

frage() {  # $1 = Text, $2 = Vorgabe
  local eingabe
  read -r -p "$1 [$2]: " eingabe
  printf '%s' "${eingabe:-$2}"
}

echo
echo 'MailerSend-Token'
echo '  MailerSend → Integrations → API tokens → Token erzeugen.'
echo '  Das Recht „Email send" genügt.'
echo '  Die Eingabe bleibt unsichtbar.'
read -r -s -p '  Token: ' token
echo
if [ -z "$token" ]; then
  echo 'Kein Token eingegeben — abgebrochen.' >&2
  exit 1
fi

echo
von=$(frage 'Absenderadresse (muss zur Sendedomain gehören)' 'formular@test-69oxl5e5802l785k.mlsender.net')
an=$(frage  'Empfängeradresse' 'd.kontelis@dk-dk.de')
limit=$(frage 'Anfragen pro IP und Stunde' '5')

# Geheimnis für die Zeitstempel-Signatur. Wird hier erzeugt und nirgends
# angezeigt — es muss niemand kennen, auch du nicht.
if command -v php >/dev/null 2>&1; then
  geheimnis=$(php -r 'echo bin2hex(random_bytes(32));')
elif command -v openssl >/dev/null 2>&1; then
  geheimnis=$(openssl rand -hex 32)
else
  echo 'Weder php noch openssl gefunden — Geheimnis kann nicht erzeugt werden.' >&2
  exit 1
fi

umask 077
cat > "$ziel" <<EOF
<?php
// Erzeugt von formular/einrichten.sh. Gehört nicht ins Repository.
return [
    'mailersend_token'    => '$token',
    'von_adresse'         => '$von',
    'von_name'            => 'Website-Formular',
    'an_adresse'          => '$an',
    'an_name'             => 'agentur dk',
    'erlaubte_herkunft'   => [
        'https://dk-dk.de',
        'https://www.dk-dk.de',
        'https://agentur-dk.github.io',   // Vorschau der neuen Seite
        'https://vorschau.dk-dk.de',      // alle Projekte dort
    ],
    'signatur_geheimnis'  => '$geheimnis',
    'limit_pro_stunde'    => $limit,
    'api_url'             => 'https://api.mailersend.com/v1/email',
    'zaehler_verzeichnis' => __DIR__ . '/.zaehler',
];
EOF
chmod 600 "$ziel"

echo
echo "Geschrieben: $ziel (nur für dich lesbar)"
echo
echo 'Nächste Schritte:'
echo '  1. send.php, .htaccess und config.php hochladen nach'
echo '     vorschau.dk-dk.de/formular/'
echo '  2. Prüfen mit:'
echo '     bash formular/pruefen.sh https://vorschau.dk-dk.de/formular/send.php'
echo
git -C "$verzeichnis/.." check-ignore -q "$ziel" \
  && echo 'Gegenprobe: config.php wird von git ignoriert.' \
  || echo 'ACHTUNG: config.php wird NICHT ignoriert — .gitignore prüfen!' >&2
