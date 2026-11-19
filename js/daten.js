// ===============================================================
// 2. SPIELREGELN / BALANCING
// ===============================================================
const VERPACK_ZEIT = 5;   // Sekunden, die das Verpacken einer Uhr dauert

// bau = Klicks in der Werkstatt, polier = Klicks im Polierraum
const MODELLE = [
  { id: 'quarz',   name: 'Quarzuhr',    bau: 4,  polier: 3,  preis: 3,   freischalten: 0,
    farben: { S: '#7a4a2a', C: '#c0c6cc', F: '#f4f1e6', H: '#222', K: '#9aa0a6' } },
  { id: 'taucher', name: 'Taucheruhr',  bau: 8,  polier: 6,  preis: 20,  freischalten: 80,
    farben: { S: '#222', C: '#9aa4ad', F: '#1d3b6e', H: '#fff', K: '#7d8790' } },
  { id: 'chrono',  name: 'Chronograph', bau: 18, polier: 14, preis: 45,  freischalten: 600,
    farben: { S: '#3a2a1a', C: '#d9d9d9', F: '#222', H: '#e8b33c', K: '#aaa' } },
  { id: 'gold',    name: 'Goldene Uhr', bau: 40, polier: 35, preis: 180, freischalten: 6000,
    farben: { S: '#c9962c', C: '#f0c24a', F: '#fff3cf', H: '#6b4b10', K: '#c9962c' } },
  { id: 'diamant', name: 'Diamant-Uhr', bau: 90, polier: 80, preis: 750, freischalten: 60000,
    farben: { S: '#e8e8f0', C: '#f5f5ff', F: '#bfe8ff', H: '#333', K: '#d0d0e0' } }
];

// Platz pro Filiale: der Hinterhof hat 2 Vitrinen und 2 Lagerplätze, jede Filiale 2 mehr (max. 8)
const maxVitrinen = (f = spiel.filiale) => Math.min(8, 2 + 2 * f);
const lagerMax    = (f = spiel.filiale) => Math.min(8, 2 + 2 * f);
const ladenAusbauMoeglich = () => !!LADEN[spiel.stufe + 1] && LADEN[spiel.stufe + 1].vitrinen <= maxVitrinen();

const LADEN = [
  { name: 'Kleiner Laden',          vitrinen: 2, preis: 0 },
  { name: 'Laden mit Schaufenster', vitrinen: 4, preis: 250 },
  { name: 'Juweliergeschäft',       vitrinen: 6, preis: 3000 },
  { name: 'Edel-Boutique',          vitrinen: 8, preis: 40000 }
];

const UPGRADES = {
  // günstiger Einstieg, dafür kleinere Schritte: jede Stufe ×1,41 (alle 2 Stufen ×2), Ende wie vorher ×256
  werkzeug: { name: 'Besseres Werkzeug', max: 16, preis: n => 15 * Math.pow(2, n) },
  tuch:     { name: 'Besseres Poliertuch', max: 16, preis: n => 15 * Math.pow(2, n) },
  pack:     { name: 'Schnelleres Verpacken', max: 14, preis: n => 25 * Math.pow(2.3, n) },
  regal:    { name: 'Größeres Lagerregal', get max() { return lagerMax() - 1; }, preis: n => 30 * Math.pow(2.5, n) },
  manager:  { name: 'Store Manager', max: 1, preis: () => 120 },
  tisch2:   { name: 'Zweiter Packtisch', max: 1, preis: () => 4000 }   // erst ab der 3. Filiale
};
// Packtische: ab der 3. Filiale (Einkaufszentrum) kann ein zweiter dazugekauft werden
const TISCH2_AB = 2;
// Reiter Laden erscheint, sobald alle vier Mitarbeiter eingestellt sind (mind. Stufe 1) ODER 8.000 € in der Filiale verdient sind
const LADEN_TAB_AB = 8000;
const alleMitarbeiter = (team = spiel.team) => ['bau', 'polier', 'pack', 'verkauf'].every(id => (team[id] || 0) >= 1);
const packTische = () => 1 + (spiel.upg.tisch2 && spiel.filiale >= TISCH2_AB ? 1 : 0);
const freierTisch = () => { for (let i = 0; i < packTische(); i++) if (!spiel.packs[i]) return i; return -1; };

// Mitarbeiter (im Manager). Stufe 0 = nicht eingestellt.
// Preis für die nächste Stufe = Grundpreis × 2 ^ aktuelle Stufe
const MITARBEITER = [
  { id: 'bau',     name: 'Uhrmacher',   schritt: 'Bauen',     grundpreis: 40,  icon: 'uhrmacher' },
  { id: 'polier',  name: 'Polierer',    schritt: 'Polieren',  grundpreis: 60,  icon: 'polierer' },
  { id: 'pack',    name: 'Packer',      schritt: 'Verpacken', grundpreis: 120, icon: 'packer' },
  { id: 'verkauf', name: 'Verkäuferin', schritt: 'Verkaufen', grundpreis: 200, icon: 'verkaeuferin', max: 15 }   // 5 Extra-Stufen, um 2 Packtische einzuholen
];
const MITARBEITER_MAX = 10;
const maxStufe = m => m.max || MITARBEITER_MAX;   // Verkäuferin: 15
// Uhrmacher & Polierer: Klicks pro Sekunde (0,5 / 0,75 / 1,1 / 1,7 …, jede Stufe ×1,5)
const klickRate = stufe => stufe ? 0.5 * Math.pow(1.5, stufe - 1) * bonus('team') : 0;
// Packer & Verkäuferin: Sekunden, bis sie loslegen (jede Stufe 25 % schneller)
const reaktion = (stufe, start) => Math.max(0.1, start * Math.pow(0.75, stufe - 1) / bonus('team'));
const PACKER_START = 2, VERKAEUFER_START = 8;
// Verkäuferin: bewusst langsam (8 s, je Stufe ×0,8) – meist der Engpass, damit sich selbst Verkaufen lohnt.
// Keine feste Bremse: mit hohen Stufen holt sie das Verpacken (auch 2 Tische) fast ein.
const verkaufReaktion = stufe => Math.max(0.1, VERKAEUFER_START * Math.pow(0.8, stufe - 1) / bonus('team'));

// ===============================================================
// ERFOLGE
//    Ablauf: Bedingung erfüllt -> "erreicht" -> Spieler sammelt ein
//    -> Belohnung wirkt dauerhaft.
//    ziel() liefert [aktuell, benötigt] für den Fortschrittsbalken.
//    Erfolge ohne ziel() werden direkt im Spiel ausgelöst.
//
//    Belohnungsarten (art):
//      preis  = Verkaufspreis +X %
//      bau    = Baufortschritt pro Klick +X %
//      polier = Polierfortschritt pro Klick +X %
//      pack   = Verpacken X % schneller
//      team   = Mitarbeiter X % schneller
//      geld   = einmalig X € (kein Prozent)
// ===============================================================
// Texte kommen aus sprache.js (Deutsch/Englisch)
const BELOHNUNG_TEXT = {
  preis:  w => t('bel.preis', { w }),
  bau:    w => t('bel.bau', { w }),
  polier: w => t('bel.polier', { w }),
  pack:   w => t('bel.pack', { w }),
  team:   w => t('bel.team', { w }),
  geld:   w => t('bel.geld', { x: zahl(w) }),
  vip:    w => t('bel.vip', { w }),
  offline: w => t('bel.offline', { w })
};
const BELOHNUNG_ICON = { preis: 'verkauf', bau: 'bau', polier: 'polier', pack: 'pack', team: 'manager', geld: 'verkauf', vip: 'vip', offline: 'stern' };

const anzahlTeam = () => Object.values(spiel.team).filter(x => x > 0).length;

// Jeder Erfolg hat mehrere Stufen. wert() = aktueller Stand,
// text(z) = Aufgabe für Ziel z, stufen = Ziele mit Belohnung.
const ERFOLGE = [
  { id: 'verkauft', name: 'Uhrenverkäufer', wert: () => spiel.verkauft, text: null,
    stufen: [{ ziel: 1, art: 'geld', wert: 10 }, { ziel: 100, art: 'preis', wert: 5 }, { ziel: 1000, art: 'preis', wert: 10 },
             { ziel: 10000, art: 'preis', wert: 25 }, { ziel: 100000, art: 'preis', wert: 50 }] },
  { id: 'umsatz', name: 'Umsatz', wert: () => spiel.verdient, text: null,
    stufen: [{ ziel: 1000, art: 'polier', wert: 25 }, { ziel: 10000, art: 'bau', wert: 25 },
             { ziel: 100000, art: 'preis', wert: 10 }, { ziel: 1000000, art: 'preis', wert: 25 }] },
  { id: 'klicks', name: 'Fleißige Hände', wert: () => spiel.klicks, text: null,
    stufen: [{ ziel: 100, art: 'bau', wert: 10 }, { ziel: 1000, art: 'bau', wert: 25 }, { ziel: 10000, art: 'polier', wert: 25 }] },
  { id: 'schnell', name: 'Blitzbedienung', wert: () => spiel.schnellBedient,
    text: null,
    stufen: [{ ziel: 1, art: 'pack', wert: 5 }, { ziel: 10, art: 'pack', wert: 10 }, { ziel: 100, art: 'pack', wert: 15 }] },
  { id: 'chef', name: 'Chefsache', wert: () => spiel.upg.manager, text: null,
    stufen: [{ ziel: 1, art: 'team', wert: 10 }] },
  { id: 'team', name: 'Das Team', wert: anzahlTeam, text: null,
    stufen: [{ ziel: 1, art: 'geld', wert: 100 }, { ziel: 2, art: 'team', wert: 10 }, { ziel: 4, art: 'team', wert: 20 }] },
  { id: 'meister', name: 'Meister seines Fachs', wert: () => Math.max(...Object.values(spiel.team)),
    text: null,
    stufen: [{ ziel: 3, art: 'team', wert: 10 }, { ziel: 5, art: 'team', wert: 15 }, { ziel: 10, art: 'team', wert: 25 }] },
  { id: 'laden', name: 'Ladenausbau', wert: () => spiel.stufe + 1, text: null,
    stufen: [{ ziel: 2, art: 'bau', wert: 25 }, { ziel: 3, art: 'polier', wert: 25 }, { ziel: 4, art: 'bau', wert: 50 }] },
  { id: 'regal', name: 'Volle Regale', wert: () => lagerPlatz(), text: null,
    stufen: [{ ziel: 2, art: 'pack', wert: 5 }, { ziel: 4, art: 'pack', wert: 10 }, { ziel: 8, art: 'pack', wert: 15 }] },
  { id: 'sammler', name: 'Sammler', wert: () => spiel.modelle.length, text: null,
    stufen: [{ ziel: 2, art: 'polier', wert: 10 }, { ziel: 3, art: 'polier', wert: 15 },
             { ziel: 4, art: 'polier', wert: 25 }, { ziel: 5, art: 'preis', wert: 10 }] },
  { id: 'vip', name: 'VIP-Betreuung', wert: () => spiel.vips, text: null,
    stufen: [{ ziel: 1, art: 'preis', wert: 5 }, { ziel: 10, art: 'vip', wert: 25 }, { ziel: 100, art: 'preis', wert: 25 }] },
  { id: 'filiale', name: 'Expansion', wert: () => spiel.filiale, text: null,
    stufen: [{ ziel: 1, art: 'preis', wert: 10 }, { ziel: 3, art: 'bau', wert: 50 }, { ziel: 5, art: 'preis', wert: 50 }] }
];
// Aufgabentexte in der aktuellen Sprache (Schlüssel et.<id> in sprache.js)
for (const e of ERFOLGE) e.text = z => t('et.' + e.id, { z, x: zahl(z) });
const ERFOLG_STUFEN_GESAMT = ERFOLGE.reduce((s, e) => s + e.stufen.length, 0);
const gesammelt = e => spiel.erfolgStufe[e.id] || 0;                 // eingesammelte Stufen
const erreicht = e => e.stufen.filter(s => e.wert() >= s.ziel).length; // erreichte Stufen

// ===============================================================
// FILIALEN (Prestige)
//    Neue Filiale = Neustart in einem größeren, moderneren Laden.
//    Dafür gibt es Ruf-Sterne: Wurzel(in dieser Filiale verdient / STERN_TEILER).
//    Jeder jemals verdiente Stern gibt dauerhaft +STERN_BONUS % Verkaufspreis.
//    Jede Filiale hat eine bessere Lage: Verkaufspreis × LAGE_BONUS ^ Filiale.
// ===============================================================
const FILIALEN = [
  { name: 'Hinterhof',      text: 'Klein, alt und ziemlich runtergekommen' },
  { name: 'Fußgängerzone',  text: 'Gemütlich, ordentlich, gute Lage' },
  { name: 'Einkaufszentrum', text: 'Hell, modern, viel Laufkundschaft' },
  { name: 'Hauptstraße',    text: 'Edel, dunkel, mit Gold-Akzenten' },
  { name: 'Prachtstraße',   text: 'Samt, Gold und Kronleuchter an der Prachtstraße' }
];
function filialName(i = spiel.filiale) {
  const letzte = FILIALEN.length - 1;
  if (i <= letzte) return nm('filialen', i, FILIALEN[i].name);
  return t('filiale.nr', { n: nm('filialen', letzte, FILIALEN[letzte].name), i: i - letzte + 1 });
}
const STERN_TEILER = 10000;   // so viel € in einer Filiale = 1. Stern
const STERN_BONUS = 10;       // % Verkaufspreis pro jemals verdientem Stern
const LAGE_BONUS = 1.0;       // Preisfaktor pro Filiale (1.0 = aus; Playtest: >1 macht ständiges Umziehen zu stark)
const sterneFuer = verdient => Math.floor(Math.sqrt(verdient / STERN_TEILER));
const sternSchwelle = n => STERN_TEILER * n * n;   // ab so viel € gibt es n Sterne
const lageFaktor = (f = spiel.filiale) => Math.pow(LAGE_BONUS, f);

// ===============================================================
// RUF-SHOP – dauerhafte Upgrades gegen Ruf-Sterne
//    boni(n) = Boni bei Stufe n (gleiche Arten wie bei den Erfolgen)
// ===============================================================
const STARTKAPITAL = [0, 250, 1000, 5000, 25000, 100000];
const RUF_SHOP = [
  { id: 'kapital',  name: 'Startkapital',          max: 5,  kosten: n => Math.pow(2, n),
    text: n => t('rt.kapital', { x: zahl(STARTKAPITAL[n]) }) },
  { id: 'kontakte', name: 'Gute Kontakte',         max: 1,  kosten: () => 2,
    text: () => t('rt.kontakte') },
  { id: 'stamm',    name: 'Stammpersonal',         max: 1,  kosten: () => 8,
    text: () => t('rt.stamm') },
  { id: 'haende',   name: 'Erfahrene Hände',       max: 10, kosten: n => n + 1,
    text: n => t('rt.haende', { w: 10 * n }), boni: n => ({ bau: 10 * n, polier: 10 * n }) },
  { id: 'ruf',      name: 'Guter Ruf',             max: 10, kosten: n => n + 2,
    text: n => BELOHNUNG_TEXT.preis(10 * n), boni: n => ({ preis: 10 * n }) },
  { id: 'packen',   name: 'Packprofi',             max: 5,  kosten: n => 2 * n + 2,
    text: n => BELOHNUNG_TEXT.pack(10 * n), boni: n => ({ pack: 10 * n }) },
  { id: 'motiv',    name: 'Motivierte Mitarbeiter', max: 5, kosten: n => 2 * n + 2,
    text: n => BELOHNUNG_TEXT.team(10 * n), boni: n => ({ team: 10 * n }) },
  { id: 'vipmag',   name: 'VIP-Magnet',            max: 5,  kosten: n => n + 2,
    text: n => BELOHNUNG_TEXT.vip(20 * n), boni: n => ({ vip: 20 * n }) },
  { id: 'nacht',    name: 'Nachtschicht',          max: 4,  kosten: n => 2 * n + 2,
    text: n => BELOHNUNG_TEXT.offline(2 * n), boni: n => ({ offline: 2 * n }) }
];

// ===============================================================
// RARITÄTEN – zufällig ersteigern, jede gibt einen Dauerbonus
//    Preis: 3 Sterne + 2 pro bereits besessener Rarität
// ===============================================================
const RARITAETEN = [
  { id: 'r1890',   name: 'Taschenuhr von 1890',        boni: { preis: 10 } },
  { id: 'savon',   name: 'Goldene Savonnette',         boni: { polier: 15 } },
  { id: 'marine',  name: 'Marine-Chronometer',         boni: { pack: 10 } },
  { id: 'kuckuck', name: 'Schwarzwälder Kuckucksuhr',  boni: { bau: 15 } },
  { id: 'sonne',   name: 'Messing-Sonnenuhr',          boni: { team: 10 } },
  { id: 'sand',    name: 'Sanduhr des Uhrmachers',     boni: { offline: 2 } },
  { id: 'sprung',  name: 'Sprungdeckeluhr',            boni: { vip: 25 } },
  { id: 'skelett', name: 'Skelettuhr',                 boni: { bau: 20 } },
  { id: 'diamant', name: 'Diamant-Taschenuhr',         boni: { preis: 25 } },
  { id: 'astro',   name: 'Astronomische Uhr',          boni: { preis: 5, bau: 5, polier: 5, pack: 5, team: 5 } }
];
const raritaetPreis = () => 3 + 2 * spiel.raritaeten.length;
const boniText = b => Object.entries(b).map(([art, w]) => BELOHNUNG_TEXT[art](w)).join(', ');

// Summe aller Boni einer Art aus Erfolgen, Ruf-Shop, Raritäten und Sternen
function summe(art) {
  let s = 0;
  for (const e of ERFOLGE) e.stufen.slice(0, gesammelt(e)).forEach(st => { if (st.art === art) s += st.wert; });
  for (const r of RUF_SHOP) { const n = spiel.ruf[r.id] || 0; if (n && r.boni) s += r.boni(n)[art] || 0; }
  for (const id of spiel.raritaeten) { const r = RARITAETEN.find(x => x.id === id); if (r) s += r.boni[art] || 0; }
  if (art === 'preis') s += spiel.gesamtSterne * STERN_BONUS;
  return s;
}
// z. B. bonus('preis') = 1,15 bei +15 %
const bonus = art => 1 + summe(art) / 100;
// Gesamter Preisfaktor beim Verkauf (ohne VIP-Boost)
const preisFaktor = () => bonus('preis') * lageFaktor();
const offlineStunden = () => 2 + summe('offline');
const bauKraft    = (n = spiel.upg.werkzeug) => Math.pow(2, n / 2) * bonus('bau');      // Bauschritte pro Klick
const polierKraft = (n = spiel.upg.tuch) => Math.pow(2, n / 2) * bonus('polier');     // Polierschritte pro Klick
const packZeit    = (n = spiel.upg.pack) => Math.max(0.5, VERPACK_ZEIT * Math.pow(0.85, n)) / bonus('pack');  // 5 s, 4,3 s …
const lagerPlatz  = (n = spiel.upg.regal) => 1 + n;               // 1 bis 8 Plätze
