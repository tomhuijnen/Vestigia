/* Vestigia – tabbalk onderin en het venster ‘Spelen’.
   De tabbalk heeft drie knoppen: Ranglijst · Spelen · Vestiarium. Spelen opent een venster met de keuze tussen
   de dagcasus en oefenen. Bij oefenen kies je een diergroep en eventueel ‘alleen soorten die je nog niet hebt’;
   die keuze wordt onthouden en geldt ook voor ‘Nieuwe casus’ na afloop.
   Hier staat ook de uitleg over tweelingsoorten: eenmalig bij je eerste tweelinggok, en daarna via een knop. */
"use strict";

const Spelen = (() => {
  const KEY = "vestigia:oefenen", TWEELING = "vestigia:tweeling-uitleg";
  const lees = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } };
  /* g: diergroep of null (alle), nieuw: alleen soorten die nog niet in je Vestiarium staan */
  function keuze(){ const k = lees(); return { g: GROUPS[k.g] ? k.g : null, nieuw: !!k.nieuw }; }
  function bewaar(k){ try { localStorage.setItem(KEY, JSON.stringify({ g: k.g || null, nieuw: !!k.nieuw })); } catch(e){} }
  function omschrijving(k){
    const groep = k.g && GROUPS[k.g] ? GROUPS[k.g].toLowerCase() : null;
    if (k.nieuw) return groep ? `${groep} die je nog niet hebt` : "soorten die je nog niet hebt";
    return groep ? `alle ${groep}` : "alle soorten";
  }
  const gevonden = id => { const d = (store.get().dex || {})[id]; return !!(d && d.w > 0); };
  const nogOpen = g => TARGETS.filter(t => (!g || t.g === g) && !gevonden(t.id)).length;

  /* ---------- venster ---------- */
  let terug = null;
  function dagStand(){
    const st = store.get(), i = todayIndex(), d = new Date(START + i * DAY);
    const datum = d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" });
    const m = eersteModus(st, i);
    const waarde = m === null ? "Nog te spelen" : `Gespeeld · ${dayPoints(st, i)} ${dayPoints(st, i) === 1 ? "punt" : "punten"}`;
    return { kop: `Dagcasus #${i + 1} · ${datum}`, waarde };
  }
  function teken(){
    const k = keuze(), d = dagStand(), groepen = [[null, "Alle"]].concat(Object.entries(GROUPS).filter(([g]) => TARGETS.some(t => t.g === g)));
    $("spelenBody").innerHTML = `
      <div class="top"><h2 id="spelenH">Spelen</h2><button class="iconbtn" id="spelenClose" aria-label="Sluiten"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>
      <button class="speelkaart dag" id="spDag" type="button">
        <span class="caps">${esc(d.kop)}</span>
        <b>${esc(d.waarde)}</b>
        <small>Voor iedereen dezelfde casus. Telt voor de ranglijst.</small>
      </button>
      <div class="speelkaart oef" id="spOefenKaart">
        <span class="caps">Oefenen · telt niet voor de ranglijst</span>
        <div class="spgroepen" role="group" aria-label="Diergroep">${groepen.map(([g, naam]) =>
          `<button type="button" class="chipbtn" data-g="${g || ""}" aria-pressed="${(k.g || null) === g}">${esc(naam)}${k.nieuw ? ` <small>${nogOpen(g)}</small>` : ""}</button>`).join("")}</div>
        <label class="spnieuw"><input type="checkbox" id="spNieuw"${k.nieuw ? " checked" : ""}> Alleen soorten die nog niet in mijn ${esc(NAAM.vestiarium)} staan</label>
        <button class="btn" id="spOefen" type="button">Start een oefencasus</button>
      </div>`;
    $("spelenClose").onclick = () => sluit();
    $("spDag").onclick = () => { sluit(true); goDaily(); window.scrollTo({ top: 0, behavior: "auto" }); };
    $("spelenBody").querySelectorAll("[data-g]").forEach(b => b.onclick = () => { bewaar(Object.assign(keuze(), { g: b.dataset.g || null })); teken(); $("spelenBody").querySelector(`[data-g="${b.dataset.g}"]`).focus(); });
    $("spNieuw").onchange = e => { bewaar(Object.assign(keuze(), { nieuw: e.target.checked })); teken(); $("spNieuw").focus(); };
    $("spOefen").onclick = () => { sluit(true); startFree(keuze()); };
  }
  /* focus = "oefenen": meteen bij de keuze voor oefenen beginnen */
  function open(focus){
    terug = document.activeElement;
    closeMenu(true);
    teken();
    $("spelenPop").hidden = false;
    (focus === "oefenen" ? $("spOefen") : $("spDag")).focus({ preventScroll: true });
  }
  function sluit(stil){
    if ($("spelenPop").hidden) return;
    $("spelenPop").hidden = true;
    if (!stil && terug && terug.focus) terug.focus({ preventScroll: true });
  }
  $("spelenPop").addEventListener("click", e => { if (e.target === $("spelenPop")) sluit(); });

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
    if (!$("spelenPop").hidden) sluit();
    else if (!$("tweelingPop").hidden) tweelingSluit();
  });

  /* ---------- tabbalk ---------- */
  const TAB = { rank: () => showRank(), spelen: () => open(), dex: () => showDex() };
  $("tabbar").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) TAB[b.dataset.tab](); });

  return { keuze, omschrijving, open, sluit, tweeling, tweelingEersteKeer };
})();
