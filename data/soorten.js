/* Vestigia – soortendata
   Dit bestand is de enige plek waar soorten staan. Controleer na elke wijziging met: node tools/controle.mjs

   Velden per soort
   id    vaste sleutel. Verandert nooit, ook niet als de naam verandert (zet de oude naam dan in ALIASES).
   no    vast platennummer in het Vestiarium. Alleen soorten met een casus hebben er een; nieuwe nummers komen achteraan.
   g     diergroep (GROUPS) · n Nederlandse naam · s wetenschappelijke naam · r regime (LABELS.r) · l lengte in cm
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

const GROUPS = { Z:"Zoogdieren", R:"Reptielen", A:"Amfibieën", F:"Vissen", B:"Vogels" };

const RARITY = { A:"Algemeen", MA:"Minder algemeen", Z:"Zeldzaam", ZZ:"Zeer zeldzaam" };

/* Oude namen die ooit in opslag kunnen staan, met de id waar ze nu bij horen. Voorbeeld: "Wezel (oud)": "wezel" */
const ALIASES = {};

const SPECIES = [
{ id:"das", no:1, g:"Z", n:"Das", s:"Meles meles", r:"BAL", l:85, zz:null, twin:null,
  h:["HALF","BOS"], a:["NACHT","SCHEMER"], v:["ONG","PLANT","GEW"], b:["HOL"], w:["ACT"],
  x:"vos",
  t:"Een vossenburcht heeft minder en kleinere pijpen, zonder beddingmateriaal ervoor, en ruikt scherp. Vossenuitwerpselen liggen los op opvallende plekken, niet in latrinekuiltjes.",
  cs:[
    { bron:null, wn:[
      "Oost-Brabant, maart. Kleinschalig landschap met houtwallen, een beekdal en maïsakkers.",
      "Een steile, zandige rand langs het beekdal, begroeid met eiken en braam.",
      "Grasland tegen de houtwal, waar de zode op veel plekken is opengewoeld.",
      "Langs de akkerrand een kuiltje met uitwerpselen; aan het prikkeldraad hangen grove haren.",
      "Prent met vijf tenen naast elkaar en lange nagelafdrukken."
    ] }
  ] },
{ id:"otter", no:2, g:"Z", n:"Otter", s:"Lutra lutra", r:"HR", l:110, zz:null, twin:null,
  h:["STROOM","MOER","STIL"], a:["NACHT","SCHEMER"], v:["VIS","GEW"], b:["HOL"], w:["ACT"],
  x:"bever",
  t:"Bevers laten geen visresten achter maar knaagsporen en ontschorste takken. Hun uitwerpselen vind je zelden, omdat ze in het water poepen.",
  cs:[
    { bron:null, wn:[
      "Noordwest-Overijssel, januari. Laagveenmoeras met petgaten.",
      "Schoon, visrijk water met brede rietkragen en wat elzenbroek.",
      "Oevers die ’s winters door kwel deels ijsvrij blijven, met rustige, onbegaanbare delen.",
      "Op een paaltje aan het water kleine hoopjes zoetig ruikende uitwerpselen met visgraten.",
      "Ronde prent met vijf tenen, ±6 cm, en het sleepspoor van een dikke staart."
    ] }
  ] },
{ id:"bever", no:3, g:"Z", n:"Bever", s:"Castor fiber", r:"HR", l:120, zz:null, twin:null,
  h:["STROOM","STIL","MOER"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["HOL","WATER"], w:["ACT"],
  x:"muskusrat",
  t:"De muskusrat is veel kleiner, heeft een zijdelings afgeplatte staart en knaagt geen bomen om; zijn vraatsporen zijn biezen, riet en lisdodde.",
  cs:[
    { bron:null, wn:[
      "Zoetwatergetijdengebied, februari. Kreken en eilanden met een wisselende waterstand.",
      "Wilgenvloedbos met veel schietwilg en populier langs het water.",
      "Steile oevers en luwe kreekjes waar het water nooit helemaal droogvalt.",
      "Schuin afgesneden takken en een schietwilg met een zandlopervormige knaagplek.",
      "Een platte, geschubde staart."
    ] }
  ] },
{ id:"hamster", no:4, g:"Z", n:"Hamster", s:"Cricetus cricetus", r:"HR", l:28, zz:null, twin:null,
  h:["OPEN"], a:["SCHEMER","NACHT"], v:["PLANT","ONG"], b:["HOL"], w:["SLAAP"],
  x:"bruine-rat",
  t:"Een rattenhol heeft meerdere ingangen met uitgegraven grond en duidelijke looppaden ertussen, meestal bij water of erven. Loodrechte valpijpen zonder grondhoop ontbreken.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, augustus. Het lössplateau, net na de oogst.",
      "Grote akkers met wintertarwe en luzerne op diepe, droge lössgrond.",
      "Langs de percelen blijven bewust stroken graan staan; het grondwater zit diep.",
      "In de stoppels ronde gaten die recht naar beneden gaan, zonder grondhoop.",
      "Een knaagdier met een zwarte buik en witte vlekken op de flanken."
    ] }
  ] },
{ id:"hazelmuis", no:5, g:"Z", n:"Hazelmuis", s:"Muscardinus avellanarius", r:"HR", l:14, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT"], v:["PLANT","ONG"], b:["VEG","BOOM"], w:["SLAAP"],
  x:"bosmuis",
  t:"De bosmuis knaagt ook een rond gat in hazelnoten, maar laat tandsporen achter op het buitenoppervlak rond het gat.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, september. Hellingbossen en houtwallen in het heuvelland.",
      "Een gevarieerde, aaneengesloten struiklaag van hazelaar, braam, kamperfoelie en meidoorn.",
      "De struiken zijn via de kronen met elkaar verbonden; er zit geen open gat in de houtwal.",
      "Lege hazelnoten met een rond gat; de rand is glad, met schuine tandsporen aan de binnenkant.",
      "Oranjebruin, met grote zwarte ogen en een behaarde staart."
    ] }
  ] },
{ id:"eikelmuis", no:6, g:"Z", n:"Eikelmuis", s:"Eliomys quercinus", r:"BAL", l:25, zz:null, twin:null,
  h:["BOS","BEB"], a:["NACHT"], v:["ONG","PLANT"], b:["GEB","BOOM","STEEN"], w:["SLAAP"],
  x:"hazelmuis",
  t:"De hazelmuis heeft geen zwart masker, is kleiner en oranjebruin, en leeft in de struiklaag in plaats van in muren en gebouwen.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, juni. Een droog dal met hellingbos en kalkgrasland.",
      "Een oude mergelgroeve en een carréboerderij met hoogstamfruit.",
      "Mergelmuren vol kieren en een hooizolder die nauwelijks nog wordt gebruikt.",
      "Op de zolder keutels van ±1 cm, een rommelig nest en lege slakkenhuisjes.",
      "Zwart rond de ogen en een staart met een witte pluim."
    ] }
  ] },
{ id:"boommarter", no:7, g:"Z", n:"Boommarter", s:"Martes martes", r:"BAL", l:70, zz:null, twin:null,
  h:["BOS"], a:["NACHT","SCHEMER"], v:["GEW","PLANT"], b:["BOOM"], w:["ACT"],
  x:"steenmarter",
  t:"De steenmarter heeft een witte, vaak gevorkte keelvlek die doorloopt over de voorpoten en een lichte neus, en rust bij voorkeur in gebouwen.",
  cs:[
    { bron:null, wn:[
      "Veluwe, april. Een groot, aaneengesloten boscomplex.",
      "Oud gemengd bos met grove den, beuk en eik en veel staand dood hout.",
      "Grote, ovale holen hoog in de beuken; weinig paden en weinig verstoring.",
      "Gedraaide uitwerpselen met haren en bessenpitten op een omgevallen stam; krabsporen op de bast.",
      "Een gelige keelvlek zonder vork."
    ] }
  ] },
{ id:"steenmarter", no:8, g:"Z", n:"Steenmarter", s:"Martes foina", r:"BAL", l:70, zz:null, twin:null,
  h:["BEB","HALF"], a:["NACHT"], v:["GEW","PLANT"], b:["GEB"], w:["ACT"],
  x:"boommarter",
  t:"De boommarter heeft een romige tot oranjegele keelvlek die niet gevorkt is, behaarde voetzolen en grotere oren, en rust in boomholtes.",
  cs:[
    { bron:null, wn:[
      "De Betuwe, mei. Een dorpskern tussen boomgaarden.",
      "Oude boerderijen met rieten kappen, schuren en houtstapels.",
      "Een zolder met losse isolatie, bereikbaar via een kier onder de dakgoot.",
      "Gedraaide uitwerpselen vol kersenpitten; ’s nachts gestommel, en de buren hebben een kapotte bougiekabel.",
      "Een witte, gevorkte keelvlek die doorloopt over de voorpoten."
    ] }
  ] },
{ id:"eekhoorn", no:9, g:"Z", n:"Eekhoorn", s:"Sciurus vulgaris", r:"BAL", l:40, zz:null, twin:null,
  h:["BOS","BEB"], a:["DAG"], v:["PLANT"], b:["BOOM"], w:["ACT"],
  x:"bosmuis",
  t:"Muizen laten een kort en glad afgeknaagde kegelspil achter zonder rafelig topje, en hazelnoten krijgen een rond gaatje in plaats van in tweeën te worden gekraakt.",
  cs:[
    { bron:null, wn:[
      "Landgoed bij Hilversum, oktober.",
      "Gemengd bos met beuk, fijnspar, grove den en een paar oude walnoten.",
      "Hoge, met elkaar verbonden boomkronen en weinig open plekken.",
      "Kegelspillen met een rafelig topje; hazelnoten in twee helften gekraakt.",
      "Een pluimstaart en, in de winter, oorpluimpjes."
    ] }
  ] },
{ id:"watervleermuis", no:10, g:"Z", n:"Watervleermuis", s:"Myotis daubentonii", r:"HR", l:9, zz:null, twin:null,
  h:["STIL","BOS"], a:["NACHT"], v:["ONG"], b:["BOOM","GEB"], w:["SLAAP"],
  x:"meervleermuis",
  t:"De meervleermuis is groter (spanwijdte ±30 cm), jaagt boven bredere wateren en heeft zijn meeste energie rond 35 kHz in plaats van rond 45 kHz.",
  cs:[
    { bron:null, wn:[
      "Landgoed in Utrecht, augustus.",
      "Een gracht en vijvers met een gladde, beschutte waterspiegel.",
      "Oude beuken met spechtenholen langs het water, en een ijskelder.",
      "Detector: droge, regelmatige tikken met een piek rond 45 kHz, laag boven het water.",
      "Grote voeten met borstelharen."
    ] }
  ] },
{ id:"laatvlieger", no:11, g:"Z", n:"Laatvlieger", s:"Eptesicus serotinus", r:"HR", l:12, zz:null, twin:null,
  h:["BEB","HALF"], a:["NACHT","SCHEMER"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"rosse-vleermuis",
  t:"De rosse vleermuis vliegt hoger en sneller met smalle vleugels, roept met afwisselende ‘plip-plop’-signalen rond 20 kHz en woont in boomholtes.",
  cs:[
    { bron:null, wn:[
      "Zuid-Holland, juni. Een woonwijk aan de rand van het veenweidegebied.",
      "Weilanden met vee direct achter de tuinen; laanbomen en bosjes.",
      "Woningen uit de jaren dertig met spouwmuren en pannendaken.",
      "Onder de nok keutels van ±1 cm; detector: luide, langzame signalen rond 25–30 kHz.",
      "Groot en donker; de laatste staartwervels steken buiten de vlieghuid uit."
    ] }
  ] },
{ id:"waterspitsmuis", no:12, g:"Z", n:"Waterspitsmuis", s:"Neomys fodiens", r:"BAL", l:15, zz:null, twin:null,
  h:["STROOM","STIL","MOER"], a:["NACHT","DAG"], v:["ONG","VIS"], b:["HOL"], w:["ACT"],
  x:"gewone-bosspitsmuis",
  t:"De bosspitsmuis is driekleurig (donkere rug, bruine flank, lichte buik), mist de haarkiel onder de staart en jaagt niet onder water.",
  cs:[
    { bron:null, wn:[
      "Veenweidegebied, mei.",
      "Een sloot met helder, schoon water vol ongewervelden.",
      "Een onbeschoeide, begroeide oever met stenen en wortels op de waterlijn.",
      "Op een steen kleine uitwerpselen met resten van kokerjuffers en vlokreeftjes.",
      "Zwart met een witte buik en een kiel van stijve haren onder de staart."
    ] }
  ] },
{ id:"hermelijn", no:13, g:"Z", n:"Hermelijn", s:"Mustela erminea", r:"BAL", l:35, zz:null, twin:null,
  h:["HALF","OPEN","DUIN"], a:["DAG","NACHT"], v:["GEW"], b:["HOL"], w:["ACT"],
  x:"wezel",
  t:"De wezel is kleiner, heeft een korte staart zonder zwarte punt, en de grens tussen bruin en wit is grillig in plaats van recht.",
  cs:[
    { bron:null, wn:[
      "Kop van Noord-Holland, januari. De overgang van duin naar polder.",
      "Een duinvallei en vochtige graslanden met veel woelmuizen.",
      "Takkenrillen, steenhopen en houtwallen als dekking.",
      "Dunne, gedraaide uitwerpselen; in de sneeuw steeds twee prenten schuin naast elkaar.",
      "Een staartpunt die altijd zwart is."
    ] }
  ] },
{ id:"bruinvis", no:14, g:"Z", n:"Bruinvis", s:"Phocoena phocoena", r:"HR", l:155, zz:null, twin:null,
  h:["ZEE"], a:["DAG","NACHT"], v:["VIS"], b:["WATER"], w:["ACT"],
  x:"tuimelaar",
  t:"De tuimelaar is twee keer zo groot (±3 m), heeft een duidelijke snavel en een hoge, sikkelvormige rugvin, en springt vaak boven water uit.",
  cs:[
    { bron:null, wn:[
      "Noordzeekust bij Egmond, maart.",
      "Ondiepe kustzee met veel haring en zandspiering.",
      "Je kijkt vanaf de duinrand over zee, met een telescoop.",
      "Akoestische monitoring vangt zeer hoge klikken op; een kleine, driehoekige vin rolt boven water.",
      "Geen snavel, en schopvormige tanden."
    ] }
  ] },
{ id:"vos", no:15, g:"Z", n:"Vos", s:"Vulpes vulpes", r:"BAL", l:105, zz:null, twin:null,
  h:["HALF","BOS","BEB","DUIN"], a:["NACHT","SCHEMER"], v:["GEW","ONG","PLANT"], b:["HOL"], w:["ACT"],
  x:"das",
  t:"Een dassenburcht heeft grote zandhopen met beddingmateriaal ervoor en in de buurt een latrine met kuiltjes. De dassenprent heeft vijf tenen naast elkaar met lange nagels, geen ovale prent met vier tenen.",
  cs:[
    { bron:null, wn:[
      "Duinen bij Castricum, februari.",
      "Open duingrasland met struweel van duindoorn en meidoorn.",
      "Zandige hellingen met konijnen en een rustige, begroeide duinvallei.",
      "Een uitwerpsel met een gedraaide punt boven op een graspol; ’s nachts een hees gekrijs.",
      "Ovale prent met vier tenen; tussen de buitenste tenen en de bal past een kruis."
    ] }
  ] },
{ id:"ree", no:16, g:"Z", n:"Ree", s:"Capreolus capreolus", r:"BAL", l:115, zz:null, twin:null,
  h:["BOS","HALF","OPEN"], a:["SCHEMER","DAG","NACHT"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"damhert",
  t:"Het damhert is groter, heeft een lange staart met een zwarte streep, vaak een gevlekte vacht en een schopvormig gewei. Het bronst in oktober, niet in de zomer.",
  cs:[
    { bron:null, wn:[
      "Achterhoek, eind juli.",
      "Kleinschalig landschap van bosjes, maïs en grasland.",
      "Bosranden met jonge opslag en ruigte als dekking.",
      "Laag kapotgeschuurde boompjes en glanzend zwarte keutels; in de schemering een blaffend geluid.",
      "Smalle hoefprent van ±4–5 cm."
    ] }
  ] },
{ id:"edelhert", no:17, g:"Z", n:"Edelhert", s:"Cervus elaphus", r:"BAL", l:220, zz:null, twin:null,
  h:["BOS","HEI"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"damhert",
  t:"Het damhert is kleiner en heeft een schopvormig gewei en een lange staart met zwarte streep. Een bronstig damhert boert kort en rochelend; het edelhert brult langgerekt.",
  cs:[
    { bron:null, wn:[
      "Veluwe, eind september.",
      "Uitgestrekt bos, afgewisseld met heidevelden en zandverstuivingen.",
      "Grote, rustige open plekken met een paar modderige poelen.",
      "Bast op borsthoogte in brede stroken geschild; in de schemering een diep, langgerekt geluid.",
      "Grote hoefprent van ±8–9 cm."
    ] }
  ] },
{ id:"damhert", no:18, g:"Z", n:"Damhert", s:"Dama dama", r:"BAL", l:150, zz:null, twin:null,
  h:["DUIN","BOS","HALF"], a:["SCHEMER","DAG"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"ree",
  t:"Het ree is kleiner, heeft vrijwel geen zichtbare staart, een effen vacht en een klein, rechtopstaand gewei. Het bronst in de zomer, niet in oktober.",
  cs:[
    { bron:null, wn:[
      "Duinen bij Amsterdam, oktober.",
      "Duinbos, struweel en open duingrasland.",
      "Een gebied zonder grote roofdieren, met een hoge graasdruk.",
      "Keutels groter dan die van een ree; een kort, rochelend geluid bij een uitgekrabde kuil.",
      "Een lange staart met een zwarte streep."
    ] }
  ] },
{ id:"wild-zwijn", no:19, g:"Z", n:"Wild zwijn", s:"Sus scrofa", r:"BAL", l:160, zz:null, twin:null,
  h:["BOS"], a:["NACHT","SCHEMER"], v:["PLANT","ONG"], b:["VEG"], w:["ACT"],
  x:"edelhert",
  t:"Een hertenprent heeft smallere hoeven. Als de bijhoeven al zichtbaar zijn, staan die recht achter de hoeven en niet breed uitstaand.",
  cs:[
    { bron:null, wn:[
      "Veluwe, november.",
      "Gemengd bos met veel eik en beuk, in een mastjaar.",
      "Vochtige laagten met modderpoelen.",
      "Grote stukken omgewoelde bodem; bomen met modder op kniehoogte.",
      "Prent met twee hoeven en breed uitstaande bijhoeven."
    ] }
  ] },
{ id:"haas", no:20, g:"Z", n:"Haas", s:"Lepus europaeus", r:"BAL", l:60, zz:null, twin:null,
  h:["OPEN","HALF"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["GROND"], w:["ACT"],
  x:"konijn",
  t:"Het konijn is kleiner, graaft burchten met veel pijpen en heeft kortere oren zonder zwarte punten. Zijn jongen worden naakt en blind geboren.",
  cs:[
    { bron:null, wn:[
      "Groningen, maart.",
      "Grootschalige kleiakkers en graslanden.",
      "Weinig dekking: geen houtwallen, alleen sloten en een paar bermen.",
      "Een ondiepe kuil in de akker en platte, ronde keutels met grove vezels.",
      "Lange oren met zwarte punten."
    ] }
  ] },
{ id:"konijn", no:21, g:"Z", n:"Konijn", s:"Oryctolagus cuniculus", r:"BAL", l:45, zz:null, twin:null,
  h:["DUIN","HALF","BEB"], a:["SCHEMER"], v:["PLANT"], b:["HOL"], w:["ACT"],
  x:"haas",
  t:"De haas is groter, graaft niet maar ligt in een ondiepe kuil, en heeft lange oren met zwarte punten. Zijn keutels zijn platter en groter.",
  cs:[
    { bron:null, wn:[
      "Zeeuwse duinen, mei.",
      "Kort begraasd duingrasland met struweel.",
      "Zandige hellingen waar je makkelijk kunt graven.",
      "Een hoop ronde keutels op een duintopje en veel kleine krabkuiltjes.",
      "Korte oren zonder zwarte punten."
    ] }
  ] },
{ id:"egel", no:22, g:"Z", n:"Egel", s:"Erinaceus europaeus", r:"BAL", l:25, zz:null, twin:null,
  h:["HALF","BEB"], a:["NACHT"], v:["ONG"], b:["VEG"], w:["SLAAP"],
  x:"bruine-rat",
  t:"Rattenuitwerpselen zijn kleiner (±1–2 cm), hebben stompe uiteinden en bevatten geen keverresten. Ratten lopen vaste paden met holen erlangs.",
  cs:[
    { bron:null, wn:[
      "Een vinexwijk, juni.",
      "Tuinen met gazons, borders en heggen.",
      "Ruige hoeken met bladhopen en schuttingen met hier en daar een gat.",
      "Glanzende, zwarte uitwerpselen vol keverresten; ’s nachts luid gesnuif.",
      "Prent met vijf tenen, ±3 cm."
    ] }
  ] },
{ id:"wezel", no:23, g:"Z", n:"Wezel", s:"Mustela nivalis", r:"BAL", l:22, zz:null, twin:null,
  h:["HALF","OPEN"], a:["DAG","NACHT"], v:["GEW"], b:["HOL"], w:["ACT"],
  x:"hermelijn",
  t:"De hermelijn is groter, heeft een langere staart met altijd een zwarte punt, en de grens tussen bruin en wit loopt recht.",
  cs:[
    { bron:null, wn:[
      "Hoeksche Waard, juli.",
      "Akkers met brede grasbermen en slootkanten.",
      "Een jaar met heel veel veldmuizen.",
      "Heel dunne, gedraaide uitwerpselen van ±2–3 mm; een muizenhol met een nest van muizenhaar.",
      "Een korte staart zonder zwarte punt."
    ] }
  ] },
{ id:"bunzing", no:24, g:"Z", n:"Bunzing", s:"Mustela putorius", r:"BAL", l:50, zz:null, twin:null,
  h:["HALF","MOER"], a:["NACHT"], v:["GEW"], b:["HOL","GEB"], w:["ACT"],
  x:"steenmarter",
  t:"De steenmarter is groter, heeft een witte keelvlek en geen gezichtsmasker, klimt veel en woont vooral op zolders.",
  cs:[
    { bron:null, wn:[
      "Utrecht, december. Veenweidegebied.",
      "Sloten met veel kikkers, en knotwilgen.",
      "Een boerenerf met houtstapels en een schuur met een kruipruimte.",
      "Een voorraad padden met een beet in de kop; een sterke, onaangename geur.",
      "Een licht gezichtsmasker op een donkere kop."
    ] }
  ] },
{ id:"gewone-zeehond", no:25, g:"Z", n:"Gewone zeehond", s:"Phoca vitulina", r:"BAL", l:160, zz:null, twin:null,
  h:["ZEE"], a:["DAG","NACHT"], v:["VIS"], b:["WATER"], w:["ACT"],
  x:"grijze-zeehond",
  t:"De grijze zeehond is groter, heeft een langgerekte kop met een ‘Romeins’ profiel en parallelle neusgaten, en jongt rond de jaarwisseling.",
  cs:[
    { bron:null, wn:[
      "Waddenzee, juni.",
      "Zandplaten die bij laagwater droogvallen.",
      "Rustige platen langs geulen, waar dieren snel het water in kunnen.",
      "Tientallen dieren bij elkaar; jongen gaan binnen enkele uren te water.",
      "V-vormige neusgaten."
    ] }
  ] },
{ id:"wilde-kat", no:26, g:"Z", n:"Wilde kat", s:"Felis silvestris", r:"HR", l:90, zz:null, twin:null,
  h:["BOS"], a:["NACHT","SCHEMER"], v:["GEW"], b:["BOOM","HOL"], w:["ACT"],
  x:"huiskat",
  t:"Een verwilderde huiskat heeft een dunnere, spits toelopende staart, en de rugstreep loopt vaak door over de staart. Alleen DNA geeft zekerheid.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, januari.",
      "Groot hellingbos met open plekken en ruige bosranden.",
      "Ver van bebouwing, en aansluitend op grote bossen over de grens.",
      "Uitwerpselen, niet begraven, op een stronk; haren op een lokstok met valeriaan.",
      "Een dikke, stompe staart met zwarte ringen."
    ] }
  ] },
{ id:"bosmuis", no:27, g:"Z", n:"Bosmuis", s:"Apodemus sylvaticus", r:"BAL", l:18, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT"], v:["PLANT","ONG"], b:["HOL"], w:["ACT"],
  x:"hazelmuis",
  t:"De hazelmuis laat een gladde rand achter met schuine tandsporen langs de binnenkant en vrijwel geen sporen op het oppervlak. Ze heeft een pluizige staart.",
  cs:[
    { bron:null, wn:[
      "Utrechtse Heuvelrug, oktober.",
      "Gemengd bos met beuk en hazelaar.",
      "Een dikke strooisellaag met veel beukennootjes.",
      "Lege hazelnoten met tandsporen op de buitenkant rond het gat.",
      "Grote oren, grote ogen en een lange staart."
    ] }
  ] },
{ id:"dwergmuis", no:28, g:"Z", n:"Dwergmuis", s:"Micromys minutus", r:"BAL", l:12, zz:null, twin:null,
  h:["MOER"], a:["DAG","NACHT"], v:["PLANT","ONG"], b:["VEG"], w:["ACT"],
  x:"hazelmuis",
  t:"Het hazelmuisnest is gemaakt van gestripte kamperfoeliebast en zit in struiken, niet in riet. De hazelmuis heeft een pluizige staart en grote zwarte ogen.",
  cs:[
    { bron:null, wn:[
      "Langs de Vecht, september.",
      "Hoge rietkragen en ruigte met zegge.",
      "Vegetatie die ook in de winter blijft staan.",
      "Op een meter hoogte een balletje van gespleten bladeren die nog vastzitten.",
      "Oranjebruin, ±6 gram, met een grijpstaart."
    ] }
  ] },
{ id:"woelrat", no:29, g:"Z", n:"Woelrat", s:"Arvicola amphibius", r:"BAL", l:30, zz:null, twin:null,
  h:["STIL","MOER","STROOM"], a:["DAG","NACHT"], v:["PLANT"], b:["HOL"], w:["ACT"],
  x:"bruine-rat",
  t:"De bruine rat heeft een spitse snuit, grotere oren en een lange, kale, geschubde staart. Zijn keutels zijn groter, met stompe uiteinden.",
  cs:[
    { bron:null, wn:[
      "Noord-Holland, april. Veenweidegebied.",
      "Sloten met een ruige, begroeide oever.",
      "Flauwe, onbeschoeide oevers met weinig onderhoud.",
      "Hoopjes schuin afgeknipt riet en keutels van ±1 cm op vaste plekken.",
      "Een stompe snuit en een behaarde staart."
    ] }
  ] },
{ id:"aardmuis", no:30, g:"Z", n:"Aardmuis", s:"Microtus agrestis", r:"BAL", l:15, zz:null, twin:null,
  h:["MOER","HALF"], a:["DAG","NACHT"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"veldmuis",
  t:"De veldmuis heeft een kortere, gladdere, meer geelbruine vacht en leeft in kort grasland, met veel open holletjes in plaats van paadjes door hoog gras.",
  cs:[
    { bron:null, wn:[
      "Biesbosch, juni.",
      "Ruig, ongemaaid grasland.",
      "Hoog, dicht gras op een vochtige ondergrond.",
      "Paadjes met afgeknipte halmen en groene keutels van ±5 mm.",
      "Een ruige, grijsbruine vacht en een korte staart."
    ] }
  ] },
{ id:"rosse-woelmuis", no:31, g:"Z", n:"Rosse woelmuis", s:"Clethrionomys glareolus", r:"BAL", l:15, zz:null, twin:null,
  h:["BOS"], a:["DAG","NACHT"], v:["PLANT"], b:["HOL"], w:["ACT"],
  x:"bosmuis",
  t:"De bosmuis heeft grote oren en ogen, een lange staart en springt. Bij hazelnoten laat ze tandsporen achter op het buitenoppervlak rond het gat.",
  cs:[
    { bron:null, wn:[
      "Veluwe, mei.",
      "Een bosrand met een rijke ondergroei van braam.",
      "Een dikke strooisellaag en veel dood hout.",
      "Braamscheuten zonder bast; hazelnoten met een ruw gat, zonder sporen op de buitenkant.",
      "Een roodbruine rug."
    ] }
  ] },
{ id:"gewone-bosspitsmuis", no:32, g:"Z", n:"Gewone bosspitsmuis", s:"Sorex araneus", r:"BAL", l:12, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT","DAG"], v:["ONG"], b:["GROND"], w:["ACT"],
  x:"huisspitsmuis",
  t:"De huisspitsmuis heeft witte tandpunten, grote, opvallende oren en lange, losse haren op de staart.",
  cs:[
    { bron:null, wn:[
      "Twente, augustus.",
      "Heggen, houtwallen en bosranden.",
      "Een vochtige, dikke strooisellaag.",
      "Schelle piepjes uit het strooisel; een dood diertje dat door katten is laten liggen.",
      "Rode tandpunten en een driekleurige vacht."
    ] }
  ] },
{ id:"huisspitsmuis", no:33, g:"Z", n:"Huisspitsmuis", s:"Crocidura russula", r:"BAL", l:11, zz:null, twin:null,
  h:["BEB","HALF"], a:["NACHT"], v:["ONG"], b:["GROND"], w:["ACT"],
  x:"gewone-bosspitsmuis",
  t:"De bosspitsmuis heeft rode tandpunten, kleine oren die in de vacht wegvallen, en een driekleurige vacht.",
  cs:[
    { bron:null, wn:[
      "Achterhoek, oktober.",
      "Een boerenerf met moestuin en schuren.",
      "Warme composthopen en stapels hout.",
      "Jongen lopen in een treintje; in kerkuilbraakballen zitten schedeltjes met witte tanden.",
      "Grote oren en losse haren op de staart."
    ] }
  ] },
{ id:"gewone-dwergvleermuis", no:34, g:"Z", n:"Gewone dwergvleermuis", s:"Pipistrellus pipistrellus", r:"HR", l:7, zz:null, twin:"ruige-dwergvleermuis",
  h:["BEB","HALF"], a:["NACHT"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"ruige-dwergvleermuis",
  t:"De ruige dwergvleermuis is iets groter, roept rond 38–40 kHz, en is vooral in de trektijd en bij water te vinden.",
  cs:[
    { bron:null, wn:[
      "Brabant, juni.",
      "Een nieuwbouwwijk met een stadspark en een vijver.",
      "Woningen met spouwmuren en open stootvoegen.",
      "Kleine, droge keutels onder een stootvoeg; detector: smakkende signalen, piek rond 45 kHz.",
      "Een heel kleine, donkere vleermuis."
    ] }
  ] },
{ id:"ruige-dwergvleermuis", no:35, g:"Z", n:"Ruige dwergvleermuis", s:"Pipistrellus nathusii", r:"HR", l:8, zz:null, twin:"gewone-dwergvleermuis",
  h:["MOER","BOS","STIL"], a:["NACHT"], v:["ONG"], b:["BOOM","GEB"], w:["TREK","SLAAP"],
  x:"gewone-dwergvleermuis",
  t:"De gewone dwergvleermuis is kleiner, roept rond 45 kHz, trekt niet en heeft grote kraamkolonies in woningen.",
  cs:[
    { bron:null, wn:[
      "Een veenplas, september.",
      "Moerasbos met els en wilg langs open water.",
      "Kasten en holtes in bomen langs de oever.",
      "Sociale roepen uit een kast; detector: piek rond 38–40 kHz.",
      "Een behaarde staartvlieghuid."
    ] }
  ] },
{ id:"rosse-vleermuis", no:36, g:"Z", n:"Rosse vleermuis", s:"Nyctalus noctula", r:"HR", l:13, zz:null, twin:null,
  h:["BOS","STIL"], a:["NACHT","SCHEMER"], v:["ONG"], b:["BOOM"], w:["SLAAP"],
  x:"laatvlieger",
  t:"De laatvlieger heeft brede vleugels, fladdert langzamer langs boomranden, roept rond 25–30 kHz en woont in gebouwen.",
  cs:[
    { bron:null, wn:[
      "Den Haag, mei.",
      "Een oud parkbos met grote beuken bij een vijver.",
      "Hoge spechtenholen in dikke stammen.",
      "Overdag gekwetter uit een hol; detector: ‘plip-plop’ rond 20 kHz.",
      "Smalle, puntige vleugels en een roodbruine vacht."
    ] }
  ] },
{ id:"meervleermuis", no:37, g:"Z", n:"Meervleermuis", s:"Myotis dasycneme", r:"HR", l:11, zz:null, twin:null,
  h:["STIL","STROOM"], a:["NACHT"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"watervleermuis",
  t:"De watervleermuis is kleiner, jaagt boven vijvers en smallere wateren, roept rond 45 kHz en heeft kraamkolonies in bomen.",
  cs:[
    { bron:null, wn:[
      "Friesland, juli.",
      "Open veenweide met brede vaarten en meren.",
      "Een dorp met oude woningen met spouwmuren, vlak bij het water.",
      "Een grote kolonie in een spouw; detector: piek rond 35 kHz, laag boven een vaart.",
      "Een grote Myotis met lange voeten."
    ] }
  ] },
{ id:"franjestaart", no:38, g:"Z", n:"Franjestaart", s:"Myotis nattereri", r:"HR", l:8, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT"], v:["ONG"], b:["BOOM","GEB"], w:["SLAAP"],
  x:"watervleermuis",
  t:"De watervleermuis heeft geen haarrand langs de staartvlieghuid, maar grote voeten, en jaagt laag boven het water.",
  cs:[
    { bron:null, wn:[
      "Fort van de Waterlinie, januari.",
      "Grachten, bomen en bos rond het fort.",
      "Koele, vochtige ruimtes met kieren in de muren.",
      "Vleermuizen in winterslaap diep in kieren; in de zomer zitten ze in boomholtes.",
      "Een rand van stijve haartjes langs de staartvlieghuid."
    ] }
  ] },
{ id:"ingekorven-vleermuis", no:39, g:"Z", n:"Ingekorven vleermuis", s:"Myotis emarginatus", r:"HR", l:9, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"franjestaart",
  t:"De franjestaart heeft geen inkeping in het oor, maar een haarrand langs de staartvlieghuid. Zijn kolonies zitten verborgen in kieren, niet open aan de nok.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, juli.",
      "Een dorp tussen hoogstamboomgaarden, weilanden en hellingbos.",
      "Een warme kerkzolder, en koeienstallen vol vliegen.",
      "Een dichte tros open aan de nok, met resten van spinnen eronder.",
      "Een inkeping in de buitenrand van het oor."
    ] }
  ] },
{ id:"tweekleurige-vleermuis", no:40, g:"Z", n:"Tweekleurige vleermuis", s:"Vespertilio murinus", r:"HR", l:11, zz:"ZZ", twin:null,
  h:["BEB","STIL"], a:["NACHT"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"laatvlieger",
  t:"De laatvlieger is groter, egaal donkerbruin zonder zilverige haarpunten, en heeft geen hoorbare baltszang.",
  cs:[
    { bron:null, wn:[
      "Oost-Nederland, november.",
      "Een stadswijk met hoogbouw naast een grote plas.",
      "Hoge gebouwen met gevelbekleding en kieren.",
      "Een hoorbaar, hoog getsjirp rond de flat; detector: piek rond 25 kHz.",
      "Zilvergrijze haarpunten op een donkere rug."
    ] }
  ] },
{ id:"grijze-grootoorvleermuis", no:41, g:"Z", n:"Grijze grootoorvleermuis", s:"Plecotus austriacus", r:"HR", l:9, zz:"ZZ", twin:"gewone-grootoorvleermuis",
  h:["HALF","BEB"], a:["NACHT"], v:["ONG"], b:["GEB"], w:["SLAAP"],
  x:"gewone-grootoorvleermuis",
  t:"De gewone grootoor is bruiner, heeft een lichter gezicht en een duim van meer dan 6 mm, en komt in heel Nederland voor, vooral bij bos.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, juli.",
      "Open, agrarisch landschap met akkers en boomgaarden.",
      "Een dorpskerk met een rustige zolder.",
      "Losse vlindervleugels onder een balk; op de detector vrijwel niets.",
      "Zeer lange oren, een donker gezicht en een duim korter dan 6 mm."
    ] }
  ] },
{ id:"gewone-grootoorvleermuis", no:42, g:"Z", n:"Gewone grootoorvleermuis", s:"Plecotus auritus", r:"HR", l:9, zz:null, twin:"grijze-grootoorvleermuis",
  h:["BOS","HALF","BEB"], a:["NACHT"], v:["ONG"], b:["GEB","BOOM"], w:["SLAAP"],
  x:"grijze-grootoorvleermuis",
  t:"De grijze grootoor heeft een grijzere vacht, een donker gezichtsmasker en een duim korter dan 6 mm, en komt vooral in het zuiden voor.",
  cs:[
    { bron:null, wn:[
      "Drenthe, juli. Een esdorp aan de rand van een boswachterij.",
      "Een erf met oude eiken en lindes, dat overgaat in loofbos met een dichte struiklaag.",
      "Een rustige kerkzolder met houten balken en een kleine opening onder de dakrand.",
      "Onder één balk losse vlindervleugels; op de detector is bijna niets te horen.",
      "Zeer lange oren en een duim langer dan 6 mm."
    ] }
  ] },
{ id:"noordse-woelmuis", no:43, g:"Z", n:"Noordse woelmuis", s:"Microtus oeconomus", r:"HR", l:18, zz:"ZZ", twin:"aardmuis",
  h:["MOER"], a:["DAG","NACHT"], v:["PLANT"], b:["VEG"], w:["ACT"],
  x:"aardmuis",
  t:"De aardmuis is iets kleiner, heeft een kortere staart en een ruigere, meer grijsbruine vacht. Hij leeft in vrijwel dezelfde habitat en verdringt de noordse woelmuis.",
  cs:[
    { bron:null, wn:[
      "Zuidwest-Friesland, mei. Laagveen langs een groot meer.",
      "Ruig rietland met zeggen en biezen, nauwelijks gemaaid.",
      "Lage, natte delen die bij hoog water onderlopen, met hogere pollen ertussen.",
      "Paadjes door de vegetatie, afgeknipte stukjes zegge en groene keutels van ±6 mm.",
      "Een donkere woelmuis met een staart van ongeveer een derde van de lichaamslengte."
    ] }
  ] },
{ id:"grijze-zeehond", no:44, g:"Z", n:"Grijze zeehond", s:"Halichoerus grypus", r:"BAL", l:220, zz:null, twin:null,
  h:["ZEE"], a:["DAG","NACHT"], v:["VIS"], b:["WATER"], w:["ACT"],
  x:"gewone-zeehond",
  t:"De gewone zeehond heeft een ronde ‘hondenkop’ met V-vormige neusgaten en jongt in juni–juli. Zijn jongen verliezen hun witte vacht al vóór de geboorte.",
  cs:[
    { bron:null, wn:[
      "Waddenzee, december. Bij een zeegat met sterke stroming.",
      "Hoge zandplaten die ook bij normaal hoogwater deels droog blijven.",
      "Rustige platen ver van vaargeulen, dicht bij open zee.",
      "Brede sleepsporen; een wollig, wit jong ligt alleen op de plaat.",
      "Langgerekte kop met parallelle neusgaten."
    ] }
  ] },
{ id:"zandhagedis", no:45, g:"R", n:"Zandhagedis", s:"Lacerta agilis", r:"HR", l:20, zz:null, twin:null,
  h:["HEI","DUIN"], a:["DAG"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"levendbarende-hagedis",
  t:"De levendbarende hagedis is slanker en bruiner, heeft geen witte oogvlekjes, en mannetjes hebben een oranje buik in plaats van groene flanken. Hij legt geen eieren.",
  cs:[
    { bron:null, wn:[
      "Drenthe, eind mei.",
      "Droge heide op zandgrond met struikhei en vliegdennen.",
      "Zuidgerichte randen met kale, open zandplekken.",
      "Kleine, schuine gangetjes in het zand en in juni gegraven kuiltjes.",
      "Groene flanken en rijen witte vlekjes over de rug."
    ] }
  ] },
{ id:"gladde-slang", no:46, g:"R", n:"Gladde slang", s:"Coronella austriaca", r:"HR", l:60, zz:null, twin:null,
  h:["HEI"], a:["DAG"], v:["GEW"], b:["GROND"], w:["SLAAP"],
  x:"adder",
  t:"De adder heeft een doorlopende zigzagband, een verticale spleetpupil en gekielde schubben.",
  cs:[
    { bron:null, wn:[
      "Veluwe, september.",
      "Heide met struikhei en pijpenstrootje.",
      "Een structuurrijke overgang van heide naar bos, met veel hagedissen.",
      "Een vervellingshuid met gladde, niet gekielde schubben.",
      "Ronde pupil en een donkere streep door het oog."
    ] }
  ] },
{ id:"adder", no:47, g:"R", n:"Adder", s:"Vipera berus", r:"BAL", l:60, zz:null, twin:null,
  h:["HEI","MOER"], a:["DAG"], v:["GEW"], b:["GROND"], w:["SLAAP"],
  x:"gladde-slang",
  t:"De gladde slang heeft geen doorlopende zigzagband, maar een ronde pupil, gladde schubben en een donkere streep door het oog.",
  cs:[
    { bron:null, wn:[
      "Dwingelderveld, maart.",
      "Natte en droge heide met pijpenstrootje en dennenopslag.",
      "Een beschutte zuidrand die vroeg in het jaar al warm wordt.",
      "Meerdere slangen dicht bij elkaar in de zon; in april duwen twee slangen tegen elkaar.",
      "Verticale spleetpupil en een zigzagband."
    ] }
  ] },
{ id:"ringslang", no:48, g:"R", n:"Ringslang", s:"Natrix helvetica", r:"BAL", l:90, zz:null, twin:null,
  h:["MOER","STIL"], a:["DAG"], v:["GEW","VIS"], b:["GROND"], w:["SLAAP"],
  x:"adder",
  t:"Ook een adder kan zwemmen, maar de ringslang heeft gele halvemaanvlekken in de nek, een ronde pupil en wordt veel groter.",
  cs:[
    { bron:null, wn:[
      "Vechtplassen, juli.",
      "Moerasbos, rietlanden en open water met veel kikkers.",
      "Bij een boerderij een grote mesthoop en composthopen.",
      "Lege, leerachtige eischalen in de composthoop; een slang zwemt met de kop boven water.",
      "Lichte halvemaanvlekken achter de kop."
    ] }
  ] },
{ id:"hazelworm", no:49, g:"R", n:"Hazelworm", s:"Anguis fragilis", r:"BAL", l:40, zz:null, twin:null,
  h:["BOS","HEI","HALF"], a:["SCHEMER","DAG"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"gladde-slang",
  t:"Een slang kan zijn ogen niet sluiten en kan zijn staart niet afwerpen. De hazelworm heeft beweegbare oogleden en een stijve, glanzende bouw.",
  cs:[
    { bron:null, wn:[
      "Achterhoek, juni.",
      "Bosranden en ruige bermen.",
      "Een dikke strooisellaag, houtstapels en vochtige plekken na regen.",
      "Onder een plank iets glanzends en koperkleurigs, zonder poten; de staart breekt af.",
      "Het dier knippert met zijn ogen."
    ] }
  ] },
{ id:"levendbarende-hagedis", no:50, g:"R", n:"Levendbarende hagedis", s:"Zootoca vivipara", r:"BAL", l:15, zz:null, twin:null,
  h:["HEI","MOER"], a:["DAG"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"zandhagedis",
  t:"De zandhagedis is gedrongener, heeft rijen witte oogvlekjes op de rug en groene flanken bij de mannetjes in het voorjaar, en legt eieren in warm zand.",
  cs:[
    { bron:null, wn:[
      "Drenthe, april.",
      "Hoogveenrestant met natte heide en veenmos.",
      "Pollen pijpenstrootje en een koel, vochtig microklimaat.",
      "In augustus piepkleine, zwarte jongen; nergens eieren te vinden.",
      "Een oranje buik met zwarte vlekjes."
    ] }
  ] },
{ id:"muurhagedis", no:51, g:"R", n:"Muurhagedis", s:"Podarcis muralis", r:"HR", l:20, zz:null, twin:null,
  h:["BEB"], a:["DAG"], v:["ONG"], b:["STEEN"], w:["SLAAP"],
  x:"zandhagedis",
  t:"De zandhagedis is gedrongener, leeft op zandgrond in heide en duinen en heeft rijen witte oogvlekjes in plaats van een netvormige tekening.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, mei. Een oude binnenstad.",
      "Vestingmuren van natuursteen.",
      "Muren op het zuiden met veel voegen en kieren.",
      "Hagedissen schieten de voegen in en rennen verticaal omhoog.",
      "Een netvormige tekening en een platte kop."
    ] }
  ] },
{ id:"kamsalamander", no:52, g:"A", n:"Kamsalamander", s:"Triturus cristatus", r:"HR", l:15, zz:null, twin:null,
  h:["STIL","HALF","BOS"], a:["NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"kleine-watersalamander",
  t:"De kleine watersalamander is kleiner (±9 cm), heeft een gladde huid, en bij het mannetje loopt de golvende kam door tot op de staart. De larven blijven dichter bij bodem en planten.",
  cs:[
    { bron:null, wn:[
      "Twente, april.",
      "Kleinschalig landschap met houtwallen en grasland.",
      "Een zonnige, visloze poel vol waterplanten.",
      "Dubbelgevouwen blaadjes met lichte eitjes; larven zweven midden in het water.",
      "Een wrattige, donkere huid en een oranje buik met zwarte vlekken."
    ] }
  ] },
{ id:"boomkikker", no:53, g:"A", n:"Boomkikker", s:"Hyla arborea", r:"HR", l:4.5, zz:null, twin:null,
  h:["HALF","STIL"], a:["NACHT","SCHEMER"], v:["ONG"], b:["VEG","WATER"], w:["SLAAP"],
  x:"poelkikker",
  t:"Groene kikkers zitten aan de waterkant in plaats van hoog in struiken, missen de kleefschijfjes en kwaken met kwaakblazen aan de zijkant van de bek.",
  cs:[
    { bron:null, wn:[
      "Achterhoek, mei.",
      "Coulisselandschap met bramenstruwelen.",
      "Ondiepe, zonbeschenen poelen zonder vis.",
      "Overdag dieren hoog in de bramen; ’s avonds een luid ‘kè-kè-kè’.",
      "Kleefschijfjes aan de tenen."
    ] }
  ] },
{ id:"rugstreeppad", no:54, g:"A", n:"Rugstreeppad", s:"Epidalea calamita", r:"HR", l:7, zz:null, twin:null,
  h:["DUIN","HEI"], a:["NACHT"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"gewone-pad",
  t:"De gewone pad heeft geen gele rugstreep, springt of loopt langzaam, legt eisnoeren met twee tot vier rijen eitjes in diepere wateren en roept zacht.",
  cs:[
    { bron:null, wn:[
      "Bouwlocatie, mei.",
      "Opgespoten zand met nauwelijks vegetatie.",
      "Tijdelijke, ondiepe plassen die snel opwarmen.",
      "Eisnoeren in een kale plas; op een warme avond een luid geratel.",
      "Een lichte streep over het midden van de rug."
    ] }
  ] },
{ id:"knoflookpad", no:55, g:"A", n:"Knoflookpad", s:"Pelobates fuscus", r:"HR", l:6, zz:"ZZ", twin:null,
  h:["OPEN","HEI"], a:["NACHT"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"gewone-pad",
  t:"De gewone pad heeft een horizontale pupil en geen hoornige graafschop, en zijn larven blijven klein en zwart.",
  cs:[
    { bron:null, wn:[
      "Noord-Brabant, april.",
      "Zandige akkers en een stuk heide.",
      "Een diepe, vegetatierijke poel naast losse, goed vergraafbare grond.",
      "Met een hydrofoon zacht geklok onder water; in juli zeer grote larven.",
      "Een verticale pupil en een hoornige graafschop."
    ] }
  ] },
{ id:"geelbuikvuurpad", no:56, g:"A", n:"Geelbuikvuurpad", s:"Bombina variegata", r:"HR", l:4.5, zz:null, twin:null,
  h:["STIL","BOS"], a:["DAG","NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"vroedmeesterpad",
  t:"De vroedmeesterpad heeft een verticale pupil en geen felgekleurde buik, en het mannetje draagt de eieren mee.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, juni.",
      "Een groeve en bospaden met kale, verdichte grond.",
      "Karrensporen en ondiepe plasjes vol regenwater.",
      "Losse eitjes in een modderig plasje; een zacht ‘oe… oe’.",
      "Een hartvormige pupil."
    ] }
  ] },
{ id:"vroedmeesterpad", no:57, g:"A", n:"Vroedmeesterpad", s:"Alytes obstetricans", r:"HR", l:5, zz:null, twin:null,
  h:["HALF","BEB"], a:["NACHT"], v:["ONG"], b:["STEEN","GROND"], w:["SLAAP"],
  x:"geelbuikvuurpad",
  t:"De geelbuikvuurpad heeft een hartvormige pupil en een gele buik met zwarte vlekken, en legt losse eitjes in tijdelijke plasjes.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, juni.",
      "Een oude mergelgroeve met stenige hellingen.",
      "Een vijver bij een boerderij en droge muren vol kieren.",
      "’s Nachts een helder fluitje; een mannetje met eisnoeren om de achterpoten.",
      "Klein, grijsbruin, met een verticale pupil."
    ] }
  ] },
{ id:"heikikker", no:58, g:"A", n:"Heikikker", s:"Rana arvalis", r:"HR", l:6.5, zz:null, twin:null,
  h:["HEI","MOER"], a:["DAG","NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"bruine-kikker",
  t:"De bruine kikker heeft een stompere snuit, een kleine, zachte knobbel aan de achterpoot en vaak een gevlekte buik, en kleurt niet blauw.",
  cs:[
    { bron:null, wn:[
      "Drenthe, maart.",
      "Natte heide en hoogveenrestanten.",
      "Zure, voedselarme vennen met ondiepe, zonnige oevers.",
      "Eiklompen dicht bij elkaar; onder water een zacht ‘woeb-woeb’.",
      "Een spitse snuit en een grote, harde knobbel aan de achterpoot."
    ] }
  ] },
{ id:"vuursalamander", no:59, g:"A", n:"Vuursalamander", s:"Salamandra salamandra", r:"BAL", l:17, zz:null, twin:null,
  h:["BOS","STROOM"], a:["NACHT"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"alpenwatersalamander",
  t:"De alpenwatersalamander is kleiner, leeft in het voorjaar in het water, heeft een egaal oranje buik en geen gele vlekken op de rug.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, oktober, regennacht.",
      "Hellingbos van beuk en eik.",
      "Bronnetjes en koele, kleine bronbeken.",
      "Larven met een lichte vlek bij elke poot in de beek; nergens eieren.",
      "Zwart met gele vlekken."
    ] }
  ] },
{ id:"gewone-pad", no:60, g:"A", n:"Gewone pad", s:"Bufo bufo", r:"BAL", l:10, zz:null, twin:null,
  h:["BOS","HALF","BEB"], a:["NACHT"], v:["ONG"], b:["GROND"], w:["SLAAP"],
  x:"rugstreeppad",
  t:"De rugstreeppad heeft een gele rugstreep en korte achterpoten, rent in plaats van te springen, legt eisnoeren met één of twee rijen eitjes in ondiepe plassen zonder vis, en roept luid ratelend.",
  cs:[
    { bron:null, wn:[
      "Gelderland, maart.",
      "Een bos met een weg erdoor en een vijver aan de overkant.",
      "Een diepe vijver met vis.",
      "Lange eisnoeren om waterplanten; langs de weg schermen met emmers.",
      "Een koperkleurig oog met horizontale pupil."
    ] }
  ] },
{ id:"bruine-kikker", no:61, g:"A", n:"Bruine kikker", s:"Rana temporaria", r:"BAL", l:8, zz:null, twin:null,
  h:["HALF","BOS","STIL"], a:["NACHT","DAG"], v:["ONG"], b:["GROND","WATER"], w:["SLAAP"],
  x:"heikikker",
  t:"De heikikker heeft een spitse snuit en een grote, harde knobbel aan de achterpoot, leeft in zure, voedselarme wateren, en de mannetjes kleuren in de paartijd blauw.",
  cs:[
    { bron:null, wn:[
      "Utrecht, februari.",
      "Weilanden met slootjes, en tuinen.",
      "Ondiep, stilstaand water met ijs langs de randen.",
      "Grote eiklompen, de eerste van het jaar; onder water een zacht gegrom.",
      "Een stompe snuit en een kleine, zachte knobbel aan de achterpoot."
    ] }
  ] },
{ id:"kleine-watersalamander", no:62, g:"A", n:"Kleine watersalamander", s:"Lissotriton vulgaris", r:"BAL", l:9, zz:null, twin:null,
  h:["STIL","HALF"], a:["NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"kamsalamander",
  t:"De kamsalamander is groter (±15 cm), heeft een wrattige, donkere huid en een getande kam die bij de staartwortel onderbroken is.",
  cs:[
    { bron:null, wn:[
      "Haarlem, april.",
      "Tuinen in een woonwijk.",
      "Een tuinvijver zonder vis, met waterplanten.",
      "Dubbelgevouwen blaadjes met eitjes; een mannetje met een golvende kam.",
      "Een gestippelde keel."
    ] }
  ] },
{ id:"alpenwatersalamander", no:63, g:"A", n:"Alpenwatersalamander", s:"Ichthyosaura alpestris", r:"BAL", l:10, zz:null, twin:null,
  h:["BOS","STIL"], a:["NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"vinpootsalamander",
  t:"De vinpootsalamander is kleiner, heeft een lichte, ongevlekte keel en een lichtgeel tot oranje streepje op de buik; mannetjes hebben donkere zwemvliezen en een draadje aan de staartpunt.",
  cs:[
    { bron:null, wn:[
      "Veluwe, april.",
      "Loofbos op de hogere zandgronden.",
      "Een koele, schaduwrijke bospoel zonder vis.",
      "Een mannetje met blauwe flanken; de dieren overwinteren in de bosbodem.",
      "Een oranje buik zonder vlekken."
    ] }
  ] },
{ id:"vinpootsalamander", no:64, g:"A", n:"Vinpootsalamander", s:"Lissotriton helveticus", r:"BAL", l:8, zz:null, twin:null,
  h:["HEI","BOS","STIL"], a:["NACHT"], v:["ONG"], b:["WATER","GROND"], w:["SLAAP"],
  x:"kleine-watersalamander",
  t:"De kleine watersalamander heeft een gestippelde keel; het mannetje heeft een hoge, golvende kam in plaats van een draadje aan de staart.",
  cs:[
    { bron:null, wn:[
      "De Kempen, april.",
      "Heide en bos op zandgrond.",
      "Een zuur, voedselarm ven met veenmos.",
      "Mannetjes met donkere achterpoten en een draadje aan de staartpunt.",
      "Een lichte, ongevlekte keel."
    ] }
  ] },
{ id:"poelkikker", no:65, g:"A", n:"Poelkikker", s:"Pelophylax lessonae", r:"HR", l:7, zz:null, twin:"middelste-groene-kikker",
  h:["STIL","HEI"], a:["DAG"], v:["ONG"], b:["WATER"], w:["SLAAP"],
  x:"meerkikker",
  t:"De meerkikker is veel groter, heeft grijze kwaakblazen en een kleine knobbel aan de achterpoot, en overwintert in het water.",
  cs:[
    { bron:null, wn:[
      "Veluwe, mei.",
      "Heide en bos op voedselarme zandgrond.",
      "Een voedselarm ven met een zonnige oever.",
      "Een luid, snorrend koor met witte kwaakblazen; ’s winters niet in het water.",
      "Een grote, halvemaanvormige knobbel aan de achterpoot."
    ] }
  ] },
{ id:"meerkikker", no:66, g:"A", n:"Meerkikker", s:"Pelophylax ridibundus", r:"BAL", l:11, zz:null, twin:null,
  h:["STIL","STROOM"], a:["DAG"], v:["ONG","GEW"], b:["WATER"], w:["SLAAP"],
  x:"poelkikker",
  t:"De poelkikker is kleiner, heeft witte kwaakblazen en een grote, halvemaanvormige knobbel aan de achterpoot, en overwintert op het land.",
  cs:[
    { bron:null, wn:[
      "Zuid-Holland, juni.",
      "Een polder met brede boezemwateren.",
      "Groot, open en voedselrijk water.",
      "Een luid geratel met grijze kwaakblazen; ’s winters op de bodem van het water.",
      "Groot, met een kleine knobbel aan de achterpoot."
    ] }
  ] },
{ id:"grote-modderkruiper", no:67, g:"F", n:"Grote modderkruiper", s:"Misgurnus fossilis", r:"BAL", l:25, zz:null, twin:null,
  h:["STIL","MOER"], a:["NACHT","SCHEMER"], v:["ONG"], b:["WATER"], w:["ACT"],
  x:"kleine-modderkruiper",
  t:"De kleine modderkruiper heeft zes korte baarddraden en een rij donkere vlekken langs de flank, en leeft op zandige bodems in helder water. Hij valt niet onder de soortenbescherming.",
  cs:[
    { bron:null, wn:[
      "Zuid-Holland, juni. Een veenpolder.",
      "Kleine slootjes met krabbescheer en veel waterplanten.",
      "Een dikke laag organische modder en ’s zomers bijna geen zuurstof.",
      "Een positief eDNA-monster; diep in de modder kronkelt een langgerekte vis.",
      "Tien baarddraden."
    ] }
  ] },
{ id:"beekprik", no:68, g:"F", n:"Beekprik", s:"Lampetra planeri", r:"BAL", l:14, zz:null, twin:null,
  h:["STROOM"], a:["NACHT"], v:["PLANT"], b:["WATER"], w:["ACT"],
  x:"rivierprik",
  t:"De rivierprik trekt naar zee, wordt veel groter (±30–40 cm) en paait als volwassen dier in grotere rivieren. Hij valt niet onder de soortenbescherming van de Omgevingswet.",
  cs:[
    { bron:null, wn:[
      "Veluwe, april.",
      "Een koude sprengenbeek onder een bladerdak.",
      "Grindbanken afgewisseld met slibrijke plekken.",
      "Kleine kuiltjes in het grind; in het slib blinde, wormachtige larven.",
      "Geen kaken, maar een zuigmond."
    ] }
  ] },
{ id:"kwabaal", no:69, g:"F", n:"Kwabaal", s:"Lota lota", r:"BAL", l:45, zz:null, twin:null,
  h:["STROOM","STIL"], a:["NACHT"], v:["VIS","ONG"], b:["WATER"], w:["ACT"],
  x:"aal",
  t:"De aal heeft geen baarddraad en geen afzonderlijke rugvinnen: rug-, staart- en aarsvin lopen in één zoom door.",
  cs:[
    { bron:null, wn:[
      "IJssel, januari.",
      "Uiterwaarden met strangen en kribvakken.",
      "IJskoud, helder water; in het voorjaar ondergelopen graslanden.",
      "Overdag verscholen onder stenen; paai juist in de koudste weken.",
      "Eén baarddraad aan de kin."
    ] }
  ] },
{ id:"elrits", no:70, g:"F", n:"Elrits", s:"Phoxinus phoxinus", r:"BAL", l:9, zz:null, twin:null,
  h:["STROOM"], a:["DAG"], v:["ONG"], b:["WATER"], w:["ACT"],
  x:"gestippelde-alver",
  t:"De gestippelde alver is hoger gebouwd en heeft een opvallende dubbele rij donkere stippen langs de zijlijn.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, mei.",
      "Een ondiepe, schaduwrijke beek.",
      "Helder, zuurstofrijk water over grind.",
      "Scholen kleine visjes; mannetjes met een rode buik.",
      "Zeer fijne schubben en een donkere lengteband."
    ] }
  ] },
{ id:"beekdonderpad", no:71, g:"F", n:"Beekdonderpad", s:"Cottus rhenanus", r:"BAL", l:12, zz:null, twin:"rivierdonderpad",
  h:["STROOM"], a:["NACHT"], v:["ONG"], b:["WATER"], w:["ACT"],
  x:"rivierdonderpad",
  t:"De rivierdonderpad lijkt sterk op de beekdonderpad, maar leeft in grote rivieren, kanalen en meren, vaak tussen stortsteen. Hij valt niet onder de soortenbescherming van de Omgevingswet.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, maart.",
      "Een snelstromende beek in het heuvelland.",
      "Een stenige bodem, stroomopwaarts van een stuw.",
      "Oranje eitjes onder een platte steen; de vis hipt over de bodem.",
      "Een brede, platte kop en waaiervormige borstvinnen."
    ] }
  ] },
{ id:"gestippelde-alver", no:72, g:"F", n:"Gestippelde alver", s:"Alburnoides bipunctatus", r:"BAL", l:12, zz:"ZZ", twin:null,
  h:["STROOM"], a:["DAG"], v:["ONG"], b:["WATER"], w:["ACT"],
  x:"elrits",
  t:"De elrits is ronder en kleiner, heeft zeer fijne schubben en een donkere lengteband, maar geen dubbele stippenrij langs de zijlijn.",
  cs:[
    { bron:null, wn:[
      "Zuid-Limburg, juni.",
      "Een snelstromende beek.",
      "Grindbanken afgewisseld met diepere kuilen.",
      "Een school zilverachtige visjes van ±10 cm boven grind.",
      "Een dubbele rij stippen langs de zijlijn."
    ] }
  ] },
{ id:"noordzeehouting", no:73, g:"F", n:"Noordzeehouting", s:"Coregonus oxyrinchus", r:"HR", l:40, zz:null, twin:null,
  h:["ZEE","STROOM","STIL"], a:["DAG"], v:["ONG"], b:["WATER"], w:["ACT"],
  x:"spiering",
  t:"De spiering is kleiner, heeft een grote bek met tanden en geen spitse, overhangende snuit, en ruikt naar komkommer.",
  cs:[
    { bron:null, wn:[
      "Afsluitdijk, november.",
      "De overgang van zout Waddenwater naar het zoete IJsselmeer.",
      "De spuisluizen, waar zoet water naar zee stroomt.",
      "Zilverachtige vissen verzamelen zich om naar zoet water te trekken.",
      "Een kleine vetvin en een spitse, overhangende snuit."
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
{ id:"veldmuis", no:null, g:"Z", n:"Veldmuis", s:"Microtus arvalis", r:"BAL", l:13, zz:null, twin:null,
  h:["OPEN"], a:["DAG","NACHT"], v:["PLANT"], b:["HOL"], w:["ACT"] },
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
{ id:"gewone-baardvleermuis", no:null, g:"B", n:"Gewone baardvleermuis", s:"Myotis mystacinus", r:"HR", l:8, zz:null, twin:null,
  h:["BOS","HALF"], a:["NACHT"], v:["ONG"], b:["GEB","BOOM"], w:["SLAAP"] },
{ id:"amerikaanse-brulkikker", no:null, g:"A", n:"Amerikaanse brulkikker", s:"Lithobates catesbeianus", r:"NB", l:15, zz:null, twin:null,
  h:["STIL"], a:["NACHT","DAG"], v:["GEW","ONG"], b:["WATER"], w:["SLAAP"] },
{ id:"roodwangschildpad", no:null, g:"R", n:"Roodwangschildpad", s:"Trachemys scripta", r:"NB", l:25, zz:null, twin:null,
  h:["STIL","BEB"], a:["DAG"], v:["ONG","PLANT"], b:["WATER"], w:["SLAAP"] },
{ id:"europese-steur", no:null, g:"F", n:"Europese steur", s:"Acipenser sturio", r:"HR", l:200, zz:null, twin:null,
  h:["STROOM","ZEE"], a:["NACHT","DAG"], v:["ONG"], b:["WATER"], w:["ACT"] },
{ id:"kleine-modderkruiper", no:null, g:"F", n:"Kleine modderkruiper", s:"Cobitis taenia", r:"NB", l:10, zz:null, twin:null,
  h:["STIL","STROOM"], a:["NACHT"], v:["ONG"], b:["WATER"], w:["ACT"] },
{ id:"bittervoorn", no:null, g:"F", n:"Bittervoorn", s:"Rhodeus amarus", r:"NB", l:7, zz:null, twin:null,
  h:["STIL"], a:["DAG"], v:["PLANT","ONG"], b:["WATER"], w:["ACT"] },
{ id:"snoek", no:null, g:"F", n:"Snoek", s:"Esox lucius", r:"NB", l:80, zz:null, twin:null,
  h:["STIL","MOER"], a:["DAG","SCHEMER"], v:["VIS"], b:["WATER"], w:["ACT"] },
{ id:"aal", no:null, g:"F", n:"Aal", s:"Anguilla anguilla", r:"NB", l:70, zz:null, twin:null,
  h:["STIL","STROOM"], a:["NACHT"], v:["ONG","VIS"], b:["WATER"], w:["ACT"] },
{ id:"boomklever", no:null, g:"B", n:"Boomklever", s:"Sitta europaea", r:"VR", l:14, zz:null, twin:null,
  h:["BOS"], a:["DAG"], v:["ONG","PLANT"], b:["BOOM"], w:["ACT"] },
{ id:"kauw", no:null, g:"B", n:"Kauw", s:"Corvus monedula", r:"VR", l:34, zz:null, twin:null,
  h:["BEB","HALF"], a:["DAG"], v:["ONG","PLANT"], b:["GEB","BOOM"], w:["ACT"] },
{ id:"zwarte-kraai", no:null, g:"B", n:"Zwarte kraai", s:"Corvus corone", r:"VR", l:47, zz:null, twin:null,
  h:["OPEN","BEB"], a:["DAG"], v:["ONG","PLANT","GEW"], b:["BOOM"], w:["ACT"] },
{ id:"grauwe-gans", no:null, g:"B", n:"Grauwe gans", s:"Anser anser", r:"VR", l:80, zz:null, twin:null,
  h:["MOER","OPEN"], a:["DAG"], v:["PLANT"], b:["VEG"], w:["ACT"] },
{ id:"tuimelaar", no:null, g:"Z", n:"Tuimelaar", s:"Tursiops truncatus", r:"HR", l:300, zz:null, twin:null,
  h:["ZEE"], a:["DAG","NACHT"], v:["VIS"], b:["WATER"], w:["ACT"] },
{ id:"huiskat", no:null, g:"Z", n:"Huiskat", s:"Felis catus", r:"NB", l:75, zz:null, twin:null,
  h:["BEB","HALF"], a:["NACHT","SCHEMER"], v:["GEW"], b:["GEB"], w:["ACT"] },
{ id:"beverrat", no:null, g:"Z", n:"Beverrat", s:"Myocastor coypus", r:"NB", l:90, zz:null, twin:null,
  h:["STIL","MOER"], a:["SCHEMER","NACHT"], v:["PLANT"], b:["HOL"], w:["ACT"] },
{ id:"middelste-groene-kikker", no:null, g:"A", n:"Middelste groene kikker", s:"Pelophylax kl. esculentus", r:"BAL", l:9, zz:null, twin:null,
  h:["STIL"], a:["DAG"], v:["ONG"], b:["WATER"], w:["SLAAP"] },
{ id:"rivierprik", no:null, g:"F", n:"Rivierprik", s:"Lampetra fluviatilis", r:"NB", l:35, zz:null, twin:null,
  h:["STROOM","ZEE"], a:["NACHT"], v:["GEW"], b:["WATER"], w:["ACT"] },
{ id:"rivierdonderpad", no:null, g:"F", n:"Rivierdonderpad", s:"Cottus perifretum", r:"NB", l:12, zz:null, twin:null,
  h:["STROOM","STIL"], a:["NACHT"], v:["ONG"], b:["WATER"], w:["ACT"] },
{ id:"spiering", no:null, g:"F", n:"Spiering", s:"Osmerus eperlanus", r:"NB", l:20, zz:null, twin:null,
  h:["STIL","ZEE"], a:["DAG"], v:["ONG","VIS"], b:["WATER"], w:["ACT"] },
{ id:"witte-kwikstaart", no:null, g:"B", n:"Witte kwikstaart", s:"Motacilla alba", r:"VR", l:18, zz:null, twin:null,
  h:["BEB","OPEN"], a:["DAG"], v:["ONG"], b:["GEB"], w:["ACT","TREK"] },
{ id:"roodborsttapuit", no:null, g:"B", n:"Roodborsttapuit", s:"Saxicola rubicola", r:"VR", l:12, zz:null, twin:null,
  h:["HEI","DUIN"], a:["DAG"], v:["ONG"], b:["VEG"], w:["ACT","TREK"] },
{ id:"grutto", no:null, g:"B", n:"Grutto", s:"Limosa limosa", r:"VR", l:40, zz:null, twin:null,
  h:["OPEN"], a:["DAG"], v:["ONG"], b:["GROND"], w:["TREK"] },
{ id:"merel", no:null, g:"B", n:"Merel", s:"Turdus merula", r:"VR", l:25, zz:null, twin:null,
  h:["BEB","BOS","HALF"], a:["DAG"], v:["ONG","PLANT"], b:["VEG"], w:["ACT"] },
{ id:"houtduif", no:null, g:"B", n:"Houtduif", s:"Columba palumbus", r:"VR", l:41, zz:null, twin:null,
  h:["BEB","OPEN","BOS"], a:["DAG"], v:["PLANT"], b:["BOOM"], w:["ACT"] }
];
