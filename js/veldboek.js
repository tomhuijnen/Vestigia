/* Vestigia – veldboek: trofeeën, voortgangscode, felicitaties, platen */
"use strict";
/* ---------- trofeeën ---------- */
/* Titels, medailles en het bewaren ervan staan in js/kern.js (checkAwards). */
function awardLabel(k){
  if (k === "T:ALL") return ["Titel", TITLE_ALL];
  if (k.startsWith("T:")) return ["Titel", TITLES[k.slice(2)]];
  const t = BY_ID.get(k.slice(2));
  return ["Medaille", t ? t.n : k.slice(2)];
}
/* Medaillesoorten: de soorten in de hoogste zeldzaamheidsklasse, plus soorten waarvoor je al eerder een medaille kreeg. */
function medalSpecies(st){
  const ids = new Set(MEDALS.map(t => t.id));
  for (const k of earned(st)) if (k.startsWith("M:") && BY_ID.has(k.slice(2))) ids.add(k.slice(2));
  return TARGETS.filter(t => ids.has(t.id));
}
function rosette(color, on, label){
  const pts = [];
  for (let i = 0; i < 32; i++){ const r = i % 2 ? 34 : 38, a = Math.PI * i / 16; pts.push((40 + r*Math.cos(a)).toFixed(1) + "," + (40 + r*Math.sin(a)).toFixed(1)); }
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><polygon points="${pts.join(" ")}" fill="${on ? color : "none"}" stroke="${on ? color : "#b9c0b1"}" stroke-width="1.5" ${on ? "" : 'stroke-dasharray="3 3"'}/>
    <circle cx="40" cy="40" r="25" fill="${on ? "#f7f6f0" : "none"}" stroke="${on ? "#f7f6f0" : "#b9c0b1"}" stroke-width="1"/>
    <circle cx="40" cy="40" r="21" fill="none" stroke="${on ? color : "#d3d8cd"}" stroke-width="1"/>
    <text x="40" y="45.5" text-anchor="middle" font-family="Rubik, Arial, sans-serif" font-weight="600" font-size="16" fill="${on ? color : "#b9c0b1"}">${label}</text></svg>`;
}
function medal(on, no){
  return `<svg viewBox="0 0 80 80" aria-hidden="true">
    <path d="M27 4 L37 34 L30 38 L20 8 Z" fill="${on ? "#1c3326" : "#d3d8cd"}"/><path d="M53 4 L43 34 L50 38 L60 8 Z" fill="${on ? "#4a7a46" : "#e3e3da"}"/>
    <circle cx="40" cy="52" r="23" fill="${on ? "#c98d26" : "none"}" stroke="${on ? "#a8731b" : "#b9c0b1"}" stroke-width="2" ${on ? "" : 'stroke-dasharray="3 3"'}/>
    <circle cx="40" cy="52" r="17" fill="none" stroke="${on ? "#e8c06a" : "#d3d8cd"}" stroke-width="1.2"/>
    <text x="40" y="57" text-anchor="middle" font-family="Rubik, Arial, sans-serif" font-weight="600" font-size="13" fill="${on ? "#fbfaf4" : "#b9c0b1"}">${on ? "nº" + no : "?"}</text></svg>`;
}
function renderTrophies(st){
  const dex = st.dex || {}, got = id => dex[id] && dex[id].w > 0, have = earned(st);
  const cells = Object.entries(TITLES).map(([g, name]) => {
    const all = TARGETS.filter(t => t.g === g), f = all.filter(t => got(t.id)).length, on = have.includes("T:" + g);
    return `<div class="award${on ? " got" : " locked"}">${rosette(`var(--g-${g})`, on, all.length)}<span class="an">${name}</span>
      <span class="ac">${on ? "Alle " + GROUPS[g].toLowerCase() + " gedetermineerd" : `${f} van ${all.length} ${GROUPS[g].toLowerCase()}`}</span>
      <span class="ap"><i style="width:${100*f/all.length}%; background:var(--g-${g})"></i></span></div>`;
  });
  const fAll = TARGETS.filter(t => got(t.id)).length, onAll = have.includes("T:ALL");
  cells.push(`<div class="award${onAll ? " got" : " locked"}">${rosette("var(--ink)", onAll, TARGETS.length)}<span class="an">${TITLE_ALL}</span>
    <span class="ac">${onAll ? `Je ${NAAM.vestiarium} is compleet` : `${fAll} van ${TARGETS.length} soorten`}</span>
    <span class="ap"><i style="width:${100*fAll/TARGETS.length}%; background:var(--ink)"></i></span></div>`);
  $("titleRow").innerHTML = cells.join("");
  const medals = medalSpecies(st);
  $("medalRow").innerHTML = medals.map(t => {
    const on = have.includes("M:" + t.id);
    return `<div class="award${on ? " got" : " locked"}">${medal(on, dexNo(t.id))}<span class="an">${on ? esc(t.n) : "Zeldzame soort"}</span>
      <span class="ac">${on ? "<i>" + esc(t.s) + "</i>" : "Nog niet gevonden"}</span></div>`;
  }).join("");
  $("medalWord").textContent = telwoord(medals.length);
  $("trophCount").textContent = `${have.length} van ${Object.keys(TITLES).length + 1 + medals.length} behaald`;
}

/* ---------- voortgangscode ---------- */
/* De voortgang als één object, voor de voortgangscode en voor Supabase (save_progress).
   dex staat er ook op Nederlandse naam in, zodat een oudere versie van de app (vóór versie 2) hem nog kan lezen;
   nieuwe versies gebruiken dexId. Het logboek gaat alleen mee naar Supabase, niet in de code om over te typen. */
function progressData(st, withLog){
  const out = { v: STORE_V, dex: dexToNames(st.dex), dexId: st.dex || {}, stats: st.stats || null, statsX: st.statsX || null, awards: st.awards || {} };
  if (withLog){
    out.log = st.log || [];
    /* de dagcasussen van gisteren en vandaag, zodat je andere apparaten weten dat je ze al speelde */
    const i = todayIndex(), g = {};
    for (const [k, v] of Object.entries(st.games || {})) if (v && v.status !== "playing" && +(k.match(/^d(\d+)/) || [, -9])[1] >= i - 1) g[k] = v;
    out.games = g;
  }
  return out;
}
function progressCode(){
  const json = JSON.stringify(progressData(store.get(), false));
  return "VESTIGIA-" + btoa(unescape(encodeURIComponent(json)));
}
/* Voegt voortgang van een ander apparaat of uit Supabase toe. Werkt met het oude formaat (v1, op naam) en het nieuwe (v2).
   Er gaat nooit iets verloren: per plaat het beste van beide, titels blijven, logboeken worden samengevoegd. */
function mergeProgressData(data){
  if (!data || typeof data !== "object" || (typeof data.dex !== "object" && typeof data.dexId !== "object")) throw new Error("ongeldig");
  const st = store.get(); st.dex = st.dex || {};
  const lost = st.dexLost || {};
  const incoming = dexToIds(data.dexId && typeof data.dexId === "object" ? data.dexId : data.dex, lost);
  if (Object.keys(lost).length) st.dexLost = lost;
  for (const [id, e] of Object.entries(incoming)) st.dex[id] = mergeDexEntry(st.dex[id], e);
  for (const k of ["stats","statsX"]) if (data[k] && (!st[k] || (data[k].played || 0) > (st[k].played || 0))) st[k] = data[k];
  st.awards = st.awards || {};
  for (const [k, d] of Object.entries(data.awards || {})){
    const key = k.startsWith("M:") ? "M:" + (idOf(k.slice(2)) || k.slice(2)) : k;
    if (!st.awards[key] || (typeof d === "string" && d < st.awards[key])) st.awards[key] = d;
  }
  if (Array.isArray(data.log)) st.log = mergeLog(st.log, data.log);
  if (data.games && typeof data.games === "object"){
    st.games = st.games || {};
    for (const [k, g] of Object.entries(data.games)) if (g && g.status && g.status !== "playing" && (!st.games[k] || st.games[k].status === "playing" && !(st.games[k].guesses || []).length)) st.games[k] = g;
  }
  checkAwards(st, true);
  store.set(st);
}
function mergeProgress(code){
  const raw = code.trim().replace(/^VESTIGIA-/, "");
  mergeProgressData(JSON.parse(decodeURIComponent(escape(atob(raw)))));
}
/* Meerdere apparaten: met de online ranglijst een koppelcode (blijft gelijk), anders de oude voortgangscode (eenmalig). */
function renderCarry(){
  const p = online.enabled && online.player(), k = online.enabled && online.koppeling();
  $("carryTekst").innerHTML = !online.enabled
    ? `Zonder spelersnaam staat je ${NAAM.vestiarium} alleen in deze browser. Kopieer je voortgangscode en plak hem op je andere apparaat. Bestaande voortgang daar wordt samengevoegd, niet overschreven.`
    : p ? `Je speelt als <b>${esc(p.name)}</b>. Gebruik op je andere apparaat je spelerscode (in Mijn profiel); daarna blijven je apparaten vanzelf gelijk, elke keer dat je de app opent.`
    : k ? `Dit apparaat is gekoppeld. Kopieer de koppelcode voor nog een apparaat. Je voortgang blijft gelijk, elke keer dat je de app opent. In de ranglijst kom je pas als je een spelersnaam kiest.`
    : `Speel je op meer dan één apparaat? Kopieer de koppelcode en plak hem op je andere apparaat. Daarna blijven ze vanzelf gelijk, elke keer dat je de app opent. Je hebt geen spelersnaam nodig; in de ranglijst kom je pas als je er een kiest.`;
  $("codeCopy").textContent = online.enabled ? "Kopieer koppelcode" : "Kopieer voortgangscode";
  $("codeCopy").hidden = !!p;
  $("codeIn").placeholder = online.enabled ? "Plak hier de code van je andere apparaat" : "Plak hier een voortgangscode";
  $("codeIn").hidden = $("codeLoad").hidden = !!p;
}
$("codeCopy").addEventListener("click", async () => {
  if (online.enabled){
    $("codeMsg").textContent = "Even geduld…";
    try {
      const code = await online.koppelcode(); renderCarry();
      try { await navigator.clipboard.writeText(code); $("codeMsg").textContent = "Gekopieerd. Plak hem op je andere apparaat."; }
      catch(e){ $("codeIn").value = code; $("codeIn").select(); $("codeMsg").textContent = "Selecteer en kopieer de code hieronder."; }
    } catch(e){ $("codeMsg").textContent = "Koppelen lukt nu niet. Controleer je internetverbinding."; }
    return;
  }
  const code = progressCode();
  try { navigator.clipboard.writeText(code).then(() => { $("codeMsg").textContent = "Gekopieerd."; }, () => { $("codeIn").value = code; $("codeIn").select(); $("codeMsg").textContent = "Selecteer en kopieer de code hieronder."; }); }
  catch(e){ $("codeIn").value = code; $("codeIn").select(); }
});
$("codeLoad").addEventListener("click", async () => {
  if (online.enabled && /^\s*VSP-/i.test($("codeIn").value)){
    try {
      const naam = await online.koppel($("codeIn").value); $("codeIn").value = "";
      $("codeMsg").textContent = naam ? `Je speelt nu als ${naam}.` : "Gekoppeld. Je voortgang van beide apparaten is samengevoegd en blijft gelijk.";
      renderCarry(); renderDex(); renderMenu();
    } catch(e){ $("codeMsg").textContent = e.message === "naam" ? "Je hebt hier al een spelersnaam. Gebruik op je andere apparaat jouw spelerscode." : "Deze code wordt niet herkend. Controleer of je hem volledig hebt geplakt."; }
    return;
  }
  try { mergeProgress($("codeIn").value); $("codeIn").value = ""; $("codeMsg").textContent = "Voortgang toegevoegd."; renderDex(); online.syncSoon(); }
  catch(e){ $("codeMsg").textContent = "Deze code wordt niet herkend. Controleer of je hem volledig hebt geplakt."; }
});

/* ---------- felicitatie bij een nieuwe titel of medaille ---------- */
let awardQueue = [];
function showAwards(list){ awardQueue = list.slice(); nextAward(); }
function nextAward(){
  const k = awardQueue.shift();
  if (!k){ $("awardPop").hidden = true; return; }
  let badge, kind, name, text, extra = "";
  if (k.startsWith("M:")){
    const t = BY_ID.get(k.slice(2));
    badge = medal(true, dexNo(t.id)); kind = "Nieuwe medaille"; name = t.n;
    text = `Je hebt de ${esc(t.n.toLowerCase())} (<i>${esc(t.s)}</i>) gedetermineerd, een van de ${telwoord(medalSpecies(store.get()).length)} lastigste soorten van Vestigia. De medaille hangt nu in je ${NAAM.vestiarium}.`;
    /* bij elke medaillesoort hoort een avatar die je alleen zo kunt krijgen (niet te koop) */
    if (typeof AVATARS !== "undefined" && AVATARS[t.id]){
      const metNaam = online.enabled && online.player();
      extra = `<div class="awardavatar">${avatarSVG({ avatar: t.id }, "avatar")}<p><b>Nieuwe avatar vrijgespeeld:</b> de ${esc(t.n.toLowerCase())}. ${metNaam
        ? `Je vindt hem in <button class="linklike" id="awardProf">Mijn profiel</button>.`
        : `Kies een spelersnaam om hem te gebruiken in de ranglijst.`}</p></div>`;
    }
  } else if (k === "T:ALL"){
    badge = rosette("#2f3b40", true, TARGETS.length); kind = "Eindtitel"; name = TITLE_ALL;
    text = `Alle ${TARGETS.length} soorten staan in je ${NAAM.vestiarium}. Een groter compliment heeft Vestigia niet.`;
  } else {
    const g = k.slice(2), n = TARGETS.filter(t => t.g === g).length;
    badge = rosette(`var(--g-${g})`, true, n); kind = "Nieuwe titel"; name = TITLES[g];
    text = `Je hebt alle ${n} ${GROUPS[g].toLowerCase()} gedetermineerd. Vanaf nu ben je officieel <b>${esc(TITLES[g])}</b>.`;
  }
  const colors = ["#4b7a5e","#edfbe2","#e2b84e","#7a4e34","#2e7267","#a8731b"];
  const conf = Array.from({length:26}, (_, i) => `<i style="left:${(i*37)%100}%; background:${colors[i % colors.length]}; animation-delay:${(i%9)*0.07}s; transform:rotate(${i*23}deg)"></i>`).join("");
  $("awardSheet").innerHTML = `<div class="confetti" aria-hidden="true">${conf}</div>
    <span class="kind">${kind}</span><div class="badge">${badge}</div>
    <h2 id="awardH">Gefeliciteerd!</h2><p class="nm">${esc(name)}</p><p>${text}</p>${extra}
    <div class="actions"><button class="btn" id="awardNext">${awardQueue.length ? "Volgende" : "Verder spelen"}</button><button class="btn line" id="awardDex">Bekijk ${NAAM.vestiarium}</button></div>
    ${awardQueue.length ? `<span class="queue">Nog ${awardQueue.length} andere trofee${awardQueue.length > 1 ? "ën" : ""}</span>` : ""}`;
  $("awardPop").hidden = false;
  $("awardNext").focus();
  $("awardNext").onclick = nextAward;
  $("awardDex").onclick = () => { awardQueue = []; $("awardPop").hidden = true; showDex(); };
  if ($("awardProf")) $("awardProf").onclick = () => { awardQueue = []; $("awardPop").hidden = true; showProfiel(); };
}
$("awardPop").addEventListener("click", e => { if (e.target === $("awardPop")) nextAward(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("awardPop").hidden){ awardQueue = []; $("awardPop").hidden = true; } });

/* ---------- veldboek ---------- */
/* Platen in de volgorde van hun vaste nummer (veld no in de soortdata). */
const DEX = TARGETS.slice().sort((a, b) => a.no - b.no);
function dexNo(id){ const t = BY_ID.get(id); return String(t && t.no || 0).padStart(3, "0"); }
let dexFilter = "ALL", dexOnlyFound = false;
function showDex(){
  setView("dex");
  renderDex(); renderCarry(); Profiel.inVestiarium(); window.scrollTo({ top:0, behavior:"auto" });
}
function renderDex(){
  const st = store.get(), dex = st.dex || {};
  const found = DEX.filter(t => dex[t.id] && dex[t.id].w > 0).length;
  $("dexCount").innerHTML = `${found}<small>van ${DEX.length} gedetermineerd</small>`;
  renderTrophies(st);
  $("groupBars").innerHTML = Object.entries(GROUPS).map(([g, lab]) => {
    const all = TARGETS.filter(t => t.g === g), f = all.filter(t => dex[t.id] && dex[t.id].w > 0).length;
    return `<div class="gbar"><span>${lab}<i>${f}/${all.length}</i></span><div class="track"><div class="fill" style="width:${100*f/all.length}%; background:var(--g-${g})"></div></div></div>`;
  }).join("");
  $("dexFilters").innerHTML = [["ALL","Alles"]].concat(Object.entries(GROUPS)).map(([g, lab]) =>
    `<button class="chipbtn" data-g="${g}" aria-pressed="${dexFilter === g}">${lab}</button>`).join("")
    + `<span class="gap"></span><label class="switch-inline"><input type="checkbox" id="onlyFound"${dexOnlyFound ? " checked" : ""}> alleen gedetermineerd</label>`;
  $("dexFilters").querySelectorAll(".chipbtn").forEach(b => b.onclick = () => { dexFilter = b.dataset.g; renderDex(); });
  $("onlyFound").onchange = e => { dexOnlyFound = e.target.checked; renderDex(); };
  const medalIds = new Set(medalSpecies(st).map(t => t.id));
  const list = DEX.filter(t => (dexFilter === "ALL" || t.g === dexFilter) && (!dexOnlyFound || (dex[t.id] && dex[t.id].w > 0)));
  $("dexGrid").innerHTML = list.length ? list.map(t => {
    const e = dex[t.id], no = dexNo(t.id), band = `<div class="band" style="background:var(--g-${t.g})"><span>${GROUPS[t.g]}</span><b>nº ${no}</b></div>`;
    if (!e) return `<div class="plate unknown" aria-label="Plaat ${no}: nog niet waargenomen">${band}<div class="mid"><span class="q">?</span><span class="sc">nog niet waargenomen</span></div><div class="ft"><span>&nbsp;</span></div></div>`;
    const won = e.w > 0;
    const best = won ? [e.b ? `beste ${e.b}${e.b <= MAX ? "/" + MAX : ""}` : "", e.bx ? `expert ${e.bx}` : ""].filter(Boolean).join(" · ") : "nog niet gedetermineerd";
    return `<button class="plate${won ? "" : " seen"}${won && medalIds.has(t.id) ? " rare" : ""}" data-n="${esc(t.id)}">${band}<div class="mid"><span class="nm">${esc(t.n)}</span><span class="sc">${esc(t.s)}</span></div>
      <span class="stamp">${won ? "gedetermineerd" : "waargenomen"}</span><div class="ft"><span>${best}</span><span>${won ? `<b>${e.w}×</b>` : ""}</span></div></button>`;
  }).join("") : `<p class="dexempty">Nog geen platen in deze selectie. Speel een casus om je ${NAAM.vestiarium} te vullen.</p>`;
  $("dexGrid").querySelectorAll("button.plate").forEach(b => b.onclick = () => openPlate(b.dataset.n, b));
}
let plateReturn = null;
function openPlate(n, from){
  const t = BY_ID.get(n), e = (store.get().dex || {})[n] || {}, xs = BY_ID.get(t.x);
  /* de casussen die je van deze soort hebt gespeeld; zonder gegevens casus 1 */
  const ks = (e.ks && e.ks.length ? e.ks : [0]).filter(k => t.cs[k]);
  const traits = [["Leefgebied","h"],["Activiteit","a"],["Voedsel","v"],["Verblijf","b"],["Winter","w"]]
    .map(([lab,k]) => `<div><dt>${lab}</dt><dd>${t[k].map(x => LABELS[k][x]).join(", ")}</dd></div>`).join("")
    + `<div><dt>Lengte</dt><dd>± ${t.l.toLocaleString("nl-NL")} cm</dd></div>`;
  const fd = e.f ? new Date(e.f + "T12:00:00").toLocaleDateString("nl-NL", { day:"numeric", month:"long", year:"numeric" }) : null;
  $("plateSheet").innerHTML = `
    <div class="top"><span class="grp" style="background:var(--g-${t.g})">${GROUPS[t.g]} · nº ${dexNo(n)}</span><button class="closebtn" id="closePlate">Sluiten</button></div>
    <h2 id="plateH">${esc(t.n)}</h2>
    <p style="margin-top:-8px"><i>${esc(t.s)}</i></p>
    <p class="dexnote">${fd ? `Voor het eerst gedetermineerd op ${fd}. ` : "Nog niet gedetermineerd. "}${e.w ? `${e.w}× gedetermineerd${e.b ? `, beste score ${e.b}/${MAX}` : ""}${e.bx ? `, in expertmodus na ${e.bx} waarneming${e.bx > 1 ? "en" : ""}` : ""}.` : ""}</p>
    <h3>Status</h3><p><b>${esc(LABELS.r[t.r])}.</b> ${esc(REGIME_INFO[t.r])}</p>
    <h3>Kenmerken</h3><dl class="traits">${traits}</dl>
    ${ks.map(k => `<h3>Waarnemingen uit ${ks.length > 1 ? "casus " + (k + 1) : "de casus"}</h3><ol class="cl">${t.cs[k].wn.map((c, i) => `<li><span class="caps" style="color:var(--ink-2)">${CLUE_TYPES[i]}</span><br>${esc(c)}</li>`).join("")}</ol>`).join("")}
    <div class="confuse"><span class="caps">Verwar niet met</span><p><b>${esc(xs.n)}.</b> ${esc(t.t)}</p></div>
    <button class="reportbtn" id="repFromPlate">Klopt er iets niet? Meld een fout</button>`;
  plateReturn = from || null;
  $("plateView").hidden = false; $("closePlate").focus();
  $("closePlate").onclick = closePlate;
  $("repFromPlate").onclick = () => { closePlate(); openReport(n, from, ks[ks.length - 1]); };
}
function closePlate(){ $("plateView").hidden = true; if (plateReturn) plateReturn.focus(); }
$("plateView").addEventListener("click", e => { if (e.target === $("plateView")) closePlate(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("plateView").hidden) closePlate(); });

