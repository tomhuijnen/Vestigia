/* Vestigia – spel: toestand, acties, weergave, invoer, modi */
"use strict";
/* ---------- toestand ---------- */
let S = null;          // {mode, expert, target(id), k(casus), guesses[ids], revealed, status, caseNo(dagnummer + 1)}
let freshClue = -1, freshRow = false, freshResult = false;

const isTwin = id => BY_ID.get(S.target).twin === id;
const usedTries = () => S.guesses.filter(id => !isTwin(id)).length;
const curCase = () => caseOf(S.target, S.k);
/* toelichting bij de huidige casus (data/toelichting.js), of "" als die er niet is */
const toelichting = () => (typeof TOELICHTING !== "undefined" && TOELICHTING[`${S.target}:${S.k || 0}`]) || "";
/* update 37: ‘Wist je dat?’ bij de huidige casus (data/weetjes.js), of null; zonder weetje blijft het oude vak ‘Typisch’ */
const weetje = () => (typeof WEETJES !== "undefined" && WEETJES[`${S.target}:${S.k || 0}`]) || null;

function newGame(mode, expert, targetId, k, caseNo){
  return { mode, expert, target: targetId, k: k || 0, guesses: [], revealed: 1, status: "playing", caseNo };
}
function dailyKey(i, expert){ return "d" + i + (expert ? "x" : ""); }

function loadDaily(expert){
  const i = todayIndex(), st = store.get(), d = daily(i);
  const saved = st.games && st.games[dailyKey(i, expert)];
  const g = newGame("daily", expert, d.id, d.k, i + 1);
  if (saved && saved.target === g.target && (saved.k || 0) === g.k){ Object.assign(g, saved, { mode:"daily", expert }); }
  return g;
}
function saveDaily(){
  if (S.mode === "duel"){ Duel.bewaar(); return; }     // update 16: een duelcasus bewaart zijn eigen stand (js/duel.js)
  if (S.mode === "free"){ bewaarOefen(); return; }       // update 82 (b)
  if (S.mode !== "daily") return;
  const st = store.get(); st.games = st.games || {};
  st.games[dailyKey(S.caseNo - 1, S.expert)] = { target:S.target, k:S.k, guesses:S.guesses, revealed:S.revealed, status:S.status };
  store.set(st);
}
/* update 82 (b): een getrokken oefencasus ligt vast tot je hem beantwoordt of opgeeft. Weggaan, een andere oefengroep
   kiezen, van modus wisselen of een ander apparaat pakken geeft dezelfde casus terug. Anders kon je blijven trekken tot
   je een casus kreeg die je herkende (Tom, 18 november). Bewaard in st.oefen (gaat mee in de voortgang naar je andere
   apparaten); st.oefenKlaar = het nummer (t) van de laatst afgeronde, zodat een ander apparaat hem niet terugzet. */
function bewaarOefen(){
  if (!S || S.mode !== "free") return;
  const st = store.get();
  if (S.status === "playing") st.oefen = { t: S.t, target: S.target, k: S.k, expert: !!S.expert, guesses: S.guesses, revealed: S.revealed,
    groep: S.groep || null, nieuw: !!S.nieuw, ids: S.ids || null };
  else { if (st.oefen && st.oefen.t === S.t) delete st.oefen; st.oefenKlaar = Math.max(st.oefenKlaar || 0, S.t || 0); }
  store.set(st);
}
function openOefen(){
  const o = store.get().oefen;
  return o && BY_ID.has(o.target) && oefenbaar(o.target) ? o : null;
}
function recordDex(){
  const st = store.get(); st.dex = st.dex || {};
  const e = st.dex[S.target] || { w:0, seen:0 };
  e.seen++;
  e.ks = [...new Set((e.ks || []).concat(S.k))].sort((a, b) => a - b);
  if (S.status === "won"){
    e.w++;
    if (e.w === 1) S.nieuwePlaat = true;          // eerste keer goed: ontdekkingsmoment in de uitslag
    const score = S.expert ? S.revealed : usedTries(), k = S.expert ? "bx" : "b";
    e[k] = Math.min(e[k] || 99, score);
    if (!e.f) e.f = isoDay(Date.now());
  }
  st.dex[S.target] = e;
  S.newAwards = checkAwards(st);
  store.set(st);
}
function recordLog(){
  const st = store.get();
  const tw = S.guesses.filter(isTwin).length;
  st.log = (st.log || []).concat({ t: Date.now(), m: S.mode, d: S.mode === "daily" ? S.caseNo - 1 : null, s: S.target, k: S.k,
    x: !!S.expert, w: S.status === "won", p: Math.min(usedTries(), MAX), c: S.revealed, tw,
    f: S.guesses.filter(id => id !== S.target) });     // f: de foute gokken, voor ‘eigen fouten terugzien’ (update 2)
  store.set(st);
}
function recordStats(){
  if (S.mode !== "daily") return;
  const st = store.get(); const key = S.expert ? "statsX" : "stats";
  const s = st[key] || { played:0, won:0, streak:0, best:0, last:-1 };
  const i = S.caseNo - 1;
  if (s.last === i) return;
  s.played++;
  if (S.status === "won"){ s.won++; s.streak = (s.last === i - 1) ? s.streak + 1 : 1; s.best = Math.max(s.best, s.streak); }
  else s.streak = 0;
  s.last = i; st[key] = s; store.set(st);
}
/* Oefenen: een soort die niet net geweest is en niet binnenkort dagcasus wordt, met bij voorkeur een casus die je nog niet kent.
   f.g = alleen deze oefengroep (OEFENGROEPEN, update 79), f.nieuw = alleen soorten die nog niet in je Vestiarium staan.
   Heb je in die keuze alles al, dan komt er toch een soort uit de groep, en meldt ‘alles’ dat.
   Update 79: de keuze is nooit kleiner dan MIN_KEUZE soorten, anders weet je het antwoord al (Tom, 17 november).
   Minder dan MIN_KEUZE nog niet in je Vestiarium: die komen tussen de rest van de groep door (geen voorrang).
   Een lijst van minder dan MIN_KEUZE soorten (je verwarde soorten): aangevuld met hun lijkers en tweelingen, daarna
   met soorten uit dezelfde oefengroep. */
function aanvullen(ids){
  const kies = new Set(ids.filter(id => BY_ID.has(id) && oefenbaar(id)));
  if (kies.size >= MIN_KEUZE) return [...kies];
  const kan = id => { const t = BY_ID.get(id); return t && TARGETS.includes(t) && oefenbaar(id); };
  const lijkers = [...kies].flatMap(id => { const t = BY_ID.get(id); return [t.x, t.twin].concat(TARGETS.filter(o => o.x === id || o.twin === id).map(o => o.id)); });
  for (const id of lijkers) if (kies.size < MIN_KEUZE && id && kan(id)) kies.add(id);
  const ogs = new Set([...kies].map(id => OEFENGROEP_VAN[BY_ID.get(id).g]));
  const rest = TARGETS.filter(t => !kies.has(t.id) && oefenbaar(t.id) && [...ogs].some(og => inOefengroep(t, og))).sort(() => Math.random() - .5);
  for (const t of rest) if (kies.size < MIN_KEUZE) kies.add(t.id);
  return [...kies];
}
function randomFree(exclude, f){
  f = f || {};
  const og = oefengroep(f.g);
  const st = store.get(), recent = st.recent || [], dex = st.dex || {};
  const upcoming = new Set(Array.from({length:8}, (_, k) => daily(todayIndex() + k).id));
  const ids = f.ids ? aanvullen(f.ids) : null;      // ids: alleen deze soorten (je verwarringen), aangevuld tot MIN_KEUZE
  const groep = TARGETS.filter(t => oefenbaar(t.id) && inOefengroep(t, og) && (!ids || ids.includes(t.id)));
  const open0 = groep.filter(t => !(dex[t.id] && dex[t.id].w > 0));
  const open = f.nieuw && open0.length < MIN_KEUZE ? groep : open0;
  const vers = t => t.id !== exclude && !recent.includes(t.id) && !upcoming.has(t.id);
  const nietBinnenkort = t => t.id !== exclude && !upcoming.has(t.id);
  /* update 79: met ‘alleen nog niet in je Vestiarium’ eerst álle open soorten proberen, ook de soort die net openstond en een
     soort die binnenkort dagcasus is. Eerder viel de enige open kever weg als hij net de casus was (of binnenkort dagcasus),
     en zei de app ten onrechte ‘Je hebt alle kevers al’. Dat verraadde bovendien dat die soort binnenkort dagcasus is. */
  const stappen = (f.nieuw ? [[open, vers], [open, nietBinnenkort], [open, t => t.id !== exclude], [open, () => true]] : [])
    .concat([[groep, vers], [groep, nietBinnenkort], [groep, t => t.id !== exclude], [groep, () => true], [TARGETS.filter(t => oefenbaar(t.id)), () => true]]);
  let pool = [], stap = 0;
  for (; stap < stappen.length; stap++){ pool = stappen[stap][0].filter(stappen[stap][1]); if (pool.length) break; }
  const t = pool[Math.floor(Math.random() * pool.length)];
  st.recent = [t.id].concat(recent.filter(x => x !== t.id)).slice(0, Math.min(20, TARGETS.length - 2)); store.set(st);
  const seen = new Set(((st.dex || {})[t.id] || {}).ks || []);
  const alle = t.cs.map((c, k) => k), fresh = alle.filter(k => !seen.has(k));
  let ks = fresh.length ? fresh : alle;
  /* dezelfde soort als net: liefst een andere casus dan die op het scherm stond */
  if (t.id === exclude && S && S.target === exclude && ks.length > 1) ks = ks.filter(k => k !== S.k);
  else if (t.id === exclude && S && S.target === exclude && alle.length > 1) ks = alle.filter(k => k !== S.k);
  return { id: t.id, k: ks[Math.floor(Math.random() * ks.length)], alles: !!f.nieuw && !open0.length };
}

/* update 97: bij elke tweelinggok een kaartje onder het invoerveld dat na ±4 s vanzelf verdwijnt (de uitleg-pop-up blijft één keer) */
let tweelingT = null;
function tweelingFlits(aan = true){
  const el = $("tweelingFlits"); if (!el) return;
  clearTimeout(tweelingT);
  if (!aan){ el.hidden = true; el.classList.remove("in", "uit"); return; }
  el.classList.remove("uit"); el.hidden = false;
  void el.offsetWidth; el.classList.add("in");
  tweelingT = setTimeout(() => { el.classList.add("uit"); tweelingT = setTimeout(() => { el.hidden = true; el.classList.remove("in", "uit"); }, 350); }, 4200);
}

function points(){
  if (S.status !== "won") return 0;
  return S.expert ? expertPunten(S.revealed, usedTries(), S.mode === "daily" ? S.caseNo - 1 : null) : Math.max(1, 6 - usedTries());
}

/* ---------- acties ---------- */
function submitGuess(id){
  if (S.status !== "playing") return;
  const g = BY_ID.get(id);
  if (!g){ setMsg("Kies een soort uit de lijst.", true); return; }
  if (S.guesses.includes(id)){ setMsg("Die soort heb je al geprobeerd.", true); return; }
  S.guesses.push(id);
  freshRow = true;
  if (!isTwin(id)) tweelingFlits(false);
  if (id === S.target){ S.status = "won"; }
  else if (isTwin(id)){ S.revealed = MAX; freshClue = MAX - 1; tweelingFlits(); setTimeout(() => Spelen.tweelingEersteKeer(BY_ID.get(id)), 650); }
  else if (S.expert && usedTries() >= EXPERT_POGINGEN){ S.status = "lost"; }
  else if (S.expert){ S.revealed = MAX; freshClue = MAX - 1; }      /* update 45: vangnet, alles open en nog één gok */
  else if (usedTries() >= MAX){ S.status = "lost"; }
  else { S.revealed = Math.min(MAX, S.revealed + 1); freshClue = S.revealed - 1; }
  /* update 19: waar stond het invoerveld op het scherm? De balk met de uitslag komt precies daar */
  const invoerOpScherm = S.status !== "playing" ? $("gInput").getBoundingClientRect().top : null;
  if (S.status !== "playing"){
    /* update 16 liet een duelcasus buiten het Vestiarium. Update 102 (Tom, 23 november, optie A): een soort die je in een duel
       vindt, krijgt nu ook een plaat, net als bij oefenen (prestaties, groep compleet, en je fouten tellen al mee via het logboek).
       Het voorbeeld (?duel=demo) verandert niets. Geen terugwerkende kracht voor duels van vóór deze update. */
    recordStats(); if (!(S.mode === "duel" && Duel.demo)){ recordDex(); recordLog(); } freshResult = true;
    if (S.status === "won") try { navigator.vibrate && navigator.vibrate([30, 50, 70]); } catch(e){}
    if (S.mode === "duel") Duel.naCasus(); else online.afterGame();
  }
  saveDaily(); render();
  /* de uitslag verschijnt boven het invoerveld en duwt alles omlaag: schuif mee, zodat de balk blijft waar je keek */
  if (invoerOpScherm !== null && !$("uitslagBalk").hidden){
    const b = $("uitslagBalk").getBoundingClientRect(), tab = $("tabbar") ? $("tabbar").offsetHeight : 0;
    const doel = Math.max(70, Math.min(invoerOpScherm, innerHeight - tab - b.height - 12));     // helemaal in beeld
    window.scrollTo({ top: Math.max(0, window.scrollY + b.top - doel), behavior: "instant" });
  }
  if (S.newAwards && S.newAwards.length){ const a = S.newAwards; S.newAwards = []; setTimeout(() => showAwards(a), 700); }
  if (S.status !== "playing") naarUitslagStraks();
}
/* Uitslag in één oogopslag (update 19, optie B met A erachteraan). Na de laatste gok wordt het invoerveld een balk
   met de uitslag (renderBalk), precies waar je al keek. Daarna schuift de pagina rustig omhoog naar de uitslag.
   Bij ‘minder beweging’ blijft de pagina staan en doet de knop ‘Bekijk uitslag’ het werk. */
const rustigeBeweging = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
/* naar de uitslag; de smalle balk bovenin staat er na het scrollen, daar moet de uitslag onder vallen */
function naarUitslag(){
  if (!$("resultCard") || $("resultWrap").hidden) return;
  if (rustigeBeweging()) window.scrollTo({ top: uitslagDoel(), behavior: "instant" }); else schuifRustig(uitslagDoel());
}
/* Update 19b: bij goed blijft de balk ‘Gedetermineerd’ staan; de pagina schuift pas als je op ‘Bekijk uitslag’ tikt.
   Bij fout schuift de pagina na 1,4 s vanzelf naar de uitslag, want daar staat wat je kunt leren (Wist je dat?, Verwar niet met).
   Het schuiven gaat trager dan het standaard ‘smooth’ van de browser. Eikels en XP vliegen pas als de pagina stilstaat
   (uitslagScroll), zodat het saldo rechtsboven niet verspringt terwijl ze vliegen. Tik of scrol je zelf, dan stopt het
   schuiven meteen. */
let uitslagScroll = Promise.resolve();
const STA_FOUT = 1400;
function schuifRustig(naar){
  return new Promise(klaar => {
    const van = window.scrollY, afstand = naar - van;
    if (Math.abs(afstand) < 4){ klaar(); return; }
    const duur = Math.min(2200, 1300 + Math.abs(afstand) * .4), t0 = performance.now();
    const zacht = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    let stop = false;
    const zelf = () => { stop = true; };
    const opties = { passive: true, once: true };
    ["wheel", "touchstart", "keydown", "mousedown"].forEach(t => window.addEventListener(t, zelf, opties));
    const stap = nu => {
      const x = Math.min(1, (nu - t0) / duur);
      if (!stop) window.scrollTo({ top: van + afstand * zacht(x), behavior: "instant" });
      if (x < 1 && !stop) return requestAnimationFrame(stap);
      ["wheel", "touchstart", "keydown", "mousedown"].forEach(t => window.removeEventListener(t, zelf, opties));
      klaar();
    };
    requestAnimationFrame(stap);
  });
}
function uitslagDoel(){
  const kaart = $("resultCard");
  return Math.max(0, window.scrollY + kaart.getBoundingClientRect().top - (($("slimbar") ? $("slimbar").offsetHeight : 0) + 14));
}
function naarUitslagStraks(){
  if (rustigeBeweging() || S.status === "won"){ uitslagScroll = Promise.resolve(); return; }   // goed: de knop doet het werk
  const spel = S;
  uitslagScroll = new Promise(klaar => {
    setTimeout(async () => {
      if (S !== spel || VIEW !== "game" || document.querySelector(".overlay:not([hidden]), #awardPop:not([hidden])")) return klaar();
      const r = $("resultCard").getBoundingClientRect();
      if (r.top > 40 && r.top < innerHeight * .35) return klaar();      // staat al mooi in beeld (breed scherm)
      await schuifRustig(uitslagDoel());
      klaar();
    }, STA_FOUT);
    setTimeout(klaar, STA_FOUT + 3000);              // vliegen wacht nooit langer dan dit
  });
}
function renderBalk(){
  const balk = $("uitslagBalk"), rij = document.querySelector(".det-row");
  const klaar = S.status !== "playing";
  rij.hidden = klaar;
  if (!klaar){ balk.hidden = true; balk.innerHTML = ""; renderVerder(); return; }
  const t = BY_ID.get(S.target), won = S.status === "won", vers = !balk.hidden ? false : freshResult;
  balk.className = "uitslagbalk" + (won ? "" : " mis") + (vers && !rustigeBeweging() ? " in" : "");
  balk.innerHTML = `<span class="ub-ic" aria-hidden="true">${won
      ? `<svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>`
      : `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>`}</span>
    <span class="ub-tekst"><small>${won ? "Gedetermineerd" : "Niet gedetermineerd, het was"}</small><b>${esc(t.n)}</b><i>${esc(t.s)}</i></span>
    <span class="ub-knoppen"><button class="btn" type="button" id="ubBekijk">Bekijk uitslag</button>${S.mode === "free" ? `<button class="btn line ubnieuw" type="button" id="ubNieuw">Nieuwe casus <span aria-hidden="true">→</span></button>` : ""}</span>`;
  balk.hidden = false;
  renderVerder();
  /* update 21: bij oefenen meteen door, zonder eerst naar beneden te scrollen */
  if ($("ubNieuw")) $("ubNieuw").onclick = () => startFree();
  $("ubBekijk").onclick = () => { naarUitslag(); setTimeout(() => { const h = $("resultCard").querySelector("h3"); if (h){ h.tabIndex = -1; h.focus({ preventScroll: true }); } }, rustigeBeweging() ? 0 : 1500); };
}
/* Update 61: ‘Verder spelen’ direct onder de balk na de dagcasus. Wie alleen de dagcasus speelt, zag de knop naar
   oefenen nooit (die stond ±3 schermen lager). Eén knop: oefenen met de diergroep van vandaag, maar alleen bij een
   grote groep (vanaf VERDER_MIN soorten); bij een kleine groep (kevers 2, libellen 5 …) zou je de plaat bijna gratis
   krijgen, dan ‘alle soorten’. Bewust geen ‘oefen het verschil’ met alleen de soort en zijn lijker: dan weet je dat het
   één van de twee is. Soorten op slot (update 59) vallen af via randomFree/oefenbaar(); er staat hier nooit een datum.
   Zonder spelersnaam: eerst de oproep om een naam te kiezen (de dagcasus van vandaag en gisteren telt dan alsnog mee,
   zie queueRecentDaily in js/online.js). Alleen bij de dagcasus; bij oefenen staat ‘Nieuwe casus’ al in de balk. */
const VERDER_MIN = 15;
/* Update 61 + 64: ‘Verder spelen’ na de dagcasus. Sinds update 64 staat het niet meer als losse kaart onder de balk,
   maar in de bovenlaag van de uitslag: ‘Oefen met …’ naast ‘Deel resultaat’, met de zin over je Vestiarium eronder en
   zonder spelersnaam de oproep om een naam te kiezen. verderInfo geeft de gegevens, renderResult zet ze neer. */
function verderInfo(){
  if (!S || S.mode !== "daily" || S.status === "playing") return null;
  const t = BY_ID.get(S.target), won = S.status === "won", st = store.get(), dex = st.dex || {};
  const og = OEFENGROEP_VAN[t.g], groep = TARGETS.filter(x => inOefengroep(x, og));     // update 79: de oefengroep van de soort
  const groot = groep.length >= VERDER_MIN && groep.some(x => oefenbaar(x.id));
  const lijst = groot ? groep : TARGETS, heb = lijst.filter(x => dex[x.id] && dex[x.id].w > 0).length;
  const wat = groot ? OEFENGROEPEN[og].naam.toLowerCase() : "soorten";
  const keuze = { g: groot ? og : null, nieuw: false };
  const p = points(), dag = S.caseNo - 1;
  const naam = won && p > 0 && online.enabled && !online.player() && eersteModus(st, dag) === !!S.expert && dag >= todayIndex() - 1;
  const zin = won ? `Je hebt nu <b>${heb} van de ${lijst.length} ${wat}</b> in je ${NAAM.vestiarium}.`
                  : `Je hebt <b>${heb} van de ${lijst.length} ${wat}</b> in je ${NAAM.vestiarium}. Met oefenen leer je ze beter uit elkaar te houden.`;
  return { zin, keuze, p, naam, knop: groot ? `Oefen met ${esc(wat)}` : "Oefen met alle soorten" };
}
function renderVerder(){
  const el = $("verderKaart"); if (!el) return;
  el.hidden = true; el.innerHTML = "";      // update 64: staat nu in de uitslag zelf
}
function moreClue(){
  if (!S.expert || S.status !== "playing" || S.revealed >= MAX) return;
  S.revealed++; freshClue = S.revealed - 1; saveDaily(); render();
}

/* ---------- weergave ---------- */
function setMsg(t, warn){ const m = $("msg"); m.textContent = t; m.className = "msg" + (warn ? " warn" : ""); }

function renderClues(){
  const showAll = S.status !== "playing";
  const c = curCase();
  $("clues").innerHTML = c.wn.map((txt, i) => {
    const open = i < S.revealed || showAll;
    const fresh = i === freshClue ? " fresh" : "";
    const sleutel = showAll && c.sl && c.sl.i === i ? " sleutel" : "";
    return `<li class="clue${open ? "" : " locked"}${fresh}${sleutel}"><span class="num">${i+1}</span><div><span class="lab caps">${CLUE_TYPES[i]}${sleutel ? ` <span class="sltag">typisch</span>` : ""}</span><p>${open ? esc(txt) : "nog niet waargenomen"}</p></div></li>`;
  }).join("") + (showAll && c.bron ? `<li class="bronregel"><span class="caps">Bron</span> ${c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.bron)}</a>` : esc(c.bron)}</li>` : "");
  $("clueCount").textContent = (showAll ? MAX : S.revealed) + " van " + MAX;
  $("notesFoot").hidden = !(S.expert && S.status === "playing" && !usedTries());
  $("moreClue").disabled = S.revealed >= MAX;
  /* update 45: wat een goede determinatie nu oplevert, en wat de volgende waarneming kost */
  const dag = S.mode === "daily" ? S.caseNo - 1 : null, nu = expertPunten(S.revealed, 0, dag);
  const straks = S.revealed < MAX ? expertPunten(S.revealed + 1, 0, dag) : null;   // update 83: een stap kost soms 2 punten
  $("expertHint").textContent = `Goed nu: ${nu} ${nu === 1 ? "punt" : "punten"}.` + (straks === null ? "" : ` Met de volgende waarneming: ${straks}.`);
  $("expertHint").hidden = S.mode === "free";   // update 82 (c): bij oefenen verdien je geen punten
  $("geefOpRij").hidden = !(S.mode === "free" && S.status === "playing");   // update 82 (b)
  freshClue = -1;
}

function cell(k, c){
  const sym = c.cls === "ok" ? "✓" : c.cls === "part" ? "~" : "✕";
  if (k === "l") return `<td class="${c.cls} len"><span class="v">${esc(c.main)} <span class="sym">${c.arrow || sym}</span></span></td>`;
  return `<td class="${c.cls}"><span class="v">${esc(c.main)} <span class="sym" aria-hidden="true">${sym}</span></span>${c.sec ? `<span class="sec">+ ${esc(c.sec)}</span>` : ""}</td>`;
}
/* Tijdens het spel: per gok één tip. Na afloop klapt de volledige vergelijking open. */
function renderTips(){
  const rijen = tipsVoor(S.target, S.guesses), laatste = rijen.length - 1;
  $("tipList").innerHTML = rijen.map((r, i) => {
    const g = BY_ID.get(r.id), nieuw = i === laatste && freshRow ? " enter" : "";
    if (r.soort === "goed") return `<li class="tip goed${nieuw}"><span class="tk" aria-label="goed">✓</span><div><b>${esc(g.n)}</b> <i>${esc(g.s)}</i><p>Goed gedetermineerd.</p></div></li>`;
    if (r.soort === "tweeling") return `<li class="tip tweeling${nieuw}${nieuw ? " flits" : ""}"><span class="tk" aria-label="tweelingsoort">≈</span><div><b>${esc(g.n)}</b> <i>${esc(g.s)}</i><p>Tweelingsoort van het antwoord: je zit er heel dicht bij. Deze gok telt niet mee. <button class="linklike tweelingWat">Wat is een tweelingsoort?</button></p></div></li>`;
    return `<li class="tip${nieuw}"><span class="tk" aria-label="fout">✕</span><div><b>${esc(g.n)}</b> <i>${esc(g.s)}</i><p>${esc(r.tip.txt)}</p></div></li>`;
  }).join("");
  $("tipList").querySelectorAll(".tweelingWat").forEach(b => b.onclick = () => Spelen.tweeling());
  /* de vergelijking staat er al vanaf de eerste gok, ingeklapt; tijdens het spel alleen wat de tips verteld hebben */
  const bezig = S.status === "playing";
  $("gridDetails").hidden = !S.guesses.length;
  $("gridSum").textContent = bezig ? "Bekijk de vergelijking tot nu toe" : "Bekijk de volledige vergelijking";
  $("gridUitleg").hidden = !bezig;
}
function renderGrid(){
  renderTips();
  const t = BY_ID.get(S.target), bezig = S.status === "playing";
  /* per gok de kolom die de tip prijsgaf; de rest blijft tijdens het spel verborgen */
  const getipt = new Map(tipsVoor(S.target, S.guesses).filter(r => r.soort === "tip" && r.tip.k).map(r => [r.id, r.tip.k]));
  const zicht = (n, k) => !bezig || getipt.get(n) === k;
  const leeg = `<td class="onb"><span class="v" aria-label="nog onbekend">·</span></td>`;
  const rows = S.guesses.slice().reverse().map((n, idx) => {
    const g = BY_ID.get(n), c = compare(g, t);
    const cls = (n === S.target ? "win" : "") + (isTwin(n) ? " twin" : "");
    return `<tr class="${cls.trim()}"><td class="name">${esc(g.n)}<i>${esc(g.s)}</i>${isTwin(n) ? `<span class="twintag">tweelingsoort · telt niet mee</span>` : ""}</td>${COLS.map(k => zicht(n, k) ? cell(k, c[k]) : leeg).join("")}</tr>`;
  });
  $("gridBody").innerHTML = rows.join("");
  /* kaartweergave voor smalle schermen */
  $("gridCards").innerHTML = S.guesses.slice().reverse().map((n, idx) => {
    const g = BY_ID.get(n), c = compare(g, t);
    const cls = (n === S.target ? " win" : "") + (isTwin(n) ? " twin" : "");
    return `<div class="gcard${cls}"><div class="gname"><b>${esc(g.n)}</b> <i>${esc(g.s)}</i>${isTwin(n) ? `<span class="twintag">tweelingsoort · telt niet mee</span>` : ""}</div>
      <div class="gcells">${COLS.map(k => { if (!zicht(n, k)) return `<div class="gc onb"><span class="gl">${COL_LABEL[k]}</span><span class="gv">·</span></div>`;
        const x = c[k], sym = x.cls === "ok" ? "✓" : x.cls === "part" ? "~" : "✕";
        return `<div class="gc ${x.cls}"><span class="gl">${COL_LABEL[k]}</span><span class="gv"><b>${esc(x.main)}</b> <span class="sym">${k === "l" ? (x.arrow || sym) : sym}</span></span></div>`; }).join("")}</div></div>`;
  }).join("");
  $("gridEmpty").hidden = S.guesses.length > 0;
  freshRow = false;
}

/* ---------- delen ----------
   Eén deelfunctie voor alles wat later ook gedeeld wordt (uitnodiging, league, duel): tekst + link.
   Via het deelmenu van de telefoon gaat de link apart mee, zodat WhatsApp en Teams er een voorbeeld van maken.
   extra.params komt later achter de link, bijvoorbeeld { league: "DAS-7K2" }. */
const APP_URL = new URL("./", location.href).href;
function appLink(params){
  const u = new URL(APP_URL);
  for (const [k, v] of Object.entries(params || {})) if (v) u.searchParams.set(k, v);
  return u.href;
}
/* Het deelbericht is gewone tekst, zodat het in WhatsApp en Teams leest als een uitdaging in plaats van een rij blokjes. */
function resultShare(extra){
  const won = S.status === "won", modus = S.expert ? "expert" : "klassiek";
  const bij = S.expert ? S.revealed : usedTries();
  let text;
  if (S.mode === "daily"){
    const telt = eersteModus(store.get(), S.caseNo - 1) === !!S.expert, p = points();
    const tussen = telt && won ? `${modus}, ${p} ${p === 1 ? "punt" : "punten"}` : modus;
    text = won ? `Ik had de Vestigia-dagcasus #${S.caseNo} bij waarneming ${bij} van ${MAX} (${tussen}) 🐾\nLukt het jou sneller?`
               : `De Vestigia-dagcasus #${S.caseNo} kreeg ik niet gedetermineerd (${modus}) 🐾\nLukt het jou wel?`;
  } else {
    text = won ? `Ik determineerde een oefencasus in Vestigia bij waarneming ${bij} van ${MAX} (${modus}) 🐾\nLukt het jou ook?`
               : `Deze oefencasus in Vestigia kreeg ik niet gedetermineerd (${modus}) 🐾\nLukt het jou wel?`;
  }
  return { text, url: appLink(extra && extra.params), kaal: true };
}
/* Deelt via het deelmenu van de telefoon, anders kopiëren. msgEl krijgt de melding, boxParent een tekstvak als kopiëren niet lukt. */
function shareOut({ text, url, kaal }, msgEl, boxParent){
  const full = kaal ? `${text}\n${url}` : `${text}\nSpeel mee: ${url}`;
  if (navigator.share && matchMedia("(pointer: coarse)").matches){
    navigator.share({ text, url }).catch(() => {});
    return;
  }
  const fallback = () => {
    let ta = boxParent.querySelector("textarea.copyout");
    if (!ta){ ta = document.createElement("textarea"); ta.className = "copyout"; ta.rows = 8; ta.readOnly = true; boxParent.appendChild(ta); }
    ta.value = full; ta.select(); msgEl.textContent = "Kopiëren lukt hier niet automatisch: selecteer de tekst hieronder.";
  };
  try { navigator.clipboard.writeText(full).then(() => { msgEl.textContent = "Gekopieerd."; }, fallback); } catch(e){ fallback(); }
}

/* update 73: rechtstreeks naar WhatsApp (app op de telefoon, WhatsApp Web op de laptop), met het bericht al ingevuld.
   WhatsApp maakt van de link een kaartje met de deelkaart uit index.html (og-tags). */
function waLink({ text, url }){ return "https://wa.me/?text=" + encodeURIComponent(`${text}\n${url}`); }
const WA_IC = `<svg class="waic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2c-4.9 0-8.8 3.6-8.8 8.1 0 1.7.6 3.3 1.6 4.6L4 20.6l4.9-1.5c1 .4 2 .6 3.1.6 4.9 0 8.8-3.6 8.8-8.1S16.9 3.2 12 3.2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8.6 10.4h6.8M8.6 13.4h4.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
/* tekst van de tweede deelknop: op de telefoon het deelmenu, op de laptop kopiëren */
const deelAnders = () => navigator.share && matchMedia("(pointer: coarse)").matches ? "Andere app" : "Kopieer link";

/* Ontdekkingsmoment: een nieuwe plaat kleurt in en krijgt een stempel, zoals een stempel in een paspoort */
function ontdekPlaat(t){
  const dex = store.get().dex || {}, n = TARGETS.filter(x => dex[x.id] && dex[x.id].w > 0).length;
  return `<div class="ontdek">
    <div class="plate ontdekplaat" aria-hidden="true"><div class="band" style="background:var(--g-${t.g})"><span>${GROUPS[t.g]}</span><b>nº ${dexNo(t.id)}</b></div>
      <div class="mid"><span class="nm">${esc(t.n)}</span><span class="sc">${esc(t.s)}</span></div><span class="stamp">nieuw</span><span class="sluier"></span></div>
    <div><span class="caps">Nieuwe soort!</span><p><b>${esc(t.n)}</b> staat nu in je ${NAAM.vestiarium}: plaat ${n} van ${TARGETS.length}.</p>
      <button class="linklike" id="toDex">Open het ${NAAM.vestiarium}</button></div></div>`;
}
/* Cijfers onder een dagcasus (update 9): dezelfde telling als de kop en de prestatie ‘Dagen op rij gespeeld’.
   Per dag telt de modus die je die dag als eerste speelde (zoals in de ranglijst); de reeks is dagen op rij gespeeld,
   klassiek en expert samen. Het logboek gaat via Supabase mee naar je andere apparaten; de langste reeks volgens de
   server (prestatie ‘reeks’) telt ook mee, voor dagen van vóór het logboek. */
function dagStats(st){
  const dag = new Map();
  for (const e of (st.log || []).slice().sort((a, b) => (a.t || 0) - (b.t || 0)))
    if (e && e.m === "daily" && Number.isInteger(e.d) && e.d >= 0 && !dag.has(e.d)) dag.set(e.d, !!e.w);
  for (const [k, g] of Object.entries(st.games || {})){
    const m = k.match(/^d(\d+)/); if (!m || !g || g.status === "playing" || dag.has(+m[1])) continue;
    dag.set(+m[1], g.status === "won");
  }
  if (!dag.size) return null;
  const r = playStreak(st);
  let server = 0;
  try { const p = JSON.parse(localStorage.getItem("vestigia:prestaties")) || []; const x = p.find(q => q.id === "reeks"); server = x ? +x.waarde || 0 : 0; } catch(e){}
  return { played: dag.size, won: [...dag.values()].filter(Boolean).length, streak: r.cur, best: Math.max(r.best, server, r.cur) };
}
/* Links naar de soortpagina van de bron en naar foto's (update 12, data/bronnen.js); openen in een nieuw tabblad */
const PIJL_UIT = `<svg aria-hidden="true" viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2H2v8h8V7M7 2h3v3M10 2L5.5 6.5"/></svg>`;
const BRON_IC = {
  bron: `<svg aria-hidden="true" viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6Z"/><path d="M8 3.8v9.6"/></svg>`,
  foto: `<svg aria-hidden="true" viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="2" y="4" width="12" height="9" rx="1.5"/><path d="M5.5 4l1-1.6h3L10.5 4"/><circle cx="8" cy="8.5" r="2.3"/></svg>`
};
function bronRij(t){
  const ls = typeof bronLinks === "function" ? bronLinks(t) : [];
  if (!ls.length) return "";
  const lid = /^Europese/.test(t.n) ? t.n : t.n.toLowerCase();
  return `<div class="bronrij"><span class="caps">Meer over de ${esc(lid)}</span><div class="bronlinks">${ls.map(l =>
    `<a class="bronlink" href="${esc(l.url)}" target="_blank" rel="noopener">${BRON_IC[l.soort] || ""}<span>${esc(l.soort === "bron" ? "Soortpagina " + l.label : l.label)}</span>${PIJL_UIT}</a>`).join("")}</div></div>`;
}
/* Update 64: de uitslag in twee lagen (Tom koos variant B, 23 november 2026).
   Bovenlaag (resultCard): goed of niet, de soort, score en punten, ‘Wist je dat?’, ‘Verwar niet met’, de bronlinks,
   ‘Deel resultaat’ naast ‘Oefen met …’ (dagcasus) of ‘Nieuwe casus’ (oefenen), en je plaat in het Vestiarium.
   Onderlaag (resultCard2): één kaart met tabbladen ‘Over de soort’ (toelichting, status, kenmerken), ‘Jouw casus’
   (je determinaties met tips en de volledige vergelijking) en ‘Je cijfers’ (dagcasussen, veldweek, statistieken).
   De lijst ‘Jouw determinaties’ en de vergelijking verhuizen tijdens de uitslag naar het tabblad en gaan terug zodra
   er weer gespeeld wordt (de ids blijven hetzelfde, renderGrid merkt er niets van). Bij een duel zijn er alleen de
   eerste twee tabbladen; het vervolg van het duel staat in de bovenlaag. */
let uitslagTab = "soort";
function tipsTerug(){
  const sec = $("gridH") && $("gridH").closest("section");
  if (!sec) return;
  if ($("tipList").parentElement !== sec) sec.insertBefore($("tipList"), $("gridEmpty"));
  if ($("gridDetails").parentElement !== sec) sec.appendChild($("gridDetails"));
  sec.hidden = false;
}
function renderResult(){
  const card = $("resultCard"), card2 = $("resultCard2"), wrap = $("resultWrap");
  document.querySelector(".layout").classList.toggle("afgerond", S.status !== "playing");
  if (S.status === "playing"){ tipsTerug(); wrap.hidden = true; card.innerHTML = card2.innerHTML = ""; uitslagTab = "soort"; return; }
  const t = BY_ID.get(S.target), won = S.status === "won", xs = BY_ID.get(t.x);
  const lid = /^Europese/.test(t.n) ? t.n : t.n.toLowerCase();
  const traits = [["Leefgebied","h"],["Activiteit","a"],["Voedsel","v"],["Verblijf","b"],["Winter","w"]]
    .map(([lab,k]) => `<div><dt>${lab}</dt><dd>${t[k].map(x => LABELS[k][x]).join(", ")}</dd></div>`).join("")
    + `<div><dt>Lengte</dt><dd>± ${t.l.toLocaleString("nl-NL")} cm</dd></div>`;
  const score = S.expert
    ? (won ? `Gedetermineerd na ${S.revealed} van de ${MAX} aanwijzingen.` : `Je determinatie (${esc(S.guesses[0] || "")}) klopte niet.`)
    : (won ? `Gedetermineerd in ${usedTries()} van de ${MAX} pogingen.` : `Na ${MAX} pogingen niet gevonden.`);
  let stats = "";
  if (S.mode === "daily"){
    const s = dagStats(store.get());
    if (s) stats = `<div class="ut-stats"><span class="caps">Jouw dagcasussen</span><div class="stats"><div><b>${s.played}</b>gespeeld</div><div><b>${s.played ? Math.round(100*s.won/s.played) : 0}%</b>gedetermineerd</div><div><b>${s.streak}</b>huidige reeks</div><div><b>${s.best}</b>langste reeks</div></div></div>`;
  }
  card.className = "account" + (won ? "" : " lost") + (freshResult && !matchMedia("(prefers-reduced-motion: reduce)").matches ? " resultin" : "");
  card2.className = "uitslagtabs" + (card.classList.contains("resultin") ? " resultin" : "");
  const ontdek = won && S.nieuwePlaat && freshResult;     // alleen direct na het spel, niet bij later terugkijken
  const vers = freshResult;
  if (vers) uitslagTab = "soort";
  freshResult = false;
  const vd = verderInfo();
  const acties = S.mode === "duel" ? "" : `
    ${vd && vd.naam ? `<div class="ut-naam"><p><b>Je ${vd.p} ${vd.p === 1 ? "punt telt" : "punten tellen"} nog niet mee.</b> Kies een spelersnaam, dan ${vd.p === 1 ? "staat hij" : "staan ze"} in de ranglijst van deze week. Je hebt geen account of e-mailadres nodig.</p>
      <button class="btn line" type="button" id="vdNaam">Kies een spelersnaam</button></div>` : ""}
    <div class="ut-acties">
      <button class="btn" type="button" id="copyBtn">Deel resultaat</button>
      ${vd ? `<button class="btn line" type="button" id="vdOefen">${vd.knop} <span aria-hidden="true">→</span></button>` : ""}
      ${S.mode === "free" ? `<button class="btn line" type="button" id="nieuwBoven">Nieuwe casus <span aria-hidden="true">→</span></button>` : ""}
    </div>
    <span class="msg" id="copyMsg"></span>
    ${vd ? `<p class="ut-zin">${vd.zin} <button class="linklike" type="button" id="vdKies">Of kies zelf wat je oefent</button></p>` : ""}
    ${S.mode === "free" ? `<p class="ut-zin oefenkeuze">Je oefent met ${esc(Spelen.omschrijving({ g: S.groep, nieuw: S.nieuw, ids: S.ids }))}. <button class="linklike" id="oefenWijzig">Wijzig</button></p>` : ""}`;
  card.innerHTML = `
    <span class="verdict caps">${won ? "Goed gedetermineerd" : "Niet gedetermineerd · het was"}</span>
    <h3>${esc(t.n)}<i>${esc(t.s)}</i></h3>
    ${!won && S.mode === "daily" ? `<p class="jammer">Jammer, niet gelukt vandaag. Kom morgen terug voor een nieuwe dagcasus!</p>` : ""}
    <p class="eikelline" id="eikelGain" hidden></p>
    <p>${score}${S.mode === "duel" ? ` <span class="ptsline">${points() ? "+" + points() + " punt" + (points() > 1 ? "en" : "") : "0 punten"} in het duel</span>` : ""}${S.mode === "daily" ? ` <span class="ptsline">${eersteModus(store.get(), S.caseNo - 1) === !!S.expert
      ? `${points() ? "+" + points() + " punt" + (points() > 1 ? "en" : "") : "0 punten"} voor de ranglijst`
      : `telt niet voor de ranglijst: je speelde deze casus vandaag al in ${S.expert ? "klassiek" : "expert"}`}</span>` : ""}</p>
    ${weetje() ? `<div class="sleutelbox weetje"><span class="caps">Wist je dat?</span><p>${esc(weetje().t)}</p>${weetje().bron ? `<span class="wjbron">Bron: ${esc(weetje().bron)}</span>` : ""}</div>`
      : curCase().sl ? `<div class="sleutelbox"><span class="caps">Typisch ${esc(lid)}</span><p>${esc(curCase().sl.t)}</p></div>` : ""}
    <div class="confuse"><span class="caps">Verwar niet met</span><p><b>${esc(xs.n)}.</b> ${S.guesses.includes(t.x) ? "Die soort heb je in deze casus ook geprobeerd. " : ""}${esc(t.t)}</p></div>
    ${bronRij(t)}
    ${(S.newAwards || []).map(k => { const [kind, name] = awardLabel(k); return `<div class="awardnote"><span class="caps">Nieuwe ${kind.toLowerCase()}</span><b>${esc(name)}</b></div>`; }).join("")}
    ${S.mode === "duel" ? `<section class="xpblok" id="xpBlok" aria-label="Ervaringspunten" hidden></section>${Duel.vervolg()}` : acties}
    ${S.mode === "duel" && Duel.demo ? `<p class="dexnote">In het voorbeeld komt een duelcasus niet in je ${NAAM.vestiarium}. <button class="linklike" id="toDex">Open het ${NAAM.vestiarium}</button></p>`
      : ontdek ? ontdekPlaat(t) : `<p class="dexnote">${won ? `Plaat <b>nº ${dexNo(t.id)}</b> staat nu in je ${NAAM.vestiarium}.` : `Genoteerd als waargenomen in je ${NAAM.vestiarium} (nº ${dexNo(t.id)}).`} <button class="linklike" id="toDex">Open het ${NAAM.vestiarium}</button></p>`}
    ${S.mode === "duel" ? "" : `<section class="xpblok" id="xpBlok" aria-label="Ervaringspunten" hidden></section>`}`;
  if (typeof Vesti !== "undefined") Vesti.uitslag(card, won);   // update 81: juicht bij goed, teleurgesteld bij niet gedetermineerd

  /* onderlaag: tabbladen */
  const vw = S.mode === "daily" ? veldweek(S.caseNo - 1) : null;
  const vwKaart = vw ? stempelkaart(store.get(), vw) : null;
  const tabs = [["soort", "Over de soort"], ["casus", "Jouw casus"]].concat(S.mode === "duel" ? [] : [["cijfers", "Je cijfers"]]);
  if (!tabs.some(([k]) => k === uitslagTab)) uitslagTab = "soort";
  const panelen = {
    soort: `${toelichting() ? `<div class="toelbox"><span class="caps">Waarom ${esc(lid)}?</span><p>${esc(toelichting())}</p></div>` : ""}
      <details class="status-line"><summary><span class="caps">Status</span> <b>${esc(LABELS.r[t.r])}</b><span class="meer">uitleg</span></summary><p>${esc(REGIME_INFO[t.r])}</p></details>
      <dl class="traits">${traits}</dl>`,
    casus: `<div id="utCasus" class="ut-casus"></div>`,
    cijfers: `${vw ? `<div class="vwresult"><span class="caps">Veldweek · ${esc(vw.titel)}${vw.demo ? " · voorbeeld" : ""}</span>${vwKaart.html}<p class="fine">${vwKaart.n === 7 ? "Alle zeven dagen gespeeld: +25 eikels." : `${vwKaart.n} van 7 dagen gespeeld${vwKaart.n >= 5 ? " (+10 eikels; met alle zeven +25)" : ""}.`}</p></div>` : ""}
      ${stats}
      <p class="inviteline statsline">Benieuwd hoe je het tot nu toe doet? <button class="linklike" id="toStats">Bekijk je statistieken</button></p>
      ${S.mode === "daily" && online.enabled ? `<p class="inviteline">Samen spelen is leuker. <button class="linklike" id="inviteFromResult">Nodig een speler uit</button></p>` : ""}`
  };
  const i = tabs.findIndex(([k]) => k === uitslagTab);
  card2.innerHTML = `
    <div class="ut-kaart">
      <div class="ut-seg" role="tablist" aria-label="Meer over deze casus" style="--n:${tabs.length}; --i:${i}">
        ${tabs.map(([k, lab], j) => `<button type="button" role="tab" id="utTab-${k}" data-tab="${k}" aria-selected="${j === i}" aria-controls="utPan-${k}" tabindex="${j === i ? 0 : -1}">${lab}</button>`).join("")}
      </div>
      ${tabs.map(([k], j) => `<div class="ut-paneel" role="tabpanel" id="utPan-${k}" aria-labelledby="utTab-${k}"${j === i ? "" : " hidden"}>${panelen[k]}</div>`).join("")}
    </div>
    <p class="ut-voet"><button class="reportbtn" id="repFromResult">Klopt er iets niet in deze casus? Meld een fout</button></p>`;
  /* je determinaties en de vergelijking naar het tabblad ‘Jouw casus’ */
  const sec = $("gridH").closest("section");
  $("utCasus").append($("tipList"), $("gridDetails"));
  sec.hidden = true;
  const seg = card2.querySelector(".ut-seg");
  const kies = (k, focus) => {
    uitslagTab = k;
    const j = tabs.findIndex(([x]) => x === k);
    seg.style.setProperty("--i", j);
    seg.classList.add("klaar");      // pas na de eerste keuze schuift het blokje (net als klassiek/expert)
    seg.querySelectorAll("[role=tab]").forEach(b => { const aan = b.dataset.tab === k; b.setAttribute("aria-selected", String(aan)); b.tabIndex = aan ? 0 : -1; if (aan && focus) b.focus(); });
    card2.querySelectorAll(".ut-paneel").forEach(p => p.hidden = p.id !== "utPan-" + k);
  };
  seg.querySelectorAll("[role=tab]").forEach(b => b.onclick = () => kies(b.dataset.tab));
  seg.addEventListener("keydown", e => {
    const j = tabs.findIndex(([x]) => x === uitslagTab), n = tabs.length;
    const nieuw = e.key === "ArrowRight" ? (j + 1) % n : e.key === "ArrowLeft" ? (j + n - 1) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (nieuw < 0) return;
    e.preventDefault(); kies(tabs[nieuw][0], true);
  });
  wrap.hidden = false;
  $("toDex").onclick = () => showDex(ontdek ? t.id : undefined);
  $("repFromResult").onclick = e => openReport(t.id, e.currentTarget, S.k);
  if (S.mode === "duel"){ Duel.bindVervolg(); return; }
  $("copyBtn").onclick = () => shareOut(resultShare(), $("copyMsg"), card);
  if (vd){
    $("vdOefen").onclick = () => startFree(vd.keuze);
    $("vdKies").onclick = () => { startFree(vd.keuze); Spelen.wijzig(); };
    if ($("vdNaam")) $("vdNaam").onclick = () => MENU_GO.player();
  }
  if ($("nieuwBoven")) $("nieuwBoven").onclick = () => startFree();
  if ($("oefenWijzig")) $("oefenWijzig").onclick = () => Spelen.wijzig();
  if ($("inviteFromResult")) $("inviteFromResult").onclick = () => League.openUitnodigen();
  $("toStats").onclick = () => Statistiek.toon();
  Profiel.toonWinst();
  if (typeof Levels !== "undefined") Levels.toonInResultaat();
  /* Eenmalige uitleg na een gespeelde casus (update 12): eerst de bronlinks, daarna de statistieken. Na elkaar, nooit
     tegelijk. Wie de statistieken al via het menu opende, heeft die uitleg daar al gezien en krijgt hem hier niet.
     Update 64: de statistieken staan in het tabblad ‘Je cijfers’; de uitleg wijst naar dat tabblad. */
  if (typeof Nieuw === "undefined") return;
  const gezien = k => { try { return !!localStorage.getItem("vestigia:nieuw:" + k); } catch(e){ return true; } };
  const br = card.querySelector(".bronrij"), sl = $("utTab-cijfers") ? card2.querySelector(".ut-seg") : null;
  /* wacht tot er geen pop-up meer open staat (nieuwe medaille, level omhoog, dwaalgast …), hooguit twee minuten */
  const vrij = async () => { for (let i = 0; i < 120; i++){ if (!(typeof Wachtrij !== "undefined" && Wachtrij.ietsOpen()) && !document.querySelector("#awardPop:not([hidden]), .overlay:not([hidden])")) return true; await new Promise(r => setTimeout(r, 1000)); } return false; };
  (async () => {
    await new Promise(r => setTimeout(r, 900));
    if (!(await vrij())) return;
    if (br && br.isConnected) await Nieuw.blokjes("bronnen", [
      { na: br, tekst: "Nieuw: lees meer over deze soort op de soortpagina van de bron, of bekijk foto's van het dier. De links openen in een nieuw tabblad." }
    ], { wacht: 700 });
    if (!(await vrij())) return;
    /* update 64: wie de oude uitslag kende, ziet één keer waar de rest gebleven is */
    if (vers && card2.querySelector(".ut-seg")) await Nieuw.blokjes("uitslagtabs", [
      { na: card2.querySelector(".ut-seg"), tekst: "Nieuw: de uitslag is korter. De toelichting, de kenmerken, je determinaties en je cijfers staan nu in deze tabbladen." }
    ], { wacht: 700 });
    if (!(await vrij())) return;
    if (vers && sl && sl.isConnected && !gezien("statistiek")) await Nieuw.blokjes("statistiek-na-casus", [
      { na: sl, tekst: "Nieuw: je statistieken. Hoeveel casussen je speelde, hoeveel je er goed had, en welke soorten je het vaakst tegenkwam of invoerde. Je vindt ze hierboven onder ‘Je cijfers’ en altijd in het menu onder je avatar." }
    ], { wacht: 1200 });
  })();
}

function renderPips(){
  const n = S.expert ? EXPERT_POGINGEN : MAX, real = S.guesses.filter(g => !isTwin(g));
  let h = "";
  for (let i = 0; i < n; i++){
    const used = i < real.length, hit = used && real[i] === S.target;
    h += `<span class="dot${hit ? " hit" : used ? " used" : ""}${S.expert && i === 1 ? " vangnet" : ""}"></span>`;
  }
  $("pips").innerHTML = h;
  if (S.status === "playing"){
    const left = n - real.length, twinNow = S.guesses.length && isTwin(S.guesses[S.guesses.length - 1]);
    if (twinNow) setMsg(S.expert ? (real.length ? "Alle waarnemingen staan open. Nog één determinatie; goed levert 1 punt en de plaat op." : "Alle waarnemingen staan open. Je hebt nog je determinatie, en daarna het vangnet.") : `Alle waarnemingen staan open. Nog ${left} ${left === 1 ? "poging" : "pogingen"}.`, false);
    else if (S.expert && real.length) setMsg("Mis! Vangnet: alle waarnemingen staan open. Je hebt nog één determinatie; goed levert 1 punt en de plaat op.", false);
    else setMsg(S.expert ? "Je hebt één determinatie. Open eerst zoveel waarnemingen als je nodig denkt te hebben. Mis? Dan heb je nog een vangnet voor 1 punt." : `Nog ${left} ${left === 1 ? "poging" : "pogingen"}.`, false);
    const st = store.get(), eerste = S.mode === "daily" ? eersteModus(st, S.caseNo - 1) : null;
    if (eerste !== null && eerste !== !!S.expert) setMsg(`Deze casus speelde je vandaag al in ${eerste ? "expert" : "klassiek"}. Je score telt nu niet voor de ranglijst.`, false);
    $("leftLabel").textContent = S.expert ? (real.length ? "vangnet" : "1 poging + vangnet") : `poging ${real.length + 1} van ${MAX}`;
  } else { setMsg(S.status === "won" ? "Casus afgerond." : "Casus afgesloten.", false); $("leftLabel").textContent = "afgerond"; }
}

function renderHead(){
  renderKop();
  const inp = $("gInput"); inp.disabled = S.status !== "playing";
  if (S.status !== "playing"){ inp.value = ""; closeOpts(); }
  $("gBtn").disabled = !matchExact(inp.value) || S.status !== "playing";
}

function render(){ if (!(S.status === "playing" && S.guesses.length && isTwin(S.guesses[S.guesses.length - 1]))) tweelingFlits(false); renderHead(); renderBalk(); renderClues(); renderGrid(); renderPips(); renderResult(); tipZoekgroepen(); }
/* Eenmalige uitleg bij zoeken op een groep (update 12): bij de eerstvolgende casus die je speelt (dag of oefen), zodra er
   geen pop-up, uitleg of openingsanimatie meer in beeld is. Daarna nooit meer (Nieuw.blokjes onthoudt het). */
let zoekTipBezig = false;
function tipZoekgroepen(){
  if (zoekTipBezig || typeof Nieuw === "undefined" || S.status !== "playing") return;
  try { if (localStorage.getItem("vestigia:nieuw:zoekgroepen")) return; } catch(e){ return; }
  zoekTipBezig = true;
  let poging = 0;
  const probeer = () => {
    const rij = document.querySelector(".det-row");
    const klaar = VIEW === "game" && S.status === "playing" && rij && rij.offsetParent !== null
      && !(typeof Wachtrij !== "undefined" && Wachtrij.ietsOpen()) && !document.querySelector(".nw-blokje");
    if (!klaar){ if (++poging < 90) setTimeout(probeer, 2000); else zoekTipBezig = false; return; }
    const n = typeof ZOEKGROEPEN !== "undefined" ? ZOEKGROEPEN.length : 60;
    Nieuw.blokjes("zoekgroepen", [
      { na: rij, tekst: `Nieuw: zoeken op groep. Typ bijvoorbeeld ‘vleermuis’ en je krijgt alle vleermuizen, ook de laatvlieger en de franjestaart, waar dat woord niet in de naam staat. Dat werkt voor ${n} groepen, zoals uil, hert, roofvogel, marter, salamander en vlinder.` }
    ], { wacht: 900 }).finally(() => { zoekTipBezig = false; });
  };
  setTimeout(probeer, 1500);
}

/* ---------- autocomplete ----------
   Zoeken op Nederlandse én wetenschappelijke naam, met losse woordstukjes ("pleco aus", "gr bonte") en met
   tikfouten: één fout mag vanaf 4 letters, twee vanaf 8 ("kowlmees", "plecotus austriakus"). */
/* Damerau-Levenshtein (met verwisseling van twee buurletters), met vroeg stoppen boven max */
function afstand(a, b, max){
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let p2 = null, p = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++){
    const c = [i]; let rijMin = i;
    for (let j = 1; j <= b.length; j++){
      c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (p2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) c[j] = Math.min(c[j], p2[j - 2] + 1);
      rijMin = Math.min(rijMin, c[j]);
    }
    if (rijMin > max) return max + 1;
    p2 = p; p = c;
  }
  return p[b.length];
}
const fouten = len => len >= 8 ? 2 : len >= 4 ? 1 : 0;
/* oude namen (ALIASES) blijven vindbaar, net onder de huidige naam: ‘kortsnavel…’ vindt de taigaboomkruiper */
const OUDE_NAMEN = new Map();
for (const [naam, id] of Object.entries(typeof ALIASES === "undefined" ? {} : ALIASES)) (OUDE_NAMEN.get(id) || OUDE_NAMEN.set(id, []).get(id)).push(naam);
/* lager is beter; -1 = past niet */
function zoekScore(q, x){
  const nu = zoekScoreNaam(q, x), oud = (OUDE_NAMEN.get(x.id) || []).map(n => zoekScoreNaam(q, { n, s: x.s })).filter(v => v >= 0).map(v => v + 0.5);
  const alle = [nu].concat(oud).filter(v => v >= 0);
  return alle.length ? Math.min(...alle) : -1;
}
function zoekScoreNaam(q, x){
  const a = norm(x.n), b = norm(x.s), wa = a.split(" "), wb = b.split(" "), alle = wa.concat(wb), qw = q.split(" ");
  if (a.startsWith(q)) return 0;
  if (wa.some(w => w.startsWith(q))) return 1;
  if (b.startsWith(q) || wb.some(w => w.startsWith(q))) return 2;
  if (qw.length > 1 && qw.every(t => alle.some(w => w.startsWith(t)))) return 2.5;   // "pleco aus", "kl bonte sp"
  if (a.includes(q) || b.includes(q)) return 3;
  /* tikfouten: vergelijk met het begin van de naam (even lang als wat je typte), of per woord */
  const k = fouten(q.replace(/ /g, "").length);
  if (!k) return -1;
  const begin = s2 => afstand(q, s2.slice(0, q.length), k) <= k || afstand(q, s2.slice(0, q.length + 1), k) <= k;
  if (begin(a) || begin(b)) return 4;
  if (qw.every(t => { const kt = fouten(t.length); return alle.some(w => w.startsWith(t) || (kt && (afstand(t, w.slice(0, t.length), kt) <= kt || afstand(t, w, kt) <= kt))); })) return 5;
  return -1;
}
/* Zoeken op een groep (update 12): ‘vlinder’, ‘hert’, ‘uil’, ‘roofvogel’ … geven alle soorten uit die groep (data/zoekgroepen.js).
   Eerst groepen waarvan een woord precies klopt; anders groepen waarvan een woord begint met wat je typte (vanaf 4 letters);
   anders met een tikfout (vanaf 5 letters). Leden van de groep komen direct na soorten waarvan de naam zelf begint met wat je typte. */
const ZG = (typeof ZOEKGROEPEN === "undefined" ? [] : ZOEKGROEPEN).map(z => {
  const kies = new Set(KIESBAAR.map(x => x.id));
  const ids = z.g ? KIESBAAR.filter(x => x.g === z.g).map(x => x.id) : (z.ids || []).filter(id => kies.has(id));
  return { naam: z.naam, wn: z.w.map(norm), ids: new Set(ids) };
}).filter(z => z.ids.size);
function zoekGroepen(q){
  if (!q || q.length < 3) return [];
  let gs = ZG.filter(z => z.wn.includes(q));
  if (!gs.length && q.length >= 4) gs = ZG.filter(z => z.wn.some(w => w.startsWith(q)));
  if (!gs.length && q.length >= 5){ const k = fouten(q.replace(/ /g, "").length); gs = ZG.filter(z => z.wn.some(w => afstand(q, w, k) <= k)); }
  return gs;
}
let optList = [], optIdx = -1;
function matchExact(v){
  const q = norm(v); if (!q) return null;
  const s = KIESBAAR.find(x => norm(x.n) === q || norm(x.s) === q || (OUDE_NAMEN.get(x.id) || []).some(n => norm(n) === q));
  return s ? s.id : null;
}
function closeOpts(){ $("gOpts").hidden = true; $("gInput").setAttribute("aria-expanded","false"); $("gInput").removeAttribute("aria-activedescendant"); optIdx = -1; }
function openOpts(){
  const q = norm($("gInput").value);
  if (!q){ closeOpts(); return; }
  const used = new Set(S.guesses), gs = zoekGroepen(q), inGroep = new Set(gs.flatMap(z => [...z.ids]));
  const score = x => { const s = zoekScore(q, x); return inGroep.has(x.id) ? (s < 0 ? 1.5 : Math.min(s, 1.5)) : s; };
  optList = KIESBAAR.filter(x => !used.has(x.id)).map(x => ({ x, score: score(x) }))
    .filter(o => o.score >= 0).sort((p, q2) => p.score - q2.score || p.x.n.length - q2.x.n.length || p.x.n.localeCompare(q2.x.n, "nl")).slice(0, gs.length ? 80 : 30).map(o => o.x);   /* gelijke score: korte namen eerst (‘muis’ → muizen vóór vleermuizen); lijst scrollt */
  const ul = $("gOpts");
  if (!optList.length){ ul.innerHTML = `<li aria-disabled="true"><span>Geen soort gevonden</span></li>`; ul.hidden = false; optIdx = -1; return; }
  optIdx = 0;
  /* Update 19: onder de groepskop alleen soorten die echt in de groep horen. Soorten die er alleen via hun naam bij komen
     (de kleine ijsvogelvlinder bij ‘vogel’, de bruinvis bij ‘vis’, de vroedmeesterpad bij ‘mees’) en soorten die
     alleen met een tikfout passen, staan los eronder, onder ‘Andere soorten’. */
  const leden = gs.length ? optList.filter(x => inGroep.has(x.id)) : [];
  let los = gs.length ? optList.filter(x => !inGroep.has(x.id)) : optList;
  /* Update 75 (16 november): soorten uit een verwante groep waarvan het groepswoord je zoekwoord bevat, krijgen een eigen
     kop in plaats van ‘Andere soorten’. Typ je ‘muis’, dan staan na de muizen de spitsmuizen en de vleermuizen elk onder
     hun eigen kop. Spitsmuizen horen biologisch niet bij de muizen, dus ze blijven een aparte groep. */
  const neven = [];
  if (leden.length){
    const kandidaten = ZG.filter(z => !gs.includes(z) && z.wn.some(w => w.includes(q)));
    for (const z of kandidaten){
      const ids = los.filter(x => z.ids.has(x.id));
      if (!ids.length) continue;
      neven.push({ z, ids }); los = los.filter(x => !z.ids.has(x.id));
    }
    neven.sort((a, b) => Math.min(...a.ids.map(x => score(x))) - Math.min(...b.ids.map(x => score(x))) || a.ids.length - b.ids.length);
  }
  optList = leden.concat(...neven.map(n => n.ids), los);
  const li = (x, i) => `<li role="option" id="opt${i}" data-n="${esc(x.id)}" aria-selected="${i === optIdx}"><span>${esc(x.n)}</span><i>${esc(x.s)}</i></li>`;
  const groepKop = (naam, n, cls) => `<li class="optgroep${cls ? " " + cls : ""}" role="presentation"><span>${esc(naam)}</span><i>${n} ${n === 1 ? "soort" : "soorten"}</i></li>`;
  let html = leden.length ? groepKop(gs.map((z, i) => i ? z.naam.toLowerCase() : z.naam).join(" en "), leden.length) + leden.map(li).join("") : "", nr = leden.length;
  for (const n of neven){ html += groepKop(n.z.naam, n.ids.length, "neven") + n.ids.map(x => li(x, nr++)).join(""); }
  if (leden.length && los.length) html += `<li class="optgroep los" role="presentation"><span>Andere soorten</span></li>`;
  html += los.map(x => li(x, nr++)).join("");
  ul.innerHTML = html;
  ul.hidden = false; $("gInput").setAttribute("aria-expanded","true"); $("gInput").setAttribute("aria-activedescendant","opt0");
}
function moveOpt(d){
  if (!optList.length) return;
  optIdx = (optIdx + d + optList.length) % optList.length;
  [...$("gOpts").querySelectorAll('[role="option"]')].forEach((li, i) => li.setAttribute("aria-selected", i === optIdx));
  $("gInput").setAttribute("aria-activedescendant", "opt" + optIdx);
  $("opt" + optIdx).scrollIntoView({ block:"nearest" });
}
function pick(id){ $("gInput").value = BY_ID.get(id).n; closeOpts(); $("gBtn").disabled = false; }
function commit(){
  if (!norm($("gInput").value)) return;
  const v = matchExact($("gInput").value);
  if (!v){ setMsg("Kies een soort uit de lijst.", true); return; }
  $("gInput").value = ""; $("gBtn").disabled = true; closeOpts();
  submitGuess(v);
  if (S.status === "playing") $("gInput").focus();
}

$("gInput").addEventListener("input", () => { openOpts(); $("gBtn").disabled = !matchExact($("gInput").value); if ($("msg").classList.contains("warn")) renderPips(); });
$("gInput").addEventListener("keydown", e => {
  if (e.key === "ArrowDown"){ e.preventDefault(); if ($("gOpts").hidden) openOpts(); else moveOpt(1); }
  else if (e.key === "ArrowUp"){ e.preventDefault(); moveOpt(-1); }
  else if (e.key === "Escape"){ closeOpts(); }
  else if (e.key === "Enter"){
    e.preventDefault();
    if (!$("gOpts").hidden && optIdx >= 0 && optList[optIdx]){ const n = optList[optIdx].id; if (matchExact($("gInput").value) === n) commit(); else pick(n); }
    else commit();
  }
});
$("gOpts").addEventListener("mousedown", e => { const li = e.target.closest("li[data-n]"); if (li){ e.preventDefault(); pick(li.dataset.n); $("gInput").focus(); } });
$("gInput").addEventListener("blur", () => setTimeout(closeOpts, 120));
$("gBtn").addEventListener("click", commit);
$("moreClue").addEventListener("click", moreClue);
/* update 82 (b): opgeven met twee tikken, zodat het niet per ongeluk gebeurt (geen pop-up) */
let geefOpT = null;
$("geefOp").addEventListener("click", () => {
  const b = $("geefOp");
  if (!b.classList.contains("zeker")){
    b.classList.add("zeker"); b.textContent = "Zeker? Tik nog een keer om op te geven";
    clearTimeout(geefOpT); geefOpT = setTimeout(() => { b.classList.remove("zeker"); b.textContent = "Geef deze oefencasus op"; }, 4000);
    return;
  }
  clearTimeout(geefOpT); b.classList.remove("zeker"); b.textContent = "Geef deze oefencasus op";
  geefOp();
});

/* ---------- modi ----------
   De gekozen modus (klassiek of expert) wordt onthouden. Schermwissels en het menu staan in js/kop.js. */
const pref = {
  get expert(){ try { return localStorage.getItem("vestigia:expert") === "1"; } catch(e){ return false; } },
  set expert(v){ try { localStorage.setItem("vestigia:expert", v ? "1" : "0"); } catch(e){} }
};
function showGame(){ setView("game"); render(); }
/* De dagcasus opent in de modus die je vandaag al speelde of begon (de andere zit op slot), anders in je voorkeur. */
function startDaily(){
  const wissel = S && S.mode !== "daily", eerst = begonnenModus(store.get(), todayIndex());   // update 82 (a)
  S = loadDaily(eerst === null ? pref.expert : eerst); showGame(); if (wissel) inBeeld($("gameView"));
}
/* keuze = { g, nieuw }; zonder keuze: bij oefenen dezelfde keuze als nu (of die je koos terwijl er nog een casus open
   stond), anders alle soorten. update 82 (b): staat er nog een oefencasus open, dan komt die terug. */
function startFree(keuze){
  const o = openOefen();
  if (o){
    const vorige = S && S.mode === "free" && S.t === o.t, volgende = keuze || (S && S.mode === "free" && S.volgende) || null;
    S = Object.assign(newGame("free", o.expert, o.target, o.k, 0), { t: o.t, guesses: (o.guesses || []).slice(), revealed: o.revealed || 1,
      groep: o.groep, nieuw: o.nieuw, ids: o.ids });
    if (volgende) S.volgende = volgende;
    showGame(); inBeeld($("gameView"));
    if (!vorige) window.scrollTo({ top:0, behavior:"auto" });
    const ander = keuze && (oefengroep(keuze.g) !== (o.groep || null) || !!keuze.nieuw !== !!o.nieuw || JSON.stringify(keuze.ids || null) !== JSON.stringify(o.ids || null));
    if (!keuze && vorige) return;
    toast(ander ? "Je hebt nog een oefencasus open. Determineer hem eerst of geef hem op; daarna oefen je met je nieuwe keuze."
      : "Je oefencasus staat nog open. Determineer hem of geef hem op voor een nieuwe.", { duur: 6000 });
    return;
  }
  keuze = keuze || (S && S.mode === "free" ? (S.volgende || { g: S.groep || null, nieuw: !!S.nieuw, ids: S.ids || null }) : { g: null, nieuw: false });
  const f = randomFree(S && S.target, keuze);
  S = newGame("free", pref.expert, f.id, f.k, 0);
  S.groep = oefengroep(keuze.g); S.nieuw = !!keuze.nieuw; S.ids = keuze.ids || null;
  S.t = Math.max(Date.now(), (store.get().oefenKlaar || 0) + 1);
  bewaarOefen();
  showGame(); inBeeld($("gameView")); window.scrollTo({ top:0, behavior:"auto" });
  if (f.alles) {
    const og = oefengroep(keuze.g), wat = og ? OEFENGROEPEN[og].naam.toLowerCase() : "soorten";
    const dex = store.get().dex || {}, wacht = TARGETS.filter(t => !oefenbaar(t.id) && inOefengroep(t, og) && !(dex[t.id] && dex[t.id].w > 0));
    toast(wacht.length ? `De rest van de ${wat} heb je al. ${wacht.map(t => t.n.charAt(0).toUpperCase() + t.n.slice(1)).join(" en ")} kun je pas oefenen na ${wacht.length > 1 ? "hun" : "zijn"} eerste dagcasus.`
      : `Je hebt alle ${wat} al in je ${NAAM.vestiarium}. Deze ken je dus al.`);
  }
}
/* update 82 (b): opgeven telt als niet gevonden */
function geefOp(){
  if (!S || S.mode !== "free" || S.status !== "playing") return;
  S.status = "lost"; S.opgegeven = true;
  recordStats(); recordDex(); recordLog(); freshResult = true;
  online.afterGame();
  saveDaily(); render();
}
function goDaily(){ if (S.mode === "daily") showGame(); else startDaily(); }
function goFree(){ if (S.mode !== "free" || S.status !== "playing") startFree(); else showGame(); }
/* Wisselen tussen klassiek en expert. Een oefencasus waarin nog niets geprobeerd is, wisselt ter plekke. */
function setMode(expert){
  if (S.mode === "duel") return;                    // update 16: de uitdager koos de modus
  if (S.mode === "daily"){
    const st = store.get(), af = eersteModus(st, todayIndex()) !== null, eerst = begonnenModus(st, todayIndex());
    if (eerst !== null && eerst !== expert){
      toast(`${af ? "Vandaag speelde je de dagcasus al" : "Je bent de dagcasus van vandaag al begonnen"} in ${eerst ? "expert" : "klassiek"}. ${expert ? "Expert" : "Klassiek"} is dezelfde casus, dus die zit tot morgen op slot.`,
        { label: "Oefenen", duur: 7000, run: () => { $("toast").hidden = true; pref.expert = expert; startFree(); } });
      return;
    }
  }
  pref.expert = expert;
  if (expert === S.expert) return;
  if (S.mode === "daily") startDaily();
  /* update 82 (a, b): een oefencasus wisselt alleen ter plekke als je nog niets deed; daarna ligt hij vast tot hij af is */
  else if (S.guesses.length === 0 && S.revealed <= 1 && S.status === "playing"){ S.expert = expert; S.revealed = 1; saveDaily(); render(); }
  else if (S.status === "playing"){ toast(`Je bent deze oefencasus al begonnen in ${S.expert ? "expert" : "klassiek"}. Determineer hem eerst of geef hem op; de volgende speel je in ${expert ? "expert" : "klassiek"}.`, { duur: 6000 }); }
  else startFree({ g: S.groep, nieuw: S.nieuw, ids: S.ids || null });
}
$("modeClassic").addEventListener("click", () => setMode(false));
$("modeExpert").addEventListener("click", () => setMode(true));
