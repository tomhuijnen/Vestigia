# Bugjacht 24 november 2026

Een grote controle van de hele app (deze repo) en de database (repo `vestigia-database`), vlak voor de Wrapped live ging en vóór de uitbreiding met nieuwe soorten (68a en 68).
Dit bestand houdt bij wat er gevonden is, wat gerepareerd is, en wat nog een besluit nodig heeft. Zo hoeft niemand het opnieuw uit te zoeken.

**Hoe er gezocht is:** alle scripts doorgelezen, verdachte plekken in een echte browser nagespeeld (Playwright, met een vaste klok en tijdzone), de functies in de database doorgelopen, de live gegevens gecontroleerd (alleen lezend) en de adviezen van Supabase bekeken.

**Hoe het er nu voor staat:** live zijn sinds versie 202611231539 geen nieuwe foutmeldingen uit de app binnengekomen. De 22 meldingen in `app_fouten` komen allemaal van 23 november, van oudere versies, en zijn al opgelost (PR #124 en later). De ene melding via ‘Er klopt iets niet’ is afgehandeld.

**Ernst:** hoog = spelers verliezen punten of kunnen niet spelen · middel = merkbaar fout voor een deel van de spelers · laag = zeldzaam of alleen cosmetisch.

---

## 1. Gerepareerd in de app (deze PR)

Elke reparatie heeft een test in `tools/test.mjs` die de fout nabootst. Komt de fout ooit terug, dan wordt die test rood.

| # | Ernst | Wat ging er mis | Reparatie | Test |
|---|---|---|---|---|
| A1 | middel-hoog | Wie de app over middernacht open liet staan (veel mensen op de telefoon), bleef de dagcasus van gisteren zien, ook na een tik op ‘Dagcasus’ of op het avondseintje. Met de browser nagespeeld en bevestigd. | `goDaily` kijkt of de dag voorbij is en begint dan de casus van vandaag. Terug naar de app (zichtbaar worden of focus) en een minuutklok werken het scherm ook bij. Wie midden in een casus zit, wordt nooit onderbroken. | `dagcasus-na-middernacht` |
| A2 | middel | De app rekende de dag uit met de tijdzone van het toestel, de server met Nederlandse tijd. Op vakantie buiten Europa (bijv. Tokio om 00:30) speelde je de casus van ‘morgen’, en de server weigerde de score als ‘verlopen’. Die score viel dan uit de wachtrij en was weg. | `todayIndex` rekent nu met de Nederlandse kalender (zoals `kerst.js` al deed). Kan het toestel dat niet, dan valt hij terug op de eigen datum. | `dagcasus-andere-tijdzone` |
| A3 | laag | Expert verloren: de uitslag toonde de interne id (‘(hamster)’) in plaats van de naam, en alleen de eerste gok. Bevestigd in de browser. | Nieuwe functie `fouteExpert()` noemt alle foute gokken bij naam. | `expert-verloren-namen` |
| A4 | laag | De service worker bewaarde ook een foutpagina (bijv. 404 tijdens het live zetten) als `index.html`. Offline kreeg je dan die foutpagina. | Alleen een goede pagina (`r.ok`) gaat de cache in. | (geen browsertest: de test blokkeert de service worker) |
| A5 | laag | De pushfunctie in `supabase/functions/dagcasus-push` liep achter op de live versie: het deel voor ‘duel bijna verlopen’ ontbrak, terwijl de geplande taak dat elk kwartier aanroept. Wie vanuit de repo opnieuw had gedeployd, had het duelseintje stilletjes uitgezet. | Repo gelijkgetrokken met live versie 6. | — |
| A6 | versteviging | `esc()` liet de enkele aanhaling `'` door. Nu geen lek gevonden, maar een spelersnaam met `'` in een attribuut zou het kunnen worden. | `esc()` maakt er `&#39;` van. Alle plekken met `innerHTML` zijn nagelopen: overal netjes `esc()`. | — |

**Let op bij live zetten:** het versienummer (`sw.js`) is bewust niet opgehoogd, om botsingen met de Wrapped-PR (#130) te voorkomen. Draai na het samenvoegen `node tools/versie.mjs`, anders krijgen geïnstalleerde apps de reparaties niet.

## 2. Klaargezet voor de database (PR in `vestigia-database`, nog niet live)

| # | Ernst | Wat | Status |
|---|---|---|---|
| D3 | laag | `_vestigia_dwaalgast_dag` gebruikt `abs(hashtext(...))`. Bij precies één waarde (−2147483648) loopt dat over en faalt de dwaalgast voor die speler die maand. Kans ongeveer 1 op 4 miljard per speler per maand. | Voorstel `voorstellen/061-dwaalgast-dag-overloop.sql`: eerst naar `bigint`. Getest: voor 200 willekeurige spelers precies dezelfde dag als nu. Live na akkoord. |
| D5 | info | `tools/export.sql` liet `security_invoker=true` van de view `app_fouten_overzicht` weg, dus een nieuwe export zou de view onveiliger opschrijven dan hij live is. Live is het in orde. | Export en `schema/04` gerepareerd, export gecontroleerd tegen live. |
| — | gereedschap | Een voorstel kon je niet testen voordat het live ging. | `node test/draai.mjs --met-voorstellen` laadt ook `voorstellen/` en draait `test/voorstellen.sql`. |

## 3. Besloten door Tom: week- en maandprijzen vastleggen (25 november)

**D1 (middel): week- en maandprijzen konden achteraf verschuiven.**
De eikels voor week en maand werden niet bewaard, maar bij elke opvraag van de portemonnee opnieuw berekend uit de uitslagen. Twee dingen konden die uitslagen achteraf veranderen:

1. Op maandag wordt de dagcasus van zondag nog geaccepteerd (`p_day >= vandaag − 1`, voor wie offline speelde). Bij de maandgrens precies zo.
2. Een verborgen speler die later een naam kiest (`claim_name`), telde opeens mee in alle oude ranglijsten, ook van weken geleden.

Gevolg: iemand kon eikels kwijtraken die al uitgegeven waren, en het saldo kon negatief worden.

**Tom koos: prijzen vastleggen.** Dat staat klaar als voorstel `voorstellen/062-prijzen-vastleggen.sql` in de database-repo (nog niet live):
- Een week wordt op **dinsdag** vastgelegd, een maand op de **2e** van de volgende maand: dan kan er echt niets meer bij komen. Daarna verandert hij nooit meer, ook niet door een gekozen naam of nieuwe prijsbedragen.
- Op **maandag** (en op de 1e) telt de afgelopen periode voorlopig mee zoals nu, zodat de pop-up ‘Je week in Vestigia’ gewoon eikels laat vliegen. Alleen binnen die ene dag kan een prijs nog schuiven door een late uitslag van zondag.
- Het vastleggen gebeurt bij elke opvraag van de portemonnee en elke nacht via pg_cron.
- Bij het live zetten verandert er voor niemand iets: alle oude weken en maanden worden vastgelegd met precies de uitkomst van nu.
- Getest in `test/voorstellen.sql`: maandag, dinsdag, een late zondaguitslag, een verborgen speler die later een naam kiest, hogere prijsbedragen, en de maandgrens.

## 4. Alleen genoteerd (geen actie nu)

- **isoDay in UTC:** een plaat gevonden tussen 00:00 en 01:00 Nederlandse tijd krijgt de datum van de dag ervoor. Heel klein randeffect, alleen zichtbaar in statistiek en Wrapped.
- **Wachtrij:** een 4xx-fout bij een duel leegt de hele verzendwachtrij, niet alleen dat ene duel. Twee gelijktijdige `flush()`-aanroepen kunnen in theorie tegelijk aan de wachtrij werken.
- **Koppelen:** `koppel()` met een verborgen code terwijl je al een naam hebt, geeft een verwarrende melding.
- **Antwoorden in de app:** de duel-JSON en het openbare `data/dagschema.js` bevatten de antwoorden. Dat hoort bij de opzet (de app vertrouwt de uitslag van het toestel) en is geen fout, wel iets om te weten als prijzen ooit echt waarde krijgen.
- **D2 (laag):** `push_test` stuurt de sleutel in de body van een pg_net-verzoek naar de Edge Function. Binnen Supabase, maar het kan netter.
- **D4 (laag):** 20 hulpfuncties hebben geen vaste `search_path` (advies van Supabase); pg_net staat in `public`.
- **D6 (gegevens):** één speler heeft voor 8 november zowel een klassieke als een expertuitslag, van vóór die regel bestond. Alleen historisch.
- **D8 (cosmetisch):** sommige functies geven een technische foutmelding bij onzin-invoer (`submit_result` zonder pogingen, duelronde 3, één kapotte regel in `submit_games` weigert de hele partij). De app stuurt die invoer nooit.
- **Prestaties:** 7 verwijzingen zonder index en `join_attempts` zonder primaire sleutel. Pas merkbaar bij veel meer spelers.

## 5. Checklist voor de soortenuitbreiding (68a en 68)

De database weet op een paar plekken iets over de soorten dat niet uit `data/soorten.js` komt. Bij nieuwe soorten of groepen moet je deze plekken nalopen, anders gaat het stilletjes mis (geen foutmelding, alleen verkeerde titels of medailles):

- [ ] **Tweelingparen** (`_vestigia_tweelingparen`): staan als Nederlandse namen in SQL (6 paren, met oude namen als reserve), gelezen uit `progress->'dex'`. Een soort hernoemen breekt het paar zonder melding; een nieuw tweelingpaar moet in SQL erbij.
- [ ] **Titels** (`_vestigia_award_titles`): gebruiken de groepsletters. Nieuwe groep = titel erbij.
- [ ] **Statistiek** (`_vestigia_metrics`): heeft vaste kolommen `groep_Z` … `groep_K`. Nieuwe groep = kolom erbij.
- [ ] **Platengrens** (`_vestigia_platen_grens`): rekent met `g >= 8`. Controleren of dat nog klopt met meer soorten.
- [ ] **Medailles**: tabel `medaille_soorten` en de avatars per medaille in `shop_items`. Moeten aansluiten op de nieuwe soortenlijst.
- [ ] **Duelcasussen**: tabel `duel_casussen` vullen met `node tools/duelcasussen.mjs` (gaat niet vanzelf).
- [ ] **Specialisttitels en Wandelende veldgids**: goud van de groep ophogen met het aantal soorten (update 68), en de drempel van mijlpaal `alles1` gelijk aan het aantal soorten in `duel_casussen` (de rookproef controleert dat sinds 064).
- [ ] **Grenzen in `save_progress`**: maximaal 500 platen en 100 trofeeën. Met veel meer soorten kan de 500 te krap worden.
- [ ] Daarna in de app: `node tools/controle.mjs` en `node tools/test.mjs`; in de database: `node test/draai.mjs`.

Live gecontroleerd op 24 november: duelcasussen (620 casussen, 155 soorten) en de medailles kloppen nu precies met de data.
