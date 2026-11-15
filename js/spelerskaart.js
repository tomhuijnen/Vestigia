/* Vestigia – profielkaart van een andere speler (update 38, 15 november 2026)
   Tik in de ranglijst (ook de stand van een league) op een naam: dan opent een kaart met het profiel van die speler,
   alleen-lezen. De gegevens komen uit de openbare databasefunctie player_card (supabase-029).
   Besloten met Tom (13 en 15 november): reeks nu en langste reeks, gespeelde dagcasussen, gemiddeld aantal pogingen,
   platen, eikels totaal verdiend (niet het saldo), favoriete diergroep (vaakst goed gedetermineerd), beste drie prestaties,
   level met de gekleurde ring, rang, ‘speler sinds’, de duelbalans (al zijn of haar duels, tegen iedereen) en ‘Daag uit’.
   Niet tonen: met welke soorten iemand fout zat, tijdstippen van spelen, spelerscode.
   Update 54/55 (15 november): onder ‘Speler sinds’ staat of iemand de dagcasus van vandaag al speelde (veld `vandaag`,
   supabase-030); alleen ja of nee, geen tijdstip. Alleen op de kaart, niet in de ranglijst zelf (Tom, 13:01).
   Duelbalans en ‘Daag uit’ verschijnen pas als het spelersduel aan staat (maandag 23 november); daarvoor een korte zin.
   Op je eigen naam tikken opent Mijn profiel. Geen pop-up of ‘Nieuw’-melding (Tom, 15 november 08:14).
   De kaart is een .overlay, dus de pop-upwachtrij (js/wachtrij.js) wacht vanzelf zolang hij open is. */
"use strict";

const Spelerskaart = (() => {
  const NIV = ["", "brons", "zilver", "goud"];
  const X = `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const ZWAARD = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l6-6M3 17l4 4M14.5 3.5H20v5.5L10 19l-5-5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  const VINK = `<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const getal = n => Number(n || 0).toLocaleString("nl-NL");
  const MAAND = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
  const datum = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ""); return m ? `${+m[3]} ${MAAND[+m[2] - 1]} ${m[1]}` : ""; };
  const cache = new Map();              // naam (kleine letters) → { t, k }: een minuut bewaren, zodat heen en weer tikken snel is
  let terug = null, bezig = 0;

  const pop = () => $("spelerPop"), body = () => $("spelerPopBody");
  const duelAan = () => typeof Duel !== "undefined" && Duel.actief && Duel.actief();

  function prestatie(r){
    const doel = r.niveau >= 3 ? r.goud : [r.brons, r.zilver, r.goud][r.niveau], frac = Math.min(1, (r.waarde || 0) / (doel || 1));
    const tekst = r.niveau >= 3 ? `goud · ondertitel ${esc(r.goud_titel)}` : `${NIV[r.niveau]} · ${getal(r.waarde)} van ${getal(doel)} voor ${NIV[r.niveau + 1]}`;
    return `<div class="pr n${r.niveau}"><span class="prniv" aria-label="${NIV[r.niveau]}">${NIV[r.niveau][0].toUpperCase()}</span>
      <span class="prtxt"><b>${esc(r.label)}</b><span>${tekst}</span>${r.niveau >= 3 ? "" : `<span class="tb"><i style="width:${Math.round(100 * frac)}%"></i></span>`}</span></div>`;
  }
  const tegel = (label, waarde, onder, extra, cls) => `<div class="sptegel"><span class="tl">${label}</span><span class="tv${cls ? " " + cls : ""}">${waarde}</span>${onder ? `<span class="ts">${onder}</span>` : ""}${extra || ""}</div>`;

  function kaartHtml(k){
    const naam = esc(k.name), totaal = TARGETS.length, platen = Math.min(k.platen || 0, totaal);
    const fav = k.favoriet && GROUPS[k.favoriet.g];
    const pr = k.prestaties || [], du = k.duel || { gewonnen: 0, gelijk: 0, verloren: 0 };
    const duels = du.gewonnen + du.gelijk + du.verloren, pct = n => duels ? (100 * n / duels).toFixed(1) : 0;
    const av = avatarSVG(k, "avatar groot");
    return `
      <div class="spkop"><span class="caps">Spelersprofiel</span><button class="spsluit" id="spelerSluit" aria-label="Sluiten">${X}</button></div>
      <div class="spav">${k.level ? Levels.ring(av, k.level, k.pct || 0, "groot") : av}</div>
      <div class="spnaam"><h2 id="spelerPopH">${naam}</h2>${k.subtitle ? `<p class="sub">${esc(k.subtitle)}</p>` : ""}
        ${k.rang ? `<span class="rang">${esc(k.rang)}</span>` : ""}${k.sinds ? `<span class="sinds">Speler sinds ${datum(k.sinds)}</span>` : ""}
        ${k.vandaag == null ? "" : `<span class="spvandaag${k.vandaag ? " ja" : ""}">${k.vandaag ? `${VINK}Dagcasus van vandaag gespeeld` : "Dagcasus van vandaag nog niet gespeeld"}</span>`}</div>
      <div class="spbody">
        <div class="sptegels">
          ${tegel("Reeks nu", `${k.reeks ? VLAM : ""}${k.reeks} <small>${k.reeks === 1 ? "dag" : "dagen"}</small>`, `langste: ${k.reeks_max} ${k.reeks_max === 1 ? "dag" : "dagen"}`)}
          ${tegel("Dagcasussen", getal(k.dagcasussen), "gespeeld")}
          ${tegel("Pogingen", k.pogingen == null ? "–" : String(k.pogingen).replace(".", ","), "per dagcasus")}
          ${tegel("Platen", `${platen} <small>/ ${totaal}</small>`, "", `<span class="tb" aria-hidden="true"><i style="width:${Math.round(100 * platen / totaal)}%"></i></span>`)}
          ${tegel("Eikels", `${EIKEL}${getal(k.eikels)}`, "totaal verdiend")}
          ${tegel("Favoriet", fav ? `<i class="grpstip" style="background:var(--g-${k.favoriet.g})"></i><span>${esc(fav)}</span>` : "–", fav ? `${getal(k.favoriet.goed)} keer goed` : "nog niets gedetermineerd", "", "fav")}
        </div>
        <section class="spsec" aria-labelledby="spPrH"><h3 id="spPrH">Beste prestaties <small>${k.prestaties_behaald || 0} van ${k.prestaties_totaal || 0} behaald</small></h3>
          ${pr.length ? `<div class="prlist">${pr.map(prestatie).join("")}</div>` : `<p class="fine">${naam} heeft nog geen prestatie behaald.</p>`}</section>
        ${duelAan() ? `
        <section class="spduel" aria-labelledby="spDuH"><h3 id="spDuH">Spelersduels <small>${duels} gespeeld</small></h3>
          <div class="spbalans"><div><b>${du.gewonnen}</b><span>gewonnen</span></div><div><b>${du.gelijk}</b><span>gelijk</span></div><div><b>${du.verloren}</b><span>verloren</span></div></div>
          ${duels ? `<div class="spbalk" aria-hidden="true"><i class="w" style="width:${pct(du.gewonnen)}%"></i><i class="g" style="width:${pct(du.gelijk)}%"></i><i class="v" style="width:${pct(du.verloren)}%"></i></div>` : ""}
        </section>
        ${online.player() ? `<div class="spknop"><button class="btn duel" id="spelerDaag">${ZWAARD}Daag ${naam} uit</button></div>` : ""}`
        : `<p class="spnog">Vanaf maandag 23 november kun je ${naam} hier uitdagen voor een spelersduel.</p>`}
      </div>`;
  }

  function sluit(){
    const p = pop(); if (!p || p.hidden) return;
    p.hidden = true; bezig++;
    if (terug && terug.isConnected) terug.focus({ preventScroll: true });
    terug = null;
  }
  function bind(k){
    $("spelerSluit").onclick = sluit;
    const d = $("spelerDaag");
    if (d) d.onclick = () => { sluit(); Duel.open({ uitdaag: true, tegen: k.name }); };
  }
  async function open(naam, van){
    if (!naam) return;
    const me = online.player();
    if (me && me.name && String(me.name).toLowerCase() === naam.toLowerCase()){ showProfiel(); return; }
    terug = van || document.activeElement;
    const p = pop(), nr = ++bezig, sleutel = naam.toLowerCase(), c = cache.get(sleutel);
    body().innerHTML = `<div class="spkop"><span class="caps">Spelersprofiel</span><button class="spsluit" id="spelerSluit" aria-label="Sluiten">${X}</button></div>
      <p class="spleeg" id="spelerPopH">Profiel van ${esc(naam)} laden…</p>`;
    $("spelerSluit").onclick = sluit;
    p.hidden = false; p.scrollTop = 0; body().scrollTop = 0;
    $("spelerSluit").focus({ preventScroll: true });
    try {
      const k = c && Date.now() - c.t < 60000 ? c.k : await online.rpc("player_card", { p_name: naam });
      if (nr !== bezig || p.hidden) return;
      if (!k){ body().querySelector(".spleeg").textContent = `${naam} staat niet (meer) in de ranglijst.`; return; }
      cache.set(sleutel, { t: Date.now(), k });
      body().innerHTML = kaartHtml(k);
      bind(k);
      $("spelerSluit").focus({ preventScroll: true });
    } catch(e){
      if (nr !== bezig || p.hidden) return;
      body().querySelector(".spleeg").textContent = typeof Veld !== "undefined" && Veld.aan()
        ? "Veldmodus: zonder internet kan het profiel niet laden."
        : "Het profiel is nu niet bereikbaar. Probeer het later opnieuw.";
    }
  }

  /* tikken op een naam in de ranglijst of de stand van een league */
  function start(){
    const p = pop(); if (!p || !online.enabled) return;
    p.addEventListener("click", e => { if (e.target === p) sluit(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !p.hidden){ e.preventDefault(); sluit(); } });
    const lijst = $("rankList");
    lijst.addEventListener("click", e => {
      if (e.target.closest("button, a")) return;           // gedeelde plaats e.d. houden hun eigen knop
      const li = e.target.closest("li[data-n]"); if (!li) return;
      open(li.dataset.n, li);
    });
    lijst.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const li = e.target.closest("li[data-n]"); if (!li || e.target !== li) return;
      e.preventDefault(); open(li.dataset.n, li);
    });
    /* rijen bereikbaar met het toetsenbord; de lijst wordt steeds opnieuw getekend */
    new MutationObserver(() => {
      const me = String((online.player() || {}).name || "").toLowerCase();
      lijst.querySelectorAll("li[data-n]").forEach(li => {
        if (li.hasAttribute("tabindex")) return;
        li.tabIndex = 0;
        if (li.dataset.n.toLowerCase() !== me) li.setAttribute("aria-haspopup", "dialog");
      });
    }).observe(lijst, { childList: true });
  }

  return { open, sluit, start };
})();
