import { describe, it, expect } from "vitest";
import { estimateGpt4oCostUsd, flaggedPct } from "../src/lib/metrics";
import type { VerifiedClaim } from "../src/lib/types";

const claim = (flagged: boolean): VerifiedClaim => ({
  text: "x",
  type: "summary",
  verdict: "supported",
  confidence: 0.9,
  citedSpans: [],
  verified: true,
  flagged,
});

describe("estimateGpt4oCostUsd", () => {
  it("uses $2.50/1M input and $10/1M output", () => {
    expect(estimateGpt4oCostUsd(1_000_000, 1_000_000)).toBeCloseTo(12.5, 5);
  });
  it("returns 0 for no tokens", () => {
    expect(estimateGpt4oCostUsd(0, 0)).toBe(0);
  });
});

describe("flaggedPct", () => {
  it("returns the percentage of flagged claims", () => {
    expect(flaggedPct([claim(true), claim(false), claim(false), claim(false)])).toBe(25);
  });
  it("returns 0 for an empty list", () => {
    expect(flaggedPct([])).toBe(0);
  });
});
