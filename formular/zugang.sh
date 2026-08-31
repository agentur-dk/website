#!/usr/bin/env bash
#
# Legt den FTP-Zugang in ~/.netrc ab.
#
#   bash formular/zugang.sh
#
# Das Passwort wird verdeckt eingegeben: Es erscheint nicht auf dem
# Bildschirm, nicht in der Shell-History und in keiner Ausgabe. Eine
# bereits vorhandene ~/.netrc mit anderen Einträgen bleibt erhalten —
# nur der Eintrag für diesen Rechner wird ersetzt.
#
set -euo pipefail

HOST="w4.goneo.de"
NETRC="$HOME/.netrc"

echo
echo "FTP-Zugang für $HOST"
echo "  Die Zugangsdaten stehen im goneo-Kundenbereich unter FTP-Zugänge."
echo

read -r -p "  Benutzername: " benutzer
if [ -z "$benutzer" ]; then echo "Abgebrochen." >&2; exit 1; fi

read -r -s -p "  Passwort (bleibt unsichtbar): " passwort
echo
if [ -z "$passwort" ]; then echo "Abgebrochen." >&2; exit 1; fi

umask 077

# Vorhandene Einträge für andere Rechner behalten, den eigenen ersetzen.
rest=""
if [ -f "$NETRC" ]; then
  rest=$(awk -v h="$HOST" '
    /^[[:space:]]*machine[[:space:]]/ { drin = ($2 == h) }
    !drin { print }
  ' "$NETRC")
  cp "$NETRC" "$NETRC.vorher"
  echo
  echo "  Vorhandene ~/.netrc gesichert als ~/.netrc.vorher"
fi

{
  [ -n "$rest" ] && printf '%s\n' "$rest"
  printf 'machine %s\n  login %s\n  password %s\n' "$HOST" "$benutzer" "$passwort"
} > "$NETRC"
chmod 600 "$NETRC"
unset passwort

echo "  Geschrieben: $NETRC (Rechte 600)"
echo
echo "Verbindung wird geprüft …"
if curl -s --netrc --ssl-reqd --insecure \
        --pinnedpubkey "sha256//BfcvgHz8B+FKx5PxEOz3n33TpWMjBxKt5eD1qtMbRvM=" \
        --connect-timeout 15 --max-time 45 -o /dev/null "ftp://$HOST/"; then
  echo "  ✓ Anmeldung erfolgreich, Verzeichnis lesbar."
  echo
  echo "Weiter mit:"
  echo "  bash formular/hochladen.sh liste     nur ansehen"
  echo "  bash formular/hochladen.sh           hochladen"
else
  code=$?
  echo "  ✗ Verbindung fehlgeschlagen (curl-Ende $code)." >&2
  case "$code" in
    67) echo "     67 = Anmeldung abgelehnt. Benutzername oder Passwort stimmen nicht." >&2 ;;
    60) echo "     60 = Zertifikat unerwartet. Der Server hat einen anderen Schlüssel als erwartet." >&2 ;;
    28) echo "     28 = Zeitüberschreitung. Erreicht dein Netz Port 21?" >&2 ;;
    *)  echo "     Siehe: https://curl.se/libcurl/c/libcurl-errors.html" >&2 ;;
  esac
  exit 1
fi
