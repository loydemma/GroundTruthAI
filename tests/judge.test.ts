import { describe, it, expect } from "vitest";
import { judgeClaim, JUDGE_PROMPT } from "../src/lib/pipeline/judge";
import { FakeModelClient } from "../src/lib/model/fake";
import type { GeneratedClaim } from "../src/lib/types";

const claim: GeneratedClaim = { text: "Customer will renew next quarter.", type: "commitment" };

describe("judgeClaim", () => {
  it("parses verdict, confidence, and cited spans; prompt includes claim + transcript", async () => {
    const json = JSON.stringify({
      verdict: "supported",
      confidence: 0.92,
      citedSpans: ["We will renew the contract next quarter"],
    });
    const fake = new FakeModelClient([json]);
    const { judged, response } = await judgeClaim(fake, claim, "TRANSCRIPT");
    expect(judged.verdict).toBe("supported");
    expect(judged.confidence).toBeCloseTo(0.92);
    expect(judged.citedSpans).toEqual(["We will renew the contract next quarter"]);
    expect(judged.text).toBe(claim.text);
    expect(fake.prompts[0]).toContain("TRANSCRIPT");
    expect(fake.prompts[0]).toContain(claim.text);
    expect(JUDGE_PROMPT.length).toBeGreaterThan(0);
    expect(response.completionTokens).toBeGreaterThan(0);
  });

  it("defaults missing citedSpans to an empty array", async () => {
    const fake = new FakeModelClient([
      JSON.stringify({ verdict: "unsupported", confidence: 0.3 }),
    ]);
    const { judged } = await judgeClaim(fake, claim, "t");
    expect(judged.citedSpans).toEqual([]);
  });
});
