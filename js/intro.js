// ===============================================================
// 11. INTRO & LISA-DIALOGE
//     Intro (erster Start): Titel mit Dach + „WatchHawks“ → Tippen → Lisa (2 Texte) → Dach fliegt weg
//     Umzug (erster Umzug): neuer Laden mit eigenem Dach → Lisa erklärt die Ruf-Sterne (4 Texte) → Dach fliegt weg
// ===============================================================
let dachP = 1;                       // 0 = Dach zu, 1 = Dach weg (normales Spiel)
const intro = { phase: null, art: 'intro', nr: 0, voll: '', zeichen: 0, timer: null, wander: 0 };
const WANDER_DAUER = 0.8;            // Sekunden: Haus wandert vom Titel-Platz in die Mitte
const DACH_DAUER = 1.4;              // Sekunden, bis das Dach weg ist
const DIALOGE = {
  konzern: ['konzern.text1', 'konzern.text2', 'konzern.text3'],
  intro: ['intro.text1', 'intro.text2'],
  umzug: ['umzug.text1', 'umzug.text2', 'umzug.text3', 'umzug.text4'],
};
const dialogTexte = () => DIALOGE[intro.art];

function introStarten() { lisaStarten('intro'); }

// Startet einen Dialog mit Lisa. Laden ist dabei mit dem Dach der aktuellen Filiale abgedeckt.
function lisaStarten(art) {
  dachP = 0;
  intro.art = art; intro.nr = 0;
  intro.wander = art === 'intro' ? 0 : 1;                  // nur das Intro hat den Titel-Platz oben
  document.body.classList.add('intro');
  $('menue').classList.remove('offen');
  fensterZu();
  const el = $('intro');
  el.hidden = false;
  if (art === 'intro') { intro.phase = 'titel'; el.className = 'titel'; }
  else { intro.phase = 'dialog'; el.className = 'dialog'; boxHoeheFestlegen(); textZeigen(0); }
}

function introTippen() {
  if (intro.phase === 'titel') {
    intro.phase = 'dialog';
    $('intro').className = 'dialog';
    boxHoeheFestlegen();
    textZeigen(0);
  } else if (intro.phase === 'dialog') {
    if (intro.zeichen < intro.voll.length) { textFertig(); return; }   // erst ganz anzeigen
    if (intro.nr + 1 < dialogTexte().length) textZeigen(intro.nr + 1);
    else if (intro.art === 'konzern') konzernDialogEnde();
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
  for (const k of dialogTexte()) { el.textContent = t(k); hoch = Math.max(hoch, el.offsetHeight); }
  el.style.minHeight = hoch + 'px';
  el.textContent = '';
}
window.addEventListener('resize', () => { if (intro.phase === 'dialog') { boxHoeheFestlegen(); $('introText').textContent = intro.voll.slice(0, intro.zeichen); } });

// Text Buchstabe für Buchstabe eintippen
function textZeigen(nr) {
  intro.nr = nr;
  intro.voll = t(dialogTexte()[nr]);
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

// Titel: Haus sitzt weit oben (Platz für „Tippen zum Starten“). Nach dem Tippen wandert es in die Mitte.
// Liefert den Versatz in Spieleinheiten, der beim Zeichnen auf loy addiert wird.
function introVersatz() {
  if (!intro.phase || !cv.height) return 0;
  const ziel = cv.height * 0.09 / U + 4;                   // Dachkante bei ca. 9 % der Höhe
  const voll = Math.min(0, ziel - loy);
  const w = intro.wander, f = 1 - w * w * (3 - 2 * w);
  return Math.round(voll * f * S) / S;
}

function introUpdate(dt) {
  if (intro.phase && intro.phase !== 'titel') intro.wander = Math.min(1, intro.wander + dt / WANDER_DAUER);
  if (intro.phase !== 'dach') return;
  dachP = Math.min(1, dachP + dt / DACH_DAUER);
  if (dachP >= 1) introEnde();
}
function introEnde() {
  intro.phase = null; dachP = 1;
  $('intro').hidden = true;
  document.body.classList.remove('intro');
  if (intro.art === 'intro') spiel.introGesehen = true; else spiel.lisaUmzug = true;
  speichern();
}

$('intro').addEventListener('click', introTippen);
document.addEventListener('keydown', e => {
  if (!intro.phase) return;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); introTippen(); }
});

// ---------- Dach (wird in zeichnen() statt Ladenschild gemalt) ----------
// Jede Filiale hat ihr eigenes Dach, damit man sofort sieht: darunter ist ein anderer Laden.
const DACH_STILE = [
  // Hinterhof: rote Tonziegel
  { hell: '#a4503a', dunkel: '#83402f', fuge: '#62301f', first: '#4f261a', licht: '#c46a4e', rinne: '#4f261a',
    schornstein: '#8a6050', gauben: false },
  // Fußgängerzone (und später): blaugrauer Schiefer, Dachgauben mit Licht und Blumenkästen, Kupferrinne
  { hell: '#5f6f86', dunkel: '#4b586c', fuge: '#363f4e', first: '#2a313d', licht: '#8193ad', rinne: '#c07a3a',
    schornstein: '#9a5a48', gauben: true },
  // Einkaufszentrum: helles Flachdach mit Oberlichtern und Lüftern
  { hell: '#c9ced3', dunkel: '#b4bac0', fuge: '#9aa1a8', first: '#8a9198', licht: '#e2e6ea', rinne: '#7a8288',
    schornstein: '#9aa1a8', flach: true },
  // Hauptstraße: dunkler Schiefer mit goldenem First
  { hell: '#3e3a46', dunkel: '#2f2c36', fuge: '#1f1d25', first: '#c8932e', licht: '#55505f', rinne: '#f0c050',
    schornstein: '#5a4a4a', gauben: true },
  // Prachtstraße: violette Ziegel mit Gold
  { hell: '#6e4a8a', dunkel: '#573a6e', fuge: '#3d2850', first: '#f0c050', licht: '#8e68a8', rinne: '#f0c050',
    schornstein: '#7a5a6a', gauben: true },
];
const dachStil = () => DACH_STILE[Math.min(spiel.filiale, DACH_STILE.length - 1)];
function dachZeichnen(L) {
  const p = dachP, e = p * p * (3 - 2 * p);                 // weich anfahren und abbremsen
  if (e < 0.35) textPuffer = [];                            // Raumschilder liegen unter dem Dach
  const dy = -e * (L.H + loy + 50);
  const D = dachStil();
  const x = -4, y = -4 + dy, w = L.W + 8, h = L.H + 8, mitte = y + Math.round(h * 0.42);
  // Schatten aufs Gebäude, solange das Dach noch tief ist
  if (e < 0.6) r(x + 2, y + h, w - 4, 3, `rgba(20,10,16,${0.35 * (1 - e / 0.6)})`);
  r(x - 1, y - 1, w + 2, h + 2, F.umriss);
  r(x, y, w, mitte - y, D.hell);                        // obere Dachfläche (Licht)
  r(x, mitte, w, y + h - mitte, D.dunkel);              // untere Dachfläche (Schatten)
  // Dachziegel: Reihen mit versetzten Fugen
  if (D.flach) { flachdach(x, y, w, h, D, 1); }
  let reihe = 0;
  if (!D.flach) for (let ry = y + 5; ry < y + h - 2; ry += 5, reihe++) {
    if (Math.abs(ry - mitte) < 3) continue;
    r(x, ry, w, P, D.fuge);
    const breit = D.gauben ? 6 : 8;                           // Schiefer: kleinere Platten
    for (let jx = x + (reihe % 2 ? breit / 2 : 0); jx < x + w; jx += breit) r(jx, ry - 5 + P, P, 5 - P, D.fuge);
    r(x, ry + P, w, P, ry < mitte ? D.licht : D.hell);
  }
  // First (Dachkante in der Mitte) + Traufe unten
  if (!D.flach) { r(x, mitte - 1, w, 2, D.first); r(x, mitte - 1, w, P, D.licht); }
  r(x, y + h - 2, w, 2, D.rinne);                          // Traufe / Regenrinne
  if (D.gauben) r(x, y + h - 2, w, P, '#e0a060');
  // Schornstein mit Rauch
  const sx = x + Math.round(w * 0.8), sy = y + Math.round(h * 0.12);
  r(sx - 1, sy - 1, 12, 13, F.umriss);
  r(sx, sy, 10, 11, D.schornstein);
  for (let by = sy + 3; by < sy + 11; by += 3) r(sx, by, 10, P, '#6b4638');
  r(sx, sy, 10, 2, '#4a3028');
  r(sx + 2, sy + 0.5, 6, 1, '#2a1a16');
  for (let i = 0; i < 3; i++) {
    const q = ((zeit * 0.5 + i / 3) % 1), g = 2 + q * 3;
    r(sx + 3 + q * 4 - g / 2, sy - 3 - q * 14 - g / 2, g, g, `rgba(235,228,232,${0.55 * (1 - q)})`);
  }
  // Dachgauben (Fenster mit warmem Licht + Blumenkasten) auf der oberen Dachfläche
  if (D.gauben) for (const fx of [0.16, 0.44]) {
    const gx = Math.round(x + w * fx), gy = Math.round(y + h * 0.1), gw = 18, gh = 15;
    r(gx - 1, gy - 1, gw + 2, gh + 2, F.umriss);
    r(gx, gy, gw, 4, D.first);                             // Gaubendach
    r(gx, gy, gw, P, D.licht);
    r(gx, gy + 4, gw, gh - 4, '#e8dcc4');                  // Wand
    r(gx + 4, gy + 6, gw - 8, 6, '#2a313d');               // Fensterrahmen
    r(gx + 5, gy + 7, gw - 10, 4, '#ffd77a');              // Licht im Fenster
    r(gx + gw / 2 - 0.5, gy + 7, 1, 4, '#2a313d');         // Fensterkreuz
    r(gx + 3, gy + 12, gw - 6, 2, '#8a5a3a');              // Blumenkasten
    for (let bx = gx + 4; bx < gx + gw - 4; bx += 2.5) r(bx, gy + 11, 1.5, 1.5, (bx - gx) % 5 < 2.5 ? '#e05a6a' : '#f5c542');
  }
  // Holzschild auf dem Dach: im Intro der Spielname, beim Umzug der Name der neuen Filiale
  const name = intro.art === 'intro' ? 'WatchHawks' : filialName(), g = Math.min(12, (L.W - 30) / name.length);
  const bw = Math.ceil(webBreite(name, g) + 16), bh = Math.ceil(g + 12);
  const bx = Math.round(L.mitte - bw / 2), by = Math.round(y + h * 0.62 - bh / 2);
  r(bx - 1, by - 1, bw + 2, bh + 2, F.umriss);
  r(bx, by, bw, bh, '#4a2c38');
  r(bx, by, bw, 1, '#6b4558');
  r(bx, by + bh - 2, bw, 2, '#38202c');
  for (const [dx, dd] of [[2, 2], [bw - 3, 2], [2, bh - 3], [bw - 3, bh - 3]]) r(bx + dx, by + dd, 1, 1, F.gold);
  text(name, L.mitte, by + bh / 2, g, '#ffd77a', '#1d1219');
}

// Flachdach (Einkaufszentrum): Platten, Oberlichter, Lüfter. f = Maßstab (1 = großes Dach, kleiner = Stadtansicht)
function flachdach(x, y, w, h, D, f) {
  r(x, y, w, h, D.hell);
  r(x + 2 * f, y + 2 * f, w - 4 * f, h - 4 * f, D.dunkel);
  for (let px = x + 12 * f; px < x + w - 4 * f; px += 12 * f) r(px, y + 2 * f, P, h - 4 * f, D.fuge);
  const n = Math.max(2, Math.floor(w / (34 * f)));
  for (let i = 0; i < n; i++) {
    const ox = Math.round(x + w * (i + 0.5) / n - 7 * f), oy = Math.round(y + h * 0.22);
    r(ox - P, oy - P, 14 * f + 2 * P, 9 * f + 2 * P, F.umriss);
    r(ox, oy, 14 * f, 9 * f, '#7fb4d8');                    // Oberlicht (Glas)
    r(ox, oy, 14 * f, 2 * f, '#b8dcf0');
    r(ox + 7 * f, oy, P, 9 * f, '#4a7a9a');
  }
  for (let i = 0; i < 3; i++) {                            // Lüfter
    const lx = Math.round(x + w * (0.2 + i * 0.3)), ly = Math.round(y + h * 0.68);
    r(lx - P, ly - P, 6 * f + 2 * P, 6 * f + 2 * P, F.umriss);
    r(lx, ly, 6 * f, 6 * f, '#8a9198');
    r(lx + 1 * f, ly + 1 * f, 4 * f, 4 * f, '#5e656b');
  }
}
