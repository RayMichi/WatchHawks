// ===============================================================
// 11. INTRO – nur beim allerersten Start
//     Titel: Laden von oben mit Dach + „WatchHawks“ → Tippen
//     Dialog: Hintergrund dunkel, Lisa + Textbox (2 Texte) → Tippen
//     Ende: Dach fliegt nach oben weg, das Spiel geht los
// ===============================================================
let dachP = 1;                       // 0 = Dach zu, 1 = Dach weg (normales Spiel)
const intro = { phase: null, nr: 0, voll: '', zeichen: 0, timer: null };
const DACH_DAUER = 1.4;              // Sekunden, bis das Dach weg ist
const INTRO_TEXTE = ['intro.text1', 'intro.text2'];

function introStarten() {
  dachP = 0;
  intro.phase = 'titel'; intro.nr = 0;
  document.body.classList.add('intro');
  const el = $('intro');
  el.hidden = false;
  el.className = 'titel';
}

function introTippen() {
  if (intro.phase === 'titel') {
    intro.phase = 'dialog';
    $('intro').className = 'dialog';
    boxHoeheFestlegen();
    textZeigen(0);
  } else if (intro.phase === 'dialog') {
    if (intro.zeichen < intro.voll.length) { textFertig(); return; }   // erst ganz anzeigen
    if (intro.nr + 1 < INTRO_TEXTE.length) textZeigen(intro.nr + 1);
    else {
      intro.phase = 'dach';
      $('intro').className = 'dach';
    }
  }
}

// Textbox so hoch wie der längste Text -> Lisa springt beim Weiterblättern nicht
function boxHoeheFestlegen() {
  const el = $('introText');
  el.style.minHeight = '';
  let hoch = 0;
  for (const k of INTRO_TEXTE) { el.textContent = t(k); hoch = Math.max(hoch, el.offsetHeight); }
  el.style.minHeight = hoch + 'px';
  el.textContent = '';
}
window.addEventListener('resize', () => { if (intro.phase === 'dialog') { boxHoeheFestlegen(); $('introText').textContent = intro.voll.slice(0, intro.zeichen); } });

// Text Buchstabe für Buchstabe eintippen
function textZeigen(nr) {
  intro.nr = nr;
  intro.voll = t(INTRO_TEXTE[nr]);
  intro.zeichen = 0;
  $('introText').textContent = '';
  $('intro').classList.remove('fertig');
  clearInterval(intro.timer);
  intro.timer = setInterval(() => {
    intro.zeichen += 1;
    $('introText').textContent = intro.voll.slice(0, intro.zeichen);
    if (intro.zeichen >= intro.voll.length) textFertig();
  }, 28);
}
function textFertig() {
  clearInterval(intro.timer);
  intro.zeichen = intro.voll.length;
  $('introText').textContent = intro.voll;
  $('intro').classList.add('fertig');
}

function introUpdate(dt) {
  if (intro.phase !== 'dach') return;
  dachP = Math.min(1, dachP + dt / DACH_DAUER);
  if (dachP >= 1) introEnde();
}
function introEnde() {
  intro.phase = null; dachP = 1;
  $('intro').hidden = true;
  document.body.classList.remove('intro');
  spiel.introGesehen = true;
  speichern();
}

$('intro').addEventListener('click', introTippen);
document.addEventListener('keydown', e => {
  if (!intro.phase) return;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); introTippen(); }
});

// ---------- Dach (wird in zeichnen() statt Ladenschild gemalt) ----------
const DACH = { hell: '#a4503a', dunkel: '#83402f', fuge: '#62301f', first: '#4f261a', licht: '#c46a4e' };
function dachZeichnen(L) {
  const p = dachP, e = p * p * (3 - 2 * p);                 // weich anfahren und abbremsen
  if (e < 0.35) textPuffer = [];                            // Raumschilder liegen unter dem Dach
  const dy = -e * (L.H + loy + 50);
  const x = -4, y = -4 + dy, w = L.W + 8, h = L.H + 8, mitte = y + Math.round(h * 0.42);
  // Schatten aufs Gebäude, solange das Dach noch tief ist
  if (e < 0.6) r(x + 2, y + h, w - 4, 3, `rgba(20,10,16,${0.35 * (1 - e / 0.6)})`);
  r(x - 1, y - 1, w + 2, h + 2, F.umriss);
  r(x, y, w, mitte - y, DACH.hell);                        // obere Dachfläche (Licht)
  r(x, mitte, w, y + h - mitte, DACH.dunkel);              // untere Dachfläche (Schatten)
  // Dachziegel: Reihen mit versetzten Fugen
  let reihe = 0;
  for (let ry = y + 5; ry < y + h - 2; ry += 5, reihe++) {
    if (Math.abs(ry - mitte) < 3) continue;
    r(x, ry, w, P, DACH.fuge);
    for (let jx = x + (reihe % 2 ? 4 : 0); jx < x + w; jx += 8) r(jx, ry - 5 + P, P, 5 - P, DACH.fuge);
    r(x, ry + P, w, P, ry < mitte ? DACH.licht : DACH.hell);
  }
  // First (Dachkante in der Mitte) + Traufe unten
  r(x, mitte - 1, w, 2, DACH.first);
  r(x, mitte - 1, w, P, DACH.licht);
  r(x, y + h - 2, w, 2, DACH.first);
  // Schornstein mit Rauch
  const sx = x + Math.round(w * 0.8), sy = y + Math.round(h * 0.12);
  r(sx - 1, sy - 1, 12, 13, F.umriss);
  r(sx, sy, 10, 11, '#8a6050');
  for (let by = sy + 3; by < sy + 11; by += 3) r(sx, by, 10, P, '#6b4638');
  r(sx, sy, 10, 2, '#4a3028');
  r(sx + 2, sy + 0.5, 6, 1, '#2a1a16');
  for (let i = 0; i < 3; i++) {
    const q = ((zeit * 0.5 + i / 3) % 1), g = 2 + q * 3;
    r(sx + 3 + q * 4 - g / 2, sy - 3 - q * 14 - g / 2, g, g, `rgba(235,228,232,${0.55 * (1 - q)})`);
  }
  // Holzschild mit dem Spielnamen auf dem Dach
  const name = 'WatchHawks', g = Math.min(12, (L.W - 30) / 10);
  const bw = Math.ceil(webBreite(name, g) + 16), bh = Math.ceil(g + 12);
  const bx = Math.round(L.mitte - bw / 2), by = Math.round(y + h * 0.62 - bh / 2);
  r(bx - 1, by - 1, bw + 2, bh + 2, F.umriss);
  r(bx, by, bw, bh, '#4a2c38');
  r(bx, by, bw, 1, '#6b4558');
  r(bx, by + bh - 2, bw, 2, '#38202c');
  for (const [dx, dd] of [[2, 2], [bw - 3, 2], [2, bh - 3], [bw - 3, bh - 3]]) r(bx + dx, by + dd, 1, 1, F.gold);
  text(name, L.mitte, by + bh / 2, g, '#ffd77a', '#1d1219');
}
