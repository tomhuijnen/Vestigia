/* Vestigia – spel: toestand, acties, weergave, invoer, modi */
"use strict";
/* ---------- toestand ---------- */
let S = null;          // {mode, expert, target(id), k(casus), guesses[ids], revealed, status, caseNo(dagnummer + 1)}
let freshClue = -1, freshRow = false;

const isTwin = id => BY_ID.get(S.target).twin === id;
const usedTries = () => S.guesses.filter(id => !isTwin(id)).length;
const curCase = () => caseOf(S.target, S.k);

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
    x: !!S.expert, w: S.status === "won", p: Math.min(usedTries(), MAX), c: S.revealed, tw });
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
/* Oefenen: een soort die niet net geweest is en niet binnenkort dagcasus wordt, met bij voorkeur een casus die je nog niet kent. */
function randomFree(exclude){
  const st = store.get(); const recent = st.recent || [];
  const upcoming = new Set(Array.from({length:8}, (_, k) => daily(todayIndex() + k).id));
  let pool = TARGETS.filter(t => t.id !== exclude && !recent.includes(t.id) && !upcoming.has(t.id));
  if (!pool.length) pool = TARGETS.filter(t => t.id !== exclude && !upcoming.has(t.id));
  if (!pool.length) pool = TARGETS.filter(t => t.id !== exclude);
  const t = pool[Math.floor(Math.random() * pool.length)];
  st.recent = [t.id].concat(recent).slice(0, Math.min(20, TARGETS.length - 2)); store.set(st);
  const seen = new Set(((st.dex || {})[t.id] || {}).ks || []);
  const fresh = t.cs.map((c, k) => k).filter(k => !seen.has(k));
  const ks = fresh.length ? fresh : t.cs.map((c, k) => k);
  return { id: t.id, k: ks[Math.floor(Math.random() * ks.length)] };
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
  else if (isTwin(id)){ S.revealed = MAX; freshClue = MAX - 1; }
  else if (S.expert || usedTries() >= MAX){ S.status = "lost"; }
  else { S.revealed = Math.min(MAX, S.revealed + 1); freshClue = S.revealed - 1; }
  if (S.status !== "playing"){
    recordStats(); recordDex(); recordLog();
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
  $("clues").innerHTML = curCase().wn.map((txt, i) => {
    const open = i < S.revealed || showAll;
    const fresh = i === freshClue ? " fresh" : "";
    return `<li class="clue${open ? "" : " locked"}${fresh}"><span class="num">${i+1}</span><div><span class="lab caps">${CLUE_TYPES[i]}</span><p>${open ? esc(txt) : "nog niet waargenomen"}</p></div></li>`;
  }).join("");
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
function renderGrid(){
  const t = BY_ID.get(S.target);
  const rows = S.guesses.slice().reverse().map((n, idx) => {
    const g = BY_ID.get(n), c = compare(g, t);
    const cls = (n === S.target ? "win" : "") + (isTwin(n) ? " twin" : "") + (idx === 0 && freshRow ? " enter" : "");
    return `<tr class="${cls.trim()}"><td class="name">${esc(g.n)}<i>${esc(g.s)}</i>${isTwin(n) ? `<span class="twintag">tweelingsoort · telt niet mee</span>` : ""}</td>${COLS.map(k => cell(k, c[k])).join("")}</tr>`;
  });
  $("gridBody").innerHTML = rows.join("");
  /* kaartweergave voor smalle schermen */
  $("gridCards").innerHTML = S.guesses.slice().reverse().map((n, idx) => {
    const g = BY_ID.get(n), c = compare(g, t);
    const cls = (n === S.target ? " win" : "") + (isTwin(n) ? " twin" : "") + (idx === 0 && freshRow ? " enter" : "");
    return `<div class="gcard${cls}"><div class="gname"><b>${esc(g.n)}</b> <i>${esc(g.s)}</i>${isTwin(n) ? `<span class="twintag">tweelingsoort · telt niet mee</span>` : ""}</div>
      <div class="gcells">${COLS.map(k => { const x = c[k], sym = x.cls === "ok" ? "✓" : x.cls === "part" ? "~" : "✕";
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
function resultShare(extra){
  const t = BY_ID.get(S.target), won = S.status === "won";
  const head = `Vestigia ${S.mode === "daily" ? "nº " + S.caseNo : "· oefencasus"}`;
  const emo = { ok:"🟩", part:"🟨", no:"⬜" };
  let body;
  if (S.expert){
    const clues = "🔎".repeat(S.revealed) + "▫️".repeat(MAX - S.revealed);
    body = `${head} · expert\n${clues} – ${won ? `gedetermineerd na ${S.revealed} van ${MAX} waarnemingen` : "niet gedetermineerd"}`;
  } else {
    const rows = S.guesses.map(n => {
      const c = compare(BY_ID.get(n), t);
      return COLS.map(k => k === "l" && c.l.cls !== "ok" ? (c.l.arrow === "↑" ? "⬆️" : "⬇️") : emo[c[k].cls]).join("") + (isTwin(n) ? " ≈ tweeling" : "");
    });
    body = `${head} · ${won ? usedTries() : "X"}/${MAX}\n${rows.join("\n")}\nleefgebied · activiteit · voedsel · verblijf · winter · lengte · regime`;
  }
  return { text: body, url: appLink(extra && extra.params) };
}
/* Deelt via het deelmenu van de telefoon, anders kopiëren. msgEl krijgt de melding, boxParent een tekstvak als kopiëren niet lukt. */
function shareOut({ text, url }, msgEl, boxParent){
  const full = `${text}\nSpeel mee: ${url}`;
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

function renderResult(){
  const card = $("resultCard");
  if (S.status === "playing"){ card.hidden = true; card.innerHTML = ""; return; }
  const t = BY_ID.get(S.target), won = S.status === "won", xs = BY_ID.get(t.x);
  const traits = [["Leefgebied","h"],["Activiteit","a"],["Voedsel","v"],["Verblijf","b"],["Winter","w"]]
    .map(([lab,k]) => `<div><dt>${lab}</dt><dd>${t[k].map(x => LABELS[k][x]).join(", ")}</dd></div>`).join("")
    + `<div><dt>Lengte</dt><dd>± ${t.l.toLocaleString("nl-NL")} cm</dd></div>`;
  const score = S.expert
    ? (won ? `Gedetermineerd na ${S.revealed} van de ${MAX} aanwijzingen.` : `Je determinatie (${esc(S.guesses[0] || "")}) klopte niet.`)
    : (won ? `Gedetermineerd in ${usedTries()} van de ${MAX} pogingen.` : `Na ${MAX} pogingen niet gevonden.`);
  let stats = "";
  if (S.mode === "daily"){
    const s = store.get()[S.expert ? "statsX" : "stats"];
    if (s) stats = `<div class="stats"><div><b>${s.played}</b>gespeeld</div><div><b>${s.played ? Math.round(100*s.won/s.played) : 0}%</b>gedetermineerd</div><div><b>${s.streak}</b>huidige reeks</div><div><b>${s.best}</b>langste reeks</div></div>`;
  }
  card.className = "account" + (won ? "" : " lost");
  card.innerHTML = `
    <span class="verdict caps">${won ? "Goed gedetermineerd" : "Niet gedetermineerd · het was"}</span>
    <h3>${esc(t.n)}<i>${esc(t.s)}</i></h3>
    <p class="eikelline" id="eikelGain" hidden></p>
    <p>${score}${S.mode === "daily" ? ` <span class="ptsline">${points() ? "+" + points() + " punt" + (points() > 1 ? "en" : "") : "0 punten"} voor de ranglijst</span>` : ""}</p>
    <div class="status-line"><span class="caps">Status</span><p><b>${esc(LABELS.r[t.r])}.</b> ${esc(REGIME_INFO[t.r])}</p></div>
    <dl class="traits">${traits}</dl>
    <div class="confuse"><span class="caps">Verwar niet met</span><p><b>${esc(xs.n)}.</b> ${S.guesses.includes(t.x) ? "Die soort heb je in deze casus ook geprobeerd. " : ""}${esc(t.t)}</p></div>
    ${(S.newAwards || []).map(k => { const [kind, name] = awardLabel(k); return `<div class="awardnote"><span class="caps">Nieuwe ${kind.toLowerCase()}</span><b>${esc(name)}</b></div>`; }).join("")}
    <p class="dexnote">${won ? `Plaat <b>nº ${dexNo(t.id)}</b> staat nu in je ${NAAM.vestiarium}.` : `Genoteerd als waargenomen in je ${NAAM.vestiarium} (nº ${dexNo(t.id)}).`} <button class="linklike" id="toDex">Open het ${NAAM.vestiarium}</button></p>
    ${stats}
    <div class="actions">
      <button class="btn" id="copyBtn">Deel resultaat</button>
      <button class="btn line" id="nextBtn">${S.mode === "daily" ? "Speel een oefencasus" : "Nieuwe casus"}</button>
      <span class="msg" id="copyMsg"></span>
    </div>
    ${S.mode === "daily" && online.enabled ? `<p class="inviteline">Samen spelen is leuker. <button class="linklike" id="inviteFromResult">Nodig een speler uit</button></p>` : ""}
    <button class="reportbtn" id="repFromResult">Klopt er iets niet in deze casus? Meld een fout</button>`;
  card.hidden = false;
  $("copyBtn").onclick = () => shareOut(resultShare(), $("copyMsg"), card);
  $("nextBtn").onclick = () => startFree();
  $("toDex").onclick = () => showDex();
  $("repFromResult").onclick = e => openReport(t.id, e.currentTarget, S.k);
  if ($("inviteFromResult")) $("inviteFromResult").onclick = () => League.openUitnodigen();
  Profiel.toonWinst();
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
    if (twinNow) setMsg("Tweelingsoort! Je zit er heel dicht bij. Deze poging telt niet mee, en alle waarnemingen zijn nu open.", false);
    else setMsg(S.expert ? "Je hebt één determinatie. Open eerst zoveel waarnemingen als je nodig denkt te hebben." : `Nog ${left} ${left === 1 ? "poging" : "pogingen"}.`, false);
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

/* ---------- autocomplete ---------- */
let optList = [], optIdx = -1;
function matchExact(v){
  const q = norm(v); if (!q) return null;
  const s = SPECIES.find(x => norm(x.n) === q || norm(x.s) === q);
  return s ? s.id : null;
}
function closeOpts(){ $("gOpts").hidden = true; $("gInput").setAttribute("aria-expanded","false"); $("gInput").removeAttribute("aria-activedescendant"); optIdx = -1; }
function openOpts(){
  const q = norm($("gInput").value);
  if (!q){ closeOpts(); return; }
  const used = new Set(S.guesses);
  optList = SPECIES.filter(x => !used.has(x.id)).map(x => {
    const a = norm(x.n), b = norm(x.s);
    let score = -1;
    if (a.startsWith(q)) score = 0; else if (a.split(" ").some(w => w.startsWith(q))) score = 1;
    else if (b.startsWith(q) || b.split(" ").some(w => w.startsWith(q))) score = 2; else if (a.includes(q)) score = 3;
    return { x, score };
  }).filter(o => o.score >= 0).sort((p, q2) => p.score - q2.score || p.x.n.localeCompare(q2.x.n, "nl")).slice(0, 8).map(o => o.x);
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
function startDaily(){ S = loadDaily(pref.expert); showGame(); }
function startFree(){
  const f = randomFree(S && S.target);
  S = newGame("free", pref.expert, f.id, f.k, 0);
  showGame(); window.scrollTo({ top:0, behavior:"auto" });
}
function goDaily(){ if (S.mode === "daily") showGame(); else startDaily(); }
function goFree(){ if (S.mode !== "free" || S.status !== "playing") startFree(); else showGame(); }
/* Wisselen tussen klassiek en expert. Een oefencasus waarin nog niets geprobeerd is, wisselt ter plekke. */
function setMode(expert){
  pref.expert = expert;
  if (expert === S.expert) return;
  if (S.mode === "daily") startDaily();
  else if (S.guesses.length === 0 && S.status === "playing"){ S.expert = expert; S.revealed = 1; render(); }
  else startFree();
}
$("modeClassic").addEventListener("click", () => setMode(false));
$("modeExpert").addEventListener("click", () => setMode(true));
