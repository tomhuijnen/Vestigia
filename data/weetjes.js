/* Vestigia – ‘Wist je dat?’ per casus (update 37, november 2026)
   Na afloop van een casus: één verrassend weetje over de soort, per casus een ander. Vervangt het vak ‘Typisch’
   (dat herhaalde vaak de toelichting). Het labeltje ‘typisch’ bij de doorslaggevende waarneming (sl.i) blijft.
   Sleutel = "<soort-id>:<casusnummer>" (0 = eerste casus), zoals in data/toelichting.js.
   t    het weetje: één zin, ±15–25 woorden, geen herhaling van de toelichting van dezelfde casus
   bron de goedgekeurde bron (Sovon, RAVON, Zodion, Vogelbescherming, BIJ12, De Vlinderstichting, EIS); staat klein onder het weetje
   Een casus zonder weetje toont nog het oude vak ‘Typisch’, tot zijn diergroep is goedgekeurd.
   Goedgekeurd door Tom, per diergroep: reptielen (17 november 2026, 09:32) */
"use strict";
const WEETJES = {
  /* ---------- Reptielen (RAVON, soortpagina's) ---------- */
  "zandhagedis:0": { t:"Jonge zandhagedissen hebben een zandkleurige staart, terwijl die van jonge levendbarende hagedissen bijna zwart is.", bron:"RAVON, soortpagina zandhagedis" },
  "zandhagedis:1": { t:"Je vindt hem vooral in de kustduinen en op de Veluwe, maar op Texel, Ameland en in de Zeeuwse duinen ontbreekt hij.", bron:"RAVON, soortpagina zandhagedis" },
  "gladde-slang:0": { t:"Er zijn gladde slangen van 16 à 17 jaar oud bekend, terwijl een adder van 10 tot 15 jaar al een uitzondering is.", bron:"RAVON, soortpagina's gladde slang en adder" },
  "gladde-slang:1": { t:"Op enkele plekken langs de grens vormen gladde slangen één populatie met hun soortgenoten aan de Belgische en Duitse kant.", bron:"RAVON, soortpagina gladde slang" },
  "adder:0": { t:"Mannetjes eten in het voorjaar wekenlang niets: ze liggen alleen te zonnen tot hun sperma rijp is.", bron:"RAVON, soortpagina adder" },
  "adder:1": { t:"Een vrouwtje krijgt meestal maar eens in de twee jaar jongen, en in dat jaar eet ze vrijwel niets.", bron:"RAVON, soortpagina adder" },
  "ringslang:0": { t:"Eén vrouwtje legt 20 tot 30 eieren tegelijk in een broeiende hoop mest, compost of blad.", bron:"RAVON, soortpagina ringslang" },
  "ringslang:1": { t:"Met een lengte tot 1,20 meter is hij de grootste slang van Nederland.", bron:"RAVON, soortpagina ringslang" },
  "hazelworm:0": { t:"Een hazelworm kan 10 tot 15 jaar oud worden, en in gevangenschap zelfs meer dan 30 jaar.", bron:"RAVON, soortpagina hazelworm" },
  "hazelworm:1": { t:"Hij is een echte thuisblijver: zijn hele leefgebied is vaak maar een paar honderd vierkante meter groot.", bron:"RAVON, Week van de hazelworm" },
  "levendbarende-hagedis:0": { t:"Hij is ons kleinste, maar ook ons succesvolste reptiel, en zwaarder dan 8 gram wordt hij zelden.", bron:"RAVON, atlastekst levendbarende hagedis" },
  "levendbarende-hagedis:1": { t:"Nieuwe populaties worden bijna nooit ontdekt, maar in 2022 vond een stagiair van het waterschap er een bij Drimmelen, midden in akkerland.", bron:"RAVON, nieuwsbericht nieuwe Brabantse populatie" },
  "muurhagedis:0": { t:"Na een dieptepunt in de jaren tachtig groeit de populatie weer, maar het gaat nog steeds om maar enkele honderden dieren.", bron:"RAVON, soortpagina muurhagedis" },
  "muurhagedis:1": { t:"Muurhagedissen die je buiten Maastricht ziet, zijn uitgezet en komen vaak uit Midden- en Zuid-Europa.", bron:"RAVON, soortpagina muurhagedis" }
};
