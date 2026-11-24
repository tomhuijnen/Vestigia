// Vestigia – pushmeldingen (update 18). Supabase Edge Function ‘dagcasus-push’.
// Draait op de server; er hoeft geen laptop aan te staan en geen Claude-sessie te lopen.
//   { soort: "sleutel" }              → de openbare VAPID-sleutel (de app heeft hem nodig om zich aan te melden).
//                                       Bestaan de sleutels nog niet, dan maakt hij ze één keer en bewaart ze in
//                                       push_instellingen (supabase-020). Niemand hoeft dus een sleutel over te typen.
//   { soort: "avond" }                → door pg_cron om 17:00 en 18:00 UTC; verstuurt alleen als het in Amsterdam
//                                       19:00 is, alleen met het juiste geheim, en alleen als push aan staat.
//   { soort: "test", p_id, p_key }    → testmelding naar je eigen apparaten (met ?push=demo in de app).
//   { soort: "duel", duel }           → door de trigger op duels (supabase-046) bij een uitdaging op naam; alleen met het
//                                       juiste geheim. Wie wanneer een seintje krijgt, beslist _vestigia_push_duel (update 70).
//   { soort: "duel-bijna", test? }    → door pg_cron elk kwartier (supabase-050, update 113): nog 12 uur voor je duel en je
//                                       speelde je casussen nog niet (allemaal). Eén keer per duel per speler; ’s nachts
//                                       niet (dan vanaf 08:00, met de echte resterende tijd). Met test: true alleen kijken.
// verify_jwt staat uit: de nieuwe publishable key is geen JWT. Deze functie controleert zelf (geheim of spelerscode).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const antwoord = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, "Content-Type": "application/json" } });

async function sleutels(): Promise<{ publiek: string; prive: string }> {
  const { data, error } = await db.rpc("_vestigia_push_sleutels");
  if (error) throw error;
  const r = Array.isArray(data) ? data[0] : data;
  if (r && r.publiek && r.prive) return r;
  const k = webpush.generateVAPIDKeys();
  const z = await db.rpc("_vestigia_push_sleutels_zet", { p_publiek: k.publicKey, p_prive: k.privateKey });
  if (z.error) throw z.error;
  const n = Array.isArray(z.data) ? z.data[0] : z.data;    // wie het eerst was, wint: altijd dezelfde sleutels terug
  return n;
}

const amsterdamUur = () => +new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", hour: "numeric", hourCycle: "h23" }).format(new Date());

// wisselende teksten (12 november 2026: niet allemaal met dezelfde afsluiter)
const ZONDER_REEKS = [
  "De dagcasus van vandaag wacht nog op je. Welk dier is het deze keer?",
  "Er is vandaag een beschermde soort waargenomen. Herken jij hem?",
  "Je hebt de dagcasus van vandaag nog niet gedetermineerd. Je hebt nog tot middernacht!",
  "Vijf waarnemingen, één beschermde soort. Speel je de dagcasus van vandaag nog?",
];
const MET_REEKS = [
  (n: number) => `Je reeks van ${n} dagen staat op het spel. Nog even snel de dagcasus determineren?`,
  (n: number) => `Al ${n} dagen op rij gespeeld! Houd je reeks vast met de dagcasus van vandaag.`,
];
function tekst(reeks: number, i: number) {
  if (reeks >= 2) return MET_REEKS[i % MET_REEKS.length](reeks);
  return ZONDER_REEKS[i % ZONDER_REEKS.length];
}

// update 113: ‘nog 12 uur’ met de echte resterende tijd (’s nachts uitgesteld tot 08:00, dan bijv. ‘nog 5 uur’)
function bijnaTekst(o: Ontvanger) {
  const uur = Math.round((o.minuten || 0) / 60);     // elk kwartier gekeken: 11:50 is ‘nog 12 uur’
  const tijd = uur >= 1 ? `nog ${uur} uur` : "nog minder dan een uur";
  const tegen = o.tegen ? `je spelersduel tegen ${o.tegen}` : "je spelersduel";
  const te = 3 - (o.gespeeld || 0);
  if (!o.gespeeld) return `Je hebt ${tijd} voor ${tegen}. Speel je drie casussen voordat het duel verloopt!`;
  return `Je hebt ${tijd} voor ${tegen}. Nog ${te === 1 ? "één casus" : `${te} casussen`} en je bent klaar!`;
}

type Ontvanger = { endpoint: string; p256dh: string; auth: string; reeks?: number; uitdager?: string; expert?: boolean; code?: string; open_n?: number;
                   tegen?: string; gespeeld?: number; minuten?: number };
type Opties = { tag?: string; url?: (o: Ontvanger) => string; klaar?: string; badge?: (o: Ontvanger) => number };
async function verstuur(lijst: Ontvanger[], maak: (o: Ontvanger, i: number) => string, markeer: boolean, opt: Opties = {}) {
  const k = await sleutels();
  webpush.setVapidDetails("https://tomhuijnen.github.io/Vestigia/", k.publiek, k.prive);
  const dag = new Date().getDate();
  let ok = 0, weg = 0, fout = 0;
  // in kleine groepjes tegelijk, zodat het snel gaat zonder de pushdiensten te overspoelen
  for (let s = 0; s < lijst.length; s += 20) {
    await Promise.all(lijst.slice(s, s + 20).map(async (o, j) => {
      const payload = JSON.stringify({ titel: "Vestigia", tekst: maak(o, dag + s + j), tag: opt.tag || "dagcasus", url: opt.url ? opt.url(o) : "./", ...(opt.badge ? { badge: opt.badge(o) } : {}) });
      let status: "ok" | "weg" | "fout" = "ok";
      try {
        await webpush.sendNotification({ endpoint: o.endpoint, keys: { p256dh: o.p256dh, auth: o.auth } }, payload, { TTL: 4 * 3600, urgency: "normal" });
      } catch (e) {
        const c = (e as { statusCode?: number }).statusCode;
        status = c === 404 || c === 410 ? "weg" : "fout";     // 404/410: dit apparaat is afgemeld of verlopen
      }
      if (status === "ok") ok++; else if (status === "weg") weg++; else fout++;
      if (markeer || status === "weg") await db.rpc(opt.klaar || "_vestigia_push_verstuurd", { p_endpoint: o.endpoint, p_status: status });
    }));
  }
  return { verstuurd: ok, afgemeld: weg, mislukt: fout };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    if (body.soort === "sleutel") return antwoord({ publiek: (await sleutels()).publiek });

    if (body.soort === "test") {
      const { data, error } = await db.rpc("_vestigia_push_test", { p_id: body.p_id, p_key: body.p_key });
      if (error) return antwoord({ fout: "Onbekende speler" }, 403);
      const r = await verstuur(data || [], () => "Testmelding: zo ziet het seintje van 19:00 eruit. Tik erop om de dagcasus te openen.", false);
      return antwoord(r);
    }

    if (body.soort === "avond") {
      const { data: goed } = await db.rpc("_vestigia_push_geheim_ok", { p_geheim: req.headers.get("x-vestigia-geheim") || "" });
      if (goed !== true) return antwoord({ fout: "Geen toegang" }, 403);
      if (amsterdamUur() !== 19 && !body.nu) return antwoord({ overgeslagen: "het is geen 19:00 in Amsterdam" });
      const { data, error } = await db.rpc("_vestigia_push_ontvangers");
      if (error) throw error;
      return antwoord(await verstuur(data || [], (o, i) => tekst(o.reeks || 0, i), true));
    }

    if (body.soort === "duel") {
      const { data: goed } = await db.rpc("_vestigia_push_geheim_ok", { p_geheim: req.headers.get("x-vestigia-geheim") || "" });
      if (goed !== true) return antwoord({ fout: "Geen toegang" }, 403);
      const { data, error } = await db.rpc("_vestigia_push_duel", { p_duel: body.duel });
      if (error) throw error;
      return antwoord(await verstuur(data || [],
        (o) => `${o.uitdager} daagt je uit voor een spelersduel (${o.expert ? "expert" : "klassiek"}). Durf jij het aan?`,
        true, { tag: "duel", url: (o) => `./?duel=${encodeURIComponent(o.code || "")}`, klaar: "_vestigia_push_duel_verstuurd", badge: (o) => o.open_n || 1 }));
    }

    if (body.soort === "duel-bijna") {
      const { data: goed } = await db.rpc("_vestigia_push_geheim_ok", { p_geheim: req.headers.get("x-vestigia-geheim") || "" });
      if (goed !== true) return antwoord({ fout: "Geen toegang" }, 403);
      const test = body.test === true;
      const { data, error } = await db.rpc("_vestigia_push_duel_bijna", { p_echt: !test });
      if (error) throw error;
      const lijst = (data || []) as Ontvanger[];
      if (test) return antwoord({ test: true, apparaten: lijst.length, teksten: lijst.map(bijnaTekst) });
      return antwoord(await verstuur(lijst, (o) => bijnaTekst(o), false,
        { tag: "duel-bijna", url: (o) => `./?duel=${encodeURIComponent(o.code || "")}`, klaar: "_vestigia_push_duel_verstuurd" }));
    }
    return antwoord({ fout: "Onbekende soort" }, 400);
  } catch (e) {
    console.error(e);
    return antwoord({ fout: String((e as Error).message || e) }, 500);
  }
});
