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
| `js/profiel.js` | eikels, avatars, Mijn profiel (kiezen uit wat je hebt), shop (kopen, goedkoop naar duur) en prestaties met eikels |
| `js/wachtrij.js` | wachtrij voor pop-ups: nooit twee tegelijk; herinnering om een avatar te kiezen (update 8) |
| `data/advent.js` | winterweetjes voor de adventkalender (update 8) |
| `js/kerst.js` | kerstmuts, sneeuw en adventkalender van 1 december t/m 6 januari; testen met `?kerst=demo&dag=12` (update 8) |
| `data/dwaalgasten.js` | de tien dwaalgasten: naam, waar ze normaal leven en ‘Gezien in Nederland’ (update 9); vragen en antwoorden staan in Supabase |
| `js/dwaalgast.js` | dwaalgast van de maand: rode pop-up, drie vragen, uitslag, en de verborgen pagina Dwaalgasten in het Vestiarium; voorbeeld met `?dwaalgast=demo&gast=lynx` (update 9) |
| `js/app.js` | spelregels, kop, installeren en opstarten |
| `sw.js` | service worker (offline en updates) |

De databasescripts (001 t/m 014) staan bewust niet in deze repo, maar in het Project Vestigia.

## Werkwijze bij een wijziging

1. Pas de data of code aan.
2. `node tools/controle.mjs` – controleert de soortdata, casussen, maanden, tweelingen, zeldzaamheid, verraderwoorden, het dagschema en of er niets verschoven is ten opzichte van wat live staat.
3. Nieuwe soorten of casussen? `node tools/dagschema.mjs JJJJ-MM-DD` vult het dagschema aan. Bestaande dagen veranderen nooit.
4. `node tools/versie.mjs` – nieuw versienummer, anders krijgen geïnstalleerde apps de update niet.
5. `node tools/controle.mjs --vastleggen` – legt id's, platennummers, casussen en het dagschema vast voor de volgende controle.

Spelregels voor de data: een `id` en een platennummer (`no`) veranderen nooit; nieuwe platen en casussen komen achteraan; een oude naam gaat in `ALIASES`. Zo verliest niemand ooit voortgang.
