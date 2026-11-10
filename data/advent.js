/* Vestigia – adventkalender (update 8, december 2026)
   Per vakje een winterweetje over een beschermde soort uit het spel. Wat er verder in een vakje zit (eikels, een
   kleur of lijst), bepaalt de server (advent_vakjes, supabase-012); DEMO staat hier alleen voor ?kerst=demo.
   Bronnen zoals in de rest van Vestigia: Zoogdiervereniging/Zodion, RAVON, Sovon, Vogelbescherming, BIJ12. */
"use strict";
const ADVENT = [
  { dag: 1,  soort: "egel", tekst: "De egel slaapt van ongeveer november tot maart in een nest van bladeren onder een struik of houtstapel. Zijn lichaamstemperatuur zakt dan tot een paar graden boven nul.", bron: "Zoogdiervereniging" },
  { dag: 2,  soort: "hazelmuis", tekst: "De hazelmuis houdt zijn winterslaap niet in een boom, maar in een nestje op of net onder de grond, tussen strooisel en wortels. Hij slaapt ruim een half jaar.", bron: "Zoogdiervereniging" },
  { dag: 3,  soort: "das", tekst: "De das houdt geen echte winterslaap. Bij strenge kou blijft hij wel dagenlang in zijn burcht en leeft hij op het vet dat hij in de herfst heeft opgebouwd.", bron: "Zoogdiervereniging" },
  { dag: 4,  soort: "ingekorven-vleermuis", tekst: "Ingekorven vleermuizen overwinteren in de mergelgroeven van Zuid-Limburg, waar het hele jaar door koel en vochtig is. Elke verstoring kost ze kostbare energie.", bron: "Zoogdiervereniging" },
  { dag: 5,  soort: "eekhoorn", tekst: "De eekhoorn verstopt in de herfst honderden noten en eikels. Wat hij vergeet terug te vinden, groeit uit tot nieuwe bomen. Vandaag strooit de Sint een extra zak eikels!", bron: "Zoogdiervereniging" },
  { dag: 6,  soort: "kerkuil", tekst: "In strenge winters met lang sneeuw kunnen kerkuilen nauwelijks muizen vangen. Na zo'n winter is de stand vaak flink lager, en jagen ze ook overdag.", bron: "Vogelbescherming" },
  { dag: 7,  soort: "ijsvogel", tekst: "Als het water lang dichtvriest, kan de ijsvogel geen vis vangen. Na een koude winter daalt de stand sterk, maar met meerdere legsels per jaar herstelt hij zich snel.", bron: "Vogelbescherming" },
  { dag: 8,  soort: "bruine-kikker", tekst: "Een deel van de bruine kikkers overwintert niet op het land, maar op de bodem van een sloot of poel. Ze ademen dan via hun huid.", bron: "RAVON" },
  { dag: 9,  soort: "zandhagedis", tekst: "De zandhagedis graaft zich in de herfst in, vaak op een zonnige zandhelling, en komt pas in maart weer tevoorschijn. De mannetjes zijn als eersten wakker.", bron: "RAVON" },
  { dag: 10, soort: "adder", tekst: "Adders overwinteren vaak met meerdere tegelijk op een vaste plek, zoals een oud konijnenhol of tussen de wortels van een omgevallen boom.", bron: "RAVON" },
  { dag: 11, soort: "bever", tekst: "De bever houdt geen winterslaap. In de herfst legt hij vlak bij zijn burcht een voorraad takken onder water, zodat hij ook onder het ijs te eten heeft.", bron: "Zoogdiervereniging" },
  { dag: 12, soort: "otter", tekst: "De otter heeft geen speklaag tegen de kou, maar wel een van de dichtste vachten in het dierenrijk. Die houdt een laagje lucht vast, zodat zijn huid droog blijft.", bron: "Zoogdiervereniging" },
  { dag: 13, soort: "ree", tekst: "Reebokken werpen in de late herfst hun gewei af. In de winter groeit al een nieuw gewei, nog bedekt met een zachte, behaarde huid: de bast.", bron: "Zoogdiervereniging" },
  { dag: 14, soort: "zeearend", tekst: "In de winter zijn er meer zeearenden in Nederland, omdat er vogels uit het noorden en oosten bij komen. Grote wateren als de Oostvaardersplassen trekken ze aan.", bron: "Sovon" },
  { dag: 15, soort: "gewone-dwergvleermuis", tekst: "Op een zachte winteravond kan een gewone dwergvleermuis kort wakker worden en jagen. Zie je in december een vleermuis, dan is het vaak deze soort.", bron: "Zoogdiervereniging" },
  { dag: 16, soort: "kwabaal", tekst: "De kwabaal is de enige zoetwatervis in Nederland die midden in de winter paait, van december tot maart, soms zelfs onder het ijs.", bron: "RAVON" },
  { dag: 17, soort: "bosuil", tekst: "De baltstijd van de bosuil begint al in de winter. Op stille decembernachten hoor je het mannetje roepen om zijn territorium af te bakenen.", bron: "Vogelbescherming" },
  { dag: 18, soort: "ransuil", tekst: "In de winter zoeken ransuilen elkaar op. Op een vaste roestplaats, vaak een dichte conifeer, zitten er soms tientallen overdag bij elkaar.", bron: "Vogelbescherming" },
  { dag: 19, soort: "grauwe-gans", tekst: "Nederland is in de winter een van de belangrijkste overwinteringsgebieden voor ganzen in Europa. Naast onze eigen grauwe ganzen komen er veel uit het noorden en oosten bij.", bron: "Sovon" },
  { dag: 20, soort: "gewone-bosspitsmuis", tekst: "De gewone bosspitsmuis houdt geen winterslaap. Hij wordt in de winter juist kleiner, zodat hij minder energie nodig heeft, en moet toch om de paar uur eten.", bron: "Zoogdiervereniging" },
  { dag: 21, soort: "vos", tekst: "Midwinter is de paartijd van de vos. In januari en februari hoor je 's nachts geregeld hun schorre blaffen en schreeuwen.", bron: "Zoogdiervereniging" },
  { dag: 22, soort: "boerenzwaluw", tekst: "Terwijl wij kerst vieren, jaagt onze boerenzwaluw op insecten ten zuiden van de Sahara. In april is hij terug in dezelfde schuur.", bron: "Vogelbescherming" },
  { dag: 23, soort: "knoflookpad", tekst: "De knoflookpad graaft zich met de hoornige schopjes aan zijn achterpoten diep in losse zandgrond in, onder de vorstgrens.", bron: "RAVON" },
  { dag: 24, soort: "wolf", tekst: "De winter is de tijd waarin wolven paren en roedels het hechtst zijn. Sporen in de sneeuw laten mooi zien hoe een roedel achter elkaar in één spoor loopt. Fijne kerst!", bron: "Zoogdiervereniging" }
];
/* alleen voor ?kerst=demo: zelfde inhoud als supabase-012 (sporenvakje: eikels volgen uit het antwoord) */
const ADVENT_INHOUD = {
  1: [10], 2: [0, null, "vos"], 3: [10], 4: [5, "titel:Wintergast"], 5: [50], 6: [15], 7: [0, null, "das"], 8: [10], 9: [10],
  10: [10], 11: [0, null, "ree"], 12: [10, "kleur:winter"], 13: [15], 14: [10], 15: [0, null, "boommarter"],
  16: [5, "kleur:hulst"], 17: [10], 18: [5, "lijst:sneeuwvlokken"], 19: [15], 20: [0, null, "zwijn"], 21: [5, "titel:IJsprins"],
  22: [10], 23: [10], 24: [25, "lijst:kerst"]
};
const ADVENT_DEMO = (d, antwoord) => {
  const [e, item = null, spoor = null] = ADVENT_INHOUD[d], goed = spoor ? antwoord === spoor : null;
  return { dag: d, eikels: spoor ? (goed ? 20 : 5) : e, item, spoor, goed, antwoord: antwoord || null };
};
