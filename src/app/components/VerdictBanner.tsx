import type { VerifiedClaim } from "@/lib/types";

export function VerdictBanner({ claims }: { claims: VerifiedClaim[] }) {
  const total = claims.length;
  const flagged = claims.filter((c) => c.flagged).length;
  const grounded = total - flagged;
  const ok = flagged === 0;
  const planted = claims.find((c) => c.simulated);
  const plantedCaught = planted?.flagged === true;

  const headline = ok
    ? "Every line traced back to the call"
    : `${flagged} line${flagged === 1 ? "" : "s"} couldn't be traced to the call`;

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
        {total} statement{total === 1 ? "" : "s"} · {grounded} grounded · {flagged}{" "}
        {flagged === 1 ? "needs" : "need"} review
      </div>
      {plantedCaught && (
        <div className="mt-3 rounded-lg border border-[var(--color-grounded)]/40 bg-[var(--color-grounded-bg)] px-3 py-2.5 text-base leading-relaxed text-[var(--color-grounded)]">
          The Judge caught your planted claim and left the real ones alone. A known
          defect, proven caught.
        </div>
      )}
    </div>
  );
}
