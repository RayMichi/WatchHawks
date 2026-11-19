// ===============================================================
// 10. SPIELSCHLEIFE – ca. 30× pro Sekunde
// ===============================================================
let letzte = performance.now(), seitMenue = 1;
function schritt() {
  const jetzt = performance.now();
  const dt = (jetzt - letzte) / 1000;
  letzte = jetzt; zeit += dt;
  spiel.spielzeit += dt; spiel.rundeZeit += dt;

  boostUpdate(dt);
  vipUpdate(Math.min(dt, 5));
  const turbo = boostFaktor('turbo');
  mitarbeiterArbeiten(dt * turbo);
  packenWeiter(dt * turbo);
  effekteUpdaten(Math.min(dt, 1));
  introUpdate(Math.min(dt, 0.1));

  if (!cv.width) groesse();
  if (cv.width) { zeichnen(); }
  knoepfeAktualisieren();
  seitMenue += dt;
  if (seitMenue > 0.15) { menueAktualisieren(); erfolgePruefen(); erfolgeAktualisieren(); seitMenue = 0; }
}

laden();
spracheSetzen(spiel.sprache);
offlineBerechnen();
if (!spiel.introGesehen) introStarten();
groesse();
schritt();
setInterval(schritt, 33);
setInterval(speichern, 5000);
window.addEventListener('beforeunload', speichern);
