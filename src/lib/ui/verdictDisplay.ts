import type { Verdict } from "@/lib/types";

export type Pill = "grounded" | "no-source" | "partial";

// Maps a checked claim to one of three legible pill states. Precedence matters:
// an unverified claim is always "no-source" so we never surface a quote that
// isn't actually in the transcript.
export function verdictPill(claim: { verdict: Verdict; verified: boolean }): Pill {
  if (claim.verdict === "supported" && claim.verified) return "grounded";
  if (!claim.verified || claim.verdict === "unsupported") return "no-source";
  return "partial";
}
