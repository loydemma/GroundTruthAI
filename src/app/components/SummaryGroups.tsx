import type { ClaimType, GeneratedClaim } from "@/lib/types";
import { groupClaims, CATEGORY_LABEL } from "@/lib/ui/claimGroups";

// The generated summary, grouped by claim type into a readable list (no verdicts).
export function SummaryGroups({ claims }: { claims: GeneratedClaim[] }) {
  const groups = groupClaims(claims);
  const hasSimulated = claims.some((c) => c.simulated);
  return (
    <div className="space-y-5">
      {hasSimulated && (
        <p className="rounded-lg border border-[var(--color-partial)]/40 bg-[var(--color-partial-bg)] px-3 py-2 text-sm text-[var(--color-partial)]">
          Demo mode. One claim below was planted, not written by the AI. The rest is the
          real Gemini summary, and the checker hasn&apos;t been told which is which.
        </p>
      )}
      {groups.map((g) => (
        <div key={g.type}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            {CATEGORY_LABEL[g.type as ClaimType] ?? g.type}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {g.claims.map((c, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm leading-relaxed text-[var(--color-fg)]"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-fg-faint)]" />
                <span>
                  {c.text}
                  {c.simulated && (
                    <span className="ml-2 inline-flex items-center rounded-full border border-[var(--color-partial)]/50 bg-[var(--color-partial-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-partial)]">
                      Simulated
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
