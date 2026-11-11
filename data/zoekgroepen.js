/* Vestigia – zoeken op een groep (update 12)
   Typ je bij het determineren de naam van een groep, dan toont de lijst alle soorten uit die groep, ook als het
   groepswoord niet in de soortnaam staat: ‘vlinder’ geeft de grote vos, ‘hert’ de ree, ‘uil’ de oehoe.
   Soorten waarvan de naam het woord al bevat (‘vuursalamander’ bij ‘salamander’) vond je al; die blijven gewoon staan.

   Per groep:
   naam  zoals hij boven de lijst staat · w  woorden waarop hij reageert (enkelvoud, meervoud, synoniemen; zonder accenten)
   g     een hele diergroep uit GROUPS · ids  losse soorten (vaste id's uit data/soorten.js)
   Alleen beschermde soorten komen in de lijst (KIESBAAR); niet-beschermde soorten in ids worden vanzelf overgeslagen.
   De indeling volgt de gangbare Nederlandse naamgeving en de taxonomie (familie of orde), niet de kenmerken uit het
   spel, zodat zoeken nooit een aanwijzing geeft. Controleer na een wijziging met: node tools/controle.mjs */
const ZOEKGROEPEN = [
  /* hele diergroepen */
  { naam: "Zoogdieren", w: ["zoogdier", "zoogdieren"], g: "Z" },
  { naam: "Reptielen",  w: ["reptiel", "reptielen"], g: "R" },
  { naam: "Amfibieën",  w: ["amfibie", "amfibieen", "amfibien", "amfibia"], g: "A" },
  { naam: "Vissen",     w: ["vis", "vissen"], g: "F" },
  { naam: "Vogels",     w: ["vogel", "vogels"], g: "B" },
  { naam: "Vlinders",   w: ["vlinder", "vlinders"], g: "V" },

  /* zoogdieren */
  { naam: "Vleermuizen", w: ["vleermuis", "vleermuizen"], ids: ["watervleermuis", "laatvlieger", "gewone-dwergvleermuis", "ruige-dwergvleermuis",
      "rosse-vleermuis", "meervleermuis", "franjestaart", "ingekorven-vleermuis", "tweekleurige-vleermuis", "grijze-grootoorvleermuis",
      "gewone-grootoorvleermuis", "gewone-baardvleermuis"] },
  { naam: "Knaagdieren", w: ["knaagdier", "knaagdieren"], ids: ["bever", "hamster", "hazelmuis", "eikelmuis", "eekhoorn", "bosmuis", "dwergmuis",
      "woelrat", "aardmuis", "rosse-woelmuis", "noordse-woelmuis", "veldmuis", "bruine-rat", "huismuis", "muskusrat", "beverrat"] },
  /* echte muizen, woelmuizen en slaapmuizen; spitsmuizen en vleermuizen vind je via de naam, maar staan lager */
  { naam: "Muizen", w: ["muis", "muizen"], ids: ["hazelmuis", "eikelmuis", "bosmuis", "dwergmuis", "aardmuis", "rosse-woelmuis", "noordse-woelmuis", "veldmuis", "huismuis"] },
  { naam: "Woelmuizen", w: ["woelmuis", "woelmuizen"], ids: ["aardmuis", "rosse-woelmuis", "noordse-woelmuis", "veldmuis", "woelrat"] },
  { naam: "Slaapmuizen", w: ["slaapmuis", "slaapmuizen", "relmuis"], ids: ["hazelmuis", "eikelmuis"] },
  { naam: "Spitsmuizen", w: ["spitsmuis", "spitsmuizen"], ids: ["waterspitsmuis", "gewone-bosspitsmuis", "huisspitsmuis"] },
  { naam: "Insecteneters", w: ["insecteneter", "insecteneters"], ids: ["egel", "mol", "waterspitsmuis", "gewone-bosspitsmuis", "huisspitsmuis"] },
  { naam: "Marterachtigen", w: ["marter", "marters", "marterachtige", "marterachtigen"], ids: ["das", "otter", "boommarter", "steenmarter", "hermelijn", "wezel", "bunzing"] },
  { naam: "Roofdieren", w: ["roofdier", "roofdieren"], ids: ["das", "otter", "boommarter", "steenmarter", "hermelijn", "wezel", "bunzing", "vos", "wolf",
      "goudjakhals", "wilde-kat", "gewone-zeehond", "grijze-zeehond", "wasbeer", "huiskat"] },
  { naam: "Hondachtigen", w: ["hond", "honden", "hondachtige", "hondachtigen"], ids: ["vos", "wolf", "goudjakhals"] },
  { naam: "Katachtigen", w: ["kat", "katten", "katachtige", "katachtigen"], ids: ["wilde-kat", "huiskat"] },
  { naam: "Herten", w: ["hert", "herten", "hertachtige", "hertachtigen"], ids: ["ree", "edelhert", "damhert"] },
  { naam: "Hoefdieren", w: ["hoefdier", "hoefdieren", "evenhoevigen"], ids: ["ree", "edelhert", "damhert", "wild-zwijn"] },
  { naam: "Haasachtigen", w: ["haasachtige", "haasachtigen", "hazen"], ids: ["haas", "konijn"] },
  { naam: "Zeehonden", w: ["zeehond", "zeehonden", "rob", "robben"], ids: ["gewone-zeehond", "grijze-zeehond"] },
  { naam: "Walvisachtigen", w: ["walvis", "walvissen", "walvisachtige", "walvisachtigen"], ids: ["bruinvis", "tuimelaar", "witsnuitdolfijn"] },
  { naam: "Dolfijnen", w: ["dolfijn", "dolfijnen"], ids: ["tuimelaar", "witsnuitdolfijn"] },
  { naam: "Zeezoogdieren", w: ["zeezoogdier", "zeezoogdieren"], ids: ["bruinvis", "tuimelaar", "witsnuitdolfijn", "gewone-zeehond", "grijze-zeehond"] },

  /* reptielen en amfibieën */
  { naam: "Slangen", w: ["slang", "slangen"], ids: ["gladde-slang", "ringslang", "adder"] },
  { naam: "Hagedissen", w: ["hagedis", "hagedissen"], ids: ["zandhagedis", "levendbarende-hagedis", "muurhagedis", "hazelworm"] },
  { naam: "Salamanders", w: ["salamander", "salamanders"], ids: ["kamsalamander", "vuursalamander", "kleine-watersalamander", "alpenwatersalamander", "vinpootsalamander"] },
  { naam: "Watersalamanders", w: ["watersalamander", "watersalamanders", "molg", "molgen"], ids: ["kamsalamander", "kleine-watersalamander", "alpenwatersalamander", "vinpootsalamander"] },
  { naam: "Padden", w: ["pad", "padden"], ids: ["gewone-pad", "rugstreeppad", "knoflookpad", "geelbuikvuurpad", "vroedmeesterpad"] },
  { naam: "Kikkers", w: ["kikker", "kikkers", "kikvors", "kikvorsen"], ids: ["boomkikker", "heikikker", "bruine-kikker", "poelkikker", "meerkikker",
      "middelste-groene-kikker", "amerikaanse-brulkikker"] },
  { naam: "Groene kikkers", w: ["groene kikker", "groene kikkers"], ids: ["poelkikker", "meerkikker", "middelste-groene-kikker"] },
  { naam: "Bruine kikkers", w: ["bruine kikkers"], ids: ["bruine-kikker", "heikikker"] },

  /* vissen */
  { naam: "Prikken", w: ["prik", "prikken"], ids: ["beekprik", "rivierprik"] },
  { naam: "Modderkruipers", w: ["modderkruiper", "modderkruipers"], ids: ["grote-modderkruiper", "kleine-modderkruiper"] },
  { naam: "Karperachtigen", w: ["karper", "karpers", "karperachtige", "karperachtigen"], ids: ["elrits", "gestippelde-alver", "bittervoorn"] },
  { naam: "Zalmachtigen", w: ["zalm", "zalmen", "zalmachtige", "zalmachtigen"], ids: ["noordzeehouting"] },
  { naam: "Donderpadden", w: ["donderpad", "donderpadden"], ids: ["beekdonderpad", "rivierdonderpad"] },

  /* vogels */
  { naam: "Uilen", w: ["uil", "uilen", "nachtroofvogel", "nachtroofvogels"], ids: ["steenuil", "kerkuil", "ransuil", "oehoe", "bosuil", "ruigpootuil"] },
  /* roofvogels in de gangbare betekenis: dagroofvogels. Uilen hebben een eigen groep. */
  { naam: "Roofvogels", w: ["roofvogel", "roofvogels", "dagroofvogel", "dagroofvogels"], ids: ["buizerd", "havik", "sperwer", "wespendief", "zwarte-wouw",
      "zeearend", "boomvalk", "slechtvalk", "torenvalk"] },
  { naam: "Valken", w: ["valk", "valken"], ids: ["slechtvalk", "boomvalk", "torenvalk"] },
  { naam: "Spechten", w: ["specht", "spechten"], ids: ["zwarte-specht", "groene-specht", "grote-bonte-specht", "kleine-bonte-specht", "draaihals"] },
  { naam: "Mezen", w: ["mees", "mezen"], ids: ["koolmees", "pimpelmees", "zwarte-mees", "glanskop"] },
  { naam: "Kraaiachtigen", w: ["kraai", "kraaien", "kraaiachtige", "kraaiachtigen"], ids: ["zwarte-kraai", "roek", "kauw", "raaf", "ekster"] },
  /* echte zwaluwen; de gierzwaluw is geen zwaluw, maar vind je via zijn naam */
  { naam: "Zwaluwen", w: ["zwaluw", "zwaluwen"], ids: ["boerenzwaluw", "huiszwaluw", "oeverzwaluw"] },
  { naam: "Eenden", w: ["eend", "eenden"], ids: ["eidereend", "brilduiker"] },
  { naam: "Ganzen", w: ["gans", "ganzen"], ids: ["grauwe-gans"] },
  { naam: "Eendachtigen", w: ["eendachtige", "eendachtigen"], ids: ["eidereend", "brilduiker", "grauwe-gans"] },
  { naam: "Weidevogels", w: ["weidevogel", "weidevogels"], ids: ["kievit", "grutto"] },
  { naam: "Steltlopers", w: ["steltloper", "steltlopers"], ids: ["kievit", "grutto"] },
  { naam: "Vliegenvangers", w: ["vliegenvangers"], ids: ["bonte-vliegenvanger", "grauwe-vliegenvanger", "kleine-vliegenvanger"] },
  { naam: "Kwikstaarten", w: ["kwikstaarten"], ids: ["grote-gele-kwikstaart", "witte-kwikstaart"] },
  { naam: "Roodstaarten", w: ["roodstaarten"], ids: ["gekraagde-roodstaart", "zwarte-roodstaart"] },
  { naam: "Boomkruipers", w: ["boomkruipers"], ids: ["boomkruiper", "kortsnavelboomkruiper"] },
  { naam: "Lijsters", w: ["lijster", "lijsters"], ids: ["merel"] },
  { naam: "Duiven", w: ["duif", "duiven"], ids: ["houtduif"] },
  /* zangvogels = alle Passeriformes in het spel; kraaien horen daar ook bij */
  { naam: "Zangvogels", w: ["zangvogel", "zangvogels"], ids: ["huismus", "roek", "grote-gele-kwikstaart", "oeverzwaluw", "boerenzwaluw", "huiszwaluw",
      "tapuit", "spreeuw", "boomklever", "kauw", "zwarte-kraai", "witte-kwikstaart", "roodborsttapuit", "merel", "bonte-vliegenvanger", "boomkruiper",
      "kortsnavelboomkruiper", "ekster", "gekraagde-roodstaart", "glanskop", "grauwe-vliegenvanger", "kleine-vliegenvanger", "koolmees", "pimpelmees",
      "raaf", "zwarte-mees", "zwarte-roodstaart"] },

  /* vlinders */
  { naam: "Dagvlinders", w: ["dagvlinder", "dagvlinders"], ids: ["pimpernelblauwtje", "donker-pimpernelblauwtje", "grote-vos", "grote-weerschijnvlinder",
      "kleine-ijsvogelvlinder", "kleine-vos"] },
  { naam: "Nachtvlinders", w: ["nachtvlinder", "nachtvlinders", "mot", "motten"], ids: ["teunisbloempijlstaart", "groot-avondrood"] },
  { naam: "Pijlstaarten", w: ["pijlstaarten"], ids: ["teunisbloempijlstaart", "groot-avondrood"] },
  { naam: "Blauwtjes", w: ["blauwtjes"], ids: ["pimpernelblauwtje", "donker-pimpernelblauwtje"] }
];
