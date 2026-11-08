/* Vult data/dagschema.js aan tot een einddatum. Bestaande dagen blijven altijd ongewijzigd.
   Gebruik:  node tools/dagschema.mjs 2027-06-30
   Draai dit nadat er soorten of casussen bij zijn gekomen, zodat de nieuwe dagen ze ook gebruiken,
   en in elk geval voordat het schema minder dan 30 dagen vooruitloopt (het controlescript waarschuwt). */
import fs from "fs";
import path from "path";
import { laad, ROOT } from "./laad.mjs";

const tot = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(tot || "")){ console.error("Geef een einddatum: node tools/dagschema.mjs JJJJ-MM-DD"); process.exit(1); }

const V = laad();
const last = Math.round((Date.parse(tot + "T00:00:00Z") - V.START) / V.DAY);
if (last < V.DAILY_FIXED - 1){ console.error(`Het schema loopt al tot dag ${V.DAILY_FIXED - 1}; inkorten kan niet.`); process.exit(1); }
if (V.DAILY_FIXED < V.DAGSCHEMA.length){ console.error("Het bestaande schema bevat een onbekende soort of casus. Los dat eerst op (node tools/controle.mjs)."); process.exit(1); }

const dag = new Intl.DateTimeFormat("nl-NL", { weekday:"short", day:"numeric", month:"short", year:"numeric", timeZone:"UTC" });
const rows = [];
for (let i = 0; i <= last; i++){
  const d = V.daily(i);
  rows.push(`  ${JSON.stringify(d.id + "#" + (d.k + 1)).padEnd(34)}, // ${String(i).padStart(3)} · ${dag.format(new Date(V.START + i * V.DAY))}`);
}
const out = `/* Vestigia – vast dagschema: de dagcasus per dag, als "soort-id#casusnummer", vanaf dag 0 = vrijdag 6 november 2026.
   NIET MET DE HAND WIJZIGEN. Dagen die al gespeeld zijn, mogen nooit veranderen, anders krijgen spelers achteraf een
   andere casus en klopt de ranglijst niet meer. Aanvullen gaat met: node tools/dagschema.mjs JJJJ-MM-DD */
const DAGSCHEMA = [
${rows.join("\n")}
];
`;
fs.writeFileSync(path.join(ROOT, "data/dagschema.js"), out);
console.log(`Dagschema: ${V.DAILY_FIXED} vaste dagen behouden, ${last + 1 - V.DAILY_FIXED} toegevoegd, loopt nu tot en met ${tot} (dag ${last}).`);
