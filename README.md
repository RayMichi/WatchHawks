# WatchHawks

Ein Incremental Game im 8-Bit-Stil: Uhren bauen, polieren, verpacken und im eigenen Juweliergeschäft verkaufen. Mit Mitarbeitern, Filialen als Prestige, Ruf-Sternen, Raritäten und VIP-Kunden.

**Spielen:** https://raymichi.github.io/WatchHawks/ (läuft im Browser, auch am Handy)

## Lokal starten
Den Ordner herunterladen und `index.html` im Browser öffnen. Kein Installieren nötig.

## Ordnerstruktur
```
index.html        Gerüst der Seite, lädt alle anderen Dateien
css/style.css     Aussehen: Farben, Schriften, Knöpfe, Menü
js/               Spielcode (Reihenfolge in index.html wichtig)
  fehler.js       zeigt Fehler sichtbar im Spiel an
  icons.js        Pixel-Symbole für Knöpfe und Menüs
  sprache.js      alle Texte auf Deutsch und Englisch
  daten.js        Spielregeln & Balancing: Modelle, Preise, Upgrades
  spielstand.js   was gespeichert wird + Speichern/Laden
  logik.js        Arbeitsschritte, Käufe, Offline-Fortschritt
  grafik.js       Pixel-Laden, Figuren, Effekte
  menue.js        Upgrade-Menü, Einstellungen, Anzeigen
  intro.js         Intro beim ersten Start (Dach, Lisa, Texte)
  konzern.js       Konzern: Zoom raus, Stadtansicht
  sichern.js       Spielstand exportieren/importieren, Test-Werkzeuge (?dev)
  main.js         Spielschleife und Start
tools/
  playtest-bot.js Zeitraffer-Bot für Balancing-Tests
docs/
  todo.md         To-do-Liste
  uebersicht.md   Variablen, Formeln, Upgrade-Logik
```

## Rollen
Michi: Ideen, Konzept, Design, Testen · Claude: Code und Umsetzung
