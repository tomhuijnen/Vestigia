/* Vestigia – soortendata
   Dit bestand is de enige plek waar soorten staan. Controleer na elke wijziging met: node tools/controle.mjs

   Velden per soort
   id    vaste sleutel. Verandert nooit, ook niet als de naam verandert (zet de oude naam dan in ALIASES).
   no    vast platennummer in het Vestiarium. Alleen soorten met een casus hebben er een; nieuwe nummers komen achteraan.
   g     diergroep (GROUPS) · n Nederlandse naam · s wetenschappelijke naam · r regime (LABELS.r) · l lengte in cm (vlinders: spanwijdte)
   zz    zeldzaamheidsklasse (RARITY), op basis van de bronnen. De klasse ZZ levert een medaille op. null = nog niet bepaald.
   twin  id van de tweelingsoort (gokken telt niet als poging). Geldt alleen in de richting waarin het hier staat.
   h a v b w   kenmerken (LABELS); de eerste waarde is de hoofdwaarde
   x     id van de soort waarmee je hem niet moet verwarren · t het onderscheid in één of twee zinnen
   cs    casussen: elk { bron, wn:[vijf waarnemingen] }. Waarneming 1 noemt de maand; daarop kiest de dagcasus het seizoen.
         Een nieuwe casus komt achteraan, zodat de casusnummers van bestaande casussen gelijk blijven.
*/
// Regimes gecontroleerd tegen de lijst beschermde soorten Omgevingswet (art. 11.37, 11.46, 11.54 Bal; bijlage IX Bal;
// landelijke basistabel jaarrond beschermde nesten). Lengte = gemiddelde totale lengte adult in cm (incl. staart).
const LABELS = {
  h: { BOS:"Bos", HALF:"Halfopen landschap", OPEN:"Open agrarisch", HEI:"Heide & hoogveen", DUIN:"Duin & kaal zand",
       MOER:"Moeras & riet", STIL:"Stilstaand water", STROOM:"Stromend water", ZEE:"Zee & kust", BEB:"Bebouwd" },
  a: { DAG:"Dag", SCHEMER:"Schemer", NACHT:"Nacht" },
  v: { PLANT:"Plantaardig", ONG:"Ongewervelden", VIS:"Vis", GEW:"Gewervelden" },
  b: { HOL:"Hol of burcht", BOOM:"Boom(holte)", GEB:"Gebouw of bouwwerk", VEG:"Nest in vegetatie",
       GROND:"Bodem of strooisel", WATER:"In het water", STEEN:"Muur of rots" },
  w: { ACT:"Actief", SLAAP:"Winterslaap/-rust", TREK:"Trekt weg" },
  r: { HR:"Habitatrichtlijn IV", BAL:"Bal bijlage IX", VRJ:"Vogelrichtlijn · nest jaarrond", VR:"Vogelrichtlijn", NB:"Niet beschermd" }
};

const REGIME_INFO = {
  HR: "Strikt beschermd via bijlage IV van de Habitatrichtlijn of de verdragen van Bern/Bonn (art. 11.46 Bal). Verboden zijn onder meer opzettelijk doden, vangen en verstoren, en het beschadigen of vernielen van voortplantings- en rustplaatsen.",
  BAL: "Nationaal beschermde ‘andere soort’ uit bijlage IX van het Bal (art. 11.54). Voor algemene soorten geldt vaak een provinciale vrijstelling bij ruimtelijke ingrepen; voor zeldzame soorten niet.",
  VRJ: "Vogelrichtlijnsoort (art. 11.37 Bal). Het nest staat in de landelijke basistabel van jaarrond beschermde nesten (categorie 1–4), dus ook buiten het broedseizoen beschermd. Een deel van de provincies hanteert een eigen tabel.",
  VR: "Vogelrichtlijnsoort (art. 11.37 Bal): alle in het wild levende vogels zijn beschermd. Het nest is alleen beschermd zolang het in gebruik is (of categorie 5: alleen bij zwaarwegende feiten).",
  NB: "Niet beschermd onder de soortenbescherming van de Omgevingswet. De algemene zorgplicht voor dieren geldt wel."
};

const CLUE_TYPES = ["Locatie & seizoen","Habitat","Microhabitat","Spoor of geluid","Kenmerk"];

const GROUPS = { Z:"Zoogdieren", R:"Reptielen", A:"Amfibieën", F:"Vissen", B:"Vogels", V:"Vlinders" };

const RARITY = { A:"Algemeen", MA:"Minder algemeen", Z:"Zeldzaam", ZZ:"Zeer zeldzaam" };

/* Oude namen die ooit in opslag kunnen staan, met de id waar ze nu bij horen. Voorbeeld: "Wezel (oud)": "wezel" */
const ALIASES = {};

const SPECIES = [
{ id:"das", no:1, g:"Z", n:"Das", s:"Meles meles", r:"BAL", l:85, zz:null, twin:null,
  h:["HALF","BOS"], a:["NACHT","SCHEMER"], v:["ONG","PLANT","GEW"], b:["HOL"], w:["ACT"],
  x:"vos",
  t:"Een vossenburcht heeft minder en kleinere pijpen, zonder beddingmateriaal ervoor, en ruikt scherp. Vossenuitwerpselen liggen los op opvallende plekken, niet in latrinekuiltjes.",
  cs:[
    { sl:{ i:3, t:"Latrines: kuiltjes met uitwerpselen langs vaste wissels. Geen ander Nederlands roofdier maakt echte latrines." }, bron:null, wn:[
      "Oost-Brabant, maart. Kleinschalig landschap met houtwallen, een beekdal en maïsakkers.",
      "Een steile, zandige rand langs het beekdal, begroeid met eiken en braam.",
      "Grasland tegen de houtwal, waar de zode op veel plekken is opengewoeld.",
      "Langs de akkerrand een kuiltje met uitwerpselen; aan het prikkeldraad hangen grove haren.",
      "Prent met vijf tenen naast elkaar en lange nagelafdrukken."
    ] },
    { bron:"Zodion, soortpagina das", sl:{ i:2, t:"Een burcht met grote zandhopen én vers beddingmateriaal (bladeren en gras) bij de pijpen: dat sleept alleen de das naar binnen." }, wn:[
      "Zuid-Limburg, oktober. Een droge, zachte avond.",
      "Een holle weg in het heuvelland, met graften, akkers en boomgaarden.",
      "Een helling vol grote gaten met hopen uitgegraven grond, en ervoor verse bladeren en gras.",
      "Diepe, brede wissels door de ondergroei die naar een maïs- en een fruitperceel lopen; afgeknabbelde maïskolven.",
      "Een zware, laag op de poten staande loper met een witte kop met twee zwarte strepen."
    ] }
  ] },
{ id:"otter", no:2, g:"Z", n:"Otter", s:"Lutra lutra", r:"HR", l:110, zz:null, twin:null,
  h:["STROOM","MOER","STIL"], a:["NACHT","SCHEMER"], v:["VIS","GEW"], b:["HOL"], w:["ACT"],
  x:"bever",
  t:"Bevers laten geen visresten achter maar knaagsporen en ontschorste takken. Hun uitwerpselen vind je zelden, omdat ze in het water poepen.",
  cs:[
    { sl:{ i:3, t:"Spraints: kleine, zoetig ruikende uitwerpselen met visgraten op een opvallend punt aan het water." }, bron:null, wn:[
      "Noordwest-Overijssel, januari. Laagveenmoeras met petgaten.",
      "Schoon, visrijk water met brede rietkragen en wat elzenbroek.",
      "Oevers die ’s winters door kwel deels ijsvrij blijven, met rustige, onbegaanbare delen.",
      "Op een paaltje aan het water kleine hoopjes zoetig ruikende uitwerpselen met visgraten.",
      "Ronde prent met vijf tenen, ±6 cm, en het sleepspoor van een dikke staart."
    ] },
    { bron:"Zodion, soortpagina otter", sl:{ i:3, t:"Een uitwerpsel vol schubben en kreeftenresten op een vaste markeerplek bij het water." }, wn:[
      "Noordoost-Friesland, juli. Vroeg in de ochtend.",
      "Een beekdal met kronkelende waterlopen, vispassages en rietoevers.",
      "Een faunapassage onder een weg: een looprichel langs het water in een duiker.",
      "Op de richel een vers, slijmerig hoopje met schubben en kreeftenresten; in het slib een rij brede prenten met zwemvliezen.",
      "Een lange, slanke en bruine waterbewoner met een dikke, taps toelopende staart."
    ] }
  ] },
{ id:"bever", no:3, g:"Z", n:"Bever", s:"Castor fiber", r:"HR", l:120, zz:null, twin:null,
  h:["STROOM","STIL","MOER"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["HOL","WATER"], w:["ACT"],
  x:"muskusrat",
  t:"De muskusrat is veel kleiner, heeft een zijdelings afgeplatte staart en knaagt geen bomen om; zijn vraatsporen zijn biezen, riet en lisdodde.",
  cs:[
    { sl:{ i:3, t:"De zandlopervormige knaagplek en schuin afgesneden takken met grote tandsporen." }, bron:null, wn:[
      "Zoetwatergetijdengebied, februari. Kreken en eilanden met een wisselende waterstand.",
      "Wilgenvloedbos met veel schietwilg en populier langs het water.",
      "Steile oevers en luwe kreekjes waar het water nooit helemaal droogvalt.",
      "Schuin afgesneden takken en een schietwilg met een zandlopervormige knaagplek.",
      "Een platte, geschubde staart."
    ] },
    { bron:"Zodion, soortpagina bever", sl:{ i:2, t:"Een dam van takken en modder die het water opstuwt: dat bouwt alleen de bever." }, wn:[
      "Maasvallei bij Roermond, september. Een warme nazomeravond.",
      "Een grindplas en een zijgeul met wilgenstruweel en populieren.",
      "Een dam van takken en modder over een sloot, met daarachter een opgestuwde, hogere plas.",
      "Een grote hoop takken tegen de oever met een ingang onder water; in de schemering een harde klap op het water.",
      "Groot, tot 30 kilo, met een brede, platte en kale staart."
    ] }
  ] },
{ id:"hamster", no:4, g:"Z", n:"Hamster", s:"Cricetus cricetus", r:"HR", l:28, zz:null, twin:null,
  h:["OPEN"], a:["SCHEMER","NACHT"], v:["PLANT","ONG"], b:["HOL"], w:["SLAAP"],
  x:"bruine-rat",
  t:"Een rattenhol heeft meerdere ingangen met uitgegraven grond en duidelijke looppaden ertussen, meestal bij water of erven. Loodrechte valpijpen zonder grondhoop ontbreken.",
  cs:[
    { sl:{ i:3, t:"Een rond gat dat loodrecht naar beneden gaat, zonder grondhoop: de valpijp van een hamsterburcht." }, bron:null, wn:[
      "Zuid-Limburg, augustus. Het lössplateau, net na de oogst.",
      "Grote akkers met wintertarwe en luzerne op diepe, droge lössgrond.",
      "Langs de percelen blijven bewust stroken graan staan; het grondwater zit diep.",
      "In de stoppels ronde gaten die recht naar beneden gaan, zonder grondhoop.",
      "Een knaagdier met een zwarte buik en witte vlekken op de flanken."
    ] },
    { bron:"Zodion, soortpagina hamster; BIJ12", sl:{ i:4, t:"Een zwarte buik met witte vlekken op de flanken: geen ander Nederlands knaagdier is van onderen donkerder dan van boven." }, wn:[
      "Zuid-Limburg, mei. Op het Plateau van Margraten.",
      "Een akkerbouwgebied op diepe löss, met gerst en strokenteelt.",
      "Een perceel dat niet diep wordt geploegd en waar de gerst laat wordt gemaaid.",
      "In de jonge tarwe een paar gaten van zo'n 8 cm; bij de ingang afgebeten graanhalmen. 's Nachts staat een dier rechtop met dikke wangen.",
      "Zo groot als een cavia, met een roodbruine rug, witte flankvlekken en een zwarte buik."
    ] }
  ] },
{ id:"hazelmuis", no:5, g:"Z", n:"Hazelmuis", s:"Muscardinus avellanarius", r:"HR", l:14, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT"], v:["PLANT","ONG"], b:["VEG","BOOM"], w:["SLAAP"],
  x:"bosmuis",
  t:"De bosmuis knaagt ook een rond gat in hazelnoten, maar laat tandsporen achter op het buitenoppervlak rond het gat.",
  cs:[
    { sl:{ i:3, t:"Hazelnoten met een gladde, ronde opening en schuine tandsporen aan de binnenkant van het gat." }, bron:null, wn:[
      "Zuid-Limburg, september. Hellingbossen en houtwallen in het heuvelland.",
      "Een gevarieerde, aaneengesloten struiklaag van hazelaar, braam, kamperfoelie en meidoorn.",
      "De struiken zijn via de kronen met elkaar verbonden; er zit geen open gat in de houtwal.",
      "Lege hazelnoten met een rond gat; de rand is glad, met schuine tandsporen aan de binnenkant.",
      "Oranjebruin, met grote zwarte ogen en een behaarde staart."
    ] },
    { bron:"Zodion, soortpagina hazelmuis", sl:{ i:2, t:"Een bolnest van gestripte kamperfoeliebast hoog in de struiken, zonder duidelijke ingang." }, wn:[
      "Zuid-Limburg, juli. In het Vijlenerbos.",
      "Een bosrand met een brede mantel van braam, kamperfoelie en jonge hazelaar.",
      "Een nestbuis aan een tak, en in de struiken een bolnest van geweven gras en gestripte kamperfoeliebast.",
      "Overdag een bolletje zonder ingang in de struiken; 's nachts klimt een klein knaagdier behendig door de takken.",
      "Goudbruin, met grote zwarte ogen en een dichtbehaarde, wat pluimige staart."
    ] }
  ] },
{ id:"eikelmuis", no:6, g:"Z", n:"Eikelmuis", s:"Eliomys quercinus", r:"BAL", l:25, zz:null, twin:null,
  h:["BOS","BEB"], a:["NACHT"], v:["ONG","PLANT"], b:["GEB","BOOM","STEEN"], w:["SLAAP"],
  x:"hazelmuis",
  t:"De hazelmuis heeft geen zwart masker, is kleiner en oranjebruin, en leeft in de struiklaag in plaats van in muren en gebouwen.",
  cs:[
    { sl:{ i:4, t:"Een zwart masker rond de ogen en een staart met een witte eindpluim." }, bron:null, wn:[
      "Zuid-Limburg, juni. Een droog dal met hellingbos en kalkgrasland.",
      "Een oude mergelgroeve en een carréboerderij met hoogstamfruit.",
      "Mergelmuren vol kieren en een hooizolder die nauwelijks nog wordt gebruikt.",
      "Op de zolder keutels van ±1 cm, een rommelig nest en lege slakkenhuisjes.",
      "Zwart rond de ogen en een staart met een witte pluim."
    ] },
    { bron:"Zodion, soortpagina eikelmuis", sl:{ i:4, t:"Het zwarte masker dat tot achter het oor doorloopt, typisch voor deze slaapmuis." }, wn:[
      "Zuid-Limburg, eind augustus. Een warme, droge nacht.",
      "Een hellingbos op kalk met mergelgroeves en oude muren.",
      "Kieren in een mergelwand, vlak bij een vervallen schuur met een stenen fundering.",
      "Uit de kieren komt 's nachts gefluit en gesnurk van jongen; onder de muur liggen opengebroken huisjes van wijngaardslakken en keverresten.",
      "Grijsbruin met een witte buik, grote oren en een zwart masker dat doorloopt tot achter het oor."
    ] }
  ] },
{ id:"boommarter", no:7, g:"Z", n:"Boommarter", s:"Martes martes", r:"BAL", l:70, zz:null, twin:null,
  h:["BOS"], a:["NACHT","SCHEMER"], v:["GEW","PLANT"], b:["BOOM"], w:["ACT"],
  x:"steenmarter",
  t:"De steenmarter heeft een witte, vaak gevorkte keelvlek die doorloopt over de voorpoten en een lichte neus, en rust bij voorkeur in gebouwen.",
  cs:[
    { sl:{ i:4, t:"Een gelige, ongevorkte keelvlek. Bij de steenmarter is die wit en gevorkt." }, bron:null, wn:[
      "Veluwe, april. Een groot, aaneengesloten boscomplex.",
      "Oud gemengd bos met grove den, beuk en eik en veel staand dood hout.",
      "Grote, ovale holen hoog in de beuken; weinig paden en weinig verstoring.",
      "Gedraaide uitwerpselen met haren en bessenpitten op een omgevallen stam; krabsporen op de bast.",
      "Een gelige keelvlek zonder vork."
    ] },
    { bron:"Zodion, soortpagina boommarter", sl:{ i:3, t:"Het spoor stopt bij een stam en gaat in een andere boom verder: een marter die door de boomkronen jaagt." }, wn:[
      "Drenthe, februari. Vers poedersneeuw na een heldere nacht.",
      "Een boswachterij met oude grove dennen en een paar beuken.",
      "Een groot nest van een eekhoorn of een havik hoog in een den, en een spechtenhol in een beuk.",
      "In de sneeuw een spoor van paarsgewijze prenten dat bij een stam eindigt en in een andere boom weer begint; verderop een opengebroken eekhoornnest.",
      "Een donkerbruine marter met lange poten, grote oren en een gele keelvlek."
    ] }
  ] },
{ id:"steenmarter", no:8, g:"Z", n:"Steenmarter", s:"Martes foina", r:"BAL", l:70, zz:null, twin:null,
  h:["BEB","HALF"], a:["NACHT"], v:["GEW","PLANT"], b:["GEB"], w:["ACT"],
  x:"boommarter",
  t:"De boommarter heeft een romige tot oranjegele keelvlek die niet gevorkt is, behaarde voetzolen en grotere oren, en rust in boomholtes.",
  cs:[
    { sl:{ i:4, t:"De witte, gevorkte keelvlek die over de voorpoten doorloopt." }, bron:null, wn:[
      "De Betuwe, mei. Een dorpskern tussen boomgaarden.",
      "Oude boerderijen met rieten kappen, schuren en houtstapels.",
      "Een zolder met losse isolatie, bereikbaar via een kier onder de dakgoot.",
      "Gedraaide uitwerpselen vol kersenpitten; ’s nachts gestommel, en de buren hebben een kapotte bougiekabel.",
      "Een witte, gevorkte keelvlek die doorloopt over de voorpoten."
    ] },
    { bron:"Zodion, soortpagina steenmarter", sl:{ i:3, t:"Beschadigde koelslangen en isolatieschuim in een auto, het bekende werk van deze marter." }, wn:[
      "Utrecht-stad, januari. Een vochtige, zachte nacht.",
      "Een oude woonwijk met binnentuinen, schuurtjes en volle containers.",
      "Een motorruimte van een geparkeerde auto en een kruipruimte onder een schuur.",
      "Doorgebeten koelslangen en isolatieschuim onder de motor; op de schuur gedraaide uitwerpselen vol haren en veertjes.",
      "Grijsbruin, slank, met een lange pluimstaart en een witte, in tweeën gesplitste keelvlek."
    ] }
  ] },
{ id:"eekhoorn", no:9, g:"Z", n:"Eekhoorn", s:"Sciurus vulgaris", r:"BAL", l:40, zz:null, twin:null,
  h:["BOS","BEB"], a:["DAG"], v:["PLANT"], b:["BOOM"], w:["ACT"],
  x:"bosmuis",
  t:"Muizen laten een kort en glad afgeknaagde kegelspil achter zonder rafelig topje, en hazelnoten krijgen een rond gaatje in plaats van in tweeën te worden gekraakt.",
  cs:[
    { sl:{ i:3, t:"Kegelspillen met een rafelig topje en in tweeën gekraakte hazelnoten." }, bron:null, wn:[
      "Landgoed bij Hilversum, oktober.",
      "Gemengd bos met beuk, fijnspar, grove den en een paar oude walnoten.",
      "Hoge, met elkaar verbonden boomkronen en weinig open plekken.",
      "Kegelspillen met een rafelig topje; hazelnoten in twee helften gekraakt.",
      "Een pluimstaart en, in de winter, oorpluimpjes."
    ] },
    { bron:"Zodion, soortpagina eekhoorn", sl:{ i:3, t:"Achtervolgingen in spiralen om de stam: de paringsjacht van dit knaagdier in het vroege voorjaar." }, wn:[
      "Gelderse Vallei, maart. Een zonnige ochtend.",
      "Een gemengd bos met grove den, lariks en een paar oude eiken.",
      "Een kogelvormig nest van takjes en mos, tegen de stam hoog in een spar.",
      "Twee dieren die elkaar in spiralen rond een stam achternazitten; onder de bomen liggen afgeknaagde dennenappels.",
      "Roodbruin tot donkerbruin, met een lange pluimstaart en oorpluimen."
    ] }
  ] },
{ id:"watervleermuis", no:10, g:"Z", n:"Watervleermuis", s:"Myotis daubentonii", r:"HR", l:9, zz:null, twin:null,
  h:["STIL","BOS"], a:["NACHT"], v:["ONG"], b:["BOOM","GEB"], w:["SLAAP"],
  x:"meervleermuis",
  t:"De meervleermuis is groter (spanwijdte ±30 cm), jaagt boven bredere wateren en heeft zijn meeste energie rond 35 kHz in plaats van rond 45 kHz.",
  cs:[
    { sl:{ i:3, t:"Een regelmatig tikkend signaal rond 45 kHz, laag en in rechte banen boven glad water." }, bron:null, wn:[
      "Landgoed in Utrecht, augustus.",
      "Een gracht en vijvers met een gladde, beschutte waterspiegel.",
      "Oude beuken met spechtenholen langs het water, en een ijskelder.",
      "Detector: droge, regelmatige tikken met een piek rond 45 kHz, laag boven het water.",
      "Grote voeten met borstelharen."
    ] },
    { bron:"Zodion, soortpagina watervleermuis", sl:{ i:3, t:"Jagen vlak boven het wateroppervlak, waarbij de grote voeten insecten van het water scheppen." }, wn:[
      "Groningen, augustus. Een windstille avond.",
      "Een brede vaart met bomenrijen langs een boerenerf.",
      "Een oude eik met een spechtenhol en een kier achter een houten brug.",
      "Dieren die als hovercraftjes vlak boven het wateroppervlak in rechte lijnen jagen; soms raken ze het water.",
      "Een middelgrote Myotis met grote voeten en een roze-bruin gezicht."
    ] }
  ] },
{ id:"laatvlieger", no:11, g:"Z", n:"Laatvlieger", s:"Eptesicus serotinus", r:"HR", l:12, zz:null, twin:null,
  h:["BEB","HALF"], a:["NACHT","SCHEMER"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"rosse-vleermuis",
  t:"De rosse vleermuis vliegt hoger en sneller met smalle vleugels, roept met afwisselende ‘plip-plop’-signalen rond 20 kHz en woont in boomholtes.",
  cs:[
    { sl:{ i:3, t:"Luide, langzame signalen rond 25 tot 30 kHz en keutels onder de nok van een woning." }, bron:null, wn:[
      "Zuid-Holland, juni. Een woonwijk aan de rand van het veenweidegebied.",
      "Weilanden met vee direct achter de tuinen; laanbomen en bosjes.",
      "Woningen uit de jaren dertig met spouwmuren en pannendaken.",
      "Onder de nok keutels van ±1 cm; detector: luide, langzame signalen rond 25–30 kHz.",
      "Groot en donker; de laatste staartwervels steken buiten de vlieghuid uit."
    ] },
    { bron:"Zodion, soortpagina laatvlieger", sl:{ i:3, t:"Brede vleugels en harde, lage roepen bij lantaarns en vee: typisch voor deze grote huisbewoner." }, wn:[
      "Gelderland, september. Al vroeg in de schemering.",
      "Een dorpsrand met bomenlanen en een weiland met koeien.",
      "Een oud kerkje met een spleet onder de dakrand.",
      "Een grote, brede vleugelslag rond lantaarnpalen en rond het vee; harde, lage klikken op de detector.",
      "Groot en donkerbruin, met brede vleugels; de punt van de staart steekt een stukje voorbij het vel tussen de achterpoten."
    ] }
  ] },
{ id:"waterspitsmuis", no:12, g:"Z", n:"Waterspitsmuis", s:"Neomys fodiens", r:"BAL", l:15, zz:null, twin:null,
  h:["STROOM","STIL","MOER"], a:["NACHT","DAG"], v:["ONG","VIS"], b:["HOL"], w:["ACT"],
  x:"gewone-bosspitsmuis",
  t:"De bosspitsmuis is driekleurig (donkere rug, bruine flank, lichte buik), mist de haarkiel onder de staart en jaagt niet onder water.",
  cs:[
    { sl:{ i:3, t:"Uitwerpselen met resten van waterinsecten en vlokreeftjes op een steen aan het water." }, bron:null, wn:[
      "Veenweidegebied, mei.",
      "Een sloot met helder, schoon water vol ongewervelden.",
      "Een onbeschoeide, begroeide oever met stenen en wortels op de waterlijn.",
      "Op een steen kleine uitwerpselen met resten van kokerjuffers en vlokreeftjes.",
      "Zwart met een witte buik en een kiel van stijve haren onder de staart."
    ] },
    { bron:"Zodion, soortpagina waterspitsmuis", sl:{ i:3, t:"Een spitsmuis die onder water over de bodem loopt en zilverig glanst door de luchtlaag in de vacht." }, wn:[
      "Twente, februari. Een heldere, koude dag.",
      "Een snelstromende beek met grindbedden en ondiepe stukken.",
      "Een holle oever onder een els, net boven de waterlijn.",
      "Een klein, zwart dier dat onder water over de bodem loopt en dan zilverig glanst door de lucht in de vacht.",
      "Zwart van boven en wit van onder, met een rij stijve haren onder de staart."
    ] }
  ] },
{ id:"hermelijn", no:13, g:"Z", n:"Hermelijn", s:"Mustela erminea", r:"BAL", l:35, zz:null, twin:null,
  h:["HALF","OPEN","DUIN"], a:["DAG","NACHT"], v:["GEW"], b:["HOL"], w:["ACT"],
  x:"wezel",
  t:"De wezel is kleiner, heeft een korte staart zonder zwarte punt, en de grens tussen bruin en wit is grillig in plaats van recht.",
  cs:[
    { sl:{ i:3, t:"In de sneeuw steeds twee prenten schuin naast elkaar en dunne, gedraaide uitwerpselen." }, bron:null, wn:[
      "Kop van Noord-Holland, januari. De overgang van duin naar polder.",
      "Een duinvallei en vochtige graslanden met veel woelmuizen.",
      "Takkenrillen, steenhopen en houtwallen als dekking.",
      "Dunne, gedraaide uitwerpselen; in de sneeuw steeds twee prenten schuin naast elkaar.",
      "Een staartpunt die altijd zwart is."
    ] },
    { bron:"Zodion, soortpagina hermelijn", sl:{ i:4, t:"De staartpunt die altijd zwart is, ook in de witte wintervacht." }, wn:[
      "Flevoland, juli. Langs een akker met graszoom.",
      "Graslanden en dijken vol muizenholletjes en hier en daar een takkenhoop.",
      "Een steenstort aan de voet van een dijk.",
      "Een slank roofdiertje dat rechtop gaat zitten om rond te kijken en dan met grote sprongen verdwijnt; het sleept een woelrat mee.",
      "Groter dan een wezel, bruin met een scherpe grens naar de roomwitte buik, en een staartpunt die zwart is."
    ] }
  ] },
{ id:"bruinvis", no:14, g:"Z", n:"Bruinvis", s:"Phocoena phocoena", r:"HR", l:155, zz:null, twin:null,
  h:["ZEE"], a:["DAG","NACHT"], v:["VIS"], b:["WATER"], w:["ACT"],
  x:"tuimelaar",
  t:"De tuimelaar is twee keer zo groot (±3 m), heeft een duidelijke snavel en een hoge, sikkelvormige rugvin, en springt vaak boven water uit.",
  cs:[
    { sl:{ i:4, t:"Geen snavel en schopvormige tanden: de kleinste walvisachtige van de Noordzee." }, bron:null, wn:[
      "Noordzeekust bij Egmond, maart.",
      "Ondiepe kustzee met veel haring en zandspiering.",
      "Je kijkt vanaf de duinrand over zee, met een telescoop.",
      "Akoestische monitoring vangt zeer hoge klikken op; een kleine, driehoekige vin rolt boven water.",
      "Geen snavel, en schopvormige tanden."
    ] },
    { bron:"Zodion, soortpagina bruinvis", sl:{ i:4, t:"Een stompe kop zonder snavel en een kleine driehoekige rugvin." }, wn:[
      "Oosterschelde, april. Een windstille dag met vlak water.",
      "Een getijdengebied achter een stormvloedkering met zeegras en mosselpercelen.",
      "Een geul langs de dijk waar het water bij het keren van het tij rustig wordt.",
      "Een kleine rugvin die een paar keer rustig boven water rolt; een korte, zachte pf bij het ademen.",
      "Tot anderhalve meter, donkergrijs met een lichte buik, zonder snavel en met een kleine driehoekige rugvin."
    ] }
  ] },
{ id:"vos", no:15, g:"Z", n:"Vos", s:"Vulpes vulpes", r:"BAL", l:105, zz:null, twin:null,
  h:["HALF","BOS","BEB","DUIN"], a:["NACHT","SCHEMER"], v:["GEW","ONG","PLANT"], b:["HOL"], w:["ACT"],
  x:"das",
  t:"Een dassenburcht heeft grote zandhopen met beddingmateriaal ervoor en in de buurt een latrine met kuiltjes. De dassenprent heeft vijf tenen naast elkaar met lange nagels, geen ovale prent met vier tenen.",
  cs:[
    { sl:{ i:4, t:"Een ovale prent met vier tenen, waarbij tussen de buitenste tenen en de bal een kruis past." }, bron:null, wn:[
      "Duinen bij Castricum, februari.",
      "Open duingrasland met struweel van duindoorn en meidoorn.",
      "Zandige hellingen met konijnen en een rustige, begroeide duinvallei.",
      "Een uitwerpsel met een gedraaide punt boven op een graspol; ’s nachts een hees gekrijs.",
      "Ovale prent met vier tenen; tussen de buitenste tenen en de bal past een kruis."
    ] },
    { bron:"Zodion, soortpagina vos", sl:{ i:4, t:"Een rossige vacht met een pluimstaart met witte punt." }, wn:[
      "Amsterdam, april. Een volkstuincomplex aan de rand van de stad.",
      "Tuinen met schuurtjes, composthopen en een begroeide spoordijk.",
      "Een gat onder een schuurtje met een paar kleinere pijpen ernaast en een sterke, muskusachtige geur.",
      "Jongen spelen overdag bij het hol; botjes, veren en een kippenpoot liggen verspreid rond de ingang.",
      "Rossig, met witte keel, zwarte achterkant van de oren en een lange pluimstaart met witte punt."
    ] }
  ] },
{ id:"ree", no:16, g:"Z", n:"Ree", s:"Capreolus capreolus", r:"BAL", l:115, zz:null, twin:null,
  h:["BOS","HALF","OPEN"], a:["SCHEMER","DAG","NACHT"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"damhert",
  t:"Het damhert is groter, heeft een lange staart met een zwarte streep, vaak een gevlekte vacht en een schopvormig gewei. Het bronst in oktober, niet in de zomer.",
  cs:[
    { sl:{ i:3, t:"Laag kapotgeschuurde boompjes, glanzend zwarte keutels en een blaffend geluid in de schemering." }, bron:null, wn:[
      "Achterhoek, eind juli.",
      "Kleinschalig landschap van bosjes, maïs en grasland.",
      "Bosranden met jonge opslag en ruigte als dekking.",
      "Laag kapotgeschuurde boompjes en glanzend zwarte keutels; in de schemering een blaffend geluid.",
      "Smalle hoefprent van ±4–5 cm."
    ] },
    { bron:"Zodion, soortpagina ree", sl:{ i:4, t:"Een witte spiegel zonder zichtbare staart: het verschil met het damhert." }, wn:[
      "Salland, januari. Een rijpige ochtend.",
      "Akkers met wintergraan tussen kleine bosjes.",
      "Een groep van zes dieren midden op een akker; in de rijp ligt een rond, kaal plekje.",
      "Smalle hoefprenten en kleine, glanzende keutels; bij onraad laten de dieren een witte achterkant zien.",
      "Een klein hert met een witte spiegel, maar zonder staart en zonder zwarte staartstreep."
    ] }
  ] },
{ id:"edelhert", no:17, g:"Z", n:"Edelhert", s:"Cervus elaphus", r:"BAL", l:220, zz:null, twin:null,
  h:["BOS","HEI"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"damhert",
  t:"Het damhert is kleiner en heeft een schopvormig gewei en een lange staart met zwarte streep. Een bronstig damhert boert kort en rochelend; het edelhert brult langgerekt.",
  cs:[
    { sl:{ i:4, t:"Een grote hoefprent van 8 tot 9 cm: het grootste hert van Nederland." }, bron:null, wn:[
      "Veluwe, eind september.",
      "Uitgestrekt bos, afgewisseld met heidevelden en zandverstuivingen.",
      "Grote, rustige open plekken met een paar modderige poelen.",
      "Bast op borsthoogte in brede stroken geschild; in de schemering een diep, langgerekt geluid.",
      "Grote hoefprent van ±8–9 cm."
    ] },
    { bron:"Zodion, soortpagina edelhert", sl:{ i:3, t:"Grote afgeworpen geweien en mannetjes zonder gewei: in maart werpen deze herten hun gewei af." }, wn:[
      "Oostvaardersplassen, maart. Een koude, heldere dag.",
      "Een groot, open grasland met plassen, rietland en vlierstruweel.",
      "Een kale wilg waarvan de bast tot ver boven heuphoogte is afgeschild.",
      "Een roedel van tientallen dieren; mannetjes zonder gewei of met één kant, en overal grote, afgeworpen geweistangen.",
      "Groot en roodbruin in de zomer, grijsbruin in de winter, met een lichte spiegel en een korte staart."
    ] }
  ] },
{ id:"damhert", no:18, g:"Z", n:"Damhert", s:"Dama dama", r:"BAL", l:150, zz:null, twin:null,
  h:["DUIN","BOS","HALF"], a:["SCHEMER","DAG"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"ree",
  t:"Het ree is kleiner, heeft vrijwel geen zichtbare staart, een effen vacht en een klein, rechtopstaand gewei. Het bronst in de zomer, niet in oktober.",
  cs:[
    { sl:{ i:4, t:"Een lange staart met een zwarte streep." }, bron:null, wn:[
      "Duinen bij Amsterdam, oktober.",
      "Duinbos, struweel en open duingrasland.",
      "Een gebied zonder grote roofdieren, met een hoge graasdruk.",
      "Keutels groter dan die van een ree; een kort, rochelend geluid bij een uitgekrabde kuil.",
      "Een lange staart met een zwarte streep."
    ] },
    { bron:"Zodion, soortpagina damhert", sl:{ i:4, t:"Een witte spiegel met zwarte rand en een lange, beweeglijke staart." }, wn:[
      "Meijendel bij Wassenaar, juni. Een stil duinbos.",
      "Duinbos met open valleien en hoog, ongemaaid gras.",
      "Een rustig stuk bos met een dichte struiklaag en hoog gras.",
      "Een groep hindes met gevlekte jongen; bij schrik springen ze met vier poten tegelijk weg.",
      "Bruin met witte vlekken in de zomer en een spiegel met zwarte rand en een lange staart."
    ] }
  ] },
{ id:"wild-zwijn", no:19, g:"Z", n:"Wild zwijn", s:"Sus scrofa", r:"BAL", l:160, zz:null, twin:null,
  h:["BOS"], a:["NACHT","SCHEMER"], v:["PLANT","ONG"], b:["VEG"], w:["ACT"],
  x:"edelhert",
  t:"Een hertenprent heeft smallere hoeven. Als de bijhoeven al zichtbaar zijn, staan die recht achter de hoeven en niet breed uitstaand.",
  cs:[
    { sl:{ i:3, t:"Grote stukken omgewoelde bodem en modder op kniehoogte tegen de bomen (schuurbomen)." }, bron:null, wn:[
      "Veluwe, november.",
      "Gemengd bos met veel eik en beuk, in een mastjaar.",
      "Vochtige laagten met modderpoelen.",
      "Grote stukken omgewoelde bodem; bomen met modder op kniehoogte.",
      "Prent met twee hoeven en breed uitstaande bijhoeven."
    ] },
    { bron:"Zodion, soortpagina wild zwijn", sl:{ i:3, t:"Gestreepte jongen achter hun moeder aan: frislingen zijn het eerste half jaar gestreept." }, wn:[
      "Meinweg bij Roermond, april. Een droge ochtend.",
      "Een gemengd bos naast een maïsakker en een natuurgebied met heide.",
      "Een kuil van ruim een meter, bekleed met afgebroken takken en gras, in een dichte struik.",
      "Gestreepte, kleine jongen die achter hun moeder aan lopen; in de berm is de grasmat in brede stroken omgeploegd.",
      "Grijsbruin en ruig, met een lange snuit; de jongen hebben lichte lengtestrepen."
    ] }
  ] },
{ id:"haas", no:20, g:"Z", n:"Haas", s:"Lepus europaeus", r:"BAL", l:60, zz:null, twin:null,
  h:["OPEN","HALF"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["GROND"], w:["ACT"],
  x:"konijn",
  t:"Het konijn is kleiner, graaft burchten met veel pijpen en heeft kortere oren zonder zwarte punten. Zijn jongen worden naakt en blind geboren.",
  cs:[
    { sl:{ i:4, t:"Lange oren met zwarte punten." }, bron:null, wn:[
      "Groningen, maart.",
      "Grootschalige kleiakkers en graslanden.",
      "Weinig dekking: geen houtwallen, alleen sloten en een paar bermen.",
      "Een ondiepe kuil in de akker en platte, ronde keutels met grove vezels.",
      "Lange oren met zwarte punten."
    ] },
    { bron:"Zodion, soortpagina haas", sl:{ i:2, t:"Een leger: een ondiepe kuil in het open veld. Dit dier graaft geen holen." }, wn:[
      "Noord-Brabant, september. Een stoppelveld na de maïsoogst.",
      "Een open akkerlandschap met sloten en een paar knotwilgen.",
      "Een ondiepe kuil, de leger, in de rand van het veld.",
      "Een dier dat pas op het laatste moment opspringt en zigzaggend wegrent; in de modder lange achterpoten voor de korte voorpoten.",
      "Groot en goudbruin, met lange oren met zwarte punten en lange achterpoten."
    ] }
  ] },
{ id:"konijn", no:21, g:"Z", n:"Konijn", s:"Oryctolagus cuniculus", r:"BAL", l:45, zz:null, twin:null,
  h:["DUIN","HALF","BEB"], a:["SCHEMER"], v:["PLANT"], b:["HOL"], w:["ACT"],
  x:"haas",
  t:"De haas is groter, graaft niet maar ligt in een ondiepe kuil, en heeft lange oren met zwarte punten. Zijn keutels zijn platter en groter.",
  cs:[
    { sl:{ i:3, t:"Een hoop keutels op een vast punt en veel krabkuiltjes in kort begraasd gras." }, bron:null, wn:[
      "Zeeuwse duinen, mei.",
      "Kort begraasd duingrasland met struweel.",
      "Zandige hellingen waar je makkelijk kunt graven.",
      "Een hoop ronde keutels op een duintopje en veel kleine krabkuiltjes.",
      "Korte oren zonder zwarte punten."
    ] },
    { bron:"Zodion, soortpagina konijn", sl:{ i:3, t:"Met de achterpoten trommelen en dan in een hol schieten: deze soort graaft zelf gangenstelsels." }, wn:[
      "Texel, oktober. Een zonnige middag.",
      "Duingrasland met mos en lage struiken.",
      "Een helling vol holen met zand voor de ingangen en paadjes ertussen.",
      "Dieren die bij gevaar met de staart omhoog naar een hol rennen en met de achterpoten op de grond trommelen.",
      "Klein en grijsbruin, met korte oren zonder zwarte punten en een witte staartonderkant."
    ] }
  ] },
{ id:"egel", no:22, g:"Z", n:"Egel", s:"Erinaceus europaeus", r:"BAL", l:25, zz:null, twin:null,
  h:["HALF","BEB"], a:["NACHT"], v:["ONG"], b:["VEG"], w:["SLAAP"],
  x:"bruine-rat",
  t:"Rattenuitwerpselen zijn kleiner (±1–2 cm), hebben stompe uiteinden en bevatten geen keverresten. Ratten lopen vaste paden met holen erlangs.",
  cs:[
    { sl:{ i:3, t:"Glanzend zwarte uitwerpselen vol keverresten en luid gesnuif in de nacht." }, bron:null, wn:[
      "Een vinexwijk, juni.",
      "Tuinen met gazons, borders en heggen.",
      "Ruige hoeken met bladhopen en schuttingen met hier en daar een gat.",
      "Glanzende, zwarte uitwerpselen vol keverresten; ’s nachts luid gesnuif.",
      "Prent met vijf tenen, ±3 cm."
    ] },
    { bron:"Zodion, soortpagina egel", sl:{ i:4, t:"Een lijf vol stekels." }, wn:[
      "Leiden, november. Na de eerste nachtvorst.",
      "Een volkstuin met heggen, hopen blad en composthopen.",
      "Een grote, droge hoop blad onder een conifeer, met een opening aan de onderkant.",
      "In de bladhoop een bol van bladeren en gras; er ligt een opgerold dier in dat nauwelijks ademt.",
      "Bedekt met stekels, met een spitse snuit en kleine pootjes."
    ] }
  ] },
{ id:"wezel", no:23, g:"Z", n:"Wezel", s:"Mustela nivalis", r:"BAL", l:22, zz:null, twin:null,
  h:["HALF","OPEN"], a:["DAG","NACHT"], v:["GEW"], b:["HOL"], w:["ACT"],
  x:"hermelijn",
  t:"De hermelijn is groter, heeft een langere staart met altijd een zwarte punt, en de grens tussen bruin en wit loopt recht.",
  cs:[
    { sl:{ i:4, t:"Een korte staart zonder zwarte punt." }, bron:null, wn:[
      "Hoeksche Waard, juli.",
      "Akkers met brede grasbermen en slootkanten.",
      "Een jaar met heel veel veldmuizen.",
      "Heel dunne, gedraaide uitwerpselen van ±2–3 mm; een muizenhol met een nest van muizenhaar.",
      "Een korte staart zonder zwarte punt."
    ] },
    { bron:"Zodion, soortpagina wezel", sl:{ i:3, t:"Heel kleine prenten die in muizengangen verdwijnen: dit is het kleinste roofdier ter wereld." }, wn:[
      "Drenthe, februari. Dunne sneeuw.",
      "Een akker met houtwallen en ruige bermen.",
      "Een gangetje van een veldmuis aan de rand van een takkenhoop.",
      "In de sneeuw heel kleine prenten die steeds in muizengangen verdwijnen; het dier past in een gangetje van 2 cm.",
      "Heel klein en bruin met een witte buik, met een korte staart zonder zwarte punt."
    ] }
  ] },
{ id:"bunzing", no:24, g:"Z", n:"Bunzing", s:"Mustela putorius", r:"BAL", l:50, zz:null, twin:null,
  h:["HALF","MOER"], a:["NACHT"], v:["GEW"], b:["HOL","GEB"], w:["ACT"],
  x:"steenmarter",
  t:"De steenmarter is groter, heeft een witte keelvlek en geen gezichtsmasker, klimt veel en woont vooral op zolders.",
  cs:[
    { sl:{ i:3, t:"Een voorraad verlamde padden met een beet in de kop en een sterke, onaangename geur." }, bron:null, wn:[
      "Utrecht, december. Veenweidegebied.",
      "Sloten met veel kikkers, en knotwilgen.",
      "Een boerenerf met houtstapels en een schuur met een kruipruimte.",
      "Een voorraad padden met een beet in de kop; een sterke, onaangename geur.",
      "Een licht gezichtsmasker op een donkere kop."
    ] },
    { bron:"Zodion, soortpagina bunzing", sl:{ i:4, t:"Een donkere band over de ogen tussen witte vlekken: het bandietenmasker van dit marterachtige." }, wn:[
      "Overijssel, maart. Een zachte, natte avond waarin kikkers en salamanders naar de poel trekken.",
      "Een boerenerf naast een moerasje met poelen.",
      "Een kruipruimte onder een stal met een opening van een paar centimeter.",
      "Een donker roofdier met een witte snuit en witte oorranden loopt langs de poel; het pakt een kikker. In de stal ruikt het naar musk.",
      "Donkerbruin met een gelige ondervacht die erdoorheen schemert, en een donkere band over de ogen."
    ] }
  ] },
{ id:"gewone-zeehond", no:25, g:"Z", n:"Gewone zeehond", s:"Phoca vitulina", r:"BAL", l:160, zz:null, twin:null,
  h:["ZEE"], a:["DAG","NACHT"], v:["VIS"], b:["WATER"], w:["ACT"],
  x:"grijze-zeehond",
  t:"De grijze zeehond is groter, heeft een langgerekte kop met een ‘Romeins’ profiel en parallelle neusgaten, en jongt rond de jaarwisseling.",
  cs:[
    { sl:{ i:4, t:"V-vormige neusgaten." }, bron:null, wn:[
      "Waddenzee, juni.",
      "Zandplaten die bij laagwater droogvallen.",
      "Rustige platen langs geulen, waar dieren snel het water in kunnen.",
      "Tientallen dieren bij elkaar; jongen gaan binnen enkele uren te water.",
      "V-vormige neusgaten."
    ] },
    { bron:"Zodion, soortpagina gewone zeehond; Ecomare", sl:{ i:3, t:"In de 'banaanhouding' liggen: kop en achterflippers omhoog." }, wn:[
      "Waddenzee bij Pieterburen, augustus. Een warme dag.",
      "Een rustige zandplaat aan een geul.",
      "Een plaat waar bij laagwater tientallen dieren in de zon liggen.",
      "Dieren die hun kop en achterflippers tegelijk omhoog houden, als een banaan; ze verharen.",
      "Een ronde, hondachtige kop met een korte snuit, grote ogen en V-vormige neusgaten."
    ] }
  ] },
{ id:"wilde-kat", no:26, g:"Z", n:"Wilde kat", s:"Felis silvestris", r:"HR", l:90, zz:null, twin:null,
  h:["BOS"], a:["NACHT","SCHEMER"], v:["GEW"], b:["BOOM","HOL"], w:["ACT"],
  x:"huiskat",
  t:"Een verwilderde huiskat heeft een dunnere, spits toelopende staart, en de rugstreep loopt vaak door over de staart. Alleen DNA geeft zekerheid.",
  cs:[
    { sl:{ i:4, t:"Een dikke, stompe staart met zwarte ringen." }, bron:null, wn:[
      "Zuid-Limburg, januari.",
      "Groot hellingbos met open plekken en ruige bosranden.",
      "Ver van bebouwing, en aansluitend op grote bossen over de grens.",
      "Uitwerpselen, niet begraven, op een stronk; haren op een lokstok met valeriaan.",
      "Een dikke, stompe staart met zwarte ringen."
    ] },
    { bron:"Zodion, soortpagina wilde kat", sl:{ i:4, t:"Een dikke staart met scherpe zwarte ringen en een stompe punt." }, wn:[
      "Zuid-Limburg, juni. In de grensbossen bij Vaals.",
      "Een hellingbos met open plekken en een beek in het dal.",
      "Een gat in een omgevallen boom en een ruige rand met braam.",
      "Op een cameraval een forse, gestreepte poes zonder halsband die een muis vangt; DNA uit haren aan een paal bevestigt de soort.",
      "Grijsbruin met vage strepen, een zwarte rugstreep tot aan de staart, en een dikke staart met zwarte ringen."
    ] }
  ] },
{ id:"bosmuis", no:27, g:"Z", n:"Bosmuis", s:"Apodemus sylvaticus", r:"BAL", l:18, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT"], v:["PLANT","ONG"], b:["HOL"], w:["ACT"],
  x:"hazelmuis",
  t:"De hazelmuis laat een gladde rand achter met schuine tandsporen langs de binnenkant en vrijwel geen sporen op het oppervlak. Ze heeft een pluizige staart.",
  cs:[
    { sl:{ i:3, t:"Lege hazelnoten met tandsporen op de buitenkant rond het gat." }, bron:null, wn:[
      "Utrechtse Heuvelrug, oktober.",
      "Gemengd bos met beuk en hazelaar.",
      "Een dikke strooisellaag met veel beukennootjes.",
      "Lege hazelnoten met tandsporen op de buitenkant rond het gat.",
      "Grote oren, grote ogen en een lange staart."
    ] },
    { bron:"Zodion, soortpagina bosmuis", sl:{ i:4, t:"Grote oren, grote ogen en lange sprongen: een echte muis, geen woelmuis." }, wn:[
      "Gelderland, januari. In een schuurtje.",
      "Een tuin naast een bos.",
      "Een stapel brandhout en een kist met zaden in een schuur.",
      "Een voorraad zaden in een laars; dieren die met grote sprongen wegschieten.",
      "Een roodbruin muisje met grote oren, grote ogen en een lange staart."
    ] }
  ] },
{ id:"dwergmuis", no:28, g:"Z", n:"Dwergmuis", s:"Micromys minutus", r:"BAL", l:12, zz:null, twin:null,
  h:["MOER"], a:["DAG","NACHT"], v:["PLANT","ONG"], b:["VEG"], w:["ACT"],
  x:"hazelmuis",
  t:"Het hazelmuisnest is gemaakt van gestripte kamperfoeliebast en zit in struiken, niet in riet. De hazelmuis heeft een pluizige staart en grote zwarte ogen.",
  cs:[
    { sl:{ i:3, t:"Een balletje van gespleten bladeren dat nog aan de stengels vastzit." }, bron:null, wn:[
      "Langs de Vecht, september.",
      "Hoge rietkragen en ruigte met zegge.",
      "Vegetatie die ook in de winter blijft staan.",
      "Op een meter hoogte een balletje van gespleten bladeren die nog vastzitten.",
      "Oranjebruin, ±6 gram, met een grijpstaart."
    ] },
    { bron:"Zodion, soortpagina dwergmuis", sl:{ i:4, t:"Een grijpstaart: de staart wordt als extra poot om halmen gewikkeld." }, wn:[
      "Friesland, augustus. Langs een vaart.",
      "Een brede rietkraag met lisdodde.",
      "Op een meter boven de grond een bolletje tussen riethalmen.",
      "Een heel klein muisje dat met zijn staart om een halm geklemd zit en zaadjes eet.",
      "Heel klein, oranjebruin met een witte buik, en een staart waarmee het kan grijpen."
    ] }
  ] },
{ id:"woelrat", no:29, g:"Z", n:"Woelrat", s:"Arvicola amphibius", r:"BAL", l:30, zz:null, twin:null,
  h:["STIL","MOER","STROOM"], a:["DAG","NACHT"], v:["PLANT"], b:["HOL"], w:["ACT"],
  x:"bruine-rat",
  t:"De bruine rat heeft een spitse snuit, grotere oren en een lange, kale, geschubde staart. Zijn keutels zijn groter, met stompe uiteinden.",
  cs:[
    { sl:{ i:3, t:"Hoopjes schuin afgeknipt riet en keutels op vaste plekken langs de oever." }, bron:null, wn:[
      "Noord-Holland, april. Veenweidegebied.",
      "Sloten met een ruige, begroeide oever.",
      "Flauwe, onbeschoeide oevers met weinig onderhoud.",
      "Hoopjes schuin afgeknipt riet en keutels van ±1 cm op vaste plekken.",
      "Een stompe snuit en een behaarde staart."
    ] },
    { bron:"Zodion, soortpagina woelrat", sl:{ i:4, t:"Een stompe snuit en kleine oren: dit is een woelmuis, geen rat." }, wn:[
      "Drenthe, juli. Een veenkoloniaal kanaal.",
      "Een sloot met dichte begroeiing van gras en riet.",
      "Een hol in de oever met een ingang boven de waterlijn.",
      "Een dier dat met een plons het water in gaat en zwemt met alleen de kop boven water.",
      "Groot, donkerbruin, met een stompe snuit, kleine oren en een behaarde staart."
    ] }
  ] },
{ id:"aardmuis", no:30, g:"Z", n:"Aardmuis", s:"Microtus agrestis", r:"BAL", l:15, zz:null, twin:null,
  h:["MOER","HALF"], a:["DAG","NACHT"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"veldmuis",
  t:"De veldmuis heeft een kortere, gladdere, meer geelbruine vacht en leeft in kort grasland, met veel open holletjes in plaats van paadjes door hoog gras.",
  cs:[
    { sl:{ i:3, t:"Paadjes met afgeknipte halmen en groene keutels in hoog, vochtig gras." }, bron:null, wn:[
      "Biesbosch, juni.",
      "Ruig, ongemaaid grasland.",
      "Hoog, dicht gras op een vochtige ondergrond.",
      "Paadjes met afgeknipte halmen en groene keutels van ±5 mm.",
      "Een ruige, grijsbruine vacht en een korte staart."
    ] },
    { bron:"Zodion, soortpagina aardmuis", sl:{ i:4, t:"De opvallend ruige, lange en donkere vacht, waarin deze woelmuis zich van de gladdere veldmuis onderscheidt." }, wn:[
      "Twente, maart. Een kapvlakte in een boswachterij, na de sneeuw.",
      "Een open plek vol pijpenstrootje en braam, met hier en daar een berk.",
      "Onder een dikke, platgedrukte laag oud gras dat net uit de sneeuw komt.",
      "Een netwerk van ondiepe gangetjes en paadjes over de grond, met kleine hoopjes afgeknipte halmen; een bosuil jaagt er elke avond.",
      "Een woelmuis met een lange, ruige en donkere vacht en een korte, tweekleurige staart."
    ] }
  ] },
{ id:"rosse-woelmuis", no:31, g:"Z", n:"Rosse woelmuis", s:"Clethrionomys glareolus", r:"BAL", l:15, zz:null, twin:null,
  h:["BOS"], a:["DAG","NACHT"], v:["PLANT"], b:["HOL"], w:["ACT"],
  x:"bosmuis",
  t:"De bosmuis heeft grote oren en ogen, een lange staart en springt. Bij hazelnoten laat ze tandsporen achter op het buitenoppervlak rond het gat.",
  cs:[
    { sl:{ i:3, t:"Geschilde braamscheuten en hazelnoten met een ruw gat zonder sporen op de buitenkant." }, bron:null, wn:[
      "Veluwe, mei.",
      "Een bosrand met een rijke ondergroei van braam.",
      "Een dikke strooisellaag en veel dood hout.",
      "Braamscheuten zonder bast; hazelnoten met een ruw gat, zonder sporen op de buitenkant.",
      "Een roodbruine rug."
    ] },
    { bron:"Zodion, soortpagina rosse woelmuis", sl:{ i:4, t:"Een roodbruine rug met grijze flanken: deze soort klimt ook in struiken." }, wn:[
      "Achterhoek, november. Een vochtige, grijze dag.",
      "Een houtwal met oude eiken, hulst en lijsterbes langs een weiland.",
      "Een gangetje onder een boomwortel, met een hoopje knaagsel ervoor.",
      "Overdag een klein knaagdier dat behendig in een struik klimt en bessen van de lijsterbes eet; afgeknaagde bast aan jonge twijgjes.",
      "Een knaagdiertje met een roodbruine rug, grijze flanken, kleine oren en een staart van zo'n halve lichaamslengte."
    ] }
  ] },
{ id:"gewone-bosspitsmuis", no:32, g:"Z", n:"Gewone bosspitsmuis", s:"Sorex araneus", r:"BAL", l:12, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT","DAG"], v:["ONG"], b:["GROND"], w:["ACT"],
  x:"huisspitsmuis",
  t:"De huisspitsmuis heeft witte tandpunten, grote, opvallende oren en lange, losse haren op de staart.",
  cs:[
    { sl:{ i:4, t:"Rode tandpunten en een driekleurige vacht." }, bron:null, wn:[
      "Twente, augustus.",
      "Heggen, houtwallen en bosranden.",
      "Een vochtige, dikke strooisellaag.",
      "Schelle piepjes uit het strooisel; een dood diertje dat door katten is laten liggen.",
      "Rode tandpunten en een driekleurige vacht."
    ] },
    { bron:"Zodion, soortpagina gewone bosspitsmuis", sl:{ i:3, t:"Schedeltjes met rode tandpunten: alleen roodtandspitsmuizen hebben die, en dit is de algemeenste." }, wn:[
      "Drenthe, februari. Een kerkuilkast in een schuur.",
      "Een akkerlandschap met houtwallen, slootkanten en ruige bermen.",
      "Op de bodem van de kast ligt een stapel glanzend zwarte braakballen.",
      "Uit de braakballen pluis je kleine schedeltjes met spitse snuiten en rood gekleurde tandpunten.",
      "Een donkerbruine rug, lichtere flanken en een grijswitte buik: drie kleuren."
    ] }
  ] },
{ id:"huisspitsmuis", no:33, g:"Z", n:"Huisspitsmuis", s:"Crocidura russula", r:"BAL", l:11, zz:null, twin:null,
  h:["BEB","HALF"], a:["NACHT"], v:["ONG"], b:["GROND"], w:["ACT"],
  x:"gewone-bosspitsmuis",
  t:"De bosspitsmuis heeft rode tandpunten, kleine oren die in de vacht wegvallen, en een driekleurige vacht.",
  cs:[
    { sl:{ i:3, t:"Jongen die in een treintje achter elkaar lopen en schedeltjes met witte tanden in braakballen." }, bron:null, wn:[
      "Achterhoek, oktober.",
      "Een boerenerf met moestuin en schuren.",
      "Warme composthopen en stapels hout.",
      "Jongen lopen in een treintje; in kerkuilbraakballen zitten schedeltjes met witte tanden.",
      "Grote oren en losse haren op de staart."
    ] },
    { bron:"Zodion, soortpagina huisspitsmuis", sl:{ i:4, t:"Witte tandpunten met losse, lange haren op de staart: een witandspitsmuis." }, wn:[
      "Zeeland, juli. Een warme avond op een oud boerenerf.",
      "Een groentetuin met composthopen, stenen muurtjes en een kas.",
      "Een warme, dampende composthoop naast een schuur.",
      "Een grijsbruin diertje dat in de compost naar pissebedden en wormen zoekt en luid tjirpt; de kat brengt er één binnen, maar eet het niet op.",
      "Witte tanden, opvallend grote oren en losse, lange haren op de staart."
    ] }
  ] },
{ id:"gewone-dwergvleermuis", no:34, g:"Z", n:"Gewone dwergvleermuis", s:"Pipistrellus pipistrellus", r:"HR", l:7, zz:null, twin:"ruige-dwergvleermuis",
  h:["BEB","HALF"], a:["NACHT"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"ruige-dwergvleermuis",
  t:"De ruige dwergvleermuis is iets groter, roept rond 38–40 kHz, en is vooral in de trektijd en bij water te vinden.",
  cs:[
    { sl:{ i:3, t:"Smakkende signalen met een piek rond 45 kHz en keutels onder een stootvoeg." }, bron:null, wn:[
      "Brabant, juni.",
      "Een nieuwbouwwijk met een stadspark en een vijver.",
      "Woningen met spouwmuren en open stootvoegen.",
      "Kleine, droge keutels onder een stootvoeg; detector: smakkende signalen, piek rond 45 kHz.",
      "Een heel kleine, donkere vleermuis."
    ] },
    { bron:"Zodion, soortpagina gewone dwergvleermuis", sl:{ i:3, t:"Een piek rond 45 kHz rond een lantaarnpaal in een woonwijk: hét vleermuisje van de bebouwde kom." }, wn:[
      "Utrecht, eind augustus. Kort na zonsondergang.",
      "Een straat met laanbomen, achtertuinen en een vijver in een plantsoen.",
      "Een rijtjeshuis met een kier achter een houten boeideel.",
      "Een klein vleermuisje dat rondjes jaagt rond een lantaarnpaal; uit een spleet komen schelle sociale roepen; detector: piek rond 45 kHz.",
      "Een heel klein, donkerbruin vleermuisje met korte, ronde oren."
    ] }
  ] },
{ id:"ruige-dwergvleermuis", no:35, g:"Z", n:"Ruige dwergvleermuis", s:"Pipistrellus nathusii", r:"HR", l:8, zz:null, twin:"gewone-dwergvleermuis",
  h:["MOER","BOS","STIL"], a:["NACHT"], v:["ONG"], b:["BOOM","GEB"], w:["TREK","SLAAP"],
  x:"gewone-dwergvleermuis",
  t:"De gewone dwergvleermuis is kleiner, roept rond 45 kHz, trekt niet en heeft grote kraamkolonies in woningen.",
  cs:[
    { sl:{ i:3, t:"Sociale roepen uit een kast en een piek rond 38 tot 40 kHz." }, bron:null, wn:[
      "Een veenplas, september.",
      "Moerasbos met els en wilg langs open water.",
      "Kasten en holtes in bomen langs de oever.",
      "Sociale roepen uit een kast; detector: piek rond 38–40 kHz.",
      "Een behaarde staartvlieghuid."
    ] },
    { bron:"Zodion, soortpagina ruige dwergvleermuis", sl:{ i:3, t:"Trek langs de kust in april met een piek rond 38 tot 40 kHz: deze soort trekt elk jaar honderden kilometers." }, wn:[
      "Noord-Holland, april. Langs de kust bij Petten.",
      "Een duinbos achter de zeereep, met een paar vijvers.",
      "Een vleermuiskast aan een den, waar alleen in het voor- en najaar dieren zitten.",
      "Dieren die in het voorjaar in rechte lijn langs de kust naar het noordoosten trekken; detector: piek rond 38 tot 40 kHz.",
      "Iets groter dan het gewone dwergje, met een ruige, lange vacht en een behaarde staartvlieghuid."
    ] }
  ] },
{ id:"rosse-vleermuis", no:36, g:"Z", n:"Rosse vleermuis", s:"Nyctalus noctula", r:"HR", l:13, zz:null, twin:null,
  h:["BOS","STIL"], a:["NACHT","SCHEMER"], v:["ONG"], b:["BOOM"], w:["SLAAP"],
  x:"laatvlieger",
  t:"De laatvlieger heeft brede vleugels, fladdert langzamer langs boomranden, roept rond 25–30 kHz en woont in gebouwen.",
  cs:[
    { sl:{ i:3, t:"Overdag gekwetter uit een spechtenhol en een 'plip-plop'-roep rond 20 kHz." }, bron:null, wn:[
      "Den Haag, mei.",
      "Een oud parkbos met grote beuken bij een vijver.",
      "Hoge spechtenholen in dikke stammen.",
      "Overdag gekwetter uit een hol; detector: ‘plip-plop’ rond 20 kHz.",
      "Smalle, puntige vleugels en een roodbruine vacht."
    ] },
    { bron:"Zodion, soortpagina rosse vleermuis", sl:{ i:3, t:"Snelle duikvluchten hoog boven water, al vóór het donker, met een plip-plop rond 20 kHz." }, wn:[
      "Friesland, augustus. Al vroeg in de avond, als het nog licht is.",
      "Een groot meer met een loofbos aan de oever.",
      "Een oude beuk met een paar spechtenholen hoog in de stam.",
      "Hoog boven het meer vliegen grote vleermuizen met snelle duikvluchten tussen de gierzwaluwen; detector: plip-plop rond 20 kHz.",
      "Groot, met smalle, puntige vleugels en een glanzend roodbruine vacht."
    ] }
  ] },
{ id:"meervleermuis", no:37, g:"Z", n:"Meervleermuis", s:"Myotis dasycneme", r:"HR", l:11, zz:null, twin:null,
  h:["STIL","STROOM"], a:["NACHT"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"watervleermuis",
  t:"De watervleermuis is kleiner, jaagt boven vijvers en smallere wateren, roept rond 45 kHz en heeft kraamkolonies in bomen.",
  cs:[
    { sl:{ i:3, t:"Een grote kolonie in een spouw en jagen laag boven brede vaarten met een piek rond 35 kHz." }, bron:null, wn:[
      "Friesland, juli.",
      "Open veenweide met brede vaarten en meren.",
      "Een dorp met oude woningen met spouwmuren, vlak bij het water.",
      "Een grote kolonie in een spouw; detector: piek rond 35 kHz, laag boven een vaart.",
      "Een grote Myotis met lange voeten."
    ] },
    { bron:"Zodion, soortpagina meervleermuis", sl:{ i:3, t:"Laag boven brede vaarten met een piek rond 35 kHz: groter en lager dan de watervleermuis." }, wn:[
      "Noord-Holland, juni. Een windstille, warme avond.",
      "Een groot meer met brede kanalen en rietoevers.",
      "Een oude kerk vlak bij het water, met honderden dieren op zolder.",
      "Grote vleermuizen die in lange, rechte banen laag boven het water jagen; detector: piek rond 35 kHz.",
      "Een grote Myotis met lange voeten en een vacht die van boven bruin en van onder grijswit is."
    ] }
  ] },
{ id:"franjestaart", no:38, g:"Z", n:"Franjestaart", s:"Myotis nattereri", r:"HR", l:8, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT"], v:["ONG"], b:["BOOM","GEB"], w:["SLAAP"],
  x:"watervleermuis",
  t:"De watervleermuis heeft geen haarrand langs de staartvlieghuid, maar grote voeten, en jaagt laag boven het water.",
  cs:[
    { sl:{ i:4, t:"Een rand van stijve haartjes langs de staartvlieghuid." }, bron:null, wn:[
      "Fort van de Waterlinie, januari.",
      "Grachten, bomen en bos rond het fort.",
      "Koele, vochtige ruimtes met kieren in de muren.",
      "Vleermuizen in winterslaap diep in kieren; in de zomer zitten ze in boomholtes.",
      "Een rand van stijve haartjes langs de staartvlieghuid."
    ] },
    { bron:"Zodion, soortpagina franjestaart", sl:{ i:3, t:"Langzaam fladderen en spinnen van de bladeren plukken: deze vleermuis gebruikt de franje van de staartvlieghuid om prooi op te scheppen." }, wn:[
      "Gelderland, juli. Een oud loofbos op een landgoed.",
      "Een eikenbos met een dichte struiklaag van hulst en hazelaar.",
      "Een vleermuiskast aan een eik langs een oude laan.",
      "Een vleermuis die langzaam en wendbaar tussen de struiken fladdert en spinnen van de bladeren plukt; detector: zachte, korte pulsen.",
      "Een middelgrote Myotis met lange oren, een lichte buik en een rand van stijve haartjes langs de staartvlieghuid."
    ] }
  ] },
{ id:"ingekorven-vleermuis", no:39, g:"Z", n:"Ingekorven vleermuis", s:"Myotis emarginatus", r:"HR", l:9, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"franjestaart",
  t:"De franjestaart heeft geen inkeping in het oor, maar een haarrand langs de staartvlieghuid. Zijn kolonies zitten verborgen in kieren, niet open aan de nok.",
  cs:[
    { sl:{ i:4, t:"Een inkeping in de buitenrand van het oor." }, bron:null, wn:[
      "Zuid-Limburg, juli.",
      "Een dorp tussen hoogstamboomgaarden, weilanden en hellingbos.",
      "Een warme kerkzolder, en koeienstallen vol vliegen.",
      "Een dichte tros open aan de nok, met resten van spinnen eronder.",
      "Een inkeping in de buitenrand van het oor."
    ] },
    { bron:"Zodion, soortpagina ingekorven vleermuis", sl:{ i:4, t:"De inkeping in de buitenrand van het oor, met een wollige, rossige vacht." }, wn:[
      "Zuid-Limburg, januari. In een mergelgroeve.",
      "Een groeve in een hellingbos, met een gangenstelsel van vele kilometers.",
      "Een koude, vochtige gang diep in de groeve, ver van de ingang.",
      "Dieren die open aan het plafond hangen in winterslaap, vaak bedekt met dauwdruppels; tellers zien er elk jaar meer.",
      "Een middelgrote Myotis met een wollige, rossige vacht en een inkeping in de buitenrand van het oor."
    ] }
  ] },
{ id:"tweekleurige-vleermuis", no:40, g:"Z", n:"Tweekleurige vleermuis", s:"Vespertilio murinus", r:"HR", l:11, zz:"ZZ", twin:null,
  h:["BEB","STIL"], a:["NACHT"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"laatvlieger",
  t:"De laatvlieger is groter, egaal donkerbruin zonder zilverige haarpunten, en heeft geen hoorbare baltszang.",
  cs:[
    { sl:{ i:4, t:"Zilvergrijze haarpunten op een donkere rug." }, bron:null, wn:[
      "Oost-Nederland, november.",
      "Een stadswijk met hoogbouw naast een grote plas.",
      "Hoge gebouwen met gevelbekleding en kieren.",
      "Een hoorbaar, hoog getsjirp rond de flat; detector: piek rond 25 kHz.",
      "Zilvergrijze haarpunten op een donkere rug."
    ] },
    { bron:"Zodion, soortpagina tweekleurige vleermuis", sl:{ i:4, t:"Een donkere rug met zilvergrijze haarpunten: die 'berijpte' vacht is uniek voor deze soort." }, wn:[
      "Rotterdam, december. Een koude week.",
      "Een woonwijk met hoge flats aan de rivier.",
      "Een kier achter de betonplaten hoog aan een flat.",
      "Een verdwaald diertje in een trappenhuis van een flat; bewoners brengen hem naar de vleermuisopvang.",
      "Middelgroot, met brede, korte oren, een witte buik en een donkere rug met zilvergrijze haarpunten."
    ] }
  ] },
{ id:"grijze-grootoorvleermuis", no:41, g:"Z", n:"Grijze grootoorvleermuis", s:"Plecotus austriacus", r:"HR", l:9, zz:"ZZ", twin:"gewone-grootoorvleermuis",
  h:["HALF","BEB"], a:["NACHT"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"gewone-grootoorvleermuis",
  t:"De gewone grootoor is bruiner, heeft een lichter gezicht en een duim van meer dan 6 mm, en komt in heel Nederland voor, vooral bij bos.",
  cs:[
    { sl:{ i:4, t:"Zeer lange oren, een donker gezicht en een duim korter dan 6 mm." }, bron:null, wn:[
      "Zuid-Limburg, juli.",
      "Open, agrarisch landschap met akkers en boomgaarden.",
      "Een dorpskerk met een rustige zolder.",
      "Losse vlindervleugels onder een balk; op de detector vrijwel niets.",
      "Zeer lange oren, een donker gezicht en een duim korter dan 6 mm."
    ] },
    { bron:"Zodion, soortpagina grijze grootoorvleermuis", sl:{ i:4, t:"Een donker gezicht en een duim korter dan 6 mm: het verschil met de gewone grootoorvleermuis." }, wn:[
      "Zuid-Limburg, januari. In een mergelgroeve aan de rand van het plateau.",
      "Een groeve tussen akkers en boomgaarden, ver van groot bos.",
      "Een koude, droge gang vlak bij de ingang.",
      "Een vleermuis in winterslaap met de lange oren onder de vleugels gevouwen; alleen het puntige oorklepje steekt uit.",
      "Een grijze vacht, een donker gezicht en een duim korter dan 6 mm."
    ] }
  ] },
{ id:"gewone-grootoorvleermuis", no:42, g:"Z", n:"Gewone grootoorvleermuis", s:"Plecotus auritus", r:"HR", l:9, zz:null, twin:"grijze-grootoorvleermuis",
  h:["BOS","HALF","BEB"], a:["NACHT"], v:["ONG"], b:["GEB","BOOM"], w:["SLAAP"],
  x:"grijze-grootoorvleermuis",
  t:"De grijze grootoor heeft een grijzere vacht, een donker gezichtsmasker en een duim korter dan 6 mm, en komt vooral in het zuiden voor.",
  cs:[
    { sl:{ i:4, t:"Zeer lange oren en een duim langer dan 6 mm." }, bron:null, wn:[
      "Drenthe, juli. Een esdorp aan de rand van een boswachterij.",
      "Een erf met oude eiken en lindes, dat overgaat in loofbos met een dichte struiklaag.",
      "Een rustige kerkzolder met houten balken en een kleine opening onder de dakrand.",
      "Onder één balk losse vlindervleugels; op de detector is bijna niets te horen.",
      "Zeer lange oren en een duim langer dan 6 mm."
    ] },
    { bron:"Zodion, soortpagina gewone grootoorvleermuis", sl:{ i:4, t:"Een licht gezicht en een duim langer dan 6 mm: het verschil met de grijze grootoorvleermuis." }, wn:[
      "Gelderland, januari. Een strenge vorstperiode.",
      "Een landgoed met oud loofbos en vijvers.",
      "Een ijskelder van baksteen, half onder de grond.",
      "Een vleermuis in winterslaap in een kier, met de lange oren onder de vleugels gevouwen; alleen het puntige oorklepje steekt uit.",
      "Een bruine vacht, een licht gezicht en een duim langer dan 6 mm."
    ] }
  ] },
{ id:"noordse-woelmuis", no:43, g:"Z", n:"Noordse woelmuis", s:"Microtus oeconomus", r:"HR", l:18, zz:"ZZ", twin:"aardmuis",
  h:["MOER"], a:["DAG","NACHT"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"aardmuis",
  t:"De aardmuis is iets kleiner, heeft een kortere staart en een ruigere, meer grijsbruine vacht. Hij leeft in vrijwel dezelfde habitat en verdringt de noordse woelmuis.",
  cs:[
    { sl:{ i:4, t:"Een donker knaagdiertje met een staart van ongeveer een derde van de lichaamslengte." }, bron:null, wn:[
      "Zuidwest-Friesland, mei. Laagveen langs een groot meer.",
      "Ruig rietland met zeggen en biezen, nauwelijks gemaaid.",
      "Lage, natte delen die bij hoog water onderlopen, met hogere pollen ertussen.",
      "Paadjes door de vegetatie, afgeknipte stukjes zegge en groene keutels van ±6 mm.",
      "Een donker knaagdiertje met een staart van ongeveer een derde van de lichaamslengte."
    ] },
    { bron:"Zodion, soortpagina noordse woelmuis; BIJ12", sl:{ i:2, t:"Pollen in een overstroomd rietland: deze relictsoort is een echte moerasbewoner en zwemt goed." }, wn:[
      "Friesland, november. Een periode met hoog water.",
      "Een groot rietland langs een meer in het laagveen.",
      "Hogere pollen van zegge en riet in een overstroomd rietland.",
      "Knaagdiertjes die zwemmend van pol naar pol gaan en zich op drijvend riet verschuilen; in de pollen nesten van fijn gras.",
      "Donkerbruin, groter dan een veldmuis, met een vrij lange staart."
    ] }
  ] },
{ id:"grijze-zeehond", no:44, g:"Z", n:"Grijze zeehond", s:"Halichoerus grypus", r:"BAL", l:220, zz:null, twin:null,
  h:["ZEE"], a:["DAG","NACHT"], v:["VIS"], b:["WATER"], w:["ACT"],
  x:"gewone-zeehond",
  t:"De gewone zeehond heeft een ronde ‘hondenkop’ met V-vormige neusgaten en jongt in juni–juli. Zijn jongen verliezen hun witte vacht al vóór de geboorte.",
  cs:[
    { sl:{ i:4, t:"Een langgerekte kop met parallelle neusgaten." }, bron:null, wn:[
      "Waddenzee, december. Bij een zeegat met sterke stroming.",
      "Hoge zandplaten die ook bij normaal hoogwater deels droog blijven.",
      "Rustige platen ver van vaargeulen, dicht bij open zee.",
      "Brede sleepsporen; een wollig, wit jong ligt alleen op de plaat.",
      "Langgerekte kop met parallelle neusgaten."
    ] },
    { bron:"Zodion, soortpagina grijze zeehond; Ecomare", sl:{ i:4, t:"Een lange kop met een Romeinse neus en parallelle neusgaten." }, wn:[
      "Waddenzee bij Vlieland, juli. Een heldere zomerdag.",
      "Een grote zandplaat aan de rand van het Vliestroom-zeegat.",
      "De hoge rand van de plaat, met diep water direct ernaast.",
      "Honderden dieren liggen bij laagwater op de plaat; enorme mannetjes van wel drie meter liggen apart en klinken als jammerend gezang.",
      "Een langgerekte kop met een 'Romeinse neus' en parallelle neusgaten; vaak gevlekt."
    ] }
  ] },
{ id:"zandhagedis", no:45, g:"R", n:"Zandhagedis", s:"Lacerta agilis", r:"HR", l:20, zz:null, twin:null,
  h:["HEI","DUIN"], a:["DAG"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"levendbarende-hagedis",
  t:"De levendbarende hagedis is slanker en bruiner, heeft geen witte oogvlekjes, en mannetjes hebben een oranje buik in plaats van groene flanken. Hij legt geen eieren.",
  cs:[
    { sl:{ i:4, t:"Groene flanken en rijen witte oogvlekjes over de rug: een mannetje in paarkleed." }, bron:null, wn:[
      "Drenthe, eind mei.",
      "Droge heide op zandgrond met struikhei en vliegdennen.",
      "Zuidgerichte randen met kale, open zandplekken.",
      "Kleine, schuine gangetjes in het zand en in juni gegraven kuiltjes.",
      "Groene flanken en rijen witte vlekjes over de rug."
    ] },
    { bron:"RAVON, soortpagina zandhagedis", sl:{ i:4, t:"Een gedrongen bouw met oogvlekken (donker met witte kern): de levendbarende hagedis is slanker en heeft die niet." }, wn:[
      "Kennemerduinen, eind augustus. Een warme middag.",
      "Open duinen met helm, duinroosje en duindoorn.",
      "Een zonnige, zandige helling op het zuiden met konijnenholen.",
      "Tientallen piepkleine, net uit het ei gekropen jongen schieten tussen de helmpollen weg.",
      "Gedrongen, met een korte kop en rijen donkere vlekken met een witte kern over rug en flanken."
    ] }
  ] },
{ id:"gladde-slang", no:46, g:"R", n:"Gladde slang", s:"Coronella austriaca", r:"HR", l:60, zz:null, twin:null,
  h:["HEI"], a:["DAG"], v:["GEW"], b:["GROND"], w:["SLAAP"],
  x:"adder",
  t:"De adder heeft een doorlopende zigzagband, een verticale spleetpupil en gekielde schubben.",
  cs:[
    { sl:{ i:3, t:"Een vervellingshuid met gladde schubben: de adder heeft gekielde schubben." }, bron:null, wn:[
      "Veluwe, september.",
      "Heide met struikhei en pijpenstrootje.",
      "Een structuurrijke overgang van heide naar bos, met veel hagedissen.",
      "Een vervellingshuid met gladde, niet gekielde schubben.",
      "Ronde pupil en een donkere streep door het oog."
    ] },
    { bron:"RAVON, soortpagina gladde slang", sl:{ i:4, t:"Een donkere kopvlek en rijen losse vlekjes in plaats van een zigzagband, met een ronde pupil." }, wn:[
      "Noord-Brabant, mei. Een zonnige ochtend na een koude nacht.",
      "Een heideterrein met vliegdennen, braam en hier en daar een houtwal.",
      "Onder een golfplaat die monitoringsvrijwilligers hebben neergelegd.",
      "Een dier dat zich stevig om je hand wikkelt en fel bijt, maar zonder gevolgen.",
      "Grijsbruin, met een donkere vlek op het achterhoofd, twee rijen kleine vlekjes over de rug en een ronde pupil."
    ] }
  ] },
{ id:"adder", no:47, g:"R", n:"Adder", s:"Vipera berus", r:"BAL", l:60, zz:null, twin:null,
  h:["HEI","MOER"], a:["DAG"], v:["GEW"], b:["GROND"], w:["SLAAP"],
  x:"gladde-slang",
  t:"De gladde slang heeft geen doorlopende zigzagband, maar een ronde pupil, gladde schubben en een donkere streep door het oog.",
  cs:[
    { sl:{ i:4, t:"Een verticale spleetpupil en een doorlopende zigzagband over de rug." }, bron:null, wn:[
      "Dwingelderveld, maart.",
      "Natte en droge heide met pijpenstrootje en dennenopslag.",
      "Een beschutte zuidrand die vroeg in het jaar al warm wordt.",
      "Meerdere slangen dicht bij elkaar in de zon; in april duwen twee slangen tegen elkaar.",
      "Verticale spleetpupil en een zigzagband."
    ] },
    { bron:"RAVON, soortpagina adder", sl:{ i:4, t:"Een rode iris met spleetpupil en een zigzagband: onze enige gifslang." }, wn:[
      "Fochteloërveen, eind augustus. Een broeierige dag.",
      "Hoogveen en natte heide met dopheide en pijpenstrootje.",
      "Een zonnige pol in de luwte van een berkenopslag.",
      "Een paar dikke, drachtige vrouwtjes liggen dicht bij elkaar te zonnen; een week later liggen er kleine, levend geboren jongen.",
      "Bruin met een donkere zigzag over de rug, een rode iris en een spleetpupil."
    ] }
  ] },
{ id:"ringslang", no:48, g:"R", n:"Ringslang", s:"Natrix helvetica", r:"BAL", l:90, zz:null, twin:null,
  h:["MOER","STIL"], a:["DAG"], v:["GEW","VIS"], b:["GROND"], w:["SLAAP"],
  x:"adder",
  t:"Ook een adder kan zwemmen, maar de ringslang heeft gele halvemaanvlekken in de nek, een ronde pupil en wordt veel groter.",
  cs:[
    { sl:{ i:3, t:"Eieren in een composthoop: de enige inheemse slang die eieren legt, en daarvoor broeiende hopen opzoekt." }, bron:null, wn:[
      "Vechtplassen, juli.",
      "Moerasbos, rietlanden en open water met veel kikkers.",
      "Bij een boerderij een grote mesthoop en composthopen.",
      "Lege, leerachtige eischalen in de composthoop; een slang zwemt met de kop boven water.",
      "Lichte halvemaanvlekken achter de kop."
    ] },
    { bron:"RAVON, soortpagina ringslang", sl:{ i:3, t:"Een stinkende vloeistof en schijndood: zo verdedigt deze slang zich, want bijten doet hij vrijwel nooit." }, wn:[
      "De Weerribben, april. Een zonnige, nog frisse ochtend.",
      "Rietland en moerasbos rond petgaten.",
      "Een droge rietbult aan de rand van een legakker.",
      "Een paar slangen zonnen opgerold; opgepakt verspreidt er één een stinkende vloeistof en doet daarna alsof hij dood is.",
      "Grijsgroen, met kleine zwarte vlekjes langs de flanken, een ronde pupil en twee gele vlekken achter de kop."
    ] }
  ] },
{ id:"hazelworm", no:49, g:"R", n:"Hazelworm", s:"Anguis fragilis", r:"BAL", l:40, zz:null, twin:null,
  h:["BOS","HEI","HALF"], a:["SCHEMER","DAG"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"gladde-slang",
  t:"Een slang kan zijn ogen niet sluiten en kan zijn staart niet afwerpen. De hazelworm heeft beweegbare oogleden en een stijve, glanzende bouw.",
  cs:[
    { sl:{ i:4, t:"Knipperen met de ogen: beweegbare oogleden hebben alleen hagedissen, geen slangen." }, bron:null, wn:[
      "Achterhoek, juni.",
      "Bosranden en ruige bermen.",
      "Een dikke strooisellaag, houtstapels en vochtige plekken na regen.",
      "Onder een plank iets glanzends en koperkleurigs, zonder poten; de staart breekt af.",
      "Het dier knippert met zijn ogen."
    ] },
    { bron:"RAVON, soortpagina hazelworm", sl:{ i:2, t:"Een vaste plek onder een dakpan of plank: deze pootloze hagedis kruipt graag onder warme voorwerpen." }, wn:[
      "Veluwe, september. Een zachte, regenachtige dag.",
      "Een tuin aan de bosrand, met een composthoop en stapels oude dakpannen.",
      "Onder een dakpan die al jaren in het gras ligt.",
      "Een groepje piepjonge dieren, glanzend goud van boven en zwart van onder, met een dun zwart streepje over de rug.",
      "Langgerekt en zonder poten, met gladde, glanzende schubben en geen zichtbare nek."
    ] }
  ] },
{ id:"levendbarende-hagedis", no:50, g:"R", n:"Levendbarende hagedis", s:"Zootoca vivipara", r:"BAL", l:15, zz:null, twin:null,
  h:["HEI","MOER"], a:["DAG"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"zandhagedis",
  t:"De zandhagedis is gedrongener, heeft rijen witte oogvlekjes op de rug en groene flanken bij de mannetjes in het voorjaar, en legt eieren in warm zand.",
  cs:[
    { sl:{ i:3, t:"Jongen zonder eieren: deze soort brengt levende jongen ter wereld." }, bron:null, wn:[
      "Drenthe, april.",
      "Hoogveenrestant met natte heide en veenmos.",
      "Pollen pijpenstrootje en een koel, vochtig microklimaat.",
      "In augustus piepkleine, zwarte jongen; nergens eieren te vinden.",
      "Een oranje buik met zwarte vlekjes."
    ] },
    { bron:"RAVON, soortpagina levendbarende hagedis", sl:{ i:3, t:"Het water in vluchten en zwemmen: deze soort leeft in natte heide en hoogveen en zwemt goed." }, wn:[
      "Brabantse Kempen, juli. Een zonnige ochtend na regen.",
      "Vochtige heide langs een ven, met dopheide en veenmos.",
      "Pollen pijpenstrootje vlak langs de waterkant.",
      "Een paar kleine, bruine reptielen zonnen op een pol; bij verstoring vluchten ze het water in en zwemmen weg.",
      "Klein en slank, bruin, met een smalle kop en een dunne donkere rugstreep."
    ] }
  ] },
{ id:"muurhagedis", no:51, g:"R", n:"Muurhagedis", s:"Podarcis muralis", r:"HR", l:20, zz:null, twin:null,
  h:["BEB"], a:["DAG"], v:["ONG"], b:["STEEN"], w:["SLAAP"],
  x:"zandhagedis",
  t:"De zandhagedis is gedrongener, leeft op zandgrond in heide en duinen en heeft rijen witte oogvlekjes in plaats van een netvormige tekening.",
  cs:[
    { sl:{ i:3, t:"Verticaal omhoog rennen en in de voegen van een muur verdwijnen." }, bron:null, wn:[
      "Zuid-Limburg, mei. Een oude binnenstad.",
      "Vestingmuren van natuursteen.",
      "Muren op het zuiden met veel voegen en kieren.",
      "Hagedissen schieten de voegen in en rennen verticaal omhoog.",
      "Een netvormige tekening en een platte kop."
    ] },
    { bron:"RAVON, soortpagina muurhagedis", sl:{ i:2, t:"Oude vestingmuren in Maastricht: de enige plek in Nederland waar deze soort van nature leeft." }, wn:[
      "Maastricht, september. Een warme nazomermiddag.",
      "Oude vestingwerken in een stadspark, met gazons en grachten.",
      "Een muurtop met klimop en losse stenen in de volle zon.",
      "Jonge dieren van dit jaar zonnen plat tegen de warme stenen; bij een schaduw verdwijnen ze bliksemsnel in een spleet.",
      "Slank, met een lange staart en een platte kop, bruin of grijs met een donkere zijband."
    ] }
  ] },
{ id:"kamsalamander", no:52, g:"A", n:"Kamsalamander", s:"Triturus cristatus", r:"HR", l:15, zz:null, twin:null,
  h:["STIL","HALF","BOS"], a:["NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"kleine-watersalamander",
  t:"De kleine watersalamander is kleiner (±9 cm), heeft een gladde huid, en bij het mannetje loopt de golvende kam door tot op de staart. De larven blijven dichter bij bodem en planten.",
  cs:[
    { sl:{ i:4, t:"Een wrattige, donkere huid en een oranje buik met grote zwarte vlekken." }, bron:null, wn:[
      "Twente, april.",
      "Kleinschalig landschap met houtwallen en grasland.",
      "Een zonnige, visloze poel vol waterplanten.",
      "Dubbelgevouwen blaadjes met lichte eitjes; larven zweven midden in het water.",
      "Een wrattige, donkere huid en een oranje buik met zwarte vlekken."
    ] },
    { bron:"RAVON, soortpagina kamsalamander", sl:{ i:3, t:"Een hoge, getande kam die bij de staartwortel onderbroken is, en een zilveren staartband." }, wn:[
      "Betuwe, juni. Een warme nacht.",
      "Een uiterwaard met kleiputten, meidoornhagen en grasland.",
      "Een oude kleiput met veel ondergedoken waterplanten, zonder vis.",
      "Met een zaklamp zie je grote salamanders met een hoge, getande rugkam die bij de staartwortel onderbroken is, en een zilverwitte band over de staart.",
      "Groot, tot 16 cm, zwartbruin met witte stippels op de flanken."
    ] }
  ] },
{ id:"boomkikker", no:53, g:"A", n:"Boomkikker", s:"Hyla arborea", r:"HR", l:4.5, zz:null, twin:null,
  h:["HALF","STIL"], a:["NACHT","SCHEMER"], v:["ONG"], b:["VEG","WATER"], w:["SLAAP"],
  x:"poelkikker",
  t:"Groene kikkers zitten aan de waterkant in plaats van hoog in struiken, missen de kleefschijfjes en kwaken met kwaakblazen aan de zijkant van de bek.",
  cs:[
    { sl:{ i:4, t:"Kleefschijfjes aan de tenen: geen andere inheemse soort klimt zo hoog." }, bron:null, wn:[
      "Achterhoek, mei.",
      "Coulisselandschap met bramenstruwelen.",
      "Ondiepe, zonbeschenen poelen zonder vis.",
      "Overdag dieren hoog in de bramen; ’s avonds een luid ‘kè-kè-kè’.",
      "Kleefschijfjes aan de tenen."
    ] },
    { bron:"RAVON, soortpagina boomkikker", sl:{ i:4, t:"Een donkere zijstreep op een fel groen lijf en schijfjes aan de tenen." }, wn:[
      "Zeeuws-Vlaanderen, augustus. Een warme, zonnige middag.",
      "Een kreek met braamstruweel en wilgen langs de oever.",
      "Grote bramenbladeren in de volle zon, op anderhalve meter hoogte.",
      "Kleine, fel groene kikkertjes zitten met ingetrokken poten te zonnen op de bladeren.",
      "Glad en fel groen, met een donkere streep van de neus tot de achterpoot en schijfjes aan de tenen."
    ] }
  ] },
{ id:"rugstreeppad", no:54, g:"A", n:"Rugstreeppad", s:"Epidalea calamita", r:"HR", l:7, zz:null, twin:null,
  h:["DUIN","HEI"], a:["NACHT"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"gewone-pad",
  t:"De gewone pad heeft geen gele rugstreep, springt of loopt langzaam, legt eisnoeren met twee tot vier rijen eitjes in diepere wateren en roept zacht.",
  cs:[
    { sl:{ i:4, t:"Een lichte streep over het midden van de rug." }, bron:null, wn:[
      "Bouwlocatie, mei.",
      "Opgespoten zand met nauwelijks vegetatie.",
      "Tijdelijke, ondiepe plassen die snel opwarmen.",
      "Eisnoeren in een kale plas; op een warme avond een luid geratel.",
      "Een lichte streep over het midden van de rug."
    ] },
    { bron:"RAVON, soortpagina rugstreeppad", sl:{ i:3, t:"Rennen als een muis: deze pad springt nauwelijks en heeft daarom korte achterpoten." }, wn:[
      "Texel, juli. Een warme, windstille nacht.",
      "Een jonge duinvallei met kaal zand en een paar lage plantjes.",
      "Een ondiepe plas die in de zomer bijna uitdroogt.",
      "Overdag ingegraven in het zand; 's nachts rent een dier als een muis over het zand, in plaats van te springen.",
      "Gedrongen en wrattig, met groengele ogen en een lichtgele streep over de rug."
    ] }
  ] },
{ id:"knoflookpad", no:55, g:"A", n:"Knoflookpad", s:"Pelobates fuscus", r:"HR", l:6, zz:"ZZ", twin:null,
  h:["OPEN","HEI"], a:["NACHT"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"gewone-pad",
  t:"De gewone pad heeft een horizontale pupil en geen hoornige graafschop, en zijn larven blijven klein en zwart.",
  cs:[
    { sl:{ i:3, t:"Zacht geklok onder water, alleen goed te horen met een hydrofoon." }, bron:null, wn:[
      "Noord-Brabant, april.",
      "Zandige akkers en een stuk heide.",
      "Een diepe, vegetatierijke poel naast losse, goed vergraafbare grond.",
      "Met een hydrofoon zacht geklok onder water; in juli zeer grote larven.",
      "Een verticale pupil en een hoornige graafschop."
    ] },
    { bron:"RAVON, soortpagina knoflookpad", sl:{ i:3, t:"Achterwaarts in het zand graven met een hoornige graafschop: daar komt de bijnaam 'zandschop' vandaan." }, wn:[
      "Twente, september. Een droge avond.",
      "Een akker met aardappels op losse, zandige grond, naast een poel.",
      "De rand van de akker, waar het zand rul en kaal is.",
      "Een dier dat zich met de hielen achterwaarts in het zand graaft en binnen een minuut verdwenen is; opgepakt ruikt het naar ui.",
      "Glad, grijsbruin met olijfgroene vlekken, met grote, uitpuilende ogen met een verticale pupil."
    ] }
  ] },
{ id:"geelbuikvuurpad", no:56, g:"A", n:"Geelbuikvuurpad", s:"Bombina variegata", r:"HR", l:4.5, zz:null, twin:null,
  h:["STIL","BOS"], a:["DAG","NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"vroedmeesterpad",
  t:"De vroedmeesterpad heeft een verticale pupil en geen felgekleurde buik, en het mannetje draagt de eieren mee.",
  cs:[
    { sl:{ i:4, t:"Een hartvormige pupil." }, bron:null, wn:[
      "Zuid-Limburg, juni.",
      "Een groeve en bospaden met kale, verdichte grond.",
      "Karrensporen en ondiepe plasjes vol regenwater.",
      "Losse eitjes in een modderig plasje; een zacht ‘oe… oe’.",
      "Een hartvormige pupil."
    ] },
    { bron:"RAVON, soortpagina geelbuikvuurpad", sl:{ i:3, t:"De 'onkenreflex': rug hol en poten omhoog om de felgele buik te tonen als waarschuwing." }, wn:[
      "Zuid-Limburg, augustus. Na een hevige onweersbui.",
      "Een groeve waar graafmachines rijden.",
      "Vers water van de bui in diepe bandensporen.",
      "Bij gevaar hol het dier de rug, steekt de poten omhoog en laat een felgele buik met zwarte vlekken zien.",
      "Klein, grijsbruin en wrattig, met een geel-zwart gevlekte buik."
    ] }
  ] },
{ id:"vroedmeesterpad", no:57, g:"A", n:"Vroedmeesterpad", s:"Alytes obstetricans", r:"HR", l:5, zz:null, twin:null,
  h:["HALF","BEB"], a:["NACHT"], v:["ONG"], b:["STEEN","GROND"], w:["SLAAP"],
  x:"geelbuikvuurpad",
  t:"De geelbuikvuurpad heeft een hartvormige pupil en een gele buik met zwarte vlekken, en legt losse eitjes in tijdelijke plasjes.",
  cs:[
    { sl:{ i:3, t:"Een mannetje dat de eisnoeren om zijn achterpoten draagt." }, bron:null, wn:[
      "Zuid-Limburg, juni.",
      "Een oude mergelgroeve met stenige hellingen.",
      "Een vijver bij een boerderij en droge muren vol kieren.",
      "’s Nachts een helder fluitje; een mannetje met eisnoeren om de achterpoten.",
      "Klein, grijsbruin, met een verticale pupil."
    ] },
    { bron:"RAVON, soortpagina vroedmeesterpad", sl:{ i:3, t:"Grote larven die laat in het jaar nog in de vijver zitten: bij deze soort overwinteren ze vaak in het water." }, wn:[
      "Zuid-Limburg, oktober. Een vochtige avond.",
      "Een dorp in het Geuldal met tuinen en stapelmuren.",
      "Een droge stapelmuur van mergelblokken naast een tuinvijver.",
      "Onder een losse steen een klein, gedrongen dier; in de vijver zwemmen nog grote larven die de winter in het water doorbrengen.",
      "Klein en grijsbruin, met een verticale pupil en een rij lichtere wratjes langs elke flank."
    ] }
  ] },
{ id:"heikikker", no:58, g:"A", n:"Heikikker", s:"Rana arvalis", r:"HR", l:6.5, zz:null, twin:null,
  h:["HEI","MOER"], a:["DAG","NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"bruine-kikker",
  t:"De bruine kikker heeft een stompere snuit, een kleine, zachte knobbel aan de achterpoot en vaak een gevlekte buik, en kleurt niet blauw.",
  cs:[
    { sl:{ i:4, t:"Een spitse snuit en een grote, harde knobbel aan de achterpoot." }, bron:null, wn:[
      "Drenthe, maart.",
      "Natte heide en hoogveenrestanten.",
      "Zure, voedselarme vennen met ondiepe, zonnige oevers.",
      "Eiklompen dicht bij elkaar; onder water een zacht ‘woeb-woeb’.",
      "Een spitse snuit en een grote, harde knobbel aan de achterpoot."
    ] },
    { bron:"RAVON, soortpagina heikikker", sl:{ i:4, t:"Een slank lijf met een spitse snuit: de bruine kikker is plomper en heeft een stompe snuit." }, wn:[
      "Engbertsdijksvenen, juni. Een warme dag.",
      "Hoogveen met dopheide, veenmos en berkenopslag.",
      "Een vochtige plek tussen de dopheide, een eind van het water.",
      "Een kikker springt weg tussen de dopheide; hij is roodbruin met een brede, lichte streep over de rug.",
      "Slank, met een spitse snuit en een donkere vlek achter het oog."
    ] }
  ] },
{ id:"vuursalamander", no:59, g:"A", n:"Vuursalamander", s:"Salamandra salamandra", r:"BAL", l:17, zz:null, twin:null,
  h:["BOS","STROOM"], a:["NACHT"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"alpenwatersalamander",
  t:"De alpenwatersalamander is kleiner, leeft in het voorjaar in het water, heeft een egaal oranje buik en geen gele vlekken op de rug.",
  cs:[
    { sl:{ i:4, t:"Zwart met gele vlekken." }, bron:null, wn:[
      "Zuid-Limburg, oktober, regennacht.",
      "Hellingbos van beuk en eik.",
      "Bronnetjes en koele, kleine bronbeken.",
      "Larven met een lichte vlek bij elke poot in de beek; nergens eieren.",
      "Zwart met gele vlekken."
    ] },
    { bron:"RAVON, soortpagina vuursalamander", sl:{ i:4, t:"Groot en zwart met gele vlekken en gifklieren achter de ogen." }, wn:[
      "Zuid-Limburg, april. Een regenachtige nacht.",
      "Een bronbos met hellingen vol varens en mos.",
      "Een bospad langs een bronbeek, nat van de regen.",
      "Dikke, glanzend zwarte amfibieën kruipen traag over het pad; een vrouwtje loopt naar het water.",
      "Groot, tot 20 cm, met opvallende gifklieren achter de ogen en grote gele vlekken."
    ] }
  ] },
{ id:"gewone-pad", no:60, g:"A", n:"Gewone pad", s:"Bufo bufo", r:"BAL", l:10, zz:null, twin:null,
  h:["BOS","HALF","BEB"], a:["NACHT"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"rugstreeppad",
  t:"De rugstreeppad heeft een gele rugstreep en korte achterpoten, rent in plaats van te springen, legt eisnoeren met één of twee rijen eitjes in ondiepe plassen zonder vis, en roept luid ratelend.",
  cs:[
    { sl:{ i:4, t:"Een koperkleurig oog met horizontale pupil." }, bron:null, wn:[
      "Gelderland, maart.",
      "Een bos met een weg erdoor en een vijver aan de overkant.",
      "Een diepe vijver met vis.",
      "Lange eisnoeren om waterplanten; langs de weg schermen met emmers.",
      "Een koperkleurig oog met horizontale pupil."
    ] },
    { bron:"RAVON, soortpagina gewone pad", sl:{ i:4, t:"Een wrattige huid met grote oorklieren en een oranjebruin oog, zonder rugstreep." }, wn:[
      "Amsterdam, augustus. Een warme avond.",
      "Een stadstuin met een schuurtje en een kelder.",
      "Een vochtige kelder waar een kelderraam altijd op een kier staat.",
      "Een groot, traag dier zit elke avond onder de buitenlamp en vangt slakken en kevers.",
      "Een droge, wrattige huid, grote schuine oorklieren en een oranjebruin oog."
    ] }
  ] },
{ id:"bruine-kikker", no:61, g:"A", n:"Bruine kikker", s:"Rana temporaria", r:"BAL", l:8, zz:null, twin:null,
  h:["HALF","BOS","STIL"], a:["NACHT","DAG"], v:["ONG"], b:["GROND","WATER"], w:["SLAAP"],
  x:"heikikker",
  t:"De heikikker heeft een spitse snuit en een grote, harde knobbel aan de achterpoot, leeft in zure, voedselarme wateren, en de mannetjes kleuren in de paartijd blauw.",
  cs:[
    { sl:{ i:4, t:"Een stompe snuit en een kleine, zachte knobbel aan de achterpoot." }, bron:null, wn:[
      "Utrecht, februari.",
      "Weilanden met slootjes, en tuinen.",
      "Ondiep, stilstaand water met ijs langs de randen.",
      "Grote eiklompen, de eerste van het jaar; onder water een zacht gegrom.",
      "Een stompe snuit en een kleine, zachte knobbel aan de achterpoot."
    ] },
    { bron:"RAVON, soortpagina bruine kikker", sl:{ i:4, t:"Een stompe snuit: het verschil met de spitssnuitige heikikker." }, wn:[
      "Salland, september. Een vochtige ochtend.",
      "Een hooiland met sloten en houtwallen.",
      "Hoog gras langs de slootkant, nat van de dauw.",
      "Overal springen jonge amfibieën van dit jaar door het gras weg, ver van het water.",
      "Bruin, met een stompe snuit en een donkere vlek achter het oog."
    ] }
  ] },
{ id:"kleine-watersalamander", no:62, g:"A", n:"Kleine watersalamander", s:"Lissotriton vulgaris", r:"BAL", l:9, zz:null, twin:null,
  h:["STIL","HALF"], a:["NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"kamsalamander",
  t:"De kamsalamander is groter (±15 cm), heeft een wrattige, donkere huid en een getande kam die bij de staartwortel onderbroken is.",
  cs:[
    { sl:{ i:4, t:"Een gestippelde keel." }, bron:null, wn:[
      "Haarlem, april.",
      "Tuinen in een woonwijk.",
      "Een tuinvijver zonder vis, met waterplanten.",
      "Dubbelgevouwen blaadjes met eitjes; een mannetje met een golvende kam.",
      "Een gestippelde keel."
    ] },
    { bron:"RAVON, soortpagina kleine watersalamander", sl:{ i:4, t:"Stippen op buik én keel: bij de vinpootsalamander is de keel ongevlekt." }, wn:[
      "Gelderland, oktober. Een vochtige dag.",
      "Een tuin met een vijver, een heg en bloembedden.",
      "Onder een stoeptegel in het gras, een eind van de vijver.",
      "Een klein dier met een droge, fluweelachtige bruine huid ligt opgerold onder de tegel.",
      "Een oranje buik met kleine zwarte stippen, ook op de keel."
    ] }
  ] },
{ id:"alpenwatersalamander", no:63, g:"A", n:"Alpenwatersalamander", s:"Ichthyosaura alpestris", r:"BAL", l:10, zz:null, twin:null,
  h:["BOS","STIL"], a:["NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"vinpootsalamander",
  t:"De vinpootsalamander is kleiner, heeft een lichte, ongevlekte keel en een lichtgeel tot oranje streepje op de buik; mannetjes hebben donkere zwemvliezen en een draadje aan de staartpunt.",
  cs:[
    { sl:{ i:4, t:"Een oranje buik zonder vlekken." }, bron:null, wn:[
      "Veluwe, april.",
      "Loofbos op de hogere zandgronden.",
      "Een koele, schaduwrijke bospoel zonder vis.",
      "Een mannetje met blauwe flanken; de dieren overwinteren in de bosbodem.",
      "Een oranje buik zonder vlekken."
    ] },
    { bron:"RAVON, soortpagina alpenwatersalamander", sl:{ i:4, t:"Een buik die volledig oranje is, zonder vlekken." }, wn:[
      "Achterhoek, mei. Een milde nacht.",
      "Een landgoedbos met eiken en beuken.",
      "Een kleine, beschaduwde poel tussen de beuken, met bladeren op de bodem.",
      "In het licht van een zaklamp vrouwtjes met een grijsblauw gemarmerde rug en mannetjes met een lage, gestippelde kam.",
      "Een egaal oranje buik."
    ] }
  ] },
{ id:"vinpootsalamander", no:64, g:"A", n:"Vinpootsalamander", s:"Lissotriton helveticus", r:"BAL", l:8, zz:null, twin:null,
  h:["HEI","BOS","STIL"], a:["NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"kleine-watersalamander",
  t:"De kleine watersalamander heeft een gestippelde keel; het mannetje heeft een hoge, golvende kam in plaats van een draadje aan de staart.",
  cs:[
    { sl:{ i:3, t:"Donkere achterpoten en een draadje aan de staartpunt bij het mannetje." }, bron:null, wn:[
      "De Kempen, april.",
      "Heide en bos op zandgrond.",
      "Een zuur, voedselarm ven met veenmos.",
      "Mannetjes met donkere achterpoten en een draadje aan de staartpunt.",
      "Een lichte, ongevlekte keel."
    ] },
    { bron:"RAVON, soortpagina vinpootsalamander", sl:{ i:3, t:"Zwemvliezen tussen de tenen van de achterpoten: daar komt de naam van deze salamander vandaan." }, wn:[
      "Veluwe, mei. Een zonnige middag.",
      "Een heideven omringd door bos.",
      "Ondiep, helder water met veenmos aan de oever.",
      "Mannetjes met zwemvliezen tussen de tenen van de achterpoten en een lage, rechte rugkam.",
      "Klein, met een bleke, ongevlekte keel."
    ] }
  ] },
{ id:"poelkikker", no:65, g:"A", n:"Poelkikker", s:"Pelophylax lessonae", r:"HR", l:7, zz:null, twin:"middelste-groene-kikker",
  h:["STIL","HEI"], a:["DAG"], v:["ONG"], b:["WATER"], w:["SLAAP"],
  x:"meerkikker",
  t:"De meerkikker is veel groter, heeft grijze kwaakblazen en een kleine knobbel aan de achterpoot, en overwintert in het water.",
  cs:[
    { sl:{ i:4, t:"Een grote, halvemaanvormige knobbel aan de achterpoot." }, bron:null, wn:[
      "Veluwe, mei.",
      "Heide en bos op voedselarme zandgrond.",
      "Een voedselarm ven met een zonnige oever.",
      "Een luid, snorrend koor met witte kwaakblazen; ’s winters niet in het water.",
      "Een grote, halvemaanvormige knobbel aan de achterpoot."
    ] },
    { bron:"RAVON, soortpagina poelkikker", sl:{ i:3, t:"Overwinteren op het land, ver van het water: de meerkikker overwintert juist in het water." }, wn:[
      "Drenthe, november. Een koude dag.",
      "Een bosrand naast een hoogveenrestant.",
      "Onder een rottende boomstronk, honderden meters van het water.",
      "Een kleine groene kikker in winterrust, ver van het water.",
      "Klein en groen, met korte achterpoten en een grote, harde hielknobbel."
    ] }
  ] },
{ id:"meerkikker", no:66, g:"A", n:"Meerkikker", s:"Pelophylax ridibundus", r:"BAL", l:11, zz:null, twin:null,
  h:["STIL","STROOM"], a:["DAG"], v:["ONG","GEW"], b:["WATER"], w:["SLAAP"],
  x:"poelkikker",
  t:"De poelkikker is kleiner, heeft witte kwaakblazen en een grote, halvemaanvormige knobbel aan de achterpoot, en overwintert op het land.",
  cs:[
    { sl:{ i:3, t:"Grijze kwaakblazen: bij de poelkikker zijn ze wit." }, bron:null, wn:[
      "Zuid-Holland, juni.",
      "Een polder met brede boezemwateren.",
      "Groot, open en voedselrijk water.",
      "Een luid geratel met grijze kwaakblazen; ’s winters op de bodem van het water.",
      "Groot, met een kleine knobbel aan de achterpoot."
    ] },
    { bron:"RAVON, soortpagina meerkikker", sl:{ i:4, t:"Groot en olijfgroen met een kleine hielknobbel: de grootste inheemse groene kikker." }, wn:[
      "Rivierengebied, augustus. Een hete middag.",
      "Een uiterwaard met grote plassen en rietkragen.",
      "Een brede oever met veel kroos.",
      "Grote kikkers zonnen op de oever en eten ook andere, kleinere kikkers.",
      "Groot, olijfgroen tot bruin, met een kleine hielknobbel en lange achterpoten."
    ] }
  ] },
{ id:"grote-modderkruiper", no:67, g:"F", n:"Grote modderkruiper", s:"Misgurnus fossilis", r:"BAL", l:25, zz:null, twin:null,
  h:["STIL","MOER"], a:["NACHT","SCHEMER"], v:["ONG"], b:["WATER"], w:["ACT"],
  x:"kleine-modderkruiper",
  t:"De kleine modderkruiper heeft zes korte baarddraden en een rij donkere vlekken langs de flank, en leeft op zandige bodems in helder water. Hij valt niet onder de soortenbescherming.",
  cs:[
    { sl:{ i:4, t:"Tien baarddraden rond de bek: de kleine modderkruiper heeft er zes." }, bron:null, wn:[
      "Zuid-Holland, juni. Een veenpolder.",
      "Kleine slootjes met krabbescheer en veel waterplanten.",
      "Een dikke laag organische modder en ’s zomers bijna geen zuurstof.",
      "Een positief eDNA-monster; diep in de modder kronkelt een langgerekte vis.",
      "Tien baarddraden."
    ] },
    { bron:"RAVON, soortpagina grote modderkruiper", sl:{ i:3, t:"Lucht happen en piepen: deze vis ademt ook via zijn darm en overleeft zo zuurstofloze bagger." }, wn:[
      "Noordwest-Overijssel, september. Het jaarlijkse slootschonen.",
      "Een veenweidepolder met smalle, verlandende sloten.",
      "Een hoop bagger die net met de maaikorf op de kant is gelegd.",
      "In de bagger spartelt een langgerekte vis die een zacht piepend geluid maakt; hij hapt lucht als hij weer in het water ligt.",
      "Tot 30 cm, geelbruin met donkere lengtestrepen."
    ] }
  ] },
{ id:"beekprik", no:68, g:"F", n:"Beekprik", s:"Lampetra planeri", r:"BAL", l:14, zz:null, twin:null,
  h:["STROOM"], a:["NACHT"], v:["PLANT"], b:["WATER"], w:["ACT"],
  x:"rivierprik",
  t:"De rivierprik trekt naar zee, wordt veel groter (±30–40 cm) en paait als volwassen dier in grotere rivieren. Hij valt niet onder de soortenbescherming van de Omgevingswet.",
  cs:[
    { sl:{ i:1, t:"Een koude sprengenbeek: deze soort leeft zijn hele leven in kleine beken, terwijl de rivierprik naar zee trekt." }, bron:null, wn:[
      "Veluwe, april.",
      "Een koude sprengenbeek onder een bladerdak.",
      "Grindbanken afgewisseld met slibrijke plekken.",
      "Kleine kuiltjes in het grind; in het slib blinde, wormachtige larven.",
      "Geen kaken, maar een zuigmond."
    ] },
    { bron:"RAVON, soortpagina beekprik", sl:{ i:4, t:"Zeven kieuwopeningen op een rij achter het oog, op een aalvormig lijf zonder kaken." }, wn:[
      "Twente, oktober. Een koele, heldere dag.",
      "Een kleine laaglandbeek met houtige oevers en bladpakketten.",
      "Een slibbank in de binnenbocht van een meander.",
      "In het gezeefde slib dunne, slijmerige larfjes, en een paar zilverige dieren die net van larve naar volwassen veranderen.",
      "Zo'n 15 cm, aalvormig, met zeven kieuwopeningen achter het oog."
    ] }
  ] },
{ id:"kwabaal", no:69, g:"F", n:"Kwabaal", s:"Lota lota", r:"BAL", l:45, zz:null, twin:null,
  h:["STROOM","STIL"], a:["NACHT"], v:["VIS","ONG"], b:["WATER"], w:["ACT"],
  x:"aal",
  t:"De aal heeft geen baarddraad en geen afzonderlijke rugvinnen: rug-, staart- en aarsvin lopen in één zoom door.",
  cs:[
    { sl:{ i:3, t:"Paaien in de koudste weken van de winter: uniek onder onze zoetwatervissen." }, bron:null, wn:[
      "IJssel, januari.",
      "Uiterwaarden met strangen en kribvakken.",
      "IJskoud, helder water; in het voorjaar ondergelopen graslanden.",
      "Overdag verscholen onder stenen; paai juist in de koudste weken.",
      "Eén baarddraad aan de kin."
    ] },
    { bron:"RAVON, soortpagina kwabaal", sl:{ i:4, t:"Eén baarddraad aan de kin en een lange tweede rugvin: de enige kabeljauwachtige in zoet water." }, wn:[
      "Drentsche Aa, april. Een zonnige dag na een natte winter.",
      "Een beekdal met hooilanden die in de winter onderlopen.",
      "Ondiep, met gras begroeid water dat langzaam wegzakt.",
      "Tussen het ondergelopen gras zwemmen piepkleine, donkere visjes.",
      "Een langgerekte vis met een lange tweede rugvin en één baarddraad aan de kin."
    ] }
  ] },
{ id:"elrits", no:70, g:"F", n:"Elrits", s:"Phoxinus phoxinus", r:"BAL", l:9, zz:null, twin:null,
  h:["STROOM"], a:["DAG"], v:["ONG"], b:["WATER"], w:["ACT"],
  x:"gestippelde-alver",
  t:"De gestippelde alver is hoger gebouwd en heeft een opvallende dubbele rij donkere stippen langs de zijlijn.",
  cs:[
    { sl:{ i:3, t:"Mannetjes met een rode buik: het paarkleed in het voorjaar." }, bron:null, wn:[
      "Zuid-Limburg, mei.",
      "Een ondiepe, schaduwrijke beek.",
      "Helder, zuurstofrijk water over grind.",
      "Scholen kleine visjes; mannetjes met een rode buik.",
      "Zeer fijne schubben en een donkere lengteband."
    ] },
    { bron:"RAVON, soortpagina elrits", sl:{ i:4, t:"Een rij donkere vlekken langs de flank met een gouden streep erboven, en zeer fijne schubben." }, wn:[
      "Achterhoek, augustus. Een warme dag met laag water.",
      "Een beek met snelstromende stukken en zandige kommen.",
      "Een ondiep grindbed vlak onder een stuw.",
      "Een school van tientallen kleine visjes staat bij de kant tegen de stroom in; bij verstoring schieten ze allemaal tegelijk weg.",
      "Klein, tot 10 cm, met een rij donkere vlekken langs de flank en een goudkleurige streep erboven."
    ] }
  ] },
{ id:"beekdonderpad", no:71, g:"F", n:"Beekdonderpad", s:"Cottus rhenanus", r:"BAL", l:12, zz:null, twin:"rivierdonderpad",
  h:["STROOM"], a:["NACHT"], v:["ONG"], b:["WATER"], w:["ACT"],
  x:"rivierdonderpad",
  t:"De rivierdonderpad lijkt sterk op de beekdonderpad, maar leeft in grote rivieren, kanalen en meren, vaak tussen stortsteen. Hij valt niet onder de soortenbescherming van de Omgevingswet.",
  cs:[
    { sl:{ i:1, t:"Een snelstromende beek in het heuvelland: de rivierdonderpad zit juist tussen de stortstenen van rivieren en meren." }, bron:null, wn:[
      "Zuid-Limburg, maart.",
      "Een snelstromende beek in het heuvelland.",
      "Een stenige bodem, stroomopwaarts van een stuw.",
      "Oranje eitjes onder een platte steen; de vis hipt over de bodem.",
      "Een brede, platte kop en waaiervormige borstvinnen."
    ] },
    { bron:"RAVON, soortpagina beekdonderpad", sl:{ i:1, t:"Een koude, kleine bovenloop: deze soort leeft niet in de grote rivieren." }, wn:[
      "Veluwe, augustus. Een warme nacht.",
      "Een koude sprengenbeek in een loofbos.",
      "Een stenige bodem met takken en wortels in de stroming.",
      "Met een zaklamp zie je een vis die roerloos op de bodem ligt en perfect opgaat in de stenen; hij zwemt in korte sprongetjes weg.",
      "Een plompe bodemvis zonder schubben, met een brede kop en grote, uitgespreide vinnen aan de zijkant."
    ] }
  ] },
{ id:"gestippelde-alver", no:72, g:"F", n:"Gestippelde alver", s:"Alburnoides bipunctatus", r:"BAL", l:12, zz:"ZZ", twin:null,
  h:["STROOM"], a:["DAG"], v:["ONG"], b:["WATER"], w:["ACT"],
  x:"elrits",
  t:"De elrits is ronder en kleiner, heeft zeer fijne schubben en een donkere lengteband, maar geen dubbele stippenrij langs de zijlijn.",
  cs:[
    { sl:{ i:4, t:"Een dubbele rij stippen langs de zijlijn." }, bron:null, wn:[
      "Zuid-Limburg, juni.",
      "Een snelstromende beek.",
      "Grindbanken afgewisseld met diepere kuilen.",
      "Een school zilverachtige visjes van ±10 cm boven grind.",
      "Een dubbele rij stippen langs de zijlijn."
    ] },
    { bron:"RAVON, soortpagina gestippelde alver", sl:{ i:4, t:"Een zijlijn met aan beide kanten een rij donkere puntjes." }, wn:[
      "Zuid-Limburg, mei. Een zonnige ochtend.",
      "De Geul, waar ze door het heuvelland meandert.",
      "Ondiepe, snelstromende grindbanken.",
      "Grote scholen staan dicht opeen boven het grind; mannetjes hebben kleine witte knobbeltjes op de kop.",
      "Zilverig, met een zijlijn die aan weerszijden door een rij donkere puntjes wordt begeleid."
    ] }
  ] },
{ id:"noordzeehouting", no:73, g:"F", n:"Noordzeehouting", s:"Coregonus oxyrinchus", r:"HR", l:40, zz:null, twin:null,
  h:["ZEE","STROOM","STIL"], a:["DAG"], v:["ONG"], b:["WATER"], w:["ACT"],
  x:"spiering",
  t:"De spiering is kleiner, heeft een grote bek met tanden en geen spitse, overhangende snuit, en ruikt naar komkommer.",
  cs:[
    { sl:{ i:4, t:"Een vetvin en een spitse snuit die over de bek hangt." }, bron:null, wn:[
      "Afsluitdijk, november.",
      "De overgang van zout Waddenwater naar het zoete IJsselmeer.",
      "De spuisluizen, waar zoet water naar zee stroomt.",
      "Zilverachtige vissen verzamelen zich om naar zoet water te trekken.",
      "Een kleine vetvin en een spitse, overhangende snuit."
    ] },
    { bron:"RAVON, soortpagina noordzeehouting", sl:{ i:4, t:"Een vetvin bij een zilverige trekvis met een overhangende snuit." }, wn:[
      "Haringvliet, april. Een heldere voorjaarsdag.",
      "Een groot zoetwaterbekken achter sluizen die op een kier staan.",
      "De sluisopening, waar zoet en zout water mengen.",
      "Jonge, zilverige vissen van een paar centimeter trekken met het spuiwater mee naar zee.",
      "Een zalmachtige met een vetvin en een stompe neus die over de bek steekt."
    ] }
  ] },
{ id:"steenuil", no:74, g:"B", n:"Steenuil", s:"Athene noctua", r:"VRJ", l:22, zz:null, twin:null,
  h:["HALF","OPEN"], a:["SCHEMER","NACHT"], v:["ONG","GEW"], b:["BOOM","GEB"], w:["ACT"],
  x:"kerkuil",
  t:"Kerkuilbraakballen zijn groter, zwart en glanzend, en bevatten complete muizenschedels. Die van de steenuil zijn klein, grijs en zitten vol insectenresten.",
  cs:[
    { bron:null, wn:[
      "Achterhoek, maart.",
      "Kleinschalig agrarisch landschap met erven.",
      "Hoogstamboomgaarden, knotwilgen en kort begraasde weides.",
      "Kleine braakballen met keverschildjes; in de schemering een klagend ‘kiew’.",
      "Gele ogen in een platte kop."
    ] }
  ] },
{ id:"gierzwaluw", no:75, g:"B", n:"Gierzwaluw", s:"Apus apus", r:"VRJ", l:17, zz:null, twin:null,
  h:["BEB"], a:["DAG"], v:["ONG"], b:["GEB"], w:["TREK"],
  x:"huiszwaluw",
  t:"De huiszwaluw heeft een witte stuit en buik, bouwt een zichtbaar modderkommetje onder de dakgoot en gaat wel op draden zitten.",
  cs:[
    { bron:null, wn:[
      "Haarlem, juni.",
      "Een binnenstad met oude bebouwing.",
      "Huizen van rond 1900 met pannendaken en gootlijsten.",
      "Gillende groepen scheren ’s avonds door de straten; aan de gevel is niets te zien.",
      "Sikkelvormige vleugels."
    ] }
  ] },
{ id:"kerkuil", no:76, g:"B", n:"Kerkuil", s:"Tyto alba", r:"VRJ", l:34, zz:null, twin:null,
  h:["OPEN","HALF"], a:["NACHT"], v:["GEW"], b:["GEB"], w:["ACT"],
  x:"bosuil",
  t:"Bosuilbraakballen zijn grijs, dof en brokkelig. De bosuil roept het bekende bibberende ‘hoe-hoe’ en broedt vooral in boomholtes.",
  cs:[
    { bron:null, wn:[
      "Friesland, augustus.",
      "Uitgestrekte graslanden met ruige slootkanten.",
      "Een boerderij met een rustige, open hooizolder.",
      "Grote, zwart glanzende braakballen met complete schedeltjes.",
      "Een hartvormige, witte sluier."
    ] }
  ] },
{ id:"ooievaar", no:77, g:"B", n:"Ooievaar", s:"Ciconia ciconia", r:"VRJ", l:100, zz:null, twin:null,
  h:["OPEN","MOER"], a:["DAG"], v:["GEW","ONG"], b:["GEB"], w:["TREK","ACT"],
  x:"blauwe-reiger",
  t:"De blauwe reiger vliegt met ingetrokken nek, is grijs, en broedt in kolonies hoog in bomen.",
  cs:[
    { bron:null, wn:[
      "Bij Arnhem, april.",
      "Uiterwaarden met natte graslanden.",
      "Poelen, plas-dras en een boerderij met een hoge paal.",
      "Witte vegen op de paal; snavelklepperen.",
      "Rode snavel en rode poten."
    ] }
  ] },
{ id:"ijsvogel", no:78, g:"B", n:"IJsvogel", s:"Alcedo atthis", r:"VR", l:17, zz:null, twin:null,
  h:["STROOM","STIL"], a:["DAG"], v:["VIS"], b:["HOL"], w:["ACT"],
  x:"oeverzwaluw",
  t:"Oeverzwaluwen graven in kolonie tientallen kleinere gaten bij elkaar, zonder vislucht of witte veeg uit de opening.",
  cs:[
    { bron:null, wn:[
      "Twente, februari.",
      "Een meanderende, visrijke beek.",
      "Steile, kale oeverwanden en overhangende takken.",
      "Een rond gat in de oeverwand dat naar vis ruikt; een hoog ‘tiet’.",
      "Een lange dolksnavel op een kleine vogel."
    ] }
  ] },
{ id:"roek", no:79, g:"B", n:"Roek", s:"Corvus frugilegus", r:"VRJ", l:46, zz:null, twin:null,
  h:["OPEN","BEB"], a:["DAG"], v:["ONG","PLANT"], b:["BOOM"], w:["ACT"],
  x:"zwarte-kraai",
  t:"De zwarte kraai heeft een volledig bevederde snavelbasis, broedt solitair en heeft geen ‘broekje’.",
  cs:[
    { bron:null, wn:[
      "Drenthe, maart.",
      "Een dorpsrand met grasland en akkers.",
      "Een rij hoge populieren langs een weg.",
      "Tientallen takkennesten bij elkaar en een kakofonie van schorre roepen.",
      "Een kale, grijswitte snavelbasis."
    ] }
  ] },
{ id:"oeverzwaluw", no:80, g:"B", n:"Oeverzwaluw", s:"Riparia riparia", r:"VR", l:12, zz:null, twin:null,
  h:["STIL","STROOM","OPEN"], a:["DAG"], v:["ONG"], b:["HOL"], w:["TREK"],
  x:"ijsvogel",
  t:"Een ijsvogelhol is groter, ligt alleen, en ruikt sterk naar vis; uit de opening loopt vaak een witte veeg.",
  cs:[
    { bron:null, wn:[
      "Noord-Limburg, mei.",
      "Een zandwinning met een grote plas.",
      "Een steile, kale zandwand die door afgraving steeds verschuift.",
      "Tientallen gaten vlak onder de rand; kleine vogels jagen laag boven het water.",
      "Een bruine borstband op een witte buik."
    ] }
  ] },
{ id:"slechtvalk", no:81, g:"B", n:"Slechtvalk", s:"Falco peregrinus", r:"VRJ", l:43, zz:null, twin:null,
  h:["BEB","ZEE"], a:["DAG"], v:["GEW"], b:["GEB"], w:["ACT"],
  x:"torenvalk",
  t:"De torenvalk is kleiner en roodbruin, bidt boven open terrein en jaagt op muizen in plaats van op vogels in de vlucht.",
  cs:[
    { bron:null, wn:[
      "Rotterdamse haven, maart.",
      "Industrie, met open water en slikken in de buurt.",
      "Hoge schoorstenen, koeltorens en masten.",
      "Plukresten van duiven en steltlopers op een richel; een steile duikvlucht.",
      "Een brede, zwarte baardstreep."
    ] }
  ] },
{ id:"ransuil", no:82, g:"B", n:"Ransuil", s:"Asio otus", r:"VRJ", l:36, zz:null, twin:null,
  h:["HALF","BOS","BEB"], a:["NACHT"], v:["GEW"], b:["BOOM"], w:["ACT"],
  x:"bosuil",
  t:"De bosuil heeft geen oorpluimen en donkere ogen, en roest niet in groepen.",
  cs:[
    { bron:null, wn:[
      "Groningen, januari.",
      "Een woonwijk aan de rand van open akkers.",
      "Een plantsoen met dichte coniferen naast een begraafplaats.",
      "Tientallen grijze braakballen met veldmuizen; overdag meerdere vogels in één boom.",
      "Lange oorpluimen en oranje ogen."
    ] }
  ] },
{ id:"huismus", no:83, g:"B", n:"Huismus", s:"Passer domesticus", r:"VRJ", l:15, zz:null, twin:null,
  h:["BEB"], a:["DAG"], v:["PLANT","ONG"], b:["GEB"], w:["ACT"],
  x:"spreeuw",
  t:"De spreeuw broedt ook onder dakpannen, maar is groter, zwart met een metaalglans en lichte stippen in de winter, en heeft een lange, spitse snavel.",
  cs:[
    { bron:null, wn:[
      "Leeuwarden, april.",
      "Een rijtjeswijk uit de jaren zestig.",
      "Dichte heggen, pannendaken en tuinen met kale plekjes.",
      "Stro onder de dakpannen, stofbaden en luid getjilp uit een haag.",
      "Een zwarte bef."
    ] }
  ] },
{ id:"oehoe", no:84, g:"B", n:"Oehoe", s:"Bubo bubo", r:"VRJ", l:65, zz:null, twin:null,
  h:["BOS"], a:["NACHT","SCHEMER"], v:["GEW"], b:["STEEN","GEB"], w:["ACT"],
  x:"ransuil",
  t:"De ransuil heeft ook oranje ogen en oorpluimen, maar is ruim de helft kleiner, broedt in oude kraaiennesten en eet vooral muizen.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, februari.",
      "Groot bos met hellingen.",
      "Een groeve met steile wanden en richels.",
      "Zeer grote braakballen met egelstekels; een diep, ver dragend roepen.",
      "Oranje ogen en oorpluimen, ±65 cm."
    ] }
  ] },
{ id:"buizerd", no:85, g:"B", n:"Buizerd", s:"Buteo buteo", r:"VRJ", l:53, zz:null, twin:null,
  h:["HALF","BOS"], a:["DAG"], v:["GEW"], b:["BOOM"], w:["ACT"],
  x:"wespendief",
  t:"De wespendief heeft een smallere, duifachtige kop, een langere staart met twee smalle banden bij de basis en één brede aan het eind, en is een zomergast die wespennesten uitgraaft.",
  cs:[
    { bron:null, wn:[
      "Gelderse Vallei, maart.",
      "Halfopen landschap met bosjes en houtwallen.",
      "Graslanden met paaltjes, en hoge eiken aan de bosrand.",
      "Een groot takkennest met verse twijgen; een miauwend ‘pieuw’.",
      "Breed en gedrongen, met een zeer variabel verenkleed."
    ] }
  ] },
{ id:"havik", no:86, g:"B", n:"Havik", s:"Astur gentilis", r:"VRJ", l:55, zz:null, twin:null,
  h:["BOS"], a:["DAG"], v:["GEW"], b:["BOOM"], w:["ACT"],
  x:"sperwer",
  t:"De sperwer is veel kleiner, slaat vooral zangvogels, heeft lange, dunne poten en jaagt ook in tuinen in de bebouwde kom.",
  cs:[
    { bron:null, wn:[
      "Utrechtse Heuvelrug, maart.",
      "Een groot, oud bos.",
      "Hoge douglassparren en grove dennen, met weinig verstoring.",
      "Een plukplaats met veren van houtduif en kraai; een kakelend ‘kjek-kjek’.",
      "Een witte wenkbrauwstreep en oranje ogen."
    ] }
  ] },
{ id:"sperwer", no:87, g:"B", n:"Sperwer", s:"Accipiter nisus", r:"VRJ", l:34, zz:null, twin:null,
  h:["BOS","BEB"], a:["DAG"], v:["GEW"], b:["BOOM"], w:["ACT"],
  x:"havik",
  t:"De havik is veel groter, heeft een witte wenkbrauwstreep en een fijner gebandeerde buik, en slaat duiven en kraaien in plaats van zangvogels.",
  cs:[
    { bron:null, wn:[
      "Amersfoort, januari.",
      "Een woonwijk met veel groen.",
      "Tuinen met voederplekken en een plantsoen met naaldbomen.",
      "Een plukplaats met mezenveertjes; een vogel schiet laag over een schutting.",
      "Korte, ronde vleugels en lange, dunne poten."
    ] }
  ] },
{ id:"wespendief", no:88, g:"B", n:"Wespendief", s:"Pernis apivorus", r:"VRJ", l:55, zz:null, twin:null,
  h:["BOS"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["TREK"],
  x:"buizerd",
  t:"De buizerd heeft een bredere kop en een kortere staart met veel fijne bandjes, blijft het hele jaar en jaagt vooral op muizen.",
  cs:[
    { bron:null, wn:[
      "Veluwe, juli.",
      "Een groot bos.",
      "Open plekken, bermen en heide met veel wespen.",
      "Opgegraven wespennesten; een nest bekleed met groen blad.",
      "Een smalle, duifachtige kop."
    ] }
  ] },
{ id:"boomvalk", no:89, g:"B", n:"Boomvalk", s:"Falco subbuteo", r:"VRJ", l:32, zz:null, twin:null,
  h:["HALF","MOER"], a:["DAG","SCHEMER"], v:["ONG","GEW"], b:["BOOM"], w:["TREK"],
  x:"slechtvalk",
  t:"De slechtvalk is groter en zwaarder, heeft een gebandeerde in plaats van gestreepte buik, geen rode broek, en broedt op gebouwen of richels.",
  cs:[
    { bron:null, wn:[
      "Overijssel, augustus.",
      "Laagveen met rietlanden en petgaten.",
      "Elzenbroek en bosranden met oude kraaiennesten.",
      "Libellen worden in de vlucht gevangen; in september is hij weg.",
      "Een rode ‘broek’."
    ] }
  ] },
{ id:"grote-gele-kwikstaart", no:90, g:"B", n:"Grote gele kwikstaart", s:"Motacilla cinerea", r:"VRJ", l:19, zz:null, twin:null,
  h:["STROOM"], a:["DAG"], v:["ONG"], b:["GEB","STEEN"], w:["ACT"],
  x:"witte-kwikstaart",
  t:"De witte kwikstaart is zwart-wit-grijs zonder geel en broedt in allerlei gebouwen, niet speciaal bij stromend water.",
  cs:[
    { bron:null, wn:[
      "Twente, april.",
      "Een snelstromende beek.",
      "Een watermolen en een stuw met oude muren.",
      "Een nestje in een nis boven het water; een scherp ‘tsi-tsit’.",
      "Gele onderkant en een grijze rug."
    ] }
  ] },
{ id:"bosuil", no:91, g:"B", n:"Bosuil", s:"Strix aluco", r:"VR", l:38, zz:null, twin:null,
  h:["BOS","BEB"], a:["NACHT"], v:["GEW"], b:["BOOM"], w:["ACT"],
  x:"ransuil",
  t:"De ransuil heeft lange oorpluimen en oranje ogen, broedt in oude kraaiennesten en roest ’s winters in groepen in coniferen.",
  cs:[
    { bron:null, wn:[
      "Bij Den Haag, december.",
      "Een landgoed met oude bomen.",
      "Holle beuken naast een begraafplaats.",
      "Grijze, doffe braakballen; ’s nachts een bibberend roepen.",
      "Donkere ogen en een ronde kop."
    ] }
  ] },
{ id:"torenvalk", no:92, g:"B", n:"Torenvalk", s:"Falco tinnunculus", r:"VR", l:34, zz:null, twin:null,
  h:["OPEN","BEB"], a:["DAG"], v:["GEW"], b:["GEB","BOOM"], w:["ACT"],
  x:"boomvalk",
  t:"De boomvalk bidt niet, jaagt op libellen en zwaluwen, heeft een leigrijze rug en een rode broek, en is een zomergast.",
  cs:[
    { bron:null, wn:[
      "Noord-Holland, mei.",
      "Open polder met weilanden.",
      "Wegbermen, slootkanten en een schuur met een kast.",
      "Braakballen met veldmuizen; een vogel hangt stil in de lucht.",
      "Een roodbruine rug met zwarte vlekjes."
    ] }
  ] },
{ id:"boerenzwaluw", no:93, g:"B", n:"Boerenzwaluw", s:"Hirundo rustica", r:"VR", l:18, zz:null, twin:null,
  h:["OPEN"], a:["DAG"], v:["ONG"], b:["GEB"], w:["TREK"],
  x:"huiszwaluw",
  t:"De huiszwaluw heeft een witte stuit en een kortere, minder diep gevorkte staart, en bouwt gesloten modderkommetjes aan de buitenkant van gebouwen.",
  cs:[
    { bron:null, wn:[
      "Friesland, juni.",
      "Graslanden en sloten bij een melkveebedrijf.",
      "Een open koeienstal met balken.",
      "Open modderkommetjes op de balken; vogels scheren laag over het gras.",
      "Lange staartpennen."
    ] }
  ] },
{ id:"huiszwaluw", no:94, g:"B", n:"Huiszwaluw", s:"Delichon urbicum", r:"VR", l:13, zz:null, twin:null,
  h:["BEB","OPEN"], a:["DAG"], v:["ONG"], b:["GEB"], w:["TREK"],
  x:"boerenzwaluw",
  t:"De boerenzwaluw heeft lange staartpennen en een roodbruine keel, en bouwt open nesten binnen in stallen en schuren.",
  cs:[
    { bron:null, wn:[
      "Overijssel, juni.",
      "Een dorp met een plas in de buurt.",
      "Woningen met overstekende dakgoten.",
      "Gesloten modderkommetjes onder de goot; vogels rapen modder bij de plas.",
      "Een witte stuit."
    ] }
  ] },
{ id:"blauwe-reiger", no:95, g:"B", n:"Blauwe reiger", s:"Ardea cinerea", r:"VR", l:95, zz:null, twin:null,
  h:["STIL","OPEN"], a:["DAG","SCHEMER"], v:["VIS","GEW"], b:["BOOM"], w:["ACT"],
  x:"ooievaar",
  t:"De ooievaar vliegt met gestrekte nek, is wit met zwarte slagpennen en een rode snavel, en broedt alleen of in kleine groepen op palen en daken.",
  cs:[
    { bron:null, wn:[
      "Noord-Holland, maart.",
      "Veenweide met veel sloten.",
      "Hoge bomen in een eendenkooi.",
      "Tientallen grote takkennesten met visresten eronder; een schor ‘kraak’.",
      "Een lange, gele snavel en een zwarte kuifveer."
    ] }
  ] },
{ id:"zwarte-specht", no:96, g:"B", n:"Zwarte specht", s:"Dryocopus martius", r:"VR", l:46, zz:null, twin:null,
  h:["BOS"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["ACT"],
  x:"groene-specht",
  t:"De groene specht is kleiner en groen met een gele stuit, foerageert vooral op de grond en maakt ronde, kleinere holen.",
  cs:[
    { bron:null, wn:[
      "Veluwe, februari.",
      "Een groot, oud bos.",
      "Oude beuken met gladde stammen en veel dood hout.",
      "Een groot, verticaal ovaal hol; uitgehakte stronken; een klagend ‘kliuu’.",
      "Geheel zwart, met een rode kruin."
    ] }
  ] },
{ id:"groene-specht", no:97, g:"B", n:"Groene specht", s:"Picus viridis", r:"VR", l:32, zz:null, twin:null,
  h:["HALF","BOS"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["ACT"],
  x:"zwarte-specht",
  t:"De zwarte specht is veel groter, helemaal zwart met een rode kruin, en hakt grote, ovale holen in beuken.",
  cs:[
    { bron:null, wn:[
      "Een landgoed, april.",
      "Parkachtig landschap.",
      "Grasvelden met veel mieren en oude bomen.",
      "Kegelvormige gaten in het gazon; een luid, lachend roepen.",
      "Een gele stuit."
    ] }
  ] },
{ id:"tapuit", no:98, g:"B", n:"Tapuit", s:"Oenanthe oenanthe", r:"VR", l:15, zz:null, twin:null,
  h:["DUIN"], a:["DAG"], v:["ONG"], b:["HOL"], w:["TREK"],
  x:"roodborsttapuit",
  t:"De roodborsttapuit broedt op de grond in de vegetatie, niet in holen, heeft geen witte stuit, en het mannetje heeft een zwarte kop en een oranjerode borst.",
  cs:[
    { bron:null, wn:[
      "Een Waddeneiland, mei.",
      "Grijze duinen met korte, mosrijke vegetatie.",
      "Veel konijnenholen in open zand.",
      "Een vogel duikt een konijnenhol in; buiginkjes op een paaltje.",
      "Een witte stuit met een zwarte ‘T’ op de staart."
    ] }
  ] },
{ id:"kievit", no:99, g:"B", n:"Kievit", s:"Vanellus vanellus", r:"VR", l:30, zz:null, twin:null,
  h:["OPEN"], a:["DAG","NACHT"], v:["ONG"], b:["GROND"], w:["ACT","TREK"],
  x:"grutto",
  t:"De grutto broedt in hoog, kruidenrijk grasland, heeft een lange, rechte snavel, lange poten en geen kuif.",
  cs:[
    { bron:null, wn:[
      "Friesland, april.",
      "Open grasland en akkers.",
      "Kale, net bewerkte akkers zonder bomen in de buurt.",
      "Een kuiltje met vier gevlekte eieren; een tuimelende baltsvlucht.",
      "Een lange, smalle kuif."
    ] }
  ] },
{ id:"spreeuw", no:100, g:"B", n:"Spreeuw", s:"Sturnus vulgaris", r:"VR", l:21, zz:null, twin:null,
  h:["BEB","OPEN"], a:["DAG"], v:["ONG","PLANT"], b:["BOOM","GEB"], w:["ACT"],
  x:"merel",
  t:"De merel is groter, heeft een langere staart, het mannetje is egaal zwart met een oranje snavel, en hij broedt in open nesten in struiken.",
  cs:[
    { bron:null, wn:[
      "Een wijk naast een polder, mei.",
      "Daken, tuinen en kort gras.",
      "Holtes onder dakpannen en in oude bomen.",
      "Rasperig gebedel onder een dakpan; in de herfst bewegende wolken.",
      "Lichte stippen op een glanzend zwart verenkleed."
    ] }
  ] },
{ id:"veldmuis", no:104, g:"Z", n:"Veldmuis", s:"Microtus arvalis", r:"BAL", l:13, zz:"A", twin:null,
  h:["OPEN"], a:["DAG","NACHT"], v:["PLANT"], b:["HOL"], w:["ACT"],
  x:"aardmuis",
  t:"De aardmuis heeft een langere, ruigere en donkerdere vacht en zit in vochtiger, ruiger gras. Zeker weten doe je het aan de kiezen: bij de aardmuis heeft de tweede bovenkies een extra lus.",
  cs:[
    { sl:{ i:3, t:"Torenvalken boven het land en talloze kleine schedels in braakballen: een veldmuizenplaag." }, bron:"Zodion, soortpagina veldmuis", wn:[
      "Groningen, oktober. Een droge nazomer is net voorbij.",
      "Een uitgestrekt grasland op klei met kort, intensief begraasd gras.",
      "Tientallen gaatjes in de zode, verbonden door kale, ingesleten looppaadjes.",
      "Overal hangen torenvalken en zitten buizerds op de paaltjes; in een braakbal vind je talloze kleine schedels.",
      "Klein en gedrongen, grijsbruin, met kleine oren in de vacht en een korte staart."
    ] },
    { bron:"Zodion, soortpagina veldmuis", sl:{ i:2, t:"Honderden holletjes met kale wisseltjes ertussen: een kolonie die bij een plaag het hele veld overneemt." }, wn:[
      "Flevoland, mei. Na een zachte winter.",
      "Een luzerneveld en grasdijken tussen grote akkers.",
      "Op de dijkhelling honderden holletjes van 2 tot 3 cm, met kale wisseltjes ertussen.",
      "Bij elk gaatje een hoopje afgeknipte halmen; blauwe kiekendieven en velduilen jagen er overdag.",
      "Klein en gedrongen, grijsbruin, met kleine oren in de vacht en een korte staart."
    ] }
  ] },
{ id:"mol", no:null, g:"Z", n:"Mol", s:"Talpa europaea", r:"NB", l:16, zz:null, twin:null,
  h:["OPEN","HALF"], a:["DAG","NACHT"], v:["ONG"], b:["HOL"], w:["ACT"] },
{ id:"bruine-rat", no:null, g:"Z", n:"Bruine rat", s:"Rattus norvegicus", r:"NB", l:40, zz:null, twin:null,
  h:["BEB","STIL"], a:["NACHT"], v:["PLANT","ONG","GEW"], b:["HOL"], w:["ACT"] },
{ id:"huismuis", no:null, g:"Z", n:"Huismuis", s:"Mus musculus", r:"NB", l:16, zz:null, twin:null,
  h:["BEB"], a:["NACHT"], v:["PLANT"], b:["GEB"], w:["ACT"] },
{ id:"muskusrat", no:null, g:"Z", n:"Muskusrat", s:"Ondatra zibethicus", r:"NB", l:55, zz:null, twin:null,
  h:["STIL","MOER"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["HOL"], w:["ACT"] },
{ id:"wasbeer", no:null, g:"Z", n:"Wasbeer", s:"Procyon lotor", r:"NB", l:80, zz:null, twin:null,
  h:["BOS","BEB"], a:["NACHT"], v:["ONG","PLANT","VIS"], b:["BOOM","GEB"], w:["ACT"] },
{ id:"gewone-baardvleermuis", no:101, g:"Z", n:"Gewone baardvleermuis", s:"Myotis mystacinus", r:"HR", l:8, zz:"Z", twin:null,
  h:["HALF","BEB","BOS"], a:["NACHT"], v:["ONG"], b:["GEB","BOOM"], w:["SLAAP"],
  x:"gewone-dwergvleermuis",
  t:"De gewone dwergvleermuis vliegt sneller en schokkeriger, roept rond 45 kHz en heeft een donkerbruine snuit. Een baardvleermuis roept met steile FM-pulsen (Myotis) en heeft een donker gezichtje met een puntige tragus.",
  cs:[
    { sl:{ i:4, t:"Een donkerbruin tot zwartig gezicht en oren met een lange, spitse tragus." }, bron:"Zodion, soortpagina gewone baardvleermuis", wn:[
      "Zuid-Limburg, september. Vlak na zonsondergang langs een holle weg.",
      "Een kleinschalig landschap met heggen, boomgaarden en een dorp met oude boerderijen.",
      "Een houten gevelbetimmering en een spleet achter een luik aan een schuur.",
      "Laag langs de heg patrouillerend; op de batdetector korte, steile FM-pulsen zonder duidelijke piek.",
      "Klein, met donkerbruin tot zwartig gezicht en oren, en een lange, spitse tragus."
    ] },
    { bron:"Zodion, soortpagina gewone baardvleermuis", sl:{ i:4, t:"Een donker gezicht met een baardje en een spits oorklepje: de kleinste Myotis van Nederland." }, wn:[
      "Zuid-Limburg, februari. In een kalksteengroeve.",
      "Een groeve in een hellingbos aan de rand van een dorp.",
      "Een koude gang met een vochtige wand vol kleine spleetjes.",
      "Een klein vleermuisje dat vrij aan de wand hangt in winterslaap; de vacht zit vol dauwdruppels.",
      "Klein, met een donker gezicht en donkere oren, een spits oorklepje en een 'baardje' van haren rond de mond."
    ] }
  ] },
{ id:"amerikaanse-brulkikker", no:null, g:"A", n:"Amerikaanse brulkikker", s:"Lithobates catesbeianus", r:"NB", l:15, zz:null, twin:null,
  h:["STIL"], a:["NACHT","DAG"], v:["GEW","ONG"], b:["WATER"], w:["SLAAP"] },
{ id:"roodwangschildpad", no:null, g:"R", n:"Roodwangschildpad", s:"Trachemys scripta", r:"NB", l:25, zz:null, twin:null,
  h:["STIL","BEB"], a:["DAG"], v:["ONG","PLANT"], b:["WATER"], w:["SLAAP"] },
{ id:"europese-steur", no:103, g:"F", n:"Europese steur", s:"Acipenser sturio", r:"HR", l:200, zz:"ZZ", twin:null,
  h:["STROOM","ZEE"], a:["NACHT","DAG"], v:["ONG"], b:["WATER"], w:["TREK"],
  x:"noordzeehouting",
  t:"De noordzeehouting heeft gewone schubben, een vetvin en een vlezige neuspunt, maar geen rijen beenplaten en geen baarddraden.",
  cs:[
    { sl:{ i:4, t:"Vier baarddraden voor een spitse snuit, rijen benige platen en een ongelijke staartvin." }, bron:"RAVON, soortpagina Europese steur; ARK Rewilding", wn:[
      "Biesbosch, augustus. Op een kade staan medewerkers met tanks op een aanhanger.",
      "Een zoetwatergetijdengebied met kreken en een brede rivierarm.",
      "Een zandige plaat in de stroming, waar het water bij eb snel uitloopt.",
      "Jonge vissen met een zendertje gaan één voor één het water in; ze zwemmen dicht over de bodem weg.",
      "Een spitse snuit met vier baarddraden ervoor, vijf rijen benige platen op het lijf en een ongelijke staartvin."
    ] },
    { bron:"RAVON, soortpagina Europese steur", sl:{ i:4, t:"Rijen benige schilden en een haaiachtige staartvin: een oervis die al miljoenen jaren zo uitziet." }, wn:[
      "Voordelta bij Zeeland, oktober. Een rustige dag op zee.",
      "Ondiepe kustzee met zandbanken.",
      "Het net van een garnalenkotter, vlak over de bodem gesleept.",
      "Tussen de garnalen een vis met een zendermerkje; de visser fotografeert hem en zet hem direct terug.",
      "Torpedovormig, zo'n halve meter, met een staart met een lange bovenpunt, als bij een haai, en rijen benige schilden op rug en flanken."
    ] }
  ] },
{ id:"kleine-modderkruiper", no:null, g:"F", n:"Kleine modderkruiper", s:"Cobitis taenia", r:"NB", l:10, zz:null, twin:null,
  h:["STIL","STROOM"], a:["NACHT"], v:["ONG"], b:["WATER"], w:["ACT"] },
{ id:"bittervoorn", no:null, g:"F", n:"Bittervoorn", s:"Rhodeus amarus", r:"NB", l:7, zz:null, twin:null,
  h:["STIL"], a:["DAG"], v:["PLANT","ONG"], b:["WATER"], w:["ACT"] },
{ id:"snoek", no:null, g:"F", n:"Snoek", s:"Esox lucius", r:"NB", l:80, zz:null, twin:null,
  h:["STIL","MOER"], a:["DAG","SCHEMER"], v:["VIS"], b:["WATER"], w:["ACT"] },
{ id:"aal", no:null, g:"F", n:"Aal", s:"Anguilla anguilla", r:"NB", l:70, zz:null, twin:null,
  h:["STIL","STROOM"], a:["NACHT"], v:["ONG","VIS"], b:["WATER"], w:["ACT"] },
{ id:"boomklever", no:106, g:"B", n:"Boomklever", s:"Sitta europaea", r:"VR", l:14, zz:"A", twin:null,
  h:["BOS","BEB"], a:["DAG"], v:["ONG","PLANT"], b:["BOOM"], w:["ACT"],
  x:"grote-bonte-specht",
  t:"Een specht steunt op zijn staart en klimt alleen omhoog. Deze vogel klimt ook kopje-onder naar beneden en metselt de opening van zijn nestholte met modder kleiner.",
  cs:[
    { bron:"Vogelbescherming, soortpagina boomklever", wn:[
      "Utrecht, januari. Een heldere, koude ochtend.",
      "Een landgoed met oude eiken en beuken.",
      "Een spechtenhol waarvan de opening met een rand opgedroogde modder is versmald.",
      "Een luid, fluitend ‘tuut-tuut-tuut’; beukennootjes zitten vastgeklemd in de schors.",
      "Blauwgrijs van boven, oranjebruin van onder, met een zwarte oogstreep; loopt kopje-onder langs de stam."
    ] }
  ] },
{ id:"kauw", no:107, g:"B", n:"Kauw", s:"Corvus monedula", r:"VR", l:34, zz:"A", twin:null,
  h:["BEB","HALF"], a:["DAG"], v:["ONG","PLANT"], b:["GEB","BOOM"], w:["ACT"],
  x:"roek",
  t:"De roek is groter, glanzend zwart met een kale, grijswitte snavelbasis en broedt in boomkolonies. Deze soort is kleiner, met een grijze nek en lichte ogen.",
  cs:[
    { bron:"Vogelbescherming, soortpagina kauw", wn:[
      "Deventer, december. Rond de schemering boven de binnenstad.",
      "Een oude stadskern met kerktorens en hoge daken.",
      "Schoorstenen en galmgaten van een toren, vol takjes.",
      "Honderden vogels die met een hoog, kort ‘kja’ naar een gezamenlijke slaapplaats vliegen.",
      "Klein en zwart, met een zilvergrijze achterhals en opvallend lichte ogen."
    ] }
  ] },
{ id:"zwarte-kraai", no:108, g:"B", n:"Zwarte kraai", s:"Corvus corone", r:"VR", l:47, zz:"A", twin:null,
  h:["OPEN","BEB","HALF"], a:["DAG"], v:["ONG","PLANT","GEW"], b:["BOOM"], w:["ACT"],
  x:"roek",
  t:"De roek heeft een kale, grijswitte snavelbasis, een ‘broekje’ van losse veren en broedt in kolonies. Deze soort heeft een bevederde snavelbasis en broedt in paren met een eigen territorium.",
  cs:[
    { bron:"Vogelbescherming, soortpagina zwarte kraai", wn:[
      "Friesland, november. Na een stormnacht.",
      "Open weidegebied met verspreide bomenrijen langs de boerderijen.",
      "Een los takkennest hoog in een solitaire es, al jaren in gebruik.",
      "Een paar dat samen een buizerd wegjaagt; een schor, herhaald ‘kraa’.",
      "Geheel zwart met een zware snavel waarvan de basis is bevederd."
    ] }
  ] },
{ id:"grauwe-gans", no:109, g:"B", n:"Grauwe gans", s:"Anser anser", r:"VR", l:80, zz:"A", twin:null,
  h:["MOER","OPEN","STIL"], a:["DAG"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"eidereend",
  t:"Een eidereend is een zee-eend die schelpdieren duikt, met een wigvormige kop en een man in zwart-wit. Deze soort graast in groepen op land en heeft een oranje snavel en roze poten.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina grauwe gans", wn:[
      "Zuid-Holland, december. Een grijze, windstille dag.",
      "Graslanden en oogstakkers langs een groot rietmoeras.",
      "Een ondergelopen perceel met plassen en afgegraasde graszode.",
      "Honderden grazende vogels; overal lange, groene keutels en een luid, rauw ‘ga-ga-ga’.",
      "Grijsbruin, groot, met een oranje snavel en vleeskleurige poten."
    ] }
  ] },
{ id:"tuimelaar", no:102, g:"Z", n:"Tuimelaar", s:"Tursiops truncatus", r:"HR", l:300, zz:"Z", twin:null,
  h:["ZEE"], a:["DAG","NACHT"], v:["VIS"], b:["WATER"], w:["ACT"],
  x:"bruinvis",
  t:"Een bruinvis is veel kleiner (tot 1,8 m), heeft een lage driehoekige rugvin, geen snavel, en zwemt meestal alleen of met z'n tweeën zonder te springen.",
  cs:[
    { sl:{ i:4, t:"Een korte, duidelijke snavel en een hoge, sikkelvormige rugvin." }, bron:"Zodion, soortpagina tuimelaar", wn:[
      "Waddenzee bij Den Helder, augustus. Vanaf de veerboot.",
      "Een diepe zeegeul tussen twee eilanden met sterke stroming.",
      "Vlak langs de boeg, waar de boot een golf opstuwt.",
      "Een groepje van zo'n tien dieren dat hoog uit het water springt en op de boeggolf meesurft.",
      "Grijs, tot drie meter lang, met een korte, duidelijke snavel en een hoge, sikkelvormige rugvin."
    ] },
    { bron:"Zodion, soortpagina tuimelaar", sl:{ i:4, t:"Een korte, duidelijke snavel en een hoge sikkelvin bij een dier van drie meter: geen bruinvis." }, wn:[
      "Noordzeekust bij Scheveningen, september. Vanaf de pier.",
      "Ondiepe kustzee met scholen haring en makreel.",
      "Een zone net achter de branding, op een paar honderd meter van het strand.",
      "Een groep van een stuk of twintig grote dieren die samen een school vissen opdrijven; ze springen helemaal uit het water.",
      "Groot en egaal leigekleurd, tot drie meter, met een korte, duidelijke snavel en een hoge, sikkelvormige rugvin."
    ] }
  ] },
{ id:"huiskat", no:null, g:"Z", n:"Huiskat", s:"Felis catus", r:"NB", l:75, zz:null, twin:null,
  h:["BEB","HALF"], a:["NACHT","SCHEMER"], v:["GEW"], b:["GEB"], w:["ACT"] },
{ id:"beverrat", no:null, g:"Z", n:"Beverrat", s:"Myocastor coypus", r:"NB", l:90, zz:null, twin:null,
  h:["STIL","MOER"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["HOL"], w:["ACT"] },
{ id:"middelste-groene-kikker", no:105, g:"A", n:"Middelste groene kikker", s:"Pelophylax kl. esculentus", r:"BAL", l:9, zz:"A", twin:"poelkikker",
  h:["STIL","MOER"], a:["DAG"], v:["ONG"], b:["WATER"], w:["SLAAP"],
  x:"meerkikker",
  t:"De meerkikker is groter, vaak olijfbruiner, heeft grijze tot donkere kwaakblazen en zit vooral in grote, voedselrijke wateren. Het tweelingsoortverschil met de poelkikker zit in de hielknobbel: bij de poelkikker groot en halfrond.",
  cs:[
    { sl:{ i:4, t:"Een middelgrote hielknobbel: tussen poel- en meerkikker in." }, bron:"RAVON, soortpagina middelste groene kikker", wn:[
      "Midden-Brabant, mei. Een warme middag.",
      "Een boerensloot en een poel in een weidegebied met houtwallen.",
      "Een zonnige oever met kroos en drijvende waterplanten.",
      "Luid gekwaak in koor; mannetjes met witte kwaakblazen naast de mondhoeken.",
      "Groen met donkere vlekken en een lichte rugstreep; middelgrote hielknobbel."
    ] },
    { bron:"RAVON, soortpagina middelste groene kikker", sl:{ i:4, t:"Kenmerken precies tussen poel- en meerkikker in: deze soort is een kruising tussen die twee." }, wn:[
      "Utrecht, augustus. Een warme dag.",
      "Een veenweidepolder met smalle sloten.",
      "Een slootkant met kroos en waterlelies.",
      "Groene kikkers op de oever die met een plons het water in springen.",
      "Groen met donkere vlekken, en kenmerken die precies tussen die van de poel- en meerkikker in liggen."
    ] }
  ] },
{ id:"rivierprik", no:null, g:"F", n:"Rivierprik", s:"Lampetra fluviatilis", r:"NB", l:35, zz:null, twin:null,
  h:["STROOM","ZEE"], a:["NACHT"], v:["GEW"], b:["WATER"], w:["ACT"] },
{ id:"rivierdonderpad", no:null, g:"F", n:"Rivierdonderpad", s:"Cottus perifretum", r:"NB", l:12, zz:null, twin:null,
  h:["STROOM","STIL"], a:["NACHT"], v:["ONG"], b:["WATER"], w:["ACT"] },
{ id:"spiering", no:null, g:"F", n:"Spiering", s:"Osmerus eperlanus", r:"NB", l:20, zz:null, twin:null,
  h:["STIL","ZEE"], a:["DAG"], v:["ONG","VIS"], b:["WATER"], w:["ACT"] },
{ id:"witte-kwikstaart", no:110, g:"B", n:"Witte kwikstaart", s:"Motacilla alba", r:"VR", l:18, zz:"A", twin:null,
  h:["BEB","OPEN"], a:["DAG"], v:["ONG"], b:["GEB","STEEN"], w:["ACT","TREK"],
  x:"grote-gele-kwikstaart",
  t:"De grote gele kwikstaart heeft een gele onderstaartdek en buik, een langere staart en zit bij stromend water. Deze soort is zwart-wit-grijs en zit overal waar kort gras of verharding is.",
  cs:[
    { bron:"Vogelbescherming, soortpagina witte kwikstaart", wn:[
      "Westland, oktober. Aan het eind van de middag.",
      "Een kassengebied met erven, parkeerterreinen en sloten.",
      "Een kasdak en de verlichte overkapping van een tankstation.",
      "Tientallen vogels die met een scherp ‘tsli-wiet’ binnenkomen en samen gaan slapen.",
      "Slank, grijs-wit-zwart, met een lange staart die voortdurend op en neer wipt."
    ] }
  ] },
{ id:"roodborsttapuit", no:111, g:"B", n:"Roodborsttapuit", s:"Saxicola rubicola", r:"VR", l:12, zz:"MA", twin:null,
  h:["HEI","DUIN","OPEN"], a:["DAG"], v:["ONG"], b:["VEG"], w:["ACT","TREK"],
  x:"tapuit",
  t:"De tapuit staat rechtop op de grond, heeft een witte stuit met een zwarte T op de staart en broedt in konijnenholen. Deze soort zit op toppen van struikjes en broedt op de grond in de vegetatie.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina roodborsttapuit", wn:[
      "Kempen, september. Na een koude nacht.",
      "Een heideterrein met verspreide brem en jonge berken.",
      "De hoogste top van een bremstruik langs een zandpad.",
      "Een droog ‘wiet-tek-tek’, alsof er twee steentjes tegen elkaar worden geslagen.",
      "Klein en gedrongen; een man met zwarte kop, witte halsvlek en oranjerode borst."
    ] }
  ] },
{ id:"grutto", no:112, g:"B", n:"Grutto", s:"Limosa limosa", r:"VR", l:40, zz:"MA", twin:null,
  h:["OPEN","MOER"], a:["DAG"], v:["ONG"], b:["GROND"], w:["TREK"],
  x:"kievit",
  t:"De kievit is kleiner, heeft een korte snavel en een kuif, en is groenig zwart met wit. Deze soort heeft lange poten en een lange, rechte snavel.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina grutto", wn:[
      "Friesland, juli. Het broedseizoen is net voorbij.",
      "Een ondiep plasdras-perceel naast kruidenrijk, laat gemaaid grasland.",
      "Een slikkige rand met ondiep water, waar honderden vogels samen staan.",
      "Een verzamelplaats voor de trek naar het zuiden; een luid ‘grut-to, grut-to’.",
      "Lange poten, een lange rechte snavel en in de vlucht een brede witte vleugelstreep."
    ] }
  ] },
{ id:"merel", no:113, g:"B", n:"Merel", s:"Turdus merula", r:"VR", l:25, zz:"A", twin:null,
  h:["BEB","BOS","HALF"], a:["DAG","SCHEMER"], v:["ONG","PLANT"], b:["VEG"], w:["ACT"],
  x:"spreeuw",
  t:"De spreeuw heeft lichte stippen, een korte staart en loopt kwiek in groepen. Deze soort is effen zwart (man) of donkerbruin (vrouw), wipt alleen over het gazon en woelt bladeren om.",
  cs:[
    { bron:"Vogelbescherming, soortpagina merel", wn:[
      "Amsterdam, december. In de schemering.",
      "Stadstuinen en een park met struikgewas.",
      "Een bladerdek onder een hulst vol rode bessen.",
      "Ritselend omgewoelde bladeren; een luid, opgewonden alarm ‘tsjak-tsjak-tsjak’.",
      "Een zwarte vogel met een oranjegele snavel en oogring."
    ] }
  ] },
{ id:"houtduif", no:114, g:"B", n:"Houtduif", s:"Columba palumbus", r:"VR", l:41, zz:"A", twin:null,
  h:["BEB","OPEN","BOS"], a:["DAG"], v:["PLANT"], b:["BOOM"], w:["ACT"],
  x:"kauw",
  t:"De kauw is zwart met een grijze nek en roept ‘kja’. Deze soort is blauwgrijs en roze, heeft witte halsvlekken en koert zacht.",
  cs:[
    { bron:"Vogelbescherming, soortpagina houtduif", wn:[
      "Zeeland, november. Een oogstakker na de herfstbewerking.",
      "Akkerland met bomenrijen en kleine bosjes.",
      "Een dunne, doorzichtige ‘vlonder’ van takjes in een conifeer.",
      "Grote groepen op een koolveld; het klapperen van vleugels bij het opvliegen en een zacht ‘roe-koe-koe’.",
      "Blauwgrijs, met een roze borst, witte halsvlek en in de vlucht een witte vleugelband."
    ] }
  ] },
{ id:"witsnuitdolfijn", no:115, g:"Z", n:"Witsnuitdolfijn", s:"Lagenorhynchus albirostris", r:"HR", l:270, zz:"Z", twin:null,
  h:["ZEE"], a:["DAG","NACHT"], v:["VIS"], b:["WATER"], w:["ACT"],
  x:"tuimelaar",
  t:"De tuimelaar is egaal grijs en zie je vaker dicht onder de kust. Deze soort heeft een korte witte snavel, een lichte vlek achter de rugvin en leeft vooral in de diepere, koudere Noordzee.",
  cs:[
    { sl:{ i:4, t:"Een korte, witte snavel en lichte flankvlekken." }, bron:"Zodion, soortpagina witsnuitdolfijn", wn:[
      "Kust van Texel, januari. Na een week met harde noordwestenwind.",
      "Een breed zandstrand aan de Noordzee.",
      "De vloedlijn, tussen aangespoeld zeewier en schelpen.",
      "Een groot, glad dier van ruim twee meter dat dood is aangespoeld; strandingsonderzoekers nemen monsters.",
      "Zwart met een lichte flank- en rugvlek, een hoge sikkelvormige rugvin en een korte, witte snavel."
    ] },
    { bron:"Zodion, soortpagina witsnuitdolfijn", sl:{ i:4, t:"Een korte, witte snavel en een lichte vlek achter de rugvin." }, wn:[
      "Doggersbank, juni. Ver uit de kust, vanaf een onderzoeksschip.",
      "Diep, koel en helder zeewater, ver van de kust.",
      "Een windmolenpark op volle zee, waar veel vis rond de funderingen zit.",
      "Een groep van zo'n tien krachtige dieren die rond het schip springen en een stuk meezwemmen.",
      "Zwart en wit, met een lichte vlek achter de rugvin en een korte, witte snavel."
    ] }
  ] },
{ id:"wolf", no:116, g:"Z", n:"Wolf", s:"Canis lupus", r:"BAL", l:150, zz:"Z", twin:null,
  h:["BOS","HEI","HALF"], a:["NACHT","SCHEMER"], v:["GEW"], b:["HOL"], w:["ACT"],
  x:"vos",
  t:"Vossenprenten zijn kleiner (ongeveer 5 cm lang) en lopen vaak in een licht zigzaggend spoor. Deze prenten zijn 9–11 cm lang en liggen in draf vrijwel op één rechte lijn.",
  cs:[
    { sl:{ i:4, t:"Een prent van zo'n 10 cm waarbij de twee middelste tenen ver naar voren staan." }, bron:"BIJ12, wolf in Nederland; Zodion, soortpagina wolf", wn:[
      "Noord-Veluwe, januari. Een dun laagje sneeuw.",
      "Een groot bosgebied met heide en stuifzand.",
      "Een zandweg die kilometers rechtdoor loopt door het bos.",
      "Een lang, kaarsrecht spoor van grote prenten; verderop een grote keutel vol haren en botsplinters van ree.",
      "Een prent van zo'n 10 cm met vier tenen en nagels; de twee middelste tenen staan ver naar voren."
    ] },
    { bron:"BIJ12, wolf in Nederland", sl:{ i:3, t:"Een huilkoor met piepende jongen: een roedel met welpen op een rendez-vousplek." }, wn:[
      "Drenthe, juli. Een warme, stille avond.",
      "Een groot bos- en heidegebied met vennen.",
      "Een open plek in het bos met platgetrapt gras, botten en speelgoed van gewei.",
      "Na zonsondergang een huilkoor van volwassen dieren en hoge, piepende stemmen van jongen; op een cameraval een groep van zes.",
      "Grijsbruin en hoogpotig, met lichte wangen, een donkere zadelvlek en een staart die recht naar beneden hangt."
    ] }
  ] },
{ id:"zwarte-wouw", no:117, g:"B", n:"Zwarte wouw", s:"Milvus migrans", r:"VRJ", l:55, zz:"ZZ", twin:null,
  h:["HALF","STROOM","BOS"], a:["DAG"], v:["GEW","VIS"], b:["BOOM"], w:["TREK"],
  x:"buizerd",
  t:"De buizerd heeft een korte, ronde staart, een gedrongen bouw en cirkelt met iets opgetrokken vleugels. Deze soort heeft een ondiep gevorkte staart die hij voortdurend draait.",
  cs:[
    { bron:"Sovon, zeldzame broedvogels; Vogelbescherming, soortpagina zwarte wouw", wn:[
      "Noord-Limburg, mei. Vlak bij de grensmaas.",
      "Een rivierdal met uiterwaarden, grindplassen en populierenbosjes.",
      "Een oud nest in een populier aan de bosrand, aangekleed met plastic en lappen.",
      "Een roofvogel die laag boven het water dode vis oppikt; een hoog, trillend ‘pie-ie-ie’.",
      "Donkerbruin, met lange vleugels en een ondiep gevorkte staart die hij steeds bijdraait."
    ] }
  ] },
{ id:"bonte-vliegenvanger", no:118, g:"B", n:"Bonte vliegenvanger", s:"Ficedula hypoleuca", r:"VR", l:13, zz:"MA", twin:null,
  h:["BOS"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["TREK"],
  x:"grauwe-vliegenvanger",
  t:"De grauwe vliegenvanger is grijsbruin met een gestreepte kruin en broedt in een halfopen nis. Deze soort is (bij de man) zwart-wit en broedt in een holte of nestkast met een rond gat.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina bonte vliegenvanger", wn:[
      "Veluwe, mei. Een zonnige ochtend in het voorjaar.",
      "Een oud eikenbos met weinig ondergroei.",
      "Een nestkast met een rond invlieggat aan een eik.",
      "Een hoog, ritmisch liedje ‘wie-tie-wie-tie’ en een vogel die vanaf een tak insecten in de lucht vangt.",
      "Klein; de man zwart-wit met een witte vleugelvlek en een wit vlekje op het voorhoofd."
    ] }
  ] },
{ id:"boomkruiper", no:119, g:"B", n:"Boomkruiper", s:"Certhia brachydactyla", r:"VR", l:12, zz:"A", twin:"kortsnavelboomkruiper",
  h:["BOS","BEB","HALF"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["ACT"],
  x:"boomklever",
  t:"De boomklever klimt ook kopje-onder, is blauwgrijs met oranje en heeft een rechte snavel. Deze soort klimt alleen spiraalsgewijs omhoog en heeft een dunne, gebogen snavel.",
  cs:[
    { bron:"Vogelbescherming, soortpagina boomkruiper", wn:[
      "Gelderland, februari. In een stadspark.",
      "Een park met oude eiken en platanen.",
      "Een losse schorsflap waarachter takjes en veertjes zitten.",
      "Een hoog, ijl liedje ‘tie-tie-tietere-tiet’; een vogel die als een muisje omhoog langs de stam schuift.",
      "Bruin gestreept van boven, vuilwit van onder, met een dunne, gebogen snavel en stijve staartveren."
    ] }
  ] },
{ id:"kortsnavelboomkruiper", no:120, g:"B", n:"Kortsnavelboomkruiper", s:"Certhia familiaris", r:"VR", l:12, zz:"Z", twin:"boomkruiper",
  h:["BOS"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["ACT"],
  x:"boomklever",
  t:"De boomklever klimt ook kopje-onder, is blauwgrijs met oranje en heeft een rechte snavel. Deze soort klimt alleen spiraalsgewijs omhoog en heeft een dunne, gebogen snavel.",
  cs:[
    { bron:"Sovon, soortpagina kortsnavelboomkruiper", wn:[
      "Twente, maart. Vlak bij de Duitse grens.",
      "Een oud, koel naaldbos met sparren en lariksen, afgewisseld met beuken.",
      "Een losgeraakte schorsflap aan een dode spar.",
      "Een snel, dalend liedje dat eindigt in een triller, anders dan bij zijn algemene evenbeeld.",
      "Bruin gestreept van boven, zuiver wit van onder, met een iets kortere snavel en een witte wenkbrauwstreep."
    ] }
  ] },
{ id:"brilduiker", no:121, g:"B", n:"Brilduiker", s:"Bucephala clangula", r:"VR", l:45, zz:"MA", twin:null,
  h:["STIL","ZEE"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["ACT","TREK"],
  x:"eidereend",
  t:"De eidereend is groter, heeft een wigvormige kop zonder ronde wangvlek en zit vooral op zee en in de Waddenzee. Deze soort heeft een driehoekige kop en (bij de man) een ronde witte vlek voor het oog.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina brilduiker", wn:[
      "IJsselmeer, januari. Het is ijzig koud.",
      "Een groot zoet meer met dijken en luwe havens.",
      "Een kom achter een strekdam, waar groepjes eenden telkens wegduiken.",
      "Een man die zijn kop ver naar achteren gooit bij de balts; zingende vleugels bij het opvliegen.",
      "Een zwarte, driehoekige kop met een ronde witte vlek tussen snavel en geel oog."
    ] }
  ] },
{ id:"draaihals", no:122, g:"B", n:"Draaihals", s:"Jynx torquilla", r:"VR", l:17, zz:"Z", twin:null,
  h:["HEI","HALF","BOS"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["TREK"],
  x:"groene-specht",
  t:"De groene specht is groter, groen met een rode kruin en hakt zelf holen. Deze soort is grijsbruin gevlekt als boomschors en gebruikt bestaande holtes of nestkasten.",
  cs:[
    { bron:"Sovon en Vogelbescherming, soortpagina draaihals", wn:[
      "Veluwe, mei. Een warme, windstille dag.",
      "Een heideterrein met stuifzand, verspreide oude eiken en dennen.",
      "Een oud spechtenhol in een dode berk aan de rand van een open vlakte.",
      "Een klaaglijk, herhaald ‘kjie-kjie-kjie’; een vogel die op de grond mieren uit een mierenhoop likt.",
      "Grijsbruin gevlekt als schors, met een donkere streep over kruin en rug; draait bij gevaar zijn kop als een slang."
    ] }
  ] },
{ id:"eidereend", no:123, g:"B", n:"Eidereend", s:"Somateria mollissima", r:"VR", l:60, zz:"MA", twin:null,
  h:["ZEE"], a:["DAG"], v:["ONG"], b:["VEG"], w:["ACT"],
  x:"brilduiker",
  t:"De brilduiker is kleiner, heeft een driehoekige kop met een ronde witte wangvlek en zit vooral op zoete meren. Deze soort heeft een wigvormige kop waarbij de snavel doorloopt in het voorhoofd.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina eidereend", wn:[
      "Waddenzee bij Vlieland, december.",
      "Getijdengeulen en wadplaten achter een eiland.",
      "Een mosselbank die bij laagwater droogvalt.",
      "Grote groepen duikende eenden en een zacht, verbaasd ‘ahoo’ van de mannetjes.",
      "Een zware eend met een wigvormige kop; de man wit en zwart met een groene nekvlek."
    ] }
  ] },
{ id:"ekster", no:124, g:"B", n:"Ekster", s:"Pica pica", r:"VR", l:45, zz:"A", twin:null,
  h:["HALF","BEB","OPEN"], a:["DAG"], v:["ONG","PLANT","GEW"], b:["BOOM"], w:["ACT"],
  x:"kauw",
  t:"De kauw is helemaal zwart met een grijze nek en een korte staart. Deze soort is zwart-wit met een lange, groenglanzende staart en bouwt een overkapt takkennest.",
  cs:[
    { bron:"Vogelbescherming, soortpagina ekster", wn:[
      "Noord-Brabant, februari. Langs een provinciale weg.",
      "Een dorpsrand met erven, weilanden en meidoornhagen.",
      "Een groot, bolvormig takkennest met een dak, hoog in een meidoorn.",
      "Een ratelend ‘tsjak-tsjak-tsjak’ en een vogel die verkeersslachtoffers afloopt.",
      "Zwart-wit, met een lange staart die in het licht groen en paars glanst."
    ] }
  ] },
{ id:"gekraagde-roodstaart", no:125, g:"B", n:"Gekraagde roodstaart", s:"Phoenicurus phoenicurus", r:"VR", l:14, zz:"MA", twin:null,
  h:["BOS","HALF","HEI"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["TREK"],
  x:"zwarte-roodstaart",
  t:"De zwarte roodstaart is (bij de man) roetzwart zonder oranje borst en broedt aan gebouwen. Deze soort heeft een oranje borst, een witte voorhoofdsband en broedt in boomholtes.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina gekraagde roodstaart", wn:[
      "Drenthe, mei. Vroeg in de ochtend.",
      "Een open, oud eiken-berkenbos aan de rand van de heide.",
      "Een natuurlijke holte in een oude eik met weinig ondergroei eromheen.",
      "Een melancholiek liedje dat begint met ‘hu-ie-tuk-tuk’; een staart die voortdurend trilt.",
      "De man heeft een zwarte keel, oranje borst, witte voorhoofdsband en een roestrode staart."
    ] }
  ] },
{ id:"glanskop", no:126, g:"B", n:"Glanskop", s:"Poecile palustris", r:"VR", l:12, zz:"MA", twin:null,
  h:["BOS"], a:["DAG"], v:["ONG","PLANT"], b:["BOOM"], w:["ACT"],
  x:"zwarte-mees",
  t:"De zwarte mees heeft een witte nekvlek en twee witte vleugelstreepjes en houdt van naaldbos. Deze soort heeft een glanzend zwart kapje, een klein zwart befje en geen vleugelstreepjes.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina glanskop", wn:[
      "Zuid-Limburg, december. Een vochtig hellingbos.",
      "Een oud loofbos met eiken, beuken en hazelaar.",
      "Een kleine, bestaande holte laag in een rotte stam.",
      "Een explosief ‘pitsjoe’; een vogel die zaadjes één voor één verstopt in schorsspleten.",
      "Grijsbruin, met een glanzend zwart kapje en een klein zwart befje."
    ] }
  ] },
{ id:"grauwe-vliegenvanger", no:127, g:"B", n:"Grauwe vliegenvanger", s:"Muscicapa striata", r:"VR", l:14, zz:"MA", twin:null,
  h:["HALF","BEB","BOS"], a:["DAG"], v:["ONG"], b:["BOOM","GEB"], w:["TREK"],
  x:"bonte-vliegenvanger",
  t:"De bonte vliegenvanger is (bij de man) zwart-wit en broedt in een gesloten holte of nestkast met rond gat. Deze soort is grijsbruin, gestreept op de kruin en broedt in een half-open nis.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina grauwe vliegenvanger", wn:[
      "Achterhoek, juni. Rond de middag.",
      "Een oude boerderijtuin met hoge bomen bij een landgoed.",
      "Een nis in klimop tegen een schuurmuur, of een half-open nestkast.",
      "Een vogel die steeds vanaf dezelfde tak een insect in de lucht vangt en terugkeert; een zacht ‘tsiet’.",
      "Grijsbruin, slank, met een fijn gestreepte kruin en borst en een rechtop zittende houding."
    ] }
  ] },
{ id:"grote-bonte-specht", no:128, g:"B", n:"Grote bonte specht", s:"Dendrocopos major", r:"VR", l:23, zz:"A", twin:null,
  h:["BOS","BEB","HALF"], a:["DAG"], v:["ONG","PLANT"], b:["BOOM"], w:["ACT"],
  x:"kleine-bonte-specht",
  t:"De kleine bonte specht is mussengroot, heeft dwarse witte strepen over de rug en geen rood onder de staart. Deze soort is lijstergroot, heeft grote witte schoudervlekken en een rode onderstaart.",
  cs:[
    { bron:"Vogelbescherming, soortpagina grote bonte specht", wn:[
      "Het Gooi, februari. Een windstille, koude ochtend.",
      "Een gemengd bos met grove dennen en eiken.",
      "Een ‘spechtensmidse’: een spleet in een stam vol uitgepikte dennenkegels, met lege kegels eronder.",
      "Een kort, snel roffel dat ver draagt, en een scherp ‘kik’.",
      "Zwart-wit, met grote witte schoudervlekken en een rode onderstaart."
    ] }
  ] },
{ id:"hop", no:129, g:"B", n:"Hop", s:"Upupa epops", r:"VR", l:27, zz:"ZZ", twin:null,
  h:["HEI","HALF","DUIN"], a:["DAG"], v:["ONG"], b:["BOOM","GEB"], w:["TREK"],
  x:"groene-specht",
  t:"De groene specht is groen met een rode kruin en roept een lachend ‘kjuk-kjuk’. Deze soort is roze-oranjebruin met een zwart-witte kuif en roept een dof ‘oep-oep-oep’.",
  cs:[
    { bron:"Sovon, zeldzame broedvogels; Vogelbescherming, soortpagina hop", wn:[
      "Veluwe, april. Een warme dag na de eerste zuidenwind.",
      "Een open heide met stuifzand en kort begraasde graslandjes.",
      "Een kale, zonnige zandplek waar de vogel met zijn snavel in de grond prikt.",
      "Een dof, ver dragend ‘oep-oep-oep’; een vlucht als van een grote, onregelmatig fladderende vlinder.",
      "Oranjeroze, met zwart-wit gestreepte vleugels, een lange gebogen snavel en een kuif die hij als een waaier opzet."
    ] }
  ] },
{ id:"kleine-bonte-specht", no:130, g:"B", n:"Kleine bonte specht", s:"Dryobates minor", r:"VR", l:15, zz:"MA", twin:null,
  h:["BOS","HALF","MOER"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["ACT"],
  x:"grote-bonte-specht",
  t:"De grote bonte specht is lijstergroot, heeft grote witte schoudervlekken en een rode onderstaart. Deze soort is mussengroot, met dwarse witte strepen over rug en vleugels.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina kleine bonte specht", wn:[
      "Biesbosch, maart. Een broekbos langs een kreek.",
      "Een vochtig wilgenbos met veel dood hout.",
      "Een klein, rond gat in een dunne, rotte wilgentak hoog in de kruin.",
      "Een zwak, lang aangehouden roffel en een hoog, klagend ‘kie-kie-kie-kie’.",
      "Mussengroot, met dwarse witte strepen over de rug en (bij de man) een rode kruin."
    ] }
  ] },
{ id:"kleine-vliegenvanger", no:131, g:"B", n:"Kleine vliegenvanger", s:"Ficedula parva", r:"VR", l:12, zz:"ZZ", twin:null,
  h:["DUIN","BOS","HALF"], a:["DAG"], v:["ONG"], b:["BOOM"], w:["TREK"],
  x:"grauwe-vliegenvanger",
  t:"De grauwe vliegenvanger is groter, egaal grijsbruin met een gestreepte kruin en heeft geen wit in de staart. Deze soort is klein, met een opvallende witte vlek aan weerszijden van de staartbasis.",
  cs:[
    { bron:"Sovon en Vogelbescherming, soortpagina kleine vliegenvanger", wn:[
      "Vlieland, september. Na een paar dagen oostenwind.",
      "Een duinvallei met een klein bosje van berk en populier.",
      "Het lage struikgewas in de luwte van het bosje.",
      "Een droog, ratelend ‘zrrrt’; een vogel die zijn staart steeds even opwipt en spreidt.",
      "Klein en grijsbruin met een opvallende oogring; witte vlekken aan de zijkanten van een zwarte staart."
    ] }
  ] },
{ id:"koolmees", no:132, g:"B", n:"Koolmees", s:"Parus major", r:"VR", l:14, zz:"A", twin:null,
  h:["BEB","BOS","HALF"], a:["DAG"], v:["ONG","PLANT"], b:["BOOM","GEB"], w:["ACT"],
  x:"pimpelmees",
  t:"De pimpelmees is kleiner, heeft een blauw petje en geen zwarte buikstreep. Deze soort heeft een zwarte kop met witte wangen en een zwarte streep over de gele buik.",
  cs:[
    { bron:"Vogelbescherming, soortpagina koolmees", wn:[
      "Rotterdam, november. In een volkstuin.",
      "Een stadspark met tuinen en voederplekken.",
      "Een nestkast met een gat van 32 mm, nog vol oud mos van vorig voorjaar.",
      "Een luid ‘tie-tuu, tie-tuu’, ook al in de winter; een vogel die aan een vetbol hangt.",
      "Geel met een zwarte kop, witte wangen en een zwarte streep over borst en buik."
    ] }
  ] },
{ id:"pimpelmees", no:133, g:"B", n:"Pimpelmees", s:"Cyanistes caeruleus", r:"VR", l:12, zz:"A", twin:null,
  h:["BEB","BOS","HALF"], a:["DAG"], v:["ONG","PLANT"], b:["BOOM","GEB"], w:["ACT"],
  x:"koolmees",
  t:"De koolmees is groter, heeft een zwarte kop en een zwarte streep over de buik. Deze soort heeft een blauw petje, een witte kop met een donkere oogstreep en geen buikstreep.",
  cs:[
    { bron:"Vogelbescherming, soortpagina pimpelmees", wn:[
      "Utrecht, januari. Een rietkraag langs een singel.",
      "Een stadsrand met tuinen, singels en een rietkraag.",
      "Rietpluimen en lisdoddes waarvan de stengels zijn opengepikt.",
      "Een kleine vogel die ondersteboven aan een rietstengel hangt; een fijn ‘tsie-tsie-tsurrr’.",
      "Klein, geel van onder, met een blauw petje en blauwe vleugels."
    ] }
  ] },
{ id:"raaf", no:134, g:"B", n:"Raaf", s:"Corvus corax", r:"VR", l:64, zz:"MA", twin:null,
  h:["BOS","HEI","OPEN"], a:["DAG"], v:["GEW","ONG","PLANT"], b:["BOOM"], w:["ACT"],
  x:"zwarte-kraai",
  t:"De zwarte kraai is kleiner, met een rechte staart en een schor ‘kraa’. Deze soort is buizerdgroot, heeft een wigvormige staart, een zware snavel en een diep ‘krok-krok’.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina raaf", wn:[
      "Drenthe, februari. Boven een uitgestrekt heideveld.",
      "Een groot bos- en heidegebied met verspreide oude grove dennen.",
      "Een groot, stevig takkennest in de kruin van een oude den, bekleed met wol en haar.",
      "Een diep, galmend ‘krok-krok’; twee vogels die samen duikelen en op de rug draaien in de lucht.",
      "Geheel zwart, groot als een buizerd, met een zware snavel, ruige keel en wigvormige staart."
    ] }
  ] },
{ id:"ruigpootuil", no:135, g:"B", n:"Ruigpootuil", s:"Aegolius funereus", r:"VR", l:25, zz:"ZZ", twin:null,
  h:["BOS"], a:["NACHT"], v:["GEW"], b:["BOOM"], w:["ACT"],
  x:"steenuil",
  t:"De steenuil heeft een platte kop, gele ogen onder ‘boze’ wenkbrauwen en zit in kleinschalig boerenland. Deze soort heeft een grote, ronde kop met een licht gezicht met donkere rand en zit in oud naaldbos.",
  cs:[
    { bron:"Sovon, soortpagina ruigpootuil", wn:[
      "Midden-Drenthe, maart. Een koude, windstille nacht.",
      "Een groot, oud naaldbos met sparren en grove dennen.",
      "Een oud hol van een zwarte specht, hoog in een beuk.",
      "Een snelle reeks zachte, fluitende ‘poe-poe-poe-poe’, die aanzwelt en ver draagt.",
      "Klein, met een grote ronde kop, een wit gezicht met donkere rand, gele ogen en dicht bevederde poten."
    ] }
  ] },
{ id:"zeearend", no:136, g:"B", n:"Zeearend", s:"Haliaeetus albicilla", r:"VR", l:85, zz:"Z", twin:null,
  h:["MOER","STIL","ZEE"], a:["DAG"], v:["VIS","GEW"], b:["BOOM"], w:["ACT"],
  x:"buizerd",
  t:"De buizerd is veel kleiner, met een korte, gebandeerde staart. Deze soort heeft een spanwijdte van meer dan twee meter, ‘plankvleugels’ en (oud) een korte witte wigstaart.",
  cs:[
    { bron:"Sovon, soortpagina zeearend; Vogelbescherming", wn:[
      "Lauwersmeer, december. Een heldere winterdag.",
      "Een groot meer met rietlanden, plassen en verspreide bosjes.",
      "Een reusachtig takkennest in een oude populier aan de rand van een moerasbos.",
      "Duizenden ganzen die tegelijk opvliegen als er een grote roofvogel overkomt.",
      "Enorm, met brede ‘plankvleugels’, een zware gele snavel en een korte witte staart."
    ] }
  ] },
{ id:"zwarte-mees", no:137, g:"B", n:"Zwarte mees", s:"Periparus ater", r:"VR", l:11, zz:"A", twin:null,
  h:["BOS"], a:["DAG"], v:["ONG","PLANT"], b:["BOOM","HOL"], w:["ACT"],
  x:"glanskop",
  t:"De glanskop heeft geen witte nekvlek en geen vleugelstreepjes en zit in loofbos. Deze soort heeft een witte vlek in de nek, twee witte vleugelstreepjes en zit vooral in naaldbos.",
  cs:[
    { bron:"Vogelbescherming en Sovon, soortpagina zwarte mees", wn:[
      "Veluwe, oktober. Een rustige najaarsdag.",
      "Een uitgestrekt naaldbos met fijnsparren en douglas.",
      "Een holte tussen boomwortels, laag bij de grond.",
      "Een snel, hoog ‘tsie-tsuu tsie-tsuu’ uit de kruin; kleine vogels die tussen de naalden hangen.",
      "Heel klein, met een zwarte kop, witte wangen, een witte nekvlek en twee witte vleugelstreepjes."
    ] }
  ] },
{ id:"zwarte-roodstaart", no:138, g:"B", n:"Zwarte roodstaart", s:"Phoenicurus ochruros", r:"VR", l:14, zz:"MA", twin:null,
  h:["BEB","DUIN"], a:["DAG"], v:["ONG"], b:["GEB","STEEN"], w:["TREK","ACT"],
  x:"gekraagde-roodstaart",
  t:"De gekraagde roodstaart heeft (bij de man) een oranje borst en witte voorhoofdsband en broedt in boomholtes. Deze soort is roetgrijs tot zwart en broedt op richels van gebouwen.",
  cs:[
    { bron:"Vogelbescherming, soortpagina zwarte roodstaart", wn:[
      "Rotterdamse haven, oktober. Een zonnige middag.",
      "Een industrieterrein met loodsen, containers en braakliggend terrein.",
      "Een richel hoog onder een dakgoot van een loods.",
      "Een krassend liedje dat klinkt alsof er grind wordt geschud; een staart die steeds trilt.",
      "Roetgrijs tot zwart, met een roestrode staart en (bij de man) een witte vleugelvlek."
    ] }
  ] },
{ id:"goudjakhals", no:139, g:"Z", n:"Goudjakhals", s:"Canis aureus", r:"BAL", l:100, zz:"Z", twin:null,
  h:["MOER","OPEN","HALF"], a:["NACHT","SCHEMER"], v:["GEW","ONG","PLANT"], b:["HOL"], w:["ACT"],
  x:"wolf",
  t:"De wolf is veel groter (schouderhoogte 70–80 cm), grijzer, met een zware kop en prenten van zo'n 10 cm. Deze soort is nauwelijks groter dan een vos, goudbruin, met een kortere staart en prenten van rond de 6 cm.",
  cs:[
    { sl:{ i:4, t:"Goudgrijs met rossige poten en oren, en een vrij korte staart met een donkere punt." }, bron:"BIJ12, goudjakhals; Zodion, soortpagina goudjakhals", wn:[
      "Noord-Friesland, februari. Een grauwe, winderige dag.",
      "Een buitendijkse kwelder met slenken, grenzend aan akkers en weiland.",
      "Een dichte rietkraag en ruigte aan de voet van de zeedijk.",
      "Op een wildcamera 's nachts een slank, hoogpotig dier langs de dijk; bij een doodgebeten schaap is DNA verzameld.",
      "Goudgrijs met rossige poten en oren, een spitse snuit en een vrij korte staart met een donkere punt."
    ] },
    { bron:"BIJ12, goudjakhals in Nederland", sl:{ i:3, t:"Een hoog, jodelend groepsgehuil: anders dan het lage huilen van de wolf." }, wn:[
      "Drenthe, oktober. Een heldere nacht.",
      "Een beekdal met ruig grasland, rietkragen en kleine bosjes.",
      "Een dichte rietruigte langs de beek, ver van paden.",
      "Een hoog, jankend en jodelend gehuil dat door de groep wordt overgenomen; op een cameraval een slank dier dat muizen vangt.",
      "Zo groot als een vos maar hoger op de poten, geelgrijs met een gouden gloed, met een vrij korte staart met een donkere punt."
    ] }
  ] },
{ id:"pimpernelblauwtje", no:140, g:"V", n:"Pimpernelblauwtje", s:"Phengaris teleius", r:"HR", l:3.5, zz:"Z", twin:"donker-pimpernelblauwtje",
  h:["OPEN","MOER"], a:["DAG"], v:["PLANT","ONG"], b:["VEG","GROND"], w:["SLAAP"],
  x:"donker-pimpernelblauwtje",
  t:"Het donker pimpernelblauwtje is van onderen egaal donker chocoladebruin met maar één rij stippen, en de rups wordt sneller door de gewone steekmier geadopteerd. Deze soort is van onderen lichtbruin met twee rijen zwarte stippen en leeft samen met de moerassteekmier.",
  cs:[
    { sl:{ i:3, t:"Een rupsje dat door mieren het nest in wordt gesleept: het leeft daar verder van mierenbroed." }, bron:"De Vlinderstichting; Natura 2000-profiel H1059; BIJ12", wn:[
      "Moerputten bij 's-Hertogenbosch, juli. Een warme, zonnige middag.",
      "Een vochtig, schraal hooiland met blauwgrasland-soorten, laat in het jaar gemaaid.",
      "Hoge, donkerrode bloemhoofdjes op lange stelen, ruim boven het gras uit.",
      "Een klein blauw vlindertje dat eitjes legt in de bloemknoppen; later in de zomer slepen mieren een rupsje hun nest in.",
      "Spanwijdte zo'n 3,5 cm; bovenkant blauw met donkere vlekjes, onderkant lichtbruin met twee rijen zwarte stippen."
    ] },
    { bron:"De Vlinderstichting, soortpagina pimpernelblauwtje", sl:{ i:4, t:"Een lichte onderkant met twee rijen stippen: bij de donkere tweelingsoort is de onderkant chocoladebruin." }, wn:[
      "Noord-Brabant, begin augustus. Vroeg in de ochtend na een koele nacht.",
      "Een hooiland dat in fasen wordt gemaaid: een deel is al kort, een deel staat nog.",
      "Hoge, roodbruine bloemknopjes van de waardplant in het ongemaaide deel.",
      "Kleine blauwe vlindertjes met dauw op de vleugels zitten met de vleugels dicht op die knopjes.",
      "Onderkant licht grijsbruin met twee rijen zwarte stippen."
    ] }
  ] },
{ id:"teunisbloempijlstaart", no:141, g:"V", n:"Teunisbloempijlstaart", s:"Proserpinus proserpina", r:"HR", l:4.5, zz:"Z", twin:null,
  h:["OPEN","STROOM","HALF"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["VEG","GROND"], w:["SLAAP"],
  x:"groot-avondrood",
  t:"De rups van groot avondrood heeft een echte ‘pijl’ op het achterlijf en grote oogvlekken achter de kop. Deze rups mist de pijl en heeft op die plek een bultje met een oogvlek; de vlinder is groen in plaats van roze.",
  cs:[
    { sl:{ i:3, t:"Een rups zonder stekel op het achterlijf: de meeste pijlstaartrupsen hebben die wel." }, bron:"De Vlinderstichting, soortpagina en monitoringhandleiding teunisbloempijlstaart", wn:[
      "Millingerwaard, juli. Laat in de middag.",
      "Een rivieruiterwaard met ruigte, zandige oevers en struweel.",
      "Een ruig stuk met harig wilgenroosje, basterdwederik en teunisbloem.",
      "Een dikke groene of bruine rups zonder stekel op het achterlijf; bijna volgroeid kruipt hij de grond in om als pop te overwinteren.",
      "Een kleine pijlstaart met groene, getande vleugels, een donkere middenband en oranje achtervleugels; vliegt in de schemering."
    ] },
    { bron:"De Vlinderstichting, soortpagina teunisbloempijlstaart", sl:{ i:4, t:"Een kleine pijlstaart met groene, getande voorvleugels." }, wn:[
      "Maasvallei bij Roermond, juni. Een warme avond.",
      "Een grindgat met ruige, zandige oevers.",
      "Een braakliggend stuk met kaardebollen, kattenstaart en ruigte.",
      "In de schemering zweeft een klein, snel insect als een kolibrie voor de bloemen en schiet dan schichtig weg.",
      "Klein, met groene vleugels met een getande rand en oranjegele achtervleugels."
    ] }
  ] },
{ id:"grote-vos", no:142, g:"V", n:"Grote vos", s:"Nymphalis polychloros", r:"BAL", l:6, zz:"Z", twin:null,
  h:["BOS","HALF"], a:["DAG"], v:["PLANT"], b:["BOOM"], w:["SLAAP"],
  x:"kleine-vos",
  t:"De kleine vos is kleiner, feller oranje, heeft een witte vlek bij de vleugelpunt en blauwe randvlekjes op alle vleugels, en de rups eet brandnetel. Deze soort is groter en doffer, met blauwe randjes alleen op de achtervleugels, en de rupsen leven in een gezamenlijk spinsel op iep of wilg.",
  cs:[
    { sl:{ i:3, t:"Een spinsel vol zwarte rupsen hoog in een iep." }, bron:"De Vlinderstichting, De dagvlinders van Nederland (grote vos)", wn:[
      "Noord-Brabant, maart. De eerste warme dag van het jaar.",
      "Een oude bosrand met vrijstaande iepen en wilgen langs een zonnig pad.",
      "Een holle boom en een houtstapel waarin een vlinder heeft overwinterd.",
      "Een grote oranje vlinder die zich zonnig op een stam laat opwarmen; later in het voorjaar een spinsel vol zwarte rupsen hoog in een iep.",
      "Spanwijdte zo'n 6 cm; oranjebruin met zwarte vlekken en een smalle rand van blauwe vlekjes langs de achtervleugels."
    ] },
    { bron:"De Vlinderstichting, soortpagina grote vos", sl:{ i:4, t:"Geen witte vlek bij de vleugelpunt en groter: het verschil met de kleine vos." }, wn:[
      "Zuid-Limburg, juli. Een warme dag.",
      "Een oude hoogstamboomgaard naast een bosrand.",
      "Een eik met uitvloeiend sap en rottend fruit onder de bomen.",
      "Verse, grote oranje vlinders zuigen aan het sap; na een paar weken zijn ze verdwenen tot het volgende voorjaar.",
      "Spanwijdte zo'n 6 cm; oranjebruin met zwarte vlekken en zonder witte vlek bij de vleugelpunt."
    ] }
  ] },
{ id:"donker-pimpernelblauwtje", no:null, g:"V", n:"Donker pimpernelblauwtje", s:"Phengaris nausithous", r:"HR", l:3.5, zz:null, twin:"pimpernelblauwtje",
  h:["OPEN","MOER"], a:["DAG"], v:["PLANT","ONG"], b:["VEG","GROND"], w:["SLAAP"] },
{ id:"kleine-vos", no:null, g:"V", n:"Kleine vos", s:"Aglais urticae", r:"NB", l:5, zz:null, twin:null,
  h:["HALF","BEB","OPEN"], a:["DAG"], v:["PLANT"], b:["VEG"], w:["SLAAP"] },
{ id:"groot-avondrood", no:null, g:"V", n:"Groot avondrood", s:"Deilephila elpenor", r:"NB", l:6, zz:null, twin:null,
  h:["HALF","STROOM","BEB"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["VEG","GROND"], w:["SLAAP"] },
{ id:"grote-weerschijnvlinder", no:143, g:"V", n:"Grote weerschijnvlinder", s:"Apatura iris", r:"BAL", l:6.5, zz:"Z", twin:null,
  h:["BOS"], a:["DAG"], v:["PLANT","ONG"], b:["BOOM"], w:["SLAAP"],
  x:"kleine-ijsvogelvlinder",
  t:"De kleine ijsvogelvlinder is kleiner, zwart met een witte band maar zonder paarse glans en zonder oogvlek op de achtervleugel, en zweeft laag langs bosranden met kamperfoelie. Deze soort glanst (bij het mannetje) paars en heeft een oranje omrande oogvlek op de achtervleugel.",
  cs:[
    { sl:{ i:4, t:"Een paarse glans in het licht op een bruinzwarte vleugel met een witte band." }, bron:"De Vlinderstichting, De dagvlinders van Nederland (grote weerschijnvlinder)", wn:[
      "Veluwezoom, juli. Een warme, windstille ochtend.",
      "Een oud loofbos met open plekken, brede lanen en veel boswilg langs de randen.",
      "De bovenste takken van een vrijstaande eik waar mannetjes elkaar achternazitten, en een boswilg aan een beschaduwde bosrand.",
      "Een grote vlinder die op het pad zit te likken aan een uitwerpsel en een plasje; een stinkend stukje kaas lokt hem naar beneden.",
      "Spanwijdte zo'n 6,5 cm; bruinzwart met een witte band, in het licht paars glanzend, met een oogvlek op de achtervleugel."
    ] },
    { bron:"De Vlinderstichting, soortpagina grote weerschijnvlinder", sl:{ i:3, t:"Een groene rups met twee hoorntjes op boswilg: de waardplant en de rups van deze soort." }, wn:[
      "Noord-Brabant, mei. Een zonnige ochtend.",
      "Een loofbos met brede, zonnige paden.",
      "Een wilg met brede, ronde bladeren in de halfschaduw aan de bosrand.",
      "Op zo'n blad een groene rups met twee hoorntjes op de kop, die er van opzij uitziet als een slak.",
      "Later in de zomer vliegt hier een grote, bruinzwarte vlinder met een witte band."
    ] }
  ] },
{ id:"kleine-ijsvogelvlinder", no:144, g:"V", n:"Kleine ijsvogelvlinder", s:"Limenitis camilla", r:"BAL", l:5.5, zz:"MA", twin:null,
  h:["BOS","HALF"], a:["DAG"], v:["PLANT"], b:["VEG"], w:["SLAAP"],
  x:"grote-weerschijnvlinder",
  t:"De grote weerschijnvlinder is groter, glanst (bij het mannetje) paars en heeft een oogvlek op de achtervleugel; hij vliegt vooral hoog in de boomkruinen. Deze soort zweeft laag en sierlijk langs schaduwrijke bosranden en zet eitjes af op kamperfoelie.",
  cs:[
    { sl:{ i:3, t:"Afwisselend klapperen en lang zweven: de typische vlucht van deze vlinder." }, bron:"De Vlinderstichting, De dagvlinders van Nederland (kleine ijsvogelvlinder)", wn:[
      "Twente, juni. Een zonnige middag na een regenbui.",
      "Een vochtig, half beschaduwd bos met eiken en berken en brede, open paden.",
      "Wilde kamperfoelie die in slingers over de struiken langs de bosrand hangt.",
      "Een zwarte vlinder die afwisselend klappert en lang zweeft, steeds rond dezelfde zonnige plek; in de winter een opgerold blaadje met een rupsje op een kamperfoelietakje.",
      "Spanwijdte zo'n 5,5 cm; bovenkant zwart met een witte vlekkenband, onderkant oranjebruin met wit en zwarte stippen."
    ] },
    { bron:"De Vlinderstichting, soortpagina kleine ijsvogelvlinder", sl:{ i:4, t:"Geen paarse glans: het verschil met de grote weerschijnvlinder, die er van boven op lijkt." }, wn:[
      "Achterhoek, juli. Een warme, zonnige middag.",
      "Een vochtig loofbos met oude eiken.",
      "Een braamstruweel in de halfschaduw langs een bospad.",
      "Een zwarte vlinder met een witte band zweeft met een paar vleugelslagen tussen de bomen en landt op braambloesem.",
      "Onderkant oranjebruin met een witte band; geen paarse glans aan de bovenkant."
    ] }
  ] }
];
