#!/usr/bin/env node
/**
 * Print live content stats for README sync.
 * Usage: node scripts/print-project-stats.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const gamesDir = path.join(root, "content/games");
const index = JSON.parse(
  fs.readFileSync(path.join(gamesDir, "index.json"), "utf8")
);

let flow = 0;
let score = 0;
let trainer = 0;
let calc = 0;
const families = new Map();
const solo = [];
const familyRows = [];

for (const slug of index) {
  const dir = path.join(gamesDir, slug);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
  const hasFlow = fs.existsSync(path.join(dir, "flow.json"));
  const hasScore = fs.existsSync(path.join(dir, "score.json"));
  const hasTrainer = fs.existsSync(path.join(dir, "trainer.json"));
  const hasCalc = fs.existsSync(path.join(dir, "calculator.json"));
  if (hasFlow) flow++;
  if (hasScore) score++;
  if (hasTrainer) trainer++;
  if (hasCalc) calc++;

  const row = {
    slug,
    en: meta.name?.en ?? slug,
    zh: meta.name?.zh ?? slug,
    family: meta.family ?? null,
    familyOrder: meta.familyOrder ?? 0,
    variantType: meta.variantType ?? null,
    hasFlow,
    hasScore,
    hasTrainer,
    hasCalc,
  };

  if (meta.family) {
    if (!families.has(meta.family) || meta.familyOrder === 0) {
      families.set(meta.family, meta.name);
    }
    familyRows.push(row);
  } else {
    solo.push(row);
  }
}

solo.sort((a, b) => a.en.localeCompare(b.en));
familyRows.sort(
  (a, b) =>
    String(a.family).localeCompare(String(b.family)) ||
    a.familyOrder - b.familyOrder
);

console.log("## Project stats (from content/games)");
console.log(
  JSON.stringify(
    {
      games: index.length,
      flow,
      score,
      trainer,
      calculator: calc,
      families: [...families.entries()].map(([id, name]) => ({
        id,
        en: name.en,
        zh: name.zh,
      })),
    },
    null,
    2
  )
);

console.log("\n## Standalone");
for (const r of solo) {
  const extras = [
    r.hasScore ? "score" : null,
    r.hasTrainer ? "trainer" : null,
    r.hasCalc ? "calc" : null,
  ]
    .filter(Boolean)
    .join(",") || "—";
  console.log(
    `- ${r.zh} / ${r.en}  flow=${r.hasFlow ? "✅" : "—"}  ${extras}`
  );
}

console.log("\n## Families");
for (const r of familyRows) {
  console.log(
    `- [${r.family}] ${r.zh} (${r.variantType ?? "?"})  flow=${r.hasFlow ? "✅" : "—"} score=${r.hasScore ? "✅" : "—"} trainer=${r.hasTrainer ? "✅" : "—"}`
  );
}
