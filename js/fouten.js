/* Vestigia – fouten bij spelers naar Supabase (update 67, verbeteranalyse A6).
   Gaat er bij een speler iets mis in de code (een fout of een afgewezen belofte), dan komt een korte regel in de tabel
   app_fouten, via de functie meld_fout (supabase-039). Zonder persoonsgegevens: geen spelers-id, naam, code of
   voortgang, alleen de foutmelding, waar in de code, de versie, het scherm en een grove apparaatsoort.
   Hooguit 5 meldingen per sessie en elke fout maar één keer. Dit bestand staat bovenaan in index.html, zodat ook
   fouten tijdens het laden binnenkomen. Het versturen mag nooit zelf een fout of een melding in beeld geven. */
"use strict";
(function(){
  const CFG = window.VESTIGIA_CONFIG || {};
  if (!CFG.supabaseUrl || !CFG.supabaseKey) return;
  const src = (document.currentScript && document.currentScript.src) || "";
  const VERSIE = (src.match(/[?&]v=([\w-]+)/) || [, "onbekend"])[1];
  const MAX = 5, gehad = new Set();
  let verstuurd = 0;

  /* grof: welk soort apparaat en browser, en of de app geïnstalleerd is. Nooit de volledige userAgent. */
  function apparaat(){
    const u = navigator.userAgent || "";
    const os = /iPhone|iPad|iPod/.test(u) ? "iOS" : /Android/.test(u) ? "Android" : /Windows/.test(u) ? "Windows" : /Mac OS X/.test(u) ? "macOS" : /Linux/.test(u) ? "Linux" : "anders";
    const br = /SamsungBrowser/.test(u) ? "Samsung Internet" : /Edg\//.test(u) ? "Edge" : /OPR\/|Opera/.test(u) ? "Opera" : /Firefox\/|FxiOS/.test(u) ? "Firefox"
      : /CriOS|Chrome\//.test(u) ? "Chrome" : /Safari\//.test(u) ? "Safari" : "anders";
    const app = navigator.standalone === true || (window.matchMedia && matchMedia("(display-mode: standalone)").matches);
    return `${os} · ${br}${app ? " · app" : ""}`;
  }
  /* alleen het pad binnen Vestigia (js/spel.js:120:8), niet het hele adres met eventuele codes erin */
  const kort = s => String(s || "").replace(/https?:\/\/[^\s)]*?\/((?:js|data)\/[\w.-]+\.js)(\?v=[\w-]+)?/g, "$1").replace(/#[^\s)]*/g, "");
  function stuur(bericht, plek, stapel){
    try {
      bericht = kort(bericht).slice(0, 300);
      if (!bericht || verstuurd >= MAX) return;
      /* ruis van buiten Vestigia (extensies, ‘Script error.’ zonder details) laten we liggen */
      if (/^Script error\.?$/i.test(bericht) || /extension:\/\//.test(plek + stapel)) return;
      const sleutel = bericht + "|" + plek;
      if (gehad.has(sleutel)) return;
      gehad.add(sleutel); verstuurd++;
      const body = JSON.stringify({ p_bericht: bericht, p_plek: kort(plek).slice(0, 200), p_stapel: kort(stapel).slice(0, 1500),
        p_versie: VERSIE, p_scherm: String(typeof VIEW !== "undefined" ? VIEW : "laden").slice(0, 30), p_apparaat: apparaat() });
      fetch(CFG.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/meld_fout", {
        method: "POST", keepalive: true,
        headers: Object.assign({ apikey: CFG.supabaseKey, "Content-Type": "application/json" }, /^eyJ/.test(CFG.supabaseKey) ? { Authorization: "Bearer " + CFG.supabaseKey } : {}),
        body
      }).catch(() => {});
    } catch(e){}
  }
  window.addEventListener("error", e => {
    if (!e || (e.target && e.target !== window)) return;   // een plaatje of lettertype dat niet laadt is geen codefout
    const plek = e.filename ? `${e.filename}:${e.lineno || 0}:${e.colno || 0}` : "";
    stuur(e.message || (e.error && e.error.message), plek, e.error && e.error.stack);
  });
  window.addEventListener("unhandledrejection", e => {
    const r = e && e.reason;
    /* netwerkfouten van de ranglijst (offline, time-out, serverfout) zijn geen fout in de app */
    if (!r || r.offline || r.status != null || r.name === "AbortError") return;
    stuur("Belofte: " + (r.message || String(r)), "", r.stack);
  });
  window.__meldFout = (bericht, plek) => stuur(bericht, plek || "", "");   // voor testen en voor een bewuste melding in de code
})();
