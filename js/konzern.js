// ===============================================================
// 12. KONZERN
//     Gründung (50 freie ★, Geld und restliche Sterne bleiben) → Dach legt sich auf den Laden →
//     Zoom raus auf die Stadt → Lisa erklärt → ab jetzt ist die Stadt das Spiel.
//     Jede Filiale läuft automatisch in Runden (kleine Läden oft & wenig, große selten & viel,
//     pro Sekunde gleich viel). Ausbau mit €, Sonder-Upgrades mit ★, Sterne sammeln sich in Töpfen.
//     Dazu: Meilensteine, Spezialisierung, Trends, Werbekampagne, Limousine (VIP).
// ===============================================================
const konzern = { phase: null, t: 0, bild: null, quelle: null, waehlen: false, schwebe: [] };
const ZU_DAUER = 1.0, ZOOM_DAUER = 2.2;
const konzernAktiv = () => ['zoom', 'dialog', 'stadt'].includes(konzern.phase);
const imKonzern = () => !!spiel.konzern;

// ---------- Zahlen (zum Balancen alles hier) ----------
const K = {
  runde:      [2, 6, 20, 60, 180],      // Sekunden pro Runde (Stufe 1, ohne Meilensteine)
  proSek:     [600, 1500, 4000, 12000, 40000],          // € pro Sekunde und Stufe (je Filiale)
  preisStart: [1e5, 4e5, 1.5e6, 6e6, 2.5e7],          // erster Ausbau je Filiale
  preisFaktor: [1.07, 1.09, 1.11, 1.13, 1.15],         // Preis steigt pro Stufe (klein: schnell, groß: langsam)
  meilensteine: [25, 50, 100, 150, 200, 300, 400],       // pro Filiale: Runde doppelt so schnell
  konzernMeilensteine: [25, 50, 100, 200, 300, 400],      // alle Filialen: alles ×2
  umsatzFaktor: 1.5,                    // Spezialisierung Umsatz
  sternZeit:  [3600, 2400, 1500, 900, 600],   // Sekunden pro Stern bei Stufe 1 (große Filialen = mehr Sterne)
  sternProStufe: 0.03,                  // jede Ausbaustufe: Sterne 3 % schneller
  topf:       3, tresorPlus: 2,         // Sternentopf: Platz + pro Tresor-Stufe
  spezStufen: [10, 25, 50],             // ab diesen Stufen gibt es eine Spezialisierung
  trendDauer: 600, trendFaktor: 3,
  kampagneFaktor: 3, kampagneDauer: 60, kampagneAbkling: 600,
  limoAbstand: 90, limoBleibt: 12, limoSperre: 30,
};
const K_ZENTRALE = [
  { id: 'marketing', icon: 'verkauf', max: 10, kosten: n => 20 * Math.pow(2, n) },   // +50 % € je Stufe
  { id: 'jaeger',    icon: 'stern',   max: 10, kosten: n => 15 * Math.pow(2, n) },   // Sterne +25 % schneller
  { id: 'chauffeur', icon: 'vip',     max: 5,  kosten: n => 10 * Math.pow(2, n) },   // Limos 25 % häufiger, Belohnung +50 %
  { id: 'agentur',   icon: 'upgrades',max: 5,  kosten: n => 10 * Math.pow(2, n) },   // Werbekampagne: Abklingzeit −15 %, +15 s
];
const K_LEITER = 15, kTresorKosten = n => 5 * Math.pow(2, n), kTurboKosten = n => 10 * Math.pow(3, n);
const K_TREND_TEXT = ['trend.hinterhof', 'trend.fussgaenger', 'trend.ezk', 'trend.haupt', 'trend.pracht'];

function neuerKonzern() {
  return {
    f: K.runde.map(() => ({ stufe: 1, t: 0, topf: 0, leiter: false, tresor: 0, turbo: 0, spez: [] })),
    zentrale: { marketing: 0, jaeger: 0, chauffeur: 0, agentur: 0 },
    trend: { geld: 1, stern: 3, rest: K.trendDauer },
    kampagne: { f: -1, rest: 0, abkling: 0 },
    boost: null, menge: 1,
    verdient: 0, limos: 0, gesammelt: 0, kampagnen: 0, gegruendet: Date.now(),
  };
}

// ---------- Rechnen ----------
const kAnzahl = (liste, w) => liste.filter(x => x === w).length;
const kSelbstMeilen = st => K.meilensteine.filter(m => st >= m).length;
const kMinStufe = () => Math.min(...spiel.konzern.f.map(f => f.stufe));
const kKonzernMeilen = () => K.konzernMeilensteine.filter(m => kMinStufe() >= m).length;
const kBoost = art => { const b = spiel.konzern.boost; return b && b.art === art ? b.faktor : 1; };
function kProSek(i) {   // € pro Sekunde einer Filiale
  const kz = spiel.konzern, f = kz.f[i];
  let x = K.proSek[i] * f.stufe * Math.pow(2, kSelbstMeilen(f.stufe)) * Math.pow(2, kKonzernMeilen()) * Math.pow(2, f.turbo);
  x *= Math.pow(K.umsatzFaktor, kAnzahl(f.spez, 'umsatz')) * Math.pow(1.25, kAnzahl(f.spez, 'tempo'));
  if (kz.trend.geld === i) x *= K.trendFaktor;
  if (kz.kampagne.f === i && kz.kampagne.rest > 0) x *= K.kampagneFaktor;
  x *= (1 + 0.5 * kz.zentrale.marketing) * kBoost('preis') * kBoost('turbo');
  return x;
}
const kGesamtProSek = () => spiel.konzern.f.reduce((s, _, i) => s + kProSek(i), 0);
function kRunde(i) {    // Sekunden pro Runde (nur Optik/Rhythmus – das Geld pro Sekunde steckt in kProSek)
  const f = spiel.konzern.f[i];
  return K.runde[i] / Math.pow(2, kSelbstMeilen(f.stufe)) / Math.pow(1.25, kAnzahl(f.spez, 'tempo')) / kBoost('turbo');
}
function kSternRate(i) { // Sterne pro Sekunde
  const kz = spiel.konzern, f = kz.f[i];
  let r = 1 / K.sternZeit[i] * (1 + K.sternProStufe * (f.stufe - 1)) * Math.pow(2, kAnzahl(f.spez, 'prestige')) * Math.pow(1.25, kAnzahl(f.spez, 'tempo'));
  if (kz.trend.stern === i) r *= K.trendFaktor;
  return r * (1 + 0.25 * kz.zentrale.jaeger);
}
const kTopfGroesse = i => K.topf + K.tresorPlus * spiel.konzern.f[i].tresor;
const kAusbauPreis = (i, st, n = 1) => { const g = K.preisFaktor[i]; return K.preisStart[i] * Math.pow(g, st - 1) * (Math.pow(g, n) - 1) / (g - 1); };
function kKaufMenge(i) {  // wie viele Stufen gekauft werden (×1, ×10, Max)
  const st = spiel.konzern.f[i].stufe, m = spiel.konzern.menge;
  if (m !== 'max') return m;
  const g = K.preisFaktor[i];
  let n = Math.floor(Math.log(1 + spiel.geld * (g - 1) / (K.preisStart[i] * Math.pow(g, st - 1))) / Math.log(g));
  return Math.max(1, n);
}
const kSpezOffen = i => { const f = spiel.konzern.f[i]; return f.spez.length < K.spezStufen.length && f.stufe >= K.spezStufen[f.spez.length]; };
const kSternBereit = () => spiel.konzern.f.reduce((s, f) => s + (f.leiter ? 0 : Math.floor(f.topf)), 0);
const kKampagneAbkling = () => K.kampagneAbkling * Math.pow(0.85, spiel.konzern.zentrale.agentur);
const kKampagneDauer = () => K.kampagneDauer + 15 * spiel.konzern.zentrale.agentur;

// ---------- Aktionen ----------
function kAusbauen(i) {
  const f = spiel.konzern.f[i], n = kKaufMenge(i), p = kAusbauPreis(i, f.stufe, n);
  if (!bezahlen(p)) return;
  const vorher = kKonzernMeilen(), selbst = kSelbstMeilen(f.stufe);
  f.stufe += n;
  if (kSelbstMeilen(f.stufe) > selbst) meldung(t('k.meilenstein', { n: filialName(i) }));
  if (kKonzernMeilen() > vorher) meldung(t('k.konzernMeilenstein'));
}
function kSterneEinsammeln(nur = -1) {
  let n = 0;
  spiel.konzern.f.forEach((f, i) => {
    if (f.leiter || (nur >= 0 && i !== nur)) return;
    const k = Math.floor(f.topf); f.topf -= k; n += k;
  });
  if (!n) return;
  spiel.sterne += n; spiel.gesamtSterne += n; spiel.konzern.gesammelt += n;
  konzern.schwebe.push({ text: `+${n} ★`, i: nur, alter: 0, farbe: '#9ad8ff' });
}
function kStarUpgrade(i, art) {
  const f = spiel.konzern.f[i];
  const p = art === 'leiter' ? K_LEITER : art === 'tresor' ? kTresorKosten(f.tresor) : kTurboKosten(f.turbo);
  if ((art === 'leiter' && f.leiter) || spiel.sterne < p) return;
  spiel.sterne -= p;
  if (art === 'leiter') { kSterneEinsammeln(i); f.leiter = true; }
  else f[art]++;
}
function kZentraleKaufen(z) {
  const n = spiel.konzern.zentrale[z.id], p = z.kosten(n);
  if (n >= z.max || spiel.sterne < p) return;
  spiel.sterne -= p; spiel.konzern.zentrale[z.id]++;
}
function kSpezWaehlen(i, art) { if (kSpezOffen(i)) { spiel.konzern.f[i].spez.push(art); gebaut = ''; } }
function kKampagneStarten() {
  const kz = spiel.konzern;
  if (kz.kampagne.abkling > 0) return;
  konzern.waehlen = !konzern.waehlen;
  if (konzern.waehlen) meldung(t('k.kampagneWaehlen'));
}
function kKampagneAuf(i) {
  const kz = spiel.konzern;
  konzern.waehlen = false;
  kz.kampagne = { f: i, rest: kKampagneDauer(), abkling: kKampagneAbkling() };
  kz.kampagnen++;
  meldung(t('k.kampagneLaeuft', { n: filialName(i) }));
}

// ---------- Limousine (wie VIP-Kunde) ----------
let limo = null, naechsteLimo = K.limoSperre;
function limoUpdate(dt) {
  if (!limo) {
    naechsteLimo -= dt * (1 + 0.25 * spiel.konzern.zentrale.chauffeur);
    if (naechsteLimo <= 0) limo = { phase: 'kommt', x: 0, bleibt: K.limoBleibt };
    return;
  }
  if (limo.phase === 'kommt') { limo.x = Math.min(1, limo.x + dt / 2.5); if (limo.x >= 1) limo.phase = 'wartet'; }
  else if (limo.phase === 'wartet') { limo.bleibt -= dt; if (limo.bleibt <= 0) limo.phase = 'faehrt'; }
  else { limo.x += dt / 2.5; if (limo.x >= 2) limoWeg(); }
}
function limoWeg() { limo = null; naechsteLimo = K.limoAbstand * (0.6 + Math.random() * 0.8); }
function limoKlick() {
  if (!limo || limo.phase !== 'wartet') return;
  const kz = spiel.konzern, extra = 1 + 0.5 * kz.zentrale.chauffeur, z = Math.random();
  kz.limos++;
  if (z < 0.4) {
    const g = kGesamtProSek() * 120 * extra;
    spiel.geld += g; spiel.verdient += g; kz.verdient += g;
    meldung(t('k.limoGeld', { x: zahl(g) }));
  } else if (z < 0.7) { kz.boost = { art: 'preis', faktor: 5, rest: 30 * extra }; meldung(t('k.limoPreis', { s: Math.round(30 * extra) })); }
  else { kz.boost = { art: 'turbo', faktor: 2, rest: 30 * extra }; meldung(t('k.limoTurbo', { s: Math.round(30 * extra) })); }
  limo.phase = 'faehrt';
}

// ---------- Ablauf pro Bild ----------
function konzernTick(dt) {
  const kz = spiel.konzern;
  if (kz.boost) { kz.boost.rest -= dt; if (kz.boost.rest <= 0) kz.boost = null; }
  if (kz.kampagne.rest > 0) kz.kampagne.rest = Math.max(0, kz.kampagne.rest - dt);
  if (kz.kampagne.abkling > 0) kz.kampagne.abkling = Math.max(0, kz.kampagne.abkling - dt);
  kz.trend.rest -= dt;
  if (kz.trend.rest <= 0) neuerTrend(true);
  kz.f.forEach((f, i) => {
    const runde = kRunde(i);
    f.t += dt;
    if (f.t >= runde) {
      const n = Math.floor(f.t / runde); f.t -= n * runde;
      const g = kProSek(i) * runde * n;
      spiel.geld += g; spiel.verdient += g; kz.verdient += g;
      if (runde >= 0.8) konzern.schwebe.push({ text: '+' + kurz(g) + ' €', i, alter: 0, farbe: '#ffd77a' });
    }
    const cap = kTopfGroesse(i);
    f.topf = Math.min(cap, f.topf + kSternRate(i) * dt);
    if (f.leiter && f.topf >= 1) { const k = Math.floor(f.topf); f.topf -= k; spiel.sterne += k; spiel.gesamtSterne += k; kz.gesammelt += k; }
  });
  limoUpdate(dt);
  for (const s of konzern.schwebe) s.alter += dt;
  konzern.schwebe = konzern.schwebe.filter(s => s.alter < 1.4).slice(-20);
}
function neuerTrend(melden) {
  const kz = spiel.konzern, n = kz.f.length;
  const geld = Math.floor(Math.random() * n);
  let stern = Math.floor(Math.random() * (n - 1)); if (stern >= geld) stern++;
  kz.trend = { geld, stern, rest: K.trendDauer };
  if (melden) meldung(t('k.trendNeu', { a: filialName(geld), b: filialName(stern) }));
}
// Offline: Geld pro Sekunde × Zeit, Sterntöpfe füllen sich (bis zur Obergrenze, Filialleiter sammeln ein)
function konzernOffline() {
  const kz = spiel.konzern;
  const weg = Math.min((Date.now() - (spiel.zuletzt || Date.now())) / 1000, offlineStunden() * 3600);
  if (weg < 60) return;
  kz.boost = null; kz.kampagne.rest = 0;
  const g = kGesamtProSek() * weg;
  spiel.geld += g; spiel.verdient += g; kz.verdient += g;
  let st = 0;
  kz.f.forEach((f, i) => {
    const neu = kSternRate(i) * weg;
    if (f.leiter) { const k = Math.floor(f.topf + neu); f.topf = (f.topf + neu) - k; st += k; }
    else f.topf = Math.min(kTopfGroesse(i), f.topf + neu);
  });
  spiel.sterne += st; spiel.gesamtSterne += st; kz.gesammelt += st;
  kz.trend.rest -= weg; if (kz.trend.rest <= 0) neuerTrend(false);
  kz.kampagne.abkling = Math.max(0, kz.kampagne.abkling - weg);
  setTimeout(() => meldung(t('k.offline', { z: dauer(weg), x: zahl(g) })), 800);
}

// ---------- Gründung ----------
function konzernStarten(test = false) {
  if (konzern.phase || intro.phase || imKonzern()) return;
  if (!test && spiel.sterne < KONZERN_PREIS) return;
  $('menue').classList.remove('offen');
  fensterZu();
  document.body.classList.add('intro', 'konzern');
  intro.art = 'konzern';               // Dachschild zeigt den Filialnamen
  konzern.phase = 'zu'; konzern.t = 0;
  dachP = 0.999;                        // Dach kommt von oben
}
function konzernUpdate(dt) {
  if (!konzern.phase) return;
  konzern.t += dt;
  if (konzern.phase === 'zu') {
    dachP = Math.max(0, 1 - konzern.t / ZU_DAUER);
    if (dachP <= 0) {
      zeichnen();   // fertiges Laden-Bild mit Dach einfrieren – das wird gleich kleiner
      const L = layout();
      konzern.bild = document.createElement('canvas');
      konzern.bild.width = cv.width; konzern.bild.height = cv.height;
      konzern.bild.getContext('2d').drawImage(cv, 0, 0);
      konzern.quelle = { x: (lox - 4) * U, y: (loy - 4) * U, w: (L.W + 8) * U, h: (L.H + 8) * U };
      konzern.phase = 'zoom'; konzern.t = 0;
    }
  } else if (konzern.phase === 'zoom' && konzern.t >= ZOOM_DAUER) {
    konzern.phase = 'dialog'; konzern.bild = null;
    intro.phase = 'dialog'; intro.art = 'konzern'; intro.nr = 0; intro.wander = 1;
    const el = $('intro'); el.hidden = false; el.className = 'dialog';
    boxHoeheFestlegen(); textZeigen(0);
  }
}
function konzernDialogEnde() {
  clearInterval(intro.timer);
  intro.phase = null;
  $('intro').hidden = true;
  spiel.sterne = Math.max(0, spiel.sterne - KONZERN_PREIS);
  spiel.konzern = neuerKonzern();
  neuerTrend(false);
  spiel.boost = null; vip = null;
  konzernModusAn();
  speichern();
}
function konzernModusAn() {
  konzern.phase = 'stadt';
  dachP = 0;
  document.body.classList.remove('intro', 'konzern');
  document.body.classList.add('konzernModus');
  tab = 'kfilialen'; gebaut = '';
}

// Tippen in der Stadt: Limo, Filiale (Kampagne wählen, Sterne einsammeln, Spezialisierung)
let kAbb = null;   // Abbildung Welt → Bildschirm (aus stadtRendern)
cv.addEventListener('click', e => {
  if (!imKonzern() || konzern.phase !== 'stadt' || !kAbb) return;
  const rect = cv.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (cv.width / rect.width), py = (e.clientY - rect.top) * (cv.height / rect.height);
  const wx = px / kAbb.U - kAbb.lox, wy = py / kAbb.U - kAbb.loy;
  if (limo && limo.phase === 'wartet' && kAbb.limo && wx > kAbb.limo.x - 6 && wx < kAbb.limo.x + kAbb.limo.w + 6 && wy > kAbb.limo.y - 12 && wy < kAbb.limo.y + kAbb.limo.h + 6) { limoKlick(); return; }
  const M = stadtMasse();
  for (let i = 0; i < 5; i++) {
    const b = blockPos(i, M);
    if (wx >= b.x && wx <= b.x + BLOCK_W && wy >= b.y && wy <= b.y + BLOCK_H) {
      if (konzern.waehlen) kKampagneAuf(i);
      else if (kSpezOffen(i)) { $('menue').classList.add('offen'); tabWaehlen('kfilialen'); gebaut = ''; }
      else kSterneEinsammeln(i);
      return;
    }
  }
});

// ---------------------------------------------------------------
// Stadt-Layout: 6 Blöcke (5 Filialen + Baustelle für die Zentrale), dazwischen Straßen.
// Querformat 3 × 2, Hochformat 2 × 3.
// ---------------------------------------------------------------
const BLOCK_W = 84, BLOCK_H = 72, STRASSE = 12;
// Gebäude pro Block (Position im Block, Größe ≈ Seitenverhältnis des großen Ladens samt Dach)
const STADT_HAEUSER = [
  { x: 25, y: 14, w: 34, h: 25 },    // Hinterhof
  { x: 22, y: 8,  w: 40, h: 28 },    // Fußgängerzone
  { x: 14, y: 5,  w: 56, h: 38 },    // Einkaufszentrum
  { x: 18, y: 10, w: 48, h: 32 },    // Hauptstraße
  { x: 15, y: 9,  w: 54, h: 36 },    // Prachtstraße
];
function stadtMasse() {
  const hoch = cv.height > cv.width * 1.1;
  const sp = hoch ? 2 : 3, ze = hoch ? 3 : 2;
  return { sp, ze, W: sp * BLOCK_W + (sp + 1) * STRASSE, H: ze * BLOCK_H + (ze + 1) * STRASSE };
}
const blockPos = (i, M) => ({ x: STRASSE + (i % M.sp) * (BLOCK_W + STRASSE), y: STRASSE + Math.floor(i / M.sp) * (BLOCK_H + STRASSE) });

const stadtLw = document.createElement('canvas'), stadtCtx = stadtLw.getContext('2d');
const stadtBild = document.createElement('canvas'), stadtBildCtx = stadtBild.getContext('2d');

// Zeichnet die Stadt fertig skaliert auf stadtBild (Bildschirmgröße) und liefert die Abbildung Welt → Bildschirm
function stadtRendern() {
  const M = stadtMasse();
  const desktop = DESKTOP.matches, oben = imKonzern() ? (desktop ? 120 : 136) : (desktop ? 70 : 78), unten = desktop ? 80 : 90;
  const rechts = desktop && $('menue').classList.contains('offen') ? $('menue').offsetWidth : 0;   // Breitbild: Menü-Leiste rechts
  const Uc = Math.max(1, Math.min((cv.width - rechts - 16) / M.W, (cv.height - oben - unten) / M.H));
  const alt = [U, lox, loy, rctx];
  U = Uc;
  lox = Math.round(((cv.width - rechts) / Uc - M.W) / 2 * S) / S;
  loy = Math.round((oben / Uc + Math.max(0, (cv.height - oben - unten) / Uc - M.H) / 2) * S) / S;
  stadtLw.width = Math.ceil(cv.width / Uc * S) + 2; stadtLw.height = Math.ceil(cv.height / Uc * S) + 2;
  rctx = stadtCtx;
  stadtWelt(M);
  if (imKonzern() && konzern.phase === 'stadt') konzernOverlay(M);
  kAbb = { U: Uc, lox, loy, limo: kAbb && kAbb.limoNeu, limoNeu: null };
  stadtBild.width = cv.width; stadtBild.height = cv.height;
  stadtBildCtx.imageSmoothingEnabled = false;
  stadtBildCtx.drawImage(stadtLw, 0, 0, stadtLw.width, stadtLw.height, 0, 0, stadtLw.width * Uc / S, stadtLw.height * Uc / S);
  // Schilder in der Menü-Schrift direkt auf stadtBild
  const altCtx = ctxTausch(stadtBildCtx);
  flushTexte();
  ctxTausch(altCtx);
  const f = Math.min(spiel.filiale, STADT_HAEUSER.length - 1), bp = blockPos(f, M), hs = STADT_HAEUSER[f];
  const ziel = { x: (lox + bp.x + hs.x) * Uc, y: (loy + bp.y + hs.y) * Uc, w: hs.w * Uc };
  [U, lox, loy, rctx] = alt;
  return ziel;
}

function konzernZeichnen() {
  const ziel = stadtRendern();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#1b1420'; ctx.fillRect(0, 0, cv.width, cv.height);
  if (konzern.phase !== 'zoom' || !konzern.bild) { ctx.drawImage(stadtBild, 0, 0); return; }
  // Zoom: Laden-Dach schrumpft auf das Gebäude in der Stadt, die Stadt kommt von groß nach normal
  const q = konzern.quelle, k = Math.min(1, konzern.t / ZOOM_DAUER), e = k * k * (3 - 2 * k);
  const s1 = ziel.w / q.w, s = Math.exp(Math.log(s1) * e);
  const ox = q.x + (ziel.x - q.x) * e, oy = q.y + (ziel.y - q.y) * e;   // wo die Dachecke gerade ist
  const c = s / s1;                                                       // Stadt-Maßstab relativ zum Endbild
  ctx.drawImage(stadtBild, ox - ziel.x * c, oy - ziel.y * c, cv.width * c, cv.height * c);
  // Anfangs das ganze Laden-Bild (Umgebung blendet aus), danach nur noch das Dach
  const umgebung = Math.max(0, 1 - e / 0.3);
  if (umgebung > 0) { ctx.globalAlpha = umgebung; ctx.drawImage(konzern.bild, ox - q.x * s, oy - q.y * s, cv.width * s, cv.height * s); }
  ctx.globalAlpha = e < 0.8 ? 1 : Math.max(0, 1 - (e - 0.8) / 0.2);
  ctx.drawImage(konzern.bild, q.x, q.y, q.w, q.h, ox, oy, q.w * s, q.h * s);
  ctx.globalAlpha = 1;
}

// textJetzt() schreibt auf ctx – für die Stadt kurz auf eine andere Leinwand umlenken
let textZiel = null;
function ctxTausch(neu) { const alt = textZiel; textZiel = neu; return alt; }

// ---------------------------------------------------------------
// Die Stadt in Spieleinheiten
// ---------------------------------------------------------------
function stadtWelt(M) {
  const x0 = -lox - 1, y0 = -loy - 1, x1 = stadtLw.width / S - lox, y1 = stadtLw.height / S - loy;
  r(x0, y0, x1 - x0, y1 - y0, '#4f7f45');                      // Wiese rundherum
  for (let gx = Math.floor(x0 / 7) * 7; gx < x1; gx += 7)
    for (let gy = Math.floor(y0 / 9) * 9; gy < y1; gy += 9) r(gx + ((gy / 9) % 2) * 3, gy, 1, 1, '#5f9152');
  // Straßen
  r(0, 0, M.W, M.H, '#55505a');
  for (let i = 0; i <= M.sp; i++) strasseSenkrecht(i * (BLOCK_W + STRASSE), M.H);
  for (let j = 0; j <= M.ze; j++) strasseWaagrecht(j * (BLOCK_H + STRASSE), M.W);
  // Kreuzungen mit Zebrastreifen
  for (let i = 0; i <= M.sp; i++) for (let j = 0; j <= M.ze; j++) {
    const kx = i * (BLOCK_W + STRASSE), ky = j * (BLOCK_H + STRASSE);
    r(kx, ky, STRASSE, STRASSE, '#55505a');
  }
  // Blöcke
  for (let i = 0; i < 6; i++) {
    const b = blockPos(i, M);
    r(b.x - 1, b.y - 1, BLOCK_W + 2, BLOCK_H + 2, '#8e8a92');        // Bordstein
    r(b.x, b.y, BLOCK_W, BLOCK_H, '#b7b2b9');                        // Gehweg
    BLOCK_MALER[i](b.x + 3, b.y + 3, BLOCK_W - 6, BLOCK_H - 6, i);
  }
  autosFahren(M);
}
function strasseSenkrecht(x, h) {
  r(x, 0, STRASSE, h, '#55505a');
  for (let y = 3; y < h - 4; y += 8) r(x + STRASSE / 2 - 0.5, y, 1, 4, '#d8cf9a');
}
function strasseWaagrecht(y, w) {
  r(0, y, w, STRASSE, '#55505a');
  for (let x = 3; x < w - 4; x += 8) r(x, y + STRASSE / 2 - 0.5, 4, 1, '#d8cf9a');
}

// Kleine Autos, die um die Blöcke fahren
const AUTO_FARBEN = ['#d04a4a', '#3a7ad0', '#f0c050', '#e8e2d8', '#5ab07a', '#8a5ad0'];
function autosFahren(M) {
  for (let n = 0; n < 7; n++) {
    const farbe = AUTO_FARBEN[n % AUTO_FARBEN.length], tempo = 9 + (n % 3) * 4;
    if (n % 2) {   // waagrecht
      const j = n % (M.ze + 1), y = j * (BLOCK_H + STRASSE) + (n % 4 < 2 ? 2.5 : 7);
      const x = ((zeit * tempo + n * 53) % (M.W + 20)) - 10, links = n % 4 >= 2;
      auto(links ? M.W - x : x, y, 7, 3, farbe);
    } else {       // senkrecht
      const i = n % (M.sp + 1), x = i * (BLOCK_W + STRASSE) + (n % 4 < 2 ? 2.5 : 7);
      const y = ((zeit * tempo + n * 37) % (M.H + 20)) - 10, hoch = n % 4 >= 2;
      auto(x, hoch ? M.H - y : y, 3, 7, farbe);
    }
  }
}
function auto(x, y, w, h, c) {
  r(x - P, y - P, w + 2 * P, h + 2 * P, F_BASIS.umriss);
  r(x, y, w, h, c);
  if (w > h) r(x + 2, y + 0.5, 2, h - 1, '#9ad0e8'); else r(x + 0.5, y + 2, w - 1, 2, '#9ad0e8');
}

// ---------- Bausteine ----------
function baumKlein(x, y) {
  r(x - 1, y + 3, 6, 2, 'rgba(20,30,10,.3)');
  r(x - P, y - P, 5 + 2 * P, 5 + 2 * P, F_BASIS.umriss);
  r(x, y, 5, 5, '#3f8a3e'); r(x + 1, y + 0.5, 2, 2, '#62b052');
}
function hausKlein(x, y, w, h, dach) {   // Nachbarhaus von oben: Satteldach
  r(x + 1, y + h, w - 1, 1.5, 'rgba(20,10,20,.3)');
  r(x - P, y - P, w + 2 * P, h + 2 * P, F_BASIS.umriss);
  r(x, y, w, h / 2, ton(dach, 1.15)); r(x, y + h / 2, w, h / 2, dach);
  r(x, y + h / 2 - 0.5, w, 1, ton(dach, 0.7));
  for (let ry = y + 3; ry < y + h - 1; ry += 3) if (Math.abs(ry - y - h / 2) > 1) r(x, ry, w, P, ton(dach, 0.85));
}
// Filiale in der Stadt: Dach wie beim großen Laden, nur klein; mit Namensschild
function filialHaus(i, bx, by) {
  const h = STADT_HAEUSER[i], x = bx + h.x, y = by + h.y, frei = imKonzern() || i <= spiel.filiale;
  const hier = !imKonzern() && i === Math.min(spiel.filiale, STADT_HAEUSER.length - 1);
  r(x + 1, y + h.h, h.w - 1, 2, 'rgba(20,10,20,.35)');
  if (hier) {   // aktuelle Filiale leuchtet golden
    const a = 0.45 + 0.35 * Math.sin(zeit * 4);
    r(x - 2.5, y - 2.5, h.w + 5, h.h + 5, `rgba(255,215,122,${a})`);
  }
  r(x - 1, y - 1, h.w + 2, h.h + 2, F_BASIS.umriss);
  if (!frei) {   // noch nicht erreicht: Bauland mit Zaun
    r(x, y, h.w, h.h, '#7a6650');
    for (let zx = x; zx < x + h.w; zx += 3) { r(zx, y, 1, 1, '#d8c8a0'); r(zx, y + h.h - 1, 1, 1, '#d8c8a0'); }
    text('?', x + h.w / 2, y + h.h / 2, 7, '#e8dcc4', '#1d1219');
    return;
  }
  const D = DACH_STILE[Math.min(i, DACH_STILE.length - 1)];
  if (D.flach) flachdach(x, y, h.w, h.h, D, 0.45);
  else {
    const mitte = y + Math.round(h.h * 0.42);
    r(x, y, h.w, mitte - y, D.hell); r(x, mitte, h.w, y + h.h - mitte, D.dunkel);
    let reihe = 0;
    for (let ry = y + 3; ry < y + h.h - 1; ry += 3, reihe++) {
      if (Math.abs(ry - mitte) < 2) continue;
      r(x, ry, h.w, P, D.fuge);
      const breit = D.gauben ? 4 : 5;
      for (let jx = x + (reihe % 2 ? breit / 2 : 0); jx < x + h.w; jx += breit) r(jx, ry - 3 + P, P, 3 - P, D.fuge);
    }
    r(x, mitte - 0.5, h.w, 1.5, D.first);
    r(x, y + h.h - 1, h.w, 1, D.rinne);
    if (D.gauben) for (const fx of [0.16, 0.44]) {
      const gx = Math.round(x + h.w * fx), gy = Math.round(y + h.h * 0.1);
      r(gx - P, gy - P, 7 + 2 * P, 6 + 2 * P, F_BASIS.umriss);
      r(gx, gy, 7, 2, D.first); r(gx, gy + 2, 7, 4, '#e8dcc4'); r(gx + 2, gy + 2.5, 3, 2.5, '#ffd77a');
    }
    const sx = x + Math.round(h.w * 0.8), sy = y + Math.round(h.h * 0.12);   // Schornstein + Rauch
    r(sx - P, sy - P, 4 + 2 * P, 5 + 2 * P, F_BASIS.umriss); r(sx, sy, 4, 5, D.schornstein);
    for (let k = 0; k < 2; k++) {
      const q = (zeit * 0.5 + k / 2) % 1, g = 1 + q * 2;
      r(sx + 1.5 + q * 2 - g / 2, sy - 1 - q * 7, g, g, `rgba(235,228,232,${0.5 * (1 - q)})`);
    }
  }
  // Namensschild unter dem Haus
  const name = filialName(i), g = 3.2, bw = Math.ceil(webBreite(name, g) + 5), bh = 6;
  const sx = Math.round(x + h.w / 2 - bw / 2), sy = y + h.h + 2;
  r(sx - P, sy - P, bw + 2 * P, bh + 2 * P, F_BASIS.umriss);
  r(sx, sy, bw, bh, hier ? '#5a3a14' : '#4a2c38');
  text(name, x + h.w / 2, sy + bh / 2, g, hier ? '#ffd77a' : '#e8dcc4', '#1d1219');
}

// ---------- Die sechs Blöcke ----------
const BLOCK_MALER = [
  // 0 Hinterhof: dunkler Hof, Mülltonnen, Kisten, Nachbarhäuser dicht dran
  (x, y, w, h, i) => {
    r(x, y, w, h, '#6a6268');
    for (let gx = x + 2; gx < x + w; gx += 5) for (let gy = y + 2; gy < y + h; gy += 4) r(gx + (gy % 8 ? 2 : 0), gy, 1, P, '#5a5258');
    hausKlein(x, y, 18, h - 22, '#8a6a5a'); hausKlein(x + w - 16, y, 16, h - 10, '#7a5a5a');
    r(x + 22, y + h - 9, 4, 4, '#2f4a3a'); r(x + 22, y + h - 9, 4, 1, '#4a6a5a');            // Mülltonne
    r(x + 28, y + h - 8, 4, 3, '#9a7048'); r(x + 28, y + h - 8, 4, P, '#b88a5c');              // Kiste
    r(x + 50, y + h - 7, 6, 2, '#4a5a7a');                                                       // Pfütze
    filialHaus(0, x - 3, y - 3);
  },
  // 1 Fußgängerzone: helles Pflaster, Bänke, Blumenkübel
  (x, y, w, h, i) => {
    r(x, y, w, h, '#d8c8a8');
    for (let gx = x + 3; gx < x + w; gx += 6) for (let gy = y + 3; gy < y + h; gy += 6) r(gx, gy, 1, 1, '#c8b896');
    for (const bx of [x + 4, x + w - 9]) { r(bx, y + h - 10, 5, 4, '#8a5a3a'); r(bx + 1, y + h - 10, 3, 2.5, '#5fae5a'); r(bx + 2, y + h - 9.5, 1, 1, '#e05a6a'); }
    r(x + 26, y + h - 7, 10, 2, '#7a5232'); r(x + 46, y + h - 7, 10, 2, '#7a5232');            // Bänke
    for (let n = 0; n < 4; n++) {                                                              // Passanten
      const px = x + 8 + ((zeit * (3 + n) + n * 19) % (w - 16)), py = y + h - 13 + (n % 2) * 9;
      r(px, py, 2, 2, ['#d04a4a', '#3a7ad0', '#f0c050', '#5ab07a'][n]);
    }
    filialHaus(1, x - 3, y - 3);
  },
  // 2 Einkaufszentrum: großer Parkplatz
  (x, y, w, h, i) => {
    r(x, y, w, h, '#6a666e');
    for (let px = x + 4; px < x + w - 4; px += 7) r(px, y + h - 13, P, 10, '#d8d4dc');
    for (let n = 0; n < 7; n++) if (n % 3 !== 1) auto(x + 5.5 + n * 7 + (n > 4 ? 7 : 0), y + h - 12, 4, 7, AUTO_FARBEN[(n * 2) % 6]);
    filialHaus(2, x - 3, y - 3);
  },
  // 3 Hauptstraße: Steinplatten, Laternen, roter Teppich am Eingang
  (x, y, w, h, i) => {
    r(x, y, w, h, '#a8a2a8');
    for (let gx = x; gx < x + w; gx += 8) r(gx, y, P, h, '#98929a');
    for (let gy = y; gy < y + h; gy += 8) r(x, gy, w, P, '#98929a');
    const hs = STADT_HAEUSER[3];
    r(x - 3 + hs.x + hs.w / 2 - 3, y - 3 + hs.y + hs.h, 6, h - hs.y - hs.h + 3, '#b03a3a');   // roter Teppich
    for (const lx of [x + 6, x + w - 8]) for (const ly of [y + 8, y + h - 10]) { r(lx, ly, 2, 2, '#2a2430'); r(lx + 0.5, ly + 0.5, 1, 1, '#ffd77a'); }
    filialHaus(3, x - 3, y - 3);
  },
  // 4 Prachtstraße: Rasen, Baumreihe, Springbrunnen
  (x, y, w, h, i) => {
    r(x, y, w, h, '#5a9a4e');
    for (let bx = x + 2; bx < x + w - 4; bx += 11) { baumKlein(bx, y + h - 8); }
    const fx = x + 4, fy = y + 30;
    r(fx - P, fy - P, 8 + 2 * P, 8 + 2 * P, F_BASIS.umriss); r(fx, fy, 8, 8, '#c8c2b8'); r(fx + 1.5, fy + 1.5, 5, 5, '#5aa0d8');
    r(fx + 3.5, fy + 3.5 - Math.abs(Math.sin(zeit * 3)), 1, 1, '#e8f4ff');
    filialHaus(4, x - 3, y - 3);
  },
  // 5 Baustelle: hier entsteht die Konzernzentrale (wächst mit den Zentrale-Upgrades)
  (x, y, w, h, i) => {
    const zs = imKonzern() ? Object.values(spiel.konzern.zentrale).reduce((a, b) => a + b, 0) : 0;
    if (zs > 0) { zentraleGebaeude(x, y, w, h, zs); return; }
    r(x, y, w, h, '#8a6a4a');
    for (let gx = x + 2; gx < x + w; gx += 6) for (let gy = y + 2; gy < y + h; gy += 5) r(gx + (gy % 10 ? 3 : 0), gy, 1, 1, '#7a5a3c');
    for (let zx = x; zx < x + w; zx += 3) { r(zx, y, 1.5, 1, '#f0c050'); r(zx, y + h - 1, 1.5, 1, '#f0c050'); }
    for (let zy = y; zy < y + h; zy += 3) { r(x, zy, 1, 1.5, '#f0c050'); r(x + w - 1, zy, 1, 1.5, '#f0c050'); }
    // Kran (von oben): Mast + Ausleger, dreht sich langsam hin und her
    const kx = x + w * 0.35, ky = y + h * 0.45, wink = Math.sin(zeit * 0.4) * 0.6;
    for (let s = 0; s < 30; s += 1) r(kx + Math.cos(wink) * s, ky + Math.sin(wink) * s, 1.5, 1.5, s % 4 < 2 ? '#f0c050' : '#2a2430');
    r(kx - 2, ky - 2, 4, 4, '#2a2430'); r(kx - 1, ky - 1, 2, 2, '#f0c050');
    r(x + w - 22, y + h - 14, 16, 8, '#2a2430'); r(x + w - 21, y + h - 13, 14, 6, '#f0c050');      // Bauschild
    text(t('konzern.baustelle'), x + w / 2, y + 8, 3.2, '#ffd77a', '#1d1219');
  },
];

// Konzernzentrale: Rohbau → Glasfassade → mit Gold (nach Anzahl gekaufter Zentrale-Stufen)
function zentraleGebaeude(x, y, w, h, zs) {
  r(x, y, w, h, '#9a9aa2');
  for (let gx = x; gx < x + w; gx += 8) r(gx, y, P, h, '#8a8a92');
  const gw = 54, gh = 36, gx = Math.round(x + (w - gw) / 2), gy = y + 6;
  const glas = zs >= 8, gold = zs >= 20;
  r(gx + 1, gy + gh, gw - 1, 2, 'rgba(20,10,20,.35)');
  r(gx - 1, gy - 1, gw + 2, gh + 2, F_BASIS.umriss);
  r(gx, gy, gw, gh, glas ? '#4a6a8a' : '#b8b4bc');
  if (glas) { for (let px = gx + 3; px < gx + gw - 2; px += 6) r(px, gy + 2, 4, gh - 4, '#6a9ac0'); r(gx, gy, gw, 2, '#9ad0e8'); }
  else for (let py = gy + 6; py < gy + gh; py += 6) r(gx, py, gw, P, '#8a8690');
  if (gold) { r(gx, gy, gw, 1.5, '#f0c050'); r(gx, gy + gh - 1.5, gw, 1.5, '#f0c050'); }
  // Hubschrauber-Landeplatz ab ganz ausgebaut, sonst Kran
  if (zs < 20) {
    const kx = gx + gw - 6, ky = gy + 6, wink = Math.sin(zeit * 0.4) * 0.6 + 2.6;
    for (let s = 0; s < 22; s++) r(kx + Math.cos(wink) * s, ky + Math.sin(wink) * s, 1.5, 1.5, s % 4 < 2 ? '#f0c050' : '#2a2430');
  } else { r(gx + gw / 2 - 6, gy + gh / 2 - 6, 12, 12, '#2a2430'); text('H', gx + gw / 2, gy + gh / 2, 5, '#ffd77a', '#1d1219'); }
  const name = t('konzern.zentrale'), g = 3.2, bw = Math.ceil(webBreite(name, g) + 5);
  const sx = Math.round(gx + gw / 2 - bw / 2), sy = gy + gh + 2;
  r(sx - P, sy - P, bw + 2 * P, 6 + 2 * P, F_BASIS.umriss); r(sx, sy, bw, 6, '#3d2450');
  text(name, gx + gw / 2, sy + 3, g, '#ffd77a', '#1d1219');
}

// Anzeigen über den Filialen: Rundenbalken, Stufe, Sterne, Trends, Kampagne, Limo, schwebende Beträge
function konzernOverlay(M) {
  const kz = spiel.konzern;
  kz.f.forEach((f, i) => {
    const b = blockPos(i, M), h = STADT_HAEUSER[i], x = b.x + h.x, y = b.y + h.y;
    // Kampagne / Auswahl
    if (kz.kampagne.f === i && kz.kampagne.rest > 0) {
      const a = 0.5 + 0.4 * Math.sin(zeit * 6);
      r(x - 3, y - 3, h.w + 6, h.h + 6, `rgba(240,140,60,${a})`);
    } else if (konzern.waehlen) r(x - 3, y - 3, h.w + 6, h.h + 6, `rgba(255,255,255,${0.35 + 0.3 * Math.sin(zeit * 6)})`);
    // Rundenbalken unter dem Namensschild
    const runde = kRunde(i), anteil = runde < 0.4 ? 1 : f.t / runde;
    const by = y + h.h + 10;
    r(x - P, by - P, h.w + 2 * P, 2 + 2 * P, F_BASIS.umriss);
    r(x, by, h.w, 2, '#3a2430');
    r(x, by, h.w * anteil, 2, runde < 0.4 ? `hsl(45,90%,${55 + 15 * Math.sin(zeit * 10)}%)` : '#ffd77a');
    // Stufe oben links
    const st = String(f.stufe), sw = webBreite(st, 3.2) + 4;
    r(x - 2 - P, y - 3 - P, sw + 2 * P, 6 + 2 * P, F_BASIS.umriss); r(x - 2, y - 3, sw, 6, '#2a2430');
    text(st, x - 2 + sw / 2, y, 3.2, '#ffd77a', null);
    // Trends
    let tx = x + sw + 1;
    for (const [art, farbe, zeichen] of [['geld', '#3a9a4a', '€×3'], ['stern', '#3a6ac0', '★×3']]) {
      if (kz.trend[art] !== i) continue;
      const tw = webBreite(zeichen, 3) + 4;
      r(tx - P, y - 3 - P, tw + 2 * P, 6 + 2 * P, F_BASIS.umriss); r(tx, y - 3, tw, 6, farbe);
      text(zeichen, tx + tw / 2, y, 3, '#ffffff', null); tx += tw + 2;
    }
    if (kz.kampagne.f === i && kz.kampagne.rest > 0) {
      const tw = webBreite('×3', 3) + 4;
      r(tx - P, y - 3 - P, tw + 2 * P, 6 + 2 * P, F_BASIS.umriss); r(tx, y - 3, tw, 6, '#d06a2a');
      text('×3', tx + tw / 2, y, 3, '#ffffff', null);
    }
    // Sternentopf / Filialleiter / Spezialisierung offen
    const sx = x + h.w - 4, sy = y + 4;
    if (kSpezOffen(i)) kBlase(sx - 17, y - 6, '!', '#ffd77a', '#8a2a2a', true);
    sternAnzeige(sx, sy, f, i);
  });
  // Limousine: fährt auf der Straße unter der Zentrale vor, wartet, fährt weiter
  kAbb && (kAbb.limoNeu = null);
  if (limo) {
    const z = blockPos(5, M), ly = z.y + BLOCK_H + STRASSE / 2 - 2.5, lw = 24, lh = 6;
    const stopp = z.x + BLOCK_W / 2 - lw / 2;
    const e = limo.x <= 1 ? 1 - Math.pow(1 - limo.x, 2) : (limo.x - 1) * (limo.x - 1);
    const lx = limo.x <= 1 ? -30 + (stopp + 30) * e : stopp + (M.W + 40 - stopp) * e;
    stretchLimo(lx, ly, lw, lh, limo.phase === 'wartet');
    kAbb.limoNeu = { x: lx, y: ly, w: lw, h: lh };
  }
  // schwebende Beträge
  for (const s of konzern.schwebe) {
    const i = s.i >= 0 ? s.i : 5, b = blockPos(i, M), h = STADT_HAEUSER[Math.min(i, 4)];
    const cx = b.x + (s.i >= 0 ? h.x + h.w / 2 : BLOCK_W / 2), cy = b.y + (s.i >= 0 ? h.y + h.h / 2 : BLOCK_H / 2) - s.alter * 10;
    text(s.text, cx, cy, 3.6, s.farbe, '#1d1219');
  }
}
function kBlase(x, y, txt, farbe, schrift, puls) {
  const g = 3.4, w = webBreite(txt, g) + 5, hh = 7, dy = puls ? Math.sin(zeit * 6) * 0.8 : 0;
  r(x - w / 2 - P, y - P + dy, w + 2 * P, hh + 2 * P, F_BASIS.umriss);
  r(x - w / 2, y + dy, w, hh, farbe);
  r(x - 1, y + hh + dy, 2, 1.5, F_BASIS.umriss);
  text(txt, x, y + hh / 2 + dy, g, schrift, null);
}
function stretchLimo(x, y, w, h, wartet) {
  r(x + 1, y + h, w - 1, 1.5, 'rgba(20,10,20,.4)');
  r(x - P, y - P, w + 2 * P, h + 2 * P, F_BASIS.umriss);
  r(x, y, w, h, '#1d1a22'); r(x, y, w, 1, '#4a4652');
  r(x + w - 5, y + 1, 3, h - 2, '#6a8aa8');            // Frontscheibe (fährt nach rechts)
  for (let px = x + 5; px < x + w - 7; px += 4) r(px, y + 1.5, 2.5, h - 3, '#3a4a5a');   // Seitenfenster
  r(x + 2, y + 1, 1.5, h - 2, '#6a8aa8');                // Heckscheibe
  r(x + w - P, y + 1, P, 1, '#fff3b0'); r(x + w - P, y + h - 2, P, 1, '#fff3b0');   // Scheinwerfer
  // Krone über dem Dach (wippt, solange sie wartet)
  const kx = x + w / 2 - 3.5, ky = y - 7 + (wartet ? Math.sin(zeit * 5) * 0.8 : 0);
  r(kx - P, ky + 1 - P, 7 + 2 * P, 4 + 2 * P, F_BASIS.umriss);
  r(kx, ky + 2, 7, 3, '#f0c050'); r(kx, ky + 1, 1.5, 1.5, '#f0c050'); r(kx + 2.75, ky, 1.5, 2, '#f0c050'); r(kx + 5.5, ky + 1, 1.5, 1.5, '#f0c050');
  r(kx + 3, ky + 3, 1, 1, '#d04a4a');
}

// ---------- Menü-Einträge im Konzern ----------
const kName = i => filialName(i);
function konzernEintraege(tab) {
  const kz = spiel.konzern;
  if (tab === 'ksterne') {
    return [{ key: 'ks-info', icon: 'stern', titel: t('ks.titel'), infoKachel: true, info: t('ks.info') }].concat(kz.f.map((f, i) => {
      const tr = kTresorKosten(f.tresor), tu = kTurboKosten(f.turbo);
      const proStern = 1 / kSternRate(i) / 60;
      return { key: 'ks-' + i, icon: 'laden', titel: kName(i),
        info: t('ks.zeile', { a: Math.floor(f.topf), b: kTopfGroesse(i), m: komma(proStern), x: Math.pow(2, f.turbo) }),
        knoepfe: [
          { text: f.leiter ? t('ks.leiterDa') : t('ks.leiter', { n: K_LEITER }), aus: f.leiter || spiel.sterne < K_LEITER, gewaehlt: f.leiter, tun: () => kStarUpgrade(i, 'leiter') },
          { text: t('ks.tresor', { n: tr }), aus: spiel.sterne < tr, tun: () => kStarUpgrade(i, 'tresor') },
          { text: t('ks.turbo', { n: tu }), aus: spiel.sterne < tu, tun: () => kStarUpgrade(i, 'turbo') },
        ] };
    }));
  }
  if (tab === 'kzentrale') {
    const zs = Object.values(kz.zentrale).reduce((a, b) => a + b, 0), zmax = K_ZENTRALE.reduce((a, z) => a + z.max, 0);
    return [{ key: 'kz-info', icon: 'manager', titel: t('kz.titel'), infoKachel: true, info: t('kz.info', { a: zs, b: zmax }) }].concat(K_ZENTRALE.map(z => {
      const n = kz.zentrale[z.id], max = n >= z.max, p = z.kosten(n);
      return { key: 'kz-' + z.id, icon: z.icon, titel: t('kz.' + z.id), info: t('upg.stufe', { s: n }) + ' · ' + t('kz.' + z.id + 'Info'),
               knopf: max ? t('max') : p + ' ★', aus: max || spiel.sterne < p, tun: () => kZentraleKaufen(z) };
    }));
  }
  // Filialen: Übersicht + Kaufmenge, offene Spezialisierungen, Ausbau
  const minSt = kMinStufe(), naechsterKM = K.konzernMeilensteine.find(m => minSt < m);
  const liste = [{ key: 'kf-info', icon: 'verkauf', titel: t('kf.titel', { x: kurz(kGesamtProSek()) }), infoKachel: true,
    info: naechsterKM ? t('kf.konzernMeilenstein', { n: naechsterKM }) : t('kf.alleMeilensteine'),
    knoepfe: [1, 10, 'max'].map(m => ({ text: m === 'max' ? 'Max' : '×' + m, gewaehlt: kz.menge === m, tun: () => { kz.menge = m; } })) }];
  kz.f.forEach((f, i) => {
    if (!kSpezOffen(i)) return;
    liste.push({ key: 'kp-' + i, icon: 'stern', klasse: 'konzernkarte', titel: t('kp.titel', { n: kName(i) }), info: t('kp.info', { s: K.spezStufen[f.spez.length] }),
      knoepfe: ['umsatz', 'prestige', 'tempo'].map(a => ({ text: t('kp.' + a), tun: () => kSpezWaehlen(i, a) })) });
  });
  kz.f.forEach((f, i) => {
    const n = kKaufMenge(i), p = kAusbauPreis(i, f.stufe, n), nm2 = K.meilensteine.find(m => f.stufe < m);
    const spez = f.spez.length ? ' · ' + f.spez.map(a => t('kp.kurz.' + a)).join(', ') : '';
    liste.push({ key: 'kf-' + i, icon: 'laden', titel: t('kf.filiale', { n: kName(i), s: f.stufe }),
      info: t('kf.zeile', { x: kurz(kProSek(i)), r: sek(kRunde(i)), m: nm2 || '–' }) + spez,
      knopf: (n > 1 ? '×' + n + ' · ' : '') + kurz(p) + ' €', aus: spiel.geld < p, tun: () => kAusbauen(i) });
  });
  return liste;
}

// ---------- Anzeigen unten / Trend ----------
const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function konzernHud() {
  const kz = spiel.konzern, bereit = kSternBereit();
  $('kSternLabel').textContent = bereit ? t('k.einsammeln', { n: bereit }) : t('k.keineSterne');
  $('kSternBtn').disabled = !bereit;
  $('kSternBtn').classList.toggle('bereit', bereit > 0);
  const kp = kz.kampagne;
  $('kWerbLabel').textContent = konzern.waehlen ? t('k.werbWaehlen') : kp.rest > 0 ? t('k.werbLaeuft', { z: mmss(kp.rest) })
    : kp.abkling > 0 ? t('k.werbPause', { z: mmss(kp.abkling) }) : t('k.werbung');
  $('kWerbBtn').disabled = kp.abkling > 0 && !konzern.waehlen;
  $('kWerbBtn').classList.toggle('aktiv', konzern.waehlen);
  $('trendTxt').textContent = t('k.trend', { a: kName(kz.trend.geld), b: kName(kz.trend.stern), z: mmss(kz.trend.rest) });
  $('menueBtn').hidden = false;
}
$('kSternBtn').addEventListener('click', () => kSterneEinsammeln());
$('kWerbBtn').addEventListener('click', () => kKampagneStarten());

// Sternentopf an der Filiale: Stern mit Anzahl im Topf, Ring füllt sich bis zum nächsten Stern
const STERN_FORM = (() => {   // 5-zackiger Stern, Radius 1
  const p = [];
  for (let k = 0; k < 10; k++) { const w = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 0.45 : 1; p.push([Math.cos(w) * rr, Math.sin(w) * rr]); }
  return p;
})();
function imStern(px, py) {
  let drin = false;
  for (let a = 0, b = STERN_FORM.length - 1; a < STERN_FORM.length; b = a++) {
    const [xa, ya] = STERN_FORM[a], [xb, yb] = STERN_FORM[b];
    if ((ya > py) !== (yb > py) && px < (xb - xa) * (py - ya) / (yb - ya) + xa) drin = !drin;
  }
  return drin;
}
function pixelStern(cx, cy, R, farbe) {
  const st = P;   // feine Pixel
  for (let yy = -R - st; yy <= R + st; yy += st) {
    let start = null;
    for (let xx = -R - st; xx <= R + st + st; xx += st) {
      const d = xx <= R + st && imStern(xx / R, (yy + st / 2) / R);
      if (d && start === null) start = xx;
      if (!d && start !== null) { r(cx + start, cy + yy, xx - start, st, farbe); start = null; }
    }
  }
}
function sternAnzeige(cx, cy, f, i) {
  const voll = f.topf >= kTopfGroesse(i), anzahl = Math.floor(f.topf), anteil = voll ? 1 : f.topf - anzahl;
  const RR = 8, puls = voll && !f.leiter ? 0.6 + 0.4 * Math.sin(zeit * 6) : 1;
  // Hintergrundscheibe
  for (let yy = -RR - 1; yy <= RR + 1; yy += P) {
    const w = Math.sqrt(Math.max(0, (RR + 1) * (RR + 1) - yy * yy));
    r(cx - w, cy + yy, 2 * w, P, F_BASIS.umriss);
  }
  for (let yy = -RR + 0.5; yy <= RR - 0.5; yy += P) {
    const w = Math.sqrt(Math.max(0, (RR - 0.5) * (RR - 0.5) - yy * yy));
    r(cx - w, cy + yy, 2 * w, P, '#2a3550');
  }
  // Ring: von oben im Uhrzeigersinn
  const n = 64;
  for (let k = 0; k < n; k++) {
    const w = -Math.PI / 2 + (k + 0.5) / n * Math.PI * 2;
    const an = k / n < anteil;
    const farbe = an ? (voll ? `rgba(255,215,122,${puls})` : '#7fc8ff') : '#46506a';
    r(cx + Math.cos(w) * (RR - 1.2) - 0.9, cy + Math.sin(w) * (RR - 1.2) - 0.9, 1.8, 1.8, farbe);
  }
  // Stern mit Zahl
  pixelStern(cx, cy + 0.3, 5.6, F_BASIS.umriss);
  pixelStern(cx, cy + 0.3, 4.8, anzahl > 0 ? (voll ? '#ffd77a' : '#9ad8ff') : '#7890b0');
  text(String(anzahl), cx, cy + 1, 4.4, '#ffffff', '#10203a');
  // Filialleiter sammelt automatisch: kleines „L“ unten links
  if (f.leiter) {
    r(cx - RR - 1 - P, cy + 2.5 - P, 5 + 2 * P, 5 + 2 * P, F_BASIS.umriss); r(cx - RR - 1, cy + 2.5, 5, 5, '#3a6ac0');
    text('L', cx - RR + 1.5, cy + 5, 3, '#ffffff', null);
  }
}
