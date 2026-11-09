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
  "tweekleurige-vleermuis": `<defs><radialGradient id="{id}m" cx=".4" cy=".4" r=".6"><stop offset="0" stop-color="#fbf3d0"/><stop offset="1" stop-color="#e9d9a0"/></radialGradient>
<linearGradient id="{id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2f2a"/><stop offset="1" stop-color="#1f1916"/></linearGradient></defs>
<circle cx="50" cy="44" r="40" fill="#fff" opacity=".07"/><circle cx="50" cy="44" r="28" fill="#fff" opacity=".06"/><circle cx="70" cy="28" r="15" fill="url(#{id}m)"/><circle cx="65" cy="24" r="2.4" fill="#e3d08e"/><circle cx="74" cy="33" r="1.8" fill="#e3d08e"/>
<path fill="url(#{id}w)" d="M44 46C36 36 22 32 4 38C10 42 12 48 9 56C16 52 22 53 27 58C29 52 33 51 36 55C38 50 41 49 44 52ZM56 46C64 36 78 32 96 38C90 42 88 48 91 56C84 52 78 53 73 58C71 52 67 51 64 55C62 50 59 49 56 52Z"/>
<path d="M44 46L24 38L4 38M44 47L9 56M44 49L27 58M44 50L36 55M56 46L76 38L96 38M56 47L91 56M56 49L73 58M56 50L64 55" fill="none" stroke="#5a4a42" stroke-width=".9" stroke-linecap="round"/>
<path fill="#3d312b" d="M50 34C43 34 40 41 40 51C40 61 44 68 50 70C56 68 60 61 60 51C60 41 57 34 50 34Z"/>
<path fill="#ece6da" d="M45.5 51C46.5 47 53.5 47 54.5 51C55.5 58 53.5 63 50 65C46.5 63 44.5 58 45.5 51Z"/>
<g fill="#e4ded2" opacity=".9"><circle cx="46.3" cy="53.1" r="0.6"/><circle cx="55.8" cy="51.4" r="0.7"/><circle cx="43.9" cy="40.3" r="0.6"/><circle cx="46.6" cy="45.6" r="0.7"/><circle cx="49.6" cy="60.1" r="0.6"/><circle cx="48.6" cy="60.7" r="0.5"/><circle cx="51.9" cy="60.8" r="0.7"/><circle cx="48.5" cy="40.4" r="0.5"/><circle cx="45.2" cy="63.0" r="0.5"/><circle cx="47.2" cy="40.7" r="0.6"/><circle cx="49.6" cy="57.3" r="0.6"/><circle cx="53.0" cy="62.1" r="0.6"/><circle cx="53.2" cy="53.8" r="0.5"/><circle cx="55.3" cy="42.3" r="0.5"/><circle cx="49.9" cy="46.2" r="0.7"/><circle cx="49.1" cy="55.0" r="0.6"/><circle cx="48.9" cy="60.0" r="0.7"/><circle cx="47.9" cy="54.0" r="0.7"/><circle cx="46.3" cy="48.1" r="0.5"/><circle cx="55.0" cy="63.8" r="0.7"/><circle cx="52.7" cy="56.8" r="0.6"/><circle cx="56.5" cy="61.7" r="0.7"/><circle cx="44.5" cy="55.7" r="0.7"/><circle cx="54.6" cy="53.8" r="0.6"/><circle cx="44.7" cy="51.6" r="0.7"/><circle cx="56.9" cy="42.1" r="0.5"/><circle cx="48.7" cy="43.6" r="0.6"/><circle cx="49.0" cy="50.0" r="0.5"/><circle cx="43.6" cy="54.7" r="0.5"/><circle cx="48.3" cy="54.1" r="0.7"/><circle cx="55.3" cy="63.5" r="0.7"/><circle cx="46.3" cy="40.9" r="0.5"/><circle cx="44.1" cy="54.4" r="0.5"/><circle cx="56.3" cy="63.3" r="0.6"/><circle cx="51.5" cy="43.7" r="0.5"/><circle cx="56.7" cy="48.2" r="0.6"/><circle cx="56.4" cy="61.5" r="0.6"/><circle cx="48.3" cy="60.9" r="0.6"/><circle cx="52.0" cy="54.3" r="0.7"/><circle cx="44.4" cy="63.3" r="0.7"/><circle cx="46.8" cy="55.2" r="0.7"/><circle cx="46.3" cy="47.2" r="0.6"/><circle cx="50.3" cy="53.2" r="0.5"/><circle cx="54.0" cy="63.7" r="0.6"/><circle cx="43.3" cy="54.8" r="0.7"/><circle cx="44.9" cy="55.2" r="0.6"/></g>
<path fill="#2a211d" d="M43.5 37C40.5 33 40.5 28 43 25.5C46.5 27 47.5 31.5 46.5 35.5ZM56.5 37C59.5 33 59.5 28 57 25.5C53.5 27 52.5 31.5 53.5 35.5Z"/>
<path fill="#5d4a40" d="M43.2 33C42.4 31 42.6 29 43.4 27.6C44.6 28.8 45 31 44.6 33Z"/><path fill="#5d4a40" d="M56.8 33C57.6 31 57.4 29 56.6 27.6C55.4 28.8 55 31 55.4 33Z"/>
<path fill="#3d312b" d="M44.5 38C44.5 33.5 47 31.5 50 31.5C53 31.5 55.5 33.5 55.5 38C55.5 42 53 44 50 44C47 44 44.5 42 44.5 38Z"/>
<circle cx="47.6" cy="37.2" r="1.2" fill="#0c0c0c"/><circle cx="52.4" cy="37.2" r="1.2" fill="#0c0c0c"/><circle cx="47.9" cy="36.9" r=".35" fill="#fff"/><circle cx="52.7" cy="36.9" r=".35" fill="#fff"/>
<path d="M48.6 41.2Q50 42.2 51.4 41.2" fill="none" stroke="#1a1411" stroke-width=".7" stroke-linecap="round"/>`,
  "grijze-grootoorvleermuis": `<defs><linearGradient id="{id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6a4c"/><stop offset="1" stop-color="#5e4632"/></linearGradient>
<linearGradient id="{id}f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d8682"/><stop offset=".5" stop-color="#a9a29d"/><stop offset="1" stop-color="#7f7874"/></linearGradient></defs>
<circle cx="50" cy="44" r="40" fill="#fff" opacity=".07"/><circle cx="50" cy="44" r="28" fill="#fff" opacity=".06"/><rect x="-2" y="6" width="104" height="12" fill="url(#{id}b)"/><path d="M-2 8H102M10 12H40M58 14H92" stroke="#4b3826" stroke-width=".8" opacity=".6"/>
<path d="M44 18L46 21M56 18L54 21" stroke="#2f2622" stroke-width="2.2" stroke-linecap="round"/>
<path fill="#3e3632" d="M42 22C34 26 30 38 34 50C38 46 41 47 43 50Z M58 22C66 26 70 38 66 50C62 46 59 47 57 50Z"/>
<path fill="url(#{id}f)" d="M50 20C43 20 40 27 40 37C40 48 44 56 50 58C56 56 60 48 60 37C60 27 57 20 50 20Z"/>
<path d="M44 26C45 34 45 42 47 50M56 26C55 34 55 42 53 50M50 22V54" fill="none" stroke="#c9c3be" stroke-width=".6" opacity=".7"/>
<path fill="#b9b1ab" d="M45 57C38 66 30 80 32 96C42 94 48 80 49 64Z"/><path fill="#b9b1ab" d="M55 57C62 66 70 80 68 96C58 94 52 80 51 64Z"/>
<path fill="#d9cbc4" d="M44.5 60C40 69 36 80 36.5 91C42 88 46 78 47.5 65Z" opacity=".55"/><path fill="#d9cbc4" d="M55.5 60C60 69 64 80 63.5 91C58 88 54 78 52.5 65Z" opacity=".55"/>
<path d="M36 90C39 87 42 87 44 89M37 82C40 79 43 79 45 81M39 74C42 71 44 71 46 73M64 90C61 87 58 87 56 89M63 82C60 79 57 79 55 81M61 74C58 71 56 71 54 73" fill="none" stroke="#8c7a72" stroke-width=".9" stroke-linecap="round"/>
<path fill="#f0e3db" d="M47 60C46 66 46 72 47.5 76C48.5 71 48.6 65 48.2 60ZM53 60C54 66 54 72 52.5 76C51.5 71 51.4 65 51.8 60Z"/>
<path fill="#2b2421" d="M43.5 58C45 54 55 54 56.5 58C57 63 54 67 50 67.5C46 67 43 63 43.5 58Z"/>
<circle cx="47" cy="59.5" r="1.5" fill="#0b0b0b"/><circle cx="53" cy="59.5" r="1.5" fill="#0b0b0b"/><circle cx="47.4" cy="59.1" r=".45" fill="#fff"/><circle cx="53.4" cy="59.1" r=".45" fill="#fff"/>
<path fill="#caa09a" d="M48.6 64H51.4L50 65.8Z"/>`,
  "noordse-woelmuis": `<defs><linearGradient id="{id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4130"/><stop offset=".7" stop-color="#7a5a42"/><stop offset="1" stop-color="#b09276"/></linearGradient>
<linearGradient id="{id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9aa6"/><stop offset="1" stop-color="#3d6874"/></linearGradient></defs>
<circle cx="50" cy="44" r="40" fill="#fff" opacity=".07"/><circle cx="50" cy="44" r="28" fill="#fff" opacity=".06"/><path d="M8 100C6.8 74 5.6 50 4.0 30" fill="none" stroke="#8fa864" stroke-width="2.2" stroke-linecap="round"/><path d="M16 100C17.8 74 19.6 50 22.0 18" fill="none" stroke="#a3b876" stroke-width="2.6" stroke-linecap="round"/><path d="M26 100C25.1 74 24.2 50 23.0 36" fill="none" stroke="#7f9858" stroke-width="2" stroke-linecap="round"/><path d="M76 100C77.5 74 79.0 50 81.0 14" fill="none" stroke="#a3b876" stroke-width="2.6" stroke-linecap="round"/><path d="M86 100C84.2 74 82.4 50 80.0 26" fill="none" stroke="#8fa864" stroke-width="2.2" stroke-linecap="round"/><path d="M94 100C94.9 74 95.8 50 97.0 40" fill="none" stroke="#7f9858" stroke-width="2" stroke-linecap="round"/><path fill="url(#{id}w)" d="M0 80C30 77 70 77 100 80V100H0Z"/>
<path d="M8 86H26M40 90H62M72 85H92M18 94H34M56 96H80" stroke="#a9cbd3" stroke-width="1" stroke-linecap="round" opacity=".7"/>
<path fill="#6c7b3f" d="M14 80C24 74 40 72 52 74C64 72 80 74 88 80C70 82 30 82 14 80Z"/>
<path d="M24 76L20 66M34 74L32 62M66 74L70 63M80 76L85 67" stroke="#9db06c" stroke-width="1.6" stroke-linecap="round"/>
<path fill="url(#{id}v)" d="M22 70C22 55 35 46 52 46C64 46 72 52 75 60C77 66 74 74 66 76H32C26 76 22 74 22 70Z"/>
<path d="M30 56C38 52 50 50 60 52M28 62C36 58 48 57 58 58" fill="none" stroke="#4a3426" stroke-width=".8" opacity=".6"/>
<path fill="#5a4130" d="M68 54C76 52 82 58 82 64C82 69 78 72 72 72Z"/>
<path fill="#6c4e39" d="M60 48C60 44 65 42 68 45C68 48 64 50 60 48Z"/><path fill="#a07d61" d="M62 47.2C62.4 45.4 64.6 44.6 66 45.8C65.4 47 63.6 47.8 62 47.2Z"/>
<circle cx="72.5" cy="58.5" r="2.4" fill="#0f0f0f"/><circle cx="73.3" cy="57.7" r=".8" fill="#fff"/>
<circle cx="82" cy="64" r="1.7" fill="#2b2019"/>
<path d="M80 66L91 64M80 67L90 71M79 65L89 59" fill="none" stroke="#efe7da" stroke-width=".7" stroke-linecap="round"/>
<path d="M22 70C16 70 12 72 9 76" fill="none" stroke="#5a4130" stroke-width="2.4" stroke-linecap="round"/>
<path fill="#d9c3ad" d="M40 76L38 79.5H43L44 76ZM60 76L61 79.5H66L65 76Z"/>`,
  "knoflookpad": `<defs><linearGradient id="{id}z" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2cf9f"/><stop offset="1" stop-color="#c9b283"/></linearGradient>
<radialGradient id="{id}h" cx=".5" cy=".35" r=".65"><stop offset="0" stop-color="#cdbb95"/><stop offset="1" stop-color="#a8956f"/></radialGradient>
<radialGradient id="{id}o" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#f0bf55"/><stop offset="1" stop-color="#b9792a"/></radialGradient></defs>
<circle cx="50" cy="44" r="40" fill="#fff" opacity=".07"/><circle cx="50" cy="44" r="28" fill="#fff" opacity=".06"/><path fill="url(#{id}z)" d="M0 76C30 70 70 70 100 76V100H0Z"/><circle cx="46.8" cy="92.9" r="1" fill="#b39a68"/><circle cx="69.9" cy="94.0" r="0.6" fill="#b39a68"/><circle cx="7.8" cy="92.8" r="1" fill="#e8d9b4"/><circle cx="62.3" cy="85.7" r="1" fill="#c4ab78"/><circle cx="36.9" cy="85.9" r="1" fill="#b39a68"/><circle cx="27.4" cy="95.0" r="0.6" fill="#c4ab78"/><circle cx="95.3" cy="93.0" r="0.8" fill="#e8d9b4"/><circle cx="50.0" cy="92.4" r="1" fill="#c4ab78"/><circle cx="33.5" cy="92.9" r="0.6" fill="#c4ab78"/><circle cx="59.7" cy="98.0" r="0.8" fill="#e8d9b4"/><circle cx="79.7" cy="98.3" r="0.6" fill="#e8d9b4"/><circle cx="73.2" cy="84.1" r="1.2" fill="#e8d9b4"/><circle cx="23.6" cy="82.3" r="0.8" fill="#e8d9b4"/><circle cx="79.5" cy="95.9" r="0.8" fill="#e8d9b4"/><circle cx="34.7" cy="95.7" r="0.6" fill="#b39a68"/><circle cx="35.1" cy="82.5" r="1" fill="#b39a68"/><circle cx="78.2" cy="85.2" r="1" fill="#b39a68"/><circle cx="42.0" cy="88.0" r="1.2" fill="#c4ab78"/><circle cx="90.4" cy="83.0" r="0.6" fill="#e8d9b4"/><circle cx="92.6" cy="96.7" r="1.2" fill="#b39a68"/><circle cx="93.2" cy="97.6" r="0.8" fill="#c4ab78"/><circle cx="73.6" cy="95.9" r="1" fill="#b39a68"/><circle cx="34.7" cy="84.3" r="0.6" fill="#b39a68"/><circle cx="95.2" cy="82.3" r="0.8" fill="#c4ab78"/><circle cx="5.4" cy="95.3" r="0.8" fill="#e8d9b4"/><circle cx="57.4" cy="80.2" r="0.6" fill="#c4ab78"/><circle cx="50.3" cy="84.5" r="0.6" fill="#b39a68"/><circle cx="53.6" cy="81.0" r="0.6" fill="#e8d9b4"/><circle cx="14.0" cy="98.5" r="1.2" fill="#c4ab78"/><circle cx="35.8" cy="83.7" r="0.6" fill="#c4ab78"/><circle cx="25.0" cy="85.2" r="0.8" fill="#c4ab78"/><circle cx="48.8" cy="90.8" r="1.2" fill="#c4ab78"/><circle cx="74.6" cy="84.7" r="1.2" fill="#c4ab78"/><circle cx="47.4" cy="94.8" r="0.6" fill="#c4ab78"/><circle cx="76.4" cy="80.9" r="0.6" fill="#c4ab78"/><circle cx="48.4" cy="80.6" r="0.6" fill="#b39a68"/><circle cx="50.2" cy="86.0" r="1" fill="#c4ab78"/><circle cx="35.7" cy="92.3" r="1" fill="#e8d9b4"/><circle cx="27.4" cy="98.8" r="1.2" fill="#c4ab78"/><circle cx="14.3" cy="80.1" r="1.2" fill="#c4ab78"/>
<path fill="url(#{id}h)" d="M16 70C16 54 30 44 50 44C70 44 84 54 84 70C84 77 70 80 50 80C30 80 16 77 16 70Z"/>
<path fill="#e6dcc3" d="M28 74C38 78 62 78 72 74C66 80 34 80 28 74Z"/>
<g fill="#6f6a3c"><path d="M30 56C34 52 42 54 42 60C40 64 32 64 30 56Z"/><path d="M58 58C62 52 72 54 72 60C70 66 60 66 58 58Z"/><path d="M44 66C48 63 54 64 55 68C53 72 46 71 44 66Z"/><path d="M22 66C25 63 29 65 28 69C26 71 22 70 22 66Z"/><path d="M74 66C77 64 80 66 79 70C76 71 74 69 74 66Z"/></g>
<g fill="#8b8550" opacity=".7"><path d="M32 57C35 55 39 56 39.5 59C38 61 34 61 32 57Z"/><path d="M60 59C63 56 68 57 69 60C67 62 62 62 60 59Z"/></g>
<g fill="#c4572f"><circle cx="38" cy="70" r=".9"/><circle cx="62" cy="70" r=".9"/><circle cx="50" cy="58" r=".8"/><circle cx="26" cy="60" r=".8"/><circle cx="70" cy="66" r=".7"/></g>
<path d="M30 73C40 75.5 60 75.5 70 73" fill="none" stroke="#7d6c4e" stroke-width="1" stroke-linecap="round"/>
<circle cx="46" cy="66" r=".8" fill="#5b4f3a"/><circle cx="54" cy="66" r=".8" fill="#5b4f3a"/>
<circle cx="36" cy="45" r="9.5" fill="#b8a582"/><circle cx="64" cy="45" r="9.5" fill="#b8a582"/>
<circle cx="36" cy="44" r="6.8" fill="url(#{id}o)"/><circle cx="64" cy="44" r="6.8" fill="url(#{id}o)"/>
<path d="M31 43Q36 41 41 43M59 43Q64 41 69 43" fill="none" stroke="#8a5420" stroke-width=".5" opacity=".7"/>
<path fill="#121212" d="M34.7 38C35.6 40.5 35.6 47.5 34.7 50H37.3C36.4 47.5 36.4 40.5 37.3 38ZM62.7 38C63.6 40.5 63.6 47.5 62.7 50H65.3C64.4 47.5 64.4 40.5 65.3 38Z"/>
<circle cx="33.6" cy="41.2" r="1.1" fill="#fff" opacity=".85"/><circle cx="61.6" cy="41.2" r="1.1" fill="#fff" opacity=".85"/>
<path d="M18 73L11 79L5 78M11 79L9 84M82 73L89 79L95 78M89 79L91 84" fill="none" stroke="#a8956f" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  "gestippelde-alver": `<defs><linearGradient id="{id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="{id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f7f74"/><stop offset=".45" stop-color="#b9c7c9"/><stop offset=".55" stop-color="#e7eded"/><stop offset="1" stop-color="#f6f8f8"/></linearGradient></defs>
<rect x="0" y="0" width="100" height="100" fill="url(#{id}w)"/>
<path d="M6 22C20 19 30 25 44 22M54 16C66 13 78 19 92 16M14 30C24 28 32 32 40 30" fill="none" stroke="#fff" stroke-width="1" opacity=".25" stroke-linecap="round"/>
<ellipse cx="10" cy="92" rx="8" ry="4" fill="#8c8a7c"/><ellipse cx="26" cy="96" rx="7" ry="3.4" fill="#a39f8f"/><ellipse cx="44" cy="93" rx="9" ry="4.2" fill="#7b796c"/><ellipse cx="62" cy="97" rx="8" ry="3.6" fill="#9a9686"/><ellipse cx="80" cy="93" rx="9" ry="4" fill="#868375"/><ellipse cx="94" cy="97" rx="6" ry="3" fill="#a6a292"/>
<path fill="#d9a85a" d="M84 48L96 37C93 46 93 54 96 63L84 54Z"/>
<path fill="#d9a85a" d="M46 38L54 29L60 39ZM52 61L56 70L61 61ZM32 58L26 66L37 60Z" opacity=".9"/>
<path fill="url(#{id}f)" d="M10 50C18 40 34 36 54 38C66 39 78 42 86 47V53C78 58 66 62 54 62C34 64 18 60 10 50Z"/>
<path d="M30 43C40 41 56 41 70 44" fill="none" stroke="#3f5a52" stroke-width=".6" opacity=".5"/>
<g fill="#222"><circle cx="28" cy="46.2" r="1.1"/><circle cx="28" cy="49.8" r="1.1"/><circle cx="33" cy="45.8" r="1.1"/><circle cx="33" cy="49.4" r="1.1"/><circle cx="38" cy="45.5" r="1.1"/><circle cx="38" cy="49.1" r="1.1"/><circle cx="43" cy="45.3" r="1.1"/><circle cx="43" cy="48.9" r="1.1"/><circle cx="48" cy="45.2" r="1.1"/><circle cx="48" cy="48.8" r="1.1"/><circle cx="53" cy="45.2" r="1.1"/><circle cx="53" cy="48.8" r="1.1"/><circle cx="58" cy="45.3" r="1.1"/><circle cx="58" cy="48.9" r="1.1"/><circle cx="63" cy="45.5" r="1.1"/><circle cx="63" cy="49.1" r="1.1"/><circle cx="68" cy="45.8" r="1.1"/><circle cx="68" cy="49.4" r="1.1"/><circle cx="73" cy="46.3" r="1.1"/><circle cx="73" cy="49.9" r="1.1"/></g>
<path d="M24 41C22 46 22 54 25 59" fill="none" stroke="#6b8580" stroke-width="1" opacity=".8"/>
<circle cx="18.5" cy="47" r="2.8" fill="#e9d79a"/><circle cx="18.5" cy="47" r="1.8" fill="#151515"/><circle cx="19.1" cy="46.4" r=".6" fill="#fff"/>
<path d="M10 50L14.5 51.5" fill="none" stroke="#555" stroke-width="1.2" stroke-linecap="round"/>`,
  "europese-steur": `<defs><linearGradient id="{id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5a52"/><stop offset=".55" stop-color="#7f8e83"/><stop offset=".75" stop-color="#c9cfc4"/><stop offset="1" stop-color="#e9ebe3"/></linearGradient>
<linearGradient id="{id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8a47a"/><stop offset="1" stop-color="#8c7b55"/></linearGradient></defs>
<circle cx="50" cy="44" r="40" fill="#fff" opacity=".07"/><circle cx="50" cy="44" r="28" fill="#fff" opacity=".06"/><path fill="url(#{id}b)" d="M0 78C20 74 40 79 60 75C76 72 90 76 100 74V100H0Z"/>
<path d="M6 84C14 82 20 86 28 84M40 88C50 86 56 90 66 88M74 84C82 82 88 85 96 83" fill="none" stroke="#a08d63" stroke-width="1.2" stroke-linecap="round"/>
<path fill="#4b5a52" d="M86 47C91 41 95 34 98 26C97 37 96 46 91 53Z"/><path fill="#5d6c62" d="M86 53C90 55 94 59 96 64C91 62 88 59 85 56Z"/>
<path fill="url(#{id}s)" d="M3 51C8 47 16 44 26 42C46 39 70 41 88 48V55C70 61 46 63 26 61C16 60 8 56 3 51Z"/>
<path fill="#4b5a52" d="M40 60L35 70L47 61.5ZM64 59L68 67L72 58ZM58 41L64 34L69 42Z"/>
<path d="M22 44C20 48 20 55 22 59" fill="none" stroke="#3f4c45" stroke-width="1.1"/>
<g fill="#eef0e8" stroke="#3b443d" stroke-width=".6"><path d="M22.8 42.6L26 40.2L29.2 42.6L26 44.6Z"/><path d="M30.8 41.4L34 39.0L37.2 41.4L34 43.4Z"/><path d="M38.8 40.8L42 38.4L45.2 40.8L42 42.8Z"/><path d="M46.8 40.6L50 38.2L53.2 40.6L50 42.6Z"/><path d="M54.8 41L58 38.6L61.2 41L58 43Z"/><path d="M62.8 41.8L66 39.4L69.2 41.8L66 43.8Z"/><path d="M70.8 43.2L74 40.800000000000004L77.2 43.2L74 45.2Z"/><path d="M78.8 45.4L82 43.0L85.2 45.4L82 47.4Z"/><path d="M27.4 51L30 49.4L32.6 51L30 52.6Z"/><path d="M35.4 51L38 49.4L40.6 51L38 52.6Z"/><path d="M43.4 51.2L46 49.6L48.6 51.2L46 52.800000000000004Z"/><path d="M51.4 51.4L54 49.8L56.6 51.4L54 53.0Z"/><path d="M59.4 51.6L62 50.0L64.6 51.6L62 53.2Z"/><path d="M67.4 51.6L70 50.0L72.6 51.6L70 53.2Z"/><path d="M75.4 51.4L78 49.8L80.6 51.4L78 53.0Z"/></g>
<circle cx="15" cy="47.5" r="1.9" fill="#121212"/><circle cx="15.5" cy="47" r=".6" fill="#fff"/>
<path d="M8 55L7 60.5M10 55.6L10 61M12 56L13 61.2M14 56.2L16 60.8" fill="none" stroke="#d8c396" stroke-width="1.1" stroke-linecap="round"/>`,
  "zwarte-wouw": `<defs><linearGradient id="{id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5c4130"/><stop offset="1" stop-color="#3b2a1f"/></linearGradient></defs>
<circle cx="50" cy="44" r="40" fill="#fff" opacity=".07"/><circle cx="50" cy="44" r="28" fill="#fff" opacity=".06"/><path d="M10 22C16 18 24 20 26 24C30 22 36 24 34 28H8C6 26 8 23 10 22ZM66 76C70 73 76 74 78 77C82 76 86 78 85 81H64C63 79 64 77 66 76Z" fill="#fff" opacity=".18"/>
<path fill="url(#{id}v)" d="M50 38C40 33 24 30 4 36C11 40 20 45 27 50C35 50 43 51 50 53Z"/><path fill="url(#{id}v)" d="M50 38C60 33 76 30 96 36C89 40 80 45 73 50C65 50 57 51 50 53Z"/>
<path fill="#9d7f62" d="M18 39C25 38 32 39 38 42C32 43 25 43 20 44ZM82 39C75 38 68 39 62 42C68 43 75 43 80 44Z" opacity=".8"/>
<path d="M27 48C33 47 40 48 47 50M73 48C67 47 60 48 53 50" fill="none" stroke="#2c1f17" stroke-width=".8" opacity=".6"/>
<path d="M6 36L2 43M9 37L6 44M12 38L10 45M15 39.5L14 46M94 36L98 43M91 37L94 44M88 38L90 45M85 39.5L86 46" fill="none" stroke="#24180f" stroke-width="2.2" stroke-linecap="round"/>
<path fill="#5c4130" d="M44 38C44 32 47 29 50 29C53 29 56 32 56 38L57 57C57 61 54 63 50 63C46 63 43 61 43 57Z"/>
<path fill="#4a3426" d="M43.5 61L38 82L47 77L50 72L53 77L62 82L56.5 61Z"/>
<path d="M44 66L41 79M56 66L59 79M47 64L45 76M53 64L55 76" stroke="#6d5140" stroke-width=".7"/>
<path fill="#b39577" d="M45.5 32C46.5 29.5 53.5 29.5 54.5 32C54.5 35.5 52.5 37 50 37C47.5 37 45.5 35.5 45.5 32Z"/>
<path d="M47 32.5Q48 31.6 49 32.5M51 32.5Q52 31.6 53 32.5" fill="none" stroke="#4a3426" stroke-width=".6"/>
<path fill="#e7b93c" d="M48.4 29.4H51.6L51.1 32H48.9Z"/><path fill="#1c1410" d="M49.2 32L50 34.8L50.8 32Z"/>
<path d="M45 42C47 44 53 44 55 42M45 47C47 49 53 49 55 47M45 52C47 54 53 54 55 52" fill="none" stroke="#3a281d" stroke-width="1" stroke-linecap="round"/>`,
  "hop": `<defs><linearGradient id="{id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8b38c"/><stop offset="1" stop-color="#c98e66"/></linearGradient></defs>
<circle cx="50" cy="44" r="40" fill="#fff" opacity=".07"/><circle cx="50" cy="44" r="28" fill="#fff" opacity=".06"/><path fill="#d9c08c" d="M0 88C30 84 70 84 100 88V100H0Z"/><path d="M14 88L12 80M18 88L19 79M22 88L25 81M80 87L78 80M84 87L86 79" stroke="#8fae6a" stroke-width="1.6" stroke-linecap="round"/>
<path d="M58 88L58 76M66 88L64 78" fill="none" stroke="#6b5a4d" stroke-width="2.2" stroke-linecap="round"/><path d="M55 88H61M62 88H68" stroke="#6b5a4d" stroke-width="1.6" stroke-linecap="round"/>
<path fill="url(#{id}l)" d="M40 52C46 44 60 44 70 50C78 56 80 66 76 74C70 80 58 80 50 76C42 72 36 62 40 52Z"/>
<path fill="#1d1d1d" d="M60 51C70 53 81 60 91 74C82 77 71 75 62 70Z"/>
<g fill="#f3eee6"><path d="M65 57L75 59.5L73.6 61.6L64.2 59.6Z"/><path d="M67 62.4L78.4 65.6L76.8 67.8L66.2 64.6Z"/><path d="M69.4 67.6L82.2 71L80.4 73.2L68.6 69.8Z"/></g>
<path fill="#1d1d1d" d="M85 70L98 76L96 82L84 76Z"/><path fill="#f3eee6" d="M88.6 72.6L93.6 74.6L93 76.4L88 74.4Z"/>
<path fill="#e7b18a" d="M30 42C30 34 36 30 42 31C48 32 50 38 48 44C46 50 40 52 36 50C32 48 30 46 30 42Z"/>
<g fill="#e8955a"><path d="M33 34C30 24 30 16 34 9C38 16 39 26 38 33Z"/><path d="M38 32C38 22 41 14 46 9C48 18 45 26 42 33Z"/><path d="M42 33C45 25 50 18 57 16C55 24 50 30 45 35Z"/><path d="M45 36C50 31 57 27 63 28C60 34 53 37 47 39Z"/></g>
<g fill="#c9783f" opacity=".7"><path d="M34.4 30C33 24 33 18 34 13C35.6 18 36 24 35.8 30Z"/><path d="M40 30C40.4 24 42 18 44.6 14C44.6 20 43 26 41.4 31Z"/></g>
<g fill="#1d1d1d"><path d="M34 9C33 12 33 14.6 33.6 17L35.4 16.6C35.4 14 35 11.6 34 9Z"/><path d="M46 9C44 12 43 14.6 42.6 17.4L44.4 17.8C45 15.4 45.8 12.6 46 9Z"/><path d="M57 16C54 17.4 51.6 19.4 50 21.8L51.4 23C53.2 21 55 18.6 57 16Z"/><path d="M63 28C60 28 57.4 28.8 55.4 30L56.2 31.6C58.6 30.6 60.8 29.4 63 28Z"/></g>
<g fill="#fff"><path d="M33.4 18L35.8 17.4L36 19.6L33.8 20Z"/><path d="M42.4 18.4L44.6 18.8L44 21L42 20.4Z"/><path d="M49 22.6L50.6 24L49 25.6L47.6 24.2Z"/><path d="M54.6 31.2L55.6 33L53.4 33.8L52.8 32Z"/></g>
<path d="M31 42C24 44 16 49 8 56" fill="none" stroke="#2a2420" stroke-width="2.2" stroke-linecap="round"/>
<circle cx="35.5" cy="40" r="2.1" fill="#151515"/><circle cx="36.1" cy="39.4" r=".65" fill="#fff"/>`,
  "kleine-vliegenvanger": `<defs><linearGradient id="{id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c8f82"/><stop offset="1" stop-color="#7d7064"/></linearGradient></defs>
<circle cx="50" cy="44" r="40" fill="#fff" opacity=".07"/><circle cx="50" cy="44" r="28" fill="#fff" opacity=".06"/><path d="M4 76C30 72 60 74 98 64" fill="none" stroke="#6d5442" stroke-width="3.6" stroke-linecap="round"/>
<path d="M72 69L84 58M20 74L12 64" fill="none" stroke="#6d5442" stroke-width="2" stroke-linecap="round"/>
<path fill="#8fae6a" d="M84 58C88 52 94 52 96 54C92 58 88 60 84 58Z"/><path fill="#7c9a58" d="M12 64C8 58 2 58 1 60C4 64 8 66 12 64Z"/><path fill="#9cba74" d="M86 62C92 60 97 63 98 66C93 67 89 66 86 62Z"/>
<path fill="#1f1f1f" d="M60 58L82 51L87 57L67 66Z"/>
<path fill="#f6f6f1" d="M63 58.8L76 54L77.4 56L65 61.2ZM68.4 63.2L82 58.4L83.4 60.4L70.4 65Z"/>
<path fill="url(#{id}b)" d="M36 50C36 40 43 35 50 35C58 35 64 41 64 50C64 60 58 67 50 69C42 69 36 61 36 50Z"/>
<path fill="#f1ece2" d="M39 57C41 64 46 69 51 69C57 67 61 62 62 56C56 60 45 60 39 57Z"/>
<path fill="#6f6257" d="M46 48C53 45 61 48 66 56C60 60 53 60 47 58Z"/><path d="M50 52L60 54M50 55L58 57" stroke="#5a4f46" stroke-width=".7"/>
<path fill="url(#{id}b)" d="M30 34C30 26 36 22 42 22C48 22 52 27 52 34C52 40 48 44 42 44C36 44 30 41 30 34Z"/>
<path fill="#e86a2e" d="M31.5 38C33 42.5 37 46 42.5 46.5C46 48.5 46 52 43 53C37 53 33 49 31.6 44C31 42 31 40 31.5 38Z"/>
<path fill="#2a2420" d="M30.4 31.4L23 33.2L30.4 34.8Z"/>
<circle cx="37" cy="31" r="3.4" fill="#f4f1e8"/><circle cx="37" cy="31" r="2.2" fill="#121212"/><circle cx="37.7" cy="30.3" r=".7" fill="#fff"/>
<path d="M50 69L50 75M54 69L55 74.4" fill="none" stroke="#3a302a" stroke-width="1.4" stroke-linecap="round"/>`,
  "ruigpootuil": `<defs><linearGradient id="{id}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5e4a37"/><stop offset=".5" stop-color="#7d6650"/><stop offset="1" stop-color="#5a4634"/></linearGradient>
<radialGradient id="{id}g" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="#ffd84a"/><stop offset="1" stop-color="#e9a91c"/></radialGradient></defs>
<rect x="0" y="0" width="100" height="100" fill="url(#{id}t)"/><path d="M4 0C4.4 30 1.3 70 3.8 100" fill="none" stroke="#4a3a2b" stroke-width="1.4" opacity=".55"/><path d="M11 0C12.7 30 10.3 70 12.2 100" fill="none" stroke="#4a3a2b" stroke-width="1.4" opacity=".55"/><path d="M18 0C20.3 30 15.3 70 18.5 100" fill="none" stroke="#4a3a2b" stroke-width="1.4" opacity=".55"/><path d="M25 0C23.9 30 27.7 70 24.7 100" fill="none" stroke="#4a3a2b" stroke-width="0.8" opacity=".55"/><path d="M32 0C30.5 30 32.2 70 32.8 100" fill="none" stroke="#4a3a2b" stroke-width="0.8" opacity=".55"/><path d="M39 0C40.8 30 37.3 70 37.5 100" fill="none" stroke="#4a3a2b" stroke-width="0.8" opacity=".55"/><path d="M46 0C48.6 30 45.2 70 47.6 100" fill="none" stroke="#4a3a2b" stroke-width="1.1" opacity=".55"/><path d="M53 0C50.7 30 54.1 70 54.8 100" fill="none" stroke="#4a3a2b" stroke-width="1.4" opacity=".55"/><path d="M60 0C61.0 30 62.3 70 61.2 100" fill="none" stroke="#4a3a2b" stroke-width="1.4" opacity=".55"/><path d="M67 0C64.7 30 65.9 70 67.1 100" fill="none" stroke="#4a3a2b" stroke-width="1.4" opacity=".55"/><path d="M74 0C75.3 30 73.8 70 72.9 100" fill="none" stroke="#4a3a2b" stroke-width="1.1" opacity=".55"/><path d="M81 0C78.3 30 78.6 70 79.4 100" fill="none" stroke="#4a3a2b" stroke-width="1.1" opacity=".55"/><path d="M88 0C86.1 30 85.1 70 89.4 100" fill="none" stroke="#4a3a2b" stroke-width="0.8" opacity=".55"/><path d="M95 0C92.2 30 92.7 70 94.9 100" fill="none" stroke="#4a3a2b" stroke-width="1.4" opacity=".55"/>
<ellipse cx="50" cy="54" rx="31" ry="37" fill="#3a2c20"/><ellipse cx="50" cy="56" rx="27" ry="33" fill="#120d09"/>
<path fill="#5b4632" d="M22 58C22 40 34 30 50 30C66 30 78 40 78 58C78 76 66 88 50 88C34 88 22 76 22 58Z"/>
<g fill="#efe6d6"><circle cx="34" cy="38" r="1.3"/><circle cx="41" cy="34.5" r="1.2"/><circle cx="50" cy="33.5" r="1.2"/><circle cx="59" cy="34.5" r="1.2"/><circle cx="66" cy="38" r="1.3"/><circle cx="45" cy="37" r=".9"/><circle cx="55" cy="37" r=".9"/></g>
<path fill="#2c2119" d="M26 60C26 47 35 41 50 43C65 41 74 47 74 60C74 73 63 81 50 81C37 81 26 73 26 60Z"/>
<path fill="#f3eee4" d="M29 60C29 50 36 45 50 47C64 45 71 50 71 60C71 71 61 78 50 78C39 78 29 71 29 60Z"/>
<path fill="#fffdf8" d="M33 49C38 43 46 44 50 50C54 44 62 43 67 49C61 47 55 49 50 54C45 49 39 47 33 49Z"/>
<circle cx="40" cy="60" r="8" fill="#2c2119" opacity=".1"/><circle cx="60" cy="60" r="8" fill="#2c2119" opacity=".1"/>
<circle cx="40" cy="59" r="6.2" fill="url(#{id}g)"/><circle cx="60" cy="59" r="6.2" fill="url(#{id}g)"/>
<circle cx="40" cy="59" r="3.3" fill="#111"/><circle cx="60" cy="59" r="3.3" fill="#111"/>
<circle cx="41.2" cy="57.8" r="1.1" fill="#fff"/><circle cx="61.2" cy="57.8" r="1.1" fill="#fff"/>
<path fill="#d8c38f" d="M47.6 63H52.4L50 70Z"/>
<path d="M30 86C34 82 40 84 42 88M58 88C60 84 66 82 70 86" fill="none" stroke="#e8dcc6" stroke-width="2.4" stroke-linecap="round"/>`
};
