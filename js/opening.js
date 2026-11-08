/* Vestigia – openingsanimatie (ongeveer 2 seconden, één keer per sessie).
   1. Effen groen, in de kleur van het opstartscherm van de telefoon.
   2. Eén pootafdruk, dan steeds meer, als een spoor schuin over het scherm; het beeld zoomt langzaam in.
   3. De afdrukken worden onscherp en doorzichtig; eerst verschijnt het woord Vestigia op zijn plek in de kop,
      daarna komt de rest van de app op. De app is er dan al: hij laadt onder de animatie door.
   Een tik of toets slaat de animatie over. Bij ‘minder beweging’ alleen een korte overvloeiing.
   Het spoor is nooit van de soort van de dagcasus van vandaag of de komende acht dagen, anders is het een hint. */
"use strict";

const Opening = (() => {
  const KEY = "vestigia:geopend";
  function kiesSoort(){
    const today = todayIndex(), bezet = new Set(Array.from({ length: 9 }, (_, k) => daily(today + k).id));
    const vrij = Object.keys(SPOREN).filter(k => !bezet.has(SPOREN[k].soort));
    return vrij.length ? vrij[Math.floor(Math.random() * vrij.length)] : null;
  }
  /* Zoveel prenten dat het spoor ongeveer de diagonaal van het scherm beslaat (hooguit 14). */
  function spoor(id, u){
    const diag = Math.hypot(innerWidth, innerHeight) * 0.68;
    let n = 2, pts = spoorPatroon(id, n);
    while (n < 14){
      const ys = pts.map(p => p.y);
      if ((Math.max(...ys) - Math.min(...ys)) * u >= diag || pts.length >= 14) break;
      n++; pts = spoorPatroon(id, n);
    }
    return pts.slice(0, 14).sort((a, b) => b.y - a.y);     // van achter naar voor: zo verschijnen ze
  }

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
        el.style.transition = `opacity ${snel ? 0.15 : 0.45}s ease`;
        el.classList.add("weg");
        setTimeout(() => { el.remove(); resolve(); }, snel ? 160 : 460);
      }
      el.addEventListener("pointerdown", () => einde(true), { once: true });
      addEventListener("keydown", () => einde(true), { once: true });

      const id = kiesSoort();
      if (matchMedia("(prefers-reduced-motion: reduce)").matches || !id){ later(250, () => einde(false)); return; }

      /* het spoor: schuin van linksonder naar rechtsboven, vanuit het midden van het scherm */
      const veld = $("opVeld"), u = Math.min(innerWidth, innerHeight) * (innerWidth < 700 ? 0.13 : 0.085);
      const pts = spoor(id, u), ys = pts.map(p => p.y), mid = (Math.max(...ys) + Math.min(...ys)) / 2;
      veld.innerHTML = pts.map((p, i) => {
        const t = `rotate(${p.r}deg)${p.spiegel ? " scaleX(-1)" : ""}`;
        return prentSVG(id, p.voet, `width="${u}" height="${u * 1.1}" style="left:${p.x * u - u / 2}px;top:${(p.y - mid) * u - u * 0.55}px;--t:${t};animation-delay:${120 + i * Math.round(900 / pts.length)}ms"`);
      }).join("");
      el.setAttribute("data-soort", id);
      requestAnimationFrame(() => requestAnimationFrame(() => veld.classList.add("zoom")));

      /* het woord Vestigia precies op de plek van de naam in de kop */
      later(1250, () => {
        const echt = document.querySelector("#masthead .mh-name"), naam = $("opNaam");
        if (echt){
          const r = echt.getBoundingClientRect(), cs = getComputedStyle(echt);
          Object.assign(naam.style, { left: r.left + "px", top: r.top + "px", fontSize: cs.fontSize, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing });
          naam.classList.add("zicht");
        }
      });
      later(1300, () => veld.classList.add("vaag"));
      later(1550, () => einde(false));
    });
  }
  return { run };
})();
