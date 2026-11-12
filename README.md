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
| `js/uitleg.js` | uitleg bij de eerste keer (vijf stappen, een rondleiding voor nieuwe spelers), en via het menu |
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
| `js/apparaat.js` | ‘Gebruik de app!’ en ‘Koppel je apparaten’ in Mijn profiel (update 21): installeren per apparaat, koppelen met een korte code van 6 tekens of een QR-code (10 minuten geldig, `#code=…`), anoniem apparaatnummer; voorbeeld met `?apparaat=demo` |
| `js/push.js` | pushmeldingen (update 18): de vraag na 3 dagcasussen (via de wachtrij), de schakelaar ‘Seintje om 19:00’ in het menu, aan- en afmelden per apparaat; testen met `?push=demo` (dan ook ‘Stuur een testmelding’ in het menu). Het versturen gebeurt op de server: `supabase/functions/dagcasus-push` (Edge Function) en supabase-020; aan voor iedereen met `push_instellingen.actief` |
| `js/week.js` | ‘Je week in Vestigia’ en het league-kroontje (update 25): op maandag of dinsdag één pop-up met je eindplaats van vorige week in de weekranglijst en je leagues (hooguit 2, plaats alleen in de top 10, ▲/▼ alleen als je de week ervoor ook geplaatst was), met de mijlpalen podium en weekwinnaar; kroontje achter de naam voor de top 3 van vorige week in een league. Rekent met `leaderboard_range` en `league_board`, dus geen SQL. Voorbeeld met `?week=demo` (`&plek=1`, `&plek=12`) |
| `js/qrcode.js` | QR-codes maken: qrcode-generator 1.4.4 van Kazuhiko Arase (MIT-licentie, ongewijzigd) |
| `js/app.js` | spelregels, kop, installeren en opstarten |
| `sw.js` | service worker (offline, updates en het tonen van pushmeldingen) |

Groene opstartbeelden voor iPhone en iPad (in plaats van het zwarte scherm bij het openen) opnieuw maken, bijvoorbeeld als er een nieuw iPhone-formaat bij komt: `node tools/opstartbeelden.mjs` (schermmaten in `SCHERMEN`; schrijft `icons/opstart/` en de regels in `index.html`).

Contrast van alle avatars op alle achtergrondkleuren nameten: `node tools/avatarcontrast.mjs --html overzicht.html` (heeft Playwright met Chrome nodig).

De databasescripts (001 t/m 019) staan bewust niet in deze repo, maar in het Project Vestigia.

Casussen voor het spelersduel: de server kiest ze uit de tabel `duel_casussen`. Komen er soorten of casussen bij, draai dan `node tools/duelcasussen.mjs` en plak de uitvoer in Supabase (SQL Editor), anders kunnen die casussen nog niet in een duel komen.

## Werkwijze bij een wijziging

1. Pas de data of code aan.
2. `node tools/controle.mjs` – controleert de soortdata, casussen, maanden, tweelingen, zeldzaamheid, verraderwoorden, het dagschema en of er niets verschoven is ten opzichte van wat live staat.
3. Nieuwe soorten of casussen? `node tools/dagschema.mjs JJJJ-MM-DD` vult het dagschema aan. Bestaande dagen veranderen nooit.
4. Iets nieuws in de app? Kijk de uitleg bij de eerste keer na (`js/uitleg.js`): hoort het erin, en is het voor een volledig nieuwe speler nog te volgen, logisch en duidelijk? Hooguit vijf stappen; iets nieuws krijgt een bijzin in een bestaande stap of uitleg op het moment zelf. Een melding ‘nieuw / staat nu hier’ (`Nieuw.blokjes` in `js/nieuw.js`) krijgt een datum in `VANAF`; is het een echte wijziging, dan ook in `WIJZIGING`. Zo zien alleen spelers die al een dagcasus speelden vóór die datum hem.
5. `node tools/versie.mjs` – nieuw versienummer, anders krijgen geïnstalleerde apps de update niet.
6. `node tools/controle.mjs --vastleggen` – legt id's, platennummers, casussen en het dagschema vast voor de volgende controle.

Spelregels voor de data: een `id` en een platennummer (`no`) veranderen nooit; nieuwe platen en casussen komen achteraan; een oude naam gaat in `ALIASES`. Zo verliest niemand ooit voortgang.
