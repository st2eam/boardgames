import { describe, expect, it } from "vitest";
import { parseRuleDocument } from "./ruleDocument";

const validDocument = `# Example Rules

<!-- rule-section: overview -->
## Overview

Summary.

<!-- rule-ui: tabs default=roll -->
<!-- rule-section: turn -->
## Turn

Shared intro.

<!-- rule-section: roll -->
### Roll

Roll the dice.

<!-- rule-section: trade -->
### Trade

Trade resources.

<!-- rule-section: setup -->
## Setup

<!-- rule-ui: sidebar default=setup-board -->
1. <!-- rule-item: setup-board -->
   **Board**

   Place the board.

2. <!-- rule-item: setup-player -->
   **Players**

   Give each player a piece.

<!-- rule-details -->
Extra detail.

<!-- rule-ui: decision start=question -->
<!-- rule-section: helper -->
## Helper

<!-- rule-section: question -->
### Question

Choose.

<!-- rule-choices -->
- [Yes](#yes)
- [No](#no)

<!-- rule-section: yes -->
### Yes

Continue.

<!-- rule-section: no -->
### No

Stop.
`;

describe("parseRuleDocument", () => {
  it("parses plain sections, tabs, an ordered sidebar, details, and a decision", () => {
    const document = parseRuleDocument(validDocument);
    expect(document.sections.map((section) => section.id)).toEqual(["overview", "turn", "setup", "helper"]);
    expect(document.sections[1].ui).toEqual({ type: "tabs", defaultId: "roll" });
    expect(document.sections[2].sidebar?.ordered).toBe(true);
    expect(document.sections[2].sidebar?.items.map((item) => item.id)).toEqual(["setup-board", "setup-player"]);
    expect(document.sections[3].ui).toEqual({ type: "decision", startId: "question" });
    expect(document.sections[3].children[0].choices?.[0].targetId).toBe("yes");
  });

  it("allows one interactive layer inside a tab", () => {
    const document = parseRuleDocument(`# Rules

<!-- rule-ui: tabs -->
<!-- rule-section: phases -->
## Phases

<!-- rule-section: one -->
### One

<!-- rule-ui: sidebar -->
- <!-- rule-item: a -->
  **A**

- <!-- rule-item: b -->
  **B**

<!-- rule-section: two -->
### Two

Text.
`);
    expect(document.sections[0].children[0].sidebar?.items).toHaveLength(2);
  });

  it.each([
    ["rejects duplicate IDs", `# Rules\n<!-- rule-section: a -->\n## A\n<!-- rule-section: a -->\n## B`],
    ["rejects heading jumps", `# Rules\n<!-- rule-section: a -->\n## A\n<!-- rule-section: b -->\n#### B`],
    ["rejects a one-item tab", `# Rules\n<!-- rule-ui: tabs -->\n<!-- rule-section: a -->\n## A\n<!-- rule-section: b -->\n### B`],
    ["rejects a missing decision target", `# Rules\n<!-- rule-ui: decision start=a -->\n<!-- rule-section: root -->\n## Root\n<!-- rule-section: a -->\n### A\n<!-- rule-choices -->\n- [Missing](#missing)`],
  ])("%s", (_name, markdown) => {
    expect(() => parseRuleDocument(markdown)).toThrow();
  });
});
