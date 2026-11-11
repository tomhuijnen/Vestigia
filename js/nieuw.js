/* Vestigia – uitleg bij nieuwe onderdelen (update 9)
   Komt er iets nieuws bij (de dwaalgast, de adventkalender, straks levels of een minigame), dan krijgt elke speler
   één keer een pop-up met 2 of 3 korte stappen: wat is het, hoe werkt het, waar vind je het. Hij komt via de
   wachtrij, vóór het onderdeel zelf, zodat je eerst weet wat er gebeurt. Daarna gaat de wachtrij gewoon verder.
   Terugkijken kan altijd via Spelregels → ‘Uitleg bij nieuwe onderdelen’.
   Een nieuw onderdeel toevoegen = één item in ONDERDELEN: id, titel, prio (net vóór het onderdeel zelf in de
   wachtrij), wanneer (kan), en de stappen. */
"use strict";

const Nieuw = (() => {
  const KEY = id => "vestigia:nieuw:" + id;
  const gezien = id => { try { return !!localStorage.getItem(KEY(id)); } catch(e){ return true; } };
  const markeer = id => { try { localStorage.setItem(KEY(id), "1"); } catch(e){} };
  const vandaag = () => new Date();
  const dagInDec = () => { const d = vandaag(); return d.getMonth() === 11 ? d.getDate() : 0; };
  let kerstDemo = false;
  try { const u = new URLSearchParams(location.search); kerstDemo = u.get("kerst") === "demo"; } catch(e){}

  const ICOON = {
    dwaalgast: `<span class="nw-ic rood"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.5" cy="15.5" r="4"/><circle cx="17.5" cy="15.5" r="4"/><path d="M10.5 15.5h3M4 12l2.5-7h3l1 4M20 12l-2.5-7h-3l-1 4"/></svg></span>`,
    vragen: `<span class="nw-ic rood"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h7"/><path d="M16 16l2 2 4-4"/></svg></span>`,
    vraagteken: `<span class="nw-ic rood"><b>?</b></span>`,
    cadeau: `<span class="nw-ic kerst"><svg aria-hidden="true" viewBox="0 0 20 20" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="8" width="14" height="9" rx="1.2"/><path d="M2.5 5.2h15v2.8h-15zM10 5.2V17"/><path d="M10 5.2C8.6 2.4 5.6 2.4 6.1 4.3c.3 1 2.4.9 3.9.9ZM10 5.2c1.4-2.8 4.4-2.8 3.9-.9-.3 1-2.4.9-3.9.9Z"/></svg></span>`,
    spoor: `<span class="nw-ic kerst"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><ellipse cx="12" cy="15.5" rx="4.2" ry="3.6"/><ellipse cx="6.5" cy="9.5" rx="1.8" ry="2.3"/><ellipse cx="10" cy="6.5" rx="1.8" ry="2.3"/><ellipse cx="14" cy="6.5" rx="1.8" ry="2.3"/><ellipse cx="17.5" cy="9.5" rx="1.8" ry="2.3"/></svg></span>`,
    kalender: `<span class="nw-ic kerst"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4"/></svg></span>`
  };

  const ONDERDELEN = [
    { id: "dwaalgast", titel: "Dwaalgasten", prio: 0.9,
      kan: () => online.enabled && !!online.player(),
      stappen: [
        { ic: "dwaalgast", kop: "Nieuw: dwaalgasten", tekst: "Eén keer per maand duikt er bij jou een dwaalgast op: een zeldzaam dier dat normaal niet in Nederland leeft. Welke dag dat is, verschilt per speler, en dat geldt ook voor welk dier het is." },
        { ic: "vragen", kop: "Bevestig de waarneming", tekst: `Je ziet meteen welk dier het is. Beantwoord drie vragen over bijvoorbeeld zijn sporen, uiterlijk of waar hij normaal leeft. Alle drie goed: hij komt in je ${NAAM.vestiarium}, met 50 eikels en zijn avatar.` },
        { ic: "vraagteken", kop: "Eén kans", tekst: "Is een antwoord fout, dan dwaalt hij weg en blijft er een vraagteken achter. Kies je ‘Later’, dan staat er tot het einde van de maand een rode knop rechtsboven." }
      ] },
    { id: "advent", titel: "Adventkalender", prio: 1.9,
      kan: () => kerstDemo || (dagInDec() >= 1 && dagInDec() <= 24),
      stappen: [
        { ic: "cadeau", kop: "De adventkalender is open", tekst: "Van 1 tot en met 24 december mag er elke dag één vakje open. Tik op het cadeautje rechtsboven, en daarna op ‘Open cadeau’." },
        { ic: "spoor", kop: "Wat zit erin?", tekst: "Eikels, sporen in de sneeuw om te raden, winterweetjes over beschermde soorten en een paar dingen die je nergens anders krijgt." },
        { ic: "kalender", kop: "Een gemist vakje is weg", tekst: "Je kunt alleen het vakje van vandaag openen. Open je ze alle 24, dan word je Adventkampioen." }
      ] }
  ];

  /* de pop-up: stap voor stap, met Volgende en Overslaan */
  function toon(o){
    return new Promise(klaar => {
      const pop = $("wachtPop"), body = $("wachtBody");
      let i = 0;
      const dicht = () => { markeer(o.id); pop.hidden = true; pop.classList.remove("nieuw"); document.removeEventListener("keydown", esc_, true); klaar(); };
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

  /* in de wachtrij: vóór het onderdeel zelf, en daarna gaat de wachtrij door */
  ONDERDELEN.forEach(o => Wachtrij.voeg({ id: "nieuw-" + o.id, prio: o.prio, doorgaan: true,
    kan: () => !gezien(o.id) && o.kan(),
    toon: () => toon(o) }));

  /* terugkijken vanuit de spelregels */
  function knoppen(){
    const box = $("helpNieuw"); if (!box) return;
    box.innerHTML = ONDERDELEN.map(o => `<button class="chipbtn" type="button" data-nw="${o.id}">${esc(o.titel)}</button>`).join("");
    box.querySelectorAll("[data-nw]").forEach(b => b.onclick = () => {
      const o = ONDERDELEN.find(x => x.id === b.dataset.nw);
      $("help").hidden = true;
      toon(o);
    });
  }
  knoppen();
  return { toon, ONDERDELEN };
})();
