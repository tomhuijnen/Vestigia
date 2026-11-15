/* Vestigia – XP-boost bij ‘in één keer geraden’ (update 48, aan met de levels op maandag 16 november 2026)
   Bij de 1e, 5e, 10e, 15e … keer (daarna elke 5) dat je een casus in één poging goed hebt (dagcasus of oefenen,
   alleen klassiek), krijg je eenmalig 100 XP. De server rekent het uit (XP-soort 'boost' en xp_boost, supabase-032); de app
   toont een banner die van boven in beeld zakt, met een draaiend diamantje, geïnspireerd op de melding van Xbox bij
   een zeldzame achievement. Hij begint als rondje, klapt open tot een pil, krijgt één keer een glans en gaat na
   ± 4 seconden weer omhoog; tikken sluit hem meteen. Daarna vliegt de XP naar de levelring (js/levels.js).
   · Na een spel: vóór de XP-vlucht en vóór de gewone pop-up na het spel (prestatie, level), nooit tegelijk.
   · Gemiste mijlpalen (wie er bij de livegang al voorbij was, of een boost op een ander apparaat): bij het openen
     van de app alle nog niet getoonde boosts in één banner (wachtrij, vóór de levels).
   · ‘Minder beweging’: niet draaien of schuiven, alleen in- en uitvagen.
   Voorbeeld: ?boost=demo (5e keer) of ?boost=demo&n=12 (gemiste mijlpalen 1, 5 en 10). */
"use strict";

const Boost = (() => {
  const K = { gezien: "vestigia:boostGezien" };
  const lees = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const zet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const rustig = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wacht = ms => new Promise(r => setTimeout(r, ms));
  const isBoost = n => n === 1 || (n > 0 && n % 5 === 0);
  const boostsTot = n => n <= 0 ? 0 : 1 + Math.floor(n / 5);
  const DIAMANT = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 14L14 7H26L32 14L20 34Z" fill="#cfeaff"/><path d="M8 14H32L20 34Z" fill="#8fc6ef"/><path d="M14 7L20 14L26 7Z" fill="#fff"/><path d="M8 14L14 7L20 14Z" fill="#e8f6ff"/><path d="M26 7L32 14H20Z" fill="#b5ddfa"/><path d="M14 14L20 34L8 14Z" fill="#6fb0e0"/><path d="M26 14L20 34L32 14Z" fill="#a5d4f5"/><path d="M8 14L14 7H26L32 14L20 34Z" fill="none" stroke="#2b5d86" stroke-width="1.2" stroke-linejoin="round"/></svg>`;

  let bezig = null;
  /** de banner: n = aantal keer in één poging goed, xp = XP die erbij komt */
  function toon(n, xp){
    if (bezig) return bezig;
    bezig = (async () => {
      const b = document.createElement("div");
      b.className = "boostbanner" + (rustig() ? " rustig" : "");
      b.setAttribute("role", "status"); b.setAttribute("aria-live", "polite");
      b.innerHTML = `<span class="bb-glans" aria-hidden="true"></span><span class="bb-steen">${DIAMANT}</span>
        <span class="bb-tekst"><b>Gefeliciteerd! Je hebt een XP&#8209;boost verdiend</b><span><em class="bb-xp">+${xp} XP</em> al ${n} keer een casus in één keer geraden</span></span>`;
      document.body.appendChild(b);
      let sluit; const dicht = new Promise(r => sluit = r);
      b.addEventListener("click", () => sluit());
      void b.offsetWidth;
      b.classList.add("in");
      await wacht(rustig() ? 400 : 520);
      b.classList.add("open");
      await Promise.race([wacht(4200), dicht]);
      b.classList.add("uit");
      await wacht(450);
      b.remove();
    })().finally(() => { bezig = null; });
    return bezig;
  }

  /* de stand van de server: { n: keer in één poging goed, k: aantal boosts, xp } (xp_boost, supabase-032) */
  async function haal(){
    const p = online.enabled && online.player(); if (!p) return null;
    try { return await online.rpc("xp_boost", { p_id: p.id, p_key: p.key }); } catch(e){ return null; }
  }
  /* na een spel (js/levels.js), als de levels aan staan: nieuwe boosts tonen vóór de XP-vlucht */
  async function naSpel(){
    const b = await haal(); if (!b) return;
    const k = b.k || 0, gezien = lees(K.gezien) || 0;
    zet(K.gezien, Math.max(k, gezien));
    if (k > gezien) await toon(b.n, 100 * (k - gezien));
  }

  /* gemiste mijlpalen: bij het openen van de app, vóór de levels (prio 1,5); daarna gaat de wachtrij door */
  let open = null;
  Wachtrij.voeg({ id: "boost", prio: 1.4, doorgaan: true,
    async kan(){
      open = null;
      const p = online.enabled && online.player(); if (!p || typeof Levels === "undefined") return false;
      let s = null; try { s = await Levels.haal(); } catch(e){ return false; }
      if (!s || !s.actief) return false;
      const b = await haal(); if (!b) return false;
      const k = b.k || 0, gezien = lees(K.gezien) || 0;
      if (k <= gezien) return false;
      open = { n: b.n, xp: 100 * (k - gezien), k };
      return true;
    },
    async toon(){
      if (!open) return;
      zet(K.gezien, open.k);
      await toon(open.n, open.xp);
    } });

  /* voorbeeld zonder database */
  try {
    const u = new URLSearchParams(location.search);
    if (u.get("boost") === "demo"){
      const n = Math.max(1, +u.get("n") || 5);
      setTimeout(() => toon(n, 100 * (u.get("n") ? boostsTot(n) : 1)), 1800);
    }
  } catch(e){}

  return { toon, naSpel, isBoost, boostsTot };
})();
