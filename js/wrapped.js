/* Vestigia Wrapped 2026 (update 29): je jaar in Vestigia, in kaarten waar je doorheen tikt, met Vesti als gids.
   Afspraken (Tom, 24 november 2026):
   - Vanaf 1 januari 2027. Tot en met 15 januari komt hij één keer vanzelf (wachtrij, vóór alles); daarna en daarna
     altijd via ‘Wrapped 2026’ in het menu.
   - Vesti stelt zich in de eerste kaart voor en moedigt je op elke kaart aan. Wie de Wrapped zag, heeft Vesti daarna
     aan in de app (vestigia:wrapped-gezien, js/vesti.js), ook op je andere apparaten (GEZIEN_VLAG in js/veldboek.js).
   - Een eigen Wrapped vanaf 5 gespeelde casussen in 2026. Minder, of nog geen naam: alleen ‘Vestigia in 2026’
     (het gezamenlijke deel) en een oproep voor volgend jaar.
   - Je nemesis = de soort die je het vaakst verwarde, alleen met soorten die echt op elkaar lijken: dezelfde regel als
     ‘Vaakst verward’ in Statistieken (lijktOp in js/veldboek.js).
   - Delen: een afbeelding van de samenvattingskaart, met alleen je eigen cijfers (geen namen van anderen), via het
     deelmenu van je telefoon; kan dat niet, dan wordt hij gedownload.
   Gegevens: de RPC wrapped(id, sleutel, jaar) (SQL 060, repo Vestigia-database). Hij geeft { ik, samen }: ‘ik’ is jouw
   deel (of null zonder naam), ‘samen’ het gezamenlijke deel (SQL 024, op 31 december gemaakt).
   Vesti's entree (Tom: ‘dit is bijzonder en vet, dat mag echt een moment zijn’): eerst een kaart met zijn silhouet
   (‘er is iemand die je wil ontmoeten’), dan de onthulling met stralen en confetti. Wie de Wrapped al eens zag, krijgt
   meteen ‘Daar ben ik weer!’. Op elke kaart staat Vesti anders: groot in het midden, naast de tekst, gluurend over
   de onderrand of van opzij het beeld in. Elke kaart opent met een zin die vertelt wat je deed, niet met een losse titel.
   Een kaart toevoegen of weghalen: zie kaarten() hieronder (de uitleg van de velden staat erboven).
   Voorbeeld: ?wrapped=demo (eigen Wrapped), ?wrapped=demo&weinig=1 (onder de 5 casussen), ?wrapped=demo&gast=1 (geen naam). */
"use strict";

const Wrapped = (() => {
  const JAAR = 2026;
  const VANAF = Date.parse("2027-01-01T00:00:00+01:00");
  const VANZELF_TOT = Date.parse("2027-01-16T00:00:00+01:00");   // t/m 15 januari komt hij vanzelf
  const GEZIEN = "vestigia:wrapped-gezien", INTRO = "vestigia:nieuw:vesti";
  const u = new URLSearchParams(location.search);
  const demo = u.get("wrapped") === "demo";
  const lees = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
  const zet = (k, v) => { try { localStorage.setItem(k, v); } catch(e){} };
  const beschikbaar = () => demo || Date.now() >= VANAF;
  const fmtDag = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", timeZone: "UTC" });
  const datum = d => fmtDag.format(new Date(START + d * DAY));
  const nr = n => Number(n || 0).toLocaleString("nl-NL");
  const soort = id => { const t = BY_ID.get(id); return t ? t.n : id; };
  const keer = n => n === 1 ? "1 keer" : `${nr(n)} keer`;

  /* ---------- wat voor speler ben jij? ----------
     Van boven naar beneden: het eerste type waarvan ‘past’ klopt, is het jouwe. Een type erbij of een grens anders:
     pas alleen deze lijst aan. ik = het persoonlijke deel uit de RPC wrapped (SQL 060); pct = je percentage goed. */
  const SPELERSTYPEN = [
    { naam: "De Duellist", past: (ik) => (ik.per_spel.spelersduel || 0) >= 10 && ik.per_spel.spelersduel >= ik.casussen * .15,
      zin: ik => `Je zoekt graag de strijd op: ${nr(ik.per_spel.spelersduel)} spelersduels gespeeld.` },
    { naam: "De Durfal", past: (ik) => ik.expert >= ik.casussen * .4,
      zin: ik => `${keer(ik.expert)} expert. Minder waarnemingen, meer risico, meer punten.` },
    { naam: "De Trouwe Spoorzoeker", past: (ik) => ik.reeks >= 14,
      zin: ik => `${nr(ik.reeks)} dagen op rij in het veld. Op jou kun je bouwen.` },
    { naam: "De Scherpe Blik", past: (ik, pct) => pct >= 85 && ik.casussen >= 20,
      zin: (ik, pct) => `${pct}% goed. Jou maken ze niet zo snel iets wijs.` },
    { naam: "De Verzamelaar", past: (ik) => ik.platen >= 80,
      zin: ik => `${nr(ik.platen)} platen. Je ${NAAM.vestiarium} puilt bijna uit.` },
    { naam: "De Oefenaar", past: (ik) => (ik.per_spel.oefenen || 0) >= ik.casussen * .6,
      zin: ik => `${nr(ik.per_spel.oefenen)} oefencasussen. Oefening baart kunst.` },
    { naam: "De Doorzetter", past: (ik, pct) => pct < 50,
      zin: () => "Niet alles ging in één keer goed, maar je bleef het proberen." },
    { naam: "De Ontdekker", past: () => true,
      zin: () => "Je verkende Vestigia op je eigen manier, van soort tot soort." }
  ];
  function spelerstype(ik){
    const pct = ik.casussen ? Math.round(100 * ik.gewonnen / ik.casussen) : 0;
    const t = SPELERSTYPEN.find(t => { try { return t.past(Object.assign({ per_spel: {} }, ik), pct); } catch(e){ return false; } });
    return { naam: t.naam, zin: t.zin(Object.assign({ per_spel: {} }, ik), pct) };
  }

  /* ---------- voorbeeldgegevens voor ?wrapped=demo en de tests ---------- */
  function demoData(){
    const samen = { jaar: JAAR, casussen: 18342, spelers: 412, dagcasussen: 9120,
      top_dag: [{ naam: "Boommarter", n: 56, plek: 1 }, { naam: "Ringslang", n: 55, plek: 2 }, { naam: "Demospeler", n: 54, plek: 3 }],
      top_reeks: [{ naam: "Ringslang", n: 56, plek: 1 }, { naam: "Boommarter", n: 41, plek: 2 }, { naam: "Kwartel", n: 30, plek: 3 }],
      top_platen: [{ naam: "Kwartel", n: 131, plek: 1 }, { naam: "Demospeler", n: 118, plek: 2 }, { naam: "Ringslang", n: 102, plek: 3 }],
      lastig: { dag: 23, soort: "kortsnavelboomkruiper", pct: 18, spelers: 140 }, verward: [], plaat_bezit: {} };
    if (u.get("gast") === "1") return { jaar: JAAR, ik: null, samen };
    if (u.get("weinig") === "1") return { jaar: JAAR, ik: { genoeg: false, casussen: 3, drempel: 5 }, samen };
    return { jaar: JAAR, samen, ik: { genoeg: true, casussen: 214, gewonnen: 171, expert: 40, dagen: 49, reeks: 21,
      per_spel: { dagcasus: 52, oefenen: 150, spelersduel: 12 },
      favoriet: { soort: "das", n: 9 },
      verward: [{ a: "boomkruiper", b: "kortsnavelboomkruiper", n: 5 }, { a: "kortsnavelboomkruiper", b: "boomkruiper", n: 2 }, { a: "das", b: "vos", n: 3 }],
      beste: { dag: 12, soort: "ree", expert: true, pogingen: 1, waarnemingen: 1, punten: 7 },
      platen: 118, platen_nieuw: 118, zeldzaamst: { soort: "boommarter", spelers: 3 }, spelers: 412, meer_dan_pct: 92 } };
  }

  /* ---------- ophalen ---------- */
  let data = null;
  async function haal(){
    if (demo) return demoData();
    if (!online.enabled) throw new Error("uit");
    const p = online.player();
    return online.rpc("wrapped", { p_id: p ? p.id : null, p_key: p ? p.key : null, p_jaar: JAAR });
  }
  const mijnNaam = () => demo ? "Demospeler" : (online.enabled && online.player() ? online.player().name : null);

  /* ---------- nemesis: zoals ‘Vaakst verward’ (beide richtingen samen, alleen soorten die op elkaar lijken) ---------- */
  function nemesis(verward){
    const tel = new Map();
    for (const r of verward || []){
      const A = BY_ID.get(r.a), B = BY_ID.get(r.b);
      if (!A || !B || !lijktOp(A, B)) continue;
      const k = [r.a, r.b].sort().join("|");
      const t = tel.get(k) || { n: 0, als: {} };
      t.n += r.n; t.als[r.a] = (t.als[r.a] || 0) + r.n; tel.set(k, t);
    }
    let best = null;
    for (const [k, t] of tel) if (!best || t.n > best.t.n) best = { k, t };
    if (!best) return null;
    /* de nemesis is de soort die het vaakst het goede antwoord was; de ander is waarvoor je hem hield */
    const [x, y] = best.k.split("|");
    const wie = (best.t.als[x] || 0) >= (best.t.als[y] || 0) ? x : y;
    return { soort: wie, met: wie === x ? y : x, n: best.t.n };
  }

  /* ---------- de kaarten ----------
     Elke kaart: { id, kleur, kop, html, vesti: { t, plek }, wolk, extra }
     - kleur  groen · bos · paars · lichtblauw · koraal · geel · roze · nacht · mint (.wr-k-… in css/vestigia.css)
     - kop    een zin die vertelt wat je deed (Tom: geen losse titels als ‘Favoriet’, die zeggen niemand iets)
     - vesti.t  welke tekening uit data/vesti.js: heel.juicht, kijkt.lacht, opzij.trots …
     - vesti.plek  midden (groot, in het midden) · links · rechts (staat naast de tekst) · onder (gluurt over de onderrand)
                   · zij (gluurt van rechts het beeld in) · silhouet (nog geheim, alleen op de teaser)
     - wolk   wat Vesti zegt; soort: "gedachte" voor een denkwolkje (standaard een spraakwolkje). plaatsWolk() zet het
              naast zijn hoofd, aan de kant waar plek is, met het puntje naar hem toe.
     - extra  stralen en/of confetti achter Vesti (de entree en het slot)
     Gezichten (Tom: meer variatie): elke tekening komt zo veel mogelijk maar één keer voor; ‘juichen’ alleen bij de
     onthulling en het slot. */
  function kaarten(d){
    const ik = d.ik, s = d.samen || {}, k = [];
    const eerder = !!lees(GEZIEN);
    if (!eerder) k.push({ id: "psst", kleur: "nacht", vesti: { t: "opzij.geheim", plek: "silhouet" }, wolk: "",
      kop: "Psst… voordat we naar je jaar kijken.",
      html: `<p class="wr-groot zin">Er is iemand die je heel graag wil ontmoeten.</p><p class="wr-fijn">Tik om kennis te maken.</p>` });
    k.push({ id: "hoi", kleur: "paars", vesti: { t: "heel.juicht", plek: "midden" }, extra: ["stralen", "confetti"],
      wolk: eerder ? "Nog een keer? Graag!" : "Ik heb je hele jaar bijgehouden. Kijken we samen?",
      kop: `Vestigia Wrapped ${JAAR}`,
      html: `<h2 class="wr-titel">${eerder ? "Daar ben ik weer!" : "Hoi! Ik ben Vesti!"}</h2>
        <p class="wr-lead">${eerder ? "Je veldgids, klaar om je jaar nog een keer met je door te lopen." :
          "Vanaf nu ben ik je veldgids in Vestigia. Ik heb alles gezien: elke casus, elke plaat en elke soort die je door elkaar haalde."}</p>` });

    if (ik && ik.genoeg){
      const pct = ik.casussen ? Math.round(100 * ik.gewonnen / ik.casussen) : 0;
      k.push({ id: "cijfers", kleur: "lichtblauw", vesti: { t: "kijkt.verbaasd", plek: "onder" },
        wolk: pct >= 80 ? "Wauw, bijna alles goed!" : pct >= 50 ? "Meer goed dan fout. Netjes!" : "Elke foute gok leert je iets.",
        kop: `In ${JAAR} speelde je`,
        html: `<p class="wr-groot">${nr(ik.casussen)}</p><p class="wr-lead">casussen in Vestigia</p>
          <ul class="wr-rij"><li><b>${nr(ik.gewonnen)}</b><span>keer goed gedetermineerd</span></li>
            <li><b>${pct}%</b><span>van je casussen goed</span></li><li><b>${nr(ik.dagen)}</b><span>${ik.dagen === 1 ? "dagcasus" : "dagcasussen"} gespeeld</span></li></ul>` });
      if (ik.reeks > 0) k.push({ id: "reeks", kleur: "koraal", vesti: { t: "opzij.trots", plek: "rechts" },
        wolk: ik.reeks >= 14 ? "Zelfs ik vergeet weleens een dag." : ik.reeks >= 7 ? "Een hele week! Knap volgehouden." : "Elke dag een beetje, zo word je veldbioloog.",
        kop: "Zo veel dagen op rij speelde je de dagcasus",
        html: `<p class="wr-groot">${nr(ik.reeks)}</p><p class="wr-lead">${ik.reeks === 1 ? "dag" : "dagen achter elkaar"}, zonder er één over te slaan</p>
          <div class="wr-kalender" aria-hidden="true">${Array.from({ length: Math.min(ik.reeks, 42) }, (_, j) => `<i style="--j:${j}"></i>`).join("")}</div>` });
      if (ik.favoriet) k.push({ id: "favoriet", kleur: "geel", vesti: { t: "kijkt.knipoog", plek: "onder" },
        wolk: "Die herken je inmiddels met je ogen dicht.",
        kop: "Deze soort herkende je het vaakst",
        html: `<p class="wr-soort">${esc(soort(ik.favoriet.soort))}</p>
          <p class="wr-lead">${keer(ik.favoriet.n)} goed gedetermineerd. Een echte specialiteit van je!</p>` });
      const nm = nemesis(ik.verward);
      k.push(nm ? { id: "nemesis", kleur: "nacht", vesti: { t: "kijkt.verlegen", plek: "zij" },
        wolk: "Ik haal ze zelf ook weleens door elkaar, hoor.",
        kop: "Deze soort haalde je het vaakst door elkaar",
        html: `<p class="wr-soort">${esc(soort(nm.soort))}</p>
          <p class="wr-tegen"><span>verward met</span><b>${esc(soort(nm.met))}</b></p>
          <p class="wr-lead">${keer(nm.n)}. Je nemesis van ${JAAR}!</p>
          <p class="wr-fijn">In Statistieken staat ‘Vaakst verward’, met een knop om juist deze soorten te oefenen.</p>` }
        : { id: "nemesis", kleur: "nacht", vesti: { t: "kijkt.knipoog", plek: "zij" }, wolk: "Geen nemesis? Dan ben jij die van mij.",
        kop: "Soorten die je door elkaar haalde",
        html: `<p class="wr-soort">Geen enkele!</p><p class="wr-lead">Je haalde nooit twee soorten door elkaar die op elkaar lijken.</p>` });
      if (ik.beste){
        const b = ik.beste, wat = b.soort || (dailyTarget(b.dag) || {}).id;
        k.push({ id: "beste", kleur: "groen", vesti: { t: "opzij.lacht", plek: "links" },
          wolk: b.pogingen <= 1 ? "In één keer! Ik zag het aan je gezicht." : "Die ging je goed af.",
          kop: `Je beste dagcasus speelde je op ${datum(b.dag)}`,
          html: `${wat ? `<p class="wr-soort">${esc(soort(wat))}</p>` : ""}
            <ul class="wr-chips"><li>${b.expert ? "expert" : "klassiek"}</li><li>${b.pogingen <= 1 ? "in één poging" : `in ${b.pogingen} pogingen`}</li>
              <li>${b.waarnemingen === 1 ? "na 1 waarneming" : `na ${b.waarnemingen} waarnemingen`}</li></ul>
            <p class="wr-groot middel">${nr(b.punten)} <small>punten</small></p>` });
      }
      if (ik.platen > 0){
        const z = ik.zeldzaamst;
        k.push({ id: "platen", kleur: "lichtblauw", vesti: { t: "opzij.dromerig", plek: "rechts" }, soort: "gedachte", wolk: "Mijn eigen Vestiarium is nog lang niet zo vol…",
          kop: `Zo veel platen verzamelde je in je ${NAAM.vestiarium}`,
          html: `<p class="wr-groot">${nr(ik.platen)}</p><p class="wr-lead">${ik.platen === 1 ? "plaat" : "platen"}, elk voor een soort die je goed had</p>
            ${z ? `<div class="wr-blok"><span>De zeldzaamste die je hebt:</span><b>${esc(soort(z.soort))}</b>
              <span>${z.spelers <= 1 ? "Jij bent de enige speler met deze plaat!" : `Maar ${nr(z.spelers)} spelers hebben deze plaat.`}</span></div>` : ""}` });
      }
      if (ik.meer_dan_pct != null && ik.spelers >= 5){
        const vol = Math.round(ik.meer_dan_pct / 10);
        k.push({ id: "vergelijk", kleur: "roze", vesti: { t: ik.meer_dan_pct >= 50 ? "heel.uitleg" : "opzij.verlegen", plek: "rechts" },
          wolk: ik.meer_dan_pct >= 50 ? "Jij bent een echte veldwerker." : "Volgend jaar haal je ze in.",
          kop: "Je speelde meer casussen dan",
          html: `<p class="wr-groot">${ik.meer_dan_pct}%</p><p class="wr-lead">van de ${nr(ik.spelers)} spelers van ${JAAR}</p>
            <div class="wr-poppetjes" aria-hidden="true">${Array.from({ length: 10 }, (_, j) => `<i class="${j < vol ? "vol" : ""}" style="--j:${j}"></i>`).join("")}</div>` });
      }
      const type = spelerstype(ik);
      k.push({ id: "type", kleur: "turkoois", vesti: { t: "opzij.knipoog", plek: "rechts" }, wolk: "Dat had ik allang door, hoor.",
        kop: "Na al die casussen weet ik wat voor speler jij bent",
        html: `<p class="wr-type">${esc(type.naam)}</p><p class="wr-lead">${esc(type.zin)}</p>` });
    } else {
      k.push({ id: "nognietgenoeg", kleur: "koraal", vesti: { t: "opzij.verlegen", plek: "midden" },
        wolk: "Volgend jaar maak ik er een voor jou!",
        kop: ik ? `In ${JAAR} speelde je` : "Je eigen Wrapped",
        html: ik ? `<p class="wr-groot">${nr(ik.casussen)}</p><p class="wr-lead">${ik.casussen === 1 ? "casus" : "casussen"}. Vanaf ${ik.drempel || 5} maak ik je eigen overzicht, met je favoriete soort, je nemesis en je platen. Volgend jaar dus!</p>`
          : `<h2 class="wr-titel">Nog geen naam</h2><p class="wr-lead">Je eigen Wrapped hoort bij je spelersnaam. Kies er een in de ranglijst, dan houd ik volgend jaar alles voor je bij.</p>` });
    }

    /* het gezamenlijke deel */
    if (s && s.casussen){
      const ik_ = mijnNaam();
      const top = (titel, rij, eenheid) => rij && rij.length ? `<div class="wr-top"><span>${titel}</span><ol>${rij.map(r =>
        `<li class="${r.naam === ik_ ? "jij" : ""}"><i>${r.plek}</i><b>${esc(r.naam)}</b><em>${nr(r.n)} ${eenheid}</em></li>`).join("")}</ol></div>` : "";
      k.push({ id: "samen", kleur: "bos", vesti: { t: "kijkt.lacht", plek: "zij" }, wolk: "Samen hebben we heel wat sporen gelezen.",
        kop: `Zo speelde heel Vestigia in ${JAAR}`,
        html: `<ul class="wr-rij twee"><li><b>${nr(s.casussen)}</b><span>casussen</span></li><li><b>${nr(s.spelers)}</b><span>spelers</span></li></ul>
          ${top("Wie speelden de meeste dagen?", s.top_dag, "dagen")}${top("Wie hadden de langste reeks?", s.top_reeks, "dagen")}${top("Wie verzamelden de meeste platen?", s.top_platen, "platen")}` });
      if (s.lastig && s.lastig.soort) k.push({ id: "lastig", kleur: "paars", vesti: { t: "heel.teleurgesteld", plek: "links" }, soort: "gedachte",
        wolk: "Deze vond ik zelf ook pittig…",
        kop: "Deze dagcasus vond bijna iedereen lastig",
        html: `<p class="wr-soort">${esc(soort(s.lastig.soort))}</p>
          <div class="wr-ring" style="--p:${s.lastig.pct}" aria-hidden="true"><b>${s.lastig.pct}%</b></div>
          <p class="wr-lead">Op ${datum(s.lastig.dag)} had maar ${s.lastig.pct}% van de ${nr(s.lastig.spelers)} spelers hem goed.</p>` });
    }

    const eigen = ik && ik.genoeg;
    k.push({ id: "slot", kleur: "mint", vesti: { t: "heel.juicht", plek: "midden" }, extra: ["stralen", "confetti"],
      wolk: eerder ? "Tot ziens in de app!" : "Vanaf nu ga je me vaker terugzien. Ik help je waar nodig, maar ik hou je ook in de gaten!",
      kop: `Dat was ${JAAR}!`,
      html: `${eigen ? samenvatting(d) : `<h2 class="wr-titel">Op naar ${JAAR + 1}!</h2>`}
        <div class="wr-knoppen">${eigen ? `<button class="btn" id="wrDeel" type="button">Deel je Wrapped</button>` : ""}
          <button class="btn ghost" id="wrKlaar" type="button">Klaar</button></div>
        <p class="wr-fijn" id="wrDeelUit" role="status"></p>` });
    return k;
  }
  function samenvatting(d){
    const ik = d.ik, nm = nemesis(ik.verward);
    return `<div class="wr-sam"><p class="wr-type klein">${esc(spelerstype(ik).naam)}</p><ul class="wr-rij vier">
        <li><b>${nr(ik.casussen)}</b><span>casussen</span></li><li><b>${nr(ik.reeks)}</b><span>dagen op rij</span></li>
        <li><b>${nr(ik.platen)}</b><span>platen</span></li><li><b>${ik.casussen ? Math.round(100 * ik.gewonnen / ik.casussen) : 0}%</b><span>goed</span></li></ul>
      ${ik.favoriet ? `<p>Herkende je het vaakst: <b>${esc(soort(ik.favoriet.soort))}</b></p>` : ""}
      ${nm ? `<p>Haalde je het vaakst door elkaar: <b>${esc(soort(nm.soort))}</b></p>` : ""}</div>`;
  }

  /* ---------- tonen ---------- */
  let el = null, lijst = [], i = 0, terugFocus = null;
  function bouw(){
    el = document.createElement("div");
    el.id = "wrapped"; el.className = "wrapped";
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", `Vestigia Wrapped ${JAAR}`);
    el.innerHTML = `<div class="wr-kaart" aria-live="polite"></div>
      <div class="wr-balk" aria-hidden="true"></div>
      <button class="iconbtn wr-dicht" id="wrDicht" type="button" aria-label="Wrapped sluiten"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg></button>
      <button class="wr-tik terug" type="button" aria-label="Vorige kaart"></button>
      <button class="wr-tik verder" type="button" aria-label="Volgende kaart"></button>`;
    document.body.appendChild(el);
    el.querySelector(".wr-tik.terug").onclick = () => ga(i - 1);
    el.querySelector(".wr-tik.verder").onclick = () => ga(i + 1);
    $("wrDicht").onclick = sluit;
    /* op het hele document, want de focus kan op body vallen (de knop ‘verder’ verdwijnt op de laatste kaart) */
    document.addEventListener("keydown", e => {
      if (!el || el.hidden) return;
      if (e.key === "Escape"){ e.preventDefault(); sluit(); }
      else if (e.key === "ArrowRight"){ e.preventDefault(); ga(i + 1); }
      else if (e.key === "ArrowLeft"){ e.preventDefault(); ga(i - 1); }
      else if (e.key === "Tab"){   /* de focus blijft in de Wrapped */
        const f = [...el.querySelectorAll("button")].filter(b => b.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); }
      }
    });
  }
  /* "heel.juicht" → de tekening; onbekend → Vesti die uitlegt */
  function vestiSvg(t){
    if (typeof VESTI_TEKENING === "undefined") return "";
    const [g, n] = String(t).split(".");
    return (VESTI_TEKENING[g] && VESTI_TEKENING[g][n]) || VESTI_TEKENING.heel.uitleg;
  }
  const KLEUREN_CONFETTI = ["#f2c94c", "#ff7a59", "#8fd8f5", "#b69cff", "#f49ac1", "#7fd39b"];
  function confetti(){
    return `<div class="wr-confetti" aria-hidden="true">${Array.from({ length: 28 }, (_, j) =>
      `<i style="--x:${(j * 37) % 100}%;--d:${(j % 7) * .23}s;--t:${2.6 + (j % 5) * .45}s;--r:${(j * 53) % 360}deg;background:${KLEUREN_CONFETTI[j % KLEUREN_CONFETTI.length]}"></i>`).join("")}</div>`;
  }
  function podium(c){
    const v = c.vesti || { t: "heel.uitleg", plek: "rechts" };
    const ex = c.extra || [];
    return `<div class="wr-podium plek-${v.plek}" aria-hidden="true">
      ${ex.includes("stralen") ? `<div class="wr-stralen"></div>` : ""}
      ${c.wolk ? `<div class="wr-wolk ${c.soort === "gedachte" ? "gedachte" : "spraak"}">${esc(c.wolk)}</div>` : ""}
      <div class="wr-vesti"><div class="wr-teken">${vestiSvg(v.t)}</div>
        ${v.plek === "silhouet" ? `<span class="wr-vraag">?</span>` : ""}</div>
    </div>${ex.includes("confetti") ? confetti() : ""}`;
  }
  /* Het wolkje bij Vesti, maar nooit over hem heen (Tom, 24 november).
     1. Liefst boven zijn hoofd, met het puntje omlaag naar hem toe, schuin naar de kant waar plek is.
     2. Is daar te weinig ruimte, dan wordt Vesti iets kleiner (hooguit tot 70%), zodat het wolkje er toch boven past.
     3. Lukt dat ook niet (heel klein scherm), dan naast hem, aan de kant met de meeste ruimte, met het puntje opzij.
     Rekent met offset* (zonder de bewegingen), zodat het klopt terwijl Vesti nog binnenkomt. */
  function plaatsWolk(k){
    const pod = k.querySelector(".wr-podium"), w = k.querySelector(".wr-wolk"), v = k.querySelector(".wr-vesti");
    if (!pod || !w || !v) return;
    const plek = [...pod.classList].find(c => c.startsWith("plek-")).slice(5);
    const marge = 12, P = { w: pod.offsetWidth, h: pod.offsetHeight };
    const vak = () => {   // Vesti's vak in het podium; midden en onder staan met translateX gecentreerd, offsetLeft telt dat niet mee
      const r = { x: v.offsetLeft, y: v.offsetTop, w: v.offsetWidth, h: v.offsetHeight };
      if (plek === "midden" || plek === "silhouet") r.x -= r.w * .5; else if (plek === "onder") r.x -= r.w * .46;
      if (plek === "zij") r.x += r.w * .12;   // gekanteld: de tekening vult het vak links niet helemaal
      return r;
    };
    w.style.maxWidth = ""; v.style.height = "";
    let V = vak(), ww = w.offsetWidth, wh = w.offsetHeight;
    const nodig = wh + 16;   // ruimte boven Vesti voor wolkje + puntje
    if (V.y < nodig && plek !== "onder"){
      const nieuw = V.h - (nodig - V.y);
      if (nieuw >= V.h * .7){ v.style.height = nieuw + "px"; V = vak(); }
    }
    let x, y, staart;
    const rechtsVanMidden = V.x + V.w / 2 > P.w / 2;
    if (V.y >= nodig || plek === "onder"){
      /* boven zijn hoofd; het puntje wijst naar zijn hoofd (ongeveer 45% van links, gespiegeld 55%) */
      const hx = V.x + V.w * (plek === "links" ? .55 : .45);
      y = V.y - wh - 12 + (plek === "onder" ? V.h * .08 : 0);
      if (rechtsVanMidden || plek === "midden" || plek === "silhouet"){ staart = "onder-r"; x = hx - ww + 28; }
      else { staart = "onder"; x = hx - 28; }
    } else {
      /* naast hem, waar de meeste ruimte is; zo nodig smaller */
      const links = V.x - marge - 14, rechts = P.w - (V.x + V.w) - marge - 14;
      const kant = links >= rechts ? "links" : "rechts", ruimte = Math.max(links, rechts);
      if (ww > ruimte){ w.style.maxWidth = Math.max(110, ruimte) + "px"; ww = w.offsetWidth; wh = w.offsetHeight; }
      y = V.y + V.h * .12;
      if (kant === "links"){ staart = "rechts"; x = V.x - ww - 14; } else { staart = "links"; x = V.x + V.w + 14; }
    }
    x = Math.max(marge, Math.min(x, P.w - ww - marge));
    Object.assign(w.style, { left: x + "px", top: y + "px", right: "auto", bottom: "auto" });
    w.dataset.staart = staart;
  }
  function ga(n){
    if (n < 0) return;
    if (n >= lijst.length){ sluit(); return; }
    i = n;
    const c = lijst[i];
    el.className = "wrapped wr-k-" + c.kleur;
    el.dataset.kaart = c.id;
    el.querySelector(".wr-balk").innerHTML = lijst.map((_, j) => `<i class="${j < i ? "klaar" : j === i ? "nu" : ""}"></i>`).join("");
    const k = el.querySelector(".wr-kaart");
    k.innerHTML = `<div class="wr-in">${c.kop ? `<p class="wr-kop">${esc(c.kop)}</p>` : ""}${c.html}</div>${podium(c)}`;
    k.classList.remove("wr-nieuw", "wr-open-cadeau"); void k.offsetWidth; k.classList.add("wr-nieuw");
    plaatsWolk(k);
    /* op de laatste kaart: de knoppen zelf, en geen tikvlak eroverheen */
    el.classList.toggle("wr-laatste", i === lijst.length - 1);
    const deel = $("wrDeel"); if (deel) deel.onclick = deelBeeld;
    const klaar = $("wrKlaar"); if (klaar) klaar.onclick = sluit;
  }
  function laden(tekst, met){
    el.className = "wrapped wr-k-bos"; el.dataset.kaart = "laden";   // (className wist ook wr-laatste van het cadeautje)
    el.querySelector(".wr-balk").innerHTML = "";
    el.querySelector(".wr-kaart").classList.remove("wr-open-cadeau");
    el.querySelector(".wr-kaart").innerHTML = `<div class="wr-in"><p class="wr-kop">Vestigia Wrapped ${JAAR}</p><h2 class="wr-titel">${tekst}</h2>
      ${met ? `<div class="wr-knoppen"><button class="btn" id="wrOpnieuw" type="button">Probeer opnieuw</button></div>` : ""}</div>
      ${met ? podium({ vesti: { t: "heel.slaapt", plek: "rechts" } }) : ""}`;
    if (met) $("wrOpnieuw").onclick = () => open();
  }
  /* De aankondiging: wie de Wrapped nog niet zag, krijgt eerst een cadeautje om uit te pakken. Intussen haalt de app
     je gegevens op; na het uitpakken begint het silhouet van Vesti. Wie hem al zag (via het menu), gaat meteen door. */
  const CADEAU = `<svg class="wr-cadeau" viewBox="0 0 200 200" aria-hidden="true">
    <ellipse cx="100" cy="186" rx="62" ry="7" fill="#000" opacity=".18"/>
    <g class="wr-doos"><rect x="38" y="92" width="124" height="90" rx="8" fill="#7651c8"/><rect x="38" y="92" width="124" height="90" rx="8" fill="url(#wrGlans)"/>
      <rect x="90" y="92" width="20" height="90" fill="#f2c94c"/><rect x="38" y="120" width="124" height="14" fill="#f2c94c" opacity=".0"/></g>
    <g class="wr-deksel"><rect x="30" y="70" width="140" height="28" rx="7" fill="#8d67e0"/><rect x="88" y="70" width="24" height="28" fill="#f2c94c"/>
      <path d="M100 70c-10-22-38-26-38-10 0 9 20 10 38 10zM100 70c10-22 38-26 38-10 0 9-20 10-38 10z" fill="#f7d45a" stroke="#e0a92c" stroke-width="3"/>
      <circle cx="100" cy="68" r="7" fill="#e0a92c"/></g>
    <defs><linearGradient id="wrGlans" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  </svg>`;
  function cadeau(){
    el.className = "wrapped wr-k-nacht"; el.dataset.kaart = "cadeau";
    el.querySelector(".wr-balk").innerHTML = "";
    el.classList.add("wr-laatste");   // geen tikvlakken: je pakt uit met de knop (of door op het cadeautje te tikken)
    const k = el.querySelector(".wr-kaart");
    k.innerHTML = `<div class="wr-in wr-midden"><p class="wr-kop">Vestigia Wrapped ${JAAR}</p>
        <h2 class="wr-titel">Je jaar is ingepakt!</h2>
        <p class="wr-lead">Je eerste seizoen in Vestigia: je casussen, je platen, je nemesis… en een verrassing.</p></div>
      <div class="wr-podium plek-cadeau"><button class="wr-pakje" id="wrPakje" type="button" aria-label="Pak je Wrapped uit">${CADEAU}</button>
        <div class="wr-knoppen midden"><button class="btn" id="wrUitpakken" type="button">Uitpakken</button></div></div>`;
    k.classList.remove("wr-nieuw"); void k.offsetWidth; k.classList.add("wr-nieuw");
    return new Promise(ok => {
      const pak = () => { $("wrUitpakken").disabled = true; k.classList.add("wr-open-cadeau"); setTimeout(ok, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900); };
      $("wrUitpakken").onclick = pak; $("wrPakje").onclick = pak;
      $("wrUitpakken").focus({ preventScroll: true });
    });
  }
  async function open(){
    terugFocus = document.activeElement;
    if (!el) bouw();
    el.hidden = false;
    document.documentElement.classList.add("wr-open");
    const ophalen = haal();
    ophalen.catch(() => {});
    if (!lees(GEZIEN)){ await cadeau(); if (!el || el.hidden) return; }
    laden("Even je jaar bij elkaar zoeken…");
    $("wrDicht").focus({ preventScroll: true });
    try { data = await ophalen; }
    catch(e){ if (el && !el.hidden) laden("Ik kan je Wrapped nu niet ophalen. Heb je internet?", true); return; }
    if (!el || el.hidden) return;
    lijst = kaarten(data);
    /* gezien: Vesti gaat aan (ook op je andere apparaten) en stelt zich niet nog eens apart voor */
    zet(GEZIEN, "1"); zet(INTRO, "1");
    document.documentElement.classList.add("vesti-aan");
    if (typeof online !== "undefined" && online.syncSoon) online.syncSoon();
    ga(0);
  }
  let klaarBelofte = null;
  function sluit(){
    if (!el) return;
    el.hidden = true;
    document.documentElement.classList.remove("wr-open");
    if (terugFocus && terugFocus.focus) terugFocus.focus({ preventScroll: true });
    if (klaarBelofte){ klaarBelofte(); klaarBelofte = null; }
  }

  /* ---------- delen: een afbeelding van je samenvatting (1080 × 1350, alleen je eigen cijfers) ---------- */
  async function beeld(){
    const ik = data.ik, nm = nemesis(ik.verward), W = 1080, H = 1350;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d");
    const verloop = g.createLinearGradient(0, 0, W, H); verloop.addColorStop(0, "#6c4ab6"); verloop.addColorStop(.55, "#3d5f8f"); verloop.addColorStop(1, "#24402f");
    g.fillStyle = verloop; g.fillRect(0, 0, W, H);
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch(e){}
    const tekst = (t, x, y, px, kleur, gewicht = 600, font = "Rubik", uitlijn = "left") => {
      g.font = `${gewicht} ${px}px ${font}, "Segoe UI", Helvetica, Arial, sans-serif`; g.fillStyle = kleur; g.textAlign = uitlijn; g.fillText(t, x, y); };
    tekst("VESTIGIA WRAPPED " + JAAR, 80, 130, 38, "#edfbe2", 600, "Poppins");
    const naam = mijnNaam(); if (naam) tekst(naam, 80, 210, 72, "#ffffff", 700);
    tekst(spelerstype(ik).naam, 80, naam ? 262 : 210, 40, "#8fd8f5", 600);
    const cijfers = [[nr(ik.casussen), "casussen"], [nr(ik.reeks), "dagen op rij"], [nr(ik.platen), "platen"],
      [(ik.casussen ? Math.round(100 * ik.gewonnen / ik.casussen) : 0) + "%", "goed"]];
    cijfers.forEach(([n, l], j) => {
      const x = 80 + (j % 2) * 470, y = 310 + Math.floor(j / 2) * 230;
      g.fillStyle = "rgba(255,255,255,.13)"; g.beginPath(); g.roundRect ? g.roundRect(x, y, 450, 200, 28) : g.rect(x, y, 450, 200); g.fill();
      tekst(n, x + 36, y + 115, 96, "#ffffff", 700);
      tekst(l, x + 38, y + 170, 36, "#edfbe2", 500, "Karla");
    });
    let y = 840;
    if (ik.favoriet){ tekst("Herkende ik het vaakst", 80, y, 34, "#f2c94c", 600, "Poppins"); tekst(soort(ik.favoriet.soort), 80, y + 60, 54, "#ffffff", 600); y += 140; }
    if (nm){ tekst("Haalde ik het vaakst door elkaar", 80, y, 34, "#f2c94c", 600, "Poppins"); tekst(soort(nm.soort), 80, y + 60, 54, "#ffffff", 600); y += 140; }
    tekst("tomhuijnen.github.io/Vestigia", 80, H - 70, 32, "#edfbe2", 500, "Karla");
    /* Vesti rechtsonder */
    try {
      const svg = vestiSvg("heel.juicht").replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="467" ');
      const img = new Image();
      await new Promise((ok, mis) => { img.onload = ok; img.onerror = mis; img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); });
      g.drawImage(img, W - 470, H - 560, 420, 467);
    } catch(e){}
    return new Promise(ok => c.toBlob(ok, "image/png"));
  }
  async function deelBeeld(){
    const uit = $("wrDeelUit");
    try {
      const blob = await beeld();
      if (!blob) throw new Error("geen beeld");
      const bestand = new File([blob], `vestigia-wrapped-${JAAR}.png`, { type: "image/png" });
      const tekst = `Mijn Vestigia Wrapped ${JAAR}: ${data.ik.casussen} casussen gespeeld. Speel mee: https://tomhuijnen.github.io/Vestigia/`;
      if (navigator.canShare && navigator.canShare({ files: [bestand] })){
        try { await navigator.share({ files: [bestand], text: tekst }); } catch(e){ if (e && e.name === "AbortError") return; throw e; }
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = bestand.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      if (uit) uit.textContent = "De afbeelding staat in je downloads.";
    } catch(e){ if (uit) uit.textContent = "Delen lukte niet. Maak anders een schermafbeelding van deze kaart."; }
  }

  /* ---------- vanzelf, menu ---------- */
  /* vanzelf alleen voor wie in 2026 speelde (iets in het logboek of een plaat) */
  function speeldeAl(){
    const st = store.get();
    return (st.log || []).some(e => (e.t || 0) < VANAF) || Object.keys(st.dex || {}).length > 0;
  }
  function vanzelfNodig(){
    if (demo) return u.get("vanzelf") === "1";
    return Date.now() >= VANAF && Date.now() < VANZELF_TOT && !lees(GEZIEN) && speeldeAl();
  }
  if (typeof Wachtrij !== "undefined") Wachtrij.voeg({ id: "wrapped", prio: 0.8, kan: vanzelfNodig,
    toon: () => new Promise(ok => { klaarBelofte = ok; open(); }) });
  function menu(){
    const rij = $("menuWrappedRij"); if (rij) rij.hidden = !beschikbaar();
  }
  menu();
  if (demo && u.get("open") !== "0" && u.get("vanzelf") !== "1") setTimeout(() => open(), 400);

  return { open, sluit, beschikbaar, nemesis, beeld: () => data && data.ik && data.ik.genoeg ? beeld() : Promise.resolve(null), menu };
})();
