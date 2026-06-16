import { describe, it, expect } from "vitest";
import { routeClaim } from "../src/lib/pipeline/route";
import type { VerifiedClaim } from "../src/lib/types";

const ok: VerifiedClaim = {
  text: "x",
  type: "summary",
  verdict: "supported",
  confidence: 0.9,
  citedSpans: ["a"],
  verified: true,
  flagged: false,
};

describe("routeClaim", () => {
  it("does not flag a supported, verified, high-confidence claim", () => {
    expect(routeClaim(ok).flagged).toBe(false);
  });
  it("flags an unsupported claim", () => {
    expect(routeClaim({ ...ok, verdict: "unsupported" }).flagged).toBe(true);
  });
  it("flags a partially-supported claim", () => {
    expect(routeClaim({ ...ok, verdict: "partially" }).flagged).toBe(true);
  });
  it("flags a claim whose citations failed verification", () => {
    expect(routeClaim({ ...ok, verified: false }).flagged).toBe(true);
  });
  it("flags a low-confidence claim", () => {
    expect(routeClaim({ ...ok, confidence: 0.4 }).flagged).toBe(true);
  });
});
