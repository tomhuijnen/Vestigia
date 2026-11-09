/* Vestigia – avatars: tekeningen in een vak van 100 × 100, bedoeld voor een ronde achtergrond.
   currentColor = de lichte tint, var(--av-bg) = de achtergrondkleur (voor uitsparingen), #1f3428 = donker.
   De medaille-avatars (één per medaillesoort) zijn in kleur. Prijs, te koop en gratis staan in Supabase (shop_items), niet hier. */
"use strict";
const AVATARS = {
  "das": `<path fill="currentColor" fill-opacity=".55" d="M2 104C6 82 22 70 38 68H62C78 70 94 82 98 104Z"/>
<path fill="currentColor" d="M50 88C45 88 42 84 40 80L26 54C21 44 22 31 31 24C37 19 43 17 50 17C57 17 63 19 69 24C78 31 79 44 74 54L60 80C58 84 55 88 50 88Z"/>
<path fill="#1f3428" d="M27 33C30 27 36 26 39 30C42 35 43 44 45 56L47 72C47 77 44 78 42 74L31 54C27 46 25 39 27 33Z"/>
<path fill="#1f3428" d="M73 33C70 27 64 26 61 30C58 35 57 44 55 56L53 72C53 77 56 78 58 74L69 54C73 46 75 39 73 33Z"/>
<circle cx="27" cy="27" r="6.5" fill="#1f3428"/><circle cx="73" cy="27" r="6.5" fill="#1f3428"/>
<path d="M22 25C23 21 27 19 31 21M78 25C77 21 73 19 69 21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="39.5" cy="47" r="1.8" fill="currentColor"/><circle cx="60.5" cy="47" r="1.8" fill="currentColor"/>
<path fill="#1f3428" d="M44 80C44 76 47 75 50 75C53 75 56 76 56 80C56 84 53 86 50 86C47 86 44 84 44 80Z"/>`,
  "egel": `<path fill="currentColor" fill-opacity=".55" d="M8 72C7 50 22 33 44 31C62 30 76 39 80 52L78 72Z"/>
<path d="M8.9 63.2L4.1 68.3 M10.7 56.9L5.1 61.1 M13.4 51.0L7.2 54.3 M16.9 45.6L10.3 47.9 M21.2 41.0L14.3 42.1 M26.1 37.3L19.1 37.2 M31.5 34.5L24.6 33.3 M37.3 32.7L30.7 30.4 M43.2 32.0L37.1 28.6 M49.2 32.4L43.7 28.1 M55.0 33.9L50.3 28.7 M60.5 36.4L56.7 30.6 M65.5 39.9L62.8 33.5 M70.0 44.3L68.3 37.5 M73.8 49.5L73.2 42.5 M76.7 55.3L77.3 48.3 M14.5 65.8L10.6 70.3 M16.2 59.6L11.5 63.3 M18.9 53.9L13.6 56.6 M22.6 48.8L16.9 50.4 M27.2 44.7L21.2 45.1 M32.3 41.6L26.4 40.9 M38.0 39.7L32.3 37.8 M43.8 39.0L38.6 36.0 M49.7 39.6L45.1 35.7 M55.3 41.4L51.6 36.7 M60.5 44.5L57.8 39.1 M65.1 48.5L63.5 42.7 M68.8 53.5L68.4 47.5 M71.7 59.2L72.4 53.3 M20.8 65.2L16.6 69.4 M23.2 59.1L18.0 62.1 M26.8 53.9L21.0 55.5 M31.5 49.8L25.5 49.9 M37.0 47.1L31.2 45.8 M43.0 46.0L37.7 43.2 M49.0 46.6L44.6 42.6 M54.7 48.7L51.4 43.7 M59.8 52.4L57.8 46.7 M63.8 57.3L63.3 51.3 M26.4 67.8L22.4 72.2 M28.7 62.0L23.4 64.8 M32.6 57.3L26.7 58.3 M37.8 54.2L31.9 53.2 M43.6 53.0L38.3 50.1 M49.5 53.9L45.5 49.5 M54.8 56.8L52.4 51.3 M58.9 61.3L58.4 55.3 M33.0 67.3L28.2 70.9 M36.9 62.3L30.9 63.0 M42.7 60.1L37.3 57.6 M49.0 61.1L45.5 56.2 M53.8 65.1L53.3 59.1" fill="none" stroke="#1f3428" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.4 66.4L4.0 71.9 M9.7 60.0L4.5 64.7 M11.9 53.8L6.1 57.7 M15.1 48.2L8.6 51.0 M19.0 43.2L12.2 44.9 M23.6 39.0L16.6 39.6 M28.8 35.7L21.8 35.1 M34.4 33.5L27.6 31.7 M40.2 32.2L33.8 29.4 M46.2 32.1L40.4 28.2 M52.1 33.0L47.0 28.3 M57.8 35.0L53.5 29.5 M63.1 38.1L59.8 31.9 M67.9 42.0L65.6 35.4 M72.0 46.8L70.9 39.9 M75.3 52.3L75.4 45.3 M15.2 62.7L10.9 66.8 M17.4 56.7L12.4 59.9 M20.7 51.2L15.1 53.4 M24.8 46.6L18.9 47.7 M29.7 43.0L23.7 42.8 M35.1 40.5L29.2 39.2 M40.9 39.2L35.4 36.7 M46.7 39.1L41.9 35.7 M52.5 40.4L48.4 36.0 M58.0 42.8L54.8 37.7 M62.9 46.4L60.7 40.8 M67.1 50.9L66.1 45.0 M70.4 56.3L70.5 50.3 M20.2 68.4L16.5 73.1 M21.8 62.1L17.1 65.7 M24.8 56.4L19.3 58.7 M29.0 51.7L23.1 52.6 M34.2 48.3L28.2 47.6 M40.0 46.4L34.4 44.3 M46.0 46.1L41.1 42.7 M51.9 47.5L48.0 42.9 M57.4 50.4L54.7 45.0 M61.9 54.7L60.7 48.8 M65.3 60.1L65.6 54.1 M27.3 64.8L22.6 68.5 M30.5 59.5L24.8 61.4 M35.1 55.5L29.1 55.5 M40.6 53.3L35.0 51.4 M46.6 53.2L41.9 49.5 M52.2 55.1L49.0 50.1 M57.0 58.9L55.6 53.0 M60.3 64.0L60.9 58.1 M34.6 64.5L29.0 66.8 M39.7 60.8L33.7 59.9 M45.9 60.2L41.3 56.4 M51.6 62.8L49.6 57.1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
<path fill="currentColor" d="M70 72C69 62 72 53 79 50C85 51 89 56 93 62C95 64 94 66 92 67L84 70C80 73 74 74 70 72Z"/>
<circle cx="94" cy="64.5" r="2.4" fill="#1f3428"/><circle cx="81" cy="57" r="2.2" fill="#1f3428"/>
<path fill="#1f3428" d="M74 53C74 49 78 48 80 51C79 53 77 54 74 53Z"/>
<path fill="#1f3428" d="M20 71L18 78C18 80 23 80 23 78L25 71ZM34 72L33 79C33 81 38 81 38 79L39 72ZM60 72L60 79C60 81 65 81 65 79L65 72ZM73 71L74 78C74 80 79 80 79 78L78 71Z"/>`,
  "eekhoorn": `<path fill="currentColor" fill-opacity=".55" d="M44.0 90.0Q37.4 93.6 30.0 92.0L30.0 92.0Q22.8 91.3 18.0 86.0L18.0 86.0Q12.3 81.3 11.0 74.0L11.0 74.0Q7.4 67.4 9.0 60.0L9.0 60.0Q8.0 52.5 12.0 46.0L12.0 46.0Q12.7 38.8 18.0 34.0L18.0 34.0Q20.0 27.4 26.0 24.0L26.0 24.0Q29.2 19.2 35.0 19.0L35.0 19.0Q39.3 16.9 43.0 20.0L43.0 20.0Q47.2 21.6 47.0 26.0L47.0 26.0Q47.9 30.5 44.0 33.0L44.0 33.0Q42.3 38.3 37.0 40.0L37.0 40.0Q37.4 46.0 33.0 50.0L33.0 50.0Q35.6 56.0 33.0 62.0L33.0 62.0Q37.5 67.2 37.0 74.0L37.0 74.0Q42.1 76.4 43.0 82.0L43.0 82.0Q46.1 85.7 44.0 90.0Z"/>
<path d="M18 50C20 40 26 30 34 25M16 66C16 58 18 52 22 46M24 80C20 74 20 68 22 62" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path fill="currentColor" d="M50 48C45 56 40 66 42 76C43 85 49 90 58 90C66 90 70 84 69 74C68 64 64 56 59 50Z"/>
<path fill="currentColor" fill-opacity=".72" d="M44 74C44 66 50 62 56 64C62 66 64 74 62 82C60 88 52 90 47 88C44 85 43 80 44 74Z"/>
<path fill="currentColor" d="M48 44C47 35 53 29 61 29C67 29 71 33 74 38C76 41 75 44 72 45C68 47 63 50 58 52C53 52 49 49 48 44Z"/>
<path fill="currentColor" d="M53 33L50 18L58 30ZM60 30L62 17L66 31Z"/>
<circle cx="64" cy="37" r="2.4" fill="#1f3428"/><circle cx="74.5" cy="40" r="1.6" fill="#1f3428"/>
<path fill="currentColor" d="M62 54C66 52 70 52 72 55L68 58C66 58 64 57 62 54Z" fill-opacity=".72"/>
<ellipse cx="72" cy="59" rx="4" ry="5" fill="#1f3428"/><path fill="currentColor" d="M69 56C70 53 74 53 75 56Z"/>
<path fill="currentColor" fill-opacity=".72" d="M48 87C52 86 58 86 62 88C62 91 48 91 48 87Z"/>`,
  "vos": `<path fill="#1f3428" d="M23 42L18 9L44 27Z"/><path fill="#1f3428" d="M77 42L82 9L56 27Z"/>
<path fill="currentColor" d="M26 36L22 16L38 28Z" fill-opacity=".85"/><path fill="currentColor" d="M74 36L78 16L62 28Z" fill-opacity=".85"/>
<path fill="currentColor" fill-opacity=".55" d="M50 26C62 26 72 30 78 40C82 47 80 56 72 61L58 79C55 83 45 83 42 79L28 61C20 56 18 47 22 40C28 30 38 26 50 26Z"/>
<path fill="currentColor" d="M22 46C26 56 36 58 44 62C47 66 48 72 50 72C52 72 53 66 56 62C64 58 74 56 78 46C82 54 80 60 72 64L58 80C55 84 45 84 42 80L28 64C20 60 18 54 22 46Z"/>
<path fill="#1f3428" d="M33 47C36 45 41 46 43 49C40 50 36 50 33 47ZM67 47C64 45 59 46 57 49C60 50 64 50 67 47Z"/>
<path fill="#1f3428" d="M45 78C45 75 48 74 50 74C52 74 55 75 55 78C55 81 52 83 50 83C48 83 45 81 45 78Z"/>
`,
  "otter": `<path fill="currentColor" fill-opacity=".3" d="M0 66H100V100H0Z"/>
<path fill="currentColor" fill-opacity=".55" d="M18 66C16 46 30 30 50 30C70 30 84 46 82 66Z"/>
<circle cx="24" cy="40" r="5" fill="currentColor" fill-opacity=".55"/><circle cx="76" cy="40" r="5" fill="currentColor" fill-opacity=".55"/>
<path fill="currentColor" d="M32 66C30 58 36 52 42 52C45 52 47 53 50 53C53 53 55 52 58 52C64 52 70 58 68 66Z"/>
<circle cx="37" cy="44" r="2.8" fill="#1f3428"/><circle cx="63" cy="44" r="2.8" fill="#1f3428"/>
<path fill="#1f3428" d="M44 52C44 48 47 47 50 47C53 47 56 48 56 52C56 55 53 57 50 57C47 57 44 55 44 52Z"/>
<path d="M50 57V61M45 62C48 64 52 64 55 62" fill="none" stroke="#1f3428" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M34 58L12 54M34 61L13 63M66 58L88 54M66 61L87 63" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 72C14 69 20 69 26 72M74 72C80 69 86 69 92 72M30 80C38 77 46 77 54 80" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  "bever": `<path fill="currentColor" fill-opacity=".55" d="M6 104C8 80 24 68 50 68C76 68 92 80 94 104Z"/>
<path fill="currentColor" fill-opacity=".55" d="M50 18C68 18 80 32 80 50C80 66 68 80 50 80C32 80 20 66 20 50C20 32 32 18 50 18Z"/>
<circle cx="24" cy="30" r="5.5" fill="currentColor" fill-opacity=".55"/><circle cx="76" cy="30" r="5.5" fill="currentColor" fill-opacity=".55"/>
<circle cx="24" cy="30" r="2.6" fill="#1f3428"/><circle cx="76" cy="30" r="2.6" fill="#1f3428"/>
<path fill="currentColor" d="M36 62C34 54 40 48 50 48C60 48 66 54 64 62C62 68 56 70 50 70C44 70 38 68 36 62Z" fill-opacity=".8"/>
<circle cx="38" cy="40" r="2.6" fill="#1f3428"/><circle cx="62" cy="40" r="2.6" fill="#1f3428"/>
<path fill="#1f3428" d="M44 52C44 49 47 48 50 48C53 48 56 49 56 52C56 55 53 56 50 56C47 56 44 55 44 52Z"/>
<path fill="#1f3428" d="M43 64C46 66 54 66 57 64L56 70H44Z"/>
<path fill="currentColor" d="M44.5 65.5H55.5V77C55.5 79 53 80 50 80C47 80 44.5 79 44.5 77Z"/>
<path d="M50 66V80" fill="none" stroke="#1f3428" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 58L18 55M36 62L19 65M64 58L82 55M64 62L81 65" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>`,
  "ree": `<path fill="currentColor" fill-opacity=".55" d="M36 36C28 38 16 34 10 26C20 22 30 26 38 32ZM64 36C72 38 84 34 90 26C80 22 70 26 62 32Z"/>
<path fill="currentColor" d="M34 34C26 34 18 30 14 27C22 26 29 29 34 32ZM66 34C74 34 82 30 86 27C78 26 71 29 66 32Z" fill-opacity=".7"/>
<path fill="currentColor" d="M43 30L41 20L37 10M41 20L46 13M41 24L36 22M57 30L59 20L63 10M59 20L54 13M59 24L64 22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
<path fill="currentColor" fill-opacity=".55" d="M50 28C60 28 68 34 68 44C68 52 64 58 62 66L58 82C56 88 44 88 42 82L38 66C36 58 32 52 32 44C32 34 40 28 50 28Z"/>
<path fill="currentColor" d="M42 30C46 28 54 28 58 30L56 34C52 33 48 33 44 34Z" fill-opacity=".9"/>
<path fill="#1f3428" d="M38 46C40 44 44 45 45 48C42 49 39 48 38 46ZM62 46C60 44 56 45 55 48C58 49 61 48 62 46Z"/>
<path fill="#1f3428" d="M45 78C45 75 47 74 50 74C53 74 55 75 55 78C55 80 53 81 50 81C47 81 45 80 45 78Z"/>
<path fill="currentColor" d="M44 82C46 86 54 86 56 82C55 87 53 89 50 89C47 89 45 87 44 82Z"/>`,
  "ijsvogel": `<path fill="#1f3428" d="M0 80C30 76 66 78 100 74L100 79C66 82 30 80 0 85Z"/>
<path fill="currentColor" fill-opacity=".55" d="M34 68L26 82L32 83L40 72Z"/>
<path fill="currentColor" fill-opacity=".55" d="M40 22C50 18 60 22 62 32C63 38 60 42 58 44C62 52 62 62 56 70C50 76 40 78 34 72C28 66 28 54 32 44C30 36 32 26 40 22Z"/>
<path fill="currentColor" d="M58 44C62 52 62 62 56 70C51 75 44 76 40 73C46 70 52 62 52 52C52 48 54 45 58 44Z" fill-opacity=".9"/>
<path fill="#1f3428" d="M60 30L95 37L60 38Z"/>
<path fill="currentColor" d="M54 38C57 40 59 42 58 46C55 46 52 44 52 40Z"/>
<path fill="#1f3428" d="M42 32C46 30 52 31 58 34C54 36 48 36 42 35Z" fill-opacity=".7"/>
<circle cx="54" cy="31" r="2.6" fill="#1f3428"/><circle cx="54.8" cy="30.2" r=".8" fill="currentColor"/>
<path d="M36 50C40 56 42 62 40 68M38 46C44 52 46 60 44 68" fill="none" stroke="#1f3428" stroke-opacity=".35" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path fill="#1f3428" d="M46 74L45 79M51 73L51 78" stroke="#1f3428" stroke-width="2.2" stroke-linecap="round"/>`,
  "kerkuil": `<path fill="currentColor" fill-opacity=".55" d="M50 22C66 22 80 34 82 52C84 70 72 88 50 94C28 88 16 70 18 52C20 34 34 22 50 22Z"/>
<path fill="currentColor" d="M50 74C62 74 70 80 72 90C66 96 58 98 50 98C42 98 34 96 28 90C30 80 38 74 50 74Z" fill-opacity=".9"/>
<path fill="currentColor" d="M50 36C46 28 36 24 29 28C22 33 22 44 26 54C30 64 40 72 50 76C60 72 70 64 74 54C78 44 78 33 71 28C64 24 54 28 50 36Z"/>
<path d="M50 36C46 28 36 24 29 28C22 33 22 44 26 54C30 64 40 72 50 76C60 72 70 64 74 54C78 44 78 33 71 28C64 24 54 28 50 36Z" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="40" cy="47" rx="4" ry="4.5" fill="#1f3428"/><ellipse cx="60" cy="47" rx="4" ry="4.5" fill="#1f3428"/>
<path fill="currentColor" fill-opacity=".55" d="M50 48C48 52 47 58 50 63C53 58 52 52 50 48Z"/>
<path d="M34 38C38 36 44 38 47 44M66 38C62 36 56 38 53 44" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#1f3428"><circle cx="42" cy="84" r="1.1"/><circle cx="50" cy="86" r="1.1"/><circle cx="58" cy="84" r="1.1"/><circle cx="46" cy="91" r="1.1"/><circle cx="54" cy="91" r="1.1"/></g>
<g fill="#1f3428" fill-opacity=".5"><circle cx="30" cy="70" r="1"/><circle cx="70" cy="70" r="1"/><circle cx="26" cy="60" r="1"/><circle cx="74" cy="60" r="1"/></g>`,
  "oehoe": `<path fill="currentColor" fill-opacity=".55" d="M30 30L20 8L40 22C46 20 54 20 60 22L80 8L70 30C78 40 80 56 74 70C68 84 60 94 50 96C40 94 32 84 26 70C20 56 22 40 30 30Z"/>
<path fill="currentColor" d="M50 58C60 58 68 66 70 78C66 88 58 94 50 94C42 94 34 88 30 78C32 66 40 58 50 58Z" fill-opacity=".55"/>
<path fill="currentColor" d="M50 34C44 28 32 28 28 36C26 44 30 54 38 58C44 60 48 58 50 56C52 58 56 60 62 58C70 54 74 44 72 36C68 28 56 28 50 34Z" fill-opacity=".55"/>
<circle cx="39" cy="43" r="7.5" fill="currentColor"/><circle cx="61" cy="43" r="7.5" fill="currentColor"/>
<circle cx="39" cy="43" r="4" fill="#1f3428"/><circle cx="61" cy="43" r="4" fill="#1f3428"/>
<circle cx="40.5" cy="41.5" r="1.1" fill="currentColor"/><circle cx="62.5" cy="41.5" r="1.1" fill="currentColor"/>
<path fill="#1f3428" d="M50 46L46 52C47 56 49 58 50 59C51 58 53 56 54 52Z"/>
<path d="M40 66l0 5 M46 70l0 6 M52 68l0 6 M58 66l0 5 M44 78l0 5 M50 80l0 6 M56 78l0 5 M38 76l0 4 M62 75l0 4 M48 88l0 4 M54 88l0 4" fill="none" stroke="#1f3428" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 18L30 26M76 18L70 26" fill="none" stroke="#1f3428" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  "levendbarende-hagedis": `<path fill="currentColor" fill-opacity=".3" d="M0 62C30 58 70 58 100 62V100H0Z"/>
<path d="M20 74C30 72 40 74 50 72M56 76C66 74 76 76 86 74M30 84C44 82 56 84 70 82" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
<g transform="translate(4 -16) scale(1.1)"><path fill="currentColor" fill-opacity=".55" d="M10 56C10 51 14 48 20 48C24 48 28 49 32 50C42 48 56 50 66 54C76 58 86 58 96 54C90 62 80 64 68 62C56 62 44 62 32 62C24 62 18 62 14 60C11 59 10 58 10 56Z"/>
<path fill="currentColor" d="M16 57C22 60 28 61 34 61C44 61 56 61 66 60C58 64 44 64 32 64C24 64 18 62 16 57Z" fill-opacity=".85"/>
<path fill="#1f3428" d="M32 50C42 48 56 50 66 54C70 56 74 57 78 57C70 58 66 55 60 54C50 52 40 52 30 53Z" fill-opacity=".9"/>
<circle cx="18" cy="52" r="1.8" fill="#1f3428"/>
<path fill="#1f3428" d="M10 56L15 56" stroke="#1f3428" stroke-width="1.2"/>
<g fill="#1f3428" fill-opacity=".6"><circle cx="40" cy="57" r="1"/><circle cx="48" cy="58" r="1"/><circle cx="56" cy="57" r="1"/><circle cx="44" cy="55" r=".9"/><circle cx="52" cy="55" r=".9"/></g>
<path fill="currentColor" fill-opacity=".55" d="M30 60L26 68L22 68M30 60L28 69M56 60L54 68L50 69M56 60L58 69"  fill="none" stroke="currentColor" stroke-opacity=".7" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  "zandhagedis": `<path fill="currentColor" fill-opacity=".3" d="M50 76C50 86 56 92 64 94C70 95 76 92 78 88C72 90 66 90 60 86C55 83 53 80 52 74Z" fill-opacity=".55"/>
<path d="M45 36L34 31L29 25M45 36L33 38L28 35M55 36L66 31L71 25M55 36L67 38L72 35M45 57L34 62L30 69M45 57L35 66L34 72M55 57L66 62L70 69M55 57L65 66L66 72" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path fill="currentColor" fill-opacity=".55" d="M50 12C55 12 58 16 58 21C58 25 56 27 55 29C59 35 60 46 58 56C56 64 53 70 50 76C47 70 44 64 42 56C40 46 41 35 45 29C44 27 42 25 42 21C42 16 45 12 50 12Z"/>
<path fill="#1f3428" d="M50 22C53 22 54 26 54 30C55 40 55 52 53 62C52 68 51 72 50 76C49 72 48 68 47 62C45 52 45 40 46 30C46 26 47 22 50 22Z" fill-opacity=".85"/>
<g fill="currentColor"><circle cx="48.3" cy="34" r="1"/><circle cx="51.7" cy="40" r="1"/><circle cx="48.2" cy="46" r="1"/><circle cx="51.8" cy="52" r="1"/><circle cx="48.6" cy="58" r="1"/><circle cx="51.3" cy="64" r="1"/></g>
<circle cx="46.5" cy="19" r="1.4" fill="#1f3428"/><circle cx="53.5" cy="19" r="1.4" fill="#1f3428"/>`,
  "adder": `<g transform="translate(9 3) scale(.84)"><path fill="#a4c1a6" d="M11.0 81.1 L12.5 82.6 L14.3 84.1 L16.2 85.4 L18.4 86.7 L20.7 87.9 L23.2 89.0 L25.8 90.0 L28.5 90.9 L31.3 91.7 L34.2 92.4 L37.1 93.1 L40.2 93.6 L43.2 94.0 L46.3 94.4 L49.4 94.7 L52.5 94.8 L55.6 94.9 L58.6 94.9 L61.6 94.7 L64.5 94.5 L67.4 94.2 L70.1 93.7 L72.8 93.1 L75.4 92.4 L77.8 91.6 L80.2 90.6 L82.4 89.5 L84.4 88.2 L86.3 86.6 L87.7 85.1 L80.3 78.9 L79.5 80.1 L78.6 81.0 L77.5 81.9 L76.1 82.9 L74.5 83.7 L72.6 84.6 L70.6 85.3 L68.4 86.0 L66.0 86.6 L63.5 87.1 L60.9 87.6 L58.1 87.9 L55.3 88.1 L52.5 88.3 L49.6 88.3 L46.7 88.3 L43.8 88.2 L40.9 88.0 L38.0 87.7 L35.2 87.3 L32.4 86.8 L29.7 86.3 L27.1 85.6 L24.6 84.9 L22.3 84.1 L20.1 83.2 L18.1 82.2 L16.2 81.2 L14.5 80.1 L13.0 78.9Z"/>
<path d="M12.6 79.4 L14.7 83.4 L19.7 84.0 L23.5 88.0 L29.4 87.3 L34.4 91.3 L40.7 89.2 L46.4 93.0 L52.5 89.8 L58.5 93.3 L63.7 88.8 L69.7 92.0 L73.3 86.3 L79.3 88.9 L79.9 82.6 L86.0 83.7" fill="none" stroke="#1f3428" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
<path fill="#a4c1a6" d="M88.4 83.9 L89.2 82.5 L89.8 80.8 L90.2 79.0 L90.3 77.2 L90.3 75.4 L89.9 73.6 L89.3 71.9 L88.6 70.3 L87.6 68.8 L86.5 67.4 L85.3 66.2 L83.9 65.0 L82.5 63.9 L81.0 63.0 L79.4 62.1 L77.7 61.2 L76.0 60.5 L74.1 59.9 L72.2 59.3 L70.3 58.8 L68.3 58.3 L66.2 58.0 L64.1 57.7 L62.0 57.5 L59.8 57.5 L57.6 57.6 L55.3 57.8 L53.1 58.0 L50.8 58.4 L48.7 58.8 L51.3 73.2 L53.2 72.9 L54.9 72.7 L56.6 72.5 L58.3 72.5 L60.0 72.4 L61.6 72.5 L63.2 72.4 L64.8 72.4 L66.3 72.5 L67.8 72.6 L69.2 72.8 L70.5 73.0 L71.8 73.3 L73.0 73.6 L74.1 73.9 L75.1 74.3 L76.0 74.7 L76.8 75.1 L77.5 75.5 L78.1 75.8 L78.6 76.2 L78.9 76.5 L79.2 76.8 L79.5 77.1 L79.7 77.4 L79.8 77.7 L79.9 78.0 L79.9 78.5 L79.9 79.1 L79.6 80.1Z"/>
<path d="M81.6 80.9 L87.6 80.3 L82.2 77.6 L87.6 74.4 L81.1 75.1 L84.6 69.3 L78.4 72.8 L79.7 65.5 L74.1 70.8 L73.3 62.8 L68.3 69.5 L65.9 61.2 L61.7 69.1 L57.7 60.9 L54.5 69.4 L49.3 62.0" fill="none" stroke="#1f3428" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>
<path fill="#a4c1a6" d="M48.7 58.8 L47.0 59.1 L45.5 59.3 L44.1 59.4 L42.8 59.5 L41.7 59.4 L40.6 59.3 L39.6 59.2 L38.8 59.0 L38.1 58.8 L37.5 58.5 L37.0 58.3 L36.6 58.1 L36.3 57.9 L36.1 57.7 L36.0 57.6 L35.9 57.5 L35.8 57.5 L35.8 57.5 L35.8 57.5 L35.7 57.4 L35.7 57.4 L35.7 57.2 L35.8 57.0 L35.9 56.7 L36.1 56.4 L36.5 55.9 L36.9 55.4 L37.5 54.9 L38.3 54.3 L39.4 53.5 L32.6 42.5 L31.0 43.4 L29.4 44.5 L28.0 45.7 L26.6 47.0 L25.5 48.4 L24.4 49.9 L23.6 51.5 L22.9 53.2 L22.4 55.0 L22.2 56.8 L22.2 58.6 L22.4 60.4 L22.9 62.2 L23.6 63.9 L24.5 65.4 L25.6 66.9 L26.9 68.2 L28.2 69.3 L29.7 70.3 L31.3 71.2 L32.9 72.0 L34.7 72.6 L36.5 73.1 L38.5 73.5 L40.4 73.8 L42.5 73.9 L44.6 73.9 L46.8 73.8 L49.1 73.6 L51.3 73.2Z"/>
<path d="M50.7 70.0 L45.8 62.6 L42.6 70.7 L40.1 62.5 L35.6 69.6 L36.1 61.4 L30.1 66.8 L33.7 59.8 L26.4 62.4 L32.8 58.1 L25.2 56.9 L32.8 56.3 L27.0 51.5 L34.2 53.9 L31.3 46.8 L37.9 51.1" fill="none" stroke="#1f3428" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
<path fill="#a4c1a6" d="M39.3 53.6 L40.2 53.0 L41.1 52.5 L41.9 52.1 L42.7 51.6 L43.6 51.2 L44.4 50.7 L45.2 50.3 L46.0 49.9 L46.8 49.5 L47.6 49.1 L48.4 48.7 L49.2 48.3 L50.0 47.9 L50.8 47.5 L51.6 47.0 L52.4 46.5 L53.3 46.0 L54.1 45.5 L54.9 44.9 L55.7 44.3 L56.5 43.6 L57.2 42.9 L58.0 42.1 L58.7 41.3 L59.4 40.4 L60.0 39.5 L60.6 38.5 L61.2 37.5 L61.7 36.4 L62.2 35.4 L51.8 30.6 L51.5 31.3 L51.1 31.9 L50.8 32.4 L50.5 32.8 L50.1 33.2 L49.8 33.6 L49.5 33.9 L49.1 34.3 L48.7 34.6 L48.3 34.8 L47.9 35.1 L47.5 35.4 L47.0 35.7 L46.4 36.0 L45.9 36.2 L45.3 36.5 L44.6 36.8 L43.9 37.1 L43.2 37.4 L42.4 37.8 L41.6 38.1 L40.7 38.5 L39.8 38.9 L38.9 39.3 L37.9 39.7 L36.9 40.2 L35.9 40.7 L34.8 41.2 L33.8 41.8 L32.7 42.4Z"/>
<path d="M34.2 44.9 L39.7 50.0 L38.2 42.7 L43.1 48.2 L41.9 41.0 L46.4 46.6 L45.1 39.6 L49.6 45.0 L47.8 38.3 L52.6 43.2 L50.0 37.0 L55.4 40.9 L51.8 35.3 L57.9 38.0 L53.4 33.1 L59.8 34.3" fill="none" stroke="#1f3428" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
<g transform="translate(62 30) scale(1.18) translate(-62 -30)"><path fill="#a4c1a6" d="M49 40C48 31 53 24 61 22C68 20.5 75 21 80 24C83 26 83 30 79 31.5C73 33.5 65 34 59 40C56 42 50 43 49 40Z"/>
<path d="M53 33C57 29.5 62 28 66.5 27.5" fill="none" stroke="#1f3428" stroke-width="3" stroke-linecap="round"/>
<circle cx="70" cy="25.6" r="2.6" fill="currentColor"/><path d="M70 23.6V27.6" stroke="#1f3428" stroke-width="1.2" stroke-linecap="round"/>
<path d="M66.8 23.4C68.6 22 71.6 21.8 73.4 23" fill="none" stroke="#1f3428" stroke-width="1.5" stroke-linecap="round"/>
<path d="M80.5 29.6C75 30.6 70 31 65 31" fill="none" stroke="#1f3428" stroke-width="1" stroke-linecap="round" stroke-opacity=".8"/>
<circle cx="79.6" cy="25.6" r=".7" fill="#1f3428"/></g></g>`,
  "boomkikker": `<path fill="currentColor" fill-opacity=".3" d="M0 92C30 84 70 84 100 92V100H0Z"/>
<path fill="currentColor" fill-opacity=".55" d="M50 38C64 38 74 48 74 60C74 72 64 80 50 80C36 80 26 72 26 60C26 48 36 38 50 38Z"/>
<path fill="currentColor" d="M36 66C42 74 58 74 64 66C62 76 56 80 50 80C44 80 38 76 36 66Z" fill-opacity=".85"/>
<path fill="#1f3428" d="M28 52C32 56 34 62 34 70L30 68C28 64 27 58 28 52ZM72 52C68 56 66 62 66 70L70 68C72 64 73 58 72 52Z"/>
<circle cx="38" cy="38" r="9" fill="currentColor" fill-opacity=".55"/><circle cx="62" cy="38" r="9" fill="currentColor" fill-opacity=".55"/>
<circle cx="38" cy="37" r="5.5" fill="#1f3428"/><circle cx="62" cy="37" r="5.5" fill="#1f3428"/>
<circle cx="39.5" cy="35.5" r="1.5" fill="currentColor"/><circle cx="63.5" cy="35.5" r="1.5" fill="currentColor"/>
<path d="M42 52C46 54 54 54 58 52" fill="none" stroke="var(--av-bg,#4b7a5e)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M30 56C22 54 16 50 14 44M14 44L9 41M14 44L11 49M70 56C76 52 76 46 74 40M74 40L70 36M74 40L78 36M32 74C24 80 22 86 24 92M24 92L18 94M24 92L28 97M68 74C74 80 76 86 74 92M74 92L80 94M74 92L70 97" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="currentColor"><circle cx="9" cy="41" r="2.6"/><circle cx="11" cy="49" r="2.6"/><circle cx="70" cy="36" r="2.6"/><circle cx="78" cy="36" r="2.6"/><circle cx="18" cy="94" r="2.6"/><circle cx="28" cy="97" r="2.6"/><circle cx="80" cy="94" r="2.6"/><circle cx="70" cy="97" r="2.6"/></g>`,
  "vuursalamander": `<path d="M44 36L32 30L27 23M56 36L68 30L73 23M44 58L32 64L27 71M56 58L68 64L73 71" fill="none" stroke="#1f3428" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>
<g fill="#1f3428"><circle cx="27" cy="23" r="2"/><circle cx="73" cy="23" r="2"/><circle cx="27" cy="71" r="2"/><circle cx="73" cy="71" r="2"/></g>
<path fill="#1f3428" d="M50 74C50 82 48 88 42 93C46 86 46 80 46 74Z"/>
<path fill="#1f3428" d="M50 10C57 10 62 15 62 22C62 26 60 28 58 31C60 38 60 48 58 58C57 64 54 70 50 76C46 70 43 64 42 58C40 48 40 38 42 31C40 28 38 26 38 22C38 15 43 10 50 10Z"/>
<g fill="currentColor"><path d="M42 18C43 14 47 14 47 18C47 21 43 22 42 18ZM58 18C57 14 53 14 53 18C53 21 57 22 58 18Z"/>
<ellipse cx="45" cy="36" rx="2.8" ry="4.2"/><ellipse cx="55" cy="42" rx="2.8" ry="5"/><ellipse cx="45.5" cy="51" rx="2.6" ry="4"/><ellipse cx="54" cy="60" rx="2.2" ry="3.6"/><ellipse cx="49" cy="27" rx="2.6" ry="1.8"/><ellipse cx="48" cy="85" rx="1.5" ry="2.2"/><ellipse cx="31" cy="30" rx="1.6" ry="1.2"/><ellipse cx="69" cy="64" rx="1.6" ry="1.2"/></g>
<circle cx="44" cy="22" r="1.8" fill="#1f3428"/><circle cx="56" cy="22" r="1.8" fill="#1f3428"/>`,
  "gewone-pad": `<path fill="currentColor" fill-opacity=".55" d="M14 70C14 52 30 42 50 42C70 42 86 52 86 70C86 80 70 84 50 84C30 84 14 80 14 70Z"/>
<path fill="currentColor" d="M30 78C38 82 62 82 70 78C64 86 36 86 30 78Z" fill-opacity=".8"/>
<path fill="#1f3428" d="M24 50C28 46 34 46 36 50C34 54 28 56 24 54ZM76 50C72 46 66 46 64 50C66 54 72 56 76 54Z" fill-opacity=".45"/>
<g fill="#1f3428" fill-opacity=".45"><circle cx="35.3" cy="64.1" r="1.3"/><circle cx="68.9" cy="56.7" r="1.2"/><circle cx="77.8" cy="62.2" r="1.8"/><circle cx="30.4" cy="66.5" r="1.8"/><circle cx="59.6" cy="51.7" r="1.7"/><circle cx="23.7" cy="72.5" r="1.4"/><circle cx="62.3" cy="72.8" r="1.6"/><circle cx="73.6" cy="60.3" r="1.7"/><circle cx="46.9" cy="74.3" r="1.8"/><circle cx="27.5" cy="53.5" r="1.2"/><circle cx="76.1" cy="61.3" r="1.6"/><circle cx="38.9" cy="63.2" r="1.3"/><circle cx="41.7" cy="65.2" r="1.5"/><circle cx="72.6" cy="67.7" r="1.8"/><circle cx="70.0" cy="75.8" r="1.6"/><circle cx="31.1" cy="72.4" r="1.9"/><circle cx="72.7" cy="64.8" r="1.6"/><circle cx="33.8" cy="71.6" r="1.5"/><circle cx="38.0" cy="51.6" r="1.8"/><circle cx="66.8" cy="60.7" r="1.1"/></g>
<circle cx="35" cy="42" r="8.5" fill="currentColor" fill-opacity=".55"/><circle cx="65" cy="42" r="8.5" fill="currentColor" fill-opacity=".55"/>
<circle cx="35" cy="41" r="5.6" fill="currentColor" fill-opacity=".9"/><circle cx="65" cy="41" r="5.6" fill="currentColor" fill-opacity=".9"/>
<path fill="#1f3428" d="M30 41C33 39 37 39 40 41C37 43 33 43 30 41ZM60 41C63 39 67 39 70 41C67 43 63 43 60 41Z"/>
<path d="M32 66C42 70 58 70 68 66" fill="none" stroke="var(--av-bg,#4b7a5e)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 74L10 84L4 83M10 84L8 90M10 84L14 90M82 74L90 84L96 83M90 84L92 90M90 84L86 90" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  "grote-modderkruiper": `<path fill="currentColor" fill-opacity=".55" d="M88 45L97 38V62L88 56Z"/>
<path fill="currentColor" fill-opacity=".55" d="M14 50C14 44 20 41 28 41H70C78 41 84 43 90 46V55C84 58 78 60 70 60H28C20 60 14 56 14 50Z"/>
<path fill="currentColor" d="M16 54C20 58 26 60 32 60H70C76 60 82 58 88 55C80 61 72 62 64 62H30C22 62 17 59 16 54Z" fill-opacity=".85"/>
<path fill="#1f3428" d="M26 46H86C86 47.5 86 48 86 48.5H26Z"/><path fill="#1f3428" d="M30 52.5H88V54.5H30Z" fill-opacity=".8"/>
<path fill="#1f3428" d="M30 43.5H80V44.6H30Z" fill-opacity=".45"/>
<circle cx="22" cy="47" r="2" fill="#1f3428"/>
<path d="M16 52L8 55M17 54L11 60M19 55L16 63M16 50L7 50M18 56L20 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill="currentColor" fill-opacity=".55" d="M54 41L60 34L68 41Z"/><path fill="currentColor" fill-opacity=".55" d="M60 60L64 66L70 60Z"/>`,
  "kwabaal": `<path fill="currentColor" fill-opacity=".3" d="M46 42C56 34 72 35 81 44L80 47C70 45 58 44 46 44Z"/><path fill="currentColor" fill-opacity=".3" d="M46 63C58 70 72 68 81 57L80 55C70 59 58 61 46 62Z"/><path fill="currentColor" fill-opacity=".55" d="M80 46L93 38C96 46 96 56 93 64L80 56Z"/>

<path fill="currentColor" fill-opacity=".55" d="M10 52C10 42 20 38 34 40C48 42 66 44 80 46V56C66 60 48 64 34 64C20 64 10 60 10 52Z"/>
<path fill="currentColor" d="M12 56C18 62 28 64 36 63C50 62 66 60 80 56C68 64 50 66 34 66C22 66 14 62 12 56Z" fill-opacity=".8"/>
<path fill="currentColor" fill-opacity=".55" d="M38 40L42 33L48 41Z"/>
<g fill="#1f3428" fill-opacity=".55"><ellipse cx="34" cy="48" rx="3" ry="2"/><ellipse cx="44" cy="52" rx="3.4" ry="2.2"/><ellipse cx="54" cy="48" rx="3" ry="2"/><ellipse cx="64" cy="52" rx="3.2" ry="2"/><ellipse cx="72" cy="49" rx="2.4" ry="1.6"/><ellipse cx="26" cy="53" rx="2.2" ry="1.6"/></g>
<circle cx="20" cy="47" r="2.2" fill="#1f3428"/>
<path d="M11 54C14 56 18 56 21 55" fill="none" stroke="#1f3428" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 58L15 68" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  "beekdonderpad": `<g fill="currentColor" fill-opacity=".3"><ellipse cx="22" cy="82" rx="14" ry="7"/><ellipse cx="54" cy="86" rx="18" ry="7"/><ellipse cx="84" cy="80" rx="12" ry="6"/></g>
<path fill="currentColor" fill-opacity=".55" d="M80 52L92 44V66L80 60Z"/>
<path fill="currentColor" fill-opacity=".3" d="M50 45C58 36 72 38 80 50L79 52C70 48 60 46 50 46Z"/><path fill="currentColor" fill-opacity=".55" d="M10 60C10 46 20 38 34 38C44 38 54 44 64 48L82 52V60C66 64 50 68 36 68C20 68 10 66 10 60Z"/>
<path fill="currentColor" d="M12 62C20 66 30 66 38 66C52 66 66 62 82 59C68 66 52 70 36 70C22 70 14 67 12 62Z" fill-opacity=".8"/>
<path fill="currentColor" fill-opacity=".55" d="M36 38L41 31L48 41Z"/>

<g fill="#1f3428" fill-opacity=".5"><ellipse cx="44" cy="48" rx="4" ry="2.6"/><ellipse cx="60" cy="52" rx="4" ry="2.4"/><ellipse cx="72" cy="55" rx="3" ry="2"/></g>
<path d="M10 60L26 62" fill="none" stroke="#1f3428" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="25" cy="45" r="3.4" fill="#1f3428"/><circle cx="26" cy="44" r="1" fill="currentColor"/>
<path fill="currentColor" d="M36 54C38 64 44 72 56 76C54 66 48 58 42 54Z" fill-opacity=".7"/>
<path d="M40 57L47 70M43 56L51 68" fill="none" stroke="var(--av-bg,#4b7a5e)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  "tweekleurige-vleermuis": `<path fill="#2e2622" d="M41 46C32 37 18 34 4 41C11 46 13 53 10 60C19 56 28 58 33 66C35 59 37 55 41 55ZM59 46C68 37 82 34 96 41C89 46 87 53 90 60C81 56 72 58 67 66C65 59 63 55 59 55Z"/>
<path d="M41 47C34 46 24 48 14 54M41 50C34 53 28 58 26 64M59 47C66 46 76 48 86 54M59 50C66 53 72 58 74 64" fill="none" stroke="#4a3e38" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
<path fill="#3b302b" d="M50 34C43 34 39 41 39 51C39 62 43 70 50 72C57 70 61 62 61 51C61 41 57 34 50 34Z"/>
<path fill="#e6e1d6" d="M45 50C46 46 54 46 55 50C56 58 54 64 50 66C46 64 44 58 45 50Z"/>
<g fill="#dcd8cf" fill-opacity=".85"><circle cx="59.1" cy="68.2" r=".55"/><circle cx="41.1" cy="38.9" r=".55"/><circle cx="56.7" cy="61.0" r=".55"/><circle cx="51.6" cy="41.4" r=".55"/><circle cx="54.5" cy="69.8" r=".55"/><circle cx="59.0" cy="54.5" r=".55"/><circle cx="48.9" cy="45.1" r=".55"/><circle cx="40.7" cy="36.9" r=".55"/><circle cx="44.7" cy="36.8" r=".55"/><circle cx="46.5" cy="40.6" r=".55"/><circle cx="50.2" cy="70.0" r=".55"/><circle cx="53.5" cy="42.2" r=".55"/><circle cx="57.9" cy="63.1" r=".55"/><circle cx="47.1" cy="69.4" r=".55"/><circle cx="59.2" cy="41.5" r=".55"/><circle cx="49.8" cy="67.4" r=".55"/><circle cx="58.0" cy="51.7" r=".55"/><circle cx="51.4" cy="67.3" r=".55"/><circle cx="54.0" cy="41.6" r=".55"/><circle cx="58.2" cy="45.1" r=".55"/><circle cx="58.2" cy="46.5" r=".55"/><circle cx="59.1" cy="60.0" r=".55"/><circle cx="46.2" cy="43.1" r=".55"/><circle cx="50.2" cy="67.8" r=".55"/><circle cx="52.5" cy="38.6" r=".55"/><circle cx="56.4" cy="60.7" r=".55"/><circle cx="58.2" cy="42.5" r=".55"/><circle cx="54.9" cy="38.0" r=".55"/><circle cx="53.1" cy="45.3" r=".55"/><circle cx="42.1" cy="53.8" r=".55"/><circle cx="57.1" cy="44.3" r=".55"/><circle cx="40.6" cy="48.3" r=".55"/><circle cx="43.4" cy="58.9" r=".55"/><circle cx="41.7" cy="68.5" r=".55"/><circle cx="40.5" cy="60.8" r=".55"/><circle cx="40.4" cy="44.7" r=".55"/><circle cx="56.3" cy="41.3" r=".55"/><circle cx="43.7" cy="59.5" r=".55"/><circle cx="47.7" cy="37.5" r=".55"/><circle cx="59.8" cy="41.1" r=".55"/><circle cx="40.7" cy="47.7" r=".55"/></g>
<path fill="#2e2622" d="M43 37C40 32 40 27 43 25C46 27 47 32 46 36ZM57 37C60 32 60 27 57 25C54 27 53 32 54 36Z"/>
<path fill="#3b302b" d="M44 38C44 33 47 31 50 31C53 31 56 33 56 38C56 42 53 44 50 44C47 44 44 42 44 38Z"/>
<circle cx="47.5" cy="37" r="1.1" fill="#111"/><circle cx="52.5" cy="37" r="1.1" fill="#111"/>`,
  "grijze-grootoorvleermuis": `<path fill="#433a36" d="M41 58C34 50 22 48 6 54C12 58 14 64 12 70C20 66 28 68 33 74C35 68 37 64 41 64ZM59 58C66 50 78 48 94 54C88 58 86 64 88 70C80 66 72 68 67 74C65 68 63 64 59 64Z"/>
<path fill="#b5a49c" d="M45 46C38 38 26 22 28 8C39 9 48 27 49 43ZM55 46C62 38 74 22 72 8C61 9 52 27 51 43Z"/>
<path d="M44 40C40 32 35 23 33 15M56 40C60 32 65 23 67 15" fill="none" stroke="#8c7a72" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
<path d="M30 18C33 22 36 22 38 20M31 26C34 29 38 29 40 27M70 18C67 22 64 22 62 20M69 26C66 29 62 29 60 27" fill="none" stroke="#8c7a72" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
<path fill="#8f8a86" d="M50 44C43 44 40 51 40 60C40 70 44 77 50 79C56 77 60 70 60 60C60 51 57 44 50 44Z"/>
<path fill="#d3cdc6" d="M45 62C46 58 54 58 55 62C56 69 54 74 50 76C46 74 44 69 45 62Z"/>
<path fill="#3b3330" d="M43 48C46 46 54 46 57 48C58 53 55 57 50 58C45 57 42 53 43 48Z"/>
<circle cx="46.5" cy="51" r="1.4" fill="#0e0e0e"/><circle cx="53.5" cy="51" r="1.4" fill="#0e0e0e"/>
<path fill="#c79b97" d="M48.5 55H51.5L50 57Z"/>`,
  "noordse-woelmuis": `<path d="M20 100C22 66 25 38 30 6M80 100C78 70 76 44 73 14M90 100C88 78 88 58 90 38M10 100C12 84 12 70 10 56" fill="none" stroke="#9fae6a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
<path d="M30 24L42 12M74 30L62 20M89 46L98 36M11 62L2 52" fill="none" stroke="#b9b27a" stroke-width="2.2" stroke-linecap="round"/>
<path fill="#c9b694" d="M0 82C30 78 70 78 100 82V100H0Z"/>
<path fill="#6f523a" d="M22 70C22 55 35 46 52 46C64 46 72 52 75 60C77 66 74 74 66 76H32C26 76 22 74 22 70Z"/>
<path fill="#a98b6c" d="M30 76C34 70 46 68 58 70C64 71 68 73 70 76Z"/>
<path fill="#6f523a" d="M68 54C76 52 82 58 82 64C82 69 78 72 72 72Z"/>
<path fill="#7d5f45" d="M60 48C60 44 65 42 68 45C68 48 64 50 60 48Z"/>
<circle cx="72.5" cy="58.5" r="2.3" fill="#111"/><circle cx="73.2" cy="57.8" r=".7" fill="#fff"/>
<circle cx="82" cy="64" r="1.6" fill="#2b2019"/>
<path d="M80 66L90 64M80 67L89 70M79 65L88 60" fill="none" stroke="#e9e1d3" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
<path d="M22 70C16 70 12 72 10 76" fill="none" stroke="#6f523a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
<path fill="#d9c3ad" d="M40 76L38 80H43L44 76ZM60 76L61 80H66L65 76Z"/>`,
  "knoflookpad": `<path fill="#d6c193" d="M0 80C30 74 70 74 100 80V100H0Z"/>
<g fill="#c2a974"><circle cx="16" cy="88" r="1.4"/><circle cx="40" cy="92" r="1.2"/><circle cx="68" cy="90" r="1.4"/><circle cx="86" cy="94" r="1.1"/></g>
<path fill="#b8a582" d="M16 70C16 54 30 44 50 44C70 44 84 54 84 70C84 78 70 82 50 82C30 82 16 78 16 70Z"/>
<path fill="#e3d6bb" d="M30 76C38 80 62 80 70 76C64 83 36 83 30 76Z"/>
<g fill="#6e6a3e"><path d="M30 56C34 52 42 54 42 60C40 64 32 64 30 56Z"/><path d="M58 58C62 52 72 54 72 60C70 66 60 66 58 58Z"/><path d="M44 66C48 63 54 64 55 68C53 72 46 71 44 66Z"/><path d="M22 66C25 63 29 65 28 69C26 71 22 70 22 66Z"/><path d="M74 66C77 64 80 66 79 70C76 71 74 69 74 66Z"/></g>
<g fill="#c4572f"><circle cx="38" cy="70" r=".9"/><circle cx="62" cy="70" r=".9"/><circle cx="50" cy="58" r=".8"/><circle cx="26" cy="60" r=".8"/></g>
<circle cx="36" cy="44" r="9" fill="#b8a582"/><circle cx="64" cy="44" r="9" fill="#b8a582"/>
<circle cx="36" cy="43" r="6.5" fill="#d29a3a"/><circle cx="64" cy="43" r="6.5" fill="#d29a3a"/>
<path fill="#151515" d="M34.6 37.5C35.6 40 35.6 46 34.6 48.5H37.4C36.4 46 36.4 40 37.4 37.5ZM62.6 37.5C63.6 40 63.6 46 62.6 48.5H65.4C64.4 46 64.4 40 65.4 37.5Z"/>
<path d="M18 74L10 82L4 81M10 82L8 88M82 74L90 82L96 81M90 82L92 88" fill="none" stroke="#b8a582" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`,
  "gestippelde-alver": `<path fill="#d9b25e" d="M84 48L96 38C93 46 93 54 96 62L84 54Z"/>
<path fill="#d9b25e" d="M46 38L54 30L60 39ZM52 62L56 70L61 62ZM34 58L28 66L38 61Z" fill-opacity=".9"/>
<path fill="#cfd8db" d="M10 50C18 40 34 36 54 38C66 39 78 42 86 47V53C78 58 66 62 54 62C34 64 18 60 10 50Z"/>
<path fill="#7e978c" d="M10 50C18 40 34 36 54 38C66 39 78 42 86 47C78 45 66 43 54 43C38 43 22 45 10 50Z"/>
<path fill="#eef2f3" d="M12 52C22 58 38 61 54 60C66 59 76 56 86 53C76 60 64 63 54 63C36 64 20 60 12 52Z"/>
<g fill="#262626"><circle cx="32" cy="46.2" r="1.15"/><circle cx="32" cy="50.800000000000004" r="1.15"/><circle cx="38" cy="45.6" r="1.15"/><circle cx="38" cy="50.2" r="1.15"/><circle cx="44" cy="45.2" r="1.15"/><circle cx="44" cy="49.800000000000004" r="1.15"/><circle cx="50" cy="45" r="1.15"/><circle cx="50" cy="49.6" r="1.15"/><circle cx="56" cy="45.1" r="1.15"/><circle cx="56" cy="49.7" r="1.15"/><circle cx="62" cy="45.5" r="1.15"/><circle cx="62" cy="50.1" r="1.15"/><circle cx="68" cy="46.2" r="1.15"/><circle cx="68" cy="50.800000000000004" r="1.15"/><circle cx="74" cy="47.2" r="1.15"/><circle cx="74" cy="51.800000000000004" r="1.15"/></g>
<circle cx="20" cy="47" r="2.6" fill="#1b1b1b"/><circle cx="20.6" cy="46.4" r=".8" fill="#fff"/>
<path d="M10 50L15 51.5" fill="none" stroke="#555" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />`,
  "europese-steur": `<path fill="#5e6b62" d="M92 40C88 44 86 48 86 52L97 60C92 54 92 46 92 40Z"/>
<path fill="#7d8a7f" d="M6 52C10 46 20 43 34 42C52 41 70 43 86 49V55C70 60 52 62 34 61C20 60 10 57 6 52Z"/>
<path fill="#4f5b52" d="M6 52C10 46 20 43 34 42C52 41 70 43 86 49C70 46 52 45 34 46C22 47 12 49 6 52Z"/>
<path fill="#dfe3dc" d="M14 56C24 60 40 62 56 61C68 60 78 58 86 55C76 61 62 64 48 64C32 64 20 61 14 56Z"/>
<path fill="#5e6b62" d="M40 61L36 69L46 62ZM62 59L66 66L70 58ZM56 44L62 37L66 45Z"/>
<g fill="#eef0e8" stroke="#3b443d" stroke-width=".6"><path d="M26 44.5L29 42.5L32 44.5L29 46.5Z"/><path d="M36 43.6L39 41.6L42 43.6L39 45.6Z"/><path d="M46 43.3L49 41.3L52 43.3L49 45.3Z"/><path d="M56 43.6L59 41.6L62 43.6L59 45.6Z"/><path d="M66 44.6L69 42.6L72 44.6L69 46.6Z"/><path d="M76 46.4L79 44.4L82 46.4L79 48.4Z"/>
<path d="M30 53L33 51.5L36 53L33 54.5Z"/><path d="M42 53L45 51.5L48 53L45 54.5Z"/><path d="M54 53L57 51.5L60 53L57 54.5Z"/><path d="M66 53L69 51.5L72 53L69 54.5Z"/></g>
<circle cx="15" cy="49" r="1.9" fill="#151515"/><circle cx="15.5" cy="48.5" r=".6" fill="#fff"/>
<path d="M10 56L9 61M12 57L12 62M14 57.5L15 62M16 57.5L18 61.5" fill="none" stroke="#c9b48a" stroke-width="1" stroke-linecap="round"/>`,
  "zwarte-wouw": `<path fill="#4a3426" d="M50 40C40 36 26 34 6 40C14 42 22 46 28 50C36 50 44 50 50 52Z"/>
<path fill="#4a3426" d="M50 40C60 36 74 34 94 40C86 42 78 46 72 50C64 50 56 50 50 52Z"/>
<path fill="#7a5a40" d="M18 41C24 40 32 41 38 44C32 44 26 44 20 45ZM82 41C76 40 68 41 62 44C68 44 74 44 80 45Z"/>
<path d="M8 40L4 46M11 41L8 47M14 42L12 48M92 40L96 46M89 41L92 47M86 42L88 48" fill="none" stroke="#2e2018" stroke-width="2.2" stroke-linecap="round"/>
<path fill="#5c4130" d="M44 40C44 34 47 31 50 31C53 31 56 34 56 40L57 58C57 62 54 64 50 64C46 64 43 62 43 58Z"/>
<path fill="#5c4130" d="M44 62L40 80L48 75L50 78L52 75L60 80L56 62Z"/>
<path fill="#a98563" d="M46 34C47 32 53 32 54 34C54 37 52 38 50 38C48 38 46 37 46 34Z"/>
<path fill="#e7b93c" d="M48.6 31.5H51.4L51 34H49Z"/><path fill="#1c1410" d="M49.3 34L50 36.5L50.7 34Z"/>
<path d="M45 44C47 46 53 46 55 44M45 49C47 51 53 51 55 49M45 54C47 56 53 56 55 54" fill="none" stroke="#3a281d" stroke-width="1" stroke-linecap="round"/>`,
  "hop": `<path d="M58 92L58 76M66 92L64 78" fill="none" stroke="#6b5a4d" stroke-width="2.2" stroke-linecap="round"/>
<path fill="#d9a27a" d="M40 52C46 44 60 44 70 50C78 56 80 66 76 74C70 80 58 80 50 76C42 72 36 62 40 52Z"/>
<path fill="#1d1d1d" d="M62 52C70 54 80 60 90 74C82 76 72 74 64 70Z"/>
<g fill="#f3eee6"><path d="M66 58L74 60L72 62L65 60Z"/><path d="M68 63L78 66L76 68L67 65Z"/><path d="M70 68L82 71L80 73L69 70Z"/></g>
<path fill="#1d1d1d" d="M84 70L98 76L96 82L84 76Z"/><path fill="#f3eee6" d="M88 72.5L93 74.5L92.4 76.4L87.4 74.4Z"/>
<path fill="#e3ab83" d="M30 42C30 34 36 30 42 31C48 32 50 38 48 44C46 50 40 52 36 50C32 48 30 46 30 42Z"/>
<g fill="#e8955a"><path d="M33 34C30 24 30 16 34 10C38 16 39 26 38 33Z"/><path d="M38 32C38 22 41 14 46 10C48 18 45 26 42 33Z"/><path d="M42 33C45 25 50 19 56 17C55 24 50 30 45 35Z"/><path d="M45 36C50 31 56 28 62 29C59 34 53 37 47 39Z"/></g>
<g fill="#1d1d1d"><path d="M34 10C33 13 33 15 33.6 17L35.4 16.6C35.4 14 35 12 34 10Z"/><path d="M46 10C44 13 43 15 42.6 17.4L44.4 17.8C45 15.4 45.8 13 46 10Z"/><path d="M56 17C53 18.4 51 20 49.6 22L51 23.2C52.8 21.4 54.4 19.4 56 17Z"/><path d="M62 29C59 29 56.8 29.6 55 30.6L55.8 32.2C58 31.4 60 30.4 62 29Z"/></g>
<g fill="#fff"><path d="M33.4 18L35.8 17.4L36 19.6L33.8 20Z"/><path d="M42.4 18.4L44.6 18.8L44 21L42 20.4Z"/><path d="M49 22.6L50.6 24L49 25.6L47.6 24.2Z"/><path d="M54.6 31.2L55.6 33L53.4 33.8L52.8 32Z"/></g>
<path d="M31 42C24 44 16 48 8 54" fill="none" stroke="#2a2420" stroke-width="2.2" stroke-linecap="round"/>
<circle cx="35.5" cy="40" r="2" fill="#151515"/><circle cx="36" cy="39.5" r=".6" fill="#fff"/>`,
  "kleine-vliegenvanger": `<path d="M8 76C30 72 60 74 96 66" fill="none" stroke="#6d5442" stroke-width="3.6" stroke-linecap="round"/>
<path d="M70 70L82 60" fill="none" stroke="#6d5442" stroke-width="2.2" stroke-linecap="round"/><path fill="#8fae6a" d="M82 60C86 54 92 54 94 56C90 60 86 62 82 60Z"/>
<path fill="#1f1f1f" d="M58 58L80 50L86 56L66 66Z"/>
<path fill="#f4f4ef" d="M62 59L76 53.6L77.6 55.4L64 61.4ZM68 63.2L82 57.6L83.4 59.6L70 64.8Z"/>
<path fill="#9a8a7a" d="M34 50C34 40 42 34 50 34C58 34 64 40 64 50C64 60 58 68 50 70C42 70 34 62 34 50Z"/>
<path fill="#e9e3d6" d="M38 56C40 64 46 70 52 70C58 68 62 62 62 56C56 60 44 60 38 56Z"/>
<path fill="#e3743a" d="M36 46C38 50 42 54 48 54C44 58 38 58 35 54C34 52 34 49 36 46Z"/>
<path fill="#7d6e60" d="M44 50C50 46 60 48 66 56C60 60 52 60 46 58Z"/>
<path fill="#9a8a7a" d="M30 34C30 26 36 22 42 22C48 22 52 27 52 34C52 40 48 44 42 44C36 44 30 41 30 34Z"/>
<path fill="#e3743a" d="M30 36C32 42 36 45 42 45C38 48 33 47 31 44C30 42 30 39 30 36Z"/>
<path fill="#2a2420" d="M30 31L23 33L30 34.4Z"/>
<circle cx="37" cy="31" r="3.2" fill="#f2efe6"/><circle cx="37" cy="31" r="2.1" fill="#151515"/><circle cx="37.6" cy="30.4" r=".6" fill="#fff"/>
<path d="M50 70L50 76M54 70L55 75" fill="none" stroke="#3a302a" stroke-width="1.4" stroke-linecap="round"/>`,
  "ruigpootuil": `<path fill="#5b4632" d="M18 100C18 80 30 66 50 66C70 66 82 80 82 100Z"/>
<g fill="#efe6d6"><circle cx="30" cy="80" r="1.6"/><circle cx="38" cy="74" r="1.4"/><circle cx="62" cy="74" r="1.4"/><circle cx="70" cy="80" r="1.6"/><circle cx="26" cy="90" r="1.5"/><circle cx="74" cy="90" r="1.5"/><circle cx="34" cy="92" r="1.2"/><circle cx="66" cy="92" r="1.2"/></g>
<path fill="#e8dcc6" d="M38 80C42 74 58 74 62 80C64 88 62 96 60 100H40C38 96 36 88 38 80Z"/>
<path d="M44 82V88M50 80V87M56 82V88M46 92V98M54 92V98" fill="none" stroke="#9b8466" stroke-width="1.6" stroke-linecap="round"/>
<path fill="#5b4632" d="M16 46C16 26 31 14 50 14C69 14 84 26 84 46C84 64 70 74 50 74C30 74 16 64 16 46Z"/>
<g fill="#efe6d6"><circle cx="36" cy="22" r="1.3"/><circle cx="44" cy="19" r="1.2"/><circle cx="56" cy="19" r="1.2"/><circle cx="64" cy="22" r="1.3"/><circle cx="50" cy="20" r="1.1"/><circle cx="40" cy="25" r="1"/><circle cx="60" cy="25" r="1"/></g>
<path fill="#2c2119" d="M22 48C22 34 32 28 50 30C68 28 78 34 78 48C78 62 66 70 50 70C34 70 22 62 22 48Z"/>
<path fill="#f3eee4" d="M25 48C25 37 33 32 50 34C67 32 75 37 75 48C75 60 64 67 50 67C36 67 25 60 25 48Z"/>
<path fill="#f3eee4" d="M30 36C36 29 46 30 50 36C54 30 64 29 70 36C64 34 56 36 50 41C44 36 36 34 30 36Z"/>
<circle cx="38" cy="47" r="8" fill="#2c2119" fill-opacity=".12"/><circle cx="62" cy="47" r="8" fill="#2c2119" fill-opacity=".12"/>
<circle cx="38" cy="46" r="6" fill="#f2c12e"/><circle cx="62" cy="46" r="6" fill="#f2c12e"/>
<circle cx="38" cy="46" r="3.2" fill="#121212"/><circle cx="62" cy="46" r="3.2" fill="#121212"/>
<circle cx="39" cy="45" r="1" fill="#fff"/><circle cx="63" cy="45" r="1" fill="#fff"/>
<path fill="#d8c38f" d="M47.6 50H52.4L50 57Z"/>`
};
