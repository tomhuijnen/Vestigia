/* Vestigia – tabbalk onderin, de speelkring en het oefenkader.
   De tabbalk heeft drie knoppen: Ranglijst · Spelen · Vestiarium. Spelen laat in een halve cirkel bolletjes
   opkomen: Dagcasus en Oefenen, en grijs de minispellen die nog komen. Wat erachter open stond, vervaagt.
   Oefenen begint altijd met alle soorten door elkaar. In het oefenscherm zelf staat een bruin kader waarin je
   een diergroep kiest, of alleen soorten die nog niet in je Vestiarium staan; die keuze geldt tot je weer
   via Spelen begint. Hier staat ook de uitleg over tweelingsoorten. */
"use strict";

const Spelen = (() => {
  const KEY = "vestigia:oefenen", TWEELING = "vestigia:tweeling-uitleg";
  const lees = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } };
  /* g: diergroep of null (alle), nieuw: alleen soorten die nog niet in je Vestiarium staan */
  function keuze(){ const k = lees(); return { g: GROUPS[k.g] ? k.g : null, nieuw: !!k.nieuw }; }
  function bewaar(k){ try { localStorage.setItem(KEY, JSON.stringify({ g: k.g || null, nieuw: !!k.nieuw })); } catch(e){} }
  const ALLES = { g: null, nieuw: false };
  function omschrijving(k){
    const groep = k.g && GROUPS[k.g] ? GROUPS[k.g].toLowerCase() : null;
    if (k.nieuw) return groep ? `${groep} die je nog niet hebt` : "soorten die je nog niet hebt";
    return groep ? `alle ${groep}` : "alle soorten";
  }
  const gevonden = id => { const d = (store.get().dex || {})[id]; return !!(d && d.w > 0); };
  const nogOpen = g => TARGETS.filter(t => (!g || t.g === g) && !gevonden(t.id)).length;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- de speelkring ---------- */
  const IC = {
    dag: `<svg aria-hidden="true" width="26" height="26" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="15" height="13.5" rx="2"/><path d="M3.5 9.5h15M7.5 3v4M14.5 3v4"/><path d="M8 13.6l2 2 4-4.2"/></svg>`,
    oefen: `<svg aria-hidden="true" width="26" height="26" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 11a6.5 6.5 0 1 1-2-4.7"/><path d="M17.8 3.6v3.6h-3.6"/></svg>`,
    raadsel: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.2 8.2a2.9 2.9 0 1 1 4 2.7c-.8.4-1.2 1-1.2 1.9v.6"/><circle cx="11" cy="16.6" r=".4" fill="currentColor"/></svg>`,
    soortenduel: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="7" height="11" rx="1.5"/><rect x="12.5" y="5" width="7" height="11" rx="1.5"/><path d="M11 3v16" stroke-dasharray="1.5 2.5"/></svg>`,
    spelersduel: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="8" r="2.6"/><circle cx="15" cy="8" r="2.6"/><path d="M2.5 17c.5-2.6 2.3-4 4.5-4s4 1.4 4.5 4M10.5 17c.5-2.6 2.3-4 4.5-4s4 1.4 4.5 4"/></svg>`
  };
  /* van links naar rechts over de boog; de dagcasus staat bovenaan in het midden */
  const BELLEN = [
    { id: "raadsel", label: "Raadsel", later: true },
    { id: "oefen", label: "Oefenen", go: () => { bewaar(ALLES); startFree(ALLES); } },
    { id: "dag", label: "Dagcasus", go: () => { goDaily(); window.scrollTo({ top: 0, behavior: "auto" }); } },
    { id: "soortenduel", label: "Soortenduel", later: true },
    { id: "spelersduel", label: "Spelersduel", later: true }
  ];
  let terug = null, dicht = null;
  const isOpen = () => !$("speelKring").hidden && $("speelKring").classList.contains("open");
  function open(){
    clearTimeout(dicht);
    terug = document.activeElement;
    closeMenu(true);
    const knop = document.querySelector('#tabbar [data-tab="spelen"]'), ic = knop.querySelector(".ic").getBoundingClientRect();
    /* het middelpunt van de boog ligt iets boven de knop, zodat ook de buitenste namen boven de tabbalk blijven */
    const cx = ic.left + ic.width / 2, cy = ic.top + ic.height / 2 - 58;
    const R = Math.min(160, innerWidth / 2 - 40), HOEK = [168, 125, 90, 55, 12];   // de buitenste iets lager, zodat geen naam een bolletje raakt
    const st = store.get(), i = todayIndex(), gespeeld = finished(st, i, false) || finished(st, i, true);
    $("kringBellen").innerHTML = BELLEN.map((b, k) => {
      const hoek = HOEK[k] * Math.PI / 180;
      const x = Math.round(R * Math.cos(hoek)), y = Math.round(-R * Math.sin(hoek));
      const sub = b.later ? "binnenkort" : b.id === "dag" ? (gespeeld ? "gespeeld" : `#${i + 1}`) : "";
      return `<button type="button" class="bel ${b.id}${b.later ? " later" : ""}" data-bel="${b.id}" style="left:${cx}px;top:${cy}px;--x:${x}px;--y:${y}px;--d:${Math.abs(k - 2) * 35}ms"${b.later ? ' aria-disabled="true"' : ""}>
        <span class="bol">${IC[b.id]}${b.id === "dag" && gespeeld ? `<span class="belvink" aria-hidden="true">✓</span>` : ""}</span>
        <span class="bl">${esc(b.label)}</span>${sub ? `<span class="bs">${esc(sub)}</span>` : ""}</button>`;
    }).join("");
    $("kringBellen").querySelectorAll(".bel").forEach(b => b.onclick = () => {
      const bel = BELLEN.find(x => x.id === b.dataset.bel);
      if (bel.later){ toast(`${bel.label} komt binnenkort.`); return; }
      sluit(true); bel.go();
    });
    knop.setAttribute("aria-expanded", "true"); knop.classList.add("open");
    document.querySelectorAll("#masthead, #slimbar, .wrap").forEach(el => { el.inert = true; });
    $("speelKring").hidden = false;
    if (reduce()) $("speelKring").classList.add("open");
    else requestAnimationFrame(() => requestAnimationFrame(() => $("speelKring").classList.add("open")));
    $("kringBellen").querySelector('[data-bel="dag"]').focus({ preventScroll: true });
  }
  function sluit(stil){
    if ($("speelKring").hidden) return;
    const knop = document.querySelector('#tabbar [data-tab="spelen"]');
    knop.setAttribute("aria-expanded", "false"); knop.classList.remove("open");
    document.querySelectorAll("#masthead, #slimbar, .wrap").forEach(el => { el.inert = false; });
    $("speelKring").classList.remove("open");
    clearTimeout(dicht);
    dicht = setTimeout(() => { $("speelKring").hidden = true; }, reduce() ? 0 : 220);
    if (!stil && terug && terug.focus) terug.focus({ preventScroll: true });
  }
  $("kringVlak").addEventListener("click", () => sluit());

  /* ---------- het bruine oefenkader in het oefenscherm ---------- */
  let kaderOpen = false;
  function oefenKader(){
    const el = $("oefenKader"), oefen = !!S && S.mode === "free";
    el.hidden = !oefen;
    if (!oefen) return;
    const k = { g: S.groep || null, nieuw: !!S.nieuw };
    const groepen = [[null, "Alle"]].concat(Object.entries(GROUPS).filter(([g]) => TARGETS.some(t => t.g === g)));
    el.open = kaderOpen;
    el.innerHTML = `
      <summary><span class="caps">Oefenen · telt niet voor de ranglijst</span><span class="okeuze">${esc(omschrijving(k).replace(/^./, c => c.toUpperCase()))}</span></summary>
      <div class="spgroepen" role="group" aria-label="Diergroep">${groepen.map(([g, naam]) =>
        `<button type="button" class="chipbtn" data-g="${g || ""}" aria-pressed="${k.g === g}">${esc(naam)}${k.nieuw ? ` <small>${nogOpen(g)}</small>` : ""}</button>`).join("")}</div>
      <label class="spnieuw"><input type="checkbox" id="spNieuw"${k.nieuw ? " checked" : ""}> Alleen soorten die nog niet in mijn ${esc(NAAM.vestiarium)} staan</label>
      <p class="fine">Een andere keuze geeft meteen een nieuwe oefencasus.</p>`;
    el.ontoggle = () => { kaderOpen = el.open; };
    const wissel = (nieuw, focus) => { bewaar(nieuw); kaderOpen = true; startFree(nieuw); const f = focus(); if (f) f.focus({ preventScroll: true }); };
    el.querySelectorAll("[data-g]").forEach(b => b.onclick = () => wissel({ g: b.dataset.g || null, nieuw: k.nieuw }, () => $("oefenKader").querySelector(`[data-g="${b.dataset.g}"]`)));
    $("spNieuw").onchange = e => wissel({ g: k.g, nieuw: e.target.checked }, () => $("spNieuw"));
  }
  /* ‘Wijzig’ in de uitslag: naar boven en het kader openen */
  function wijzig(){ kaderOpen = true; $("oefenKader").open = true; window.scrollTo({ top: 0, behavior: reduce() ? "auto" : "smooth" }); setTimeout(() => { const b = $("oefenKader").querySelector('[aria-pressed="true"]'); if (b) b.focus({ preventScroll: true }); }, 300); }

  /* ---------- tweelingsoorten ---------- */
  function tweeling(gegokt){
    terug = document.activeElement;
    const nu = $("tweelingNu");
    nu.hidden = !gegokt;
    if (gegokt) nu.innerHTML = `Je gokte de <b>${esc(gegokt.n.toLowerCase())}</b>: de tweelingsoort van het antwoord.`;
    $("tweelingPop").hidden = false; $("tweelingOk").focus({ preventScroll: true });
  }
  function tweelingSluit(){ $("tweelingPop").hidden = true; if (terug && terug.focus) terug.focus({ preventScroll: true }); }
  function tweelingEersteKeer(gegokt){
    try { if (localStorage.getItem(TWEELING)) return; localStorage.setItem(TWEELING, "1"); } catch(e){ return; }
    tweeling(gegokt);
  }
  $("tweelingOk").addEventListener("click", tweelingSluit);
  $("tweelingClose").addEventListener("click", tweelingSluit);
  $("tweelingPop").addEventListener("click", e => { if (e.target === $("tweelingPop")) tweelingSluit(); });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!$("speelKring").hidden) sluit();
    else if (!$("tweelingPop").hidden) tweelingSluit();
  });

  /* ---------- tabbalk ---------- */
  const TAB = { rank: () => showRank(), spelen: () => isOpen() ? sluit() : open(), dex: () => showDex() };
  $("tabbar").addEventListener("click", e => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    if (b.dataset.tab !== "spelen") sluit(true);
    TAB[b.dataset.tab]();
  });

  return { keuze, omschrijving, open, sluit, oefenKader, wijzig, tweeling, tweelingEersteKeer };
})();
