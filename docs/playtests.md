# WatchHawks – Playtest-Protokolle (Ladenspiel)

Ausgelagert aus `uebersicht.md` (21.11.2026), damit die Übersicht handlich bleibt. Aktuelle Werte stehen in der Übersicht.

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

