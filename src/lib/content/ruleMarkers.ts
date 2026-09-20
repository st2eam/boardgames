export function stripRuleStructuralMarkers(markdown: string): string {
  return markdown
    .replace(/^\s*<!--\s*rule-section:\s*[a-z0-9][a-z0-9-]*\s*-->\s*(?:\r?\n|$)/gim, "")
    .replace(/^\s*<!--\s*rule-item:\s*[a-z0-9][a-z0-9-]*\s*-->\s*(?:\r?\n|$)/gim, "")
    .replace(/^\s*<!--\s*rule-ui:\s*[a-z-]+(?:\s+[^>]*)?-->\s*(?:\r?\n|$)/gim, "")
    .replace(/^\s*<!--\s*rule-choices\s*-->\s*(?:\r?\n|$)/gim, "");
}

export function stripRuleDocumentMarkers(markdown: string): string {
  return stripRuleStructuralMarkers(markdown)
    .replace(/^\s*<!--\s*rule-details\s*-->\s*(?:\r?\n|$)/gim, "");
}

export const stripRuleGuideMarkers = stripRuleDocumentMarkers;
