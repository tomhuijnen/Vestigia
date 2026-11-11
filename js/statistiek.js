/* Vestigia – statistieken (update 12), via het menu.
   Alles komt uit het logboek in de opslag (st.log): elk afgerond spel, in elke modus. Met een spelersnaam gaat het
   logboek mee in je online voortgang, dus op een tweede apparaat zie je dezelfde cijfers.
   - Determinaties: alle afgeronde casussen; goed/fout, en per soort spel (dagcasus of oefencasus) en per modus.
   - Vaakst tegengekomen: de soort die het antwoord was.
   - Vaakst ingevoerd: elke soort die je als determinatie invoerde, goed of fout. Foute gokken staan pas sinds update 2
     in het logboek; van oudere verloren casussen weten we alleen het antwoord.
   - Dwaalgasten: uit de verzameling die de server bijhoudt (één beurt per maand).
   - Actieve maanden: kalendermaanden waarin je minstens één casus afrondde. */
"use strict";

const Statistiek = (() => {
  const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
  const maandKey = t => { const d = new Date(t); return d.getFullYear() * 12 + d.getMonth(); };
  const maandNaam = k => `${MONTHS[k % 12]} ${Math.floor(k / 12)}`;

  function bereken(){
    const st = store.get(), log = (st.log || []).filter(e => e && BY_ID.has(e.s));
    const s = { n: log.length, w: 0, dag: { n: 0, w: 0 }, oef: { n: 0, w: 0 }, kl: { n: 0, w: 0, p: 0 }, ex: { n: 0, w: 0, c: 0 },
                doel: new Map(), invoer: new Map(), maanden: new Set(), eerste: null };
    const tel = (m, id, goed) => { const r = m.get(id) || { n: 0, goed: 0 }; r.n++; if (goed) r.goed++; m.set(id, r); };
    for (const e of log){
      const w = !!e.w;
      if (w) s.w++;
      const soort = e.m === "daily" ? s.dag : s.oef; soort.n++; if (w) soort.w++;
      if (e.x){ s.ex.n++; if (w){ s.ex.w++; s.ex.c += +e.c || 0; } }
      else { s.kl.n++; if (w){ s.kl.w++; s.kl.p += +e.p || 0; } }
      tel(s.doel, e.s, w);
      for (const f of (Array.isArray(e.f) ? e.f : [])) if (BY_ID.has(f)) tel(s.invoer, f, false);
      if (w) tel(s.invoer, e.s, true);
      if (e.t){ s.maanden.add(maandKey(e.t)); if (!s.eerste || e.t < s.eerste) s.eerste = e.t; }
    }
    /* dwaalgasten: per maand één beurt; een dier dat later alsnog gevonden werd, telt als gevonden */
    const v = typeof Dwaalgast !== "undefined" && Dwaalgast.verzameling ? Dwaalgast.verzameling() : [];
    s.dg = { beurten: v.length, gevonden: v.filter(b => b.status === "gevonden").length, gevlogen: v.filter(b => b.status === "gevlogen").length };
    const top = m => [...m.entries()].sort((a, b) => b[1].n - a[1].n || b[1].goed - a[1].goed || BY_ID.get(a[0]).n.localeCompare(BY_ID.get(b[0]).n, "nl")).slice(0, 5);
    s.topDoel = top(s.doel); s.topInvoer = top(s.invoer);
    return s;
  }

  function lijst(rijen, wat){
    if (!rijen.length) return `<p class="fine">Nog niets.</p>`;
    const max = rijen[0][1].n;
    return `<ol class="st-top">${rijen.map(([id, r]) => {
      const t = BY_ID.get(id), plaat = TARGETS.some(x => x.id === id);
      const sub = wat === "doel" ? `${r.goed} van ${r.n} goed` : r.goed === r.n ? "elke keer goed" : r.goed ? `${r.goed}× goed, ${r.n - r.goed}× fout` : "elke keer fout";
      const tag = plaat ? "button" : "div";
      return `<li><${tag} class="st-rij"${plaat ? ` type="button" data-id="${esc(id)}"` : ""}>
        <span class="st-naam"><b>${esc(t.n)}</b><small>${esc(sub)}</small></span>
        <span class="st-bar" aria-hidden="true"><i style="width:${Math.max(8, Math.round(100 * r.n / max))}%"></i></span>
        <span class="st-n">${r.n}×</span></${tag}></li>`;
    }).join("")}</ol>`;
  }

  function verdeling(label, a){
    return `<div class="st-verd"><span class="st-vl">${esc(label)}</span><span class="st-vb" aria-hidden="true"><i style="width:${pct(a.w, a.n)}%"></i></span>
      <span class="st-vn">${a.n ? `${a.w} van ${a.n} · ${pct(a.w, a.n)}%` : "nog niet gespeeld"}</span></div>`;
  }

  function render(){
    const s = bereken(), body = $("statsBody");
    $("stTotaal").innerHTML = `${s.n}<small>${s.n === 1 ? "determinatie" : "determinaties"}</small>`;
    if (!s.n){ body.innerHTML = `<p class="rankempty">Speel je eerste casus, dan verschijnen hier je statistieken.</p>`; return; }
    const kGem = s.kl.w ? (s.kl.p / s.kl.w).toLocaleString("nl-NL", { maximumFractionDigits: 1 }) : null;
    const xGem = s.ex.w ? (s.ex.c / s.ex.w).toLocaleString("nl-NL", { maximumFractionDigits: 1 }) : null;
    const nm = s.maanden.size;
    body.innerHTML = `
      <section class="st-blok" id="stKern" aria-label="Overzicht">
        <div class="stats st-tegels">
          <div><b>${s.n}</b>gespeeld</div>
          <div><b>${pct(s.w, s.n)}%</b>gedetermineerd</div>
          <div><b>${s.w}</b>goed · <span class="st-fout">${s.n - s.w} fout</span></div>
          <div><b>${nm}</b>${nm === 1 ? "actieve maand" : "actieve maanden"}</div>
          <div><b>${s.dg.gevonden}</b>${s.dg.gevonden === 1 ? "dwaalgast" : "dwaalgasten"} gevonden</div>
        </div>
        <p class="fine st-sinds">${s.eerste ? `Je eerste casus rondde je af in ${maandNaam(maandKey(s.eerste))}.` : ""}${s.dg.beurten ? ` Dwaalgasten: ${s.dg.beurten} gezien, ${s.dg.gevonden} bevestigd${s.dg.gevlogen ? `, ${s.dg.gevlogen} weggedwaald` : ""}.` : ""}</p>
      </section>
      <section class="st-blok" aria-labelledby="stVerdH">
        <h3 id="stVerdH">Goed en fout</h3>
        ${verdeling("Dagcasus", s.dag)}${verdeling("Oefencasus", s.oef)}${verdeling("Klassiek", s.kl)}${verdeling("Expert", s.ex)}
        <p class="fine">${kGem ? `Goed in klassiek: gemiddeld na ${kGem} ${kGem === "1" ? "poging" : "pogingen"}.` : ""}${xGem ? ` Goed in expert: gemiddeld na ${xGem} ${xGem === "1" ? "waarneming" : "waarnemingen"}.` : ""}</p>
      </section>
      <div class="st-twee" id="stLijsten">
        <section class="st-blok" aria-labelledby="stDoelH"><h3 id="stDoelH">Vaakst tegengekomen</h3><p class="fine">De soort die het antwoord was.</p>${lijst(s.topDoel, "doel")}</section>
        <section class="st-blok" aria-labelledby="stInvH"><h3 id="stInvH">Vaakst ingevoerd</h3><p class="fine">Elke soort die je als determinatie invoerde, goed of fout.</p>${lijst(s.topInvoer, "invoer")}</section>
      </div>`;
    body.querySelectorAll(".st-rij[data-id]").forEach(b => b.onclick = () => openPlate(b.dataset.id, b));
  }

  function toon(){
    setView("stats");
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
    if (typeof Nieuw !== "undefined" && $("stKern") && $("stLijsten")) Nieuw.blokjes("statistiek", [
      { na: $("stKern"), tekst: "Nieuw: je statistieken. Hier tellen alle casussen mee, ook oefencasussen en ingehaalde dagen, en niet alleen de dagcasus zoals bij de reeks." },
      { na: $("stLijsten"), tekst: "Welke soorten kwam je het vaakst tegen, en welke voerde je het vaakst in? Tik op een soort om zijn plaat te openen." }
    ], { wacht: 500 });
  }
  return { toon, render, bereken };
})();
