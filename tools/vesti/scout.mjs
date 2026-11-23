// Vesti – ronde 6: lieve, licht mollige scout-eekhoorn (update 81). Eigen ontwerp.
// Stijl C (strakke donkerbruine lijn, vlakke kleuren), maar zachter en ronder.
// Scout-kenmerken: groen Vestigia-sjaaltje met houten ring, veldtas met insignes (eikel, spoor, blad).
// Variant A: zonder vest (vacht, tas en sjaaltje). Variant B: met het kakivest uit ronde 5.
const O = "#2a1a10";
const k = "#cc6a2e", kd = "#a8501d", kl = "#e58f55", lb = "#f3e0bd", lbd = "#e2c796";
const G = "#3f6b52", GL = "#5f9a76", GD = "#2c4d3b";
const vestk = "#a8995f", vestd = "#8a7c48";
const tas = "#8b7a4a", tasd = "#6f6038", riem = "#5a3f26";
const OL = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const OLd = `stroke="${O}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
const s = (d, f, x = OL) => `<path d="${d}" fill="${f}" ${x}/>`;
const c = (x, y, r, f, e = OL) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${e}/>`;
const oe = (x, y, rx, ry, f, e = "") => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${e}/>`;
const lijn = (d, col, w, x = "") => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${x}/>`;
const arm = d => lijn(d, O, 17) + lijn(d, k, 11);
const hand = (x, y, r = 8) => c(x, y, r, kd);

export function staart(){
  return s("M150 214 C186 218 210 200 216 176 C226 166 222 152 226 140 C232 124 222 112 224 98 C226 80 212 70 208 60 C200 44 180 40 166 46 C150 52 144 66 152 78 C160 90 176 86 184 102 C194 124 184 152 164 168 C150 180 146 196 150 214 Z", kd)
    + lijn("M160 202 C190 196 206 172 208 146 C210 118 204 92 190 74", kl, 7, 'opacity=".7"')
    + lijn("M172 186 C192 174 198 150 196 126", "#f0a874", 3, 'opacity=".6"')
    + lijn("M166 58 C174 54 184 56 190 62", "#f0a874", 3, 'opacity=".6"')
    + lijn("M216 176 l-7 -2 M226 140 l-8 0 M224 98 l-8 2 M208 60 l-6 5", O, 1.8, 'opacity=".55"');
}
export function voeten(){
  return s("M74 226 C72 214 92 210 108 216 C114 222 108 230 94 230 C84 230 75 230 74 226 Z", kd)
    + s("M166 226 C168 214 148 210 132 216 C126 222 132 230 146 230 C156 230 165 230 166 226 Z", kd)
    + lijn("M84 224 v4 M92 224 v5 M148 224 v5 M156 224 v4", O, 1.4, 'opacity=".5"');
}
export function romp(vest){
  let x = s("M96 140 C74 152 66 196 82 214 C96 228 144 228 158 214 C174 196 166 152 144 140 Z", k)
    + s("M104 158 C92 172 92 204 104 214 C114 221 126 221 136 214 C148 204 148 172 136 158 C126 151 114 151 104 158 Z", lb, "")
    + lijn("M112 182 q4 2 8 0 M120 196 q4 2 8 0 M110 204 q3 1.5 6 0", lbd, 1.8);
  if (vest) {
    x += s("M96 140 C74 152 66 196 82 214 C88 219 96 222 104 223 C98 200 98 170 106 146 Z", vestk)
      + s("M144 140 C166 152 174 196 158 214 C152 219 144 222 136 223 C142 200 142 170 134 146 Z", vestk)
      + s("M80 182 h16 v12 h-16 Z", vestd, OLd) + lijn("M80 186 h16", O, 1.4)
      + lijn("M104 156 C100 176 100 198 104 220 M136 156 C140 176 140 198 136 220", "#c4b77e", 2, 'opacity=".8"');
  }
  return x;
}
export function insigne(x, y, soort){
  let b = c(x, y, 7, soort === "eikel" ? "#e8c35a" : soort === "spoor" ? "#f3e0bd" : "#9cc6a5", OLd);
  if (soort === "eikel") b += s(`M${x-3.4} ${y-1} a3.4 3.6 0 0 0 6.8 0 Z`, "#8a5a2b", "") + s(`M${x-4} ${y-1.4} q4 -4 8 0 Z`, "#5b3a1c", "") + lijn(`M${x} ${y-4.6} v-1.6`, "#5b3a1c", 1.2);
  if (soort === "spoor") b += oe(x, y + 1.6, 2.4, 2, O) + c(x - 3, y - 2, 1.1, O, "") + c(x - 1, y - 3.6, 1.1, O, "") + c(x + 1.2, y - 3.6, 1.1, O, "") + c(x + 3.1, y - 2, 1.1, O, "");
  if (soort === "blad") b += s(`M${x-3.5} ${y+3.5} C${x-4} ${y-2} ${x} ${y-4.5} ${x+4} ${y-4} C${x+4} ${y+1} ${x+1} ${y+4} ${x-3.5} ${y+3.5} Z`, GD, "") + lijn(`M${x-3} ${y+3} L${x+2.6} ${y-2.6}`, "#9cc6a5", 0.9);
  return b;
}
export function tasEnRiem(){
  return lijn("M100 142 L154 194", O, 10) + lijn("M100 142 L154 194", riem, 6)
    + s("M138 186 h34 a5 5 0 0 1 5 5 v22 a6 6 0 0 1 -6 6 h-32 a6 6 0 0 1 -6 -6 v-22 a5 5 0 0 1 5 -5 Z", tas)
    + s("M136 189 a5 5 0 0 1 5 -5 h30 a5 5 0 0 1 5 5 v9 c-6 4 -34 4 -40 0 Z", tasd, OLd)
    + c(156, 201, 2.4, "#c9a45a", OLd)
    + insigne(146, 210, "eikel") + insigne(165, 211, "spoor");
}
export function sjaal(){
  return s("M92 132 C104 144 136 144 148 132 L151 141 C138 154 102 154 89 141 Z", G)
    + lijn("M93 137 C106 148 134 148 147 137", GL, 1.8, 'opacity=".8"')
    + s("M114 150 L106 176 L114 172 L118 178 Z", G, OLd) + s("M126 150 L134 176 L126 172 L122 178 Z", G, OLd)
    + `<rect x="111" y="145" width="18" height="10" rx="4" fill="#c9a45a" ${OLd}/>` + lijn("M115 147.5 v5 M120 147.5 v5 M125 147.5 v5", "#9a7a3a", 1.2);
}
export function oren(){
  return s("M84 70 C78 50 82 34 92 30 C102 38 108 52 108 62 Z", k) + s("M156 70 C162 50 158 34 148 30 C138 38 132 52 132 62 Z", k)
    + s("M88 62 C86 50 89 41 93 38 C99 44 102 52 102 58 Z M152 62 C154 50 151 41 147 38 C141 44 138 52 138 58 Z", "#eea383", "")
    + s("M86 42 C82 30 84 18 92 10 C93 18 99 24 99 38 Z", "#7d3511", OLd) + s("M154 42 C158 30 156 18 148 10 C147 18 141 24 141 38 Z", "#7d3511", OLd);
}
export function kop(e){
  let x = s("M74 98 C72 70 94 52 120 52 C146 52 168 70 166 98 C166 106 172 110 176 116 C168 117 166 122 160 126 C150 136 136 140 120 140 C104 140 90 136 80 126 C74 122 72 117 64 116 C68 110 74 106 74 98 Z", k)
    + s("M94 112 C98 100 142 100 146 112 C148 128 134 138 120 138 C106 138 92 128 94 112 Z", lb, "")
    + lijn("M110 60 q5 -3 10 0 M115 67 q5 -2 9 1", kd, 1.8, 'opacity=".8"');
  const blos = oe(90, 112, 7, 4.4, "#ee8c78", 'opacity=".5"') + oe(150, 112, 7, 4.4, "#ee8c78", 'opacity=".5"');
  if (e === "blij") {
    x += oe(103, 94, 7.6, 8.8, O) + oe(137, 94, 7.6, 8.8, O)
      + c(105.6, 90.6, 2.8, "#fff", "") + c(139.6, 90.6, 2.8, "#fff", "") + c(100.6, 98, 1.3, "#fff", "") + c(134.6, 98, 1.3, "#fff", "")
      + lijn("M95 80 Q102 76 109 79", O, 2.4) + lijn("M131 79 Q138 76 145 80", O, 2.4);
  } else if (e === "juicht") {
    x += lijn("M95 95 Q103 86 111 95", O, 3.4) + lijn("M129 95 Q137 86 145 95", O, 3.4)
      + lijn("M95 81 Q102 77 109 80", O, 2.4) + lijn("M131 80 Q138 77 145 81", O, 2.4);
  } else if (e === "speurt") {
    x += oe(103, 94, 6.6, 7.6, O) + c(105, 91.4, 2.2, "#fff", "")
      + lijn("M95 81 Q102 78 109 82", O, 2.4) + lijn("M131 78 Q138 74 145 77", O, 2.4);
  }
  x += blos + s("M114 106 Q120 103 126 106 Q124 112 120 113 Q116 112 114 106 Z", O, "") + c(118, 106, 1.2, "#fff", 'opacity=".6"');
  if (e === "juicht") x += s("M108 118 Q120 122 132 117 Q130 132 120 132 Q110 132 108 118 Z", "#5b2016", OLd) + s("M115.5 119.8 h9 v4.4 h-9 Z", "#fff6e6", "") + oe(120, 128.5, 5, 2.6, "#d9675a");
  else x += lijn("M109 119 Q114 123 120 120 Q126 123 131 119", O, 2.4)
      + s("M115.5 121 h9 v5.6 a1.2 1.2 0 0 1 -1.2 1.2 h-6.6 a1.2 1.2 0 0 1 -1.2 -1.2 Z", "#fff6e6", OLd) + lijn("M120 121.5 v5.6", O, 1.1);
  x += lijn("M80 114 l-13 -2 M80 118 l-12 3 M160 114 l13 -2 M160 118 l12 3", O, 1.1, 'opacity=".45"');
  return x;
}
export function loep(){
  // loep voor het rechteroog (vanaf de kijker); het oog is erdoor vergroot
  return lijn("M152 108 L170 134", O, 9) + lijn("M152 108 L170 134", "#7a5230", 5)
    + c(137, 94, 15, "#cfe3ea", `stroke="${O}" stroke-width="4"`) + `<circle cx="137" cy="94" r="15" fill="#cfe3ea" opacity=".35"/>`
    + oe(137, 95, 9.4, 10.6, O) + c(140.4, 90.4, 3.4, "#fff", "") + c(133.6, 99.4, 1.6, "#fff", "")
    + lijn("M127 86 q3 -4 7 -5", "#ffffff", 2.4, 'opacity=".8"')
    + c(171, 136, 8, kd);
}
const POSES = {
  uitleg: v => staart() + voeten() + romp(v) + tasEnRiem()
      + arm("M92 150 C78 164 80 186 94 192") + hand(95, 192)
      + sjaal() + oren() + kop("blij")
      + arm("M146 148 C166 142 176 126 176 108") + hand(176, 104) + lijn("M177 97 v-9", O, 7.5) + lijn("M177 97 v-9", kd, 3.5),
  speurt: v => staart() + voeten() + romp(v) + tasEnRiem()
      + arm("M92 150 C78 164 80 186 94 192") + hand(95, 192)
      + sjaal() + oren() + kop("speurt")
      + arm("M146 150 C166 152 174 144 172 136") + loep(),
  juicht: v => staart() + voeten() + romp(v) + tasEnRiem()
      + arm("M94 148 C72 136 64 114 66 92") + hand(66, 88, 9.5)
      + arm("M146 148 C168 136 176 114 174 92") + hand(174, 88, 9.5)
      + sjaal() + oren() + kop("juicht")
      + lijn("M50 84 l-8 -3 M54 72 l-5 -7 M66 66 v-9 M190 84 l8 -3 M186 72 l5 -7 M174 66 v-9", "#e6b84a", 3)
};
export const vestiScout = (pose = "uitleg", vest = false) => POSES[pose](vest);
export const svgScout = (pose, vest = false, size = 260, label = "") =>
  `<svg viewBox="36 0 196 240" width="${size}" height="${Math.round(size * 240 / 196)}" role="img" aria-label="${label || `Vesti, ${pose}`}">${vestiScout(pose, vest)}</svg>`;

export { O, k, kd, kl, lb, G, GL, GD, OL, OLd, s, c, oe, lijn, arm, hand };
