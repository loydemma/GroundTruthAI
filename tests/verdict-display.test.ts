import { describe, it, expect } from "vitest";
import { verdictPill, noSourceReason } from "../src/lib/ui/verdictDisplay";

describe("verdictPill", () => {
  it("is grounded when supported and the evidence is verified", () => {
    expect(verdictPill({ verdict: "supported", verified: true })).toBe("grounded");
  });

  it("is no-source when supported but the cited evidence is not in the transcript", () => {
    // The judge claimed support but verification couldn't find it — never show a phantom quote.
    expect(verdictPill({ verdict: "supported", verified: false })).toBe("no-source");
  });

  it("is no-source when unsupported, even if verified is true", () => {
    expect(verdictPill({ verdict: "unsupported", verified: true })).toBe("no-source");
  });

  it("is partial when partially supported and verified", () => {
    expect(verdictPill({ verdict: "partially", verified: true })).toBe("partial");
  });

  it("is no-source when partially supported but not verified", () => {
    expect(verdictPill({ verdict: "partially", verified: false })).toBe("no-source");
  });
});

describe("noSourceReason", () => {
  it("points at the missing cited evidence when the judge cited spans it can't verify", () => {
    expect(noSourceReason({ citedSpans: ["a quote"], verified: false })).toBe(
      "The cited evidence isn't in the transcript.",
    );
  });

  it("says nothing supports the claim when there are no cited spans", () => {
    expect(noSourceReason({ citedSpans: [], verified: false })).toBe(
      "Nothing in the transcript supports this.",
    );
  });
});
