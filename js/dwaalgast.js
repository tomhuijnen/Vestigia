/* Vestigia – dwaalgasten (update 9)
   Eén keer per kalendermaand, op een dag die voor elke speler anders is, verschijnt er een dwaalgast: een zeer zeldzaam
   dier dat normaal niet in Nederland leeft. Je weet welk dier het is en beantwoordt drie meerkeuzevragen (sporen en
   gedrag, uiterlijk, waar hij normaal leeft). Elke vraag wordt meteen gecontroleerd. Alle drie goed: waarneming
   bevestigd, 50 eikels en de avatar van het dier (de eerste keer ook de lijst Dwaalgast en de ondertitel Dwaalgastjager).
   Eén fout: hij dwaalt weg, je ziet de goede antwoorden en er blijft een vraagteken achter in je Vestiarium.
   Met een hersteltoken op zak zie je na een fout eerst waarom je keuze niet klopt, en mag je de token inzetten:
   je antwoord en één andere foute optie vallen af en je kiest opnieuw uit de twee die over zijn. De server bepaalt de dag, het dier en de uitslag
   (supabase-014). Wie hem op ‘Later’ zet, houdt een rode knop in de kop tot het einde van de maand.
   Voorbeeld zonder dat er iets meetelt: ?dwaalgast=demo&gast=lynx */
"use strict";

const Dwaalgast = (() => {
  const CACHE = "vestigia:dwaal", LATER = "vestigia:dwaalLater", DEMO = "vestigia:dwaaldemo";
  try {
    const u = new URLSearchParams(location.search);
    if (u.get("dwaalgast") === "demo") sessionStorage.setItem(DEMO, DWAALGASTEN[u.get("gast")] ? u.get("gast") : "lynx");
    if (u.get("dwaalgast") === "uit") sessionStorage.removeItem(DEMO);
  } catch(e){}
  const demo = () => { try { return sessionStorage.getItem(DEMO); } catch(e){ return null; } };
  const speler = () => online.enabled && online.player();
  const args = extra => Object.assign({ p_id: online.player().id, p_key: online.player().key }, extra || {});
  const rustig = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wacht = ms => new Promise(r => setTimeout(r, rustig() ? 0 : ms));
  const lees = () => { try { return JSON.parse(localStorage.getItem(CACHE)) || {}; } catch(e){ return {}; } };
  const bewaar = s => { try { localStorage.setItem(CACHE, JSON.stringify(s)); } catch(e){} };
  const av = (id, cls, frame) => avatarSVG({ avatar: "dg-" + id, color: "nacht", frame: frame === undefined ? "dwaalgast" : frame }, cls || "");

  /* ---------- stand ---------- */
  let nu = null;              // { gast, maand, vragen: [{nr, soort, vraag, opties, goed?, uitleg?}], tokens, voortgang }
  async function haal(){
    const dm = demo();
    if (dm){
      if (nu && nu.gast === dm) return nu;
      try {
        const v = await online.rpc("dwaalgast_voorbeeld", { p_gast: dm });
        nu = { gast: dm, demo: true, vragen: v || [], tokens: 1, voortgang: null };
      } catch(e){ nu = null; }
      return nu;
    }
    if (!speler()) return null;
    try {
      const r = await online.rpc("dwaalgast_status", args()), s = Array.isArray(r) ? r[0] : r;
      if (!s) return null;
      bewaar({ verzameling: s.verzameling || [], t: todayIndex() });
      nu = s.actief && s.gast ? { gast: s.gast, maand: s.maand, vragen: s.vragen || [], tokens: s.tokens || 0, voortgang: s.voortgang || null } : null;
      knop(); vestiarium();
    } catch(e){}
    return nu;
  }
  function knop(){
    const b = $("dwaalBtn"); if (!b) return;
    b.hidden = !nu;
    if (nu) b.setAttribute("aria-label", `Dwaalgast gezien: ${DWAALGASTEN[nu.gast].naam}`);
  }

  /* ---------- het venster ---------- */
  const pop = () => $("dwaalPop"), vak = () => $("dwaalBody");
  function sluit(){ pop().hidden = true; pop().classList.remove("uitslag"); }
  /* per vraag: wat je koos (bij een tweede poging het laatste antwoord), en wat er bij die vraag weggestreept is */
  let gekozen = [], fouten = [], streep = {}, uitleggen = {};
  const naamKlein = () => DWAALGASTEN[nu.gast].naam.toLowerCase();
  function melding(){
    const g = DWAALGASTEN[nu.gast], vg = nu.voortgang;
    pop().hidden = false; pop().classList.remove("uitslag");
    vak().innerHTML = `
      <div class="dg-kop"><span class="dg-label"><svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.5" cy="15.5" r="4"/><circle cx="17.5" cy="15.5" r="4"/><path d="M10.5 15.5h3M4 12l2.5-7h3l1 4M20 12l-2.5-7h-3l-1 4"/></svg>Zeldzame waarneming</span>
        ${nu.demo ? `<span class="dg-demo">voorbeeld</span>` : ""}</div>
      <div class="dg-beeld"><span class="dg-ping"></span><span class="dg-ping p2"></span>${av(nu.gast, "dg-av")}</div>
      <h2 id="dwaalH">${vg ? "Je dwaalgast is er nog!" : "Wow! Er lijkt een zeer bijzondere dwaalgast in Nederland te zijn opgedoken!"}</h2>
      <p class="dg-wie"><b>${esc(g.naam)}</b> <i>${esc(g.s)}</i></p>
      <p class="dg-waar"><span class="caps">Normaal te vinden</span>${esc(g.waar)}</p>
      <p class="dg-intro">${vg ? `Je was al begonnen. Ga verder waar je gebleven was.` : `Bevestig de waarneming door drie vragen over dit dier goed te beantwoorden. Heb je ze alle drie goed, dan komt hij in je ${NAAM.vestiarium}. Eén fout en hij dwaalt weg.`}</p>
      <button class="btn dg-go" id="dgStart">${vg ? "Verder met de waarneming" : "Waarneming bevestigen"}</button>
      <button class="linklike dg-later" id="dgLater">Later deze maand</button>`;
    $("dgStart").onclick = () => {
      gekozen = []; fouten = []; streep = {}; uitleggen = {};
      if (!vg) return vraag(0);
      const i = vg.beantwoord || 0;
      for (let k = 0; k < i; k++) gekozen[k] = null;          // al goed beantwoord in een eerdere sessie
      if (vg.token_vraag === i + 1) streep[i] = [vg.fout, vg.weg];
      if (vg.status === "keuze"){ fouten[i] = vg.fout; uitleggen[i] = vg.uitleg; return keuze(i); }
      vraag(i);
    };
    $("dgLater").onclick = () => { try { localStorage.setItem(LATER, String(todayIndex())); } catch(e){} sluit(); };
    /* de eerste keer: uitlegblokjes in de pop-up zelf, nadat hij in beeld is gesprongen */
    if (!vg && typeof Nieuw !== "undefined") Nieuw.blokjes("dwaalgast", [
      { na: $("dwaalH"), tekst: "Eén keer per maand duikt er bij jou een dwaalgast op: een zeldzaam dier dat normaal niet in Nederland leeft. Welke dag en welk dier, dat verschilt per speler." },
      { na: vak().querySelector(".dg-intro"), tekst: `Beantwoord drie vragen over dit dier goed, dan komt hij bij de dwaalgasten in je ${NAAM.vestiarium}, met 50 eikels en zijn avatar. Is een antwoord fout, dan dwaalt hij weg en blijft er een vraagteken achter.` },
      { na: $("dgLater"), tekst: "Geen tijd? Kies ‘Later’, dan blijft er tot het einde van de maand een rode knop rechtsboven staan." }
    ], { rood: true, altijd: !!nu.demo });
  }
  const SOORT = { sporen: "Sporen", gedrag: "Gedrag", geluid: "Geluid", voedsel: "Voedsel", nest: "Nest", rups: "Rups", uiterlijk: "Uiterlijk", verspreiding: "Waar hij leeft" };
  function vraag(i){
    const q = nu.vragen[i], weg = streep[i] || [];
    const volgorde = q.opties.map((_, k) => k).sort(() => Math.random() - .5);
    const tweede = weg.length > 0;
    vak().innerHTML = `
      <div class="dg-kop"><span class="dg-label">Vraag ${i + 1} van 3</span>${tweede ? `<span class="dg-tweede">${herstelMunt(16)}Tweede poging</span>` : `<span class="dg-stip">${[0, 1, 2].map(k => `<i class="${k < i ? "klaar" : k === i ? "nu" : ""}"></i>`).join("")}</span>`}</div>
      <div class="dg-beeld klein">${av(nu.gast, "dg-av")}</div>
      <span class="caps dg-soort">${esc(SOORT[q.soort] || q.soort)}</span>
      <h2 class="dg-vraag">${esc(q.vraag)}</h2>
      <div class="dg-opties">${volgorde.filter(k => !weg.includes(k)).map(k => `<button class="dg-optie" data-k="${k}">${esc(q.opties[k])}</button>`).join("")}
        ${volgorde.filter(k => weg.includes(k)).map(k => `<div class="dg-optie af" aria-label="weggestreept: ${esc(q.opties[k])}">${esc(q.opties[k])}</div>`).join("")}</div>
      ${tweede ? `<p class="dg-klein">Je eerste antwoord en één andere foute optie zijn weggestreept. Is dit antwoord ook fout, dan dwaalt de ${esc(naamKlein())} weg.</p>` : ""}`;
    vak().querySelectorAll("button.dg-optie").forEach(b => b.onclick = () => antwoord(i, +b.dataset.k, b));
  }
  /* één antwoord: meteen controleren (de server, of in het voorbeeld de app zelf) */
  async function antwoord(i, k, b){
    vak().querySelectorAll("button.dg-optie").forEach(x => x.disabled = true);
    b.classList.add("gekozen");
    let u;
    if (nu.demo){
      await wacht(300);
      const q = nu.vragen[i], ok = q.goed === k, laatste = i === nu.vragen.length - 1;
      const status = ok ? (laatste ? "gevonden" : "bezig") : (!streep[i] && nu.tokens > 0 ? "keuze" : "gevlogen");
      u = { status, goed: ok, uitleg: ok ? null : (q.uitleg || [])[k], juist: status === "gevonden" || status === "gevlogen" ? nu.vragen.map(x => x.goed) : null, eerste: status === "gevonden", tokens: nu.tokens };
    } else {
      try { const r = await online.rpc("dwaalgast_vraag", args({ p_nr: i + 1, p_antwoord: k })); u = Array.isArray(r) ? r[0] : r; }
      catch(e){ return foutmelding(e, () => vraag(i)); }
    }
    gekozen[i] = k;
    if (u.goed){
      b.classList.add("juist");
      await wacht(650);
      if (u.status === "gevonden") return uitslag(u);
      return vraag(i + 1);
    }
    b.classList.add("mis");
    fouten[i] = k; uitleggen[i] = u.uitleg;
    await wacht(550);
    if (u.status === "keuze"){ nu.tokens = u.tokens; return keuze(i); }
    uitslag(u);
  }
  /* fout, maar er is een hersteltoken: eerst waarom het niet klopt, dan de keuze */
  function keuze(i){
    const q = nu.vragen[i], k = fouten[i];
    vak().innerHTML = `
      <div class="dg-kop"><span class="dg-label">Vraag ${i + 1} van 3</span>${nu.demo ? `<span class="dg-demo">voorbeeld</span>` : ""}</div>
      <h2 class="dg-vraag">${esc(q.vraag)}</h2>
      <div class="dg-misbox"><svg aria-hidden="true" viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg><s>${esc(q.opties[k])}</s></div>
      ${uitleggen[i] ? `<div class="dg-waarom"><span class="caps">Waarom dit niet klopt</span><p>${esc(uitleggen[i])}</p></div>` : ""}
      <div class="dg-token">
        <div class="dg-tokenrij">${herstelMunt(44)}<p><b>Hersteltoken inzetten?</b><span>Je mag deze vraag opnieuw beantwoorden, met nog 2 opties. Je hebt ${nu.tokens} ${nu.tokens === 1 ? "token" : "tokens"}.</span></p></div>
        <button class="btn dg-tokenknop" id="dgToken">${herstelMunt(20)}Zet hersteltoken in</button>
        <button class="dg-laatgaan" id="dgLaat">Nee, laat de ${esc(naamKlein())} wegdwalen</button>
      </div>`;
    $("dgToken").onclick = () => kies(i, true);
    $("dgLaat").onclick = () => kies(i, false);
    $("dgToken").focus();
  }
  async function kies(i, inzetten){
    vak().querySelectorAll(".dg-token button").forEach(x => x.disabled = true);
    let u;
    if (nu.demo){
      await wacht(250);
      const q = nu.vragen[i];
      if (inzetten){
        const weg = [0, 1, 2, 3].filter(k => k !== q.goed && k !== fouten[i])[0];
        u = { status: "bezig", weg, tokens: nu.tokens - 1 };
      } else u = { status: "gevlogen", juist: nu.vragen.map(x => x.goed), tokens: nu.tokens };
    } else {
      try { const r = await online.rpc("dwaalgast_token", args({ p_inzetten: inzetten })); u = Array.isArray(r) ? r[0] : r; }
      catch(e){ return foutmelding(e, () => keuze(i)); }
    }
    nu.tokens = u.tokens;
    if (!inzetten){ gekozen[i] = fouten[i]; return uitslag(u); }
    streep[i] = [fouten[i], u.weg];
    vraag(i);
  }
  function foutmelding(e, opnieuw){
    vak().innerHTML = `<div class="dg-beeld klein">${av(nu.gast, "dg-av")}</div><p class="dg-fout">${esc(e && e.status && e.status < 500 ? e.message : "Versturen lukte niet. Controleer je internetverbinding en probeer het opnieuw.")}</p><button class="btn" id="dgOpnieuw">Opnieuw proberen</button>`;
    $("dgOpnieuw").onclick = async () => { if (!nu.demo){ nu = null; await haal(); if (!nu) return sluit(); return melding(); } opnieuw(); };
  }
  function uitslag(u){
    const g = DWAALGASTEN[nu.gast], ok = u.status === "gevonden", qs = nu.vragen, isDemo = !!nu.demo;
    if (!isDemo){ const c = lees(); c.verzameling = (c.verzameling || []).concat([{ gast: nu.gast, status: u.status, maand: nu.maand }]); bewaar(c); }
    pop().classList.add("uitslag");
    const juist = u.juist || qs.map(q => q.goed);
    const lijst = qs.map((q, k) => {
      if (k >= gekozen.length && !ok) return "";          // na de fout kwam je niet meer bij deze vraag
      const mijn = gekozen[k], goed = mijn === null || mijn === undefined ? true : juist[k] === mijn;
      const fout1 = fouten[k] !== undefined && fouten[k] !== mijn;
      return `<li class="${goed ? "goed" : "fout"}"><span class="dg-ok" aria-hidden="true">${goed ? "✓" : "✗"}</span><span><b>${esc(q.vraag)}</b>${esc(q.opties[juist[k]])}${goed ? (fout1 ? `<small>goed in je tweede poging</small>` : "") : `<small>jij koos: ${esc(q.opties[mijn])}</small>${uitleggen[k] && fouten[k] === mijn ? `<small class="dg-waaromklein">${esc(uitleggen[k])}</small>` : ""}`}</span></li>`;
    }).join("");
    vak().innerHTML = ok ? `
      <div class="dg-beeld gevonden"><span class="dg-glans"></span>${av(nu.gast, "dg-av")}</div>
      <h2>Waarneming bevestigd!</h2>
      <p class="dg-wie"><b>${esc(g.naam)}</b> staat nu in je ${NAAM.vestiarium}, bij de dwaalgasten.</p>
      <div class="dg-buit"><span class="dg-eik">${EIKEL}<b>+50</b></span><span>avatar ${esc(g.naam)}</span>${u.eerste ? `<span>lijst Dwaalgast</span><span>ondertitel Dwaalgastjager</span>` : ""}</div>
      <div class="dg-gezien"><span class="caps">Gezien in Nederland</span><p>${esc(g.gezien)}</p><p class="fine">Bron: ${esc(g.bron)}</p></div>
      <details class="dg-antw"><summary>Je antwoorden</summary><ol>${lijst}</ol></details>
      <button class="btn dg-go" id="dgDex">Bekijk je dwaalgasten</button><button class="linklike dg-later" id="dgDicht">Sluiten</button>`
    : `
      <div class="dg-beeld weg">${av(nu.gast, "dg-av")}</div>
      <h2>Helaas, de dwaalgast is weggedwaald</h2>
      <p>Niet alle antwoorden waren goed. Er staat nu een vraagteken in je ${NAAM.vestiarium}; wie weet komt de ${esc(naamKlein())} ooit terug.</p>
      <ol class="dg-antwlijst">${lijst}</ol>
      <div class="dg-gezien"><span class="caps">Gezien in Nederland</span><p>${esc(g.gezien)}</p><p class="fine">Bron: ${esc(g.bron)}</p></div>
      <button class="btn dg-go" id="dgDex">Bekijk je dwaalgasten</button><button class="linklike dg-later" id="dgDicht">Sluiten</button>`;
    $("dgDicht").onclick = sluit;
    $("dgDex").onclick = () => { sluit(); showDex(); setTimeout(() => { const s = $("dexDwaal"); if (s) s.scrollIntoView({ behavior: "smooth", block: "start" }); }, 350); };
    if (ok){
      const beeld = vak().querySelector(".dg-beeld");
      if (typeof Kerst !== "undefined" && Kerst.vonk) Kerst.vonk(beeld, 30, true);
      setTimeout(() => { const e = vak().querySelector(".dg-eik"); if (e && typeof Kerst !== "undefined") Kerst.vlieg(e, 50).then(() => { if (!isDemo) Profiel.haalAlles().then(() => Profiel.saldoInKop()); }); }, rustig() ? 0 : 900);
    }
    nu = null; knop(); vestiarium();
  }
  async function open(){ if (!nu) await haal(); if (nu) melding(); }

  /* ---------- in het Vestiarium: pas zichtbaar na je eerste dwaalgast ---------- */
  function vestiarium(){
    const sec = $("dexDwaal"); if (!sec) return;
    const v = demo() ? [] : (lees().verzameling || []);
    const per = {};
    for (const b of v) per[b.gast] = per[b.gast] === "gevonden" ? "gevonden" : b.status;
    const n = Object.values(per).filter(x => x === "gevonden").length;
    sec.hidden = !v.length;
    if (!v.length) return;
    $("dwaalTel").textContent = `${n} van ${DWAALGAST_VOLGORDE.length} gevonden`;
    $("dwaalGrid").innerHTML = DWAALGAST_VOLGORDE.map(id => {
      const st = per[id], g = DWAALGASTEN[id];
      if (st === "gevonden") return `<button class="dgv gevonden" data-g="${id}">${av(id, "dgv-av")}<b>${esc(g.naam)}</b></button>`;
      if (st === "gevlogen") return `<button class="dgv gevlogen" data-g="${id}"><span class="dgv-vraag">?</span><b>${esc(g.naam)}</b><small>weggedwaald</small></button>`;
      return `<div class="dgv onbekend"><span class="dgv-vraag">?</span><b>nog niet gezien</b></div>`;
    }).join("");
    $("dwaalGrid").querySelectorAll("button.dgv").forEach(b => b.onclick = () => {
      const g = DWAALGASTEN[b.dataset.g], box = $("dwaalInfo");
      box.hidden = false;
      box.innerHTML = `<span class="caps">${esc(g.naam)} · Gezien in Nederland</span><p>${esc(g.gezien)}</p><p class="fine">Normaal te vinden: ${esc(g.waar)}. Bron: ${esc(g.bron)}</p>`;
    });
  }

  /* ---------- koppelen ---------- */
  if ($("dwaalBtn")) $("dwaalBtn").addEventListener("click", open);
  if ($("dwaalPop")) $("dwaalPop").addEventListener("click", e => { if (e.target === $("dwaalPop") && pop().classList.contains("uitslag")) sluit(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && $("dwaalPop") && !$("dwaalPop").hidden && pop().classList.contains("uitslag")) sluit(); });

  /* in de wachtrij met voorrang; ‘Later’ = vandaag niet meer vanzelf, de rode knop blijft */
  Wachtrij.voeg({ id: "dwaalgast", prio: 1,
    async kan(){
      if (!demo() && !speler()) return false;
      await haal();
      if (!nu) return false;
      let l = null; try { l = localStorage.getItem(LATER); } catch(e){}
      return demo() || l !== String(todayIndex());
    },
    toon: melding });

  vestiarium();
  if (speler() && !demo()) haal();
  return { open, haal, vestiarium };
})();
