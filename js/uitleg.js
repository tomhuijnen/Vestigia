/* Vestigia – uitleg bij de eerste keer: vijf korte kaartjes die naar het echte onderdeel wijzen (een rondleiding).
   De rest van het scherm wordt donkerder. Steeds ‘Volgende’ en ‘Overslaan’; Esc slaat ook over.
   Start vanzelf alleen bij nieuwe spelers (nog niets gespeeld en geen spelersnaam). Wie al speelde, krijgt eenmalig
   een melding dat de uitleg in het menu staat. Daar staat hij ook voor iedereen: ‘Uitleg opnieuw bekijken’. */
"use strict";

const Uitleg = (() => {
  const KEY = "vestigia:tutorial";
  /* Vijf stappen, een korte maar volledige rondleiding voor iemand die Vestigia nog nooit zag (12 november 2026).
     Werkregel: bij elk nieuw onderdeel hier kijken of het erin hoort en of het geheel nog te volgen is. Langer dan
     vijf stappen wordt het niet: iets nieuws krijgt een bijzin in een bestaande stap, of uitleg op het moment zelf
     (js/nieuw.js). Wat nog niet aan staat (levels, spelersduel), noemt de uitleg ook niet.
     tekst mag een functie zijn; doel mag een lijst elementen geven (de lichtvlek omvat ze dan allemaal). */
  const levelsAan = () => typeof Levels !== "undefined" && Levels.zichtbaar && Levels.zichtbaar();
  const duelAan = () => typeof Duel !== "undefined" && Duel.zichtbaar && Duel.zichtbaar();
  const STAPPEN = [
    { doel: () => document.querySelector("#clues li"), kop: "Welk dier is dit?",
      tekst: "Elke dag is er één dagcasus, voor iedereen dezelfde: een waarneming van een beschermde diersoort in Nederland. Je begint met één waarneming: de locatie en het seizoen. Een gemiste dag kun je tot 3 dagen later nog inhalen." },
    { doel: () => $("gInput").closest(".det-row"), kop: "Determineer de soort",
      tekst: "Typ de Nederlandse of wetenschappelijke naam, of een groep zoals ‘uil’ of ‘vleermuis’, en kies de soort uit de lijst. Je hebt vijf pogingen. Na elke foute gok krijg je een extra waarneming, en de tabel laat zien wat klopt." },
    { doel: () => document.querySelector(".modebar"), kop: "Klassiek of expert",
      tekst: "Klassiek: vijf pogingen, en na elke foute gok een waarneming erbij. Expert: je opent zelf waarnemingen en hebt één poging. Voor de ranglijst telt alleen de modus die je die dag als eerste speelt." },
    { doel: () => $("tabbar"), kop: "Onderin",
      tekst: () => `Ranglijst: van vandaag, deze week en altijd, ook in een eigen league met andere spelers. Spelen: de dagcasus, oefenen per diergroep${duelAan() ? " en het spelersduel" : ""}. ${NAAM.vestiarium}: elke soort die je vindt, krijgt daar een plaat.` },
    { doel: () => [$("eikelBtn"), $("menuBtn")], kop: "Rechtsboven",
      tekst: () => `Met spelen verdien je eikels${levelsAan() ? " en ervaringspunten; de ring om je avatar laat je level zien" : ""}. Onder je avatar vind je je profiel, de shop, je statistieken en de spelregels, waar je deze uitleg terugvindt. Af en toe duikt er een verrassing op, zoals een dwaalgast. Dan krijg je ter plekke uitleg.` }
  ];
  const NAV = "vestigia:nav-b";
  const gezien = () => { try { return !!localStorage.getItem(KEY); } catch(e){ return true; } };
  const markeer = () => { try { localStorage.setItem(KEY, "1"); } catch(e){} };
  /* nieuw = nog geen enkel spel, plaat of spelersnaam */
  function nieuweSpeler(){
    const st = store.get();
    return !Object.keys(st.dex || {}).length && !Object.keys(st.games || {}).length && !(st.log || []).length && !online.player();
  }

  let root = null, stap = 0, klaar = null, doelEl = null;
  /* zichtbaar, ook als het vast in beeld staat (position: fixed, zoals de tabbalk) */
  const zichtbaar = e => !!e && !e.hidden && e.getClientRects().length > 0;
  /* één element of een lijst: de rechthoek om alles wat zichtbaar is */
  function rechthoek(d){
    const els = (Array.isArray(d) ? d : [d]).filter(zichtbaar);
    if (!els.length) return { left: innerWidth / 2, right: innerWidth / 2, top: innerHeight / 3, bottom: innerHeight / 3, width: 0, height: 0 };
    const rs = els.map(e => e.getBoundingClientRect());
    const left = Math.min(...rs.map(x => x.left)), top = Math.min(...rs.map(x => x.top)), right = Math.max(...rs.map(x => x.right)), bottom = Math.max(...rs.map(x => x.bottom));
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  }
  function plaats(){
    if (!root || !doelEl) return;
    const r = rechthoek(doelEl), pad = 8, spot = root.querySelector(".ui-spot"), kaart = root.querySelector(".ui-kaart");
    Object.assign(spot.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
    const kw = kaart.offsetWidth, kh = kaart.offsetHeight, gap = 14;
    const onder = r.bottom + pad + gap + kh <= innerHeight - 8;
    const top = onder ? r.bottom + pad + gap : Math.max(8, r.top - pad - gap - kh);
    const left = Math.min(Math.max(12, r.left + r.width / 2 - kw / 2), innerWidth - kw - 12);
    Object.assign(kaart.style, { top: top + "px", left: left + "px" });
    kaart.classList.toggle("boven", !onder);
  }
  function toon(i){
    stap = i;
    const s = STAPPEN[i];
    doelEl = s.doel();
    const eerste = (Array.isArray(doelEl) ? doelEl : [doelEl]).find(zichtbaar);
    if (eerste) eerste.scrollIntoView({ block: "center", behavior: "auto" });
    root.querySelector(".ui-teller").textContent = `Stap ${i + 1} van ${STAPPEN.length}`;
    root.querySelector("#uitlegH").textContent = s.kop;
    root.querySelector(".ui-tekst").textContent = typeof s.tekst === "function" ? s.tekst() : s.tekst;
    const volg = root.querySelector(".ui-volgende");
    volg.textContent = i === STAPPEN.length - 1 ? "Aan de slag" : "Volgende";
    root.querySelector(".ui-overslaan").hidden = i === STAPPEN.length - 1;
    requestAnimationFrame(plaats);
    volg.focus({ preventScroll: true });
  }
  function stop(){
    if (!root) return;
    markeer();
    removeEventListener("resize", plaats); removeEventListener("scroll", plaats, true);
    document.removeEventListener("keydown", toets, true);
    root.remove(); root = null; doelEl = null;
    setInert(false);
    window.scrollTo({ top: 0, behavior: "auto" });
    $("menuBtn").focus({ preventScroll: true });
    const k = klaar; klaar = null; if (k) k();
  }
  function toets(e){
    if (!root) return;
    if (e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); stop(); }
    else if (e.key === "Tab"){   // de focus blijft op het kaartje
      const f = [...root.querySelectorAll("button:not([hidden])")];
      const i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }
  function start(){
    return new Promise(resolve => {
      if (root){ resolve(); return; }
      klaar = resolve;
      if (VIEW !== "game" || S.mode !== "daily") startDaily();
      root = document.createElement("div");
      root.className = "uitleg";
      root.innerHTML = `<div class="ui-spot"></div>
        <div class="ui-kaart" role="dialog" aria-modal="true" aria-labelledby="uitlegH" aria-describedby="uitlegT">
          <span class="caps ui-teller"></span><h2 id="uitlegH"></h2><p id="uitlegT" class="ui-tekst"></p>
          <div class="ui-knoppen"><button class="linklike ui-overslaan">Overslaan</button><button class="btn ui-volgende">Volgende</button></div>
        </div>`;
      document.body.appendChild(root);
      setInert(true);
      root.querySelector(".ui-overslaan").onclick = stop;
      root.querySelector(".ui-volgende").onclick = () => stap < STAPPEN.length - 1 ? toon(stap + 1) : stop();
      addEventListener("resize", plaats); addEventListener("scroll", plaats, true);
      document.addEventListener("keydown", toets, true);
      toon(0);
    });
  }
  /* Na de openingsanimatie: nieuwe spelers krijgen de uitleg, anderen eenmalig een melding. */
  function automatisch(){
    const navGezien = (() => { try { const g = !!localStorage.getItem(NAV); localStorage.setItem(NAV, "1"); return g; } catch(e){ return true; } })();
    if (gezien()){
      if (!navGezien) toast(`Nieuw: onderin staan nu Ranglijst, Spelen en je ${NAAM.vestiarium}. Het menu zit onder je avatar rechtsboven.`);
      return Promise.resolve();
    }
    if (nieuweSpeler()) return start();
    markeer();
    toast("Nieuw: een korte uitleg van het spel staat in het menu (tik op je avatar rechtsboven).");
    return Promise.resolve();
  }
  return { start, automatisch, STAPPEN };
})();
