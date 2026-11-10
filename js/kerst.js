/* Vestigia – kerst (update 8)
   Van 1 december tot en met 6 januari: een kerstmuts op het logo, pootafdrukken in de sneeuw bij het openen en een paar
   sneeuwvlokjes op het beginscherm (hooguit tien seconden, uit te zetten in het menu, nooit bij ‘minder beweging’).
   Van 1 tot en met 24 december: de adventkalender. Elke dag één vakje; alleen het vakje van vandaag gaat open en een
   gemist vakje is weg. De server bepaalt de datum en wat erin zit (supabase-012); de app toont het alleen.
   Testen vóór december: ?kerst=demo (eventueel &dag=12). Dan werkt alles zonder server en telt er niets mee. */
"use strict";

const Kerst = (() => {
  const SNEEUW = "vestigia:sneeuw", CACHE = "vestigia:advent", DEMO = "vestigia:kerstdemo";
  /* demo via de link; blijft deze sessie aan */
  try {
    const u = new URLSearchParams(location.search);
    if (u.get("kerst") === "demo") sessionStorage.setItem(DEMO, JSON.stringify({ dag: Math.min(24, Math.max(1, +u.get("dag") || 10)), open: [] }));
    if (u.get("kerst") === "uit") sessionStorage.removeItem(DEMO);
  } catch(e){}
  const demo = () => { try { return JSON.parse(sessionStorage.getItem(DEMO)); } catch(e){ return null; } };
  const zetDemo = d => { try { sessionStorage.setItem(DEMO, JSON.stringify(d)); } catch(e){} };

  /* datum in Nederland, los van de tijdzone van het toestel */
  function nl(){
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", year: "numeric", month: "numeric", day: "numeric" })
      .formatToParts(new Date()).map(x => [x.type, +x.value]));
    return { j: p.year, m: p.month, d: p.day };
  }
  const seizoen = () => { if (demo()) return true; const t = nl(); return t.m === 12 || (t.m === 1 && t.d <= 6); };
  /* vakje van vandaag volgens het toestel (de server heeft het laatste woord) */
  const kalenderDag = () => { const dm = demo(); if (dm) return dm.dag; const t = nl(); return t.m === 12 && t.d <= 24 ? t.d : null; };
  const rustig = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sneeuwAan = () => { try { return localStorage.getItem(SNEEUW) !== "uit"; } catch(e){ return true; } };
  const speler = () => online.enabled && online.player();
  const args = () => ({ p_id: online.player().id, p_key: online.player().key });

  /* ---------- stand van de kalender ---------- */
  const lees = () => { try { return JSON.parse(localStorage.getItem(CACHE)); } catch(e){ return null; } };
  const bewaar = s => { try { localStorage.setItem(CACHE, JSON.stringify(s)); } catch(e){} };
  function stand(){
    const dm = demo();
    if (dm) return { jaar: nl().j, vandaag: dm.dag, geopend: dm.open.map(ADVENT_DEMO) };
    const s = lees(), j = nl().j;
    const vandaag = kalenderDag();
    if (s && s.jaar === j) return Object.assign({}, s, { vandaag: s.t === todayIndex() ? s.vandaag : vandaag });
    return { jaar: j, vandaag, geopend: [] };
  }
  async function haal(){
    if (demo() || !speler()) return stand();
    try {
      const r = await online.rpc("advent_status", args()), s = Array.isArray(r) ? r[0] : r;
      if (s){ bewaar({ jaar: s.jaar, vandaag: s.vandaag, geopend: s.geopend || [], t: todayIndex() }); }
    } catch(e){}
    return stand();
  }
  const isOpen = (s, d) => (s.geopend || []).some(v => v.dag === d);
  const vandaagDicht = () => { const s = stand(); return !!s.vandaag && !isOpen(s, s.vandaag); };

  /* ---------- versiering ---------- */
  function versier(){
    const aan = seizoen();
    document.documentElement.classList.toggle("kerst", aan);
    const kal = aan && !!kalenderDag();
    if ($("adventBtn")) $("adventBtn").hidden = !kal;
    if ($("menuAdvent")) $("menuAdvent").parentElement.hidden = !kal;
    if ($("sneeuwRij")) $("sneeuwRij").hidden = !aan;
    if ($("sneeuwBtn")) $("sneeuwBtn").setAttribute("aria-checked", String(sneeuwAan()));
    stip();
  }
  function stip(){ const b = $("adventBtn"); if (b) b.classList.toggle("nieuw", vandaagDicht()); }

  /* een paar vlokjes over het beginscherm; na tien seconden vallen er geen nieuwe meer */
  let gesneeuwd = false;
  function sneeuw(){
    if (gesneeuwd || !seizoen() || !sneeuwAan() || rustig()) return;
    gesneeuwd = true;
    const laag = document.createElement("div"); laag.className = "sneeuw"; laag.setAttribute("aria-hidden", "true");
    document.body.appendChild(laag);
    const t0 = Date.now();
    const vlok = () => {
      if (Date.now() - t0 > 10000) return;
      const v = document.createElement("i"), s = 3 + Math.random() * 4, duur = 5 + Math.random() * 4;
      v.style.cssText = `left:${Math.random() * 100}%; width:${s}px; height:${s}px; animation-duration:${duur}s; --zij:${(Math.random() * 60 - 30).toFixed(0)}px; opacity:${(.55 + Math.random() * .4).toFixed(2)}`;
      laag.appendChild(v); setTimeout(() => v.remove(), duur * 1000 + 100);
      setTimeout(vlok, 380 + Math.random() * 420);
    };
    vlok();
    setTimeout(() => laag.remove(), 20000);
  }

  /* ---------- de kalender ---------- */
  const EIK = n => `<span class="avk-eik">${EIKEL}<b>+${n}</b></span>`;
  const ITEMNAAM = { "kleur:winter": "Achtergrondkleur Winter", "lijst:kerst": "Kerstlijst" };
  function itemBeeld(item){
    const me = Profiel.mijn(), v = item.slice(item.indexOf(":") + 1);
    return avatarSVG(Object.assign({}, me, item.startsWith("kleur:") ? { color: v } : { frame: v }), "avk-av");
  }
  let gekozen = null;
  function teken(){
    const s = stand(), grid = $("adventGrid");
    const sub = !s.vandaag ? "De kalender is open van 1 tot en met 24 december."
      : isOpen(s, s.vandaag) ? "Het vakje van vandaag is open. Morgen weer een!"
      : `Vandaag mag vakje ${s.vandaag} open. Een gemist vakje is weg.`;
    $("adventSub").textContent = (demo() ? "Voorbeeld: er telt niets mee. " : "") + sub;
    grid.innerHTML = Array.from({ length: 24 }, (_, k) => {
      const d = k + 1, v = (s.geopend || []).find(x => x.dag === d);
      const staat = v ? "open" : d === s.vandaag ? "vandaag" : s.vandaag && d < s.vandaag ? "gemist" : "dicht";
      const inh = v ? (v.item ? `<span class="avk-item">${itemBeeld(v.item)}</span>` : EIK(v.eikels)) : "";
      const label = `Vakje ${d}: ${{ open: "geopend", vandaag: "vandaag, nog dicht", gemist: "gemist", dicht: "nog niet" }[staat]}`;
      return `<button class="avk ${staat}${gekozen === d ? " gekozen" : ""}" data-d="${d}" aria-label="${label}"${staat === "dicht" || staat === "gemist" ? " disabled" : ""}><span class="avk-nr">${d}</span>${inh}${staat === "gemist" ? `<span class="avk-weg">gemist</span>` : ""}</button>`;
    }).join("");
    grid.querySelectorAll(".avk.open, .avk.vandaag").forEach(b => b.onclick = () => klik(+b.dataset.d));
    toonVak(gekozen ? s.geopend.find(x => x.dag === gekozen) : null);
  }
  function toonVak(v, nieuw){
    const box = $("adventVak");
    if (!v){ box.hidden = true; return; }
    const w = ADVENT.find(a => a.dag === v.dag), t = w && BY_ID.get(w.soort);
    box.hidden = false;
    box.className = "adventvak" + (nieuw ? " nieuw" : "");
    box.innerHTML = `<div class="avk-buit">${EIK(v.eikels)}${v.item ? `<span class="avk-extra">${itemBeeld(v.item)}<span>${esc(ITEMNAAM[v.item] || v.item)}<small>staat nu in Mijn profiel</small></span></span>` : ""}</div>
      ${w ? `<span class="caps">${esc(t ? t.n : w.soort)}${v.dag === 5 ? " · Sinterklaas" : v.dag === 24 ? " · Kerstavond" : ""}</span><p>${esc(w.tekst)}</p><p class="fine">Bron: ${esc(w.bron)}</p>` : ""}`;
  }
  async function klik(d){
    const s = stand();
    if (isOpen(s, d)){ gekozen = d; teken(); return; }
    if (d !== s.vandaag) return;
    if (!demo() && !speler()){
      $("adventVak").hidden = false; $("adventVak").className = "adventvak";
      $("adventVak").innerHTML = `<p>Met een spelersnaam open je elke dag een vakje en krijg je de eikels.</p><button class="btn line" id="adventNaam">Kies een spelersnaam</button>`;
      $("adventNaam").onclick = () => { sluit(); MENU_GO.player(); };
      return;
    }
    const b = $("adventGrid").querySelector(`[data-d="${d}"]`); if (b){ b.disabled = true; b.classList.add("opent"); }
    let v = null;
    if (demo()){ const dm = demo(); if (!dm.open.includes(d)) dm.open.push(d); zetDemo(dm); v = ADVENT_DEMO(d); }
    else {
      try {
        const r = await online.rpc("advent_open", args()); v = Array.isArray(r) ? r[0] : r;
        const c = lees() || { jaar: nl().j, geopend: [] };
        if (v && !(c.geopend || []).some(x => x.dag === v.dag)) c.geopend = (c.geopend || []).concat([v]);
        c.vandaag = v ? v.dag : c.vandaag; c.t = todayIndex(); bewaar(c);
      } catch(e){
        if (b){ b.disabled = false; b.classList.remove("opent"); }
        $("adventSub").textContent = e.status && e.status < 500 ? e.message : "Openen lukte niet. Controleer je internetverbinding.";
        return;
      }
    }
    setTimeout(() => {
      gekozen = v ? v.dag : null; teken(); toonVak(v, true); stip();
      if (!demo()) Profiel.haalAlles().then(() => Profiel.saldoInKop());
    }, rustig() ? 0 : 650);
  }
  async function open(){
    gekozen = null;
    $("adventPop").hidden = false;
    teken();
    await haal();
    if (!$("adventPop").hidden) teken();
    stip();
  }
  function sluit(){ $("adventPop").hidden = true; }

  /* ---------- koppelen ---------- */
  if ($("adventBtn")) $("adventBtn").addEventListener("click", open);
  if ($("adventClose")) $("adventClose").addEventListener("click", sluit);
  if ($("adventPop")) $("adventPop").addEventListener("click", e => { if (e.target === $("adventPop")) sluit(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && $("adventPop") && !$("adventPop").hidden) sluit(); });
  if ($("sneeuwBtn")) $("sneeuwBtn").addEventListener("click", () => {
    try { localStorage.setItem(SNEEUW, sneeuwAan() ? "uit" : "aan"); } catch(e){}
    versier(); if (sneeuwAan()){ gesneeuwd = false; sneeuw(); } else document.querySelectorAll(".sneeuw").forEach(x => x.remove());
  });
  MENU_GO.advent = () => { closeMenu(true); open(); };

  /* in de wachtrij: het vakje van vandaag is nog dicht */
  Wachtrij.voeg({ id: "advent", prio: 2,
    async kan(){
      if (!kalenderDag()) return false;
      if (!demo() && !speler()) return false;
      await haal();
      if (!vandaagDicht()) return false;
      /* hooguit één keer per dag vanzelf openen */
      const k = "vestigia:adventGetoond"; let g = null; try { g = localStorage.getItem(k); } catch(e){}
      if (g === String(todayIndex()) && !demo()) return false;
      try { localStorage.setItem(k, String(todayIndex())); } catch(e){}
      return true;
    },
    toon: open });

  versier();
  if (seizoen() && speler()) haal().then(stip);
  return { versier, sneeuw, open, seizoen };
})();
