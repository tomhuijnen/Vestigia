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
  "muurhagedis:1": { t:"Muurhagedissen die je buiten Maastricht ziet, zijn uitgezet en komen vaak uit Midden- en Zuid-Europa.", bron:"RAVON, soortpagina muurhagedis" },
  /* ---------- Amfibieën (RAVON, soortpagina's) ---------- */
  "kamsalamander:0": { t:"Een vrouwtje legt meer dan 200 eieren, en die zijn duidelijk groter dan die van de andere watersalamanders.", bron:"RAVON, soortpagina kamsalamander" },
  "kamsalamander:1": { t:"De meeste dieren verlaten eind juni het water, maar een klein deel blijft er het hele jaar in.", bron:"RAVON, soortpagina kamsalamander" },
  "boomkikker:0": { t:"Rond 1990 was zijn verspreidingsgebied met zo'n 80 procent gekrompen, maar de laatste twaalf jaar neemt hij weer sterk toe.", bron:"RAVON, soortpagina boomkikker" },
  "boomkikker:1": { t:"Hij kan van kleur veranderen, van lichtbruin tot donkergroen.", bron:"RAVON, soortpagina boomkikker" },
  "rugstreeppad:0": { t:"Zijn ratelende roep is tot op een kilometer afstand te horen.", bron:"RAVON, soortpagina rugstreeppad" },
  "rugstreeppad:1": { t:"Hij overwintert soms meer dan een meter diep onder de grond.", bron:"RAVON, soortpagina rugstreeppad" },
  "knoflookpad:0": { t:"Zijn eisnoeren zijn 40 tot 70 centimeter lang en bevatten 700 tot 3400 eieren.", bron:"RAVON, soortpagina knoflookpad" },
  "knoflookpad:1": { t:"Volgens RAVON is hij het moeilijkst te inventariseren amfibie van Nederland.", bron:"RAVON, soortpagina knoflookpad" },
  "geelbuikvuurpad:0": { t:"Hij is het zeldzaamste amfibie van Nederland en leeft hier aan de noordwestrand van zijn verspreidingsgebied.", bron:"RAVON, soortpagina geelbuikvuurpad" },
  "geelbuikvuurpad:1": { t:"In het water drijft hij bij gevaar roerloos aan het oppervlak, zodat hij op een kluitje aarde lijkt.", bron:"RAVON, soortpagina geelbuikvuurpad" },
  "vroedmeesterpad:0": { t:"In het Limburgs heet hij klökske of klingelke, naar zijn roep die aan klokjes doet denken.", bron:"RAVON, soortpagina vroedmeesterpad" },
  "vroedmeesterpad:1": { t:"Bij de vroedmeesterpad kunnen ook de vrouwtjes roepen, en het fluiten houdt aan van eind maart tot in augustus.", bron:"RAVON, soortpagina vroedmeesterpad" },
  "heikikker:0": { t:"De mannetjes zijn maar een paar dagen blauw, en in kleine populaties blijven ze vaak lichtgrijs.", bron:"RAVON, soortpagina heikikker" },
  "heikikker:1": { t:"Hij overwintert van eind oktober tot begin maart op het land, en bijna nooit in het water.", bron:"RAVON, soortpagina heikikker" },
  "vuursalamander:0": { t:"In het wild kan hij 20 jaar oud worden, maar pas rond zijn vijfde jaar wordt hij geslachtsrijp.", bron:"RAVON, soortpagina vuursalamander" },
  "vuursalamander:1": { t:"De populatie is sinds 1997 met 98 procent afgenomen; bij de monitoring worden nog maar enkele dieren per jaar gevonden.", bron:"RAVON, soortpagina vuursalamander" },
  "gewone-pad:0": { t:"Na de metamorfose kunnen duizenden piepkleine padjes tegelijk uit het water kruipen: dat heet paddenregen.", bron:"RAVON, soortpagina gewone pad" },
  "gewone-pad:1": { t:"Gewone padden kunnen meer dan 30 jaar oud worden, al halen ze in het wild meestal de tien niet.", bron:"RAVON, soortpagina gewone pad" },
  "bruine-kikker:0": { t:"Zijn paarroep draagt maar 10 tot 20 meter ver.", bron:"RAVON, soortpagina bruine kikker" },
  "bruine-kikker:1": { t:"Zijn larven zijn kannibalen: ze eten eieren en larven van amfibieën, ook van hun eigen soort.", bron:"RAVON, soortpagina bruine kikker" },
  "kleine-watersalamander:0": { t:"Ondanks zijn naam is hij niet onze kleinste salamander: die titel gaat naar de vinpootsalamander.", bron:"RAVON, soortpagina kleine watersalamander" },
  "kleine-watersalamander:1": { t:"Hij komt in bijna heel Nederland voor, behalve in gebieden met brak water.", bron:"RAVON, soortpagina kleine watersalamander" },
  "alpenwatersalamander:0": { t:"Dat hij op de Veluwe vrij algemeen is, komt door uitzettingen; van nature ligt zijn zwaartepunt in Brabant en Limburg.", bron:"RAVON, soortpagina alpenwatersalamander" },
  "alpenwatersalamander:1": { t:"Jonge dieren blijven de eerste drie jaar op het land, tot ze geslachtsrijp zijn, en ze kunnen zo'n tien jaar oud worden.", bron:"RAVON, soortpagina alpenwatersalamander" },
  "vinpootsalamander:0": { t:"Een vrouwtje kan in één seizoen meer dan 400 eieren leggen, die ze één voor één met haar achterpoten aan blaadjes vastmaakt.", bron:"RAVON, soortpagina vinpootsalamander" },
  "vinpootsalamander:1": { t:"Zijn naam dankt hij aan de zwarte zwemvliezen die de mannetjes in de paartijd aan hun achterpoten krijgen.", bron:"RAVON, soortpagina vinpootsalamander" },
  "poelkikker:0": { t:"De meeste poelkikkers worden niet ouder dan 3 tot 5 jaar.", bron:"RAVON, soortpagina poelkikker" },
  "poelkikker:1": { t:"Zijn verspreiding is bijna het spiegelbeeld van die van de meerkikker: hij zit vooral op de hogere zandgronden.", bron:"RAVON, soortpagina poelkikker" },
  "meerkikker:0": { t:"Een vrouwtje kan per seizoen tot 12.000 eieren leggen, verdeeld over meerdere klompen.", bron:"RAVON, soortpagina meerkikker" },
  "meerkikker:1": { t:"Er is zelfs een meerkikker gezien die een kuiken van de zwarte stern opat.", bron:"RAVON, soortpagina meerkikker" },
  "middelste-groene-kikker:0": { t:"Eieren, larven en jonge groene kikkers zijn meestal niet op soort te brengen; bij twijfel noteer je 'groene kikker onbepaald'.", bron:"RAVON, soortpagina bastaardkikker" },
  "middelste-groene-kikker:1": { t:"Zijn zekerste kenmerk is een scheve graafknobbel die 40 tot 50 procent zo lang is als de teen ernaast.", bron:"RAVON, soortpagina bastaardkikker" }
};
