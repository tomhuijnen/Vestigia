/* Vestigia – wachtrij voor pop-ups (update 8)
   Er staat nooit meer dan één pop-up tegelijk in beeld. Bij het openen van de app (na de openingsanimatie, de uitleg,
   de vraag om een naam en een leaguelink) kijkt de wachtrij welke pop-ups nu iets te melden hebben, en toont alleen
   de belangrijkste. De rest schuift door naar de volgende keer dat je de app opent.
   Volgorde (laag = eerst): 1 dwaalgast (update 9), 1,2 adventkalender (een gemist vakje is weg), 1,4 gemiste XP-boosts
   (update 48, daarna gaat de wachtrij door), 1,5 spelersduel (update 16: een uitslag die binnen is, of een nieuwe uitdaging),
   1,6 je week in Vestigia (update 25, alleen maandag en dinsdag), 1,7 levels (update 10), 3 herinnering om een avatar te kiezen.
   Update 79 (Tom, 17 november): wat het eerst verloopt, komt eerst. Advent (vandaag), duel (48 uur) en weekpop-up (ma/di)
   gingen eerder pas na de levels; nu gaan ze vóór alles wat niet verloopt. Meldingen over iets nieuws (‘Nieuw: libellen en
   kevers’, ‘Nieuwe soorten’) komen na 4 weken niet meer vanzelf (Nieuw.vers); terugkijken via Spelregels blijft.
   Een dwaalgast gaat dus altijd vóór een duel-uitnodiging. Uitzondering: wie de app opent via een duellink, ziet die
   uitdaging meteen (daar kwam je voor); de dwaalgast komt dan de volgende keer.
   Uitleg bij een nieuw onderdeel (js/nieuw.js) komt net vóór dat onderdeel; daarna gaat de wachtrij door.
   Staat er al iets open (uitleg, een league-vraag, een melding), dan wacht alles tot de volgende keer.
   Update 60 (16 november 2026): ook terugkomen in een app die al openstaat telt als openen, als je minstens
   15 minuten weg was (ander tabblad of venster, scherm uit) of als er intussen een nieuwe dag is begonnen.
   Zo blijft een pop-up (zoals de weekpop-up na de levels) niet hangen in een tabblad dat dagen openstaat.
   Nooit midden in een casus: dan komt hij na de volgende keer terugkomen. */
"use strict";

const Wachtrij = (() => {
  const kandidaten = [];
  let gedaan = false;
  /** k = { id, prio, kan: () => boolean | Promise<boolean>, toon: () => void | Promise, doorgaan?: true } */
  const voeg = k => { kandidaten.push(k); };
  const ietsOpen = () => !!document.querySelector(".uitleg") || !!document.querySelector("#opening")
    || [...document.querySelectorAll(".overlay, #speelKring")].some(el => !el.hidden);
  const wacht = ms => new Promise(r => setTimeout(r, ms));
  let draait = false, laatsteDag = null, weg = null;

  /* Staat er een nieuwe versie klaar (melding ‘Vernieuwen’), dan geen pop-ups: die komen na het vernieuwen.
     Eerst even wachten tot de controle op een nieuwe versie klaar is (js/app.js, window.__swKlaar). */
  const update = () => !!window.__nieuweVersie;
  async function start(){
    if (gedaan) return; gedaan = true;
    await ronde();
  }
  async function ronde(){
    draait = true;
    try { await kies(); } finally { draait = false; laatsteDag = todayIndex(); }
  }
  async function kies(){
    await wacht(500);
    try { if (window.__swKlaar) await window.__swKlaar; } catch(e){}
    /* eerst ophalen wat je op je andere apparaten al zag (hooguit 4 s wachten) */
    if (typeof online !== "undefined" && online.voortgangKlaar) await online.voortgangKlaar(4000);
    if (ietsOpen() || update()) return;
    for (const k of kandidaten.slice().sort((a, b) => a.prio - b.prio)){
      let ok = false;
      try { ok = await k.kan(); } catch(e){ ok = false; }
      if (!ok) continue;
      if (ietsOpen() || update()) return;      // er kwam intussen iets anders in beeld: volgende keer
      if (k.doorgaan){                          // uitleg bij iets nieuws: eerst wegklikken, dan gaat de wachtrij door
        try { await k.toon(); } catch(e){}
        await wacht(350);
        if (ietsOpen()) return;
        continue;
      }
      try { k.toon(); } catch(e){}
      return;                                   // nooit twee tegelijk
    }
  }

  /* ---------- update 60: terugkomen in een app die al openstaat ---------- */
  const TERUG_NA = 15 * 60 * 1000;
  /* midden in een casus = al minstens één gok gedaan en nog niet klaar (een casus die alleen klaarstaat telt niet) */
  const inCasus = () => typeof S !== "undefined" && !!S && S.status === "playing" && !!(S.guesses && S.guesses.length);
  function terug(nieuweDag){
    if (!gedaan || draait || document.visibilityState !== "visible") return;
    const lang = weg != null && Date.now() - weg >= TERUG_NA;
    const dag = laatsteDag != null && todayIndex() !== laatsteDag;
    if (!(nieuweDag ? dag : (lang || dag))){ if (!nieuweDag) weg = null; return; }   // kort weg geweest: telt niet
    if (inCasus()) return;                       // weg blijft staan: bij de volgende keer terugkomen opnieuw proberen
    weg = null;
    ronde();
  }
  const weggaan = () => { if (weg == null) weg = Date.now(); };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") weggaan(); else terug(false); });
  window.addEventListener("blur", weggaan);
  window.addEventListener("focus", () => terug(false));
  window.addEventListener("pageshow", e => { if (e.persisted) terug(false); });
  /* een venster dat de hele nacht in beeld blijft: na middernacht bij de eerstvolgende minuut (niet midden in een casus) */
  setInterval(() => terug(true), 60 * 1000);

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

  /* ---------- update 43: ondertitel Pionier (verdiend door wie vóór 1 december 2026 speelde; SQL 027) ----------
     Eén keer per apparaat, zodra de server zegt dat je hem hebt. Wie hem al onder zijn naam heeft, krijgt niets. */
  const PI = "vestigia:pionierGezien";
  voeg({ id: "pionier", prio: 2.65,
    kan(){
      if (!online.enabled || !online.player()) return false;
      try { if (localStorage.getItem(PI)) return false; } catch(e){ return false; }
      let items = []; try { items = JSON.parse(localStorage.getItem("vestigia:items")) || []; } catch(e){}
      return items.includes("titel:Pionier") && Profiel.mijn().subtitle !== "Pionier";
    },
    toon(){
      try { localStorage.setItem(PI, "1"); } catch(e){}
      const pop = $("wachtPop");
      $("wachtBody").innerHTML = `
        <div class="nw-stap"><span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg></span>
          <h2 id="wachtH">Je bent een Pionier</h2>
          <p>Je speelde Vestigia al in de eerste weken. Daarom krijg je de ondertitel <b>Pionier</b>. Na november kan niemand hem meer verdienen.</p></div>
        <div class="nw-knoppen"><button class="linklike" id="piLater">Later</button><button class="btn" id="piKies">Zet onder mijn naam</button></div>
        <p class="fine">Je vindt hem ook in de shop bij Ondertitels.</p>`;
      const dicht = () => { pop.hidden = true; pop.classList.remove("nieuw"); };
      $("piLater").onclick = dicht;
      $("piKies").onclick = async () => { dicht(); if (await Profiel.kiesTitel("Pionier")) toast("Pionier staat nu onder je naam."); else toast("Dat lukte nu niet. Je vindt Pionier in de shop bij Ondertitels."); };
      pop.classList.add("nieuw");
      pop.hidden = false;
      $("piKies").focus();
    } });

  return { voeg, start, ietsOpen };
})();
