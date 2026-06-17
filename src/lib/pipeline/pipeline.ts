import type { ModelClient } from "../model/client";
import type {
  AnalysisResult,
  GeneratedClaim,
  RunMetrics,
  StageMetrics,
  VerifiedClaim,
} from "../types";
import { generateClaims } from "./generate";
import { judgeClaims } from "./judge";
import { verifyClaim } from "./verify";
import { routeClaim } from "./route";
import { estimateGpt4oCostUsd, flaggedPct } from "../metrics";

// Stage 1: the model under test drafts a summary as discrete claims.
export async function runGenerate(
  client: ModelClient,
  transcript: string
): Promise<{ claims: GeneratedClaim[]; stage: StageMetrics }> {
  const start = Date.now();
  const { claims, response } = await generateClaims(client, transcript);
  return {
    claims,
    stage: {
      latencyMs: Date.now() - start,
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
    },
  };
}

// Stage 2: judge each claim against the transcript, verify the cited evidence, and route.
export async function runCheck(
  client: ModelClient,
  transcript: string,
  claims: GeneratedClaim[]
): Promise<{ claims: VerifiedClaim[]; stage: StageMetrics }> {
  const start = Date.now();
  const { judged, response } = await judgeClaims(
    client,
    claims.map((claim) => ({ claim, transcript }))
  );
  const verified: VerifiedClaim[] = judged.map((j) =>
    routeClaim(verifyClaim(j, transcript))
  );
  return {
    claims: verified,
    stage: {
      latencyMs: Date.now() - start,
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
    },
  };
}

export function combineMetrics(
  generate: StageMetrics,
  judge: StageMetrics,
  claims: VerifiedClaim[]
): RunMetrics {
  const promptTokens = generate.promptTokens + judge.promptTokens;
  const completionTokens = generate.completionTokens + judge.completionTokens;
  return {
    totalLatencyMs: generate.latencyMs + judge.latencyMs,
    generateLatencyMs: generate.latencyMs,
    judgeLatencyMs: judge.latencyMs,
    promptTokens,
    completionTokens,
    estimatedGpt4oCostUsd: estimateGpt4oCostUsd(promptTokens, completionTokens),
    flaggedPct: flaggedPct(claims),
  };
}

export async function analyzeTranscript(
  client: ModelClient,
  transcript: string
): Promise<AnalysisResult> {
  const { claims: generated, stage: genStage } = await runGenerate(client, transcript);
  const { claims, stage: judgeStage } = await runCheck(client, transcript, generated);
  return { claims, metrics: combineMetrics(genStage, judgeStage, claims) };
}
