import type { JudgedClaim } from "../types";
import { verifyClaim } from "../pipeline/verify";
import { GOLDEN_SET } from "./dataset";
import { scoreGolden, type GoldenScore, type GoldenPrediction } from "./score";

export interface GoldenItemResult {
  scenario: string;
  transcript: string;
  claimText: string;
  whyTrap: string;
  expectedUnsupported: boolean;
  predictedUnsupported: boolean;
  correct: boolean;
}

export interface GoldenEvaluation {
  items: GoldenItemResult[];
  score: GoldenScore;
  correctCount: number;
  total: number;
}

// `judged` must be aligned 1:1 with GOLDEN_SET (same order judgeClaims was given).
export function evaluateGolden(judged: JudgedClaim[]): GoldenEvaluation {
  const items: GoldenItemResult[] = GOLDEN_SET.map((item, i) => {
    const verified = verifyClaim(judged[i], item.transcript);
    const predictedUnsupported = judged[i].verdict !== "supported" || !verified.verified;
    return {
      scenario: item.scenario,
      transcript: item.transcript,
      claimText: item.claimText,
      whyTrap: item.whyTrap,
      expectedUnsupported: item.trulyUnsupported,
      predictedUnsupported,
      correct: predictedUnsupported === item.trulyUnsupported,
    };
  });

  const predictions: GoldenPrediction[] = items.map((it) => ({
    trulyUnsupported: it.expectedUnsupported,
    predictedUnsupported: it.predictedUnsupported,
  }));

  return {
    items,
    score: scoreGolden(predictions),
    correctCount: items.filter((it) => it.correct).length,
    total: items.length,
  };
}
