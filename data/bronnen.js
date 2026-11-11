/* Vestigia – links naar bronnen en foto's na het determineren (update 12)
   Per soort twee links: de soortpagina van de organisatie die we als bron gebruiken, en foto's.
   - Zoogdieren: Zoogdiervereniging · reptielen, amfibieën en vissen: RAVON ·
     vogels: Vogelbescherming · vlinders: De Vlinderstichting.
   - Foto's: Wikimedia Commons, gezocht op de wetenschappelijke naam. Dat werkt voor elke soort, ook als een naam
     verandert, en de foto's zijn vrij te gebruiken.
   De adressen van de soortpagina's volgen een vast patroon (de Nederlandse naam in kleine letters, met streepjes).
   Wijkt een pagina af, zet dan het volledige adres in BRON_LOS onder de id van de soort; dat gaat altijd voor. */
const BRON_SITES = {
  Z: { naam: "Zoogdiervereniging", url: "https://www.zoogdiervereniging.nl/zoogdiersoorten/" },
  R: { naam: "RAVON",              url: "https://www.ravon.nl/Soorten/Soortinformatie/" },
  A: { naam: "RAVON",              url: "https://www.ravon.nl/Soorten/Soortinformatie/" },
  F: { naam: "RAVON",              url: "https://www.ravon.nl/Soorten/Soortinformatie/" },
  B: { naam: "Vogelbescherming",   url: "https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/" },
  V: { naam: "De Vlinderstichting", url: "https://www.vlinderstichting.nl/vlinders/overzicht-vlinders/details-vlinder/" }
};
/* afwijkende adressen: { id: "https://…" } */
const BRON_LOS = {};

const slugVan = n => n.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function bronLinks(t){
  if (!t) return [];
  const site = BRON_SITES[t.g], uit = [];
  if (site) uit.push({ soort: "bron", label: site.naam, url: BRON_LOS[t.id] || site.url + slugVan(t.n) });
  uit.push({ soort: "foto", label: "Foto's", url: "https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=" + encodeURIComponent(t.s) });
  return uit;
}
