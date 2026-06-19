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
  // Spans that normalize to nothing (a bare emoji or punctuation like ";)") carry
  // no verifiable text, so they can't sink a claim that also cites real wording.
  const checkable = claim.citedSpans.filter((s) => normalize(s).length > 0);
  const verified =
    checkable.length > 0 && checkable.every((s) => spanAppears(s, transcript));
  return { ...claim, verified, flagged: false };
}
