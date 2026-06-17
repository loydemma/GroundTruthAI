import { describe, it, expect } from "vitest";
import { runGenerate, runCheck, combineMetrics } from "../src/lib/pipeline/pipeline";
import { FakeModelClient } from "../src/lib/model/fake";
import { injectSimulatedClaim } from "../src/lib/sim/inject";
import type { GeneratedClaim, VerifiedClaim } from "../src/lib/types";

const transcript =
  "Customer: We will renew the contract next quarter. Rep: I'll send the paperwork.";

describe("runGenerate", () => {
  it("returns the AI-written claims and stage metrics", async () => {
    const gen = JSON.stringify({
      claims: [{ text: "Customer will renew next quarter.", type: "commitment" }],
    });
    const fake = new FakeModelClient([gen]);

    const { claims, stage } = await runGenerate(fake, transcript);

    expect(claims).toHaveLength(1);
    expect(claims[0].text).toBe("Customer will renew next quarter.");
    expect(stage.promptTokens).toBeGreaterThan(0);
    expect(stage.completionTokens).toBeGreaterThan(0);
    expect(stage.latencyMs).toBeGreaterThanOrEqual(0);
  });
});

describe("runCheck", () => {
  it("judges, verifies citations, and flags a claim whose evidence is not in the transcript", async () => {
    const claims: GeneratedClaim[] = [
      { text: "Customer will renew next quarter.", type: "commitment" },
      { text: "Customer asked for a 50% discount.", type: "summary" },
    ];
    // One batched judge call returns a result per claim.
    const judgeBatch = JSON.stringify({
      results: [
        {
          verdict: "supported",
          confidence: 0.95,
          citedSpans: ["We will renew the contract next quarter"],
        },
        // Hallucinated evidence: judge says supported but cites text not in the transcript.
        { verdict: "supported", confidence: 0.9, citedSpans: ["Customer asked for a 50% discount"] },
      ],
    });
    const fake = new FakeModelClient([judgeBatch]);

    const { claims: verified, stage } = await runCheck(fake, transcript, claims);

    expect(fake.prompts).toHaveLength(1); // judged in a single call
    expect(verified).toHaveLength(2);
    expect(verified[0].verified).toBe(true);
    expect(verified[0].flagged).toBe(false);
    expect(verified[1].verified).toBe(false);
    expect(verified[1].flagged).toBe(true);
    expect(stage.promptTokens).toBeGreaterThan(0);
  });
});

describe("runCheck with a simulated claim", () => {
  it("preserves the simulated flag and flags the planted unsupported claim", async () => {
    const claims = injectSimulatedClaim(
      [{ text: "Customer will renew next quarter.", type: "commitment" }],
      "The customer agreed to sign by Friday.",
    );
    // Judge sees two items and has no idea one is planted; it finds no support for it.
    const judgeBatch = JSON.stringify({
      results: [
        { verdict: "supported", confidence: 0.95, citedSpans: ["We will renew the contract next quarter"] },
        { verdict: "unsupported", confidence: 0.2, citedSpans: [] },
      ],
    });
    const fake = new FakeModelClient([judgeBatch]);

    const { claims: verified } = await runCheck(fake, transcript, claims);

    expect(verified[1].simulated).toBe(true);
    expect(verified[1].flagged).toBe(true);
    expect(verified[0].simulated).toBeUndefined();
  });
});

describe("combineMetrics", () => {
  it("sums latency and tokens across stages and computes cost and flagged percentage", () => {
    const generate = { latencyMs: 10, promptTokens: 100, completionTokens: 20 };
    const judge = { latencyMs: 30, promptTokens: 200, completionTokens: 40 };
    const claims = [{ flagged: true }, { flagged: false }] as VerifiedClaim[];

    const m = combineMetrics(generate, judge, claims);

    expect(m.generateLatencyMs).toBe(10);
    expect(m.judgeLatencyMs).toBe(30);
    expect(m.totalLatencyMs).toBe(40);
    expect(m.promptTokens).toBe(300);
    expect(m.completionTokens).toBe(60);
    expect(m.flaggedPct).toBe(50);
    expect(m.estimatedGpt4oCostUsd).toBeGreaterThan(0);
  });
});
