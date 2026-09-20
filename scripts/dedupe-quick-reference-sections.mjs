#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "content", "games");
const sectionRe = /^<!--\s*rule-section:\s*([a-z0-9][a-z0-9-]*)\s*-->$/i;
const sidebarRe = /^<!--\s*rule-ui:\s*sidebar(?:\s|-->|$)/i;
const rawQuickReferenceRe = /^<!--\s*rule-section:\s*topic-guide(?:-\d+)?\s*-->$/gim;

function offset(node, side) {
  const value = node.position?.[side]?.offset;
  if (typeof value !== "number") throw new Error("Markdown node is missing source position");
  return value;
}

function directive(node) {
  return node?.type === "html" ? String(node.value ?? "").trim() : null;
}

function sectionMeta(tree, headingIndex) {
  const markers = [];
  for (let index = headingIndex - 1; index >= 0; index -= 1) {
    const value = directive(tree.children[index]);
    if (!value) break;
    markers.unshift({ value, node: tree.children[index] });
  }
  const marker = markers.map((entry) => ({ ...entry, match: sectionRe.exec(entry.value) })).find((entry) => entry.match);
  return marker ? { id: marker.match[1], marker: marker.node, directives: markers.map((entry) => entry.value) } : null;
}

function findSections(markdown) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const headings = tree.children
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => node.type === "heading");
  const records = headings.map(({ node, index }) => {
    const meta = sectionMeta(tree, index);
    return meta ? { node, ...meta, start: offset(meta.marker, "start"), end: markdown.length } : null;
  }).filter(Boolean);

  for (let index = 0; index < records.length; index += 1) {
    const nextSection = records.slice(index + 1).find((candidate) => candidate.node.depth <= records[index].node.depth);
    records[index].end = nextSection?.start ?? markdown.length;
  }
  return records;
}

function migrateFile(file) {
  const markdown = fs.readFileSync(file, "utf8");
  const sections = findSections(markdown).filter((section) => /^topic-guide(?:-\d+)?$/i.test(section.id));
  if (sections.length <= 1) {
    const rawMarkers = [...markdown.matchAll(rawQuickReferenceRe)];
    if (rawMarkers.length <= 1) return false;
    const keep = rawMarkers.at(-1);
    const first = rawMarkers[0].index;
    const last = keep.index;
    const end = markdown.length;
    const block = markdown.slice(last, end).replace(keep[0], "<!-- rule-section: topic-guide -->");
    fs.writeFileSync(file, `${markdown.slice(0, first)}${block}`);
    return true;
  }

  const sidebarSections = sections.filter((section) => {
    const body = markdown.slice(offset(section.node, "end"), section.end);
    return body.split(/\r?\n/).some((line) => sidebarRe.test(line.trim()));
  });
  if (sidebarSections.length !== 1) {
    throw new Error(`${file}: expected exactly one canonical quick-reference sidebar, found ${sidebarSections.length}`);
  }

  const keep = sidebarSections[0];
  let result = "";
  let cursor = 0;
  for (const section of sections) {
    result += markdown.slice(cursor, section.start);
    if (section === keep) {
      const block = markdown.slice(section.start, section.end);
      const marker = markdown.slice(offset(section.marker, "start"), offset(section.marker, "end"));
      result += block.replace(marker, "<!-- rule-section: topic-guide -->");
    }
    cursor = section.end;
  }
  result += markdown.slice(cursor);

  fs.writeFileSync(file, result);
  return true;
}

const changed = [];
for (const slug of fs.readdirSync(contentRoot)) {
  const gameDir = path.join(contentRoot, slug);
  if (!fs.statSync(gameDir).isDirectory()) continue;
  for (const locale of ["en", "zh"]) {
    const file = path.join(gameDir, locale, "rules.md");
    if (fs.existsSync(file) && migrateFile(file)) changed.push(path.relative(root, file));
  }
}

console.log(`Deduplicated ${changed.length} rule documents.`);
for (const file of changed) console.log(file);
