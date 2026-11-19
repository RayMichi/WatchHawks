// ===============================================================
// 12. KONZERN – Schritt 1: Gründung als Vorschau
//     Kachel im Ruf-Reiter (50 freie Sterne) → Dach legt sich auf den Laden → Kamera zoomt raus
//     → Stadt mit allen Filialen → Lisa erklärt → Stadtansicht (vorerst nur zum Anschauen)
//     Sterne abziehen + Reset + Aktien kommen in Schritt 2.
// ===============================================================
const konzern = { phase: null, t: 0, bild: null, quelle: null };
const ZU_DAUER = 1.0, ZOOM_DAUER = 2.2;

const konzernAktiv = () => ['zoom', 'dialog', 'stadt'].includes(konzern.phase);

function konzernStarten(test = false) {
  if (konzern.phase || intro.phase) return;
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
      // fertiges Laden-Bild mit Dach einfrieren – das wird gleich kleiner
      zeichnen();
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
  } else if (konzern.phase === 'auf') {
    dachP = Math.min(1, konzern.t / DACH_DAUER);
    if (dachP >= 1) {
      konzern.phase = null; dachP = 1;
      document.body.classList.remove('intro', 'konzern');
    }
  }
}

function konzernDialogEnde() {
  clearInterval(intro.timer);
  intro.phase = null;
  $('intro').hidden = true;
  konzern.phase = 'stadt';
  $('stadtUi').hidden = false;
}

// Vorschau: zurück in den Laden, Dach fliegt wieder weg
$('stadtZurueck').addEventListener('click', () => {
  $('stadtUi').hidden = true;
  konzern.phase = 'auf'; konzern.t = 0; dachP = 0;
  groesse();
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
  const desktop = DESKTOP.matches, oben = desktop ? 70 : 78, unten = desktop ? 80 : 86;
  const Uc = Math.max(1, Math.min((cv.width - 16) / M.W, (cv.height - oben - unten) / M.H));
  const alt = [U, lox, loy, rctx];
  U = Uc;
  lox = Math.round((cv.width / Uc - M.W) / 2 * S) / S;
  loy = Math.round((oben / Uc + Math.max(0, (cv.height - oben - unten) / Uc - M.H) / 2) * S) / S;
  stadtLw.width = Math.ceil(cv.width / Uc * S) + 2; stadtLw.height = Math.ceil(cv.height / Uc * S) + 2;
  rctx = stadtCtx;
  stadtWelt(M);
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
  const h = STADT_HAEUSER[i], x = bx + h.x, y = by + h.y, frei = i <= spiel.filiale;
  const hier = i === Math.min(spiel.filiale, STADT_HAEUSER.length - 1);
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
  // 5 Baustelle: hier entsteht die Konzernzentrale
  (x, y, w, h, i) => {
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
