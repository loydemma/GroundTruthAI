"use client";
import type { VerifiedClaim, Verdict } from "@/lib/types";

const verdictColor: Record<Verdict, string> = {
  supported: "text-[var(--color-grounded)]",
  partially: "text-[var(--color-partial)]",
  unsupported: "text-[var(--color-flagged)]",
};

const verdictBar: Record<Verdict, string> = {
  supported: "bg-[var(--color-grounded)]",
  partially: "bg-[var(--color-partial)]",
  unsupported: "bg-[var(--color-flagged)]",
};

export function ClaimList({
  claims,
  selected,
  onSelect,
}: {
  claims: VerifiedClaim[];
  selected: VerifiedClaim | null;
  onSelect: (c: VerifiedClaim) => void;
}) {
  return (
    <ul className="space-y-2">
      {claims.map((c, i) => {
        const isSelected = selected === c;
        return (
          <li
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(c)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(c);
              }
            }}
            className={`cursor-pointer rounded-xl border p-4 transition outline-none ${
              c.flagged
                ? "border-[var(--color-flagged)]/40 bg-[var(--color-flagged-bg)] hover:shadow-[0_0_24px_-12px_var(--color-flagged)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-fg-faint)]"
            } ${isSelected ? "ring-2 ring-[var(--color-accent)]" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-fg-faint)]">
                {c.type}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  c.flagged ? "text-[var(--color-flagged)]" : "text-[var(--color-grounded)]"
                }`}
              >
                {c.flagged ? "⚑ review" : "✓ grounded"}
              </span>
            </div>
            <div className="mt-2 text-sm text-[var(--color-fg)]">{c.text}</div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className={`h-full rounded-full ${verdictBar[c.verdict]}`}
                style={{ width: `${c.confidence * 100}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
              <span className={verdictColor[c.verdict]}>{c.verdict}</span>
              <span className="text-[var(--color-fg-faint)]">·</span>
              <span className="font-mono">{(c.confidence * 100).toFixed(0)}%</span>
              <span className="text-[var(--color-fg-faint)]">·</span>
              <span>{c.verified ? "evidence verified" : "evidence NOT in transcript"}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
