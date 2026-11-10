/* Vestigia – dwaalgasten (update 9)
   Eén keer per kalendermaand, op een dag die voor elke speler anders is, verschijnt er een dwaalgast: een zeer zeldzaam
   dier dat normaal niet in Nederland leeft. Je weet welk dier het is en beantwoordt drie meerkeuzevragen (sporen en
   gedrag, uiterlijk, waar hij normaal leeft). Alle drie goed: waarneming bevestigd, 50 eikels en de avatar van het dier
   (de eerste keer ook de lijst Dwaalgast en de ondertitel Dwaalgastjager). Eén fout: hij vliegt weg, je ziet de goede
   antwoorden en er blijft een vraagteken achter in je Vestiarium. De server bepaalt de dag, het dier en de uitslag
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
  let nu = null;              // { gast, vragen: [{nr, soort, vraag, opties, goed?}] } als er nu een dwaalgast is
  async function haal(){
    const dm = demo();
    if (dm){
      if (nu && nu.gast === dm) return nu;
      try {
        const v = await online.rpc("dwaalgast_voorbeeld", { p_gast: dm });
        nu = { gast: dm, demo: true, vragen: v || [] };
      } catch(e){ nu = null; }
      return nu;
    }
    if (!speler()) return null;
    try {
      const r = await online.rpc("dwaalgast_status", args()), s = Array.isArray(r) ? r[0] : r;
      if (!s) return null;
      bewaar({ verzameling: s.verzameling || [], t: todayIndex() });
      nu = s.actief && s.gast ? { gast: s.gast, maand: s.maand, vragen: s.vragen || [] } : null;
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
  let antwoorden = [], volgorde = [];
  function melding(){
    const g = DWAALGASTEN[nu.gast];
    pop().hidden = false; pop().classList.remove("uitslag");
    vak().innerHTML = `
      <div class="dg-kop"><span class="dg-label"><svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.5" cy="15.5" r="4"/><circle cx="17.5" cy="15.5" r="4"/><path d="M10.5 15.5h3M4 12l2.5-7h3l1 4M20 12l-2.5-7h-3l-1 4"/></svg>Zeldzame waarneming</span>
        ${nu.demo ? `<span class="dg-demo">voorbeeld</span>` : ""}</div>
      <div class="dg-beeld"><span class="dg-ping"></span><span class="dg-ping p2"></span>${av(nu.gast, "dg-av")}</div>
      <h2 id="dwaalH">Wow! Er lijkt een zeer bijzondere dwaalgast in Nederland te zijn opgedoken!</h2>
      <p class="dg-wie"><b>${esc(g.naam)}</b> <i>${esc(g.s)}</i></p>
      <p class="dg-waar"><span class="caps">Normaal te vinden</span>${esc(g.waar)}</p>
      <p>Bevestig de waarneming door drie vragen over dit dier goed te beantwoorden. Heb je ze alle drie goed, dan komt hij in je ${NAAM.vestiarium}. Je hebt één poging.</p>
      <button class="btn dg-go" id="dgStart">Waarneming bevestigen</button>
      <button class="linklike dg-later" id="dgLater">Later deze maand</button>`;
    $("dgStart").onclick = () => { antwoorden = []; vraag(0); };
    $("dgLater").onclick = () => { try { localStorage.setItem(LATER, String(todayIndex())); } catch(e){} sluit(); };
  }
  function vraag(i){
    const q = nu.vragen[i];
    if (!q){ return insturen(); }
    volgorde = q.opties.map((_, k) => k).sort(() => Math.random() - .5);
    vak().innerHTML = `
      <div class="dg-kop"><span class="dg-label">Vraag ${i + 1} van 3</span><span class="dg-stip">${[0, 1, 2].map(k => `<i class="${k < i ? "klaar" : k === i ? "nu" : ""}"></i>`).join("")}</span></div>
      <div class="dg-beeld klein">${av(nu.gast, "dg-av")}</div>
      <span class="caps dg-soort">${esc({ sporen: "Sporen", gedrag: "Gedrag", geluid: "Geluid", voedsel: "Voedsel", nest: "Nest", rups: "Rups", uiterlijk: "Uiterlijk", verspreiding: "Waar hij leeft" }[q.soort] || q.soort)}</span>
      <h2 class="dg-vraag">${esc(q.vraag)}</h2>
      <div class="dg-opties">${volgorde.map(k => `<button class="dg-optie" data-k="${k}">${esc(q.opties[k])}</button>`).join("")}</div>`;
    vak().querySelectorAll(".dg-optie").forEach(b => b.onclick = async () => {
      vak().querySelectorAll(".dg-optie").forEach(x => x.disabled = true);
      b.classList.add("gekozen");
      antwoorden[i] = +b.dataset.k;
      await wacht(380);
      vraag(i + 1);
    });
  }
  async function insturen(){
    vak().innerHTML = `<div class="dg-beeld">${av(nu.gast, "dg-av")}</div><p class="dg-wacht">Je waarneming wordt gecontroleerd…</p>`;
    let u;
    if (nu.demo){
      await wacht(900);
      const juist = nu.vragen.map(q => q.goed), ok = juist.every((g, k) => g === antwoorden[k]);
      u = { status: ok ? "gevonden" : "gevlogen", gast: nu.gast, juist, eerste: ok };
    } else {
      try {
        const r = await online.rpc("dwaalgast_antwoord", args({ p_antwoorden: antwoorden })); u = Array.isArray(r) ? r[0] : r;
        const c = lees(); c.verzameling = (c.verzameling || []).concat([{ gast: u.gast, status: u.status, maand: nu.maand }]); bewaar(c);
      } catch(e){
        vak().innerHTML = `<p class="dg-fout">${esc(e.status && e.status < 500 ? e.message : "Versturen lukte niet. Controleer je internetverbinding en probeer het opnieuw.")}</p><button class="btn" id="dgOpnieuw">Opnieuw proberen</button>`;
        $("dgOpnieuw").onclick = insturen;
        return;
      }
    }
    uitslag(u);
  }
  function uitslag(u){
    const g = DWAALGASTEN[u.gast], ok = u.status === "gevonden", qs = nu.vragen, isDemo = !!nu.demo;
    pop().classList.add("uitslag");
    const lijst = qs.map((q, k) => {
      const goed = u.juist[k] === antwoorden[k];
      return `<li class="${goed ? "goed" : "fout"}"><span class="dg-ok" aria-hidden="true">${goed ? "✓" : "✗"}</span><span><b>${esc(q.vraag)}</b>${esc(q.opties[u.juist[k]])}${goed ? "" : `<small>jij koos: ${esc(q.opties[antwoorden[k]])}</small>`}</span></li>`;
    }).join("");
    vak().innerHTML = ok ? `
      <div class="dg-beeld gevonden"><span class="dg-glans"></span>${av(u.gast, "dg-av")}</div>
      <h2>Waarneming bevestigd!</h2>
      <p class="dg-wie"><b>${esc(g.naam)}</b> staat nu in je ${NAAM.vestiarium}, bij de dwaalgasten.</p>
      <div class="dg-buit"><span class="dg-eik">${EIKEL}<b>+50</b></span><span>avatar ${esc(g.naam)}</span>${u.eerste ? `<span>lijst Dwaalgast</span><span>ondertitel Dwaalgastjager</span>` : ""}</div>
      <div class="dg-gezien"><span class="caps">Gezien in Nederland</span><p>${esc(g.gezien)}</p><p class="fine">Bron: ${esc(g.bron)}</p></div>
      <details class="dg-antw"><summary>Je antwoorden</summary><ol>${lijst}</ol></details>
      <button class="btn dg-go" id="dgDex">Bekijk je dwaalgasten</button><button class="linklike dg-later" id="dgDicht">Sluiten</button>`
    : `
      <div class="dg-beeld weg">${av(u.gast, "dg-av")}</div>
      <h2>Helaas, de dwaalgast is weggevlogen</h2>
      <p>Niet alle drie de antwoorden waren goed. Er staat nu een vraagteken in je ${NAAM.vestiarium}; wie weet komt de ${esc(g.naam.toLowerCase())} ooit terug.</p>
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
      if (st === "gevlogen") return `<button class="dgv gevlogen" data-g="${id}"><span class="dgv-vraag">?</span><b>${esc(g.naam)}</b><small>weggevlogen</small></button>`;
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
