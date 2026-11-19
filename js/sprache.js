// ===============================================================
// SPRACHEN – alle Texte des Spiels auf Deutsch und Englisch
//    t('schluessel', { platzhalter }) liefert den Text in der
//    aktuellen Sprache. {x} im Text wird ersetzt.
//    Neue Sprache = neuen Block wie "en" anlegen.
// ===============================================================
let SPRACHE = 'de';
const LOCALE = () => (SPRACHE === 'en' ? 'en-US' : 'de-DE');

const TEXTE = {
  de: {
    // Knöpfe & Reiter
    'btn.bauen': 'Bauen', 'btn.polieren': 'Polieren', 'btn.verpacken': 'Verpacken', 'btn.verkaufen': 'Verkaufen',
    'btn.upgrades': 'Upgrades', 'btn.vip': 'VIP bedienen', 'btn.vollbild': 'Vollbild', 'allg.anzeige': 'Anzeige', 'btn.vollbildNein': 'Geht hier nicht',
    'packt': 'Packt {s} s', 'lagerLeer': 'Lager leer',
    'tab.uhren': 'Uhren', 'tab.ausruestung': 'Ausrüstung', 'tab.laden': 'Laden', 'tab.manager': 'Manager', 'tab.ruf': 'Ruf',
    'aria.schliessen': 'Schließen', 'aria.einstellungen': 'Einstellungen', 'aria.erfolge': 'Erfolge',
    // Anzeige oben
    'umzug.jetzt': 'Umzug jetzt: +{n} ★', 'umzug.erster': 'Erster Ruf-Stern', 'umzug.naechster': 'nächster ★ bei {x} €',
    'umzug.title': 'Ruf-Sterne beim Umzug in eine neue Filiale (Reiter Laden)',
    'hud.sterne': 'Ruf-Sterne', 'hud.gems': 'Gems',
    // Erfolge
    'erfolge.titel': 'Erfolge', 'erfolge.stand': '{a} von {b} Stufen', 'erfolge.aktiv': 'Aktiv: ',
    'erfolge.erhalten': 'Erhalten:', 'erfolge.boni': 'Boni', 'erfolge.zurueck': 'Zurück',
    'boni.hinweis': 'Alle Quellen zusammen: Erfolge, Ruf-Sterne, Ruf-Shop und Raritäten',
    'kat.preis': 'Verkaufspreis', 'kat.bau': 'Baufortschritt', 'kat.polier': 'Polierfortschritt', 'kat.pack': 'Verpack-Tempo',
    'kat.team': 'Mitarbeiter-Tempo', 'kat.vip': 'VIP-Häufigkeit', 'kat.offline': 'Offline-Zeit',
    'erfolge.alle': 'Alle Stufen geschafft', 'erfolge.stufe': 'Stufe {a} von {b}', 'erfolge.sammeln': 'Einsammeln',
    // Einstellungen
    'einst.titel': 'Einstellungen', 'einst.unter': 'Profil, Statistik und Sprache',
    'einst.profil': 'Profil', 'einst.statistik': 'Statistik', 'einst.allgemein': 'Allgemein',
    'intro.tippen': 'Tippen zum Starten',
    'intro.text1': 'Hey, da bist du ja! Ich bin Lisa. Der alte Uhrmacher Hawk hat sich nach 40 Jahren endlich zur Ruhe gesetzt und dir seinen Laden vermacht. Na ja, „Laden“ … ist eher ein Hinterhof mit Werkbank. Aber hey: Jeder fängt mal klein an!',
    'intro.text2': 'Keine Panik, viel falsch machen kannst du hier nicht. Fang einfach an und bau deine erste Uhr. Und wer weiß: Wenn es gut läuft, bleibt das hier nicht dein einziger Laden. Spätestens dann sehen wir uns wieder!',
    'profil.name': 'Name deines Ladens', 'profil.platzhalter': 'Mein Juwelier', 'profil.frisur': 'Frisur',
    'profil.haar': 'Haarfarbe', 'profil.haut': 'Hautton', 'profil.shirt': 'Shirt', 'profil.extra': 'Extra',
    'profil.hinweis': 'Besondere Cosmetics gibt es später für Gems.', 'profil.vorschau': 'Vorschau',
    'allg.sprache': 'Sprache', 'allg.reset': 'Spielstand löschen', 'allg.resetInfo': 'Fängt komplett von vorne an',
    'allg.loeschen': 'Löschen', 'allg.wirklich': 'Wirklich?',
    // Statistik
    'stat.geld': 'Geld', 'stat.laden': 'Laden', 'stat.prestige': 'Prestige', 'stat.zeit': 'Zeit',
    'stat.verdientGesamt': 'Insgesamt verdient', 'stat.verdientFiliale': 'In dieser Filiale verdient',
    'stat.proMin': 'Einkommen (letzte Minute)', 'stat.besterVerkauf': 'Teuerster Verkauf', 'stat.preisBonus': 'Preis-Bonus gesamt',
    'stat.verkauft': 'Verkaufte Uhren', 'stat.proModell': '{n} verkauft', 'stat.klicks': 'Eigene Klicks',
    'stat.schnell': 'Blitzbedienungen', 'stat.vips': 'VIP-Kunden bedient',
    'stat.aktFiliale': 'Aktuelle Filiale', 'stat.filialen': 'Filialen eröffnet', 'stat.sterne': 'Ruf-Sterne (verfügbar / gesamt)',
    'stat.raritaeten': 'Raritäten', 'stat.erfolge': 'Erfolgsstufen', 'stat.gems': 'Gems',
    'stat.spielzeit': 'Spielzeit gesamt', 'stat.rundeZeit': 'Zeit in dieser Filiale',
    // Reiter Uhren
    'uhr.info': 'Bauen {b} · Polieren {p} · {x} €', 'uhr.neu': 'Neu · {n}', 'uhr.vitrine': 'Vitrine {x} €',
    'uhr.keineVitrine': 'Keine Vitrine frei', 'uhr.wirdGebaut': 'Wird gebaut', 'uhr.bauen': 'Bauen',
    // Reiter Laden
    'laden.filialeInfo': 'Filiale {n} · hier verdient: {x} €', 'laden.neu': 'Neue Filiale',
    'laden.neuInfo': '+{n} ★, Geld & Upgrades starten neu. Nächste: {f}',
    'laden.neuFrueh': 'Erster Stern ab {x} € hier verdient. Nächste: {f}',
    'laden.zuFrueh': 'Noch zu früh', 'laden.wirklich': 'Wirklich umziehen?', 'laden.umziehen': 'Umziehen (+{n} ★)',
    'laden.naechsterStern': 'Nächster Stern', 'laden.naechsterSternKurz': 'nächster ★ ab {x} €', 'laden.vollKurz': 'mehr Platz in der nächsten Filiale', 'laden.fertig': 'voll ausgebaut', 'laden.naechsterSternInfo': 'ab {x} € hier verdient',
    'laden.ausbau': 'Ladenausbau', 'laden.belegt': '{n} · Vitrinen: {a} / {b}', 'laden.naechsterAusbau': 'Nächster Ausbau',
    'laden.vitrinen': '{n} · {v} Vitrinen', 'laden.voll': 'Kein Platz mehr',
    'laden.vollInfo': 'Max. {v} Vitrinen und {l} Lagerplätze. Mehr in der nächsten Filiale.',
    // Reiter Ruf
    'ruf.sterne': '{n} Ruf-Sterne', 'ruf.verdient': '{g} Ruf-Sterne verdient', 'ruf.bonus': 'Bonus: +{p} % Verkaufspreis',
    'ruf.info': '{g} ★ verdient = +{p} % Verkaufspreis. Neue Sterne gibt\'s beim Umzug.',
    'ruf.gekauft': 'Gekauft', 'max': 'Max', 'ruf.auktion': 'Raritäten-Auktion',
    'ruf.auktionInfo': 'Zufällige seltene Uhr mit Dauerbonus.', 'ruf.komplettInfo': 'Sammlung komplett!',
    'ruf.bieten': 'Bieten: {n} ★', 'ruf.komplett': 'Komplett', 'ruf.unbekannt': 'Noch nicht in deiner Sammlung',
    'rt.kapital': 'Jede Filiale startet mit {x} €', 'rt.kontakte': 'Store Manager ist sofort freigeschaltet',
    'rt.stamm': 'Alle vier Mitarbeiter starten auf Stufe 1', 'rt.haende': '+{w} % Bau- und Polierfortschritt',
    // Reiter Manager
    'man.gesperrt': 'Noch gesperrt', 'man.gesperrtInfo': 'Schalte unter Ausrüstung den Store Manager frei.',
    'man.klicks': '{a} Klicks/s', 'man.alle': 'alle {a} s', 'man.stufe': '{n} · Stufe {s}',
    'man.upgrade': 'Upgrade {x} €', 'man.einstellen': 'Einstellen {x} €',
    // Reiter Ausrüstung
    'upg.werkzeug': 'Bauen: {a} → {b} pro Klick', 'upg.tuch': 'Polieren: {a} → {b} pro Klick',
    'upg.pack': 'Verpacken: {a} → {b} s', 'upg.regal': 'Lager: {a} → {b} Plätze',
    'upg.tisch2': 'Verpackt zwei Uhren gleichzeitig', 'upg.tisch2Frei': 'Zwei Packtische im Einsatz', 'upg.tisch2Zu': 'Ab „{n}“ verfügbar',
    'upg.manager': 'Schaltet den Manager frei: Mitarbeiter einstellen', 'upg.managerFrei': 'Freigeschaltet – siehe Manager',
    'upg.erledigt': 'Erledigt', 'upg.stufe': 'Stufe {s}', 'upg.max': 'Maximum erreicht',
    // Belohnungen
    'bel.preis': '+{w} % Verkaufspreis', 'bel.bau': '+{w} % Baufortschritt', 'bel.polier': '+{w} % Polierfortschritt',
    'bel.pack': 'Verpacken {w} % schneller', 'bel.team': 'Mitarbeiter {w} % schneller', 'bel.geld': '{x} € sofort',
    'bel.vip': 'VIPs {w} % häufiger', 'bel.offline': '+{w} h Offline-Zeit',
    // Erfolgs-Aufgaben
    'et.verkauft': v => v.z === 1 ? 'Verkaufe 1 Uhr' : `Verkaufe ${v.x} Uhren`,
    'et.umsatz': 'Verdiene insgesamt {x} €', 'et.klicks': 'Klicke {x} Mal selbst',
    'et.schnell': 'Bediene {x} Kunden in höchstens 1 Sekunde', 'et.chef': 'Schalte den Manager frei',
    'et.team': v => v.z === 1 ? 'Stelle einen Mitarbeiter ein' : `Stelle ${v.x} Mitarbeiter ein`,
    'et.meister': 'Bringe einen Mitarbeiter auf Stufe {x}', 'et.laden': 'Baue den Laden auf Stufe {x} aus',
    'et.regal': 'Erweitere das Lager auf {x} Plätze', 'et.sammler': 'Schalte {x} Uhrenmodelle frei',
    'et.vip': 'Bediene {x} VIP-Kunden',
    'et.filiale': v => v.z === 1 ? 'Eröffne eine neue Filiale' : `Eröffne ${v.x} neue Filialen`,
    // Aufgabe ohne Zahlen – steht da, wenn der Erfolg komplett ist
    'eg.verkauft': 'Verkaufe Uhren', 'eg.umsatz': 'Verdiene Geld', 'eg.klicks': 'Klicke selbst',
    'eg.schnell': 'Bediene Kunden in höchstens 1 Sekunde', 'eg.chef': 'Schalte den Manager frei', 'eg.team': 'Stelle Mitarbeiter ein',
    'eg.meister': 'Bringe Mitarbeiter auf hohe Stufen', 'eg.laden': 'Baue den Laden aus', 'eg.regal': 'Erweitere das Lager',
    'eg.sammler': 'Schalte Uhrenmodelle frei', 'eg.vip': 'Bediene VIP-Kunden', 'eg.filiale': 'Eröffne neue Filialen',
    // Meldungen
    'm.erfolg': 'Erfolg erreicht: {n}', 'm.erfolgStufe': ' (Stufe {s})', 'm.eingesammelt': 'Eingesammelt: {b}',
    'm.vipDa': 'Ein VIP-Kunde ist da – klick ihn an!', 'm.vipTip': 'VIP-Trinkgeld: +{x} €',
    'm.vipPreis': 'VIP-Ansturm: 20 s lang ×5 Verkaufspreis!', 'm.vipTurbo': 'Motivationsschub: 20 s lang alles doppelt so schnell!',
    'boost.preis': 'Preis ×5', 'boost.turbo': 'Turbo ×2',
    'm.filiale': 'Willkommen im neuen Laden: {n}! +{s} Ruf-Sterne', 'm.ersteigert': 'Ersteigert: {n}!',
    'm.zurueck': 'Willkommen zurück! In {d}: {u} Uhren, +{x} €',
    // Grafik
    'g.werkstatt': 'WERKSTATT', 'g.polieren': 'POLIEREN', 'g.verkauf': 'VERKAUF', 'g.lager': 'LAGER', 'filiale.nr': '{n} Nr. {i}'
  },

  en: {
    'btn.bauen': 'Build', 'btn.polieren': 'Polish', 'btn.verpacken': 'Pack', 'btn.verkaufen': 'Sell',
    'btn.upgrades': 'Upgrades', 'btn.vip': 'Serve VIP', 'btn.vollbild': 'Fullscreen', 'allg.anzeige': 'Display', 'btn.vollbildNein': 'Not available',
    'packt': 'Packing {s}s', 'lagerLeer': 'Out of stock',
    'tab.uhren': 'Watches', 'tab.ausruestung': 'Equipment', 'tab.laden': 'Shop', 'tab.manager': 'Manager', 'tab.ruf': 'Reputation',
    'aria.schliessen': 'Close', 'aria.einstellungen': 'Settings', 'aria.erfolge': 'Achievements',
    'umzug.jetzt': 'Move now: +{n} ★', 'umzug.erster': 'First reputation star', 'umzug.naechster': 'next ★ at {x} €',
    'umzug.title': 'Reputation stars for moving to a new branch (Shop tab)',
    'hud.sterne': 'Reputation stars', 'hud.gems': 'Gems',
    'erfolge.titel': 'Achievements', 'erfolge.stand': '{a} of {b} tiers', 'erfolge.aktiv': 'Active: ',
    'erfolge.erhalten': 'Earned:', 'erfolge.boni': 'Bonuses', 'erfolge.zurueck': 'Back',
    'boni.hinweis': 'All sources combined: achievements, reputation stars, reputation shop and rarities',
    'kat.preis': 'Sale price', 'kat.bau': 'Building progress', 'kat.polier': 'Polishing progress', 'kat.pack': 'Packing speed',
    'kat.team': 'Staff speed', 'kat.vip': 'VIP frequency', 'kat.offline': 'Offline time',
    'erfolge.alle': 'All tiers completed', 'erfolge.stufe': 'Tier {a} of {b}', 'erfolge.sammeln': 'Collect',
    'einst.titel': 'Settings', 'einst.unter': 'Profile, statistics and language',
    'einst.profil': 'Profile', 'einst.statistik': 'Statistics', 'einst.allgemein': 'General',
    'intro.tippen': 'Tap to start',
    'intro.text1': "Hey, there you are! I'm Lisa. Old watchmaker Hawk finally retired after 40 years and left you his shop. Well, \"shop\" … it's more of a backyard with a workbench. But hey: everyone starts small!",
    'intro.text2': "Don't worry, you can't really mess things up here. Just get started and build your first watch. And who knows: if things go well, this won't be your only shop. We'll meet again then for sure!",
    'profil.name': 'Your shop name', 'profil.platzhalter': 'My Jewellery', 'profil.frisur': 'Hairstyle',
    'profil.haar': 'Hair colour', 'profil.haut': 'Skin tone', 'profil.shirt': 'Shirt', 'profil.extra': 'Extra',
    'profil.hinweis': 'Special cosmetics will be available for gems later.', 'profil.vorschau': 'Preview',
    'allg.sprache': 'Language', 'allg.reset': 'Delete save', 'allg.resetInfo': 'Starts over completely',
    'allg.loeschen': 'Delete', 'allg.wirklich': 'Are you sure?',
    'stat.geld': 'Money', 'stat.laden': 'Shop', 'stat.prestige': 'Prestige', 'stat.zeit': 'Time',
    'stat.verdientGesamt': 'Total earned', 'stat.verdientFiliale': 'Earned in this branch',
    'stat.proMin': 'Income (last minute)', 'stat.besterVerkauf': 'Most expensive sale', 'stat.preisBonus': 'Total price bonus',
    'stat.verkauft': 'Watches sold', 'stat.proModell': '{n} sold', 'stat.klicks': 'Own clicks',
    'stat.schnell': 'Lightning services', 'stat.vips': 'VIP customers served',
    'stat.aktFiliale': 'Current branch', 'stat.filialen': 'Branches opened', 'stat.sterne': 'Reputation stars (available / total)',
    'stat.raritaeten': 'Rarities', 'stat.erfolge': 'Achievement tiers', 'stat.gems': 'Gems',
    'stat.spielzeit': 'Total play time', 'stat.rundeZeit': 'Time in this branch',
    'uhr.info': 'Build {b} · Polish {p} · {x} €', 'uhr.neu': 'New · {n}', 'uhr.vitrine': 'Display case {x} €',
    'uhr.keineVitrine': 'No free display case', 'uhr.wirdGebaut': 'In production', 'uhr.bauen': 'Build',
    'laden.filialeInfo': 'Branch {n} · earned here: {x} €', 'laden.neu': 'New branch',
    'laden.neuInfo': '+{n} ★, money & upgrades reset. Next: {f}',
    'laden.neuFrueh': 'First star at {x} € earned here. Next: {f}',
    'laden.zuFrueh': 'Too early', 'laden.wirklich': 'Really move?', 'laden.umziehen': 'Move (+{n} ★)',
    'laden.naechsterStern': 'Next star', 'laden.naechsterSternKurz': 'next ★ at {x} €', 'laden.vollKurz': 'more space in the next branch', 'laden.fertig': 'fully expanded', 'laden.naechsterSternInfo': 'at {x} € earned here',
    'laden.ausbau': 'Shop expansion', 'laden.belegt': '{n} · Display cases: {a} / {b}', 'laden.naechsterAusbau': 'Next expansion',
    'laden.vitrinen': '{n} · {v} display cases', 'laden.voll': 'No more space',
    'laden.vollInfo': 'Max. {v} display cases and {l} storage slots. More in the next branch.',
    'ruf.sterne': '{n} reputation stars', 'ruf.verdient': '{g} reputation stars earned', 'ruf.bonus': 'Bonus: +{p} % sale price',
    'ruf.info': '{g} ★ earned = +{p} % sale price. New stars come from moving.',
    'ruf.gekauft': 'Bought', 'max': 'Max', 'ruf.auktion': 'Rarity auction',
    'ruf.auktionInfo': 'Random rare watch with a permanent bonus.', 'ruf.komplettInfo': 'Collection complete!',
    'ruf.bieten': 'Bid: {n} ★', 'ruf.komplett': 'Complete', 'ruf.unbekannt': 'Not in your collection yet',
    'rt.kapital': 'Every branch starts with {x} €', 'rt.kontakte': 'Store Manager is unlocked right away',
    'rt.stamm': 'All four staff start at level 1', 'rt.haende': '+{w} % building and polishing progress',
    'man.gesperrt': 'Still locked', 'man.gesperrtInfo': 'Unlock the Store Manager under Equipment.',
    'man.klicks': '{a} clicks/s', 'man.alle': 'every {a} s', 'man.stufe': '{n} · Level {s}',
    'man.upgrade': 'Upgrade {x} €', 'man.einstellen': 'Hire {x} €',
    'upg.werkzeug': 'Build: {a} → {b} per click', 'upg.tuch': 'Polish: {a} → {b} per click',
    'upg.pack': 'Packing: {a} → {b} s', 'upg.regal': 'Storage: {a} → {b} slots',
    'upg.tisch2': 'Packs two watches at once', 'upg.tisch2Frei': 'Two packing tables in use', 'upg.tisch2Zu': 'Available from "{n}"',
    'upg.manager': 'Unlocks the Manager: hire staff', 'upg.managerFrei': 'Unlocked – see Manager',
    'upg.erledigt': 'Done', 'upg.stufe': 'Level {s}', 'upg.max': 'Maximum reached',
    'bel.preis': '+{w} % sale price', 'bel.bau': '+{w} % building progress', 'bel.polier': '+{w} % polishing progress',
    'bel.pack': 'Packing {w} % faster', 'bel.team': 'Staff {w} % faster', 'bel.geld': '{x} € instantly',
    'bel.vip': 'VIPs {w} % more often', 'bel.offline': '+{w} h offline time',
    'et.verkauft': v => v.z === 1 ? 'Sell 1 watch' : `Sell ${v.x} watches`,
    'et.umsatz': 'Earn {x} € in total', 'et.klicks': 'Click {x} times yourself',
    'et.schnell': v => v.z === 1 ? 'Serve a customer within 1 second' : `Serve ${v.x} customers within 1 second`,
    'et.chef': 'Unlock the Manager',
    'et.team': v => v.z === 1 ? 'Hire a staff member' : `Hire ${v.x} staff members`,
    'et.meister': 'Get a staff member to level {x}', 'et.laden': 'Expand the shop to level {x}',
    'et.regal': 'Expand storage to {x} slots', 'et.sammler': 'Unlock {x} watch models',
    'et.vip': v => v.z === 1 ? 'Serve a VIP customer' : `Serve ${v.x} VIP customers`,
    'et.filiale': v => v.z === 1 ? 'Open a new branch' : `Open ${v.x} new branches`,
    'eg.verkauft': 'Sell watches', 'eg.umsatz': 'Earn money', 'eg.klicks': 'Click yourself',
    'eg.schnell': 'Serve customers within 1 second', 'eg.chef': 'Unlock the Manager', 'eg.team': 'Hire staff',
    'eg.meister': 'Get staff to high levels', 'eg.laden': 'Expand the shop', 'eg.regal': 'Expand storage',
    'eg.sammler': 'Unlock watch models', 'eg.vip': 'Serve VIP customers', 'eg.filiale': 'Open new branches',
    'm.erfolg': 'Achievement unlocked: {n}', 'm.erfolgStufe': ' (tier {s})', 'm.eingesammelt': 'Collected: {b}',
    'm.vipDa': 'A VIP customer is here – click them!', 'm.vipTip': 'VIP tip: +{x} €',
    'm.vipPreis': 'VIP rush: ×5 sale price for 20 s!', 'm.vipTurbo': 'Motivation boost: everything twice as fast for 20 s!',
    'boost.preis': 'Price ×5', 'boost.turbo': 'Turbo ×2',
    'm.filiale': 'Welcome to your new shop: {n}! +{s} reputation stars', 'm.ersteigert': 'Won at auction: {n}!',
    'm.zurueck': 'Welcome back! In {d}: {u} watches, +{x} €',
    'g.werkstatt': 'WORKSHOP', 'g.polieren': 'POLISHING', 'g.verkauf': 'SALES', 'g.lager': 'STORAGE', 'filiale.nr': '{n} No. {i}'
  }
};

// Englische Namen für alles, was in daten.js deutsch benannt ist
const NAMEN_EN = {
  modelle: { quarz: 'Quartz Watch', taucher: 'Diver Watch', chrono: 'Chronograph', gold: 'Golden Watch', diamant: 'Diamond Watch' },
  upgrades: { werkzeug: 'Better Tools', tuch: 'Better Polishing Cloth', pack: 'Faster Packing', regal: 'Bigger Storage Shelf', manager: 'Store Manager', tisch2: 'Second Packing Table' },
  mitarbeiter: { bau: 'Watchmaker', polier: 'Polisher', pack: 'Packer', verkauf: 'Saleswoman' },
  erfolge: { verkauft: 'Watch Seller', umsatz: 'Revenue', klicks: 'Busy Hands', schnell: 'Lightning Service', chef: 'Boss Move',
             team: 'The Team', meister: 'Master of the Craft', laden: 'Shop Expansion', regal: 'Full Shelves',
             sammler: 'Collector', vip: 'VIP Care', filiale: 'Expansion' },
  ruf: { kapital: 'Starting Capital', kontakte: 'Good Connections', stamm: 'Core Staff', haende: 'Experienced Hands',
         ruf: 'Good Reputation', packen: 'Packing Pro', motiv: 'Motivated Staff', vipmag: 'VIP Magnet', nacht: 'Night Shift' },
  raritaeten: { r1890: 'Pocket Watch from 1890', savon: 'Golden Hunter Watch', marine: 'Marine Chronometer',
                kuckuck: 'Black Forest Cuckoo Clock', sonne: 'Brass Sundial', sand: "Watchmaker's Hourglass",
                sprung: 'Spring-Lid Watch', skelett: 'Skeleton Watch', diamant: 'Diamond Pocket Watch', astro: 'Astronomical Clock' },
  filialen: ['Backyard Shop', 'Pedestrian Street Shop', 'Mall Store', 'Flagship Store', 'Luxury Boutique'],
  laden: ['Small shop', 'Shop with display window', 'Jewellery store', 'Exclusive boutique'],
  frisur: { kurz: 'Short', lang: 'Long', dutt: 'Bun', stachel: 'Spiky', glatze: 'Bald' },
  extra: { keins: 'None', brille: 'Glasses', muetze: 'Beanie', hut: 'Top hat' }
};

// Text in aktueller Sprache holen
function t(schluessel, v = {}) {
  const s = TEXTE[SPRACHE][schluessel] ?? TEXTE.de[schluessel] ?? schluessel;
  return typeof s === 'function' ? s(v) : s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
}
// Namen in aktueller Sprache (Deutsch steht direkt in den Daten)
function nm(kategorie, id, deutsch) {
  if (SPRACHE !== 'en') return deutsch;
  const tabelle = NAMEN_EN[kategorie];
  return (tabelle && tabelle[id]) ?? deutsch;
}
