import test from "node:test";
import assert from "node:assert/strict";

import { normalizeNumericInput } from "./numberInput.ts";

test("normalizeNumericInput keeps only decimal digits", () => {
  assert.equal(normalizeNumericInput("12e3-4.5abc６"), "12345");
});
