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

// Human-readable explanation for a flagged ("no source") claim. Distinguishes a
// claim the judge cited evidence for that verification couldn't find from one
// with no support at all.
export function noSourceReason(claim: { citedSpans: string[]; verified: boolean }): string {
  return claim.citedSpans.length > 0 && !claim.verified
    ? "The cited evidence isn't in the transcript."
    : "Nothing in the transcript supports this.";
}
