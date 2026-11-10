/* Vestigia – kerst (update 8)
   1 t/m 26 december: een kerstmuts op het logo.
   1 december t/m 6 januari: pootafdrukken in de sneeuw bij het openen en een paar sneeuwvlokjes op het beginscherm
   (hooguit tien seconden, uit te zetten in het menu, nooit bij ‘minder beweging’).
   1 t/m 24 december: de adventkalender. Elke dag één vakje; alleen het vakje van vandaag gaat open en een gemist vakje
   is weg. In een vakje: eikels, een sporenvraag, een ondertitel, een kleur of een lijst, en altijd een winterweetje.
   De server bepaalt de datum en wat erin zit (supabase-012); de app toont het alleen.
   Openen: het vakje komt naar voren, de deurtjes zwaaien open met licht en vonkjes, en verdiende eikels vliegen naar
   je eikelsaldo, dat pas daarna omhoog telt.
   Testen vóór december: ?kerst=demo (eventueel &dag=12). Dan werkt alles zonder server en telt er niets mee. */
"use strict";

const Kerst = (() => {
  const SNEEUW = "vestigia:sneeuw", CACHE = "vestigia:advent", DEMO = "vestigia:kerstdemo";
  try {
    const u = new URLSearchParams(location.search);
    if (u.get("kerst") === "demo") sessionStorage.setItem(DEMO, JSON.stringify({ dag: Math.min(24, Math.max(1, +u.get("dag") || 10)), open: [] }));
    if (u.get("kerst") === "uit") sessionStorage.removeItem(DEMO);
  } catch(e){}
  const demo = () => { try { return JSON.parse(sessionStorage.getItem(DEMO)); } catch(e){ return null; } };
  const zetDemo = d => { try { sessionStorage.setItem(DEMO, JSON.stringify(d)); } catch(e){} };

  /* datum in Nederland, los van de tijdzone van het toestel */
  function nl(){
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", year: "numeric", month: "numeric", day: "numeric" })
      .formatToParts(new Date()).map(x => [x.type, +x.value]));
    return { j: p.year, m: p.month, d: p.day };
  }
  const winter = () => { if (demo()) return true; const t = nl(); return t.m === 12 || (t.m === 1 && t.d <= 6); };
  const muts = () => { const dm = demo(); if (dm) return dm.dag <= 26; const t = nl(); return t.m === 12 && t.d <= 26; };
  const kalenderDag = () => { const dm = demo(); if (dm) return dm.dag; const t = nl(); return t.m === 12 && t.d <= 24 ? t.d : null; };
  const rustig = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sneeuwAan = () => { try { return localStorage.getItem(SNEEUW) !== "uit"; } catch(e){ return true; } };
  const speler = () => online.enabled && online.player();
  const args = extra => Object.assign({ p_id: online.player().id, p_key: online.player().key }, extra || {});
  const wacht = ms => new Promise(r => setTimeout(r, rustig() ? 0 : ms));

  /* ---------- stand van de kalender ---------- */
  const lees = () => { try { return JSON.parse(localStorage.getItem(CACHE)); } catch(e){ return null; } };
  const bewaar = s => { try { localStorage.setItem(CACHE, JSON.stringify(s)); } catch(e){} };
  function stand(){
    const dm = demo();
    if (dm) return { jaar: nl().j, vandaag: dm.dag, spoor: ADVENT_INHOUD[dm.dag][2] || null, geopend: dm.open.map(o => ADVENT_DEMO(o.dag, o.antwoord)) };
    const s = lees(), j = nl().j, vandaag = kalenderDag();
    if (s && s.jaar === j && s.t === todayIndex()) return s;
    return { jaar: j, vandaag, spoor: null, geopend: (s && s.jaar === j && s.geopend) || [] };
  }
  async function haal(){
    if (demo() || !speler()) return stand();
    try {
      const r = await online.rpc("advent_status", args()), s = Array.isArray(r) ? r[0] : r;
      if (s) bewaar({ jaar: s.jaar, vandaag: s.vandaag, spoor: s.vandaag_spoor || null, geopend: s.geopend || [], t: todayIndex() });
    } catch(e){}
    return stand();
  }
  const isOpen = (s, d) => (s.geopend || []).some(v => v.dag === d);
  const vandaagDicht = () => { const s = stand(); return !!s.vandaag && !isOpen(s, s.vandaag); };

  /* ---------- versiering ---------- */
  function versier(){
    document.documentElement.classList.toggle("kerst", winter());
    document.documentElement.classList.toggle("kerstmuts", muts());
    const kal = winter() && !!kalenderDag();
    if ($("adventBtn")) $("adventBtn").hidden = !kal;
    if ($("menuAdvent")) $("menuAdvent").parentElement.hidden = !kal;
    if ($("sneeuwRij")) $("sneeuwRij").hidden = !winter();
    if ($("sneeuwBtn")) $("sneeuwBtn").setAttribute("aria-checked", String(sneeuwAan()));
    stip();
  }
  function stip(){ const b = $("adventBtn"); if (b) b.classList.toggle("nieuw", vandaagDicht()); }

  let gesneeuwd = false;
  function sneeuw(){
    if (gesneeuwd || !winter() || !sneeuwAan() || rustig()) return;
    gesneeuwd = true;
    const laag = document.createElement("div"); laag.className = "sneeuw"; laag.setAttribute("aria-hidden", "true");
    document.body.appendChild(laag);
    const t0 = Date.now();
    const vlok = () => {
      if (Date.now() - t0 > 10000) return;
      const v = document.createElement("i"), s = 3 + Math.random() * 4, duur = 5 + Math.random() * 4;
      v.style.cssText = `left:${Math.random() * 100}%; width:${s}px; height:${s}px; animation-duration:${duur}s; --zij:${(Math.random() * 60 - 30).toFixed(0)}px; opacity:${(.55 + Math.random() * .4).toFixed(2)}`;
      laag.appendChild(v); setTimeout(() => v.remove(), duur * 1000 + 100);
      setTimeout(vlok, 380 + Math.random() * 420);
    };
    vlok();
    setTimeout(() => laag.remove(), 20000);
  }

  /* ---------- inhoud tonen ---------- */
  const EIK = (n, cls) => `<span class="avk-eik ${cls || ""}">${EIKEL}<b>+${n}</b></span>`;
  const ITEMNAAM = { "kleur:winter": "Achtergrondkleur Winter", "kleur:hulst": "Achtergrondkleur Hulst", "lijst:sneeuwvlokken": "Lijst Sneeuwvlokken", "lijst:kerst": "Kerstlijst" };
  const itemNaam = item => item.startsWith("titel:") ? `Ondertitel ‘${item.slice(6)}’` : (ITEMNAAM[item] || item);
  function itemBeeld(item){
    const me = Profiel.mijn(), v = item.slice(item.indexOf(":") + 1);
    if (item.startsWith("titel:")) return `<span class="avk-lint">${esc(v)}</span>`;
    return avatarSVG(Object.assign({}, me, item.startsWith("kleur:") ? { color: v } : { frame: v }), "avk-av");
  }
  function klein(v){       // wat er in een geopend vakje in het rooster staat
    if (v.item && !v.item.startsWith("titel:")) return `<span class="avk-item">${itemBeeld(v.item)}</span>`;
    if (v.item) return `<span class="avk-tit" aria-hidden="true">★</span>`;
    if (v.spoor) return `<span class="avk-sp ${v.goed ? "goed" : "fout"}">${prentSVG(v.spoor, "voor")}</span>`;
    return EIK(v.eikels);
  }
  const weetje = d => ADVENT.find(a => a.dag === d);
  function weetjeHtml(d){
    const w = weetje(d), t = w && BY_ID.get(w.soort);
    return w ? `<div class="avk-weetje"><span class="caps">Winterweetje · ${esc(t ? t.n : w.soort)}${d === 5 ? " · Sinterklaas" : d === 24 ? " · Kerstavond" : d === 21 ? " · kortste dag" : ""}</span><p>${esc(w.tekst)}</p><p class="fine">Bron: ${esc(w.bron)}</p></div>` : "";
  }
  /* het rooster */
  let gekozen = null;
  function teken(){
    const s = stand(), grid = $("adventGrid");
    const sub = !s.vandaag ? "De kalender is open van 1 tot en met 24 december."
      : isOpen(s, s.vandaag) ? "Het vakje van vandaag is open. Morgen weer een!"
      : `Vandaag mag vakje ${s.vandaag} open. Een gemist vakje is weg.`;
    $("adventSub").textContent = (demo() ? "Voorbeeld: er telt niets mee. " : "") + sub;
    grid.innerHTML = Array.from({ length: 24 }, (_, k) => {
      const d = k + 1, v = (s.geopend || []).find(x => x.dag === d);
      const staat = v ? "open" : d === s.vandaag ? "vandaag" : s.vandaag && d < s.vandaag ? "gemist" : "dicht";
      const label = `Vakje ${d}: ${{ open: "geopend", vandaag: "vandaag, nog dicht", gemist: "gemist", dicht: "nog niet" }[staat]}`;
      return `<button class="avk ${staat}${gekozen === d ? " gekozen" : ""}" data-d="${d}" aria-label="${label}"${staat === "dicht" || staat === "gemist" ? " disabled" : ""}><span class="avk-nr">${d}</span>${v ? klein(v) : ""}${staat === "gemist" ? `<span class="avk-weg">gemist</span>` : ""}</button>`;
    }).join("");
    grid.querySelectorAll(".avk.open, .avk.vandaag").forEach(b => b.onclick = () => klik(+b.dataset.d, b));
    /* knop onder de kalender: zolang het vakje van vandaag dicht is */
    const go = $("adventGo");
    go.hidden = !(s.vandaag && !isOpen(s, s.vandaag));
    go.onclick = () => { const b = grid.querySelector(".avk.vandaag"); if (b) klik(s.vandaag, b); };
    const v = gekozen && (s.geopend || []).find(x => x.dag === gekozen);
    const box = $("adventVak");
    if (!v){ box.hidden = true; return; }
    box.hidden = false; box.className = "adventvak";
    box.innerHTML = `<div class="avk-buit">${EIK(v.eikels)}${v.item ? `<span class="avk-extra">${itemBeeld(v.item)}<span>${esc(itemNaam(v.item))}<small>staat in Mijn profiel</small></span></span>` : ""}${v.spoor ? `<span class="avk-extra"><span>${v.goed ? "Spoor goed geraden" : "Spoor niet geraden"}<small>het spoor was van een ${esc(SPOREN[v.spoor].naam.toLowerCase())}</small></span></span>` : ""}</div>${weetjeHtml(v.dag)}`;
  }

  /* ---------- openen: het grote moment ---------- */
  let bezig = false;
  async function klik(d, knop){
    const s = stand();
    if (isOpen(s, d)){ gekozen = gekozen === d ? null : d; teken(); return; }
    if (d !== s.vandaag || bezig) return;
    if (!demo() && !speler()){
      const box = $("adventVak"); box.hidden = false; box.className = "adventvak";
      box.innerHTML = `<p>Met een spelersnaam open je elke dag een vakje en krijg je wat erin zit.</p><button class="btn line" id="adventNaam">Kies een spelersnaam</button>`;
      $("adventNaam").onclick = () => { sluit(); MENU_GO.player(); };
      return;
    }
    bezig = true;
    try { await onthul(d, knop, s.spoor || (demo() && ADVENT_INHOUD[d][2]) || null); }
    finally { bezig = false; }
  }
  async function vraagServer(d, antwoord){
    if (demo()){
      await wacht(250);
      const dm = demo(); if (!dm.open.some(o => o.dag === d)) dm.open.push({ dag: d, antwoord }); zetDemo(dm);
      const v = ADVENT_DEMO(d, antwoord); v.kampioen = dm.open.length === 24; return v;
    }
    const r = await online.rpc("advent_open", args(antwoord ? { p_antwoord: antwoord } : {})), v = Array.isArray(r) ? r[0] : r;
    const c = lees() || { jaar: nl().j, geopend: [] };
    if (v && !(c.geopend || []).some(x => x.dag === v.dag)) c.geopend = (c.geopend || []).concat([v]);
    c.vandaag = v ? v.dag : c.vandaag; c.spoor = null; c.t = todayIndex(); bewaar(c);
    return v;
  }
  async function onthul(d, knop, spoor){
    const r = knop.getBoundingClientRect();
    const laag = document.createElement("div");
    laag.className = "avk-podium"; laag.setAttribute("role", "dialog"); laag.setAttribute("aria-label", `Vakje ${d}`);
    laag.innerHTML = `<div class="avk-sneeuwval" aria-hidden="true"></div>
      <div class="avk-doos" style="--x:${r.left}px; --y:${r.top}px; --w:${r.width}px">
        <div class="avk-licht" aria-hidden="true"></div>
        ${LAMPJES}
        <div class="avk-binnen"></div>
        <div class="avk-deur l" aria-hidden="true"><span>${d}</span></div><div class="avk-deur r" aria-hidden="true"></div>
        <div class="avk-strik" aria-hidden="true"></div>
      </div>
      <div class="avk-onder"></div>`;
    document.body.appendChild(laag);
    knop.style.visibility = "hidden";
    const doos = laag.querySelector(".avk-doos"), binnen = laag.querySelector(".avk-binnen"), onder = laag.querySelector(".avk-onder");
    /* 1. naar voren */
    requestAnimationFrame(() => requestAnimationFrame(() => laag.classList.add("groot")));
    /* bij een gewoon vakje loopt de server alvast mee met de animatie */
    const serverNu = spoor ? null : vraagServer(d).catch(e => ({ fout: e }));
    sneeuwIn(laag.querySelector(".avk-sneeuwval"), laag);
    await wacht(1500);                         // naar voren (0,9 s) en even wiebelen
    /* 2. deurtjes open, licht, lampjes en vonkjes */
    laag.classList.add("open");
    await wacht(350);
    vonk(doos, 22);
    await wacht(950);
    let v;
    if (spoor){
      v = await sporenVraag(binnen, onder, d, spoor);
    } else {
      v = await serverNu;
    }
    if (!v || v.fout){
      const e = v && v.fout;
      onder.innerHTML = `<p class="avk-fout">${esc(e && e.status && e.status < 500 ? e.message : "Openen lukte niet. Controleer je internetverbinding.")}</p><button class="btn" id="avkVerder">Terug</button>`;
      laag.querySelector("#avkVerder").onclick = () => { laag.remove(); knop.style.visibility = ""; };
      return;
    }
    /* 3. de buit */
    if (!spoor){
      binnen.innerHTML = v.item
        ? `<div class="avk-buitgroot item">${itemBeeld(v.item)}</div>`
        : `<div class="avk-buitgroot">${EIK(v.eikels, "groot")}</div>`;
      binnen.classList.add("toon");
    }
    const melding = !spoor ? "" : v.goed
      ? `<p class="avk-melding goed"><b>Gefeliciteerd!</b> Je antwoord is juist, je hebt 20 eikels verdiend!</p>`
      : `<p class="avk-melding fout"><b>Helaas,</b> dit was niet het juiste antwoord. Het spoor was van een ${esc(SPOREN[v.spoor].naam.toLowerCase())}. Hier heb je 5 eikels voor de moeite.</p>`;
    onder.innerHTML = `${melding}${v.item ? `<p class="avk-wat">${esc(itemNaam(v.item))}<small>Nu te kiezen in Mijn profiel</small></p>` : ""}
      ${v.kampioen ? `<p class="avk-wat kampioen"><span class="avk-lint">Adventkampioen</span><small>Alle 24 vakjes geopend!</small></p>` : ""}
      <div class="avk-eikrij">${EIK(v.eikels, "teller")}</div>
      ${weetjeHtml(d)}
      <button class="btn" id="avkVerder">Verder</button>`;
    onder.classList.add("toon");
    if (v.item || v.kampioen || v.goed) vonk(doos, 30, true);
    await wacht(500);
    /* 4. eikels vliegen naar het saldo */
    await vliegNaarSaldo(onder.querySelector(".avk-eikrij .avk-eik"), v.eikels);
    if (!demo()) Profiel.haalAlles().then(() => Profiel.saldoInKop());
    const verder = laag.querySelector("#avkVerder");
    verder.focus();
    await new Promise(res => { verder.onclick = res; laag.addEventListener("click", e => { if (e.target === laag) res(); }); });
    laag.classList.add("weg");
    await wacht(260);
    laag.remove();
    gekozen = null; teken(); stip();
    const nieuw = $("adventGrid").querySelector(`[data-d="${d}"]`); if (nieuw && !rustig()) nieuw.classList.add("net");
  }
  /* sporenvakje: welk dier liet dit spoor achter? */
  function sporenVraag(binnen, onder, d, spoor){
    const pts = spoorPatroon(spoor, 4), xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const minx = Math.min(...xs) - .8, maxx = Math.max(...xs) + .8, miny = Math.min(...ys) - .8, maxy = Math.max(...ys) + 1.2;
    const sch = 100 / Math.max(maxx - minx, maxy - miny);
    const ox = (100 - (maxx - minx) * sch) / 2, oy = (100 - (maxy - miny) * sch) / 2;     // spoor in het midden
    binnen.innerHTML = `<div class="avk-spoor" aria-label="Een spoor in de sneeuw">${pts.map((p, i) =>
      `<span style="left:${(ox + (p.x - minx) * sch).toFixed(1)}%; top:${(oy + (p.y - miny) * sch).toFixed(1)}%; --r:${p.r}deg; --s:${p.spiegel ? -1 : 1}; --vd:${(300 + (pts.length - 1 - i) * 420)}ms">${prentSVG(spoor, p.voet)}</span>`).join("")}</div>`;
    binnen.classList.add("toon", "sp");
    const anderen = Object.keys(SPOREN).filter(k => k !== spoor).sort(() => Math.random() - .5).slice(0, 2);
    const keuzes = [spoor, ...anderen].sort(() => Math.random() - .5);
    onder.innerHTML = `<p class="avk-vraag">Sporenvakje! Welk dier liep hier door de sneeuw?</p>
      <div class="avk-keuzes">${keuzes.map(k => `<button class="btn line" data-k="${k}">${esc(SPOREN[k].naam)}</button>`).join("")}</div>
      <p class="fine">Goed geraden: 20 eikels. Fout: 5 eikels.</p>`;
    /* de vraag komt pas als het hele spoor er staat */
    setTimeout(() => onder.classList.add("toon"), rustig() ? 0 : 300 + pts.length * 420 + 200);
    return new Promise(res => {
      onder.querySelectorAll("[data-k]").forEach(b => b.onclick = async () => {
        onder.querySelectorAll("[data-k]").forEach(x => x.disabled = true);
        let v; try { v = await vraagServer(d, b.dataset.k); } catch(e){ v = { fout: e }; }
        if (v && !v.fout){
          onder.querySelectorAll("[data-k]").forEach(x => x.classList.add(x.dataset.k === v.spoor ? "goed" : x === b ? "fout" : "uit"));
          binnen.insertAdjacentHTML("beforeend", `<div class="avk-oordeel ${v.goed ? "goed" : "fout"}">${v.goed ? "Goed!" : "Helaas"}</div>`);
          if (v.goed) vonk(binnen.closest(".avk-doos"), 22, true);
          onder.classList.remove("toon");
          await wacht(1400);
        }
        res(v);
      });
    });
  }
  /* een slinger kerstlampjes boven de doos; ze gaan aan als de deurtjes opengaan */
  const LAMPJES = (() => {
    const kl = ["#ff4b5c", "#ffd36b", "#5fd38a", "#6bb8ff", "#ff9a4b"], n = 9;
    let lampen = "";
    for (let i = 0; i < n; i++){
      const x = 8 + i * (184 / (n - 1)), y = 14 + Math.sin(Math.PI * (i / (n - 1))) * 14;
      lampen += `<g class="lamp" style="--k:${kl[i % kl.length]}; --d:${(i * .23).toFixed(2)}s"><rect x="${x - 2}" y="${y - 3}" width="4" height="4" rx="1" fill="#2c3b32"/><ellipse class="gloed" cx="${x}" cy="${y + 5}" rx="7" ry="8"/><ellipse class="peer" cx="${x}" cy="${y + 4.5}" rx="3.2" ry="4.6"/></g>`;
    }
    return `<svg class="avk-lampjes" viewBox="0 0 200 40" aria-hidden="true"><path d="M2 8 Q100 44 198 8" fill="none" stroke="#2c3b32" stroke-width="1.6"/>${lampen}</svg>`;
  })();
  function sneeuwIn(laag, podium){
    if (rustig() || !laag) return;
    const vlok = () => {
      if (!podium.isConnected) return;
      const v = document.createElement("i"), s = 3 + Math.random() * 5, duur = 6 + Math.random() * 5;
      v.style.cssText = `left:${Math.random() * 100}%; width:${s}px; height:${s}px; animation-duration:${duur}s; --zij:${(Math.random() * 80 - 40).toFixed(0)}px; opacity:${(.5 + Math.random() * .45).toFixed(2)}`;
      laag.appendChild(v); setTimeout(() => v.remove(), duur * 1000 + 100);
      setTimeout(vlok, 120 + Math.random() * 180);
    };
    vlok();
  }
  /* vonkjes en sterretjes vanuit het midden van de doos */
  function vonk(el, n, goud){
    if (rustig() || !el) return;
    for (let i = 0; i < n; i++){
      const s = document.createElement("i"), a = Math.random() * Math.PI * 2, afst = 70 + Math.random() * 110;
      s.className = "avk-vonk" + (goud || i % 3 === 0 ? " goud" : "") + (i % 4 === 0 ? " ster" : "");
      s.style.setProperty("--dx", `${(Math.cos(a) * afst).toFixed(0)}px`);
      s.style.setProperty("--dy", `${(Math.sin(a) * afst).toFixed(0)}px`);
      s.style.animationDelay = `${(Math.random() * 120).toFixed(0)}ms`;
      el.appendChild(s); setTimeout(() => s.remove(), 1200);
    }
  }
  /* ---------- eikels vliegen naar je saldo ----------
     Een spook-saldo boven het donkere scherm, precies op de plek van de eikelknop. Elke eikel die aankomt, laat het
     saldo opveren en een stukje optellen; pas na de laatste staat het nieuwe saldo er. */
  function saldoPlek(){
    const k = [$("eikelBtn"), $("slimEikel")].find(x => x && !x.hidden && x.getBoundingClientRect().width > 0 && x.getBoundingClientRect().bottom > 0);
    if (k) return { el: k, r: k.getBoundingClientRect() };
    const m = $("menuBtn").getBoundingClientRect();
    return { el: null, r: { left: m.left - 92, top: m.top + 2, width: 84, height: 36 } };
  }
  async function vliegNaarSaldo(van, n){
    if (!n) return;
    const plek = saldoPlek(), span = plek.el && plek.el.querySelector("span");
    const start = span ? (parseInt(span.textContent.replace(/\D/g, ""), 10) || 0) : 0, eind = start + n;
    if (rustig() || !van){ if (span) span.textContent = eind; return; }
    const spook = document.createElement("div");
    spook.className = "avk-spook";
    spook.style.cssText = `left:${plek.r.left}px; top:${plek.r.top}px; height:${plek.r.height}px; min-width:${plek.r.width}px`;
    spook.innerHTML = `${EIKEL}<span>${start}</span>`;
    document.body.appendChild(spook);
    const tel = spook.querySelector("span");
    const a = van.getBoundingClientRect(), doel = spook.getBoundingClientRect();
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = doel.left + 18, y1 = doel.top + doel.height / 2;
    const aantal = Math.min(12, Math.max(5, Math.round(n / 4)));
    van.classList.add("leeg");
    let aangekomen = 0;
    await new Promise(klaar => {
      for (let i = 0; i < aantal; i++){
        setTimeout(() => {
          const e = document.createElement("div"); e.className = "avk-vlieg"; e.innerHTML = EIKEL;
          document.body.appendChild(e);
          const sx = x0 + (Math.random() - .5) * 60, sy = y0 + (Math.random() - .5) * 30;
          const cx = (sx + x1) / 2 + (Math.random() - .5) * 160, cy = Math.min(sy, y1) - 120 - Math.random() * 120;
          const draai = (Math.random() < .5 ? -1 : 1) * (240 + Math.random() * 300), duur = 720 + Math.random() * 260, t0 = performance.now();
          const stap = nu => {
            const t = Math.min(1, (nu - t0) / duur), u = 1 - t, z = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const x = u * u * sx + 2 * u * t * cx + t * t * x1, y = u * u * sy + 2 * u * t * cy + t * t * y1;
            const sc = t < .2 ? .6 + t * 3 : 1.2 - z * .55;
            e.style.transform = `translate(${x - 11}px, ${y - 11}px) rotate(${draai * z}deg) scale(${sc})`;
            if (t < 1) return requestAnimationFrame(stap);
            e.remove(); aangekomen++;
            tel.textContent = aangekomen === aantal ? eind : Math.round(start + n * aangekomen / aantal);
            spook.classList.remove("veer"); void spook.offsetWidth; spook.classList.add("veer");
            if (aangekomen === aantal) klaar();
          };
          requestAnimationFrame(stap);
        }, i * 85);
      }
    });
    if (span) span.textContent = eind;
    spook.classList.add("klaar");
    await wacht(700);
    spook.remove();
  }

  /* ---------- kalender openen en sluiten ---------- */
  async function open(){
    gekozen = null;
    $("adventPop").hidden = false;
    teken();
    await haal();
    if (!$("adventPop").hidden && !bezig) teken();
    stip();
  }
  function sluit(){ if (!bezig) $("adventPop").hidden = true; }

  if ($("adventBtn")) $("adventBtn").addEventListener("click", open);
  if ($("adventClose")) $("adventClose").addEventListener("click", sluit);
  if ($("adventPop")) $("adventPop").addEventListener("click", e => { if (e.target === $("adventPop")) sluit(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && $("adventPop") && !$("adventPop").hidden) sluit(); });
  if ($("sneeuwBtn")) $("sneeuwBtn").addEventListener("click", () => {
    try { localStorage.setItem(SNEEUW, sneeuwAan() ? "uit" : "aan"); } catch(e){}
    versier(); if (sneeuwAan()){ gesneeuwd = false; sneeuw(); } else document.querySelectorAll(".sneeuw").forEach(x => x.remove());
  });
  MENU_GO.advent = () => { closeMenu(true); open(); };

  /* in de wachtrij: het vakje van vandaag is nog dicht; hooguit één keer per dag vanzelf */
  Wachtrij.voeg({ id: "advent", prio: 2,
    async kan(){
      if (!kalenderDag()) return false;
      if (!demo() && !speler()) return false;
      await haal();
      if (!vandaagDicht()) return false;
      const k = "vestigia:adventGetoond"; let g = null; try { g = localStorage.getItem(k); } catch(e){}
      if (g === String(todayIndex()) && !demo()) return false;
      try { localStorage.setItem(k, String(todayIndex())); } catch(e){}
      return true;
    },
    toon: open });

  versier();
  if (winter() && speler()) haal().then(stip);
  return { versier, sneeuw, open, seizoen: winter };
})();
