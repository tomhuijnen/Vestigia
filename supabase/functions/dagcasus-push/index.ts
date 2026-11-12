// Vestigia – pushmeldingen (update 18). Supabase Edge Function ‘dagcasus-push’.
// Draait op de server; er hoeft geen laptop aan te staan en geen Claude-sessie te lopen.
//   { soort: "sleutel" }              → de openbare VAPID-sleutel (de app heeft hem nodig om zich aan te melden).
//                                       Bestaan de sleutels nog niet, dan maakt hij ze één keer en bewaart ze in
//                                       push_instellingen (supabase-020). Niemand hoeft dus een sleutel over te typen.
//   { soort: "avond" }                → door pg_cron om 17:00 en 18:00 UTC; verstuurt alleen als het in Amsterdam
//                                       19:00 is, alleen met het juiste geheim, en alleen als push aan staat.
//   { soort: "test", p_id, p_key }    → testmelding naar je eigen apparaten (met ?push=demo in de app).
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

const ZONDER_REEKS = [
  "De dagcasus van vandaag wacht nog op je. Je laat hem toch niet schieten?",
  "Er is vandaag een nieuwe soort gezien. Je laat de dagcasus toch niet schieten?",
  "Nog niet gedetermineerd vandaag. Je laat de dagcasus toch niet schieten?",
];
function tekst(reeks: number, i: number) {
  if (reeks >= 2) return `Je reeks van ${reeks} dagen staat op het spel. Je laat de dagcasus toch niet schieten?`;
  return ZONDER_REEKS[i % ZONDER_REEKS.length];
}

type Ontvanger = { endpoint: string; p256dh: string; auth: string; reeks: number };
async function verstuur(lijst: Ontvanger[], maak: (o: Ontvanger, i: number) => string, markeer: boolean) {
  const k = await sleutels();
  webpush.setVapidDetails("https://tomhuijnen.github.io/Vestigia/", k.publiek, k.prive);
  const dag = new Date().getDate();
  let ok = 0, weg = 0, fout = 0;
  // in kleine groepjes tegelijk, zodat het snel gaat zonder de pushdiensten te overspoelen
  for (let s = 0; s < lijst.length; s += 20) {
    await Promise.all(lijst.slice(s, s + 20).map(async (o, j) => {
      const payload = JSON.stringify({ titel: "Vestigia", tekst: maak(o, dag + s + j), tag: "dagcasus", url: "./" });
      let status: "ok" | "weg" | "fout" = "ok";
      try {
        await webpush.sendNotification({ endpoint: o.endpoint, keys: { p256dh: o.p256dh, auth: o.auth } }, payload, { TTL: 4 * 3600, urgency: "normal" });
      } catch (e) {
        const c = (e as { statusCode?: number }).statusCode;
        status = c === 404 || c === 410 ? "weg" : "fout";     // 404/410: dit apparaat is afgemeld of verlopen
      }
      if (status === "ok") ok++; else if (status === "weg") weg++; else fout++;
      if (markeer || status === "weg") await db.rpc("_vestigia_push_verstuurd", { p_endpoint: o.endpoint, p_status: status });
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
      return antwoord(await verstuur(data || [], (o, i) => tekst(o.reeks, i), true));
    }
    return antwoord({ fout: "Onbekende soort" }, 400);
  } catch (e) {
    console.error(e);
    return antwoord({ fout: String((e as Error).message || e) }, 500);
  }
});
