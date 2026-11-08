/* Vestigia – online: ranglijst, synchronisatie */
"use strict";
/* ---------- online: ranglijst, synchronisatie, meldingen ---------- */
const online = (() => {
  const CFG = window.VESTIGIA_CONFIG || {};
  const enabled = !!(CFG.supabaseUrl && CFG.supabaseKey);
  const PKEY = "vestigia:player";
  const player = () => { try { return JSON.parse(localStorage.getItem(PKEY)); } catch(e){ return null; } };
  const setPlayer = p => { try { p ? localStorage.setItem(PKEY, JSON.stringify(p)) : localStorage.removeItem(PKEY); } catch(e){} };
  async function rpc(fn, args){
    const r = await fetch(CFG.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: Object.assign({ apikey: CFG.supabaseKey, "Content-Type": "application/json" }, /^eyJ/.test(CFG.supabaseKey) ? { Authorization: "Bearer " + CFG.supabaseKey } : {}),
      body: JSON.stringify(args || {})
    });
    const txt = await r.text(); let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch(e){}
    if (!r.ok) throw Object.assign(new Error((data && data.message) || r.statusText), { status: r.status });
    return data;
  }
  /* resultaten die offline zijn gespeeld, worden later alsnog verstuurd */
  const queue = () => { try { return JSON.parse(localStorage.getItem("vestigia:queue")) || []; } catch(e){ return []; } };
  const setQueue = q => { try { localStorage.setItem("vestigia:queue", JSON.stringify(q)); } catch(e){} };
  async function flush(){
    const p = player(); if (!enabled || !p) return;
    const q = queue(); if (!q.length) return;
    const rest = [];
    for (const item of q){
      try { await rpc("submit_result", Object.assign({ p_id: p.id, p_key: p.key }, item)); }
      catch(e){ if (!e.status || e.status >= 500) rest.push(item); }
    }
    setQueue(rest);
  }
  let syncT;
  function syncSoon(){
    const p = player(); if (!enabled || !p) return;
    clearTimeout(syncT);
    syncT = setTimeout(async () => {
      const st = store.get(), dex = st.dex || {};
      const found = TARGETS.filter(t => dex[t.id] && dex[t.id].w > 0).length;
      /* Supabase accepteert tot 200 kB; een heel lang logboek gaat dan alleen met de laatste 1000 spellen mee (lokaal blijft alles) */
      let prog = progressData(st, true);
      if (JSON.stringify(prog).length > 150000) prog.log = prog.log.slice(-1000);
      try { await rpc("save_progress", { p_id: p.id, p_key: p.key, p_progress: prog, p_found: found, p_trophies: earned(st).length }); }
      catch(e){}
    }, 800);
  }
  function afterGame(){
    if (!enabled || !player()) return;
    if (S.mode === "daily"){
      const q = queue(); q.push({ p_day: S.caseNo - 1, p_expert: S.expert, p_won: S.status === "won", p_tries: Math.min(usedTries(), MAX), p_clues: S.revealed });
      setQueue(q); flush().then(() => refreshWeek()).catch(() => {});
    }
    syncSoon();
  }
  /* ranglijst */
  let rankMode = "day";
  function weekStart(i){ const dow = (new Date(START + i * 864e5).getUTCDay() + 6) % 7; return i - dow; }
  /* Je plaats deze week, voor de tegel in de kop. Bewaard met het weeknummer, zodat hij offline nog te zien is
     (alleen in dezelfde week). */
  async function refreshWeek(){
    const p = player(); if (!enabled || !p) return null;
    const today = todayIndex(), w = weekStart(today);
    const rows = await rpc("leaderboard_range", { p_from: w, p_to: today });
    const pos = rows.findIndex(r => r.name === p.name);
    const info = { w, pos: pos + 1, n: rows.length, pts: pos >= 0 ? +rows[pos].points : 0 };
    try { localStorage.setItem("vestigia:week", JSON.stringify(info)); } catch(e){}
    renderTiles();
    return info;
  }
  const RANK_RULE = {
    day: "Punten uit de dagcasus van vandaag. Oefenen telt niet mee.",
    week: "Punten uit de dagcasussen van deze week (vanaf maandag). Oefenen telt niet mee.",
    all: "Alle punten uit de dagcasussen sinds de start. Oefenen telt niet mee.",
    dex: `Platen in het ${NAAM.vestiarium}, uit alle modi, ook uit oefenen.`
  };
  async function renderRank(){
    renderPlayerBox();
    const list = $("rankList");
    $("rankTabs").querySelectorAll(".chipbtn").forEach(b => b.setAttribute("aria-pressed", b.dataset.r === rankMode));
    $("rankRule").textContent = RANK_RULE[rankMode];
    if (!enabled){ list.innerHTML = `<li class="rankempty" style="display:block">De ranglijst is nog niet ingesteld voor deze versie van Vestigia.</li>`; return; }
    list.innerHTML = `<p class="rankempty">Ranglijst laden…</p>`;
    const me = (player() || {}).name, today = todayIndex();
    try {
      let rows, html;
      if (rankMode === "day"){
        rows = await rpc("leaderboard_day", { p_day: today });
        html = rows.map((r, i) => `<li class="${r.name === me ? "me" : ""}"><span class="pos">${i + 1}</span>
          <span class="who"><b>${esc(r.name)}</b>${r.expert ? `<span class="xbadge">expert</span>` : ""}<span>${r.won ? (r.expert ? `gedetermineerd na ${r.clues} waarneming${r.clues > 1 ? "en" : ""}` : `gedetermineerd in ${r.tries} ${r.tries === 1 ? "poging" : "pogingen"}`) : "niet gevonden"}</span></span>
          <span class="pts">${r.points}<small>punten</small></span></li>`).join("");
        if (!rows.length) html = `<p class="rankempty">Nog niemand heeft dagcasus nº ${today + 1} gespeeld. Ben jij de eerste?</p>`;
      } else if (rankMode === "week" || rankMode === "all"){
        const from = rankMode === "week" ? weekStart(today) : 0;
        rows = await rpc("leaderboard_range", { p_from: from, p_to: today });
        html = rows.map((r, i) => `<li class="${r.name === me ? "me" : ""}"><span class="pos">${i + 1}</span>
          <span class="who"><b>${esc(r.name)}</b><span>${r.won} van ${r.played} dagcasussen gedetermineerd</span></span>
          <span class="pts">${r.points}<small>punten</small></span></li>`).join("");
        if (!rows.length) html = `<p class="rankempty">${rankMode === "week" ? "Deze week" : "Tot nu toe"} zijn er nog geen dagcasussen gespeeld.</p>`;
      } else {
        rows = await rpc("leaderboard_dex");
        html = rows.map((r, i) => `<li class="${r.name === me ? "me" : ""}"><span class="pos">${i + 1}</span>
          <span class="who"><b>${esc(r.name)}</b><span>${r.trophies} ${r.trophies === 1 ? "trofee" : "trofeeën"}</span></span>
          <span class="pts">${r.found}<small>van ${TARGETS.length}</small></span></li>`).join("");
        if (!rows.length) html = `<p class="rankempty">Nog niemand heeft platen in zijn ${NAAM.vestiarium}.</p>`;
      }
      list.innerHTML = html;
      if (me){
        const wk = await refreshWeek();
        $("rankMe").innerHTML = `${wk ? wk.pts : 0}<small>jouw punten deze week</small>`;
      }
    } catch(e){
      list.innerHTML = `<p class="rankempty">De ranglijst is nu niet bereikbaar. Controleer je internetverbinding en probeer het later opnieuw.</p>`;
    }
  }
  function renderPlayerBox(){
    const box = $("playerBox"), p = player();
    if (!enabled){ box.hidden = true; return; }
    box.hidden = false;
    if (p){
      box.innerHTML = `<p>Je speelt als <b>${esc(p.name)}</b>. Je dagscores en je ${NAAM.vestiarium} worden automatisch bewaard.</p>
        <details><summary>Op een ander apparaat verder spelen</summary>
          <p class="fine" style="margin-top:8px">Kopieer je spelerscode en plak hem op je andere apparaat. Deel hem met niemand: met deze code speel je als jou.</p>
          <div class="row2"><button class="btn line" id="pcCopy">Kopieer spelerscode</button><span class="msg" id="pcMsg"></span></div>
        </details>`;
      $("pcCopy").onclick = () => {
        const code = "VSP-" + p.id + "." + p.key;
        try { navigator.clipboard.writeText(code).then(() => $("pcMsg").textContent = "Gekopieerd.", () => $("pcMsg").textContent = code); } catch(e){ $("pcMsg").textContent = code; }
      };
    } else {
      box.innerHTML = `<p><b>Doe mee aan de ranglijst.</b> Kies een spelersnaam. Je hebt geen account of e-mailadres nodig.</p>
        <div class="row2"><input id="pName" maxlength="20" placeholder="Bijvoorbeeld Tom of Dassenjager" autocomplete="nickname"><button class="btn" id="pJoin">Meedoen</button></div>
        <span class="msg" id="pMsg"></span>
        <details><summary>Ik heb al een spelerscode</summary>
          <div class="row2" style="margin-top:8px"><input id="pCode" placeholder="VSP-…"><button class="btn line" id="pLogin">Verder spelen</button></div>
        </details>`;
      $("pJoin").onclick = join;
      $("pName").addEventListener("keydown", e => { if (e.key === "Enter") join(); });
      $("pLogin").onclick = login;
    }
  }
  async function join(){
    const name = $("pName").value.trim();
    if (name.length < 2){ $("pMsg").textContent = "Kies een naam van minstens 2 tekens."; return; }
    $("pJoin").disabled = true; $("pMsg").textContent = "Even geduld…";
    try {
      const rows = await rpc("register_player", { p_name: name });
      const r = Array.isArray(rows) ? rows[0] : rows;
      setPlayer({ id: r.id, key: r.key, name });
      $("welcome").hidden = true;
      syncSoon(); renderRank(); toast(`Welkom, ${name}! Je doet nu mee aan de ranglijst.`);
    } catch(e){ $("pJoin").disabled = false; $("pMsg").textContent = e.status && e.status < 500 ? e.message : "Aanmelden lukte niet. Controleer je internetverbinding."; }
  }
  async function login(){
    const m = $("pCode").value.trim().match(/^VSP-([0-9a-f-]{36})\.([0-9a-f]{64})$/i);
    if (!m){ $("pMsg").textContent = "Deze spelerscode klopt niet. Kopieer hem opnieuw op je andere apparaat."; return; }
    try {
      const name = await rpc("player_name", { p_id: m[1], p_key: m[2] });
      setPlayer({ id: m[1], key: m[2], name });
      const prog = await rpc("get_progress", { p_id: m[1], p_key: m[2] });
      if (prog && (prog.dex || prog.dexId)) mergeProgressData(prog);
      $("welcome").hidden = true; syncSoon(); renderRank(); renderTiles(); toast(`Welkom terug, ${name}! Je ${NAAM.vestiarium} is bijgewerkt.`);
    } catch(e){ $("pMsg").textContent = "Deze spelerscode wordt niet herkend."; }
  }
  return { enabled, rpc, player, afterGame, flush, syncSoon, renderRank, refreshWeek, setMode: m => { rankMode = m; renderRank(); } };
})();

function showRank(mode){
  setView("rank");
  if (mode) online.setMode(mode); else online.renderRank();
  window.scrollTo({ top:0, behavior:"auto" });
}
$("rankTabs").querySelectorAll(".chipbtn").forEach(b => b.addEventListener("click", () => online.setMode(b.dataset.r)));
$("welcomeGo").addEventListener("click", () => { showRank(); setTimeout(() => $("pName") && $("pName").focus(), 50); });
$("welcomeLater").addEventListener("click", () => { $("welcome").hidden = true; try { localStorage.setItem("vestigia:welcomeLater", "1"); } catch(e){} });
if (online.enabled && !online.player() && !localStorage.getItem("vestigia:welcomeLater")) $("welcome").hidden = false;
if (!online.enabled) $("menuRank").parentElement.hidden = true;
window.addEventListener("online", () => online.flush());
online.flush().then(() => online.refreshWeek()).catch(() => {});

