import { describe, it, expect } from "vitest";
import { analyzeTranscript } from "../src/lib/pipeline/pipeline";
import { FakeModelClient } from "../src/lib/model/fake";

const transcript =
  "Customer: We will renew the contract next quarter. Rep: I'll send the paperwork.";

describe("analyzeTranscript", () => {
  it("runs all 4 stages: generates, judges, verifies citations, routes, and aggregates metrics", async () => {
    const gen = JSON.stringify({
      claims: [
        { text: "Customer will renew next quarter.", type: "commitment" },
        { text: "Customer asked for a 50% discount.", type: "summary" },
      ],
    });
    const judgeGood = JSON.stringify({
      verdict: "supported",
      confidence: 0.95,
      citedSpans: ["We will renew the contract next quarter"],
    });
    // Hallucinated claim: judge says supported but cites text not in the transcript.
    const judgeHallucinatedEvidence = JSON.stringify({
      verdict: "supported",
      confidence: 0.9,
      citedSpans: ["Customer asked for a 50% discount"],
    });
    const fake = new FakeModelClient([gen, judgeGood, judgeHallucinatedEvidence]);

    const { claims, metrics } = await analyzeTranscript(fake, transcript);

    expect(claims).toHaveLength(2);
    // Claim 1: real evidence -> verified, not flagged.
    expect(claims[0].verified).toBe(true);
    expect(claims[0].flagged).toBe(false);
    // Claim 2: judge hallucinated its own evidence -> verification catches it -> flagged.
    expect(claims[1].verified).toBe(false);
    expect(claims[1].flagged).toBe(true);

    expect(metrics.flaggedPct).toBe(50);
    expect(metrics.promptTokens).toBeGreaterThan(0);
    expect(metrics.estimatedGpt4oCostUsd).toBeGreaterThan(0);
    expect(metrics.totalLatencyMs).toBeGreaterThanOrEqual(0);
  });
});
