/* Vestigia service worker: de app werkt offline; de ranglijst gaat altijd via het netwerk. */
/* VERSION niet met de hand aanpassen: node tools/versie.mjs zet hem, en zet hetzelfde nummer achter de bestanden in index.html (?v=…).
   Zo haalt een geïnstalleerde app na een update nooit een nieuwe pagina met oude scripts uit de cache. */
const VERSION = "vestigia-202611091048";
const STAMP = VERSION.slice("vestigia-".length);
const ASSETS = ["css/vestigia.css", "data/teksten.js", "data/soorten.js", "data/sporen.js", "data/dagschema.js",
  "js/kern.js", "js/spel.js", "js/veldboek.js", "js/melden.js", "js/kop.js", "js/spelen.js", "js/opening.js", "js/uitleg.js", "js/online.js", "js/league.js", "data/avatars.js", "js/profiel.js", "js/app.js"];
const SHELL = ["./", "index.html", "config.js", "app.webmanifest",
  "icons/app.svg", "icons/app-192.png", "icons/app-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"]
  .concat(ASSETS.map(f => f + "?v=" + STAMP));

self.addEventListener("install", e => {
  /* cache: "reload": altijd vers van de server, nooit uit de browsercache (anders kon een oud icoon of manifest
     in de nieuwe versie belanden, zoals bij de snelkoppeling in november 2026) */
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== "vestigia-fonts").map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("message", e => { if (e.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.hostname.endsWith("supabase.co")) return;              // ranglijst: altijd live
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    e.respondWith(caches.open("vestigia-fonts").then(async c => {
      const hit = await c.match(e.request);
      const net = fetch(e.request).then(r => { if (r.ok || r.type === "opaque") c.put(e.request, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  if (e.request.mode === "navigate"){
    // eerst netwerk (nieuwste versie), offline uit de cache
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put("index.html", copy)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
