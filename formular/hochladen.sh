#!/usr/bin/env bash
#
# Lädt den Endpunkt auf den goneo-Webspace.
#
#   bash formular/hochladen.sh liste     nur ansehen, nichts ändern
#   bash formular/hochladen.sh           hochladen
#
# ZUGANGSDATEN: stehen in ~/.netrc und werden von curl direkt von dort
# gelesen. Sie erscheinen nie auf der Kommandozeile, nie in der
# Shell-History, nie in einer Ausgabe. Anzulegen als:
#
#   machine w4.goneo.de
#     login DEIN-FTP-BENUTZER
#     password DEIN-FTP-PASSWORT
#
#   chmod 600 ~/.netrc
#
# VERBINDUNG: FTPS (explizit, AUTH SSL), erzwungen mit --ssl-reqd.
# Nicht --ftp-ssl: Das macht Verschlüsselung nur *optional* — lehnt der
# Server sie ab, überträgt curl klaglos im Klartext, samt Passwort. curl
# warnt davor, und die Warnung war berechtigt.
#
# Der Server hält ein gültiges,
# von Certum ausgestelltes Zertifikat — allerdings auf
# *.test-my-website.de statt auf w4.goneo.de. Die Namensprüfung schlägt
# deshalb fehl. Statt sie einfach abzuschalten, wird der öffentliche
# Schlüssel angeheftet: Die Gegenstelle muss genau diesen Schlüssel
# vorweisen, sonst bricht die Verbindung ab. Das ersetzt die
# Namensprüfung durch eine stärkere Bindung.
#
set -euo pipefail

HOST="w4.goneo.de"
PIN="sha256//BfcvgHz8B+FKx5PxEOz3n33TpWMjBxKt5eD1qtMbRvM="
FERN_SKRIPT="formular"          # Zielordner für send.php und .htaccess
FERN_KONFIG="_intern"           # Zielordner für die Konfiguration

hier="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$HOME/.netrc" ]; then
  cat >&2 <<'HINWEIS'
Keine ~/.netrc gefunden.

Anlegen mit:

  bash formular/zugang.sh

Das Skript fragt Benutzer und Passwort ab (Passwort verdeckt), legt die
Datei mit Rechten 600 an und prüft die Verbindung gleich mit.
HINWEIS
  exit 1
fi

rechte=$(stat -f '%Lp' "$HOME/.netrc" 2>/dev/null || stat -c '%a' "$HOME/.netrc")
if [ "$rechte" != "600" ]; then
  echo "Warnung: ~/.netrc hat Rechte $rechte — besser 600." >&2
fi

ftp() {  # curl mit den immer gleichen Sicherheitsoptionen
  curl --netrc --ssl-reqd --insecure --pinnedpubkey "$PIN" \
       --connect-timeout 15 --max-time 120 "$@"
}

if [ "${1:-}" = "liste" ]; then
  echo "Wurzelverzeichnis:"
  ftp -s "ftp://$HOST/" | sed 's/^/  /'
  for ordner in "$FERN_SKRIPT" "$FERN_KONFIG"; do
    echo
    echo "$ordner/:"
    ftp -s "ftp://$HOST/$ordner/" 2>/dev/null | sed 's/^/  /' || echo "  (nicht vorhanden oder nicht lesbar)"
  done
  exit 0
fi

echo "Lade hoch nach $HOST …"
for datei in send.php .htaccess; do
  printf '  %-16s → /%s/\n' "$datei" "$FERN_SKRIPT"
  ftp -sS --ftp-create-dirs -T "$hier/$datei" "ftp://$HOST/$FERN_SKRIPT/"
done

if [ -f "$hier/config.php" ]; then
  printf '  %-16s → /%s/formular-config.php\n' "config.php" "$FERN_KONFIG"
  ftp -sS --ftp-create-dirs -T "$hier/config.php" "ftp://$HOST/$FERN_KONFIG/formular-config.php"
else
  echo "  config.php fehlt — erst 'bash formular/einrichten.sh' ausführen." >&2
fi

echo
echo "Fertig. Jetzt prüfen:"
echo "  bash formular/pruefen.sh https://vorschau.dk-dk.de/formular/send.php"
