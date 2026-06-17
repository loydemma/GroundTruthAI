export type ClaimType = "summary" | "action_item" | "commitment" | "decision";
export type Verdict = "supported" | "partially" | "unsupported";

export interface GeneratedClaim {
  text: string;
  type: ClaimType;
  simulated?: boolean; // UI/persistence only — never shown to the judge
}

export interface JudgedClaim extends GeneratedClaim {
  verdict: Verdict;
  confidence: number; // 0..1
  citedSpans: string[]; // verbatim quotes the judge claims support the claim
}

export interface VerifiedClaim extends JudgedClaim {
  verified: boolean; // do ALL cited spans actually appear in the transcript?
  flagged: boolean; // routing decision: needs human review
}

export interface StageMetrics {
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
}

export interface RunMetrics {
  totalLatencyMs: number;
  generateLatencyMs: number;
  judgeLatencyMs: number;
  promptTokens: number;
  completionTokens: number;
  estimatedGpt4oCostUsd: number;
  flaggedPct: number;
}

export interface AnalysisResult {
  claims: VerifiedClaim[];
  metrics: RunMetrics;
}
