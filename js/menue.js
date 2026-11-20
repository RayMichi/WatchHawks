// ===============================================================
// 8. MENÜ MIT REITERN
//    Alle Texte kommen über t() aus sprache.js.
// ===============================================================
const $ = id => document.getElementById(id);
let tab = 'ausruestung', gebaut = '', resetGeklickt = false;
const komma = z => z.toLocaleString(LOCALE(), { maximumFractionDigits: 1 });

function eintraege() {
  if (tab[0] === 'k' && imKonzern()) return konzernEintraege(tab);
  if (tab === 'uhren') {
    const naechstes = MODELLE.find(m => !spiel.modelle.includes(m.id));
    return MODELLE.filter(m => spiel.modelle.includes(m.id) || m === naechstes).map(m => {
      const name = nm('modelle', m.id, m.name);
      const info = t('uhr.info', { b: m.bau, p: m.polier, x: zahl(m.preis) });
      if (!spiel.modelle.includes(m.id)) {
        const platz = freieVitrinen() > 0;
        return { key: 'm-' + m.id, icon: 'uhren', titel: name, info: t('uhr.neu', { n: info }),
                 knopf: platz ? t('uhr.vitrine', { x: zahl(m.freischalten) }) : t('uhr.keineVitrine'),
                 aus: !platz || spiel.geld < m.freischalten, tun: () => modellFreischalten(m) };
      }
      const aktiv = spiel.aktiv === m.id;
      return { key: 'm-' + m.id, icon: 'uhren', titel: name, info, knopf: aktiv ? t('uhr.wirdGebaut') : t('uhr.bauen'),
               aus: aktiv, gewaehlt: aktiv, tun: () => modellWaehlen(m) };
    });
  }
  if (tab === 'laden') {
    const l = LADEN[spiel.stufe], n = LADEN[spiel.stufe + 1];
    const ladenName = i => nm('laden', i, LADEN[i].name);
    const neu = sterneFuer(spiel.rundeVerdient);
    // Info-Kachel (nicht kaufbar): aktueller Laden, hier verdient, nächster Stern
    const liste = [
      { key: 'f-jetzt', icon: 'laden', titel: filialName(), infoKachel: true,
        info: t('laden.filialeInfo', { n: spiel.filiale + 1, x: zahl(spiel.rundeVerdient) }) + ' · ' + t('laden.naechsterSternKurz', { x: zahl(sternSchwelle(neu + 1)) }) }
    ];
    // Ladenausbau: eine Kachel – aktueller Stand + nächster Ausbau (falls möglich)
    const stand = t('laden.belegt', { n: ladenName(spiel.stufe), a: spiel.modelle.length, b: l.vitrinen });
    if (n && ladenAusbauMoeglich())
      liste.push({ key: 'l-' + spiel.stufe, icon: 'laden', titel: t('laden.ausbau'),
                   info: stand + ' → ' + t('laden.vitrinen', { n: ladenName(spiel.stufe + 1), v: n.vitrinen }),
                   knopf: zahl(n.preis) + ' €', aus: spiel.geld < n.preis, tun: ladenAusbauen });
    else liste.push({ key: 'l-voll', icon: n ? 'schloss' : 'laden', titel: t('laden.ausbau'),
                      info: stand + ' · ' + (n ? t('laden.vollKurz') : t('laden.fertig')) });
    liste.push({ key: 'f-neu', icon: 'stern', titel: t('laden.neu'),
        info: neu ? t('laden.neuInfo', { n: neu, f: filialName(spiel.filiale + 1) }) : t('laden.neuFrueh', { x: zahl(sternSchwelle(1)), f: filialName(spiel.filiale + 1) }),
        knopf: !neu ? t('laden.zuFrueh') : prestigeGeklickt ? t('laden.wirklich') : t('laden.umziehen', { n: neu }),
        aus: !neu, tun: prestigeKlick });
    return liste;
  }
  if (tab === 'ruf') {
    // Info-Kachel: nur insgesamt verdiente Sterne und ihr Bonus (ausgeben kann man sie in den Kacheln darunter)
    const liste = [{ key: 'ruf-info', icon: 'stern', titel: t('ruf.verdient', { g: spiel.gesamtSterne }), infoKachel: true,
      info: t('ruf.bonus', { p: spiel.gesamtSterne * STERN_BONUS }) }];
    // Konzern gründen (lila): kostet 50 Sterne, die man gerade frei hat
    const kOk = spiel.sterne >= KONZERN_PREIS;
    liste.push({ key: 'konzern', icon: 'laden', klasse: 'konzernkarte', titel: t('konzern.titel'),
      info: kOk ? t('konzern.info') : t('konzern.fehlt', { n: KONZERN_PREIS, h: spiel.sterne }),
      knopf: konzernGeklickt && kOk ? t('konzern.wirklich') : `${KONZERN_PREIS} ★`, aus: !kOk, tun: konzernKlick });
    for (const r of RUF_SHOP) {
      const n = spiel.ruf[r.id] || 0, max = n >= r.max, p = r.kosten(n);
      liste.push({ key: 'ruf-' + r.id, icon: r.icon || 'stern', titel: nm('ruf', r.id, r.name),
        info: (r.max > 1 ? `${n}/${r.max} · ` : '') + (n ? r.text(n) + (max ? '' : ` → ${r.text(n + 1)}`) : r.text(1)),
        knopf: max ? (r.max > 1 ? t('max') : t('ruf.gekauft')) : `${p} ★`, aus: max || spiel.sterne < p, tun: () => rufKaufen(r) });
    }
    return liste;
  }
  if (tab === 'manager') {
    if (!spiel.upg.manager) return [{ key: 'm-zu', titel: t('man.gesperrt'), info: t('man.gesperrtInfo'), icon: 'schloss' }];
    return MITARBEITER.map(m => {
      const n = spiel.team[m.id], max = n >= maxStufe(m), p = mitarbeiterPreis(m);
      const klicker = m.id === 'bau' || m.id === 'polier';
      const wert = s => klicker ? komma(klickRate(s)) : sek(m.id === 'pack' ? reaktion(s, PACKER_START) : verkaufIntervall(s));
      const form = (a, b) => t(klicker ? 'man.klicks' : 'man.alle', { a: b ? `${a} → ${b}` : a });
      const schritt = t({ bau: 'btn.bauen', polier: 'btn.polieren', pack: 'btn.verpacken', verkauf: 'btn.verkaufen' }[m.id]);
      const info = `${schritt}: ` + (!n ? form(wert(1)) : max ? form(wert(n)) : form(wert(n), wert(n + 1)));
      const name = nm('mitarbeiter', m.id, m.name);
      return { key: 'ma-' + m.id, icon: m.icon, titel: name, info: n ? t('upg.stufe', { s: n }) + ' · ' + info : info,
               knopf: max ? t('max') : t(n ? 'man.upgrade' : 'man.einstellen', { x: zahl(p) }),
               aus: max || spiel.geld < p, tun: () => mitarbeiterKaufen(m) };
    });
  }
  // Reiter Ausrüstung
  const UPG_ICON = { werkzeug: 'bau', tuch: 'polier', pack: 'pack', regal: 'regal', manager: 'manager', tisch2: 'pack' };
  return Object.entries(UPGRADES).map(([id, u]) => {
    const n = spiel.upg[id], max = n >= u.max, p = Math.ceil(u.preis(n));
    const name = nm('upgrades', id, u.name);
    if (id === 'tisch2') {
      if (spiel.filiale < TISCH2_AB) return { key: 'u-tisch2-zu', icon: 'schloss', titel: name, info: t('upg.tisch2Zu', { n: filialName(TISCH2_AB) }) };
      return { key: 'u-tisch2', icon: 'pack', titel: name, info: max ? t('upg.tisch2Frei') : t('upg.tisch2'),
               knopf: max ? t('upg.erledigt') : zahl(p) + ' €', aus: max || spiel.geld < p, tun: () => upgradeKaufen(id) };
    }
    const info = {
      werkzeug: () => t('upg.werkzeug', { a: komma(bauKraft()), b: komma(bauKraft(n + 1)) }),
      tuch:     () => t('upg.tuch', { a: komma(polierKraft()), b: komma(polierKraft(n + 1)) }),
      pack:     () => t('upg.pack', { a: sek(packZeit()), b: sek(packZeit(n + 1)) }),
      regal:    () => t('upg.regal', { a: lagerPlatz(), b: lagerPlatz(n + 1) }),
      manager:  () => t('upg.manager')
    }[id]();
    if (id === 'manager') return { key: 'u-manager', icon: 'manager', titel: name, info: max ? t('upg.managerFrei') : info,
             knopf: max ? t('upg.erledigt') : zahl(p) + ' €', aus: max || spiel.geld < p, tun: () => upgradeKaufen(id) };
    return { key: 'u-' + id, icon: UPG_ICON[id], titel: name, info: t('upg.stufe', { s: n }) + ' · ' + (max ? t('upg.max') : info),
             knopf: max ? t('max') : zahl(p) + ' €', aus: max || spiel.geld < p, tun: () => upgradeKaufen(id) };
  });
}

function menueAktualisieren() {
  if (!$('menue').classList.contains('offen')) return;
  const liste = eintraege();
  const aufbau = tab + SPRACHE + liste.map(e => e.key + !!e.knopf + (e.knoepfe ? e.knoepfe.length : '')).join();
  if (aufbau !== gebaut) {
    $('inhalt').innerHTML = liste.map(e => `
      <div class="karte${e.infoKachel ? ' infokarte' : ''}${e.klasse ? ' ' + e.klasse : ''}${e.knoepfe ? ' mehrknopf' : ''}">
        <div class="kinfo"><i class="kicon">${e.icon ? iconSvg(e.icon) : ''}</i>
          <div class="ktext"><b id="t-${e.key}"></b><div class="klein" id="i-${e.key}"></div></div></div>
        ${e.knopf ? `<button data-key="${e.key}" id="b-${e.key}"></button>` : ''}
        ${e.knoepfe ? `<div class="knoepfe">${e.knoepfe.map((_, n) => `<button data-key="${e.key}#${n}" id="b-${e.key}#${n}"></button>`).join('')}</div>` : ''}
      </div>`).join('');
    gebaut = aufbau;
  }
  for (const e of liste) {
    $('t-' + e.key).textContent = e.titel; $('t-' + e.key).title = e.titel;
    $('i-' + e.key).textContent = e.info;
    if (e.knopf) { $('b-' + e.key).textContent = e.knopf; $('b-' + e.key).disabled = !!e.aus; $('b-' + e.key).classList.toggle('gewaehlt', !!e.gewaehlt); }
    if (e.knoepfe) e.knoepfe.forEach((k, n) => { const b = $('b-' + e.key + '#' + n); b.textContent = k.text; b.disabled = !!k.aus; b.classList.toggle('gewaehlt', !!k.gewaehlt); });
  }
}

// Anzeigen oben und Aktions-Knöpfe
function knoepfeAktualisieren() {
  $('geld').textContent = kurz(spiel.geld);
  $('sterneTxt').textContent = kurz(spiel.sterne);
  $('gemsTxt').textContent = kurz(spiel.gems);
  // Vorschau: so viele Sterne gäbe es beim Umzug jetzt
  const jetzt = sterneFuer(spiel.rundeVerdient), schwelle = sternSchwelle(jetzt + 1);
  const anteil = (spiel.rundeVerdient - sternSchwelle(jetzt)) / (schwelle - sternSchwelle(jetzt));
  $('umzugTxt').textContent = jetzt ? t('umzug.jetzt', { n: jetzt }) : t('umzug.erster');
  $('umzugFill').style.width = Math.min(100, anteil * 100) + '%';
  $('umzugNaechster').textContent = t('umzug.naechster', { x: zahl(schwelle) });
  $('umzugBox').classList.toggle('bereit', jetzt > 0);
  const b = imKonzern() ? spiel.konzern.boost : spiel.boost;
  $('boostBox').hidden = !b;
  $('vipBtn').hidden = imKonzern() ? !(limo && limo.phase === 'wartet') : !vip;
  if (imKonzern()) konzernHud();
  if (b) $('boostTxt').textContent = `${t('boost.' + b.art)} · ${Math.ceil(b.rest)} s`;
  $('bauBtn').disabled = spiel.werkbank.fertig;
  $('polBtn').disabled = !spiel.polier || spiel.polier.fertig;
  // Alle Tische belegt → kürzeste Restzeit anzeigen
  const laufend = spiel.packs.slice(0, packTische()).filter(k => k && !k.fertig).map(k => k.rest);
  const voll = freierTisch() < 0;
  $('packBtn').disabled = !spiel.polier || !spiel.polier.fertig || voll;
  $('packLabel').textContent = voll && laufend.length ? t('packt', { s: sek(Math.min(...laufend)) }) : t('btn.verpacken');
  $('verBtn').disabled = !spiel.lager.length;
  $('verLabel').textContent = spiel.lager.length ? t('btn.verkaufen') : t('lagerLeer');
  knoepfeFreischalten();
  reiterAktualisieren();
}

// Bedienung
document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.key) {
    const [key, n] = b.dataset.key.split('#');
    const eintrag = eintraege().find(x => x.key === key);
    if (eintrag && n != null && eintrag.knoepfe) eintrag.knoepfe[+n].tun();
    else if (eintrag && eintrag.tun) eintrag.tun();
  }
  if (b.dataset.tab) tabWaehlen(b.dataset.tab);
  menueAktualisieren();
});
// Beim allerersten Spiel tauchen die Knöpfe nacheinander auf (bleiben danach für immer).
// Der Zähler "verkauft" bleibt beim Umzug, darum gilt nach dem ersten Spiel alles als frei.
const lagerOderSpaeter = () => spiel.lager.length > 0 || spiel.verkauft > 0;
const packOderSpaeter = () => spiel.packs.some(k => k) || lagerOderSpaeter();
const KNOPF_FREI = {
  polBtn:     () => !!spiel.polier || packOderSpaeter(),                       // erste Uhr gebaut
  packBtn:    () => (spiel.polier && spiel.polier.fertig) || packOderSpaeter(), // erste Uhr poliert
  verBtn:     () => lagerOderSpaeter(),                                         // erste Uhr verpackt
  erfolgeBtn: () => spiel.verkauft >= 1,
  menueBtn:   () => spiel.verkauft >= 3
};
function knoepfeFreischalten() {
  for (const id in KNOPF_FREI) {
    if (!spiel.knopfFrei[id] && KNOPF_FREI[id]()) {
      spiel.knopfFrei[id] = true;
      $(id).classList.add('auftauchen');
      setTimeout(() => $(id).classList.remove('auftauchen'), 700);
    }
    $(id).hidden = !spiel.knopfFrei[id];
  }
}

// Reiter werden nach und nach freigeschaltet. Neue Reiter wackeln mit Stern, bis man draufklickt.
// (Manager hängt am Upgrade und verschwindet nach dem Umzug wieder, die anderen bleiben frei.)
const REITER_FREI = {
  uhren: () => Object.values(spiel.upg).some(x => x > 0),
  laden: () => alleMitarbeiter() || spiel.rundeVerdient >= LADEN_TAB_AB,
  ruf:   () => spiel.filiale > 0
};
const reiterSichtbar = name => {
  if (imKonzern()) return name[0] === 'k';
  if (name[0] === 'k') return false;
  return name === 'ausruestung' || (name === 'manager' ? !!spiel.upg.manager : !!spiel.tabFrei[name]);
};
function reiterAktualisieren() {
  for (const k in REITER_FREI) if (!spiel.tabFrei[k] && REITER_FREI[k]()) spiel.tabFrei[k] = true;
  let neu = false;
  for (const b of document.querySelectorAll('#reiter [data-tab]')) {
    const name = b.dataset.tab, sichtbar = reiterSichtbar(name);
    const stern = sichtbar && name !== 'ausruestung' && name[0] !== 'k' && !spiel.tabGesehen[name];
    b.hidden = !sichtbar;
    b.classList.toggle('neu', stern);
    const s = b.querySelector('.tabStern'); if (s) s.hidden = !stern;
    neu = neu || stern;
  }
  // Upgrades-Knopf: Stern, bis man das Menü zum ersten Mal öffnet (oder ein Reiter neu ist)
  if (!spiel.tabGesehen.menue && !spiel.tabFrei.uhren) neu = true;
  $('menueStern').hidden = !neu;
  $('menueBtn').classList.toggle('neu', neu);
  $('umzugBox').hidden = imKonzern() || !reiterSichtbar('laden');
  if (!reiterSichtbar(tab)) tabWaehlen(imKonzern() ? 'kfilialen' : 'ausruestung');
}
function tabWaehlen(name) {
  tab = name;
  if (!spiel.tabGesehen[name] && name !== 'ausruestung' && name[0] !== 'k') { spiel.tabGesehen[name] = true; speichern(); reiterAktualisieren(); }
  for (const t of document.querySelectorAll('[data-tab]')) t.classList.toggle('aktiv', t.dataset.tab === name);
}
// Eigene Klicks zählen (für den Erfolg "Fleißige Hände")
const selbst = f => () => { spiel.klicks++; f(); };
$('bauBtn').addEventListener('click', selbst(bauen));
$('polBtn').addEventListener('click', selbst(polieren));
$('packBtn').addEventListener('click', selbst(verpacken));
$('verBtn').addEventListener('click', selbst(verkaufen));
const fensterZu = () => { for (const id of ['erfolgeFenster', 'einstFenster']) $(id).classList.remove('offen'); };
document.addEventListener('keydown', e => {
  if (e.repeat || document.body.classList.contains('intro')) return;
  if (e.key === '1') selbst(bauen)();
  if (e.key === '2') selbst(polieren)();
  if (e.key === '3') selbst(verpacken)();
  if (e.key === '4') selbst(verkaufen)();
  if (e.key === 'Escape') fensterZu();
});
$('menueBtn').addEventListener('click', () => {
  $('menue').classList.toggle('offen'); gebaut = '';
  if (!spiel.tabGesehen.menue) { spiel.tabGesehen.menue = true; speichern(); reiterAktualisieren(); }
});
$('zuBtn').addEventListener('click', () => $('menue').classList.remove('offen'));
$('vollbildBtn').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch (e) {
    $('vollbildLabel').textContent = t('btn.vollbildNein');
    setTimeout(() => $('vollbildLabel').textContent = t('btn.vollbild'), 2000);
  }
});
// Klick neben ein Fenster schließt es
for (const id of ['erfolgeFenster', 'einstFenster'])
  $(id).addEventListener('click', e => { if (e.target.id === id) $(id).classList.remove('offen'); });

// ===============================================================
// ERFOLGE-FENSTER
// ===============================================================
let erfolgeGebaut = '';
let erfolgTab = 'laden';
function erfolgeAktualisieren() {
  const bereitIn = liste => liste.filter(e => erreicht(e) > gesammelt(e)).length;
  const bereit = bereitIn(alleErfolge());
  $('erfolgeBtn').classList.toggle('neu', bereit > 0);
  $('erfolgeBadge').textContent = bereit;
  $('erfolgReiter').hidden = !imKonzern();
  if (!imKonzern()) erfolgTab = 'laden';
  const ERF = erfolgTab === 'konzern' ? K_ERFOLGE : ERFOLGE, GESAMT = erfolgTab === 'konzern' ? K_ERFOLG_STUFEN : ERFOLG_STUFEN_GESAMT;
  const summeStufen = ERF.reduce((s, e) => s + gesammelt(e), 0);
  $('erfolgeZahl').textContent = summeStufen + '/' + GESAMT;
  if (!$('erfolgeFenster').classList.contains('offen')) return;
  if (imKonzern()) {
    const bl = bereitIn(ERFOLGE), bk = bereitIn(K_ERFOLGE);
    $('ebLaden').textContent = bl; $('ebLaden').hidden = !bl;
    $('ebKonzern').textContent = bk; $('ebKonzern').hidden = !bk;
    for (const b of document.querySelectorAll('[data-etab2]')) b.classList.toggle('aktiv', b.dataset.etab2 === erfolgTab);
  }

  $('erfolgeBonus').textContent = t('erfolge.stand', { a: summeStufen, b: GESAMT });
  if (boniOffen) { boniAktualisieren(); return; }

  // Liste nur neu bauen, wenn sich ein Status ändert (sonst gehen Klicks verloren)
  const aufbau = SPRACHE + erfolgTab + ERF.map(e => gesammelt(e) + ':' + Math.min(erreicht(e), gesammelt(e) + 1)).join();
  if (aufbau !== erfolgeGebaut) {
    $('erfolgeListe').innerHTML = ERF.map(e => {
      const k = gesammelt(e), alle = k >= e.stufen.length, kannSammeln = !alle && erreicht(e) > k;
      const st = alle ? 'fertig' : kannSammeln ? 'bereit' : 'offen';
      const punkte = e.stufen.map((_, i) => `<span class="punkt ${i < k ? 'voll' : i === k && kannSammeln ? 'bereit' : ''}"></span>`).join('');
      const naechste = e.stufen[Math.min(k, e.stufen.length - 1)];
      const aufgabe = alle ? t('eg.' + e.id) : e.text(naechste.ziel);
      // Fertig: zusammengefasst zeigen, was alle Stufen gebracht haben
      const belohnung = alle ? erhaltenHtml(e)
        : `<div class="belohnung"><i>${iconSvg(BELOHNUNG_ICON[naechste.art])}</i>${BELOHNUNG_TEXT[naechste.art](naechste.wert)}</div>`;
      const fuss = kannSammeln ? `<button class="sammeln" data-sammeln="${e.id}">${t('erfolge.sammeln')}</button>`
                 : alle ? '' : `<div class="ebalken"><div id="eb-${e.id}"></div></div><div class="klein" id="et-${e.id}"></div>`;
      return `<div class="erfolg ${st}">
        <i class="kicon">${iconSvg(k > 0 || kannSammeln ? 'erfolg' : 'erfolgGrau')}</i>
        <div class="etext">
          <div class="ekopf"><b>${nm('erfolge', e.id, e.name)}</b><span class="punkte">${punkte}</span></div>
          <div class="klein">${aufgabe}</div>
          ${belohnung}${fuss}
        </div>
      </div>`;
    }).join('');
    erfolgeGebaut = aufbau;
  }
  for (const e of ERF) {
    const k = gesammelt(e);
    if (k >= e.stufen.length || erreicht(e) > k) continue;
    const ziel = e.stufen[k].ziel, jetzt = e.wert();
    $('eb-' + e.id).style.width = Math.min(100, jetzt / ziel * 100) + '%';
    $('et-' + e.id).textContent = `${zahl(Math.min(jetzt, ziel))} / ${zahl(ziel)}`;
  }
}
function erhaltenHtml(e) {
  const summen = {};
  for (const st of e.stufen) summen[st.art] = (summen[st.art] || 0) + st.wert;
  return `<div class="erhalten"><span class="klein">${t('erfolge.erhalten')}</span>` +
    Object.entries(summen).map(([art, w]) => `<div class="belohnung"><i>${iconSvg(BELOHNUNG_ICON[art])}</i>${BELOHNUNG_TEXT[art](w)}</div>`).join('') + '</div>';
}

// Boni-Ansicht: alle aktiven Boni untereinander (Kategorie links, Wert rechts)
let boniOffen = false;
const BONI_ARTEN = ['preis', 'bau', 'polier', 'pack', 'team', 'vip', 'offline'];
function boniAktualisieren() {
  $('boniListe').innerHTML = `<p class="klein boniHinweis">${t('boni.hinweis')}</p>` + BONI_ARTEN.map(a => {
    const w = summe(a);
    const wert = w ? `+${komma(w)} ${a === 'offline' ? 'h' : '%'}` : '–';
    return `<div class="boniZeile ${w ? '' : 'leer'}"><span><i>${iconSvg(BELOHNUNG_ICON[a])}</i>${t('kat.' + a)}</span><b>${wert}</b></div>`;
  }).join('');
}
function boniUmschalten(an = !boniOffen) {
  boniOffen = an;
  $('boniListe').hidden = !an;
  $('erfolgeListe').hidden = an;
  $('boniBtn').classList.toggle('aktiv', an);
  $('boniLabel').textContent = t(an ? 'erfolge.zurueck' : 'erfolge.boni');
  erfolgeGebaut = '';
  erfolgeAktualisieren();
}
$('boniBtn').addEventListener('click', () => boniUmschalten());

$('erfolgeListe').addEventListener('click', e => {
  const b = e.target.closest('[data-sammeln]');
  if (b) { erfolgEinsammeln(b.dataset.sammeln); erfolgeAktualisieren(); }
});
$('erfolgeBtn').addEventListener('click', () => { $('erfolgeFenster').classList.add('offen'); boniUmschalten(false); });
$('erfolgReiter').addEventListener('click', e => {
  const b = e.target.closest('[data-etab2]');
  if (b) { erfolgTab = b.dataset.etab2; erfolgeGebaut = ''; erfolgeAktualisieren(); }
});
$('erfolgeZu').addEventListener('click', () => $('erfolgeFenster').classList.remove('offen'));

// ===============================================================
// MELDUNGEN – kurze Einblendung oben, mehrere nacheinander
// ===============================================================
const meldungen = [];
let meldungLaeuft = false;
function meldung(text, ms = 3200) {
  meldungen.push([text, ms]);
  if (!meldungLaeuft) naechsteMeldung();
}
// Meldung sitzt immer direkt über den Aktions-Knöpfen – auch wenn die beim offenen Upgrade-Menü hochrutschen
function meldungAusrichten() {
  // oben unter der Geld-/Umzugs-Anzeige, waagerecht mittig über den Knöpfen (rutscht mit, wenn das Menü rechts offen ist)
  const m = $('meldung'), u = $('unten').getBoundingClientRect();
  const o = $('oben').querySelector('.links').getBoundingClientRect();
  m.style.top = Math.round(o.bottom + 8) + 'px';
  m.style.left = Math.round(u.left + u.width / 2) + 'px';
  if (m.classList.contains('sichtbar') || meldungLaeuft) requestAnimationFrame(meldungAusrichten);
}
function naechsteMeldung() {
  const m = $('meldung');
  requestAnimationFrame(meldungAusrichten);
  if (!meldungen.length) { meldungLaeuft = false; m.classList.remove('sichtbar'); return; }
  meldungLaeuft = true;
  const [text, ms] = meldungen.shift();
  m.innerHTML = `<i>${iconSvg('erfolg')}</i><span></span>`;
  m.querySelector('span').textContent = text;
  m.classList.add('sichtbar');
  setTimeout(() => { m.classList.remove('sichtbar'); setTimeout(naechsteMeldung, 350); }, ms);
}

// Umzug in neue Filiale: zweimal klicken zur Sicherheit
let konzernGeklickt = false;
function konzernKlick() {
  if (!konzernGeklickt) { konzernGeklickt = true; setTimeout(() => konzernGeklickt = false, 3000); return; }
  konzernGeklickt = false;
  konzernStarten();
}
let prestigeGeklickt = false;
function prestigeKlick() {
  if (!prestigeGeklickt) { prestigeGeklickt = true; setTimeout(() => prestigeGeklickt = false, 3000); return; }
  prestigeGeklickt = false;
  neueFiliale();
  gebaut = '';
}

$('vipBtn').addEventListener('click', () => imKonzern() ? limoKlick() : vipKlick());
// VIP anklicken: Klick auf die Szene prüfen
cv.addEventListener('pointerdown', e => {
  if (!vip) return;
  const r = cv.getBoundingClientRect();
  const x = (e.clientX - r.left) / U - lox, y = (e.clientY - r.top) / U - loy;
  const p = vipPos();
  if (x > p.x - 4 && x < p.x + 12 && y > p.y - 8 && y < p.y + 14) vipKlick();
});

// ===============================================================
// EINSTELLUNGEN – Reiter Profil, Statistik, Allgemein
// ===============================================================
let einstTab = 'profil';
function einstTabWaehlen(name) {
  einstTab = name;
  for (const b of document.querySelectorAll('[data-etab]')) b.classList.toggle('aktiv', b.dataset.etab === name);
  for (const id of ['profil', 'statistik', 'allgemein']) $('epanel-' + id).hidden = id !== name;
  if (name === 'profil') profilAufbauen();
  if (name === 'statistik') statistikAktualisieren();
  if (name === 'allgemein') allgemeinAktualisieren();
}
$('einstBtn').addEventListener('click', () => { $('einstFenster').classList.add('offen'); einstTabWaehlen(einstTab); });
$('einstZu').addEventListener('click', () => $('einstFenster').classList.remove('offen'));
document.querySelector('.einstReiter').addEventListener('click', e => {
  const b = e.target.closest('[data-etab]');
  if (b) einstTabWaehlen(b.dataset.etab);
});

// ---------- Profil ----------
const HAARFARBEN = ['#4a2a1a', '#2a1a10', '#8a5a3a', '#e0b050', '#b0482e', '#8a8a8a', '#f0f0f0', '#6a3a8a', '#3a6ad8', '#d8485a'];
const HAUTTOENE  = ['#f6c79a', '#e8b088', '#c68a5a', '#9a6440', '#6a4228'];
const SHIRTFARBEN = ['#8e3a52', '#3a7bd5', '#4caf6a', '#f09a4a', '#9a7ae0', '#2a2a3a', '#f3f0e6', '#d0567a', '#e8c040', '#3aa8a0'];

// Charakter als SVG (für Vorschau und Auswahl-Knöpfe)
function charakterSvg(p) {
  let bild = figurBild(p.frisur).slice();
  const pal = figurFarben(p.haar, p.shirt, p.haut);
  const ex = EXTRAS[p.extra];
  if (ex && ex.bild) {
    const dy = ex.dy || 0, breite = bild[0].length;
    if (dy) bild = Array(dy).fill('.'.repeat(breite)).concat(bild);   // Platz für den Zylinder
    const zif = {}; Object.keys(ex.pal).forEach((k, i) => { zif[k] = String(i + 1); pal[zif[k]] = ex.pal[k]; });   // eigene Zeichen, keine Kollision
    ex.bild.forEach((zeile, j) => {
      if (!zeile) return;
      bild[j] = bild[j].split('').map((ch, i) => zeile[i] && zeile[i] !== '.' ? zif[zeile[i]] : ch).join('');
    });
  }
  return spriteSvg({ bild: scale2x(bild), pal, hd: true });
}
function profilAufbauen() {
  const p = spiel.profil;
  $('profilVorschau').innerHTML = charakterSvg(p);
  if (document.activeElement !== $('ladenNameInput')) $('ladenNameInput').value = p.name;
  const farbe = (ziel, liste, feld) => {
    $(ziel).innerHTML = liste.map(c => `<button class="farbe ${p[feld] === c ? 'aktiv' : ''}" data-feld="${feld}" data-wert="${c}" style="background:${c}" aria-label="${c}"></button>`).join('');
  };
  const vorlage = (ziel, liste, feld, kat) => {
    $(ziel).innerHTML = Object.entries(liste).map(([id, v]) =>
      `<button class="vorlage ${p[feld] === id ? 'aktiv' : ''}" data-feld="${feld}" data-wert="${id}">${charakterSvg(Object.assign({}, p, { [feld]: id }))}<span>${nm(kat, id, v.name)}</span></button>`).join('');
  };
  vorlage('wahlFrisur', FRISUREN, 'frisur', 'frisur');
  farbe('wahlHaar', HAARFARBEN, 'haar');
  farbe('wahlHaut', HAUTTOENE, 'haut');
  farbe('wahlShirt', SHIRTFARBEN, 'shirt');
  vorlage('wahlExtra', EXTRAS, 'extra', 'extra');
  $('profilIcon').innerHTML = charakterSvg(p);
}
$('epanel-profil').addEventListener('click', e => {
  const b = e.target.closest('[data-feld]');
  if (b) { spiel.profil[b.dataset.feld] = b.dataset.wert; profilAufbauen(); speichern(); }
});
$('ladenNameInput').addEventListener('input', e => { spiel.profil.name = e.target.value.slice(0, 20); });
$('ladenNameInput').addEventListener('change', speichern);
$('ladenNameInput').addEventListener('keydown', e => e.stopPropagation());   // Tasten 1–4 nicht als Spiel-Tasten

// ---------- Statistik ----------
// Einkommen der letzten Minute: alle Sekunde den Stand merken
const verlauf = [];
setInterval(() => { verlauf.push(spiel.verdient); if (verlauf.length > 61) verlauf.shift(); }, 1000);
const zeitText = s => { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? `${h} h ${m} min` : `${m} min ${s % 60} s`; };

function statistikAktualisieren() {
  if (!$('einstFenster').classList.contains('offen') || einstTab !== 'statistik') return;
  const proMin = verlauf.length > 1 ? (verlauf[verlauf.length - 1] - verlauf[0]) * 60 / (verlauf.length - 1) : 0;
  const stufen = ERFOLGE.reduce((s, e) => s + gesammelt(e), 0);
  const bloecke = [
    ['stat.geld', [
      ['stat.verdientGesamt', zahl(spiel.verdient) + ' €'], ['stat.verdientFiliale', zahl(spiel.rundeVerdient) + ' €'],
      ['stat.proMin', zahl(proMin) + ' €'], ['stat.besterVerkauf', zahl(spiel.besterVerkauf) + ' €'],
      ['stat.preisBonus', '×' + komma(preisFaktor())]]],
    ['stat.laden', [
      ['stat.verkauft', zahl(spiel.verkauft)],
      ...MODELLE.filter(m => spiel.proModell[m.id]).map(m => [t('stat.proModell', { n: nm('modelle', m.id, m.name) }), zahl(spiel.proModell[m.id]), true]),
      ['stat.klicks', zahl(spiel.klicks)], ['stat.schnell', zahl(spiel.schnellBedient)], ['stat.vips', zahl(spiel.vips)]]],
    ['stat.prestige', [
      ['stat.aktFiliale', filialName()], ['stat.filialen', zahl(spiel.filiale)],
      ['stat.sterne', `${zahl(spiel.sterne)} / ${zahl(spiel.gesamtSterne)}`],
      ['stat.erfolge', `${stufen} / ${ERFOLG_STUFEN_GESAMT}`], ['stat.gems', zahl(spiel.gems)]]],
    ['stat.zeit', [['stat.spielzeit', zeitText(spiel.spielzeit)], ['stat.rundeZeit', zeitText(spiel.rundeZeit)]]]
  ];
  $('statistikListe').innerHTML = bloecke.map(([titel, zeilen]) => `
    <div class="statBlock"><h3>${t(titel)}</h3>
      ${zeilen.map(([k, w, roh]) => `<div class="statZeile"><span>${roh ? k : t(k)}</span><b>${w}</b></div>`).join('')}
    </div>`).join('');
}
setInterval(statistikAktualisieren, 1000);

// ---------- Allgemein: Sprache & Spielstand ----------
function allgemeinAktualisieren() {
  for (const b of document.querySelectorAll('[data-sprache]')) b.classList.toggle('aktiv', b.dataset.sprache === SPRACHE);
  $('resetBtn').textContent = resetGeklickt ? t('allg.wirklich') : t('allg.loeschen');
}
document.querySelector('.allgemein').addEventListener('click', e => {
  const b = e.target.closest('[data-sprache]');
  if (b) { spracheSetzen(b.dataset.sprache); speichern(); }
});
$('resetBtn').addEventListener('click', () => {
  if (!resetGeklickt) { resetGeklickt = true; allgemeinAktualisieren(); setTimeout(() => { resetGeklickt = false; allgemeinAktualisieren(); }, 3000); return; }
  resetGeklickt = false;
  try { localStorage.removeItem(SPEICHER); } catch (e) {}
  const sprache = spiel.sprache;
  spiel = neuesSpiel();
  spiel.sprache = sprache;
  fensterZu();
  introStarten();   // frischer Spielstand = Intro wie beim ersten Start
});

// Sprache wechseln: alle festen Texte (data-t …) neu setzen, Listen neu bauen
function spracheSetzen(s) {
  SPRACHE = TEXTE[s] ? s : 'de';
  spiel.sprache = SPRACHE;
  document.documentElement.lang = SPRACHE;
  for (const el of document.querySelectorAll('[data-t]')) el.textContent = t(el.dataset.t);
  for (const el of document.querySelectorAll('[data-t-ph]')) el.placeholder = t(el.dataset.tPh);
  for (const el of document.querySelectorAll('[data-t-title]')) el.title = t(el.dataset.tTitle);
  for (const el of document.querySelectorAll('[data-t-aria]')) el.setAttribute('aria-label', t(el.dataset.tAria));
  gebaut = ''; erfolgeGebaut = '';
  if ($('einstFenster').classList.contains('offen')) einstTabWaehlen(einstTab);
}
profilAufbauen();
