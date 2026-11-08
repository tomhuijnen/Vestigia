/* Laadt de soortdata, het dagschema en js/kern.js zoals de browser dat doet, zodat de tools dezelfde regels gebruiken als de app. */
import fs from "fs";
import vm from "vm";
import path from "path";
import { fileURLToPath } from "url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function laad({ zonderSchema = false } = {}){
  const ctx = vm.createContext({ console, Date, Math, JSON, Map, Set, String, Number, Object, Array, RegExp });
  const files = ["data/soorten.js"].concat(zonderSchema ? [] : ["data/dagschema.js"], ["js/kern.js"]);
  for (const f of files){
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
  }
  /* const-declaraties op het hoogste niveau zijn geen eigenschappen van de context; haal ze op met een expressie */
  return vm.runInContext(`({ LABELS, GROUPS, RARITY, ALIASES, SPECIES, CLUE_TYPES, TARGETS, BY_ID, BY_NAME, MONTHS, START, DAY,
    DAGSCHEMA: typeof DAGSCHEMA === "undefined" ? [] : DAGSCHEMA, DAILY, DAILY_FIXED, daily, pickDaily, caseMonth, idOf,
    migrate, mergeLog, dexToIds, dexToNames, earnedNow, checkAwards, TITLES, MEDALS, compare })`, ctx);
}
