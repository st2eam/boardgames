import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { validateGameContent } from "./validate-game-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content", "games");
const PUBLIC = path.join(ROOT, "public", "data");
const IMAGES = path.join(ROOT, "public", "images", "games");

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

function stripGuideMarkers(markdown) {
  if (!/rule-section:|rule-details/.test(markdown)) return markdown;
  return markdown
    .replace(/^\s*<!--\s*rule-section:\s*[a-z0-9][a-z0-9-]*\s*-->\s*(?:\r?\n|$)/gim, "")
    .replace(/^\s*<!--\s*rule-details\s*-->\s*(?:\r?\n|$)/gim, "");
}

function preserveRuleNewlines(markdown, previous) {
  if (!previous) return markdown;
  const newline = previous.includes("\r\n") ? "\r\n" : "\n";
  return markdown.replace(/\r\n|\n/g, newline);
}

function main() {
  validateGameContent();
  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.mkdirSync(path.join(PUBLIC, "rules"), { recursive: true });

  const index = loadJson(path.join(CONTENT, "index.json"));

  const gamesIndex = [];
  for (const slug of index) {
    const meta = loadJson(path.join(CONTENT, slug, "meta.json"));
    meta.slug = slug;

    const rulesByLocale = {};
    const rulesFile = path.join(PUBLIC, "rules", `${slug}.json`);
    const previousRules = fs.existsSync(rulesFile) ? loadJson(rulesFile) : null;
    for (const locale of locales) {
      const rules = loadMd(path.join(CONTENT, slug, locale, "rules.md"));
      if (rules) {
        rulesByLocale[locale] = preserveRuleNewlines(
          stripGuideMarkers(rules),
          previousRules?.[locale]
        );
      }
    }

    // Write per-game rules to separate file (for on-demand chat loading)
    if (Object.keys(rulesByLocale).length > 0) {
      fs.writeFileSync(
        rulesFile,
        JSON.stringify(rulesByLocale)
      );
    }

    gamesIndex.push(meta);
  }

  // Lightweight meta index (no rules text — chat system prompts & tool lookup)
  fs.writeFileSync(
    path.join(PUBLIC, "games-meta.json"),
    JSON.stringify(gamesIndex, null, 2)
  );

  console.log(`Generated public/data/games-meta.json with ${gamesIndex.length} games`);
  console.log(`Generated ${index.length} per-game rule files in public/data/rules/`);

  // Generate cover image manifest (which formats exist for which games)
  const coverManifest = {};
  if (fs.existsSync(IMAGES)) {
    const files = fs.readdirSync(IMAGES);
    for (const file of files) {
      const match = file.match(/^(.+)\.(webp|png|jpg|jpeg)$/i);
      if (match) {
        const [, slug, ext] = match;
        coverManifest[slug] = ext.toLowerCase();
      }
    }
  }
  fs.writeFileSync(
    path.join(PUBLIC, "cover-manifest.json"),
    JSON.stringify(coverManifest, null, 2)
  );
  const missing = index.filter(s => !coverManifest[s]);
  console.log(`Generated cover manifest: ${Object.keys(coverManifest).length} covers, ${missing.length} missing`);
  if (missing.length > 0) {
    console.log(`  Missing: ${missing.join(", ")}`);
  }
}

main();
