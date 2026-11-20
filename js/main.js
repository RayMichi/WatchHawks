// ===============================================================
// 10. SPIELSCHLEIFE – ca. 30× pro Sekunde
// ===============================================================
let letzte = performance.now(), seitMenue = 1;
function schritt() {
  const jetzt = performance.now();
  const dt = (jetzt - letzte) / 1000;
  letzte = jetzt; zeit += dt;
  spiel.spielzeit += dt; spiel.rundeZeit += dt;

  if (imKonzern()) konzernTick(Math.min(dt, 5));
  else {
    boostUpdate(dt);
    vipUpdate(Math.min(dt, 5));
    const turbo = boostFaktor('turbo');
    mitarbeiterArbeiten(dt * turbo);
    packenWeiter(dt * turbo);
    effekteUpdaten(Math.min(dt, 1));
  }
  introUpdate(Math.min(dt, 0.1));
  konzernUpdate(Math.min(dt, 0.1));

  if (!cv.width) groesse();
  if (cv.width && konzernAktiv()) konzernZeichnen();                               // Stadtansicht / Zoom
  else if (cv.width) { const v = introVersatz(); loy += v; zeichnen(); loy -= v; }   // Intro: Haus verschoben
  knoepfeAktualisieren();
  seitMenue += dt;
  if (seitMenue > 0.15) { menueAktualisieren(); erfolgePruefen(); erfolgeAktualisieren(); seitMenue = 0; }
}

laden();
spracheSetzen(spiel.sprache);
offlineBerechnen();
if (!spiel.introGesehen) introStarten();
else if (imKonzern()) konzernModusAn();
groesse();
schritt();
setInterval(schritt, 33);
setInterval(speichern, 5000);
window.addEventListener('beforeunload', speichern);
