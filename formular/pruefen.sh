#!/usr/bin/env bash
#
# Prüft einen aufgesetzten Endpunkt von außen.
#
#   bash formular/pruefen.sh https://vorschau.dk-dk.de/formular/send.php
#   bash formular/pruefen.sh <adresse> [herkunft] [--versand]
#
# Ohne --versand geht keine Mail raus. Mit --versand wird die
# Zeitschranke abgewartet und wirklich zugestellt — das ist der einzige
# Test, der über den Versand etwas aussagt.
#
# Der Token wird nie ausgegeben.
#
set -uo pipefail

# Schalter dürfen an jeder Stelle stehen. Vorher wurde `--versand` als
# zweites Argument gelesen — dort steht aber die Herkunft, und der
# Endpunkt wies dann folgerichtig alles mit 403 ab.
endpunkt=""
herkunft=""
versand=0
for arg in "$@"; do
  case "$arg" in
    --versand) versand=1 ;;
    -*)        echo "Unbekannter Schalter: $arg" >&2; exit 1 ;;
    *)         if [ -z "$endpunkt" ]; then endpunkt="$arg"; else herkunft="$arg"; fi ;;
  esac
done
herkunft="${herkunft:-https://dk-dk.de}"

if [ -z "$endpunkt" ]; then
  echo "Aufruf: bash formular/pruefen.sh <adresse> [herkunft] [--versand]" >&2
  exit 1
fi

gut=0; schlecht=0
pruefe() {  # $1 = Text, $2 = erwartet, $3 = tatsächlich
  if [ "$2" = "$3" ]; then
    printf '  \033[32m✓\033[0m %-42s %s\n' "$1" "$3"; gut=$((gut+1))
  else
    printf '  \033[31m✗\033[0m %-42s %s (erwartet %s)\n' "$1" "$3" "$2"; schlecht=$((schlecht+1))
  fi
}

status() { curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$@"; }

echo
echo "Endpunkt: $endpunkt"
echo "Herkunft: $herkunft"
echo

pruefe 'ohne Origin abgewiesen'      403 "$(status "$endpunkt?challenge=1")"
pruefe 'fremde Origin abgewiesen'    403 "$(status -H 'Origin: https://boese.example' "$endpunkt?challenge=1")"
pruefe 'Vorabanfrage beantwortet'    204 "$(status -X OPTIONS -H "Origin: $herkunft" "$endpunkt")"
pruefe 'Zeitstempel wird ausgegeben' 200 "$(status -H "Origin: $herkunft" "$endpunkt?challenge=1")"
pruefe 'GET ohne challenge abgelehnt' 400 "$(status -H "Origin: $herkunft" "$endpunkt")"

antwort=$(curl -s --max-time 15 -H "Origin: $herkunft" "$endpunkt?challenge=1")
if printf '%s' "$antwort" | grep -q '"sig"'; then
  printf '  \033[32m✓\033[0m %-42s Signatur vorhanden\n' 'Antwort enthält ts und sig'; gut=$((gut+1))
else
  printf '  \033[31m✗\033[0m %-42s %s\n' 'Antwort enthält ts und sig' "$antwort"; schlecht=$((schlecht+1))
fi

# Der POST-Weg mit gefülltem Honigtopf endet im gespielten Erfolg, bevor
# irgendetwas versendet wird — er zeigt, dass der Weg steht, löst aber
# keine Mail aus.
#
# Er sagt allerdings NICHTS über den Versand. Das hieß hier lange „POST
# wird angenommen: 200" und klang nach einer funktionierenden Kette,
# während in Wahrheit gar nichts gesendet wurde: Der Endpunkt verwirft
# still, wenn zwischen dem Abholen des Zeitstempels und dem Absenden
# weniger als drei Sekunden liegen — und ein Prüfskript ist immer
# schneller als das. Deshalb heißt die Zeile jetzt, was sie prüft.
sofort=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
  -H "Origin: $herkunft" -H 'Content-Type: application/json' \
  -d '{"hp_email":"pruefung@beispiel.invalid","vorname":"Test","nachname":"Lauf","email":"test@beispiel.de","message":"Pruefung des Endpunkts, keine echte Anfrage.","interaktion":"1"}' \
  "$endpunkt")
pruefe 'Honigtopf endet im Scheinerfolg' 200 "$sofort"

# Konfigurationsdatei darf nicht abrufbar sein. Das leistet die .htaccess
# und damit Apache — der eingebaute PHP-Server kennt sie nicht, dort
# schlägt diese Zeile also erwartbar fehl.
# Der einzige Test, der den Versand wirklich prüft — und der eine echte
# Mail auslöst. Deshalb nur auf ausdrücklichen Wunsch. Die Wartezeit ist
# nicht Bequemlichkeit, sondern Bedingung: Ohne sie greift die
# Drei-Sekunden-Schranke und die Anfrage wird still verworfen.
if [ "$versand" = "1" ]; then
  echo
  echo "Echter Versandtest — das löst eine Mail aus."
  paar=$(curl -s --max-time 15 -H "Origin: $herkunft" "$endpunkt?challenge=1")
  ts=$(printf '%s' "$paar" | sed -n 's/.*"ts":\([0-9]*\).*/\1/p')
  sig=$(printf '%s' "$paar" | sed -n 's/.*"sig":"\([^"]*\)".*/\1/p')
  echo "  warte vier Sekunden, sonst greift die Zeitschranke …"
  perl -e 'select undef, undef, undef, 4'
  start=$(( ($(date +%s) - 40) * 1000 ))
  echt=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 \
    -H "Origin: $herkunft" -H 'Content-Type: application/json' \
    -d "{\"vorname\":\"Pruef\",\"nachname\":\"Lauf\",\"email\":\"pruefung@beispiel.de\",\"message\":\"Versandtest des Endpunkts.\",\"interaktion\":\"1\",\"form_started\":\"$start\",\"ts_server\":\"$ts\",\"ts_sig\":\"$sig\",\"hp_email\":\"\",\"_gotcha\":\"\"}" \
    "$endpunkt")
  case "$echt" in
    200) printf '  \033[32m✓\033[0m %-42s %s\n' 'Mail wurde zugestellt' "$echt" ;;
    502) printf '  \033[31m✗\033[0m %-42s %s\n' 'MailerSend lehnt ab — siehe fehler.log' "$echt" ;;
    429) printf '  \033[33m!\033[0m %-42s %s\n' 'Stundenkontingent erreicht' "$echt" ;;
    *)   printf '  \033[31m✗\033[0m %-42s %s\n' 'Unerwartete Antwort' "$echt" ;;
  esac
fi

basis="${endpunkt%/*}"
konfig=$(status "$basis/config.php")
if [ "$konfig" = "403" ] || [ "$konfig" = "404" ]; then
  printf '  \033[32m✓\033[0m %-42s %s\n' 'config.php nicht abrufbar' "$konfig"; gut=$((gut+1))
else
  printf '  \033[31m✗\033[0m %-42s %s (403 oder 404 erwartet)\n' 'config.php nicht abrufbar' "$konfig"; schlecht=$((schlecht+1))
  echo '      → liegt die .htaccess neben send.php? Der eingebaute'
  echo '        PHP-Server kennt sie nicht, Apache schon.'
fi

echo
if [ "$schlecht" -eq 0 ]; then
  printf '\033[32m%d von %d in Ordnung.\033[0m\n' "$gut" "$((gut+schlecht))"
  echo 'Der Endpunkt steht. Jetzt einmal das Formular auf der Website ausfüllen.'
else
  printf '\033[31m%d Befund(e).\033[0m\n' "$schlecht"
  echo 'Bei 403 auf allem: Herkunft in config.php prüfen.'
  echo 'Bei 500: config.php fehlt oder ist fehlerhaft.'
  echo 'Bei 404: Pfad oder Unterdomain stimmen nicht.'
  exit 1
fi
