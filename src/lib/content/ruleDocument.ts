import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type {
  Heading,
  Html,
  List,
  ListItem,
  Root,
  Strong,
  Link,
  Parent,
} from "mdast";
import type {
  RuleChoice,
  RuleDocument,
  RuleListItem,
  RuleSection,
  RuleSectionUi,
  RuleSidebar,
} from "@/types/game";
import { stripRuleStructuralMarkers } from "./ruleMarkers";

const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
const RULE_SECTION_RE = /^<!--\s*rule-section:\s*([a-z0-9][a-z0-9-]*)\s*-->$/i;
const RULE_ITEM_RE = /^<!--\s*rule-item:\s*([a-z0-9][a-z0-9-]*)\s*-->$/i;
const RULE_UI_RE = /^<!--\s*rule-ui:\s*([a-z-]+)([^>]*)-->$/i;
const RULE_CHOICES_RE = /^<!--\s*rule-choices\s*-->$/i;

type Positioned = { position?: { start?: { offset?: number }; end?: { offset?: number } } };

function offset(node: Positioned, side: "start" | "end"): number {
  const value = node.position?.[side]?.offset;
  if (typeof value !== "number") throw new Error("Markdown node is missing source position");
  return value;
}

function nodeText(node: { type: string; value?: string; children?: unknown[] }): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map((child) => nodeText(child as { type: string; value?: string; children?: unknown[] })).join("");
}

function htmlDirective(node: unknown): string | null {
  if (!node || (node as { type?: string }).type !== "html") return null;
  return ((node as Html).value ?? "").trim();
}

function parseArgs(raw: string): Record<string, string> {
  const args: Record<string, string> = {};
  for (const match of raw.matchAll(/([a-z][a-z-]*)=([a-z0-9][a-z0-9-]*)/gi)) {
    args[match[1].toLowerCase()] = match[2];
  }
  return args;
}

function parseUi(raw: string): { type: string; args: Record<string, string> } | null {
  const match = RULE_UI_RE.exec(raw.trim());
  return match ? { type: match[1].toLowerCase(), args: parseArgs(match[2]) } : null;
}

function cleanMarkdown(markdown: string): string {
  return stripRuleStructuralMarkers(markdown).trim();
}

function removeRange(source: string, start: number, end: number): string {
  return `${source.slice(0, start)}${source.slice(end)}`;
}

function parseSidebar(list: List, source: string): RuleSidebar {
  if (list.children.length < 2) throw new Error("rule-ui: sidebar needs at least two list items");
  const items: RuleListItem[] = [];
  const seen = new Set<string>();

  for (const child of list.children) {
    const item = child as ListItem;
    const markerIndex = item.children.findIndex((node) => Boolean(htmlDirective(node)?.match(RULE_ITEM_RE)));
    const marker = markerIndex >= 0 ? RULE_ITEM_RE.exec(htmlDirective(item.children[markerIndex]) ?? "") : null;
    if (!marker) throw new Error("Every sidebar item needs an immediate rule-item marker");
    const id = marker[1];
    if (!ID_RE.test(id) || seen.has(id)) throw new Error(`Duplicate or invalid sidebar item id: ${id}`);
    seen.add(id);

    const contentNodes = item.children.slice(markerIndex + 1);
    const firstParagraph = contentNodes.find((node) => node.type === "paragraph") as Parent | undefined;
    const strong = firstParagraph?.children?.find((node) => node.type === "strong") as Strong | undefined;
    if (!strong) throw new Error(`Sidebar item ${id} must start with a bold label`);

    items.push({
      id,
      labelMd: source.slice(offset(strong, "start"), offset(strong, "end")).trim(),
      contentMd: source.slice(offset(strong, "end"), offset(item, "end")).trim(),
    });
  }

  return { ordered: Boolean(list.ordered), items };
}

function parseChoices(list: List): RuleChoice[] {
  if (list.ordered) throw new Error("rule-choices must use an unordered list");
  if (list.children.length === 0) throw new Error("rule-choices cannot be empty");
  return list.children.map((child) => {
    const item = child as ListItem;
    const paragraph = item.children.find((node) => node.type === "paragraph") as Parent | undefined;
    const link = paragraph?.children?.find((node) => node.type === "link") as Link | undefined;
    if (!link || typeof link.url !== "string" || !link.url.startsWith("#")) {
      throw new Error("Every rule-choices item must be an internal Markdown link");
    }
    const target = link.url.slice(1).replace(/^rule-/, "");
    if (!ID_RE.test(target)) throw new Error(`Invalid rule choice target: ${target}`);
    return { labelMd: nodeText(link), targetId: target };
  });
}

function parseBody(raw: string): { contentMd: string; sidebar?: RuleSidebar; choices?: RuleChoice[] } {
  const root = unified().use(remarkParse).use(remarkGfm).parse(raw) as Root;
  let sidebar: RuleSidebar | undefined;
  let choices: RuleChoice[] | undefined;
  const ranges: Array<{ start: number; end: number }> = [];

  const sidebarListIndex = (start: number): number | null => {
    let index = start + 1;
    while (index < root.children.length && root.children[index].type === "paragraph") index += 1;
    return root.children[index]?.type === "list" ? index : null;
  };

  for (let index = 0; index < root.children.length - 1; index += 1) {
    const directive = htmlDirective(root.children[index]);
    if (!directive) continue;
    const ui = parseUi(directive);
    const isChoices = RULE_CHOICES_RE.test(directive);
    if (!ui && !isChoices) continue;
    if (ui && ui.type !== "sidebar") continue;
    const listIndex = ui?.type === "sidebar" ? sidebarListIndex(index) : index + 1;
    const next = listIndex === null ? undefined : root.children[listIndex];
    if (!next || next.type !== "list") {
      throw new Error(`${ui?.type ?? "rule-choices"} directive must be followed by a supported list`);
    }
    if (ui?.type === "sidebar") {
      if (sidebar) throw new Error("A section may contain only one sidebar");
      sidebar = parseSidebar(next as List, raw);
    } else if (isChoices) {
      if (choices) throw new Error("A section may contain only one rule-choices block");
      choices = parseChoices(next as List);
    } else if (ui) {
      throw new Error(`Unknown body rule-ui directive: ${ui.type}`);
    }
    ranges.push({ start: offset(root.children[index], "start"), end: offset(root.children[index], "end") });
    ranges.push({ start: offset(next, "start"), end: offset(next, "end") });
    index = listIndex!;
  }

  let content = raw;
  for (const range of ranges.sort((a, b) => b.start - a.start)) {
    content = removeRange(content, range.start, range.end);
  }
  return { contentMd: cleanMarkdown(content), sidebar, choices };
}

function headingMeta(root: Root, headingIndex: number): { id: string; ui?: RuleSectionUi } {
  const heading = root.children[headingIndex] as Heading;
  const markers: string[] = [];
  for (let index = headingIndex - 1; index >= 0; index -= 1) {
    const value = htmlDirective(root.children[index]);
    if (!value) break;
    markers.unshift(value);
  }
  const sectionMarker = markers.map((marker) => RULE_SECTION_RE.exec(marker)).find(Boolean);
  if (!sectionMarker) throw new Error(`Heading ${nodeText(heading)} is missing a rule-section marker`);
  const id = sectionMarker[1];
  if (!ID_RE.test(id)) throw new Error(`Invalid rule-section id: ${id}`);

  const uiMarker = markers.map((marker) => parseUi(marker)).find(Boolean);
  if (!uiMarker) return { id };
  if (uiMarker.type === "tabs") return { id, ui: { type: "tabs", defaultId: uiMarker.args.default } };
  if (uiMarker.type === "decision") {
    if (!uiMarker.args.start) throw new Error(`Decision section ${id} needs start=<id>`);
    return { id, ui: { type: "decision", startId: uiMarker.args.start } };
  }
  throw new Error(`Unknown heading rule-ui directive: ${uiMarker.type}`);
}

function validateTree(section: RuleSection, parentUiDepth: number): void {
  const depth = parentUiDepth + (section.ui || section.sidebar ? 1 : 0);
  if (depth > 2) throw new Error(`Interactive rule nesting is limited to two levels (${section.id})`);
  if (section.ui?.type === "tabs") {
    if (section.children.length < 2) throw new Error(`TAB section ${section.id} needs at least two child headings`);
    const defaultId = section.ui.defaultId;
    if (defaultId && !section.children.some((child) => child.id === defaultId)) {
      throw new Error(`TAB ${section.id} has an invalid default id ${defaultId}`);
    }
  }
  if (section.ui?.type === "decision") {
    const startId = section.ui.startId;
    if (!section.children.some((child) => child.id === startId)) {
      throw new Error(`Decision ${section.id} has an invalid start id ${startId}`);
    }
    const nodes = new Map(section.children.map((child) => [child.id, child]));
    const visited = new Set<string>();
    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      const node = nodes.get(id);
      if (!node) throw new Error(`Decision ${section.id} references missing node ${id}`);
      for (const choice of node.choices ?? []) {
        if (!nodes.has(choice.targetId)) throw new Error(`Decision ${section.id} choice points outside its nodes: ${choice.targetId}`);
        visit(choice.targetId);
      }
    };
    visit(startId);
    if (visited.size !== nodes.size) throw new Error(`Decision ${section.id} contains unreachable nodes`);
  }
  if (section.sidebar?.defaultId && !section.sidebar.items.some((item) => item.id === section.sidebar?.defaultId)) {
    throw new Error(`Sidebar ${section.id} has an invalid default id ${section.sidebar.defaultId}`);
  }
  for (const child of section.children) validateTree(child, depth);
}

export function parseRuleDocument(markdown: string): RuleDocument {
  const root = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
  const headings = root.children
    .map((node, index) => ({ node, index }))
    .filter(({ node }) => node.type === "heading") as Array<{ node: Heading; index: number }>;
  const h1s = headings.filter(({ node }) => node.depth === 1);
  if (h1s.length !== 1) throw new Error(`A rule document must contain exactly one H1 (found ${h1s.length})`);
  if (headings.some(({ node }) => node.depth > 4)) throw new Error("H5/H6 headings are not supported in rule documents");

  const records = headings
    .filter(({ node }) => node.depth >= 2)
    .map(({ node, index }) => ({
      node,
      index,
      meta: headingMeta(root, index),
      start: offset(node, "start"),
      end: markdown.length,
      level: node.depth as 2 | 3 | 4,
    }));

  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.meta.id)) throw new Error(`Duplicate rule-section id: ${record.meta.id}`);
    ids.add(record.meta.id);
  }
  const quickReferenceIds = records
    .map((record) => record.meta.id)
    .filter((id) => /^topic-guide(?:-\d+)?$/i.test(id));
  if (quickReferenceIds.length > 1 || quickReferenceIds.some((id) => id !== "topic-guide")) {
    throw new Error("A rule document may contain only one quick-reference section with id topic-guide");
  }
  for (let index = 1; index < records.length; index += 1) {
    if (records[index].level > records[index - 1].level + 1) {
      throw new Error(`Heading level jumps from H${records[index - 1].level} to H${records[index].level}`);
    }
  }

  for (let index = 0; index < records.length; index += 1) {
    const next = records.slice(index + 1).find((candidate) => candidate.level <= records[index].level);
    records[index].end = next?.start ?? markdown.length;
  }

  const sectionById = new Map<string, RuleSection>();
  const roots: RuleSection[] = [];
  const stack: RuleSection[] = [];
  for (const record of records) {
    while (stack.length > 0 && stack[stack.length - 1].level >= record.level) stack.pop();
    const parent = stack[stack.length - 1];
    if (parent && record.level !== parent.level + 1) throw new Error(`Heading ${record.meta.id} must be a direct child of ${parent.id}`);
    const section: RuleSection = {
      id: record.meta.id,
      heading: nodeText(record.node),
      level: record.level,
      contentMd: "",
      children: [],
      ui: record.meta.ui,
    };
    if (parent) parent.children.push(section);
    else roots.push(section);
    sectionById.set(section.id, section);
    stack.push(section);
  }

  for (const record of records) {
    const section = sectionById.get(record.meta.id)!;
    const firstChildStart = section.children.length > 0
      ? offset(records.find((candidate) => candidate.meta.id === section.children[0].id)!.node, "start")
      : record.end;
    const body = parseBody(markdown.slice(offset(record.node, "end"), firstChildStart));
    section.contentMd = body.contentMd;
    section.sidebar = body.sidebar;
    section.choices = body.choices;
  }

  for (const section of roots) validateTree(section, 0);
  const firstSectionStart = records[0] ? records[0].start : markdown.length;
  const introMd = cleanMarkdown(markdown.slice(0, firstSectionStart));
  return { version: 1, title: nodeText(h1s[0].node), introMd, sections: roots };
}

export { stripRuleDocumentMarkers, stripRuleGuideMarkers } from "./ruleMarkers";
