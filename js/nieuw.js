/* Vestigia – uitleg bij nieuwe onderdelen (update 9)
   De verrassing blijft: een nieuw onderdeel (de dwaalgast, de adventkalender, straks levels of een minigame) popt
   gewoon in beeld. De eerste keer verschijnen er dan in die pop-up zelf, één voor één, kleine uitlegblokjes bij de
   onderdelen waar het om gaat (Nieuw.blokjes). Terugkijken kan altijd via Spelregels → ‘Uitleg bij nieuwe
   onderdelen’; daar staat dezelfde uitleg als losse kaart (Nieuw.toon).
   Een nieuw onderdeel toevoegen = één item in ONDERDELEN (voor de spelregels) en een aanroep van Nieuw.blokjes
   op de plek waar het onderdeel voor het eerst in beeld komt. */
"use strict";

/* Nieuwe soorten eerst als dagcasus (15 november): tekst over oefenen.
   NOOIT een datum noemen, en ook niet ‘vandaag’ of ‘morgen’: dan verklapt de melding welke soort op die dag de dagcasus is
   (Tom, 16 november: ‘dit mag nooit meer gebeuren’). Daarom alleen oefenbaar() (wordt pas waar de dag ná de eerste
   dagcasus), geen datum uit het dagschema. tools/controle.mjs bewaakt dit. */
function wanneer(id){
  /* update 102: zonder wachttijd (OEFENEN_NA_DAGCASUS leeg) geen ‘al dagcasus’, want dat zou niet kloppen */
  if (!OEFENEN_NA_DAGCASUS.includes(id)) return "Je kunt hem meteen oefenen, en hij kan ook in een duel voorkomen.";
  return oefenbaar(id) ? "Hij was al dagcasus, dus je kunt hem nu ook oefenen."
    : "Je kunt hem pas oefenen nadat hij voor het eerst dagcasus is geweest.";
}
function nieuwOefenen(ids){
  if (!ids.every(id => oefenbaar(id))) return null;
  const label = ids.length > 1 ? "Oefen de nieuwe soorten" : `Oefen de ${(BY_ID.get(ids[0]) || { n: "nieuwe soort" }).n.toLowerCase()}`;
  return { label, run: () => startFree({ g: null, nieuw: false, ids }) };
}
const Nieuw = (() => {
  const KEY = id => "vestigia:nieuw:" + id;
  const gezien = id => { try { return !!localStorage.getItem(KEY(id)); } catch(e){ return true; } };
  const markeer = id => { try { localStorage.setItem(KEY(id), "1"); } catch(e){} };

  /* ---------- wie krijgt ‘Nieuw’? (12 november 2026) ----------
     Meldingen over iets wat veranderd is (‘staat nu hier’, ‘Nieuw: zoeken op groep’) zijn alleen voor spelers die
     al een dagcasus speelden vóórdat dat onderdeel kwam of veranderde. Een nieuwe speler kent de oude situatie niet;
     wat hij moet weten, staat in de uitleg bij de eerste keer (js/uitleg.js).
     VANAF = de dag dat het onderdeel live ging of gaat. Bij een nieuw onderdeel hier een regel toevoegen.
     WIJZIGING = meldingen die nieuwe spelers helemaal niet krijgen. De andere (hoe de dwaalgast, de adventkalender,
     het duel werken) krijgen ze wel, maar zonder ‘Nieuw’: dan heten ze ‘Zo werkt het’ of ‘Uitleg’. */
  const VANAF = {
    dwaalgast: "2026-11-10", zoekgroepen: "2026-11-11", bronnen: "2026-11-11", statistiek: "2026-11-11",
    "statistiek-na-casus": "2026-11-11", "verward-statistiek": "2026-11-12", apparaten: "2026-11-12",
    levels: "2026-11-16", spelersduel: "2026-11-23", advent: "2026-12-01",
    soorten14: "2026-11-13",           // update 14: libellen en kevers; de dag dat ze live gaan
    grotebosmuis: "2026-11-15",        // update 30: de grote bosmuis
    patrijs: "2026-11-15",             // update 47: de patrijs (live 15 november)
    scholekster: "2026-11-23",         // update 105: de scholekster (live 23 november)
    weetjes: "2026-11-17",             // update 37: ‘Wist je dat?’ (live 17 november 10:38)
    expert45: "2026-11-19",            // update 45: expert levert meer op; de dag van de livegang (zie EXPERT_VANAF)
    uitslagtabs: "2026-11-24", dexweergave: "2026-11-24"   // update 64: uitslag in tabbladen, compact Vestiarium (dag van de livegang)
  };
  const WIJZIGING = new Set(["zoekgroepen", "bronnen", "statistiek-na-casus", "verward-statistiek", "soorten14", "grotebosmuis", "patrijs", "scholekster", "weetjes", "expert45", "uitslagtabs", "dexweergave"]);
  /* speelde je al een dagcasus vóór die dag? (het logboek gaat via Supabase mee naar je andere apparaten) */
  function veteraan(id){
    const d = VANAF[id]; if (!d) return true;
    const grens = Date.parse(d + "T00:00:00+01:00");
    const st = store.get();
    if ((st.log || []).some(e => e && e.m === "daily" && e.t && e.t < grens)) return true;
    /* oude opslag zonder logboek: een dagcasus van ruim vóór die dag (inhalen kan tot 3 dagen terug) */
    const dag = Math.round((grens - START) / DAY);
    for (let i = 0; i < dag - 3; i++) if (finished(st, i, false) || finished(st, i, true)) return true;
    return false;
  }
  /* update 79: een melding over iets nieuws komt hooguit 4 weken na VANAF nog vanzelf (wie later terugkomt, krijgt hem niet meer) */
  const HOUDBAAR = 28 * DAY;
  function vers(id){ const d = VANAF[id]; return !d || Date.now() < Date.parse(d + "T00:00:00+01:00") + HOUDBAAR; }
  /* ‘Nieuw: het spelersduel!’ → ‘Het spelersduel!’ */
  const zonderNieuw = t => { const r = String(t).replace(/^Nieuw:\s*/, ""); return r.charAt(0).toUpperCase() + r.slice(1); };

  const ICOON = {
    dwaalgast: `<span class="nw-ic rood"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.5" cy="15.5" r="4"/><circle cx="17.5" cy="15.5" r="4"/><path d="M10.5 15.5h3M4 12l2.5-7h3l1 4M20 12l-2.5-7h-3l-1 4"/></svg></span>`,
    vragen: `<span class="nw-ic rood"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h7"/><path d="M16 16l2 2 4-4"/></svg></span>`,
    vraagteken: `<span class="nw-ic rood"><b>?</b></span>`,
    cadeau: `<span class="nw-ic kerst"><svg aria-hidden="true" viewBox="0 0 20 20" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="8" width="14" height="9" rx="1.2"/><path d="M2.5 5.2h15v2.8h-15zM10 5.2V17"/><path d="M10 5.2C8.6 2.4 5.6 2.4 6.1 4.3c.3 1 2.4.9 3.9.9ZM10 5.2c1.4-2.8 4.4-2.8 3.9-.9-.3 1-2.4.9-3.9.9Z"/></svg></span>`,
    spoor: `<span class="nw-ic kerst"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><ellipse cx="12" cy="15.5" rx="4.2" ry="3.6"/><ellipse cx="6.5" cy="9.5" rx="1.8" ry="2.3"/><ellipse cx="10" cy="6.5" rx="1.8" ry="2.3"/><ellipse cx="14" cy="6.5" rx="1.8" ry="2.3"/><ellipse cx="17.5" cy="9.5" rx="1.8" ry="2.3"/></svg></span>`,
    /* update 30: pootafdruk in de gewone kleur (de rode ‘spoor’ hoort bij de adventkalender) */
    veer: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/></svg></span>`,
    poot: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><ellipse cx="12" cy="15.5" rx="4.2" ry="3.6"/><ellipse cx="6.5" cy="9.5" rx="1.8" ry="2.3"/><ellipse cx="10" cy="6.5" rx="1.8" ry="2.3"/><ellipse cx="14" cy="6.5" rx="1.8" ry="2.3"/><ellipse cx="17.5" cy="9.5" rx="1.8" ry="2.3"/></svg></span>`,
    level: `<span class="nw-ic"><b>7</b></span>`,
    xp: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z"/></svg></span>`,
    rang: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17V7h12l4 5-4 5H4Z"/><path d="M8 12h6"/></svg></span>`,
    duel: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 22 22" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="8" r="2.6"/><circle cx="15" cy="8" r="2.6"/><path d="M2.5 17c.5-2.6 2.3-4 4.5-4s4 1.4 4.5 4M10.5 17c.5-2.6 2.3-4 4.5-4s4 1.4 4.5 4"/></svg></span>`,
    /* twee gekruiste zwaarden, elk met kling, pareerstang, greep en knop; het voorste zwaard heeft een rand in de achtergrondkleur,
       zodat je ziet dat het twee aparte zwaarden zijn */
    zwaarden: `<span class="nw-ic zwaard"><svg aria-hidden="true" viewBox="-16 -16 32 32" width="56" height="56" fill="currentColor">
      <g transform="rotate(-45)"><path d="M0-14.5L1.9-11V4.2h-3.8V-11Z"/><path d="M0-11V2.8" stroke="var(--du-d,#56344f)" stroke-width=".7" opacity=".55"/><rect x="-5.6" y="4" width="11.2" height="2.4" rx="1.2"/><rect x="-1.2" y="6.4" width="2.4" height="5.2" rx=".8"/><circle cy="13.2" r="1.9"/></g>
      <g transform="rotate(45)" stroke="var(--du-d,#56344f)" stroke-width="1.4" paint-order="stroke" stroke-linejoin="round"><path d="M0-14.5L1.9-11V4.2h-3.8V-11Z"/><path d="M0-11V2.8" stroke="var(--du-d,#56344f)" stroke-width=".7" opacity=".55"/><rect x="-5.6" y="4" width="11.2" height="2.4" rx="1.2"/><rect x="-1.2" y="6.4" width="2.4" height="5.2" rx=".8"/><circle cy="13.2" r="1.9"/></g></svg></span>`,
    app: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.6"/><path d="M10.5 18.5h3"/><path d="M12 6.5v7M9 10.5l3 3 3-3"/></svg></span>`,
    koppel: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4.5" width="11" height="8" rx="1.4"/><path d="M1 15.5h13"/><rect x="16" y="7" width="6.5" height="12" rx="1.6"/><path d="M8 18.5c0 1.6 1.3 2.5 3.2 2.5H14"/><path d="M12.6 19.4 14.3 21l-1.7 1.6"/></svg></span>`,
    /* update 14: een libel van boven en een kever van boven, en een pop (voor ‘Als ei, larve of pop’) */
    libel: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.4" r="1.7"/><path d="M12 6.4v15"/><path d="M12 8C9 5.8 4 5.6 2.7 7.5c-.8 1.3 1.6 2.6 9.3 1.7ZM12 8c3-2.2 8-2.4 9.3-.5.8 1.3-1.6 2.6-9.3 1.7Z"/><path d="M12 10.6c-2.7-.9-7 .2-7.6 2-.4 1.4 1.9 1.7 7.6-.5ZM12 10.6c2.7-.9 7 .2 7.6 2 .4 1.4-1.9 1.7-7.6-.5Z"/></svg></span>`,
    kever: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="14.2" rx="5.2" ry="6.4"/><path d="M12 8.6v12"/><path d="M9.2 8.2a2.8 2.8 0 0 1 5.6 0"/><path d="M10.6 5.8 8.8 3.2M13.4 5.8l1.8-2.6"/><path d="M7 11.2 3.6 9.6M6.8 14.6H3.2M7.4 17.8l-3 1.9M17 11.2l3.4-1.6M17.2 14.6h3.6M16.6 17.8l3 1.9"/></svg></span>`,
    pop: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3"/><path d="M12 5c2.6 0 4.1 3.1 4.1 7.2S14.2 21 12 21s-4.1-4.7-4.1-8.8S9.4 5 12 5Z"/><path d="M8.3 9.8h7.4M8 13.4h8M8.8 17h6.4"/></svg></span>`,
    /* update 45: een gloeilampje voor ‘Wist je dat?’ */
    lamp: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z"/></svg></span>`,
    kalender: `<span class="nw-ic kerst"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4"/></svg></span>`
  };

  const ONDERDELEN = [
    { id: "dwaalgast", titel: "Dwaalgasten",
      stappen: [
        { ic: "dwaalgast", kop: "Nieuw: dwaalgasten", tekst: "Eén keer per maand duikt er bij jou een dwaalgast op: een zeldzaam dier dat normaal niet in Nederland leeft. Welke dag dat is, verschilt per speler, en dat geldt ook voor welk dier het is." },
        { ic: "vragen", kop: "Bevestig de waarneming", tekst: `Je ziet meteen welk dier het is. Beantwoord drie vragen over bijvoorbeeld zijn sporen, uiterlijk of waar hij normaal leeft. Alle drie goed: hij komt in je ${NAAM.vestiarium}, met 50 eikels en zijn avatar.` },
        { ic: "vraagteken", kop: "Eén kans", tekst: "Is een antwoord fout, dan dwaalt hij weg en blijft er een vraagteken achter. Kies je ‘Later’, dan staat er tot het einde van de maand een rode knop rechtsboven." }
      ] },
    { id: "advent", titel: "Adventkalender",
      stappen: [
        { ic: "cadeau", kop: "De adventkalender is open", tekst: "Van 1 tot en met 24 december mag er elke dag één vakje open. Tik op het cadeautje rechtsboven, en daarna op ‘Open cadeau’." },
        { ic: "spoor", kop: "Wat zit erin?", tekst: "Eikels, sporen in de sneeuw om te raden, winterweetjes over beschermde soorten en een paar dingen die je nergens anders krijgt." },
        { ic: "kalender", kop: "Een gemist vakje is weg", tekst: "Je kunt alleen het vakje van vandaag openen. Open je ze alle 24, dan word je Adventkampioen." }
      ] },
    { id: "spelersduel", titel: "Spelersduel", klasse: "duelnieuw", verborgen: () => !(typeof Duel !== "undefined" && Duel.zichtbaar()),   // update 16, vanaf 23 november
      stappen: [
        { ic: "duel", kop: "Nieuw: het spelersduel!", tekst: "Daag een andere speler uit, op naam of met een link. Jullie spelen dezelfde drie casussen, in de modus die de uitdager kiest." },
        { ic: "zwaarden", kop: "Wie verslaat de ander?", tekst: "Jullie spelen allebei, in je eigen tempo, binnen 48 uur. Met een link begint het duel zodra iemand hem aanneemt. Wat de ander deed, zie je pas als jullie allebei klaar zijn. Dan gaan de casussen één voor één open." },
        { ic: "xp", kop: "Wie wint?", tekst: "Per casus krijg je punten zoals bij de dagcasus. Meeste punten wint; gelijke punten is gelijkspel. Ook hier zijn eikels te verdienen! En er zijn eigen prestaties en ondertitels. Een duel telt niet voor de ranglijst." }
      ] },
    /* update 21: voor iedereen één keer, via de wachtrij (js/apparaat.js); stappen met wat: "app" of "koppel" vallen weg
       als je de app al gebruikt of al op twee apparaten speelt */
    { id: "apparaten", titel: "App en koppelen", tip: true, actie: { label: "Naar Mijn profiel", run: () => showProfiel() },
      stappen: [
        { ic: "app", wat: "app", kop: "Speel Vestigia als app", tekst: "Zet Vestigia op het beginscherm van je telefoon. Dan open je hem met één tik, schermvullend, en werkt hij ook zonder internet. Kijk in Mijn profiel bij ‘Gebruik de app!’." },
        { ic: "koppel", wat: "koppel", kop: "Koppel je apparaten", tekst: `Speel je op je telefoon én op een laptop of tablet? Koppel ze met een korte code of een QR-code. Dan blijven je naam, eikels en ${NAAM.vestiarium} overal gelijk. Kijk in Mijn profiel bij ‘Koppel je apparaten’.` }
      ] },
    /* update 14: alleen voor wie al speelde voordat de nieuwe soorten er waren (via de wachtrij, hieronder) */
    { id: "soorten14", titel: "Libellen en kevers", actie: { label: "Oefen met insecten", run: () => startFree({ g: "I", nieuw: false }) },
      stappen: [
        { ic: "libel", kop: "Nieuw: libellen en kevers", tekst: "Er zijn twee nieuwe diergroepen. Vijf beschermde libellen: de gevlekte en de sierlijke witsnuitlibel, de rivierrombout, de beekrombout en de bosbeekjuffer. En twee kevers: de vermiljoenkever en het vliegend hert." },
        { ic: "kever", kop: "Zeven nieuwe platen", tekst: `Ze staan in je ${NAAM.vestiarium} als nº 701 tot en met 705 (libellen) en nº 801 en 802 (kevers), elk met twee casussen. Heb je alle libellen, dan ben je Vleugelvorst; met alle kevers word je Schildknaap. Oefen ze nu, of wacht tot ze als dagcasus langskomen.` },
        { ic: "pop", kop: "Nieuw bij Winter", tekst: "Na elke determinatie vergelijkt Vestigia jouw soort met de gezochte soort in een tabel. De kolom Winter in die tabel kent nu ook ‘Als ei, larve of pop’. Dat geldt voor de libellen en kevers, en voor de vlinders die als rups of pop overwinteren." }
      ] },
    /* update 30 en 47: de grote bosmuis en de patrijs, samen in één melding (via de wachtrij, hieronder) */
    /* Sinds 15 november (18:58) pas te oefenen na de eerste dagcasus: zolang dat nog niet zo is, geen oefenknop */
    { id: "nieuwesoorten", titel: "Nieuwe soorten", actie: nieuwOefenen(["grote-bosmuis", "patrijs"]),
      stappen: [
        { ic: "poot", wat: "grotebosmuis", kop: "Nieuwe soort: de grote bosmuis", tekst: `De tweelingsoort van de bosmuis staat nu in je ${NAAM.vestiarium}, als plaat nº 128, direct na de bosmuis. Hij heeft twee casussen. ${wanneer("grote-bosmuis")} Gok je ‘bosmuis’ terwijl het een grote bosmuis is (of andersom), dan kost je dat geen poging.` },
        { ic: "veer", wat: "patrijs", kop: "Nieuwe soort: de patrijs", tekst: `De patrijs staat nu in je ${NAAM.vestiarium}, als plaat nº 559. Hij heeft twee casussen. ${wanneer("patrijs")}` }
      ] },
    /* update 105: de scholekster (via de wachtrij, hieronder) */
    { id: "scholekster", titel: "Scholekster", actie: nieuwOefenen(["scholekster"]),
      stappen: [
        { ic: "veer", kop: "Nieuwe soort: de scholekster", tekst: `De scholekster staat nu in je ${NAAM.vestiarium}, als plaat nº 560. Hij heeft vier casussen, van het wad tot een plat dak in de stad. ${wanneer("scholekster")}` }
      ] },
    /* update 45 (met update 37): één melding voor wie al speelde, via de wachtrij (hieronder); een kaart valt weg als je
       pas na dat onderdeel begon */
    { id: "vernieuwd", titel: "Expert en Wist je dat?",
      stappen: [
        { ic: "xp", wat: "expert45", kop: "Nieuw: expert levert meer op", tekst: "In expert krijg je nu 7 punten als je na één waarneming goed zit; daarna 6 · 4 · 3 en 1 bij de vijfde. Zit je mis, dan gaan alle waarnemingen open en heb je nog één gok: goed levert 1 punt én de plaat op." },
        { ic: "lamp", wat: "weetjes", kop: "Nieuw: Wist je dat?", tekst: "Na elke casus staat een weetje over de soort, met de bron eronder. Elke casus heeft zijn eigen weetje: speel je een soort nog eens in een andere casus, dan leer je er weer iets nieuws over." }
      ] },
    { id: "levels", titel: "Levels", verborgen: () => !(typeof Levels !== "undefined" && Levels.zichtbaar()),   // pas vanaf de startdatum
      stappen: [
        { ic: "level", kop: "Nieuw: levels", tekst: "Met ervaringspunten (XP) stijg je in level. Je level zie je in de ring om je avatar rechtsboven: hoe voller de ring, hoe dichter bij het volgende level." },
        { ic: "xp", kop: "XP verdien je met leren", tekst: "Dagcasus 10 + 5 per punt, plus een dagbonus tot 35 voor je reeks. Oefencasus 10 (niet gevonden 3). Nieuwe soort +10, dwaalgast +50. Had je een soort eerder fout en heb je hem minstens een dag later goed? Dan krijg je 15 XP extra." },
        { ic: "rang", kop: "Wat een level oplevert", tekst: "Elk level levert 10 eikels op. Bij level 5 en 10 krijg je je eerste rangen als ondertitel. Daarna is elke 20 levels een mijlpaal: 50 eikels extra, een nieuwe rang en een hersteltoken. Van Stagiair tot Levende legende op level 200." }
      ] }
  ];

  /* de pop-up: stap voor stap, met Volgende en Overslaan */
  function toon(o, opties){
    opties = opties || {};
    const nieuw = opties.terug || veteraan(o.id);      // terugkijken via de spelregels: zoals het was
    return new Promise(klaar => {
      const pop = $("wachtPop"), body = $("wachtBody");
      let i = 0;
      const dicht = () => { pop.hidden = true; pop.classList.remove("nieuw"); if (o.klasse) pop.classList.remove(o.klasse); document.removeEventListener("keydown", esc_, true); klaar(); };
      const esc_ = e => { if (e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); dicht(); } };
      function stap(){
        const s = o.stappen[i], laatste = i === o.stappen.length - 1;
        body.innerHTML = `
          <div class="nw-kop"><span class="caps">${i === 0 ? (nieuw ? "Nieuw in Vestigia" : o.tip ? "Tip" : "Zo werkt het") : esc(o.titel)}</span><span class="nw-stip">${o.stappen.map((_, k) => `<i class="${k === i ? "nu" : k < i ? "klaar" : ""}"></i>`).join("")}</span></div>
          <div class="nw-stap">${ICOON[s.ic] || ""}<h2 id="wachtH">${esc(nieuw ? s.kop : zonderNieuw(s.kop))}</h2><p>${esc(s.tekst)}</p></div>
          <div class="nw-knoppen">${laatste ? (o.actie ? `<button class="btn line" id="nwActie">${esc(o.actie.label)}</button>` : "") : `<button class="linklike" id="nwSkip">Overslaan</button>`}<button class="btn" id="nwVolg">${laatste ? "Begrepen" : "Volgende"}</button></div>`;
        $("nwVolg").onclick = () => { if (laatste) dicht(); else { i++; stap(); } };
        if (laatste && o.actie) $("nwActie").onclick = () => { dicht(); o.actie.run(); };
        if (!laatste) $("nwSkip").onclick = dicht;
        $("nwVolg").focus();
      }
      pop.classList.add("nieuw");
      if (o.klasse) pop.classList.add(o.klasse);       // eigen opmaak, bijvoorbeeld het spelersduel (update 16)
      pop.hidden = false;
      document.addEventListener("keydown", esc_, true);
      stap();
    });
  }

  /* Uitlegblokjes in een pop-up die net in beeld kwam. stappen = [{ na: element, tekst }]: elk blokje verschijnt
     direct onder zijn element, met een pijltje ernaar. ‘Volgende’ laat het volgende zien, het laatste is ‘Begrepen’.
     Eén keer per onderdeel (in een voorbeeld met ?…=demo altijd). Je kunt intussen gewoon verder in de pop-up. */
  async function blokjes(id, stappen, opties){
    opties = opties || {};
    if ((gezien(id) && !opties.altijd) || bezig.has(id)) return;   // ook niet twee keer tegelijk
    markeer(id);
    const nieuw = opties.altijd || veteraan(id);
    if (!nieuw && WIJZIGING.has(id)) return;          // nieuwe speler: geen ‘dit is veranderd’
    if (!nieuw) stappen = stappen.map(s => Object.assign({}, s, { tekst: zonderNieuw(s.tekst) }));
    opties = Object.assign({ nieuw }, opties);
    bezig.add(id);
    try { await reeks(stappen, opties); } finally { bezig.delete(id); }
  }
  const bezig = new Set();
  async function reeks(stappen, opties){
    stappen = stappen.filter(s => s.na && s.na.isConnected && s.na.offsetParent !== null);   // alleen wat nu zichtbaar is
    await new Promise(r => setTimeout(r, opties.wacht === undefined ? 1100 : opties.wacht));
    for (let i = 0; i < stappen.length; i++){
      const s = stappen[i];
      if (!s.na.isConnected) return;
      const laatste = i === stappen.length - 1;
      const el = document.createElement("div");
      el.className = "nw-blokje" + (opties.rood ? " rood" : "");
      el.setAttribute("role", "note");
      el.innerHTML = `<span class="nw-pijl" aria-hidden="true"></span><span class="caps">${i === 0 && opties.nieuw ? "Nieuw" : "Uitleg"} · ${i + 1} van ${stappen.length}</span><p>${esc(s.tekst)}</p>
        <div class="nw-bk"><button class="linklike" type="button" data-x>${laatste ? "" : "Overslaan"}</button><button class="nw-volg" type="button">${laatste ? "Begrepen" : "Volgende"}</button></div>`;
      if (laatste) el.querySelector("[data-x]").remove();
      s.na.insertAdjacentElement("afterend", el);
      el.scrollIntoView({ block: "center", behavior: rustig() ? "auto" : "smooth" });
      const klaar = await new Promise(r => {
        el.querySelector(".nw-volg").onclick = () => r("volg");
        const x = el.querySelector("[data-x]"); if (x) x.onclick = () => r("stop");
        /* sluit of verandert de pop-up (bijvoorbeeld de eerste vraag), dan stopt de uitleg vanzelf */
        const kijk = setInterval(() => { if (!el.isConnected || !s.na.isConnected || el.closest("[hidden]")){ clearInterval(kijk); r("weg"); } }, 400);
      });
      el.classList.add("weg");
      await new Promise(r => setTimeout(r, rustig() ? 0 : 200));
      el.remove();
      if (klaar !== "volg") return;
    }
  }
  const rustig = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* terugkijken vanuit de spelregels */
  function knoppen(){
    const box = $("helpNieuw"); if (!box) return;
    box.innerHTML = ONDERDELEN.filter(o => !(o.verborgen && o.verborgen())).map(o => `<button class="chipbtn" type="button" data-nw="${o.id}">${esc(o.titel)}</button>`).join("");
    box.querySelectorAll("[data-nw]").forEach(b => b.onclick = () => {
      const o = ONDERDELEN.find(x => x.id === b.dataset.nw);
      $("help").hidden = true;
      toon(o, { terug: true });
    });
  }
  knoppen();
  return { toon, blokjes, knoppen, veteraan, vers, gezien, bezigMet: id => bezig.has(id), ONDERDELEN };
})();

/* update 30 en 47: één melding ‘Nieuwe soorten’, direct na die van update 14. De kaart van de grote bosmuis krijgt wie al een
   dagcasus speelde vóór 15 november en de losse bosmuis-melding (15 november 16:13–16:40) nog niet zag; de kaart van de
   patrijs krijgt wie al speelde vóór VANAF.patrijs. Wie alleen de patrijs krijgt, ziet ook alleen die kaart. */
Wachtrij.voeg({ id: "nieuwesoorten", prio: 2.61, combi: true, naam: "Nieuwe soorten",
  kaarten(){
    let al = true; try { al = !!localStorage.getItem("vestigia:nieuw:grotebosmuis"); } catch(e){}
    return { grotebosmuis: !al && Nieuw.vers("grotebosmuis") && Nieuw.veteraan("grotebosmuis"), patrijs: Nieuw.vers("patrijs") && Nieuw.veteraan("patrijs") };
  },
  kan(){
    try { if (localStorage.getItem("vestigia:nieuw:nieuwesoorten")) return false; } catch(e){ return false; }
    const k = this.kaarten(); return k.grotebosmuis || k.patrijs;
  },
  toon(){
    const k = this.kaarten();
    try { localStorage.setItem("vestigia:nieuw:nieuwesoorten", "1"); localStorage.setItem("vestigia:nieuw:grotebosmuis", "1"); } catch(e){}
    const o = Nieuw.ONDERDELEN.find(x => x.id === "nieuwesoorten"), st = o.stappen.filter(s => k[s.wat]);
    const ids = st.map(s => s.wat === "grotebosmuis" ? "grote-bosmuis" : "patrijs");
    const een = st.length === 1;
    return Nieuw.toon(Object.assign({}, o, { id: k.patrijs ? "patrijs" : "grotebosmuis", stappen: st,
      titel: een ? (ids[0] === "patrijs" ? "Patrijs" : "Grote bosmuis") : o.titel,
      actie: nieuwOefenen(ids) }));
  } });

/* update 105: één keer ‘Nieuwe soort: de scholekster’, in de combi-pop-up, direct na ‘Nieuwe soorten’. Alleen voor wie al een
   dagcasus speelde vóór VANAF.scholekster, en hooguit 4 weken (Nieuw.vers). */
Wachtrij.voeg({ id: "scholekster", prio: 2.615, combi: true, naam: "Scholekster",
  kan(){
    try { if (localStorage.getItem("vestigia:nieuw:scholekster")) return false; } catch(e){ return false; }
    return Nieuw.vers("scholekster") && Nieuw.veteraan("scholekster");
  },
  toon(){
    try { localStorage.setItem("vestigia:nieuw:scholekster", "1"); } catch(e){}
    return Nieuw.toon(Nieuw.ONDERDELEN.find(o => o.id === "scholekster"));
  } });

/* update 14: één keer ‘Nieuw: libellen en kevers’, na de dwaalgast, het duel, de levels, de adventkalender en de uitleg
   over de app; vóór de herinnering om een avatar te kiezen. Alleen voor wie al een dagcasus speelde vóór VANAF. */
Wachtrij.voeg({ id: "soorten14", prio: 2.6, combi: true, naam: "Libellen en kevers",
  kan(){
    try { if (localStorage.getItem("vestigia:nieuw:soorten14")) return false; } catch(e){ return false; }
    return Nieuw.vers("soorten14") && Nieuw.veteraan("soorten14");
  },
  toon(){
    try { localStorage.setItem("vestigia:nieuw:soorten14", "1"); } catch(e){}
    return Nieuw.toon(Nieuw.ONDERDELEN.find(o => o.id === "soorten14"));
  } });

/* update 45: ‘Expert levert meer op’ en ‘Wist je dat?’ in één melding, direct na ‘Nieuwe soorten’. Per kaart alleen voor wie
   al een dagcasus speelde vóór dat onderdeel (VANAF), en hooguit 4 weken (Nieuw.vers). */
Wachtrij.voeg({ id: "vernieuwd", prio: 2.62, combi: true, naam: "Expert en Wist je dat?",
  kaarten(){ return { expert45: Nieuw.vers("expert45") && Nieuw.veteraan("expert45"), weetjes: Nieuw.vers("weetjes") && Nieuw.veteraan("weetjes") }; },
  kan(){
    if (Date.now() < Date.parse("2026-11-19T00:00:00+01:00")) return false;    // de nieuwe expertpunten gelden vanaf 19 november
    try { if (localStorage.getItem("vestigia:nieuw:vernieuwd")) return false; } catch(e){ return false; }
    const k = this.kaarten(); return k.expert45 || k.weetjes;
  },
  toon(){
    const k = this.kaarten();
    try { localStorage.setItem("vestigia:nieuw:vernieuwd", "1"); } catch(e){}
    const o = Nieuw.ONDERDELEN.find(x => x.id === "vernieuwd"), st = o.stappen.filter(s => k[s.wat]);
    const titel = st.length === 1 ? (st[0].wat === "expert45" ? "Expert" : "Wist je dat?") : o.titel;
    return Nieuw.toon(Object.assign({}, o, { id: k.expert45 ? "expert45" : "weetjes", stappen: st, titel }));
  } });

/* update 85 (Tom, 18 november 14:05 en 22 november 16:09): twee weken dubbel uitnodigen, met een vooruitblik op de
   adventkalender. In de combi-pop-up ‘Nieuw in Vestigia’, één keer per speler (ook over je apparaten), alleen van
   ma 30 november t/m zo 13 december, en alleen voor wie een spelersnaam heeft. Vóór 1 december de vooruitblik, daarna ‘de adventkalender is open’.
   Voorbeeld: ?dubbel=demo (30 november) of ?dubbel=demo&nu=2026-12-03. */
Wachtrij.voeg({ id: "dubbeluitnodigen", prio: 1.65, combi: true, naam: "Dubbel uitnodigen",
  kan(){
    if (typeof online === "undefined" || !online.enabled || !online.player() || !League.dubbel()) return false;   // alleen met een spelersnaam: zonder naam tellen uitnodigingen niet
    try { return !localStorage.getItem("vestigia:nieuw:dubbeluitnodigen"); } catch(e){ return false; }
  },
  toon(){
    try { localStorage.setItem("vestigia:nieuw:dubbeluitnodigen", "1"); } catch(e){}
    const adventOpen = League.nu() >= Date.parse("2026-12-01T00:00:00+01:00");
    return Nieuw.toon({ id: "dubbeluitnodigen", titel: "Dubbel uitnodigen",
      actie: { label: "Uitnodigen", run: () => League.openUitnodigen() },
      stappen: [
        { ic: "duel", kop: "Twee weken dubbele beloning!",
          tekst: "Tot en met zondag 13 december levert elke speler die je uitnodigt dubbel op: 20 eikels zodra die speler zich aanmeldt in de app en een eerste casus determineert, en nog eens 20 als hij of zij drie dagcasussen heeft gespeeld. Dat geldt voor maximaal vijf spelers." },
        adventOpen
          ? { ic: "cadeau", kop: "De adventkalender is open",
              tekst: "Tot en met 24 december gaat er elke dag één vakje open. Een gemist vakje is weg, dus kom elke dag even langs. Wie je nu uitnodigt, kan meteen meedoen." }
          : { ic: "cadeau", kop: "Mis de adventkalender niet",
              tekst: "Vanaf dinsdag 1 december gaat er elke dag één vakje open, tot en met 24 december. Er zitten eikels, sporen om te raden en beloningen in die je nergens anders krijgt. Een gemist vakje is weg, dus kom elke dag even langs. Nodig nu iemand uit, dan speelt die vanaf het eerste vakje mee." }
      ] });
  } });
