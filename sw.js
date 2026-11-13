/* Vestigia service worker: de app werkt offline; de ranglijst gaat altijd via het netwerk. */
/* VERSION niet met de hand aanpassen: node tools/versie.mjs zet hem, en zet hetzelfde nummer achter de bestanden in index.html (?v=…).
   Zo haalt een geïnstalleerde app na een update nooit een nieuwe pagina met oude scripts uit de cache. */
const VERSION = "vestigia-202611131329";
const STAMP = VERSION.slice("vestigia-".length);
const ASSETS = ["css/vestigia.css", "data/teksten.js", "data/soorten.js", "data/sporen.js", "data/dagschema.js", "data/veldweken.js", "data/toelichting.js", "data/zoekgroepen.js", "data/bronnen.js",
  "js/kern.js", "js/spel.js", "js/veldboek.js", "js/melden.js", "js/kop.js", "js/spelen.js", "js/opening.js", "js/uitleg.js", "js/online.js", "js/league.js", "data/avatars.js", "js/profiel.js", "data/advent.js", "js/wachtrij.js", "js/kerst.js", "data/dwaalgasten.js", "js/dwaalgast.js", "js/nieuw.js", "js/levels.js", "js/statistiek.js", "js/duel.js", "js/qrcode.js", "js/apparaat.js", "js/push.js", "js/week.js", "js/app.js"];
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
    // eerst netwerk (nieuwste versie), offline uit de cache. In het veld is het netwerk vaak traag: na 3 seconden
    // zonder antwoord nemen we de versie uit de cache, en het netwerk werkt de cache op de achtergrond nog bij.
    const net = fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put("index.html", copy)); return r; });
    const traag = new Promise(res => setTimeout(res, 3000)).then(() => caches.match("index.html"));
    e.respondWith(Promise.race([net, traag.then(hit => hit || net)]).catch(() => caches.match("index.html")));
    e.waitUntil(net.catch(() => {}));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});

/* pushmeldingen (update 18): het seintje van 19:00. Een tik opent de app (of haalt hem naar voren) op de dagcasus. */
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch(x){ d = { tekst: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.titel || "Vestigia", {
    body: d.tekst || "De dagcasus van vandaag wacht nog op je.",
    icon: "icons/app-192.png", badge: "icons/app-192.png",
    tag: d.tag || "dagcasus", renotify: false, data: { url: d.url || "./" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const doel = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(lijst => {
    const open = lijst.find(c => c.url.startsWith(self.registration.scope));
    if (open){ open.focus(); try { open.postMessage("dagcasus"); } catch(x){} return; }
    return self.clients.openWindow(doel);
  }));
});
