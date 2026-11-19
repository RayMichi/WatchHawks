// ===============================================================
// 1. SPIELSTAND
//    Stationen: Werkbank (bauen) -> Polierplatz -> Packtisch -> Lager -> Kasse.
//    Jede Station hält genau eine Uhr. Ist die nächste Station
//    belegt, wartet die fertige Uhr – die Kette staut sich.
// ===============================================================
function neuesSpiel() {
  return {
    geld: 0,
    verkauft: 0,
    modelle: ['quarz'],                 // freigeschaltete Modelle (je eine Vitrine)
    aktiv: 'quarz',                     // Modell, das in der Werkstatt gebaut wird
    werkbank: { id: 'quarz', rest: 4, fertig: false },
    polier: null,                       // Uhr auf dem Polierplatz (oder leer)
    lager: [],                          // fertige Uhren im Lagerregal
    packs: [null, null],                // Uhren auf den Packtischen: Modell, Restzeit, fertig ja/nein
    upg: { werkzeug: 0, tuch: 0, pack: 0, regal: 0, manager: 0, tisch2: 0 },
    team: { bau: 0, polier: 0, pack: 0, verkauf: 0 },   // Stufe der Mitarbeiter
    erfolgStufe: {},                    // je Erfolg: wie viele Stufen eingesammelt sind
    erfolgGemeldet: {},                 // je Erfolg: bis zu welcher Stufe schon gemeldet wurde
    schnellBedient: 0,                  // Kunden, die höchstens 1 s warten mussten
    // --- Prestige (bleibt bei neuer Filiale erhalten) ---
    filiale: 0,                         // 0 = Hinterhof-Laden, 1 = Fußgängerzone …
    sterne: 0,                          // Ruf-Sterne zum Ausgeben
    gesamtSterne: 0,                    // jemals verdiente Sterne (geben +2 % Preis)
    ruf: {},                            // gekaufte Ruf-Shop-Stufen
    raritaeten: [],                     // ersteigerte Raritäten (ids)
    vips: 0,                            // bediente VIP-Kunden
    gems: 0,                            // lila Gems: seltene Währung für Cosmetics (bleibt)
    tabFrei: {},                        // Reiter, die einmal freigeschaltet wurden (bleibt)
    tabGesehen: {},                     // Reiter, deren Stern weggeklickt wurde (bleibt)
    knopfFrei: {},
    introGesehen: false,                // Intro (Dach, Lisa) schon gesehen (bleibt)
    lisaUmzug: false,                   // Lisa-Dialog zum ersten Umzug schon gesehen (bleibt)                      // Knöpfe, die beim ersten Spiel nach und nach auftauchen (bleibt)
    sprache: 'de',                      // 'de' oder 'en' (bleibt)
    spielzeit: 0,                       // Sekunden insgesamt gespielt (bleibt)
    besterVerkauf: 0,                   // teuerster einzelner Verkauf (bleibt)
    proModell: {},                      // verkaufte Uhren pro Modell (bleibt)
    rundeZeit: 0,                       // Sekunden in dieser Filiale
    // --- nur diese Filiale ---
    rundeVerdient: 0,                   // in dieser Filiale verdient (bestimmt die Sterne)
    boost: null,                        // aktiver VIP-Bonus { art, faktor, rest }
    zuletzt: Date.now(),
    // --- Profil (bleibt bei neuer Filiale erhalten) ---
    profil: { name: '', haar: '#4a2a1a', haut: '#f6c79a', shirt: '#8e3a52', frisur: 'kurz', extra: 'keins' },                // letzter Speicherzeitpunkt (für Offline-Fortschritt)
    verdient: 0,                        // insgesamt verdientes Geld
    klicks: 0,                          // selbst gemachte Klicks
    stufe: 0
  };
}
let spiel = neuesSpiel();

// ===============================================================
// 9. SPEICHERN & LADEN
// ===============================================================
const SPEICHER = 'juwelierIdle-v2';
function speichern() { spiel.zuletzt = Date.now(); try { localStorage.setItem(SPEICHER, JSON.stringify(spiel)); } catch (e) {} }
function laden() {
  try {
    const d = JSON.parse(localStorage.getItem(SPEICHER));
    if (!d) return;
    const frisch = neuesSpiel();
    // alte Spielstände: aus "Schnellere Kasse" wird "Schnelleres Verpacken"
    if (d.upg && d.upg.kasse != null && d.upg.pack == null) d.upg.pack = d.upg.kasse;
    // alte Spielstände: ein Packtisch (pack) → Liste (packs)
    if (!Array.isArray(d.packs)) d.packs = [d.pack || null, null];
    while (d.packs.length < 2) d.packs.push(null);
    delete d.pack;
    if (d.upg) delete d.upg.kasse;
    delete d.timer;
    delete d.erfolge; delete d.eingesammelt;   // altes Erfolgssystem
    // alte Spielstände: schon bekannte Reiter ohne Stern
    if (d.tabGesehen == null) {
      const alt = (d.upg && Object.values(d.upg).some(x => x > 0)) || d.filiale > 0;
      d.tabFrei = { uhren: !!alt, laden: d.filiale > 0 || alleMitarbeiter(d.team || {}) || (d.rundeVerdient || 0) >= LADEN_TAB_AB, ruf: d.filiale > 0 };
      d.tabGesehen = { uhren: d.tabFrei.uhren, laden: d.tabFrei.laden, ruf: d.tabFrei.ruf,
                       manager: !!(d.managerGesehen || (d.upg && d.upg.manager) || d.filiale) };
    }
    delete d.managerGesehen;
    // alte Spielstände: alle Knöpfe direkt da (kein Aufploppen)
    if (d.knopfFrei == null && (d.verkauft || 0) >= 3)
      d.knopfFrei = { polBtn: true, packBtn: true, verBtn: true, erfolgeBtn: true, menueBtn: true };
    if (d.introGesehen == null) d.introGesehen = true;   // alte Spielstände: kein Intro mehr
    if (d.lisaUmzug == null) d.lisaUmzug = (d.filiale || 0) > 0;   // schon umgezogen: Dialog nicht nachholen
    if (d.rundeVerdient == null) d.rundeVerdient = d.verdient || 0;   // alte Spielstände
    spiel = Object.assign(frisch, d, { upg: Object.assign(frisch.upg, d.upg), team: Object.assign(frisch.team, d.team), profil: Object.assign(frisch.profil, d.profil) });
  } catch (e) {}
}
