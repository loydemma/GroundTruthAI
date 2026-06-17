import type { ClaimType } from "@/lib/types";

// Fixed display order for the known claim types. Unknown types sort after these.
const ORDER: ClaimType[] = ["summary", "decision", "commitment", "action_item"];

// Human-readable group heading per type (unknown types fall back to the raw value).
export const CATEGORY_LABEL: Record<ClaimType, string> = {
  summary: "Summary",
  decision: "Decisions",
  commitment: "Commitments",
  action_item: "Action items",
};

export interface ClaimGroup<T> {
  type: string;
  claims: T[];
}

// Groups claims by type into non-empty groups, ordered by ORDER then by first
// appearance for any unknown type. Claim order within a group is preserved.
export function groupClaims<T extends { type: string }>(claims: T[]): ClaimGroup<T>[] {
  const byType = new Map<string, T[]>();
  for (const claim of claims) {
    const bucket = byType.get(claim.type);
    if (bucket) bucket.push(claim);
    else byType.set(claim.type, [claim]);
  }

  const rank = (type: string) => {
    const i = ORDER.indexOf(type as ClaimType);
    return i === -1 ? ORDER.length : i;
  };
  const seen = [...byType.keys()];
  seen.sort((a, b) => rank(a) - rank(b) || seen.indexOf(a) - seen.indexOf(b));

  return seen.map((type) => ({ type, claims: byType.get(type)! }));
}
