/* Vestigia – kop: tegels met je stand, schakelaar klassiek/expert, menu en de smalle balk bij scrollen. */
"use strict";

/* ---------- welk scherm staat open ---------- */
let VIEW = "game";
const VIEWS = { game: "gameView", dex: "dexView", rank: "rankView", league: "leagueView", profiel: "profielView", shop: "shopView" };
/* Bij een schermwissel schuift het nieuwe scherm zacht in beeld (niet bij ‘minder beweging’). */
function inBeeld(el){
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.classList.remove("viewin"); void el.offsetWidth; el.classList.add("viewin");
}
function setView(v){
  const vorig = VIEW; VIEW = v;
  for (const [k, id] of Object.entries(VIEWS)) $(id).hidden = v !== k;
  if (vorig !== v) inBeeld($(VIEWS[v]));
  closeMenu(true);
  renderMenu(); renderTabbar(); kleurKop();
}
/* Oefenen krijgt een bruine kop, zodat je altijd ziet dat het niet om de dagcasus gaat. */
function kleurKop(){ document.body.classList.toggle("oefenen", VIEW === "game" && !!S && S.mode === "free"); }
/* ---------- tabbalk onderin: Ranglijst · Spelen · Vestiarium ---------- */
function renderTabbar(){
  const cur = VIEW === "game" ? "spelen" : VIEW === "league" ? "rank" : VIEW;
  $("tabbar").querySelectorAll("[data-tab]").forEach(b => {
    b.classList.toggle("on", b.dataset.tab === cur);
    b.dataset.tab === cur ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current");
  });
}

/* ---------- dagresultaten uit de opslag ---------- */
const finished = (st, i, expert) => { const g = (st.games || {})[dailyKey(i, expert)]; return g && g.status !== "playing" ? g : null; };
function gamePoints(g, expert){
  if (!g || g.status !== "won") return 0;
  if (expert) return Math.max(1, 7 - g.revealed);
  const twin = BY_ID.get(g.target).twin, tries = g.guesses.filter(n => n !== twin).length;
  return Math.max(1, 6 - tries);
}
/* Klassiek en expert hebben dezelfde casus. Voor de ranglijst telt daarom alleen de modus die je die dag als eerste
   speelde (het logboek staat op volgorde). null = vandaag nog niets afgerond. */
function eersteModus(st, i){
  const e = (st.log || []).find(l => l.m === "daily" && l.d === i);
  if (e) return !!e.x;
  return finished(st, i, false) ? false : finished(st, i, true) ? true : null;
}
const dayPoints = (st, i) => { const m = eersteModus(st, i); return m === null ? 0 : gamePoints(finished(st, i, m), m); };
function weekStartDay(i){ const dow = (new Date(START + i * DAY).getUTCDay() + 6) % 7; return i - dow; }
/* dagen op rij waarop je de dagcasus speelde (klassiek of expert); vandaag telt mee zodra je hem gespeeld hebt */
/* Reeks: dagen waarop je de dagcasus afrondde. Uit de spellen op dit apparaat én uit het logboek, dat met je andere
   apparaten wordt samengevoegd. Alleen de spellen was niet genoeg: van andere apparaten komen alleen gisteren en vandaag mee. */
function playStreak(st){
  const days = new Set(Object.entries(st.games || {}).filter(([, g]) => g && g.status !== "playing").map(([k]) => +(k.match(/^d(\d+)/) || [, -1])[1]));
  for (const e of st.log || []) if (e && e.m === "daily" && Number.isInteger(e.d) && e.d >= 0) days.add(e.d);
  days.delete(-1);
  const today = todayIndex();
  let cur = 0;
  for (let i = days.has(today) ? today : today - 1; days.has(i); i--) cur++;
  let best = 0, run = 0;
  for (const d of [...days].sort((a, b) => a - b)){ run = days.has(d - 1) ? run + 1 : 1; best = Math.max(best, run); }
  return { cur, best };
}

/* vlammetje bij de reeks */
const VLAM = `<svg class="vlam" aria-hidden="true" viewBox="0 0 16 16" width="15" height="15"><path d="M8 1.2c.4 2.3 2.1 3.4 3.3 5 1 1.4 1.4 2.7 1.2 4.1-.4 2.6-2.6 4.5-5.1 4.5S3 13 2.9 10.4c-.1-1.6.6-3 1.6-4 .1 1 .6 1.8 1.4 2.2C5.5 6.2 6.6 3.5 8 1.2Z" fill="#e8743b"/><path d="M8.1 7.4c.3 1.2 1.3 1.8 1.7 2.8.5 1.4-.4 3-1.9 3s-2.4-1.3-2-2.6c.2-.7.7-1.1 1.2-1.4 0 .6.3 1 .7 1.2 0-1.2.1-2.1.3-3Z" fill="#f6c34a"/></svg>`;
/* ---------- tegels ----------
   Een lijst, zodat er later tegels bij kunnen (eikels in stap 6, je league in stap 5) zonder de kop opnieuw te bouwen.
   Elke tegel: label, waarde, regel eronder, eventueel een balk, en waar je heen gaat als je erop tikt. */
const TILES = [
  { id: "dag", go: () => goDaily(), render(st){
    const i = todayIndex(), c = finished(st, i, false), x = finished(st, i, true);
    if (!c && !x) return { label: `Dagcasus #${i + 1}`, value: "Nog te spelen", sub: "klassiek of expert" };
    const p = dayPoints(st, i);
    const eerst = eersteModus(st, i), op = m => (eerst !== null && eerst !== m) ? " op slot" : "";
    return { label: `Dagcasus #${i + 1}`, value: `${p} ${p === 1 ? "punt" : "punten"}`, sub: `klassiek${c ? " ✓" : op(false)} · expert${x ? " ✓" : op(true)}` };
  }},
  { id: "reeks", render(st){
    const s = playStreak(st);
    return { label: "Reeks", icon: s.cur > 0 ? VLAM : "", value: `${s.cur} ${s.cur === 1 ? "dag" : "dagen"}`, sub: s.best > s.cur ? `op rij · record ${s.best}` : "op rij gespeeld" };
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
      <span class="tv">${r.icon || ""}${esc(r.value)}${r.unit ? ` <small>${esc(r.unit)}</small>` : ""}</span>
      ${r.bar !== undefined ? `<span class="tb" aria-hidden="true"><i style="width:${Math.round(100 * r.bar)}%"></i></span>` : `<span class="ts">${esc(r.sub || "")}</span>`}
    </${tag}>`;
  }).join("");
  $("tiles").querySelectorAll("button.tile").forEach(b => b.onclick = () => TILES.find(t => t.id === b.dataset.tile).go());
}

/* ---------- regel boven de naam, schakelaar en vinkjes ---------- */
const SLOTJE = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6.2" width="9" height="6.3" rx="1.4"/><path d="M4.6 6.2V4.6a2.4 2.4 0 0 1 4.8 0v1.6"/></svg>`;
function renderKop(){
  /* boven de naam staat alleen bij oefenen iets: welk nummer en welke dag het is, zie je al in de tegel */
  $("fSeries").textContent = S.mode === "daily" ? "" : `Oefencasus${S.groep && GROUPS[S.groep] ? " · " + GROUPS[S.groep] : ""}`;
  $("fSeries").hidden = S.mode === "daily";
  $("slimSeries").textContent = S.mode === "daily" ? `#${S.caseNo}` : "oefenen";
  kleurKop();
  if (typeof Spelen !== "undefined") Spelen.oefenKader();
  const seg = document.querySelector(".modebar .seg");
  seg.classList.toggle("expert", !!S.expert);
  if (!seg.classList.contains("klaar")) requestAnimationFrame(() => requestAnimationFrame(() => seg.classList.add("klaar")));
  $("modeClassic").setAttribute("aria-pressed", !S.expert);
  $("modeExpert").setAttribute("aria-pressed", !!S.expert);
  const st = store.get(), i = todayIndex(), daily = S.mode === "daily";
  $("doneClassic").hidden = !(daily && finished(st, i, false));
  $("doneExpert").hidden = !(daily && finished(st, i, true));
  /* Slotje: heb je de dagcasus vandaag al in de ene modus gespeeld, dan zit de andere op slot (zelfde casus, je kent
     het antwoord al). Bij oefenen zit er nooit een slot op. */
  const eerst = daily ? eersteModus(st, i) : null;
  for (const [id, expert] of [["modeClassic", false], ["modeExpert", true]]){
    const dicht = eerst !== null && eerst !== expert, b = $(id);
    b.classList.toggle("slot", dicht);
    let k = b.querySelector(".slotje");
    if (dicht && !k){ b.insertAdjacentHTML("beforeend", `<span class="slotje" aria-hidden="true">${SLOTJE}</span>`); }
    if (!dicht && k) k.remove();
    dicht ? b.setAttribute("aria-label", `${expert ? "Expert" : "Klassiek"}: vandaag op slot`) : b.removeAttribute("aria-label");
  }
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
/* zonder spelersnaam: een poppetje in plaats van een avatar */
const POPPETJE = `<svg class="avatar kop" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="50" fill="#edfbe2"/><circle cx="50" cy="40" r="15" fill="#4b7a5e"/><path d="M22 84c4-16 15-24 28-24s24 8 28 24" fill="#4b7a5e"/></svg>`;
function renderMenu(){
  const cur = VIEW;
  const nl = online.enabled && online.player() ? League.cached().length : 0;
  $("menuLeagueN").textContent = nl ? String(nl) : "";
  $("menu").querySelectorAll(".menulist button").forEach(b => b.dataset.go === cur ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
  const p = online.enabled ? online.player() : null, mp = $("menuPlayer");
  mp.hidden = !online.enabled;
  /* de knop rechtsboven is je avatar; hij opent het menu met je profiel */
  const sleutel = p ? JSON.stringify(Profiel.mijn()) : "";
  ["menuBtn", "slimMenu"].forEach(id => {
    if ($(id).dataset.av === sleutel && $(id).firstChild) return;
    $(id).innerHTML = p ? avatarSVG(Profiel.mijn(), "avatar kop") : POPPETJE; $(id).dataset.av = sleutel;
  });
  const w = p && (() => { try { return JSON.parse(localStorage.getItem("vestigia:wallet")); } catch(e){ return null; } })();
  mp.toggleAttribute("aria-current", VIEW === "profiel");
  mp.innerHTML = p
    ? `${avatarSVG(Profiel.mijn(), "avatar inmenu")}<span><b>${esc(p.name)}</b><small>Mijn profiel${w ? ` · ${w.saldo} eikels` : ""}</small></span>`
    : `<span class="av" aria-hidden="true">?</span><span><b>Kies een spelersnaam</b><small>en speel mee in de ranglijst</small></span>`;
}
const setInert = on => {
  document.querySelectorAll("#masthead, #slimbar, .wrap, #tabbar").forEach(el => { el.inert = on; });
  document.querySelectorAll("#masthead, .wrap, #tabbar").forEach(el => on ? el.setAttribute("aria-hidden", "true") : el.removeAttribute("aria-hidden"));
};
function openMenu(){
  if (menuOpen) return;
  menuOpen = true; renderMenu();
  $("menuWrap").hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => $("menuWrap").classList.add("open")));
  setInert(true);
  $("menuBtn").setAttribute("aria-expanded", "true");
  try { history.pushState({ vestigiaMenu: true }, ""); } catch(e){}
  ($("menu").querySelector('[aria-current="page"]') || (!$("menuPlayer").hidden && $("menuPlayer")) || $("menu").querySelector(".menulist li:not([hidden]) button")).focus({ preventScroll: true });
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
$("eikelBtn").addEventListener("click", () => showShop());
$("slimEikel").addEventListener("click", () => showShop());
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
  profiel: () => showProfiel(),
  shop: () => showShop()
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
