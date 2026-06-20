import type { VerifiedClaim } from "@/lib/types";
import { verdictPill, noSourceReason, type Pill } from "@/lib/ui/verdictDisplay";

const PILL: Record<Pill, { label: string; icon: string; cls: string }> = {
  grounded: {
    label: "grounded",
    icon: "✓",
    cls: "text-[var(--color-grounded)] border-[var(--color-grounded)]/40 bg-[var(--color-grounded-bg)]",
  },
  partial: {
    label: "partial",
    icon: "~",
    cls: "text-[var(--color-partial)] border-[var(--color-partial)]/40 bg-[var(--color-partial-bg)]",
  },
  "no-source": {
    label: "no source",
    icon: "⚑",
    cls: "text-[var(--color-flagged)] border-[var(--color-flagged)]/40 bg-[var(--color-flagged-bg)]",
  },
};

export function ClaimRow({ claim }: { claim: VerifiedClaim }) {
  const pill = verdictPill(claim);
  const p = PILL[pill];

  return (
    <li
      className={`rounded-xl border ${
        claim.flagged
          ? "border-l-2 border-[var(--color-flagged)]/30 border-l-[var(--color-flagged)] bg-[var(--color-flagged-bg)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 p-3">
        <span className="text-base font-medium leading-snug text-[var(--color-fg)]">
          {claim.text}
          {claim.simulated && (
            <span className="ml-2 inline-flex items-center rounded-full border border-[var(--color-partial)]/50 bg-[var(--color-partial-bg)] px-2 py-0.5 gt-tag text-[var(--color-partial)]">
              Planted
            </span>
          )}
        </span>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${p.cls}`}
        >
          {p.icon} {p.label}
        </span>
      </div>

      <div className="px-3 pb-3 pl-4">
        {pill === "no-source" ? (
          <p className="text-sm text-[var(--color-flagged)]">{noSourceReason(claim)}</p>
        ) : (
          <div className="space-y-1.5">
            <p className="gt-label text-[var(--color-fg-muted)]">
              from the call
            </p>
            {claim.citedSpans.map((s, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-[var(--color-accent)] bg-[var(--color-accent)]/5 px-3 py-2 font-mono text-sm leading-relaxed text-[var(--color-fg)]"
              >
                “{s}”
              </blockquote>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
