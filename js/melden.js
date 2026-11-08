/* Vestigia – meld een fout */
"use strict";
/* ---------- meld een fout ---------- */
let reportSpecies = null, reportReturn = null;
/* k is de casus waar de melding vandaan komt; die staat vooraan en wordt in het onderdeel genoemd ("Casus 2 · waarneming 3"). */
function openReport(id, from, k){
  const t = BY_ID.get(id);
  k = t.cs[k] ? k : 0;
  reportSpecies = id; reportReturn = from || null;
  $("reportFor").innerHTML = `Over: <b>${esc(t.n)}</b> (<i>${esc(t.s)}</i>), plaat nº ${dexNo(id)}`;
  const order = [k].concat(t.cs.map((c, i) => i).filter(i => i !== k));
  const parts = order.flatMap(kk => t.cs[kk].wn.map((c, i) => [`w${kk}-${i}`, `Casus ${kk+1} · waarneming ${i+1} (${CLUE_TYPES[i].toLowerCase()})`]))
    .concat([["kenmerken","Kenmerken in de vergelijkingstabel"],["tip","Verwarringstip"],["regime","Beschermingsregime"],["naam","Nederlandse of wetenschappelijke naam"],["anders","Iets anders"]]);
  $("repPart").innerHTML = parts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join("");
  $("repText").value = ""; $("repSrc").value = ""; $("repOut").hidden = true; $("repMsg").textContent = "";
  $("repCopy").textContent = online.enabled ? "Verstuur melding" : "Kopieer melding";
  $("repFine").textContent = online.enabled ? "De melding gaat rechtstreeks naar de maker van Vestigia." : "De melding wordt gekopieerd, niet verstuurd. Plak hem in een bericht aan de maker van Vestigia.";
  $("reportPop").hidden = false; $("repPart").focus();
}
/* De tekst uit het spel waar de melding over gaat. */
function partQuote(t, part){
  const m = part.match(/^w(\d+)-(\d+)$/);
  if (m) return t.cs[+m[1]].wn[+m[2]];
  if (part === "tip") return `Verwar niet met ${BY_ID.get(t.x).n}. ${t.t}`;
  if (part === "regime") return LABELS.r[t.r];
  if (part === "kenmerken") return ["h","a","v","b","w"].map(k => `${COL_LABEL[k]}: ${t[k].map(x => LABELS[k][x]).join(", ")}`).join("; ") + `; Lengte: ${t.l} cm`;
  return "";
}
function closeReport(){ $("reportPop").hidden = true; if (reportReturn && document.contains(reportReturn)) reportReturn.focus(); }
function reportText(){
  const t = BY_ID.get(reportSpecies), part = $("repPart").value, q = partQuote(t, part);
  const quote = q ? (/^w|^tip/.test(part) ? `\nTekst in het spel: "${q}"` : `\nIn het spel: ${q}`) : "";
  return `Vestigia – foutmelding
Soort: ${t.n} (${t.s}), plaat nº ${dexNo(t.id)}
Onderdeel: ${$("repPart").selectedOptions[0].textContent}${quote}
Toelichting: ${$("repText").value.trim() || "–"}
Bron/voorstel: ${$("repSrc").value.trim() || "–"}
Gemeld op: ${new Date().toLocaleDateString("nl-NL")}`;
}
$("repCopy").addEventListener("click", async () => {
  if (!$("repText").value.trim()){ $("repMsg").textContent = "Schrijf eerst kort wat er niet klopt."; $("repText").focus(); return; }
  if (online.enabled){
    const t = BY_ID.get(reportSpecies), quote = partQuote(t, $("repPart").value);
    $("repCopy").disabled = true; $("repMsg").textContent = "Versturen…";
    try {
      await online.rpc("submit_report", { p_name: online.player()?.name || null, p_species: t.n, p_part: $("repPart").selectedOptions[0].textContent,
        p_quote: quote, p_body: $("repText").value.trim(), p_source: $("repSrc").value.trim() || null });
      $("repMsg").textContent = "Verstuurd. Dank je wel!"; $("repCopy").disabled = false;
      setTimeout(closeReport, 1400); return;
    } catch(e){ $("repCopy").disabled = false; $("repMsg").textContent = "Versturen lukte niet. De melding is daarom gekopieerd."; }
  }
  const txt = reportText();
  const fallback = () => { $("repOut").hidden = false; $("repOut").value = txt; $("repOut").select(); $("repMsg").textContent = "Kopiëren lukt hier niet automatisch: selecteer de tekst hieronder."; };
  try { navigator.clipboard.writeText(txt).then(() => { $("repMsg").textContent = "Gekopieerd. Plak de melding in een bericht aan de maker."; }, fallback); } catch(e){ fallback(); }
});
$("closeReport").addEventListener("click", closeReport);
$("reportPop").addEventListener("click", e => { if (e.target === $("reportPop")) closeReport(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("reportPop").hidden) closeReport(); });

