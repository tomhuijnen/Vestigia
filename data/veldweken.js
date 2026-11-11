/* Vestigia – veldweken. Eén keer per maand, in de eerste volledige week (maandag t/m zondag), hebben alle dagcasussen
   één thema. De thema's gaan over leefgebied of gedrag en lopen dwars door de diergroepen heen, zodat een thema de
   diergroep niet verraadt. Welke soorten passen, volgt uit de kenmerken in data/soorten.js (h, a, v, b, w).
   VELDWEEK_PLAN: het thema per kalendermaand (januari = 0). Elk thema komt één keer per jaar langs.
   VELDWEEK_VANAF: de eerste veldweek (dag 31 = maandag 7 december 2026). Dezelfde regel staat in supabase-009. */
"use strict";
const VELDTHEMAS = {
  nacht:   { titel: "Nachtdieren", f: t => t.a.includes("NACHT"),
             intro: "De langste nachten van het jaar. Zeven soorten die vooral actief zijn als het donker is. Raad jij ze allemaal?" },
  stad:    { titel: "Stadsnatuur", f: t => t.b.includes("GEB") || t.h.includes("BEB"),
             intro: "Zeven soorten die het goed doen tussen huizen, schuren, tuinen en parken. Natuur begint bij de voordeur." },
  jagers:  { titel: "Jagers en rovers", f: t => t.v.includes("GEW"),
             intro: "Zeven soorten die andere gewervelde dieren eten, van muis tot vis. Let op plukresten, braakballen en prooiresten." },
  water:   { titel: "Langs de waterkant", f: t => t.h.some(h => ["STIL", "STROOM", "MOER"].includes(h)),
             intro: "Sloten, beken, poelen en moerassen komen tot leven. Zeven soorten die niet zonder water kunnen." },
  heide:   { titel: "Heide en stuifzand", f: t => t.h.includes("HEI") || t.h.includes("DUIN"),
             intro: "Warm zand, struikhei en vliegdennen. Zeven soorten van de open, droge en schrale plekken." },
  trek:    { titel: "Terug uit het zuiden", f: t => t.w.includes("TREK"),
             intro: "Ze brachten de winter ver weg door en komen nu terug. Zeven soorten die elk jaar wegtrekken." },
  bos:     { titel: "In het bos", f: t => t.h.includes("BOS"),
             intro: "Oude bomen, dood hout en een dichte struiklaag. Zeven soorten die het bos nodig hebben." },
  kust:    { titel: "Kust en zee", f: t => t.h.includes("DUIN") || t.h.includes("ZEE"),
             intro: "Duinen, wad en open zee. Zeven soorten van de rand van Nederland." },
  klein:   { titel: "Kleine prooien", f: t => t.v.includes("ONG"),
             intro: "Kevers, rupsen, wormen en slakken staan op het menu. Zeven soorten die leven van ongewervelden." },
  open:    { titel: "Open land", f: t => t.h.includes("OPEN"),
             intro: "Akkers, weilanden en wegbermen tot aan de horizon. Zeven soorten van het open agrarische landschap." },
  winter:  { titel: "Klaar voor de winter", f: t => t.w.includes("SLAAP"),
             intro: "De dagen worden korter. Zeven soorten die de winter doorkomen door bijna stil te vallen." },
  planten: { titel: "Zaden, bessen en blad", f: t => t.v.includes("PLANT"),
             intro: "De voorraadkast van de natuur. Zeven soorten die (ook) van plantaardig voedsel leven." }
};
const VELDWEEK_PLAN = ["stad", "jagers", "water", "heide", "trek", "bos", "kust", "klein", "open", "winter", "planten", "nacht"];
const VELDWEEK_VANAF = 31;
