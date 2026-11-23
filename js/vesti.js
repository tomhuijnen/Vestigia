/* Vesti, de mascotte (update 81): een scout-eekhoorn met vest die de uitleg geeft en meeleeft.
   Waar hij staat (Tom, 22–23 november 2026):
   - welkom voor nieuwe spelers: groot, stelt zich voor (‘Hoi! Ik ben Vesti.’);
   - tutorial: zijn koppie over de rand van het oplichtende kader (of van het kaartje als dat erboven staat), met een wolkje;
   - uitleg-pop-ups (tweelingsoort) en de meldingen in de wachtrij met een wolkje (VESTI_WOLKJES): op de telefoon koppie over
     de bovenrand, op de laptop staat hij naast de melding en kijkt ernaar;
   - uitslag van een casus: juicht bij goed, teleurgesteld bij niet gedetermineerd;
   - pop-up bij een prestatie of mijlpaal: juicht, voeten op de hoogte van de onderkant van de medaille;
   - ranglijst zonder verbinding: hij slaapt.
   Niet bij de oefencasus, foute gokken en de adventkalender (daar zit in december de kerst-mus).
   Aan na de Wrapped: zodra je de Wrapped zag (vestigia:wrapped-gezien, zet update 29) of vanaf vr 8 januari 2027.
   Testen met ?vesti=demo. Met ‘minder beweging’ staat hij stil (css). Tekeningen: data/vesti.js (node tools/vesti.mjs). */
const Vesti = (() => {
  const VANAF = Date.parse("2027-01-08T00:00:00+01:00");
  const demo = /[?&]vesti=demo\b/.test(location.search);
  function aan(){
    if (typeof VESTI_TEKENING === "undefined") return false;
    if (demo) return true;
    try { if (localStorage.getItem("vestigia:wrapped-gezien")) return true; } catch(e){}
    return Date.now() >= VANAF;
  }
  const laptop = () => matchMedia("(min-width:900px)").matches;
  const INTRO = "vestigia:nieuw:vesti";   // Vesti heeft zich voorgesteld (gaat mee naar je andere apparaten)
  if (aan()) document.documentElement.classList.add("vesti-aan");
  const RAND = 136 / 144, KIJK_H = 144 / 140, HEEL_H = 258 / 232, VOET = 0.961;

  function blok(svg, cls){
    const d = document.createElement("div");
    d.className = "vesti-plek " + cls;
    d.setAttribute("aria-hidden", "true");
    d.innerHTML = svg;
    return d;
  }
  const heel = (u, cls) => blok(VESTI_TEKENING.heel[u], cls);

  /* ---------- Vesti bij een melding of de tutorial: zweeft mee met de rand (fixed, want .sheet heeft overflow:auto) ---------- */
  let actief = null;   // { els: [...], volg: () => void, raf }
  function weg(){
    if (!actief) return;
    cancelAnimationFrame(actief.raf);
    actief.els.forEach(e => e.remove());
    actief = null;
  }
  function wolk(w){
    const d = document.createElement("div");
    d.className = "vesti-wolk " + (w.soort === "gedachte" ? "gedachte" : "spraak");
    d.setAttribute("role", "note");
    d.textContent = w.tekst;
    return d;
  }
  /* doel(): het element waar Vesti over kijkt; opzij: op de laptop naast de melding staan (achter de rand) */
  function bij(doel, w, { opzij = false, breed = laptop() ? 100 : 108, rechts = 22, achter = null } = {}){
    weg();
    const el = doel(); if (!el) return;
    const gezicht = w ? w.gezicht : "leest";
    const v = blok(opzij ? VESTI_TEKENING.opzij[gezicht] : VESTI_TEKENING.kijkt[gezicht], opzij ? "vesti-opzij" : "vesti-kijkt");
    const b = w ? wolk(w) : null;
    if (opzij && achter){ achter.insertBefore(v, el); el.classList.add("vesti-voor"); }
    else document.body.appendChild(v);
    if (b) document.body.appendChild(b);
    const zet = () => {
      const t = doel(); if (!t || !t.isConnected){ weg(); return; }
      const r = t.getBoundingClientRect();
      if (opzij){
        const bw = 170, h = bw * HEEL_H;
        Object.assign(v.style, { width: bw + "px", left: (r.left - bw * .66) + "px", top: (r.bottom - h * VOET - 14) + "px" });
      } else {
        const h = breed * KIJK_H;
        Object.assign(v.style, { width: breed + "px", left: (r.right - rechts - breed) + "px", top: (r.top - h * RAND) + "px" });
      }
      if (b){
        const vr = v.getBoundingClientRect();
        const bw = b.offsetWidth, bh = b.offsetHeight;   // offset*: niet beïnvloed door de verschijn-animatie
        b.style.left = Math.max(8, vr.left - bw - 14) + "px";
        b.style.top = Math.max(8, vr.top + vr.height * (opzij ? .18 : .30) - bh / 2) + "px";
      }
    };
    actief = { els: b ? [v, b] : [v], raf: 0 };
    if (opzij && achter) actief.els.push({ remove: () => el.classList.remove("vesti-voor") });
    const lus = () => { if (!actief) return; zet(); actief.raf = requestAnimationFrame(lus); };
    zet(); actief.raf = requestAnimationFrame(lus);
  }

  /* ---------- per plek ---------- */
  /* Welkom: Vesti in plaats van het pootje, en hij stelt zich voor */
  function welkom(kaart){
    if (!aan() || !kaart) return;
    const poot = kaart.querySelector(".wk-poot");
    if (poot){ poot.className = "wk-vesti"; poot.innerHTML = ""; poot.appendChild(heel("uitleg", "")); }
    const h = kaart.querySelector("#welkomH"); if (h) h.innerHTML = "Hoi! Ik ben Vesti.<br>Welkom bij Vestigia!";
    const f = kaart.querySelector(".wk-fijn"); if (f) f.textContent = "Hierna leg ik je de app uit in vijf stappen.";
    try { localStorage.setItem(INTRO, "1"); } catch(e){}   // een nieuwe speler leert Vesti hier kennen
  }
  /* Tutorial: over het oplichtende kader; staat het kaartje erboven, dan over het kaartje */
  function tutorial(i, spot, kaart, boven){
    if (!aan()) return;
    const w = VESTI_WOLKJES["tutorial-" + (i + 1)];
    const doel = boven ? kaart : spot;
    if (actief && actief.sleutel === "t" + i + (boven ? "b" : "")) return;
    bij(() => doel.isConnected ? doel : null, w, { breed: laptop() ? 96 : 100, rechts: 18 });
    if (actief) actief.sleutel = "t" + i + (boven ? "b" : "");
  }
  /* Een melding in #wachtPop of de uitleg over tweelingsoorten */
  function melding(id, pop){
    if (!aan()) return;
    const w = VESTI_WOLKJES[id]; if (!w) return;
    const sheet = () => { const s = pop.querySelector(".sheet"); return !pop.hidden && s ? s : null; };
    if (!sheet()) return;
    if (laptop()) bij(sheet, w, { opzij: true, achter: pop });
    else bij(sheet, w, { breed: 112, rechts: 30 });
  }
  /* Uitslag van een casus: naast ‘Toelichting’ en ‘Nieuwe casus’, in de lege ruimte rechts */
  function uitslag(card, won){
    if (!aan() || !card) return;
    const t = card.querySelector(".toelrij"), n = card.querySelector(".oefenverder");
    const eerste = t || n; if (!eerste) return;
    const rij = document.createElement("div"); rij.className = "vesti-uitslag";
    const links = document.createElement("div"); links.className = "vu-links";
    eerste.parentElement.insertBefore(rij, eerste);
    rij.appendChild(links);
    if (t) links.appendChild(t);
    const box = card.querySelector("#toelBox"); if (box && t) links.appendChild(box);
    if (n) links.appendChild(n);
    rij.appendChild(heel(won ? "juicht" : "teleurgesteld", "vu-vesti"));
  }
  /* Prestatie of mijlpaal: links van de medaille */
  function prestatie(body){
    if (!aan() || !body) return;
    const b = body.querySelector(".belbadge"); if (!b) return;
    b.classList.add("met-vesti");
    b.appendChild(heel("juicht", "vb-vesti"));
  }
  /* Ranglijst zonder verbinding */
  const slaapt = () => aan() ? `<span class="vesti-slaapt" aria-hidden="true">${VESTI_TEKENING.heel.slaapt}</span>` : "";

  /* Voorstellen (Tom, 23 november 2026): wie al speelde maar de Wrapped niet zag, krijgt één pop-up waarin Vesti zich
     voorstelt, zodat hij voor niemand uit het niets in de app staat. In de Wrapped stelt hij zich zelf voor; een nieuwe
     speler leert hem kennen in het welkom. Als losse melding vóór alles (prio 0,9): de combi-pop-up met Vesti komt dan pas
     de volgende keer. Voorbeeld: ?vesti=demo&voorstellen=1 */
  function voorstellenNodig(){
    if (!aan()) return false;
    if (demo && /[?&]voorstellen=1\b/.test(location.search)) return true;
    try { if (localStorage.getItem(INTRO) || localStorage.getItem("vestigia:wrapped-gezien")) return false; } catch(e){ return false; }
    const st = store.get();
    return (st.log || []).length > 0 || Object.keys(st.dex || {}).length > 0;   // speelde al eerder
  }
  function voorstellen(){
    try { localStorage.setItem(INTRO, "1"); } catch(e){}
    return new Promise(klaar => {
      const pop = $("wachtPop"), body = $("wachtBody");
      const dicht = () => { pop.hidden = true; pop.classList.remove("nieuw", "vesti-intro"); document.removeEventListener("keydown", esc_, true); klaar(); };
      const esc_ = e => { if (e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); dicht(); } };
      body.innerHTML = `
        <div class="nw-kop"><span class="caps">Nieuw in Vestigia</span></div>
        <div class="vi-vesti" aria-hidden="true">${VESTI_TEKENING.heel.uitleg}</div>
        <div class="nw-stap"><h2 id="wachtH">Hoi! Ik ben Vesti.</h2>
          <p>Vanaf nu ben ik je veldgids in Vestigia. Ik leg nieuwe dingen uit, kijk af en toe met je mee en juich als je een soort goed hebt.</p>
          <p class="vi-fijn">Speel je een casus niet goed? Dan baal ik gewoon even met je mee.</p></div>
        <div class="nw-knoppen"><button class="btn" id="viOk">Hoi Vesti!</button></div>`;
      $("viOk").onclick = dicht;
      pop.classList.add("nieuw", "vesti-intro");
      pop.hidden = false;
      document.addEventListener("keydown", esc_, true);
      $("viOk").focus({ preventScroll: true });
    });
  }
  if (typeof Wachtrij !== "undefined") Wachtrij.voeg({ id: "vestivoorstellen", prio: 0.9, kan: voorstellenNodig, toon: voorstellen });

  return { aan, welkom, tutorial, melding, uitslag, prestatie, slaapt, weg, voorstellen };
})();
