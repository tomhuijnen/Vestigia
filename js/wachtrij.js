/* Vestigia – wachtrij voor pop-ups (update 8)
   Er staat nooit meer dan één pop-up tegelijk in beeld. Bij het openen van de app (na de openingsanimatie, de uitleg,
   de vraag om een naam en een leaguelink) kijkt de wachtrij welke pop-ups nu iets te melden hebben, en toont alleen
   de belangrijkste. De rest schuift door naar de volgende keer dat je de app opent.
   Volgorde (laag = eerst): 1 dwaalgast (update 9), 2 adventkalender, 3 herinnering om een avatar te kiezen.
   Staat er al iets open (uitleg, een league-vraag, een melding), dan wacht alles tot de volgende keer. */
"use strict";

const Wachtrij = (() => {
  const kandidaten = [];
  let gedaan = false;
  /** k = { id, prio, kan: () => boolean | Promise<boolean>, toon: () => void } */
  const voeg = k => { kandidaten.push(k); };
  const ietsOpen = () => !!document.querySelector(".uitleg") || !!document.querySelector("#opening")
    || [...document.querySelectorAll(".overlay, #speelKring")].some(el => !el.hidden);
  const wacht = ms => new Promise(r => setTimeout(r, ms));

  async function start(){
    if (gedaan) return; gedaan = true;
    await wacht(500);
    if (ietsOpen()) return;
    for (const k of kandidaten.slice().sort((a, b) => a.prio - b.prio)){
      let ok = false;
      try { ok = await k.kan(); } catch(e){ ok = false; }
      if (!ok) continue;
      if (ietsOpen()) return;                  // er kwam intussen iets anders in beeld: volgende keer
      try { k.toon(); } catch(e){}
      return;                                   // nooit twee tegelijk
    }
  }

  /* ---------- herinnering: kies een avatar (na 3 gespeelde dagcasussen) ----------
     Alleen met een spelersnaam en zolang je geen avatar hebt. Hooguit één keer per dag en drie keer in totaal. */
  const AV = "vestigia:avatarHerinnering";
  function gespeeldeDagen(){
    const st = store.get(); let n = 0;
    for (let i = 0; i <= todayIndex(); i++) if (finished(st, i, false) || finished(st, i, true)) n++;
    return n;
  }
  voeg({ id: "avatar", prio: 3,
    kan(){
      if (!online.enabled || !online.player()) return false;
      if (Profiel.mijn().avatar) return false;
      if (gespeeldeDagen() < 3) return false;
      let r = {}; try { r = JSON.parse(localStorage.getItem(AV)) || {}; } catch(e){}
      return (r.n || 0) < 3 && r.dag !== todayIndex();
    },
    toon(){
      let r = {}; try { r = JSON.parse(localStorage.getItem(AV)) || {}; } catch(e){}
      try { localStorage.setItem(AV, JSON.stringify({ n: (r.n || 0) + 1, dag: todayIndex() })); } catch(e){}
      const pop = $("wachtPop");
      $("wachtBody").innerHTML = `
        <div class="top"><h2 id="wachtH">Kies je avatar</h2><button class="iconbtn" id="wachtSluit" aria-label="Sluiten"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>
        <div class="wachtrij-av">${avatarSVG({ avatar: "das", color: "groen" }, "wachtav")}${avatarSVG({ avatar: "egel", color: "mint" }, "wachtav")}${avatarSVG({ avatar: "eekhoorn", color: "oker" }, "wachtav")}</div>
        <p>Je hebt al een paar dagcasussen gespeeld. Kies een avatar, dan zien andere spelers hem naast je naam in de ranglijst. Vier avatars zijn gratis.</p>
        <button class="btn" id="wachtGa">Avatar kiezen</button>
        <button class="linklike" id="wachtLater">Later</button>`;
      const dicht = () => { pop.hidden = true; };
      $("wachtSluit").onclick = dicht; $("wachtLater").onclick = dicht;
      $("wachtGa").onclick = () => { dicht(); showProfiel(); };
      pop.hidden = false;
    }
  });
  document.addEventListener("click", e => { if (e.target === $("wachtPop")) $("wachtPop").hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && $("wachtPop") && !$("wachtPop").hidden) $("wachtPop").hidden = true; });

  return { voeg, start, ietsOpen };
})();
