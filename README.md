# Vestigia

Determinatiespel over beschermde fauna van Nederland: herken de soort aan habitat en sporen. Vijf waarnemingen, vijf pogingen.

- Speel: https://tomhuijnen.github.io/Vestigia/
- Installeerbaar als app (PWA) en offline speelbaar.
- Ranglijst en foutmeldingen via Supabase (`config.js`).

## Opbouw

| Bestand | Inhoud |
|---|---|
| `index.html` | de pagina zelf |
| `css/vestigia.css` | opmaak |
| `data/teksten.js` | namen in beeld (Vestiarium, Streeplijst, eikels); een andere naam is hier één aanpassing |
| `data/soorten.js` | alle soorten, kenmerken en casussen (uitleg van de velden bovenin het bestand); diergroepen: zoogdieren, reptielen, amfibieën, vissen, vogels en vlinders |
| `data/sporen.js` | pootafdrukken en loopsporen voor de openingsanimatie (das, vos, ree, wild zwijn, boommarter) |
| `data/dagschema.js` | de vaste dagcasus per dag; niet met de hand wijzigen |
| `js/kern.js` | soorten, dagschema, opslag en de omzetting van oude opslag, titels, logboek |
| `js/spel.js` | het spel: casus spelen, tabel, invoer, modi |
| `js/veldboek.js` | veldboek, trofeeën, voortgangscode |
| `js/melden.js` | ‘Meld een fout’ |
| `js/kop.js` | kop met tegels, schakelaar klassiek/expert, menu onder je avatar, schermwissels en de smalle balk bij scrollen |
| `js/spelen.js` | tabbalk onderin (Ranglijst · Spelen · Vestiarium), speelkring met bolletjes boven Spelen, oefenkader per diergroep, uitleg over tweelingsoorten |
| `js/opening.js` | openingsanimatie: drie wandelsporen en ‘Vestigia’ groot in beeld (één keer per sessie, nooit het spoor van de dagcasus) |
| `js/uitleg.js` | uitleg bij de eerste keer, en via het menu |
| `js/online.js` | ranglijst en synchronisatie met Supabase |
| `js/league.js` | uitnodigen en leagues, en de links `?van=` en `?league=` |
| `data/avatars.js` | de 29 avatartekeningen, waarvan 10 medaille-avatars in kleur (prijzen staan in Supabase) |
| `js/profiel.js` | eikels, avatars, Mijn profiel (kiezen uit wat je hebt), shop (kopen, goedkoop naar duur) en prestaties met eikels; per achtergrondkleur een eigen tint voor de details van een avatar (update 19, `KLEUREN` en `avatarTekening`) |
| `js/wachtrij.js` | wachtrij voor pop-ups: nooit twee tegelijk; herinnering om een avatar te kiezen (update 8) |
| `data/advent.js` | winterweetjes voor de adventkalender (update 8) |
| `js/kerst.js` | kerstmuts, sneeuw en adventkalender van 1 december t/m 6 januari; testen met `?kerst=demo&dag=12` (update 8) |
| `data/dwaalgasten.js` | de tien dwaalgasten: naam, waar ze normaal leven en ‘Gezien in Nederland’ (update 9); vragen en antwoorden staan in Supabase |
| `js/dwaalgast.js` | dwaalgast van de maand: rode pop-up, drie vragen, uitslag, en de verborgen pagina Dwaalgasten in het Vestiarium; voorbeeld met `?dwaalgast=demo&gast=lynx` (update 9) |
| `js/levels.js` | levels en ervaringspunten (update 10, vanaf 16 november 2026): ring om je avatar met levelbolletje, ‘+XP’ na een spel, level-omhoog-pop-up, levelkaart in Mijn profiel; voorbeeld met `?levels=demo` |
| `data/zoekgroepen.js` | zoeken op een groep: ‘uil’, ‘hert’, ‘vlinder’, ‘roofvogel’ … geven alle soorten uit die groep (update 12); soorten die alleen via hun naam passen (‘vogel’ → kleine ijsvogelvlinder) staan los eronder onder ‘Andere soorten’ (update 19) |
| `data/bronnen.js` | links na het determineren: soortpagina van de bron (Zodion, RAVON, Vogelbescherming, De Vlinderstichting) en de fotopagina op waarneming.nl (soortnummers in `WAARNEMING`); afwijkende adressen in `BRON_LOS` (update 12) |
| `js/statistiek.js` | statistieken via het menu: gespeeld, goed/fout, vaakst tegengekomen en ingevoerd, dwaalgasten, actieve maanden (update 12); ‘Vaakst verward’ met alleen soorten die op elkaar lijken en ‘Oefen deze soorten’ (update 19, regels in `lijktOp` in `js/veldboek.js`) |
| `js/duel.js` | spelersduel (update 16, vanaf 23 november 2026; eerder voor de testers in Supabase): uitdagen op naam of met een link (`?duel=CODE`), drie casussen in het gewone spelscherm (`S.mode = "duel"`), lijst met je duels, pop-up bij een uitdaging en de uitslag casus voor casus; voorbeeld van de uitslag met `?duel=demo` |
| `js/app.js` | spelregels, kop, installeren en opstarten |
| `sw.js` | service worker (offline en updates) |

Contrast van alle avatars op alle achtergrondkleuren nameten: `node tools/avatarcontrast.mjs --html overzicht.html` (heeft Playwright met Chrome nodig).

De databasescripts (001 t/m 018) staan bewust niet in deze repo, maar in het Project Vestigia.

Casussen voor het spelersduel: de server kiest ze uit de tabel `duel_casussen`. Komen er soorten of casussen bij, draai dan `node tools/duelcasussen.mjs` en plak de uitvoer in Supabase (SQL Editor), anders kunnen die casussen nog niet in een duel komen.

## Werkwijze bij een wijziging

1. Pas de data of code aan.
2. `node tools/controle.mjs` – controleert de soortdata, casussen, maanden, tweelingen, zeldzaamheid, verraderwoorden, het dagschema en of er niets verschoven is ten opzichte van wat live staat.
3. Nieuwe soorten of casussen? `node tools/dagschema.mjs JJJJ-MM-DD` vult het dagschema aan. Bestaande dagen veranderen nooit.
4. `node tools/versie.mjs` – nieuw versienummer, anders krijgen geïnstalleerde apps de update niet.
5. `node tools/controle.mjs --vastleggen` – legt id's, platennummers, casussen en het dagschema vast voor de volgende controle.

Spelregels voor de data: een `id` en een platennummer (`no`) veranderen nooit; nieuwe platen en casussen komen achteraan; een oude naam gaat in `ALIASES`. Zo verliest niemand ooit voortgang.
