import { describe, it, expect } from "vitest";
import { evaluateGolden } from "../src/lib/golden/evaluate";
import { GOLDEN_SET } from "../src/lib/golden/dataset";
import type { JudgedClaim } from "../src/lib/types";

// A judged claim the verifier will treat as supported + verified
// (cited span is a verbatim slice of the transcript, so it is found).
function supported(i: number): JudgedClaim {
  return {
    text: GOLDEN_SET[i].claimText,
    type: GOLDEN_SET[i].type,
    verdict: "supported",
    confidence: 0.9,
    citedSpans: [GOLDEN_SET[i].transcript.slice(0, 25)],
  };
}

// A judged claim flagged as unsupported.
function unsupported(i: number): JudgedClaim {
  return {
    text: GOLDEN_SET[i].claimText,
    type: GOLDEN_SET[i].type,
    verdict: "unsupported",
    confidence: 0.9,
    citedSpans: [],
  };
}

// A "perfect judge": agrees with ground truth on every item.
function perfectJudgement(): JudgedClaim[] {
  return GOLDEN_SET.map((item, i) => (item.trulyUnsupported ? unsupported(i) : supported(i)));
}

describe("evaluateGolden", () => {
  it("scores a perfect judge as all correct", () => {
    const r = evaluateGolden(perfectJudgement());
    expect(r.total).toBe(5);
    expect(r.correctCount).toBe(5);
    expect(r.score.tp).toBe(3);
    expect(r.score.tn).toBe(2);
    expect(r.items.every((it) => it.correct)).toBe(true);
  });

  it("marks a missed fabrication as incorrect", () => {
    const judged = perfectJudgement();
    const fakeIdx = GOLDEN_SET.findIndex((i) => i.trulyUnsupported);
    judged[fakeIdx] = supported(fakeIdx); // judge wrongly accepts a fake
    const r = evaluateGolden(judged);
    expect(r.correctCount).toBe(4);
    expect(r.items[fakeIdx].correct).toBe(false);
    expect(r.score.fn).toBe(1);
  });
});
