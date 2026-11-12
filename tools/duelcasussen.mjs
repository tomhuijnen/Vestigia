/* Lijst van alle casussen voor het spelersduel (update 16), als SQL voor de tabel duel_casussen in Supabase.
   De server kiest de drie casussen van een duel uit deze tabel, zodat niemand zijn eigen casussen kan uitzoeken.
   Komen er soorten of casussen bij (zoals in update 14), draai dit dan opnieuw en plak de uitvoer in Supabase:
     node tools/duelcasussen.mjs > duelcasussen.sql
   Bestaande regels blijven staan (on conflict do nothing); er verdwijnt nooit iets. */
import { laad } from "./laad.mjs";

const { TARGETS } = laad({ zonderSchema: true });
const rijen = TARGETS.flatMap(t => t.cs.map((c, k) => `('${t.id}', ${k}, '${t.g}')`));
console.log(`-- ${rijen.length} casussen van ${TARGETS.length} soorten (gemaakt met tools/duelcasussen.mjs)`);
console.log("insert into public.duel_casussen (soort, k, grp) values");
for (let i = 0; i < rijen.length; i += 6) console.log("  " + rijen.slice(i, i + 6).join(", ") + (i + 6 < rijen.length ? "," : ""));
console.log("on conflict (soort, k) do nothing;");
