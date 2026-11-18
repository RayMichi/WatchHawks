// ===============================================================
// 3. BERECHNUNGEN
// ===============================================================
const M = id => MODELLE.find(m => m.id === id);
const freieVitrinen = () => LADEN[spiel.stufe].vitrinen - spiel.modelle.length;
// Große Zahlen lesbar: 1.234.567 -> "1,23 Mio."
const EINHEITEN = { de: ['Mio.', 'Mrd.', 'Bio.', 'Brd.', 'Trio.', 'Trd.', 'Quad.'], en: ['M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'] };
function zahl(z) {
  if (z < 1e6) return Math.floor(z).toLocaleString(LOCALE());
  const einheiten = EINHEITEN[SPRACHE] || EINHEITEN.de;
  const stufe = Math.min(Math.floor(Math.log10(z) / 3) - 2, einheiten.length - 1);
  const wert = z / Math.pow(1000, stufe + 2);
  return wert.toLocaleString(LOCALE(), { maximumFractionDigits: 2 }) + ' ' + einheiten[stufe];
}
// Kurzform für die Anzeige oben: ab 10.000 → 10 Tsd. / 10k, damit die Box gleich breit bleibt
const KURZ = { de: ['Tsd.', 'Mio.', 'Mrd.', 'Bio.', 'Brd.', 'Trio.', 'Trd.', 'Quad.'], en: ['k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'] };
function kurz(z) {
  if (z < 1e4) return Math.floor(z).toLocaleString(LOCALE());
  const e = KURZ[SPRACHE] || KURZ.de;
  const stufe = Math.min(Math.floor(Math.log10(z) / 3) - 1, e.length - 1);
  let wert = z / Math.pow(1000, stufe + 1);
  const stellen = wert < 10 ? 2 : wert < 100 ? 1 : 0;          // immer höchstens 3 Ziffern
  wert = Math.floor(wert * Math.pow(10, stellen)) / Math.pow(10, stellen);
  return wert.toLocaleString(LOCALE(), { maximumFractionDigits: stellen }) + (SPRACHE === 'en' ? '' : ' ') + e[stufe];
}
const dauer = s => s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.floor(s % 3600 / 60)} min` : `${Math.floor(s / 60)} min`;
const sek = s => s.toLocaleString(LOCALE(), { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// ===============================================================
// 4. ARBEITSSCHRITTE
// ===============================================================

// Fertige Uhren an die nächste Station weitergeben, wenn dort Platz ist
// (Vom Polierplatz zum Packtisch geht es nur per Knopf "Verpacken".)
function weiterreichen() {
  spiel.packs.forEach((k, i) => {
    if (k && k.fertig && spiel.lager.length < lagerPlatz()) { spiel.lager.push(k.id); spiel.packs[i] = null; }
  });
  if (spiel.werkbank.fertig && !spiel.polier) {
    spiel.polier = { id: spiel.werkbank.id, rest: M(spiel.werkbank.id).polier, fertig: false };
    neueUhrAufWerkbank();
  }
}
function neueUhrAufWerkbank() {
  spiel.werkbank = { id: spiel.aktiv, rest: M(spiel.aktiv).bau, fertig: false };
}

function bauen() {
  const w = spiel.werkbank;
  if (w.fertig) return;
  w.rest -= bauKraft() * boostFaktor('turbo');
  { const t = layout().wt; funkeln(t.x + 14 + Math.random() * 16, t.y + 2 + Math.random() * 10); }
  if (w.rest <= 0) { w.rest = 0; w.fertig = true; }
  weiterreichen();
}

function polieren() {
  const p = spiel.polier;
  if (!p || p.fertig) return;
  p.rest -= polierKraft() * boostFaktor('turbo');
  polierDreh = 0.3;
  { const t = layout().pt; funkeln(t.x + 16 + Math.random() * 16, t.y + 2 + Math.random() * 10); }
  if (p.rest <= 0) { p.rest = 0; p.fertig = true; }
  weiterreichen();
}

// Ein Klick: polierte Uhr kommt auf einen freien Packtisch, dann läuft der Timer
function verpacken() {
  const p = spiel.polier, i = freierTisch();
  if (!p || !p.fertig || i < 0) return;
  spiel.packs[i] = { id: p.id, rest: packZeit(), fertig: false };
  spiel.polier = null;
  const T = layout().packs[i];
  funkeln(T.x + 18, T.y);
  weiterreichen();
}

// Läuft in der Spielschleife: zählt die Verpack-Zeit auf allen Tischen runter
function packenWeiter(dt) {
  spiel.packs.forEach((k, i) => {
    if (!k || k.fertig) return;
    k.rest -= dt;
    if (k.rest <= 0) { k.rest = 0; k.fertig = true; const T = layout().packs[i]; funkeln(T.x + 18, T.y - 2); }
  });
  weiterreichen();
}

// Kasse: verkauft sofort, ohne Wartezeit
function verkaufen() {
  if (spiel.lager.length === 0) return;
  // die teuerste Uhr im Lager geht zuerst
  let best = 0;
  spiel.lager.forEach((id, i) => { if (M(id).preis > M(spiel.lager[best]).preis) best = i; });
  const m = M(spiel.lager.splice(best, 1)[0]);
  const betrag = m.preis * preisFaktor() * boostFaktor('preis');
  spiel.geld += betrag;
  spiel.verdient += betrag;
  spiel.rundeVerdient += betrag;
  spiel.besterVerkauf = Math.max(spiel.besterVerkauf, betrag);
  spiel.proModell[m.id] = (spiel.proModell[m.id] || 0) + 1;
  spiel.verkauft++;
  texte.push({ text: '+' + zahl(betrag) + ' €', t: 0 });
  // Erfolg "Blitzbedienung": Kunde stand höchstens 1 Sekunde am Tresen
  const wartezeit = kundeWeg < 1 ? 0 : zeit - kundeDaSeit;
  if (wartezeit <= 1) spiel.schnellBedient++;
  gehend.push({ t: 0, farbe: kundeFarbe });       // Kunde geht mit der Uhr raus
  kundeFarbe = KUNDENFARBEN[Math.floor(Math.random() * KUNDENFARBEN.length)];
  kundeWeg = 0;                                    // nächster Kunde kommt rein (nur Optik)
  weiterreichen();
}

// ===============================================================
// 4b. MITARBEITER – arbeiten automatisch in der Spielschleife
// ===============================================================
const mitarbeiterPreis = m => Math.ceil(m.grundpreis * Math.pow(2, spiel.team[m.id]));
const takt = { bau: 0, polier: 0, pack: 0, verkauf: 0 };   // interne Zähler, nicht gespeichert

function mitarbeiterArbeiten(dt) {
  const team = spiel.team;   // nicht „t“ – das ist die Übersetzungsfunktion
  // Uhrmacher und Polierer "klicken" in ihrem Tempo
  const klicker = [
    ['bau', bauen, () => !spiel.werkbank.fertig],
    ['polier', polieren, () => spiel.polier && !spiel.polier.fertig]
  ];
  for (const [id, aktion, kannArbeiten] of klicker) {
    if (!team[id]) continue;
    takt[id] = Math.min(takt[id] + dt * klickRate(team[id]), 5);
    let n = 0;
    while (takt[id] >= 1 && n++ < 200) {
      if (!kannArbeiten()) { takt[id] = Math.min(takt[id], 1); break; }
      takt[id] -= 1;
      aktion();
    }
  }
  // Packer: legt die polierte Uhr nach kurzer Zeit auf einen freien Packtisch
  if (team.pack && spiel.polier && spiel.polier.fertig && freierTisch() >= 0) {
    takt.pack += dt;
    if (takt.pack >= reaktion(team.pack, PACKER_START)) { takt.pack = 0; verpacken(); }
  } else takt.pack = 0;
  // Verkäuferin: verkauft, solange etwas im Lager ist
  if (team.verkauf && spiel.lager.length) {
    const d = verkaufIntervall();
    takt.verkauf = Math.min(takt.verkauf + dt, d * 20);
    let n = 0;
    while (takt.verkauf >= d && spiel.lager.length && n++ < 200) { takt.verkauf -= d; verkaufen(); }
  } else takt.verkauf = 0;
}

// Sekunden pro Verkauf der Verkäuferin
const verkaufIntervall = (stufe = spiel.team.verkauf) => verkaufReaktion(stufe);

function mitarbeiterKaufen(m) {
  if (!spiel.upg.manager || spiel.team[m.id] >= maxStufe(m)) return;
  if (bezahlen(mitarbeiterPreis(m))) spiel.team[m.id]++;
}

// ===============================================================
// 4c. ERFOLGE
// ===============================================================
// Neue erreichte Stufen melden
function erfolgePruefen() {
  for (const e of ERFOLGE) {
    const n = erreicht(e);
    if (n > (spiel.erfolgGemeldet[e.id] || 0)) {
      spiel.erfolgGemeldet[e.id] = n;
      if (n > gesammelt(e)) meldung(t('m.erfolg', { n: nm('erfolge', e.id, e.name) }) + (e.stufen.length > 1 ? t('m.erfolgStufe', { s: n }) : ''));
    }
  }
}
// Nächste Stufe einsammeln -> Belohnung wirkt
function erfolgEinsammeln(id) {
  const e = ERFOLGE.find(x => x.id === id);
  const k = gesammelt(e);
  if (k >= e.stufen.length || erreicht(e) <= k) return;
  const st = e.stufen[k];
  spiel.erfolgStufe[id] = k + 1;
  if (st.art === 'geld') spiel.geld += st.wert;
  meldung(t('m.eingesammelt', { b: BELOHNUNG_TEXT[st.art](st.wert) }));
}

// ===============================================================
// 4d. VIP-KUNDEN & BOOSTS
//    Ab und zu kommt ein VIP. Anklicken bringt zufällig:
//    Trinkgeld, 20 s ×5 Verkaufspreis oder 20 s Turbo (alles ×2).
// ===============================================================
const VIP_ABSTAND = 75;      // Sekunden im Schnitt zwischen zwei VIPs
const VIP_BLEIBT = 12;       // so lange wartet ein VIP, bevor er wieder geht
let vip = null;              // { weg: 0..1, bleibt: Sekunden }
let naechsterVip = 40 + Math.random() * 40;
const VIP_SPERRE = 300;     // in den ersten 5 Minuten Spielzeit kommt kein VIP

const boostFaktor = art => spiel.boost && spiel.boost.art === art ? spiel.boost.faktor : 1;
function boostUpdate(dt) {
  if (!spiel.boost) return;
  spiel.boost.rest -= dt;
  if (spiel.boost.rest <= 0) spiel.boost = null;
}
function vipUpdate(dt) {
  if (!vip) {
    if (spiel.spielzeit < VIP_SPERRE) return;
    naechsterVip -= dt * (1 + summe('vip') / 100);
    if (naechsterVip <= 0) { vip = { weg: 0, bleibt: VIP_BLEIBT }; meldung(t('m.vipDa')); }
    return;
  }
  if (vip.weg < 1) vip.weg = Math.min(1, vip.weg + dt / 1.5);
  else if ((vip.bleibt -= dt) <= 0) vipWeg();
}
function vipWeg() { vip = null; naechsterVip = VIP_ABSTAND * (0.6 + Math.random() * 0.8); }
function vipKlick() {
  if (!vip) return;
  spiel.vips++;
  const teuerstes = MODELLE.filter(m => spiel.modelle.includes(m.id)).pop();
  const wurf = Math.random();
  if (wurf < 0.4) {
    const tip = Math.max(30, 25 * teuerstes.preis * preisFaktor());
    spiel.geld += tip; spiel.verdient += tip; spiel.rundeVerdient += tip;
    meldung(t('m.vipTip', { x: zahl(tip) }));
  } else if (wurf < 0.7) {
    spiel.boost = { art: 'preis', faktor: 5, rest: 20 };
    meldung(t('m.vipPreis'));
  } else {
    spiel.boost = { art: 'turbo', faktor: 2, rest: 20 };
    meldung(t('m.vipTurbo'));
  }
  for (let i = 0; i < 6; i++) funkeln(vipPos().x + Math.random() * 10, vipPos().y + Math.random() * 12);
  vipWeg();
}
// Position des VIP im Laden (läuft von der Tür nach links neben den Tresen)
function vipPos() {
  const w = vip ? vip.weg : 1;
  const L = layout();
  return { x: Math.round(L.tuer.x + (L.vip.x - L.tuer.x) * w), y: Math.round(L.tuer.y + (L.vip.y - L.tuer.y) * w) };
}

// ===============================================================
// 4e. NEUE FILIALE (Prestige)
// ===============================================================
const BLEIBT = ['verkauft', 'verdient', 'klicks', 'schnellBedient', 'erfolgStufe', 'erfolgGemeldet',
                'filiale', 'sterne', 'gesamtSterne', 'ruf', 'raritaeten', 'vips', 'profil',
                'gems', 'sprache', 'spielzeit', 'besterVerkauf', 'proModell', 'tabFrei', 'tabGesehen', 'knopfFrei'];
function neueFiliale() {
  const neu = sterneFuer(spiel.rundeVerdient);
  if (neu < 1) return;
  const behalten = {};
  for (const k of BLEIBT) behalten[k] = spiel[k];
  spiel = Object.assign(neuesSpiel(), behalten);
  spiel.filiale++;
  spiel.sterne += neu;
  spiel.gesamtSterne += neu;
  // Startboni aus dem Ruf-Shop
  spiel.geld = STARTKAPITAL[spiel.ruf.kapital || 0];
  if (spiel.ruf.kontakte || spiel.ruf.stamm) spiel.upg.manager = 1;
  if (spiel.ruf.stamm) for (const id in spiel.team) spiel.team[id] = 1;
  for (const k in takt) takt[k] = 0;
  vip = null; kundeWeg = 1;
  meldung(t('m.filiale', { n: filialName(), s: neu }));
  speichern();
}

function rufKaufen(r) {
  const n = spiel.ruf[r.id] || 0;
  if (n >= r.max || spiel.sterne < r.kosten(n)) return;
  spiel.sterne -= r.kosten(n);
  spiel.ruf[r.id] = n + 1;
  // Sofort-Effekte auch in der laufenden Filiale
  if (r.id === 'kontakte' || r.id === 'stamm') spiel.upg.manager = 1;
  if (r.id === 'stamm') for (const id in spiel.team) spiel.team[id] = Math.max(1, spiel.team[id]);
}

function raritaetErsteigern() {
  const frei = RARITAETEN.filter(r => !spiel.raritaeten.includes(r.id));
  if (!frei.length || spiel.sterne < raritaetPreis()) return;
  spiel.sterne -= raritaetPreis();
  const r = frei[Math.floor(Math.random() * frei.length)];
  spiel.raritaeten.push(r.id);
  meldung(t('m.ersteigert', { n: nm('raritaeten', r.id, r.name) }));
}

// ===============================================================
// 4f. OFFLINE-FORTSCHRITT
//    Nur wenn alle vier Mitarbeiter eingestellt sind. Gerechnet wird
//    mit dem langsamsten Schritt der Kette (= Engpass).
// ===============================================================
function offlineBerechnen() {
  const sek = Math.min((Date.now() - (spiel.zuletzt || Date.now())) / 1000, offlineStunden() * 3600);
  if (sek < 60) return;
  const team = spiel.team;   // nicht „t“ nennen – das ist die Übersetzungsfunktion!
  if (!(team.bau && team.polier && team.pack && team.verkauf)) return;
  const m = M(spiel.aktiv);
  const rate = Math.min(
    klickRate(team.bau) * bauKraft() / m.bau,
    klickRate(team.polier) * polierKraft() / m.polier,
    Math.min(packTische() / (packZeit() + reaktion(team.pack, PACKER_START)), 1 / reaktion(team.pack, PACKER_START)),
    1 / verkaufIntervall()
  );
  const uhren = Math.floor(rate * sek);
  if (uhren < 1) return;
  const geld = uhren * m.preis * preisFaktor();
  spiel.geld += geld; spiel.verdient += geld; spiel.rundeVerdient += geld; spiel.verkauft += uhren;
  meldung(t('m.zurueck', { d: dauer(sek), u: zahl(uhren), x: zahl(geld) }), 8000);
}

// ===============================================================
// 5. KÄUFE IM MENÜ
// ===============================================================
function bezahlen(b) { if (spiel.geld < b) return false; spiel.geld -= b; return true; }
function modellFreischalten(m) {
  if (freieVitrinen() < 1 || !bezahlen(m.freischalten)) return;
  spiel.modelle.push(m.id);
  modellWaehlen(m);
}
function modellWaehlen(m) {
  spiel.aktiv = m.id;
  if (!spiel.werkbank.fertig) neueUhrAufWerkbank();  // angefangene Uhr wird ersetzt
}
function ladenAusbauen() { const n = LADEN[spiel.stufe + 1]; if (ladenAusbauMoeglich() && bezahlen(n.preis)) spiel.stufe++; }
function upgradeKaufen(id) {
  const u = UPGRADES[id], n = spiel.upg[id];
  if (id === 'tisch2' && spiel.filiale < TISCH2_AB) return;
  if (n < u.max && bezahlen(Math.ceil(u.preis(n)))) { spiel.upg[id]++; weiterreichen(); }
}
