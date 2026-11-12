/* Vestigia – contrast van elke avatar op elke achtergrondkleur (update 19).
   Gebruik:  node tools/avatarcontrast.mjs                 tabel met het contrast per avatar × kleur
             node tools/avatarcontrast.mjs --html uit.html  ook een overzichtspagina met alle combinaties
   Nodig: Playwright met Chrome (npm i -g playwright). Het script tekent de avatars precies zoals de app (avatarTekening
   uit js/profiel.js) en meet dan per pixel:
   - details: de donkere details (#1f3428) tegen wat eronder ligt (het dier of de achtergrond), 25e percentiel;
   - dier: de tekening tegen de achtergrondkleur, 75e percentiel.
   Onder 2 bij de details of onder 1,6 bij het dier staat een * : die combinatie even met eigen ogen bekijken. */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lees = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const args = process.argv.slice(2), htmlUit = args.includes("--html") ? args[args.indexOf("--html") + 1] : null;

/* avatars, kleuren en de tekenfunctie uit de app zelf */
const ctx = {}; vm.createContext(ctx);
vm.runInContext(lees("data/avatars.js") + ";this.AVATARS = AVATARS;", ctx);
const prof = lees("js/profiel.js");
const stuk = (van, tot) => prof.slice(prof.indexOf(van), prof.indexOf(tot));
vm.runInContext(stuk("const KLEUREN", "const LIJSTEN") + stuk("const AV_DETAIL", "/* p = {") + ";this.KLEUREN = KLEUREN; this.avatarTekening = avatarTekening;", ctx);
const { AVATARS, KLEUREN, avatarTekening } = ctx;

const rond = (k, binnen) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200" style="--av-bg:${k.bg}"><defs><clipPath id="c"><circle cx="50" cy="50" r="50"/></clipPath></defs><circle cx="50" cy="50" r="50" fill="${k.bg}"/>${binnen}</svg>`;
const metDetail = (id, k, c) => { const a = AVATARS[id]; AVATARS[id] = a.replaceAll("#1f3428", c); const s = avatarTekening(id, k, "c"); AVATARS[id] = a; return s; };
const jobs = [];
for (const id of Object.keys(AVATARS)) for (const kn of Object.keys(KLEUREN)){
  const k = KLEUREN[kn];
  jobs.push({ id, k: kn, s: [rond(k, avatarTekening(id, k, "c")), rond(k, metDetail(id, k, "none")), rond(k, metDetail(id, k, "#ff00ff")), rond(k, "")] });
}

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch(e){ try { ({ chromium } = require(path.join(process.env.NPM_GLOBAL || "/opt/npm-tools/node_modules", "playwright"))); }
  catch(e2){ console.error("Playwright ontbreekt: npm i -g playwright"); process.exit(1); } }
const browser = await chromium.launch(fs.existsSync("/usr/bin/google-chrome") ? { executablePath: "/usr/bin/google-chrome" } : {});
const page = await browser.newPage();
const res = await page.evaluate(async jobs => {
  const lum = (r, g, b) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126*f(r) + .7152*f(g) + .0722*f(b); };
  const cr = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  const cv = document.createElement("canvas"); cv.width = cv.height = 200;
  const c = cv.getContext("2d", { willReadFrequently: true }), box = document.createElement("div");
  /* via de HTML-parser, net als in de app (die is vergevingsgezinder dan een los SVG-bestand) */
  const px = async s => { box.innerHTML = s; const im = new Image();
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(box.firstElementChild));
    await im.decode(); c.clearRect(0, 0, 200, 200); c.drawImage(im, 0, 0); return c.getImageData(0, 0, 200, 200).data; };
  const pct = (a, q) => { if (a.length < 40) return null; a.sort((x, y) => x - y); return a[Math.floor(q * (a.length - 1))]; };
  const uit = [];
  for (const j of jobs){
    const n = await px(j.s[0]), o = await px(j.s[1]), m = await px(j.s[2]), g = await px(j.s[3]);
    const det = [], dier = [];
    for (let i = 0; i < n.length; i += 4){
      const x = (i / 4) % 200, y = Math.floor(i / 800);
      if ((x - 100) ** 2 + (y - 100) ** 2 > 96 * 96) continue;
      const d = (a, b) => Math.abs(a[i] - b[i]) + Math.abs(a[i+1] - b[i+1]) + Math.abs(a[i+2] - b[i+2]);
      if (d(m, o) > 180) det.push(cr(lum(n[i], n[i+1], n[i+2]), lum(o[i], o[i+1], o[i+2])));
      if (d(o, g) > 30) dier.push(cr(lum(o[i], o[i+1], o[i+2]), lum(g[i], g[i+1], g[i+2])));
    }
    uit.push({ id: j.id, k: j.k, det: pct(det, .25), dier: pct(dier, .75) });
  }
  return uit;
}, jobs);
await browser.close();

const kl = Object.keys(KLEUREN), ids = Object.keys(AVATARS);
const tabel = (titel, veld, grens) => {
  console.log("\n" + titel);
  console.log("".padEnd(26) + kl.map(k => k.slice(0, 7).padStart(8)).join(""));
  for (const id of ids) console.log(id.padEnd(26) + kl.map(k => { const v = res.find(r => r.id === id && r.k === k)[veld];
    return (v == null ? "-" : (v < grens ? "*" : "") + v.toFixed(1)).padStart(8); }).join(""));
};
tabel("Details tegen wat eronder ligt (* = onder 2)", "det", 2);
tabel("Dier tegen de achtergrond (* = onder 1,6)", "dier", 1.6);
const zwak = res.filter(r => (r.det != null && r.det < 2) || r.dier < 1.6);
console.log(`\n${zwak.length} van ${res.length} combinaties met een *`);

if (htmlUit){
  let n = 0;
  const cel = (id, kn) => { const k = KLEUREN[kn], c = "o" + (++n), r = res.find(x => x.id === id && x.k === kn), ster = r && ((r.det != null && r.det < 2) || r.dier < 1.6);
    return `<td${ster ? ' class="ster"' : ""}><svg viewBox="0 0 100 100" style="--av-bg:${k.bg}"><defs><clipPath id="${c}"><circle cx="50" cy="50" r="50"/></clipPath></defs><circle cx="50" cy="50" r="50" fill="${k.bg}"/>${avatarTekening(id, k, c)}</svg></td>`; };
  fs.writeFileSync(htmlUit, `<!DOCTYPE html><meta charset="utf-8"><title>Avatars × achtergrondkleuren</title>
<style>body{font:14px system-ui;margin:16px;background:#fbf4e2} td,th{padding:3px;text-align:center} th{font-weight:600;font-size:12px} svg{width:56px;height:56px;display:block} td.ster{outline:2px dashed #b8352b;outline-offset:-1px} tr>th:first-child{text-align:right;padding-right:8px}</style>
<table><tr><th></th>${kl.map(k => `<th>${KLEUREN[k].naam}</th>`).join("")}</tr>
${ids.map(id => `<tr><th>${id}</th>${kl.map(k => cel(id, k)).join("")}</tr>`).join("\n")}</table>`);
  console.log("Overzicht:", htmlUit);
}
