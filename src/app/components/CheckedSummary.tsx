import type { ClaimType, VerifiedClaim } from "@/lib/types";
import { groupClaims, CATEGORY_LABEL } from "@/lib/ui/claimGroups";
import { ClaimRow } from "./ClaimRow";

// The checked summary: same grouping as the generated view, but every line
// carries a verdict pill and expands to show its source in the transcript.
export function CheckedSummary({ claims }: { claims: VerifiedClaim[] }) {
  const groups = groupClaims(claims);
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.type}>
          <h3 className="gt-eyebrow text-[var(--color-accent)]">
            {CATEGORY_LABEL[g.type as ClaimType] ?? g.type}
          </h3>
          <ul className="mt-2 space-y-2">
            {g.claims.map((c, i) => (
              <ClaimRow key={i} claim={c} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
