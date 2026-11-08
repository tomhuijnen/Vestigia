/* Vestigia – kop: tegels met je stand, schakelaar klassiek/expert, menu en de smalle balk bij scrollen. */
"use strict";

/* ---------- welk scherm staat open ---------- */
let VIEW = "game";
function setView(v){
  VIEW = v;
  $("gameView").hidden = v !== "game"; $("dexView").hidden = v !== "dex"; $("rankView").hidden = v !== "rank"; $("leagueView").hidden = v !== "league"; $("profielView").hidden = v !== "profiel";
  closeMenu(true);
  renderMenu();
}

/* ---------- dagresultaten uit de opslag ---------- */
const finished = (st, i, expert) => { const g = (st.games || {})[dailyKey(i, expert)]; return g && g.status !== "playing" ? g : null; };
function gamePoints(g, expert){
  if (!g || g.status !== "won") return 0;
  if (expert) return Math.max(1, 7 - g.revealed);
  const twin = BY_ID.get(g.target).twin, tries = g.guesses.filter(n => n !== twin).length;
  return Math.max(1, 6 - tries);
}
const dayPoints = (st, i) => Math.max(gamePoints(finished(st, i, false), false), gamePoints(finished(st, i, true), true));
function weekStartDay(i){ const dow = (new Date(START + i * DAY).getUTCDay() + 6) % 7; return i - dow; }
/* dagen op rij waarop je de dagcasus speelde (klassiek of expert); vandaag telt mee zodra je hem gespeeld hebt */
function playStreak(st){
  const days = new Set(Object.entries(st.games || {}).filter(([, g]) => g && g.status !== "playing").map(([k]) => +(k.match(/^d(\d+)/) || [, -1])[1]));
  const today = todayIndex();
  let cur = 0;
  for (let i = days.has(today) ? today : today - 1; days.has(i); i--) cur++;
  let best = 0, run = 0;
  for (const d of [...days].sort((a, b) => a - b)){ run = days.has(d - 1) ? run + 1 : 1; best = Math.max(best, run); }
  return { cur, best };
}
function resultWord(g, expert){
  if (!g) return "open";
  if (g.status !== "won") return "✕";
  if (expert) return `✓ na ${g.revealed}`;
  const twin = BY_ID.get(g.target).twin;
  return `✓ ${g.guesses.filter(n => n !== twin).length}/${MAX}`;
}

/* ---------- tegels ----------
   Een lijst, zodat er later tegels bij kunnen (eikels in stap 6, je league in stap 5) zonder de kop opnieuw te bouwen.
   Elke tegel: label, waarde, regel eronder, eventueel een balk, en waar je heen gaat als je erop tikt. */
const TILES = [
  { id: "dag", go: () => goDaily(), render(st){
    const i = todayIndex(), c = finished(st, i, false), x = finished(st, i, true);
    if (!c && !x) return { label: `Dagcasus nº ${i + 1}`, value: "Nog te spelen", sub: "klassiek en expert open" };
    const p = dayPoints(st, i);
    return { label: `Dagcasus nº ${i + 1}`, value: `${p} ${p === 1 ? "punt" : "punten"}`, sub: `klassiek ${resultWord(c, false)} · expert ${resultWord(x, true)}` };
  }},
  { id: "reeks", render(st){
    const s = playStreak(st);
    return { label: "Reeks", value: `${s.cur} ${s.cur === 1 ? "dag" : "dagen"}`, sub: s.best > s.cur ? `op rij · record ${s.best}` : "op rij gespeeld" };
  }},
  { id: "week", go: () => showRank("week"), render(st){
    const today = todayIndex(), w = weekStartDay(today);
    /* punten op dit apparaat; staat er een nieuwere stand uit de ranglijst (ook van je andere apparaten), dan die */
    let pts = 0; for (let i = w; i <= today; i++) pts += dayPoints(st, i);
    let sub = "punten uit de dagcasus";
    if (online.enabled && !online.player()) sub = "kies een spelersnaam";
    else { try { const c = JSON.parse(localStorage.getItem("vestigia:week")); if (c && c.w === w){ pts = Math.max(pts, c.pts || 0); if (c.pos > 0) sub = `${c.pos}e van ${c.n} ${c.n === 1 ? "speler" : "spelers"}`; } } catch(e){} }
    return { label: "Deze week", value: `${pts} ${pts === 1 ? "punt" : "punten"}`, sub };
  }},
  /* alleen als je in een league zit: je plaats deze week in de league die je het laatst bekeek */
  { id: "league", show: () => !!League.tegel(), go: () => { const t = League.tegel(); showRank("week", t && t.league.id); }, render(){
    const t = League.tegel(), s = t.stand;
    return { label: t.league.name, value: s && s.pos > 0 ? `${s.pos}e van ${s.n}` : "–", sub: s ? `deze week · ${s.pts} ${s.pts === 1 ? "punt" : "punten"}` : "deze week" };
  }},
  { id: "dex", go: () => showDex(), render(st){
    const dex = st.dex || {}, found = TARGETS.filter(t => dex[t.id] && dex[t.id].w > 0).length;
    return { label: NAAM.vestiarium, value: String(found), unit: `/ ${TARGETS.length} platen`, bar: found / TARGETS.length };
  }}
];
function renderTiles(){
  const st = store.get(), zicht = TILES.filter(t => !t.show || t.show());
  $("tiles").classList.toggle("vijf", zicht.length === 5);
  $("tiles").innerHTML = zicht.map(t => {
    const r = t.render(st), tag = t.go ? "button" : "div";
    return `<${tag} class="tile" data-tile="${t.id}"${t.go ? ' type="button"' : ""}>
      <span class="tl">${esc(r.label)}</span>
      <span class="tv">${esc(r.value)}${r.unit ? ` <small>${esc(r.unit)}</small>` : ""}</span>
      ${r.bar !== undefined ? `<span class="tb" aria-hidden="true"><i style="width:${Math.round(100 * r.bar)}%"></i></span>` : `<span class="ts">${esc(r.sub || "")}</span>`}
    </${tag}>`;
  }).join("");
  $("tiles").querySelectorAll("button.tile").forEach(b => b.onclick = () => TILES.find(t => t.id === b.dataset.tile).go());
}

/* ---------- regel boven de naam, schakelaar en vinkjes ---------- */
function renderKop(){
  let series;
  if (S.mode === "daily"){
    const d = new Date(START + (S.caseNo - 1) * DAY);
    series = `Dagcasus nº ${S.caseNo} · ${d.toLocaleDateString("nl-NL", { weekday:"short", day:"numeric", month:"long", timeZone:"UTC" })}`;
  } else series = "Oefencasus · telt niet voor de ranglijst";
  $("fSeries").textContent = series; $("slimSeries").textContent = S.mode === "daily" ? `nº ${S.caseNo}` : "oefenen";
  $("modeClassic").setAttribute("aria-pressed", !S.expert);
  $("modeExpert").setAttribute("aria-pressed", !!S.expert);
  const st = store.get(), i = todayIndex(), daily = S.mode === "daily";
  $("doneClassic").hidden = !(daily && finished(st, i, false));
  $("doneExpert").hidden = !(daily && finished(st, i, true));
  renderTiles(); renderMenu();
}

/* ---------- venster: klassiek of expert ---------- */
function openModeInfo(){
  $("cardClassic").classList.toggle("cur", !S.expert); $("cardExpert").classList.toggle("cur", !!S.expert);
  $("modeInfo").hidden = false; $("modeOk").focus();
}
function closeModeInfo(){ $("modeInfo").hidden = true; $("modeHelp").focus(); }
$("modeHelp").addEventListener("click", openModeInfo);
$("modeOk").addEventListener("click", closeModeInfo);
$("closeMode").addEventListener("click", closeModeInfo);
$("modeInfo").addEventListener("click", e => { if (e.target === $("modeInfo")) closeModeInfo(); });

/* ---------- menu ----------
   Schuift van rechts in. Sluiten met de kruisknop, Esc, een tik naast het paneel of de terugknop van Android.
   Zolang het open is, is de rest van de pagina niet te bedienen (inert) en blijft de focus in het menu. */
let menuOpen = false;
function renderMenu(){
  const st = store.get(), dex = st.dex || {};
  $("menuDex").textContent = `${TARGETS.filter(t => dex[t.id] && dex[t.id].w > 0).length}/${TARGETS.length}`;
  const cur = VIEW === "game" ? (S && S.mode === "free" ? "free" : "daily") : VIEW;
  const nl = online.enabled && online.player() ? League.cached().length : 0;
  $("menuLeagueN").textContent = nl ? String(nl) : "";
  $("menu").querySelectorAll(".menulist button").forEach(b => b.dataset.go === cur ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  const p = online.enabled ? online.player() : null, mp = $("menuPlayer");
  mp.hidden = !online.enabled;
  const w = p && (() => { try { return JSON.parse(localStorage.getItem("vestigia:wallet")); } catch(e){ return null; } })();
  mp.toggleAttribute("aria-current", VIEW === "profiel");
  mp.innerHTML = p
    ? `${avatarSVG(Profiel.mijn(), "avatar menu")}<span><b>${esc(p.name)}</b><small>Mijn profiel${w ? ` · ${w.saldo} eikels` : ""}</small></span>`
    : `<span class="av" aria-hidden="true">?</span><span><b>Kies een spelersnaam</b><small>en speel mee in de ranglijst</small></span>`;
}
const setInert = on => {
  document.querySelectorAll("#masthead, #slimbar, .wrap").forEach(el => { el.inert = on; });
  document.querySelectorAll("#masthead, .wrap").forEach(el => on ? el.setAttribute("aria-hidden", "true") : el.removeAttribute("aria-hidden"));
};
function openMenu(){
  if (menuOpen) return;
  menuOpen = true; renderMenu();
  $("menuWrap").hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => $("menuWrap").classList.add("open")));
  setInert(true);
  $("menuBtn").setAttribute("aria-expanded", "true");
  try { history.pushState({ vestigiaMenu: true }, ""); } catch(e){}
  ($("menu").querySelector('[aria-current="page"]') || $("menu").querySelector(".menulist button")).focus({ preventScroll: true });
}
/* quiet = sluiten zonder focus terug te zetten (bij een schermwissel); fromHistory = de terugknop deed het al */
function closeMenu(quiet, fromHistory){
  if (!menuOpen) return;
  menuOpen = false;
  $("menuWrap").classList.remove("open");
  setTimeout(() => { if (!menuOpen) $("menuWrap").hidden = true; }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220);
  setInert(false);
  $("menuBtn").setAttribute("aria-expanded", "false");
  if (!fromHistory && history.state && history.state.vestigiaMenu) try { history.back(); } catch(e){}
  if (!quiet) $("menuBtn").focus({ preventScroll: true });
}
window.addEventListener("popstate", () => { if (menuOpen) closeMenu(false, true); });
$("menuBtn").addEventListener("click", openMenu);
$("eikelBtn").addEventListener("click", () => showProfiel());
$("slimEikel").addEventListener("click", () => showProfiel());
$("slimMenu").addEventListener("click", openMenu);
$("menuClose").addEventListener("click", () => closeMenu());
$("menuBack").addEventListener("click", () => closeMenu());
document.addEventListener("keydown", e => {
  if (!menuOpen) return;
  if (e.key === "Escape"){ e.preventDefault(); closeMenu(); return; }
  if (e.key !== "Tab") return;
  const f = [...$("menu").querySelectorAll("button:not([hidden])")].filter(b => b.offsetParent !== null);
  if (!f.length) return;
  if (e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); }
});
const MENU_GO = {
  daily: () => { goDaily(); window.scrollTo({ top:0, behavior:"auto" }); },
  free: () => goFree(),
  dex: () => showDex(),
  rank: () => showRank(),
  league: () => showLeague(),
  invite: () => { closeMenu(true); League.openUitnodigen(); },
  help: () => { closeMenu(true); openHelp(); },
  uitleg: () => { closeMenu(true); Uitleg.start(); },
  install: () => { closeMenu(true); installApp(); },
  player: () => { if (online.enabled && online.player()) return showProfiel(); showRank(); setTimeout(() => $("pName") && $("pName").focus(), 60); },
  profiel: () => showProfiel()
};
$("menu").addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b && MENU_GO[b.dataset.go]) MENU_GO[b.dataset.go](); });

/* ---------- naam in de kop: terug naar de dagcasus ---------- */
$("toDaily").addEventListener("click", () => MENU_GO.daily());
$("slimTitle").addEventListener("click", () => MENU_GO.daily());

/* ---------- smalle balk zodra de grote kop uit beeld is ---------- */
if ("IntersectionObserver" in window){
  new IntersectionObserver(([en]) => {
    const show = !en.isIntersecting;
    $("slimbar").classList.toggle("show", show);
    $("slimbar").setAttribute("aria-hidden", show && !menuOpen ? "false" : "true");
    $("slimbar").querySelectorAll("button").forEach(b => b.tabIndex = show ? 0 : -1);
  }, { threshold: 0 }).observe($("masthead"));
}
