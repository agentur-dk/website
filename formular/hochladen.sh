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
# Der Server hält ein gültiges, von Certum ausgestelltes Zertifikat —
# allerdings auf *.test-my-website.de statt auf w4.goneo.de. Die
# Namensprüfung schlägt deshalb fehl. Statt sie einfach abzuschalten,
# wird der öffentliche Schlüssel angeheftet: Die Gegenstelle muss genau
# diesen Schlüssel vorweisen, sonst bricht die Verbindung ab. Das ersetzt
# die Namensprüfung durch eine stärkere Bindung.
#
# ÜBER-BANDE-UPLOAD: Wird direkt über die Zieldatei geschrieben, bleibt
# nach einem Abbruch ein Torso stehen; genau so wurde send.php einmal auf
# 0 Bytes gekürzt und der Endpunkt war tot. Deshalb: erst unter einem
# Zwischennamen ablegen, die Größe gegenprüfen, dann umbenennen. Das
# Umbenennen ist die einzige Operation, die die Live-Datei berührt, und
# sie ist unteilbar.
#
# DIE GRÖSSENGRENZE DES SERVERS: goneos FTPS kappt jede Übertragung, die
# etwa 14 700 Bytes überschreitet. Gemessen durch Einschachtelung mit
# Zufallsdateien: 14 716 Bytes laufen durch, 14 835 brechen mit »426
# Transfer aborted« ab, nachdem curl alles gesendet hat. Es liegt weder
# an der Dateiendung noch am Inhalt — eine .txt-Datei mit Zufallsdaten
# scheitert bei derselben Größe wie send.php, und derselbe Inhalt auf
# 12 kB gekürzt läuft durch. Ein Puffer- oder Zeitlimit auf der
# Serverseite, von hier aus nicht zu beheben.
#
# Deshalb wird alles über 12 kB in Stücke von 8 kB zerlegt: das erste
# mit STOR, die folgenden mit APPE angehängt. Die Größe wird danach
# gegengeprüft. Die Verschlüsselung bleibt dabei auf beiden Kanälen
# vollständig erhalten — ein Rückfall auf einen offenen Datenkanal ist
# nicht nötig und findet nicht statt.
#
set -euo pipefail

HOST="w4.goneo.de"
PIN="sha256//BfcvgHz8B+FKx5PxEOz3n33TpWMjBxKt5eD1qtMbRvM="
FERN_SKRIPT="formular"          # Zielordner für send.php, client.js, .htaccess
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

fern_groesse() {  # $1 = voller Pfad; gibt Bytes aus, leer wenn nicht da
  ftp -sI "ftp://$HOST/$1" 2>/dev/null \
    | awk 'tolower($1) ~ /^content-length:/ {gsub(/\r/,"",$2); print $2}'
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

STUECK=8000      # Blockgröße, mit Abstand unter der Servergrenze
EINZELN=12000    # bis hierher in einem Zug

# Legt die Datei unter dem Zwischennamen ab — in einem Zug oder in Stücken.
hinlegen() {
  local quelle="$1" ziel="$2" gesamt="$3"
  local i=0 block

  if [ "$gesamt" -le "$EINZELN" ]; then
    ftp -sS --ftp-create-dirs -T "$quelle" "$ziel" -o /dev/null 2>/dev/null
    return
  fi

  block=$(mktemp)
  while :; do
    dd if="$quelle" of="$block" bs="$STUECK" skip="$i" count=1 2>/dev/null
    [ -s "$block" ] || break
    if [ "$i" -eq 0 ]; then
      ftp -sS --ftp-create-dirs -T "$block" "$ziel" -o /dev/null 2>/dev/null || { rm -f "$block"; return 1; }
    else
      ftp -sS --append -T "$block" "$ziel" -o /dev/null 2>/dev/null || { rm -f "$block"; return 1; }
    fi
    i=$((i + 1))
  done
  rm -f "$block"
  [ "$i" -gt 0 ]
}

# Lädt eine Datei geprüft hoch. $1 = lokale Datei, $2 = Zielordner,
# $3 = Zielname. Rückgabe 0 nur, wenn die Datei danach vollständig und
# in der richtigen Größe liegt. Die Live-Datei wird erst im letzten
# Schritt berührt, durch ein unteilbares Umbenennen.
uebertragen() {
  local quelle="$1" ordner="$2" ziel="$3"
  local soll ist versuch
  local zwischen="ftp://$HOST/$ordner/$ziel.teil"
  soll=$(wc -c < "$quelle" | tr -d ' ')

  for versuch in 1 2 3; do
    ftp -s -o /dev/null -Q "-DELE /$ordner/$ziel.teil" "ftp://$HOST/$ordner/" 2>/dev/null || true

    if hinlegen "$quelle" "$zwischen" "$soll"; then
      ist=$(fern_groesse "$ordner/$ziel.teil")
      if [ "$ist" = "$soll" ]; then
        if ftp -s -o /dev/null \
             -Q "-RNFR /$ordner/$ziel.teil" -Q "-RNTO /$ordner/$ziel" \
             "ftp://$HOST/$ordner/" 2>/dev/null; then
          printf 'ok (%s Bytes)\n' "$soll"
          return 0
        fi
        echo "Umbenennen fehlgeschlagen" >&2
        return 1
      fi
      printf 'Versuch %d: %s statt %s Bytes … ' "$versuch" "${ist:-0}" "$soll"
    else
      printf 'Versuch %d abgebrochen … ' "$versuch"
    fi
  done

  echo "fehlgeschlagen"
  ftp -s -o /dev/null -Q "-DELE /$ordner/$ziel.teil" "ftp://$HOST/$ordner/" 2>/dev/null || true
  return 1
}

echo "Lade hoch nach $HOST …"
fehler=0
for datei in send.php client.js .htaccess; do
  [ -f "$hier/$datei" ] || { echo "  $datei fehlt lokal — übersprungen" >&2; fehler=1; continue; }
  printf '  %-16s → /%s/  ' "$datei" "$FERN_SKRIPT"
  uebertragen "$hier/$datei" "$FERN_SKRIPT" "$datei" || fehler=1
done

if [ -f "$hier/config.php" ]; then
  printf '  %-16s → /%s/  ' "config.php" "$FERN_KONFIG"
  uebertragen "$hier/config.php" "$FERN_KONFIG" "formular-config.php" || fehler=1
else
  echo "  config.php fehlt — erst 'bash formular/einrichten.sh' ausführen." >&2
fi

echo
if [ "$fehler" -ne 0 ]; then
  echo "Nicht alles ist durchgelaufen. Die Live-Dateien sind unverändert" >&2
  echo "geblieben — einfach noch einmal starten." >&2
  exit 1
fi
echo "Fertig. Jetzt prüfen:"
echo "  bash formular/pruefen.sh https://vorschau.dk-dk.de/formular/send.php"
