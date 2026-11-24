/* Vestigia – ‘Je week in Vestigia’ en het league-kroontje (update 25, besloten 12 november 2026)
   Weekpop-up
   - Eén pop-up, de eerste keer dat je de app opent in een nieuwe week, via de wachtrij (prio 1,8: na dwaalgast, duel
     en levels; vóór advent, de pushvraag en de avatar). Nooit gestapeld.
   - Alleen als je vorige week punten had in de weekranglijst. Alleen op maandag of dinsdag: is hij dan niet aan de
     beurt geweest, dan komt hij woensdag niet meer.
   - Inhoud: je eindplaats in de algemene weekranglijst en in je leagues (hooguit 2, daaronder ‘en nog X leagues’).
     Top 10: je plaats. Daarbuiten: ‘Helaas, je eindigde buiten de top 10’.
   - Verschil met de week ervoor (↑2, ↓1, =) alleen als je ook in die week geplaatst was (punten had), en alleen bij
     een getoonde plaats. Bij een league telt de week ervoor in die league.
   - Mijlpalen voor de weekranglijst (podium, weekwinnaar) staan in deze pop-up en hun eikels vliegen vanuit hier naar
     het saldo. Komt de pop-up niet meer (woensdag), dan als gewone melding.
   - Weekprijs (update 58, Tom 15 november 2026): de top 10 van de algemene weekranglijst krijgt eikels
     (1e 50, 2e 35, 3e 25, 4e t/m 10e 10; gelijke stand = dezelfde prijs). De server telt ze mee in het saldo
     (techniek/supabase-033-weekprijs.sql); deze pop-up feliciteert en laat ze naar het saldo vliegen. Geen XP.
     Leagues geven geen eikels, alleen het kroontje.
   Bekertje (update 58)
   - Alleen in je eigen rij, bij Iedereen + Deze week, naast je punten. Tikken toont wat je krijgt voor je plaats van
     nu, de hele prijzentabel en (buiten de top 10) hoeveel punten je nog nodig hebt. Anderen zien jouw bekertje niet.
   League-kroontje
   - De top 3 van vorige week in een league (met punten, gedeelde plaatsen tellen mee: 1, 2, 2, 4) krijgt deze hele
     week een kroontje in goud, zilver of brons achter de naam in die league. Anders dan de kroon in het plaatsnummer:
     die hoort bij de stand van nu.
   Rekent alles uit met de bestaande ranglijstfuncties (leaderboard_range en league_board); geen SQL nodig.
   Voorbeeld: ?week=demo (eventueel &plek=12 voor buiten de top 10, &plek=1 voor weekwinnaar). */
"use strict";

const Week = (() => {
  const K = { gezien: "vestigia:weekPop", mijl: "vestigia:weekMijl", kroon: "vestigia:lgKroon" };
  const lees = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const zet = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const p = () => online.enabled ? online.player() : null;
  const wacht = ms => new Promise(r => setTimeout(r, ms));
  let demo = false;
  try { const u = new URLSearchParams(location.search); if (u.get("week") === "demo") sessionStorage.setItem("vestigia:weekdemo", u.get("plek") || "3"); if (u.get("week") === "uit") sessionStorage.removeItem("vestigia:weekdemo"); demo = sessionStorage.getItem("vestigia:weekdemo"); } catch(e){}

  const huidigeWeek = () => weekStartDay(todayIndex());
  const dagInWeek = () => todayIndex() - huidigeWeek();           // 0 = maandag
  const opTijd = () => dagInWeek() <= 1;                          // maandag of dinsdag
  const nogNietGezien = () => lees(K.gezien) !== huidigeWeek();

  const fmt = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", timeZone: "UTC" });
  const datum = d => fmt.format(new Date(START + d * DAY));
  function periode(ws){
    const a = new Date(START + ws * DAY), b = new Date(START + (ws + 6) * DAY);
    return a.getUTCMonth() === b.getUTCMonth() ? `${a.getUTCDate()} t/m ${datum(ws + 6)}` : `${datum(ws)} t/m ${datum(ws + 6)}`;
  }

  /* ---------- plaatsen uitrekenen ---------- */
  /* plaats van een speler in een lijst (alleen spelers met punten tellen als geplaatst) */
  function plaatsVan(rows, naam){
    const met = (rows || []).filter(r => +r.points > 0), pl = plaatsen(met, STAND_SLEUTEL);
    const i = met.findIndex(r => r.name === naam);
    return i < 0 ? null : { pos: pl[i].pos, gedeeld: pl[i].gedeeld, n: met.length, pts: +met[i].points };
  }
  /* top 3 van een lijst: { naam: plaats } */
  function top3(rows){
    const met = (rows || []).filter(r => +r.points > 0), pl = plaatsen(met, STAND_SLEUTEL), uit = {};
    met.forEach((r, i) => { if (pl[i].pos <= 3) uit[r.name] = pl[i].pos; });
    return uit;
  }
  const algemeen = ws => online.rpc("leaderboard_range", { p_from: ws, p_to: ws + 6 });
  const league = (l, ws) => online.rpc("league_board", { p_id: p().id, p_key: p().key, p_league: l.id, p_from: ws, p_to: ws + 6 });

  /* de uitslag van vorige week, met het verschil ten opzichte van de week ervoor */
  async function uitslag(){
    const naam = p().name, ws = huidigeWeek() - 7;
    const [nu, toen] = await Promise.all([algemeen(ws), algemeen(ws - 7).catch(() => [])]);
    const ik = plaatsVan(nu, naam);
    if (!ik) return null;                                        // vorige week geen punten: geen pop-up
    const t = await prijzen();
    ik.prijs = t ? prijsVoor(t, ik.pos) : 0;
    ik.vorig = plaatsVan(toen, naam);
    let ls = [];
    try { ls = await League.vernieuw(); } catch(e){ ls = League.cached(); }
    const leagues = (await Promise.all((ls || []).map(async l => {
      try {
        const [a, b] = await Promise.all([league(l, ws), league(l, ws - 7).catch(() => [])]);
        bewaarKroon(l.id, ws + 7, top3(a));                      // meteen goed voor de kroontjes deze week
        const r = plaatsVan(a, naam); if (!r) return null;
        r.vorig = plaatsVan(b, naam); r.league = l;
        return r;
      } catch(e){ return null; }
    }))).filter(Boolean);
    /* beste plaats eerst; bij gelijk de league die je het laatst opende */
    const laatst = (League.huidige() || {}).id;
    leagues.sort((a, b) => a.pos - b.pos || (b.league.id === laatst) - (a.league.id === laatst));
    return { ws, ik, leagues };
  }

  /* ---------- mijlpalen voor de weekranglijst: in de pop-up in plaats van een losse melding ---------- */
  const isWeekMijlpaal = m => /^(podium|winst)_/.test(m.id || "");
  function vang(m){
    if (!isWeekMijlpaal(m) || !p() || !opTijd() || !nogNietGezien()) return false;
    const w = huidigeWeek(), r = lees(K.mijl);
    const lijst = r && r.w === w ? r.lijst : [];
    if (!lijst.some(x => x.id === m.id)) lijst.push({ id: m.id, label: m.label, eikels: m.eikels || 0, titel: m.titel || null });
    zet(K.mijl, { w, lijst });
    return true;
  }
  function wachtendeMijlpalen(){ const r = lees(K.mijl); return r && r.w === huidigeWeek() ? r.lijst : []; }
  /* komt de pop-up deze week niet meer, dan alsnog als melding */
  function restMelden(nu){
    const r = lees(K.mijl); if (!r || !r.lijst.length) return;
    if (!nu && r.w === huidigeWeek() && opTijd() && nogNietGezien()) return;
    zet(K.mijl, null);
    r.lijst.forEach((m, i) => setTimeout(() => toast(Profiel.mijlToast(m), { duur: 6000 }), i * 6500));
  }

  /* ---------- de pop-up ---------- */
  const KROON_KLEUR = { 1: ["#e2b84e", "#a8731b"], 2: ["#d4dbdf", "#7f8b92"], 3: ["#d39a64", "#8f5528"] };
  const kroon = (pos, cls) => { const [v, r] = KROON_KLEUR[pos] || KROON_KLEUR[3];
    return `<svg class="${cls || "lgkroon"}" viewBox="0 0 24 16" aria-hidden="true"><path d="M2 14L1 4l6 4 5-7 5 7 6-4-1 10Z" fill="${v}" stroke="${r}" stroke-width="1.3" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="1.5" fill="${r}"/></svg>`; };
  const ICOON = {
    alle: `<svg class="wkic" viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="17" width="8" height="11" rx="1.5" fill="#cfd6da"/><rect x="12" y="10" width="8" height="18" rx="1.5" fill="#e2b84e"/><rect x="21" y="20" width="8" height="8" rx="1.5" fill="#d39a64"/><path d="M16 3.5l1.3 2.6 2.9.4-2.1 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2 2.9-.4Z" fill="#4b7a5e"/></svg>`,
    league: `<svg class="wkic" viewBox="0 0 32 32" aria-hidden="true"><circle cx="11" cy="11" r="4.5" fill="#4b7a5e"/><circle cx="22" cy="12" r="3.8" fill="#7fae8c"/><path d="M3 26c0-5 3.6-8 8-8s8 3 8 8Z" fill="#4b7a5e"/><path d="M16.5 26c.4-4.4 2.6-7 5.5-7 3.4 0 6 2.6 6 7Z" fill="#7fae8c"/></svg>`
  };
  function verschil(r){
    if (!r.vorig || r.pos > 10) return "";
    const d = r.vorig.pos - r.pos;
    if (d > 0) return `<span class="wkdelta op" title="${d} ${d === 1 ? "plaats" : "plaatsen"} gestegen ten opzichte van de week ervoor"><span aria-hidden="true">▲</span>${d}<span class="sr"> ${d === 1 ? "plaats" : "plaatsen"} gestegen</span></span>`;
    if (d < 0) return `<span class="wkdelta af" title="${-d} ${d === -1 ? "plaats" : "plaatsen"} gezakt ten opzichte van de week ervoor"><span aria-hidden="true">▼</span>${-d}<span class="sr"> ${d === -1 ? "plaats" : "plaatsen"} gezakt</span></span>`;
    return `<span class="wkdelta gelijk" title="Dezelfde plaats als de week ervoor"><span aria-hidden="true">=</span><span class="sr">dezelfde plaats als de week ervoor</span></span>`;
  }
  function rij(ic, kop, r, kroonTekst){
    const top10 = r.pos <= 10;
    const sub = top10
      ? `${r.gedeeld ? "Gedeelde plaats · " : ""}${r.n} ${r.n === 1 ? "speler" : "spelers"} met punten`
      : "Helaas, je eindigde buiten de top 10";
    return `<div class="lvbuit wkrij${top10 ? "" : " buiten"}${top10 && r.pos <= 3 ? " p" + r.pos : ""}">${ic}
      <span><b>${esc(kop)}</b><small>${sub}</small></span>
      ${top10 ? `<span class="wkplek">${r.pos <= 3 && kroonTekst ? kroon(r.pos, "wkkroon") : ""}<b>${r.pos}<small>e</small></b>${verschil(r)}</span>` : ""}</div>`;
  }
  function kopTekst(ik){
    if (ik.pos === 1) return ["Weekwinnaar!", "Gefeliciteerd, je bent 1e geëindigd: niemand haalde meer punten uit de dagcasussen."];
    if (ik.pos <= 3) return ["Op het podium!", `Gefeliciteerd, je bent ${ik.pos}e geëindigd in de weekranglijst.`];
    if (ik.pos <= 10) return ["Mooi gespeeld", `Gefeliciteerd, je bent ${ik.pos}e geëindigd in de weekranglijst.`];
    return ["Een nieuwe week", "Elke maandag begint de weekranglijst weer bij nul. Wie pakt deze week de top 10?"];
  }
  function html(u, mijl){
    const [h, p_] = kopTekst(u.ik), toon = u.leagues.slice(0, 2), rest = u.leagues.length - toon.length;
    const kroonIn = u.leagues.filter(l => l.pos <= 3);
    return `
      <span class="caps lvlabel">Je week in Vestigia</span>
      <div class="wkbadge${u.ik.pos <= 3 ? " p" + u.ik.pos : ""}">${u.ik.pos <= 10 ? `<span class="caps">Plaats</span><b>${u.ik.pos}</b>` : ICOON.alle.replace('class="wkic"', 'class="wkic groot"')}</div>
      <div class="lvtekst"><h2 id="wachtH">${h}</h2><p>${p_}</p><p class="wkperiode">Week van ${periode(u.ws)}</p></div>
      <div class="lvbuitlijst">
        ${rij(ICOON.alle, "Weekranglijst", u.ik)}
        ${u.ik.prijs ? `<div class="lvbuit belrij" data-eik="${u.ik.prijs}">${BEKER.replace('class="wpbeker"', 'class="wkic wpbeker"')}<span><b>Weekprijs</b><small>${u.ik.gedeeld ? "Gedeelde " : ""}${u.ik.pos}e plaats in de weekranglijst</small></span><span class="beleik">${EIKEL}+${u.ik.prijs}</span></div>` : ""}
        ${toon.map(l => rij(ICOON.league, l.league.name, l, "kroontje")).join("")}
        ${rest > 0 ? `<button class="linklike wkmeer" id="wkMeer">en nog ${rest} ${rest === 1 ? "league" : "leagues"}</button>` : ""}
        ${mijl.map(m => Profiel.mijlRij(m)).join("")}
      </div>
      ${kroonIn.length ? `<p class="fine wkkroonnoot">${kroon(kroonIn[0].pos, "lgkroon")} Je staat deze hele week met een kroontje in ${kroonIn.length === 1 ? esc(kroonIn[0].league.name) : kroonIn.length + " leagues"}, omdat je vorige week in de top 3 eindigde.</p>` : ""}
      ${u.ik.vorig || u.leagues.some(l => l.vorig) ? `<p class="fine wkuitleg">▲ en ▼: hoeveel plaatsen je steeg of zakte ten opzichte van de week ervoor.</p>` : ""}
      <button class="btn" id="lvVerder">Verder</button>`;
  }
  async function toon(u, mijl){
    zet(K.gezien, huidigeWeek());
    const dicht = Levels.popup(html(u, mijl), "weekpop");
    const meer = $("wkMeer");
    if (meer) meer.onclick = () => { $("lvVerder").click(); showRank("week"); };
    if (mijl.length || u.ik.prijs){ zet(K.mijl, null); await Profiel.vliegUit($("wachtBody")); }
    return dicht;
  }

  /* ---------- wachtrij ---------- */
  let klaar = null;
  Wachtrij.voeg({ id: "week", prio: 1.6, combi: true, naam: "Je week in Vestigia",       // update 79: vóór de levels (die verlopen niet), na advent en duel
    async kan(){
      klaar = null;
      if (demo){ klaar = nepUitslag(+demo || 3); return true; }
      if (!p() || !opTijd() || !nogNietGezien()) return false;
      /* eerst de mijlpalen van het opstarten afwachten (podium en weekwinst horen in deze pop-up) */
      await Promise.race([Profiel.mijlpalenKlaar(), wacht(4000)]).catch(() => {});
      const u = await uitslag().catch(() => null);
      if (!u){ restMelden(true); return false; }
      klaar = u; return true;
    },
    toon(){ const mijl = demo ? NEP_MIJL(+demo || 3) : wachtendeMijlpalen(); return toon(klaar, mijl); }
  });
  setTimeout(restMelden, 8000);

  /* ---------- kroontjes in de league-ranglijst ----------
     Bewaard per league met de week waarin ze gelden, zodat ze ook offline en zonder extra vraag te zien zijn. */
  function bewaarKroon(id, w, namen){
    const k = lees(K.kroon) || {};
    k[id] = { w, namen };
    for (const x of Object.keys(k)) if (k[x].w !== w && k[x].w < w - 7) delete k[x];
    zet(K.kroon, k);
  }
  async function kroonVoor(l){
    const w = huidigeWeek(), k = (lees(K.kroon) || {})[l.id];
    if (k && k.w === w) return k.namen;
    const namen = top3(await league(l, w - 7));
    bewaarKroon(l.id, w, namen);
    return namen;
  }
  /* in een getekende league-ranglijst: kroontje achter de naam */
  async function kroontjes(list, l){
    if (!p() || !l) return;
    let namen; try { namen = demo ? nepKroon(list) : await kroonVoor(l); } catch(e){ return; }
    if (!list.isConnected) return;
    let er = false;
    for (const li of list.querySelectorAll(":scope > li[data-n]")){
      const pos = namen[li.dataset.n], b = li.querySelector(".who b");
      if (!pos || !b || b.querySelector(".lgkroon")) continue;
      b.insertAdjacentHTML("beforeend", `<button type="button" class="lgkroonknop" aria-label="Kroontje: ${pos}e plaats vorige week in deze league">${kroon(pos)}</button>`);
      er = true;
    }
    const regel = $("rankRule");
    if (er && regel && !regel.querySelector(".kroonregel"))
      regel.insertAdjacentHTML("beforeend", ` <span class="kroonregel">${kroon(1)} Kroontje: top 3 van vorige week in deze league.</span>`);
  }
  document.addEventListener("click", e => {
    const k = e.target.closest(".lgkroonknop"); if (!k) return;
    toast(`${k.getAttribute("aria-label").replace("Kroontje: ", "Kroontje voor de ")}. Het blijft deze hele week staan.`, { duur: 5000 });
  });

  /* ---------- weekprijs en bekertje (update 58) ---------- */
  const PRIJS_STD = { 1: 50, 2: 35, 3: 25, top10: 10 };      // zelfde als eikel_regels (weekprijs_…); de server is leidend
  let prijsTabel, prijsVraag = null;
  /* bedragen van de server; bestaat de functie nog niet (SQL 033 niet gedraaid), dan staat de weekprijs uit */
  function prijzen(){
    if (prijsTabel !== undefined) return Promise.resolve(prijsTabel);
    if (demo) return Promise.resolve(prijsTabel = PRIJS_STD);
    return prijsVraag || (prijsVraag = online.rpc("weekprijzen", {})
      .then(r => (prijsTabel = r && r["1"] != null ? r : null))
      .catch(e => { prijsVraag = null; if (e && e.status >= 400 && e.status < 500) prijsTabel = null; return e && e.status ? null : PRIJS_STD; }));
  }
  /* update 87: maandprijs = weekprijs ×3 (Tom 24 nov 2026); de server is leidend (maandprijzen(), SQL 058) */
  const PRIJS_MAAND_STD = { 1: 150, 2: 100, 3: 75, top10: 30 };
  let maandTabel, maandVraag = null;
  const maandDemo = () => { try { return !!sessionStorage.getItem("vestigia:maanddemo"); } catch(e){ return false; } };
  function maandPrijzen(){
    if (maandTabel !== undefined) return Promise.resolve(maandTabel);
    if (demo || maandDemo()) return Promise.resolve(maandTabel = PRIJS_MAAND_STD);
    return maandVraag || (maandVraag = online.rpc("maandprijzen", {})
      .then(r => (maandTabel = r && r["1"] != null ? r : null))
      .catch(e => { maandVraag = null; if (e && e.status >= 400 && e.status < 500) maandTabel = null; return e && e.status ? null : PRIJS_MAAND_STD; }));
  }
  const tabelVoor = soort => soort === "month" ? maandPrijzen() : prijzen();
  const prijsVoor = (t, pos) => !t || !pos ? 0 : pos <= 3 ? +t[pos] || 0 : pos <= 10 ? +t.top10 || 0 : 0;
  const BEKER = `<svg class="wpbeker" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 5.2H4.6a2.6 2.6 0 0 0 2.9 4.3M16.8 5.2h2.6a2.6 2.6 0 0 1-2.9 4.3" fill="none" stroke="#a8731b" stroke-width="1.5" stroke-linecap="round"/><path d="M6.8 3h10.4v5.2a5.2 5.2 0 0 1-10.4 0Z" fill="#e2b84e" stroke="#a8731b" stroke-width="1.3" stroke-linejoin="round"/><path d="M10.6 13.2h2.8l.5 3.4h-3.8Z" fill="#d9a441" stroke="#a8731b" stroke-width="1.2" stroke-linejoin="round"/><rect x="7.6" y="16.6" width="8.8" height="3.6" rx="1" fill="#7d5330"/><path d="M9.4 5.2v2.6" stroke="#fff3c9" stroke-width="1.3" stroke-linecap="round" opacity=".8"/></svg>`;

  /* in een getekende weekranglijst (Iedereen, Deze week): bekertje in je eigen rij, naast je punten */
  async function beker(list, soort){
    if (!p()) return;
    const t = await tabelVoor(soort).catch(() => null);
    if (!t || !list.isConnected) return;
    const li = list.querySelector(":scope > li.me"), pts = li && li.querySelector(".pts");
    if (!pts || pts.querySelector(".wpknop")) return;
    pts.classList.add("metbeker");
    pts.insertAdjacentHTML("afterbegin", `<button type="button" class="wpknop" data-soort="${soort === "month" ? "month" : "week"}" aria-haspopup="dialog" aria-label="${soort === "month" ? "Maandprijs" : "Weekprijs"}: wat krijg je voor je plaats?">${BEKER}</button>`);
  }
  const pop = () => $("prijsPop");
  let terugNaar = null;
  function sluitPrijs(){
    if (!pop() || pop().hidden) return;
    pop().hidden = true;
    if (terugNaar && terugNaar.isConnected) terugNaar.focus({ preventScroll: true });
    terugNaar = null;
  }
  async function openPrijs(knop){
    const maand = knop.dataset.soort === "month";
    const t = await tabelVoor(maand ? "month" : "week").catch(() => null); if (!t) return;
    const W = maand ? { naam: "Maandprijs", deze: "deze maand", wanneer: "op de 1e van de volgende maand" } : { naam: "Weekprijs", deze: "deze week", wanneer: "maandag" };
    const list = knop.closest(".ranklist"), me = knop.closest("li");
    const getal = li => parseInt((li.querySelector(".pts") || {}).textContent, 10) || 0;
    const geplaatst = [...list.querySelectorAll(":scope > li[data-pos]")].filter(li => getal(li) > 0);
    const mijn = getal(me), pos = mijn > 0 ? +me.dataset.pos : 0;
    const gedeeld = pos && geplaatst.filter(li => +li.dataset.pos === pos).length > 1;
    let h, zin;
    if (!pos){ h = `Nog geen punten ${W.deze}`; zin = `Speel de dagcasus en maak kans op een ${W.naam.toLowerCase()}: de top 10 wint eikels.`; }
    else if (pos <= 10){ h = `Je staat nu ${pos}e${gedeeld ? " (gedeeld)" : ""}`; zin = `Blijft dat zo, dan krijg je ${W.wanneer} <b>${prijsVoor(t, pos)} eikels</b>.`; }
    else {
      const tiende = geplaatst.filter(li => +li.dataset.pos <= 10).pop(), nodig = Math.max(1, getal(tiende) - mijn + 1);
      h = `Je staat nu ${pos}e`; zin = `Met ${nodig} ${nodig === 1 ? "punt" : "punten"} meer sta je in de top 10 en win je <b>${prijsVoor(t, 10)} eikels</b>.`;
    }
    const rij = (van, tot, label) => {
      const jij = pos && pos >= van && pos <= tot;
      return `<li class="${jij ? "jij" : ""}${van <= 3 ? " p" + van : ""}"><span class="wpplek">${label}</span>${jij ? `<span class="wpjij">jij</span>` : ""}<span class="wpeik">${EIKEL} ${prijsVoor(t, van)}</span></li>`;
    };
    $("prijsPopBody").innerHTML = `<div class="spkop wpkop"><span class="caps">${W.naam}</span><button class="spsluit" id="prijsSluit" aria-label="Sluiten"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        <div class="wpgroot">${BEKER}</div><h2 id="prijsPopH">${h}</h2><p>${zin}</p></div>
      <div class="wpbody">
        <ul class="wplijst">${rij(1, 1, "1e plaats")}${rij(2, 2, "2e plaats")}${rij(3, 3, "3e plaats")}${rij(4, 10, "4e t/m 10e plaats")}</ul>
        <p class="fine">De prijs komt ${W.wanneer} bij je eikels, als ${maand ? "de maand" : "de week"} voorbij is. Alleen de dagcasus telt, oefenen niet. Gelijke stand? Dan deel je de plaats en krijg je dezelfde prijs.</p>
        <button class="btn" id="prijsOke">Oké</button>
      </div>`;
    terugNaar = knop;
    pop().hidden = false;
    $("prijsSluit").onclick = sluitPrijs; $("prijsOke").onclick = sluitPrijs;
    $("prijsOke").focus({ preventScroll: true });
  }
  document.addEventListener("click", e => {
    const k = e.target.closest(".wpknop"); if (k){ e.stopPropagation(); openPrijs(k); return; }
    if (pop() && e.target === pop()) sluitPrijs();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && pop() && !pop().hidden){ e.preventDefault(); sluitPrijs(); } });

  /* ---------- voorbeeld (?week=demo) ---------- */
  function nepUitslag(plek){
    const ws = huidigeWeek() - 7, ls = [
      { id: "demo1", name: "Brabant Eco" }, { id: "demo2", name: "HAS Toegepaste Biologie" }, { id: "demo3", name: "Dassenclub" }];
    return { ws, ik: { pos: plek, gedeeld: false, n: 27, pts: 31, vorig: { pos: plek + 2 }, prijs: prijsVoor(PRIJS_STD, plek) },
      leagues: [
        { pos: 1, gedeeld: false, n: 6, pts: 31, vorig: { pos: 2 }, league: ls[0] },
        { pos: 4, gedeeld: true, n: 14, pts: 31, vorig: { pos: 4 }, league: ls[1] },
        { pos: 2, gedeeld: false, n: 5, pts: 31, vorig: null, league: ls[2] }].sort((a, b) => a.pos - b.pos) };
  }
  const NEP_MIJL = plek => plek <= 3 ? [{ id: "podium_1", label: "Op het podium", drempel: 1, eikels: 50, titel: null }].concat(plek === 1 ? [{ id: "winst_1", label: "Weekwinnaar", drempel: 1, eikels: 100, titel: null }] : []) : [];
  function nepKroon(list){
    const namen = {}, lis = [...list.querySelectorAll(":scope > li[data-n]")];
    lis.slice(0, 3).forEach((li, i) => namen[li.dataset.n] = i + 1);
    return namen;
  }

  return { vang, kroontjes, kroon, uitslag, beker };
})();
