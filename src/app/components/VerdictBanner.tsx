import type { VerifiedClaim } from "@/lib/types";

export function VerdictBanner({ claims }: { claims: VerifiedClaim[] }) {
  const total = claims.length;
  const flagged = claims.filter((c) => c.flagged).length;
  const grounded = total - flagged;
  const ok = flagged === 0;

  const headline = ok
    ? "All claims grounded in the transcript"
    : `${flagged} claim${flagged === 1 ? "" : "s"} couldn't be grounded in the transcript`;

  return (
    <div
      className={`gt-fade-in rounded-2xl border p-5 sm:p-6 ${
        ok
          ? "border-[var(--color-grounded)]/40 bg-[var(--color-grounded-bg)]"
          : "border-[var(--color-flagged)]/40 bg-[var(--color-flagged-bg)] shadow-[0_0_40px_-12px_var(--color-flagged)]"
      }`}
    >
      <div
        className={`text-lg font-semibold tracking-tight sm:text-xl ${
          ok ? "text-[var(--color-grounded)]" : "text-[var(--color-flagged)]"
        }`}
      >
        {ok ? "✓ " : "⚑ "}
        {headline}
      </div>
      <div className="mt-1 font-mono text-sm text-[var(--color-fg-muted)]">
        {total} claim{total === 1 ? "" : "s"} · {grounded} grounded · {flagged} flagged
      </div>
    </div>
  );
}
