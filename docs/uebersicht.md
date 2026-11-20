# WatchHawks – Variablen & Upgrade-Logik

Spielname: **WatchHawks** (früher „Juwelier Idle“; seit 18.11.2026).
Stand: 20.11.2026 · Spielen: https://raymichi.github.io/WatchHawks/ · Code: https://github.com/RayMichi/WatchHawks · Claude-Test-Link: https://claude.ai/artifact/HZfx7nf5gTeKaN2UrTenUh
**Ablauf bei Änderungen:** Claude testet, schreibt in Michis Ordner, lädt zu GitHub hoch (Pages aktualisiert sich nach 1–2 min) und aktualisiert den Claude-Link. Spielstände liegen nur im Browser des jeweiligen Geräts (localStorage `juwelierIdle-v2`), jede Adresse hat ihren eigenen. Safari löscht sie nach ~7 Tagen ohne Besuch, außer das Spiel liegt auf dem Home-Bildschirm.
Sicherung der Pixel-Version vor der doppelten Auflösung: Ordner `juwelier-idle-versionen/pixel-stil` · Link: https://claude.ai/artifact/BAQu1ubJX6CXpqWYi2khqE

## Intro (nur beim allerersten Start, js/intro.js)
1. **Titel:** Der Laden ist von oben mit einem Ziegeldach abgedeckt (Schornstein mit Rauch), darauf ein Holzschild „WatchHawks“. Das Haus sitzt weit oben (Dachkante bei ca. 9 % der Höhe, `introVersatz()` verschiebt `loy` beim Zeichnen). Darunter pulsiert ein großer Knopf „Tippen zum Starten“ (gelbe Schrift, dunkle Box mit Goldrand und Leuchten; Handy 18 px, Desktop 24 px). Anzeigen und Knöpfe sind ausgeblendet, Raumschilder und Sprechblasen liegen unter dem Dach.
2. **Dialog:** Tippen → das Haus wandert in 0,8 s in seine normale Position in der Bildmitte, der Hintergrund dunkelt ab, **Lisa** (Porträt `assets/grafik/lisa.png`, von Michi, freigestellt, weiße Randpixel im Haar entfernt bzw. dunkelbraun, gespiegelt, schaut zur Mitte) gleitet von rechts rein und steht am rechten Rand auf der Textbox. Namensschild „Lisa“, Text tippt sich Buchstabe für Buchstabe ein (Tippen zeigt ihn sofort ganz), ▼ zeigt „weiter“. Die Box ist so hoch wie der längste Text, damit Lisa nicht springt.
   - Text 1: Uhrmacher Hawk hat sich nach 40 Jahren zur Ruhe gesetzt und dir den Laden vermacht – eher ein Hinterhof, aber jeder fängt klein an.
   - Text 2: Viel falsch machen kann man nicht, einfach die erste Uhr bauen. Teaser: Wenn es gut läuft, bleibt es nicht der einzige Laden – spätestens dann sieht man sich wieder.
3. **Ende:** Tippen → Dialog blendet aus, das Dach fliegt in 1,4 s nach oben weg (`dachP` 0 → 1), Ladenschild und Knöpfe erscheinen.

**Lisa beim ersten Umzug** (`lisaStarten('umzug')`, am Ende von `neueFiliale()`): Der neue Laden erscheint mit dem Dach der neuen Filiale, Hintergrund dunkel, Lisa erklärt in 4 Texten das Sternesystem:
   1. Zweiter Laden, Fußgängerzone ist schon was anderes als der Hinterhof.
   2. Geld und Upgrades bleiben im alten Laden, aber der Ruf zählt: Ruf-Sterne, je mehr verdient, desto mehr Sterne.
   3. Jeder Stern = dauerhaft +10 % Preis, bleibt auch beim Ausgeben.
   4. Ausgeben im Reiter „Ruf“ (Startkapital, schnellere Mitarbeiter); Tipp: nicht zu früh weiterziehen.
   Danach fliegt das Dach weg. Gespeichert als `lisaUmzug`. Alte Spielstände, die schon umgezogen sind, bekommen den Dialog nicht nachträglich.
**Dächer pro Filiale** (`DACH_STILE`): Hinterhof = rote Tonziegel; Fußgängerzone = blaugrauer Schiefer mit kleineren Platten, zwei Dachgauben mit warmem Licht und Blumenkästen, Kupfer-Regenrinne; Einkaufszentrum, Hauptstraße, Prachtstraße siehe Konzern. Das Schild auf dem Dach zeigt im Intro „WatchHawks“, beim Umzug den Namen der neuen Filiale.
Auch Leertaste/Enter blättern weiter; die Spiel-Tasten 1–4 sind im Intro gesperrt. Gespeichert als `introGesehen` (bleibt). Alte Spielstände ohne das Feld sehen kein Intro, „Spielstand löschen“ zeigt es wieder. Texte: `intro.*` in sprache.js.

## Konzern (js/konzern.js) – seit 20.11. spielbar
Zweite Phase des Spiels, entschieden mit Michi: **weg vom Klicker, alles läuft automatisch**, man trifft nur Entscheidungen. Geld ist der Score.
**Gründung:** Kachel „Konzern gründen“ (lila, Ruf-Reiter, 50 freie ★, zweimal klicken) → Dach legt sich auf den Laden → Zoom raus auf die Stadt → Lisa (3 Texte: Kette in der Stadt · Filialen laufen allein, klein oft/groß selten · Sterne einsammeln, Filialleiter, Zentrale, Limo) → ab jetzt ist die Stadt das Spiel (`spiel.konzern`, body-Klasse `konzernModus`). **Geld und restliche Sterne bleiben** (50 ★ werden abgezogen). Es gibt keine Ladenansicht mehr; Neuladen startet direkt in der Stadt.
**Später (noch nicht gebaut):** Konzern-Reset → ganz von vorne (Hinterhof, Klicker), dafür **Gems** und ein neuer Knopf neben „Upgrades“ mit einem **Gem-Netz** (erster Punkt z. B. +500 % Grundverdienst, Werte noch testen).

### Filialen
Alle 5 Filialen stehen in der Stadt (auch wenn man vorher nicht alle erreicht hatte), Start Stufe 1. Jede läuft in **Runden**: Balken füllt sich, dann Auszahlung (schwebender Betrag). Seit 20.11. (Michi: „alle gleich teuer ist lame, man levelt alles gleichmäßig“) hat jede Filiale **eigene Preise, eigenes Preiswachstum und eigenen Verdienst** – kleine sind billig, werden aber schnell teurer; große sind teuer, bringen viel und werden langsamer teurer:

| Filiale | Runde (Stufe 1) | erster Ausbau | Preis × pro Stufe | €/s pro Stufe |
|---|---|---|---|---|
| Hinterhof | 2 s | 100.000 € | 1,07 | 600 |
| Fußgängerzone | 6 s | 400.000 € | 1,09 | 1.500 |
| Einkaufszentrum | 20 s | 1,5 Mio. € | 1,11 | 4.000 |
| Hauptstraße | 60 s | 6 Mio. € | 1,13 | 12.000 |
| Prachtstraße | 180 s | 25 Mio. € | 1,15 | 40.000 |

- **€/s einer Filiale** = €/s pro Stufe × Stufe × 2^(eigene Meilensteine) × 2^(Konzern-Meilensteine) × 2^Turbo × 1,5^Umsatz-Spez. × 1,25^Tempo-Spez. × Trend (×3) × Werbung (×3) × (1 + 50 % × Marketing) × Limo-Boost. Auszahlung pro Runde = €/s × Rundenzeit.
- **Ausbau (€):** erster Ausbau × Faktor^(Stufe − 1) (Werte siehe Tabelle, `K.preisStart`, `K.preisFaktor`). Kaufmenge oben umschaltbar: ×1 / ×10 / Max.
- **Meilensteine pro Filiale:** Stufe 25, 50, 100, 150, 200, 300, 400 → Runde doppelt so schnell (= ×2 Geld).
- **Konzern-Meilensteine:** alle Filialen auf 25, 50, 100, 200, 300, 400 → alles ×2. Sorgt dafür, dass die teuren Filialen nicht liegen bleiben.
- **Spezialisierung** ab Stufe 10, 25, 50 (je eine Wahl, gilt bis zum Reset): **Umsatz** €×1,5 · **Prestige** ★×2 · **Tempo** €×1,25 und ★×1,25 (schnellere Runden). Offene Wahl = „!“-Blase über der Filiale und lila Kachel oben im Reiter Filialen.

### Sterne
- Jede Filiale füllt ihren **Sternentopf**: 1 ★ alle 15 min (× Prestige/Tempo, × Trend, × Presseabteilung), Platz 3 (+2 je Tresor). Blase „★n“ über dem Gebäude.
- **Knopf unten „Sterne (n)“** sammelt alle Töpfe ein (pulsiert, wenn etwas da ist). Antippen eines Gebäudes sammelt nur dessen Topf.
- **Sterne-Upgrades** (Reiter „Sterne“, pro Filiale): **Filialleiter** 15 ★ (sammelt automatisch, „L“-Abzeichen) · **Tresor** 5 × 2^n ★ (Topf +2) · **Turbo** 10 × 3^n ★ (Filiale ×2).
- **Zentrale** (Reiter „Zentrale“, ★, wirkt auf alle): Marketing (+50 % €, 20 × 2^n, max 10) · Presseabteilung (Sterne +25 % schneller, 15 × 2^n, max 10) · Fuhrpark (Limos 25 % häufiger, Belohnung +50 %, 10 × 2^n, max 5) · Werbeagentur (Werbung: Pause −15 %, +15 s, 10 × 2^n, max 5). Die Baustelle wird zur Konzernzentrale: ab 1 Stufe Rohbau, ab 8 Glasfassade, ab 20 Gold mit Hubschrauber-Landeplatz (vorher Kran).

### Trends, Werbung, Limousine
- **Trends:** alle 10 min ein neuer Trend – eine Filiale €×3, eine andere ★×3. Anzeige oben links unter dem Geld (mit Restzeit) und als Abzeichen „€×3“ / „★×3“ am Gebäude.
- **Werbekampagne** (Knopf unten): Knopf drücken → Filiale antippen → 60 s ×3 Geld, danach 10 min Pause (Werbeagentur verkürzt/verlängert). Orange leuchtender Rahmen + „×3“.
- **Limousine** (wie der VIP-Kunde): schwarze Stretch-Limo mit Krone fährt auf der Straße unter der Zentrale vor, wartet 12 s, fährt wieder weg. Antippen (oder Kronen-Knopf oben rechts): 40 % Trinkgeld = 2 min Konzern-Einkommen · 30 % 30 s ×5 Geld · 30 % 30 s Turbo (Runden doppelt so schnell). Im Schnitt alle ~90 s, erste nach ~30 s.
- **Offline:** Geld = €/s × Zeit (max. Offline-Zeit wie bisher), Töpfe füllen sich bis zur Obergrenze, Filialleiter sammeln weiter ein.

### Konzern-Erfolge (eigener Reiter im Erfolge-Fenster)
Nach der Gründung hat das Erfolge-Fenster zwei Reiter **Laden** / **Konzern** (mit eigenem roten Zähler). Konzern-Erfolge geben **Sterne**:
Konzernumsatz (100 Mio. → 5 ★ … 1 Bio. → 40 ★) · Bauherr (Summe Stufen 50/100/250/500) · Chauffeur (Limos 1/10/50/200) · Gute Leitung (Filialleiter 1/3/5) · Sternensammler (10/50/200/1.000 ★) · Werbeprofi (Kampagnen 1/10/50) · Spezialist (Spezialisierungen 1/5/15).

### Balancing (Bot, Start 5 Mio. €, 30 ★)
Erste Fassung (alle gleich teuer, Faktor 1,15, Meilensteine ab 10, Umsatz ×2): alle auf Stufe 75 nach 12 min, danach Wand. Zweite Fassung (alle gleich, Faktor 1,10): man levelt automatisch alles gleichmäßig → verworfen.
**Jetzt (eigene Preise je Filiale), Bot kauft immer den Ausbau mit dem besten Ertrag pro Euro** (ohne Sterne/Trends):

| nach | Hinterhof | Fußgängerzone | EKZ | Hauptstraße | Prachtstraße | €/s |
|---|---|---|---|---|---|---|
| 1 min | 17 | 8 | 3 | 1 | 1 | 86 Tsd. |
| 15 min | 35 | 15 | 9 | 6 | 3 | 290 Tsd. |
| 1 h | 73 | 44 | 33 | 20 | 17 | 1,5 Mio. |
| 3 h | 97 | 71 | 56 | 40 | 33 | 5,2 Mio. |

Mit Sternen, Spezialisierung, Trends und Turbo (vollständiger Bot) deutlich schneller: nach 1 h ca. 100 Mio. €/s, nach 3 h ca. 1–2 Mrd. €/s.

**Sterne-Varianten (durchgerechnet 20.11., noch nicht entschieden)**, 3 h, Bot sammelt alle 5 min ein:

| Variante | ★ nach 1 h | ★ nach 3 h | Anteil Hinterhof → Prachtstraße |
|---|---|---|---|
| V0 jetzt: alle 1 ★ / 15 min | 42 | 179 | 28 / 21 / 16 / 14 / 20 % |
| V1 umgekehrt fest: 45 / 30 / 15 / 10 / 6 min | 39 | 190 | 9 / 10 / 15 / 20 / 46 % |
| V2 umgekehrt + wächst mit Stufe (60 / 40 / 25 / 15 / 10 min, +5 % je Stufe) | 78 | 717 | 16 / 15 / 14 / 20 / 35 % |
| V2b wie V2, +3 % je Stufe | 53 | 417 | 15 / 15 / 15 / 20 / 35 % |
| V2c wie V2, +2 % je Stufe | 43 | 313 | 15 / 15 / 14 / 20 / 36 % |
| V3 alle 30 min, +5 % je Stufe | 74 | 589 | 38 / 23 / 14 / 12 / 13 % (Hinterhof dominiert) |

Nur alle 30 min einsammeln (Topf voll bei 3): V1 115 ★ statt 190, V2b 358 statt 417.

### Technik
Zahlen zum Balancen stehen gesammelt in `K` und `K_ZENTRALE` oben in konzern.js. Stadt-Overlay: `konzernOverlay()` (Rundenbalken, Stufen-Abzeichen, Trends, Töpfe, Limo, schwebende Beträge). Menü-Karten mit mehreren Knöpfen: Eintrag mit `knoepfe: [{ text, tun, aus, gewaehlt }]` (Klasse `mehrknopf`). Im Breitbild rückt die Stadt nach links, wenn die Menü-Leiste offen ist.
Test: Dev-Vorlage „Konzern läuft (5 Mio. €, 40 ★)“, Schummel-Knöpfe „Töpfe voll“ und „Limo“ (mit `?dev`).

## Kern-Loop (manuell oder per Mitarbeiter)
1. **Werkstatt – BAUEN:** Uhr wird zusammengebaut (Armband → Gehäuse → Zifferblatt → Zeiger).
2. **Polierraum – POLIEREN:** Dreckflecken verschwinden.
3. **Packtisch – VERPACKEN:** Ein Klick legt die polierte Uhr in die Schachtel, dann läuft ein Timer (5 s). Danach kommt sie ins Lagerregal.
4. **Kasse – VERKAUFEN:** Verkauft sofort, ohne Wartezeit, solange etwas im Lager ist.

**Knöpfe freischalten (nur beim allerersten Spiel):** Am Anfang gibt es nur **Bauen**. **Polieren** ploppt auf, sobald die erste Uhr gebaut ist, **Verpacken** nach dem ersten Polieren, **Verkaufen** nach dem ersten Verpacken, der **Erfolge**-Knopf nach der ersten verkauften Uhr und **Upgrades** nach 3 verkauften Uhren (mit Stern, bis man das Menü zum ersten Mal öffnet). Einmal da, bleiben die Knöpfe für immer, auch nach dem Umzug (`knopfFrei`).

**Reiter freischalten:** Am Anfang gibt es nur **Ausrüstung**. Nach dem ersten Upgrade kommt **Uhren**, nach dem Kauf des Store Managers **Manager**, **Laden**, sobald alle vier Mitarbeiter eingestellt sind (mind. Stufe 1, `alleMitarbeiter()`) **oder** 8.000 € in der Filiale verdient sind (`LADEN_TAB_AB`, was zuerst kommt; der erste Stern kommt bei 10.000 €) und nach dem ersten Umzug **Ruf**. Ein neuer Reiter wackelt mit großem Stern an der Ecke, bis man draufklickt. Solange ein Reiter neu ist, hat auch der Upgrades-Knopf einen Stern (wackelt aber nicht). Freigeschaltete Reiter bleiben nach dem Umzug (`tabFrei`, `tabGesehen`), nur Manager verschwindet bis zum nächsten Kauf. Die Umzugs-Anzeige oben erscheint zusammen mit dem Laden-Reiter.
Bot-Test (17.11.): Laden-Reiter nach ~24 min, erster Stern nach ~28 min (vorher ~26 min).

Jede Station hält **eine** Uhr. Ist die nächste Station voll, wartet die fertige Uhr (Sprechblase „!“) – die Kette staut sich. Tastatur: 1 / 2 / 3 / 4. Menü-Knopf „Upgrades“ öffnet die Reiter Uhren, Ausrüstung, Laden, Manager, Ruf.

## Spielstand (js/spielstand.js)
| Variable | Bedeutung | Start |
|---|---|---|
| geld | aktuelles Geld | 0 |
| verkauft | verkaufte Uhren gesamt | 0 |
| modelle | freigeschaltete Uhrenmodelle (je eine Vitrine) | Quarzuhr |
| aktiv | Modell, das in der Werkstatt gebaut wird | Quarzuhr |
| werkbank | Uhr in der Werkstatt: Modell, restliche Bauschritte, fertig ja/nein | Quarzuhr |
| polier | Uhr im Polierraum (oder leer) | leer |
| lager | fertige Uhren im Lagerregal | leer |
| packs | Uhren auf den Packtischen (Liste mit 2 Plätzen): Modell, Restzeit, fertig ja/nein | leer |
| upg | Stufe je Upgrade (werkzeug, tuch, pack, regal, manager, tisch2) | 0 |
| team | Stufe je Mitarbeiter (bau, polier, pack, verkauf), 0 = nicht eingestellt | 0 |
| stufe | Ausbaustufe des Ladens | 0 |
| erfolgStufe | je Erfolg: eingesammelte Stufen | leer |
| schnellBedient | Kunden, die höchstens 1 s warten mussten | 0 |
| verdient | insgesamt verdientes Geld | 0 |
| klicks | selbst gemachte Klicks | 0 |
| filiale | aktuelle Filiale (0 = Hinterhof) – bleibt | 0 |
| sterne / gesamtSterne | Ruf-Sterne zum Ausgeben / jemals verdient – bleibt | 0 |
| ruf | Stufen im Ruf-Shop – bleibt | leer |
| raritaeten | ersteigerte Raritäten – bleibt | leer |
| vips | bediente VIP-Kunden – bleibt | 0 |
| rundeVerdient | in dieser Filiale verdient (bestimmt die Sterne) | 0 |
| boost | aktiver VIP-Bonus | leer |
| zuletzt | Zeitpunkt des letzten Speicherns (Offline) | – |
| profil | Ladenname + Aussehen (Frisur, Haar, Haut, Shirt, Extra) – bleibt | Standard |
| introGesehen | Intro schon gesehen – bleibt | false |
| lisaUmzug | Lisa-Dialog zum ersten Umzug gesehen – bleibt | false |

## Uhrenmodelle (js/daten.js)
| Modell | Bauen | Polieren | Preis | Vitrine kostet |
|---|---|---|---|---|
| Quarzuhr | 4 | 3 | 3 € | – |
| Taucheruhr | 8 | 6 | 20 € (bis 19.11.: 12 €) | 80 € (bis 19.11.: 60 €) |
| Chronograph | 18 | 14 | 45 € | 600 € |
| Goldene Uhr | 40 | 35 | 180 € | 6.000 € |
| Diamant-Uhr | 90 | 80 | 750 € | 60.000 € |

## Laden (js/daten.js)
| Stufe | Name | Vitrinen | Preis |
|---|---|---|---|
| 1 | Kleiner Laden | 2 | Start |
| 2 | Laden mit Schaufenster | 4 | 250 € |
| 3 | Juweliergeschäft | 6 | 3.000 € |
| 4 | Edel-Boutique | 8 | 40.000 € |

## Ausrüstung (js/daten.js, Objekt UPGRADES)
| Upgrade | Wirkung | Formel | Preis-Formel | Max |
|---|---|---|---|---|
| Besseres Werkzeug | Bauschritte pro Klick | 2 ^ (Stufe/2) → 1; 1,4; 2; 2,8; 4 … | 15 × 2 ^ Stufe | 16 |
| Besseres Poliertuch | Polierschritte pro Klick | 2 ^ (Stufe/2) | 15 × 2 ^ Stufe | 16 |
| Schnelleres Verpacken | Dauer des Verpackens | 5 s × 0,85 ^ Stufe, min. 0,5 s | 25 × 2,3 ^ Stufe | 14 |
| Größeres Lagerregal | Lagerplätze | 1 + Stufe (bis zur Grenze der Filiale) | 30 × 2,5 ^ Stufe | Filiale-Grenze − 1 |
| Store Manager | schaltet den Reiter „Manager“ frei | – | 120 € | 1 |
| Zweiter Packtisch | zweiter Tisch über dem ersten, zwei Uhren gleichzeitig | erst ab Filiale 3 (Einkaufszentrum) | 4.000 € | 1 |

**Zweiter Packtisch:** Der Packer bedient beide Tische. Gemessen (Filiale 3, alle Mitarbeiter gleich): Stufe 3 → 19 wird zu 38 Uhren/min, Stufe 10 → 29 wird zu 58 Uhren/min. Bis Filiale 2 steht er mit Schloss im Reiter Ausrüstung. Wird wie alle Upgrades beim Umzug zurückgesetzt.

## Manager: Mitarbeiter (js/daten.js)
Erst nach dem Upgrade „Store Manager“. Jeder Mitarbeiter übernimmt einen Schritt und steht sichtbar im Laden. Max. Stufe 10 (Verkäuferin 15).
Preis nächste Stufe = Grundpreis × 2 ^ aktuelle Stufe.

| Mitarbeiter | Schritt | Grundpreis | Wirkung | Formel |
|---|---|---|---|---|
| Uhrmacher | Bauen | 40 € | Klicks pro Sekunde (nutzt Werkzeug-Upgrade mit) | 0,5 × 1,5 ^ (Stufe − 1) |
| Polierer | Polieren | 60 € | Klicks pro Sekunde (nutzt Poliertuch mit) | 0,5 × 1,5 ^ (Stufe − 1) |
| Packer | Verpacken | 120 € | legt polierte Uhr nach X s auf den Packtisch | 2 s × 0,75 ^ (Stufe − 1), min. 0,1 s |
| Verkäuferin | Verkaufen | 200 € | verkauft alle X s eine Uhr aus dem Lager · **max. Stufe 15** | 8 s × 0,8 ^ (Stufe − 1), min. 0,1 s |

Mit allen vier läuft der Laden komplett automatisch. **Engpass ist meistens die Verkäuferin** (seit 18.11.): Sie startet langsam (8 s) und wird pro Stufe nur ×0,8 schneller. Bei gleicher Stufe liegt sie meist etwas unter dem Verpacken, das Lager läuft voll und selbst Verkaufen lohnt sich. Es gibt **keine feste Bremse** – mit hohen Stufen holt sie auf. Sie hat 5 Extra-Stufen (bis 15, `max` in MITARBEITER, `maxStufe()`), damit sie am Ende auch 2 voll ausgebaute Packtische fast schafft.
Gemessen (1 min, Filiale 3, Verpacken = Durchsatz ohne Verkäuferin):

| Team-Stufe | Verkäuferin | Pack-Upgr. | Tische | Verpacken/min | Verkäuferin/min |
|---|---|---|---|---|---|
| 1 | 1 | 0 | 1 | 8 | 7 |
| 3 | 3 | 3 | 1 | 14 | 11 |
| 5 | 5 | 6 | 1 | 24 | 18 |
| 7 | 7 | 9 | 1 | 40 | 27 |
| 10 | 10 | 10 | 1 | 53 | 52 |
| 10 | 10 | 14 | 2 | 180 | 55 |
| 10 | 12 | 14 | 2 | 180 | 87 |
| 10 | 15 | 14 | 2 | 180 | 170 |

## Erfolge (js/daten.js)
Knopf mit Schleife oben rechts (roter Punkt = Stufen zum Einsammeln). Jeder Erfolg hat **mehrere Stufen**, die Punkte zeigen den Stand (gelb = eingesammelt, weiß = bereit, dunkel = offen). Stufen werden der Reihe nach eingesammelt; erst dann wirkt die Belohnung. Boni gleicher Art werden addiert.

| Erfolg | Stufen (Ziel → Belohnung) |
|---|---|
| Uhrenverkäufer | 1 Uhr → 10 € · 100 → +5 % Preis · 1.000 → +10 % Preis · 10.000 → +25 % Preis · 100.000 → +50 % Preis |
| Umsatz | 1.000 € → +25 % Polieren · 10.000 € → +25 % Bauen · 100.000 € → +10 % Preis · 1 Mio. € → +25 % Preis |
| Fleißige Hände | 100 Klicks → +10 % Bauen · 1.000 → +25 % Bauen · 10.000 → +25 % Polieren |
| Blitzbedienung | 1 Kunde in ≤ 1 s → Verpacken 5 % schneller · 10 → 10 % · 100 → 15 % |
| Chefsache | Manager freigeschaltet → Mitarbeiter 10 % schneller |
| Das Team | 1 Mitarbeiter → 100 € · 2 → Mitarbeiter +10 % · 4 → Mitarbeiter +20 % |
| Meister seines Fachs | Mitarbeiter auf Stufe 3 → +10 % · 5 → +15 % · 10 → +25 % (Mitarbeiter-Tempo) |
| Ladenausbau | Stufe 2 → +25 % Bauen · 3 → +25 % Polieren · 4 → +50 % Bauen |
| Volle Regale | 2 Lagerplätze → Verpacken 5 % · 4 → 10 % · 8 → 15 % schneller |
| Sammler | 2 Modelle → +10 % Polieren · 3 → +15 % · 4 → +25 % · 5 → +10 % Preis |
| VIP-Betreuung | 1 VIP → +5 % Preis · 10 → VIPs 25 % häufiger · 100 → +25 % Preis |
| Expansion | 1 neue Filiale → +10 % Preis · 3 → +50 % Bauen · 5 → +50 % Preis |

Offene Erfolge zeigen die nächste Aufgabe mit Zahl (z. B. „Verkaufe 1.000 Uhren“), die Stufe sieht man an den Punkten. Fertige Erfolge zeigen die Aufgabe allgemein ohne Zahlen (z. B. „Verkaufe Uhren“, Texte `eg.*` in sprache.js) und darunter „Erhalten:“ mit allem, was die Stufen zusammen gebracht haben (pro Art addiert).
Knopf **Boni** neben dem Schließen-Knopf: alle aktiven Boni untereinander, Kategorie links, Wert rechts (Verkaufspreis, Baufortschritt, Polierfortschritt, Verpack-Tempo, Mitarbeiter-Tempo, VIP-Häufigkeit, Offline-Zeit). Gezählt werden alle Quellen: Erfolge, Ruf-Sterne, Ruf-Shop, Raritäten. „Zurück“ führt wieder zur Liste.

38 Stufen insgesamt. Im Code: bonus('preis'|'bau'|'polier'|'pack'|'team') = 1 + Summe/100.

## Große Zahlen
Ab 1 Million: Mio., Mrd., Bio., Brd., Trio., Trd., Quad. (z. B. „1,23 Mio.“).

## Offline-Fortschritt
Beim Öffnen wird die Zeit seit dem letzten Speichern nachgerechnet – **nur wenn alle vier Mitarbeiter eingestellt sind**.
Uhren pro Sekunde = langsamster Schritt der Kette (Bauen, Polieren, Verpacken + Packer-Reaktion, Verkäuferin).
Maximal 2 h, mehr über Ruf-Shop „Nachtschicht“ und die Rarität „Sanduhr“.

## Filialen (Prestige)
Im Reiter **Laden → Neue Filiale** (zweimal klicken). Ruf-Sterne = Wurzel(in dieser Filiale verdient ÷ 10.000) (`STERN_TEILER`; am 19.11. kurz ÷ 6.000 getestet, wieder zurück).
Beispiele: 10.000 € → 1 ★ · 40.000 € → 2 ★ · 90.000 € → 3 ★ · 250.000 € → 5 ★ · 1 Mio. € → 10 ★ · 4 Mio. € → 20 ★.
Jeder **jemals verdiente** Stern gibt dauerhaft **+10 % Verkaufspreis** (auch wenn er ausgegeben wurde).
Oben neben dem Geld zeigt die **Umzugs-Anzeige**, wie viele Sterne es jetzt gäbe, plus Balken bis zum nächsten Stern. Umziehen ist nie Pflicht.
Lage-Bonus pro Filiale (LAGE_BONUS) ist auf 1,0 = aus gestellt – siehe Playtest.

**Zurückgesetzt:** Geld, Uhren an den Stationen, Lager, Uhrenmodelle, Upgrades, Mitarbeiter, Ladenausbau, VIP-Boost.
**Bleibt:** Erfolge, Zähler (verkauft, verdient, Klicks, VIPs), Ruf-Sterne, Ruf-Shop, Raritäten.

| Nr. | Filiale (Name auf Deutsch = nur der Ort) | Größe (Spielpixel) | Max. Vitrinen | Max. Lager | Look |
|---|---|---|---|---|---|
| 1 | Hinterhof | 156 × 112 | 2 | 2 | runtergekommen: Risse, Spinnweben, Flecken, Eimer unter undichter Decke, Mülltonne |
| 2 | Fußgängerzone | 176 × 122 | 4 | 4 | gemütlich |
| 3 | Einkaufszentrum | 196 × 130 | 6 | 6 | hell, modern, LED-Leisten, blauer Teppich |
| 4 | Hauptstraße (EN: Flagship Store) | 214 × 138 | 8 | 8 | dunkel mit Gold, Marmor, roter Teppich, Kronleuchter |
| 5+ | Prachtstraße (Nr. 2, 3 …, EN: Luxury Boutique) | 214 × 138 | 8 | 8 | Samt-Lila und Gold |

**Umgebung pro Filiale** (seit 20.11., `UMGEBUNG` in grafik.js, gleicher Stil und gleiche Farben wie die Stadtansicht; alles von oben, Nachbarhäuser als Dächer):
- Hinterhof: dunkler Kopfsteinhof, Nachbarhäuser dicht links/rechts/hinten, Mülltonnen, Kisten, Pfütze, Unkraut; Straße, gegenüber weitere Häuser.
- Fußgängerzone: helles Pflaster überall, **keine Straße**; Bänke, Blumenkübel, Bäume, laufende Passanten, Nachbarläden.
- Einkaufszentrum: der Laden sitzt im Center (Flachdächer mit Oberlichtern daneben/dahinter), Gehweg mit Einkaufswagen, davor Parkplatz mit Stellplätzen und Autos statt Straße.
- Hauptstraße: Steinplatten, roter Teppich mit Messingpfosten und Kordeln, Laternen, dunkle Häuser mit goldenem First; Straße.
- Prachtstraße: Rasen, Kiesweg zur Tür, Hecke, Springbrunnen und Bäume links/rechts, Allee mit Laternen an der Straße, gegenüber Kiesweg und lila Villen.
Straßen wie in der Stadt (`strasse()`): grauer Asphalt, gelbe Mittellinie, Zebrastreifen vor der Tür, Autos fahren in beide Richtungen. Häuser werden mit `hausBlock()`/`hausReihe()`/`dachHaus()` in Reihen gesetzt.

**Vier Räume für vier Schritte:** Werkstatt und Polierraum oben (schmale Nebenräume), unten links das **Lager** (Lagerregal + Packtische), rechts der **Verkauf** (Vitrinen, Theke, Teppich). Lager und Verkauf sind nicht durch eine Mauer getrennt, sondern durch eigenen Boden (Platten statt Teppich), eigene Rückwand (Bretter) und eine Kante am Übergang. Das Lager ist 58 Spielpixel breit, Farben passen zu jeder Filiale (`lager`, `lagerWand` … im Thema). Alle Möbel- und Figurenpositionen werden pro Filiale berechnet (layout() in js/grafik.js).
Ladenausbau und Lagerregal gehen nur bis zur Grenze der Filiale. Im Hinterhof gibt es also nur Quarz- und Taucheruhr.
Im Breitbild wirken kleine Läden kleiner (Maßstab vom größten Laden), am Handy füllt jeder Laden den Platz.

## Ruf-Shop (Reiter „Ruf“)
| Upgrade | Wirkung | Kosten (★) | Max |
|---|---|---|---|
| Startkapital | Start mit 250 / 1.000 / 5.000 / 25.000 / 100.000 € | 1, 2, 4, 8, 16 | 5 |
| Gute Kontakte | Store Manager sofort frei | 2 | 1 |
| Stammpersonal | alle Mitarbeiter starten auf Stufe 1 | 8 | 1 |
| Erfahrene Hände | +10 % Bauen & Polieren je Stufe | 1, 2, 3 … | 10 |
| Guter Ruf | +10 % Verkaufspreis je Stufe | 2, 3, 4 … | 10 |
| Packprofi | Verpacken 10 % schneller je Stufe | 2, 4, 6 … | 5 |
| Motivierte Mitarbeiter | Mitarbeiter 10 % schneller je Stufe | 2, 4, 6 … | 5 |
| VIP-Magnet | VIPs 20 % häufiger je Stufe | 2, 3, 4 … | 5 |
| Nachtschicht | +2 h Offline-Zeit je Stufe | 2, 4, 6 … | 4 |
| Treuer Uhrmacher / Treuer Polierer / Treuer Packer / Treue Verkäuferin | dieser Mitarbeiter behält beim Umzug seine aktuelle Stufe | je 5 | je 1 |

**Treue Mitarbeiter** (seit 19.11., `treu_bau`, `treu_polier`, `treu_pack`, `treu_verkauf`): 4 einzelne Kacheln mit dem Porträt des Mitarbeiters, jede kostet 5 ★, man kann eine, mehrere oder alle kaufen. Beim Umzug wird die Stufe des Mitarbeiters gemerkt und im neuen Laden wieder gesetzt (höchstens, nie niedriger als Stammpersonal). Die Stufe wächst also mit: Was man im Laden hochlevelt, nimmt man in den nächsten mit. Ist ein treuer Mitarbeiter mindestens Stufe 1, ist der Store Manager im neuen Laden sofort frei (sonst könnte man ihn nicht weiter aufrüsten). Die Kachel zeigt die aktuelle Stufe („behält beim Umzug die Stufe (jetzt 7)“).

## Raritäten (seit 19.11. nicht mehr kaufbar)
Die Auktion ist aus dem Ruf-Reiter entfernt (Michi), ebenso die Sammlungsliste und die Zeile in der Statistik. Der Code (`RARITAETEN`, `raritaetErsteigern`) ist noch da; schon ersteigerte Raritäten in alten Spielständen wirken weiter. Früher: zufällige seltene Uhr, keine doppelt, Preis 3 ★ + 2 ★ pro schon besessener Rarität.
| Rarität | Bonus |
|---|---|
| Taschenuhr von 1890 | +10 % Verkaufspreis |
| Goldene Savonnette | +15 % Polierfortschritt |
| Marine-Chronometer | Verpacken 10 % schneller |
| Schwarzwälder Kuckucksuhr | +15 % Baufortschritt |
| Messing-Sonnenuhr | Mitarbeiter 10 % schneller |
| Sanduhr des Uhrmachers | +2 h Offline-Zeit |
| Sprungdeckeluhr | VIPs 25 % häufiger |
| Skelettuhr | +20 % Baufortschritt |
| Diamant-Taschenuhr | +25 % Verkaufspreis |
| Astronomische Uhr | +5 % auf Preis, Bauen, Polieren, Verpacken, Mitarbeiter |

## VIP-Kunden
In den ersten 5 Minuten Spielzeit (insgesamt, nicht pro Filiale) kommt kein VIP. Danach kommen sie im Schnitt alle ~75 s (häufiger durch Boni), tragen eine Krone und warten 12 s. Anklicken (oder Knopf „VIP bedienen“):
- 40 %: Trinkgeld = 25 × Preis des teuersten freigeschalteten Modells (mind. 30 €)
- 30 %: 20 s lang ×5 Verkaufspreis
- 30 %: 20 s lang Turbo – alles doppelt so schnell (Klicks, Mitarbeiter, Verpacken)

Läuft ein Boost, zeigt oben links eine **kleine leuchtende Box** Art und Restzeit (z. B. „Preis ×5 · 20 s“, Krone 14 px, Schrift 8 px).

Alle Boni (Erfolge, Ruf-Shop, Raritäten, Sterne) werden pro Art addiert: bonus(art) = 1 + Summe/100.

## Playtest-Ergebnisse (Zeitraffer-Bot, 17.11.2026)
Bot: 3 Klicks/s, kauft immer das günstigste sinnvolle Upgrade, baut das teuerste Modell, bedient VIPs nach 3 s, sammelt Erfolge ein.

**Vorher** (1. Stern bei 2.000 €, +2 %/Stern): 1. Stern nach ~10 min; nach 60 min alles maximiert, 1,9 Mio. € → zu schneller Umzug, Stern-Bonus spürbar zu klein.

**Varianten über 3 h mit festem Umzugsrhythmus** (Sterne gesamt inkl. möglicher):
| Variante | alle 15 min | alle 30 min | alle 50 min | Urteil |
|---|---|---|---|---|
| +10 %/★, kein Lage-Bonus | 208 | 182 | 198 | ausgeglichen → echter Nervenkitzel ✔ |
| +15 %/★, kein Lage-Bonus | 443 | 324 | 253 | ständiges Umziehen zu stark |
| +15 %/★, Lage ×1,15 | 2.216 | 543 | 309 | kippt komplett |

**Gewählt:** 1. Stern bei 10.000 € (~19–20 min im Hinterhof), +10 %/Stern, kein Lage-Bonus, stärkeres Startkapital.
Zweiter Laden erreicht den Stand des ersten (nach 30 min) in ~20 min ≈ 1,5× schneller; jeder weitere Stern beschleunigt mehr.

**Playtest mit Platzgrenzen pro Filiale (17.11.2026):**
Hinterhof (2 Vitrinen, 2 Lager): 1. Stern nach ~26 min, danach flacht das Einkommen ab (~1.000 €/min) → der Laden wird zu klein.
3 h mit festem Umzugsrhythmus: alle 20 min → 196 ★ · alle 30 min → 184 ★ · alle 45 min → 112 ★ (zu langes Bleiben in kleinen Läden lohnt sich nicht).

**Playtest 18.11.2026 (neuer Bot `tools/playtest-bot.js`, 4 h, 3 Klicks/s, kauft immer das Günstigste, hilft beim Verkaufen):**

| Strategie | Umzüge | Sterne nach 4 h | verdient gesamt | Preis-Bonus |
|---|---|---|---|---|
| sofort beim 1. Stern | 141 | 141 | 1,7 Mio. € | ×17 |
| frühestens nach 20 min | 11 | 971 | 2,7 Mrd. € | ×101 |
| frühestens nach 40 min | 5 | 360 | 1,5 Mrd. € | ×40 |

- Sofort umziehen ist eine Falle: Jeder Laden bringt nur 1 ★, am Ende springt der Bot alle 30–60 s weiter.
- Frühphase zäh: Hinterhof 1. Stern nach 26,7 min (Store Manager nach ~9 min), Fußgängerzone nach 20 min nur 1 ★ (37 Tsd. €), Einkaufszentrum/Hauptstraße 2 ★.
- Danach Explosion: ab Prachtstraße 1 (20-min-Rhythmus) 8 → 38 → 80 → 145 → 187 → 226 → 281 ★; Team 10/10/10/15 und alle 5 Modelle nach 1–7 min fertig → Spätspiel braucht Inhalt.
- Verkäuferin: anfangs verkauft der Spieler fast alles selbst (100 %), in den großen Läden sinkt der Anteil auf 30 % → 14 % → 1 %. Stufe 15 wird ab dem 6. Laden (20-min-Rhythmus) erreicht.

**Playtest 19.11.2026 – erster Stern bei 6.000 € statt 10.000 € (Michi: Hinterhof ab ~3.000 € zu zäh):**
Grund für die Zähigkeit: Im Hinterhof gibt es nur Quarz + Taucher (12 €), Lager max. 2, langsame Verkäuferin → ab ~3.000 € (Min. 14) bleibt das Einkommen bei ~600 €/min.

| | vorher (÷ 10.000) | jetzt (÷ 6.000) |
|---|---|---|
| 1. Stern im Hinterhof | 26,7 min | 19,5 min |
| 4 h, frühestens nach 20 min umziehen | 971 ★, 2,7 Mrd. € | 1.674 ★, 5,5 Mrd. € |
| 4 h, sofort umziehen | 141 ★ | 622 ★ (jeder Laden nur 1 ★, nach 4,5–20 min) |

- 20-min-Rhythmus: Hinterhof 1 ★ → Fußgängerzone 2 ★ → Einkaufszentrum 3 ★ → Hauptstraße 6 ★ → Prachtstraße 27 → 73 ★ …
- Frühphase spürbar kürzer, das Spätspiel explodiert aber noch stärker als vorher → **wieder verworfen**.

**Gewählt (19.11.): Schwelle zurück auf 10.000 €, dafür Taucheruhr 20 € (statt 12 €), Freischalten 80 € (statt 60 €), Laden-Reiter wieder ab 8.000 €.**
Idee von Michi: Die Taucheruhr ist die teuerste Uhr im Hinterhof – ihr Preis wirkt fast nur in der Frühphase, später verdienen die anderen Modelle.

| Variante (Bot, 1. Stern bei 10.000 €) | Taucher frei | 3k | 10k | 4 h (20-min-Rhythmus) |
|---|---|---|---|---|
| Taucher 12 € / 60 € (alt) | Min. 7,6 | Min. 14 | Min. 24 | 985 ★ |
| **Taucher 20 € / 80 € (gewählt)** | Min. 8,1 | Min. 12 | **Min. 20** | **1.169 ★**, 3,9 Mrd. € |
| Taucher 20 € / 150 € | Min. ~18 | Min. 20 | Min. 26 | 755 ★ (Freischalten zu teuer → bremst) |
| zum Vergleich: Schwelle 6.000 €, Taucher 12 € | Min. 7,6 | Min. 14 | (6k Min. 19,5) | 1.674 ★ |

Gewählte Variante, Sterne pro Laden im 20-min-Rhythmus: 1 → 2 → 4 → 7 → 29 → 68 → 116 ★. Erster Stern genauso schnell wie mit der 6k-Schwelle, aber deutlich weniger Aufblähen im Spätspiel; der 2. Laden bringt 2 statt 1 ★.

## Einstellungen (Zahnrad oben rechts)

### Profil
- **Ladenname** (max. 20 Zeichen) – steht groß auf dem Schild über dem Laden, darunter die aktuelle Filiale. Leer = „Mein Juwelier“.
- **Charakter** steht links neben der Theke. Anpassbar: Frisur (Kurz, Lang, Dutt, Stacheln, Glatze), 10 Haarfarben, 5 Hauttöne, 10 Shirtfarben, Extra (Brille, Mütze, Zylinder).
- Alles kostenlos; besondere Cosmetics später gegen Gems.

### Statistik
Live-Zahlen: verdient gesamt / in dieser Filiale, Einkommen der letzten Minute, teuerster Verkauf, Preis-Bonus,
verkaufte Uhren (gesamt und pro Modell), eigene Klicks, Blitzbedienungen, VIPs, Filiale, Sterne, Raritäten,
Erfolgsstufen, Gems, Spielzeit gesamt und in dieser Filiale.
Neue Spielstand-Felder: `spielzeit`, `rundeZeit`, `besterVerkauf`, `proModell`, `gems`, `sprache` (alle außer `rundeZeit` überleben den Umzug).

### Allgemein
- **Sprache:** Deutsch / English. Alle Texte stehen in `js/sprache.js` (`t('schluessel')`, Namen über `nm()`).
  Neue Texte immer dort in beiden Sprachen eintragen.
- **Anzeige:** Vollbild an/aus (zeigt „Geht hier nicht“, wenn der Browser es blockiert).
- **Spielstand sichern** (seit 20.11., js/sichern.js): **Exportieren** erzeugt einen Code (`WH2.` + komprimiert per deflate, Base64; Fallback `WH1.` unkomprimiert), kopiert ihn in die Zwischenablage und zeigt ihn im Textfeld. **Importieren** → Code einfügen → „Diesen Spielstand laden“: ersetzt den Spielstand und lädt die Seite neu (alte Spielstände werden dabei wie gewohnt migriert). So kann man den Stand zwischen Handy, PC, GitHub-Pages und Claude-Link umziehen.
- **Test-Werkzeuge** (nur mit `?dev` an der Adresse, z. B. https://raymichi.github.io/WatchHawks/?dev – wird gemerkt, `?dev=0` schaltet ab), lila gestrichelter Kasten unter „Spielstand sichern“:
  - **3 Speicherplätze** (Speichern/Laden, zeigt Filiale, Geld, ★, Datum; liegen im Browser, `watchhawks-platz-1…3`).
  - **Vorlagen** (ersetzen den aktuellen Stand, Profil und Sprache bleiben): Neu (ohne Intro) · Hinterhof fast fertig (9.500 € verdient, Mitarbeiter da → zum Testen des 1. Umzugs mit Lisa) · 2. Laden (Fußgängerzone, 2 ★) · Prachtstraße mit 60 ★ (alles ausgebaut, Konzern-Kachel aktiv) · Konzern läuft (5 Mio. €, 40 ★).
  - **Schummeln:** € ×10 (zählt auch als verdient, gibt also Sterne), +10 ★, +50 ★, alle Reiter frei, Töpfe voll, Limo sofort.
  - Nach Import/Vorlage/Laden wird nicht mehr gespeichert, bis die Seite neu geladen ist (`speicherSperre`), damit der alte Stand den neuen nicht überschreibt.
- **Spielstand löschen** (zweimal klicken), Sprache bleibt erhalten.

## Anzeige oben links
Goldmünze mit € + Geld (gelb), darunter hellblauer Stern (Ruf-Sterne zum Ausgeben) und lila Edelstein (**Gems**, Cosmetics-Währung, noch ohne Quelle). Symbole 20 px, Schrift 11–14 px.
Die Box hat eine feste Breite. Ab 10.000 wird abgekürzt (`kurz()` in logik.js), immer höchstens 3 Ziffern: DE 10 Tsd., 123 Tsd., 1,23 Mio. · EN 10k, 123k, 1.23M.

## Upgrade-Menü (Karten)
Alle Karten sind 86 px hoch: Symbol links, Titel (1 Zeile, sonst „…“), Infotext (max. 3 Zeilen), Knopf rechts mit fester Größe (108 × 46 px, Handy 92 px, Text darf auf 2 Zeilen).
Stufen und Zähler („Stufe 3“, „0/5“) stehen am Anfang der Infozeile statt im Titel.
Reihenfolge der Reiter: Ausrüstung, Uhren, Manager, Laden, Ruf (Freischalten siehe oben).
**Info-Kacheln** (`infoKachel: true` → Klasse `infokarte`): hellblau, flach, fette Schrift, kein Knopf – zeigen nur Infos.
- **Laden-Reiter** (Reihenfolge): Info-Kachel aktueller Laden („Filiale 2 · hier verdient: 25.000 € · nächster ★ ab 40.000 €“) → **Ladenausbau** als eine Kachel (aktueller Stand → nächster Ausbau mit Preis; sonst „mehr Platz in der nächsten Filiale“ bzw. „voll ausgebaut“) → Neue Filiale.
- **Uhren-Reiter:** Der Knopf der Uhr, die gerade gebaut wird („Wird gebaut“), ist hellblau wie die Info-Kacheln (Klasse `gewaehlt`), nicht grau. Nur der Knopf, nicht die ganze Kachel. Grau bleibt für „geht gerade nicht“ (zu teuer, keine Vitrine frei).
- **Ruf-Reiter:** oben Info-Kachel „X Ruf-Sterne verdient · Bonus: +Y % Verkaufspreis“ (aktuelle Sterne stehen oben links), darunter die lila Kachel „Konzern gründen“, danach der Ruf-Shop (zuletzt die 4 treuen Mitarbeiter). Erklärungen kommen später über Mini-Tutorials.

## Grafikstil (js/grafik.js)
**Pixel-Art in doppelter Auflösung:** Jede Spieleinheit besteht jetzt aus 2×2 feinen Pixeln (`S = 2`). Alle Sprites (Figuren, Uhren, Pflanzen, Schrift, auch die Menü-Symbole) werden beim Zeichnen mit **Scale2x** verdoppelt – dadurch werden schräge Kanten runder, ohne dass der Pixel-Look verloren geht. Figuren, Uhren und Gegenstände haben eine 2 feine Pixel dicke Kontur mit runden Ecken (ähnlich kräftig wie die Tische); jedes Sprite wird dafür einmal auf eine kleine Leinwand gezeichnet und zwischengespeichert. Möbel haben feine Kanten, Dielen- und Fugenlinien sind dünner. Die Figuren haben zusätzlich Lichtpunkte in den Augen und Glanz im Haar. **Figuren (Stil „Knuddel“, seit 18.11.):** runder Riesenkopf, große Kulleraugen mit Lichtpunkt, Mini-Körper, keine Wangen; 13 × 16, Haar in 3 Tönen (`ton()` hellt/dunkelt ab). Frisuren Kurz, Lang, Dutt, Stacheln, Glatze; Extras Brille (helles Gestell), Mütze, Zylinder (ragt über den Kopf, `dy`). Die Füße bleiben an der alten Bezugsposition (`figur()` zeichnet bei x − 2,5 / y − 5). **Uhren (Stil „Ikone 10:10“):** 10 × 10, Zeiger auf 10:10, Stundenmarken, Krone, Glanz am Gehäuse; überall gleich groß. Lagerfächer 11 × 11 (Regal startet weiter links), Vitrinen 13 × 16. Baustufen: Armband → Gehäuse → Zifferblatt → Zeiger. Theke steht mind. 36 Spielpixel unter der Verkaufs-Rückwand, damit die großen Köpfe nicht an die Vitrinen stoßen.
Ein Cartoon-Stil (1930er) wurde ausprobiert und wieder verworfen.

## Schrift im Laden (js/grafik.js)
**Seit 17.11. (spät):** Ladenschild (Name 7, Filiale 4,5 Spielpixel), Raumschilder (4,5) und das schwebende „+3 €“ (6) nutzen die Menü-Schrift **Press Start 2P**. Sie wird nach dem Hochskalieren über das Pixelbild geschrieben (`text()` → `textJetzt()`, mit Schatten). Weil die Schrift monospace ist, berechnet `webBreite()` die Schildbreite exakt (Zeichen × Größe). **Sprechblasen** werden ganz zum Schluss gezeichnet (`blasenZeichnen()`), liegen also immer über Schildern und Texten: „!“ = gelbe Blase mit dunkelrotem Ausrufezeichen, „?“ = weiße Blase mit blauem Fragezeichen, dicke Kontur, Schatten unten, Glanzpunkt.
Alle Texte im Laden-Bild nutzen eine eigene **Pixel-Schrift**, die direkt ins Pixelbild gezeichnet wird (scharf, keine Web-Schrift nötig): **GROSS** 5×7 Pixel (Ladenname, „+3 €“ über der Theke) und **KLEIN** 3×5 Pixel (Raumschilder, Filialname, Sprechblasen). Die Buchstaben werden wie die Sprites mit Scale2x geglättet (runde Kanten). Damit dabei keine Zacken entstehen, sind die Glyphen darauf abgestimmt (17.11.: kleines A, B, E, F, K, P, Q, R, S, V, W, 1 und große 4 überarbeitet). Kleines V ist 5 Pixel breit, damit es nicht wie U aussieht. Nur Großbuchstaben, inkl. Ä/Ö/Ü, Ziffern und Satzzeichen; unbekannte Zeichen werden zu „?“.
**Ladenschild:** dunkles Holzbrett mit viel Rand, goldene Nieten in den Ecken, Name groß in Gold, Filiale klein darunter. Wächst mit der Namenslänge.
**Raumschilder:** kompakt, helles Holz mit dunkler Schrift, in jeder Filiale gleich (gut lesbar), jeweils oben links im Raum. Sie werden nach Möbeln und Vitrinen gezeichnet, damit nichts sie anschneidet.

## Knöpfe oben rechts
VIP bedienen (nur wenn ein VIP da ist), Erfolge und Einstellungen stehen **untereinander** als quadratische Symbol-Knöpfe (46 × 46 px, ohne Text und ohne Erfolge-Zähler; der rote Punkt für neue Stufen bleibt) (`.ecke`, seit 18.11.). So rutschen sie auf dem Handy nicht mehr nach unten. **Vollbild** sitzt jetzt in den Einstellungen unter Allgemein → Anzeige.

## Symbole (js/icons.js)
Alle Knopf-Symbole sind Textbilder wie die Spielgrafik, mit Scale2x geglättet und mit **2 feine Pixel dicker Kontur mit runden Ecken** (wie Figuren/Uhren im Laden, seit 18.11.). Neu gezeichnet passend zum Knuddel-/10:10-Stil:
Bauen = Hammer · Polieren = Funkeln · Verpacken = Geschenkpaket · Verkaufen = Geldsack mit € · Upgrades = grüner Pfeil · Mitarbeiter = Knuddel-Porträts mit Lichtpunkt in den Augen (Manager mit Krawatte, Uhrmacher mit Schürze) · Uhren = 10:10-Uhr · Laden = Ladenfront mit Markise · VIP = Krone · Rarität = Taschenuhr · Erfolge = Medaille · Einstellungen = Zahnrad · Statistik = Balken · Allgemein = Globus · Gesperrt = Vorhängeschloss · Schließen/Vollbild = dicke dunkle Linien (ohne Kontur).
`person(haar, shirt, körperzeilen, extraFarben)` baut die Porträts, `punkte` setzt einzelne feine Pixel (Lichtpunkte).

## Meldungen
Einblendungen (Erfolg erreicht, VIP da, Umzug …) erscheinen **oben** direkt unter der Geld-/Umzugs-Anzeige und gleiten von oben rein (seit 19.11.; vorher unten über den Knöpfen – am Handy hat das bei offenem Upgrade-Menü den VIP verdeckt). Mehrere Meldungen kommen nacheinander. `meldungAusrichten()` setzt die Höhe laufend unter die Anzeige oben links und mittig über die Knöpfe (im Breitbild mit offenem Menü also mittig über dem Laden). Das Erfolge-Fenster und die Einstellungen liegen über den Meldungen (z-index 35 statt 20, Meldungen 30), Meldungen stören dort also nicht.

## Aktions-Knöpfe
Feste Größe, passend für den längsten Text (12 Zeichen, z. B. „Packing 4.3s“): Breitbild 180 × 54 px, Tablet 152 × 76 px, Handy ¼ Breite × 72 px (Platz für 2 Zeilen).
Die Knöpfe stehen auf allen Geräten unten. Im **Breitbild** (ab 900 px breit und breiter als hoch) öffnet sich das Upgrade-Menü als Leiste rechts (460 px) statt unten. Es liegt über dem Laden, der Laden zoomt also nicht raus. Die Knöpfe unten und die Knöpfe oben rechts rücken nach links, damit sie sichtbar bleiben. Wird es zu eng, brechen die Knöpfe in eine zweite Reihe um.
