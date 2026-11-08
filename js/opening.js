/* Vestigia – openingsanimatie (2,5 seconde, één keer per sessie).
   1. Effen groen, in de kleur van het opstartscherm van de telefoon.
   2. Twee of drie dieren lopen tegelijk over het scherm: hun sporen verschijnen prent voor prent, elk in een eigen richting.
   3. ‘Vestigia’ komt groot in het midden op. De sporen vervagen en het woord schuift en krimpt naar zijn plek in de kop.
   4. Het groen vloeit weg en de app is er; die laadde al onder de animatie door.
   Prenten die achter de grote letters van ‘Vestigia’ zouden vallen, worden overgeslagen; het spoor loopt erna gewoon door.
   Een tik of toets slaat de animatie over. Bij ‘minder beweging’ alleen een korte overvloeiing.
   Een spoor is nooit van de soort van de dagcasus van vandaag of de komende acht dagen, anders is het een hint. */
"use strict";

const Opening = (() => {
  const KEY = "vestigia:geopend";
  /* tijdlijn in ms */
  const T = { naamIn: 600, wegLopen: 1500, naarKop: 1500, einde: 2150 };

  function kiesSoorten(n){
    const today = todayIndex(), bezet = new Set(Array.from({ length: 9 }, (_, k) => daily(today + k).id));
    const vrij = Object.keys(SPOREN).filter(k => !bezet.has(SPOREN[k].soort));
    for (let i = vrij.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [vrij[i], vrij[j]] = [vrij[j], vrij[i]]; }
    return vrij.slice(0, n);
  }
  /* Zoveel prenten dat het spoor ruim de diagonaal van het scherm beslaat: het dier loopt het beeld in en weer uit. */
  function spoor(id, u){
    const diag = Math.hypot(innerWidth, innerHeight) * 1.05;
    let n = 2, pts = spoorPatroon(id, n);
    while (n < 24){
      const ys = pts.map(p => p.y);
      if ((Math.max(...ys) - Math.min(...ys)) * u >= diag) break;
      n++; pts = spoorPatroon(id, n);
    }
    return pts.slice(0, 24).sort((a, b) => b.y - a.y);     // van achter naar voor: zo verschijnen ze
  }
  /* Drie looprichtingen die elkaar niet in het midden kruisen: links, midden en rechts, elk schuin omhoog. */
  const BANEN = [
    { hoek: 24, dwars: -0.36, langs: 0.08 },
    { hoek: 48, dwars: 0.02, langs: -0.12 },
    { hoek: 14, dwars: 0.38, langs: 0.05 }
  ];

  function run(){
    return new Promise(resolve => {
      const el = $("opening");
      if (!el || document.documentElement.classList.contains("geen-opening")){ if (el) el.remove(); resolve(); return; }
      try { sessionStorage.setItem(KEY, "1"); } catch(e){}
      const timers = [];
      let klaar = false;
      const later = (ms, fn) => timers.push(setTimeout(fn, ms));
      function einde(snel){
        if (klaar) return; klaar = true;
        timers.forEach(clearTimeout);
        el.style.transition = `opacity ${snel ? 0.15 : 0.35}s ease`;
        el.classList.add("weg");
        setTimeout(() => { el.remove(); resolve(); }, snel ? 160 : 360);
      }
      el.addEventListener("pointerdown", () => einde(true), { once: true });
      addEventListener("keydown", () => einde(true), { once: true });

      if (matchMedia("(prefers-reduced-motion: reduce)").matches){ later(250, () => einde(false)); return; }

      /* ‘Vestigia’: het woord staat op zijn eindplek, in de grote letter; een transform zet het in het midden
         en laat het later krimpen tot precies de naam in de kop. Zo blijft de letter scherp.
         Het wordt nu al (onzichtbaar) neergezet, zodat we weten waar de letters komen te staan. */
      let schaal = 1, letters = null;
      function zetNaam(){
        const echt = document.querySelector("#masthead .mh-name"), naam = $("opNaam");
        if (!echt) return;
        const r = echt.getBoundingClientRect(), cs = getComputedStyle(echt), klein = parseFloat(cs.fontSize);
        const groot = Math.min(innerWidth * 0.17, 112);
        schaal = groot / klein;
        const px = v => (isNaN(parseFloat(v)) ? v : parseFloat(v) * schaal + "px");
        Object.assign(naam.style, { left: r.left + "px", top: r.top + "px", fontSize: groot + "px", lineHeight: px(cs.lineHeight), letterSpacing: px(cs.letterSpacing) });
        const w = naam.offsetWidth, h = naam.offsetHeight;     // de tekst zelf; het vak in de kop kan breder zijn
        const x = innerWidth / 2 - w / 2, y = innerHeight * 0.47 - h / 2;
        naam.style.transform = `translate(${x - r.left}px, ${y - r.top}px)`;
        letters = { l: x, t: y, r: x + w, b: y + h };
      }
      zetNaam();

      /* de sporen */
      const ids = kiesSoorten(innerWidth < 360 ? 2 : 3), veld = $("opVeld");
      const kort = Math.min(innerWidth, innerHeight), u = kort * (innerWidth < 700 ? 0.095 : 0.06);
      const loopduur = 1250;
      veld.innerHTML = ids.map((id, j) => {
        const b = BANEN[j], pts = spoor(id, u), ys = pts.map(p => p.y), mid = (Math.max(...ys) + Math.min(...ys)) / 2;
        const rad = b.hoek * Math.PI / 180;
        const dx = Math.cos(rad) * b.dwars * innerWidth + Math.sin(rad) * b.langs * kort;
        const dy = Math.sin(rad) * b.dwars * innerWidth - Math.cos(rad) * b.langs * kort;
        const start = j * 170, stap = Math.round((loopduur - start) / pts.length);
        /* waar komt deze prent op het scherm? (het veld zoomt nog 8 % in, vandaar de ruime marge) */
        const cos = Math.cos(rad), sin = Math.sin(rad), marge = u * 0.7;
        const achterLetters = p => {
          if (!letters) return false;
          const lx = p.x * u, ly = (p.y - mid) * u;
          const sx = innerWidth / 2 + (dx + lx * cos - ly * sin) * 1.08, sy = innerHeight / 2 + (dy + lx * sin + ly * cos) * 1.08;
          return sx > letters.l - marge && sx < letters.r + marge && sy > letters.t - marge && sy < letters.b + marge;
        };
        return `<div class="op-spoor" data-soort="${id}" style="transform:translate(${dx}px,${dy}px) rotate(${b.hoek}deg)">` + pts.map((p, i) => {
          if (achterLetters(p)) return "";
          const t = `rotate(${p.r}deg)${p.spiegel ? " scaleX(-1)" : ""}`;
          return prentSVG(id, p.voet, `width="${u}" height="${u * 1.1}" style="left:${p.x * u - u / 2}px;top:${(p.y - mid) * u - u * 0.55}px;--t:${t};animation-delay:${start + i * stap}ms"`);
        }).join("") + `</div>`;
      }).join("");
      el.setAttribute("data-soorten", ids.join(" "));
      requestAnimationFrame(() => requestAnimationFrame(() => veld.classList.add("zoom")));

      /* ‘Vestigia’ verschijnt groot in het midden; de plek wordt nog eens bepaald voor het geval de letter intussen geladen is */
      later(T.naamIn, () => { zetNaam(); $("opNaam").classList.add("zicht"); });
      later(T.wegLopen, () => veld.classList.add("vaag"));
      later(T.naarKop, () => { const naam = $("opNaam"); naam.classList.add("naar"); naam.style.transform = `scale(${1 / schaal})`; });
      later(T.einde, () => einde(false));
    });
  }
  return { run, T };
})();
