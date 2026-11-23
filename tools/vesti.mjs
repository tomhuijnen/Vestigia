/* Vesti, de mascotte (update 81): maakt data/vesti.js uit de tekencode in tools/vesti/.
   Draaien na elke wijziging aan de tekening of de wolkjes: node tools/vesti.mjs
   tools/vesti/scout.mjs   de losse onderdelen (stijl C: strakke donkerbruine lijn, vlakke kleuren), met vest
   tools/vesti/beweging.mjs uitdrukkingen, ‘kijkt over de rand’, ‘kijkt opzij’ en de wolkjes (WOLKJES)
   Elk bewegend onderdeel zit in een eigen <g class="…">; de animaties staan in css/vestigia.css (blok ‘Vesti’). */
import { writeFileSync } from "fs";
import { svgBeweging, svgKijkt, svgKijktOpzij, WOLKJES } from "./vesti/beweging.mjs";

const kort = s => s.replace(/\s+/g, " ").replace(/> </g, "><").replace(/(\d)\.0+(?=\D)/g, "$1");
const GEZICHTEN = [...new Set(Object.values(WOLKJES).map(w => w.gezicht))];
const data = {
  heel: Object.fromEntries(["uitleg", "juicht", "teleurgesteld", "slaapt"].map(u => [u, kort(svgBeweging(u, "Vesti"))])),
  kijkt: Object.fromEntries(GEZICHTEN.map(g => [g, kort(svgKijkt("Vesti", g))])),
  opzij: Object.fromEntries(GEZICHTEN.map(g => [g, kort(svgKijktOpzij("Vesti", g))]))
};
const uit = `/* Gemaakt door tools/vesti.mjs – niet met de hand aanpassen. Vesti, de mascotte (update 81). */
const VESTI_TEKENING = ${JSON.stringify(data)};
/* Wolkjes bij een melding: tekst, soort (spraak of gedachte) en het gezicht dat erbij past. Sleutel = id van de melding
   in de wachtrij, ‘tutorial-1’ … ‘tutorial-5’ of ‘tweeling’. Later (update 81b) meerdere teksten per situatie. */
const VESTI_WOLKJES = ${JSON.stringify(WOLKJES, null, 1)};
`;
writeFileSync(new URL("../data/vesti.js", import.meta.url), uit);
console.log("data/vesti.js:", Math.round(uit.length / 1024), "kB,", GEZICHTEN.length, "gezichten");
