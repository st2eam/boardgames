import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content", "games");
const RULE_IMAGES = path.join(ROOT, "public", "images", "rules");
const LOCALES = ["en", "zh"];
const IMAGE_RE = /!\[[^\]]*\]\((\/images\/rules\/[^)]+\.svg)\)/g;
const OPENING_HEADING_RE = /^##\s+(?:\d+\.\s*)?(overview|game overview|theme|theme background|概览|概述|游戏概述|主题背景)\s*$/im;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function ruleImages(slug, locale) {
  const file = path.join(CONTENT, slug, locale, "rules.md");
  if (!fs.existsSync(file)) throw new Error(`${slug}: missing ${locale}/rules.md`);
  return [...fs.readFileSync(file, "utf8").matchAll(IMAGE_RE)].map((match) => match[1]);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateSvgBounds(src) {
  const file = path.join(RULE_IMAGES, src.replace("/images/rules/", ""));
  const svg = fs.readFileSync(file, "utf8");
  const viewBox = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  assert(viewBox, `${src}: SVG must declare a numeric viewBox`);
  const height = Number(viewBox[2]);
  const textBaselines = [...svg.matchAll(/<text\b[^>]*\by="([\d.]+)"[^>]*>/g)].map((match) => Number(match[1]));
  const maxBaseline = Math.max(...textBaselines, 0);
  assert(
    maxBaseline <= height - 12,
    `${src}: bottom text baseline (${maxBaseline}) exceeds the safe SVG area (${height})`,
  );
}

export function validateGameContent() {
  const slugs = readJson(path.join(CONTENT, "index.json"));
  for (const slug of slugs) {
    for (const locale of LOCALES) {
      const rules = fs.readFileSync(path.join(CONTENT, slug, locale, "rules.md"), "utf8");
      assert(OPENING_HEADING_RE.test(rules), `${slug}: ${locale} rules need an overview heading for the player-first introduction`);
    }
    const images = Object.fromEntries(LOCALES.map((locale) => [locale, ruleImages(slug, locale)]));
    assert(images.en.length >= 2 && images.en.length <= 4, `${slug}: expected 2-4 key SVGs, found ${images.en.length}`);
    assert(JSON.stringify(images.en) === JSON.stringify(images.zh), `${slug}: English and Chinese rule image order differs`);
    for (const src of images.en) {
      assert(src.startsWith(`/images/rules/${slug}/`), `${slug}: image must stay inside its own rules directory: ${src}`);
      assert(fs.existsSync(path.join(RULE_IMAGES, src.replace("/images/rules/", ""))), `${slug}: missing SVG ${src}`);
      validateSvgBounds(src);
    }

    const flowFile = path.join(CONTENT, slug, "flow.json");
    assert(fs.existsSync(flowFile), `${slug}: missing flow.json`);
    const flow = readJson(flowFile);
    assert(flow.nodes?.[flow.startNode], `${slug}: invalid startNode ${flow.startNode}`);
    const used = new Set();
    for (const [id, node] of Object.entries(flow.nodes)) {
      assert(node.title?.en && node.title?.zh, `${slug}/${id}: missing bilingual title`);
      assert(node.content?.en && node.content?.zh, `${slug}/${id}: missing bilingual content`);
      assert(Array.isArray(node.options), `${slug}/${id}: options must be an array`);
      for (const option of node.options) {
        assert(flow.nodes[option.next], `${slug}/${id}: invalid option target ${option.next}`);
        assert(option.label?.en && option.label?.zh, `${slug}/${id}: option ${option.next} lacks bilingual label`);
      }
      if (node.illustration) {
        const { src, alt } = node.illustration;
        assert(images.en.includes(src), `${slug}/${id}: illustration must be used by both rule documents: ${src}`);
        assert(alt?.en && alt?.zh, `${slug}/${id}: illustration lacks bilingual alt text`);
        assert(!used.has(src), `${slug}: illustration is attached to more than one flow node: ${src}`);
        used.add(src);
      }
    }
    assert(used.size === images.en.length, `${slug}: each key SVG must be attached to exactly one flow node (${used.size}/${images.en.length})`);
  }
  console.log(`Validated ${slugs.length} games: rules, SVGs, and interactive flows are synchronized.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) validateGameContent();
