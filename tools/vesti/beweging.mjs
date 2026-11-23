// Vesti – bewegende 2D-versie (update 81, proef). Variant B met vest, vijf uitdrukkingen.
// Elk onderdeel dat beweegt zit in een eigen <g class="…">; de CSS-animaties staan in de pagina.
import { O, k, kd, lb, s, c, oe, lijn, arm, hand, staart, voeten, romp, tasEnRiem, sjaal, loep } from "./scout.mjs";

const g = (cls, inhoud) => `<g class="${cls}">${inhoud}</g>`;

function oor(kant){
  return kant === "l"
    ? s("M84 70 C78 50 82 34 92 30 C102 38 108 52 108 62 Z", k) + s("M88 62 C86 50 89 41 93 38 C99 44 102 52 102 58 Z", "#eea383", "") + s("M86 42 C82 30 84 18 92 10 C93 18 99 24 99 38 Z", "#7d3511", `stroke="${O}" stroke-width="2" stroke-linejoin="round"`)
    : s("M156 70 C162 50 158 34 148 30 C138 38 132 52 132 62 Z", k) + s("M152 62 C154 50 151 41 147 38 C141 44 138 52 138 58 Z", "#eea383", "") + s("M154 42 C158 30 156 18 148 10 C147 18 141 24 141 38 Z", "#7d3511", `stroke="${O}" stroke-width="2" stroke-linejoin="round"`);
}
function gezicht(e){
  let x = s("M74 98 C72 70 94 52 120 52 C146 52 168 70 166 98 C166 106 172 110 176 116 C168 117 166 122 160 126 C150 136 136 140 120 140 C104 140 90 136 80 126 C74 122 72 117 64 116 C68 110 74 106 74 98 Z", k)
    + s("M94 112 C98 100 142 100 146 112 C148 128 134 138 120 138 C106 138 92 128 94 112 Z", lb, "")
    + lijn("M110 60 q5 -3 10 0 M115 67 q5 -2 9 1", kd, 1.8, 'opacity=".8"')
    + oe(90, 112, 7, 4.4, "#ee8c78", 'opacity=".5"') + oe(150, 112, 7, 4.4, "#ee8c78", 'opacity=".5"');
  const open = (l = true, r = true) => g("ogen",
      (l ? oe(103, 94, 7.6, 8.8, O) + c(105.6, 90.6, 2.8, "#fff", "") + c(100.6, 98, 1.3, "#fff", "") : "")
    + (r ? oe(137, 94, 7.6, 8.8, O) + c(139.6, 90.6, 2.8, "#fff", "") + c(134.6, 98, 1.3, "#fff", "") : ""));
  if (e === "blij") x += open() + lijn("M95 80 Q102 76 109 79", O, 2.4) + lijn("M131 79 Q138 76 145 80", O, 2.4);
  if (e === "speurt") x += open(true, false) + lijn("M95 81 Q102 78 109 82", O, 2.4) + lijn("M131 78 Q138 74 145 77", O, 2.4);
  if (e === "juicht") x += lijn("M95 95 Q103 86 111 95", O, 3.4) + lijn("M129 95 Q137 86 145 95", O, 3.4)
      + lijn("M95 81 Q102 77 109 80", O, 2.4) + lijn("M131 80 Q138 77 145 81", O, 2.4);
  if (e === "teleurgesteld") x += g("ogen", oe(103, 97, 7.2, 8, O) + oe(137, 97, 7.2, 8, O) + c(104.6, 99.6, 2.3, "#fff", "") + c(138.6, 99.6, 2.3, "#fff", "")
        + s("M94 92 C94 84 112 84 112 92 Z", k, "") + s("M128 92 C128 84 146 84 146 92 Z", k, "")
        + lijn("M95.5 91.5 Q103 89 110.5 91.5", O, 2) + lijn("M129.5 91.5 Q137 89 144.5 91.5", O, 2))
      + lijn("M96 83 Q102 80 108 76", O, 2.4) + lijn("M132 76 Q138 80 144 83", O, 2.4);
  if (e === "slaapt") x += lijn("M95 94 Q103 100 111 94", O, 3) + lijn("M129 94 Q137 100 145 94", O, 3)
      + lijn("M96 84 Q102 82 108 84", O, 2.2) + lijn("M132 84 Q138 82 144 84", O, 2.2);
  if (e === "leest" || e === "leest-r") {
    const dx = e === "leest-r" ? 2.2 : 0;
    x += g("ogen", g("pupil", oe(103 + dx, 96, 7.6, 8.8, O) + oe(137 + dx, 96, 7.6, 8.8, O)
          + c(103.4 + dx, 100.6, 2.6, "#fff", "") + c(137.4 + dx, 100.6, 2.6, "#fff", "") + c(106.6 + dx, 98.4, 1.1, "#fff", "") + c(140.6 + dx, 98.4, 1.1, "#fff", ""))
        + s("M94 91 C95 85 111 85 112 91 C108 88.6 98 88.6 94 91 Z", k, "") + s("M128 91 C129 85 145 85 146 91 C142 88.6 132 88.6 128 91 Z", k, "")
        + lijn("M95.4 90.6 C99 88.4 107 88.4 110.6 90.6", O, 1.8) + lijn("M129.4 90.6 C133 88.4 141 88.4 144.6 90.6", O, 1.8))
      + lijn("M95 79 Q102 73 109 77", O, 2.4) + lijn("M131 77 Q138 73 145 79", O, 2.4);
  }
  // gezichten bij een wolkje (kijkt over de rand): passend bij wat Vesti denkt of zegt
  const oog = (cx, cy, dx = 0, dy = 0, rx = 7.4, ry = 8.6) => oe(cx, cy, rx, ry, O) + c(cx + 1.8 + dx, cy - 3 + dy, 2.5, "#fff", "") + c(cx - 2.4 + dx, cy + 3 + dy, 1.1, "#fff", "");
  const lid = (x0) => s(`M${x0} 91 C${x0 + 1} 85 ${x0 + 17} 85 ${x0 + 18} 91 C${x0 + 14} 88.6 ${x0 + 4} 88.6 ${x0} 91 Z`, k, "") + lijn(`M${x0 + 1.4} 90.6 C${x0 + 5} 88.4 ${x0 + 13} 88.4 ${x0 + 16.6} 90.6`, O, 1.8);
  if (e === "geheim") x += g("ogen", g("pupil", oe(101, 96, 7.2, 8.2, O) + oe(135, 96, 7.2, 8.2, O) + c(99, 93.4, 2.3, "#fff", "") + c(133, 93.4, 2.3, "#fff", "")) + s("M93 95 C94 85 111 85 112 95 C107 91.5 98 91.5 93 95 Z", k, "") + s("M127 95 C128 85 145 85 146 95 C141 91.5 132 91.5 127 95 Z", k, "") + lijn("M94.2 94.4 C99 91.4 106 91.4 110.8 94.4", O, 1.8) + lijn("M128.2 94.4 C133 91.4 140 91.4 144.8 94.4", O, 1.8))
      + lijn("M95 83 Q102 81 109 83", O, 2.4) + lijn("M131 78 Q138 73 145 77", O, 2.4);
  if (e === "verlegen") x += lijn("M96 96 Q103 90 110 96", O, 3.2) + lijn("M130 96 Q137 90 144 96", O, 3.2)
      + lijn("M96 82 Q102 78 108 80", O, 2.4) + lijn("M132 80 Q138 78 144 82", O, 2.4)
      + oe(90, 112, 9, 5.4, "#ee8c78", 'opacity=".55"') + oe(150, 112, 9, 5.4, "#ee8c78", 'opacity=".55"')
      + s("M160 72 C163 77 165 80 165 83 A3.6 3.6 0 0 1 157.8 83 C157.8 80 159 77 160 72 Z", "#bfe3f2", `stroke="${O}" stroke-width="1.5"`);
  // dromerig: ogen dicht in een zachte boog naar beneden, rustige wenkbrauwen, extra blosjes
  if (e === "dromerig") x += lijn("M96 93 Q103 99 110 93", O, 3) + lijn("M130 93 Q137 99 144 93", O, 3)
      + lijn("M96 80 Q102 77 108 79", O, 2.2) + lijn("M132 79 Q138 77 144 80", O, 2.2)
      + oe(90, 111, 8.6, 5, "#ee8c78", 'opacity=".55"') + oe(150, 111, 8.6, 5, "#ee8c78", 'opacity=".55"');
  if (e === "verbaasd") x += g("ogen", oog(103, 95, 0, 0, 8.2, 9.6) + oog(137, 95, 0, 0, 8.2, 9.6))
      + lijn("M95 76 Q102 70 109 74", O, 2.4) + lijn("M131 74 Q138 70 145 76", O, 2.4);
  // trots: tevreden dichtgeknepen oogjes, wenkbrauwen hoog en ontspannen, brede grijns (niet boos)
  if (e === "trots") x += lijn("M96 95 Q103 90.5 110 95", O, 3.2) + lijn("M130 95 Q137 90.5 144 95", O, 3.2)
      + lijn("M95 79 Q102 74 109 77", O, 2.4) + lijn("M131 77 Q138 74 145 79", O, 2.4);
  if (e === "knipoog") x += g("ogen", oog(103, 95)) + lijn("M130 96 Q137 91 144 96", O, 3.2)
      + lijn("M95 80 Q102 76 109 79", O, 2.4) + lijn("M131 84 Q138 82 145 85", O, 2.4);
  if (e === "lacht") x += lijn("M96 96 Q103 88 110 96", O, 3.2) + lijn("M130 96 Q137 88 144 96", O, 3.2)
      + lijn("M95 81 Q102 77 109 80", O, 2.4) + lijn("M131 80 Q138 77 145 81", O, 2.4);
  x += s("M114 106 Q120 103 126 106 Q124 112 120 113 Q116 112 114 106 Z", O, "") + c(118, 106, 1.2, "#fff", 'opacity=".6"');
  if (e === "verbaasd") x += oe(120, 122, 4.2, 5, "#5b2016", `stroke="${O}" stroke-width="1.8"`);
  else if (e === "geheim") x += lijn("M111 120 Q119 123 129 117", O, 2.4) + lijn("M129 117 l3 -1.6", O, 2) + s("M116.5 121 h7 v4.4 h-7 Z", "#fff6e6", `stroke="${O}" stroke-width="1.6" stroke-linejoin="round"`);
  else if (e === "dromerig") x += lijn("M112 119 Q120 124 128 119", O, 2.4);
  else if (e === "trots") x += lijn("M106 116 Q120 126 134 116", O, 2.6) + s("M115 120.6 h10 v5 a1.2 1.2 0 0 1 -1.2 1.2 h-7.6 a1.2 1.2 0 0 1 -1.2 -1.2 Z", "#fff6e6", `stroke="${O}" stroke-width="1.8" stroke-linejoin="round"`) + lijn("M120 121 v6", O, 1.1);
  else if (e === "verlegen" || e === "lacht" || e === "knipoog") x += s("M108 117 Q120 121 132 117 Q130 128 120 128 Q110 128 108 117 Z", "#5b2016", `stroke="${O}" stroke-width="2" stroke-linejoin="round"`) + s("M115.5 118.8 h9 v4 h-9 Z", "#fff6e6", "");
  else if (e === "juicht") x += s("M108 118 Q120 122 132 117 Q130 132 120 132 Q110 132 108 118 Z", "#5b2016", `stroke="${O}" stroke-width="2" stroke-linejoin="round"`) + s("M115.5 119.8 h9 v4.4 h-9 Z", "#fff6e6", "") + oe(120, 128.5, 5, 2.6, "#d9675a");
  else if (e === "teleurgesteld") x += lijn("M110 124 Q120 118 130 124", O, 2.4) + s("M116.5 120.4 h7 v4 h-7 Z", "#fff6e6", `stroke="${O}" stroke-width="1.6" stroke-linejoin="round"`);
  else if (e === "slaapt") x += oe(120, 123, 3.2, 2.6, "#5b2016", `stroke="${O}" stroke-width="1.6"`);
  else x += lijn("M109 119 Q114 123 120 120 Q126 123 131 119", O, 2.4)
      + s("M115.5 121 h9 v5.6 a1.2 1.2 0 0 1 -1.2 1.2 h-6.6 a1.2 1.2 0 0 1 -1.2 -1.2 Z", "#fff6e6", `stroke="${O}" stroke-width="2" stroke-linejoin="round"`) + lijn("M120 121.5 v5.6", O, 1.1);
  x += lijn("M80 114 l-13 -2 M80 118 l-12 3 M160 114 l13 -2 M160 118 l12 3", O, 1.1, 'opacity=".45"');
  return x;
}
// wijsvinger omhoog aan de duimkant, met de andere drie vingers zichtbaar gekruld en de duim eroverheen,
// zodat het altijd als ‘let op / uitleg’ leest en nooit als een opgestoken middelvinger
function wijsHand(){
  const lijnD = (d, w1, w2) => lijn(d, O, w1) + lijn(d, kd, w2);
  return lijnD("M170.5 100 C170 95 169.6 90 169.4 84.5", 8, 4.2)
    + s("M167 101 C167 97.5 170 96.5 173 97 C175 95.6 178 95.6 180 97 C182.4 96.6 185.4 98 185.6 101.6 C187.4 103 187.8 106.4 186.4 109.2 C185.6 113.6 181.6 116 176.4 116 C171 116 167 113.2 166.6 108.6 C166.4 106 166.6 103.4 167 101 Z", kd, `stroke="${O}" stroke-width="3" stroke-linejoin="round"`)
    + lijn("M173.2 98.2 C173.8 101 173.8 103.6 173.2 105.6 M179.6 98 C180.4 101 180.4 103.8 179.8 106 M185 102.2 C185.4 104.4 185.2 106.4 184.4 108", O, 1.5)
    + lijn("M167.6 108.2 C171.6 106.4 176.4 106.6 180 108.6", O, 5.6) + lijn("M167.6 108.2 C171.6 106.4 176.4 106.6 180 108.6", kd, 2.6)
    + lijn("M170.5 100 C170 95 169.6 90 169.4 84.5", kd, 4.2);
}
const kop = e => g("kop", g("oor-l", oor("l")) + g("oor-r", oor("r")) + gezicht(e));
const armL = arm("M92 150 C78 164 80 186 94 192") + hand(95, 192);
const vonken = g("vonk", lijn("M50 84 l-8 -3 M54 72 l-5 -7 M66 66 v-9", "#e6b84a", 3)) + g("vonk vonk2", lijn("M190 84 l8 -3 M186 72 l5 -7 M174 66 v-9", "#e6b84a", 3));
const zzz = g("zzz", `<text x="166" y="58" font-family="Inter, sans-serif" font-weight="800" font-size="16" fill="#4b7a5e">z</text>`)
  + g("zzz zzz2", `<text x="180" y="42" font-family="Inter, sans-serif" font-weight="800" font-size="20" fill="#4b7a5e">z</text>`)
  + g("zzz zzz3", `<text x="196" y="24" font-family="Inter, sans-serif" font-weight="800" font-size="24" fill="#4b7a5e">Z</text>`);

// opbouw: spring > [voeten, adem > [staartstand > staart, romp, tas, armen, sjaal, kop]]
const bouw = (e, armen, extra = "") =>
  oe(120, 230, 48, 5, "#000", 'class="schaduw" opacity=".13"')
  + g("spring", voeten()
    + g("adem", g("staartstand", g("staart", staart())) + romp(true) + tasEnRiem() + armen.voor + sjaal() + kop(e) + armen.na))
  + extra;

const UITDRUKKING = {
  uitleg: () => bouw("blij", { voor: armL, na: g("arm-r", arm("M146 148 C166 142 176 126 176 108") + wijsHand()) }),
  speurt: () => bouw("speurt", { voor: armL, na: g("loepgroep", arm("M146 150 C166 152 174 144 172 136") + loep()) }),
  juicht: () => bouw("juicht", { voor: g("arm-l", arm("M94 148 C72 136 64 114 66 92") + hand(66, 88, 9.5)) + g("arm-r", arm("M146 148 C168 136 176 114 174 92") + hand(174, 88, 9.5)), na: "" }, vonken),
  teleurgesteld: () => bouw("teleurgesteld", { voor: armL + arm("M148 150 C162 164 160 182 150 190") + hand(150, 191), na: "" }),
  slaapt: () => bouw("slaapt", { voor: arm("M92 150 C80 168 96 184 112 182") + hand(114, 181) + arm("M148 150 C160 168 144 184 128 182") + hand(126, 181), na: "" }, zzz)
};
export const UITDRUKKINGEN = Object.keys(UITDRUKKING);

/* ‘Kijkt over de rand’: alleen het koppie en twee pootjes boven de rand van een kaart; de rand ligt op y = 132.
   Kop en staartpunt worden afgeknipt op de rand, de pootjes liggen eroverheen. */
export const RAND_Y = 132;
export function svgKijkt(label = "Vesti kijkt mee", gezicht = "leest"){
  const id = "vk-" + gezicht;
  const poot = x => oe(x, RAND_Y - 1, 10, 6.6, kd, `stroke="${O}" stroke-width="3"`) + lijn(`M${x - 3.6} ${RAND_Y - 4.5} v5 M${x + 3.6} ${RAND_Y - 4.5} v5`, O, 1.4);
  return `<svg class="vesti vkijkt u-${gezicht}" viewBox="52 -4 140 ${RAND_Y + 12}" role="img" aria-label="${label}">`
    + `<defs><clipPath id="${id}"><rect x="0" y="-20" width="260" height="${RAND_Y + 20}"/></clipPath></defs>`
    + `<g clip-path="url(#${id})">` + g("duik", g("staart", staart()) + g("kopje", kop(gezicht))) + `</g>`
    + g("pootjes", poot(98) + poot(142)) + `</svg>`;
}
/* Zijkant (laptop): hele Vesti, kijkt naar rechts; staat half achter de linkerrand van een melding. */
export const svgKijktOpzij = (label = "Vesti kijkt mee", gezicht = "leest-r") =>
  `<svg class="vesti u-${gezicht}" viewBox="20 -18 232 258" role="img" aria-label="${label}">${bouw(gezicht, { voor: armL + arm("M146 150 C160 158 168 150 172 140") + hand(172, 138), na: "" })}</svg>`;
export const svgBeweging = (e, label = "") =>
  `<svg class="vesti u-${e}" viewBox="20 -18 232 258" role="img" aria-label="${label || `Vesti, ${e}`}">${UITDRUKKING[e]()}</svg>`;

/* Wolkjes (goedgekeurd 23 nov 2026). Gezicht past bij de tekst; later meerdere teksten per situatie die random afwisselen. */
export const GEZICHTEN = ["leest", "geheim", "verlegen", "dromerig", "verbaasd", "trots", "knipoog", "lacht"];
export const WOLKJES = {
  "tutorial-1": { tekst: "Ik weet het al… maar ik verklap niks.", soort: "gedachte", gezicht: "geheim" },
  "tutorial-2": { tekst: "Vijf pogingen. Bij mijn eerste vleermuis had ik er zes nodig.", soort: "spraak", gezicht: "verlegen" },
  "tutorial-3": { tekst: "Expert? Jij durft, zeg.", soort: "gedachte", gezicht: "verbaasd" },
  "tutorial-4": { tekst: "Ik sta zelf niet in de ranglijst. Ik ben de scheidsrechter.", soort: "spraak", gezicht: "trots" },
  "tutorial-5": { tekst: "Eikels sparen? Daar weet ik alles van.", soort: "gedachte", gezicht: "dromerig" },
  "tweeling": { tekst: "Ik haal ze zelf ook weleens door elkaar. Niet verder vertellen!", soort: "spraak", gezicht: "verlegen" },
  "soorten14": { tekst: "Vliegend hert… ik zag eerst echt een hert met vleugels voor me.", soort: "gedachte", gezicht: "dromerig" },
  "nieuwesoorten": { tekst: "Nog meer om te zoeken. Mijn favoriete bezigheid!", soort: "spraak", gezicht: "lacht" },
  "vernieuwd": { tekst: "Ik verzamel weetjes, net als eikels.", soort: "gedachte", gezicht: "dromerig" },
  "week": { tekst: "Ik heb alles voor je bijgehouden.", soort: "spraak", gezicht: "trots" },
  "levels": { tekst: "Kijk jou eens groeien!", soort: "spraak", gezicht: "lacht" },
  "dubbeluitnodigen": { tekst: "Hoe meer spelers, hoe meer eikels.", soort: "spraak", gezicht: "knipoog" },
  "apparaten": { tekst: "Ik reis gewoon met je mee, van telefoon naar laptop.", soort: "spraak", gezicht: "lacht" },
  "duelnieuw": { tekst: "Wie wint? Ik zet mijn eikels op jou.", soort: "spraak", gezicht: "knipoog" }
};
