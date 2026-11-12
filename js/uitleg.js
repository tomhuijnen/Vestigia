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
     (js/nieuw.js). Wat nog niet aan staat (levels, spelersduel), noemt de uitleg ook niet. De dwaalgast noemt hij
     bewust niet: die moet een verrassing blijven tot je hem voor het eerst ziet.
     tekst mag een functie zijn; doel mag een lijst elementen geven (de lichtvlek omvat ze dan allemaal). */
  const levelsAan = () => typeof Levels !== "undefined" && Levels.zichtbaar && Levels.zichtbaar();
  const duelAan = () => typeof Duel !== "undefined" && Duel.zichtbaar && Duel.zichtbaar();
  const naam = () => online.enabled && !!online.player();
  const STAPPEN = [
    { doel: () => document.querySelector("#clues li"), kop: "Welk dier is dit?",
      tekst: "Elke dag is er één dagcasus, voor iedereen dezelfde: een waarneming van een beschermde diersoort in Nederland. Je begint met één waarneming, de locatie en het seizoen. Bij elke foute gok komt er een waarneming bij, en die worden steeds specifieker: van het habitat tot een spoor, geluid of kenmerk." },
    { doel: () => $("gInput").closest(".det-row"), kop: "Determineer de soort",
      tekst: "Typ de Nederlandse of wetenschappelijke naam, of een groep zoals ‘uil’ of ‘vleermuis’, en kies de soort uit de lijst. Je hebt vijf pogingen. Na elke foute gok zie je ook wat jouw soort en de gezochte soort gemeen hebben, of waarin ze verschillen." },
    { doel: () => document.querySelector(".modebar"), kop: "Klassiek of expert",
      tekst: "Klassiek: vijf pogingen, en na elke foute gok een waarneming erbij. Expert: je opent zelf waarnemingen en hebt één poging. Voor de ranglijst telt alleen de modus die je die dag als eerste speelt." },
    { doel: () => $("tabbar"), kop: "Ranglijst, Spelen en Vestiarium",
      tekst: () => `Met de balk onderaan het scherm ga je naar de rest van de app. Bij Ranglijst zie je hoe je het doet ten opzichte van andere spelers, ook in een eigen league. Via Spelen kies je de dagcasus of oefen je per diergroep${duelAan() ? ", en daag je iemand uit voor een spelersduel" : ""}. In het ${NAAM.vestiarium} krijgt elke soort die je vindt een eigen plaat.` },
    { doel: () => [$("eikelBtn"), $("menuBtn")], kop: "Je avatar en het menu",
      tekst: () => (naam()
        ? `Rechtsboven staan je eikels en je avatar${levelsAan() ? ", met je level in de ring eromheen" : ""}. Eikels verdien je met spelen en besteed je in de shop.`
        : `Kies je straks een spelersnaam, dan verdien je met spelen eikels${levelsAan() ? " en ervaringspunten" : ""}, en verschijnt je saldo naast je avatar. Eikels besteed je in de shop.`)
       + " Tik op je avatar voor je profiel, de shop, je statistieken en de spelregels, waar je deze uitleg terugvindt." }
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
  /* Het kaartje mag de lichtvlek nooit bedekken (12 november 2026). Volgorde: eronder, erboven, ernaast (breed scherm);
     past het nergens, dan schuift de pagina één keer zo dat het doel bovenin staat, en dan opnieuw proberen. */
  let geschoven = false;
  const rustig = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function plaats(){
    if (!root || !doelEl) return;
    const r = rechthoek(doelEl), pad = 8, spot = root.querySelector(".ui-spot"), kaart = root.querySelector(".ui-kaart");
    Object.assign(spot.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
    const kw = kaart.offsetWidth, kh = kaart.offsetHeight, gap = 14, rand = 8;
    const midX = Math.min(Math.max(12, r.left + r.width / 2 - kw / 2), innerWidth - kw - 12);
    const midY = Math.min(Math.max(rand, r.top - pad), innerHeight - kh - rand);
    let top, left, kant;
    if (r.bottom + pad + gap + kh <= innerHeight - rand){ kant = "onder"; top = r.bottom + pad + gap; left = midX; }
    else if (r.top - pad - gap - kh >= rand){ kant = "boven"; top = r.top - pad - gap - kh; left = midX; }
    else if (r.right + pad + gap + kw <= innerWidth - 12){ kant = "rechts"; top = midY; left = r.right + pad + gap; }
    else if (r.left - pad - gap - kw >= 12){ kant = "links"; top = midY; left = r.left - pad - gap - kw; }
    else if (!geschoven){
      geschoven = true;
      const voor = scrollY;
      window.scrollBy({ top: r.top - 72, behavior: "auto" });   // onder de smalle balk bovenin
      if (scrollY !== voor){ requestAnimationFrame(plaats); return; }
    }
    if (!kant){ kant = "onder"; top = Math.max(rand, innerHeight - kh - rand); left = midX; }   // laatste uitweg
    Object.assign(kaart.style, { top: top + "px", left: left + "px" });
    kaart.classList.toggle("boven", kant === "boven");
  }
  function toon(i){
    stap = i;
    const s = STAPPEN[i];
    doelEl = s.doel();
    geschoven = false;
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
  /* intro (optioneel): { rect, el } van de welkomstmelding. Dan groeit de lichtvlek vanuit die melding naar het
     eerste onderdeel, en komt het kaartje er zacht achteraan; de melding zelf vervaagt intussen (12 november 2026). */
  function start(intro){
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
      if (intro && intro.rect && !rustig()){
        const w = intro.rect;
        root.classList.add("intro");
        Object.assign(root.querySelector(".ui-spot").style, { left: w.left + "px", top: w.top + "px", width: w.width + "px", height: w.height + "px" });
        setTimeout(() => root && root.classList.remove("intro"), 1100);
      }
      document.body.appendChild(root);
      /* de achtergrond van de welkomstmelding heeft dezelfde tint als de lichtvlek: meteen weg, dan wordt het nooit dubbel donker */
      if (intro && intro.el){ intro.el.style.background = "transparent"; setTimeout(() => intro.el.remove(), 400); }
      setInert(true);
      root.querySelector(".ui-overslaan").onclick = stop;
      root.querySelector(".ui-volgende").onclick = () => stap < STAPPEN.length - 1 ? toon(stap + 1) : stop();
      addEventListener("resize", plaats); addEventListener("scroll", plaats, true);
      document.addEventListener("keydown", toets, true);
      toon(0);
    });
  }
  /* Welkom (12 november 2026): de allereerste melding voor een nieuwe speler, midden in beeld, vóór de uitleg.
     Wat Vestigia is, dat leren op een leuke manier het doel is, en dat er nu een korte uitleg volgt. */
  function welkom(){
    return new Promise(klaar => {
      const el = document.createElement("div");
      el.className = "uitleg welkom";
      el.innerHTML = `<div class="wk-kaart" role="dialog" aria-modal="true" aria-labelledby="welkomH">
          <span class="wk-poot" aria-hidden="true"><svg viewBox="0 0 22 22" width="34" height="34" fill="currentColor"><ellipse cx="11" cy="14" rx="4.2" ry="3.6"/><ellipse cx="5.5" cy="8.6" rx="1.7" ry="2.2"/><ellipse cx="9" cy="5.6" rx="1.7" ry="2.3"/><ellipse cx="13" cy="5.6" rx="1.7" ry="2.3"/><ellipse cx="16.5" cy="8.6" rx="1.7" ry="2.2"/></svg></span>
          <h2 id="welkomH">Welkom bij Vestigia!</h2>
          <p>Vestigia is een dagelijks determinatiespel over de beschermde dieren van Nederland. Elke dag herken je een soort aan waarnemingen in het veld: waar hij leeft, welke sporen hij achterlaat en hoe hij klinkt.</p>
          <p><b>Op een leuke manier leren staat voorop.</b> Elke casus die je speelt, maakt je een betere soortkenner.</p>
          <p class="wk-fijn">Hierna volgt een korte uitleg van de app in vijf stappen.</p>
          <button class="btn wk-door" type="button">Doorgaan</button>
        </div>`;
      document.body.appendChild(el);
      setInert(true);
      const knop = el.querySelector(".wk-door");
      let weg = false;
      const door = () => {
        if (weg) return; weg = true;
        document.removeEventListener("keydown", toets_, true);
        const kaart = el.querySelector(".wk-kaart"), rect = kaart.getBoundingClientRect();
        if (rustig()){ el.remove(); setInert(false); klaar(); return; }
        kaart.classList.add("weg");
        el.style.pointerEvents = "none";
        setTimeout(() => { setInert(false); klaar({ rect, el }); }, 180);
      };
      const toets_ = e => { if (e.key === "Escape" || e.key === "Tab"){ e.preventDefault(); e.stopPropagation(); if (e.key === "Escape") door(); } };
      knop.onclick = door;
      document.addEventListener("keydown", toets_, true);
      knop.focus({ preventScroll: true });
    });
  }
  /* Na de openingsanimatie: nieuwe spelers krijgen het welkom en de uitleg, anderen eenmalig een melding. */
  function automatisch(){
    const navGezien = (() => { try { const g = !!localStorage.getItem(NAV); localStorage.setItem(NAV, "1"); return g; } catch(e){ return true; } })();
    if (gezien()){
      if (!navGezien) toast(`Nieuw: onderin staan nu Ranglijst, Spelen en je ${NAAM.vestiarium}. Het menu zit onder je avatar rechtsboven.`);
      return Promise.resolve();
    }
    if (nieuweSpeler()){
      if (VIEW !== "game" || S.mode !== "daily") startDaily();
      return welkom().then(intro => start(intro));
    }
    markeer();
    toast("Nieuw: een korte uitleg van het spel staat in het menu (tik op je avatar rechtsboven).");
    return Promise.resolve();
  }
  return { start, automatisch, STAPPEN };
})();
