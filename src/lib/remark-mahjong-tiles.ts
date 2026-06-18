import { visit } from "unist-util-visit";
import type { Root, Text, PhrasingContent } from "mdast";

const SHORTCODE_REGEX = /\[([1-9][mps]|[ESWN]|[CFB])\]/g;

/**
 * Remark plugin that transforms mahjong shortcodes like [3m] into
 * inline code nodes with a special `mj:` prefix for custom rendering.
 */
export function remarkMahjongTiles() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      if (!SHORTCODE_REGEX.test(node.value)) return;

      SHORTCODE_REGEX.lastIndex = 0;
      const children: PhrasingContent[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = SHORTCODE_REGEX.exec(node.value)) !== null) {
        if (match.index > lastIndex) {
          children.push({ type: "text", value: node.value.slice(lastIndex, match.index) });
        }
        children.push({
          type: "inlineCode",
          value: `mj:${match[1]}`,
        });
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < node.value.length) {
        children.push({ type: "text", value: node.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...children);
    });
  };
}
