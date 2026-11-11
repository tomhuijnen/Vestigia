/* Vestigia – eikels, avatars, Mijn profiel, shop en prestaties (stap 6 en 6b).
   Mijn profiel: kiezen uit wat je hebt. Shop: kopen, van goedkoop naar duur.
   Alles wat geld of bezit is, rekent de server uit (wallet, my_items, buy_item, set_profile); de app bewaart
   alleen een kopie om meteen iets te kunnen tonen. Zolang de database nog niet is bijgewerkt, blijven
   eikels en winkel onzichtbaar en werkt de rest van de app gewoon. */
"use strict";

/* ---------- tekenen: avatar met achtergrondkleur en lijst ---------- */
const KLEUREN = {
  groen: { bg: "#4b7a5e", fg: "#edfbe2", naam: "Groen" },
  mint:  { bg: "#d6eccb", fg: "#2c4a37", naam: "Mint" },
  oker:  { bg: "#a9792b", fg: "#fbf1d9", naam: "Oker" },
  heide: { bg: "#76506f", fg: "#f7eaf4", naam: "Heide" },
  nacht: { bg: "#1e2c3b", fg: "#dfe9f2", naam: "Nacht" },
  wad:      { bg: "#7f98a1", fg: "#f2f6f7", naam: "Wad" },
  veen:     { bg: "#4a3426", fg: "#f0e2cf", naam: "Veen" },
  ijsvogel: { bg: "#0f7fa8", fg: "#ffd2a6", naam: "IJsvogel" },
  klaproos: { bg: "#b8352b", fg: "#fde6df", naam: "Klaproos" },
  /* alleen uit de adventkalender (update 8) */
  winter:   { bg: "#cfe2ec", fg: "#24485c", naam: "Winter" },
  hulst:    { bg: "#1d4a32", fg: "#f6d9dc", naam: "Hulst" }
};
const LIJSTEN = {
  hout: `<circle cx="50" cy="50" r="47" fill="none" stroke="#7d5330" stroke-width="6"/><circle cx="50" cy="50" r="47" fill="none" stroke="#b07a46" stroke-width="1.6" stroke-dasharray="7 10" stroke-linecap="round"/>`,
  mos: `<circle cx="50" cy="50" r="47" fill="none" stroke="#56742c" stroke-width="6"/><circle cx="50" cy="50" r="47" fill="none" stroke="#a6c95e" stroke-width="2.4" stroke-dasharray="1 5" stroke-linecap="round"/>`,
  nachtzicht: `<circle cx="50" cy="50" r="47" fill="none" stroke="#0e1822" stroke-width="6"/><circle cx="50" cy="50" r="47" fill="none" stroke="#cfe3ff" stroke-width="1.8" stroke-dasharray="0.1 11" stroke-linecap="round"/>`,
  goud: `<circle cx="50" cy="50" r="47" fill="none" stroke="#c9972e" stroke-width="6"/><circle cx="50" cy="50" r="44.3" fill="none" stroke="#f5dc8e" stroke-width="1"/>`,
  /* november 2026: {id} wordt per avatar vervangen, zodat verlopen (gradients) nooit botsen of verdwijnen */
  berkenschors: `<g transform="translate(50 50) scale(.968) translate(-50 -50)"><circle cx="50" cy="50" r="46.9" fill="none" stroke="#3c342c" stroke-width="9.4"/><circle cx="50" cy="50" r="46.9" fill="none" stroke="#efeae0" stroke-width="7.4"/><path d="M96.2 58.1A46.9 46.9 0 0 1 5.9 66.0" stroke="#d3cbbb" stroke-width="7.4" fill="none" opacity=".6"/><path d="M66.0 5.9A46.9 46.9 0 0 1 72.7 9.0" stroke="#c4977a" stroke-width="3.4" stroke-linecap="round" fill="none" opacity=".85"/><path d="M96.6 54.9A46.9 46.9 0 0 1 95.7 60.6" stroke="#c4977a" stroke-width="3.4" stroke-linecap="round" fill="none" opacity=".85"/><path d="M49.2 96.9A46.9 46.9 0 0 1 41.1 96.0" stroke="#c4977a" stroke-width="3.4" stroke-linecap="round" fill="none" opacity=".85"/><path d="M7.5 69.8A46.9 46.9 0 0 1 5.7 65.3" stroke="#c4977a" stroke-width="3.4" stroke-linecap="round" fill="none" opacity=".85"/><path d="M26.5 9.4A46.9 46.9 0 0 1 32.4 6.5" stroke="#c4977a" stroke-width="3.4" stroke-linecap="round" fill="none" opacity=".85"/><path d="M50.0 1.0A49 49 0 0 1 55.1 1.3" stroke="#1d1a17" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M61.9 2.5A49 49 0 0 1 68.4 4.6" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M71.1 6.8A48.1 48.1 0 0 1 76.9 10.1" stroke="#1d1a17" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M79.6 12.1A48.1 48.1 0 0 1 81.6 13.7" stroke="#1d1a17" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M84.6 15.4A49 49 0 0 1 86.4 17.2" stroke="#1d1a17" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M87.1 19.4A48.1 48.1 0 0 1 91.0 24.9" stroke="#1d1a17" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M89.7 29.3A44.8 44.8 0 0 1 92.2 35.0" stroke="#1d1a17" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M92.8 36.9A44.8 44.8 0 0 1 93.5 39.2" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M94.1 42.2A44.8 44.8 0 0 1 94.8 48.4" stroke="#1d1a17" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M98.9 53.4A49 49 0 0 1 98.3 58.5" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M95.6 61.4A47 47 0 0 1 92.9 69.1" stroke="#1d1a17" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M90.1 70.0A44.8 44.8 0 0 1 86.0 76.6" stroke="#1d1a17" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M86.1 83.1A49 49 0 0 1 82.5 86.7" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M76.7 87.4A45.9 45.9 0 0 1 73.3 89.5" stroke="#1d1a17" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M68.6 90.8A44.8 44.8 0 0 1 66.4 91.7" stroke="#1d1a17" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M64.6 92.4A44.8 44.8 0 0 1 60.1 93.7" stroke="#1d1a17" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M53.9 94.6A44.8 44.8 0 0 1 51.6 94.8" stroke="#1d1a17" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M49.6 95.9A45.9 45.9 0 0 1 46.4 95.8" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M39.6 97.0A48.1 48.1 0 0 1 34.7 95.6" stroke="#1d1a17" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M33.6 92.9A45.9 45.9 0 0 1 27.7 90.1" stroke="#1d1a17" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M24.3 86.7A44.8 44.8 0 0 1 21.2 84.3" stroke="#1d1a17" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M15.4 83.4A48.1 48.1 0 0 1 13.7 81.6" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M14.2 77.0A44.8 44.8 0 0 1 12.4 74.4" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M8.6 74.4A48.1 48.1 0 0 1 6.2 69.9" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M4.1 67.2A49 49 0 0 1 2.6 62.3" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M2.7 58.8A48.1 48.1 0 0 1 2.0 53.8" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M4.2 47.2A45.9 45.9 0 0 1 4.7 42.4" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M4.7 37.4A47 47 0 0 1 6.9 31.3" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M7.3 27.8A48.1 48.1 0 0 1 9.0 24.9" stroke="#1d1a17" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M11.9 24.3A45.9 45.9 0 0 1 13.3 22.4" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M18.3 18.3A44.8 44.8 0 0 1 21.2 15.7" stroke="#1d1a17" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M23.1 10.1A48.1 48.1 0 0 1 26.7 7.9" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M29.5 8.9A45.9 45.9 0 0 1 31.7 7.9" stroke="#1d1a17" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M33.6 3.8A49 49 0 0 1 36.1 3.0" stroke="#1d1a17" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M41.2 2.7A48.1 48.1 0 0 1 47.9 1.9" stroke="#1d1a17" stroke-width="1.4" stroke-linecap="round" fill="none"/><g transform="translate(88.4 23.1) rotate(55)"><path d="M-6 0Q0 -3.6 6 0Q0 3.6 -6 0Z" fill="#14110f"/><path d="M-3.4 -2.2L0 -4.6L3.4 -2.2" stroke="#14110f" stroke-width="1.4" fill="none" stroke-linecap="round"/></g><g transform="translate(80.1 85.9) rotate(140)"><path d="M-6 0Q0 -3.6 6 0Q0 3.6 -6 0Z" fill="#14110f"/><path d="M-3.4 -2.2L0 -4.6L3.4 -2.2" stroke="#14110f" stroke-width="1.4" fill="none" stroke-linecap="round"/></g><g transform="translate(15.1 81.4) rotate(228)"><path d="M-6 0Q0 -3.6 6 0Q0 3.6 -6 0Z" fill="#14110f"/><path d="M-3.4 -2.2L0 -4.6L3.4 -2.2" stroke="#14110f" stroke-width="1.4" fill="none" stroke-linecap="round"/></g><g transform="translate(9.4 26.5) rotate(300)"><path d="M-6 0Q0 -3.6 6 0Q0 3.6 -6 0Z" fill="#14110f"/><path d="M-3.4 -2.2L0 -4.6L3.4 -2.2" stroke="#14110f" stroke-width="1.4" fill="none" stroke-linecap="round"/></g></g>`,
  rietkraag: `<circle cx="50" cy="50" r="47" fill="none" stroke="#c7a86a" stroke-width="6"/><circle cx="50" cy="50" r="47" fill="none" stroke="#8a6a32" stroke-width="6" stroke-dasharray="1.2 2.6"/>`,
  vorst: `<defs><linearGradient id="{id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9f0fa"/><stop offset=".4" stop-color="#7fb7d6"/><stop offset=".7" stop-color="#3f7fa8"/><stop offset="1" stop-color="#a9d6ec"/></linearGradient></defs><circle cx="50" cy="50" r="46.8" fill="none" stroke="#244f6b" stroke-width="8.4"/><circle cx="50" cy="50" r="46.8" fill="none" stroke="url(#{id}r)" stroke-width="6.6"/><path d="M52.1 4.2L60.7 4.2M58.8 4.2L59.6 5.7M58.8 4.2L59.6 2.8M54.1 4.2L53.2 2.8M54.1 4.2L53.2 5.7M54.3 0.5L58.6 8.0M57.6 6.3L56.8 7.7M57.6 6.3L59.2 6.3M55.2 2.2L56.1 0.8M55.2 2.2L53.6 2.2M58.6 0.5L54.3 8.0M55.2 6.3L53.6 6.3M55.2 6.3L56.1 7.7M57.6 2.2L59.2 2.2M57.6 2.2L56.8 0.8M76.4 12.0L83.0 12.0M81.5 12.0L82.1 13.1M81.5 12.0L82.1 10.9M77.9 12.0L77.2 10.9M77.9 12.0L77.2 13.1M78.0 9.2L81.3 14.9M80.6 13.6L80.0 14.7M80.6 13.6L81.8 13.6M78.8 10.4L79.4 9.4M78.8 10.4L77.5 10.4M81.3 9.2L78.0 14.9M78.8 13.6L77.5 13.6M78.8 13.6L79.4 14.7M80.6 10.4L81.8 10.4M80.6 10.4L80.0 9.4M89.5 32.7L96.1 32.7M94.7 32.7L95.3 33.8M94.7 32.7L95.3 31.6M91.0 32.7L90.4 31.6M91.0 32.7L90.4 33.8M91.2 29.8L94.5 35.6M93.7 34.3L93.1 35.4M93.7 34.3L95.0 34.3M91.9 31.1L92.6 30.0M91.9 31.1L90.7 31.1M94.5 29.8L91.2 35.6M91.9 34.3L90.7 34.3M91.9 34.3L92.6 35.4M93.7 31.1L95.0 31.1M93.7 31.1L93.1 30.0M93.4 56.7L102.0 56.7M100.1 56.7L100.9 58.1M100.1 56.7L100.9 55.3M95.4 56.7L94.5 55.3M95.4 56.7L94.5 58.1M95.6 53.0L99.9 60.4M98.9 58.8L98.1 60.2M98.9 58.8L100.5 58.8M96.5 54.7L97.4 53.2M96.5 54.7L94.9 54.7M99.9 53.0L95.6 60.4M96.5 58.8L94.9 58.8M96.5 58.8L97.4 60.2M98.9 54.7L100.5 54.7M98.9 54.7L98.1 53.2M83.1 78.4L89.7 78.4M88.2 78.4L88.8 79.5M88.2 78.4L88.8 77.4M84.6 78.4L84.0 77.4M84.6 78.4L84.0 79.5M84.8 75.6L88.1 81.3M87.3 80.0L86.7 81.1M87.3 80.0L88.6 80.0M85.5 76.9L86.1 75.8M85.5 76.9L84.2 76.9M88.1 75.6L84.8 81.3M85.5 80.0L84.2 80.0M85.5 80.0L86.1 81.1M87.3 76.9L88.6 76.9M87.3 76.9L86.7 75.8M64.8 94.7L71.4 94.7M69.9 94.7L70.5 95.8M69.9 94.7L70.5 93.6M66.2 94.7L65.6 93.6M66.2 94.7L65.6 95.8M66.4 91.8L69.7 97.5M69.0 96.3L68.3 97.3M69.0 96.3L70.2 96.3M67.1 93.1L67.8 92.0M67.1 93.1L65.9 93.1M69.7 91.8L66.4 97.5M67.1 96.3L65.9 96.3M67.1 96.3L67.8 97.3M69.0 93.1L70.2 93.1M69.0 93.1L68.3 92.0M39.3 95.8L47.9 95.8M45.9 95.8L46.8 97.2M45.9 95.8L46.8 94.3M41.2 95.8L40.4 94.3M41.2 95.8L40.4 97.2M41.4 92.0L45.7 99.5M44.8 97.8L43.9 99.2M44.8 97.8L46.4 97.8M42.4 93.7L43.2 92.3M42.4 93.7L40.8 93.7M45.7 92.0L41.4 99.5M42.4 97.8L40.8 97.8M42.4 97.8L43.2 99.2M44.8 93.7L46.4 93.7M44.8 93.7L43.9 92.3M17.0 88.0L23.6 88.0M22.1 88.0L22.8 89.1M22.1 88.0L22.8 86.9M18.5 88.0L17.9 86.9M18.5 88.0L17.9 89.1M18.7 85.1L22.0 90.8M21.2 89.6L20.6 90.6M21.2 89.6L22.5 89.6M19.4 86.4L20.0 85.3M19.4 86.4L18.2 86.4M22.0 85.1L18.7 90.8M19.4 89.6L18.2 89.6M19.4 89.6L20.0 90.6M21.2 86.4L22.5 86.4M21.2 86.4L20.6 85.3M3.9 67.3L10.5 67.3M9.0 67.3L9.6 68.4M9.0 67.3L9.6 66.2M5.3 67.3L4.7 66.2M5.3 67.3L4.7 68.4M5.5 64.4L8.8 70.2M8.1 68.9L7.4 70.0M8.1 68.9L9.3 68.9M6.3 65.7L6.9 64.6M6.3 65.7L5.0 65.7M8.8 64.4L5.5 70.2M6.3 68.9L5.0 68.9M6.3 68.9L6.9 70.0M8.1 65.7L9.3 65.7M8.1 65.7L7.4 64.6M-2.0 43.3L6.6 43.3M4.6 43.3L5.5 44.7M4.6 43.3L5.5 41.9M-0.1 43.3L-0.9 41.9M-0.1 43.3L-0.9 44.7M0.1 39.6L4.4 47.0M3.5 45.3L2.6 46.8M3.5 45.3L5.1 45.3M1.1 41.2L1.9 39.8M1.1 41.2L-0.5 41.2M4.4 39.6L0.1 47.0M1.1 45.3L-0.5 45.3M1.1 45.3L1.9 46.8M3.5 41.2L5.1 41.2M3.5 41.2L2.6 39.8M10.3 21.6L16.9 21.6M15.4 21.6L16.0 22.6M15.4 21.6L16.0 20.5M11.8 21.6L11.2 20.5M11.8 21.6L11.2 22.6M11.9 18.7L15.2 24.4M14.5 23.1L13.9 24.2M14.5 23.1L15.8 23.1M12.7 20.0L13.3 18.9M12.7 20.0L11.4 20.0M15.2 18.7L11.9 24.4M12.7 23.1L11.4 23.1M12.7 23.1L13.3 24.2M14.5 20.0L15.8 20.0M14.5 20.0L13.9 18.9M28.6 5.3L35.2 5.3M33.8 5.3L34.4 6.4M33.8 5.3L34.4 4.2M30.1 5.3L29.5 4.2M30.1 5.3L29.5 6.4M30.3 2.5L33.6 8.2M32.9 6.9L32.2 8.0M32.9 6.9L34.1 6.9M31.0 3.7L31.7 2.7M31.0 3.7L29.8 3.7M33.6 2.5L30.3 8.2M31.0 6.9L29.8 6.9M31.0 6.9L31.7 8.0M32.9 3.7L34.1 3.7M32.9 3.7L32.2 2.7" stroke="#ffffff" stroke-width="1.15" stroke-linecap="round" fill="none"/><circle cx="50" cy="50" r="46.8" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="0.1 4.3" stroke-linecap="round" opacity=".9"/><path d="M18.6 10.9Q19.3 14.3 22.8 15.1Q19.3 15.8 18.6 19.3Q17.8 15.8 14.4 15.1Q17.8 14.3 18.6 10.9Z" fill="#fff"/><path d="M91.1 70.8Q91.7 73.2 94.1 73.8Q91.7 74.3 91.1 76.8Q90.6 74.3 88.1 73.8Q90.6 73.2 91.1 70.8Z" fill="#fff"/><circle cx="50" cy="50" r="43" fill="none" stroke="#ffffff" stroke-width=".8" opacity=".9"/>`,
  ijsvogel: `<defs><linearGradient id="{id}i" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#28c4e8"/><stop offset=".35" stop-color="#0b86c2"/><stop offset=".65" stop-color="#0a4f8f"/><stop offset="1" stop-color="#1fb3d8"/></linearGradient></defs><circle cx="50" cy="50" r="47" fill="none" stroke="#06284a" stroke-width="7.6"/><circle cx="50" cy="50" r="47" fill="none" stroke="url(#{id}i)" stroke-width="6.4"/><circle cx="50.0" cy="2.2" r=".55" fill="#bff3ff"/><circle cx="59.6" cy="4.8" r=".55" fill="#bff3ff"/><circle cx="64.8" cy="4.5" r=".55" fill="#bff3ff"/><circle cx="73.1" cy="10.0" r=".55" fill="#bff3ff"/><circle cx="78.1" cy="11.3" r=".55" fill="#bff3ff"/><circle cx="84.3" cy="19.1" r=".55" fill="#bff3ff"/><circle cx="88.7" cy="21.9" r=".55" fill="#bff3ff"/><circle cx="92.2" cy="31.2" r=".55" fill="#bff3ff"/><circle cx="95.5" cy="35.2" r=".55" fill="#bff3ff"/><circle cx="95.9" cy="45.2" r=".55" fill="#bff3ff"/><circle cx="97.8" cy="50.0" r=".55" fill="#bff3ff"/><circle cx="95.2" cy="59.6" r=".55" fill="#bff3ff"/><circle cx="95.5" cy="64.8" r=".55" fill="#bff3ff"/><circle cx="90.0" cy="73.1" r=".55" fill="#bff3ff"/><circle cx="88.7" cy="78.1" r=".55" fill="#bff3ff"/><circle cx="80.9" cy="84.3" r=".55" fill="#bff3ff"/><circle cx="78.1" cy="88.7" r=".55" fill="#bff3ff"/><circle cx="68.8" cy="92.2" r=".55" fill="#bff3ff"/><circle cx="64.8" cy="95.5" r=".55" fill="#bff3ff"/><circle cx="54.8" cy="95.9" r=".55" fill="#bff3ff"/><circle cx="50.0" cy="97.8" r=".55" fill="#bff3ff"/><circle cx="40.4" cy="95.2" r=".55" fill="#bff3ff"/><circle cx="35.2" cy="95.5" r=".55" fill="#bff3ff"/><circle cx="26.9" cy="90.0" r=".55" fill="#bff3ff"/><circle cx="21.9" cy="88.7" r=".55" fill="#bff3ff"/><circle cx="15.7" cy="80.9" r=".55" fill="#bff3ff"/><circle cx="11.3" cy="78.1" r=".55" fill="#bff3ff"/><circle cx="7.8" cy="68.8" r=".55" fill="#bff3ff"/><circle cx="4.5" cy="64.8" r=".55" fill="#bff3ff"/><circle cx="4.1" cy="54.8" r=".55" fill="#bff3ff"/><circle cx="2.2" cy="50.0" r=".55" fill="#bff3ff"/><circle cx="4.8" cy="40.4" r=".55" fill="#bff3ff"/><circle cx="4.5" cy="35.2" r=".55" fill="#bff3ff"/><circle cx="10.0" cy="26.9" r=".55" fill="#bff3ff"/><circle cx="11.3" cy="21.9" r=".55" fill="#bff3ff"/><circle cx="19.1" cy="15.7" r=".55" fill="#bff3ff"/><circle cx="21.9" cy="11.3" r=".55" fill="#bff3ff"/><circle cx="31.2" cy="7.8" r=".55" fill="#bff3ff"/><circle cx="35.2" cy="4.5" r=".55" fill="#bff3ff"/><circle cx="45.2" cy="4.1" r=".55" fill="#bff3ff"/><circle cx="50" cy="50" r="43.4" fill="none" stroke="#f2892a" stroke-width="1.8"/><circle cx="50" cy="50" r="42.3" fill="none" stroke="#ffd29a" stroke-width=".5"/><path d="M6.2 32.3A47.2 47.2 0 0 1 43.4 3.3" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".7"/><path d="M47.5 2.9A47.2 47.2 0 0 1 51.6 2.8" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".5"/>`,
  /* alleen uit de adventkalender (update 8, 24 december) */
  kerst: `<defs><linearGradient id="{id}k" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2384a"/><stop offset=".5" stop-color="#a5172a"/><stop offset="1" stop-color="#d6283c"/></linearGradient></defs><circle cx="50" cy="50" r="47" fill="none" stroke="url(#{id}k)" stroke-width="6"/><circle cx="50" cy="50" r="47" fill="none" stroke="#f6d77a" stroke-width="1.6" stroke-dasharray="0.1 7.4" stroke-linecap="round"/><circle cx="50" cy="50" r="43.6" fill="none" stroke="#f3e2b0" stroke-width=".7" stroke-opacity=".8"/><g transform="translate(50.0 3.0) rotate(0) scale(1.9)"><path d="M0 0c-3-1.4-6.5-1-9.4 1 1.4.3 2.1 1.6 1.3 2.6 1.8-.3 2.9.8 2.6 2.4 2-1.1 3.9-1.4 5.5-6Z" fill="#2f7a3e" stroke="#1d5a2b" stroke-width=".6"/><path d="M0 0c3-1.4 6.5-1 9.4 1-1.4.3-2.1 1.6-1.3 2.6-1.8-.3-2.9.8-2.6 2.4-2-1.1-3.9-1.4-5.5-6Z" fill="#3b8f4b" stroke="#1d5a2b" stroke-width=".6"/><circle cx="-1.6" cy="-1.2" r="1.9" fill="#d3263a"/><circle cx="1.7" cy="-1.5" r="1.9" fill="#e23446"/><circle cx="0" cy=".9" r="1.9" fill="#c51f33"/><circle cx="-2.1" cy="-1.8" r=".5" fill="#ffd9de"/></g><g transform="translate(90.7 73.5) rotate(120) scale(1.9)"><path d="M0 0c-3-1.4-6.5-1-9.4 1 1.4.3 2.1 1.6 1.3 2.6 1.8-.3 2.9.8 2.6 2.4 2-1.1 3.9-1.4 5.5-6Z" fill="#2f7a3e" stroke="#1d5a2b" stroke-width=".6"/><path d="M0 0c3-1.4 6.5-1 9.4 1-1.4.3-2.1 1.6-1.3 2.6-1.8-.3-2.9.8-2.6 2.4-2-1.1-3.9-1.4-5.5-6Z" fill="#3b8f4b" stroke="#1d5a2b" stroke-width=".6"/><circle cx="-1.6" cy="-1.2" r="1.9" fill="#d3263a"/><circle cx="1.7" cy="-1.5" r="1.9" fill="#e23446"/><circle cx="0" cy=".9" r="1.9" fill="#c51f33"/><circle cx="-2.1" cy="-1.8" r=".5" fill="#ffd9de"/></g><g transform="translate(9.3 73.5) rotate(240) scale(1.9)"><path d="M0 0c-3-1.4-6.5-1-9.4 1 1.4.3 2.1 1.6 1.3 2.6 1.8-.3 2.9.8 2.6 2.4 2-1.1 3.9-1.4 5.5-6Z" fill="#2f7a3e" stroke="#1d5a2b" stroke-width=".6"/><path d="M0 0c3-1.4 6.5-1 9.4 1-1.4.3-2.1 1.6-1.3 2.6-1.8-.3-2.9.8-2.6 2.4-2-1.1-3.9-1.4-5.5-6Z" fill="#3b8f4b" stroke="#1d5a2b" stroke-width=".6"/><circle cx="-1.6" cy="-1.2" r="1.9" fill="#d3263a"/><circle cx="1.7" cy="-1.5" r="1.9" fill="#e23446"/><circle cx="0" cy=".9" r="1.9" fill="#c51f33"/><circle cx="-2.1" cy="-1.8" r=".5" fill="#ffd9de"/></g>`,
  sneeuwvlokken: `<defs><linearGradient id="{id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2fbff"/><stop offset=".35" stop-color="#9fd0ea"/><stop offset=".7" stop-color="#5a9fc8"/><stop offset="1" stop-color="#d9f1ff"/></linearGradient></defs><circle cx="50" cy="50" r="47" fill="none" stroke="url(#{id}s)" stroke-width="6.5"/><circle cx="50" cy="50" r="43.4" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width=".8"/><g class="lj-draai lj-traag"><g class="lj-ster" style="--d:0.00s" transform="translate(50.0 3.0)"><g stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" fill="none"><path d="M0-4.2V4.2M-3.64-2.1L3.64 2.1M-3.64 2.1L3.64-2.1"/><path d="M0-4.2l-1.1-1.1M0-4.2l1.1-1.1M0 4.2l-1.1 1.1M0 4.2l1.1 1.1" stroke-width=".8"/></g></g><g class="lj-ster" style="--d:0.45s" transform="translate(90.7 26.5)"><g stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" fill="none"><path d="M0-4.2V4.2M-3.64-2.1L3.64 2.1M-3.64 2.1L3.64-2.1"/><path d="M0-4.2l-1.1-1.1M0-4.2l1.1-1.1M0 4.2l-1.1 1.1M0 4.2l1.1 1.1" stroke-width=".8"/></g></g><g class="lj-ster" style="--d:0.90s" transform="translate(90.7 73.5)"><g stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" fill="none"><path d="M0-4.2V4.2M-3.64-2.1L3.64 2.1M-3.64 2.1L3.64-2.1"/><path d="M0-4.2l-1.1-1.1M0-4.2l1.1-1.1M0 4.2l-1.1 1.1M0 4.2l1.1 1.1" stroke-width=".8"/></g></g><g class="lj-ster" style="--d:1.35s" transform="translate(50.0 97.0)"><g stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" fill="none"><path d="M0-4.2V4.2M-3.64-2.1L3.64 2.1M-3.64 2.1L3.64-2.1"/><path d="M0-4.2l-1.1-1.1M0-4.2l1.1-1.1M0 4.2l-1.1 1.1M0 4.2l1.1 1.1" stroke-width=".8"/></g></g><g class="lj-ster" style="--d:1.80s" transform="translate(9.3 73.5)"><g stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" fill="none"><path d="M0-4.2V4.2M-3.64-2.1L3.64 2.1M-3.64 2.1L3.64-2.1"/><path d="M0-4.2l-1.1-1.1M0-4.2l1.1-1.1M0 4.2l-1.1 1.1M0 4.2l1.1 1.1" stroke-width=".8"/></g></g><g class="lj-ster" style="--d:2.25s" transform="translate(9.3 26.5)"><g stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" fill="none"><path d="M0-4.2V4.2M-3.64-2.1L3.64 2.1M-3.64 2.1L3.64-2.1"/><path d="M0-4.2l-1.1-1.1M0-4.2l1.1-1.1M0 4.2l-1.1 1.1M0 4.2l1.1 1.1" stroke-width=".8"/></g></g></g>`,
  /* alleen voor wie een dwaalgast vond (update 9): diep rood met een gouden rand en een draaiend vizier */
  dwaalgast: `<defs><linearGradient id="{id}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2404a"/><stop offset=".45" stop-color="#8e111c"/><stop offset=".75" stop-color="#c32631"/><stop offset="1" stop-color="#6d0b14"/></linearGradient></defs><circle cx="50" cy="50" r="47" fill="none" stroke="url(#{id}d)" stroke-width="6.5"/><circle cx="50" cy="50" r="43.3" fill="none" stroke="#f3c96b" stroke-width=".9"/><circle cx="50" cy="50" r="49.6" fill="none" stroke="#f3c96b" stroke-opacity=".6" stroke-width=".6"/><g class="lj-draai lj-traag"><path d="M50 1.5V7.5M50 92.5V98.5M1.5 50H7.5M92.5 50H98.5" stroke="#ffe2a0" stroke-width="2" stroke-linecap="round"/><g fill="#f3c96b"><path d="M84.3 15.7l2.2-.4-.4 2.2-1.8-1.8z"/><path d="M15.7 84.3l-2.2.4.4-2.2 1.8 1.8z"/><path d="M15.7 15.7l-.4-2.2 2.2.4-1.8 1.8z"/><path d="M84.3 84.3l.4 2.2-2.2-.4 1.8-1.8z"/></g></g>`,
  /* prestige (update 5): bewegende lijsten; de beweging stopt bij 'minder beweging' in het toestel */
  vuurvliegjes: `<defs><radialGradient id="{id}f"><stop offset="0" stop-color="#fffbe0"/><stop offset=".35" stop-color="#f6e27a" stop-opacity=".75"/><stop offset="1" stop-color="#f6e27a" stop-opacity="0"/></radialGradient><linearGradient id="{id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1712"/><stop offset=".5" stop-color="#1e3527"/><stop offset="1" stop-color="#101a2a"/></linearGradient></defs><circle cx="50" cy="50" r="47" fill="none" stroke="url(#{id}r)" stroke-width="6.6"/><circle cx="50" cy="50" r="43.75" fill="none" stroke="#d6b358" stroke-width=".55" stroke-opacity=".7"/><circle cx="50" cy="50" r="49.75" fill="none" stroke="#06100b" stroke-width=".5"/><g class="lj-draai lj-traag"><g transform="rotate(8 50 50)"><g class="lj-zweef" style="--d:-0s"><circle cx="50" cy="3" r="6.50" fill="url(#{id}f)" class="lj-halo"/><circle cx="50" cy="3" r="1.25" fill="#fffdf0"/></g></g><g transform="rotate(52 50 50)"><g class="lj-zweef" style="--d:-2.3s"><circle cx="50" cy="3" r="4.88" fill="url(#{id}f)" class="lj-halo"/><circle cx="50" cy="3" r="0.94" fill="#fffdf0"/></g></g><g transform="rotate(96 50 50)"><g class="lj-zweef" style="--d:-1.1s"><circle cx="50" cy="3" r="5.85" fill="url(#{id}f)" class="lj-halo"/><circle cx="50" cy="3" r="1.12" fill="#fffdf0"/></g></g><g transform="rotate(141 50 50)"><g class="lj-zweef" style="--d:-3.0s"><circle cx="50" cy="3" r="4.55" fill="url(#{id}f)" class="lj-halo"/><circle cx="50" cy="3" r="0.88" fill="#fffdf0"/></g></g><g transform="rotate(187 50 50)"><g class="lj-zweef" style="--d:-0.6s"><circle cx="50" cy="3" r="6.50" fill="url(#{id}f)" class="lj-halo"/><circle cx="50" cy="3" r="1.25" fill="#fffdf0"/></g></g><g transform="rotate(232 50 50)"><g class="lj-zweef" style="--d:-2.6s"><circle cx="50" cy="3" r="5.20" fill="url(#{id}f)" class="lj-halo"/><circle cx="50" cy="3" r="1.00" fill="#fffdf0"/></g></g><g transform="rotate(276 50 50)"><g class="lj-zweef" style="--d:-1.7s"><circle cx="50" cy="3" r="6.17" fill="url(#{id}f)" class="lj-halo"/><circle cx="50" cy="3" r="1.19" fill="#fffdf0"/></g></g><g transform="rotate(321 50 50)"><g class="lj-zweef" style="--d:-3.4s"><circle cx="50" cy="3" r="4.55" fill="url(#{id}f)" class="lj-halo"/><circle cx="50" cy="3" r="0.88" fill="#fffdf0"/></g></g></g><circle cx="72.6" cy="10.8" r=".55" fill="#fff6c8" class="lj-ster" style="--d:-0s"/><circle cx="65.5" cy="92.6" r=".55" fill="#fff6c8" class="lj-ster" style="--d:-1.4s"/><circle cx="7.4" cy="65.5" r=".55" fill="#fff6c8" class="lj-ster" style="--d:-2.6s"/><circle cx="10.8" cy="27.3" r=".55" fill="#fff6c8" class="lj-ster" style="--d:-0.8s"/>`,
  noorderlicht: `<defs><linearGradient id="{id}n" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3ee08f"/><stop offset=".35" stop-color="#22c3c9"/><stop offset=".65" stop-color="#8a6cf0"/><stop offset="1" stop-color="#3ee08f"/></linearGradient><linearGradient id="{id}m" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6ffd9"/><stop offset=".5" stop-color="#c79bff"/><stop offset="1" stop-color="#7ff0e8"/></linearGradient><linearGradient id="{id}k" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef3fb"/><stop offset=".5" stop-color="#6b7688"/><stop offset="1" stop-color="#e6edf7"/></linearGradient><filter id="{id}b" x="-.2" y="-.2" width="1.4" height="1.4"><feGaussianBlur stdDeviation="1.7"/></filter></defs><circle cx="50" cy="50" r="47" fill="none" stroke="#0a1320" stroke-width="7"/><g class="lj-draai lj-n1"><circle cx="50" cy="50" r="47" fill="none" stroke="url(#{id}n)" stroke-width="4.6"/></g><g class="lj-draai lj-terug"><circle class="lj-adem" cx="50" cy="50" r="47" fill="none" stroke="url(#{id}m)" stroke-width="9" stroke-dasharray="70 78" filter="url(#{id}b)"/></g><g class="lj-draai lj-n3"><circle class="lj-adem lj-adem2" cx="50" cy="50" r="47" fill="none" stroke="#b6ffd9" stroke-width="3.4" stroke-dasharray="34 114" filter="url(#{id}b)"/></g><circle cx="50" cy="50" r="43.6" fill="none" stroke="url(#{id}k)" stroke-width=".7"/><circle cx="50" cy="50" r="49.7" fill="none" stroke="url(#{id}k)" stroke-width=".6"/><circle cx="66.1" cy="5.8" r=".7" fill="#ffffff" class="lj-ster" style="--d:-0s"/><circle cx="94.2" cy="66.1" r=".7" fill="#ffffff" class="lj-ster" style="--d:-1.1s"/><circle cx="33.9" cy="94.2" r=".7" fill="#ffffff" class="lj-ster" style="--d:-2.2s"/><circle cx="5.8" cy="33.9" r=".7" fill="#ffffff" class="lj-ster" style="--d:-0.5s"/><circle cx="30.1" cy="7.4" r=".7" fill="#ffffff" class="lj-ster" style="--d:-1.7s"/>`,
  eikenkrans: `<defs><linearGradient id="{id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".22" stop-color="#e2b84e"/><stop offset=".45" stop-color="#9c6e1e"/><stop offset=".62" stop-color="#f7d77a"/><stop offset=".82" stop-color="#a5741f"/><stop offset="1" stop-color="#ecc865"/></linearGradient><linearGradient id="{id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc257"/><stop offset="1" stop-color="#4c6b22"/></linearGradient><linearGradient id="{id}e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6b46a"/><stop offset="1" stop-color="#8a5a26"/></linearGradient><filter id="{id}g" x="-.2" y="-.2" width="1.4" height="1.4"><feGaussianBlur stdDeviation="1.2"/></filter></defs><circle cx="50" cy="50" r="47" fill="none" stroke="#6b4a12" stroke-width="7.2"/><circle cx="50" cy="50" r="47" fill="none" stroke="url(#{id}a)" stroke-width="5.6"/><circle cx="50" cy="50" r="44.3" fill="none" stroke="#fff3c4" stroke-width=".6"/><circle cx="50" cy="50" r="49.7" fill="none" stroke="#5e400e" stroke-width=".6"/><g transform="rotate(0 50 50) translate(50 4.6) scale(1.45)"><path d="M-6 0C-5.4-1.6-4.2-1.4-3.6-2.6C-2.6-1.6-1.4-2.6-.6-3.4C.2-2.2 1.4-2.4 2.2-3.2C2.8-1.8 4.4-1.6 5.6-1.2C5.2 0 5.6 1 6.4 1.4C5 2 3.6 2.4 2.4 2.2C1.8 3 .6 3.2-.4 2.4C-1.4 3.2-2.6 3-3.4 2C-4.4 2.4-5.6 1.4-6 0Z" fill="url(#{id}l)" stroke="#3b5418" stroke-width=".45"/><path d="M-5 .2L5.6 .6M-2.6-.1l-.9-1.6M.2 0l.3-2M2.6.3l.9-1.7M-1.2.2l-.6 1.6M1.4.4l.5 1.5" fill="none" stroke="#3b5418" stroke-width=".35" stroke-linecap="round"/></g><g transform="rotate(30 50 50) translate(50 4.6) scale(1.45)"><path d="M-6 0C-5.4-1.6-4.2-1.4-3.6-2.6C-2.6-1.6-1.4-2.6-.6-3.4C.2-2.2 1.4-2.4 2.2-3.2C2.8-1.8 4.4-1.6 5.6-1.2C5.2 0 5.6 1 6.4 1.4C5 2 3.6 2.4 2.4 2.2C1.8 3 .6 3.2-.4 2.4C-1.4 3.2-2.6 3-3.4 2C-4.4 2.4-5.6 1.4-6 0Z" fill="url(#{id}l)" stroke="#3b5418" stroke-width=".45"/><path d="M-5 .2L5.6 .6M-2.6-.1l-.9-1.6M.2 0l.3-2M2.6.3l.9-1.7M-1.2.2l-.6 1.6M1.4.4l.5 1.5" fill="none" stroke="#3b5418" stroke-width=".35" stroke-linecap="round"/></g><g transform="rotate(60 50 50) translate(50 4.6) scale(1.45)"><ellipse cx="0" cy="1" rx="2.2" ry="2.8" fill="url(#{id}e)"/><ellipse cx="-.7" cy=".3" rx=".5" ry="1" fill="#fff" opacity=".35"/><path d="M-2.6-.5C-2.5-2.6 2.5-2.6 2.6-.5Z" fill="#6b4524"/><path d="M-1.8-1.2h3.6M-2.1-.7h4.2" stroke="#8a6036" stroke-width=".35" stroke-dasharray=".5 .5"/><path d="M0-2.3v-1" stroke="#6b4524" stroke-width=".5" stroke-linecap="round"/></g><g transform="rotate(90 50 50) translate(50 4.6) scale(1.45)"><path d="M-6 0C-5.4-1.6-4.2-1.4-3.6-2.6C-2.6-1.6-1.4-2.6-.6-3.4C.2-2.2 1.4-2.4 2.2-3.2C2.8-1.8 4.4-1.6 5.6-1.2C5.2 0 5.6 1 6.4 1.4C5 2 3.6 2.4 2.4 2.2C1.8 3 .6 3.2-.4 2.4C-1.4 3.2-2.6 3-3.4 2C-4.4 2.4-5.6 1.4-6 0Z" fill="url(#{id}l)" stroke="#3b5418" stroke-width=".45"/><path d="M-5 .2L5.6 .6M-2.6-.1l-.9-1.6M.2 0l.3-2M2.6.3l.9-1.7M-1.2.2l-.6 1.6M1.4.4l.5 1.5" fill="none" stroke="#3b5418" stroke-width=".35" stroke-linecap="round"/></g><g transform="rotate(120 50 50) translate(50 4.6) scale(1.45)"><path d="M-6 0C-5.4-1.6-4.2-1.4-3.6-2.6C-2.6-1.6-1.4-2.6-.6-3.4C.2-2.2 1.4-2.4 2.2-3.2C2.8-1.8 4.4-1.6 5.6-1.2C5.2 0 5.6 1 6.4 1.4C5 2 3.6 2.4 2.4 2.2C1.8 3 .6 3.2-.4 2.4C-1.4 3.2-2.6 3-3.4 2C-4.4 2.4-5.6 1.4-6 0Z" fill="url(#{id}l)" stroke="#3b5418" stroke-width=".45"/><path d="M-5 .2L5.6 .6M-2.6-.1l-.9-1.6M.2 0l.3-2M2.6.3l.9-1.7M-1.2.2l-.6 1.6M1.4.4l.5 1.5" fill="none" stroke="#3b5418" stroke-width=".35" stroke-linecap="round"/></g><g transform="rotate(150 50 50) translate(50 4.6) scale(1.45)"><ellipse cx="0" cy="1" rx="2.2" ry="2.8" fill="url(#{id}e)"/><ellipse cx="-.7" cy=".3" rx=".5" ry="1" fill="#fff" opacity=".35"/><path d="M-2.6-.5C-2.5-2.6 2.5-2.6 2.6-.5Z" fill="#6b4524"/><path d="M-1.8-1.2h3.6M-2.1-.7h4.2" stroke="#8a6036" stroke-width=".35" stroke-dasharray=".5 .5"/><path d="M0-2.3v-1" stroke="#6b4524" stroke-width=".5" stroke-linecap="round"/></g><g transform="rotate(180 50 50) translate(50 4.6) scale(1.45)"><path d="M-6 0C-5.4-1.6-4.2-1.4-3.6-2.6C-2.6-1.6-1.4-2.6-.6-3.4C.2-2.2 1.4-2.4 2.2-3.2C2.8-1.8 4.4-1.6 5.6-1.2C5.2 0 5.6 1 6.4 1.4C5 2 3.6 2.4 2.4 2.2C1.8 3 .6 3.2-.4 2.4C-1.4 3.2-2.6 3-3.4 2C-4.4 2.4-5.6 1.4-6 0Z" fill="url(#{id}l)" stroke="#3b5418" stroke-width=".45"/><path d="M-5 .2L5.6 .6M-2.6-.1l-.9-1.6M.2 0l.3-2M2.6.3l.9-1.7M-1.2.2l-.6 1.6M1.4.4l.5 1.5" fill="none" stroke="#3b5418" stroke-width=".35" stroke-linecap="round"/></g><g transform="rotate(210 50 50) translate(50 4.6) scale(1.45)"><path d="M-6 0C-5.4-1.6-4.2-1.4-3.6-2.6C-2.6-1.6-1.4-2.6-.6-3.4C.2-2.2 1.4-2.4 2.2-3.2C2.8-1.8 4.4-1.6 5.6-1.2C5.2 0 5.6 1 6.4 1.4C5 2 3.6 2.4 2.4 2.2C1.8 3 .6 3.2-.4 2.4C-1.4 3.2-2.6 3-3.4 2C-4.4 2.4-5.6 1.4-6 0Z" fill="url(#{id}l)" stroke="#3b5418" stroke-width=".45"/><path d="M-5 .2L5.6 .6M-2.6-.1l-.9-1.6M.2 0l.3-2M2.6.3l.9-1.7M-1.2.2l-.6 1.6M1.4.4l.5 1.5" fill="none" stroke="#3b5418" stroke-width=".35" stroke-linecap="round"/></g><g transform="rotate(240 50 50) translate(50 4.6) scale(1.45)"><ellipse cx="0" cy="1" rx="2.2" ry="2.8" fill="url(#{id}e)"/><ellipse cx="-.7" cy=".3" rx=".5" ry="1" fill="#fff" opacity=".35"/><path d="M-2.6-.5C-2.5-2.6 2.5-2.6 2.6-.5Z" fill="#6b4524"/><path d="M-1.8-1.2h3.6M-2.1-.7h4.2" stroke="#8a6036" stroke-width=".35" stroke-dasharray=".5 .5"/><path d="M0-2.3v-1" stroke="#6b4524" stroke-width=".5" stroke-linecap="round"/></g><g transform="rotate(270 50 50) translate(50 4.6) scale(1.45)"><path d="M-6 0C-5.4-1.6-4.2-1.4-3.6-2.6C-2.6-1.6-1.4-2.6-.6-3.4C.2-2.2 1.4-2.4 2.2-3.2C2.8-1.8 4.4-1.6 5.6-1.2C5.2 0 5.6 1 6.4 1.4C5 2 3.6 2.4 2.4 2.2C1.8 3 .6 3.2-.4 2.4C-1.4 3.2-2.6 3-3.4 2C-4.4 2.4-5.6 1.4-6 0Z" fill="url(#{id}l)" stroke="#3b5418" stroke-width=".45"/><path d="M-5 .2L5.6 .6M-2.6-.1l-.9-1.6M.2 0l.3-2M2.6.3l.9-1.7M-1.2.2l-.6 1.6M1.4.4l.5 1.5" fill="none" stroke="#3b5418" stroke-width=".35" stroke-linecap="round"/></g><g transform="rotate(300 50 50) translate(50 4.6) scale(1.45)"><path d="M-6 0C-5.4-1.6-4.2-1.4-3.6-2.6C-2.6-1.6-1.4-2.6-.6-3.4C.2-2.2 1.4-2.4 2.2-3.2C2.8-1.8 4.4-1.6 5.6-1.2C5.2 0 5.6 1 6.4 1.4C5 2 3.6 2.4 2.4 2.2C1.8 3 .6 3.2-.4 2.4C-1.4 3.2-2.6 3-3.4 2C-4.4 2.4-5.6 1.4-6 0Z" fill="url(#{id}l)" stroke="#3b5418" stroke-width=".45"/><path d="M-5 .2L5.6 .6M-2.6-.1l-.9-1.6M.2 0l.3-2M2.6.3l.9-1.7M-1.2.2l-.6 1.6M1.4.4l.5 1.5" fill="none" stroke="#3b5418" stroke-width=".35" stroke-linecap="round"/></g><g transform="rotate(330 50 50) translate(50 4.6) scale(1.45)"><ellipse cx="0" cy="1" rx="2.2" ry="2.8" fill="url(#{id}e)"/><ellipse cx="-.7" cy=".3" rx=".5" ry="1" fill="#fff" opacity=".35"/><path d="M-2.6-.5C-2.5-2.6 2.5-2.6 2.6-.5Z" fill="#6b4524"/><path d="M-1.8-1.2h3.6M-2.1-.7h4.2" stroke="#8a6036" stroke-width=".35" stroke-dasharray=".5 .5"/><path d="M0-2.3v-1" stroke="#6b4524" stroke-width=".5" stroke-linecap="round"/></g><g class="lj-glans" filter="url(#{id}g)"><circle cx="50" cy="50" r="47" fill="none" stroke="#fffbe8" stroke-width="5.5" stroke-opacity=".75" stroke-dasharray="14 281.3" stroke-linecap="round"/><circle cx="50" cy="50" r="47" fill="none" stroke="#ffffff" stroke-width="3" stroke-opacity=".9" stroke-dasharray="12 283.3" stroke-dashoffset="-8" stroke-linecap="round"/></g><g transform="translate(9.3 26.5)"><path class="lj-fonkel" d="M0-4.2L.9-.9L4.2 0L.9.9L0 4.2L-.9.9L-4.2 0L-.9-.9Z" fill="#ffffff"/></g>`
};
/* Medaille-embleem rechtsonder: een gouden munt met ster aan een groen lint. Staat altijd bij een medaille-avatar,
   met of zonder lijst, zodat je in de ranglijst ziet dat de avatar verdiend is en niet gekocht. */
const MEDAILLE_EMBLEEM = `<g transform="translate(78 78) scale(1.25)"><path d="M-6 -16L-2 -6H2L6 -16Z" fill="#4b7a5e" stroke="#2e5a40" stroke-width=".8"/><circle r="9.5" fill="#c9972e"/><circle r="7.6" fill="#e9c35a"/><path d="M0 -4.6L1.3 -1.4L4.6 -1.3L2 .8L2.9 4.2L0 2.3L-2.9 4.2L-2 .8L-4.6 -1.3L-1.3 -1.4Z" fill="#fff7d6"/></g>`;
/* Medaille-glans (update 12): een lichtstreep die om de paar seconden schuin over een medaille-avatar trekt, met een
   fonkeling. Zo vallen de verdiende avatars van de meest zeldzame soorten op in de ranglijst, zonder lijst eromheen.
   Elke avatar krijgt een eigen vertraging, zodat ze in de ranglijst niet allemaal tegelijk glanzen. */
const MEDAILLE_GLANS = id => `<defs><linearGradient id="${id}gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><g clip-path="url(#${id})" class="av-glans" style="--d:-${(Math.random() * 5).toFixed(2)}s"><rect class="av-glans-streep" x="-40" y="-20" width="26" height="140" fill="url(#${id}gl)" transform="rotate(20 50 50)"/></g><path class="av-fonkel" style="--d:-${(Math.random() * 5).toFixed(2)}s" d="M24 20L25.6 25.4L31 27L25.6 28.6L24 34L22.4 28.6L17 27L22.4 25.4Z" fill="#fffbe6"/>`;
const EIKEL = `<svg class="eikel" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M8 2.6V1.2" stroke="#7d5330" stroke-width="1.4" stroke-linecap="round"/><path d="M2.8 6.6C2.8 4.1 5.1 2.6 8 2.6s5.2 1.5 5.2 4Z" fill="#7d5330"/><path d="M3.9 7.1h8.2c0 3.6-1.8 6.6-4.1 6.6S3.9 10.7 3.9 7.1Z" fill="#d9a441"/></svg>`;
let avNr = 0;
/* p = { avatar, frame, color, name }; medaille-avatars krijgen altijd het medaille-embleem rechtsonder */
function avatarSVG(p, cls){
  p = p || {};
  const k = KLEUREN[p.color] || KLEUREN.groen, id = "av" + (++avNr), teken = p.avatar && AVATARS[p.avatar];
  const medaille = teken && MEDALS.some(t => t.id === p.avatar);
  const binnen = teken
    ? `<g clip-path="url(#${id})" color="${k.fg}">${AVATARS[p.avatar].replaceAll("{id}", id)}</g>`
    : `<text x="50" y="50" dy=".35em" text-anchor="middle" font-size="46" font-family="Rubik, sans-serif" font-weight="600" fill="${k.fg}">${esc(((p.name || "?").trim()[0] || "?").toUpperCase())}</text>`;
  return `<svg class="${cls || "avatar"}" viewBox="0 0 100 100" aria-hidden="true" style="--av-bg:${k.bg}"><defs><clipPath id="${id}"><circle cx="50" cy="50" r="50"/></clipPath></defs>
    <circle cx="50" cy="50" r="50" fill="${k.bg}"/>${binnen}${medaille ? MEDAILLE_GLANS(id) : ""}${p.frame && LIJSTEN[p.frame] ? LIJSTEN[p.frame].replaceAll("{id}", id) : ""}${medaille ? MEDAILLE_EMBLEEM : ""}</svg>`;
}

const Profiel = (() => {
  const K = { wallet: "vestigia:wallet", prest: "vestigia:prestaties", mij: "vestigia:profiel", items: "vestigia:items", code: "vestigia:codeBewaard", beloning: "vestigia:prestatie-eikels", mijl: "vestigia:mijlpalen" };
  const lees = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const zet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const p = () => online.enabled ? online.player() : null;
  const args = extra => Object.assign({ p_id: p().id, p_key: p().key }, extra || {});
  let winkel = null;                 // shop(): alle items met prijs
  let beschikbaar = null;            // null = onbekend, false = functies staan nog niet in Supabase
  const anderen = new Map();         // profielen van andere spelers (ranglijst, league)

  const wallet = () => p() ? lees(K.wallet) : null;
  const mijn = () => Object.assign({ name: p() && p().name }, (p() && lees(K.mij)) || {});
  const bezit = () => new Set((p() && lees(K.items)) || []);

  async function haalWallet(){ const r = await online.rpc("wallet", args()); const w = Array.isArray(r) ? r[0] : r; zet(K.wallet, w); beschikbaar = true; return w; }
  /* mijlpalen (supabase-011): eenmalige doelen; nieuw behaalde krijgen een melding, ook als ze buiten een spel om
     binnenkomen (een week in de top 3 telt pas als die week voorbij is) */
  async function haalMijlpalen(melden){
    try {
      const oud = lees(K.mijl), r = await online.rpc("my_mijlpalen", args()) || [];
      zet(K.mijl, r);
      if (melden && oud && oud.length) for (const m of r){
        const was = oud.find(o => o.id === m.id);
        if (m.behaald && was && !was.behaald)
          toast(`Mijlpaal behaald: ${m.label}${m.eikels ? ` · +${m.eikels} eikels` : ""}${m.titel ? ` · ondertitel ${m.titel}` : ""}`, { duur: 6000 });
      }
      inVestiarium(); if (VIEW === "profiel") teken();
      return r;
    } catch(e){ return null; }                          // supabase-011 is nog niet gedraaid: geen mijlpalen
  }
  async function haalPrestaties(){ const r = await online.rpc("my_prestaties", args()); zet(K.prest, r); return r; }
  async function haalAlles(){
    if (!p()) return false;
    try {
      const [w, pr, items, prof, shop] = await Promise.all([
        haalWallet(), haalPrestaties(), online.rpc("my_items", args()),
        online.rpc("player_profiles", { p_names: [p().name] }), winkel ? Promise.resolve(winkel) : online.rpc("shop")
      ]);
      zet(K.items, items || []); winkel = (shop || []).slice().sort((a, b) => (a.for_sale === b.for_sale ? 0 : a.for_sale ? -1 : 1) || a.price - b.price || a.sort - b.sort);
      /* eikels per niveau van elke prestatie; bestaat pas na supabase-003 en is dus niet verplicht */
      /* categorie en eikels per niveau (prestatie_meta, sinds supabase-011; anders prestatie_eikels uit 003) */
      online.rpc("prestatie_meta").catch(() => online.rpc("prestatie_eikels"))
        .then(r => { zet(K.beloning, r || []); inVestiarium(); if (VIEW === "profiel") teken(); }).catch(() => {});
      haalMijlpalen(true);
      Levels.haal().catch(() => {});
      const me = (prof || [])[0]; if (me) { zet(K.mij, { avatar: me.avatar, subtitle: me.subtitle, frame: me.frame, color: me.color }); anderen.set(me.name.toLowerCase(), me); }
      saldoInKop(); renderMenu();
      return true;
    } catch(e){
      if (e.status === 404) beschikbaar = false;     // de functies van stap 4 staan nog niet in Supabase
      return false;
    }
  }

  /* ---------- saldo naast het menu ---------- */
  function saldoInKop(){
    const w = wallet(), aan = !!(w && p());
    ["eikelBtn", "slimEikel"].forEach(id => { const b = $(id); if (!b) return; b.hidden = !aan; if (aan) b.querySelector("span").textContent = w.saldo; });
    if (aan) $("eikelBtn").setAttribute("aria-label", `${w.saldo} eikels, naar de shop`);
  }

  /* ---------- na een spel: wat leverde het op ---------- */
  let winst = null;      // { k: spel, n: eikels }
  const spelKey = () => `${S.mode}:${S.caseNo || ""}:${S.target}:${S.expert ? 1 : 0}:${S.k || 0}`;
  const NIV = ["", "brons", "zilver", "goud"];
  async function naSpel(){
    if (!p() || beschikbaar === false) return;
    const oudW = wallet(), oudP = lees(K.prest) || [], key = spelKey();
    try {
      const w = await haalWallet(), pr = await haalPrestaties();
      saldoInKop(); renderMenu();
      if (oudW && w.verdiend > oudW.verdiend){
        winst = { k: key, n: w.verdiend - oudW.verdiend };
        toonWinst();
      }
      if (oudP.length) for (const r of pr){
        const was = (oudP.find(o => o.id === r.id) || {}).niveau || 0;
        if (r.niveau > was){
          const e = beloning(r.id), erbij = e ? e.slice(was, r.niveau).reduce((a, b) => a + b, 0) : 0;
          toast(`Prestatie behaald: ${r.label} · ${NIV[r.niveau]}${erbij ? ` · +${erbij} eikels` : ""}${r.niveau === 3 ? ` · ondertitel ${r.goud_titel}` : ""}`);
        }
      }
      online.rpc("my_items", args()).then(i => zet(K.items, i || [])).catch(() => {});
      haalMijlpalen(true);
    } catch(e){ if (e.status === 404) beschikbaar = false; }
  }
  function toonWinst(){
    const el = $("eikelGain"); if (!el) return;
    if (winst && winst.k === spelKey()){ el.innerHTML = `${EIKEL} +${winst.n} ${winst.n === 1 ? "eikel" : "eikels"}`; el.hidden = false; }
    else el.hidden = true;
  }

  /* ---------- ranglijst en league: avatar en ondertitel bij de namen ---------- */
  async function versier(list){
    const lis = [...list.querySelectorAll("li[data-n]")]; if (!lis.length) return;
    const nodig = [...new Set(lis.map(li => li.dataset.n))].filter(n => !anderen.has(n.toLowerCase()));
    if (nodig.length) {
      try { (await online.rpc("player_profiles", { p_names: nodig.slice(0, 300) }) || []).forEach(r => anderen.set(r.name.toLowerCase(), r)); }
      catch(e){ return; }
      nodig.forEach(n => { if (!anderen.has(n.toLowerCase())) anderen.set(n.toLowerCase(), { name: n }); });
    }
    list.classList.add("met-av");
    for (const li of lis){
      if (li.querySelector(".rav")) continue;
      const pr = anderen.get(li.dataset.n.toLowerCase()) || { name: li.dataset.n };
      li.querySelector(".pos").insertAdjacentHTML("afterend", `<span class="rav">${Levels.ring(avatarSVG(pr, "avatar klein"), pr.level, pr.pct || 0, "klein")}</span>`);
      const regel = li.querySelector(".who > span");
      if (pr.subtitle && regel){ regel.title = regel.textContent; regel.textContent = pr.subtitle; regel.classList.add("sub"); }
    }
  }

  /* ---------- herinnering: bewaar je spelerscode ---------- */
  const spelerscode = () => p() ? "VSP-" + p().id + "." + p().key : "";
  function kopieerCode(msg){
    const code = spelerscode();
    try { navigator.clipboard.writeText(code).then(() => { msg.textContent = "Gekopieerd. Bewaar hem op een veilige plek."; zet(K.code, 1); }, () => msg.textContent = code); }
    catch(e){ msg.textContent = code; }
  }
  function codeTip(){
    const box = $("codeTip"); if (!box) return;
    box.hidden = !(p() && !lees(K.code));
  }
  $("codeTipCopy").addEventListener("click", () => { kopieerCode($("codeTipMsg")); setTimeout(() => { $("codeTip").hidden = true; }, 2500); });
  $("codeTipLater").addEventListener("click", () => { zet(K.code, 1); $("codeTip").hidden = true; });

  /* ---------- scherm Mijn profiel: kiezen uit wat je hebt ---------- */
  let tab = "avatar", shopTab = "avatar";
  const TABS = [["avatar", "Avatar"], ["titel", "Ondertitel"], ["lijst", "Lijst"], ["kleur", "Kleur"]];
  const VELD = { avatar: "avatar", titel: "subtitle", lijst: "frame", kleur: "color" };
  const OPBOUW = [["dagcasus", "Dagcasussen"], ["reeksen", "Reeksen van 7 dagen"], ["veldweken", "Veldweken"], ["platen", `Platen in het ${NAAM.vestiarium}`],
                  ["trofeeen", "Titels en medailles"], ["uitnodigingen", "Uitgenodigde spelers"], ["prestaties", "Prestaties"], ["mijlpalen", "Mijlpalen"], ["minispellen", "Minigames"], ["advent", "Adventkalender"], ["dwaalgasten", "Dwaalgasten"], ["levels", "Levels"]];
  const zonderNaam = (body, wat) => {
    body.innerHTML = `<div class="playerbox"><p><b>Kies eerst een spelersnaam.</b> ${wat}</p>
      <div class="row2"><button class="btn" id="pfNaam">Kies een spelersnaam</button></div></div>`;
    $("pfNaam").onclick = () => { showRank(); setTimeout(() => $("pName") && $("pName").focus(), 60); };
  };
  const saldoHtml = w => w ? `${EIKEL} ${w.saldo}<small>eikels</small>` : `–<small>eikels</small>`;
  async function render(){
    const body = $("profielBody");
    if (!online.enabled){ body.innerHTML = `<p class="rankempty">Je profiel werkt alleen met de online ranglijst, en die is nog niet ingesteld voor deze versie.</p>`; return; }
    if (!p()){ zonderNaam(body, "Met een naam verdien je eikels, kies je een avatar en zie je je prestaties."); $("pfSaldo").innerHTML = saldoHtml(null); return; }
    teken();
    await haalAlles();
    teken();
  }
  /* een keuzeknop; staat: "aan" (in gebruik), "" (kiezen), "koop" (te koop), "heb" (in bezit, in de shop), "dicht" (te verdienen) */
  const PRESTIGE = 1000;     // vanaf zoveel eikels krijgt een item in de shop een gouden prestige-kaart
  const knop = (waarde, inhoud, label, staat, item) => `<button class="pfopt${staat === "aan" ? " aan" : ""}${staat === "dicht" ? " dicht" : ""}${item && item.price >= PRESTIGE ? " prestige" : ""}" data-v="${esc(waarde)}"${item ? ` data-item="${esc(item.item)}" data-prijs="${item.price}"` : ""}${staat === "dicht" ? " disabled" : ""}>
      ${inhoud}<span class="pl">${esc(label)}</span><span class="ps">${staat === "aan" ? "in gebruik" : staat === "koop" ? `${EIKEL} ${item.price}` : staat === "heb" ? "in bezit" : staat === "verdiend" ? "verdiend" : staat === "gratis" ? "gratis" : staat === "dicht" ? "te verdienen" : ""}</span></button>`;
  const heeft = (own, i) => own.has(i.item) || (i.price === 0 && i.for_sale);
  const waardeVan = i => i.item.slice(i.item.indexOf(":") + 1);
  const voorbeeld = (soort, v) => { const me = mijn(); return soort === "titel" ? "" : avatarSVG(Object.assign({}, me, { [VELD[soort]]: v }), "avatar mid"); };
  function teken(){
    const body = $("profielBody"), me = mijn(), w = wallet();
    $("pfSaldo").innerHTML = saldoHtml(w);
    const geenDb = beschikbaar === false;
    body.innerHTML = `
      <div class="pfkaart">${Levels.mijnRing(avatarSVG(me, "avatar groot"), "groot")}<div><h3>${esc(me.name)}</h3><p class="pfsub">${me.subtitle ? esc(me.subtitle) : "Nog geen ondertitel"}</p></div></div>
      ${typeof Veld !== "undefined" && Veld.aan() ? `<p class="rankempty"><b>Veldmodus.</b> Zonder internet laden je eikels, de shop en je prestaties niet. Je speelt gewoon verder; alles wordt bijgewerkt zodra je weer online bent.</p>` : ""}
      ${geenDb ? `<p class="rankempty">Eikels, de shop en prestaties komen beschikbaar zodra de database van Vestigia is bijgewerkt.</p>` : `
      ${Levels.kaartHtml()}
      <section class="pfsec" aria-labelledby="pfUitH"><h3 id="pfUitH">Uiterlijk</h3>
        <div class="dexfilters" id="pfTabs">${TABS.map(([k, l]) => `<button class="chipbtn" data-t="${k}" aria-pressed="${tab === k}">${l}</button>`).join("")}</div>
        <div id="pfOpties" class="pfopties${tab === "titel" ? " pftitels" : ""}">${w ? opties() : `<p class="fine">Laden…</p>`}</div>
        <span class="msg" id="pfMsg"></span>
      </section>
      <section class="pfsec" aria-labelledby="pfEikH"><h3 id="pfEikH">Eikels</h3>
        <p class="fine">Eikels verdien je met de dagcasus, reeksen, veldweken, platen, trofeeën, prestaties, mijlpalen${Levels.zichtbaar() ? ", levels" : ""} en uitgenodigde spelers. Je saldo wordt steeds opnieuw uitgerekend uit wat je gespeeld hebt, dus het raakt nooit kwijt.</p>
        ${w ? `<dl class="pfopbouw">${OPBOUW.filter(([k]) => w.opbouw && w.opbouw[k]).map(([k, l]) => `<dt>${l}</dt><dd>+${w.opbouw[k]}</dd>`).join("")}
          ${w.uitgegeven ? `<dt>Uitgegeven in de shop</dt><dd>−${w.uitgegeven}</dd>` : ""}<dt class="tot">Saldo</dt><dd class="tot">${w.saldo}</dd></dl>` : ""}
        <div class="actions"><button class="btn line" id="pfNaarShop">Naar de shop</button></div>
      </section>
      <section class="pfsec" aria-labelledby="pfPrH"><h3 id="pfPrH">Prestaties</h3><div class="prlist">${prestatieLijst()}</div></section>
      ${mijlpalenHtml()}`}
      <section class="pfsec" id="pfNaamSec" aria-labelledby="pfNaamH"${naamRest === null ? " hidden" : ""}><h3 id="pfNaamH">Spelersnaam</h3>
        <p class="fine" id="pfNaamUitleg">${naamUitleg()}</p>
        ${naamRest > 0 ? `<div class="row2"><input id="pfNaamIn" maxlength="20" autocomplete="nickname" value="${esc(me.name)}" aria-label="Nieuwe spelersnaam"><button class="btn line" id="pfNaamBtn">Wijzig naam</button></div>` : ""}
        <span class="msg" id="pfNaamMsg"></span>
      </section>
      <section class="pfsec" aria-labelledby="pfCodeH"><h3 id="pfCodeH">Spelerscode</h3>
        <p class="fine">Met je spelerscode speel je verder op een ander apparaat, of haal je alles terug als je browsergegevens gewist zijn. Deel hem met niemand: met deze code speel je als jou.</p>
        <div class="actions"><button class="btn line" id="pfCode">Kopieer spelerscode</button><span class="msg" id="pfCodeMsg"></span></div>
      </section>`;
    $("pfCode").onclick = () => { kopieerCode($("pfCodeMsg")); codeTip(); };
    if ($("pfNaamBtn")) $("pfNaamBtn").onclick = wijzigNaam;
    if (naamRest === null && !naamGeprobeerd) haalNaamRest();
    if (!geenDb){
      $("pfTabs").querySelectorAll(".chipbtn").forEach(b => b.onclick = () => { tab = b.dataset.t; teken(); });
      $("pfNaarShop").onclick = () => showShop(tab);
      $("pfOpties").querySelectorAll("button.pfopt").forEach(b => b.onclick = () => b.dataset.shop ? showShop(tab) : kies(tab, b.dataset.v || null, $("pfMsg")));
    }
  }
  /* spelersnaam wijzigen: hooguit 3 keer; alles hangt aan je spelers-id, dus voortgang en ranglijst blijven */
  let naamRest = null, naamGeprobeerd = false;
  const naamUitleg = () => naamRest > 0
    ? `Je kunt je naam nog ${naamRest === 1 ? "één keer" : naamRest + " keer"} wijzigen. Je ${NAAM.vestiarium}, punten, eikels en leagues blijven gewoon van jou.`
    : "Je hebt je naam al 3 keer gewijzigd; meer kan niet.";
  async function haalNaamRest(){
    naamGeprobeerd = true;
    try { naamRest = await online.rpc("name_changes_left", args()); if (VIEW === "profiel") teken(); }
    catch(e){ naamRest = null; }                       // supabase-008 is nog niet gedraaid: sectie blijft verborgen
  }
  async function wijzigNaam(){
    const inp = $("pfNaamIn"), msg = $("pfNaamMsg"), naam = inp.value.trim();
    if (naam === p().name){ msg.textContent = "Dit is al je naam."; return; }
    if (naam.length < 2){ msg.textContent = "Kies een naam van minstens 2 tekens."; return; }
    if (!confirmNaam(naam)) return;
    $("pfNaamBtn").disabled = true; msg.textContent = "Even geduld…";
    try {
      naamRest = await online.hernoem(naam);
      teken(); toast(`Je speelt nu als ${naam}.`);
    } catch(e){
      $("pfNaamBtn").disabled = false;
      msg.textContent = e.status && e.status < 500 ? e.message : "Wijzigen lukte niet. Controleer je internetverbinding.";
    }
  }
  /* tweede klik bevestigt: een wijziging is er één van de drie */
  let bevestig = "";
  function confirmNaam(naam){
    if (bevestig === naam){ bevestig = ""; return true; }
    bevestig = naam;
    $("pfNaamMsg").textContent = `Klik nogmaals om ‘${naam}’ te bevestigen. Dit telt als 1 van je ${naamRest} wijzigingen.`;
    return false;
  }
  /* Mijn profiel: ‘geen’, dan alles wat je hebt (goedkoop naar duur), en een knop naar de shop */
  function opties(){
    const me = mijn(), own = bezit(), items = (winkel || []).filter(i => i.kind === tab && i.kind !== "titel" && heeft(own, i));
    const naarShop = `<button class="pfopt pfshop" data-shop="1"><span class="pfplus" aria-hidden="true">+</span><span class="pl">Meer in de shop</span><span class="ps"></span></button>`;
    if (tab === "titel"){
      const heb = [...own].filter(x => x.startsWith("titel:")).map(x => x.slice(6));
      return knop("", "", "Geen ondertitel", me.subtitle ? "" : "aan") + heb.map(t => knop(t, "", t, me.subtitle === t ? "aan" : "")).join("") + naarShop;
    }
    const geen = tab === "avatar" ? "" : knop("", voorbeeld(tab, null), tab === "lijst" ? "Geen lijst" : "Groen", me[VELD[tab]] ? "" : "aan");
    return geen + items.map(i => { const v = waardeVan(i);
      return knop(v, voorbeeld(tab, v), i.label, me[VELD[tab]] === v ? "aan" : ""); }).join("") + naarShop;
  }
  async function kies(soort, waarde, msg){
    const me = mijn(), nieuw = Object.assign({}, me, { [VELD[soort]]: waarde });
    try {
      await online.rpc("set_profile", args({ p_avatar: nieuw.avatar || null, p_subtitle: nieuw.subtitle || null, p_frame: nieuw.frame || null, p_color: nieuw.color || null }));
      zet(K.mij, { avatar: nieuw.avatar || null, subtitle: nieuw.subtitle || null, frame: nieuw.frame || null, color: nieuw.color || null });
      anderen.delete(me.name.toLowerCase());
      if (VIEW === "profiel") teken(); else tekenShop();
      renderMenu();
      return true;
    } catch(e){ if (msg) msg.textContent = e.status && e.status < 500 ? e.message : "Opslaan lukte niet. Controleer je internetverbinding."; return false; }
  }

  /* ---------- Shop: kopen, per soort van goedkoop naar duur ---------- */
  async function renderShop(t){
    if (t) shopTab = t;
    const body = $("shopBody");
    if (!online.enabled){ body.innerHTML = `<p class="rankempty">De shop werkt alleen met de online ranglijst, en die is nog niet ingesteld voor deze versie.</p>`; return; }
    if (!p()){ zonderNaam(body, "Met een naam verdien je eikels en koop je in de shop een avatar, ondertitel, lijst of kleur."); $("shopSaldo").innerHTML = saldoHtml(null); return; }
    tekenShop();
    await haalAlles();
    tekenShop();
  }
  function tekenShop(){
    const body = $("shopBody"), w = wallet();
    $("shopSaldo").innerHTML = saldoHtml(w);
    if (beschikbaar === false){ body.innerHTML = `<p class="rankempty">De shop komt beschikbaar zodra de database van Vestigia is bijgewerkt.</p>`; return; }
    body.innerHTML = `
      <div class="dexfilters" id="shopTabs">${TABS.map(([k, l]) => `<button class="chipbtn" data-t="${k}" aria-pressed="${shopTab === k}">${l === "Avatar" ? "Avatars" : l === "Ondertitel" ? "Ondertitels" : l === "Lijst" ? "Lijsten" : "Kleuren"}</button>`).join("")}</div>
      <div id="shopOpties" class="pfopties${shopTab === "titel" ? " pftitels" : ""}">${w && winkel ? shopOpties() : `<p class="fine">Laden…</p>`}</div>
      <span class="msg" id="shopMsg" aria-live="polite"></span>`;
    $("shopTabs").querySelectorAll(".chipbtn").forEach(b => b.onclick = () => { shopTab = b.dataset.t; tekenShop(); });
    $("shopOpties").querySelectorAll("button.pfopt:not(.dicht)").forEach(b => b.onclick = () => koop(b));
  }
  /* gratis (voor iedereen, kost geen eikels), te koop (goedkoop naar duur), dan wat je al hebt, dan wat je alleen kunt verdienen */
  function shopOpties(){
    const me = mijn(), own = bezit(), items = (winkel || []).filter(i => i.kind === shopTab && i.price > 0);
    const gratis = (winkel || []).filter(i => i.kind === shopTab && i.price === 0 && i.for_sale);
    const koopbaar = items.filter(i => i.for_sale && !own.has(i.item)), gekocht = items.filter(i => own.has(i.item));
    let html = gratis.map(i => knop(waardeVan(i), voorbeeld(shopTab, waardeVan(i)), i.label, me[VELD[shopTab]] === waardeVan(i) ? "aan" : "gratis", i)).join("")
             + koopbaar.map(i => knop(waardeVan(i), voorbeeld(shopTab, waardeVan(i)), i.label, "koop", i)).join("")
             + gekocht.map(i => knop(waardeVan(i), voorbeeld(shopTab, waardeVan(i)), i.label, me[VELD[shopTab]] === waardeVan(i) ? "aan" : "heb", i)).join("");
    if (!koopbaar.length) html = `<p class="fine pfnoot">Je hebt alles uit deze rij al.</p>` + html;
    if (shopTab === "avatar"){
      /* verdiende medaille-avatars (prijs 0, niet te koop) vielen eerst buiten elke rij; nu staan ze er als ‘verdiend’ */
      const verdiend = (winkel || []).filter(i => i.kind === "avatar" && !i.for_sale && i.price === 0 && own.has(i.item));
      html += verdiend.map(i => knop(waardeVan(i), voorbeeld(shopTab, waardeVan(i)), i.label, me[VELD[shopTab]] === waardeVan(i) ? "aan" : "verdiend", i)).join("");
      const medailles = (winkel || []).filter(i => i.kind === "avatar" && !i.for_sale && !own.has(i.item) && !i.item.startsWith("avatar:dg-") && !i.item.startsWith("avatar:winter-"));   // dwaalgasten en het kerstavondcadeau blijven een verrassing
      html += medailles.map(i => knop(waardeVan(i), `<span class="pfgeheim">?</span>`, "Medaille-avatar", "dicht", i)).join("")
            + `<p class="fine pfnoot">Medaille-avatars koop je niet: je krijgt ze als je een van de ${telwoord(MEDALS.length)} meest zeldzame soorten determineert.</p>`;
    }
    if (shopTab === "titel"){
      const heb = [...own].filter(x => x.startsWith("titel:")).map(x => x.slice(6)), pr = lees(K.prest) || [];
      const verdien = [...Object.entries(TITLES).map(([g, t]) => [t, `alle ${GROUPS[g].toLowerCase()} in je ${NAAM.vestiarium}`]), [TITLE_ALL, `alle soorten in je ${NAAM.vestiarium}`],
                       ...pr.map(r => [r.goud_titel, `goud bij ‘${r.label}’`]),
                       ...(lees(K.mijl) || []).filter(m => m.titel).map(m => [m.titel, `mijlpaal ‘${m.label}’`]), ...Levels.teVerdienen(heb)].filter(([t]) => !heb.includes(t));
      html += verdien.map(([t, hoe]) => `<div class="pfopt dicht"><span class="pl">${esc(t)}</span><span class="ps">${esc(hoe)}</span></div>`).join("");
    }
    return html;
  }
  /* kopen gaat in twee tikken; daarna is het meteen in gebruik. Iets wat je al hebt, zet je met één tik in gebruik. */
  async function koop(b){
    const item = b.dataset.item, prijs = +b.dataset.prijs || 0, w = wallet() || { saldo: 0 }, msg = $("shopMsg");
    if (prijs === 0 || bezit().has(item)) return kies(shopTab, b.dataset.v || null, msg);     // gratis of al in bezit: meteen gebruiken
    if (w.saldo < prijs){                                            // rood op de kaart zelf (daar kijk je al), na 3 seconden weer weg
      const ps = b.querySelector(".ps"), oud = ps.innerHTML;
      ps.textContent = `nog ${prijs - w.saldo} nodig`; b.classList.remove("tekort"); void b.offsetWidth; b.classList.add("tekort");
      msg.textContent = `Je hebt nog ${prijs - w.saldo} eikels nodig.`; msg.classList.add("tekort", "alleenvoorlezen");
      clearTimeout(b._t); b._t = setTimeout(() => { if (b.isConnected){ ps.innerHTML = oud; b.classList.remove("tekort"); } if (msg.isConnected){ msg.textContent = ""; msg.classList.remove("tekort", "alleenvoorlezen"); } }, 3000); return; }
    msg.classList.remove("tekort");
    if (!b.dataset.zeker){ b.dataset.zeker = "1"; b.querySelector(".ps").textContent = `kopen voor ${prijs}?`; setTimeout(() => { if (b.isConnected){ delete b.dataset.zeker; b.querySelector(".ps").innerHTML = `${EIKEL} ${prijs}`; } }, 4000); return; }
    b.disabled = true; msg.textContent = "Even geduld…";
    try { await online.rpc("buy_item", args({ p_item: item })); await haalAlles(); }
    catch(e){ b.disabled = false; msg.textContent = e.status && e.status < 500 ? e.message : "Kopen lukte niet. Controleer je internetverbinding."; return; }
    if (await kies(shopTab, b.dataset.v || null, msg)) { $("shopMsg").textContent = "Gekocht en in gebruik. Wisselen doe je in Mijn profiel."; }
  }
  /* eikels per niveau [brons, zilver, goud] van een prestatie, of null zolang supabase-003 er nog niet is */
  function beloning(id){ const r = (lees(K.beloning) || []).find(x => x.id === id); return r ? [r.brons, r.zilver, r.goud] : null; }
  /* categorie per prestatie: uit de database (prestatie_meta), anders deze vaste indeling */
  const CAT_VAST = { eenkeer:"Determineren", expert1:"Determineren", tweeling:"Determineren", dagen:"Determineren",
                     reeks:"Volhouden", maanden:"Volhouden", veldwerker:"Volhouden",
                     duel6:"Minigames", raadsel1:"Minigames", spelersduel:"Minigames", uitnodiging:"Samen" };
  const CAT_VOLG = ["Determineren", "Specialist", "Volhouden", "Minigames", "Samen", "Overig"];
  const CAT_NIEUW = { Volharding: "Volhouden", Minispellen: "Minigames" };     // oude namen uit de database (vóór supabase-014)
  const categorie = id => { const r = (lees(K.beloning) || []).find(x => x.id === id);
    return (r && r.categorie && (CAT_NIEUW[r.categorie] || r.categorie)) || CAT_VAST[id] || (id.startsWith("spec_") ? "Specialist" : "Overig"); };
  function prestatieRij(r){
    const doel = r.niveau >= 3 ? r.goud : [r.brons, r.zilver, r.goud][r.niveau], frac = Math.min(1, r.waarde / doel);
    return `<div class="pr n${r.niveau}"><span class="prniv" aria-label="${NIV[r.niveau] || "nog niet behaald"}">${r.niveau ? NIV[r.niveau][0].toUpperCase() : ""}</span>
      <span class="prtxt"><b>${esc(r.label)}</b><span>${r.niveau >= 3 ? `goud behaald · ondertitel ${esc(r.goud_titel)}` : `${r.waarde} van ${doel} voor ${NIV[r.niveau + 1]}${beloning(r.id) ? ` · <span class="preik">${EIKEL} +${beloning(r.id)[r.niveau]}</span>` : ""}`}</span>
      <span class="tb"><i style="width:${Math.round(100 * frac)}%"></i></span></span></div>`;
  }
  function prestatieLijst(){
    const pr = lees(K.prest) || [];
    if (!pr.length) return `<p class="fine">Nog geen prestaties geladen.</p>`;
    const groep = {};
    for (const r of pr) (groep[categorie(r.id)] = groep[categorie(r.id)] || []).push(r);
    return Object.keys(groep).sort((a, b) => (CAT_VOLG.indexOf(a) + 1 || 99) - (CAT_VOLG.indexOf(b) + 1 || 99)).map(c => {
      const rij = groep[c], goud = rij.filter(r => r.niveau >= 3).length;
      return `<div class="prcat"><h4>${esc(c)}<span>${goud} van ${rij.length} op goud</span></h4>${rij.map(prestatieRij).join("")}</div>`;
    }).join("");
  }
  /* mijlpalen: één keer te halen, geen brons/zilver/goud; als lintje */
  const LINT = on => `<svg class="mplint" viewBox="0 0 32 40" aria-hidden="true"><path d="M9 22L5 38l6-3 4 5 3-14Z" fill="${on ? "#4b7a5e" : "#d3d8cd"}"/><path d="M23 22l4 16-6-3-4 5-3-14Z" fill="${on ? "#2e5a40" : "#e3e3da"}"/>
    <circle cx="16" cy="15" r="12" fill="${on ? "#a3341f" : "none"}" stroke="${on ? "#7a2414" : "#b9c0b1"}" stroke-width="1.6" ${on ? "" : 'stroke-dasharray="2.5 2.5"'}/>
    ${on ? `<path d="M10.5 15.5l3.6 3.4 7.4-7.6" fill="none" stroke="#fbf4e2" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` : ""}</svg>`;
  function mijlpalenHtml(){
    const ms = lees(K.mijl);
    if (!ms || !ms.length) return "";
    const n = ms.filter(m => m.behaald).length;
    return `<section class="pfsec mpsec" aria-labelledby="pfMpH"><h3 id="pfMpH">Mijlpalen <small>${n} van ${ms.length}</small></h3>
      <p class="fine">Eenmalige doelen voor de lange adem. Een behaalde mijlpaal blijft altijd van jou. Weken in de ranglijst tellen zodra de week voorbij is.</p>
      <div class="mplist">${ms.map(m => `<div class="mp${m.behaald ? " on" : ""}">${LINT(m.behaald)}
        <span class="mptxt"><b>${esc(m.label)}</b><span>${esc(m.uitleg)}</span>
        <span class="mpst">${m.behaald ? "behaald" : `${m.waarde} van ${m.drempel}`}${m.eikels ? ` · ${EIKEL} ${m.behaald ? "" : "+"}${m.eikels}` : ""}${m.titel ? ` · ondertitel ${esc(m.titel)}` : ""}</span>
        ${m.behaald ? "" : `<span class="tb"><i style="width:${Math.round(100 * Math.min(1, m.waarde / m.drempel))}%"></i></span>`}</span></div>`).join("")}</div></section>`;
  }
  /* prestaties ook in het Vestiarium */
  function inVestiarium(){
    const sec = $("dexPrest"); if (!sec) return;
    const pr = p() ? lees(K.prest) : null;
    sec.hidden = !(pr && pr.length);
    if (!sec.hidden) $("dexPrestList").innerHTML = prestatieLijst();
    if (!sec.hidden && $("dexMijlList")) $("dexMijlList").innerHTML = mijlpalenHtml();
  }

  /* bij het opstarten: saldo en profiel ophalen (stil als het niet lukt) */
  function start(){ saldoInKop(); codeTip(); if (p()) haalAlles().then(() => { codeTip(); inVestiarium(); }); }

  return { render, renderShop, naSpel, toonWinst, versier, saldoInKop, codeTip, start, mijn, inVestiarium, haalAlles, herteken: () => teken(),
           naNaam(){ codeTip(); haalAlles(); } };
})();

function showProfiel(){
  setView("profiel");
  Profiel.render();
  window.scrollTo({ top:0, behavior:"auto" });
}
function showShop(tab){
  setView("shop");
  Profiel.renderShop(tab);
  window.scrollTo({ top:0, behavior:"auto" });
}
