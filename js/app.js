/* Vestigia – app: spelregels, kop, meldingen, installeren, start */
"use strict";
/* ---------- help + soortenlijst ---------- */
const help = $("help");
function openHelp(){ help.hidden = false; $("closeHelp").focus(); }
function closeHelp(){ help.hidden = true; $("menuBtn").focus({ preventScroll: true }); }
$("closeHelp").addEventListener("click", closeHelp);
$("helpUitleg").addEventListener("click", () => { help.hidden = true; Uitleg.start(); });
help.addEventListener("click", e => { if (e.target === help) closeHelp(); });
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!help.hidden) closeHelp();
  else if (!$("modeInfo").hidden) closeModeInfo();
});

/* namen in beeld uit data/teksten.js */
document.querySelectorAll("[data-naam]").forEach(el => { if (NAAM[el.dataset.naam]) el.textContent = NAAM[el.dataset.naam]; });

const sorted = KIESBAAR.slice().sort((a, b) => a.n.localeCompare(b.n, "nl"));
const sterretje = KIESBAAR.length !== TARGETS.length;
$("splist").innerHTML = sorted.map(x => `<div class="${x.cs && sterretje ? "tgt" : ""}"><span>${esc(x.n)}</span> <i>${esc(x.s)}</i></div>`).join("");
$("listSum").textContent = KIESBAAR.length === TARGETS.length ? `${TARGETS.length} beschermde soorten` : `${KIESBAAR.length} soorten · ${TARGETS.length} met casus (*)`;
/* aantallen in de spelregels en het veldboek komen uit de data, zodat ze kloppen als er soorten bijkomen */
document.querySelectorAll("[data-tel=doelsoorten]").forEach(el => el.textContent = TARGETS.length);
document.querySelectorAll("[data-tel=medailles]").forEach(el => { const w = telwoord(MEDALS.length); el.textContent = el.dataset.hoofd ? w[0].toUpperCase() + w.slice(1) : w; });

/* ---------- hoogtelijnenkaart in de kop ---------- */
function drawTopo(){
  const cv = $("topo"), box = cv.parentElement.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.ceil(box.width), H = Math.ceil(box.height);
  cv.width = W * dpr; cv.height = H * dpr;
  const cx = cv.getContext("2d"); cx.setTransform(dpr,0,0,dpr,0,0); cx.clearRect(0,0,W,H);
  const r = rng(1988), G = 12, perm = [];
  for (let i = 0; i < 256; i++) perm.push(r());
  const hash = (x, y) => perm[((x * 73856093) ^ (y * 19349663)) & 255];
  const smooth = t => t * t * (3 - 2 * t);
  function noise(x, y){
    const xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi);
    const a = hash(xi, yi), b = hash(xi+1, yi), c = hash(xi, yi+1), d = hash(xi+1, yi+1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  }
  const f = (x, y) => noise(x/260, y/260)*0.62 + noise(x/120 + 9, y/120 + 4)*0.28 + noise(x/55 + 3, y/55 + 7)*0.10;
  const cols = Math.ceil(W / G) + 1, rows = Math.ceil(H / G) + 1, v = [];
  for (let j = 0; j <= rows; j++){ v[j] = []; for (let i = 0; i <= cols; i++) v[j][i] = f(i * G, j * G); }
  const levels = 22;
  for (let L = 1; L < levels; L++){
    const th = 0.18 + L * (0.66 / levels), major = L % 5 === 0;
    cx.beginPath();
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++){
      const a = v[j][i], b = v[j][i+1], c = v[j+1][i+1], d = v[j+1][i];
      const idx = (a > th ? 8 : 0) | (b > th ? 4 : 0) | (c > th ? 2 : 0) | (d > th ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const x = i * G, y = j * G, lerp = (p, q) => (th - p) / (q - p);
      const T = [x + G * lerp(a, b), y], R = [x + G, y + G * lerp(b, c)], B = [x + G * lerp(d, c), y + G], Lf = [x, y + G * lerp(a, d)];
      const segs = {1:[Lf,B],2:[B,R],3:[Lf,R],4:[T,R],5:[Lf,T,B,R],6:[T,B],7:[Lf,T],8:[Lf,T],9:[T,B],10:[T,R,Lf,B],11:[T,R],12:[Lf,R],13:[B,R],14:[Lf,B]}[idx];
      for (let s = 0; s < segs.length; s += 2){ cx.moveTo(segs[s][0], segs[s][1]); cx.lineTo(segs[s+1][0], segs[s+1][1]); }
    }
    cx.strokeStyle = major ? "rgba(237,251,226,.38)" : "rgba(255,255,255,.12)";
    cx.lineWidth = major ? 1.3 : 0.8;
    cx.stroke();
  }
}
drawTopo();
let topoT; window.addEventListener("resize", () => { clearTimeout(topoT); topoT = setTimeout(drawTopo, 150); });
document.fonts && document.fonts.ready.then(drawTopo);

/* ---------- start ---------- */
/* Opstartvolgorde: opslag (eenmalig) omzetten en de dagcasus klaarzetten, dan de openingsanimatie,
   dan de uitleg (alleen nieuwe spelers), dan de vraag om een spelersnaam, en pas daarna de actie uit een link
   (meedoen met een league; zie js/league.js). */
function start(){
  store.upgrade();
  startDaily();
  Profiel.start();
  Opening.run().then(() => Uitleg.automatisch()).then(toonWelkom).then(() => League.verwerk());
}
/* ---------- melding in beeld ---------- */
let toastT;
function toast(msg, action){
  const t = $("toast");
  const knop = action && action.label;
  t.innerHTML = `<span>${esc(msg)}</span>` + (knop ? `<button id="toastBtn">${esc(action.label)}</button>` : "");
  t.hidden = false;
  if (knop) $("toastBtn").onclick = action.run;
  clearTimeout(toastT);
  if (!action || action.duur) toastT = setTimeout(() => { t.hidden = true; }, action ? action.duur : 3500);   // duur: ook een melding met knop verdwijnt dan vanzelf
}

/* ---------- installeren en updates ---------- */
/* De knop ‘Installeer als app’ staat er altijd, behalve als Vestigia al als app draait. Alleen Chrome en Edge
   (en Android) sturen een installatievraag (beforeinstallprompt), en ook die pas na wat interactie, niet als
   de app al geïnstalleerd is en een tijd niet nadat iemand ‘nee’ zei. Zonder die vraag tonen we uitleg per browser. */
const alsApp = () => (window.matchMedia && (matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: window-controls-overlay)").matches)) || navigator.standalone === true;
let installEvt = window.__installEvt || null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; $("installBtn").hidden = false; });
$("installBtn").hidden = alsApp();
function welkeBrowser(){
  const ua = navigator.userAgent, mobiel = /Android|iPhone|iPad|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))) return "ios";
  if (/Firefox|FxiOS/.test(ua)) return mobiel ? "android" : "firefox";
  if (/SamsungBrowser/.test(ua)) return "samsung";
  if (/Edg\//.test(ua)) return "edge";
  if (/OPR\/|Opera/.test(ua)) return "opera";
  if (/Chrome|Chromium|CriOS/.test(ua)) return mobiel ? "android" : "chrome";
  if (/Safari/.test(ua) && /Macintosh/.test(ua)) return "safari";
  return "anders";
}
const INSTALL_UITLEG = {
  chrome: ["Chrome", `Klik rechts in de adresbalk op het icoontje <b>App installeren</b> (een schermpje met een pijl). Zie je dat niet, klik dan op <b>⋮</b> rechtsboven → <b>Opslaan en delen</b> (of <b>Casten, opslaan en delen</b>) → <b>Pagina installeren als app</b>.`],
  edge: ["Edge", `Klik rechts in de adresbalk op het icoontje <b>App beschikbaar</b>. Zie je dat niet, klik dan op <b>···</b> rechtsboven → <b>Apps</b> → <b>Deze site als app installeren</b>.`],
  opera: ["Opera", `Opera kan Vestigia niet altijd als app installeren. Open Vestigia in <b>Chrome</b> of <b>Edge</b> en installeer hem daar.`],
  safari: ["Safari", `Kies in de menubalk <b>Archief</b> → <b>Voeg toe aan Dock</b> (vanaf macOS Sonoma). Op een oudere macOS kan dat niet; gebruik dan Chrome of Edge.`],
  firefox: ["Firefox", `Firefox kan op een laptop of pc geen web-apps installeren. Open Vestigia in <b>Chrome</b> of <b>Edge</b> en installeer hem daar. Je kunt in Firefox ook gewoon verder spelen, of de pagina vastzetten (rechtsklik op het tabblad → <b>Tabblad vastmaken</b>).`],
  ios: ["iPhone of iPad", `Open Vestigia in <b>Safari</b>, tik op <b>Deel</b> (vierkantje met pijl omhoog) en kies <b>Zet op beginscherm</b>. Let op: de app heeft een eigen geheugen. Kopieer eerst je spelerscode in Mijn profiel als je al een naam hebt.`],
  android: ["Android", `Tik in Chrome op <b>⋮</b> rechtsboven → <b>App installeren</b> of <b>Toevoegen aan startscherm</b>.`],
  samsung: ["Samsung Internet", `Tik op <b>☰</b> rechtsonder → <b>Pagina toevoegen aan</b> → <b>Startscherm</b>.`],
  anders: ["je browser", `Installeren werkt het best in <b>Chrome</b> of <b>Edge</b> (op een laptop of pc) en in Safari op een iPhone.`]
};
function installUitleg(){
  const [naam, tekst] = INSTALL_UITLEG[welkeBrowser()], box = $("leaguePop");
  const kruis = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>`;
  $("leaguePopBody").innerHTML = `
    <div class="top"><h2 id="leaguePopH">Installeren in ${esc(naam)}</h2><button class="iconbtn" id="ipX" aria-label="Sluiten">${kruis}</button></div>
    <p>${tekst}</p>
    <p class="fine">Staat Vestigia al op je computer? Dan biedt de browser installeren niet nog eens aan. Open hem dan via het Startmenu, het Dock of je taakbalk. Je voortgang en spelersnaam neem je mee, want de app gebruikt hetzelfde geheugen als de browser waarin je hem installeert.</p>
    <div class="row2"><button class="btn" id="ipOk">Begrepen</button></div>`;
  box.hidden = false;
  $("ipX").onclick = $("ipOk").onclick = () => { box.hidden = true; };
}
async function installApp(){
  if (!installEvt){ installUitleg(); return; }
  installEvt.prompt(); await installEvt.userChoice.catch(() => {}); installEvt = window.__installEvt = null;
}
window.addEventListener("appinstalled", () => { $("installBtn").hidden = true; toast("Vestigia is geïnstalleerd. Je vindt hem bij je apps."); });
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")){
  navigator.serviceWorker.register("sw.js").then(reg => {
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      nw && nw.addEventListener("statechange", () => {
        if (nw.state === "installed" && navigator.serviceWorker.controller)
          toast("Er is een nieuwe versie van Vestigia.", { label: "Vernieuwen", run: () => nw.postMessage("skipWaiting") });
      });
    });
  }).catch(() => {});
  /* Alleen herladen bij een update. Bij het allereerste bezoek neemt de service worker de pagina ook over
     (controllerchange), maar dan is er niets te vernieuwen; herladen brak toen de openingsanimatie af. */
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController && !reloaded){ reloaded = true; location.reload(); } });
}

start();
window.__veld = { compare, BY_ID, TARGETS, daily, todayIndex, store, online };   /* voor testen en foutzoeken */
