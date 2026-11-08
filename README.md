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
| `data/soorten.js` | alle soorten, kenmerken en casussen (uitleg van de velden bovenin het bestand) |
| `data/sporen.js` | pootafdrukken en loopsporen voor de openingsanimatie (das, vos, ree, wild zwijn, boommarter) |
| `data/dagschema.js` | de vaste dagcasus per dag; niet met de hand wijzigen |
| `js/kern.js` | soorten, dagschema, opslag en de omzetting van oude opslag, titels, logboek |
| `js/spel.js` | het spel: casus spelen, tabel, invoer, modi |
| `js/veldboek.js` | veldboek, trofeeën, voortgangscode |
| `js/melden.js` | ‘Meld een fout’ |
| `js/kop.js` | kop met tegels, schakelaar klassiek/expert, menu en de smalle balk bij scrollen |
| `js/opening.js` | openingsanimatie (één keer per sessie, nooit het spoor van de dagcasus) |
| `js/uitleg.js` | uitleg bij de eerste keer, en via het menu |
| `js/online.js` | ranglijst en synchronisatie met Supabase |
| `js/app.js` | spelregels, kop, installeren en opstarten |
| `sw.js` | service worker (offline en updates) |

Het databasescript staat bewust niet in deze repo, maar in het Project Vestigia.

## Werkwijze bij een wijziging

1. Pas de data of code aan.
2. `node tools/controle.mjs` – controleert de soortdata, casussen, maanden, tweelingen, zeldzaamheid, verraderwoorden, het dagschema en of er niets verschoven is ten opzichte van wat live staat.
3. Nieuwe soorten of casussen? `node tools/dagschema.mjs JJJJ-MM-DD` vult het dagschema aan. Bestaande dagen veranderen nooit.
4. `node tools/versie.mjs` – nieuw versienummer, anders krijgen geïnstalleerde apps de update niet.
5. `node tools/controle.mjs --vastleggen` – legt id's, platennummers, casussen en het dagschema vast voor de volgende controle.

Spelregels voor de data: een `id` en een platennummer (`no`) veranderen nooit; nieuwe platen en casussen komen achteraan; een oude naam gaat in `ALIASES`. Zo verliest niemand ooit voortgang.
