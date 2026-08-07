import { describe, it, expect } from "vitest";
import { createRng } from "./rng";

describe("createRng", () => {
  it("same seed same shuffle", () => {
    const a = createRng("seed-1").shuffle([1, 2, 3, 4, 5]);
    const b = createRng("seed-1").shuffle([1, 2, 3, 4, 5]);
    expect(a).toEqual(b);
  });

  it("different seeds diverge", () => {
    const a = createRng("a").shuffle([1, 2, 3, 4, 5]);
    const b = createRng("b").shuffle([1, 2, 3, 4, 5]);
    expect(a).not.toEqual(b);
  });
});
