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
  if (S.mode !== "daily") return;
  const st = store.get(); st.games = st.games || {};
  st.games[dailyKey(S.caseNo - 1, S.expert)] = { target:S.target, k:S.k, guesses:S.guesses, revealed:S.revealed, status:S.status };
  store.set(st);
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
   f.g = alleen deze diergroep (GROUPS), f.nieuw = alleen soorten die nog niet in je Vestiarium staan.
   Heb je in die keuze alles al, dan komt er toch een soort uit de groep, en meldt ‘alles’ dat. */
function randomFree(exclude, f){
  f = f || {};
  const st = store.get(), recent = st.recent || [], dex = st.dex || {};
  const upcoming = new Set(Array.from({length:8}, (_, k) => daily(todayIndex() + k).id));
  const groep = TARGETS.filter(t => (!f.g || t.g === f.g) && (!f.ids || f.ids.includes(t.id)));     // ids: alleen deze soorten (je verwarringen)
  const open = groep.filter(t => !(dex[t.id] && dex[t.id].w > 0));
  const vers = t => t.id !== exclude && !recent.includes(t.id) && !upcoming.has(t.id);
  const nietBinnenkort = t => t.id !== exclude && !upcoming.has(t.id);
  const stappen = (f.nieuw ? [[open, vers], [open, nietBinnenkort]] : [])
    .concat([[groep, vers], [groep, nietBinnenkort], [groep, t => t.id !== exclude], [groep, () => true], [TARGETS, () => true]]);
  let pool = [], stap = 0;
  for (; stap < stappen.length; stap++){ pool = stappen[stap][0].filter(stappen[stap][1]); if (pool.length) break; }
  const t = pool[Math.floor(Math.random() * pool.length)];
  st.recent = [t.id].concat(recent.filter(x => x !== t.id)).slice(0, Math.min(20, TARGETS.length - 2)); store.set(st);
  const seen = new Set(((st.dex || {})[t.id] || {}).ks || []);
  const fresh = t.cs.map((c, k) => k).filter(k => !seen.has(k));
  const ks = fresh.length ? fresh : t.cs.map((c, k) => k);
  return { id: t.id, k: ks[Math.floor(Math.random() * ks.length)], alles: !!f.nieuw && stap >= 2 };
}

function points(){
  if (S.status !== "won") return 0;
  return S.expert ? Math.max(1, 7 - S.revealed) : Math.max(1, 6 - usedTries());
}

/* ---------- acties ---------- */
function submitGuess(id){
  if (S.status !== "playing") return;
  const g = BY_ID.get(id);
  if (!g){ setMsg("Kies een soort uit de lijst.", true); return; }
  if (S.guesses.includes(id)){ setMsg("Die soort heb je al geprobeerd.", true); return; }
  S.guesses.push(id);
  freshRow = true;
  if (id === S.target){ S.status = "won"; }
  else if (isTwin(id)){ S.revealed = MAX; freshClue = MAX - 1; setTimeout(() => Spelen.tweelingEersteKeer(BY_ID.get(id)), 650); }
  else if (S.expert || usedTries() >= MAX){ S.status = "lost"; }
  else { S.revealed = Math.min(MAX, S.revealed + 1); freshClue = S.revealed - 1; }
  if (S.status !== "playing"){
    recordStats(); recordDex(); recordLog(); freshResult = true;
    if (S.status === "won") try { navigator.vibrate && navigator.vibrate([30, 50, 70]); } catch(e){}
    online.afterGame();
  }
  saveDaily(); render();
  if (S.newAwards && S.newAwards.length){ const a = S.newAwards; S.newAwards = []; setTimeout(() => showAwards(a), 700); }
  if (S.status !== "playing") document.getElementById("resultCard").scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"nearest"});
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
  $("notesFoot").hidden = !(S.expert && S.status === "playing");
  $("moreClue").disabled = S.revealed >= MAX;
  $("expertHint").textContent = `Je score is het aantal geopende waarnemingen: nu ${S.revealed}.`;
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
    if (r.soort === "tweeling") return `<li class="tip tweeling${nieuw}"><span class="tk" aria-label="tweelingsoort">≈</span><div><b>${esc(g.n)}</b> <i>${esc(g.s)}</i><p>Tweelingsoort van het antwoord: je zit er heel dicht bij. Deze gok telt niet mee. <button class="linklike tweelingWat">Wat is een tweelingsoort?</button></p></div></li>`;
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
function renderResult(){
  const card = $("resultCard"), card2 = $("resultCard2"), wrap = $("resultWrap");
  document.querySelector(".layout").classList.toggle("afgerond", S.status !== "playing");
  if (S.status === "playing"){ wrap.hidden = true; card.innerHTML = card2.innerHTML = ""; return; }
  const t = BY_ID.get(S.target), won = S.status === "won", xs = BY_ID.get(t.x);
  const traits = [["Leefgebied","h"],["Activiteit","a"],["Voedsel","v"],["Verblijf","b"],["Winter","w"]]
    .map(([lab,k]) => `<div><dt>${lab}</dt><dd>${t[k].map(x => LABELS[k][x]).join(", ")}</dd></div>`).join("")
    + `<div><dt>Lengte</dt><dd>± ${t.l.toLocaleString("nl-NL")} cm</dd></div>`;
  const score = S.expert
    ? (won ? `Gedetermineerd na ${S.revealed} van de ${MAX} aanwijzingen.` : `Je determinatie (${esc(S.guesses[0] || "")}) klopte niet.`)
    : (won ? `Gedetermineerd in ${usedTries()} van de ${MAX} pogingen.` : `Na ${MAX} pogingen niet gevonden.`);
  let stats = "";
  if (S.mode === "daily"){
    const s = dagStats(store.get());
    if (s) stats = `<span class="caps">Jouw dagcasussen</span><div class="stats"><div><b>${s.played}</b>gespeeld</div><div><b>${s.played ? Math.round(100*s.won/s.played) : 0}%</b>gedetermineerd</div><div><b>${s.streak}</b>huidige reeks</div><div><b>${s.best}</b>langste reeks</div></div>`;
  }
  card.className = "account" + (won ? "" : " lost") + (freshResult && !matchMedia("(prefers-reduced-motion: reduce)").matches ? " resultin" : "");
  card2.className = "account vervolg" + (card.classList.contains("resultin") ? " resultin" : "");
  const ontdek = won && S.nieuwePlaat && freshResult;     // alleen direct na het spel, niet bij later terugkijken
  freshResult = false;
  card.innerHTML = `
    <span class="verdict caps">${won ? "Goed gedetermineerd" : "Niet gedetermineerd · het was"}</span>
    <h3>${esc(t.n)}<i>${esc(t.s)}</i></h3>
    ${!won && S.mode === "daily" ? `<p class="jammer">Jammer, niet gelukt vandaag. Kom morgen terug voor een nieuwe dagcasus!</p>` : ""}
    <p class="eikelline" id="eikelGain" hidden></p>
    <p>${score}${S.mode === "daily" ? ` <span class="ptsline">${eersteModus(store.get(), S.caseNo - 1) === !!S.expert
      ? `${points() ? "+" + points() + " punt" + (points() > 1 ? "en" : "") : "0 punten"} voor de ranglijst`
      : `telt niet voor de ranglijst: je speelde deze casus vandaag al in ${S.expert ? "klassiek" : "expert"}`}</span>` : ""}</p>
    ${toelichting() ? `<div class="toelrij"><button class="toelbtn" id="toelBtn" aria-expanded="false" aria-controls="toelBox"><svg aria-hidden="true" viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="8" r="6.4"/><path d="M8 7.3v4M8 4.9v.1"/></svg><span>Toelichting</span><i class="pijl" aria-hidden="true"></i></button></div>
    <div class="toelbox" id="toelBox" hidden><span class="caps">Waarom ${esc(/^Europese/.test(t.n) ? t.n : t.n.toLowerCase())}?</span><p>${esc(toelichting())}</p></div>` : ""}
    <details class="status-line"><summary><span class="caps">Status</span> <b>${esc(LABELS.r[t.r])}</b><span class="meer">uitleg</span></summary><p>${esc(REGIME_INFO[t.r])}</p></details>
    <dl class="traits">${traits}</dl>
    ${curCase().sl ? `<div class="sleutelbox"><span class="caps">Typisch ${esc(/^Europese/.test(t.n) ? t.n : t.n.toLowerCase())}</span><p>${esc(curCase().sl.t)}</p></div>` : ""}
    <div class="confuse"><span class="caps">Verwar niet met</span><p><b>${esc(xs.n)}.</b> ${S.guesses.includes(t.x) ? "Die soort heb je in deze casus ook geprobeerd. " : ""}${esc(t.t)}</p></div>
    ${(S.newAwards || []).map(k => { const [kind, name] = awardLabel(k); return `<div class="awardnote"><span class="caps">Nieuwe ${kind.toLowerCase()}</span><b>${esc(name)}</b></div>`; }).join("")}
    ${ontdek ? ontdekPlaat(t) : `<p class="dexnote">${won ? `Plaat <b>nº ${dexNo(t.id)}</b> staat nu in je ${NAAM.vestiarium}.` : `Genoteerd als waargenomen in je ${NAAM.vestiarium} (nº ${dexNo(t.id)}).`} <button class="linklike" id="toDex">Open het ${NAAM.vestiarium}</button></p>`}
    <button class="reportbtn" id="repFromResult">Klopt er iets niet in deze casus? Meld een fout</button>`;
  const vw = S.mode === "daily" ? veldweek(S.caseNo - 1) : null;
  const vwKaart = vw ? stempelkaart(store.get(), vw) : null;
  card2.innerHTML = `
    <section class="xpblok" id="xpBlok" aria-label="Ervaringspunten" hidden></section>
    ${vw ? `<div class="vwresult"><span class="caps">Veldweek · ${esc(vw.titel)}${vw.demo ? " · voorbeeld" : ""}</span>${vwKaart.html}<p class="fine">${vwKaart.n === 7 ? "Alle zeven dagen gespeeld: +25 eikels." : `${vwKaart.n} van 7 dagen gespeeld${vwKaart.n >= 5 ? " (+10 eikels; met alle zeven +25)" : ""}.`}</p></div>` : ""}
    ${stats}
    ${S.mode === "free" ? `<p class="oefenkeuze">Je oefent met ${esc(Spelen.omschrijving({ g: S.groep, nieuw: S.nieuw, ids: S.ids }))}. <button class="linklike" id="oefenWijzig">Wijzig</button></p>` : ""}
    <div class="actions">
      <button class="btn" id="copyBtn">Deel resultaat</button>
      <button class="btn line" id="nextBtn">${S.mode === "daily" ? "Speel een oefencasus" : "Nieuwe casus"}</button>
      <span class="msg" id="copyMsg"></span>
    </div>
    ${S.mode === "daily" && online.enabled ? `<p class="inviteline">Samen spelen is leuker. <button class="linklike" id="inviteFromResult">Nodig een speler uit</button></p>` : ""}
`;
  wrap.hidden = false;
  $("copyBtn").onclick = () => shareOut(resultShare(), $("copyMsg"), card);
  $("nextBtn").onclick = () => startFree();
  if ($("oefenWijzig")) $("oefenWijzig").onclick = () => Spelen.wijzig();
  $("toDex").onclick = () => showDex(ontdek ? t.id : undefined);
  $("repFromResult").onclick = e => openReport(t.id, e.currentTarget, S.k);
  if ($("toelBtn")) $("toelBtn").onclick = () => {
    const box = $("toelBox"), open = box.hidden;
    box.hidden = !open; $("toelBtn").setAttribute("aria-expanded", String(open));
    if (open) box.classList.remove("toelin"), void box.offsetWidth, box.classList.add("toelin");
  };
  if ($("inviteFromResult")) $("inviteFromResult").onclick = () => League.openUitnodigen();
  Profiel.toonWinst();
  if (typeof Levels !== "undefined") Levels.toonInResultaat();
}

function renderPips(){
  const n = S.expert ? 1 : MAX, real = S.guesses.filter(g => !isTwin(g));
  let h = "";
  for (let i = 0; i < n; i++){
    const used = i < real.length, hit = used && real[i] === S.target;
    h += `<span class="dot${hit ? " hit" : used ? " used" : ""}"></span>`;
  }
  $("pips").innerHTML = h;
  if (S.status === "playing"){
    const left = n - real.length, twinNow = S.guesses.length && isTwin(S.guesses[S.guesses.length - 1]);
    if (twinNow) setMsg("Tweelingsoort! Telt niet mee; alle waarnemingen zijn open.", false);
    else setMsg(S.expert ? "Je hebt één determinatie. Open eerst zoveel waarnemingen als je nodig denkt te hebben." : `Nog ${left} ${left === 1 ? "poging" : "pogingen"}.`, false);
    const st = store.get(), eerste = S.mode === "daily" ? eersteModus(st, S.caseNo - 1) : null;
    if (eerste !== null && eerste !== !!S.expert) setMsg(`Deze casus speelde je vandaag al in ${eerste ? "expert" : "klassiek"}. Je score telt nu niet voor de ranglijst.`, false);
    $("leftLabel").textContent = S.expert ? "1 poging" : `poging ${real.length + 1} van ${MAX}`;
  } else { setMsg(S.status === "won" ? "Casus afgerond." : "Casus afgesloten.", false); $("leftLabel").textContent = "afgerond"; }
}

function renderHead(){
  renderKop();
  const inp = $("gInput"); inp.disabled = S.status !== "playing";
  if (S.status !== "playing"){ inp.value = ""; closeOpts(); }
  $("gBtn").disabled = !matchExact(inp.value) || S.status !== "playing";
}

function render(){ renderHead(); renderClues(); renderGrid(); renderPips(); renderResult(); }

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
/* lager is beter; -1 = past niet */
function zoekScore(q, x){
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
let optList = [], optIdx = -1;
function matchExact(v){
  const q = norm(v); if (!q) return null;
  const s = KIESBAAR.find(x => norm(x.n) === q || norm(x.s) === q);
  return s ? s.id : null;
}
function closeOpts(){ $("gOpts").hidden = true; $("gInput").setAttribute("aria-expanded","false"); $("gInput").removeAttribute("aria-activedescendant"); optIdx = -1; }
function openOpts(){
  const q = norm($("gInput").value);
  if (!q){ closeOpts(); return; }
  const used = new Set(S.guesses);
  optList = KIESBAAR.filter(x => !used.has(x.id)).map(x => ({ x, score: zoekScore(q, x) }))
    .filter(o => o.score >= 0).sort((p, q2) => p.score - q2.score || p.x.n.length - q2.x.n.length || p.x.n.localeCompare(q2.x.n, "nl")).slice(0, 30).map(o => o.x);   /* gelijke score: korte namen eerst (‘muis’ → muizen vóór vleermuizen); lijst scrollt */
  const ul = $("gOpts");
  if (!optList.length){ ul.innerHTML = `<li aria-disabled="true"><span>Geen soort gevonden</span></li>`; ul.hidden = false; optIdx = -1; return; }
  optIdx = 0;
  ul.innerHTML = optList.map((x, i) => `<li role="option" id="opt${i}" data-n="${esc(x.id)}" aria-selected="${i === optIdx}"><span>${esc(x.n)}</span><i>${esc(x.s)}</i></li>`).join("");
  ul.hidden = false; $("gInput").setAttribute("aria-expanded","true"); $("gInput").setAttribute("aria-activedescendant","opt0");
}
function moveOpt(d){
  if (!optList.length) return;
  optIdx = (optIdx + d + optList.length) % optList.length;
  [...$("gOpts").children].forEach((li, i) => li.setAttribute("aria-selected", i === optIdx));
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

/* ---------- modi ----------
   De gekozen modus (klassiek of expert) wordt onthouden. Schermwissels en het menu staan in js/kop.js. */
const pref = {
  get expert(){ try { return localStorage.getItem("vestigia:expert") === "1"; } catch(e){ return false; } },
  set expert(v){ try { localStorage.setItem("vestigia:expert", v ? "1" : "0"); } catch(e){} }
};
function showGame(){ setView("game"); render(); }
/* De dagcasus opent in de modus die je vandaag al speelde (de andere zit op slot), anders in je voorkeur. */
function startDaily(){
  const wissel = S && S.mode !== "daily", eerst = eersteModus(store.get(), todayIndex());
  S = loadDaily(eerst === null ? pref.expert : eerst); showGame(); if (wissel) inBeeld($("gameView"));
}
/* keuze = { g, nieuw }; zonder keuze: bij oefenen dezelfde keuze als nu, anders alle soorten */
function startFree(keuze){
  keuze = keuze || (S && S.mode === "free" ? { g: S.groep || null, nieuw: !!S.nieuw, ids: S.ids || null } : { g: null, nieuw: false });
  const f = randomFree(S && S.target, keuze);
  S = newGame("free", pref.expert, f.id, f.k, 0);
  S.groep = keuze.g || null; S.nieuw = !!keuze.nieuw; S.ids = keuze.ids || null;
  showGame(); inBeeld($("gameView")); window.scrollTo({ top:0, behavior:"auto" });
  if (f.alles) toast(`Je hebt alle ${keuze.g ? GROUPS[keuze.g].toLowerCase() : "soorten"} al in je ${NAAM.vestiarium}. Deze ken je dus al.`);
}
function goDaily(){ if (S.mode === "daily") showGame(); else startDaily(); }
function goFree(){ if (S.mode !== "free" || S.status !== "playing") startFree(); else showGame(); }
/* Wisselen tussen klassiek en expert. Een oefencasus waarin nog niets geprobeerd is, wisselt ter plekke. */
function setMode(expert){
  if (S.mode === "daily"){
    const eerst = eersteModus(store.get(), todayIndex());
    if (eerst !== null && eerst !== expert){
      toast(`Vandaag speelde je de dagcasus al in ${eerst ? "expert" : "klassiek"}. ${expert ? "Expert" : "Klassiek"} is dezelfde casus, dus die zit tot morgen op slot.`,
        { label: "Oefenen", duur: 7000, run: () => { $("toast").hidden = true; pref.expert = expert; startFree(); } });
      return;
    }
  }
  pref.expert = expert;
  if (expert === S.expert) return;
  if (S.mode === "daily") startDaily();
  else if (S.guesses.length === 0 && S.status === "playing"){ S.expert = expert; S.revealed = 1; render(); }
  else startFree({ g: S.groep, nieuw: S.nieuw, ids: S.ids || null });
}
$("modeClassic").addEventListener("click", () => setMode(false));
$("modeExpert").addEventListener("click", () => setMode(true));
