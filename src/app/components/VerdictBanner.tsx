import type { VerifiedClaim } from "@/lib/types";
import { noSourceReason } from "@/lib/ui/verdictDisplay";

export function VerdictBanner({ claims }: { claims: VerifiedClaim[] }) {
  const total = claims.length;
  const flaggedClaims = claims.filter((c) => c.flagged);
  const flagged = flaggedClaims.length;
  const grounded = total - flagged;
  const ok = flagged === 0;
  const planted = claims.find((c) => c.simulated);
  const plantedCaught = planted?.flagged === true;
  const realFlagged = flaggedClaims.filter((c) => !c.simulated).length;

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
      {!ok && (
        <ul className="mt-4 space-y-2">
          {flaggedClaims.map((c, i) => (
            <li
              key={i}
              className="rounded-lg border border-[var(--color-flagged)]/40 bg-[var(--color-bg)]/40 px-3 py-2.5"
            >
              <span className="text-base font-medium leading-snug text-[var(--color-fg)]">
                {c.text}
                {c.simulated && (
                  <span className="ml-2 inline-flex items-center rounded-full border border-[var(--color-partial)]/50 bg-[var(--color-partial-bg)] px-2 py-0.5 gt-tag text-[var(--color-partial)]">
                    Planted
                  </span>
                )}
              </span>
              <p className="mt-1 text-sm text-[var(--color-flagged)]">{noSourceReason(c)}</p>
            </li>
          ))}
        </ul>
      )}
      {plantedCaught && (
        <div className="mt-3 rounded-lg border border-[var(--color-grounded)]/40 bg-[var(--color-grounded-bg)] px-3 py-2.5 text-base leading-relaxed text-[var(--color-grounded)]">
          {realFlagged === 0 ? (
            <>
              The Judge caught your planted claim and left the real ones alone. A known
              defect, proven caught.
            </>
          ) : (
            <>
              The Judge caught your planted claim — a known defect, proven caught. It also
              flagged {realFlagged} other line{realFlagged === 1 ? "" : "s"} for review
              (above).
            </>
          )}
        </div>
      )}
    </div>
  );
}
