import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content", "games");
const RULE_IMAGES = path.join(ROOT, "public", "images", "rules");
const LOCALES = ["en", "zh"];
const SVG_IMAGE_RE = /!\[[^\]]*\]\((\/images\/rules\/[^)]+\.svg)\)/g;
const RULE_IMAGE_RE = /!\[[^\]]*\]\((\/images\/rules\/[^)]+\.(?:svg|png|jpe?g|webp))\)/g;
const OBJECTIVE_HEADING = { en: "## Game Objective", zh: "## 游戏目标" };
const GUIDE_SECTION_RE = /^\s*<!--\s*rule-section:\s*([a-z0-9][a-z0-9-]*)\s*-->\s*$/i;
const GUIDE_DETAILS_RE = /^\s*<!--\s*rule-details\s*-->\s*$/i;
const GUIDE_ID_RE = /^[a-z0-9][a-z0-9-]*$/;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function ruleImages(slug, locale, imagePattern) {
  const file = path.join(CONTENT, slug, locale, "rules.md");
  if (!fs.existsSync(file)) throw new Error(`${slug}: missing ${locale}/rules.md`);
  return [...fs.readFileSync(file, "utf8").matchAll(imagePattern)].map((match) => match[1]);
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

function guideSections(slug, locale) {
  const file = path.join(CONTENT, slug, locale, "rules.md");
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const sections = [];
  let pending = null;
  let current = null;
  let detailsCount = 0;

  const flush = () => {
    if (!current) return;
    sections.push(current);
    current = null;
    detailsCount = 0;
  };

  for (const line of lines) {
    const marker = GUIDE_SECTION_RE.exec(line);
    if (marker) {
      flush();
      pending = marker[1];
      continue;
    }
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!current && heading && pending) {
      current = { id: pending, heading: heading[2], level: heading[1].length };
      pending = null;
      continue;
    }
    assert(!pending || !line.trim(), `${slug}/${locale}: rule-section marker must be immediately before its heading`);
    if (current && GUIDE_DETAILS_RE.test(line)) {
      detailsCount += 1;
      assert(detailsCount <= 1, `${slug}/${locale}/${current.id}: rule-details may appear at most once`);
    }
  }
  flush();
  assert(!pending, `${slug}/${locale}: rule-section marker must be followed by a heading`);
  const ids = sections.map((section) => section.id);
  assert(new Set(ids).size === ids.length, `${slug}/${locale}: duplicate rule-section id`);
  return sections;
}

function validateGuide(slug, guide, sectionByLocale, flow) {
  assert(guide?.version === 1, `${slug}: guide.json version must be 1`);
  assert(Array.isArray(guide.modules) && guide.modules.length > 0, `${slug}: guide.json needs modules`);
  const moduleIds = guide.modules.map((module) => module.id);
  assert(moduleIds.every((id) => typeof id === "string" && GUIDE_ID_RE.test(id)) && new Set(moduleIds).size === moduleIds.length, `${slug}: guide module ids must be unique valid ids`);

  const validTypes = new Set(["facts", "steps", "phases", "categories", "ranking", "faq", "reference", "prose", "decision"]);
  const allIds = new Set(sectionByLocale.en.map((section) => section.id));
  assert(
    JSON.stringify([...allIds].sort()) === JSON.stringify(sectionByLocale.zh.map((section) => section.id).sort()),
    `${slug}: English and Chinese guide section ids differ`,
  );
  const referenced = [];
  let hasDecision = false;

  for (const guideModule of guide.modules) {
    assert(validTypes.has(guideModule.type), `${slug}: unknown guide module type ${guideModule.type}`);
    if (guideModule.type === "facts") {
      assert(Array.isArray(guideModule.sectionIds) && guideModule.sectionIds.length > 0, `${slug}/${guideModule.id}: sectionIds required`);
      referenced.push(...guideModule.sectionIds);
    } else if (guideModule.type === "reference" || guideModule.type === "prose") {
      const hasGroups = Array.isArray(guideModule.groups);
      assert(hasGroups || Array.isArray(guideModule.sectionIds), `${slug}/${guideModule.id}: sectionIds or groups required`);
      assert(!(hasGroups && guideModule.sectionIds), `${slug}/${guideModule.id}: use sectionIds or groups, not both`);
      if (hasGroups) {
        assert(guideModule.groups.length > 0, `${slug}/${guideModule.id}: groups must not be empty`);
        const groupIds = guideModule.groups.map((group) => group.id);
        assert(groupIds.every((id) => typeof id === "string" && GUIDE_ID_RE.test(id)) && new Set(groupIds).size === groupIds.length, `${slug}/${guideModule.id}: group ids must be unique valid ids`);
        for (const group of guideModule.groups) {
          assert(group.label?.en && group.label?.zh, `${slug}/${guideModule.id}/${group.id}: group label must be bilingual`);
          assert(Array.isArray(group.sectionIds) && group.sectionIds.length > 0, `${slug}/${guideModule.id}/${group.id}: sectionIds required`);
          if (group.defaultItemId) {
            assert(group.sectionIds.includes(group.defaultItemId), `${slug}/${guideModule.id}/${group.id}: invalid defaultItemId`);
          }
          referenced.push(...group.sectionIds);
        }
      } else {
        assert(guideModule.sectionIds.length > 0, `${slug}/${guideModule.id}: sectionIds required`);
        referenced.push(...guideModule.sectionIds);
      }
    } else if (guideModule.type === "decision") {
      hasDecision = true;
      if (guideModule.introSectionId) referenced.push(guideModule.introSectionId);
      assert(flow, `${slug}/${guideModule.id}: decision module needs flow.json`);
      const startNode = guideModule.startNode ?? flow.startNode;
      assert(flow.nodes?.[startNode], `${slug}/${guideModule.id}: invalid decision start node ${startNode}`);
    } else {
      assert(Array.isArray(guideModule.itemSectionIds) && guideModule.itemSectionIds.length > 0, `${slug}/${guideModule.id}: itemSectionIds required`);
      if (guideModule.introSectionId) referenced.push(guideModule.introSectionId);
      referenced.push(...guideModule.itemSectionIds);
      if (guideModule.defaultItemId) {
        assert(guideModule.itemSectionIds.includes(guideModule.defaultItemId), `${slug}/${guideModule.id}: invalid defaultItemId`);
      }
    }
  }

  for (const id of referenced) {
    assert(typeof id === "string" && GUIDE_ID_RE.test(id), `${slug}: guide references invalid section id ${id}`);
    assert(allIds.has(id), `${slug}: guide references unknown section ${id}`);
  }
  assert(new Set(referenced).size === referenced.length, `${slug}: guide section referenced more than once`);
  assert(referenced.length === allIds.size, `${slug}: every rule-section must be referenced exactly once`);
  assert(!hasDecision || flow, `${slug}: decision guide requires flow.json`);
}

export function validateGameContent() {
  const slugs = readJson(path.join(CONTENT, "index.json"));
  for (const slug of slugs) {
    for (const locale of LOCALES) {
      const rules = fs.readFileSync(path.join(CONTENT, slug, locale, "rules.md"), "utf8");
      const occurrences = rules.split(OBJECTIVE_HEADING[locale]).length - 1;
      assert(occurrences === 1, `${slug}: ${locale} rules need exactly one Game Objective section`);
    }
    const svgImages = Object.fromEntries(LOCALES.map((locale) => [locale, ruleImages(slug, locale, SVG_IMAGE_RE)]));
    const allImages = Object.fromEntries(LOCALES.map((locale) => [locale, ruleImages(slug, locale, RULE_IMAGE_RE)]));
    assert(svgImages.en.length >= 2 && svgImages.en.length <= 4, `${slug}: expected 2-4 key SVGs, found ${svgImages.en.length}`);
    assert(JSON.stringify(svgImages.en) === JSON.stringify(svgImages.zh), `${slug}: English and Chinese rule SVG order differs`);
    for (const src of svgImages.en) {
      assert(src.startsWith(`/images/rules/${slug}/`), `${slug}: image must stay inside its own rules directory: ${src}`);
      assert(fs.existsSync(path.join(RULE_IMAGES, src.replace("/images/rules/", ""))), `${slug}: missing SVG ${src}`);
      validateSvgBounds(src);
    }

    const flowFile = path.join(CONTENT, slug, "flow.json");
    const guideFile = path.join(CONTENT, slug, "guide.json");
    const hasFlow = fs.existsSync(flowFile);
    const hasGuide = fs.existsSync(guideFile);
    assert(hasFlow || hasGuide, `${slug}: needs flow.json or guide.json`);
    const flow = hasFlow ? readJson(flowFile) : null;

    if (hasGuide) {
      const guide = readJson(guideFile);
      const sectionByLocale = Object.fromEntries(LOCALES.map((locale) => [locale, guideSections(slug, locale)]));
      validateGuide(slug, guide, sectionByLocale, flow);
    }

    if (flow) {
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
          assert(allImages.en.includes(src) && allImages.zh.includes(src), `${slug}/${id}: illustration must be used by both rule documents: ${src}`);
          assert(alt?.en && alt?.zh, `${slug}/${id}: illustration lacks bilingual alt text`);
          assert(!used.has(src), `${slug}: illustration is attached to more than one flow node: ${src}`);
          used.add(src);
        }
      }
      if (!hasGuide) {
        assert(svgImages.en.every((src) => used.has(src)), `${slug}: each key SVG must be attached to a flow node`);
      }
    }
  }
  console.log(`Validated ${slugs.length} games: rules, SVGs, and interactive flows are synchronized.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) validateGameContent();
