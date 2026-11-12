/* Vestigia – uitleg bij nieuwe onderdelen (update 9)
   De verrassing blijft: een nieuw onderdeel (de dwaalgast, de adventkalender, straks levels of een minigame) popt
   gewoon in beeld. De eerste keer verschijnen er dan in die pop-up zelf, één voor één, kleine uitlegblokjes bij de
   onderdelen waar het om gaat (Nieuw.blokjes). Terugkijken kan altijd via Spelregels → ‘Uitleg bij nieuwe
   onderdelen’; daar staat dezelfde uitleg als losse kaart (Nieuw.toon).
   Een nieuw onderdeel toevoegen = één item in ONDERDELEN (voor de spelregels) en een aanroep van Nieuw.blokjes
   op de plek waar het onderdeel voor het eerst in beeld komt. */
"use strict";

const Nieuw = (() => {
  const KEY = id => "vestigia:nieuw:" + id;
  const gezien = id => { try { return !!localStorage.getItem(KEY(id)); } catch(e){ return true; } };
  const markeer = id => { try { localStorage.setItem(KEY(id), "1"); } catch(e){} };

  const ICOON = {
    dwaalgast: `<span class="nw-ic rood"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.5" cy="15.5" r="4"/><circle cx="17.5" cy="15.5" r="4"/><path d="M10.5 15.5h3M4 12l2.5-7h3l1 4M20 12l-2.5-7h-3l-1 4"/></svg></span>`,
    vragen: `<span class="nw-ic rood"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h7"/><path d="M16 16l2 2 4-4"/></svg></span>`,
    vraagteken: `<span class="nw-ic rood"><b>?</b></span>`,
    cadeau: `<span class="nw-ic kerst"><svg aria-hidden="true" viewBox="0 0 20 20" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="8" width="14" height="9" rx="1.2"/><path d="M2.5 5.2h15v2.8h-15zM10 5.2V17"/><path d="M10 5.2C8.6 2.4 5.6 2.4 6.1 4.3c.3 1 2.4.9 3.9.9ZM10 5.2c1.4-2.8 4.4-2.8 3.9-.9-.3 1-2.4.9-3.9.9Z"/></svg></span>`,
    spoor: `<span class="nw-ic kerst"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><ellipse cx="12" cy="15.5" rx="4.2" ry="3.6"/><ellipse cx="6.5" cy="9.5" rx="1.8" ry="2.3"/><ellipse cx="10" cy="6.5" rx="1.8" ry="2.3"/><ellipse cx="14" cy="6.5" rx="1.8" ry="2.3"/><ellipse cx="17.5" cy="9.5" rx="1.8" ry="2.3"/></svg></span>`,
    level: `<span class="nw-ic"><b>7</b></span>`,
    xp: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z"/></svg></span>`,
    rang: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17V7h12l4 5-4 5H4Z"/><path d="M8 12h6"/></svg></span>`,
    duel: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 22 22" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="8" r="2.6"/><circle cx="15" cy="8" r="2.6"/><path d="M2.5 17c.5-2.6 2.3-4 4.5-4s4 1.4 4.5 4M10.5 17c.5-2.6 2.3-4 4.5-4s4 1.4 4.5 4"/></svg></span>`,
    rondes: `<span class="nw-ic"><b>3</b></span>`,
    tijd: `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M10 2.8h4M12 2.8V6"/></svg></span>`,
    kalender: `<span class="nw-ic kerst"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4"/></svg></span>`
  };

  const ONDERDELEN = [
    { id: "dwaalgast", titel: "Dwaalgasten",
      stappen: [
        { ic: "dwaalgast", kop: "Nieuw: dwaalgasten", tekst: "Eén keer per maand duikt er bij jou een dwaalgast op: een zeldzaam dier dat normaal niet in Nederland leeft. Welke dag dat is, verschilt per speler, en dat geldt ook voor welk dier het is." },
        { ic: "vragen", kop: "Bevestig de waarneming", tekst: `Je ziet meteen welk dier het is. Beantwoord drie vragen over bijvoorbeeld zijn sporen, uiterlijk of waar hij normaal leeft. Alle drie goed: hij komt in je ${NAAM.vestiarium}, met 50 eikels en zijn avatar.` },
        { ic: "vraagteken", kop: "Eén kans", tekst: "Is een antwoord fout, dan dwaalt hij weg en blijft er een vraagteken achter. Kies je ‘Later’, dan staat er tot het einde van de maand een rode knop rechtsboven." }
      ] },
    { id: "advent", titel: "Adventkalender",
      stappen: [
        { ic: "cadeau", kop: "De adventkalender is open", tekst: "Van 1 tot en met 24 december mag er elke dag één vakje open. Tik op het cadeautje rechtsboven, en daarna op ‘Open cadeau’." },
        { ic: "spoor", kop: "Wat zit erin?", tekst: "Eikels, sporen in de sneeuw om te raden, winterweetjes over beschermde soorten en een paar dingen die je nergens anders krijgt." },
        { ic: "kalender", kop: "Een gemist vakje is weg", tekst: "Je kunt alleen het vakje van vandaag openen. Open je ze alle 24, dan word je Adventkampioen." }
      ] },
    { id: "spelersduel", titel: "Spelersduel", verborgen: () => !(typeof Duel !== "undefined" && Duel.zichtbaar()),   // update 16, vanaf 14 december
      stappen: [
        { ic: "duel", kop: "Nieuw: het spelersduel", tekst: "Daag een speler uit, op naam of met een link. Jullie spelen dezelfde drie casussen, in de modus die de uitdager kiest." },
        { ic: "rondes", kop: "Niet tegelijk", tekst: "Jij speelt je drie casussen meteen; daarna heeft de ander 48 uur. Wat de ander deed, zie je pas als jullie allebei klaar zijn. Dan gaan de casussen één voor één open." },
        { ic: "tijd", kop: "Wie wint?", tekst: "Per casus krijg je punten zoals bij de dagcasus. Meeste punten wint: 5 eikels, en 1 als je verliest. Gelijke punten? Dan wint wie de drie casussen samen sneller oploste. Een duel telt niet voor de ranglijst." }
      ] },
    { id: "levels", titel: "Levels", verborgen: () => !(typeof Levels !== "undefined" && Levels.zichtbaar()),   // pas vanaf de startdatum
      stappen: [
        { ic: "level", kop: "Nieuw: levels", tekst: "Met ervaringspunten (XP) stijg je in level. Je level zie je in de ring om je avatar rechtsboven: hoe voller de ring, hoe dichter bij het volgende level." },
        { ic: "xp", kop: "XP verdien je met leren", tekst: "Dagcasus 10 + 5 per punt, plus een dagbonus tot 35 voor je reeks. Oefencasus 10 (niet gevonden 3). Nieuwe soort +10, dwaalgast +50. Had je een soort eerder fout en heb je hem minstens een dag later goed? Dan krijg je 15 XP extra." },
        { ic: "rang", kop: "Wat een level oplevert", tekst: "Elk level levert eikels op: 5 + het level. Bij level 5, 10, 20, 30, 40 en 50 krijg je een nieuwe rang als ondertitel, van Stagiair tot Meesterecoloog. Bij level 20, 40, 60 … krijg je een hersteltoken." }
      ] }
  ];

  /* de pop-up: stap voor stap, met Volgende en Overslaan */
  function toon(o){
    return new Promise(klaar => {
      const pop = $("wachtPop"), body = $("wachtBody");
      let i = 0;
      const dicht = () => { pop.hidden = true; pop.classList.remove("nieuw"); document.removeEventListener("keydown", esc_, true); klaar(); };
      const esc_ = e => { if (e.key === "Escape"){ e.preventDefault(); e.stopPropagation(); dicht(); } };
      function stap(){
        const s = o.stappen[i], laatste = i === o.stappen.length - 1;
        body.innerHTML = `
          <div class="nw-kop"><span class="caps">${i === 0 ? "Nieuw in Vestigia" : esc(o.titel)}</span><span class="nw-stip">${o.stappen.map((_, k) => `<i class="${k === i ? "nu" : k < i ? "klaar" : ""}"></i>`).join("")}</span></div>
          <div class="nw-stap">${ICOON[s.ic] || ""}<h2 id="wachtH">${esc(s.kop)}</h2><p>${esc(s.tekst)}</p></div>
          <div class="nw-knoppen">${laatste ? "" : `<button class="linklike" id="nwSkip">Overslaan</button>`}<button class="btn" id="nwVolg">${laatste ? "Begrepen" : "Volgende"}</button></div>`;
        $("nwVolg").onclick = () => { if (laatste) dicht(); else { i++; stap(); } };
        if (!laatste) $("nwSkip").onclick = dicht;
        $("nwVolg").focus();
      }
      pop.classList.add("nieuw");
      pop.hidden = false;
      document.addEventListener("keydown", esc_, true);
      stap();
    });
  }

  /* Uitlegblokjes in een pop-up die net in beeld kwam. stappen = [{ na: element, tekst }]: elk blokje verschijnt
     direct onder zijn element, met een pijltje ernaar. ‘Volgende’ laat het volgende zien, het laatste is ‘Begrepen’.
     Eén keer per onderdeel (in een voorbeeld met ?…=demo altijd). Je kunt intussen gewoon verder in de pop-up. */
  async function blokjes(id, stappen, opties){
    opties = opties || {};
    if ((gezien(id) && !opties.altijd) || bezig.has(id)) return;   // ook niet twee keer tegelijk
    markeer(id); bezig.add(id);
    try { await reeks(stappen, opties); } finally { bezig.delete(id); }
  }
  const bezig = new Set();
  async function reeks(stappen, opties){
    stappen = stappen.filter(s => s.na && s.na.isConnected && s.na.offsetParent !== null);   // alleen wat nu zichtbaar is
    await new Promise(r => setTimeout(r, opties.wacht === undefined ? 1100 : opties.wacht));
    for (let i = 0; i < stappen.length; i++){
      const s = stappen[i];
      if (!s.na.isConnected) return;
      const laatste = i === stappen.length - 1;
      const el = document.createElement("div");
      el.className = "nw-blokje" + (opties.rood ? " rood" : "");
      el.setAttribute("role", "note");
      el.innerHTML = `<span class="nw-pijl" aria-hidden="true"></span><span class="caps">${i === 0 ? "Nieuw" : "Uitleg"} · ${i + 1} van ${stappen.length}</span><p>${esc(s.tekst)}</p>
        <div class="nw-bk"><button class="linklike" type="button" data-x>${laatste ? "" : "Overslaan"}</button><button class="nw-volg" type="button">${laatste ? "Begrepen" : "Volgende"}</button></div>`;
      if (laatste) el.querySelector("[data-x]").remove();
      s.na.insertAdjacentElement("afterend", el);
      el.scrollIntoView({ block: "center", behavior: rustig() ? "auto" : "smooth" });
      const klaar = await new Promise(r => {
        el.querySelector(".nw-volg").onclick = () => r("volg");
        const x = el.querySelector("[data-x]"); if (x) x.onclick = () => r("stop");
        /* sluit of verandert de pop-up (bijvoorbeeld de eerste vraag), dan stopt de uitleg vanzelf */
        const kijk = setInterval(() => { if (!el.isConnected || !s.na.isConnected || el.closest("[hidden]")){ clearInterval(kijk); r("weg"); } }, 400);
      });
      el.classList.add("weg");
      await new Promise(r => setTimeout(r, rustig() ? 0 : 200));
      el.remove();
      if (klaar !== "volg") return;
    }
  }
  const rustig = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* terugkijken vanuit de spelregels */
  function knoppen(){
    const box = $("helpNieuw"); if (!box) return;
    box.innerHTML = ONDERDELEN.filter(o => !(o.verborgen && o.verborgen())).map(o => `<button class="chipbtn" type="button" data-nw="${o.id}">${esc(o.titel)}</button>`).join("");
    box.querySelectorAll("[data-nw]").forEach(b => b.onclick = () => {
      const o = ONDERDELEN.find(x => x.id === b.dataset.nw);
      $("help").hidden = true;
      toon(o);
    });
  }
  knoppen();
  return { toon, blokjes, knoppen, ONDERDELEN };
})();
