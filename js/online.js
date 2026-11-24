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
  /* iPhone/iPad: de app op het beginscherm heeft een eigen geheugen, los van Safari. Wie eerst in Safari een naam koos,
     moet hier zijn spelerscode plakken in plaats van opnieuw een naam te kiezen (anders: 'naam bezet' of een tweede account). */
  const appApart = () => /iPhone|iPad|iPod/.test(navigator.userAgent) && (navigator.standalone === true ||
    (window.matchMedia && matchMedia("(display-mode: standalone)").matches));
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
    } catch(e){ Veld.mislukt(); throw Object.assign(new Error("Geen verbinding"), { status: 0, offline: true }); }
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
                   x: !!e.x, w: !!e.w, p: e.p, n: e.c, sc: e.sc, tw: e.tw || 0,
                   /* update 29a (SQL 024): de foute gokken, voor Vestigia Wrapped (‘je nemesis’, ‘meest verwarde soorten’) */
                   ...(Array.isArray(e.f) ? { f: e.f.slice(0, 10) } : {}) }; });
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
    /* Profiel.naSpel regelt ook de XP (Levels.naSpel), zodat XP, eikels en grote momenten na elkaar komen (update 13) */
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
    const pos = rows.findIndex(r => r.name === p.name), pl = plaatsen(rows, STAND_SLEUTEL);
    const info = { w, pos: pos >= 0 ? pl[pos].pos : 0, gedeeld: pos >= 0 && pl[pos].gedeeld, n: rows.length, pts: pos >= 0 ? +rows[pos].points : 0 };
    try { localStorage.setItem("vestigia:week", JSON.stringify(info)); } catch(e){}
    renderTiles();
    if (typeof League !== "undefined") League.bijwerken();
    return info;
  }
  const RANK_RULE = {
    day: "Punten uit de dagcasus van vandaag. Oefenen telt niet mee.",
    week: "Punten uit de dagcasussen van deze week (vanaf maandag). Oefenen telt niet mee.",
    all: "Alle punten uit de dagcasussen sinds de start. Oefenen telt niet mee.",
    month: "Punten uit de dagcasussen van deze maand (vanaf de 1e). Oefenen telt niet mee."
  };
  /* update 87: tabblad 3 is 'Altijd' tot 1 januari 2027, daarna 'Deze maand' (ook in leagues) */
  function tabDrie(){
    const b = $("rankTabs").querySelector('.chipbtn[data-r="all"], .chipbtn[data-r="month"]'), m = maandAan();
    if (b){ b.dataset.r = m ? "month" : "all"; b.textContent = m ? "Deze maand" : "Altijd"; }
    if (m && rankMode === "all") rankMode = "month";
    if (!m && rankMode === "month") rankMode = "all";
  }
  async function renderRank(){
    tabDrie();
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
        const from = rankMode === "day" ? today : rankMode === "week" ? weekStart(today) : rankMode === "month" ? monthStartDay(today) : 0;
        rows = await rpc("league_board", { p_id: player().id, p_key: player().key, p_league: lg.id, p_from: from, p_to: today });
        const pl = plaatsen(rows, STAND_SLEUTEL);
        html = rows.map((r, i) => `<li class="${r.name === me ? "me" : ""}" data-n="${esc(r.name)}" data-pos="${pl[i].pos}">${posHtml(pl[i])}
          <span class="who"><b>${esc(r.name)}</b><span>${rankMode === "day"
            ? (+r.played ? (+r.won ? "gedetermineerd" : "niet gevonden") : "nog niet gespeeld")
            : `${r.won} van ${r.played} ${+r.played === 1 ? "dagcasus" : "dagcasussen"} gedetermineerd`}</span></span>
          <span class="pts">${r.points}<small>punten</small></span></li>`).join("");
      } else if (rankMode === "day"){
        rows = await rpc("leaderboard_day", { p_day: today });
        const pl = plaatsen(rows, DAG_SLEUTEL);
        html = rows.map((r, i) => `<li class="${r.name === me ? "me" : ""}" data-n="${esc(r.name)}" data-pos="${pl[i].pos}">${posHtml(pl[i])}
          <span class="who"><b>${esc(r.name)}</b>${r.expert ? `<span class="xbadge">expert</span>` : ""}<span>${r.won ? (r.expert ? (r.tries >= 2 ? "gedetermineerd via het vangnet" : `gedetermineerd na ${r.clues} waarneming${r.clues > 1 ? "en" : ""}`) : `gedetermineerd in ${r.tries} ${r.tries === 1 ? "poging" : "pogingen"}`) : "niet gevonden"}</span></span>
          <span class="pts">${r.points}<small>punten</small></span></li>`).join("");
        if (!rows.length) html = `<p class="rankempty">Nog niemand heeft dagcasus #${today + 1} gespeeld. Ben jij de eerste?</p>`;
      } else {
        const from = rankMode === "week" ? weekStart(today) : rankMode === "month" ? monthStartDay(today) : 0;
        rows = await rpc("leaderboard_range", { p_from: from, p_to: today });
        const pl = plaatsen(rows, STAND_SLEUTEL);
        html = rows.map((r, i) => `<li class="${r.name === me ? "me" : ""}" data-n="${esc(r.name)}" data-pos="${pl[i].pos}">${posHtml(pl[i])}
          <span class="who"><b>${esc(r.name)}</b><span>${r.won} van ${r.played} ${+r.played === 1 ? "dagcasus" : "dagcasussen"} gedetermineerd</span></span>
          <span class="pts">${r.points}<small>punten</small></span></li>`).join("");
        if (!rows.length) html = `<p class="rankempty">${rankMode === "week" ? "Deze week" : rankMode === "month" ? "Deze maand" : "Tot nu toe"} zijn er nog geen dagcasussen gespeeld.</p>`;
      }
      list.innerHTML = html; list.classList.remove("met-av");
      podium(list);
      if (list.querySelector(".pos.gedeeld")) $("rankRule").textContent += " " + GELIJK_REGEL;
      Profiel.versier(list);
      if (lg && typeof Week !== "undefined") Week.kroontjes(list, lg);     // update 25: top 3 van vorige week
      if (!lg && (rankMode === "week" || rankMode === "month") && typeof Week !== "undefined") Week.beker(list, rankMode);   // update 58: weekprijs, update 87: maandprijs
      if (me){
        const wk = await refreshWeek();
        $("rankMe").innerHTML = `${wk ? wk.pts : 0}<small>jouw punten deze week</small>`;
      }
    } catch(e){
      list.innerHTML = Veld.aan() ? `<p class="rankempty"><b>Veldmodus.</b> Zonder internet kan de ranglijst niet laden. Je speelt gewoon verder; je dagscore wordt verstuurd zodra je weer verbinding hebt.</p>` : `${typeof Vesti !== "undefined" ? Vesti.slaapt() : ""}<p class="rankempty">${esc(e && e.status >= 500 ? "De ranglijst is nu niet bereikbaar. Er ging iets mis bij Vestigia; probeer het later opnieuw." : "De ranglijst is nu niet bereikbaar. Controleer je internetverbinding en probeer het later opnieuw.")}</p>`;
    }
  }
  function renderPlayerBox(){
    const box = $("playerBox"), p = player();
    if (!enabled){ box.hidden = true; return; }
    box.hidden = false;
    if (p){
      /* weg te klikken; daarna komt hij niet terug (Mijn profiel staat ook in het menu) */
      let weg = false; try { weg = localStorage.getItem("vestigia:speeltAlsWeg") === "1"; } catch(e){}
      if (weg){ box.hidden = true; return; }
      box.innerHTML = `<button class="pbsluit" id="pbSluit" aria-label="Sluiten">×</button><p>Je speelt als <b>${esc(p.name)}</b>. Je dagscores en je ${NAAM.vestiarium} worden automatisch bewaard.
        Je avatar, eikels, prestaties en je spelerscode (om op een ander apparaat verder te spelen) staan in <button class="linklike" id="pcProf">Mijn profiel</button>.</p>`;
      $("pcProf").onclick = () => showProfiel();
      $("pbSluit").onclick = () => { try { localStorage.setItem("vestigia:speeltAlsWeg", "1"); } catch(e){} box.hidden = true; };
    } else {
      box.innerHTML = `<p><b>Doe mee aan de ranglijst.</b> Kies een spelersnaam. Je hebt geen account of e-mailadres nodig.</p>
        <div class="row2"><input id="pName" maxlength="20" placeholder="Bijvoorbeeld Tom of Dassenjager" autocomplete="nickname"><button class="btn" id="pJoin">Meedoen</button></div>
        <span class="msg" id="pMsg"></span>
        <div class="pal" id="pAl" hidden aria-live="polite"></div>
        <details id="pCodeBox"${appApart() ? " open" : ""}><summary>Ik speel al op een ander apparaat of in een andere browser</summary>
          <p id="pCodeUitleg" style="margin:8px 0 0;font-size:.9em;opacity:.85">${appApart() ? "Speelde je eerder op de webpagina? De app op je beginscherm heeft een eigen geheugen. Open Vestigia op de webpagina, ga naar Mijn profiel → Koppel je apparaten → Koppel een nieuw apparaat, en typ de code van 6 tekens hier in. Kies dus geen nieuwe naam." : "Maak op je andere apparaat een koppelcode: Mijn profiel → Koppel je apparaten. Typ de 6 tekens hier in, of plak je lange spelerscode."}</p>
          <div class="row2" style="margin-top:8px"><input id="pCode" placeholder="ABC 234 of VSP-…" autocapitalize="characters" spellcheck="false"><button class="btn line" id="pLogin">Verder spelen</button></div>
        </details>`;
      $("pJoin").onclick = join;
      $("pName").addEventListener("keydown", e => { if (e.key === "Enter") join(); });
      $("pLogin").onclick = login;
    }
  }
  /* update 62: een aanmelding die onderweg is. De app maakt zelf de sleutel en bewaart hem vóór het versturen,
     zodat opnieuw proberen met dezelfde naam je eigen account teruggeeft (ook als het antwoord de eerste keer
     niet aankwam) in plaats van 'bezet' en een tweede account. Een dag geldig. */
  const AKEY = "vestigia:aanmelding";
  const aanmelding = () => { try { const a = JSON.parse(localStorage.getItem(AKEY)); return a && Date.now() - a.t < 864e5 ? a : null; } catch(e){ return null; } };
  const setAanmelding = a => { try { a ? localStorage.setItem(AKEY, JSON.stringify(a)) : localStorage.removeItem(AKEY); } catch(e){} };
  const nieuweSleutel = () => { const b = new Uint8Array(32); crypto.getRandomValues(b); return Array.from(b, x => x.toString(16).padStart(2, "0")).join(""); };
  const zelfdeNaam = (a, b) => String(a || "").trim().replace(/\s+/g, " ").toLowerCase() === String(b || "").trim().replace(/\s+/g, " ").toLowerCase();
  let toch = "";                                     /* naam waarvoor de speler zei: 'nee, ik ben iemand anders' */
  async function aanmelden(name){
    let a = aanmelding();
    if (!a || !zelfdeNaam(a.name, name)){ a = { name, key: nieuweSleutel(), t: Date.now() }; setAanmelding(a); }
    try {
      const r = await rpc("register_player2", { p_name: name, p_key: a.key, p_toch: zelfdeNaam(toch, name) });
      if (r && r.ok) return { id: r.id, key: a.key, name: r.name || name };
      return r || { ok: false };
    } catch(e){
      if (e.status !== 404) throw e;
      /* SQL 038 nog niet in Supabase: de oude manier */
      const rows = await rpc("register_player", { p_name: name }), r = Array.isArray(rows) ? rows[0] : rows;
      return { id: r.id, key: r.key, name };
    }
  }
  /* bij het openen: kwam een aanmelding van gisteren of vandaag nooit aan in de app, dan haalt de app hem stil op */
  async function herstelAanmelding(){
    const a = aanmelding();
    if (!enabled || player() || !a || koppeling()) return;
    try {
      const r = await rpc("register_player2", { p_name: a.name, p_key: a.key, p_herstel: true });
      if (r && r.ok){ welkom({ id: r.id, key: a.key, name: r.name }); }
      else if (r && r.reden === "bezet") setAanmelding(null);        /* iemand anders heeft die naam: niets te herstellen */
    } catch(e){}
  }
  /* naam gekozen en account binnen: vanaf hier kan de aanmelding niet meer mislukken */
  async function welkom(r){
    setPlayer({ id: r.id, key: r.key, name: r.name }); setAanmelding(null); toch = "";
    const nap = (f) => { try { const x = f(); return x && x.catch ? x.catch(() => {}) : x; } catch(e){} };
    try { $("welcome").hidden = true; } catch(e){}
    /* eerst een uitnodiging en league uit een link: de server neemt een uitnodiging alleen aan vóór je eerste resultaat */
    let extra = "";
    try { extra = (await League.naNaam(true)) || ""; } catch(e){}
    nap(() => Profiel.naNaam());
    if (typeof Duel !== "undefined") nap(() => Duel.naNaam());
    nap(queueRecentDaily); nap(syncSoon); nap(() => flush().then(() => refreshWeek()));
    nap(renderRank); nap(renderMenu);
    toast(`Welkom, ${r.name}! Je doet nu mee aan de ranglijst.${extra}`);
  }
  /* 'Speel je al als …?': koppelen met de code van 6 tekens, of (alleen bij 'lijkt') toch deze naam */
  function alSpeler(naam, mijnNaam, bezet){
    const box = $("pAl"); if (!box) return;
    box.hidden = false;
    box.innerHTML = `<p><b>Speel je al als ${esc(naam)}?</b> ${bezet ? "Die naam is al bezet." : "Er speelt al iemand met een naam die hier sterk op lijkt."}
      Ben jij dat, in een andere browser of op een ander apparaat? Kies dan geen nieuwe naam, maar koppel dit apparaat:</p>
      <ol><li>Open Vestigia waar je al speelt.</li><li>Ga naar <b>Mijn profiel → Koppel je apparaten → Koppel een nieuw apparaat</b>.</li><li>Typ de code van 6 tekens hieronder in.</li></ol>
      ${bezet ? `<p class="fine">Ben je iemand anders? Kies dan een andere naam.</p>` : `<button class="linklike" id="pToch">Nee, ik ben iemand anders: gebruik toch ‘${esc(mijnNaam)}’</button>`}`;
    if ($("pCodeBox")){ $("pCodeBox").open = true; if ($("pCodeUitleg")) $("pCodeUitleg").hidden = true; }
    if (!bezet) $("pToch").onclick = () => { toch = mijnNaam; box.hidden = true; join(); };
    $("pMsg").textContent = "";
  }
  async function join(){
    if (player()){ renderPlayerBox(); return; }        /* al aangemeld: nooit een tweede account */
    const name = $("pName").value.trim().replace(/\s+/g, " ");
    if (name.length < 2){ $("pMsg").textContent = "Kies een naam van minstens 2 tekens."; return; }
    $("pJoin").disabled = true; $("pMsg").textContent = "Even geduld…"; if ($("pAl")) $("pAl").hidden = true; if ($("pCodeUitleg")) $("pCodeUitleg").hidden = false;
    let r;
    try {
      const k = koppeling();
      if (k){
        if (!zelfdeNaam(toch, name)){
          let lijkt = null; try { lijkt = await rpc("naam_lijkt", { p_name: name }); } catch(e){}
          if (lijkt){ $("pJoin").disabled = false; alSpeler(lijkt, name, false); return; }
        }
        try { await rpc("claim_name", { p_id: k.id, p_key: k.key, p_name: name }); }
        catch(e){
          /* kwam het antwoord de vorige keer niet aan, dan heeft dit account de naam al */
          const nu = /al een spelersnaam/i.test(e.message || "") ? await rpc("player_name", { p_id: k.id, p_key: k.key }).catch(() => null) : null;
          if (!nu || !zelfdeNaam(nu, name)) throw e;
        }
        setKoppeling(null); r = { id: k.id, key: k.key, name };
      } else {
        r = await aanmelden(name);
        if (!r.id){
          $("pJoin").disabled = false;
          if (r.reden === "bezet" || r.reden === "lijkt"){ alSpeler(r.naam || name, name, r.reden === "bezet"); return; }
          $("pMsg").textContent = "Aanmelden lukte niet. Probeer het nog eens.";
          return;
        }
      }
    } catch(e){
      $("pJoin").disabled = false;
      const bezet = e.status && e.status < 500 && /bezet/i.test(e.message || "");
      if (bezet){ alSpeler(name, name, true); return; }
      $("pMsg").textContent = e.status && e.status < 500 ? e.message
        : e.status >= 500 ? "Aanmelden lukte niet. " + STORING
        : "Aanmelden lukte niet. Controleer je internetverbinding en probeer het met dezelfde naam opnieuw.";
      return;
    }
    await welkom(r);
  }
  async function login(){
    const waarde = $("pCode").value.trim();
    /* update 21: ook de korte koppelcode van 6 tekens (Mijn profiel → Koppel je apparaten) */
    if (/^[A-Za-z0-9]{3}[\s-]?[A-Za-z0-9]{3}$/.test(waarde)){
      try {
        const r = await rpc("koppel_gebruik", { p_code: waarde });
        if (!r || !r.ok){ $("pMsg").textContent = r && r.reden === "druk" ? "Er werd net te vaak een foute code geprobeerd. Wacht een paar minuten." : "Deze koppelcode klopt niet of is verlopen. Maak op je andere apparaat een nieuwe."; return; }
        naKoppel(await koppel("VSP-" + r.id + "." + r.key));
      } catch(e){ $("pMsg").textContent = e.status === 404 ? "Koppelen met een korte code werkt binnenkort. Gebruik tot dan je spelerscode." : foutTekst(e, "Koppelen lukte niet.", false); }
      return;
    }
    try { naKoppel(await koppel(waarde)); }
    catch(e){ $("pMsg").textContent = e.message === "code" ? "Deze code klopt niet. Kopieer hem opnieuw op je andere apparaat." : "Deze code wordt niet herkend."; }
  }
  /* na het koppelen met een code: welkom, en alles wat op een naam wacht */
  async function naKoppel(name){
    if (name){ $("welcome").hidden = true; renderRank(); renderMenu(); const extra = await League.naNaam(false); Profiel.naNaam(); if (typeof Duel !== "undefined") Duel.naNaam(); toast(`Welkom terug, ${name}! Je ${NAAM.vestiarium} is bijgewerkt.${extra}`); }
    else { renderRank(); toast("Gekoppeld. Dit apparaat blijft nu gelijk met je andere apparaat."); }
  }

  /* Voortgang van je andere apparaten ophalen en samenvoegen (platen, trofeeën, statistieken, logboek).
     Bij het openen en als de app weer op de voorgrond komt (hooguit eens per minuut); daarna gaat de
     samengevoegde voortgang weer naar Supabase, zodat geen apparaat de platen van een ander overschrijft. */
  let laatsteHaal = 0, haalBezig = null;
  /* de pop-ups (wachtrij) en de uitleg wachten hierop, zodat ‘al gezien’ van je andere apparaten er eerst is */
  function voortgangKlaar(max){ return Promise.race([haalBezig || Promise.resolve(), new Promise(r => setTimeout(r, max || 4000))]).catch(() => {}); }
  function haalVoortgang(){
    if (haalBezig) return haalBezig;
    const p = account(); if (!enabled || !p || Date.now() - laatsteHaal < 60000) return Promise.resolve();
    haalBezig = haalVoortgangNu(p).finally(() => { haalBezig = null; });
    return haalBezig;
  }
  async function haalVoortgangNu(p){
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
    if (S && S.mode === "daily" && S.status === "playing" && !S.guesses.length){
      const st = store.get(), m = begonnenModus(st, S.caseNo - 1);   // update 82 (a): ook als je hem elders in de andere modus begon
      if (finished(st, S.caseNo - 1, S.expert) || (m !== null && m !== !!S.expert && S.revealed <= 1)) startDaily();
    }
    /* update 82 (b): op een ander apparaat een nieuwere oefencasus getrokken, of verder gespeeld? Dan die hier ook */
    if (S && S.mode === "free" && S.status === "playing"){
      const o = store.get().oefen;
      if (!o || o.t !== S.t || (o.guesses || []).length > S.guesses.length || (o.revealed || 1) > S.revealed){
        if (o) startFree(); else if (S.t <= (store.get().oefenKlaar || 0)) { S.status = "lost"; S.opgegeven = true; render(); }
      }
    }
    renderTiles(); renderMenu(); if (VIEW === "dex") renderDex();
  }
  /* code om een ander apparaat te koppelen: je spelerscode, of (zonder naam) de code van een verborgen account */
  async function koppelcode(){
    let a = account();
    if (!a){
      const rows = await rpc("register_hidden", {}), r = Array.isArray(rows) ? rows[0] : rows;
      a = { id: r.id, key: r.key }; setKoppeling(a);
      queueRecentDaily(); await syncNu(); flush();
    } else { await syncNu(); await flush(); }
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
  return { enabled, rpc, player, appApart, herstelAanmelding, hernoem, account, koppeling, koppelcode, koppel, naKoppel, afterGame, haalVoortgang, voortgangKlaar, flush, syncSoon, renderRank, refreshWeek, renderScope, setScope,
           setMode: (m, s) => { rankMode = m; if (s !== undefined) setScope(s); else renderRank(); } };
})();

/* Gelijke stand = gedeelde plaats (update 12). Spelers die op alles gelijk staan waarop de ranglijst sorteert, krijgen
   hetzelfde nummer, en de volgende plaats schuift door (1, 2, 2, 4), zoals bij sport. Week, altijd en leagues: gelijke punten
   én evenveel gedetermineerde dagen. Vandaag: gelijke punten in dezelfde modus (expert gaat voor klassiek).
   Binnen een gedeelde plaats blijft de volgorde van de server staan (op naam; bij vandaag wie het eerst klaar was), maar
   die betekent niets meer. De beloningen voor de weekranglijst (mijlpalen podium en weekwinnaar) rekent de server op
   dezelfde manier uit (techniek/supabase-017-update12.sql), dus iedereen op een gedeelde plaats krijgt dezelfde beloning. */
const STAND_SLEUTEL = r => (+r.points || 0) + "|" + (+r.won || 0);
const DAG_SLEUTEL = r => (+r.points || 0) + "|" + (r.expert ? 1 : 0);
function plaatsen(rows, sleutel){
  const k = rows.map(sleutel), out = [];
  k.forEach((x, i) => out.push({ pos: i && x === k[i - 1] ? out[i - 1].pos : i + 1, gedeeld: (i > 0 && x === k[i - 1]) || (i < k.length - 1 && x === k[i + 1]) }));
  return out;
}
/* Een gedeelde plaats is een knopje: tikken legt uit waarom er een plaats wordt overgeslagen (update 13). */
const posHtml = p => p.gedeeld
  ? `<button type="button" class="pos gedeeld" aria-label="Gedeelde ${p.pos}e plaats, tik voor uitleg">${p.pos}<small aria-hidden="true">gedeeld</small></button>`
  : `<span class="pos">${p.pos}</span>`;
const GELIJK_REGEL = "Gelijke stand? Dan deel je de plaats en wordt de plaats daarna overgeslagen, zoals bij sport.";
const naamLijst = n => n.length < 2 ? n.join("") : n.slice(0, -1).join(", ") + " en " + n[n.length - 1];
function gedeeldUitleg(knop){
  const li = knop.closest("li"), list = li && li.parentElement; if (!list) return;
  const pos = +li.dataset.pos, mee = [...list.querySelectorAll(`:scope > li[data-pos="${pos}"]`)];
  const me = (online.player() || {}).name;
  let namen = mee.map(x => x.dataset.n);
  if (me && namen.includes(me)) namen = ["jij", ...namen.filter(n => n !== me)];
  const tekst = naamLijst(namen), zin = tekst.charAt(0).toUpperCase() + tekst.slice(1);
  const weg = Array.from({ length: mee.length - 1 }, (_, i) => `${pos + 1 + i}e`);
  const over = weg.length === 1 ? `is er geen ${weg[0]} plaats` : `zijn er geen ${naamLijst(weg)} plaats`;
  const volgende = pos + mee.length;
  const na = list.querySelector(`:scope > li[data-pos="${volgende}"]`) ? `; de volgende speler staat ${volgende}e` : "";
  toast(`Gedeelde ${pos}e plaats. ${zin} staan gelijk, daarom ${over}${na}. Zo telt het ook bij sport.`, { label: "Oké", run: () => { $("toast").hidden = true; }, duur: 8000 });
}
document.addEventListener("click", e => { const k = e.target.closest(".ranklist .pos.gedeeld"); if (k) gedeeldUitleg(k); });

/* Top 3 in de ranglijst: dun randje in goud, zilver of brons, en een kroontje bij nummer 1 (alleen met punten).
   Bij een gedeelde plaats krijgen alle spelers op die plaats de rand (en bij nummer 1 allemaal de kroon). */
const KROON = `<svg class="kroon" viewBox="0 0 24 16" aria-hidden="true"><path d="M2 14L1 4l6 4 5-7 5 7 6-4-1 10Z" fill="#e2b84e" stroke="#a8731b" stroke-width="1.2" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="1.6" fill="#a3341f"/></svg>`;
function podium(list){
  const rij = [...list.querySelectorAll(":scope > li")];
  rij.forEach((li, i) => {
    const pts = parseInt((li.querySelector(".pts") || {}).textContent, 10), pos = +li.dataset.pos || i + 1;
    if (!(pts > 0) || pos > 3) return;
    li.classList.add("podium", "p" + pos);
    if (pos === 1){ const pos = li.querySelector(".pos"); if (pos && !pos.querySelector(".kroon")) pos.insertAdjacentHTML("afterbegin", KROON); }
  });
}
function showRank(mode, scopeId){
  setView("rank");
  if (mode) online.setMode(mode, scopeId); else online.renderRank();
  window.scrollTo({ top:0, behavior:"auto" });
}
$("rankTabs").querySelectorAll(".chipbtn").forEach(b => b.addEventListener("click", () => online.setMode(b.dataset.r)));
$("welcomeGo").addEventListener("click", () => {
  showRank();
  setTimeout(() => {
    if ($("welcomeGo").dataset.code && $("pCodeBox")){ $("pCodeBox").open = true; $("pCode").focus(); }
    else if ($("pName")) $("pName").focus();
  }, 50);
});
$("welcomeLater").addEventListener("click", () => { $("welcome").hidden = true; try { localStorage.setItem("vestigia:welcomeLater", "1"); localStorage.setItem("vestigia:welcomeLater:app", "1"); } catch(e){} });
/* De vraag om een spelersnaam komt na de openingsanimatie en de uitleg (zie start() in js/app.js).
   Wie via een uitnodigings- of leaguelink binnenkomt, krijgt hem altijd, met van wie de uitnodiging is. */
function toonWelkom(){
  try {
    if (!online.enabled || online.player()) return;
    const link = (typeof Duel !== "undefined" && Duel.welkomTekst()) || League.welkomTekst();
    if (link) $("welcomeText").innerHTML = link;
    else if (online.appApart()){
      $("welcomeText").innerHTML = `<b>Speelde je al op de webpagina?</b> De app op je beginscherm heeft een eigen geheugen. Kies dan geen nieuwe naam. Maak op de webpagina een koppelcode (Mijn profiel → Koppel je apparaten) en typ hem hieronder in. Dan houd je je naam en voortgang.`;
      $("welcomeGo").textContent = "Spelerscode plakken";
      $("welcomeGo").dataset.code = "1";
      if (!localStorage.getItem("vestigia:welcomeLater:app")) $("welcome").hidden = false;
    }
    if (link || !localStorage.getItem("vestigia:welcomeLater")) $("welcome").hidden = false;
  } catch(e){}
}
if (!online.enabled){ ["menuLeague", "menuInvite", "menuShop"].forEach(id => $(id).parentElement.hidden = true); document.querySelector('#tabbar [data-tab="rank"]').hidden = true; }
/* Veldmodus: gaat vanzelf aan zonder internet (of als Supabase niet te bereiken is) en weer uit zodra het lukt.
   Spelen werkt gewoon; wat online moet (ranglijst, eikels, shop) wacht, en dagscores gaan in de wachtrij. */
const Veld = (() => {
  let aan = false, gemeld = false, missers = [], peil = null;
  function toon(){
    for (const id of ["veldPill", "veldPillSlim"]){ const b = $(id); if (b) b.hidden = !aan; }
    document.documentElement.classList.toggle("veldmodus", aan);
  }
  function zet(v){
    if (v === aan) return;
    aan = v; toon();
    if (!aan) missers = [];
    if (aan && !gemeld){ gemeld = true; toast("Geen verbinding: veldmodus staat aan. Je speelt gewoon verder; je dagscore wordt verstuurd zodra je weer verbinding hebt.", { duur: 7000 }); }
    if (!aan && gemeld){ gemeld = false; online.flush().then(() => toast("Weer online. Je scores zijn verstuurd.", { duur: 4000 })).catch(() => {}); }
    clearInterval(peil); peil = null;
    if (aan && online.enabled) peil = setInterval(() => { if (document.visibilityState === "visible") probeer(); }, 20000);
  }
  /* update 82 (e): Tom zag de veldmodus met 5G. Eén mislukte vraag zette hem aan, en hij ging pas uit bij de volgende
     vraag die lukte, terwijl er dan vaak lang geen vraag meer kwam. Mislukte vragen komen ook voor met een goede
     verbinding: als de app naar de achtergrond gaat of net terugkomt (iPhone breekt lopende vragen af), bij een
     netwisseling (wifi naar 5G) of één trage vraag. Nu: zegt het toestel zelf dat er geen internet is, dan meteen aan;
     anders pas na 2 mislukte vragen binnen een minuut terwijl de app in beeld is. Staat hij aan, dan kijkt de app elke
     20 seconden (en bij terugkomen) met een kleine vraag of de server weer te bereiken is. */
  function mislukt(){
    if (navigator.onLine === false){ zet(true); return; }
    if (document.visibilityState !== "visible") return;
    const nu = Date.now();
    missers = missers.filter(t => nu - t < 60000).concat(nu);
    if (missers.length >= 2) zet(true);
  }
  let bezig = false;
  async function probeer(){
    if (!aan || bezig || navigator.onLine === false || !online.enabled) return;
    const CFG = window.VESTIGIA_CONFIG || {};
    bezig = true;
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const tijd = ctl ? setTimeout(() => ctl.abort(), 8000) : null;
    try {
      /* elk antwoord van de server (ook een foutcode) betekent: er is verbinding */
      await fetch(CFG.supabaseUrl.replace(/\/$/, "") + "/auth/v1/health", { headers: { apikey: CFG.supabaseKey }, cache: "no-store", signal: ctl ? ctl.signal : undefined });
      zet(false);
    } catch(e){}
    finally { bezig = false; if (tijd) clearTimeout(tijd); }
  }
  const uitleg = () => toast("Veldmodus: er is nu geen verbinding met internet of met de server van Vestigia. De dagcasus en oefenen werken gewoon. De ranglijst, eikels en de shop komen terug zodra je weer online bent; je scores worden dan vanzelf verstuurd.", { duur: 8000 });
  for (const id of ["veldPill", "veldPillSlim"]){ const b = $(id); if (b) b.onclick = () => { uitleg(); probeer(); }; }
  return { zet, mislukt, probeer, aan: () => aan, toon };
})();
window.addEventListener("online", () => { Veld.zet(false); online.flush(); });
window.addEventListener("offline", () => Veld.zet(true));
if (navigator.onLine === false) setTimeout(() => Veld.zet(true), 0);   // na het laden van app.js (toast)
online.haalVoortgang().then(() => online.flush()).then(() => online.refreshWeek()).catch(() => {});
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible"){ Veld.probeer(); online.herstelAanmelding(); online.haalVoortgang(); } });
/* update 62: een aanmelding waarvan het antwoord nooit aankwam, alsnog ophalen (na het laden van de andere onderdelen) */
setTimeout(() => online.herstelAanmelding(), 1500);

