/* Vestigia – controlescript. Draai dit vóór elke release en na elke wijziging in de soortdata:
     node tools/controle.mjs              controle; stopt met een foutcode als er iets mis is
     node tools/controle.mjs --woorden    toont ook alle woorden die maar bij één soort voorkomen
     node tools/controle.mjs --vastleggen legt id's, platennummers, aantallen casussen en het dagschema vast
                                          (doe dit bij elke release, nadat de controle groen is)
   FOUT = moet opgelost worden. LET OP = nakijken. INFO = ter kennisname. */
import fs from "fs";
import path from "path";
import { laad, ROOT } from "./laad.mjs";

const args = new Set(process.argv.slice(2));
const V = laad();
const fouten = [], letop = [], info = [];
const FOUT = m => fouten.push(m), LETOP = m => letop.push(m), INFO = m => info.push(m);
const { SPECIES, TARGETS, LABELS, GROUPS, RARITY, ALIASES, BY_ID } = V;
const naam = id => (BY_ID.get(id) || {}).n || id;

/* ---------- 1. velden en labels ---------- */
const seen = { id: new Map(), n: new Map(), s: new Map(), no: new Map() };
for (const t of SPECIES){
  const wie = t.n || t.id || "(soort zonder naam)";
  if (!t.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id)) FOUT(`${wie}: id ontbreekt of bevat andere tekens dan kleine letters, cijfers en streepjes`);
  for (const k of ["id","n","s"]){ if (seen[k].has(t[k])) FOUT(`${wie}: ${k} "${t[k]}" komt twee keer voor`); seen[k].set(t[k], t); }
  if (!GROUPS[t.g]) FOUT(`${wie}: onbekende diergroep "${t.g}"`);
  if (!LABELS.r[t.r]) FOUT(`${wie}: onbekend regime "${t.r}"`);
  if (!(typeof t.l === "number" && t.l > 0)) FOUT(`${wie}: lengte ontbreekt`);
  for (const k of ["h","a","v","b","w"]){
    if (!Array.isArray(t[k]) || !t[k].length) { FOUT(`${wie}: kenmerk ${k} ontbreekt`); continue; }
    for (const x of t[k]) if (!LABELS[k][x]) FOUT(`${wie}: onbekend label ${k}:${x}`);
    if (new Set(t[k]).size !== t[k].length) FOUT(`${wie}: label dubbel in ${k}`);
  }
  if (t.zz !== null && t.zz !== undefined && !RARITY[t.zz]) FOUT(`${wie}: onbekende zeldzaamheidsklasse "${t.zz}"`);
  if (t.twin){ if (!BY_ID.has(t.twin)) FOUT(`${wie}: tweelingsoort "${t.twin}" bestaat niet`); else if (t.twin === t.id) FOUT(`${wie}: is zijn eigen tweelingsoort`); }
  const doel = !!(t.cs && t.cs.length);
  if (!doel){
    if (t.no !== null && t.no !== undefined) FOUT(`${wie}: heeft een platennummer maar geen casus`);
    if (t.cs && !t.cs.length) FOUT(`${wie}: cs is leeg; laat het veld weg tot er een casus is`);
    continue;
  }
  /* soorten met een casus */
  if (!Number.isInteger(t.no) || t.no < 1) FOUT(`${wie}: platennummer (no) ontbreekt`);
  else { if (seen.no.has(t.no)) FOUT(`${wie}: platennummer ${t.no} is ook van ${seen.no.get(t.no).n}`); seen.no.set(t.no, t); }
  if (!t.x || !BY_ID.has(t.x)) FOUT(`${wie}: verwarringssoort (x) "${t.x}" bestaat niet`);
  else if (t.x === t.id) FOUT(`${wie}: is zijn eigen verwarringssoort`);
  if (!t.t || t.t.trim().length < 20) FOUT(`${wie}: onderscheidstekst (t) ontbreekt of is erg kort`);
  t.cs.forEach((c, k) => {
    const cn = `${wie}, casus ${k + 1}`;
    if (!c || !Array.isArray(c.wn) || c.wn.length !== 5) { FOUT(`${cn}: moet precies vijf waarnemingen hebben`); return; }
    c.wn.forEach((w, i) => { if (typeof w !== "string" || w.trim().length < 10) FOUT(`${cn}: waarneming ${i + 1} is leeg of erg kort`); });
    if (V.caseMonth(c) < 0) FOUT(`${cn}: waarneming 1 noemt geen maand, dus deze casus kan nooit dagcasus worden`);
    if (k > 0 && !(c.bron && String(c.bron).trim())) FOUT(`${cn}: bron ontbreekt (verplicht voor nieuwe casussen)`);
    if (c.wn.some(w => new RegExp("\\b" + t.n.toLowerCase().split(" ").pop() + "\\b", "i").test(w))) LETOP(`${cn}: de soortnaam staat in een waarneming`);
  });
}
for (const [oud, id] of Object.entries(ALIASES)){
  if (!BY_ID.has(id)) FOUT(`ALIASES: "${oud}" wijst naar onbekende id "${id}"`);
  if (V.BY_NAME.has(oud)) FOUT(`ALIASES: "${oud}" is ook de naam van een huidige soort`);
}
const nos = TARGETS.map(t => t.no).filter(Number.isInteger).sort((a, b) => a - b);
if (nos.length && nos[nos.length - 1] !== nos.length) LETOP(`Platennummers lopen niet aaneengesloten van 1 tot ${nos.length} (hoogste is ${nos[nos.length - 1]})`);

/* ---------- 2. niets mag verschuiven ten opzichte van wat al live staat ---------- */
const VAST = path.join(ROOT, "tools/vastgelegd.json");
const vast = fs.existsSync(VAST) ? JSON.parse(fs.readFileSync(VAST, "utf8")) : null;
if (!vast) LETOP("tools/vastgelegd.json bestaat nog niet; maak hem met --vastleggen");
else {
  const maxNo = Math.max(0, ...Object.values(vast.soorten).map(x => x.no || 0));
  for (const [id, x] of Object.entries(vast.soorten)){
    const t = BY_ID.get(id);
    if (!t){ FOUT(`Soort "${id}" (${x.n}) is verdwenen; een id mag nooit weg, anders raken spelers hun plaat kwijt`); continue; }
    if (x.no && t.no !== x.no) FOUT(`${t.n}: platennummer veranderd van ${x.no} naar ${t.no}`);
    if ((t.cs || []).length < x.casussen) FOUT(`${t.n}: er zijn casussen verwijderd (was ${x.casussen}); casussen mogen alleen achteraan bijkomen`);
    if (x.n !== t.n && ALIASES[x.n] !== id) LETOP(`${t.n}: heette eerst "${x.n}"; zet die oude naam in ALIASES`);
  }
  for (const t of TARGETS) if (!vast.soorten[t.id] || !vast.soorten[t.id].no){
    if (t.no <= maxNo) FOUT(`${t.n}: nieuwe plaat moet achteraan komen (nummer hoger dan ${maxNo})`);
    else INFO(`Nieuwe plaat: nº ${t.no} ${t.n}`);
  }
  const ds = vast.dagschema || [];
  for (let i = 0; i < ds.length; i++) if (V.DAGSCHEMA[i] !== ds[i]){ FOUT(`Dagschema: dag ${i} is veranderd (${ds[i]} → ${V.DAGSCHEMA[i] || "weg"}); vastgelegde dagen mogen nooit veranderen`); break; }
}

/* ---------- 3. dagschema ---------- */
if (V.DAILY_FIXED < V.DAGSCHEMA.length) FOUT(`Dagschema: dag ${V.DAILY_FIXED} (${V.DAGSCHEMA[V.DAILY_FIXED]}) verwijst naar een onbekende soort of casus`);
const nu = new Date(), vandaag = Math.round((Date.UTC(nu.getFullYear(), nu.getMonth(), nu.getDate()) - V.START) / V.DAY);
const vooruit = V.DAGSCHEMA.length - 1 - vandaag;
const tot = new Date(V.START + (V.DAGSCHEMA.length - 1) * V.DAY).toISOString().slice(0, 10);
if (vooruit < 7) FOUT(`Dagschema loopt nog maar ${vooruit} dagen vooruit (tot ${tot}); vul aan met node tools/dagschema.mjs`);
else if (vooruit < 30) LETOP(`Dagschema loopt nog ${vooruit} dagen vooruit (tot ${tot}); vul binnenkort aan`);
else INFO(`Dagschema: ${V.DAGSCHEMA.length} dagen vast, tot en met ${tot} (${vooruit} dagen vooruit)`);
let buiten = 0;
V.DAGSCHEMA.slice(0, V.DAILY_FIXED).forEach((e, i) => {
  const [id, k] = e.split("#"), m = V.caseMonth(BY_ID.get(id).cs[(+k || 1) - 1]), dm = new Date(V.START + i * V.DAY).getUTCMonth();
  if (Math.min((m - dm + 12) % 12, (dm - m + 12) % 12) > 1) buiten++;
});
if (buiten) INFO(`Dagschema: ${buiten} dagen hebben een casus buiten het seizoen (er waren toen te weinig casussen voor die maand)`);
const perMaand = V.MONTHS.map((mn, m) => [mn, TARGETS.filter(t => t.cs.some(c => { const cm = V.caseMonth(c); return cm >= 0 && Math.min((cm - m + 12) % 12, (m - cm + 12) % 12) <= 1; })).length]);
const krap = perMaand.filter(([, n]) => n < 22);
if (krap.length) LETOP(`Te weinig soorten voor een seizoensdagcasus zonder herhaling binnen drie weken (minstens 22 nodig) in: ${krap.map(([m, n]) => `${m} (${n})`).join(", ")}`);
INFO(`Soorten per maand (± 1 maand) voor de dagcasus: ${perMaand.map(([m, n]) => m.slice(0, 3) + " " + n).join(" · ")}`);

/* ---------- 4. inhoud: tweelingen, zeldzaamheid, bronnen, profielen ---------- */
const zonderZz = TARGETS.filter(t => !t.zz);
if (zonderZz.length) LETOP(`Zeldzaamheidsklasse nog niet bepaald voor ${zonderZz.length} van de ${TARGETS.length} soorten met casus (nodig voor medailles en avatarprijzen)`);
INFO(`Medaillesoorten (klasse ZZ): ${V.MEDALS.map(t => t.n).join(", ")}`);
const zonderBron = TARGETS.filter(t => !(t.cs[0].bron && String(t.cs[0].bron).trim())).length;
if (zonderBron) INFO(`Casus 1 zonder vastgelegde bron: ${zonderBron} soorten (geschreven vóór het bronveld bestond)`);
const eenrichting = SPECIES.filter(t => t.twin && BY_ID.get(t.twin) && BY_ID.get(t.twin).twin !== t.id);
if (eenrichting.length) LETOP(`Tweelingsoort in één richting (klopt dat?): ${eenrichting.map(t => `${t.n} → ${naam(t.twin)}`).join("; ")}`);
const lenOk = (p, q) => { const r = p.l / q.l; return r >= 0.85 && r <= 1 / 0.85; };
const hoofd = t => ["h","a","v","b","w"].map(k => t[k][0]).join("|");
const vol = t => ["h","a","v","b","w"].map(k => t[k].slice().sort().join("+")).join("|") + "|" + t.r;
const kand = [], gelijk = [];
for (let i = 0; i < SPECIES.length; i++) for (let j = i + 1; j < SPECIES.length; j++){
  const p = SPECIES[i], q = SPECIES[j];
  if (p.g !== q.g || !lenOk(p, q)) continue;
  if (hoofd(p) === hoofd(q) && p.twin !== q.id && q.twin !== p.id && (p.cs || q.cs)) kand.push(`${p.n} – ${q.n}`);
  if (p.cs && q.cs && vol(p) === vol(q)) gelijk.push(`${p.n} – ${q.n}`);
}
if (kand.length) LETOP(`Mogelijke tweelingsoorten (zelfde hoofdkenmerken en lengte, nog niet als tweeling ingesteld): ${kand.join("; ")}`);
if (gelijk.length) INFO(`Identiek kenmerkenprofiel, ook met nevenwaarden (telt in het kenmerken-raadsel allebei als goed): ${gelijk.join("; ")}`);

/* ---------- 5. verraderwoorden ---------- */
const STOP = new Set(("aan alle als bij dan dat die dit door een eens elke en er een geen het hier hij hun in is je kan langs maar met na naar niet nog of om onder op over tegen tot tussen uit van veel voor waar wat wel zijn ze zich zo zonder ook meer twee drie vier vijf eerste vooral").split(" "));
const words = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z\s-]/g, " ").split(/\s+/).filter(w => w.length >= 5 && !STOP.has(w) && !V.MONTHS.includes(w));
const wordSpecies = new Map(), wordCases = new Map();
for (const t of TARGETS) t.cs.forEach((c, k) => { for (const w of new Set(c.wn.flatMap(words))){
  (wordSpecies.get(w) || wordSpecies.set(w, new Set()).get(w)).add(t.id);
  (wordCases.get(w) || wordCases.set(w, new Set()).get(w)).add(t.id + "#" + k);
}});
const uniek = [...wordSpecies].filter(([, s]) => s.size === 1);
const sterk = uniek.filter(([w]) => wordCases.get(w).size > 1);
for (const [w, s] of sterk) LETOP(`Verraderwoord "${w}" staat in meerdere casussen van ${naam([...s][0])} en nergens anders`);
INFO(`${uniek.length} woorden komen maar bij één soort voor${args.has("--woorden") ? "" : " (lijst: --woorden)"}`);
if (args.has("--woorden")){
  const per = new Map();
  for (const [w, s] of uniek){ const id = [...s][0]; (per.get(id) || per.set(id, []).get(id)).push(w); }
  for (const t of TARGETS) if (per.get(t.id)) console.log(`  ${t.n}: ${per.get(t.id).sort().join(", ")}`);
}

/* ---------- 6. app en database ---------- */
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8"), html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const stamp = (sw.match(/const VERSION = "vestigia-([^"]+)"/) || [])[1];
const refs = [...html.matchAll(/(?:src|href)="([\w/.-]+)\?v=([\w-]+)"/g)];
const assets = JSON.parse((sw.match(/const ASSETS = (\[[^\]]*\])/) || [, "[]"])[1].replace(/\s+/g, " "));
if (refs.some(r => r[2] !== stamp)) FOUT(`Versienummer achter de bestanden in index.html is niet gelijk aan VERSION in sw.js; draai node tools/versie.mjs`);
const refSet = new Set(refs.map(r => r[1]));
if (assets.length !== refSet.size || assets.some(a => !refSet.has(a))) FOUT(`ASSETS in sw.js (${assets.join(", ")}) komt niet overeen met de bestanden in index.html (${[...refSet].join(", ")})`);
for (const f of refSet) if (!fs.existsSync(path.join(ROOT, f))) FOUT(`index.html verwijst naar ${f}, maar dat bestand bestaat niet`);
if (TARGETS.length > 100) FOUT(`Er zijn ${TARGETS.length} soorten met casus, maar save_progress kapt het aantal platen af op 100. Verhoog die grens eerst in Supabase (zie het plan, knelpunt 4)`);
const trofeeen = Object.keys(V.TITLES).length + 1 + V.MEDALS.length;
if (trofeeen > 11) FOUT(`Er zijn ${trofeeen} titels en medailles, maar save_progress kapt het aantal trofeeën af op 11. Verhoog die grens eerst in Supabase`);

/* ---------- uitkomst ---------- */
const blok = (kop, lijst) => { if (lijst.length){ console.log(`\n${kop} (${lijst.length})`); for (const m of lijst) console.log("  · " + m); } };
console.log(`Vestigia-controle: ${SPECIES.length} soorten, ${TARGETS.length} met casus, ${TARGETS.reduce((n, t) => n + t.cs.length, 0)} casussen`);
blok("FOUT", fouten); blok("LET OP", letop); blok("INFO", info);

if (args.has("--vastleggen")){
  if (fouten.length){ console.log("\nNiet vastgelegd: los eerst de fouten op."); process.exit(1); }
  const out = { uitleg: "Wat live staat. Het controlescript bewaakt dat id's, platennummers, casussen en het dagschema nooit verschuiven. Bijwerken met: node tools/controle.mjs --vastleggen",
    vastgelegd: new Date().toISOString().slice(0, 10),
    soorten: Object.fromEntries(SPECIES.map(t => [t.id, { n: t.n, no: t.no || null, casussen: (t.cs || []).length }])),
    dagschema: V.DAGSCHEMA };
  /* wat al vastlag, blijft staan, ook als het nu ontbreekt (dan heeft de controle het al als fout gemeld) */
  if (vast) for (const [id, x] of Object.entries(vast.soorten)) if (!out.soorten[id]) out.soorten[id] = x;
  fs.writeFileSync(VAST, JSON.stringify(out, null, 1) + "\n");
  console.log(`\nVastgelegd in tools/vastgelegd.json (${Object.keys(out.soorten).length} soorten, ${out.dagschema.length} dagen).`);
}
console.log(fouten.length ? `\n${fouten.length} fout(en): niet live zetten.` : "\nGeen fouten.");
process.exit(fouten.length ? 1 : 0);
