import { describe, it, expect } from "vitest";
import { GOLDEN_SET } from "../src/lib/golden/dataset";

describe("GOLDEN_SET", () => {
  it("has 5 claims across 3 scenarios, 3 fabricated and 2 real", () => {
    expect(GOLDEN_SET).toHaveLength(5);
    expect(new Set(GOLDEN_SET.map((i) => i.scenario)).size).toBe(3);
    expect(GOLDEN_SET.filter((i) => i.trulyUnsupported)).toHaveLength(3);
    expect(GOLDEN_SET.filter((i) => !i.trulyUnsupported)).toHaveLength(2);
  });

  it("every item has non-empty scenario, transcript, claim, and whyTrap", () => {
    for (const item of GOLDEN_SET) {
      expect(item.scenario.trim()).not.toBe("");
      expect(item.transcript.trim()).not.toBe("");
      expect(item.claimText.trim()).not.toBe("");
      expect(item.whyTrap.trim()).not.toBe("");
    }
  });

  it("contains no em dashes in user-facing copy", () => {
    for (const item of GOLDEN_SET) {
      expect(item.claimText).not.toContain("—");
      expect(item.whyTrap).not.toContain("—");
    }
  });
});
