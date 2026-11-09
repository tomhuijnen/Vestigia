/* Vestigia – online: ranglijst, synchronisatie */
"use strict";
/* ---------- online: ranglijst, synchronisatie, meldingen ---------- */
const online = (() => {
  const CFG = window.VESTIGIA_CONFIG || {};
  const enabled = !!(CFG.supabaseUrl && CFG.supabaseKey);
  const PKEY = "vestigia:player";
  const player = () => { try { return JSON.parse(localStorage.getItem(PKEY)); } catch(e){ return null; } };
  const setPlayer = p => { try { p ? localStorage.setItem(PKEY, JSON.stringify(p)) : localStorage.removeItem(PKEY); } catch(e){} };
  /* Koppeling zonder naam: een verborgen account (niet in de ranglijst) waarmee je apparaten gelijk blijven.
     account() = het account waarmee gesynchroniseerd wordt: je spelersnaam, anders de koppeling. */
  const KKEY = "vestigia:sync";
  const koppeling = () => { try { return JSON.parse(localStorage.getItem(KKEY)); } catch(e){ return null; } };
  const setKoppeling = k => { try { k ? localStorage.setItem(KKEY, JSON.stringify(k)) : localStorage.removeItem(KKEY); } catch(e){} };
  const account = () => player() || koppeling();
  async function rpc(fn, args){
    if (navigator.onLine === false){ Veld.zet(true); throw Object.assign(new Error("Geen internet"), { status: 0, offline: true }); }
    /* in het veld is het netwerk vaak traag of half: na 10 seconden geven we het op in plaats van te blijven hangen */
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const tijd = ctl ? setTimeout(() => ctl.abort(), 10000) : null;
    let r;
    try {
      r = await fetch(CFG.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/" + fn, {
        method: "POST", signal: ctl ? ctl.signal : undefined,
        headers: Object.assign({ apikey: CFG.supabaseKey, "Content-Type": "application/json" }, /^eyJ/.test(CFG.supabaseKey) ? { Authorization: "Bearer " + CFG.supabaseKey } : {}),
        body: JSON.stringify(args || {})
      });
    } catch(e){ Veld.zet(true); throw Object.assign(new Error("Geen verbinding"), { status: 0, offline: true }); }
    finally { if (tijd) clearTimeout(tijd); }
    Veld.zet(false);
    const txt = await r.text(); let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch(e){}
    if (!r.ok) throw Object.assign(new Error((data && data.message) || r.statusText), { status: r.status });
    return data;
  }
  /* resultaten die offline zijn gespeeld, worden later alsnog verstuurd */
  const queue = () => { try { return JSON.parse(localStorage.getItem("vestigia:queue")) || []; } catch(e){ return []; } };
  const setQueue = q => { try { localStorage.setItem("vestigia:queue", JSON.stringify(q)); } catch(e){} };
  async function flush(){
    const p = account(); if (!enabled || !p) return;
    const q = queue();
    if (q.length){
      const rest = [];
      for (const item of q){
        try { await rpc("submit_result", Object.assign({ p_id: p.id, p_key: p.key }, item)); }
        catch(e){ if (!e.status || e.status >= 500) rest.push(item); }
      }
      setQueue(rest);
    }
    await uploadLog(p);
  }
  /* Het logboek (elk gespeeld spel, sinds stap 1) gaat naar game_results in Supabase, voor prestaties en eikels.
     Verstuurde spellen krijgen up: 1. Lukt het niet (geen verbinding, of de functie staat nog niet in Supabase),
     dan gewoon de volgende keer opnieuw; de server negeert dubbele spellen. */
  const GAME = { daily: "dagcasus", free: "oefenen", raadsel: "raadsel", soortenduel: "soortenduel", spelersduel: "spelersduel" };
  let logBusy = false;
  async function uploadLog(p){
    if (logBusy || !p) return;
    logBusy = true;
    try {
      for (let ronde = 0; ronde < 10; ronde++){
        const open = (store.get().log || []).filter(e => !e.up && GAME[e.m]).slice(0, 200);
        if (!open.length) break;
        const games = open.map(e => { const t = BY_ID.get(e.s);
          return { k: logKey(e), g: GAME[e.m], t: e.t, d: e.d, s: e.s, grp: t ? t.g : null, c: (e.k || 0) + 1,
                   x: !!e.x, w: !!e.w, p: e.p, n: e.c, sc: e.sc, tw: e.tw || 0 }; });
        await rpc("submit_games", { p_id: p.id, p_key: p.key, p_games: games });
        const sent = new Set(open.map(logKey)), st = store.get();
        st.log = (st.log || []).map(e => sent.has(logKey(e)) ? Object.assign({}, e, { up: 1 }) : e);
        store.set(st);
      }
    } catch(e){} finally { logBusy = false; }
  }
  let syncT;
  async function syncNu(){
    const p = account(); if (!enabled || !p) return;
    clearTimeout(syncT);
    const st = store.get(), dex = st.dex || {};
    const found = TARGETS.filter(t => dex[t.id] && dex[t.id].w > 0).length;
    /* Supabase accepteert tot 200 kB; een heel lang logboek gaat dan alleen met de laatste 1000 spellen mee (lokaal blijft alles) */
    let prog = progressData(st, true);
    if (JSON.stringify(prog).length > 150000) prog.log = prog.log.slice(-1000);
    try { await rpc("save_progress", { p_id: p.id, p_key: p.key, p_progress: prog, p_found: found, p_trophies: earned(st).length }); }
    catch(e){}
  }
  function syncSoon(){
    if (!enabled || !account()) return;
    clearTimeout(syncT);
    syncT = setTimeout(syncNu, 800);
  }
  /* Na een spel: resultaat, logboek en voortgang versturen, en pas als dat allemaal binnen is de eikels
     opnieuw ophalen, zodat de winst in de uitslag klopt (ook de 5 eikels voor een nieuwe plaat). */
  function afterGame(){
    if (!enabled || !account()) return;
    const klaar = [];
    if (S.mode === "daily" && eersteModus(store.get(), S.caseNo - 1) === !!S.expert){   /* alleen je eerste modus van de dag */
      const q = queue(); q.push({ p_day: S.caseNo - 1, p_expert: S.expert, p_won: S.status === "won", p_tries: Math.min(usedTries(), MAX), p_clues: S.revealed });
      setQueue(q); klaar.push(flush().then(() => refreshWeek()).catch(() => {}));
    } else klaar.push(uploadLog(account()));
    klaar.push(syncNu());
    Promise.all(klaar).then(() => Profiel.naSpel()).catch(() => {});
  }
  /* Wie de dagcasus speelde vóór het kiezen van een naam, krijgt die score alsnog in de ranglijst:
     de afgeronde dagcasussen van vandaag en gisteren (ouder neemt de server niet aan). */
  function queueRecentDaily(){
    const st = store.get(), today = todayIndex(), q = queue();
    for (const i of [today - 1, today]) for (const x of [false, true]){
      if (eersteModus(st, i) !== x) continue;          /* alleen de modus die je die dag als eerste speelde */
      const g = (st.games || {})[dailyKey(i, x)];
      if (!g || g.status === "playing" || i < 0) continue;
      const twin = (BY_ID.get(g.target) || {}).twin, tries = g.guesses.filter(n => n !== twin).length;
      if (!q.some(r => r.p_day === i && r.p_expert === x))
        q.push({ p_day: i, p_expert: x, p_won: g.status === "won", p_tries: Math.min(tries, MAX), p_clues: g.revealed });
    }
    setQueue(q);
  }
  /* ranglijst: Iedereen of een van je leagues (scope), en Vandaag / Deze week / Altijd. De Streeplijst is eruit (november 2026). */
  let rankMode = "week", scope = null;      /* week: vroeg op de dag staat er bij Vandaag nog weinig */
  function renderScope(){
    const box = $("rankScope"), ls = player() ? League.cached() : [];
    if (scope && !ls.some(l => l.id === scope)) scope = null;
    if (!ls.length){ box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    box.innerHTML = `<button class="chipbtn" data-s="" aria-pressed="${!scope}">Iedereen</button>` +
      ls.map(l => `<button class="chipbtn" data-s="${esc(l.id)}" aria-pressed="${scope === l.id}">${esc(l.name)}</button>`).join("");
    box.querySelectorAll(".chipbtn").forEach(b => b.onclick = () => setScope(b.dataset.s || null));
  }
  function setScope(id){
    scope = id || null;
    if (scope){ League.setLast(scope); League.vernieuwTegel().catch(() => {}); }
    renderRank();
  }
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
    if (typeof League !== "undefined") League.bijwerken();
    return info;
  }
  const RANK_RULE = {
    day: "Punten uit de dagcasus van vandaag. Oefenen telt niet mee.",
    week: "Punten uit de dagcasussen van deze week (vanaf maandag). Oefenen telt niet mee.",
    all: "Alle punten uit de dagcasussen sinds de start. Oefenen telt niet mee."
  };
  async function renderRank(){
    if (!RANK_RULE[rankMode]) rankMode = "week";     // oude links naar de Streeplijst komen bij Deze week uit
    renderPlayerBox(); renderScope();
    const list = $("rankList"), lg = scope && League.cached().find(l => l.id === scope);
    $("rankTabs").querySelectorAll(".chipbtn").forEach(b => b.setAttribute("aria-pressed", b.dataset.r === rankMode));
    $("rankRule").textContent = lg
      ? `Alleen de ${lg.members} ${+lg.members === 1 ? "lid" : "leden"} van ${lg.name}. Iedereen telt mee vanaf de dag dat hij of zij lid werd. ` + RANK_RULE[rankMode]
      : RANK_RULE[rankMode];
    if (!enabled){ list.innerHTML = `<li class="rankempty" style="display:block">De ranglijst is nog niet ingesteld voor deze versie van Vestigia.</li>`; return; }
    list.innerHTML = `<p class="rankempty">Ranglijst laden…</p>`;
    const me = (player() || {}).name, today = todayIndex();
    try {
      let rows, html;
      if (lg){
        const from = rankMode === "day" ? today : rankMode === "week" ? weekStart(today) : 0;
        rows = await rpc("league_board", { p_id: player().id, p_key: player().key, p_league: lg.id, p_from: from, p_to: today });
        html = rows.map((r, i) => `<li class="${r.name === me ? "me" : ""}" data-n="${esc(r.name)}"><span class="pos">${i + 1}</span>
          <span class="who"><b>${esc(r.name)}</b><span>${rankMode === "day"
            ? (+r.played ? (+r.won ? "gedetermineerd" : "niet gevonden") : "nog niet gespeeld")
            : `${r.won} van ${r.played} dagcasussen gedetermineerd`}</span></span>
          <span class="pts">${r.points}<small>punten</small></span></li>`).join("");
      } else if (rankMode === "day"){
        rows = await rpc("leaderboard_day", { p_day: today });
        html = rows.map((r, i) => `<li class="${r.name === me ? "me" : ""}" data-n="${esc(r.name)}"><span class="pos">${i + 1}</span>
          <span class="who"><b>${esc(r.name)}</b>${r.expert ? `<span class="xbadge">expert</span>` : ""}<span>${r.won ? (r.expert ? `gedetermineerd na ${r.clues} waarneming${r.clues > 1 ? "en" : ""}` : `gedetermineerd in ${r.tries} ${r.tries === 1 ? "poging" : "pogingen"}`) : "niet gevonden"}</span></span>
          <span class="pts">${r.points}<small>punten</small></span></li>`).join("");
        if (!rows.length) html = `<p class="rankempty">Nog niemand heeft dagcasus #${today + 1} gespeeld. Ben jij de eerste?</p>`;
      } else {
        const from = rankMode === "week" ? weekStart(today) : 0;
        rows = await rpc("leaderboard_range", { p_from: from, p_to: today });
        html = rows.map((r, i) => `<li class="${r.name === me ? "me" : ""}" data-n="${esc(r.name)}"><span class="pos">${i + 1}</span>
          <span class="who"><b>${esc(r.name)}</b><span>${r.won} van ${r.played} dagcasussen gedetermineerd</span></span>
          <span class="pts">${r.points}<small>punten</small></span></li>`).join("");
        if (!rows.length) html = `<p class="rankempty">${rankMode === "week" ? "Deze week" : "Tot nu toe"} zijn er nog geen dagcasussen gespeeld.</p>`;
      }
      list.innerHTML = html; list.classList.remove("met-av");
      Profiel.versier(list);
      if (me){
        const wk = await refreshWeek();
        $("rankMe").innerHTML = `${wk ? wk.pts : 0}<small>jouw punten deze week</small>`;
      }
    } catch(e){
      list.innerHTML = Veld.aan() ? `<p class="rankempty"><b>Veldmodus.</b> Zonder internet kan de ranglijst niet laden. Je speelt gewoon verder; je dagscore wordt verstuurd zodra je weer verbinding hebt.</p>` : `<p class="rankempty">De ranglijst is nu niet bereikbaar. Controleer je internetverbinding en probeer het later opnieuw.</p>`;
    }
  }
  function renderPlayerBox(){
    const box = $("playerBox"), p = player();
    if (!enabled){ box.hidden = true; return; }
    box.hidden = false;
    if (p){
      box.innerHTML = `<p>Je speelt als <b>${esc(p.name)}</b>. Je dagscores en je ${NAAM.vestiarium} worden automatisch bewaard.
        Je avatar, eikels, prestaties en je spelerscode (om op een ander apparaat verder te spelen) staan in <button class="linklike" id="pcProf">Mijn profiel</button>.</p>`;
      $("pcProf").onclick = () => showProfiel();
    } else {
      box.innerHTML = `<p><b>Doe mee aan de ranglijst.</b> Kies een spelersnaam. Je hebt geen account of e-mailadres nodig.</p>
        <div class="row2"><input id="pName" maxlength="20" placeholder="Bijvoorbeeld Tom of Dassenjager" autocomplete="nickname"><button class="btn" id="pJoin">Meedoen</button></div>
        <span class="msg" id="pMsg"></span>
        <details><summary>Ik heb al een spelers- of koppelcode</summary>
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
      let r;
      const k = koppeling();
      if (k){ await rpc("claim_name", { p_id: k.id, p_key: k.key, p_name: name }); r = k; setKoppeling(null); }
      else { const rows = await rpc("register_player", { p_name: name }); r = Array.isArray(rows) ? rows[0] : rows; }
      setPlayer({ id: r.id, key: r.key, name });
      $("welcome").hidden = true;
      /* eerst een uitnodiging en league uit een link: de server neemt een uitnodiging alleen aan vóór je eerste resultaat */
      const extra = await League.naNaam(true);
      Profiel.naNaam();
      queueRecentDaily(); syncSoon(); flush().then(() => refreshWeek()).catch(() => {}); renderRank(); renderMenu(); toast(`Welkom, ${name}! Je doet nu mee aan de ranglijst.${extra}`);
    } catch(e){ $("pJoin").disabled = false; $("pMsg").textContent = e.status && e.status < 500 ? e.message : "Aanmelden lukte niet. Controleer je internetverbinding."; }
  }
  async function login(){
    try {
      const name = await koppel($("pCode").value);
      if (name){ $("welcome").hidden = true; renderRank(); renderMenu(); const extra = await League.naNaam(false); Profiel.naNaam(); toast(`Welkom terug, ${name}! Je ${NAAM.vestiarium} is bijgewerkt.${extra}`); }
      else { renderRank(); toast("Gekoppeld. Dit apparaat blijft nu gelijk met je andere apparaat."); }
    } catch(e){ $("pMsg").textContent = e.message === "code" ? "Deze code klopt niet. Kopieer hem opnieuw op je andere apparaat." : "Deze code wordt niet herkend."; }
  }

  /* Voortgang van je andere apparaten ophalen en samenvoegen (platen, trofeeën, statistieken, logboek).
     Bij het openen en als de app weer op de voorgrond komt (hooguit eens per minuut); daarna gaat de
     samengevoegde voortgang weer naar Supabase, zodat geen apparaat de platen van een ander overschrijft. */
  let laatsteHaal = 0;
  async function haalVoortgang(){
    const p = account(); if (!enabled || !p || Date.now() - laatsteHaal < 60000) return;
    laatsteHaal = Date.now();
    try {
      /* koos je op een ander apparaat een naam voor dit gekoppelde account, dan speel je hier nu ook onder die naam */
      const naam = await rpc("player_name", { p_id: p.id, p_key: p.key });
      if (!player()){
        if (naam && !String(naam).startsWith("~")){ setPlayer({ id: p.id, key: p.key, name: naam }); setKoppeling(null); $("welcome").hidden = true; Profiel.naNaam(); toast(`Je speelt nu als ${naam}, net als op je andere apparaat.`); }
      } else if (naam && !String(naam).startsWith("~") && naam !== player().name){
        /* naam gewijzigd op een ander apparaat */
        setPlayer(Object.assign({}, player(), { name: naam })); renderRank(); renderMenu(); if (VIEW === "profiel") Profiel.naNaam();
      }
      const prog = await rpc("get_progress", { p_id: p.id, p_key: p.key });
      if (prog && (prog.dex || prog.dexId)){ mergeProgressData(prog); naSamenvoegen(); syncSoon(); }
    } catch(e){}
  }
  /* na samenvoegen: kop, menu en Vestiarium bijwerken; speelde je de dagcasus al op een ander apparaat,
     dan staat hij hier ook als gespeeld (zolang je hier nog niets geprobeerd hebt) */
  function naSamenvoegen(){
    if (S && S.mode === "daily" && S.status === "playing" && !S.guesses.length && finished(store.get(), S.caseNo - 1, S.expert)) startDaily();
    renderTiles(); renderMenu(); if (VIEW === "dex") renderDex();
  }
  /* code om een ander apparaat te koppelen: je spelerscode, of (zonder naam) de code van een verborgen account */
  async function koppelcode(){
    let a = account();
    if (!a){
      const rows = await rpc("register_hidden", {}), r = Array.isArray(rows) ? rows[0] : rows;
      a = { id: r.id, key: r.key }; setKoppeling(a);
      queueRecentDaily(); await syncNu(); flush();
    }
    return "VSP-" + a.id + "." + a.key;
  }
  /* een code van een ander apparaat gebruiken: spelerscode = verder spelen als die speler, koppelcode = koppelen */
  async function koppel(code){
    const m = String(code || "").trim().match(/^VSP-([0-9a-f-]{36})\.([0-9a-f]{64})$/i);
    if (!m) throw new Error("code");
    const name = await rpc("player_name", { p_id: m[1], p_key: m[2] });
    if (String(name).startsWith("~")){
      if (player()) throw new Error("naam");
      setKoppeling({ id: m[1], key: m[2] });
    } else { setPlayer({ id: m[1], key: m[2], name }); setKoppeling(null); }
    const prog = await rpc("get_progress", { p_id: m[1], p_key: m[2] });
    if (prog && (prog.dex || prog.dexId)) mergeProgressData(prog);
    laatsteHaal = Date.now();
    queueRecentDaily(); await syncNu(); flush(); naSamenvoegen();
    return String(name).startsWith("~") ? null : name;
  }
  /* naam wijzigen (hooguit 3 keer); geeft het aantal resterende wijzigingen terug */
  async function hernoem(naam){
    const p = player(); naam = String(naam || "").trim().replace(/\s+/g, " ");
    const rest = await rpc("rename_player", { p_id: p.id, p_key: p.key, p_name: naam });
    setPlayer(Object.assign({}, p, { name: naam })); renderRank(); renderMenu();
    return rest;
  }
  return { enabled, rpc, player, hernoem, account, koppeling, koppelcode, koppel, afterGame, haalVoortgang, flush, syncSoon, renderRank, refreshWeek, renderScope, setScope,
           setMode: (m, s) => { rankMode = m; if (s !== undefined) setScope(s); else renderRank(); } };
})();

function showRank(mode, scopeId){
  setView("rank");
  if (mode) online.setMode(mode, scopeId); else online.renderRank();
  window.scrollTo({ top:0, behavior:"auto" });
}
$("rankTabs").querySelectorAll(".chipbtn").forEach(b => b.addEventListener("click", () => online.setMode(b.dataset.r)));
$("welcomeGo").addEventListener("click", () => { showRank(); setTimeout(() => $("pName") && $("pName").focus(), 50); });
$("welcomeLater").addEventListener("click", () => { $("welcome").hidden = true; try { localStorage.setItem("vestigia:welcomeLater", "1"); } catch(e){} });
/* De vraag om een spelersnaam komt na de openingsanimatie en de uitleg (zie start() in js/app.js).
   Wie via een uitnodigings- of leaguelink binnenkomt, krijgt hem altijd, met van wie de uitnodiging is. */
function toonWelkom(){
  try {
    if (!online.enabled || online.player()) return;
    const link = League.welkomTekst();
    if (link) $("welcomeText").innerHTML = link;
    if (link || !localStorage.getItem("vestigia:welcomeLater")) $("welcome").hidden = false;
  } catch(e){}
}
if (!online.enabled){ ["menuLeague", "menuInvite", "menuShop"].forEach(id => $(id).parentElement.hidden = true); document.querySelector('#tabbar [data-tab="rank"]').hidden = true; }
/* Veldmodus: gaat vanzelf aan zonder internet (of als Supabase niet te bereiken is) en weer uit zodra het lukt.
   Spelen werkt gewoon; wat online moet (ranglijst, eikels, shop) wacht, en dagscores gaan in de wachtrij. */
const Veld = (() => {
  let aan = false, gemeld = false;
  function toon(){
    for (const id of ["veldPill", "veldPillSlim"]){ const b = $(id); if (b) b.hidden = !aan; }
    document.documentElement.classList.toggle("veldmodus", aan);
  }
  function zet(v){
    if (v === aan) return;
    aan = v; toon();
    if (aan && !gemeld){ gemeld = true; toast("Geen verbinding: veldmodus staat aan. Je speelt gewoon verder; je dagscore wordt verstuurd zodra je weer verbinding hebt.", { duur: 7000 }); }
    if (!aan && gemeld){ gemeld = false; online.flush().then(() => toast("Weer online. Je scores zijn verstuurd.", { duur: 4000 })).catch(() => {}); }
  }
  const uitleg = () => toast("Veldmodus: er is nu geen verbinding met internet of met de server van Vestigia. De dagcasus en oefenen werken gewoon. De ranglijst, eikels en de shop komen terug zodra je weer online bent; je scores worden dan vanzelf verstuurd.", { duur: 8000 });
  for (const id of ["veldPill", "veldPillSlim"]){ const b = $(id); if (b) b.onclick = uitleg; }
  return { zet, aan: () => aan, toon };
})();
window.addEventListener("online", () => { Veld.zet(false); online.flush(); });
window.addEventListener("offline", () => Veld.zet(true));
if (navigator.onLine === false) setTimeout(() => Veld.zet(true), 0);   // na het laden van app.js (toast)
online.haalVoortgang().then(() => online.flush()).then(() => online.refreshWeek()).catch(() => {});
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") online.haalVoortgang(); });

