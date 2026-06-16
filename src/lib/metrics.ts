import type { VerifiedClaim } from "./types";

const GPT4O_INPUT_USD_PER_1M = 2.5;
const GPT4O_OUTPUT_USD_PER_1M = 10;

export function estimateGpt4oCostUsd(promptTokens: number, completionTokens: number): number {
  return (
    (promptTokens / 1_000_000) * GPT4O_INPUT_USD_PER_1M +
    (completionTokens / 1_000_000) * GPT4O_OUTPUT_USD_PER_1M
  );
}

export function flaggedPct(claims: VerifiedClaim[]): number {
  if (claims.length === 0) return 0;
  return (claims.filter((c) => c.flagged).length / claims.length) * 100;
}
