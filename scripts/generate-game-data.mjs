import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content", "games");
const PUBLIC = path.join(ROOT, "public", "data");

const locales = ["en", "zh"];

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function loadMd(filePath) {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return null;
}

function main() {
  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.mkdirSync(path.join(PUBLIC, "rules"), { recursive: true });

  const index = loadJson(path.join(CONTENT, "index.json"));

  const gamesIndex = [];
  for (const slug of index) {
    const meta = loadJson(path.join(CONTENT, slug, "meta.json"));
    meta.slug = slug;

    const rulesByLocale = {};
    for (const locale of locales) {
      const rules = loadMd(path.join(CONTENT, slug, locale, "rules.md"));
      if (rules) {
        rulesByLocale[locale] = rules;
      }
    }

    // Write per-game rules to separate file (for on-demand chat loading)
    if (Object.keys(rulesByLocale).length > 0) {
      fs.writeFileSync(
        path.join(PUBLIC, "rules", `${slug}.json`),
        JSON.stringify(rulesByLocale)
      );
    }

    // Keep full index for backward compat but also produce a lightweight meta-only index
    meta.rules = rulesByLocale;
    gamesIndex.push(meta);
  }

  // Full index (used by chat tool-handlers for game lookup)
  fs.writeFileSync(
    path.join(PUBLIC, "games-index.json"),
    JSON.stringify(gamesIndex, null, 2)
  );

  // Lightweight meta index (no rules text - for system prompts & game listing)
  const metaIndex = gamesIndex.map(({ rules, ...rest }) => rest);
  fs.writeFileSync(
    path.join(PUBLIC, "games-meta.json"),
    JSON.stringify(metaIndex, null, 2)
  );

  console.log(`Generated public/data/games-index.json with ${gamesIndex.length} games`);
  console.log(`Generated public/data/games-meta.json (lightweight)`);
  console.log(`Generated ${index.length} per-game rule files in public/data/rules/`);
}

main();
