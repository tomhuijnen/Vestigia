/* Vestigia – eikels, avatars, Mijn profiel, shop en prestaties (stap 6 en 6b).
   Mijn profiel: kiezen uit wat je hebt. Shop: kopen, van goedkoop naar duur.
   Alles wat geld of bezit is, rekent de server uit (wallet, my_items, buy_item, set_profile); de app bewaart
   alleen een kopie om meteen iets te kunnen tonen. Zolang de database nog niet is bijgewerkt, blijven
   eikels en winkel onzichtbaar en werkt de rest van de app gewoon. */
"use strict";

/* ---------- tekenen: avatar met achtergrondkleur en lijst ---------- */
const KLEUREN = {
  groen: { bg: "#4b7a5e", fg: "#edfbe2", naam: "Groen" },
  mint:  { bg: "#d6eccb", fg: "#2c4a37", naam: "Mint" },
  oker:  { bg: "#a9792b", fg: "#fbf1d9", naam: "Oker" },
  heide: { bg: "#76506f", fg: "#f7eaf4", naam: "Heide" },
  nacht: { bg: "#1e2c3b", fg: "#dfe9f2", naam: "Nacht" }
};
const LIJSTEN = {
  hout: `<circle cx="50" cy="50" r="47" fill="none" stroke="#7d5330" stroke-width="6"/><circle cx="50" cy="50" r="47" fill="none" stroke="#b07a46" stroke-width="1.6" stroke-dasharray="7 10" stroke-linecap="round"/>`,
  mos: `<circle cx="50" cy="50" r="47" fill="none" stroke="#56742c" stroke-width="6"/><circle cx="50" cy="50" r="47" fill="none" stroke="#a6c95e" stroke-width="2.4" stroke-dasharray="1 5" stroke-linecap="round"/>`,
  nachtzicht: `<circle cx="50" cy="50" r="47" fill="none" stroke="#0e1822" stroke-width="6"/><circle cx="50" cy="50" r="47" fill="none" stroke="#cfe3ff" stroke-width="1.8" stroke-dasharray="0.1 11" stroke-linecap="round"/>`,
  goud: `<circle cx="50" cy="50" r="47" fill="none" stroke="#c9972e" stroke-width="6"/><circle cx="50" cy="50" r="44.3" fill="none" stroke="#f5dc8e" stroke-width="1"/>`
};
const MEDAILLE_RING = `<circle cx="50" cy="50" r="47.5" fill="none" stroke="#e2b84e" stroke-width="5"/>`;
const EIKEL = `<svg class="eikel" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M8 2.6V1.2" stroke="#7d5330" stroke-width="1.4" stroke-linecap="round"/><path d="M2.8 6.6C2.8 4.1 5.1 2.6 8 2.6s5.2 1.5 5.2 4Z" fill="#7d5330"/><path d="M3.9 7.1h8.2c0 3.6-1.8 6.6-4.1 6.6S3.9 10.7 3.9 7.1Z" fill="#d9a441"/></svg>`;
let avNr = 0;
/* p = { avatar, frame, color, name }; medaille-avatars krijgen een gouden rand zolang er geen lijst is gekozen */
function avatarSVG(p, cls){
  p = p || {};
  const k = KLEUREN[p.color] || KLEUREN.groen, id = "av" + (++avNr), teken = p.avatar && AVATARS[p.avatar];
  const medaille = teken && MEDALS.some(t => t.id === p.avatar);
  const binnen = teken
    ? `<g clip-path="url(#${id})" color="${k.fg}">${AVATARS[p.avatar]}</g>`
    : `<text x="50" y="50" dy=".35em" text-anchor="middle" font-size="46" font-family="Rubik, sans-serif" font-weight="600" fill="${k.fg}">${esc(((p.name || "?").trim()[0] || "?").toUpperCase())}</text>`;
  return `<svg class="${cls || "avatar"}" viewBox="0 0 100 100" aria-hidden="true" style="--av-bg:${k.bg}"><defs><clipPath id="${id}"><circle cx="50" cy="50" r="50"/></clipPath></defs>
    <circle cx="50" cy="50" r="50" fill="${k.bg}"/>${binnen}${p.frame && LIJSTEN[p.frame] ? LIJSTEN[p.frame] : medaille ? MEDAILLE_RING : ""}</svg>`;
}

const Profiel = (() => {
  const K = { wallet: "vestigia:wallet", prest: "vestigia:prestaties", mij: "vestigia:profiel", items: "vestigia:items", code: "vestigia:codeBewaard", beloning: "vestigia:prestatie-eikels" };
  const lees = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const zet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const p = () => online.enabled ? online.player() : null;
  const args = extra => Object.assign({ p_id: p().id, p_key: p().key }, extra || {});
  let winkel = null;                 // shop(): alle items met prijs
  let beschikbaar = null;            // null = onbekend, false = functies staan nog niet in Supabase
  const anderen = new Map();         // profielen van andere spelers (ranglijst, league)

  const wallet = () => p() ? lees(K.wallet) : null;
  const mijn = () => Object.assign({ name: p() && p().name }, (p() && lees(K.mij)) || {});
  const bezit = () => new Set((p() && lees(K.items)) || []);

  async function haalWallet(){ const r = await online.rpc("wallet", args()); const w = Array.isArray(r) ? r[0] : r; zet(K.wallet, w); beschikbaar = true; return w; }
  async function haalPrestaties(){ const r = await online.rpc("my_prestaties", args()); zet(K.prest, r); return r; }
  async function haalAlles(){
    if (!p()) return false;
    try {
      const [w, pr, items, prof, shop] = await Promise.all([
        haalWallet(), haalPrestaties(), online.rpc("my_items", args()),
        online.rpc("player_profiles", { p_names: [p().name] }), winkel ? Promise.resolve(winkel) : online.rpc("shop")
      ]);
      zet(K.items, items || []); winkel = (shop || []).slice().sort((a, b) => (a.for_sale === b.for_sale ? 0 : a.for_sale ? -1 : 1) || a.price - b.price || a.sort - b.sort);
      /* eikels per niveau van elke prestatie; bestaat pas na supabase-003 en is dus niet verplicht */
      online.rpc("prestatie_eikels").then(r => { zet(K.beloning, r || []); inVestiarium(); if (VIEW === "profiel") teken(); }).catch(() => {});
      const me = (prof || [])[0]; if (me) { zet(K.mij, { avatar: me.avatar, subtitle: me.subtitle, frame: me.frame, color: me.color }); anderen.set(me.name.toLowerCase(), me); }
      saldoInKop(); renderMenu();
      return true;
    } catch(e){
      if (e.status === 404) beschikbaar = false;     // de functies van stap 4 staan nog niet in Supabase
      return false;
    }
  }

  /* ---------- saldo naast het menu ---------- */
  function saldoInKop(){
    const w = wallet(), aan = !!(w && p());
    ["eikelBtn", "slimEikel"].forEach(id => { const b = $(id); if (!b) return; b.hidden = !aan; if (aan) b.querySelector("span").textContent = w.saldo; });
    if (aan) $("eikelBtn").setAttribute("aria-label", `${w.saldo} eikels, naar de shop`);
  }

  /* ---------- na een spel: wat leverde het op ---------- */
  let winst = null;      // { k: spel, n: eikels }
  const spelKey = () => `${S.mode}:${S.caseNo || ""}:${S.target}:${S.expert ? 1 : 0}:${S.k || 0}`;
  const NIV = ["", "brons", "zilver", "goud"];
  async function naSpel(){
    if (!p() || beschikbaar === false) return;
    const oudW = wallet(), oudP = lees(K.prest) || [], key = spelKey();
    try {
      const w = await haalWallet(), pr = await haalPrestaties();
      saldoInKop(); renderMenu();
      if (oudW && w.verdiend > oudW.verdiend){
        winst = { k: key, n: w.verdiend - oudW.verdiend };
        toonWinst();
      }
      if (oudP.length) for (const r of pr){
        const was = (oudP.find(o => o.id === r.id) || {}).niveau || 0;
        if (r.niveau > was){
          const e = beloning(r.id), erbij = e ? e.slice(was, r.niveau).reduce((a, b) => a + b, 0) : 0;
          toast(`Prestatie behaald: ${r.label} · ${NIV[r.niveau]}${erbij ? ` · +${erbij} eikels` : ""}${r.niveau === 3 ? ` · ondertitel ${r.goud_titel}` : ""}`);
        }
      }
      online.rpc("my_items", args()).then(i => zet(K.items, i || [])).catch(() => {});
    } catch(e){ if (e.status === 404) beschikbaar = false; }
  }
  function toonWinst(){
    const el = $("eikelGain"); if (!el) return;
    if (winst && winst.k === spelKey()){ el.innerHTML = `${EIKEL} +${winst.n} ${winst.n === 1 ? "eikel" : "eikels"}`; el.hidden = false; }
    else el.hidden = true;
  }

  /* ---------- ranglijst en league: avatar en ondertitel bij de namen ---------- */
  async function versier(list){
    const lis = [...list.querySelectorAll("li[data-n]")]; if (!lis.length) return;
    const nodig = [...new Set(lis.map(li => li.dataset.n))].filter(n => !anderen.has(n.toLowerCase()));
    if (nodig.length) {
      try { (await online.rpc("player_profiles", { p_names: nodig.slice(0, 300) }) || []).forEach(r => anderen.set(r.name.toLowerCase(), r)); }
      catch(e){ return; }
      nodig.forEach(n => { if (!anderen.has(n.toLowerCase())) anderen.set(n.toLowerCase(), { name: n }); });
    }
    list.classList.add("met-av");
    for (const li of lis){
      if (li.querySelector(".rav")) continue;
      const pr = anderen.get(li.dataset.n.toLowerCase()) || { name: li.dataset.n };
      li.querySelector(".pos").insertAdjacentHTML("afterend", `<span class="rav">${avatarSVG(pr, "avatar klein")}</span>`);
      const regel = li.querySelector(".who > span");
      if (pr.subtitle && regel){ regel.title = regel.textContent; regel.textContent = pr.subtitle; regel.classList.add("sub"); }
    }
  }

  /* ---------- herinnering: bewaar je spelerscode ---------- */
  const spelerscode = () => p() ? "VSP-" + p().id + "." + p().key : "";
  function kopieerCode(msg){
    const code = spelerscode();
    try { navigator.clipboard.writeText(code).then(() => { msg.textContent = "Gekopieerd. Bewaar hem op een veilige plek."; zet(K.code, 1); }, () => msg.textContent = code); }
    catch(e){ msg.textContent = code; }
  }
  function codeTip(){
    const box = $("codeTip"); if (!box) return;
    box.hidden = !(p() && !lees(K.code));
  }
  $("codeTipCopy").addEventListener("click", () => { kopieerCode($("codeTipMsg")); setTimeout(() => { $("codeTip").hidden = true; }, 2500); });
  $("codeTipLater").addEventListener("click", () => { zet(K.code, 1); $("codeTip").hidden = true; });

  /* ---------- scherm Mijn profiel: kiezen uit wat je hebt ---------- */
  let tab = "avatar", shopTab = "avatar";
  const TABS = [["avatar", "Avatar"], ["titel", "Ondertitel"], ["lijst", "Lijst"], ["kleur", "Kleur"]];
  const VELD = { avatar: "avatar", titel: "subtitle", lijst: "frame", kleur: "color" };
  const OPBOUW = [["dagcasus", "Dagcasussen"], ["reeksen", "Reeksen van 7 dagen"], ["platen", `Platen in het ${NAAM.vestiarium}`],
                  ["trofeeen", "Titels en medailles"], ["uitnodigingen", "Uitgenodigde spelers"], ["prestaties", "Prestaties"], ["minispellen", "Minispellen"]];
  const zonderNaam = (body, wat) => {
    body.innerHTML = `<div class="playerbox"><p><b>Kies eerst een spelersnaam.</b> ${wat}</p>
      <div class="row2"><button class="btn" id="pfNaam">Kies een spelersnaam</button></div></div>`;
    $("pfNaam").onclick = () => { showRank(); setTimeout(() => $("pName") && $("pName").focus(), 60); };
  };
  const saldoHtml = w => w ? `${EIKEL} ${w.saldo}<small>eikels</small>` : `–<small>eikels</small>`;
  async function render(){
    const body = $("profielBody");
    if (!online.enabled){ body.innerHTML = `<p class="rankempty">Je profiel werkt alleen met de online ranglijst, en die is nog niet ingesteld voor deze versie.</p>`; return; }
    if (!p()){ zonderNaam(body, "Met een naam verdien je eikels, kies je een avatar en zie je je prestaties."); $("pfSaldo").innerHTML = saldoHtml(null); return; }
    teken();
    await haalAlles();
    teken();
  }
  /* een keuzeknop; staat: "aan" (in gebruik), "" (kiezen), "koop" (te koop), "heb" (in bezit, in de shop), "dicht" (te verdienen) */
  const knop = (waarde, inhoud, label, staat, item) => `<button class="pfopt${staat === "aan" ? " aan" : ""}${staat === "dicht" ? " dicht" : ""}" data-v="${esc(waarde)}"${item ? ` data-item="${esc(item.item)}" data-prijs="${item.price}"` : ""}${staat === "dicht" ? " disabled" : ""}>
      ${inhoud}<span class="pl">${esc(label)}</span><span class="ps">${staat === "aan" ? "in gebruik" : staat === "koop" ? `${EIKEL} ${item.price}` : staat === "heb" ? "in bezit" : staat === "dicht" ? "te verdienen" : ""}</span></button>`;
  const heeft = (own, i) => own.has(i.item) || (i.price === 0 && i.for_sale);
  const waardeVan = i => i.item.slice(i.item.indexOf(":") + 1);
  const voorbeeld = (soort, v) => { const me = mijn(); return soort === "titel" ? "" : avatarSVG(Object.assign({}, me, { [VELD[soort]]: v }), "avatar mid"); };
  function teken(){
    const body = $("profielBody"), me = mijn(), w = wallet();
    $("pfSaldo").innerHTML = saldoHtml(w);
    const geenDb = beschikbaar === false;
    body.innerHTML = `
      <div class="pfkaart">${avatarSVG(me, "avatar groot")}<div><h3>${esc(me.name)}</h3><p class="pfsub">${me.subtitle ? esc(me.subtitle) : "Nog geen ondertitel"}</p></div></div>
      ${geenDb ? `<p class="rankempty">Eikels, de shop en prestaties komen beschikbaar zodra de database van Vestigia is bijgewerkt.</p>` : `
      <section class="pfsec" aria-labelledby="pfUitH"><h3 id="pfUitH">Uiterlijk</h3>
        <div class="dexfilters" id="pfTabs">${TABS.map(([k, l]) => `<button class="chipbtn" data-t="${k}" aria-pressed="${tab === k}">${l}</button>`).join("")}</div>
        <div id="pfOpties" class="pfopties${tab === "titel" ? " pftitels" : ""}">${w ? opties() : `<p class="fine">Laden…</p>`}</div>
        <span class="msg" id="pfMsg"></span>
      </section>
      <section class="pfsec" aria-labelledby="pfEikH"><h3 id="pfEikH">Eikels</h3>
        <p class="fine">Eikels verdien je met de dagcasus, reeksen, platen, trofeeën, prestaties en uitgenodigde spelers. Je saldo wordt steeds opnieuw uitgerekend uit wat je gespeeld hebt, dus het raakt nooit kwijt.</p>
        ${w ? `<dl class="pfopbouw">${OPBOUW.filter(([k]) => w.opbouw && w.opbouw[k]).map(([k, l]) => `<dt>${l}</dt><dd>+${w.opbouw[k]}</dd>`).join("")}
          ${w.uitgegeven ? `<dt>Uitgegeven in de shop</dt><dd>−${w.uitgegeven}</dd>` : ""}<dt class="tot">Saldo</dt><dd class="tot">${w.saldo}</dd></dl>` : ""}
        <div class="actions"><button class="btn line" id="pfNaarShop">Naar de shop</button></div>
      </section>
      <section class="pfsec" aria-labelledby="pfPrH"><h3 id="pfPrH">Prestaties</h3><div class="prlist">${prestatieLijst()}</div></section>`}
      <section class="pfsec" aria-labelledby="pfCodeH"><h3 id="pfCodeH">Spelerscode</h3>
        <p class="fine">Met je spelerscode speel je verder op een ander apparaat, of haal je alles terug als je browsergegevens gewist zijn. Deel hem met niemand: met deze code speel je als jou.</p>
        <div class="actions"><button class="btn line" id="pfCode">Kopieer spelerscode</button><span class="msg" id="pfCodeMsg"></span></div>
      </section>`;
    $("pfCode").onclick = () => { kopieerCode($("pfCodeMsg")); codeTip(); };
    if (!geenDb){
      $("pfTabs").querySelectorAll(".chipbtn").forEach(b => b.onclick = () => { tab = b.dataset.t; teken(); });
      $("pfNaarShop").onclick = () => showShop(tab);
      $("pfOpties").querySelectorAll("button.pfopt").forEach(b => b.onclick = () => b.dataset.shop ? showShop(tab) : kies(tab, b.dataset.v || null, $("pfMsg")));
    }
  }
  /* Mijn profiel: ‘geen’, dan alles wat je hebt (goedkoop naar duur), en een knop naar de shop */
  function opties(){
    const me = mijn(), own = bezit(), items = (winkel || []).filter(i => i.kind === tab && i.kind !== "titel" && heeft(own, i));
    const naarShop = `<button class="pfopt pfshop" data-shop="1"><span class="pfplus" aria-hidden="true">+</span><span class="pl">Meer in de shop</span><span class="ps"></span></button>`;
    if (tab === "titel"){
      const heb = [...own].filter(x => x.startsWith("titel:")).map(x => x.slice(6));
      return knop("", "", "Geen ondertitel", me.subtitle ? "" : "aan") + heb.map(t => knop(t, "", t, me.subtitle === t ? "aan" : "")).join("") + naarShop;
    }
    const geen = tab === "avatar" ? "" : knop("", voorbeeld(tab, null), tab === "lijst" ? "Geen lijst" : "Groen", me[VELD[tab]] ? "" : "aan");
    return geen + items.map(i => { const v = waardeVan(i);
      return knop(v, voorbeeld(tab, v), i.label, me[VELD[tab]] === v ? "aan" : ""); }).join("") + naarShop;
  }
  async function kies(soort, waarde, msg){
    const me = mijn(), nieuw = Object.assign({}, me, { [VELD[soort]]: waarde });
    try {
      await online.rpc("set_profile", args({ p_avatar: nieuw.avatar || null, p_subtitle: nieuw.subtitle || null, p_frame: nieuw.frame || null, p_color: nieuw.color || null }));
      zet(K.mij, { avatar: nieuw.avatar || null, subtitle: nieuw.subtitle || null, frame: nieuw.frame || null, color: nieuw.color || null });
      anderen.delete(me.name.toLowerCase());
      if (VIEW === "profiel") teken(); else tekenShop();
      renderMenu();
      return true;
    } catch(e){ if (msg) msg.textContent = e.status && e.status < 500 ? e.message : "Opslaan lukte niet. Controleer je internetverbinding."; return false; }
  }

  /* ---------- Shop: kopen, per soort van goedkoop naar duur ---------- */
  async function renderShop(t){
    if (t) shopTab = t;
    const body = $("shopBody");
    if (!online.enabled){ body.innerHTML = `<p class="rankempty">De shop werkt alleen met de online ranglijst, en die is nog niet ingesteld voor deze versie.</p>`; return; }
    if (!p()){ zonderNaam(body, "Met een naam verdien je eikels en koop je in de shop een avatar, ondertitel, lijst of kleur."); $("shopSaldo").innerHTML = saldoHtml(null); return; }
    tekenShop();
    await haalAlles();
    tekenShop();
  }
  function tekenShop(){
    const body = $("shopBody"), w = wallet();
    $("shopSaldo").innerHTML = saldoHtml(w);
    if (beschikbaar === false){ body.innerHTML = `<p class="rankempty">De shop komt beschikbaar zodra de database van Vestigia is bijgewerkt.</p>`; return; }
    body.innerHTML = `
      <div class="dexfilters" id="shopTabs">${TABS.map(([k, l]) => `<button class="chipbtn" data-t="${k}" aria-pressed="${shopTab === k}">${l === "Avatar" ? "Avatars" : l === "Ondertitel" ? "Ondertitels" : l === "Lijst" ? "Lijsten" : "Kleuren"}</button>`).join("")}</div>
      <div id="shopOpties" class="pfopties${shopTab === "titel" ? " pftitels" : ""}">${w && winkel ? shopOpties() : `<p class="fine">Laden…</p>`}</div>
      <span class="msg" id="shopMsg"></span>`;
    $("shopTabs").querySelectorAll(".chipbtn").forEach(b => b.onclick = () => { shopTab = b.dataset.t; tekenShop(); });
    $("shopOpties").querySelectorAll("button.pfopt:not(.dicht)").forEach(b => b.onclick = () => koop(b));
  }
  /* te koop (goedkoop naar duur), dan wat je al hebt, dan wat je alleen kunt verdienen */
  function shopOpties(){
    const me = mijn(), own = bezit(), items = (winkel || []).filter(i => i.kind === shopTab && i.price > 0);
    const koopbaar = items.filter(i => i.for_sale && !own.has(i.item)), gekocht = items.filter(i => own.has(i.item));
    let html = koopbaar.map(i => knop(waardeVan(i), voorbeeld(shopTab, waardeVan(i)), i.label, "koop", i)).join("")
             + gekocht.map(i => knop(waardeVan(i), voorbeeld(shopTab, waardeVan(i)), i.label, me[VELD[shopTab]] === waardeVan(i) ? "aan" : "heb", i)).join("");
    if (!koopbaar.length) html = `<p class="fine pfnoot">Je hebt alles uit deze rij al.</p>` + html;
    if (shopTab === "avatar"){
      const medailles = (winkel || []).filter(i => i.kind === "avatar" && !i.for_sale && !own.has(i.item));
      html += medailles.map(i => knop(waardeVan(i), `<span class="pfgeheim">?</span>`, "Medaille-avatar", "dicht", i)).join("")
            + `<p class="fine pfnoot">Medaille-avatars koop je niet: je krijgt ze als je een van de ${telwoord(MEDALS.length)} lastigste soorten determineert.</p>`;
    }
    if (shopTab === "titel"){
      const heb = [...own].filter(x => x.startsWith("titel:")).map(x => x.slice(6)), pr = lees(K.prest) || [];
      const verdien = [...Object.entries(TITLES).map(([g, t]) => [t, `alle ${GROUPS[g].toLowerCase()} in je ${NAAM.vestiarium}`]), [TITLE_ALL, `alle soorten in je ${NAAM.vestiarium}`],
                       ...pr.map(r => [r.goud_titel, `goud bij ‘${r.label}’`])].filter(([t]) => !heb.includes(t));
      html += verdien.map(([t, hoe]) => `<div class="pfopt dicht"><span class="pl">${esc(t)}</span><span class="ps">${esc(hoe)}</span></div>`).join("");
    }
    return html;
  }
  /* kopen gaat in twee tikken; daarna is het meteen in gebruik. Iets wat je al hebt, zet je met één tik in gebruik. */
  async function koop(b){
    const item = b.dataset.item, prijs = +b.dataset.prijs || 0, w = wallet() || { saldo: 0 }, msg = $("shopMsg");
    if (bezit().has(item)) return kies(shopTab, b.dataset.v || null, msg);
    if (w.saldo < prijs){ msg.textContent = `Je hebt nog ${prijs - w.saldo} eikels nodig.`; return; }
    if (!b.dataset.zeker){ b.dataset.zeker = "1"; b.querySelector(".ps").textContent = `kopen voor ${prijs}?`; setTimeout(() => { if (b.isConnected){ delete b.dataset.zeker; b.querySelector(".ps").innerHTML = `${EIKEL} ${prijs}`; } }, 4000); return; }
    b.disabled = true; msg.textContent = "Even geduld…";
    try { await online.rpc("buy_item", args({ p_item: item })); await haalAlles(); }
    catch(e){ b.disabled = false; msg.textContent = e.status && e.status < 500 ? e.message : "Kopen lukte niet. Controleer je internetverbinding."; return; }
    if (await kies(shopTab, b.dataset.v || null, msg)) { $("shopMsg").textContent = "Gekocht en in gebruik. Wisselen doe je in Mijn profiel."; }
  }
  /* eikels per niveau [brons, zilver, goud] van een prestatie, of null zolang supabase-003 er nog niet is */
  function beloning(id){ const r = (lees(K.beloning) || []).find(x => x.id === id); return r ? [r.brons, r.zilver, r.goud] : null; }
  function prestatieLijst(){
    const pr = lees(K.prest) || [];
    if (!pr.length) return `<p class="fine">Nog geen prestaties geladen.</p>`;
    return pr.map(r => {
      const doel = r.niveau >= 3 ? r.goud : [r.brons, r.zilver, r.goud][r.niveau], frac = Math.min(1, r.waarde / doel);
      return `<div class="pr n${r.niveau}"><span class="prniv" aria-label="${NIV[r.niveau] || "nog niet behaald"}">${r.niveau ? NIV[r.niveau][0].toUpperCase() : ""}</span>
        <span class="prtxt"><b>${esc(r.label)}</b><span>${r.niveau >= 3 ? `goud behaald · ondertitel ${esc(r.goud_titel)}` : `${r.waarde} van ${doel} voor ${NIV[r.niveau + 1]}${beloning(r.id) ? ` · <span class="preik">${EIKEL} +${beloning(r.id)[r.niveau]}</span>` : ""}`}</span>
        <span class="tb"><i style="width:${Math.round(100 * frac)}%"></i></span></span></div>`;
    }).join("");
  }
  /* prestaties ook in het Vestiarium */
  function inVestiarium(){
    const sec = $("dexPrest"); if (!sec) return;
    const pr = p() ? lees(K.prest) : null;
    sec.hidden = !(pr && pr.length);
    if (!sec.hidden) $("dexPrestList").innerHTML = prestatieLijst();
  }

  /* bij het opstarten: saldo en profiel ophalen (stil als het niet lukt) */
  function start(){ saldoInKop(); codeTip(); if (p()) haalAlles().then(() => { codeTip(); inVestiarium(); }); }

  return { render, renderShop, naSpel, toonWinst, versier, saldoInKop, codeTip, start, mijn, inVestiarium, haalAlles,
           naNaam(){ codeTip(); haalAlles(); } };
})();

function showProfiel(){
  setView("profiel");
  Profiel.render();
  window.scrollTo({ top:0, behavior:"auto" });
}
function showShop(tab){
  setView("shop");
  Profiel.renderShop(tab);
  window.scrollTo({ top:0, behavior:"auto" });
}
