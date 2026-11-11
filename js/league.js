/* Vestigia – uitnodigen en leagues (stap 5).
   Een league is een groep met een naam en een code (bijvoorbeeld DAS-7K2). Leden spelen gewoon de dagcasus;
   de league is een filter op de bestaande scores. Je punten tellen mee vanaf de dag dat je lid wordt.

   Links: ?van=Naam (uitnodiging) en ?league=CODE (meedoen met een league). Ze worden bij het openen gelezen,
   bewaard tot ze gebruikt zijn en uit de adresbalk gehaald. De actie volgt pas na de vaste opstartvolgorde:
   animatie, uitleg (nieuwe spelers), spelersnaam, en dan de link (zie start() in js/app.js).
   Een link opent op een iPhone in Safari, niet in de geïnstalleerde app; daarom kan alles ook met de code. */
"use strict";

const League = (() => {
  const K = { list: "vestigia:leagues", last: "vestigia:league-last", tile: "vestigia:league-tile",
              van: "vestigia:van", uit: "vestigia:league-uit" };
  const lees = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const zet = (k, v) => { try { v === null || v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const CODE = /^[A-Z]{3}-?[0-9A-Z]{3}$/i;
  const normCode = c => { const s = String(c || "").toUpperCase().replace(/[^0-9A-Z]/g, ""); return s.length === 6 ? s.slice(0, 3) + "-" + s.slice(3) : s; };
  const iosSafari = () => /iPhone|iPad|iPod/.test(navigator.userAgent) && !navigator.standalone;
  const p = () => online.enabled ? online.player() : null;
  const args = extra => Object.assign({ p_id: p().id, p_key: p().key }, extra || {});

  /* ---------- links lezen ---------- */
  (function leesLink(){
    let url; try { url = new URL(location.href); } catch(e){ return; }
    const van = (url.searchParams.get("van") || "").trim(), code = (url.searchParams.get("league") || "").trim();
    if (!van && !code) return;
    if (van.length >= 2 && van.length <= 20) zet(K.van, van);
    if (CODE.test(code)) zet(K.uit, normCode(code));
    url.searchParams.delete("van"); url.searchParams.delete("league");
    try { history.replaceState(history.state, "", url.pathname + (url.search || "") + url.hash); } catch(e){}
  })();
  const pendingVan = () => lees(K.van);
  const pendingCode = () => lees(K.uit);

  /* ---------- je leagues (bewaard, zodat kop en ranglijst ze meteen hebben) ---------- */
  const cached = () => (p() && lees(K.list)) || [];
  async function vernieuw(){
    if (!p()) return cached();
    const rows = await online.rpc("my_leagues", args());
    zet(K.list, rows || []);
    const last = lees(K.last);
    if (last && !(rows || []).some(l => l.id === last)) zet(K.last, null);
    return rows || [];
  }
  const setLast = id => { if (id) zet(K.last, id); };
  const huidige = () => { const ls = cached(); return ls.find(l => l.id === lees(K.last)) || ls[0] || null; };

  /* ---------- stand voor de tegel in de kop: je plaats deze week in de laatst geopende league ---------- */
  function tegel(){
    const l = huidige(); if (!l) return null;
    const t = lees(K.tile), w = weekStartDay(todayIndex());
    return { league: l, stand: t && t.id === l.id && t.w === w ? t : null };
  }
  async function vernieuwTegel(){
    const l = huidige(); if (!l) return;
    const today = todayIndex(), w = weekStartDay(today);
    const rows = await online.rpc("league_board", args({ p_league: l.id, p_from: w, p_to: today }));
    const pos = rows.findIndex(r => r.name === p().name), pl = plaatsen(rows, STAND_SLEUTEL);
    zet(K.tile, { id: l.id, w, pos: pos >= 0 ? pl[pos].pos : 0, gedeeld: pos >= 0 && pl[pos].gedeeld, n: rows.length, pts: pos >= 0 ? +rows[pos].points : 0 });
    renderTiles();
  }
  async function bijwerken(){
    if (!p()) return;
    try { await vernieuw(); await vernieuwTegel(); } catch(e){}
    renderTiles(); renderMenu();
  }

  /* ---------- meedoen en uitnodigingen na het kiezen van een naam ---------- */
  async function doeMee(code){
    const rows = await online.rpc("join_league", args({ p_code: code }));
    const l = Array.isArray(rows) ? rows[0] : rows;
    if (!l) throw Object.assign(new Error("Deze code bestaat niet. Controleer hem bij degene die hem stuurde."), { status: 404 });
    zet(K.uit, null); setLast(l.id);
    await bijwerken();
    return l;
  }
  /* Direct na register_player, vóór er resultaten verstuurd worden: de server neemt een uitnodiging alleen aan
     van een speler die nog niets gespeeld heeft. Geeft een extra zin terug voor de welkomstmelding. */
  async function naNaam(nieuw){
    let zin = "";
    const van = pendingVan();
    if (van && nieuw){
      try { if (await online.rpc("register_invite", args({ p_inviter: van }))) zin += ` Je bent uitgenodigd door ${van}.`; } catch(e){}
    }
    zet(K.van, null);
    const code = pendingCode();
    if (code){
      try { const l = await doeMee(code); zin += ` Je doet mee met de league ${l.name}.`; }
      catch(e){ zin += ` Meedoen met league ${code} lukte niet: ${e.message}`; }
    } else bijwerken();
    return zin;
  }
  /* Na de opstartvolgorde: wie al een naam heeft en een league-link opende, krijgt de vraag om mee te doen.
     Een uitnodigingslink voor een bestaande speler doet niets (je kunt maar één keer uitgenodigd worden). */
  function verwerk(){
    if (!p()){ return; }
    zet(K.van, null);
    const code = pendingCode();
    if (code) openVraag(code);
  }

  /* ---------- venster: meedoen met een league uit een link ---------- */
  const iosNoot = code => iosSafari()
    ? `<p class="fine">Speel je Vestigia als app op je iPhone? Een link opent altijd in Safari. Open dan de app en typ de code <b>${esc(code)}</b> bij Leagues.</p>` : "";
  function openVraag(code){
    const box = $("leaguePop");
    $("leaguePopBody").innerHTML = `
      <div class="top"><h2 id="leaguePopH">Meedoen met een league?</h2></div>
      <p>Je bent uitgenodigd voor een league met code <b class="lgcode">${esc(code)}</b>. In een league zie je de stand van de leden; je punten tellen mee vanaf vandaag.</p>
      ${iosNoot(code)}
      <div class="actions"><button class="btn" id="lpJa">Meedoen</button><button class="btn line" id="lpNee">Niet nu</button><span class="msg" id="lpMsg"></span></div>`;
    box.hidden = false; $("lpJa").focus();
    const sluit = () => { box.hidden = true; };
    $("lpNee").onclick = () => { zet(K.uit, null); sluit(); };
    $("lpJa").onclick = async () => {
      $("lpJa").disabled = true; $("lpMsg").textContent = "Even geduld…";
      try { const l = await doeMee(code); sluit(); toast(`Je doet nu mee met ${l.name}.`); showLeague(); }
      catch(e){ $("lpJa").disabled = false; $("lpMsg").textContent = fout(e); }
    };
  }
  $("leaguePop").addEventListener("click", e => { if (e.target === $("leaguePop")) $("leaguePop").hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("leaguePop").hidden) $("leaguePop").hidden = true; });

  /* ---------- uitnodigen ---------- */
  function uitnodiging(l){
    const me = p(), params = { van: me && me.name, league: l && l.code };
    const text = l
      ? `Doe mee met mijn league ‘${l.name}’ in Vestigia: elke dag een beschermde soort determineren aan de hand van waarnemingen en sporen. Leaguecode: ${l.code}`
      : `Speel Vestigia mee: elke dag een beschermde soort determineren aan de hand van waarnemingen en sporen.`;
    return { text, url: appLink(params) };
  }
  function openUitnodigen(){
    const box = $("leaguePop"), me = p();
    $("leaguePopBody").innerHTML = `
      <div class="top"><h2 id="leaguePopH">Speler uitnodigen</h2><button class="iconbtn" id="lpX" aria-label="Sluiten"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>
      ${me
        ? `<p>De speler die je uitnodigt, krijgt een link met jouw naam erin. Kiest die speler een spelersnaam en speelt hij of zij op drie verschillende dagen de dagcasus, dan levert dat jou 20 eikels op (voor maximaal vijf spelers).</p>`
        : `<p>De speler die je uitnodigt, krijgt een link naar Vestigia. Kies eerst zelf een spelersnaam, dan staat jouw naam in de link en tellen de uitnodigingen voor jou.</p>`}
      ${cached().length ? `<p class="fine">Wil je iemand in een league? Deel dan de uitnodiging bij die league, onder Leagues in het menu.</p>` : ""}
      <div class="actions"><button class="btn" id="lpDeel">Deel uitnodiging</button>${me ? "" : `<button class="btn line" id="lpNaam">Kies een spelersnaam</button>`}<span class="msg" id="lpMsg"></span></div>`;
    box.hidden = false; $("lpDeel").focus();
    $("lpX").onclick = () => { box.hidden = true; };
    $("lpDeel").onclick = () => shareOut(uitnodiging(null), $("lpMsg"), $("leaguePopBody"));
    if (!me) $("lpNaam").onclick = () => { box.hidden = true; MENU_GO.player(); };
  }

  /* ---------- scherm Leagues ---------- */
  const fout = e => e && e.status && e.status < 500 ? e.message : "Dat lukte niet. Controleer je internetverbinding.";
  /* tweestaps-knop in plaats van een browservenster: eerste tik vraagt bevestiging, tweede voert uit */
  function zeker(btn, tekst, actie){
    btn.onclick = async () => {
      if (btn.dataset.zeker){ btn.disabled = true; try { await actie(); } finally { btn.disabled = false; } return; }
      const oud = btn.textContent; btn.dataset.zeker = "1"; btn.textContent = tekst;
      setTimeout(() => { delete btn.dataset.zeker; btn.textContent = oud; }, 4000);
    };
  }
  let laden = 0;
  async function render(){
    const body = $("leagueBody"), me = p();
    if (!online.enabled){ body.innerHTML = `<p class="rankempty">Leagues werken alleen met de online ranglijst, en die is nog niet ingesteld voor deze versie.</p>`; return; }
    if (!me){
      body.innerHTML = `<div class="playerbox"><p><b>Kies eerst een spelersnaam.</b> Een league is een ranglijst van spelers, dus je hebt een naam nodig om mee te doen.</p>
        <div class="row2"><button class="btn" id="lgNaam">Kies een spelersnaam</button></div>${pendingCode() ? iosNoot(pendingCode()) : ""}</div>`;
      $("lgNaam").onclick = () => MENU_GO.player();
      return;
    }
    const nr = ++laden;
    tekenLijst(cached(), true);
    try { const rows = await vernieuw(); if (nr === laden) tekenLijst(rows, false); renderMenu(); }
    catch(e){ if (nr === laden) tekenLijst(cached(), false, "De leagues zijn nu niet bereikbaar. Controleer je internetverbinding."); }
  }
  function tekenLijst(ls, bezig, melding){
    const body = $("leagueBody"), vol = ls.length >= 5;
    body.innerHTML = `
      ${melding ? `<p class="rankempty">${esc(melding)}</p>` : ""}
      <div class="lglist">${ls.length ? ls.map(kaart).join("") : bezig ? `<p class="rankempty">Leagues laden…</p>` : `<p class="rankempty">Je zit nog niet in een league. Maak er een en nodig spelers uit, of doe mee met een code die je kreeg.</p>`}</div>
      <div class="lgforms">
        <form class="lgform" id="lgJoin"><label class="flab" for="lgCode">Meedoen met een code</label>
          <div class="row2"><input id="lgCode" maxlength="8" placeholder="Bijvoorbeeld DAS-7K2" autocomplete="off" autocapitalize="characters" value="${esc(pendingCode() || "")}"><button class="btn" ${vol ? "disabled" : ""}>Meedoen</button></div>
          <span class="msg" id="lgJoinMsg">${vol ? "Je zit al in vijf leagues, het maximum." : ""}</span></form>
        <form class="lgform" id="lgNew"><label class="flab" for="lgName">Nieuwe league maken</label>
          <div class="row2"><input id="lgName" maxlength="30" placeholder="Bijvoorbeeld Veldploeg Oost" autocomplete="off"><button class="btn line" ${vol ? "disabled" : ""}>Maken</button></div>
          <span class="msg" id="lgNewMsg"></span></form>
      </div>
      <p class="fine">Je kunt in maximaal vijf leagues zitten; een league heeft maximaal 200 leden. Iedereen met een spelersnaam kan een league maken.</p>`;
    $("lgJoin").onsubmit = async e => {
      e.preventDefault(); const code = $("lgCode").value.trim(), msg = $("lgJoinMsg");
      if (!CODE.test(code)){ msg.textContent = "Een code heeft drie letters en drie tekens, bijvoorbeeld DAS-7K2."; return; }
      msg.textContent = "Even geduld…";
      try { const l = await doeMee(normCode(code)); toast(`Je doet nu mee met ${l.name}.`); render(); online.renderScope && online.renderScope(); }
      catch(err){ msg.textContent = fout(err); }
    };
    $("lgNew").onsubmit = async e => {
      e.preventDefault(); const naam = $("lgName").value.trim(), msg = $("lgNewMsg");
      if (naam.length < 2){ msg.textContent = "Kies een naam van minstens 2 tekens."; return; }
      msg.textContent = "Even geduld…";
      try {
        const rows = await online.rpc("create_league", args({ p_name: naam })), l = rows[0];
        setLast(l.id); await bijwerken(); render();
        toast(`League ${l.name} gemaakt. Deel de code ${l.code} met andere spelers.`);
      } catch(err){ msg.textContent = fout(err); }
    };
    for (const l of ls){
      const el = $("lg-" + l.id); if (!el) continue;
      el.querySelector(".lgStand").onclick = () => { setLast(l.id); showRank("week", l.id); };
      el.querySelector(".lgDeel").onclick = () => shareOut(uitnodiging(l), el.querySelector(".msg"), el);
      el.querySelector(".lgCopy").onclick = () => { try { navigator.clipboard.writeText(l.code).then(() => el.querySelector(".msg").textContent = "Code gekopieerd."); } catch(e){} };
      const det = el.querySelector("details");
      det.addEventListener("toggle", () => { if (det.open) leden(l, det.querySelector(".lgleden")); });
    }
  }
  function kaart(l){
    const sinds = l.joined_day > 0 ? ` · lid sinds dagcasus #${l.joined_day + 1}` : "";
    return `<article class="lgcard" id="lg-${esc(l.id)}">
      <div class="lg-top"><h3>${esc(l.name)}</h3><button class="lgcode lgCopy" title="Code kopiëren">${esc(l.code)}</button></div>
      <p class="fine">${l.members} ${+l.members === 1 ? "lid" : "leden"}${l.is_owner ? " · jij beheert deze league" : sinds}</p>
      <div class="actions"><button class="btn lgStand">Stand</button><button class="btn line lgDeel">Uitnodigen</button><span class="msg"></span></div>
      <details><summary>Leden${l.is_owner ? " en beheer" : ""}</summary><div class="lgleden"><p class="fine">Laden…</p></div></details>
    </article>`;
  }
  async function leden(l, box){
    try {
      const rows = await online.rpc("league_members_list", args({ p_league: l.id })), me = p().name;
      box.innerHTML = `<ul class="lgmembers">${rows.map(r => `<li><span><b>${esc(r.name)}</b>${r.is_owner ? ` <span class="caps">beheerder</span>` : ""}</span>
          ${l.is_owner && r.name !== me ? `<button class="linklike lgRm" data-n="${esc(r.name)}">Verwijderen</button>` : ""}</li>`).join("")}</ul>
        ${l.is_owner ? `
          <form class="lgform lgRen"><label class="flab">Naam wijzigen</label><div class="row2"><input maxlength="30" value="${esc(l.name)}"><button class="btn line">Opslaan</button></div></form>
          <div class="actions"><button class="btn line lgNewCode">Nieuwe code maken</button></div>
          <p class="fine">Met een nieuwe code werkt de oude code niet meer. Wie al lid is, blijft lid.</p>` : ""}
        <div class="actions"><button class="linklike lgLeave">${l.is_owner && rows.length > 1 ? "League verlaten (een ander lid wordt beheerder)" : l.is_owner ? "League verlaten en opheffen" : "League verlaten"}</button></div>
        <span class="msg lgMsg"></span>`;
      const msg = box.querySelector(".lgMsg");
      const na = async tekst => { await bijwerken(); render(); online.renderScope && online.renderScope(); if (tekst) toast(tekst); };
      box.querySelectorAll(".lgRm").forEach(b => zeker(b, `${b.dataset.n} echt verwijderen?`, async () => {
        try { await online.rpc("league_admin", args({ p_league: l.id, p_action: "remove", p_value: b.dataset.n })); leden(l, box); bijwerken(); }
        catch(e){ msg.textContent = fout(e); }
      }));
      const ren = box.querySelector(".lgRen");
      if (ren) ren.onsubmit = async e => {
        e.preventDefault();
        try { const n = await online.rpc("league_admin", args({ p_league: l.id, p_action: "rename", p_value: ren.querySelector("input").value })); await na(`De league heet nu ${n}.`); }
        catch(err){ msg.textContent = fout(err); }
      };
      const nc = box.querySelector(".lgNewCode");
      if (nc) zeker(nc, "Zeker? De oude code vervalt", async () => {
        try { const c = await online.rpc("league_admin", args({ p_league: l.id, p_action: "newcode", p_value: null })); await na(`Nieuwe code: ${c}.`); }
        catch(e){ msg.textContent = fout(e); }
      });
      zeker(box.querySelector(".lgLeave"), "Tik nogmaals om te verlaten", async () => {
        try { await online.rpc("leave_league", args({ p_league: l.id })); await na(`Je hebt ${l.name} verlaten.`); }
        catch(e){ msg.textContent = fout(e); }
      });
    } catch(e){ box.innerHTML = `<p class="fine">${esc(fout(e))}</p>`; }
  }

  /* welkomstbalk: wie via een link binnenkomt, ziet van wie de uitnodiging is */
  function welkomTekst(){
    const van = pendingVan(), code = pendingCode();
    if (!van && !code) return null;
    let t = van ? `<b>${esc(van)} nodigt je uit om mee te spelen.</b>` : `<b>Je bent uitgenodigd voor een league.</b>`;
    t += code ? " Kies een spelersnaam, dan doe je meteen mee met de league." : " Kies een spelersnaam en je dagscore komt in de ranglijst.";
    return t + (code ? iosNoot(code) : "");
  }

  return { cached, vernieuw, huidige, setLast, tegel, vernieuwTegel, bijwerken, naNaam, verwerk, render,
           openUitnodigen, welkomTekst, heeftLink: () => !!(pendingVan() || pendingCode()) };
})();

function showLeague(){
  setView("league");
  League.render();
  window.scrollTo({ top:0, behavior:"auto" });
}
