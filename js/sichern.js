// ===============================================================
// 13. SPIELSTAND SICHERN
//     Für alle: Export/Import als Code (Einstellungen → Allgemein).
//     Mit ?dev in der Adresse (bleibt gemerkt, ?dev=0 schaltet ab): Test-Werkzeuge
//     mit 3 Speicherplätzen, Vorlagen (z. B. „Prachtstraße mit 60 ★“) und Schummel-Knöpfen.
// ===============================================================
let speicherSperre = false;   // nach Import/Vorlage: alten Stand nicht mehr drüberschreiben
{
  const speichernOriginal = speichern;
  speichern = function () { if (!speicherSperre) speichernOriginal(); };
}

// Spielstand ersetzen und neu starten (Migrationen in laden() laufen dann ganz normal)
function spielstandErsetzen(daten) {
  speicherSperre = true;
  try { localStorage.setItem(SPEICHER, JSON.stringify(daten)); } catch (e) {}
  location.reload();
}

// ---------- Code: "WH1." + Base64 (komprimiert, wenn der Browser es kann → "WH2.") ----------
const b64aus = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode(...bytes.subarray(i, i + 8192)); return btoa(s); };
const b64ein = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
async function strom(bytes, art, modus) {
  const s = new Blob([bytes]).stream().pipeThrough(new (modus === 'ein' ? CompressionStream : DecompressionStream)(art));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
async function codeErzeugen() {
  speichern();
  const bytes = new TextEncoder().encode(JSON.stringify(spiel));
  if (typeof CompressionStream !== 'undefined') {
    try { return 'WH2.' + b64aus(await strom(bytes, 'deflate-raw', 'ein')); } catch (e) {}
  }
  return 'WH1.' + b64aus(bytes);
}
async function codeLesen(code) {
  code = code.trim().replace(/\s+/g, '');
  const [kopf, rest] = [code.slice(0, 4), code.slice(4)];
  let bytes;
  if (kopf === 'WH1.') bytes = b64ein(rest);
  else if (kopf === 'WH2.') bytes = await strom(b64ein(rest), 'deflate-raw', 'aus');
  else throw new Error('kein Code');
  const d = JSON.parse(new TextDecoder().decode(bytes));
  if (!d || typeof d !== 'object' || d.geld == null || !d.team) throw new Error('kein Spielstand');
  return d;
}

$('exportBtn').addEventListener('click', async () => {
  const code = await codeErzeugen(), feld = $('sicherCode');
  feld.hidden = false; feld.value = code; $('importZeile').hidden = true;
  let ok = false;
  try { await navigator.clipboard.writeText(code); ok = true; } catch (e) {}
  if (!ok) { feld.focus(); feld.select(); }
  $('sicherInfo').textContent = t(ok ? 'sich.kopiert' : 'sich.markieren');
});
$('importBtn').addEventListener('click', () => {
  const feld = $('sicherCode');
  feld.hidden = false; feld.value = ''; feld.focus();
  $('importZeile').hidden = false; $('sicherInfo').textContent = '';
});
$('importLos').addEventListener('click', async () => {
  try { spielstandErsetzen(await codeLesen($('sicherCode').value)); }
  catch (e) { $('sicherInfo').textContent = t('sich.fehler'); }
});

// ---------- Test-Werkzeuge (nur mit ?dev) ----------
const DEV_SCHLUESSEL = 'watchhawks-dev';
{
  const m = location.search.match(/[?&]dev(=(\w+))?/);
  try {
    if (m && m[2] === '0') localStorage.removeItem(DEV_SCHLUESSEL);
    else if (m) localStorage.setItem(DEV_SCHLUESSEL, '1');
  } catch (e) {}
}
const devModus = (() => { try { return localStorage.getItem(DEV_SCHLUESSEL) === '1'; } catch (e) { return false; } })();

const platzSchluessel = n => 'watchhawks-platz-' + n;
function platzInfo(n) {
  try {
    const d = JSON.parse(localStorage.getItem(platzSchluessel(n)));
    if (!d) return null;
    const zeit = new Date(d.zuletzt || Date.now());
    return `${filialName(d.filiale || 0)} · ${kurz(d.geld || 0)} € · ${d.sterne || 0} ★ · ${zeit.toLocaleDateString()} ${zeit.toLocaleTimeString().slice(0, 5)}`;
  } catch (e) { return null; }
}

// Vorlagen: Grundlage ist ein frischer Stand ohne Intro, alle Knöpfe da; Profil und Sprache bleiben
function grundstand() {
  const d = neuesSpiel();
  Object.assign(d, { introGesehen: true, sprache: spiel.sprache, profil: { ...spiel.profil },
    knopfFrei: { polBtn: true, packBtn: true, verBtn: true, erfolgeBtn: true, menueBtn: true },
    tabFrei: { uhren: true }, tabGesehen: { menue: true, uhren: true } });
  return d;
}
function modellSetzen(d, ids) { d.modelle = ids; d.aktiv = ids[ids.length - 1]; const m = MODELLE.find(x => x.id === d.aktiv); d.werkbank = { id: m.id, rest: m.bau, fertig: false }; }
const VORLAGEN = [
  { name: { de: 'Neu (ohne Intro)', en: 'New (no intro)' }, bau: () => grundstand() },
  { name: { de: 'Hinterhof fast fertig', en: 'Back yard almost done' }, bau: () => {
      const d = grundstand();
      Object.assign(d, { geld: 1500, verdient: 9500, rundeVerdient: 9500, verkauft: 900, spielzeit: 1100, rundeZeit: 1100 });
      Object.assign(d.upg, { werkzeug: 5, tuch: 5, pack: 3, regal: 1, manager: 1 });
      Object.assign(d.team, { bau: 3, polier: 3, pack: 2, verkauf: 3 });
      d.tabFrei = { uhren: true, laden: true }; d.tabGesehen = { menue: true, uhren: true, laden: true, manager: true };
      modellSetzen(d, ['quarz', 'taucher']);
      return d; } },
  { name: { de: '2. Laden (Fußgängerzone)', en: '2nd shop (pedestrian zone)' }, bau: () => {
      const d = grundstand();
      Object.assign(d, { filiale: 1, sterne: 2, gesamtSterne: 2, lisaUmzug: true, verdient: 12000, verkauft: 1100, spielzeit: 1300, geld: 250 });
      d.ruf = { kapital: 1 };
      d.tabFrei = { uhren: true, laden: true, ruf: true }; d.tabGesehen = { menue: true, uhren: true, laden: true, ruf: true, manager: true };
      return d; } },
  { name: { de: 'Prachtstraße, 60 ★ (Konzern bereit)', en: 'Luxury street, 60 ★ (corporation ready)' }, bau: () => {
      const d = grundstand();
      Object.assign(d, { filiale: 4, sterne: 60, gesamtSterne: 140, lisaUmzug: true, stufe: 3, geld: 2e6,
        verdient: 8e7, rundeVerdient: 9e6, verkauft: 60000, spielzeit: 6 * 3600, rundeZeit: 1200, vips: 40 });
      Object.assign(d.upg, { werkzeug: 12, tuch: 12, pack: 10, regal: 7, manager: 1, tisch2: 1 });
      Object.assign(d.team, { bau: 9, polier: 9, pack: 9, verkauf: 12 });
      d.ruf = { kapital: 4, kontakte: 1, stamm: 1, haende: 5, ruf: 5, packen: 3, motiv: 3 };
      modellSetzen(d, ['quarz', 'taucher', 'chrono', 'gold', 'diamant']);
      d.tabFrei = { uhren: true, laden: true, ruf: true }; d.tabGesehen = { menue: true, uhren: true, laden: true, ruf: true, manager: true };
      return d; } },
  { name: { de: 'Konzern läuft (5 Mio. €, 40 ★)', en: 'Corporation running (5M €, 40 ★)' }, bau: () => {
      const d = VORLAGEN[3].bau();
      Object.assign(d, { sterne: 40, geld: 5e6, konzern: neuerKonzern() });
      return d; } },
];
const CHEATS = [
  { name: '€ ×10', tun: () => { const plus = Math.max(1000, spiel.geld * 9); spiel.geld += plus; spiel.verdient += plus; spiel.rundeVerdient += plus; if (spiel.konzern) spiel.konzern.verdient += plus; } },
  { name: { de: 'Töpfe voll', en: 'Fill pots' }, tun: () => { if (spiel.konzern) spiel.konzern.f.forEach((f, i) => f.topf = kTopfGroesse(i)); } },
  { name: 'Limo', tun: () => { if (spiel.konzern) naechsteLimo = 0; } },
  { name: '+10 ★', tun: () => { spiel.sterne += 10; spiel.gesamtSterne += 10; } },
  { name: '+50 ★', tun: () => { spiel.sterne += 50; spiel.gesamtSterne += 50; } },
  { name: { de: 'Alle Reiter', en: 'All tabs' }, tun: () => { Object.assign(spiel.tabFrei, { uhren: true, laden: true, ruf: true }); spiel.upg.manager = 1; } },
];
const nameVon = n => typeof n === 'string' ? n : (n[SPRACHE] || n.de);

function testWerkzeugeBauen() {
  if (!devModus) return;
  $('testWerkzeuge').hidden = false;
  $('testPlaetze').innerHTML = [1, 2, 3].map(n => {
    const info = platzInfo(n);
    return `<div class="testPlatz"><span><b>${t('test.platz', { n })}</b>: ${info || t('test.leer')}</span>
      <button class="zweit" data-speichern="${n}">${t('test.speichern')}</button>
      <button data-laden="${n}" ${info ? '' : 'disabled'}>${t('test.laden')}</button></div>`;
  }).join('');
  $('testVorlagen').innerHTML = VORLAGEN.map((v, i) => `<button class="zweit" data-vorlage="${i}">${nameVon(v.name)}</button>`).join('');
  $('testCheats').innerHTML = CHEATS.map((c, i) => `<button data-cheat="${i}">${nameVon(c.name)}</button>`).join('');
}
$('testWerkzeuge').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.speichern) {
    speichern();
    try { localStorage.setItem(platzSchluessel(b.dataset.speichern), JSON.stringify(spiel)); } catch (err) {}
    testWerkzeugeBauen();
  } else if (b.dataset.laden) {
    try { spielstandErsetzen(JSON.parse(localStorage.getItem(platzSchluessel(b.dataset.laden)))); } catch (err) {}
  } else if (b.dataset.vorlage) {
    spielstandErsetzen(VORLAGEN[+b.dataset.vorlage].bau());
  } else if (b.dataset.cheat) {
    CHEATS[+b.dataset.cheat].tun(); speichern(); gebaut = '';
  }
});
// beim Öffnen von „Allgemein“ mit aufbauen
{
  const alt = allgemeinAktualisieren;
  allgemeinAktualisieren = function () { alt(); testWerkzeugeBauen(); };
}
