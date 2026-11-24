/* Vestigia – kerst (update 8)
   1 t/m 26 december: een kerstmuts op het logo, een vliegende slee in de openingsanimatie (update 11) en een paar sneeuwvlokjes
   op het beginscherm (hooguit tien seconden, uit te zetten in het menu, nooit bij ‘minder beweging’).
   Vanaf 27 december is alles wat met kerst te maken heeft weg (Tom, 13 november), behalve wat je uit de adventkalender kreeg.
   1 december t/m 15 februari: vallende sneeuw in de openingsanimatie (html.wintersneeuw).
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
  /* kerstperiode: 1 t/m 26 december (slee, sneeuw op het beginscherm, kerstmuts) */
  const winter = () => { const dm = demo(); if (dm) return dm.dag <= 26; const t = nl(); return t.m === 12 && t.d <= 26; };
  /* sneeuw in de openingsanimatie: 1 december t/m 15 februari */
  const sneeuwIntro = () => { if (demo()) return true; const t = nl(); return t.m === 12 || t.m === 1 || (t.m === 2 && t.d <= 15); };
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
    document.documentElement.classList.toggle("wintersneeuw", sneeuwIntro());
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
  const ITEMNAAM = { "token:herstel": "Hersteltoken", "kleur:winter": "Achtergrondkleur Winter", "kleur:hulst": "Achtergrondkleur Hulst", "lijst:sneeuwvlokken": "Lijst Sneeuwvlokken", "lijst:kerst": "Kerstlijst", "avatar:winter-hermelijn": "Avatar Hermelijn in winterpels" };
  /* XP-vakje (update 10): item 'xp:150' = 150 ervaringspunten, telt meteen mee voor je level */
  const isXp = item => !!item && item.startsWith("xp:");
  /* hoe een item in ‘Je hebt … gekregen’ heet (update 11) */
  const MELDNAAM = { "lijst:kerst": "de Kerstlijst", "lijst:sneeuwvlokken": "de lijst ‘Sneeuwvlokken’", "kleur:winter": "de achtergrondkleur ‘Winter’",
                     "kleur:hulst": "de achtergrondkleur ‘Hulst’", "avatar:winter-hermelijn": "de avatar ‘Hermelijn in winterpels’" };
  /* sporenvakjes (update 11): twee opties met een voet die op die van het goede dier lijkt.
     vos (4 tenen) ↔ wilde kat (4 tenen, rond, zonder nagels) en boommarter; das (5 tenen, lange nagels) ↔ otter en egel;
     ree (smalle hoefhelften) ↔ edelhert en wild zwijn; boommarter (marterprent in paren) ↔ bunzing en eekhoorn;
     wild zwijn (hoef met bijhoeven) ↔ edelhert en ree. */
  const SPOOR_AFLEIDERS = { vos: ["wilde-kat", "boommarter"], das: ["otter", "egel"], ree: ["edelhert", "zwijn"],
                            boommarter: ["bunzing", "eekhoorn"], zwijn: ["edelhert", "ree"] };
  const SPOOR_NAAM = { "wilde-kat": "Wilde kat", otter: "Otter", egel: "Egel", edelhert: "Edelhert", bunzing: "Bunzing", eekhoorn: "Eekhoorn" };
  const spoorNaam = k => (SPOREN[k] && SPOREN[k].naam) || SPOOR_NAAM[k] || k;
  const itemNaam = item => item.startsWith("titel:") ? `Ondertitel ‘${item.slice(6)}’` : isXp(item) ? `${item.slice(3)} ervaringspunten` : (ITEMNAAM[item] || item);
  const XPSTER = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z"/></svg>`;
  function itemBeeld(item, groot){
    const me = Profiel.mijn(), v = item.slice(item.indexOf(":") + 1);
    if (isXp(item)) return `<span class="avk-xp${groot ? " groot" : ""}">${XPSTER}<b>${esc(v)}${groot ? " XP" : ""}</b></span>`;
    if (item === "token:herstel") return herstelMunt(groot ? 104 : 40, "avk-munt");
    if (item.startsWith("titel:")) return `<span class="avk-lint">${esc(v)}</span>`;
    return avatarSVG(Object.assign({}, me, item.startsWith("kleur:") ? { color: v } : item.startsWith("avatar:") ? { avatar: v } : { frame: v }), "avk-av");
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

  /* De kerst-mus (22 november 2026): een mannetje huismus met kerstmuts en rood-wit sjaaltje, alleen versiering.
     Hij zit rechtsboven op het rooster (vakje 6), alleen zolang de kalender loopt (1 t/m 24 december). Geen animatie.
     Losse delen voor de vlucht: m-ver en m-open (vleugels open), m-dicht (vleugel dicht), m-staart, m-poten.
     Tekencode ook in het Project: techniek/kerstmus.mjs (mag met Pasen terugkomen). */
  const KERSTMUS = `<svg class="kerstmus" viewBox="6 4 92 84" aria-hidden="true" focusable="false"><g transform="translate(51 47)"><g class="m-ver"><path fill="#6b4127" d="M-4 0C-1 -15 10 -32 32 -44C31 -39 33 -36 36 -35C32 -31 34 -28 36 -26C32 -23 33 -20 34 -17C29 -15 28 -11 26 -8C19 -2 8 1 -4 0Z"/><path fill="#3a2519" d="M17 -35C22 -39 27 -42 32 -44C31 -39 33 -36 36 -35C32 -31 34 -28 36 -26C32 -23 33 -20 34 -17C30 -18 25 -21 22 -25C20 -28 18 -32 17 -35Z"/></g></g><g class="m-staart"><path fill="#5b3a22" d="M66 58L92 64C96 66 96 72 92 73L64 69Z"/><path fill="#7a4d2c" d="M67 61L91 66C93 67 93 70 91 70L66 67Z"/></g><path fill="#a8703f" d="M28 50C32 37 54 33 70 42C80 48 81 61 73 69C63 78 43 79 34 71C28 65 26 57 28 50Z"/><path fill="#d4cdbf" d="M28 52C27 66 38 79 55 78C46 72 39 63 37 52Z"/><path fill="#c2b9a9" d="M30 64C34 72 42 77 52 78C42 75 35 70 31 62Z"/><g class="m-dicht"><path fill="#8a5430" d="M44 50C54 43 70 45 79 55C76 66 63 71 50 67C45 63 43 56 44 50Z"/><path d="M50 52L58 58M56 49L65 56M63 49L71 56M52 60L60 65M61 59L70 64" fill="none" stroke="#2e1f15" stroke-width="1.8" stroke-linecap="round"/><path d="M47 56C52 55 56 57 59 60" fill="none" stroke="#f6f1e6" stroke-width="2" stroke-linecap="round"/><path fill="#4a3021" d="M66 66L80 62L78 66L68 69Z"/></g><path fill="#c9c6c0" d="M20 36C20 26 28 20 37 21C46 22 50 30 48 38C46 45 39 49 31 48C24 47 20 42 20 36Z"/><path fill="#8a4a24" d="M31 29C37 27 45 29 48 35C49 40 47 45 43 47C44 41 41 34 31 31Z"/><path fill="#e8e5de" d="M23 39C25 44 31 47 37 46C34 43 33 40 33 37C29 38 26 39 23 39Z"/><path fill="#231e1b" d="M19 38C20 42 23 45 27 47L33 50L28 52C23 50 20 46 19 42Z"/><path fill="#231e1b" d="M20 33C23 31 27 31 30 33L29 36C26 35 23 35 21 36Z"/><circle cx="27.5" cy="34" r="2.5" fill="#15110e"/><circle cx="28.3" cy="33.2" r=".8" fill="#fff"/><path fill="#f4f1ea" d="M31.5 33.6C33 33 34.6 33.4 35.4 34.6C34 35.4 32.4 35.2 31.5 33.6Z"/><path fill="#6b5a48" d="M21 33L11 37L21 39.5Z"/><path fill="#9a8670" d="M21 37L11 37L21 39.5Z"/><path fill="#d3263a" d="M24 27C25 17 33 10 43 10C51 11 56 16 59 24C61 29 63 33 66 34C61 35 57 33 54 29L50 28C42 25 32 25 24 27Z"/><path fill="#a5172a" d="M43 10C51 11 56 16 59 24C61 29 63 33 66 34C62 34 59 32 57 29C55 22 50 15 43 10Z"/><rect x="21" y="23.5" width="32" height="8" rx="4" transform="rotate(-6 37 27.5)" fill="#fbf7f0"/><circle cx="67" cy="34.5" r="4.6" fill="#fbf7f0"/><path fill="#d3263a" d="M25 46C33 51 43 51 50 45L52 51C44 58 32 57 24 52Z"/><path d="M29 49.5L28 54.5M35 51L34.5 56M41 51L41 56M47 48.5L47.5 54" fill="none" stroke="#fbf7f0" stroke-width="2.4"/><path fill="#d3263a" d="M30 53L27 66L32 65L35 54Z"/><path d="M28.8 57.5L33.6 57.8M28 61.5L32.6 61.6" fill="none" stroke="#fbf7f0" stroke-width="2"/><path d="M27 66L26.5 69M29.5 65.6L29.5 68.8M32 65.2L32.6 68.2" fill="none" stroke="#fbf7f0" stroke-width="1.3" stroke-linecap="round"/><g transform="translate(57 49)"><g class="m-open"><path fill="#8a5430" d="M-4 0C-1 -15 10 -32 32 -44C31 -39 33 -36 36 -35C32 -31 34 -28 36 -26C32 -23 33 -20 34 -17C29 -15 28 -11 26 -8C19 -2 8 1 -4 0Z"/><path fill="#4a3021" d="M17 -35C22 -39 27 -42 32 -44C31 -39 33 -36 36 -35C32 -31 34 -28 36 -26C32 -23 33 -20 34 -17C30 -18 25 -21 22 -25C20 -28 18 -32 17 -35Z"/><path d="M3 -10C9 -16 16 -18 22 -15" fill="none" stroke="#f6f1e6" stroke-width="2" stroke-linecap="round"/><path d="M1 -4L8 -10M8 -2L15 -8M8 -22L14 -27" fill="none" stroke="#2e1f15" stroke-width="1.6" stroke-linecap="round"/></g></g><g class="m-poten"><path d="M45 76L43 83M52 77L52 84M43 83L39 85M43 83L45 85.5M52 84L48 86M52 84L54.5 86.5" fill="none" stroke="#a87e66" stroke-width="1.8" stroke-linecap="round"/></g></svg>`;
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
    const mus = !!s.vandaag;
    $("adventPop").querySelector(".adventsheet").classList.toggle("met-mus", mus);
    if (mus) grid.insertAdjacentHTML("beforeend", KERSTMUS);
    grid.querySelectorAll(".avk.open, .avk.vandaag").forEach(b => b.onclick = () => klik(+b.dataset.d, b));
    /* knop onder de kalender: zolang het vakje van vandaag dicht is */
    const go = $("adventGo");
    go.hidden = !(s.vandaag && !isOpen(s, s.vandaag));
    go.onclick = () => { const b = grid.querySelector(".avk.vandaag"); if (b) klik(s.vandaag, b); };
    const v = gekozen && (s.geopend || []).find(x => x.dag === gekozen);
    const box = $("adventVak");
    if (!v){ box.hidden = true; return; }
    box.hidden = false; box.className = "adventvak";
    box.innerHTML = `<div class="avk-buit">${EIK(v.eikels)}${v.item ? `<span class="avk-extra">${itemBeeld(v.item)}<span>${esc(itemNaam(v.item))}<small>${v.item === "token:herstel" ? "zeer zeldzaam" : isXp(v.item) ? "telt mee voor je level" : "staat in Mijn profiel"}</small></span></span>` : ""}${v.spoor ? `<span class="avk-extra"><span>${v.goed ? "Spoor goed geraden" : "Spoor niet geraden"}<small>het spoor was van een ${esc(spoorNaam(v.spoor).toLowerCase())}</small></span></span>` : ""}</div>${weetjeHtml(v.dag)}`;
  }

  /* ---------- openen: het grote moment ---------- */
  /* ‘Gefeliciteerd! Je hebt … gekregen.’ met een leuke zin erachter (gewone vakjes; het sporenvakje heeft zijn eigen tekst) */
  function cadeauMelding(v){
    const wat = v.item === "token:herstel" ? "een hersteltoken"
      : v.item && v.item.startsWith("titel:") ? `de ondertitel ‘${v.item.slice(6)}’`
      : isXp(v.item) ? itemNaam(v.item)
      : v.item && MELDNAAM[v.item] ? MELDNAAM[v.item]
      : v.item ? (itemNaam(v.item).charAt(0).toLowerCase() + itemNaam(v.item).slice(1))
      : `${v.eikels} eikels`;
    const zin = isXp(v.item) ? `<p class="avk-zin">Zonder er ook maar iets voor te doen, dat is lekker levelen!</p>`
      : v.item === "token:herstel"
      ? `<span class="hm-label">Zeer zeldzaam</span><p class="avk-zin">Deze is <b>erg waardevol</b> en zeldzaam. Bewaar hem goed. Waar hij voor dient, ontdek je vanzelf, op het moment dat je hem nodig hebt.</p>`
      : v.dag === 5 ? `<p class="avk-zin">Sinterklaas heeft echt zijn best gedaan op dit cadeau!</p>`
      : v.dag === 6 && v.item === "lijst:kerst" ? `<p class="avk-zin">Sinterklaas is het land uit, dus nu mag de kerstversiering erop. Zo heb je hem de hele maand.</p>`
      : v.dag === 24 ? `<p class="avk-zin">Die krijg je nergens anders. Fijne kerst!</p>`
      : v.item ? `<p class="avk-zin">Die krijg je nergens anders, dus laat hem maar zien.</p>`
      : `<p class="avk-zin">${["Lekker sparen voor iets moois in de shop.", "Weer een handje eikels in je wintervoorraad, net als een eekhoorn.", "Daar kun je weer iets leuks mee scoren in de shop."][v.dag % 3]}</p>`;
    return `${v.item === "token:herstel" ? zin.split("</span>")[0] + "</span>" : ""}<p class="avk-melding goed"><b>Gefeliciteerd!</b> Je hebt ${esc(wat)} gekregen.</p>${v.item === "token:herstel" ? zin.slice(zin.indexOf("</span>") + 7) : zin}`;
  }

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
      onder.innerHTML = `<p class="avk-fout">${esc(foutTekst(e, "Openen lukte niet."))}</p><button class="btn" id="avkVerder">Terug</button>`;
      laag.querySelector("#avkVerder").onclick = () => { laag.remove(); knop.style.visibility = ""; };
      return;
    }
    /* 3. de buit */
    if (!spoor){
      binnen.innerHTML = v.item === "token:herstel"
        ? `<div class="avk-buitgroot item token">${herstelMuntGroot(104)}</div>`
        : v.item
        ? `<div class="avk-buitgroot item">${itemBeeld(v.item, true)}</div>`
        : `<div class="avk-buitgroot">${EIK(v.eikels, "groot")}</div>`;
      binnen.classList.add("toon");
    }
    const melding = !spoor ? cadeauMelding(v) : v.goed
      ? `<p class="avk-melding goed"><b>Gefeliciteerd!</b> Je antwoord is juist, je hebt 20 eikels verdiend!</p>`
      : `<p class="avk-melding fout"><b>Helaas,</b> dit was niet het juiste antwoord. Het spoor was van een ${esc(SPOREN[v.spoor].naam.toLowerCase())}. Hier heb je 5 eikels voor de moeite.</p>`;
    onder.innerHTML = `${melding}${v.item && v.item !== "token:herstel" && !isXp(v.item) ? `<p class="avk-wat">${esc(itemNaam(v.item))}<small>Nu te kiezen in Mijn profiel</small></p>` : ""}
      ${v.kampioen ? `<p class="avk-wat kampioen"><span class="avk-lint">Adventkampioen</span><small>Alle 24 vakjes geopend!</small></p>` : ""}
      ${v.eikels ? `<div class="avk-eikrij">${EIK(v.eikels, "teller")}</div>` : ""}
      ${weetjeHtml(d)}
      <button class="btn" id="avkVerder">Verder</button>`;
    onder.classList.add("toon");
    if (v.item || v.kampioen || v.goed) vonk(doos, v.item === "token:herstel" ? 45 : 30, true);
    await wacht(500);
    /* 4. eikels vliegen naar het saldo */
    await vliegNaarSaldo(onder.querySelector(".avk-eikrij .avk-eik"), v.eikels);
    /* XP-vakje: '+150 XP' vliegt de ring om je avatar in */
    if (isXp(v.item) && typeof Levels !== "undefined"){
      await wacht(300);
      await (demo() ? Levels.naAdventDemo : Levels.naAdvent)(binnen.querySelector(".avk-xp"), +v.item.slice(3));
    }
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
      `<span style="left:${(ox + (p.x - minx) * sch).toFixed(1)}%; top:${(oy + (p.y - miny) * sch).toFixed(1)}%; --r:${p.r}deg; --s:${p.spiegel ? -1 : 1}; --vd:${300 + i * 420}ms">${prentSVG(spoor, p.voet)}</span>`).join("")}</div>`;
    binnen.classList.add("toon", "sp");
    /* update 11: de andere twee opties lijken op het goede antwoord (zelfde soort voet), maar zijn wel te onderscheiden */
    const anderen = (SPOOR_AFLEIDERS[spoor] || Object.keys(SPOREN).filter(k => k !== spoor).slice(0, 2));
    const keuzes = [spoor, ...anderen].sort(() => Math.random() - .5);
    onder.innerHTML = `<p class="avk-vraag">Sporenvakje! Welk dier liep hier door de sneeuw?</p>
      <div class="avk-keuzes">${keuzes.map(k => `<button class="btn line" data-k="${k}">${esc(spoorNaam(k))}</button>`).join("")}</div>
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
  /* update 82 (g): scrollen tijdens de vlucht liet het saldo verspringen. De grote kop schoof uit beeld terwijl de smalle
     balk nog verstopt zat (of net inschoof), en dan landde het saldo bij het menu buiten beeld of halverwege de balk.
     Nu: staat de eikelknop in de grote kop helemaal in beeld, dan daar; anders altijd op de vaste plek van de eikelknop
     in de smalle balk, gemeten zonder het inschuiven, ook als die balk (nog) niet zichtbaar is. Het spook is zelf een
     saldo, dus het staat daar ook zonder balk goed. */
  function slimRust(k){
    const r = k.getBoundingClientRect();
    let dy = 0;
    try { const t = getComputedStyle($("slimbar")).transform; if (t && t !== "none") dy = new DOMMatrixReadOnly(t).m42; } catch(e){}
    return { left: r.left, top: r.top - dy, width: r.width, height: r.height, bottom: r.bottom - dy };
  }
  function saldoPlek(){
    const groot = $("eikelBtn"), slim = $("slimEikel");
    if (groot && !groot.hidden){
      const r = groot.getBoundingClientRect();
      if (r.width > 0 && r.top >= 0 && r.bottom <= innerHeight) return { el: groot, r };
    }
    if (slim && !slim.hidden && slim.getBoundingClientRect().width > 0) return { el: slim, r: slimRust(slim) };
    if (groot && !groot.hidden && groot.getBoundingClientRect().width > 0) return { el: groot, r: groot.getBoundingClientRect() };
    const m = $("menuBtn").getBoundingClientRect();
    return { el: null, r: { left: m.left - 92, top: Math.max(8, m.top + 2), width: 84, height: 36 } };
  }
  /* snel: niet wachten tot het spook-saldo is weggefaded (de volgende vlucht kan meteen; update 13) */
  async function vliegNaarSaldo(van, n, snel){
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
    const a = van.getBoundingClientRect();
    /* het doel volgt het saldo, ook als de pagina tijdens de vlucht schuift (update 19) */
    const volg = volgDoel(spook, () => saldoPlek().r, r => [r.left + 18, r.top + r.height / 2]);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, [x1, y1] = volg.xy();
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
            const [x1, y1] = volg.xy();
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
    const weg = wacht(700).then(() => { volg.stop(); spook.remove(); });
    if (!snel) await weg;
  }

  /* ---------- kalender openen en sluiten ---------- */
  async function open(){
    gekozen = null;
    $("adventPop").hidden = false;
    teken();
    await haal();
    if (!$("adventPop").hidden && !bezig) teken();
    stip();
    /* de eerste keer: uitlegblokjes in de kalender zelf (update 9). Het eerste blokje staat precies waar de kerst-mus zit;
       dan wacht de mus tot dat blokje weg is en vliegt hij daarna aan (Tom, 22 november) */
    const uitleg = typeof Nieuw !== "undefined" && stand().vandaag && (demo() || !Nieuw.gezien("advent"));
    if (uitleg) musWacht();
    const alBezig = typeof Nieuw !== "undefined" && Nieuw.bezigMet("advent");   // de uitleg loopt al (kalender twee keer geopend)
    if (typeof Nieuw !== "undefined" && stand().vandaag) Nieuw.blokjes("advent", [
      { na: $("adventSub"), tekst: "Van 1 tot en met 24 december mag er elke dag één vakje open, alleen dat van vandaag. Een gemist vakje is weg. Open je ze alle 24, dan word je Adventkampioen." },
      { na: $("adventGo"), tekst: "Tik op ‘Open cadeau’. Er zitten eikels in, sporen in de sneeuw om te raden, winterweetjes en een paar dingen die je nergens anders krijgt." }
    ], { altijd: demo(), wacht: 900 }).finally(() => { if (!alBezig) musLand(); });
  }
  /* kerst-mus: verstopt zolang het eerste uitlegblokje boven het rooster staat, daarna aanvliegen */
  let musKijk = null;
  function musWacht(){
    const grid = $("adventGrid"), sheet = grid.parentElement;
    if (grid.classList.contains("mus-wacht")) return;      // kalender twee keer geopend (wachtrij en knop): al aan het wachten
    grid.classList.add("mus-wacht");
    let blokGezien = false;
    if (musKijk) musKijk.disconnect();
    musKijk = new MutationObserver(() => {
      const boven = grid.previousElementSibling && grid.previousElementSibling.classList.contains("nw-blokje");
      if (boven) blokGezien = true; else if (blokGezien) musLand();
    });
    musKijk.observe(sheet, { childList: true });
  }
  function musLand(){
    const grid = $("adventGrid");
    if (musKijk){ musKijk.disconnect(); musKijk = null; }
    if (!grid.classList.contains("mus-wacht")) return;
    grid.classList.remove("mus-wacht");
    if (rustig() || $("adventPop").hidden || !grid.querySelector(".kerstmus")) return;
    /* een kopie vliegt boven de pop-up vanaf de linkerrand van het scherm naar de plek van de echte mus;
       die plek wordt elk beeld opnieuw gemeten, want de kalender kan intussen scrollen */
    const vlieger = document.createElement("div");
    vlieger.className = "musvlucht"; vlieger.innerHTML = KERSTMUS;
    const svg = vlieger.firstElementChild;
    grid.classList.add("mus-weg");
    $("adventPop").appendChild(vlieger);
    const plaats = () => {
      const echt = grid.querySelector(".kerstmus"); if (!echt) return null;
      const r = echt.getBoundingClientRect();
      vlieger.style.left = r.left + "px"; vlieger.style.top = r.top + "px"; vlieger.style.width = r.width + "px";
      return r;
    };
    const r = plaats();
    svg.style.setProperty("--sx", -(r.right + 24) + "px");
    svg.classList.add("vliegt");
    let loopt = true;
    const volg = () => { if (!loopt) return; plaats(); requestAnimationFrame(volg); };
    requestAnimationFrame(volg);
    const klaar = () => { if (!loopt) return; loopt = false; vlieger.remove(); grid.classList.remove("mus-weg"); };
    svg.addEventListener("animationend", e => { if (e.target === svg) klaar(); });
    setTimeout(klaar, 2600);
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
  Wachtrij.voeg({ id: "advent", prio: 1.2,      // update 79: vóór duel en weekpop-up, want een gemist vakje is weg
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
  return { versier, sneeuw, open, seizoen: winter, vlieg: vliegNaarSaldo, vonk };
})();
