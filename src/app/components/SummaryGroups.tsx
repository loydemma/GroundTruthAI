import type { ClaimType, GeneratedClaim } from "@/lib/types";
import { groupClaims, CATEGORY_LABEL } from "@/lib/ui/claimGroups";

// The generated summary, grouped by claim type into a readable list (no verdicts).
export function SummaryGroups({ claims }: { claims: GeneratedClaim[] }) {
  const groups = groupClaims(claims);
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <div key={g.type}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            {CATEGORY_LABEL[g.type as ClaimType] ?? g.type}
          </h3>
          <ul className="mt-2 space-y-2">
            {g.claims.map((c, i) =>
              c.simulated ? (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-xl border border-l-2 border-[var(--color-partial)]/50 border-l-[var(--color-partial)] bg-[var(--color-partial-bg)] px-3 py-2.5"
                >
                  <span className="text-base font-semibold leading-snug text-[var(--color-partial)]">
                    {c.text}
                  </span>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--color-partial)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-bg)]">
                    Planted
                  </span>
                </li>
              ) : (
                <li
                  key={i}
                  className="flex gap-2.5 text-base leading-relaxed text-[var(--color-fg)]"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-fg-faint)]" />
                  <span>{c.text}</span>
                </li>
              ),
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
