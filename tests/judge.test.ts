import { describe, it, expect } from "vitest";
import { judgeClaims, JUDGE_PROMPT, JUDGE_PROMPT_V1, type JudgeItem } from "../src/lib/pipeline/judge";
import { FakeModelClient } from "../src/lib/model/fake";

const items: JudgeItem[] = [
  { claim: { text: "Customer will renew next quarter.", type: "commitment" }, transcript: "T1 renew next quarter" },
  { claim: { text: "Customer asked for a discount.", type: "summary" }, transcript: "T2 nothing about discounts" },
];

describe("judgeClaims", () => {
  it("judges every claim in a single call, aligning results to claims in order", async () => {
    const json = JSON.stringify({
      results: [
        { verdict: "supported", confidence: 0.92, citedSpans: ["renew next quarter"] },
        { verdict: "unsupported", confidence: 0.2, citedSpans: [] },
      ],
    });
    const fake = new FakeModelClient([json]);

    const { judged, response } = await judgeClaims(fake, items);

    expect(fake.prompts).toHaveLength(1); // one call, not one-per-claim
    expect(judged).toHaveLength(2);
    expect(judged[0].verdict).toBe("supported");
    expect(judged[0].confidence).toBeCloseTo(0.92);
    expect(judged[0].citedSpans).toEqual(["renew next quarter"]);
    expect(judged[0].text).toBe(items[0].claim.text);
    expect(judged[1].verdict).toBe("unsupported");

    // Prompt carries every claim and every transcript.
    expect(fake.prompts[0]).toContain("renew next quarter");
    expect(fake.prompts[0]).toContain("Customer asked for a discount.");
    expect(fake.prompts[0]).toContain("T2 nothing about discounts");
    expect(JUDGE_PROMPT.length).toBeGreaterThan(0);
    expect(response.completionTokens).toBeGreaterThan(0);
  });

  it("keeps the old prompt available and distinct for the case study", () => {
    expect(JUDGE_PROMPT_V1.length).toBeGreaterThan(0);
    expect(JUDGE_PROMPT_V1).not.toBe(JUDGE_PROMPT);
  });

  it("defaults a missing citedSpans to an empty array", async () => {
    const fake = new FakeModelClient([
      JSON.stringify({ results: [{ verdict: "unsupported", confidence: 0.3 }] }),
    ]);
    const { judged } = await judgeClaims(fake, [items[0]]);
    expect(judged[0].citedSpans).toEqual([]);
  });

  it("defaults any claim the model omits to unsupported (never drops a claim)", async () => {
    const fake = new FakeModelClient([JSON.stringify({ results: [] })]);
    const { judged } = await judgeClaims(fake, items);
    expect(judged).toHaveLength(2);
    expect(judged[0].verdict).toBe("unsupported");
    expect(judged[0].citedSpans).toEqual([]);
    expect(judged[0].text).toBe(items[0].claim.text);
  });
});
