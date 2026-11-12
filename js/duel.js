/* Vestigia – spelersduel (update 16, aan vanaf maandag 23 november 2026).
   Twee spelers spelen dezelfde drie casussen, niet tegelijk. De uitdager kiest klassiek of expert en speelt zijn drie
   casussen meteen; daarna heeft de ander 48 uur. De uitslag zie je pas als jullie allebei klaar zijn: dan gaan de
   casussen één voor één open. Per casus punten zoals bij de dagcasus; meeste punten wint, gelijke punten is gelijkspel.
   Beloning per duel: 3 eikels + 1 per punt + 10 bij winst of 5 bij gelijkspel (hooguit 60 per dag). De server kiest de casussen en beslist (techniek/supabase-018-spelersduel.sql).

   Uitdagen kan op naam (zoeken, je leaguegenoten en recente tegenstanders staan bovenaan) of met een link
   (?duel=CODE&van=Naam) voor wie hem als eerste opent. Wie via een link nog geen naam heeft, kiest er eerst een;
   dan telt het ook als uitnodiging.

   Een duelcasus wordt gespeeld in het gewone spelscherm (S.mode = "duel"). De stand van de casus die je speelt,
   staat in localStorage (vestigia:duels), zodat herladen de casus niet opnieuw laat beginnen; een gespeelde casus gaat
   meteen naar de server, en zonder verbinding later alsnog. Een duelcasus levert geen plaat op en telt niet voor de
   ranglijst; eikels en XP komen pas als het duel beslist is.

   Voorbeeld zonder server: ?duel=demo. Dan praat het duel met een nepserver in deze browser (NEP, onderaan): je kunt
   uitdagen, spelen en de uitslag zien; nepspelers spelen hun casussen vanzelf. Er gaat niets naar Supabase, en eikels,
   XP, prestaties en je statistieken veranderen niet. */
"use strict";

const Duel = (() => {
  const demo = (() => { try { return (new URL(location.href).searchParams.get("duel") || "").toLowerCase() === "demo"; } catch(e){ return false; } })();
  const D = demo ? "vestigia:demo:" : "vestigia:";        // het voorbeeld heeft zijn eigen opslag
  const K = { st: D + "duelstatus", lijst: D + "duellijst", spel: D + "duels", link: "vestigia:duel-link",
              pop: D + "duel-pop", van: "vestigia:van" };
  const START_DAG = "2026-11-23";
  const lees = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const zet = (k, v) => { try { v === null || v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const p = () => demo ? (online.player() || { id: "demo", key: "demo", name: "Jij" }) : online.enabled ? online.player() : null;
  const args = extra => Object.assign({ p_id: p().id, p_key: p().key }, extra || {});
  const rpc = (fn, a) => demo ? NEP.rpc(fn, a) : online.rpc(fn, a);
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wacht = ms => new Promise(r => setTimeout(r, ms));
  const fout = e => e && e.status && e.status < 500 ? e.message : "Dat lukte niet. Controleer je internetverbinding.";
  const modus = d => d.expert ? "expert" : "klassiek";
  const vandaagLokaal = () => { const d = new Date(), p2 = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };

  /* ---------- link lezen: ?duel=CODE (?duel=demo blijft in de adresbalk, zoals de andere voorbeelden) ---------- */
  (function leesLink(){
    let url; try { url = new URL(location.href); } catch(e){ return; }
    const c = (url.searchParams.get("duel") || "").trim();
    if (!c || demo) return;
    if (/^[A-Z2-9]{6}$/i.test(c)) zet(K.link, c.toUpperCase());
    url.searchParams.delete("duel");
    try { history.replaceState(history.state, "", url.pathname + (url.search || "") + url.hash); } catch(e){}
  })();

  /* ---------- stand ---------- */
  const status = () => lees(K.st) || {};
  const cache = () => (p() && lees(K.lijst)) || [];
  /* zichtbaar: vanaf 23 november, eerder voor testers (de server zegt het), of als er al een duel voor jou is */
  function zichtbaar(){
    if (demo) return true;
    const s = status();
    if (s.actief || s.lopend || s.voor_jou || s.uitslagen || cache().length || lees(K.link)) return true;
    return vandaagLokaal() >= START_DAG;
  }
  const actief = () => demo || !!status().actief || vandaagLokaal() >= START_DAG;
  const aantal = () => { const s = status(); return (s.voor_jou || 0) + (s.uitslagen || 0); };
  async function haalStatus(){
    if (!p()) return null;
    const r = await rpc("duel_status", args()), s = Array.isArray(r) ? r[0] : r;
    zet(K.st, s || {}); badge();
    return s;
  }
  async function haalLijst(){
    const r = await rpc("duel_lijst", args());
    zet(K.lijst, r || []);
    return r || [];
  }
  /* bolletje op de tab Spelen als er een uitdaging of uitslag op je wacht */
  function badge(){
    const knop = document.querySelector('#tabbar [data-tab="spelen"]'); if (!knop) return;
    let st = knop.querySelector(".duelstip");
    const n = zichtbaar() ? aantal() : 0;
    if (!n){ if (st) st.remove(); return; }
    if (!st){ knop.querySelector(".ic").insertAdjacentHTML("beforeend", `<span class="duelstip" aria-hidden="true"></span>`); st = knop.querySelector(".duelstip"); }
    st.textContent = n > 9 ? "9+" : String(n);
    knop.setAttribute("aria-label", `Spelen, ${n} ${n === 1 ? "duel wacht" : "duels wachten"} op je`);
  }

  /* ---------- profielen van tegenstanders (avatar) ---------- */
  const profielen = new Map();
  async function haalProfielen(namen){
    const nodig = [...new Set(namen.filter(Boolean))].filter(n => !profielen.has(n.toLowerCase()));
    if (!nodig.length) return;
    try { (await rpc("player_profiles", { p_names: nodig.slice(0, 100) }) || []).forEach(r => profielen.set(r.name.toLowerCase(), r)); } catch(e){ return; }
    nodig.forEach(n => { if (!profielen.has(n.toLowerCase())) profielen.set(n.toLowerCase(), { name: n }); });
  }
  function av(naam, cls){
    if (naam === null) return `<span class="duav leeg" aria-hidden="true">?</span>`;
    const pr = naam === true ? Object.assign({}, Profiel.mijn(), { name: (p() || {}).name }) : (profielen.get(String(naam).toLowerCase()) || { name: naam });
    const svg = avatarSVG(pr, "avatar " + (cls || "klein"));
    return `<span class="duav">${naam === true ? Levels.mijnRing(svg, cls || "klein") : Levels.ring(svg, pr.level, pr.pct || 0, cls || "klein")}</span>`;
  }

  /* ---------- tijd ---------- */
  function nogTijd(ms){
    const m = Math.max(0, Math.round((ms - Date.now()) / 60000));
    if (m >= 120) return `nog ${Math.floor(m / 60)} uur`;
    if (m >= 60) return `nog 1 uur en ${m - 60} min`;
    return m <= 1 ? "nog even" : `nog ${m} min`;
  }
  const NIET_GESPEELD = 3600000;

  /* ---------- de casussen moeten in deze versie van de app staan ---------- */
  const kent = d => (d.rondes || []).every(r => BY_ID.has(r.s) && BY_ID.get(r.s).cs && BY_ID.get(r.s).cs[r.k]);
  function teOud(){
    toast("Dit duel heeft een soort die nog niet in deze versie van Vestigia staat. Sluit de app en open hem opnieuw om bij te werken.", { duur: 8000 });
  }

  /* ---------- lokale stand van het duel dat je speelt ---------- */
  const spelAlle = () => lees(K.spel) || {};
  const spel = id => spelAlle()[id] || null;
  function spelZet(id, v){ const a = spelAlle(); if (v) a[id] = v; else delete a[id]; zet(K.spel, a); }
  let huidig = null;            // het duel (zoals de server het gaf) waarvan je nu een casus speelt

  /* Speel de volgende casus van een duel. Na herladen ga je verder waar je was, nooit opnieuw. */
  function speel(d){
    if (!kent(d)) return teOud();
    let lok = spel(d.id) || {};
    const r = Math.max((d.mijn || []).length, lok.klaar || 0);
    if (r >= 3) return open();
    const ronde = d.rondes[r];
    S = newGame("duel", !!d.expert, ronde.s, ronde.k, 0);
    S.duel = { id: d.id, ronde: r };
    if (lok.r === r && lok.g && lok.g.s === ronde.s){ S.guesses = lok.g.guesses || []; S.revealed = lok.g.revealed || 1; S.status = lok.g.status || "playing"; }
    else { lok = Object.assign({}, lok, { r, t0: Date.now(), g: null, ms: null, klaar: r }); spelZet(d.id, lok); }
    huidig = d;
    sluitPop();
    showGame(); inBeeld($("gameView")); window.scrollTo({ top: 0, behavior: "auto" });
    if (S.status !== "playing" && !(lok.stuur || []).some(x => x.r === r)) naCasus();     // klaar maar nog niet verstuurd
  }
  /* aangeroepen door spel.js na elke gok en extra waarneming */
  function bewaar(){
    if (!S || S.mode !== "duel") return;
    const lok = spel(S.duel.id) || { r: S.duel.ronde, t0: Date.now() };
    lok.r = S.duel.ronde;
    lok.g = { s: S.target, guesses: S.guesses, revealed: S.revealed, status: S.status };
    if (S.status !== "playing" && !lok.ms) lok.ms = Date.now() - (lok.t0 || Date.now());
    spelZet(S.duel.id, lok);
  }
  /* een casus is klaar: versturen, en de knop in de uitslag bijwerken */
  let versturen = false;
  async function naCasus(){
    if (!S || S.mode !== "duel") return;
    bewaar();
    const id = S.duel.id, r = S.duel.ronde, lok = spel(id);
    const won = S.status === "won", tries = Math.min(usedTries(), MAX);
    lok.stuur = (lok.stuur || []).filter(x => x.r !== r).concat({ r, won, tries: won ? tries : MAX, clues: S.revealed, ms: lok.ms || NIET_GESPEELD });
    lok.klaar = r + 1;
    spelZet(id, lok);
    if (!demo) online.syncSoon();        // het logboek (statistieken) gaat mee naar je andere apparaten
    tekenVervolg();
    await stuur(id);
    tekenVervolg();
  }
  /* wat nog niet bij de server is, op volgorde versturen; zonder verbinding de volgende keer */
  async function stuur(id){
    const lok = spel(id); if (!lok || !(lok.stuur || []).length || !p()) return null;
    versturen = true;
    let d = null;
    try {
      for (const x of lok.stuur.slice().sort((a, b) => a.r - b.r)){
        d = await rpc("duel_ronde", args({ p_duel: id, p_ronde: x.r, p_won: x.won, p_tries: x.tries, p_clues: x.clues, p_ms: Math.round(x.ms) }));
        const nu = spel(id); nu.stuur = (nu.stuur || []).filter(y => y.r !== x.r); spelZet(id, nu);
      }
    } catch(e){
      if (e.status && e.status < 500){ const nu = spel(id); if (nu){ nu.stuur = []; spelZet(id, nu); } toast(fout(e), { duur: 6000 }); }
    } finally { versturen = false; }
    if (d){
      if (huidig && huidig.id === d.id) huidig = d;
      werkBij(d);
      if ((d.mijn || []).length >= 3) spelZet(id, null);
      haalStatus().catch(() => {});
    }
    return d;
  }
  async function stuurAlles(){ for (const id of Object.keys(spelAlle())) await stuur(id); }
  function werkBij(d){ const ls = cache(), i = ls.findIndex(x => x.id === d.id); if (i >= 0) ls[i] = d; else ls.unshift(d); zet(K.lijst, ls); }

  /* ---------- in de uitslag van een duelcasus: wat nu ---------- */
  function vervolg(){ return `<div class="duelvervolg" id="duelVervolg">${vervolgBinnen()}</div>`; }
  function vervolgBinnen(){
    if (!S || S.mode !== "duel") return "";
    const r = S.duel.ronde, lok = spel(S.duel.id) || {}, wachtOpServer = versturen || (lok.stuur || []).length;
    const d = huidig || {}, tegen = d.tegen ? esc(d.tegen) : "je tegenstander";
    const stip = Array.from({ length: 3 }, (_, i) => `<i class="${i <= r ? "klaar" : ""}"></i>`).join("");
    const kop = `<div class="dvkop"><span class="caps">Spelersduel · ${esc(modus(d))}</span><span class="dustip" aria-label="${r + 1} van 3 casussen gespeeld">${stip}</span></div>`;
    if (r === 0) return `${kop}<p>Casus 1 van 3 gespeeld. Wat ${tegen} deed, zie je pas als jullie allebei klaar zijn.</p>
      <div class="actions"><button class="btn" id="duVolgende">Volgende casus</button></div>`;
    if (r === 1) return `${kop}<p>Casus 2 gespeeld. Speel er nog één om ${d.tegen ? `de score van ${tegen}` : "de score van je tegenstander"} te zien!</p>
      <div class="actions"><button class="btn" id="duVolgende">Volgende casus</button></div>`;
    if (d.ik === "uitdager"){
      return `${kop}<p>Je drie casussen zijn gespeeld. ${d.tegen ? `Nu heeft ${tegen} 48 uur om dezelfde casussen te spelen.` : "Deel nu de link: wie hem als eerste opent, speelt tegen je."}</p>
        <div class="actions">${wachtOpServer ? `<button class="btn" disabled>Even geduld…</button>` : `<button class="btn" id="duDeel">${d.tegen ? `Laat het ${tegen} weten` : "Deel de link"}</button><button class="btn line" id="duNaar">Naar je duels</button>`}<span class="msg" id="duMsg"></span></div>`;
    }
    const klaar = d.status === "klaar";
    return `${kop}<p>Je drie casussen zijn gespeeld. ${klaar ? "De uitslag is binnen." : wachtOpServer ? "Even geduld, je laatste casus wordt verstuurd." : ""}</p>
      <div class="actions"><button class="btn" id="duUitslag"${klaar ? "" : " disabled"}>${klaar ? "Bekijk de uitslag" : "Even geduld…"}</button>${klaar ? `<button class="btn line" id="duNaar">Naar je duels</button>` : ""}</div>`;
  }
  function tekenVervolg(){ const el = $("duelVervolg"); if (!el) return; el.innerHTML = vervolgBinnen(); bindVervolg(); }
  function bindVervolg(){
    if ($("duVolgende")) $("duVolgende").onclick = () => { const d = huidig; if (d) speel(d); };
    if ($("duNaar")) $("duNaar").onclick = () => open();
    if ($("duDeel")) $("duDeel").onclick = () => deel(huidig, $("duMsg"), $("duelVervolg"));
    if ($("duUitslag")) $("duUitslag").onclick = () => onthul(huidig);
  }
  function deelTekst(d){
    const me = p(), m = modus(d);
    const text = d.tegen
      ? `${d.tegen}, ik daag je uit voor een spelersduel in Vestigia (${m}): drie casussen, wie determineert ze het best? Je hebt 48 uur. 🐾`
      : `Wie durft? Ik daag je uit voor een spelersduel in Vestigia (${m}): drie casussen, wie determineert ze het best? Wie de link als eerste opent, speelt tegen mij. 🐾`;
    return { text, url: appLink({ duel: d.code, van: me && me.name }), kaal: true };
  }
  const deel = (d, msg, box) => { if (d) shareOut(deelTekst(d), msg, box); };

  /* ---------- balk boven de casus ---------- */
  function balk(){
    const el = $("duelBalk"); if (!el) return;
    if (!(S && S.mode === "duel")){ el.hidden = true; el.innerHTML = ""; return; }
    const d = huidig || {}, r = S.duel.ronde;
    const stip = Array.from({ length: 3 }, (_, i) => `<i class="${i < r ? "klaar" : i === r ? "nu" : ""}"></i>`).join("");
    el.hidden = false;
    el.innerHTML = `<div class="dbtekst"><span class="caps">Spelersduel · ${esc(modus(d))}</span>
        <b>${d.tegen ? `Tegen ${esc(d.tegen)}` : "Duel met een link"}</b></div>
      <span class="dustip" aria-label="casus ${r + 1} van 3">${stip}</span>
      <p class="fine">${d.expert ? "Je hebt één determinatie; elke extra waarneming kost een punt." : "Vijf pogingen, net als bij de dagcasus."} Elk punt telt: meeste punten na drie casussen wint.</p>`;
  }

  /* ---------- het scherm Spelersduel ---------- */
  let paneelOpen = false, revanche = null, gekozen = null, kiesExpert = null;
  async function open(opts){
    opts = opts || {};
    setView("duel");
    window.scrollTo({ top: 0, behavior: "auto" });
    if (opts.uitdaag){ paneelOpen = true; gekozen = opts.tegen === undefined ? gekozen : opts.tegen; revanche = opts.revanche || null; if (opts.expert !== undefined) kiesExpert = opts.expert; }
    render();
    /* uitleg bij de eerste keer (ook terug te vinden in de spelregels) */
    try { if (!localStorage.getItem("vestigia:nieuw:spelersduel")){ localStorage.setItem("vestigia:nieuw:spelersduel", "1"); const o = Nieuw.ONDERDELEN.find(x => x.id === "spelersduel"); if (o) await Nieuw.toon(o); } } catch(e){}
  }
  let laden = 0;
  async function render(){
    const body = $("duelBody");
    if (!online.enabled && !demo){ body.innerHTML = `<p class="rankempty">Het spelersduel werkt alleen met de online ranglijst, en die is nog niet ingesteld voor deze versie.</p>`; return; }
    if (!p()){
      body.innerHTML = `<div class="playerbox"><p><b>Kies eerst een spelersnaam.</b> Dan weet je tegenstander tegen wie hij speelt.</p>
        <div class="row2"><button class="btn" id="duNaam">Kies een spelersnaam</button></div></div>`;
      $("duNaam").onclick = () => MENU_GO.player();
      return;
    }
    const nr = ++laden;
    teken(cache(), true);
    try {
      await stuurAlles();
      const [ls] = await Promise.all([haalLijst(), haalStatus()]);
      await haalProfielen(ls.map(d => d.tegen));
      if (nr === laden) teken(ls, false);
    } catch(e){ if (nr === laden) teken(cache(), false, Veld.aan() ? "Veldmodus: zonder internet kun je geen duel spelen. Zodra je weer online bent, kan het weer." : "Je duels zijn nu niet bereikbaar. Controleer je internetverbinding."); }
  }
  /* indeling: jouw beurt · uitslag binnen · wacht op de ander · afgelopen */
  function groepen(ls){
    const g = { beurt: [], uitslag: [], wacht: [], klaar: [] };
    for (const d of ls){
      const mijn = Math.max((d.mijn || []).length, (spel(d.id) || {}).klaar || 0);
      if (d.status === "klaar") (d.gezien ? g.klaar : g.uitslag).push(d);
      else if (d.status === "verlopen" || d.status === "geweigerd") g.klaar.push(d);
      else if (mijn < 3) g.beurt.push(d);
      else g.wacht.push(d);
    }
    return g;
  }
  function teken(ls, bezig, melding){
    const body = $("duelBody"), g = groepen(ls);
    const gewonnen = ls.filter(d => d.uitslag === "gewonnen").length;
    $("duelTotaal").innerHTML = `${gewonnen}<small>${gewonnen === 1 ? "duel" : "duels"} gewonnen</small>`;
    const kan = actief();
    body.innerHTML = `
      ${melding ? `<p class="rankempty">${esc(melding)}</p>` : ""}
      ${demo ? `<p class="duelvoorbeeld"><b>Voorbeeld.</b> Niets wordt opgeslagen of verstuurd. De andere spelers zijn nep en spelen hun casussen vanzelf, een paar seconden nadat jij klaar bent.</p>` : ""}
      <div class="duelstart">
        ${kan ? `<button class="btn" id="duUitdagen" aria-expanded="${paneelOpen}">Daag iemand uit</button>`
              : `<p class="fine"><b>Het spelersduel begint op maandag 23 november.</b> Word je eerder uitgedaagd door een tester, dan kun je wel al meespelen.</p>`}
      </div>
      <section class="duelpaneel" id="duPaneel"${paneelOpen && kan ? "" : " hidden"}></section>
      ${sectie("Jouw beurt", g.beurt, kaartBeurt)}
      ${sectie("De uitslag is binnen", g.uitslag, kaartUitslag)}
      ${sectie("Wacht op de ander", g.wacht, kaartWacht)}
      ${sectie("Afgelopen", g.klaar.slice(0, 15), kaartKlaar)}
      ${!ls.length ? `<p class="rankempty">${bezig ? "Duels laden…" : "Je hebt nog geen duels gespeeld. Daag een leaguegenoot uit, of deel een link in de groepsapp."}</p>` : ""}
      <p class="fine">Een duel telt niet voor de ranglijst en levert geen plaat op. Je krijgt 3 eikels plus 1 per punt dat je haalt, en 10 extra als je wint of 5 bij gelijkspel (hooguit 60 per dag), plus XP. Je kunt vijf duels tegelijk uit hebben staan, en één tegelijk met dezelfde speler.</p>`;
    if ($("duUitdagen")) $("duUitdagen").onclick = () => { paneelOpen = !paneelOpen; revanche = null; teken(cache(), false); if (paneelOpen) setTimeout(() => $("duTegen") && $("duTegen").focus(), 50); };
    if (paneelOpen && kan) paneel();
    body.querySelectorAll("[data-du]").forEach(b => b.onclick = () => actie(b.dataset.du, b.dataset.id, b));
  }
  const sectie = (kop, ls, kaart) => ls.length ? `<section class="duelsec"><h3>${esc(kop)} <small>${ls.length}</small></h3><div class="lglist">${ls.map(kaart).join("")}</div></section>` : "";
  const tegenNaam = d => d.tegen ? esc(d.tegen) : "Nog niemand";
  const regelStand = d => d.stand && d.tegen && (d.stand.w + d.stand.v + d.stand.g) ? `<span class="dustand">onderling ${d.stand.w}–${d.stand.v}${d.stand.g ? ` (${d.stand.g} gelijk)` : ""}</span>` : "";
  function kaartBeurt(d){
    const mijn = Math.max((d.mijn || []).length, (spel(d.id) || {}).klaar || 0), ikDaag = d.ik === "uitdager";
    const wie = ikDaag ? `Jij tegen ${tegenNaam(d)}` : `${esc(d.tegen)} daagt je uit`;
    return `<article class="lgcard duelkaart beurt">
      <div class="dk-top">${av(ikDaag ? (d.tegen || null) : d.tegen)}<div><h4>${wie}</h4><p class="fine">${esc(modus(d))} · ${mijn ? `casus ${mijn + 1} van 3` : "drie casussen"} · ${esc(nogTijd(d.verloopt))}</p></div></div>
      <div class="actions"><button class="btn" data-du="speel" data-id="${esc(d.id)}">${mijn ? "Ga verder" : "Speel"}</button>
        ${!ikDaag && !mijn ? `<button class="linklike" data-du="weiger" data-id="${esc(d.id)}">Nee, bedankt</button>` : ""}<span class="msg"></span></div></article>`;
  }
  function kaartUitslag(d){
    return `<article class="lgcard duelkaart uitslag">
      <div class="dk-top">${av(d.tegen)}<div><h4>Duel met ${esc(d.tegen)}</h4><p class="fine">${esc(modus(d))} · jullie zijn allebei klaar</p></div></div>
      <div class="actions"><button class="btn" data-du="onthul" data-id="${esc(d.id)}">Bekijk de uitslag</button></div></article>`;
  }
  function kaartWacht(d){
    const n = d.hun_aantal || 0;
    return `<article class="lgcard duelkaart">
      <div class="dk-top">${av(d.tegen || null)}<div><h4>${d.tegen ? `Wacht op ${esc(d.tegen)}` : "Duel met een link"}</h4>
        <p class="fine">${esc(modus(d))} · ${d.tegen ? (n ? `${esc(d.tegen)} speelde ${n} van 3` : "nog niet begonnen") : "nog door niemand aangenomen"} · ${esc(nogTijd(d.verloopt))}</p></div></div>
      <div class="actions"><button class="btn line" data-du="deel" data-id="${esc(d.id)}">${d.tegen ? `Laat het ${esc(d.tegen)} weten` : "Deel de link"}</button><span class="msg"></span></div></article>`;
  }
  function kaartKlaar(d){
    const pu = som(d.mijn), ph = som(d.hun);
    const tekst = d.status === "verlopen" ? (d.ik === "uitdager" && (d.mijn || []).length < 3 ? "Je speelde het duel niet af" : d.tegen ? (d.ik === "uitdager" ? `${esc(d.tegen)} speelde niet op tijd` : "Je speelde niet op tijd") : "Niemand nam de link aan")
      : d.status === "geweigerd" ? (d.ik === "uitdager" ? `${esc(d.tegen)} zei nee` : "Je zei nee")
      : d.uitslag === "gewonnen" ? `Gewonnen van ${esc(d.tegen)}` : d.uitslag === "verloren" ? `Verloren van ${esc(d.tegen)}` : `Gelijkspel tegen ${esc(d.tegen)}`;
    const kls = d.uitslag === "gewonnen" ? " gewonnen" : d.uitslag === "verloren" ? " verloren" : "";
    return `<article class="lgcard duelkaart${kls}">
      <div class="dk-top">${av(d.tegen || null)}<div><h4>${tekst}</h4><p class="fine">${esc(modus(d))}${d.status === "klaar" ? ` · ${pu}–${ph} punten` : ""} ${regelStand(d)}</p></div></div>
      ${d.tegen && actief() ? `<div class="actions">${d.status === "klaar" ? `<button class="btn line" data-du="onthul" data-id="${esc(d.id)}">Terugkijken</button>` : ""}<button class="btn line" data-du="revanche" data-id="${esc(d.id)}">${d.status === "klaar" ? "Revanche" : "Nieuw duel"}</button><span class="msg"></span></div>` : ""}</article>`;
  }
  const som = rs => (rs || []).reduce((a, r) => a + (+r.punten || 0), 0);
  async function actie(soort, id, knop){
    const d = cache().find(x => x.id === id); if (!d) return;
    const msg = knop.parentElement.querySelector(".msg");
    if (soort === "speel") return speel(d);
    if (soort === "onthul") return onthul(d);
    if (soort === "deel") return deel(d, msg, knop.closest("article"));
    if (soort === "revanche") return open({ uitdaag: true, tegen: d.tegen, revanche: d.status === "klaar" ? d.id : null, expert: d.expert });
    if (soort === "weiger"){
      if (!knop.dataset.zeker){ knop.dataset.zeker = "1"; knop.textContent = "Zeker weten?"; setTimeout(() => { delete knop.dataset.zeker; knop.textContent = "Nee, bedankt"; }, 4000); return; }
      try { await rpc("duel_weiger", args({ p_duel: d.id })); toast(`Je hebt het duel van ${d.tegen} afgeslagen.`); render(); }
      catch(e){ if (msg) msg.textContent = fout(e); }
    }
  }

  /* ---------- uitdagen: tegen wie, en welke modus ---------- */
  let zoekT = null;
  function paneel(){
    const el = $("duPaneel"), expert = kiesExpert === null ? pref.expert : kiesExpert;
    el.innerHTML = `
      <label class="flab" for="duTegen">Tegen wie?</label>
      <div class="row2"><input id="duTegen" maxlength="20" placeholder="Zoek een spelersnaam" autocomplete="off" value="${esc(gekozen || "")}"></div>
      <div class="dukeus" id="duKeus" role="group" aria-label="Spelers"></div>
      <label class="dulink"><input type="checkbox" id="duLink"${gekozen === "" ? " checked" : ""}> Of maak een duel met een link: wie hem als eerste opent, speelt tegen je</label>
      <span class="flab">Modus</span>
      <div class="seg duseg${expert ? " expert" : ""} klaar" role="group" aria-label="Modus van het duel">
        <button type="button" id="duKl" aria-pressed="${!expert}">Klassiek</button><button type="button" id="duEx" aria-pressed="${expert}">Expert</button></div>
      <p class="fine" id="duModusUitleg">${expert ? "Expert: één determinatie per casus; hoe minder waarnemingen je opent, hoe meer punten." : "Klassiek: vijf pogingen per casus; hoe eerder goed, hoe meer punten."}</p>
      ${revanche ? `<p class="fine">Revanche: dezelfde tegenstander, drie nieuwe casussen.</p>` : ""}
      <div class="actions"><button class="btn" id="duStart">Start het duel</button><button class="linklike" id="duAnnuleer">Annuleren</button><span class="msg" id="duStartMsg"></span></div>
      <p class="fine">Je speelt je drie casussen meteen. Een begonnen duel maak je af: stop je halverwege, dan ga je later verder waar je was.</p>`;
    const inp = $("duTegen"), link = $("duLink");
    const kies = naam => { gekozen = naam; inp.value = naam; link.checked = false; zoek(naam); };
    inp.oninput = () => { gekozen = inp.value.trim(); if (gekozen) link.checked = false; clearTimeout(zoekT); zoekT = setTimeout(() => zoek(inp.value), 250); };
    link.onchange = () => { if (link.checked){ gekozen = ""; inp.value = ""; } else gekozen = null; zoek(""); };
    const zetModus = x => { kiesExpert = x; paneel(); };
    $("duKl").onclick = () => zetModus(false); $("duEx").onclick = () => zetModus(true);
    $("duAnnuleer").onclick = () => { paneelOpen = false; revanche = null; gekozen = null; teken(cache(), false); };
    $("duStart").onclick = () => begin(link.checked ? "" : inp.value.trim(), kiesExpert === null ? pref.expert : kiesExpert);
    paneel.kies = kies;
    zoek(inp.value);
  }
  let zoekNr = 0;
  async function zoek(q){
    const box = $("duKeus"); if (!box) return;
    const nr = ++zoekNr;
    try {
      const rows = await rpc("duel_zoek", args({ p_q: String(q || "").trim() }));
      if (nr !== zoekNr || !$("duKeus")) return;
      await haalProfielen(rows.map(r => r.name));
      if (nr !== zoekNr || !$("duKeus")) return;
      const bron = { league: "league", recent: "eerder" };
      box.innerHTML = rows.length ? rows.map(r => `<button type="button" class="dukies" data-n="${esc(r.name)}" aria-pressed="${!!gekozen && gekozen.toLowerCase() === r.name.toLowerCase()}">${av(r.name)}<span>${esc(r.name)}${bron[r.bron] ? `<small>${bron[r.bron]}</small>` : ""}</span></button>`).join("")
        : `<p class="fine">${q ? "Geen speler gevonden met deze naam." : "Typ een naam. Je leaguegenoten en wie je eerder uitdaagde, staan hier straks bovenaan."}</p>`;
      box.querySelectorAll(".dukies").forEach(b => b.onclick = () => paneel.kies(b.dataset.n));
    } catch(e){ if (nr === zoekNr && $("duKeus")) box.innerHTML = `<p class="fine">${esc(fout(e))}</p>`; }
  }
  /* de dagcasussen rond vandaag liever niet in een duel (dan zou het duel de dagcasus verklappen, of andersom) */
  function overslaan(){
    const t = todayIndex(), ids = new Set();
    for (let i = Math.max(0, t - 14); i <= t + 21; i++){ try { ids.add(daily(i).id); } catch(e){} }
    return [...ids].slice(0, 60);
  }
  async function begin(tegen, expert){
    const msg = $("duStartMsg"), knop = $("duStart");
    if (tegen === null || (tegen === "" && !$("duLink").checked)){ msg.textContent = "Kies een speler, of vink aan dat je een link wilt delen."; return; }
    knop.disabled = true; msg.textContent = "De casussen worden gekozen…";
    try {
      await stuurAlles();
      const d = await rpc("duel_maak", args({ p_tegen: tegen || null, p_expert: !!expert, p_skip: overslaan(), p_revanche: revanche }));
      paneelOpen = false; revanche = null; gekozen = null;
      werkBij(d);
      speel(d);
    } catch(e){ knop.disabled = false; msg.textContent = fout(e); }
  }

  /* ---------- de uitslag: casus voor casus open ---------- */
  function regel(r, expert){
    if (!r) return `<span class="dr-niet">niet gespeeld</span>`;
    if (!r.won) return `<span class="dr-mis">✕ niet gevonden</span><b>0</b>`;
    const w = expert ? `${r.clues} ${r.clues === 1 ? "waarneming" : "waarnemingen"}` : `${r.tries} ${r.tries === 1 ? "poging" : "pogingen"}`;
    return `<span class="dr-goed">✓ ${w}</span><b>${r.punten}</b>`;
  }
  async function onthul(d){
    if (!d) return;
    if (!d.rondes || !kent(d)) return teOud();
    await haalProfielen([d.tegen]);
    const pop = $("duelPop"), body = $("duelPopBody"), mijn = d.mijn || [], hun = d.hun || [];
    const pu = som(mijn), ph = som(hun);
    const naam = esc(d.tegen);
    const oordeel = d.uitslag === "gewonnen" ? "Je wint!" : d.uitslag === "verloren" ? `${naam} wint` : "Gelijkspel";
    const waarom = berichtje(d.uitslag, pu, d.tegen);
    const eik = d.eikels !== undefined && d.eikels !== null ? +d.eikels : 3 + pu + (d.uitslag === "gewonnen" ? 10 : d.uitslag === "gelijk" ? 5 : 0);
    const rondes = d.rondes.map((ro, i) => {
      const t = BY_ID.get(ro.s), a = mijn.find(x => x.r === i), b = hun.find(x => x.r === i);
      const beste = a && b ? (a.punten > b.punten ? "a" : b.punten > a.punten ? "b" : "") : "";
      return `<li class="duronde" style="--i:${i}"><div class="drsoort"><span class="caps">Casus ${i + 1}</span><b>${esc(t.n)}</b><i>${esc(t.s)}</i></div>
        <div class="drspeler${beste === "a" ? " beste" : ""}"><small>Jij</small>${regel(a, d.expert)}</div>
        <div class="drspeler${beste === "b" ? " beste" : ""}"><small>${naam}</small>${regel(b, d.expert)}</div></li>`;
    }).join("");
    const st = d.stand || { w: 0, v: 0, g: 0 };
    const kls = d.uitslag === "gewonnen" ? "gewonnen" : d.uitslag === "verloren" ? "verloren" : "gelijk";
    body.innerHTML = `
      <div class="top"><span class="caps">Spelersduel · ${esc(modus(d))}${demo ? " · voorbeeld" : ""}</span><button class="iconbtn" id="duPopX" aria-label="Sluiten"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>
      <div class="duwie"><div>${av(true, "mid")}<b>Jij</b></div><span class="duvs">tegen</span><div>${av(d.tegen, "mid")}<b>${naam}</b></div></div>
      <ol class="durondes">${rondes}</ol>
      <div class="dutotaal"><div><small>Jij</small><b data-tel="${pu}">0</b></div><span>punten</span><div><small>${naam}</small><b data-tel="${ph}">0</b></div></div>
      <div class="duoordeel ${kls}"><h2 id="duelPopH">${oordeel}</h2><p>${esc(waarom)}</p>
        <p class="eikelline" id="duEikels"${!d.gezien ? "" : " hidden"}>${EIKEL} +${eik} ${eik === 1 ? "eikel" : "eikels"} · +${d.uitslag === "gewonnen" ? 20 : 10} XP</p>
        <p class="fine">Onderling: jij ${st.w}, ${naam} ${st.v}${st.g ? `, ${st.g} gelijk` : ""}.</p></div>
      <div class="actions dumidden">${actief() ? `<button class="btn" id="duRevanche">Revanche</button>` : ""}<button class="btn line" id="duPopSluit">Sluiten</button></div>`;
    pop.classList.toggle("stil", reduce());
    pop.classList.remove("af");
    pop.hidden = false;
    $("duPopX").onclick = $("duPopSluit").onclick = sluitPop;
    if ($("duRevanche")) $("duRevanche").onclick = () => { sluitPop(); open({ uitdaag: true, tegen: d.tegen, revanche: d.id, expert: d.expert }); };
    $("duPopSluit").focus({ preventScroll: true });
    const nieuw = !d.gezien;
    if (nieuw){
      rpc("duel_gezien", args({ p_duel: d.id })).then(() => { d.gezien = true; werkBij(d); return haalStatus(); }).then(() => { if (VIEW === "duel") render(); }).catch(() => {});
    }
    /* casussen één voor één, dan de totalen tellen, dan het oordeel */
    const telOp = () => body.querySelectorAll("[data-tel]").forEach(b => { b.textContent = b.dataset.tel; });
    if (reduce()){ telOp(); pop.classList.add("af"); }
    else {
      await wacht(450 + 3 * 700);
      const els = [...body.querySelectorAll("[data-tel]")], t0 = performance.now();
      await new Promise(klaar => { const stap = nu => { const x = Math.min(1, (nu - t0) / 700); els.forEach(b => { b.textContent = String(Math.round(+b.dataset.tel * x)); }); if (x < 1) requestAnimationFrame(stap); else klaar(); }; requestAnimationFrame(stap); });
      await wacht(250);
      if (!pop.hidden) pop.classList.add("af");
    }
    if (nieuw && !demo){ await wacht(reduce() ? 0 : 600); Profiel.naSpel().catch(() => {}); }
  }
  /* een wisselend zinnetje onder ‘Je wint!’, ‘X wint’ of ‘Gelijkspel’ (de punten staan er al boven) */
  const BERICHT = {
    gewonnen: ["Gefeliciteerd, dit duel was jij de betere!", "Netjes gedaan! Nog een potje?", "Sterk gedetermineerd. {x} wil vast revanche.",
               "Gewonnen! Je veldkennis liet zich zien.", "Mooi duel. Deze mag je in je veldboekje schrijven."],
    verloren: ["Deze keer was {x} je de baas. Neem revanche!", "Jammer! Volgende keer beter. Nog een potje?", "Net niet. Wie lacht er na de revanche?",
               "{x} wint dit duel, maar je hebt wel drie soorten geoefend.", "Verloren, maar de stand is nog niet definitief. Revanche?"],
    gelijk:   ["Gelijk opgegaan! Wie beslist het in de revanche?", "Precies even goed als {x}. Spannend!", "Gelijkspel. Een revanche moet de doorslag geven."],
    nul:      ["Geen van jullie vond een soort. Lastige casussen! Nog een poging?"]
  };
  function berichtje(uitslag, punten, tegen){
    const lijst = BERICHT[uitslag === "gelijk" && !punten ? "nul" : uitslag] || BERICHT.gelijk;
    return lijst[Math.floor(Math.random() * lijst.length)].replace("{x}", tegen || "je tegenstander");
  }
  function sluitPop(){ const pop = $("duelPop"); if (pop && !pop.hidden){ pop.hidden = true; pop.classList.remove("af"); } }
  $("duelPop").addEventListener("click", e => { if (e.target === $("duelPop")) sluitPop(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("duelPop").hidden) sluitPop(); });

  /* ---------- pop-up: je bent uitgedaagd ---------- */
  function uitdagingPop(d, vrij){
    const pop = $("duelPop"), body = $("duelPopBody");
    return new Promise(klaar => {
      body.innerHTML = `
        <div class="top"><span class="caps">Spelersduel</span><button class="iconbtn" id="duPopX" aria-label="Sluiten"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>
        <div class="duuitdaging">${av(d.tegen, "mid")}<h2 id="duelPopH">${esc(d.tegen)} daagt je uit!</h2>
          <p>Drie casussen in <b>${esc(modus(d))}</b>. ${esc(d.tegen)} heeft ze al gespeeld; jij hebt ${esc(nogTijd(d.verloopt))}. Wie de meeste punten haalt, wint.</p></div>
        <div class="actions"><button class="btn" id="duJa">${vrij ? "Neem de uitdaging aan" : "Speel nu"}</button><button class="btn line" id="duLater">Later</button>
          ${!vrij ? `<button class="linklike" id="duNee">Nee, bedankt</button>` : ""}<span class="msg" id="duPopMsg"></span></div>
        <p class="fine">Je speelt de drie casussen achter elkaar. Een duel telt niet voor de ranglijst.</p>`;
      pop.hidden = false; $("duJa").focus({ preventScroll: true });
      const dicht = () => { sluitPop(); klaar(); };
      $("duPopX").onclick = $("duLater").onclick = dicht;
      $("duJa").onclick = async () => {
        if (!vrij){ klaar(); return speel(d); }
        $("duJa").disabled = true; $("duPopMsg").textContent = "Even geduld…";
        try { const n = await rpc("duel_neem", args({ p_code: d.code })); werkBij(n); klaar(); speel(n); haalStatus().catch(() => {}); }
        catch(e){ $("duJa").disabled = false; $("duPopMsg").textContent = fout(e); }
      };
      if ($("duNee")){
        const nee = $("duNee");
        nee.onclick = async () => {
          if (!nee.dataset.zeker){ nee.dataset.zeker = "1"; nee.textContent = "Zeker weten?"; return; }
          try { await rpc("duel_weiger", args({ p_duel: d.id })); toast(`Je hebt het duel van ${d.tegen} afgeslagen.`); dicht(); haalStatus().catch(() => {}); }
          catch(e){ $("duPopMsg").textContent = fout(e); }
        };
      }
    });
  }

  /* ---------- een duellink openen ---------- */
  async function verwerkLink(){
    const code = lees(K.link);
    if (!code || !online.enabled || demo) return;
    if (!p()) return;                                  // eerst een naam (welkomstbalk); daarna naNaam()
    zet(K.link, null);
    try {
      const d = await rpc("duel_haal", args({ p_code: code }));
      await haalProfielen([d.tegen]);
      /* niet wachten op de pop-up: zo ziet de wachtrij dat er al iets open staat en toont hij niets anders */
      if (d.ik === "vrij"){ uitdagingPop(d, true); return; }
      werkBij(d);
      if (d.ik === "uitdager") return open();
      if (d.status === "klaar"){ onthul(d); return; }
      if (d.status === "open" && (d.mijn || []).length < 3){ if ((d.mijn || []).length) speel(d); else uitdagingPop(d, false); return; }
      return open();
    } catch(e){ toast(fout(e), { duur: 6000 }); }
  }
  function naNaam(){ haalStatus().catch(() => {}); setTimeout(() => verwerkLink(), 600); }
  /* welkomstbalk voor wie via een duellink binnenkomt zonder naam */
  function welkomTekst(){
    if (!lees(K.link)) return null;
    const van = lees(K.van);
    return `<b>${van ? esc(van) + " daagt" : "Iemand daagt"} je uit voor een spelersduel.</b> Kies een spelersnaam, dan kun je meteen spelen: drie casussen, wie determineert ze het best?`;
  }

  /* ---------- wachtrij bij het openen: een uitslag die binnen is, of een nieuwe uitdaging ---------- */
  let kandidaat = null;
  Wachtrij.voeg({ id: "duel", prio: 1.5,
    async kan(){
      kandidaat = null;
      if (!p() || lees(K.link) || (S && S.mode === "duel")) return false;     // niet midden in een duel
      const s = await haalStatus().catch(() => null);
      if (!s || !(s.voor_jou || s.uitslagen)) return false;
      const ls = await haalLijst();
      await haalProfielen(ls.map(d => d.tegen));
      const g = groepen(ls), getoond = lees(K.pop) || {};
      kandidaat = g.uitslag[0] || g.beurt.find(d => d.ik === "tegenstander" && !(d.mijn || []).length && getoond[d.id] !== todayIndex()) || null;
      return !!kandidaat;
    },
    toon(){
      if (kandidaat.status === "klaar") return onthul(kandidaat);
      const g = lees(K.pop) || {}; g[kandidaat.id] = todayIndex(); zet(K.pop, g);
      return uitdagingPop(kandidaat, false);
    } });

  /* ---------- opstarten ---------- */
  function start(){
    badge();
    if (demo) NEP.begin();
    if (!p()) return;
    stuurAlles().then(() => haalStatus()).catch(() => {});
  }
  window.addEventListener("online", () => { if (p() && !demo) stuurAlles().catch(() => {}); });

  /* ---------- nepserver voor het voorbeeld (?duel=demo) ----------
     Doet wat supabase-018 doet, maar in deze browser (sessionStorage): casussen kiezen, rondes opslaan, beslissen.
     Bij het openen staat er een uitdaging van Joris klaar. Daag je iemand uit, dan speelt die zijn casussen een paar
     seconden nadat jij klaar bent; een linkduel wordt aangenomen door Bram. */
  const NEP = (() => {
    const KEY = "vestigia:demo:server", NAMEN = ["Sanne", "Joris", "Ilse", "Bram", "Femke", "Daan"];
    const PROF = { Sanne: ["ree", "mint", 7, 40], Joris: ["das", "oker", 12, 70], Ilse: ["kerkuil", "nacht", 4, 20], Bram: ["boomkikker", "groen", 9, 55], Femke: ["ijsvogel", "wad", 3, 80], Daan: ["vos", "heide", 15, 10] };
    const lees_ = () => { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch(e){ return null; } };
    const zet_ = v => { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch(e){} };
    const ik = () => (online.player() || { name: "Jij" }).name;
    const punten = (ex, r) => !r.won ? 0 : ex ? Math.max(1, 7 - r.clues) : Math.max(1, 6 - r.tries);
    const fout = (msg, status) => { throw Object.assign(new Error(msg), { status: status || 400 }); };
    const nu = () => Date.now();
    function kies(skip){
      const groepen = [...new Set(TARGETS.map(t => t.g))].sort(() => Math.random() - .5), out = [];
      for (const g of groepen){ if (out.length === 3) break;
        const pool = TARGETS.filter(t => t.g === g && !skip.includes(t.id)); if (!pool.length) continue;
        const t = pool[Math.floor(Math.random() * pool.length)]; out.push({ s: t.id, k: Math.floor(Math.random() * t.cs.length) }); }
      return out;
    }
    /* een nepspeler speelt: meestal goed, soms niet */
    function nepSpel(d){
      return d.rondes.map((x, r) => { const won = Math.random() < .8, tries = won ? 1 + Math.floor(Math.random() * 4) : 5, clues = won ? 1 + Math.floor(Math.random() * 4) : 5;
        const o = { r, won, tries: d.expert ? 1 : tries, clues: d.expert ? clues : tries, ms: 20000 + Math.floor(Math.random() * 120000) }; o.punten = punten(d.expert, o); return o; });
    }
    function db(){
      let v = lees_();
      if (!v){
        v = { duels: [] };
        const d = { id: "nep-joris", code: "JORIS1", uitdager: "Joris", tegenstander: ik(), expert: false, rondes: kies([]), status: "open",
          gemaakt: nu() - 3 * 3600e3, open_op: nu() - 3 * 3600e3, spel: {}, revanche_van: null };
        d.spel.Joris = nepSpel(d);
        v.duels.push(d); zet_(v);
      }
      return v;
    }
    function json(d){
      const me = ik(), ikU = d.uitdager === me, ander = ikU ? d.tegenstander : d.uitdager, mijn = d.spel[me] || [], hun = ander ? (d.spel[ander] || []) : [];
      const tegen = db().duels.filter(x => x.status === "klaar" && [x.uitdager, x.tegenstander].includes(ander) && [x.uitdager, x.tegenstander].includes(me));
      const uitslag = d.status !== "klaar" ? null : !d.winnaar ? "gelijk" : d.winnaar === me ? "gewonnen" : "verloren";
      const pu = mijn.reduce((a, r) => a + r.punten, 0);
      return { id: d.id, code: d.code, ik: ikU ? "uitdager" : "tegenstander", tegen: ander, expert: d.expert, rondes: d.rondes, status: d.status,
        gemaakt: d.gemaakt, verloopt: d.status === "bezig" ? d.gemaakt + 864e5 : d.status === "open" ? d.open_op + 1728e5 : null, klaar: d.klaar || null,
        mijn, hun_aantal: hun.length, hun: d.status === "klaar" ? hun : [], uitslag, gezien: ikU ? !!d.gezien_u : !!d.gezien_t, revanche_van: d.revanche_van,
        stand: { w: tegen.filter(x => x.winnaar === me).length, v: tegen.filter(x => x.winnaar === ander).length, g: tegen.filter(x => !x.winnaar).length },
        eikels: d.status === "klaar" ? 3 + pu + (uitslag === "gewonnen" ? 10 : uitslag === "gelijk" ? 5 : 0) : null };
    }
    function afronden(d){
      const som = n => (d.spel[n] || []).reduce((a, r) => a + r.punten, 0), pu = som(d.uitdager), pt = som(d.tegenstander);
      d.status = "klaar"; d.klaar = nu(); d.winnaar = pu > pt ? d.uitdager : pt > pu ? d.tegenstander : null;
    }
    /* de tegenstander speelt een paar seconden nadat jij klaar bent */
    function laatSpelen(id){
      setTimeout(() => {
        const v = db(), d = v.duels.find(x => x.id === id); if (!d || d.status !== "open") return;
        if (!d.tegenstander) d.tegenstander = "Bram";
        d.spel[d.tegenstander] = nepSpel(d); afronden(d); zet_(v);
        haalStatus().then(() => { if (VIEW === "duel") render(); }).catch(() => {});
        toast(`Voorbeeld: ${d.tegenstander} heeft de drie casussen gespeeld. De uitslag is binnen.`, { label: "Bekijk", duur: 8000, run: () => { $("toast").hidden = true; onthul(json(d)); } });
      }, 7000);
    }
    const r = {
      duel_status(){ const v = db(), me = ik();
        return [{ actief: true, vanaf: "2026-11-23",
          voor_jou: v.duels.filter(d => d.tegenstander === me && d.status === "open" && (d.spel[me] || []).length < 3).length,
          uitslagen: v.duels.filter(d => d.status === "klaar" && ((d.uitdager === me && !d.gezien_u) || (d.tegenstander === me && !d.gezien_t))).length,
          lopend: v.duels.filter(d => ["bezig", "open"].includes(d.status)).length }]; },
      duel_lijst(){ return db().duels.filter(d => d.uitdager === ik() || (d.tegenstander === ik() && d.status !== "bezig")).sort((a, b) => b.gemaakt - a.gemaakt).map(json); },
      duel_haal(a){ const d = db().duels.find(x => x.code === a.p_code || x.id === a.p_code); if (!d) fout("Dit duel bestaat niet (meer)"); return json(d); },
      duel_zoek(a){ const q = String(a.p_q || "").toLowerCase();
        return NAMEN.filter(n => !q ? n === "Sanne" || n === "Joris" || n === "Ilse" : n.toLowerCase().startsWith(q) || (q.length >= 3 && n.toLowerCase().includes(q)))
          .map(n => ({ name: n, bron: n === "Joris" ? "recent" : n === "Sanne" || n === "Ilse" ? "league" : "" })); },
      duel_maak(a){
        const v = db(), me = ik(), tegen = a.p_tegen ? NAMEN.find(n => n.toLowerCase() === a.p_tegen.toLowerCase()) : null;
        if (a.p_tegen && !tegen) fout("Deze speler bestaat niet");
        if (tegen && v.duels.some(d => ["bezig", "open"].includes(d.status) && [d.uitdager, d.tegenstander].includes(tegen))) fout("Je hebt al een duel lopen met deze speler. Maak dat eerst af.");
        if (v.duels.some(d => d.uitdager === me && d.status === "bezig")) fout("Speel eerst je vorige duel af.");
        const d = { id: "nep-" + nu(), code: Math.random().toString(36).slice(2, 8).toUpperCase(), uitdager: me, tegenstander: tegen, expert: !!a.p_expert,
          rondes: kies(a.p_skip || []), status: "bezig", gemaakt: nu(), spel: {}, revanche_van: a.p_revanche || null };
        v.duels.push(d); zet_(v); return json(d);
      },
      duel_neem(a){ return r.duel_haal(a); },
      duel_ronde(a){
        const v = db(), d = v.duels.find(x => x.id === a.p_duel), me = ik(); if (!d) fout("Dit duel bestaat niet (meer)");
        const mijn = d.spel[me] = d.spel[me] || [];
        if (a.p_ronde < mijn.length) return json(d);
        const o = { r: a.p_ronde, won: !!a.p_won, tries: a.p_tries, clues: a.p_clues, ms: a.p_ms }; o.punten = punten(d.expert, o); mijn.push(o);
        if (mijn.length === 3){ if (d.uitdager === me){ d.status = "open"; d.open_op = nu(); laatSpelen(d.id); } else afronden(d); }
        zet_(v); return json(d);
      },
      duel_weiger(a){ const v = db(), d = v.duels.find(x => x.id === a.p_duel); if (d){ d.status = "geweigerd"; d.klaar = nu(); zet_(v); } return null; },
      duel_gezien(a){ const v = db(), d = v.duels.find(x => x.id === a.p_duel); if (d){ if (d.uitdager === ik()) d.gezien_u = true; else d.gezien_t = true; zet_(v); } return null; },
      player_profiles(a){ return (a.p_names || []).filter(n => PROF[n]).map(n => ({ name: n, avatar: PROF[n][0], color: PROF[n][1], level: PROF[n][2], pct: PROF[n][3] })); }
    };
    return {
      rpc: async (fn, a) => { await wacht(150); if (!r[fn]) throw Object.assign(new Error("Niet in het voorbeeld"), { status: 404 }); return JSON.parse(JSON.stringify(r[fn](a || {}))); },
      begin(){ db(); /* een duel dat al open stond toen je herlaadde, wordt alsnog gespeeld */ for (const d of db().duels) if (d.status === "open" && !(d.spel[d.tegenstander] || []).length && d.uitdager === ik()) laatSpelen(d.id); }
    };
  })();

  return { demo, zichtbaar, aantal, open, render, speel, bewaar, naCasus, vervolg, bindVervolg, balk, onthul, verwerkLink, naNaam, welkomTekst, start, badge };
})();
