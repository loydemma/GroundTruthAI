import { describe, it, expect } from "vitest";
import { normalize, spanAppears, verifyClaim } from "../src/lib/pipeline/verify";
import type { JudgedClaim } from "../src/lib/types";

const transcript =
  "Customer: We will renew the contract next quarter. Rep: Great, I'll send the paperwork.";

describe("normalize", () => {
  it("lowercases, collapses whitespace, strips punctuation", () => {
    expect(normalize("  We WILL,  renew! ")).toBe("we will renew");
  });
});

describe("spanAppears", () => {
  it("true when a near-verbatim span is present", () => {
    expect(spanAppears("we will renew the contract", transcript)).toBe(true);
  });
  it("false when the span is not in the transcript", () => {
    expect(spanAppears("customer agreed to a refund", transcript)).toBe(false);
  });
  it("false for an empty span", () => {
    expect(spanAppears("   ", transcript)).toBe(false);
  });
});

describe("verifyClaim", () => {
  const base: JudgedClaim = {
    text: "Customer committed to renewing next quarter.",
    type: "commitment",
    verdict: "supported",
    confidence: 0.9,
    citedSpans: ["We will renew the contract next quarter"],
  };
  it("verified=true when all cited spans appear", () => {
    expect(verifyClaim(base, transcript).verified).toBe(true);
  });
  it("verified=false when judge cited evidence that is not in the transcript", () => {
    const hallucinatedEvidence = { ...base, citedSpans: ["Customer asked for a refund"] };
    expect(verifyClaim(hallucinatedEvidence, transcript).verified).toBe(false);
  });
  it("verified=false when there are no cited spans", () => {
    expect(verifyClaim({ ...base, citedSpans: [] }, transcript).verified).toBe(false);
  });
  it("ignores an emoji/punctuation-only span so a real citation still verifies", () => {
    // The ";)" normalizes to nothing and must not sink the verbatim span beside it.
    const withEmoji = {
      ...base,
      citedSpans: [";)", "We will renew the contract next quarter"],
    };
    expect(verifyClaim(withEmoji, transcript).verified).toBe(true);
  });
  it("verified=false when every cited span normalizes to empty", () => {
    expect(verifyClaim({ ...base, citedSpans: [";)", "!!!"] }, transcript).verified).toBe(false);
  });
});
