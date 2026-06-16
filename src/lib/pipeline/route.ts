import type { VerifiedClaim } from "../types";

export const CONFIDENCE_THRESHOLD = 0.7;

export function routeClaim(
  claim: VerifiedClaim,
  threshold: number = CONFIDENCE_THRESHOLD
): VerifiedClaim {
  const flagged =
    claim.verdict === "unsupported" ||
    claim.verdict === "partially" ||
    !claim.verified ||
    claim.confidence < threshold;
  return { ...claim, flagged };
}
