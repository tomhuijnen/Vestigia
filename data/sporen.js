/* Vestigia – pootafdrukken voor de openingsanimatie: das, vos, ree, wild zwijn en boommarter (gekozen op 8 november 2026).
   Elke prent is een SVG-tekening in een vak van 100 × 110, met de tenen naar boven (looprichting).
   Kleur via currentColor. Kenmerken en loopspoor volgens de soortpagina's van Zodion (zodion.nl/zoogdiersoorten/…);
   de vorm is vergeleken met foto's van echte prenten (o.a. Dassenwerkgroep Brabant).
   Het spoor in de animatie is nooit dat van de dagcasus van vandaag of de komende acht dagen (zie js/opening.js). */
const SPOREN = {
  das: {
    soort: "das",
    naam: "Das",
    bron: "Zodion, soortpagina das",
    kenmerk: "Halvemaanvorm met 5 ovale tenen, lange nagels (tot 3 cm) en een niervormig middenvoetkussen; 5–6 cm breed. Loopt met een schommelende stap of draf.",
    breedte: 5.5,      // cm, voor de onderlinge maat in een spoor
    voor: `<path d="M14 71C13 62 20 58 27 61C36 64.5 64 64.5 73 61C80 58 87 62 86 71C85 80 81 87 74 88C70 92.5 63 93.5 58.5 89.5C54.5 94.5 45.5 94.5 41.5 89.5C37 93.5 30 92.5 26 88C19 87 15 80 14 71Z"/><ellipse cx="17.5" cy="48" rx="4.8" ry="6.3" transform="rotate(-22 17.5 48)"/><ellipse cx="32" cy="39.5" rx="5.8" ry="7.8" transform="rotate(-9 32 39.5)"/><ellipse cx="49" cy="36" rx="6.2" ry="8.2"/><ellipse cx="66" cy="39.5" rx="5.8" ry="7.8" transform="rotate(9 66 39.5)"/><ellipse cx="81" cy="48.5" rx="5.2" ry="6.7" transform="rotate(22 81 48.5)"/><path d="M14.7 37.1Q13.1 27.6 8 19Q11.3 28.1 12.3 37.9Z"/><path d="M31 27.3Q30.2 16 26.5 5Q28.1 16.2 28 27.7Z"/><path d="M50.6 23.5Q51 12.3 49.5 1Q48.7 12.2 47.4 23.5Z"/><path d="M70 27.8Q70.6 16.2 73 5Q68.5 15.8 67 27.2Z"/><path d="M86.2 38.9Q87.4 29.1 91 20Q85.7 28.5 83.8 38.1Z"/>`,
    gang: "stap"
  },
  vos: {
    soort: "vos",
    naam: "Vos",
    bron: "Zodion, soortpagina vos",
    kenmerk: "Slanker dan een hond: 4 tenen met nagels, de buitenste tenen geheel achter de binnenste, symmetrisch. Loopt vaak in draf.",
    breedte: 4.5,
    voor: `<ellipse cx="42" cy="40" rx="7" ry="10.5" transform="rotate(-6 42 40)"/><ellipse cx="58" cy="40" rx="7" ry="10.5" transform="rotate(6 58 40)"/><ellipse cx="28" cy="60.5" rx="6.2" ry="9" transform="rotate(-24 28 60.5)"/><ellipse cx="72" cy="60.5" rx="6.2" ry="9" transform="rotate(24 72 60.5)"/><path d="M50 66C57.5 66 64.5 73 65 81C65.3 86.5 61 88.5 57 85.5C54 83.3 46 83.3 43 85.5C39 88.5 34.7 86.5 35 81C35.5 73 42.5 66 50 66Z"/><path d="M42.7 28.7Q41.4 24.3 39.5 20Q39.1 24.7 39.3 29.3Z"/><path d="M60.7 29.3Q60.9 24.7 60.5 20Q58.6 24.3 57.3 28.7Z"/><path d="M25.3 51.3Q23.2 48 20.5 45Q21.3 49 22.7 52.7Z"/><path d="M77.3 52.7Q78.7 49 79.5 45Q76.8 48 74.7 51.3Z"/>`,
    gang: "draf"
  },
  ree: {
    soort: "ree",
    naam: "Ree",
    bron: "Zodion, soortpagina ree",
    kenmerk: "Twee smalle, puntige hoefhelften, 3–4 cm breed en ruim 4,5 cm lang; slanker en kleiner dan bij edel- of damhert. Als de bijhoeven te zien zijn, staan ze recht achter de hoeven.",
    breedte: 3.5,
    voor: `<path d="M46 18C40 26 33 44 32 62C31 74 33 84 39 87C44 89 47 84 47 76L47.5 40C47.6 30 47.2 22 46 18Z"/><path d="M54 20.5C60 28 67 45 67.5 63C68 74 66 83 60 86C55 88 52.5 83 52.5 75L52.5 40C52.4 31 52.8 24 54 20.5Z"/>`,
    bij: `<path d="M46 18C40 26 33 44 32 62C31 74 33 84 39 87C44 89 47 84 47 76L47.5 40C47.6 30 47.2 22 46 18Z"/><path d="M54 20.5C60 28 67 45 67.5 63C68 74 66 83 60 86C55 88 52.5 83 52.5 75L52.5 40C52.4 31 52.8 24 54 20.5Z"/><ellipse cx="40" cy="101" rx="3.2" ry="4.2" transform="rotate(-8 40 101)" opacity=".7"/><ellipse cx="60" cy="101" rx="3.2" ry="4.2" transform="rotate(8 60 101)" opacity=".7"/>`,
    gang: "lijn"
  },
  boommarter: {
    soort: "boommarter",
    naam: "Boommarter",
    bron: "Zodion, soortpagina boommarter",
    kenmerk: "Vijf tenen met nagels; voorvoet 3,5–4,5 cm breed. In de winter vervaagt het spoor door de behaarde voeten. Paslengte in galop 60–90 cm.",
    breedte: 4,
    voor: `<path d="M50 58C58 57 68 62 70 70C72 78 66 84 60 81C56 79 44 79 40 81C34 84 28 78 30 70C32 62 42 57 50 58Z"/><ellipse cx="23" cy="56" rx="5.4" ry="6.8" transform="rotate(-38 23 56)" opacity=".9"/><ellipse cx="33" cy="42" rx="6" ry="7.6" transform="rotate(-16 33 42)"/><ellipse cx="50" cy="37" rx="6.2" ry="7.8"/><ellipse cx="67" cy="42" rx="6" ry="7.6" transform="rotate(16 67 42)"/><ellipse cx="77" cy="56" rx="5.4" ry="6.8" transform="rotate(38 77 56)"/><path d="M19.9 47.4Q17.6 44.6 15 42Q16.4 45.4 18.1 48.6Z"/><path d="M31.7 32.2Q30.3 28.5 28.5 25Q28.7 29 29.3 32.8Z"/><path d="M51.2 27.5Q50.8 23.8 50 20Q49.2 23.8 48.8 27.5Z"/><path d="M70.7 32.8Q71.3 29 71.5 25Q69.7 28.5 68.3 32.2Z"/><path d="M81.9 48.6Q83.6 45.4 85 42Q82.4 44.6 80.1 47.4Z"/>`,
    gang: "paren"
  },
  zwijn: {
    soort: "wild-zwijn",
    naam: "Wild zwijn",
    bron: "Zodion, soortpagina wild zwijn",
    kenmerk: "Brede hoefafdruk tot 12 cm lang en 5–7 cm breed; de bijhoeven zijn vrijwel altijd zichtbaar. Hoe ouder het dier, hoe stomper de hoeven. Loopt in stap en draf.",
    breedte: 6,
    voor: `<path d="M46.5 20C37 22 28 38 28 57C28 72 33 82 41 84C46 85 48 79 48 70L48 32C48 26 48 21 46.5 20Z"/><path d="M53.5 21C63 23 72 39 72 58C72 73 67 82 59 84C54 85 52 79 52 70L52 33C52 27 52 22 53.5 21Z"/><ellipse cx="29" cy="100" rx="4.6" ry="6" transform="rotate(-22 29 100)"/><ellipse cx="71" cy="100" rx="4.6" ry="6" transform="rotate(22 71 100)"/>`,
    gang: "zwijn"
  }
};

/* Het loopspoor: een lijst prenten { x, y, r (graden), voet: "voor" | "achter", spiegel } in eenheden van één prentbreedte,
   met de looprichting naar boven (negatieve y). Gebaseerd op de gang uit de bron. */
function spoorPatroon(id, n){
  const out = [], g = SPOREN[id].gang;
  for (let i = 0; i < n; i++){
    const l = i % 2 === 0, s = l ? -1 : 1;           // links / rechts
    if (g === "stap"){          // das: schommelende stap, twee rijen, achtervoet half over de voorvoet
      out.push({ x: s * 0.65, y: -i * 1.55, r: s * -8, voet: "voor", spiegel: !l });
      out.push({ x: s * 0.72, y: -i * 1.55 + 0.32, r: s * -8, voet: "achter", spiegel: !l });
    } else if (g === "draf"){   // vos: draf, prenten bijna op één lijn, achtervoet in de voorvoet
      out.push({ x: s * 0.18, y: -i * 2.6, r: s * 3, voet: "voor", spiegel: !l });
    } else if (g === "lijn"){   // ree: vrijwel één lijn
      out.push({ x: s * 0.25, y: -i * 3.4, r: s * 4, voet: "voor", spiegel: false });
    } else if (g === "paren"){  // boommarter: martersprong, prenten in schuine paren
      const grp = Math.floor(i / 2), k = i % 2;
      out.push({ x: k ? 0.42 : -0.42, y: -grp * 3.2 - (k ? 0.55 : 0), r: 0, voet: "voor", spiegel: k === 1 });
    } else if (g === "zwijn"){  // wild zwijn: stap, twee rijen dicht bij elkaar
      out.push({ x: s * 0.42, y: -i * 1.7, r: s * 5, voet: "voor", spiegel: !l });
    }
  }
  return out;
}

/* Eén prent als SVG-tekst. De afdruk krijgt een zachte, iets bredere rand (de opgedrukte modder) en rafelige randen,
   zodat hij meer op een echte afdruk lijkt dan op een stempel. voet: "voor" | "achter" | "bij" (ree met bijhoeven). */
let prentTeller = 0;
function prentSVG(id, voet, extra){
  const s = SPOREN[id], inner = s[voet] || s.voor, f = "vg-ruw-" + (++prentTeller);
  return `<svg viewBox="-6 -6 112 122" fill="currentColor" aria-hidden="true" ${extra || ""}>
    <defs><filter id="${f}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${prentTeller % 7}"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter></defs>
    <g filter="url(#${f})"><g opacity=".2" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round">${inner}</g><g>${inner}</g></g></svg>`;
}
