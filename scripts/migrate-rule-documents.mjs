#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const gamesRoot = path.join(root, "content/games");
const locales = ["en", "zh"];
const index = JSON.parse(fs.readFileSync(path.join(gamesRoot, "index.json"), "utf8"));
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;

function slugify(text, fallback) {
  const value = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return ID_RE.test(value) ? value : fallback;
}

function stripOldMarkers(markdown) {
  return markdown
    .replace(/^\s*<!--\s*rule-section:\s*(?:topic-guide|decision-guide)(?:-\d+)?\s*-->\s*[\s\S]*?(?=^##\s+|(?![\s\S]))/gim, "")
    .replace(/^\s*<!--\s*rule-section:\s*[a-z0-9][a-z0-9-]*\s*-->\s*(?:\r?\n|$)/gim, "")
    .replace(/^\s*<!--\s*rule-item:\s*[a-z0-9][a-z0-9-]*\s*-->\s*(?:\r?\n|$)/gim, "")
    .replace(/^\s*<!--\s*rule-ui:\s*[a-z-]+(?:\s+[^>]*)?-->\s*(?:\r?\n|$)/gim, "")
    .replace(/^\s*<!--\s*rule-choices\s*-->\s*(?:\r?\n|$)/gim, "");
}

function removeGuideImageSection(markdown) {
  return markdown.replace(/^##\s+(?:一图流规则攻略（详细版）|One-page Game Guide)\s*\r?\n[\s\S]*?(?=^##\s+|$)/gim, "");
}

function normalizeH1(markdown) {
  let seen = false;
  return markdown.split(/\r?\n/).map((line) => {
    if (!/^#\s+/.test(line)) return line;
    if (!seen) {
      seen = true;
      return line;
    }
    return `##${line.slice(1)}`;
  }).join("\n");
}

function headings(markdown) {
  return [...markdown.matchAll(/^(#{2,4})\s+(.+)$/gm)].map((match) => ({
    level: match[1].length,
    text: match[2].replace(/#+\s*$/, "").trim(),
  }));
}

function existingIds(markdown) {
  return [...markdown.matchAll(/^\s*<!--\s*rule-section:\s*([a-z0-9][a-z0-9-]*)\s*-->\s*\r?\n(?=#{2,4}\s+)/gim)].map((match) => match[1]);
}

function addSectionMarkers(markdown, ids, uiByIndex = new Map()) {
  let index = 0;
  return markdown.split(/\r?\n/).map((line) => {
    const heading = /^(#{2,4})\s+(.+)$/.exec(line);
    if (!heading) return line;
    const ui = uiByIndex.get(index);
    const marker = [`<!-- rule-section: ${ids[index]} -->`];
    if (ui) marker.unshift(`<!-- rule-ui: ${ui} -->`);
    index += 1;
    return `${marker.join("\n")}\n${line}`;
  }).join("\n");
}

function insertSidebarMarkers(markdown) {
  const lines = markdown.split(/\r?\n/);
  const result = [];
  let inSection = false;
  let sectionHasChild = false;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const heading = /^(#{2,4})\s+/.exec(line);
    if (heading) {
      inSection = heading[1].length >= 2;
      sectionHasChild = heading[1].length >= 3;
    }
    if (inSection && !sectionHasChild && /^\s*(?:\d+\.|[-*+])\s+/.test(line)) {
      let end = i;
      let count = 0;
      let boldLabels = 0;
      while (end < lines.length && !/^(#{2,4})\s+/.test(lines[end])) {
        if (/^\s*(?:\d+\.|[-*+])\s+/.test(lines[end])) {
          count += 1;
          if (/^\s*(?:\d+\.|[-*+])\s+(?:<!--[^>]+-->\s*)?\*\*[^*]+\*\*/.test(lines[end])) boldLabels += 1;
        }
        end += 1;
      }
      if (count >= 2 && count === boldLabels && !result.slice(-3).some((item) => /rule-ui:\s*sidebar/.test(item))) {
        result.push("<!-- rule-ui: sidebar -->");
      }
      while (i < end) result.push(lines[i++]);
      continue;
    }
    result.push(line);
    i += 1;
  }
  return result.join("\n");
}

function flowId(nodeId) {
  return `flow-${nodeId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function flowBlock(flow, locale, cyclic, existing) {
  const nodeEntries = Object.entries(flow.nodes);
  const used = new Set(existing);
  const base = cyclic ? "topic-guide" : "decision-guide";
  let sectionId = base;
  let suffix = 2;
  while (used.has(sectionId)) sectionId = `${base}-${suffix++}`;
  used.add(sectionId);
  const title = locale === "zh" ? (cyclic ? "快速查阅" : "决策助手") : (cyclic ? "Quick reference" : "Decision helper");
  const intro = locale === "zh" ? "从这里快速跳到相关规则条目。" : "Jump directly to the rule topic you need.";
  const lines = [`<!-- rule-section: ${sectionId} -->`, `## ${title}`, "", intro, ""];

  if (cyclic) {
    lines.splice(2, 0, "<!-- rule-ui: sidebar -->");
    for (const [nodeId, node] of nodeEntries) {
      const id = flowId(nodeId);
      const label = node.title?.[locale] ?? node.title?.en ?? nodeId;
      lines.push(`- <!-- rule-item: ${id} -->`, `  **${label}**`, "");
      lines.push(...String(node.content?.[locale] ?? node.content?.en ?? "").split(/\r?\n/).map((line) => `  ${line}`));
      if (node.illustration?.src) {
        const alt = node.illustration.alt?.[locale] ?? node.illustration.alt?.en ?? label;
        lines.push("", `  ![${alt}](${node.illustration.src})`);
      }
      const options = node.options ?? [];
      if (options.length) {
        lines.push("", `  ${locale === "zh" ? "相关主题：" : "Related topics: "}`);
        for (const option of options) {
          const optionLabel = option.label?.[locale] ?? option.label?.en ?? option.next;
          lines.push(`  - [${optionLabel}](#${flowId(option.next)})`);
        }
      }
      lines.push("");
    }
    return lines.join("\n");
  }

  lines.unshift(`<!-- rule-ui: decision start=${flowId(flow.startNode)} -->`);
  for (const [nodeId, node] of nodeEntries) {
    const id = flowId(nodeId);
    const label = node.title?.[locale] ?? node.title?.en ?? nodeId;
    lines.push(`<!-- rule-section: ${id} -->`, `### ${label}`, "", String(node.content?.[locale] ?? node.content?.en ?? ""));
    if (node.illustration?.src) {
      const alt = node.illustration.alt?.[locale] ?? node.illustration.alt?.en ?? label;
      lines.push("", `![${alt}](${node.illustration.src})`);
    }
    if ((node.options ?? []).length) {
      lines.push("", "<!-- rule-choices -->");
      for (const option of node.options) {
        const optionLabel = option.label?.[locale] ?? option.label?.en ?? option.next;
        lines.push(`- [${optionLabel}](#${flowId(option.next)})`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

function isCyclic(flow) {
  const colors = new Map();
  let cyclic = false;
  const visit = (id) => {
    colors.set(id, 1);
    for (const option of flow.nodes[id]?.options ?? []) {
      if (colors.get(option.next) === 1) cyclic = true;
      else if (!colors.has(option.next)) visit(option.next);
    }
    colors.set(id, 2);
  };
  visit(flow.startNode);
  return cyclic;
}

function migrateGame(slug) {
  const files = Object.fromEntries(locales.map((locale) => [locale, path.join(gamesRoot, slug, locale, "rules.md")]));
  const flowFile = path.join(gamesRoot, slug, "flow.json");
  const flow = fs.existsSync(flowFile) ? JSON.parse(fs.readFileSync(flowFile, "utf8")) : null;
  const currentSource = fs.readFileSync(files.en, "utf8");
  if (!flow && /<!--\s*rule-section:/.test(currentSource)) return;
  const source = Object.fromEntries(locales.map((locale) => [locale, removeGuideImageSection(stripOldMarkers(normalizeH1(fs.readFileSync(files[locale], "utf8"))))]));
  const allHeadings = Object.fromEntries(locales.map((locale) => [locale, headings(source[locale])]));
  if (allHeadings.en.length !== allHeadings.zh.length || allHeadings.en.some((heading, index) => heading.level !== allHeadings.zh[index].level)) {
    throw new Error(`${slug}: English and Chinese heading structures differ after normalization`);
  }
  const old = existingIds(fs.readFileSync(files.en, "utf8"));
  const ids = [];
  const seen = new Set();
  for (let index = 0; index < allHeadings.en.length; index += 1) {
    let id = old[index] ?? slugify(allHeadings.en[index].text, `section-${String(index + 1).padStart(2, "0")}`);
    if (seen.has(id)) id = `section-${String(index + 1).padStart(2, "0")}`;
    seen.add(id);
    ids.push(id);
  }
  const tabParents = new Map();
  for (let index = 0; index < allHeadings.en.length; index += 1) {
    const next = allHeadings.en[index + 1];
    if (allHeadings.en[index].level <= 3 && next && next.level === allHeadings.en[index].level + 1) tabParents.set(index, "tabs");
  }
  for (const locale of locales) {
    let markdown = addSectionMarkers(source[locale], ids, tabParents);
    if (flow) markdown = `${markdown.trim()}\n\n${flowBlock(flow, locale, isCyclic(flow), ids)}\n`;
    markdown = insertSidebarMarkers(markdown);
    fs.writeFileSync(files[locale], markdown.replace(/\n/g, source[locale].includes("\r\n") ? "\r\n" : "\n"));
  }
}

for (const slug of index) {
  migrateGame(slug);
}

for (const slug of index) {
  for (const file of ["flow.json", "guide.json"]) {
    const target = path.join(gamesRoot, slug, file);
    if (fs.existsSync(target)) fs.rmSync(target);
  }
}

console.log(`Migrated ${index.length} games to Markdown rule documents and removed legacy flow/guide files.`);
