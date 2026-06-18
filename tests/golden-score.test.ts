import { describe, it, expect } from "vitest";
import { scoreGolden, type GoldenPrediction } from "../src/lib/golden/score";

// Positive class = "the claim is truly unsupported (a hallucination we want to catch)".
const predictions: GoldenPrediction[] = [
  { trulyUnsupported: true, predictedUnsupported: true }, // TP
  { trulyUnsupported: true, predictedUnsupported: false }, // FN
  { trulyUnsupported: false, predictedUnsupported: true }, // FP
  { trulyUnsupported: false, predictedUnsupported: false }, // TN
  { trulyUnsupported: true, predictedUnsupported: true }, // TP
];

describe("scoreGolden", () => {
  it("computes precision, recall, and f1", () => {
    const r = scoreGolden(predictions);
    // TP=2, FP=1, FN=1
    expect(r.precision).toBeCloseTo(2 / 3, 5);
    expect(r.recall).toBeCloseTo(2 / 3, 5);
    expect(r.f1).toBeCloseTo(2 / 3, 5);
  });

  it("returns the raw confusion-matrix counts", () => {
    const r = scoreGolden(predictions);
    expect(r).toMatchObject({ tp: 2, fp: 1, fn: 1, tn: 1 });
  });

  it("returns zeros for an empty set", () => {
    expect(scoreGolden([])).toEqual({
      precision: 0,
      recall: 0,
      f1: 0,
      tp: 0,
      fp: 0,
      fn: 0,
      tn: 0,
    });
  });
});
