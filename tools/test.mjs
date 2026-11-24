/* Vestigia – tests in een echte browser (fundament, 24 november 2026).
   Speelt de app zoals een speler: dagcasus, expert, oefenen, Vestiarium, menu en alle voorbeelden (?…=demo),
   op een telefoon (390 px) en een laptop, in licht en donker. Een test faalt bij een JavaScript-fout in de app,
   een foutmelding in de console of een controle die niet klopt.

   Gebruik:  node tools/test.mjs                 alle tests
             node tools/test.mjs dagcasus        alleen tests met ‘dagcasus’ in de naam
             node tools/test.mjs --beelden       ook schermafbeeldingen in test-uit/ (om zelf na te kijken)
             node tools/test.mjs --lijst         alleen de namen van de tests
   Nodig: Playwright (npm i -g playwright, en eenmalig npx playwright install chromium).

   Veilig: de tests praten NOOIT met Supabase. Alle verzoeken naar supabase.co worden geblokkeerd, dus er komt niets
   in de echte database (geen spelers, geen uitslagen, geen meldingen in app_fouten). De app gedraagt zich dan zoals
   bij een speler zonder internet. De datum staat vast (VANDAAG hieronder), zodat de dagcasus elke keer dezelfde is.

   Een test toevoegen: zet een blok in TESTS onderaan. Elke test krijgt een verse browser met lege opslag.
     naam      korte naam (Nederlands, zonder spaties: met streepjes)
     url       wat er achter het adres komt, bijv. "?duel=demo"
     op        apparaten: ["telefoon", "laptop"] (standaard beide)
     thema     ["licht"] (standaard) of ["licht", "donker"]
     datum     andere vaste datum, bijv. "2026-12-12T10:00:00" (met +01:00 erachter als het uur ertoe doet)
     tijdzone  tijdzone van het toestel, bijv. "Asia/Tokyo" (standaard Europe/Amsterdam)
     speler    true = bekende speler (welkom en uitleg al gezien); standaard true
     stappen   async (t) => { ... } met de hulpjes van t (zie maakHulp) */
import fs from "fs";
import http from "http";
import path from "path";
import { createRequire } from "module";
import { ROOT } from "./laad.mjs";

const VANDAAG = "2026-11-24T12:00:00";          // dag 18; verander alleen als een test dat nodig heeft
const APPARATEN = {
  telefoon: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  laptop:   { viewport: { width: 1366, height: 850 }, deviceScaleFactor: 1 }
};
const args = process.argv.slice(2), filter = args.find(a => !a.startsWith("--")) || "";
const BEELDEN = args.includes("--beelden"), UIT = path.join(ROOT, "test-uit");

/* ---------- Playwright vinden (zelfde manier als tools/avatarcontrast.mjs) ---------- */
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch(e){ try { ({ chromium } = require(path.join(process.env.NPM_GLOBAL || "/opt/npm-tools/node_modules", "playwright"))); }
  catch(e2){ console.error("Playwright ontbreekt: npm i -g playwright"); process.exit(1); } }

/* ---------- kleine webserver voor de map van de app ---------- */
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg" };
function server(){
  return new Promise(klaar => {
    const s = http.createServer((q, r) => {
      let p = decodeURIComponent(new URL(q.url, "http://x").pathname);
      if (p.endsWith("/")) p += "index.html";
      const f = path.join(ROOT, path.normalize(p));
      if (!f.startsWith(ROOT)){ r.writeHead(403); r.end(); return; }
      fs.readFile(f, (e, b) => {
        if (e){ r.writeHead(404); r.end(); return; }
        r.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); r.end(b);
      });
    }).listen(0, "127.0.0.1", () => klaar(s));
  });
}

/* ---------- hulpjes die een test kan gebruiken ---------- */
class Fout extends Error {}
function maakHulp(page, info){
  const t = {
    page, info,
    /* de app zelf: S, BY_ID, KIESBAAR … zijn gewone variabelen in de pagina */
    app: (fn, arg) => page.evaluate(fn, arg),
    zie: async (sel, wat) => {
      try { await page.locator(sel).first().waitFor({ state: "visible", timeout: 5000 }); }
      catch(e){ throw new Fout(`${wat || sel} staat niet in beeld`); }
    },
    nietZie: async (sel, wat) => {
      if (await page.locator(sel).first().isVisible().catch(() => false)) throw new Fout(`${wat || sel} staat in beeld, maar hoort weg te zijn`);
    },
    klopt: (ok, tekst) => { if (!ok) throw new Fout(tekst); },
    klik: async sel => { await page.locator(sel).first().click({ timeout: 5000 }); await page.waitForTimeout(250); },
    /* tabbalk onderin: "rank" (Ranglijst), "spelen" of "dex" (Vestiarium) */
    tab: async naam => { await page.locator(`#tabbar [data-tab="${naam}"]`).click({ timeout: 5000 }); await page.waitForTimeout(400); },
    /* de speelkring boven ‘Spelen’: "dag", "oefen" of "spelersduel" */
    speelkring: async bel => {
      await page.locator('#tabbar [data-tab="spelen"]').click(); await page.waitForTimeout(400);
      await page.locator(`#kringBellen [data-bel="${bel}"]`).click(); await page.waitForTimeout(500);
    },
    wacht: ms => page.waitForTimeout(ms),
    /* een soort intypen en bevestigen, zoals een speler dat doet */
    gok: async naam => {
      await page.locator("#gInput").fill(naam);
      await page.locator("#gInput").press("Enter");
      await page.waitForTimeout(300);
    },
    doel: () => page.evaluate(() => BY_ID.get(S.target).n),
    /* een foute soort: kiesbaar, niet de gezochte en geen tweeling ervan (anders gaan alle waarnemingen open) */
    fout: (n = 0) => page.evaluate(n => KIESBAAR.filter(s => s.id !== S.target && !isTwin(s.id) && !S.guesses.includes(s.id))[n * 7].n, n),
    stand: () => page.evaluate(() => ({ mode: S.mode, status: S.status, revealed: S.revealed, guesses: S.guesses.length, expert: !!S.expert })),
    /* pop-ups van de wachtrij (Nieuw in Vestigia, medailles …) wegklikken, zodat ze een test niet blokkeren */
    sluitPopups: async () => {
      for (let i = 0; i < 6; i++){
        const knop = page.locator([".pop:not([hidden]) button.later", "#awardPop:not([hidden]) button", "#wachtPop:not([hidden]) button",
          "#tweelingPop:not([hidden]) #tweelingOk", "#medPop:not([hidden]) #medPopSluit"].join(", ")).filter({ visible: true }).first();
        if (!(await knop.count())) return;
        await knop.click().catch(() => {}); await page.waitForTimeout(300);
      }
    },
    beeld: async naam => {
      if (!BEELDEN) return;
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(UIT, `${info.naam}--${naam}--${info.apparaat}-${info.thema}.png`) });
    }
  };
  return t;
}

/* ---------- één test op één apparaat in één thema ---------- */
async function draai(browser, base, test, apparaat, thema){
  const ctx = await browser.newContext(Object.assign({ colorScheme: thema === "donker" ? "dark" : "light", locale: "nl-NL",
    timezoneId: test.tijdzone || "Europe/Amsterdam", serviceWorkers: "block" }, APPARATEN[apparaat]));
  /* nooit naar de echte database */
  await ctx.route(/supabase\.co/, r => r.abort("internetdisconnected"));
  const fouten = [];
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);                                // niets in deze app hoort langer dan 5 s te duren
  page.on("pageerror", e => fouten.push("JavaScript-fout: " + e.message));
  /* een bestand van de app zelf dat ontbreekt (404), bijv. een vergeten script of plaatje */
  page.on("response", r => { if (r.status() >= 400 && r.url().startsWith(base)) fouten.push(`Ontbreekt (${r.status()}): ${r.url().slice(base.length)}`); });
  page.on("console", m => {
    if (m.type() !== "error") return;
    const tekst = m.text();
    if (/Failed to load resource|ERR_INTERNET_DISCONNECTED|supabase\.co/.test(tekst)) return;   // geblokkeerde database
    fouten.push("Console: " + tekst);
  });
  await page.clock.install({ time: new Date(test.datum || VANDAAG) });
  if (test.speler !== false) await page.addInitScript(() => {
    if (sessionStorage.getItem("test:klaar")) return;         // alleen bij de eerste keer laden, niet na herladen
    sessionStorage.setItem("test:klaar", "1");
    for (const k of ["vestigia:tutorial", "vestigia:nav-b", "vestigia:welcomeLater", "vestigia:welcomeLater:app"]) localStorage.setItem(k, "1");
  });
  const info = { naam: test.naam, apparaat, thema };
  const t = maakHulp(page, info);
  let fout = null;
  try {
    await page.goto(base + "/" + (test.url || ""), { waitUntil: "load" });
    await page.waitForTimeout(1500);                           // openingsanimatie en wachtrij
    await t.sluitPopups();
    if (test.stappen) await test.stappen(t);
    await page.waitForTimeout(300);
  } catch(e){
    const regels = String(e && e.message || e).split("\n");
    fout = e instanceof Fout ? e.message : (regels.filter(r => /intercepts|waiting for|Timeout/.test(r)).slice(0, 3).join(" · ") || regels[0] || "onbekende fout");
    if (BEELDEN) await page.screenshot({ path: path.join(UIT, `${test.naam}--FOUT--${apparaat}-${thema}.png`) }).catch(() => {});
  }
  await ctx.close();
  return [fout, ...fouten].filter(Boolean);
}

/* =====================================================================================================
   DE TESTS
   ===================================================================================================== */
const DEMO = ["apparaat", "boost", "dubbel", "duel", "dwaalgast", "kerst", "levels", "maand", "prestatie", "push", "veldweek", "vesti", "week"];
const TESTS = [
  { naam: "opstarten", thema: ["licht", "donker"], stappen: async t => {
      await t.zie("#gameView", "het spelscherm"); await t.zie("#tabbar", "de tabbalk"); await t.zie("#gInput", "het invoerveld");
      const s = await t.stand(); t.klopt(s.mode === "daily" && s.status === "playing", `dagcasus hoort klaar te staan, maar is ${s.mode}/${s.status}`);
      await t.beeld("start");
  } },

  { naam: "nieuwe-speler-welkom-en-uitleg", speler: false, stappen: async t => {
      await t.zie(".wk-door", "het welkom (‘Doorgaan’)");
      await t.beeld("welkom");
      await t.klik(".wk-door");
      /* de rondleiding (js/uitleg.js): vijf stappen met ‘Volgende’, de laatste heet ‘Aan de slag’ */
      for (let i = 0; i < 5; i++){
        await t.zie(".ui-volgende", `stap ${i + 1} van de uitleg`);
        if (i === 1) await t.beeld("uitleg-stap2");
        await t.klik(".ui-volgende"); await t.wacht(300);
      }
      await t.nietZie(".ui-volgende", "de uitleg na ‘Aan de slag’");
      t.klopt(await t.app(() => localStorage.getItem("vestigia:tutorial")), "de uitleg is niet als gezien bewaard");
      await t.sluitPopups();
      await t.zie("#gInput", "het invoerveld na de uitleg");
  } },

  { naam: "dagcasus-klassiek-goed", thema: ["licht", "donker"], stappen: async t => {
      await t.gok(await t.fout(0));
      let s = await t.stand();
      t.klopt(s.revealed === 2 && s.status === "playing", `na één foute gok horen 2 waarnemingen open te staan (nu ${s.revealed})`);
      await t.gok(await t.doel());
      s = await t.stand(); t.klopt(s.status === "won", "de juiste soort is niet goedgerekend");
      await t.sluitPopups();
      await t.zie("#resultWrap", "de uitslag");
      /* update 64: tabbladen in de onderlaag */
      for (const tab of ["Over de soort", "Jouw casus", "Je cijfers"]){
        await t.page.locator("#resultWrap button", { hasText: tab }).first().click(); await t.wacht(200);
      }
      await t.beeld("uitslag");
      /* na herladen blijft de dagcasus gespeeld (en de andere modus op slot) */
      await t.page.reload(); await t.wacht(1500); await t.sluitPopups();
      s = await t.stand(); t.klopt(s.status === "won", "na herladen is de gespeelde dagcasus weer open");
  } },

  { naam: "dagcasus-klassiek-verloren", stappen: async t => {
      for (let i = 0; i < 5; i++) await t.gok(await t.fout(i));
      const s = await t.stand(); t.klopt(s.status === "lost", `na 5 foute gokken hoort de casus verloren te zijn (nu ${s.status})`);
      await t.sluitPopups();
      await t.zie("#resultWrap", "de uitslag");
      await t.beeld("verloren");
  } },

  { naam: "dagcasus-expert-vangnet", stappen: async t => {
      await t.klik("#modeExpert"); await t.sluitPopups();
      let s = await t.stand(); t.klopt(s.expert, "expert staat niet aan");
      await t.gok(await t.fout(0));
      s = await t.stand(); t.klopt(s.status === "playing" && s.revealed === 5, "na een foute expertgok hoort het vangnet open te gaan (alles open, nog één gok)");
      await t.gok(await t.doel());
      s = await t.stand(); t.klopt(s.status === "won", "de vangnetgok is niet goedgerekend");
      const punten = await t.app(() => points()); t.klopt(punten === 1, `vangnet hoort 1 punt te geven, niet ${punten}`);
  } },

  /* tweelingsoort (bijv. bosmuis / grote bosmuis): alle waarnemingen gaan open en de gok telt niet als poging.
     De dagcasus van VANDAAG heeft geen tweeling, dus deze test speelt een oefencasus met een soort die er wel een heeft. */
  { naam: "tweelingsoort", stappen: async t => {
      await t.speelkring("oefen"); await t.sluitPopups();
      const tw = await t.app(() => {
        const doel = TARGETS.find(s => s.twin && BY_ID.get(s.twin) && KIESBAAR.includes(BY_ID.get(s.twin)));
        S = newGame("free", false, doel.id, 0, 0); render();
        return BY_ID.get(doel.twin).n;
      });
      await t.gok(tw);
      const s = await t.stand();
      t.klopt(s.revealed === 5 && s.status === "playing", `na de tweelingsoort horen alle waarnemingen open te staan en hoort de casus door te gaan (nu ${s.revealed}, ${s.status})`);
      t.klopt(await t.app(() => usedTries()) === 0, "de tweelinggok telde als poging");
      await t.beeld("tweeling");
  } },

  /* update 111: de uitslag van de dagcasus mag niet blijven staan als je daarna gaat oefenen */
  { naam: "oefenen-na-dagcasus-geen-oude-uitslag", stappen: async t => {
      await t.gok(await t.doel()); await t.sluitPopups();
      await t.zie("#resultWrap", "de uitslag van de dagcasus");
      /* de uitslag een tweede keer laten tekenen (naar het Vestiarium en terug), zoals bij de fout van 23 november */
      await t.tab("dex"); await t.sluitPopups();
      await t.speelkring("dag"); await t.sluitPopups();
      await t.speelkring("oefen"); await t.wacht(400); await t.sluitPopups();
      const s = await t.stand(); t.klopt(s.mode === "free" && s.status === "playing", "oefenen is niet gestart");
      await t.nietZie("#resultWrap", "de oude uitslag");
      await t.gok(await t.fout(0));
      await t.zie("#tipList li, #gridBody tr, #gridCards > *", "de vergelijking van je gok");
      await t.beeld("oefenen");
  } },

  { naam: "vestiarium", thema: ["licht", "donker"], stappen: async t => {
      await t.gok(await t.doel()); await t.sluitPopups();
      await t.tab("dex"); await t.sluitPopups();
      await t.zie("#dexView", "het Vestiarium"); await t.zie("#dexGrid", "de platen");
      for (const w of ["Groot", "Compact"]){
        const b = t.page.locator("#dexWeerg .weergseg button", { hasText: w });
        if (await b.count()){ await b.click(); await t.wacht(200); }
      }
      await t.page.locator("#dexQ").fill("uil"); await t.wacht(300);
      await t.beeld("vestiarium");
  } },

  { naam: "ranglijst-zonder-internet", stappen: async t => {
      await t.tab("rank"); await t.sluitPopups();
      await t.zie("#rankView", "de ranglijst"); await t.beeld("ranglijst");
  } },

  { naam: "menu-en-statistieken", stappen: async t => {
      await t.klik("#menuBtn"); await t.zie("#menu", "het menu"); await t.beeld("menu");
      await t.klik("#menuStats"); await t.sluitPopups();
      await t.zie("#statsView", "de statistieken"); await t.beeld("statistieken");
  } },

  { naam: "spelregels", stappen: async t => {
      await t.klik("#menuBtn");
      const r = t.page.locator("#menu button, #menu a", { hasText: /Spelregels/ }).first();
      t.klopt(await r.count(), "geen knop ‘Spelregels’ in het menu");
      await r.click(); await t.wacht(300); await t.zie("#help", "de spelregels"); await t.beeld("spelregels");
  } },

  /* elk voorbeeld uit de README moet zonder fouten openen */
  ...DEMO.map(d => ({ naam: `voorbeeld-${d}`, url: `?${d}=demo` + (d === "kerst" ? "&dag=12" : ""), thema: ["licht", "donker"],
    datum: d === "kerst" ? "2026-12-12T10:00:00" : undefined,
    stappen: async t => { await t.wacht(1200); await t.beeld("voorbeeld"); await t.sluitPopups(); } })),

  /* het voorbeeld-duel (nepserver in de browser): via de speelkring naar het duelscherm, uitdaging aannemen, casus spelen */
  { naam: "duel-voorbeeld-spelen", url: "?duel=demo", thema: ["licht", "donker"], stappen: async t => {
      await t.speelkring("spelersduel"); await t.sluitPopups();       // eerst de uitleg bij het duel
      await t.zie("#duelView", "het duelscherm"); await t.wacht(500);
      /* in het voorbeeld daagt Joris je uit: pop-up met ‘Speel nu’ */
      await t.zie("#duelPop", "de pop-up met de uitdaging"); await t.beeld("uitdaging");
      await t.page.locator("#duelPop button", { hasText: /Speel nu/i }).first().click(); await t.wacht(600); await t.sluitPopups();
      let s = await t.stand(); t.klopt(s.mode === "duel", `de duelcasus is niet geopend (modus ${s.mode})`);
      await t.gok(await t.doel()); await t.sluitPopups();
      s = await t.stand(); t.klopt(s.status === "won", "de duelcasus is niet goedgerekend");
      await t.zie("#resultWrap", "de uitslag van de duelcasus");
      await t.beeld("duelcasus");
  } },

  { naam: "advent-december", datum: "2026-12-05T10:00:00", stappen: async t => {
      await t.wacht(800); await t.beeld("december"); await t.sluitPopups();
  } },

  /* ---------- bugjacht 24 november 2026 (BUGJACHT.md): elke gevonden fout krijgt een test die hem nabootst ---------- */

  /* B1: de app blijft over middernacht open. ‘Dagcasus’ hoort dan de casus van vandaag te geven, niet die van gisteren. */
  { naam: "dagcasus-na-middernacht", datum: "2026-11-24T23:58:00+01:00", op: ["telefoon"], stappen: async t => {
      await t.gok(await t.doel()); await t.sluitPopups();
      let s = await t.stand(); t.klopt(s.status === "won", "de dagcasus van 24 november is niet gewonnen");
      t.klopt(await t.app(() => S.caseNo - 1) === 18, "de test begint niet op dag 18 (24 november)");
      await t.page.clock.runFor(5 * 60 * 1000); await t.wacht(300); await t.sluitPopups();
      t.klopt(await t.app(() => todayIndex()) === 19, "na middernacht is het nog geen dag 19");
      await t.speelkring("dag"); await t.sluitPopups();
      const na = await t.app(() => ({ dag: S.caseNo - 1, status: S.status, mode: S.mode }));
      t.klopt(na.mode === "daily" && na.dag === 19 && na.status === "playing",
        `na middernacht hoort ‘Dagcasus’ de casus van 25 november te geven, maar het is dag ${na.dag} (${na.status})`);
  } },

  /* B2: een toestel in een andere tijdzone speelt dezelfde dagcasus als Nederland (zoals de server rekent).
     00:30 in Tokio op 25 november is 16:30 op 24 november in Nederland: dus nog de casus van 24 november (dag 18). */
  { naam: "dagcasus-andere-tijdzone", tijdzone: "Asia/Tokyo", datum: "2026-11-25T00:30:00+09:00", op: ["telefoon"], stappen: async t => {
      const r = await t.app(() => ({ dag: todayIndex(), caseNo: S.caseNo }));
      t.klopt(r.dag === 18 && r.caseNo === 19, `in Tokio hoort het nog dagcasus #19 (24 november in Nederland) te zijn, niet #${r.caseNo}`);
  } },

  /* B3: expert verloren: de uitslag noemt je gokken bij naam (eerst stond er de interne id, bijv. ‘(hamster)’) */
  { naam: "expert-verloren-namen", op: ["telefoon"], stappen: async t => {
      await t.klik("#modeExpert"); await t.sluitPopups();
      const a = await t.fout(0); await t.gok(a);
      const b = await t.fout(1); await t.gok(b);
      const s = await t.stand(); t.klopt(s.status === "lost", `na twee foute expertgokken hoort de casus verloren te zijn (nu ${s.status})`);
      await t.sluitPopups();
      const tekst = await t.page.locator("#resultCard").innerText();
      t.klopt(tekst.includes(a) && tekst.includes(b), `de uitslag noemt niet allebei je gokken (${a}, ${b})`);
      const ids = await t.app(() => S.guesses);
      t.klopt(!ids.some(id => tekst.includes(`(${id}`)), "de uitslag toont een interne id in plaats van de naam");
  } }
];

/* ---------- draaien ---------- */
if (args.includes("--lijst")){ for (const t of TESTS) console.log(t.naam); process.exit(0); }
if (BEELDEN) fs.mkdirSync(UIT, { recursive: true });
const gekozen = TESTS.filter(t => t.naam.includes(filter));
if (!gekozen.length){ console.error(`Geen test met ‘${filter}’ in de naam. Zie node tools/test.mjs --lijst`); process.exit(1); }
const s = await server(), base = `http://127.0.0.1:${s.address().port}`;
const browser = await chromium.launch(fs.existsSync("/usr/bin/google-chrome") ? { executablePath: "/usr/bin/google-chrome" } : {});
let goed = 0; const mis = [];
const begin = Date.now();
for (const test of gekozen) for (const apparaat of test.op || ["telefoon", "laptop"]) for (const thema of test.thema || ["licht"]){
  const fouten = await draai(browser, base, test, apparaat, thema);
  const label = `${test.naam} (${apparaat}, ${thema})`;
  if (fouten.length){ mis.push([label, fouten]); console.log(`✗ ${label}\n    ${[...new Set(fouten)].join("\n    ")}`); }
  else { goed++; console.log(`✓ ${label}`); }
}
await browser.close(); s.close();
console.log(`\n${goed} goed, ${mis.length} fout, in ${Math.round((Date.now() - begin) / 1000)} s.` + (BEELDEN ? ` Schermafbeeldingen in test-uit/.` : ""));
process.exit(mis.length ? 1 : 0);
