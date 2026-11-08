/* Vestigia – uitleg bij de eerste keer: vijf korte kaartjes die naar het echte onderdeel wijzen.
   De rest van het scherm wordt donkerder. Steeds ‘Volgende’ en ‘Overslaan’; Esc slaat ook over.
   Start vanzelf alleen bij nieuwe spelers (nog niets gespeeld en geen spelersnaam). Wie al speelde, krijgt eenmalig
   een melding dat de uitleg in het menu staat. Daar staat hij ook voor iedereen: ‘Uitleg opnieuw bekijken’. */
"use strict";

const Uitleg = (() => {
  const KEY = "vestigia:tutorial";
  const STAPPEN = [
    { doel: () => document.querySelector("#clues li"), kop: "Waarnemingen",
      tekst: "Je begint met één waarneming: de locatie en het seizoen. Bij elke foute determinatie komt er een waarneming bij." },
    { doel: () => $("gInput").closest(".det-row"), kop: "Determinatie",
      tekst: "Typ een Nederlandse of wetenschappelijke naam en kies de soort uit de lijst." },
    { doel: () => $("gridH").closest("section"), kop: "Vergelijkingstabel",
      tekst: "Groen is gelijk, geel is overlap, grijs is anders. De pijl bij lengte wijst naar de gezochte soort." },
    { doel: () => $("pips").closest(".det-status"), kop: "Pogingen",
      tekst: "Je hebt vijf pogingen. Gok je de tweelingsoort van het antwoord, dan telt die poging niet mee." },
    { doel: () => document.querySelector(".modebar"), kop: "Modus en menu",
      tekst: "Hier wissel je tussen klassiek en expert. In het menu (☰) vind je oefenen, het Vestiarium en de ranglijst." }
  ];
  const gezien = () => { try { return !!localStorage.getItem(KEY); } catch(e){ return true; } };
  const markeer = () => { try { localStorage.setItem(KEY, "1"); } catch(e){} };
  /* nieuw = nog geen enkel spel, plaat of spelersnaam */
  function nieuweSpeler(){
    const st = store.get();
    return !Object.keys(st.dex || {}).length && !Object.keys(st.games || {}).length && !(st.log || []).length && !online.player();
  }

  let root = null, stap = 0, klaar = null, doelEl = null;
  function plaats(){
    if (!root || !doelEl) return;
    const r = doelEl.getBoundingClientRect(), pad = 8, spot = root.querySelector(".ui-spot"), kaart = root.querySelector(".ui-kaart");
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
    if (doelEl) doelEl.scrollIntoView({ block: "center", behavior: "auto" });
    root.querySelector(".ui-teller").textContent = `Stap ${i + 1} van ${STAPPEN.length}`;
    root.querySelector("#uitlegH").textContent = s.kop;
    root.querySelector(".ui-tekst").textContent = s.tekst;
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
    if (gezien()) return Promise.resolve();
    if (nieuweSpeler()) return start();
    markeer();
    toast("Nieuw: een korte uitleg van het spel staat in het menu (☰).");
    return Promise.resolve();
  }
  return { start, automatisch, STAPPEN };
})();
