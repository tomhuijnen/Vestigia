/* Vestigia – dwaalgasten (update 9)
   Eén keer per kalendermaand krijgt elke speler op een eigen, willekeurige dag een dwaalgast: een zeer zeldzaam dier
   dat normaal niet in Nederland leeft. De server bepaalt de dag, welke dwaalgast het is en of de antwoorden kloppen
   (supabase-014); de vragen komen ook van de server. Hier staat alleen wat de app over het dier laat zien.
   ‘gezien’ = korte notitie ‘Gezien in Nederland’, na afloop. Nog na te lopen tegen de bronnen. */
"use strict";
const DWAALGASTEN = {
  "lynx": { naam: "Lynx", s: "Lynx lynx", groep: "zoogdier", waar: "Bossen en berggebieden van Europa en Azië",
    gezien: "In Nederland leeft al eeuwen geen lynx meer. Af en toe wordt er een gemeld, vaak een ontsnapt dier. In de Eifel, het Pfälzerwald en de Vogezen leven weer lynxen, dus een zwervend dier kan ons land in principe bereiken.",
    bron: "Zoogdiervereniging" },
  "walrus": { naam: "Walrus", s: "Odobenus rosmarus", groep: "zoogdier", waar: "Pakijs en kusten rond de Noordpool",
    gezien: "In 2021 zwom het walrusvrouwtje Freya langs de Waddeneilanden en rustte ze een tijd uit op een onderzeeboot in Den Helder. Daarvoor was er in 1998 een walrus bij Ameland.",
    bron: "Zoogdiervereniging" },
  "beloega": { naam: "Beloega", s: "Delphinapterus leucas", groep: "zoogdier", waar: "Arctische en subarctische zeeën",
    gezien: "In 1966 zwom de beloega ‘Moby Dick’ de Rijn op tot in Duitsland en via Nederland weer terug naar zee. Sindsdien is er af en toe een gemeld voor de Nederlandse kust.",
    bron: "Zoogdiervereniging" },
  "lammergier": { naam: "Lammergier", s: "Gypaetus barbatus", groep: "vogel", waar: "Hooggebergte, zoals de Alpen en de Pyreneeën",
    gezien: "Een uitzonderlijke gast. In 2020 vloog de geringde lammergier ‘Vigo’ uit het Alpenproject over Nederland en België, en daarna werden er nog enkele gezien.",
    bron: "Sovon, Vogelbescherming" },
  "sneeuwuil": { naam: "Sneeuwuil", s: "Bubo scandiacus", groep: "vogel", waar: "De arctische toendra",
    gezien: "Een zeer zeldzame wintergast uit het hoge noorden. Hij wordt hooguit eens in de paar jaar gezien, meestal op de Waddeneilanden of langs de kust.",
    bron: "Sovon, Vogelbescherming" },
  "scharrelaar": { naam: "Scharrelaar", s: "Coracias garrulus", groep: "vogel", waar: "Zuid- en Oost-Europa; overwintert in Afrika",
    gezien: "Een zeldzame doortrekker, vooral in het voorjaar en de nazomer. Er worden er hooguit een paar per jaar gezien, en vaak blijven ze maar kort.",
    bron: "Sovon, Vogelbescherming" },
  "lederschildpad": { naam: "Lederschildpad", s: "Dermochelys coriacea", groep: "reptiel", waar: "Open oceanen; legt eieren op tropische stranden",
    gezien: "Af en toe wordt er een levende gezien in de Noordzee of de Zeeuwse wateren, meestal in de nazomer. Soms spoelt er een dode aan.",
    bron: "RAVON" },
  "zwaardvis": { naam: "Zwaardvis", s: "Xiphias gladius", groep: "vis", waar: "Warme en gematigde oceanen, ook de Middellandse Zee",
    gezien: "Een oceaanvis die hier vrijwel nooit komt. De zeldzame keren dat er een in Nederland werd gevonden, was hij gestrand of in een visnet beland.",
    bron: "RAVON" },
  "oleanderpijlstaart": { naam: "Oleanderpijlstaart", s: "Daphnis nerii", groep: "vlinder", waar: "Rond de Middellandse Zee, in Afrika en Zuid-Azië",
    gezien: "Een zeldzame trekvlinder die hooguit enkele keren per jaar wordt gezien, meestal in de zomer. In warme jaren zijn er ook rupsen op oleander gevonden.",
    bron: "De Vlinderstichting" },
  "grote-trap": { naam: "Grote trap", s: "Otis tarda", groep: "vogel", waar: "Open steppen en akkers, zoals in Spanje, Hongarije en Oost-Duitsland",
    gezien: "In de strenge winter van 1978/79 kwamen er tientallen naar Nederland. Nu is het een zeer zeldzame gast; dieren met kleurringen komen uit een Duits herintroductieproject.",
    bron: "Sovon, Vogelbescherming" }
};
const DWAALGAST_VOLGORDE = Object.keys(DWAALGASTEN);
