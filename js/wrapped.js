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
   Een kaart toevoegen of weghalen: zie kaarten() hieronder; elke kaart is { id, kleur, vesti, wolk, html }.
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
     kleur: groen · donker · mint · oker · nacht (zie .wr-k-… in css/vestigia.css)
     vesti: uitleg · juicht · teleurgesteld · slaapt (de tekeningen in data/vesti.js) */
  function kaarten(d){
    const ik = d.ik, s = d.samen || {}, k = [];
    const eerder = !!lees(GEZIEN);
    k.push({ id: "hoi", kleur: "groen", vesti: "uitleg",
      wolk: eerder ? "Daar ben ik weer! Nog een keer terugkijken?" : "Zullen we samen terugkijken?",
      html: `<p class="wr-boven">Vestigia Wrapped ${JAAR}</p>
        <h2>${eerder ? "Hoi, daar ben je weer!" : "Hoi! Ik ben Vesti."}</h2>
        <p>${eerder ? "Ik ben Vesti, je veldgids. Hier is jouw jaar nog een keer." :
          "Ik ben je nieuwe veldgids in Vestigia. Ik heb jouw eerste seizoen bijgehouden: elke casus, elke plaat en elke soort die je door elkaar haalde."}</p>
        <p class="wr-fijn">Tik rechts voor de volgende kaart, links om terug te gaan.</p>` });

    if (ik && ik.genoeg){
      const pct = ik.casussen ? Math.round(100 * ik.gewonnen / ik.casussen) : 0;
      k.push({ id: "cijfers", kleur: "donker", vesti: "juicht",
        wolk: pct >= 80 ? "Wauw, bijna alles goed!" : pct >= 50 ? "Meer goed dan fout. Netjes!" : "Elke foute gok leert je iets.",
        html: `<p class="wr-boven">Je jaar in cijfers</p>
          <p class="wr-groot">${nr(ik.casussen)}</p><p class="wr-onder">casussen gespeeld</p>
          <ul class="wr-rij"><li><b>${nr(ik.gewonnen)}</b><span>goed gedetermineerd</span></li>
            <li><b>${pct}%</b><span>goed</span></li><li><b>${nr(ik.dagen)}</b><span>${ik.dagen === 1 ? "dagcasus" : "dagcasussen"}</span></li></ul>` });
      if (ik.reeks > 0) k.push({ id: "reeks", kleur: "oker", vesti: "juicht",
        wolk: ik.reeks >= 14 ? "Zelfs ik vergeet weleens een dag." : ik.reeks >= 7 ? "Een hele week! Knap volgehouden." : "Elke dag een beetje, zo word je veldbioloog.",
        html: `<p class="wr-boven">Je langste reeks</p>
          <p class="wr-groot">${nr(ik.reeks)}</p><p class="wr-onder">${ik.reeks === 1 ? "dag" : "dagen op rij"} de dagcasus gespeeld</p>` });
      if (ik.favoriet) k.push({ id: "favoriet", kleur: "mint", vesti: "juicht",
        wolk: "Die herken je inmiddels met je ogen dicht.",
        html: `<p class="wr-boven">Je favoriete soort</p>
          <p class="wr-soort">${esc(soort(ik.favoriet.soort))}</p>
          <p class="wr-onder">${keer(ik.favoriet.n)} goed gedetermineerd</p>` });
      const nm = nemesis(ik.verward);
      k.push(nm ? { id: "nemesis", kleur: "nacht", vesti: "teleurgesteld",
        wolk: "Ik haal ze zelf ook weleens door elkaar, hoor.",
        html: `<p class="wr-boven">Je nemesis</p>
          <p class="wr-soort">${esc(soort(nm.soort))}</p>
          <p class="wr-onder">${keer(nm.n)} verward met <b>${esc(soort(nm.met))}</b></p>
          <p class="wr-fijn">In Statistieken staat ‘Vaakst verward’, met een knop om juist deze soorten te oefenen.</p>` }
        : { id: "nemesis", kleur: "nacht", vesti: "juicht", wolk: "Geen nemesis? Dan ben jij die van mij.",
        html: `<p class="wr-boven">Je nemesis</p><p class="wr-soort">Geen!</p>
          <p class="wr-onder">Je haalde geen soorten door elkaar die op elkaar lijken.</p>` });
      if (ik.beste){
        const b = ik.beste, wat = b.soort || (dailyTarget(b.dag) || {}).id;
        k.push({ id: "beste", kleur: "groen", vesti: "juicht", wolk: b.pogingen <= 1 ? "In één keer! Ik zag het aan je gezicht." : "Die ging je goed af.",
          html: `<p class="wr-boven">Je beste dagcasus</p>
            ${wat ? `<p class="wr-soort">${esc(soort(wat))}</p>` : ""}
            <p class="wr-onder">${datum(b.dag)}, ${b.expert ? "expert" : "klassiek"}: ${b.pogingen <= 1 ? "in één poging" : `in ${b.pogingen} pogingen`}
              met ${b.waarnemingen === 1 ? "1 waarneming" : `${b.waarnemingen} waarnemingen`}</p>
            <p class="wr-groot klein">${nr(b.punten)} <small>punten</small></p>` });
      }
      if (ik.platen > 0){
        const z = ik.zeldzaamst;
        k.push({ id: "platen", kleur: "oker", vesti: "uitleg", wolk: "Mijn eigen Vestiarium is nog lang niet zo vol.",
          html: `<p class="wr-boven">Je ${NAAM.vestiarium}</p>
            <p class="wr-groot">${nr(ik.platen)}</p><p class="wr-onder">${ik.platen === 1 ? "plaat" : "platen"} verzameld</p>
            ${z ? `<div class="wr-blok"><span class="caps">Je zeldzaamste plaat</span><b>${esc(soort(z.soort))}</b>
              <span>${z.spelers <= 1 ? "Jij bent de enige die hem heeft!" : `Maar ${nr(z.spelers)} spelers hebben hem.`}</span></div>` : ""}` });
      }
      if (ik.meer_dan_pct != null && ik.spelers >= 5) k.push({ id: "vergelijk", kleur: "donker",
        vesti: ik.meer_dan_pct >= 50 ? "juicht" : "uitleg",
        wolk: ik.meer_dan_pct >= 50 ? "Jij bent een echte veldwerker." : "Volgend jaar haal je ze in.",
        html: `<p class="wr-boven">Jij en de rest</p>
          <p class="wr-onder">Je speelde meer casussen dan</p><p class="wr-groot">${ik.meer_dan_pct}%</p>
          <p class="wr-onder">van de ${nr(ik.spelers)} spelers van ${JAAR}</p>` });
    } else {
      k.push({ id: "nognietgenoeg", kleur: "donker", vesti: "teleurgesteld",
        wolk: "Volgend jaar maak ik er een voor jou!",
        html: ik ? `<p class="wr-boven">Jouw jaar</p><p class="wr-groot">${nr(ik.casussen)}</p>
            <p class="wr-onder">${ik.casussen === 1 ? "casus" : "casussen"} gespeeld in ${JAAR}</p>
            <p>Vanaf ${ik.drempel || 5} casussen maak ik je eigen overzicht: je favoriete soort, je nemesis en je platen. Volgend jaar dus!</p>`
          : `<p class="wr-boven">Jouw jaar</p><h2>Nog geen naam</h2>
            <p>Je eigen Wrapped hoort bij je spelersnaam. Kies er een in de ranglijst, dan houd ik volgend jaar alles voor je bij.</p>` });
    }

    /* het gezamenlijke deel */
    if (s && s.casussen){
      const ik_ = mijnNaam();
      const top = (titel, rij, eenheid) => rij && rij.length ? `<div class="wr-top"><span class="caps">${titel}</span><ol>${rij.map(r =>
        `<li class="${r.naam === ik_ ? "jij" : ""}"><i>${r.plek}</i><b>${esc(r.naam)}</b><span>${nr(r.n)} ${eenheid}</span></li>`).join("")}</ol></div>` : "";
      k.push({ id: "samen", kleur: "groen", vesti: "uitleg", wolk: "Samen hebben we heel wat sporen gelezen.",
        html: `<p class="wr-boven">Vestigia in ${JAAR}</p>
          <ul class="wr-rij"><li><b>${nr(s.casussen)}</b><span>casussen</span></li><li><b>${nr(s.spelers)}</b><span>spelers</span></li></ul>
          ${top("Meeste dagen gespeeld", s.top_dag, "dagen")}${top("Langste reeks", s.top_reeks, "dagen")}${top("Meeste platen", s.top_platen, "platen")}` });
      if (s.lastig && s.lastig.soort) k.push({ id: "lastig", kleur: "nacht", vesti: "teleurgesteld",
        wolk: "Deze vond ik zelf ook pittig.",
        html: `<p class="wr-boven">De lastigste dagcasus</p><p class="wr-soort">${esc(soort(s.lastig.soort))}</p>
          <p class="wr-onder">${datum(s.lastig.dag)}: maar ${s.lastig.pct}% van de ${nr(s.lastig.spelers)} spelers had hem goed</p>` });
    }

    const eigen = ik && ik.genoeg;
    k.push({ id: "slot", kleur: "mint", vesti: "juicht",
      wolk: eerder ? "Tot ziens in de app!" : "Vanaf nu loop ik met je mee in de app.",
      html: `<p class="wr-boven">Tot volgend jaar</p>
        ${eigen ? samenvatting(d, false) : `<h2>Op naar ${JAAR + 1}!</h2>`}
        <div class="wr-knoppen">${eigen ? `<button class="btn" id="wrDeel" type="button">Deel je Wrapped</button>` : ""}
          <button class="btn ghost" id="wrKlaar" type="button">Klaar</button></div>
        <p class="wr-fijn" id="wrDeelUit" role="status"></p>` });
    return k;
  }
  function samenvatting(d){
    const ik = d.ik, nm = nemesis(ik.verward);
    return `<div class="wr-sam"><ul class="wr-rij vier">
        <li><b>${nr(ik.casussen)}</b><span>casussen</span></li><li><b>${nr(ik.reeks)}</b><span>dagen op rij</span></li>
        <li><b>${nr(ik.platen)}</b><span>platen</span></li><li><b>${ik.casussen ? Math.round(100 * ik.gewonnen / ik.casussen) : 0}%</b><span>goed</span></li></ul>
      ${ik.favoriet ? `<p>Favoriet: <b>${esc(soort(ik.favoriet.soort))}</b></p>` : ""}
      ${nm ? `<p>Nemesis: <b>${esc(soort(nm.soort))}</b></p>` : ""}</div>`;
  }

  /* ---------- tonen ---------- */
  let el = null, lijst = [], i = 0, terugFocus = null;
  function bouw(){
    el = document.createElement("div");
    el.id = "wrapped"; el.className = "wrapped";
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", `Vestigia Wrapped ${JAAR}`);
    el.innerHTML = `<div class="wr-balk" aria-hidden="true"></div>
      <button class="iconbtn wr-dicht" id="wrDicht" type="button" aria-label="Wrapped sluiten"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg></button>
      <div class="wr-kaart" aria-live="polite"></div>
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
  const vestiSvg = pose => typeof VESTI_TEKENING !== "undefined" ? (VESTI_TEKENING.heel[pose] || VESTI_TEKENING.heel.uitleg) : "";
  function ga(n){
    if (n < 0) return;
    if (n >= lijst.length){ sluit(); return; }
    i = n;
    const c = lijst[i];
    el.className = "wrapped wr-k-" + c.kleur;
    el.dataset.kaart = c.id;
    el.querySelector(".wr-balk").innerHTML = lijst.map((_, j) => `<i class="${j < i ? "klaar" : j === i ? "nu" : ""}"></i>`).join("");
    const k = el.querySelector(".wr-kaart");
    k.innerHTML = `<div class="wr-in">${c.html}</div>
      <div class="wr-vesti" aria-hidden="true"><div class="wr-wolk">${esc(c.wolk)}</div>${vestiSvg(c.vesti)}</div>`;
    k.classList.remove("wr-nieuw"); void k.offsetWidth; k.classList.add("wr-nieuw");
    /* kleine schermen: past de tekst niet boven Vesti en zijn wolkje, dan wordt Vesti kleiner */
    k.classList.remove("wr-krap");
    const tekstOnder = k.querySelector(".wr-in").getBoundingClientRect().bottom, w = k.querySelector(".wr-wolk");
    if (w && tekstOnder > w.getBoundingClientRect().top - 8) k.classList.add("wr-krap");
    /* op de laatste kaart: de knoppen zelf, en geen tikvlak eroverheen */
    el.classList.toggle("wr-laatste", i === lijst.length - 1);
    const deel = $("wrDeel"); if (deel) deel.onclick = deelBeeld;
    const klaar = $("wrKlaar"); if (klaar) klaar.onclick = sluit;
  }
  function laden(tekst, met){
    el.className = "wrapped wr-k-groen"; el.dataset.kaart = "laden";
    el.querySelector(".wr-balk").innerHTML = "";
    el.querySelector(".wr-kaart").innerHTML = `<div class="wr-in"><p class="wr-boven">Vestigia Wrapped ${JAAR}</p><h2>${tekst}</h2>
      ${met ? `<div class="wr-knoppen"><button class="btn" id="wrOpnieuw" type="button">Probeer opnieuw</button></div>` : ""}</div>
      <div class="wr-vesti" aria-hidden="true">${vestiSvg(met ? "slaapt" : "uitleg")}</div>`;
    if (met) $("wrOpnieuw").onclick = () => open();
  }
  async function open(){
    terugFocus = document.activeElement;
    if (!el) bouw();
    el.hidden = false;
    document.documentElement.classList.add("wr-open");
    laden("Even je jaar bij elkaar zoeken…");
    $("wrDicht").focus({ preventScroll: true });
    try { data = await haal(); }
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
    const verloop = g.createLinearGradient(0, 0, W, H); verloop.addColorStop(0, "#4b7a5e"); verloop.addColorStop(1, "#24402f");
    g.fillStyle = verloop; g.fillRect(0, 0, W, H);
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch(e){}
    const tekst = (t, x, y, px, kleur, gewicht = 600, font = "Rubik", uitlijn = "left") => {
      g.font = `${gewicht} ${px}px ${font}, "Segoe UI", Helvetica, Arial, sans-serif`; g.fillStyle = kleur; g.textAlign = uitlijn; g.fillText(t, x, y); };
    tekst("VESTIGIA WRAPPED " + JAAR, 80, 130, 38, "#edfbe2", 600, "Poppins");
    const naam = mijnNaam(); if (naam) tekst(naam, 80, 210, 72, "#ffffff", 700);
    const cijfers = [[nr(ik.casussen), "casussen"], [nr(ik.reeks), "dagen op rij"], [nr(ik.platen), "platen"],
      [(ik.casussen ? Math.round(100 * ik.gewonnen / ik.casussen) : 0) + "%", "goed"]];
    cijfers.forEach(([n, l], j) => {
      const x = 80 + (j % 2) * 470, y = 290 + Math.floor(j / 2) * 230;
      g.fillStyle = "rgba(20,36,27,.45)"; g.beginPath(); g.roundRect ? g.roundRect(x, y, 450, 200, 28) : g.rect(x, y, 450, 200); g.fill();
      tekst(n, x + 36, y + 115, 96, "#ffffff", 700);
      tekst(l, x + 38, y + 170, 36, "#edfbe2", 500, "Karla");
    });
    let y = 820;
    if (ik.favoriet){ tekst("Favoriet", 80, y, 34, "#e2b84e", 600, "Poppins"); tekst(soort(ik.favoriet.soort), 80, y + 60, 54, "#ffffff", 600); y += 140; }
    if (nm){ tekst("Nemesis", 80, y, 34, "#e2b84e", 600, "Poppins"); tekst(soort(nm.soort), 80, y + 60, 54, "#ffffff", 600); y += 140; }
    tekst("tomhuijnen.github.io/Vestigia", 80, H - 70, 32, "#edfbe2", 500, "Karla");
    /* Vesti rechtsonder */
    try {
      const svg = vestiSvg("juicht").replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="467" ');
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
