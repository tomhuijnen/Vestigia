/* Opstartbeelden voor iPhone en iPad (update 26b): het effen groen van de openingsanimatie, in plaats van het zwarte
   scherm dat iOS anders ~1 seconde laat zien na het tikken op het icoon. iOS gebruikt een opstartbeeld alleen als het
   precies de pixelmaat van het scherm heeft, vandaar één beeld per schermmaat, en een tweede reeks voor de donkere stand
   van het toestel (de opening is daar lichter groen).
   Gebruik: node tools/opstartbeelden.mjs   → schrijft icons/opstart/*.png en zet de <link>-regels in index.html
   (tussen <!-- opstartbeelden --> en <!-- /opstartbeelden -->). Komt er een nieuw iPhone-formaat bij: zet het in SCHERMEN. */
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { ROOT } from "./laad.mjs";

/* CSS-breedte × CSS-hoogte (staand) en pixelverhouding */
const SCHERMEN = [
  [440, 956, 3],   // iPhone 16/17 Pro Max
  [420, 912, 3],   // iPhone Air
  [402, 874, 3],   // iPhone 16 Pro, 17, 17 Pro
  [430, 932, 3],   // iPhone 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  [393, 852, 3],   // iPhone 14 Pro, 15, 15 Pro, 16
  [428, 926, 3],   // iPhone 12/13 Pro Max, 14 Plus
  [390, 844, 3],   // iPhone 12, 12 Pro, 13, 13 Pro, 14, 16e
  [375, 812, 3],   // iPhone X, XS, 11 Pro, 12 mini, 13 mini
  [414, 896, 3],   // iPhone XS Max, 11 Pro Max
  [414, 896, 2],   // iPhone XR, 11
  [414, 736, 3],   // iPhone 6/7/8 Plus
  [375, 667, 2],   // iPhone 6/7/8, SE (2e en 3e generatie)
  [320, 568, 2],   // iPhone SE (1e generatie)
  [1024, 1366, 2], // iPad Pro 12,9"
  [1032, 1376, 2], // iPad Pro 13" (M4)
  [834, 1194, 2],  // iPad Pro 11"
  [834, 1210, 2],  // iPad Pro 11" (M4)
  [820, 1180, 2],  // iPad Air, iPad (10e generatie)
  [810, 1080, 2],  // iPad (7e–9e generatie)
  [834, 1112, 2],  // iPad Air (3e generatie)
  [744, 1133, 2],  // iPad mini (6e generatie)
  [768, 1024, 2]   // oudere iPads, iPad mini
];
/* zelfde groen als het openingsscherm (--green in css/vestigia.css, licht en donker) */
/* donker eerst en met voorwaarde, licht daarna zonder: zo krijgt een toestel dat de donkere voorwaarde niet kent altijd het lichte beeld */
const KLEUR = { donker: [0x7f, 0xb8, 0x94], licht: [0x4b, 0x7a, 0x5e] };

const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = b => { let c = -1; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function blok(type, data){
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]), crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(w, h, [r, g, b]){
  const rij = Buffer.alloc(1 + w * 3); for (let x = 0; x < w; x++) rij.set([r, g, b], 1 + x * 3);
  const ruw = Buffer.concat(Array.from({ length: h }, () => rij));
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), blok("IHDR", ihdr), blok("IDAT", zlib.deflateSync(ruw, { level: 9 })), blok("IEND", Buffer.alloc(0))]);
}

const map = path.join(ROOT, "icons", "opstart");
fs.mkdirSync(map, { recursive: true });
for (const f of fs.readdirSync(map)) if (f.endsWith(".png")) fs.unlinkSync(path.join(map, f));
const regels = [];
for (const [w, h, r] of SCHERMEN){
  for (const [stand, kleur] of Object.entries(KLEUR)){
    const naam = `${stand}-${w * r}x${h * r}.png`;
    fs.writeFileSync(path.join(map, naam), png(w * r, h * r, kleur));
    regels.push(`<link rel="apple-touch-startup-image" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)${stand === "donker" ? " and (prefers-color-scheme: dark)" : ""}" href="icons/opstart/${naam}">`);
  }
}
const html = path.join(ROOT, "index.html"), oud = fs.readFileSync(html, "utf8");
const nieuw = oud.replace(/<!-- opstartbeelden -->[\s\S]*?<!-- \/opstartbeelden -->/, `<!-- opstartbeelden -->\n${regels.join("\n")}\n<!-- /opstartbeelden -->`);
if (nieuw === oud && !oud.includes("<!-- opstartbeelden -->")) throw new Error("Markering <!-- opstartbeelden --> niet gevonden in index.html");
fs.writeFileSync(html, nieuw);
console.log(`${regels.length} opstartbeelden in icons/opstart/ en in index.html`);
