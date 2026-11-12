/* Vestigia – pushmeldingen (update 18)
   Om 19:00 een seintje als je de dagcasus van vandaag nog niet speelde, op elk apparaat dat toestemming gaf.
   Het versturen gebeurt op de server (Edge Function ‘dagcasus-push’ en supabase-020); deze app meldt alleen het
   apparaat aan of af. Plan en besluiten: planning/pushmeldingen.md in het Project.
   - De vraag komt via de wachtrij, na 3 gespeelde dagcasussen (geteld op de server, dus over al je apparaten).
     Eerst onze eigen vraag; pas bij ‘Ja, graag’ de vraag van de browser (wie daar ‘nee’ zegt, krijgt hem nooit meer).
   - ‘Nee, liever niet’: de vraag komt niet terug. Aan- en uitzetten kan altijd met de schakelaar in het menu.
   - iPhone en iPad: alleen als Vestigia op het beginscherm staat (iOS 16.4 of nieuwer).
   - Schakelaar voor iedereen: push_instellingen.actief op de server. Staat die uit, dan ziet niemand iets,
     behalve met ?push=demo (dan meteen de vraag, en in het menu ‘Stuur een testmelding’). */
"use strict";

const Push = (() => {
  const CFG = window.VESTIGIA_CONFIG || {};
  const URL_F = (CFG.supabaseUrl || "").replace(/\/$/, "") + "/functions/v1/dagcasus-push";
  const K = { sleutel: "vestigia:pushSleutel", gevraagd: "vestigia:pushGevraagd", stand: "vestigia:pushStand", vers: "vestigia:pushVers" };
  const lees = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const zet = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  let demo = false;
  try { const u = new URLSearchParams(location.search); if (u.get("push") === "demo") sessionStorage.setItem("vestigia:pushdemo", "1"); if (u.get("push") === "uit") sessionStorage.removeItem("vestigia:pushdemo"); demo = !!sessionStorage.getItem("vestigia:pushdemo"); } catch(e){}

  const kanHier = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const ios = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  const alsApp = () => typeof Apparaat !== "undefined" ? Apparaat.isApp() : false;
  /* op een iPhone werkt het alleen in de app op het beginscherm */
  const moetApp = () => ios() && !alsApp();
  const acc = () => online.enabled ? online.account() : null;
  const stand = () => lees(K.stand) || {};           // { actief, dagen, aan, dag }
  const zichtbaar = () => !!acc() && (stand().actief || demo);

  async function haalStand(){
    const a = acc(); if (!a) return null;
    try {
      const r = await online.rpc("push_stand", { p_id: a.id, p_key: a.key, p_apparaat: Apparaat.nummer() });
      const s = { actief: !!r.actief, dagen: +r.dagen || 0, aan: !!r.aan, dag: todayIndex() };
      zet(K.stand, s); teken(); return s;
    } catch(e){ return null; }                        // supabase-020 nog niet gedraaid, of geen internet
  }

  async function sleutel(){
    const s = lees(K.sleutel); if (s) return s;
    const r = await fetch(URL_F, { method: "POST", headers: { "Content-Type": "application/json", apikey: CFG.supabaseKey }, body: JSON.stringify({ soort: "sleutel" }) });
    const d = await r.json();
    if (!d.publiek) throw new Error("Geen sleutel");
    zet(K.sleutel, d.publiek); return d.publiek;
  }
  const bytes = b64 => { const p = "=".repeat((4 - b64.length % 4) % 4), s = atob((b64 + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, c => c.charCodeAt(0)); };
  const reg = () => navigator.serviceWorker.ready;

  async function meldAan(sub){
    const a = acc(), j = sub.toJSON();
    await online.rpc("push_aan", { p_id: a.id, p_key: a.key, p_apparaat: Apparaat.nummer(), p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth });
    zet(K.stand, Object.assign(stand(), { aan: true })); zet(K.vers, todayIndex());
  }

  /* aanzetten: toestemming van de browser, aanmelden bij de pushdienst, dan bij Vestigia. Geeft true/false. */
  async function aan(){
    if (!kanHier()){ toast("Deze browser kan geen meldingen ontvangen."); return false; }
    if (moetApp()){ toast("Op een iPhone werkt dit alleen in de app. Zet Vestigia eerst op je beginscherm.", { label: "Hoe?", run: () => { $("toast").hidden = true; showProfiel(); }, duur: 7000 }); return false; }
    let ok = Notification.permission;
    if (ok === "default") ok = await Notification.requestPermission();
    if (ok !== "granted"){ toast("Je browser blokkeert meldingen voor Vestigia. Zet ze aan bij de instellingen van je browser of telefoon.", { duur: 7000 }); teken(); return false; }
    try {
      const r = await reg();
      let sub = await r.pushManager.getSubscription();
      if (!sub) sub = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes(await sleutel()) });
      await meldAan(sub);
      teken();
      toast("Top! Speelde je de dagcasus om 19:00 nog niet, dan krijg je een seintje.");
      return true;
    } catch(e){
      toast("Aanzetten lukte niet. Heb je internet? Probeer het later nog eens via het menu.");
      teken(); return false;
    }
  }
  async function uit(){
    try {
      const r = await reg(), sub = await r.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      const a = acc(); if (a) await online.rpc("push_uit", { p_id: a.id, p_key: a.key, p_apparaat: Apparaat.nummer() });
    } catch(e){}
    zet(K.stand, Object.assign(stand(), { aan: false }));
    teken();
    toast("Het seintje van 19:00 staat uit op dit apparaat.");
  }
  const staatAan = () => !!stand().aan && kanHier() && Notification.permission === "granted";

  /* ---------- schakelaar in het menu ---------- */
  function teken(){
    const rij = $("pushRij"), b = $("pushBtn"), t = $("pushTestRij");
    if (!rij) return;
    rij.hidden = !zichtbaar() || !kanHier() && !ios();
    if (b) b.setAttribute("aria-checked", String(staatAan()));
    if (t) t.hidden = !(demo && staatAan());
  }
  let bezig = false;
  if ($("pushBtn")) $("pushBtn").onclick = async () => {
    if (bezig) return; bezig = true;
    try { staatAan() ? await uit() : await aan(); } finally { bezig = false; }
  };
  if ($("pushTest")) $("pushTest").onclick = async () => {
    const a = acc(); if (!a) return;
    try {
      const r = await fetch(URL_F, { method: "POST", headers: { "Content-Type": "application/json", apikey: CFG.supabaseKey }, body: JSON.stringify({ soort: "test", p_id: a.id, p_key: a.key }) });
      const d = await r.json();
      toast(d.verstuurd ? `Testmelding verstuurd naar ${d.verstuurd === 1 ? "1 apparaat" : d.verstuurd + " apparaten"}.` : "Er ging geen testmelding uit. Staat het seintje aan?");
    } catch(e){ toast("Testmelding lukte niet (geen verbinding)."); }
  };

  /* ---------- de vraag, via de wachtrij (na de adventkalender en de app-uitleg, vóór de avatar-herinnering) ---------- */
  const BEL = `<span class="nw-ic"><svg aria-hidden="true" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/><path d="M12 3v2"/></svg></span>`;
  Wachtrij.voeg({ id: "push", prio: 2.7,
    async kan(){
      if (!online.enabled || !acc() || !kanHier() || moetApp()) return false;
      if (Notification.permission !== "default") return false;
      if (lees(K.gevraagd) && !demo) return false;
      const s = await haalStand();
      if (demo) return true;
      return !!(s && s.actief && !s.aan && s.dagen >= 3);
    },
    toon(){
      zet(K.gevraagd, todayIndex());
      const pop = $("wachtPop");
      $("wachtBody").innerHTML = `
        <div class="nw-stap pushvraag">${BEL}<h2 id="wachtH">Een seintje om 19:00?</h2>
          <p>Speelde je de dagcasus van vandaag nog niet, dan krijg je om 19:00 een melding. Hooguit één per dag, en nooit als je al gespeeld hebt.</p></div>
        <div class="nw-knoppen"><button class="linklike" id="pushNee">Nee, liever niet</button><button class="btn" id="pushJa">Ja, graag</button></div>
        <p class="fine">Aan- of uitzetten kan altijd in het menu, per apparaat.</p>`;
      const dicht = () => { pop.hidden = true; pop.classList.remove("nieuw"); };
      $("pushNee").onclick = () => { dicht(); toast("Prima. Wil je het later toch? Je vindt het seintje in het menu."); };
      $("pushJa").onclick = () => { dicht(); aan(); };
      pop.classList.add("nieuw");
      pop.hidden = false;
      $("pushJa").focus();
    } });

  /* ---------- bij het opstarten: stand ophalen (hooguit eens per dag) en een verlopen aanmelding stil vernieuwen ---------- */
  async function start(){
    teken();
    if (!acc()) return;
    if (stand().dag !== todayIndex() || demo) await haalStand();
    if (!kanHier() || Notification.permission !== "granted" || !stand().aan) return;
    if (lees(K.vers) === todayIndex()) return;
    try {
      const r = await reg();
      let sub = await r.pushManager.getSubscription();
      if (!sub) sub = await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes(await sleutel()) });
      await meldAan(sub);
    } catch(e){}
  }
  return { start, aan, uit, teken, zichtbaar };
})();
