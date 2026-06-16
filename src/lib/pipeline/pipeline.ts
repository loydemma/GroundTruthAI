import type { ModelClient } from "../model/client";
import type { AnalysisResult, VerifiedClaim } from "../types";
import { generateClaims } from "./generate";
import { judgeClaim } from "./judge";
import { verifyClaim } from "./verify";
import { routeClaim } from "./route";
import { estimateGpt4oCostUsd, flaggedPct } from "../metrics";

export async function analyzeTranscript(
  client: ModelClient,
  transcript: string
): Promise<AnalysisResult> {
  const start = Date.now();
  let promptTokens = 0;
  let completionTokens = 0;

  const genStart = Date.now();
  const { claims, response: genResponse } = await generateClaims(client, transcript);
  const generateLatencyMs = Date.now() - genStart;
  promptTokens += genResponse.promptTokens;
  completionTokens += genResponse.completionTokens;

  const judgeStart = Date.now();
  const verified: VerifiedClaim[] = [];
  for (const claim of claims) {
    const { judged, response } = await judgeClaim(client, claim, transcript);
    promptTokens += response.promptTokens;
    completionTokens += response.completionTokens;
    verified.push(routeClaim(verifyClaim(judged, transcript)));
  }
  const judgeLatencyMs = Date.now() - judgeStart;

  return {
    claims: verified,
    metrics: {
      totalLatencyMs: Date.now() - start,
      generateLatencyMs,
      judgeLatencyMs,
      promptTokens,
      completionTokens,
      estimatedGpt4oCostUsd: estimateGpt4oCostUsd(promptTokens, completionTokens),
      flaggedPct: flaggedPct(verified),
    },
  };
}
