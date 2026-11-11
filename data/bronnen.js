/* Vestigia – links naar bronnen en foto's na het determineren (update 12)
   Per soort twee links: de soortpagina van de organisatie die we als bron gebruiken, en foto's.
   - Zoogdieren: Zoogdiervereniging · reptielen, amfibieën en vissen: RAVON ·
     vogels: Vogelbescherming · vlinders: De Vlinderstichting.
   - Foto's: de fotopagina van de soort op waarneming.nl, waar validatoren de determinatie van foto's controleren.
     We linken alleen; de foto's blijven van de fotografen en worden niet in de app getoond. Het soortnummer staat in
     WAARNEMING (opgezocht op 11 november 2026). Ontbreekt een nummer, dan valt de link terug op Wikimedia Commons.
   De adressen van de soortpagina's volgen een vast patroon (de Nederlandse naam in kleine letters, met streepjes).
   Wijkt een pagina af, zet dan het volledige adres in BRON_LOS onder de id van de soort; dat gaat altijd voor. */
const BRON_SITES = {
  Z: { naam: "Zoogdiervereniging", url: "https://www.zoogdiervereniging.nl/zoogdiersoorten/" },
  R: { naam: "RAVON",              url: "https://www.ravon.nl/Soorten/Soortinformatie/" },
  A: { naam: "RAVON",              url: "https://www.ravon.nl/Soorten/Soortinformatie/" },
  F: { naam: "RAVON",              url: "https://www.ravon.nl/Soorten/Soortinformatie/" },
  B: { naam: "Vogelbescherming",   url: "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/" },
  V: { naam: "De Vlinderstichting", url: "https://www.vlinderstichting.nl/vlinders/overzicht-vlinders/details-vlinder/" }
};
/* soortnummers op waarneming.nl (waarneming.nl/species/<nummer>/). Let op: waarneming.nl gebruikt soms een andere
   wetenschappelijke naam (laatvlieger Cnephaeus serotinus, noordse woelmuis Alexandromys oeconomus, kauw Coloeus monedula,
   middelste groene kikker = bastaardkikker). Een nieuwe soort krijgt hier ook een nummer; tools/controle.mjs waarschuwt anders. */
const WAARNEMING = {
  "das":383, "otter":417, "bever":375, "hamster":402, "hazelmuis":403, "eikelmuis":391, "boommarter":376, "steenmarter":421,
  "eekhoorn":389, "watervleermuis":430, "laatvlieger":410, "waterspitsmuis":429, "hermelijn":404, "bruinvis":380, "vos":428, "ree":418,
  "edelhert":388, "damhert":382, "wild-zwijn":432, "haas":401, "konijn":409, "egel":390, "wezel":431, "bunzing":381, "gewone-zeehond":395,
  "wilde-kat":433, "bosmuis":377, "dwergmuis":385, "woelrat":87296, "aardmuis":372, "rosse-woelmuis":200878, "gewone-bosspitsmuis":394,
  "huisspitsmuis":405, "gewone-dwergvleermuis":387, "ruige-dwergvleermuis":1702, "rosse-vleermuis":419, "meervleermuis":411,
  "franjestaart":393, "ingekorven-vleermuis":406, "tweekleurige-vleermuis":424, "grijze-grootoorvleermuis":396,
  "gewone-grootoorvleermuis":398, "noordse-woelmuis":200823, "grijze-zeehond":397, "zandhagedis":459, "gladde-slang":443, "adder":437,
  "ringslang":802963, "hazelworm":445, "levendbarende-hagedis":450, "muurhagedis":452, "kamsalamander":447, "boomkikker":439,
  "rugstreeppad":455, "knoflookpad":449, "geelbuikvuurpad":441, "vroedmeesterpad":457, "heikikker":446, "vuursalamander":458,
  "gewone-pad":442, "bruine-kikker":440, "kleine-watersalamander":448, "alpenwatersalamander":438, "vinpootsalamander":456,
  "poelkikker":453, "meerkikker":451, "grote-modderkruiper":2053, "beekprik":2154, "kwabaal":2062, "elrits":2160, "beekdonderpad":27228,
  "gestippelde-alver":2101, "noordzeehouting":80129, "steenuil":34, "gierzwaluw":97, "kerkuil":33, "ooievaar":7, "ijsvogel":37, "roek":167,
  "oeverzwaluw":155, "slechtvalk":325, "ransuil":310, "huismus":122, "oehoe":300, "buizerd":82, "havik":117, "sperwer":178,
  "wespendief":349, "boomvalk":74, "grote-gele-kwikstaart":756, "bosuil":77, "torenvalk":188, "boerenzwaluw":65, "huiszwaluw":123,
  "blauwe-reiger":64, "zwarte-specht":759, "groene-specht":40, "tapuit":46, "kievit":129, "spreeuw":180, "veldmuis":426,
  "gewone-baardvleermuis":373, "europese-steur":2120, "boomklever":70, "kauw":126, "zwarte-kraai":208, "grauwe-gans":104, "tuimelaar":422,
  "middelste-groene-kikker":2270, "witte-kwikstaart":202, "roodborsttapuit":45, "grutto":26, "merel":150, "houtduif":120,
  "witsnuitdolfijn":435, "wolf":70056, "zwarte-wouw":364, "bonte-vliegenvanger":69, "boomkruiper":71, "kortsnavelboomkruiper":337,
  "brilduiker":80, "draaihals":39, "eidereend":11, "ekster":87, "gekraagde-roodstaart":94, "glanskop":98, "grauwe-vliegenvanger":105,
  "grote-bonte-specht":109, "hop":38, "kleine-bonte-specht":271, "kleine-vliegenvanger":1182, "koolmees":140, "pimpelmees":161, "raaf":54,
  "ruigpootuil":974, "zeearend":353, "zwarte-mees":209, "zwarte-roodstaart":356, "goudjakhals":80322, "pimpernelblauwtje":656,
  "teunisbloempijlstaart":8656, "grote-vos":677, "donker-pimpernelblauwtje":648, "grote-weerschijnvlinder":676,
  "kleine-ijsvogelvlinder":690
};
/* afwijkende adressen: { id: "https://…" } */
const BRON_LOS = {};

const slugVan = n => n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function bronLinks(t){
  if (!t) return [];
  const site = BRON_SITES[t.g], uit = [];
  if (site) uit.push({ soort: "bron", label: site.naam, url: BRON_LOS[t.id] || site.url + slugVan(t.n) });
  uit.push(WAARNEMING[t.id]
    ? { soort: "foto", label: "Foto's op waarneming.nl", url: `https://waarneming.nl/species/${WAARNEMING[t.id]}/photos/` }
    : { soort: "foto", label: "Foto's", url: "https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=" + encodeURIComponent(t.s) });
  return uit;
}
