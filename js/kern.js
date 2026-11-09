/* Vestigia – kern: hulpfuncties, soorten, dagschema, opslag, vergelijken.
   Dit bestand gebruikt geen pagina-elementen bij het laden, zodat tools/controle.mjs en tools/dagschema.mjs het ook kunnen draaien. */
"use strict";
const TARGETS = SPECIES.filter(s => s.cs && s.cs.length);       // alleen soorten met een casus kunnen het antwoord zijn
const BY_ID = new Map(SPECIES.map(s => [s.id, s]));
const BY_NAME = new Map(SPECIES.map(s => [s.n, s]));
const MAX = 5;
const COLS = ["h","a","v","b","w","l","r"];
const COL_LABEL = { h:"Leefgebied", a:"Activiteit", v:"Voedsel", b:"Verblijfplaats", w:"Winter", l:"Lengte", r:"Regime" };
const START = Date.UTC(2026,10,6);
const DAY = 864e5;

/* ---------- hulpfuncties ---------- */
const $ = id => document.getElementById(id);
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed>>>15, 1|seed); t = t + Math.imul(t ^ t>>>7, 61|t) ^ t; return ((t ^ t>>>14) >>> 0) / 4294967296; }; }
function shuffled(arr, seed){ const r = rng(seed), a = arr.slice(); for(let i=a.length-1;i>0;i--){ const j = Math.floor(r()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
const MONTHS = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const TEL = ["nul","een","twee","drie","vier","vijf","zes","zeven","acht","negen","tien","elf","twaalf"];
const telwoord = n => TEL[n] || String(n);
const isoDay = ms => new Date(ms).toISOString().slice(0,10);

/* ---------- soorten en casussen ---------- */
/* Zoekt de vaste id bij een sleutel uit opslag: een id, een (oude) Nederlandse naam of een naam uit ALIASES. */
function idOf(key){
  if (BY_ID.has(key)) return key;
  const s = BY_NAME.get(key); if (s) return s.id;
  const a = ALIASES[key]; return a && BY_ID.has(a) ? a : null;
}
const caseOf = (id, k) => { const t = BY_ID.get(id); return t.cs[k] || t.cs[0]; };
function caseMonth(c){ const m = c.wn[0].toLowerCase().match(new RegExp(MONTHS.join("|"))); return m ? MONTHS.indexOf(m[0]) : -1; }
const isMedal = t => t.zz === "ZZ";
const MEDALS = TARGETS.filter(isMedal);

/* ---------- dagschema ----------
   De dagcasussen staan vast in data/dagschema.js (soort#casus per dag, vanaf 6 november 2026). Zo verschuift er niets als er
   soorten of casussen bijkomen. Na het einde van het schema rekent de app verder met dezelfde regel als tools/dagschema.mjs:
   een casus waarvan de maand binnen één maand van vandaag ligt, van een soort die de afgelopen drie weken niet aan de beurt was. */
const DAILY = [];
for (const e of (typeof DAGSCHEMA !== "undefined" ? DAGSCHEMA : [])){
  const [id, k] = String(e).split("#"), t = BY_ID.get(id), ki = (+k || 1) - 1;
  if (!t || !t.cs || !t.cs[ki]) break;            // kan niet als het controlescript groen is; dan vanaf hier verder rekenen
  DAILY.push({ id, k: ki });
}
const DAILY_FIXED = DAILY.length;
function pickDaily(d, history){
  const m = new Date(START + d * DAY).getUTCMonth();
  const recent = new Set(history.slice(Math.max(0, d - 21), d).map(x => x.id));
  const cand = TARGETS.flatMap(t => t.cs.map((c, k) => ({ id: t.id, k, m: caseMonth(c) })));
  const near = cand.filter(c => c.m >= 0 && Math.min((c.m - m + 12) % 12, (m - c.m + 12) % 12) <= 1);
  let pool = near.filter(c => !recent.has(c.id));
  if (!pool.length) pool = cand.filter(c => !recent.has(c.id));
  if (!pool.length) pool = cand;
  const c = pool[Math.floor(rng(20261106 + d * 7919)() * pool.length)];
  return { id: c.id, k: c.k };
}
function daily(i){ while (DAILY.length <= i) DAILY.push(pickDaily(DAILY.length, DAILY)); return DAILY[i]; }
function todayIndex(){ const d = new Date(); return Math.max(0, Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - START) / DAY)); }
function dailyTarget(i){ return BY_ID.get(daily(i).id); }

/* ---------- opslag ----------
   Alles staat onder één sleutel (veldcasus:v1, de naam blijft). Het veld v is de versie van het formaat. Een nieuwe versie zet
   oude gegevens om; er wordt nooit leeg begonnen. Versie 2 (november 2026): soorten op vaste id in plaats van op naam,
   behaalde titels en medailles bewaard, en een logboek van elk gespeeld spel.
   Bij de omzetting blijft een kopie van de oude gegevens staan onder veldcasus:backup-v1. */
const STORE_KEY = "veldcasus:v1", STORE_V = 2;
const store = {
  raw(){ try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch(e){ return {}; } },
  get(){ return migrate(this.raw()); },
  set(v){ v.v = STORE_V; try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch(e){} },
  upgrade(){
    const raw = this.raw();
    if ((raw.v || 1) >= STORE_V) return false;
    try {
      if (Object.keys(raw).length && !localStorage.getItem("veldcasus:backup-v1")) localStorage.setItem("veldcasus:backup-v1", JSON.stringify(raw));
    } catch(e){}
    this.set(migrate(raw)); return true;
  }
};

/* Eén plaat in het veldboek samenvoegen met een andere: nooit iets kwijtraken, het beste van beide houden. */
function mergeDexEntry(cur, e){
  cur = cur || { w:0, seen:0 };
  const out = { w: Math.max(+cur.w || 0, +e.w || 0), seen: Math.max(+cur.seen || 0, +e.seen || 0) };
  for (const k of ["b","bx"]){ const vals = [cur[k], e[k]].filter(x => typeof x === "number"); if (vals.length) out[k] = Math.min(...vals); }
  const fs = [cur.f, e.f].filter(x => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x)).sort(); if (fs.length) out.f = fs[0];
  const ks = new Set([].concat(cur.ks || [], e.ks || []).filter(x => Number.isInteger(x) && x >= 0)); if (ks.size) out.ks = [...ks].sort((a, b) => a - b);
  return out;
}
/* Een veldboek (op naam of op id) omzetten naar id's. Wat niet herkend wordt, gaat naar lost en blijft bewaard. */
function dexToIds(dex, lost){
  const out = {};
  for (const [key, e] of Object.entries(dex || {})){
    if (!e || typeof e !== "object") continue;
    const id = idOf(key);
    if (!id){ if (lost) lost[key] = e; continue; }
    if (e.seen > 0 && !e.ks) e.ks = [0];           // vóór versie 2 had elke soort één casus
    out[id] = mergeDexEntry(out[id], e);
  }
  return out;
}
/* Het veldboek op Nederlandse naam, voor oudere versies van de app die de voortgang uit Supabase ophalen. */
function dexToNames(dex){
  const out = {};
  for (const [id, e] of Object.entries(dex || {})){ const t = BY_ID.get(id); if (t){ const { ks, ...rest } = e; out[t.n] = rest; } }
  return out;
}

/* Een oudere versie van de app (bijvoorbeeld nog even uit de cache) kan in een opslag van versie 2 weer namen schrijven.
   Die worden hier alsnog omgezet, zodat er niets verloren gaat. */
function repair(st){
  const dexKeys = Object.keys(st.dex || {}), games = Object.values(st.games || {});
  if (dexKeys.every(k => BY_ID.has(k)) && games.every(g => !g || BY_ID.has(g.target))) return st;
  const out = Object.assign({}, st), lost = Object.assign({}, st.dexLost || {});
  out.dex = dexToIds(st.dex, lost);
  if (Object.keys(lost).length) out.dexLost = lost;
  out.games = {};
  for (const [key, g] of Object.entries(st.games || {})){
    const target = g && idOf(g.target); if (!target) continue;
    out.games[key] = Object.assign({}, g, { target, k: g.k || 0, guesses: (g.guesses || []).map(idOf).filter(Boolean) });
  }
  checkAwards(out, true);
  return out;
}

function migrate(st){
  if (!st || typeof st !== "object") st = {};
  if ((st.v || 1) >= STORE_V) return repair(st);
  const out = Object.assign({}, st, { v: STORE_V });
  const lost = Object.assign({}, st.dexLost || {});
  out.dex = dexToIds(st.dex, lost);
  if (Object.keys(lost).length) out.dexLost = lost;
  /* opgeslagen dagspellen: soortnamen worden id's, casus 1 */
  const games = {};
  for (const [key, g] of Object.entries(st.games || {})){
    if (!g || typeof g !== "object") continue;
    const target = idOf(g.target); if (!target) continue;
    games[key] = Object.assign({}, g, { target, k: g.k || 0, guesses: (g.guesses || []).map(idOf).filter(Boolean) });
  }
  out.games = games;
  out.recent = (st.recent || []).map(idOf).filter(Boolean);
  /* logboek: afgeronde dagcasussen van vóór versie 2 alvast invullen */
  out.log = Array.isArray(st.log) ? st.log.slice() : [];
  for (const [key, g] of Object.entries(games)){
    const m = key.match(/^d(\d+)(x?)$/); if (!m || g.status === "playing") continue;
    const day = +m[1], expert = !!m[2], t = BY_ID.get(g.target), twin = g.guesses.filter(n => n === t.twin).length;
    out.log.push({ t: START + day * DAY + 12 * 36e5, m: "daily", d: day, s: g.target, k: g.k, x: expert, w: g.status === "won",
                   p: Math.min(g.guesses.length - twin, MAX), c: g.revealed, tw: twin, oud: true });
  }
  out.log.sort((a, b) => a.t - b.t);
  /* titels en medailles die al behaald waren, met de datum van de laatste plaat die ervoor nodig was */
  out.awards = Object.assign({}, st.awards || {});
  checkAwards(out, true);
  return out;
}

/* ---------- titels en medailles ----------
   Een behaalde titel of medaille wordt bewaard en nooit meer afgenomen, ook niet als er later soorten bijkomen. */
const TITLES = { Z:"Keutelkoning", R:"Slangenbezweerder", A:"Poelenprofessor", F:"Kieuwenkenner", B:"Braakbalbaron", V:"Rupsenridder" };
const TITLE_ALL = "Veldheer van Vestigia";
function earnedNow(dex){
  const got = id => dex[id] && dex[id].w > 0, out = [];
  for (const g of Object.keys(TITLES)) if (TARGETS.filter(t => t.g === g).every(t => got(t.id))) out.push("T:" + g);
  if (TARGETS.every(t => got(t.id))) out.push("T:ALL");
  for (const t of MEDALS) if (got(t.id)) out.push("M:" + t.id);
  return out;
}
/* Voegt nieuw behaalde titels toe aan st.awards en geeft ze terug. Met fromDex wordt de datum uit het veldboek afgeleid. */
function checkAwards(st, fromDex){
  st.awards = st.awards || {};
  const dex = st.dex || {}, fresh = [];
  for (const k of earnedNow(dex)){
    if (st.awards[k]) continue;
    let date = isoDay(Date.now());
    if (fromDex){
      const ids = k === "T:ALL" ? TARGETS.map(t => t.id) : k.startsWith("T:") ? TARGETS.filter(t => t.g === k.slice(2)).map(t => t.id) : [k.slice(2)];
      const fs = ids.map(id => dex[id] && dex[id].f).filter(Boolean).sort();
      if (fs.length) date = fs[fs.length - 1];
    }
    st.awards[k] = date; fresh.push(k);
  }
  return fresh;
}
const earned = st => Object.keys(st.awards || {});

/* ---------- logboek ----------
   Elk afgerond spel, in elke modus. Hieruit worden later de prestaties berekend (stap 6 van het plan).
   t tijd · m modus · d dagnummer (alleen dagcasus) · s soort · k casus · x expert · w gewonnen · p pogingen · c waarnemingen · tw tweelinggokken */
const logKey = e => e.t + ":" + e.m + ":" + e.s + ":" + (e.x ? 1 : 0);
function mergeLog(a, b){
  const seen = new Set(), out = [];
  for (const e of [].concat(a || [], b || [])){
    if (!e || typeof e !== "object" || !e.t || !idOf(e.s)) continue;
    const x = Object.assign({}, e, { s: idOf(e.s) }), key = logKey(x);
    if (seen.has(key)) continue; seen.add(key); out.push(x);
  }
  return out.sort((p, q) => p.t - q.t);
}

/* ---------- vergelijken ---------- */
function cmpSet(g, t, k){
  const gv = g[k], tv = t[k];
  let cls = "no";
  if (gv[0] === tv[0]) cls = "ok";
  else if (tv.includes(gv[0]) || gv.includes(tv[0])) cls = "part";
  return { cls, main: LABELS[k][gv[0]], sec: gv.slice(1).map(x => LABELS[k][x]).join(", ") };
}
function cmpLen(g, t){
  const ratio = t.l / g.l;
  let cls = "no";
  if (ratio >= 0.85 && ratio <= 1/0.85) cls = "ok";
  const arrow = cls === "ok" ? "" : (t.l > g.l ? "↑" : "↓");
  const fmt = g.l >= 100 ? (g.l/100).toLocaleString("nl-NL",{maximumFractionDigits:1}) + " m" : g.l.toLocaleString("nl-NL") + " cm";
  return { cls, main: fmt, arrow };
}
function cmpReg(g, t){
  let cls = "no";
  if (g.r === t.r) cls = "ok";
  else if (g.r.startsWith("VR") && t.r.startsWith("VR")) cls = "part";
  return { cls, main: LABELS.r[g.r] };
}
function compare(g, t){
  return { h:cmpSet(g,t,"h"), a:cmpSet(g,t,"a"), v:cmpSet(g,t,"v"), b:cmpSet(g,t,"b"), w:cmpSet(g,t,"w"), l:cmpLen(g,t), r:cmpReg(g,t) };
}

/* ---------- tips: na elke foute gok één ding over de gezochte soort ----------
   Eerst een overeenkomst die nog niet genoemd is (gelijk, dan overlap), daarna een verschil (eerst de lengte).
   Hetzelfde feit over de gezochte soort komt nooit twee keer. Alles volgt alleen uit de soort en de volgorde
   van de gokken, dus wie dezelfde gokken doet, krijgt dezelfde tips. */
const TIP = {
  h: { BOS:"in bos", HALF:"in halfopen landschap", OPEN:"in open agrarisch gebied", HEI:"op heide en hoogveen", DUIN:"in duinen en op kaal zand",
       MOER:"in moeras en riet", STIL:"in en bij stilstaand water", STROOM:"in en bij stromend water", ZEE:"aan zee en de kust", BEB:"in bebouwd gebied" },
  a: { DAG:"overdag", SCHEMER:"in de schemering", NACHT:"'s nachts" },
  v: { PLANT:"plantaardig voedsel", ONG:"ongewervelden", VIS:"vis", GEW:"gewervelde dieren" },
  b: { HOL:"in een hol of burcht", BOOM:"in bomen of boomholtes", GEB:"in gebouwen of bouwwerken", VEG:"in de vegetatie",
       GROND:"op of in de bodem en het strooisel", WATER:"in het water", STEEN:"in muren of rotsen" },
  w: { ACT:"zijn in de winter actief", SLAAP:"houden een winterslaap of winterrust", TREK:"trekken in de winter weg" }
};
const TIP_W_EEN = { ACT:"is in de winter actief", SLAAP:"houdt een winterslaap of winterrust", TREK:"trekt in de winter weg" };
const TIP_W_SOMS = { ACT:"De gezochte soort is in de winter soms actief.", SLAAP:"De gezochte soort houdt soms een winterslaap of winterrust.", TREK:"Een deel van de gezochte soort trekt in de winter weg." };
const TIP_W_NIET = { ACT:"is in de winter niet actief", SLAAP:"houdt geen winterslaap of winterrust", TREK:"trekt in de winter niet weg" };
const deSoort = g => "de " + g.n.toLowerCase();
/* gelijk: beide hebben dezelfde hoofdwaarde */
function tipGelijk(k, g, t){
  const v = t[k][0];
  if (k === "h") return { f: `h=${v}`, k, txt: `Beide leven vooral ${TIP.h[v]}.` };
  if (k === "a") return { f: `a=${v}`, k, txt: `Beide zijn vooral ${TIP.a[v]} actief.` };
  if (k === "v") return { f: `v=${v}`, k, txt: `Beide eten vooral ${TIP.v[v]}.` };
  if (k === "b") return { f: `b=${v}`, k, txt: `Beide verblijven vooral ${TIP.b[v]}.` };
  if (k === "w") return { f: `w=${v}`, k, txt: `Beide ${TIP.w[v]}.` };
  if (k === "l") return { f: "l=", k, txt: `De gezochte soort is ongeveer even groot als ${deSoort(g)}.` };
  if (k === "r") return { f: `r=${t.r}`, k, txt: `Beide hebben dezelfde beschermingsstatus: ${LABELS.r[t.r]}.` };
}
/* overlap: de hoofdwaarde van de ene soort komt ook voor bij de andere */
function tipOverlap(k, g, t){
  if (k === "r") return { f: "r~VR", k, txt: "Beide vallen onder de Vogelrichtlijn, maar niet in dezelfde categorie." };
  const gv = g[k][0], tv = t[k][0];
  if (t[k].includes(gv)){
    const x = { h: `De gezochte soort komt ook ${TIP.h[gv]} voor.`, a: `De gezochte soort is soms ook ${TIP.a[gv]} actief.`,
                v: `De gezochte soort eet ook ${TIP.v[gv]}.`, b: `De gezochte soort verblijft soms ook ${TIP.b[gv]}.`, w: TIP_W_SOMS[gv] }[k];
    return { f: `${k}+${gv}`, k, txt: x };
  }
  const x = { h: `De gezochte soort leeft vooral ${TIP.h[tv]}; daar komt ${deSoort(g)} ook voor.`, a: `De gezochte soort is vooral ${TIP.a[tv]} actief; ${deSoort(g)} soms ook.`,
              v: `De gezochte soort eet vooral ${TIP.v[tv]}; ${deSoort(g)} ook, maar minder.`, b: `De gezochte soort verblijft vooral ${TIP.b[tv]}; ${deSoort(g)} soms ook.`,
              w: `De gezochte soort ${TIP_W_EEN[tv]}; ${deSoort(g)} soms ook.` }[k];
  return { f: `${k}=${tv}`, k, txt: x };
}
/* verschil: wat de gezochte soort niet is */
function tipVerschil(k, g, t){
  if (k === "l") return { f: `l${t.l > g.l ? ">" : "<"}${g.l}`, k, txt: `De gezochte soort is ${t.l > g.l ? "groter" : "kleiner"} dan ${deSoort(g)}.` };
  if (k === "r") return { f: `r!${g.r}`, k, txt: `De gezochte soort heeft een andere beschermingsstatus dan ${deSoort(g)}.` };
  const gv = g[k][0];
  const x = { h: `De gezochte soort leeft niet vooral ${TIP.h[gv]}.`, a: `De gezochte soort is niet vooral ${TIP.a[gv]} actief.`,
              v: `De gezochte soort eet niet vooral ${TIP.v[gv]}.`, b: `De gezochte soort verblijft niet vooral ${TIP.b[gv]}.`, w: `De gezochte soort ${TIP_W_NIET[gv]}.` }[k];
  return { f: `${k}!${gv}`, k, txt: x };
}
/* één regel per gok: { id, soort: "goed" | "tweeling" | "tip", tip } */
function tipsVoor(targetId, guesses){
  const t = BY_ID.get(targetId), bekend = new Set(), uit = [];
  let fout = 0;
  for (const id of guesses){
    const g = BY_ID.get(id);
    if (id === targetId){ uit.push({ id, soort: "goed" }); continue; }
    if (t.twin === id){ uit.push({ id, soort: "tweeling" }); continue; }
    const c = compare(g, t);
    const volg = COLS.map((k, i) => COLS[(i + fout * 3) % COLS.length]);          // per gok een andere volgorde
    const kand = [].concat(
      volg.filter(k => c[k].cls === "ok").map(k => tipGelijk(k, g, t)),
      volg.filter(k => c[k].cls === "part").map(k => tipOverlap(k, g, t)),
      c.l.cls === "no" ? [tipVerschil("l", g, t)] : [],
      volg.filter(k => k !== "l" && c[k].cls === "no").map(k => tipVerschil(k, g, t)));
    const tip = kand.find(x => !bekend.has(x.f)) || { f: null, k: null, txt: `Geen nieuwe overeenkomst met ${deSoort(g)}.` };
    if (tip.f) bekend.add(tip.f);
    uit.push({ id, soort: "tip", tip });
    fout++;
  }
  return uit;
}
