#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "content", "games");
const rulesImageRoot = path.join(root, "public", "images", "rules");
const locales = ["en", "zh"];
const idRe = /^[a-z0-9][a-z0-9-]*$/;
const sectionRe = /^<!--\s*rule-section:\s*([a-z0-9][a-z0-9-]*)\s*-->$/i;
const itemRe = /^<!--\s*rule-item:\s*([a-z0-9][a-z0-9-]*)\s*-->$/i;
const uiRe = /^<!--\s*rule-ui:\s*([a-z-]+)([^>]*)-->$/i;
const choicesRe = /^<!--\s*rule-choices\s*-->$/i;
const detailsRe = /^<!--\s*rule-details\s*-->/i;
const imageRe = /!\[[^\]]*\]\((\/images\/rules\/[^)]+\.(?:svg|png|jpe?g|webp))\)/g;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function directive(node) {
  return node?.type === "html" ? String(node.value ?? "").trim() : null;
}

function text(node) {
  if (typeof node?.value === "string") return node.value;
  return (node?.children ?? []).map(text).join("");
}

function offset(node, side) {
  const value = node.position?.[side]?.offset;
  assert(typeof value === "number", "Markdown node is missing source position");
  return value;
}

function parseArgs(raw) {
  return Object.fromEntries([...raw.matchAll(/([a-z][a-z-]*)=([a-z0-9][a-z-]*)/gi)].map((match) => [match[1].toLowerCase(), match[2]]));
}

function parseUi(value) {
  const match = uiRe.exec(value ?? "");
  return match ? { type: match[1].toLowerCase(), args: parseArgs(match[2]) } : null;
}

function stripStructuralMarkers(markdown) {
  return markdown
    .replace(/^[ \t]*(?:<!--\s*rule-section:\s*[a-z0-9][a-z0-9-]*\s*-->)[ \t]*(?:\r?\n|$)/gim, "")
    .replace(/^([ \t]*(?:[-+*]|\d+[.)])[ \t]+)<!--\s*rule-item:\s*[a-z0-9][a-z0-9-]*\s*-->[ \t]*(?=\r?\n|$)/gim, "$1")
    .replace(/^[ \t]*<!--\s*rule-item:\s*[a-z0-9][a-z0-9-]*\s*-->[ \t]*(?:\r?\n|$)/gim, "")
    .replace(/^[ \t]*(?:<!--\s*rule-ui:\s*[a-z-]+(?:\s+[^\r\n>]*)?-->)[ \t]*(?:\r?\n|$)/gim, "")
    .replace(/^[ \t]*(?:<!--\s*rule-choices\s*-->)[ \t]*(?:\r?\n|$)/gim, "")
    .replace(/^[ \t]*(?:<!--\s*rule-details\s*-->)[ \t]*(?:\r?\n|$)/gim, "");
}

function parseSidebar(list, source, context) {
  assert(list.children.length >= 2, `${context}: sidebar needs at least two items`);
  const ids = new Set();
  const items = list.children.map((item, index) => {
    const markerIndex = item.children.findIndex((node) => itemRe.test(directive(node) ?? ""));
    const marker = markerIndex >= 0 ? itemRe.exec(directive(item.children[markerIndex])) : null;
    assert(marker, `${context}: sidebar item ${index + 1} needs rule-item`);
    const id = marker[1];
    assert(idRe.test(id) && !ids.has(id), `${context}: invalid or duplicate sidebar item id ${id}`);
    ids.add(id);
    const firstParagraph = item.children.slice(markerIndex + 1).find((node) => node.type === "paragraph");
    const strong = firstParagraph?.children?.find((node) => node.type === "strong");
    assert(strong, `${context}/${id}: first item paragraph must contain a bold menu label`);
    return { id, label: source.slice(offset(strong, "start"), offset(strong, "end")) };
  });
  return { ordered: Boolean(list.ordered), ids, items };
}

function parseChoices(list, context) {
  assert(!list.ordered && list.children.length > 0, `${context}: rule-choices needs a non-empty unordered list`);
  return list.children.map((item, index) => {
    const paragraph = item.children.find((node) => node.type === "paragraph");
    const link = paragraph?.children?.find((node) => node.type === "link");
    assert(link?.url?.startsWith("#"), `${context}: choice ${index + 1} must be an internal link`);
    const target = link.url.slice(1).replace(/^rule-/, "");
    assert(idRe.test(target), `${context}: invalid choice target ${target}`);
    return { target };
  });
}

function parseBody(raw, context) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(raw);
  const ranges = [];
  let sidebar = null;
  let choices = null;
  let details = 0;
  const sidebarListIndex = (start) => {
    let index = start + 1;
    while (index < tree.children.length && tree.children[index].type === "paragraph") index += 1;
    return tree.children[index]?.type === "list" ? index : null;
  };
  for (let index = 0; index < tree.children.length; index += 1) {
    const current = tree.children[index];
    const value = directive(current);
    if (detailsRe.test(value ?? "")) details += 1;
    if (!value) continue;
    const ui = parseUi(value);
    const isChoices = choicesRe.test(value);
    if (!ui && !isChoices) continue;
    if (ui && ui.type !== "sidebar") continue;
    const listIndex = ui?.type === "sidebar" ? sidebarListIndex(index) : index + 1;
    const next = listIndex === null ? undefined : tree.children[listIndex];
    assert(next?.type === "list", `${context}: ${ui?.type ?? "rule-choices"} directive must be followed by a supported list`);
    assert(ui || isChoices, `${context}: unsupported HTML directive in rule body`);
    if (ui?.type === "sidebar") {
      assert(!sidebar, `${context}: only one sidebar is allowed per section`);
      sidebar = parseSidebar(next, raw, context);
    } else if (isChoices) {
      assert(!choices, `${context}: only one rule-choices block is allowed per section`);
      choices = parseChoices(next, context);
    } else {
      throw new Error(`${context}: ${ui?.type ?? "rule-choices"} must be followed by its supported list`);
    }
    ranges.push({ start: offset(current, "start"), end: offset(current, "end") });
    ranges.push({ start: offset(next, "start"), end: offset(next, "end") });
    index = listIndex;
  }
  assert(details <= 1, `${context}: rule-details may appear at most once`);
  let content = raw;
  for (const range of ranges.sort((a, b) => b.start - a.start)) {
    content = `${content.slice(0, range.start)}${content.slice(range.end)}`;
  }
  return { content: stripStructuralMarkers(content).trim(), sidebar, choices };
}

function parseDocument(markdown, context) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const headings = tree.children.map((node, index) => ({ node, index })).filter(({ node }) => node.type === "heading");
  const h1s = headings.filter(({ node }) => node.depth === 1);
  assert(h1s.length === 1, `${context}: expected exactly one H1, found ${h1s.length}`);
  assert(!headings.some(({ node }) => node.depth > 4), `${context}: H5/H6 headings are not allowed`);

  const records = headings.filter(({ node }) => node.depth >= 2).map(({ node, index }) => {
    const markers = [];
    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      const value = directive(tree.children[cursor]);
      if (!value) break;
      markers.unshift(value);
    }
    const marker = markers.map((value) => sectionRe.exec(value)).find(Boolean);
    assert(marker, `${context}: heading "${text(node)}" is missing rule-section`);
    const id = marker[1];
    const uis = markers.map(parseUi).filter(Boolean);
    assert(uis.every((ui) => ui.type === "tabs" || ui.type === "decision"), `${context}/${id}: unknown rule-ui type`);
    assert(uis.length <= 1, `${context}/${id}: only one heading rule-ui directive is allowed`);
    const ui = uis[0] ?? null;
    if (ui?.type === "decision") assert(ui.args.start, `${context}/${id}: decision needs start=<id>`);
    return { id, heading: text(node), level: node.depth, start: offset(node, "start"), end: markdown.length, ui, node };
  });
  const ids = new Set();
  for (const record of records) {
    assert(idRe.test(record.id) && !ids.has(record.id), `${context}: invalid or duplicate rule-section id ${record.id}`);
    ids.add(record.id);
  }
  for (let index = 1; index < records.length; index += 1) {
    assert(records[index].level <= records[index - 1].level + 1, `${context}: heading level jumps from H${records[index - 1].level} to H${records[index].level}`);
  }
  for (let index = 0; index < records.length; index += 1) {
    const next = records.slice(index + 1).find((candidate) => candidate.level <= records[index].level);
    records[index].end = next?.start ?? markdown.length;
  }

  const sections = [];
  const stack = [];
  for (const record of records) {
    while (stack.length && stack.at(-1).level >= record.level) stack.pop();
    const parent = stack.at(-1);
    assert(!parent || record.level === parent.level + 1, `${context}/${record.id}: invalid parent heading level`);
    const section = { ...record, children: [], body: null, parent: null };
    if (parent) parent.children.push(section);
    else sections.push(section);
    stack.push(section);
  }
  const sectionById = new Map();
  const register = (section) => {
    sectionById.set(section.id, section);
    section.children.forEach(register);
  };
  sections.forEach(register);
  const byId = new Map(records.map((record) => [record.id, record]));
  for (const record of records) {
    const section = sectionById.get(record.id);
    const firstChild = section.children[0];
    const bodyEnd = firstChild ? byId.get(firstChild.id).start : record.end;
    section.body = parseBody(markdown.slice(offset(record.node, "end"), bodyEnd), `${context}/${record.id}`);
  }

  const annotate = (section, parent = null, interactiveDepth = 0) => {
    section.parent = parent;
    const depth = interactiveDepth + (section.ui || section.body.sidebar ? 1 : 0);
    assert(depth <= 2, `${context}/${section.id}: interactive nesting is deeper than one level`);
    if (section.ui?.type === "tabs") {
      assert(section.children.length >= 2, `${context}/${section.id}: tabs need at least two direct child headings`);
      if (section.ui.args.default) assert(section.children.some((child) => child.id === section.ui.args.default), `${context}/${section.id}: invalid tab default ${section.ui.args.default}`);
    }
    if (section.ui?.type === "decision") {
      const start = section.ui.args.start;
      assert(section.children.some((child) => child.id === start), `${context}/${section.id}: invalid decision start ${start}`);
      const nodes = new Map(section.children.map((child) => [child.id, child]));
      const visited = new Set();
      const visit = (id) => {
        if (visited.has(id)) return;
        visited.add(id);
        const node = nodes.get(id);
        assert(node, `${context}/${section.id}: decision target ${id} is outside its direct children`);
        for (const choice of node.body.choices ?? []) {
          assert(nodes.has(choice.target), `${context}/${node.id}: choice target ${choice.target} is not a decision node`);
          visit(choice.target);
        }
      };
      visit(start);
      assert(visited.size === nodes.size, `${context}/${section.id}: decision contains unreachable nodes`);
    }
    if (section.body.choices) assert(parent?.ui?.type === "decision", `${context}/${section.id}: rule-choices is only valid inside a decision node`);
    section.children.forEach((child) => annotate(child, section, depth));
  };
  sections.forEach((section) => annotate(section));

  return { ids: records.map((record) => record.id), levels: records.map((record) => record.level) };
}

function validateImage(src) {
  const file = path.join(rulesImageRoot, src.replace("/images/rules/", ""));
  assert(fs.existsSync(file), `missing image ${src}`);
  if (!src.endsWith(".svg")) return;
  const svg = fs.readFileSync(file, "utf8");
  const viewBox = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  assert(viewBox, `${src}: SVG must declare a numeric viewBox`);
  const height = Number(viewBox[2]);
  const baselines = [...svg.matchAll(/<text\b[^>]*\by="([\d.]+)"[^>]*>/g)].map((match) => Number(match[1]));
  assert(Math.max(...baselines, 0) <= height - 12, `${src}: text exceeds the safe SVG area`);
}

function validateImages(slug) {
  const images = {};
  for (const locale of locales) {
    const markdown = fs.readFileSync(path.join(contentRoot, slug, locale, "rules.md"), "utf8");
    images[locale] = [...markdown.matchAll(imageRe)].map((match) => match[1]);
    for (const src of images[locale]) {
      assert(src.startsWith(`/images/rules/${slug}/`), `${slug}/${locale}: image escapes its rules directory: ${src}`);
      validateImage(src);
    }
  }
  assert(JSON.stringify(images.en) === JSON.stringify(images.zh), `${slug}: English and Chinese rule image order differs`);
}

export function validateGameContent() {
  const slugs = readJson(path.join(contentRoot, "index.json"));
  let documents = 0;
  for (const slug of slugs) {
    const parsed = {};
    for (const locale of locales) {
      const file = path.join(contentRoot, slug, locale, "rules.md");
      assert(fs.existsSync(file), `${slug}: missing ${locale}/rules.md`);
      parsed[locale] = parseDocument(fs.readFileSync(file, "utf8"), `${slug}/${locale}`);
      documents += 1;
    }
    assert(JSON.stringify(parsed.en.ids) === JSON.stringify(parsed.zh.ids), `${slug}: English and Chinese section IDs/order differ`);
    assert(JSON.stringify(parsed.en.levels) === JSON.stringify(parsed.zh.levels), `${slug}: English and Chinese heading levels differ`);
    validateImages(slug);
    for (const legacy of ["flow.json", "guide.json"]) {
      assert(!fs.existsSync(path.join(contentRoot, slug, legacy)), `${slug}: legacy ${legacy} must be deleted`);
    }
  }
  console.log(`Validated ${slugs.length} games and ${documents} Markdown rule documents: protocol, bilingual structure, images, and legacy-file removal are valid.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) validateGameContent();
