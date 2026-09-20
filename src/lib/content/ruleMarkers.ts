export function stripRuleStructuralMarkers(markdown: string): string {
  return markdown
    .replace(/^[ \t]*(?:<!--\s*rule-section:\s*[a-z0-9][a-z0-9-]*\s*-->)[ \t]*(?:\r?\n|$)/gim, "")
    .replace(/^([ \t]*(?:[-+*]|\d+[.)])[ \t]+)<!--\s*rule-item:\s*[a-z0-9][a-z0-9-]*\s*-->[ \t]*(?=\r?\n|$)/gim, "$1")
    .replace(/^[ \t]*<!--\s*rule-item:\s*[a-z0-9][a-z0-9-]*\s*-->[ \t]*(?:\r?\n|$)/gim, "")
    .replace(/^[ \t]*(?:<!--\s*rule-ui:\s*[a-z-]+(?:\s+[^\r\n>]*)?-->)[ \t]*(?:\r?\n|$)/gim, "")
    .replace(/^[ \t]*(?:<!--\s*rule-choices\s*-->)[ \t]*(?:\r?\n|$)/gim, "");
}

export function stripRuleDocumentMarkers(markdown: string): string {
  return stripRuleStructuralMarkers(markdown)
    .replace(/^[ \t]*(?:<!--\s*rule-details\s*-->)[ \t]*(?:\r?\n|$)/gim, "");
}

export const stripRuleGuideMarkers = stripRuleDocumentMarkers;
