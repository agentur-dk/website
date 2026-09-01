# SimpleCMP — selbst gebaut

Es gibt kein npm-Paket und keine fertigen Bundles an den Releases; die
Doku nennt zwar `pnpm add simplecmp`, aber das Paket existiert nicht
(geprüft 01.09.2026: registry.npmjs.org und beide jsdelivr-Adressen
antworten mit 404). Diese Dateien sind deshalb aus der Quelle gebaut.

    Quelle    https://github.com/SimpleCMP/simplecmp
    Fassung   v0.4.1 (Commit-Stand 16.06.2026)
    Gebaut    01.09.2026
    Befehle   npx pnpm@9.15.9 install --frozen-lockfile
              npx pnpm@9.15.9 build

Übernommen aus `dist/`: `simplecmp.global.js`, `styles/default.css`.

**Warum das große Bundle (205 kB) und nicht `simplecmp.core.global.js`
(143 kB):** Die deutschen Texte stecken nur im großen. Mit dem kleinen
erscheint der Banner auf Englisch — nachgemessen, `core` enthält
„Alle akzeptieren" nicht.

**Selbst gebaut heißt: keine Fassungsverwaltung.** Aktualisierungen
müssen von Hand nachgezogen werden. Lizenz: BSD-3-Clause, siehe LICENSE
und LICENSE-KLARO (Ableitung von Klaro).

## Kosten, gemessen

Der Einbau kostet Lighthouse-Punkte: 30/32 vor dem Einbau, 29/32 danach
(schwankt 28–29). Betroffen sind drei Seiten mobil — `leistungen` 98,
`projekte` 97, `ueber-uns` 98 in der Kategorie Performance. Ursache sind
205 kB JavaScript, die auf jeder Seite geparst werden.

Barrierefreiheit bleibt unberührt: axe-core meldet 0 Verstöße auf
16 Seiten (wcag2a bis wcag22aa).
