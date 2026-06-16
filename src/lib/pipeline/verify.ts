import type { JudgedClaim, VerifiedClaim } from "../types";

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function spanAppears(span: string, transcript: string): boolean {
  const n = normalize(span);
  if (n.length === 0) return false;
  return normalize(transcript).includes(n);
}

export function verifyClaim(claim: JudgedClaim, transcript: string): VerifiedClaim {
  const verified =
    claim.citedSpans.length > 0 &&
    claim.citedSpans.every((s) => spanAppears(s, transcript));
  return { ...claim, verified, flagged: false };
}
