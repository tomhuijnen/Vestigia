/* Vestigia – ‘Gebruik de app!’ en ‘Koppel je apparaten’ (update 21)
   Twee knoppen bovenaan Mijn profiel.
   - Gebruik de app!: installeren met uitleg die past bij het apparaat. Op Android, en in Chrome en Edge op een laptop,
     is het één tik (de installatievraag van de browser). Op een iPhone gaat het in drie stappen, met een bewegend
     pijltje naar onderen. De knop verdwijnt als Vestigia al als app draait.
   - Koppel je apparaten: op het ene apparaat maak je een korte code van 6 tekens, met een QR-code. Hij is 10 minuten
     geldig en werkt maar één keer. Op het andere apparaat scan je de QR-code of typ je de code in (supabase-019).
     De lange spelerscode blijft gewoon werken.
   - Anoniem apparaatnummer: een willekeurig nummer per apparaat (geen naam, geen andere gegevens), hooguit één keer
     per dag gemeld. Zo weet de app hoeveel apparaten je gebruikt en of je Vestigia ergens als app hebt. Wie al twee
     apparaten gebruikt, krijgt geen uitleg over koppelen. Wie de app al heeft, krijgt geen uitleg over installeren.
     Ook de pushmeldingen (update 18) gebruiken dit nummer.
   Voorbeeld zonder database: ?apparaat=demo (een nepcode; koppelen zelf gebeurt dan niet). */
"use strict";

const Apparaat = (() => {
  const K = { id: "vestigia:apparaat", stand: "vestigia:apparaten", in: "vestigia:koppelIn", vorige: "vestigia:vorigeSpeler", nieuw: "vestigia:nieuw:apparaten" };
  const lees = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const zet = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  let demo = false;
  try { const u = new URLSearchParams(location.search); if (u.get("apparaat") === "demo") sessionStorage.setItem("vestigia:apparaatdemo", "1"); if (u.get("apparaat") === "uit") sessionStorage.removeItem("vestigia:apparaatdemo"); demo = !!sessionStorage.getItem("vestigia:apparaatdemo"); } catch(e){}

  /* ---------- aankomst via de QR-code: …#code=ABC234 ----------
     Meteen uit de adresbalk halen (dan staat de code niet in de geschiedenis), en de uitleg voor nieuwe spelers
     overslaan: wie koppelt, kent het spel al. */
  (function(){
    const m = location.hash.match(/^#code=([A-Za-z0-9]{6})$/);
    if (!m) return;
    try { sessionStorage.setItem(K.in, m[1].toUpperCase()); localStorage.setItem("vestigia:tutorial", "1"); localStorage.setItem("vestigia:nav-b", "1"); } catch(e){}
    history.replaceState(null, "", location.pathname + location.search);
  })();

  /* ---------- het apparaat ---------- */
  function nummer(){
    let n = null; try { n = localStorage.getItem(K.id); } catch(e){}
    if (!n || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(n)){
      n = (crypto.randomUUID && crypto.randomUUID()) || "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
      try { localStorage.setItem(K.id, n); } catch(e){}
    }
    return n;
  }
  const ios = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  const ipad = () => /iPad/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  const android = () => /Android/.test(navigator.userAgent);
  const soort = () => ios() ? "ios" : android() ? "android" : "pc";
  const isApp = () => (window.matchMedia && (matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: window-controls-overlay)").matches)) || navigator.standalone === true;
  const vraag = () => (typeof installEvt !== "undefined" && installEvt) || window.__installEvt || null;

  /* ---------- melden: hooguit één keer per dag per apparaat ---------- */
  const stand = () => lees(K.stand) || null;
  async function meld(dwing){
    const a = online.enabled && online.account();
    if (demo) return { n: 1, app: false };
    if (!a) return stand();
    const s = stand();
    if (!dwing && s && s.dag === todayIndex() && s.acc === a.id && (s.app || !isApp())) return s;
    try {
      const r = await online.rpc("apparaat_meld", { p_id: a.id, p_key: a.key, p_apparaat: nummer(), p_app: isApp(), p_soort: soort() });
      const n = { n: +r.apparaten || 1, app: !!r.app, dag: todayIndex(), acc: a.id };
      zet(K.stand, n); return n;
    } catch(e){ return s; }                          // supabase-019 nog niet gedraaid, of geen internet
  }

  /* ---------- icoontjes ---------- */
  const IC = {
    app: `<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.6"/><path d="M10.5 18.5h3"/><path d="M12 6.5v7M9 10.5l3 3 3-3"/></svg>`,
    koppel: `<svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4.5" width="11" height="8" rx="1.4"/><path d="M1 15.5h13"/><rect x="16" y="7" width="6.5" height="12" rx="1.6"/><path d="M8 18.5c0 1.6 1.3 2.5 3.2 2.5H14"/><path d="M12.6 19.4 14.3 21l-1.7 1.6"/></svg>`,
    deel: `<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9H6.5A1.5 1.5 0 0 0 5 10.5v9A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 17.5 9H16"/><path d="M12 14V3M8.5 6.5 12 3l3.5 3.5"/></svg>`,
    plus: `<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M12 8.5v7M8.5 12h7"/></svg>`,
    kruis: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>`
  };

  /* ---------- in Mijn profiel ---------- */
  function sectie(){
    const s = stand(), app = isApp();
    const sub = s && s.n >= 2 ? `Je speelt op ${s.n} apparaten` : "Telefoon en laptop altijd gelijk";
    return `<section class="pfsec apsec" aria-label="Vestigia als app en je apparaten"><div class="apknoppen${app ? " een" : ""}">
      ${app ? "" : `<button class="apknop" id="pfApp" type="button"><span class="apic">${IC.app}</span><span><b>Gebruik de app!</b><small>Op je beginscherm, met één tik open</small></span></button>`}
      <button class="apknop" id="pfKoppel" type="button"><span class="apic">${IC.koppel}</span><span><b>Koppel je apparaten</b><small>${esc(sub)}</small></span></button></div></section>`;
  }
  function bind(){
    if ($("pfApp")) $("pfApp").onclick = () => app();
    if ($("pfKoppel")) $("pfKoppel").onclick = () => koppel();
  }

  /* ---------- het blad (pop-up) ---------- */
  let tik = null;
  const pop = () => $("appPop"), body = () => $("appPopBody");
  function toon(html, midden){
    clearInterval(tik); tik = null;
    pop().classList.toggle("bottom", !midden);
    pop().classList.toggle("ios", !!midden);
    body().innerHTML = html;
    pop().hidden = false;
    const x = $("apX"); if (x) x.onclick = sluit;
  }
  function sluit(){ clearInterval(tik); tik = null; if (pop() && !pop().hidden){ pop().hidden = true; pop().classList.remove("ios"); } }
  $("appPop").addEventListener("click", e => { if (e.target === $("appPop")) sluit(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("appPop").hidden) sluit(); });
  const kop = (titel, caps) => `<div class="top"><div><span class="caps">${esc(caps)}</span><h2 id="appPopH">${esc(titel)}</h2></div><button class="iconbtn" id="apX" aria-label="Sluiten">${IC.kruis}</button></div>`;

  /* ---------- Gebruik de app! ---------- */
  function app(){
    if (isApp()){
      toon(kop("Je gebruikt de app al", "Gebruik de app!") + `<p>Je hebt Vestigia al als app geopend. Speel je ook op een ander apparaat? Koppel het, dan blijft alles gelijk.</p>
        <div class="actions"><button class="btn" id="apNaarKoppel">Koppel je apparaten</button></div>`);
      $("apNaarKoppel").onclick = () => koppel();
      return;
    }
    if (ios()) return appIos();
    const v = vraag();
    if (v){
      toon(kop("Installeer Vestigia", "Gebruik de app!") + `
        <ol class="apstappen"><li><b>Tik op ‘Installeer’.</b> Je ${android() ? "telefoon" : "browser"} vraagt nog even of het goed is.</li>
          <li><b>Klaar.</b> Vestigia staat ${android() ? "op je startscherm" : "bij je apps"} en opent schermvullend, ook zonder internet.</li></ol>
        <p class="fine">Je naam en voortgang gaan gewoon mee: de app gebruikt hetzelfde geheugen als deze browser.</p>
        <div class="actions"><button class="btn groot" id="apInstall">Installeer</button></div>`);
      $("apInstall").onclick = async () => {
        const e = vraag(); if (!e) return;
        try { e.prompt(); const r = await e.userChoice; if (r && r.outcome === "accepted") sluit(); } catch(err){}
        try { installEvt = null; } catch(err){}
        window.__installEvt = null;
      };
      return;
    }
    if (android()){
      const tekst = /SamsungBrowser/.test(navigator.userAgent)
        ? [`Tik rechtsonder op <b>☰</b>.`, `Kies <b>Pagina toevoegen aan</b> → <b>Startscherm</b>.`]
        : /Firefox/.test(navigator.userAgent)
          ? [`Tik op <b>⋮</b> rechtsboven (of onderin).`, `Kies <b>Installeren</b> of <b>Toevoegen aan startscherm</b>.`]
          : [`Tik rechtsboven op <b>⋮</b>.`, `Kies <b>App installeren</b> of <b>Toevoegen aan startscherm</b>.`];
      toon(kop("Zet Vestigia op je startscherm", "Gebruik de app!") + `
        <ol class="apstappen">${tekst.map(t => `<li>${t}</li>`).join("")}<li><b>Klaar.</b> Je naam en voortgang gaan mee.</li></ol>
        <p class="fine">Zie je ‘App installeren’ niet? Dan staat Vestigia misschien al op je telefoon. Kijk bij je apps.</p>`);
      return;
    }
    /* laptop of pc zonder installatievraag: de bestaande uitleg per browser (js/app.js) */
    sluit();
    if (typeof installUitleg === "function") installUitleg();
  }
  function appIos(){
    const a = online.enabled && online.account();
    const safari = !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
    const waar = ipad() ? "rechtsboven" : safari ? "onderin" : "rechtsboven in de adresbalk";
    toon(kop("Zet Vestigia op je beginscherm", "Gebruik de app!") + `
      <ol class="apstappen ios">
        <li><span class="apstapic">${IC.deel}</span><span>Tik ${waar} op <b>Deel</b>. Zie je die niet, tik dan eerst op <b>···</b>.</span></li>
        <li><span class="apstapic">${IC.plus}</span><span>Scroll een stukje en kies <b>Zet op beginscherm</b>.</span></li>
        <li><span class="apstapic">✓</span><span>Tik op <b>Voeg toe</b>. Klaar!</span></li></ol>
      <div class="aplet"><b>Let op:</b> op een iPhone begint de app op je beginscherm leeg, met een eigen geheugen.
        Maak hier daarom eerst een koppelcode. Open daarna de app en kies <b>Ik heb een koppelcode</b>. Typ de code in, dan heb je je naam en voortgang terug.</div>
      <div class="actions">${a ? `<button class="btn" id="apCode">Maak een koppelcode</button>` : ""}<button class="btn line" id="apOk">Begrepen</button></div>
      ${ipad() ? "" : `<div class="apijl" aria-hidden="true"><span>${safari ? "Deel of ···" : ""}</span><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v17M5 13l7 7 7-7"/></svg></div>`}`, true);
    $("apOk").onclick = sluit;
    if ($("apCode")) $("apCode").onclick = () => maakCode();
  }

  /* ---------- Koppel je apparaten ---------- */
  function koppel(opties){
    opties = opties || {};
    const p = online.enabled && online.player(), s = stand();
    if (opties.invoer) return invoer(opties.code);
    toon(kop("Koppel je apparaten", "Mijn profiel") + `
      <p>Speel je op meer apparaten, bijvoorbeeld je telefoon en je laptop? Koppel ze, dan blijven je naam, eikels en ${NAAM.vestiarium} overal gelijk.${s && s.n >= 2 ? ` Je speelt nu op <b>${s.n} apparaten</b>.` : ""}</p>
      <div class="apkeus">
        <button class="apkeusknop" id="apMaak" type="button"><b>Koppel een nieuw apparaat</b><small>Je krijgt een korte code en een QR-code${p ? `, om op het andere apparaat als ${esc(p.name)} te spelen` : ""}.</small></button>
        <button class="apkeusknop" id="apHeb" type="button"><b>Ik heb een koppelcode</b><small>Van je andere apparaat: 6 tekens, of een QR-code die je net scande.</small></button>
      </div>`);
    $("apMaak").onclick = () => maakCode();
    $("apHeb").onclick = () => invoer();
  }

  /* een QR-code als svg (qrcode-generator, js/qrcode.js) */
  function qr(tekst){
    if (typeof qrcode !== "function") return "";
    const q = qrcode(0, "M"); q.addData(tekst); q.make();
    const n = q.getModuleCount(), m = 2;
    let d = "";
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x + m} ${y + m}h1v1h-1z`;
    return `<svg class="apqr" viewBox="0 0 ${n + 2 * m} ${n + 2 * m}" role="img" aria-label="QR-code om te koppelen" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#16301f"/></svg>`;
  }
  const mooi = c => c.slice(0, 3) + " " + c.slice(3);
  async function maakCode(){
    toon(kop("Koppel een nieuw apparaat", "Koppel je apparaten") + `<p class="fine">De code wordt gemaakt…</p>`);
    let r;
    try {
      if (demo) r = { code: "K7M 3QP".replace(" ", ""), seconden: 600 };
      else {
        if (!online.enabled) throw new Error("uit");
        await online.koppelcode();                     // zonder naam: eerst een verborgen account; en alles is opgeslagen
        const a = online.account();
        r = await online.rpc("koppel_maak", { p_id: a.id, p_key: a.key });
      }
    } catch(e){
      const nogNiet = e && e.status === 404;
      toon(kop("Koppel een nieuw apparaat", "Koppel je apparaten") + `
        <p>${nogNiet ? "Koppelen met een korte code werkt binnenkort." : e && e.offline ? "Daar is internet voor nodig. Probeer het opnieuw zodra je verbinding hebt." : "Het maken van een code lukte niet. Probeer het straks opnieuw."}
          ${online.player() ? " Tot dan kun je je spelerscode gebruiken: die staat onderaan Mijn profiel." : ""}</p>
        <div class="actions"><button class="btn line" id="apTerug">Terug</button></div>`);
      $("apTerug").onclick = () => koppel();
      return;
    }
    const link = location.origin + location.pathname + "#code=" + r.code;
    const tot = Date.now() + (+r.seconden || 600) * 1000;
    toon(kop("Koppel een nieuw apparaat", "Koppel je apparaten") + `
      <div class="apcode">${qr(link)}<div><span class="caps">Je koppelcode${demo ? " · voorbeeld" : ""}</span><b class="apletters" aria-label="${r.code.split("").join(" ")}">${mooi(r.code)}</b><p class="fine" id="apTijd" aria-live="off">Nog 10:00 geldig</p></div></div>
      <ol class="apstappen">
        <li><b>Scan de QR-code</b> met de camera van je andere apparaat.</li>
        <li><b>Of typ de code:</b> open daar Vestigia, ga naar Mijn profiel → Koppel je apparaten → <b>Ik heb een koppelcode</b>.</li>
        <li><b>Klaar.</b> Daar speel je dan verder als jij.</li></ol>
      <p class="fine">De code werkt maar één keer en is 10 minuten geldig. Deel hem met niemand: met deze code speel je als jou.
        Heb je op een iPhone Vestigia op je beginscherm gezet? Typ de code dan in de app zelf. De camera opent Safari, en dat heeft een eigen geheugen.</p>
      <div class="actions"><button class="btn line" id="apKlaar">Klaar</button></div>`);
    $("apKlaar").onclick = sluit;
    const loop = () => {
      const s = Math.max(0, Math.round((tot - Date.now()) / 1000)), el = $("apTijd");
      if (!el){ clearInterval(tik); return; }
      if (s > 0){ el.textContent = `Nog ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} geldig`; return; }
      clearInterval(tik); tik = null;
      const c = body().querySelector(".apcode"); if (c) c.classList.add("verlopen");
      el.innerHTML = `Verlopen. <button class="linklike" id="apOpnieuw">Maak een nieuwe code</button>`;
      $("apOpnieuw").onclick = () => maakCode();
    };
    loop(); tik = setInterval(loop, 1000);
    meld(true).catch(() => {});
  }

  /* een code van een ander apparaat invoeren (ook via de QR-code) */
  function invoer(code){
    const p = online.enabled && online.player();
    toon(kop("Ik heb een koppelcode", "Koppel je apparaten") + `
      <p>${code ? "Je scande de QR-code van je andere apparaat. Tik op <b>Koppel</b>, dan speel je hier verder als jij." : "Maak op je andere apparaat een code: Mijn profiel → Koppel je apparaten → <b>Koppel een nieuw apparaat</b>. Typ hem hier in."}</p>
      <label class="flab" for="apIn">Koppelcode (6 tekens)</label>
      <div class="row2"><input id="apIn" class="apin" maxlength="8" placeholder="ABC 234" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" value="${code ? esc(mooi(code)) : ""}"><button class="btn" id="apGo">Koppel</button></div>
      <span class="msg" id="apMsg" aria-live="polite"></span>
      ${p ? `<p class="fine">Op dit apparaat speel je nu als <b>${esc(p.name)}</b>. Is de code van een andere speler, dan speel je hier daarna als die speler.</p>` : ""}
      <details class="aplang"><summary>Ik heb een lange spelerscode (VSP-…)</summary>
        <div class="row2"><input id="apLang" placeholder="VSP-…" spellcheck="false" autocomplete="off"><button class="btn line" id="apLangGo">Verder spelen</button></div></details>`);
    const inp = $("apIn");
    inp.addEventListener("input", () => {
      const c = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      const nw = c.length > 3 ? mooi(c) : c;
      if (inp.value !== nw) inp.value = nw;
    });
    inp.addEventListener("keydown", e => { if (e.key === "Enter") gebruik(); });
    $("apGo").onclick = () => gebruik();
    $("apLangGo").onclick = () => gebruik($("apLang").value);
    if (!code) setTimeout(() => inp.focus({ preventScroll: true }), 60);
  }
  let zeker = "";
  async function gebruik(lang){
    const msg = $("apMsg"), knop = lang ? $("apLangGo") : $("apGo");
    const code = lang ? null : $("apIn").value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!lang && code.length !== 6){ msg.textContent = "Een koppelcode heeft 6 tekens."; return; }
    if (demo){ msg.textContent = "Dit is een voorbeeld: hier wordt niet echt gekoppeld."; return; }
    const p = online.player();
    /* speel je hier al onder een naam, dan eerst bevestigen; je oude spelerscode bewaren we voor de zekerheid */
    if (p && zeker !== (lang || code)){ zeker = lang || code; msg.textContent = `Weet je het zeker? Tik nogmaals op ${lang ? "‘Verder spelen’" : "‘Koppel’"}. Is de code van ${p.name}, dan verandert er niets.`; return; }
    zeker = "";
    knop.disabled = true; msg.textContent = "Even geduld…";
    try {
      let vsp = lang;
      if (!lang){
        const r = await online.rpc("koppel_gebruik", { p_code: code });
        if (!r || !r.ok){
          knop.disabled = false;
          msg.textContent = r && r.reden === "druk" ? "Er werd net te vaak een foute code geprobeerd. Wacht een paar minuten en probeer het opnieuw."
            : "Deze code klopt niet of is verlopen. Maak op je andere apparaat een nieuwe code.";
          return;
        }
        vsp = "VSP-" + r.id + "." + r.key;
      }
      const a = online.account();
      if (a && vsp.toLowerCase() === ("VSP-" + a.id + "." + a.key).toLowerCase()){ sluit(); toast("Dit apparaat was al gekoppeld. Alles is gelijk."); online.haalVoortgang(); return; }
      if (p) zet(K.vorige, { name: p.name, code: "VSP-" + p.id + "." + p.key, op: new Date().toISOString() });
      const name = await online.koppel(vsp);
      sluit();
      online.naKoppel(name);
      meld(true).catch(() => {});
      if (VIEW === "profiel") Profiel.naNaam();
    } catch(e){
      knop.disabled = false;
      msg.textContent = e && e.message === "naam" ? "Op dit apparaat heb je al een spelersnaam. Deze code hoort bij een apparaat zonder naam: maak de code liever op dit apparaat en gebruik hem op het andere."
        : e && e.message === "code" ? "Deze spelerscode klopt niet. Kopieer hem opnieuw op je andere apparaat."
        : e && e.status === 404 ? "Koppelen met een korte code werkt binnenkort. Gebruik tot dan je spelerscode."
        : e && e.offline ? "Daar is internet voor nodig." : "Koppelen lukte niet. Probeer het opnieuw.";
    }
  }

  /* bij het opstarten: kwam je binnen via de QR-code, dan meteen het koppelblad */
  function verwerkLink(){
    let c = null; try { c = sessionStorage.getItem(K.in); sessionStorage.removeItem(K.in); } catch(e){}
    if (!c || !online.enabled) return;
    invoer(c);
  }

  /* ---------- uitleg voor iedereen, één keer (via de wachtrij) ----------
     Niet als je de app al gebruikt (op dit of een ander apparaat) en al op twee apparaten speelt;
     staat één van de twee al goed, dan alleen het andere stuk. Pas na je eerste gespeelde dagcasus. */
  let uitlegStappen = null;
  function stappen(s){
    const o = Nieuw.ONDERDELEN.find(x => x.id === "apparaten"); if (!o) return [];
    const app = isApp() || (s && s.app), twee = s && s.n >= 2;
    return o.stappen.filter(st => !(st.wat === "app" && app) && !(st.wat === "koppel" && twee));
  }
  Wachtrij.voeg({ id: "apparaten", prio: 2.5,
    async kan(){
      uitlegStappen = null;
      if (!online.enabled || !online.player()) return false;
      try { if (localStorage.getItem(K.nieuw)) return false; } catch(e){ return false; }
      const st = store.get();
      let n = 0; for (let i = 0; i <= todayIndex() && n < 1; i++) if (finished(st, i, false) || finished(st, i, true)) n++;
      if (!n && !demo) return false;
      const s = await meld();
      const ls = stappen(s);
      if (!ls.length){ try { localStorage.setItem(K.nieuw, "1"); } catch(e){} return false; }
      uitlegStappen = ls;
      return true;
    },
    toon(){
      try { localStorage.setItem(K.nieuw, "1"); } catch(e){}
      const o = Nieuw.ONDERDELEN.find(x => x.id === "apparaten");
      return Nieuw.toon(Object.assign({}, o, { stappen: uitlegStappen }));
    } });

  function start(){
    if (online.enabled && online.account()) meld().catch(() => {});
  }
  return { start, meld, sectie, bind, app, koppel, verwerkLink, nummer, isApp, stand };
})();
