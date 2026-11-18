// Wird NICHT vom Spiel geladen. Claude nutzt diesen Bot für Zeitraffer-Playtests im Test-Browser.
// Zeitraffer-Bot (Stand 18.11.2026): läuft im Spiel-Kontext (nach dem Laden der Seite).
// Strategie: kauft immer das günstigste verfügbare Upgrade (Ausrüstung, Mitarbeiter, Modelle, Ladenausbau),
// baut das teuerste Modell, klickt 3×/s mit (hilft beim Verkaufen, wenn das Lager voll ist),
// bedient VIPs nach 3 s, sammelt Erfolge ein und zieht um: opt.umzug = 'sofort' (beim ersten Stern) oder opt.umzugNachMin (frühestens nach X Minuten).
window.botSim = function (opt) {
  for (let i = 0; i < 10000; i++) clearInterval(i);       // normale Spielschleife stoppen
  window.meldung = () => {};
  const dt = 0.1;
  let klickKonto = 0, kaufTimer = 0, t = 0, vipReaktion = 0, laufStart = 0;
  const KLICKS = opt.klicksProSek ?? 3;
  const ergebnis = { laeufe: [], verlauf: [] };
  let ereignisse = {}, klicksVerkauf = 0, verkaufStart = spiel.verkauft, rufKaeufe = [];
  const merke = (name) => { if (!(name in ereignisse)) ereignisse[name] = +((t - laufStart) / 60).toFixed(1); };

  function bestesModellWaehlen() {
    const best = MODELLE.filter(m => spiel.modelle.includes(m.id)).pop();
    if (spiel.aktiv !== best.id) modellWaehlen(best);
  }
  // alle Käufe, die gerade möglich wären – der Bot nimmt immer den günstigsten
  function kandidaten() {
    const k = [];
    for (const [id, u] of Object.entries(UPGRADES)) {
      const n = spiel.upg[id]; if (n >= u.max) continue;
      if (id === 'tisch2' && spiel.filiale < TISCH2_AB) continue;
      k.push({ p: Math.ceil(u.preis(n)), name: id, tun: () => upgradeKaufen(id) });
    }
    if (spiel.upg.manager) for (const m of MITARBEITER) if (spiel.team[m.id] < maxStufe(m))
      k.push({ p: mitarbeiterPreis(m), name: 'team-' + m.id, tun: () => mitarbeiterKaufen(m) });
    const naechstes = MODELLE.find(m => !spiel.modelle.includes(m.id));
    if (naechstes) {
      if (freieVitrinen() > 0) k.push({ p: naechstes.freischalten, name: 'modell-' + naechstes.id, tun: () => modellFreischalten(naechstes) });
      else if (ladenAusbauMoeglich()) k.push({ p: LADEN[spiel.stufe + 1].preis, name: 'laden', tun: ladenAusbauen });
    }
    return k.sort((a, b) => a.p - b.p);
  }
  function kaufen() {
    const k = kandidaten();
    if (k.length && spiel.geld >= k[0].p) {
      k[0].tun();
      const n = k[0].name;
      if (n === 'manager') merke('Store Manager');
      if (n === 'tisch2') merke('2. Packtisch');
      if (n.startsWith('modell-')) merke('Modell ' + n.slice(7));
      if (n === 'laden') merke('Ladenstufe ' + (spiel.stufe + 1));
      if (n.startsWith('team-')) { const id = n.slice(5), s = spiel.team[id]; if (s === 1 || s === 5 || s === 10 || s === 15) merke(id + ' St. ' + s); }
      return true;
    }
    return false;
  }
  function rufKaufenBot() {
    let geht = true;
    while (geht) {
      geht = false;
      const k = RUF_SHOP.filter(r => (spiel.ruf[r.id] || 0) < r.max).map(r => ({ p: r.kosten(spiel.ruf[r.id] || 0), name: r.id, tun: () => rufKaufen(r) }));
      if (RARITAETEN.length > spiel.raritaeten.length) k.push({ p: raritaetPreis(), name: 'Rarität', tun: raritaetErsteigern });
      k.sort((a, b) => a.p - b.p);
      if (k.length && spiel.sterne >= k[0].p) { k[0].tun(); rufKaeufe.push(k[0].name); geht = true; }
    }
  }
  // Ein Klick des Spielers: erst den Stau lösen, dann mitproduzieren, sonst verkaufen
  function klick() {
    const T = spiel.team;
    if (spiel.lager.length && (!T.verkauf || spiel.lager.length >= lagerPlatz())) { klicksVerkauf++; return verkaufen(); }
    if (spiel.polier && spiel.polier.fertig && freierTisch() >= 0) return verpacken();
    if (spiel.polier && !spiel.polier.fertig) { spiel.klicks++; return polieren(); }
    if (!spiel.werkbank.fertig) { spiel.klicks++; return bauen(); }
    if (spiel.lager.length) { klicksVerkauf++; return verkaufen(); }
  }
  function laufAbschliessen() {
    const min = (t - laufStart) / 60;
    ergebnis.laeufe.push({
      filiale: spiel.filiale, minuten: +min.toFixed(1), verdient: Math.round(spiel.rundeVerdient), sterne: sterneFuer(spiel.rundeVerdient),
      uhren: spiel.verkauft - verkaufStart, selbstVerkauft: klicksVerkauf,
      team: { ...spiel.team }, upg: { ...spiel.upg }, modelle: spiel.modelle.length, stufe: spiel.stufe + 1,
      ereignisse, rufKaeufe
    });
    ereignisse = {}; klicksVerkauf = 0; verkaufStart = spiel.verkauft; rufKaeufe = [];
  }

  let letzteMin = -1;
  while (t < opt.sekunden) {
    t += dt; zeit += dt; spiel.spielzeit = (spiel.spielzeit || 0) + dt;
    klickKonto += KLICKS * dt;
    while (klickKonto >= 1) { klickKonto--; klick(); }
    boostUpdate(dt); vipUpdate(dt);
    if (vip) { vipReaktion += dt; if (vipReaktion > 3 && vip.weg >= 1) { vipKlick(); vipReaktion = 0; } } else vipReaktion = 0;
    const turbo = boostFaktor('turbo');
    mitarbeiterArbeiten(dt * turbo); packenWeiter(dt * turbo);
    effekteUpdaten(dt); funken.length = 0; texte.length = 0; gehend.length = 0;
    kaufTimer += dt;
    if (kaufTimer >= 1) {
      kaufTimer = 0;
      while (kaufen()) bestesModellWaehlen();
      bestesModellWaehlen();
      for (const e of ERFOLGE) while (erreicht(e) > gesammelt(e)) erfolgEinsammeln(e.id);
      const s = sterneFuer(spiel.rundeVerdient);
      const min = Math.floor(t / 60);
      if (min !== letzteMin && min % 10 === 0) {
        letzteMin = min;
        ergebnis.verlauf.push({ min, filiale: spiel.filiale, verdientGesamt: Math.round(spiel.verdient), gesamtSterne: spiel.gesamtSterne + s, verkauft: spiel.verkauft });
      }
      // Umzug: sobald es den ersten Stern gibt
      const bleiben = (t - laufStart) / 60;
      const umziehen = opt.umzug === 'sofort' ? s >= 1 : opt.umzugNachMin ? s >= 1 && bleiben >= opt.umzugNachMin : false;
      if (umziehen) { laufAbschliessen(); neueFiliale(); laufStart = t; rufKaufenBot(); }
    }
  }
  ergebnis.offen = { filiale: spiel.filiale, minuten: +((t - laufStart) / 60).toFixed(1), verdient: Math.round(spiel.rundeVerdient),
                     team: { ...spiel.team }, upg: { ...spiel.upg }, ereignisse };
  ergebnis.ende = { minuten: Math.round(t / 60), verdientGesamt: Math.round(spiel.verdient), verkauft: spiel.verkauft, gesamtSterne: spiel.gesamtSterne,
                    ruf: { ...spiel.ruf }, raritaeten: spiel.raritaeten.length, erfolgsStufen: Object.values(spiel.erfolgStufe || {}).reduce((a, b) => a + b, 0),
                    preisBonus: +bonus('preis').toFixed(2), vips: spiel.vips };
  return ergebnis;
};
