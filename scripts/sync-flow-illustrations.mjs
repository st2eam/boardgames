import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content", "games");
const IMAGE_RE = /!\[([^\]]*)\]\((\/images\/rules\/[^)]+\.svg)\)/g;

const STOP_WORDS = new Set(["a", "an", "and", "are", "at", "by", "for", "from", "how", "in", "is", "of", "on", "or", "the", "to", "with", "your"]);

/** Human-reviewed mappings for rules whose headings are broader than their flow nodes. */
const OVERRIDES = {
  "catan-china-map": { "differences.svg": "map", "cities-wall.svg": "landmarks" },
  "drecksau-sauschon": { "new-win.svg": "win", "new-cards.svg": "cards" },
  "exploding-kittens": { "explode-vs-defuse.svg": "setup", "turn-flow.svg": "turn", "cat-combos.svg": "cat-cards" },
  "exploding-kittens-nsfw-edition": { "red-vs-black.svg": "edition", "draw-or-explode.svg": "turn" },
  "love-letter": { "draw-play.svg": "turn", "key-cards.svg": "cards", "round-end.svg": "round-end" },
  "rummikub": { "sets-runs.svg": "valid-sets", "initial-30.svg": "initial-meld", "joker.svg": "joker" },
  "sea-salt-paper-extra-salt": { "new-duos.svg": "duos", "specials.svg": "specials", "counts.svg": "counts" },
  "splendor": { "turn-actions.svg": "turn", "bonuses.svg": "buy", "nobles.svg": "noble" },
  "uno": { "turn-flow.svg": "turn", "action-cards.svg": "action-cards", "scoring.svg": "scoring" },
  "uno-dos": { "two-card-matching.svg": "match", "dos-shout.svg": "dos" },
};

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g, " ");
}

function imageRefs(slug, locale) {
  const source = fs.readFileSync(path.join(CONTENT, slug, locale, "rules.md"), "utf8");
  let heading = "";
  const refs = [];
  for (const line of source.split("\n")) {
    const matchHeading = line.match(/^#{1,3}\s+(.+)/);
    if (matchHeading) heading = matchHeading[1];
    for (const match of line.matchAll(IMAGE_RE)) refs.push({ alt: match[1], src: match[2], heading });
  }
  return refs;
}

function imageWords(image, enAlt, zhAlt) {
  const stem = path.basename(image.src, ".svg").replace(/-/g, " ");
  const words = (value) => normalize(value).split(" ").filter((word) => word.length > 1 && !STOP_WORDS.has(word));
  return { heading: words(image.heading), labels: words(`${stem} ${enAlt} ${zhAlt}`) };
}

function nodeScore(node, words) {
  const title = normalize(`${node.title.en} ${node.title.zh}`);
  const content = normalize(`${node.content.en} ${node.content.zh}`);
  let score = 0;
  for (const word of words.heading) {
    if (title.includes(word)) score += 12;
    if (content.includes(word)) score += 3;
  }
  for (const word of words.labels) {
    if (title.includes(word)) score += 3;
    if (content.includes(word)) score += 1;
  }
  return score;
}

function main() {
  const slugs = JSON.parse(fs.readFileSync(path.join(CONTENT, "index.json"), "utf8"));
  for (const slug of slugs) {
    const flowFile = path.join(CONTENT, slug, "flow.json");
    if (!fs.existsSync(flowFile)) continue;
    const flow = JSON.parse(fs.readFileSync(flowFile, "utf8"));
    const en = imageRefs(slug, "en");
    const zh = imageRefs(slug, "zh");
    for (const node of Object.values(flow.nodes)) delete node.illustration;
    const usedNodes = new Set();
    for (let imageIndex = 0; imageIndex < en.length; imageIndex += 1) {
      const candidate = en[imageIndex];
      const words = imageWords(candidate, en[imageIndex].alt, zh[imageIndex]?.alt ?? en[imageIndex].alt);
      const filename = path.basename(candidate.src);
      const override = OVERRIDES[slug]?.[filename];
      const ranked = Object.entries(flow.nodes)
        .filter(([id]) => !usedNodes.has(id) && (!override || id === override))
        .map(([id, node]) => ({ id, score: nodeScore(node, words) }))
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
      const target = ranked[0];
      if (!target) throw new Error(`${slug}: no available flow node for ${candidate.src}`);
      flow.nodes[target.id].illustration = {
        src: candidate.src,
        alt: { en: en[imageIndex].alt, zh: zh[imageIndex]?.alt ?? en[imageIndex].alt },
      };
      usedNodes.add(target.id);
    }
    fs.writeFileSync(flowFile, `${JSON.stringify(flow, null, 2)}\n`);
    console.log(`${slug}: attached ${en.length} images`);
  }
}

main();
