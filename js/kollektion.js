// ===============================================================
// 13. KOLLEKTIONEN (Konzern)
//     10 Uhren-Kollektionen mit je 4–6 Uhren. Uhren kommen aus Entwürfen (zufällig, nach Seltenheit),
//     doppelte werden zu Uhrmacher-Teilen, mit Teilen baut man fehlende Uhren gezielt.
//     Jede Filiale bekommt genau eine Kollektion; je mehr Uhren dieser Kollektion man hat,
//     desto stärker der Set-Bonus (3 Stufen). Komplette Kollektion = Launch: ganzer Konzern +25 % €.
//     Die Sammlung (spiel.kollektion) liegt außerhalb von spiel.konzern → bleibt beim späteren Konzern-Reset.
// ===============================================================
const SELTEN = {
  g: { gewicht: 60, teile: 1, kosten: 5,   farbe: '#9aa0a6' },   // gewöhnlich
  s: { gewicht: 27, teile: 3, kosten: 15,  farbe: '#4a90e0' },   // selten
  e: { gewicht: 10, teile: 8, kosten: 40,  farbe: '#a050e8' },   // episch
  l: { gewicht: 3,  teile: 20, kosten: 100, farbe: '#f0b030' },  // legendär
};
const KOL = {
  launchBonus: 0.25,          // jede komplette Kollektion: ganzer Konzern +25 % €
  entwurfPreis: n => 20 + 5 * n,  // Entwurf kaufen (★), wird mit jedem Kauf teurer
  limoChance: 0.10,           // Limo bringt mit 10 % einen Entwurf
};
// Uhren-Bilder (10 × 10): rund, eckig, Taschenuhr – Farben kommen von der Kollektion
const UHR_FORM = {
  rund:   ['..SSSSS...', '.CCCCCCC..', 'CgFFKFFFC.', 'CFHFFFHFC.', 'CFFHFHFFC.', 'CKFFpFFKCc', 'CFFFFFFFC.', 'CFFFKFFFC.', '.CCCCCCC..', '..SSSSS...'],
  eckig:  ['..SSSSS...', '.CCCCCCC..', '.CgFKFFC..', '.CHFFFHC..', '.CFHFHFCc.', '.CKFpFKC..', '.CFFFFFC..', '.CFFKFFC..', '.CCCCCCC..', '..SSSSS...'],
  tasche: ['...CCC....', '...C.C....', '..CCCCC...', '.CgFKFFC..', 'CFHFFFHFC.', 'CKFHFHFKC.', 'CFFFpFFFC.', 'CFFFKFFFC.', '.CFFFFFC..', '..CCCCC...'],
};
const KOLLEKTIONEN = [
  { id: 'heritage', name: 'Hawk Heritage', en: 'Hawk Heritage', form: 'rund', farbe: '#b07a3a',
    pal: { S: '#6a3a1a', C: '#c08a4a', F: '#f4ead0', H: '#3a2210', K: '#a07040', g: '#ffe0a0', p: '#3a2210', c: '#8a5a2a' },
    uhren: [['Hawk No. 1', 'Hawk No. 1', 'g'], ['Werkstatt 1984', 'Workshop 1984', 's'], ['Meisterstück', 'Masterpiece', 'e'], ['Hawks Erbstück', "Hawk's Heirloom", 'l']] },
  { id: 'tiefsee', name: 'Tiefsee', en: 'Deep Sea', form: 'rund', farbe: '#2a7ab0',
    pal: { S: '#1a2a3a', C: '#9ab0c0', F: '#1a4a7a', H: '#e8f4ff', K: '#7ad0ff', g: '#d0e8f4', p: '#ffffff', c: '#5a7a8a' },
    uhren: [['Riff', 'Reef', 'g'], ['Lagune', 'Lagoon', 'g'], ['Tiefenrausch', 'Rapture of the Deep', 's'], ['Marianengraben', 'Mariana Trench', 'e'], ['Leviathan', 'Leviathan', 'l']] },
  { id: 'renn', name: 'Rennstrecke', en: 'Racetrack', form: 'rund', farbe: '#c8402a',
    pal: { S: '#222222', C: '#c0c6cc', F: '#2a2a2a', H: '#ffffff', K: '#e84a2a', g: '#e8ecef', p: '#e84a2a', c: '#8a9096' },
    uhren: [['Boxenstopp', 'Pit Stop', 'g'], ['Startlinie', 'Starting Line', 'g'], ['Pole Position', 'Pole Position', 's'], ['Zielflagge', 'Chequered Flag', 'e'], ['Grand Prix', 'Grand Prix', 'l']] },
  { id: 'gold', name: 'Gold Royal', en: 'Gold Royal', form: 'eckig', farbe: '#e0b040',
    pal: { S: '#5a1a2a', C: '#f0c050', F: '#fff6dc', H: '#5a3a10', K: '#d8485a', g: '#fff6c0', p: '#5a3a10', c: '#c8932e' },
    uhren: [['Herzog', 'Duke', 'g'], ['Fürstin', 'Duchess', 's'], ['Zepter', 'Sceptre', 'e'], ['Königskrone', 'Royal Crown', 'l']] },
  { id: 'flieger', name: 'Fliegeruhren', en: 'Pilot Watches', form: 'rund', farbe: '#6a7a5a',
    pal: { S: '#5a4a2a', C: '#8a9086', F: '#2a3024', H: '#f4f0d0', K: '#f4f0d0', g: '#c0c8b8', p: '#f0a040', c: '#5a6056' },
    uhren: [['Propeller', 'Propeller', 'g'], ['Kompass', 'Compass', 'g'], ['Höhenmesser', 'Altimeter', 's'], ['Nachtflug', 'Night Flight', 'e'], ['Überschall', 'Supersonic', 'l']] },
  { id: 'bauhaus', name: 'Bauhaus', en: 'Bauhaus', form: 'rund', farbe: '#d84a3a',
    pal: { S: '#2a2a2a', C: '#e8e8e0', F: '#ffffff', H: '#1a1a1a', K: '#d84a3a', g: '#ffffff', p: '#d84a3a', c: '#a8a8a0' },
    uhren: [['Linie', 'Line', 'g'], ['Fläche', 'Plane', 's'], ['Raster', 'Grid', 'e'], ['Form & Funktion', 'Form & Function', 'l']] },
  { id: 'nostalgie', name: 'Nostalgie', en: 'Nostalgia', form: 'tasche', farbe: '#8a5a3a',
    pal: { C: '#d8b060', F: '#f4ead0', H: '#2a1a10', K: '#8a6a3a', g: '#fff0b0', p: '#2a1a10', c: '#a8803a' },
    uhren: [['Großvater', 'Grandfather', 'g'], ['Dampflok', 'Steam Engine', 'g'], ['Grammophon', 'Gramophone', 's'], ['Kaiserzeit', 'Imperial Era', 'e'], ['Savonnette 1888', 'Hunter 1888', 'l']] },
  { id: 'perlen', name: 'Perlen & Schmuck', en: 'Pearls & Jewels', form: 'eckig', farbe: '#e0a8c8',
    pal: { S: '#e8d8e0', C: '#f4e8f0', F: '#fff8fc', H: '#6a4a5a', K: '#d890b8', g: '#ffffff', p: '#6a4a5a', c: '#c8a8b8' },
    uhren: [['Perlmutt', 'Mother-of-Pearl', 'g'], ['Zuchtperle', 'Cultured Pearl', 's'], ['Südsee', 'South Seas', 'e'], ['Schwarze Perle', 'Black Pearl', 'l']] },
  { id: 'astro', name: 'Astronomie', en: 'Astronomy', form: 'rund', farbe: '#4a4ab0',
    pal: { S: '#1a1a3a', C: '#c0c6cc', F: '#1a1a4a', H: '#ffe080', K: '#ffffff', g: '#e8ecef', p: '#ffe080', c: '#8a9096' },
    uhren: [['Neumond', 'New Moon', 'g'], ['Halbmond', 'Half Moon', 'g'], ['Vollmond', 'Full Moon', 's'], ['Polarstern', 'North Star', 's'], ['Komet', 'Comet', 'e'], ['Sternenhimmel', 'Starry Sky', 'l']] },
  { id: 'diamant', name: 'Diamant Edition', en: 'Diamond Edition', form: 'eckig', farbe: '#7ad8e8',
    pal: { S: '#c0c6cc', C: '#e8f8ff', F: '#a0e8f8', H: '#1a3a4a', K: '#ffffff', g: '#ffffff', p: '#1a3a4a', c: '#a0c0d0' },
    uhren: [['Brillant', 'Brilliant', 'g'], ['Smaragdschliff', 'Emerald Cut', 's'], ['Prinzessschliff', 'Princess Cut', 's'], ['Herzschliff', 'Heart Cut', 'e'], ['Rosenschliff', 'Rose Cut', 'e'], ['Der Unbezahlbare', 'The Priceless', 'l']] },
];
// Stufen: 4 Uhren → 2/3/4, 5 → 2/4/5, 6 → 2/4/6
KOLLEKTIONEN.forEach(k => {
  k.stufen = k.uhren.length === 4 ? [2, 3, 4] : [2, 4, k.uhren.length];
  k.uhren = k.uhren.map(([de, en, s], n) => ({ id: k.id + n, de, en, s, k }));
});
const ALLE_UHREN = KOLLEKTIONEN.flatMap(k => k.uhren);
const kolName = k => (SPRACHE === 'en' ? k.en : k.name);
const uhrName = u => (SPRACHE === 'en' ? u.en : u.de);

// ---------- Stand ----------
function kol() {
  if (!spiel.kollektion) spiel.kollektion = {};
  const s = spiel.kollektion;
  s.uhren = s.uhren || {};
  s.entwuerfe = s.entwuerfe || 0; s.teile = s.teile || 0; s.gekauft = s.gekauft || 0; s.geoeffnet = s.geoeffnet || 0;
  s.zuordnung = s.zuordnung || [-1, -1, -1, -1, -1];
  s.launch = s.launch || {};
  return s;
}
const kolHat = u => !!kol().uhren[u.id];
const kolAnzahl = k => k.uhren.filter(kolHat).length;
const kolKomplett = k => kolAnzahl(k) === k.uhren.length;
const kolStufe = k => k.stufen.filter(n => kolAnzahl(k) >= n).length;   // 0–3
const kolUhrenGesamt = () => ALLE_UHREN.filter(kolHat).length;
const kolLaunches = () => KOLLEKTIONEN.filter(k => kol().launch[k.id]).length;
// Stufe des Set-Bonus einer bestimmten Kollektion an Filiale i (0, wenn dort nicht zugeordnet)
function kolAn(i, id) {
  if (!spiel.konzern) return 0;
  const ki = kol().zuordnung[i];
  return ki >= 0 && KOLLEKTIONEN[ki].id === id ? kolStufe(KOLLEKTIONEN[ki]) : 0;
}
// höchste Stufe einer Kollektion irgendwo im Konzern (für Effekte, die den ganzen Konzern betreffen)
const kolIrgendwo = id => Math.max(0, ...[0, 1, 2, 3, 4].map(i => kolAn(i, id)));
const kolNachbarn = i => [i - 1, i + 1].filter(j => j >= 0 && j < 5);

// ---------- Effekte (werden in konzern.js abgefragt) ----------
function kolGeldFaktor(i) {
  let x = 1 + KOL.launchBonus * kolLaunches();
  const renn = kolAn(i, 'renn'); if (renn) x *= 1.15;
  for (const j of kolNachbarn(i)) { const p = kolAn(j, 'perlen'); if (p) x *= [1, 1.10, 1.25, 1.5][p]; }
  if (kolAn(i, 'flieger') >= 3 && spiel.konzern.trend.geld !== i) x *= K.trendFaktor;   // eigener Dauer-Trend
  return x;
}
const kolRundenFaktor = i => (kolAn(i, 'renn') ? 1.15 : 1);
function kolSternFaktor(i) {
  let x = [1, 1.2, 1.5, 1.5][kolAn(i, 'astro')];
  for (const j of kolNachbarn(i)) if (kolAn(j, 'perlen') >= 3) x *= 1.25;
  return x;
}
const kolTopfPlus = i => [0, 1, 2, 96][kolAn(i, 'tiefsee')];          // Stufe 3: praktisch unbegrenzt (99)
const kolRabatt = i => [0, 0.15, 0.30, 0.30][kolAn(i, 'heritage')];
const kolMeilenFaktor = i => (kolAn(i, 'heritage') >= 3 ? 0.8 : 1);  // Meilensteine schon bei 20/40/80 …
const kolLimoHaeufiger = () => [1, 1.25, 1.25, 1.5][kolIrgendwo('gold')];
const kolLimoBelohnung = () => [1, 1, 2, 3][kolIrgendwo('gold')];
const kolTrendGewicht = i => [1, 3, 3, 3][kolAn(i, 'flieger')];
const kolTrendDauer = i => (kolAn(i, 'flieger') >= 2 ? 2 : 1);
const kolWerbAbkling = i => [1, 0.5, 0.5, 0][kolAn(i, 'bauhaus')];
const kolWerbDauer = i => (kolAn(i, 'bauhaus') >= 2 ? 2 : 1);
const kolOfflinePlus = () => (kolIrgendwo('nostalgie') ? 1 : 0);        // Stunden
const kolOfflineGeld = i => (kolAn(i, 'nostalgie') >= 2 ? 2 : 1);
const kolOfflineSterneFrei = i => kolAn(i, 'nostalgie') >= 3;
const kolGlueck = i => [0, 0.05, 0.10, 0.10][kolAn(i, 'diamant')];
const kolGlueckFaktor = i => (kolAn(i, 'diamant') >= 3 ? 10 : 5);
const kolJedeNte = i => [0, 0, 10, 5][kolAn(i, 'renn')];               // jede n-te Runde doppelt

// Extra-Auszahlung für n Runden (Rennstrecke: jede x-te Runde doppelt, Diamant: Glückstreffer)
function kolRundenExtra(i, f, n, proRunde) {
  let extra = 0, treffer = 0;
  const nte = kolJedeNte(i);
  if (nte) {
    const vorher = f.rz || 0; f.rz = vorher + n;
    extra += (Math.floor(f.rz / nte) - Math.floor(vorher / nte)) * proRunde;
  }
  const p = kolGlueck(i);
  if (p) {
    if (n <= 40) { for (let k = 0; k < n; k++) if (Math.random() < p) treffer++; }
    else treffer = Math.round(n * p);
    extra += treffer * proRunde * (kolGlueckFaktor(i) - 1);
  }
  return { extra, treffer };
}
// Astronomie Stufe 3: alle 10 min +1 ★ in jeden Topf
let kolAstroUhr = 0;
function kolTick(dt) {
  if (!kolIrgendwo('astro') || kolIrgendwo('astro') < 3) return;
  kolAstroUhr += dt;
  if (kolAstroUhr >= 600) {
    kolAstroUhr -= 600;
    spiel.konzern.f.forEach((f, i) => { f.topf = Math.min(kTopfGroesse(i), f.topf + 1); });
    meldung(t('kol.astroStern'));
  }
}

// ---------- Entwürfe, Uhren, Teile ----------
let kolLetzte = null;   // zuletzt geöffnete Uhr (für die Anzeige im Fenster)
function kolEntwurfGeben(n, grund) {
  if (n <= 0) return;
  kol().entwuerfe += n;
  if (grund) meldung(t('kol.entwurfDa', { n, g: grund }));
}
function kolZiehen() {
  let z = Math.random() * 100, s = 'g';
  for (const [k, v] of Object.entries(SELTEN)) { if (z < v.gewicht) { s = k; break; } z -= v.gewicht; }
  const pool = ALLE_UHREN.filter(u => u.s === s);
  return pool[Math.floor(Math.random() * pool.length)];
}
function kolOeffnen() {
  const s = kol();
  if (s.entwuerfe <= 0) return;
  s.entwuerfe--; s.geoeffnet++;
  const u = kolZiehen();
  if (kolHat(u)) { const p = SELTEN[u.s].teile; s.teile += p; kolLetzte = { u, doppelt: true, teile: p }; }
  else { kolUhrBekommen(u); kolLetzte = { u, doppelt: false }; }
  kolGebaut = '';
}
function kolUhrBekommen(u) {
  const s = kol(), k = u.k, stufeVorher = kolStufe(k);
  s.uhren[u.id] = true;
  if (kolKomplett(k) && !s.launch[k.id]) {
    s.launch[k.id] = true;
    meldung(t('kol.launch', { n: kolName(k), p: Math.round(KOL.launchBonus * 100) }));
  } else if (kolStufe(k) > stufeVorher) meldung(t('kol.stufeNeu', { n: kolName(k), s: kolStufe(k) }));
}
function kolBauen(id) {
  const u = ALLE_UHREN.find(x => x.id === id), s = kol();
  if (!u || kolHat(u) || s.teile < SELTEN[u.s].kosten) return;
  s.teile -= SELTEN[u.s].kosten;
  kolUhrBekommen(u); kolLetzte = { u, doppelt: false, gebaut: true };
  kolGebaut = '';
}
function kolKaufen() {
  const s = kol(), p = KOL.entwurfPreis(s.gekauft);
  if (spiel.sterne < p) return;
  spiel.sterne -= p; s.gekauft++; s.entwuerfe++;
  kolGebaut = '';
}
function kolZuordnen(ki, i) {
  const z = kol().zuordnung;
  if (z[i] === ki) { z[i] = -1; kolGebaut = ''; return; }   // nochmal tippen = entfernen
  const alt = z.indexOf(ki); if (alt >= 0) z[alt] = -1;       // jede Kollektion nur in einer Filiale
  z[i] = ki;
  kolGebaut = '';
}

// ---------- Fenster ----------
const uhrSvgCache = new Map();
function uhrSvg(u, hat) {
  const key = u.id + (hat ? '1' : '0');
  if (!uhrSvgCache.has(key)) {
    const k = u.k, pal = hat ? Object.assign({}, k.pal) : {};
    if (hat && u.s === 'l') Object.assign(pal, { C: '#f0c050', c: '#c8932e', g: '#fff6c0' });   // legendär: Goldgehäuse
    if (!hat) for (const c of 'SCFHKgpc') pal[c] = c === 'F' ? '#5a4a54' : '#3e3038';
    uhrSvgCache.set(key, spriteSvg({ bild: UHR_FORM[k.form], pal }));
  }
  return uhrSvgCache.get(key);
}
const kolBonusText = (k, st) => t('kol.b.' + k.id + st);
let kolGebaut = '';
function kolFensterAuf() { kol(); kolGebaut = ''; $('kolFenster').classList.add('offen'); kolAktualisieren(); }
function kolAktualisieren() {
  if (!imKonzern()) return;
  const s = kol();
  $('kolLabel').textContent = s.entwuerfe ? t('kol.knopfN', { n: s.entwuerfe }) : t('kol.knopf');
  $('kolBtn').classList.toggle('bereit', s.entwuerfe > 0);
  if (!$('kolFenster').classList.contains('offen')) return;
  const preis = KOL.entwurfPreis(s.gekauft);
  const aufbau = [SPRACHE, s.entwuerfe, s.teile, s.zuordnung.join(), kolUhrenGesamt(), spiel.sterne >= preis, kolLetzte && kolLetzte.u.id + kolLetzte.doppelt].join('|');
  if (aufbau === kolGebaut) return;
  kolGebaut = aufbau;
  $('kolStand').textContent = t('kol.stand', { a: kolUhrenGesamt(), b: ALLE_UHREN.length, k: kolLaunches(), p: Math.round(KOL.launchBonus * 100 * kolLaunches()) });
  // oben: Entwürfe & Teile
  let letzte = '';
  if (kolLetzte) {
    const u = kolLetzte.u, sel = SELTEN[u.s];
    letzte = `<div class="kolNeu" style="--sel:${sel.farbe}"><i>${uhrSvg(u, true)}</i><div><b>${uhrName(u)}</b>
      <div class="klein">${kolName(u.k)} · <span style="color:${sel.farbe}">${t('kol.sel.' + u.s)}</span></div>
      <div class="klein">${kolLetzte.doppelt ? t('kol.doppelt', { n: kolLetzte.teile }) : kolLetzte.gebaut ? t('kol.gebaut') : t('kol.neu')}</div></div></div>`;
  }
  $('kolOben').innerHTML = `<div class="kolVorrat">
      <div class="kolZahl"><b>${s.entwuerfe}</b><span class="klein">${t('kol.entwuerfe')}</span></div>
      <button class="kolOeffnen" data-kol="oeffnen" ${s.entwuerfe ? '' : 'disabled'}>${t('kol.oeffnen')}</button>
      <button class="kolKaufen" data-kol="kaufen" ${spiel.sterne >= preis ? '' : 'disabled'}>${t('kol.kaufen', { n: preis })}</button>
      <div class="kolZahl"><b>${s.teile}</b><span class="klein">${t('kol.teile')}</span></div>
    </div>${letzte}<p class="klein kolHinweis">${t('kol.hinweis')}</p>`;
  // Kollektionen
  $('kolListe').innerHTML = KOLLEKTIONEN.map((k, ki) => {
    const n = kolAnzahl(k), st = kolStufe(k), fil = s.zuordnung.indexOf(ki);
    const uhren = k.uhren.map(u => {
      const hat = kolHat(u), sel = SELTEN[u.s], kann = !hat && s.teile >= sel.kosten;
      return `<button class="kolUhr ${hat ? 'hat' : ''} ${kann ? 'kann' : ''}" style="--sel:${sel.farbe}" ${hat ? 'disabled' : `data-bauen="${u.id}"`}
        title="${uhrName(u)} (${t('kol.sel.' + u.s)})"><i>${uhrSvg(u, hat)}</i><span>${hat ? uhrName(u) : sel.kosten + ' ⚙'}</span></button>`;
    }).join('');
    const boni = k.stufen.map((need, x) => `<div class="kolBonus ${st > x ? 'an' : ''}"><b>${need === k.uhren.length ? t('kol.alle') : need}</b><span>${kolBonusText(k, x + 1)}</span></div>`).join('');
    const filialen = [0, 1, 2, 3, 4].map(i => `<button data-zu="${ki}:${i}" class="${fil === i ? 'gewaehlt' : ''}">${filialName(i)}</button>`).join('');
    return `<div class="kolKarte ${kolKomplett(k) ? 'komplett' : ''}" style="--kf:${k.farbe}">
      <div class="kolKopf"><b>${kolName(k)}</b><span class="klein">${n}/${k.uhren.length}${kolKomplett(k) ? ' · ' + t('kol.launchKurz') : ''}</span></div>
      <div class="kolUhren">${uhren}</div>
      <div class="kolBoni">${boni}</div>
      <div class="kolFilialen"><span class="klein">${fil >= 0 ? t('kol.in', { n: filialName(fil) }) : t('kol.keine')}</span><div>${filialen}</div></div>
    </div>`;
  }).join('');
}
$('kolBtn').addEventListener('click', kolFensterAuf);
$('kolZu').addEventListener('click', () => $('kolFenster').classList.remove('offen'));
$('kolFenster').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.kol === 'oeffnen') kolOeffnen();
  else if (b.dataset.kol === 'kaufen') kolKaufen();
  else if (b.dataset.bauen) kolBauen(b.dataset.bauen);
  else if (b.dataset.zu) { const [ki, i] = b.dataset.zu.split(':').map(Number); kolZuordnen(ki, i); }
  else return;
  kolAktualisieren();
});

// Fähnchen an der Filiale in der Stadt: Farbe der Kollektion + Punkte für die Stufe
function kolFahne(i, x, y) {
  const ki = kol().zuordnung[i];
  if (ki < 0) return;
  const k = KOLLEKTIONEN[ki], st = kolStufe(k);
  r(x - P, y - 9 - P, P * 2 + 1, 10 + P, F_BASIS.umriss); r(x, y - 9, 1, 10, '#d8d0c8');          // Stange
  r(x + 1 - P, y - 9 - P, 7 + 2 * P, 5 + 2 * P, F_BASIS.umriss); r(x + 1, y - 9, 7, 5, k.farbe);  // Fahne
  for (let n = 0; n < 3; n++) r(x + 2 + n * 2, y - 7, 1, 1, n < st ? '#ffffff' : 'rgba(0,0,0,.35)');
}
