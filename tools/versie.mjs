/* Nieuw versienummer voor een release: zet VERSION in sw.js en hetzelfde nummer achter elk bestand in index.html.
   Gebruik: node tools/versie.mjs        (draai daarna node tools/controle.mjs)
   Zonder nieuw versienummer krijgen geïnstalleerde apps de update niet. */
import fs from "fs";
import path from "path";
import { ROOT } from "./laad.mjs";

const d = new Date(), p2 = n => String(n).padStart(2, "0");
const stamp = `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}${p2(d.getHours())}${p2(d.getMinutes())}`;
const sw = path.join(ROOT, "sw.js"), html = path.join(ROOT, "index.html");
fs.writeFileSync(sw, fs.readFileSync(sw, "utf8").replace(/const VERSION = "vestigia-[^"]*";/, `const VERSION = "vestigia-${stamp}";`));
fs.writeFileSync(html, fs.readFileSync(html, "utf8").replace(/\?v=[\w-]+"/g, `?v=${stamp}"`));
console.log("Versie", stamp);
