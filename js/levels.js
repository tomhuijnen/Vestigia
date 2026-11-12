/* Vestigia – levels en ervaringspunten (update 10, live vanaf maandag 16 november 2026)
   Ervaringspunten (XP) belonen leerhandelingen: determineren, een eerdere fout herstellen, een nieuwe soort
   ontdekken. De server rekent alles uit (xp_status, supabase-015), net als de eikels; de app bewaart een kopie
   om meteen iets te kunnen tonen. Vóór de startdatum blijft alles onzichtbaar, behalve met ?levels=demo.
   Waar je het ziet:
   · de rand om je avatar rechtsboven is een voortgangsring, met een levelbolletje linksonder (ook in de smalle kop,
     de ranglijst en Mijn profiel);
   · na een spel vliegt ‘+N XP’ de ring in en staat de opbouw in het resultaatblok, onder de soortinformatie;
   · level omhoog: een pop-up met wat het oplevert (eikels, een rang als ondertitel, bij 20, 40 … een hersteltoken);
   · de eerste keer: een pop-up ‘Je start op level N’ met uitlegblokjes erin (js/nieuw.js).
   In veldmodus is de XP na een spel een schatting (‘voorlopig’) tot de verbinding terug is. */
"use strict";

const Levels = (() => {
  const K = { stand: "vestigia:xp", gezien: "vestigia:xpLevelGezien" };
  const lees = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const zet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const demo = () => /[?&]levels=demo/.test(location.search);
  const speler = () => online.enabled ? online.player() : null;
  const rustig = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wacht = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- regels (gelijk aan supabase-023, update 28) ----------
     Level 1–8 kosten 100, 120 … 240 XP, daarna elk level 250 XP. Elk level levert 10 eikels op, en elke 20 levels
     50 extra, een nieuwe rang en een hersteltoken. */
  const RANGEN = [[1, "Stagiair"], [5, "Veldassistent"], [10, "Junior ecoloog"], [20, "Ecoloog"], [40, "Projectecoloog"],
                  [60, "Senior ecoloog"], [80, "Soortdeskundige"], [100, "Hoofdecoloog"], [120, "Expert-ecoloog"], [140, "Veldautoriteit"],
                  [160, "Wandelende veldgids"], [180, "Meesterecoloog"], [200, "Levende legende"]];
  const rangVan = l => RANGEN.filter(([n]) => n <= l).pop()[1];
  const eikelsVoor = l => 10 + (l % 20 === 0 ? 50 : 0);   // bij het bereiken van level l (mijlpaal elke 20 levels)
  const SOORT = { dagcasus: "Dagcasus", dagbonus: "Dagbonus", oefenen: "Oefencasus", herkansing: "Herkansing", nieuw: "Nieuwe soort",
                  dwaalgast: "Dwaalgast", minigame: "Minigame", advent: "Adventkalender" };
  const VOLGORDE = ["dagcasus", "dagbonus", "oefenen", "herkansing", "nieuw", "dwaalgast", "minigame", "advent"];
  const WEEKNAAM = { dagcasus: "Dagcasussen", dagbonus: "Dagbonus", oefenen: "Oefencasussen", herkansing: "Herkansingen", nieuw: "Nieuwe soorten",
                     dwaalgast: "Dwaalgasten", minigame: "Minigames", advent: "Adventkalender" };

  /* ---------- stand ---------- */
  let stand = speler() ? lees(K.stand) : null;
  const zichtbaar = () => !!(speler() && stand && (stand.actief || demo()));
  let haalBezig = null;
  function haal(){
    if (!speler()) return Promise.resolve(null);
    if (haalBezig) return haalBezig;
    const p = speler();
    haalBezig = online.rpc("xp_status", { p_id: p.id, p_key: p.key }).then(r => {
      const s = Array.isArray(r) ? r[0] : r; if (!s) return stand;
      s.t = Date.now(); stand = s; zet(K.stand, s);
      tekenOveral();
      return s;
    }).finally(() => { haalBezig = null; });
    return haalBezig;
  }
  const frac = s => s && s.stap ? Math.max(0, Math.min(1, s.in_level / s.stap)) : 0;

  /* ---------- de ring ---------- */
  /* rond een avatar (html van avatarSVG): ring met voortgang en een levelbolletje; cls = maat (groot, klein) */
  function ring(html, level, pct, cls){
    if (!level) return html;
    return `<span class="lvring ${cls || ""}" style="--p:${Math.round(pct)}%" aria-label="Level ${level}">${html}<span class="lvnr" aria-hidden="true">${level}</span></span>`;
  }
  const mijnRing = (html, cls) => zichtbaar() ? ring(html, stand.level, 100 * frac(stand), cls) : html;
  /* de knoppen rechtsboven (menu en smalle kop) */
  function knop(b){
    if (!b) return;
    const aan = zichtbaar();
    b.classList.toggle("metlevel", aan);
    let nr = b.querySelector(".lvnr");
    if (!aan){ if (nr) nr.remove(); b.style.removeProperty("--p"); return; }
    b.style.setProperty("--p", Math.round(100 * frac(stand)) + "%");
    if (!nr){ nr = document.createElement("span"); nr.className = "lvnr"; nr.setAttribute("aria-hidden", "true"); b.appendChild(nr); }
    nr.textContent = stand.level;
    const lab = b.getAttribute("aria-label") || "", basis = lab.replace(/ · level.*$/, "");
    b.setAttribute("aria-label", `${basis} · level ${stand.level}, ${Math.round(100 * frac(stand))} procent naar level ${stand.level + 1}`);
  }
  function tekenOveral(){
    ["menuBtn", "slimMenu"].forEach(id => knop($(id)));
    if (typeof Nieuw !== "undefined" && Nieuw.knoppen) Nieuw.knoppen();
    if (typeof VIEW !== "undefined" && VIEW === "profiel" && typeof Profiel !== "undefined") Profiel.herteken();
  }

  /* ---------- na een spel ---------- */
  let winst = null;     // { k, n, delen: [[soort, xp]], voor: stand vóór, na: stand na, voorlopig }
  const spelKey = () => S ? `${S.mode}:${S.caseNo || ""}:${S.target}:${S.expert ? 1 : 0}:${S.k || 0}` : "";
  const evKey = e => `${e.t}:${e.s}:${e.i || ""}`;
  /* schatting zonder verbinding (zonder herkansing; die rekent de server straks uit) */
  function schatting(){
    if (!S) return null;
    const won = S.status === "won", delen = [];
    if (S.mode === "daily"){
      if (eersteModus(store.get(), S.caseNo - 1) !== !!S.expert) return null;
      delen.push(["dagcasus", 10 + 5 * points()]);
      delen.push(["dagbonus", 5 * Math.min(7, Math.max(1, playStreak(store.get()).cur || 1))]);
    } else if (S.mode === "free") delen.push(["oefenen", won ? 10 : 3]);
    else return null;
    if (won && S.nieuwePlaat) delen.push(["nieuw", 10]);
    return delen;
  }
  async function naSpel(opts){
    if (!speler()) return;
    const voor = stand, key = spelKey();
    let na = null;
    try { na = await haal(); } catch(e){ na = null; }
    if (!na || !(na.actief || demo())){
      if (!na && voor && (voor.actief || demo())){
        const delen = schatting();
        if (delen){ winst = { k: key, n: delen.reduce((a, d) => a + d[1], 0), delen, voor, na: null, voorlopig: true }; toonInResultaat(); }
      }
      return;
    }
    let delen = [];
    if (voor && voor.recent){
      const oud = new Set(voor.recent.map(evKey));
      const t0 = (voor.recent[0] || {}).t || 0;
      for (const e of na.recent || []) if (!oud.has(evKey(e)) && e.t >= t0) delen.push([e.s, e.xp]);
    } else {
      const grens = Date.now() - 10 * 60000;
      for (const e of na.recent || []) if (e.t >= grens) delen.push([e.s, e.xp]);
    }
    const n = voor ? na.xp - voor.xp : delen.reduce((a, d) => a + d[1], 0);
    if (n <= 0) return;
    /* per soort optellen, in vaste volgorde */
    const som = {}; delen.forEach(([s, x]) => som[s] = (som[s] || 0) + x);
    winst = { k: key, n, delen: VOLGORDE.filter(s => som[s]).map(s => [s, som[s]]), voor, na };
    toonInResultaat();
    const blok = $("xpBlok");
    if (typeof uitslagScroll !== "undefined") await uitslagScroll;     // update 19b: eerst stilstaan, dan vliegen
    await vlieg(blok && !blok.hidden ? blok.querySelector(".xptot") : null, n, voor);
    /* stil (update 13): Profiel.naSpel toont level omhoog zelf, samen met prestaties en mijlpalen in één pop-up */
    if (opts && opts.stil) return levelSprong(na);
    naLevelOmhoog(voor, na);
  }
  /* het blok in het resultaat (spel.js zet <section id="xpBlok" hidden> klaar) */
  function toonInResultaat(){
    const blok = $("xpBlok"); if (!blok) return;
    if (!winst || winst.k !== spelKey() || !(zichtbaar() || winst.voorlopig)){ blok.hidden = true; return; }
    const s = winst.na || winst.voor, lvOmhoog = winst.na && winst.voor && winst.na.level > winst.voor.level;
    const nuF = frac(s), oudF = !winst.na ? nuF : lvOmhoog ? 0 : frac(winst.voor);
    blok.hidden = false;
    blok.innerHTML = `
      <div class="xpkop"><h3 class="caps">Ervaringspunten</h3><span class="xptot">+${winst.n} XP${winst.voorlopig ? ` <small>voorlopig</small>` : ""}</span></div>
      <div class="xpchips">${winst.delen.map(([k, x]) => `<span class="xpchip${k === "herkansing" ? " herk" : ""}">${k === "herkansing" ? `<b>${SOORT[k]}</b>` : SOORT[k] || k} +${x}</span>`).join("")}</div>
      ${s ? `<div class="xpregel"><span>${lvOmhoog ? `<b>Level ${s.level} bereikt!</b>` : `<b>Level ${s.level}</b> · nog ${s.stap - s.in_level} XP tot level ${s.level + 1}`}</span><span class="xptal">${s.in_level} / ${s.stap}</span></div>
      <span class="xpbalk" aria-hidden="true"><i class="erbij" style="width:${Math.round(100 * (winst.voorlopig ? Math.min(1, nuF + winst.n / s.stap) : nuF))}%"></i><i style="width:${Math.round(100 * oudF)}%"></i></span>` : ""}
      ${winst.delen.some(([k]) => k === "herkansing") ? `<p class="fine xpherk">Herkansing: deze soort had je eerder fout. Een fout herstellen levert extra op.</p>` : ""}
      ${winst.voorlopig ? `<p class="fine">Zonder verbinding is dit een schatting. Zodra je weer online bent, rekent de server het precies uit.</p>` : ""}`;
  }

  /* ---------- ‘+N XP’ vliegt de ring in ---------- */
  function ringKnop(){
    return [$("slimMenu"), $("menuBtn")].find(b => b && b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().bottom > 0
      && getComputedStyle(b).visibility !== "hidden" && b.offsetParent !== null) || $("menuBtn");
  }
  async function vlieg(van, n, voor){
    const b = ringKnop();
    if (!b || !zichtbaar()) return;
    if (rustig()){ tekenOveral(); return; }
    const r = b.getBoundingClientRect();
    /* een kopie van de knop boven alles (ook boven een donkere pop-up), met de oude stand */
    const spook = b.cloneNode(true);
    spook.removeAttribute("id"); spook.className = b.className + " xpspook"; spook.setAttribute("aria-hidden", "true"); spook.tabIndex = -1;
    spook.style.cssText = `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px; --p:${voor && voor.level === stand.level ? Math.round(100 * frac(voor)) : 0}%`;
    document.body.appendChild(spook);
    const lab = document.createElement("div");
    lab.className = "xpvlieg"; lab.textContent = `+${n} XP`;
    document.body.appendChild(lab);
    /* vanaf het XP-blok als dat in beeld is, anders vanuit het midden van het scherm */
    let a = van ? van.getBoundingClientRect() : null;
    if (!a || a.top < 0 || a.bottom > innerHeight) a = { left: innerWidth / 2 - 40, top: innerHeight * .45, width: 80, height: 30 };
    /* de ring volgt de pagina, ook als die tijdens de vlucht schuift (update 19) */
    const volg = volgDoel(spook, () => ringKnop().getBoundingClientRect(), q => [q.left + q.width / 2, q.top + q.height / 2]);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, [x1s, y1s] = volg.xy();
    const cx = (x0 + x1s) / 2 - 60, cy = Math.min(y0, y1s) - 80, duur = 950, t0 = performance.now();
    await new Promise(klaar => {
      const stap = nu => {
        const t = Math.min(1, (nu - t0) / duur), u = 1 - t, z = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const [x1, y1] = volg.xy();
        const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
        lab.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${t < .15 ? .8 + t * 4 : 1.4 - z * .9})`;
        lab.style.opacity = t > .9 ? String((1 - t) * 10) : "1";
        if (t < 1) return requestAnimationFrame(stap);
        klaar();
      };
      requestAnimationFrame(stap);
    });
    lab.remove();
    /* de ring loopt vol tot de nieuwe stand */
    knop(spook);
    spook.classList.add("veer");
    tekenOveral();
    await wacht(900);
    spook.classList.add("weg");
    await wacht(300);
    volg.stop(); spook.remove();
  }

  /* ---------- pop-ups: de start en level omhoog ---------- */
  const STER = `<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z"/></svg>`;
  const LINT = `<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17V7h12l4 5-4 5H4Z"/><path d="M8 12h6"/></svg>`;
  const eik = () => (typeof EIKEL !== "undefined" ? EIKEL.replace('width="16" height="16"', 'width="24" height="24"') : "");
  /* wat het bereiken van level b oplevert, vanaf level a */
  function buit(a, b){
    let eikels = 0; for (let l = a + 1; l <= b; l++) eikels += eikelsVoor(l);
    const rangen = RANGEN.filter(([n]) => n > a && n <= b && n > 1).map(([, r]) => r);
    let tokens = 0; for (let l = a + 1; l <= b; l++) if (l % 20 === 0) tokens++;
    return { eikels, rangen, tokens };
  }
  /* eik: zoveel eikels vliegen vanuit deze rij naar het saldo (alleen direct na een spel, zie Profiel.naSpel) */
  function rij(ic, kop, sub, eik){ return `<div class="lvbuit"${eik ? ` data-eik="${eik}"` : ""}>${ic}<span><b>${esc(kop)}</b><small>${esc(sub)}</small></span></div>`; }
  function popup(html, cls){
    return new Promise(klaar => {
      const pop = $("wachtPop"), body = $("wachtBody");
      body.innerHTML = html;
      pop.classList.add("levelpop"); if (cls) pop.classList.add(cls);
      const dicht = () => { pop.hidden = true; pop.classList.remove("levelpop", "lvstart", ...(cls ? [cls] : [])); document.removeEventListener("keydown", esc_, true); pop.removeEventListener("click", bg); klaar(); };
      const esc_ = e => { if (e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); dicht(); } };
      const bg = e => { if (e.target === pop) dicht(); };
      document.addEventListener("keydown", esc_, true); pop.addEventListener("click", bg);
      body.querySelector("#lvVerder").onclick = dicht;
      pop.hidden = false;
      body.querySelector("#lvVerder").focus({ preventScroll: true });
    });
  }
  const cirkel = l => `<div class="lvcirkel"><span class="caps">Level</span><b>${l}</b></div>`;
  function levelOmhoog(a, s, extra){
    const b = s.level, w = buit(a, b), nieuweRang = w.rangen.length ? w.rangen[w.rangen.length - 1] : null;
    const tok = s.tokens;
    return popup(`
      <span class="caps lvlabel">Level omhoog</span>
      ${cirkel(b)}
      <div class="lvtekst"><h2 id="wachtH">${nieuweRang ? `Je bent nu ${esc(nieuweRang)}` : `Je bent nu level ${b}`}</h2>
        <p>${nieuweRang ? "Een nieuwe rang. De ondertitel staat klaar in je profiel." : b - a > 1 ? `Je bent ${b - a} levels gestegen.` : `Goed bezig! Op naar level ${b + 1}.`}</p></div>
      <div class="lvbuitlijst">
        ${w.eikels ? rij(eik(), `${w.eikels} eikels`, "10 per level, en 50 extra bij level 20, 40, 60 enzovoort", w.eikels) : ""}
        ${w.rangen.map(r => rij(LINT, `Ondertitel ${r}`, "Niet te koop: alleen via je level")).join("")}
        ${w.tokens ? rij(herstelMunt(28), `${w.tokens === 1 ? "1 hersteltoken" : w.tokens + " hersteltokens"}`, `Alleen bij level 20, 40, 60 enzovoort. Je hebt er nu ${tok} van maximaal 2.`) : ""}
        ${extra || ""}
      </div>
      ${s.volgende_rang ? `<p class="fine lvvolgende">Volgende rang: ${esc(s.volgende_rang)} op level ${s.volgende_rang_level}</p>` : ""}
      <button class="btn" id="lvVerder">Verder</button>`);
  }
  function levelStart(s){
    const w = buit(1, s.level);
    const p = popup(`
      <span class="caps lvlabel">Nieuw in Vestigia</span>
      ${cirkel(s.level)}
      <div class="lvtekst"><h2 id="wachtH">Je start op level ${s.level}</h2>
        <p>Je ervaringspunten van de afgelopen dagen tellen mee: ${s.xp} XP. Je rang is <b>${esc(s.rang)}</b>.</p></div>
      <div class="lvzo" id="lvZo"><span class="caps">Zo verdien je XP</span>
        <dl><dt>Dagcasus</dt><dd>10 + 5 per punt</dd><dt>Dagbonus</dt><dd>5 per dag van je reeks, tot 35</dd>
        <dt>Oefencasus</dt><dd>10, niet gevonden 3</dd><dt>Herkansing</dt><dd>+15</dd><dt>Nieuwe soort</dt><dd>+10</dd><dt>Dwaalgast</dt><dd>+50</dd></dl></div>
      <div class="lvbuitlijst" id="lvBuit">
        ${w.eikels ? rij(eik(), `${w.eikels} eikels`, "voor de levels die je al haalde") : ""}
        ${s.level >= 5 ? rij(LINT, `Ondertitel ${s.rang}`, "staat klaar in Mijn profiel") : ""}
        ${w.tokens ? rij(herstelMunt(28), `${w.tokens === 1 ? "1 hersteltoken" : w.tokens + " hersteltokens"}`, "bij level 20, 40, 60 enzovoort") : ""}
      </div>
      <button class="btn" id="lvVerder">Begrepen</button>`, "lvstart");
    if (typeof Nieuw !== "undefined") Nieuw.blokjes("levels", [
      { na: $("wachtBody").querySelector(".lvcirkel"), tekst: "Met ervaringspunten (XP) stijg je in level. Je ziet je level voortaan in de ring om je avatar rechtsboven, en in de ranglijst." },
      { na: $("lvZo"), tekst: "Je verdient XP met leren: determineren, oefenen en nieuwe soorten ontdekken. Had je een soort eerder fout en heb je hem minstens een dag later goed? Dan krijg je 15 XP extra. Alleen spelen telt: alleen de app openen levert geen XP op." },
      { na: $("lvBuit"), tekst: "Elk level levert 10 eikels op. Bij level 5 en 10 krijg je je eerste rangen als ondertitel. Daarna is elke 20 levels een mijlpaal: 50 eikels extra, een nieuwe rang en een hersteltoken." }
    ], { altijd: demo(), wacht: 900 });
    return p;
  }
  /* na een spel of een adventvakje: is het level omhoog? Dan meteen, of anders bij de volgende start */
  function levelSprong(na){
    if (!na || !(na.actief || demo())) return null;
    const gezien = lees(K.gezien);
    if (gezien == null) return null;                  // de startpop-up komt eerst, via de wachtrij
    if (!(na.level > gezien)) return null;
    if (Wachtrij.ietsOpen()) return null;             // er staat iets in beeld: bij de volgende start
    zet(K.gezien, na.level);
    return { a: gezien, s: na, eikels: buit(gezien, na.level).eikels };
  }
  function naLevelOmhoog(voor, na){
    const j = levelSprong(na);
    if (j) levelOmhoog(j.a, j.s);
  }
  Wachtrij.voeg({ id: "levels", prio: 1.5,
    async kan(){
      if (!speler()) return false;
      try { await haal(); } catch(e){}
      if (!zichtbaar()) return false;
      const gezien = lees(K.gezien);
      /* ‘Je start op level N’ is voor wie al speelde vóór de levels kwamen; een nieuwe speler kreeg de ring al
         in de uitleg bij de eerste keer en begint gewoon (12 november 2026) */
      if (gezien == null && !demo() && typeof Nieuw !== "undefined" && !Nieuw.veteraan("levels")){ zet(K.gezien, stand.level); return false; }
      return demo() || gezien == null || stand.level > gezien;
    },
    toon(){
      const gezien = lees(K.gezien);
      if (demo() || gezien == null){ if (!demo()) zet(K.gezien, stand.level); return levelStart(stand); }
      zet(K.gezien, stand.level);
      return levelOmhoog(gezien, stand);
    }
  });

  /* ---------- Mijn profiel: levelkaart ---------- */
  function kaartHtml(){
    if (!zichtbaar()) return "";
    const s = stand, week = s.week || {}, wk = VOLGORDE.filter(k => week[k] > 0), max = Math.max(1, ...wk.map(k => week[k]));
    const weekTot = wk.reduce((a, k) => a + week[k], 0);
    return `<section class="pfsec lvkaart" aria-labelledby="pfLvH">
      <div class="lvkop"><h3 id="pfLvH">Level ${s.level} <span>· ${esc(s.rang)}</span></h3><span class="xptal">${s.in_level} / ${s.stap} XP</span></div>
      <span class="xpbalk" aria-hidden="true"><i style="width:${Math.round(100 * frac(s))}%"></i></span>
      <div class="lvtegels"><div><b>${s.xp.toLocaleString("nl-NL")}</b><span>XP in totaal</span></div><div><b>${weekTot.toLocaleString("nl-NL")}</b><span>deze week</span></div><div><b>${s.tokens} / 2</b><span>hersteltokens</span></div></div>
      ${!s.actief ? `<p class="fine">Voorbeeld: levels gaan op ${new Date(s.vanaf + "T12:00").toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })} voor iedereen aan.</p>` : ""}
      ${wk.length ? `<h4 class="caps">Waar je XP deze week vandaan komt</h4><div class="lvherkomst">${wk.map(k => `<span>${WEEKNAAM[k]}</span><span class="tb"><i style="width:${Math.round(100 * week[k] / max)}%"></i></span><b>${week[k]}</b>`).join("")}</div>` : ""}
      <h4 class="caps">Rangen</h4>
      <ol class="lvrangen">${RANGEN.map(([n, r]) => `<li class="${s.level >= n ? "ok" : ""}${rangVan(s.level) === r ? " nu" : ""}"><span>${esc(r)}</span><span>level ${n}${s.level >= n ? " ✓" : ""}</span></li>`).join("")}</ol>
      <p class="fine">XP krijg je voor determineren, oefenen, het herstellen van eerdere fouten, nieuwe soorten en dwaalgasten. Elk level levert 10 eikels op. Elke 20 levels is een mijlpaal: een nieuwe rang, 50 eikels extra en een hersteltoken.</p>
    </section>`;
  }
  /* rangen die nog te verdienen zijn, voor de shop (rij Ondertitels) */
  const teVerdienen = bezit => zichtbaar() ? RANGEN.filter(([, r]) => !bezit.includes(r)).map(([n, r]) => [r, `rang bij level ${n}`]) : [];

  /* ---------- adventkalender: XP-sterretjes vliegen de ring in (update 11) ----------
     Net als de eikels naar je saldo: een zwerm sterretjes vliegt naar je avatar rechtsboven. De ring licht op, en
     bij elk sterretje dat aankomt loopt hij een stukje verder vol, tot de nieuwe stand (over een level heen kan ook). */
  const XPSTER = `<svg aria-hidden="true" viewBox="0 0 24 24"><path fill="#c6e98a" stroke="#1f3a2a" stroke-width="1.2" stroke-linejoin="round" d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z"/></svg>`;
  const plek = s => s ? s.level + frac(s) : 0;
  async function sterrenNaarRing(van, n, voor, na){
    const b = ringKnop(); if (!b) return;
    const r = b.getBoundingClientRect();
    const spook = b.cloneNode(true);
    spook.removeAttribute("id"); spook.className = b.className + " metlevel xpspook licht"; spook.setAttribute("aria-hidden", "true"); spook.tabIndex = -1;
    spook.style.cssText = `left:${r.left}px; top:${r.top}px; width:${r.width}px; height:${r.height}px`;
    let nr = spook.querySelector(".lvnr");
    if (!nr){ nr = document.createElement("span"); nr.className = "lvnr"; nr.setAttribute("aria-hidden", "true"); spook.appendChild(nr); }
    const p0 = plek(voor), p1 = Math.max(p0, plek(na));
    const zetStand = v => { const l = Math.floor(v + 1e-6); spook.style.setProperty("--p", Math.round(100 * (v - l)) + "%"); nr.textContent = l; };
    zetStand(p0);
    document.body.appendChild(spook);
    if (rustig() || !van){ zetStand(p1); await wacht(900); spook.remove(); return; }
    const a = van.getBoundingClientRect();
    const volg = volgDoel(spook, () => ringKnop().getBoundingClientRect(), q => [q.left + q.width / 2, q.top + q.height / 2]);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, [x1, y1] = volg.xy();
    const aantal = Math.min(12, Math.max(6, Math.round(n / 15)));
    van.classList.add("leeg");
    let aangekomen = 0;
    await new Promise(klaar => {
      for (let i = 0; i < aantal; i++){
        setTimeout(() => {
          const e = document.createElement("div"); e.className = "xpster"; e.innerHTML = XPSTER;
          document.body.appendChild(e);
          const sx = x0 + (Math.random() - .5) * 60, sy = y0 + (Math.random() - .5) * 30;
          const cx = (sx + x1) / 2 + (Math.random() - .5) * 160, cy = Math.min(sy, y1) - 120 - Math.random() * 120;
          const draai = (Math.random() < .5 ? -1 : 1) * (200 + Math.random() * 260), duur = 720 + Math.random() * 260, t0 = performance.now();
          const stap = nu => {
            const t = Math.min(1, (nu - t0) / duur), u = 1 - t, z = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const [x1, y1] = volg.xy();
            const x = u * u * sx + 2 * u * t * cx + t * t * x1, y = u * u * sy + 2 * u * t * cy + t * t * y1;
            const sc = t < .2 ? .6 + t * 3 : 1.2 - z * .55;
            e.style.transform = `translate(${x - 11}px, ${y - 11}px) rotate(${draai * z}deg) scale(${sc})`;
            if (t < 1) return requestAnimationFrame(stap);
            e.remove(); aangekomen++;
            zetStand(p0 + (p1 - p0) * aangekomen / aantal);
            spook.classList.remove("veer"); void spook.offsetWidth; spook.classList.add("veer");
            if (aangekomen === aantal) klaar();
          };
          requestAnimationFrame(stap);
        }, i * 85);
      }
    });
    if (!demoAdvent) tekenOveral();
    await wacht(1100);
    spook.classList.add("weg");
    await wacht(300);
    volg.stop(); spook.remove();
  }
  /* adventkalender: een XP-vakje is open */
  let demoAdvent = false;
  async function naAdvent(van, n){
    if (!speler()) return;
    const voor = stand;
    let na = null; try { na = await haal(); } catch(e){}
    if (!na) return;
    if (na.actief || demo()) await sterrenNaarRing(van, n, voor, na);
    naLevelOmhoog(voor, na);
  }
  /* voorbeeld van de adventkalender (?kerst=demo): zelfde animatie, er telt niets mee */
  async function naAdventDemo(van, n){
    const voor = stand && stand.stap ? stand : { level: 6, in_level: 140, stap: 300 };
    let l = voor.level, rest = voor.in_level + n;
    while (rest >= voor.stap){ rest -= voor.stap; l++; }
    demoAdvent = true;
    try { await sterrenNaarRing(van, n, voor, { level: l, in_level: rest, stap: voor.stap }); } finally { demoAdvent = false; }
  }

  if (speler()) setTimeout(tekenOveral, 0);
  return { haal, ring, mijnRing, knop, tekenOveral, naSpel, toonInResultaat, kaartHtml, teVerdienen, naAdvent, naAdventDemo, zichtbaar,
           stand: () => stand, RANGEN, levelOmhoog, popup, rij };
})();
