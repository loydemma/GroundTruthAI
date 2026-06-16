"use client";
import type { VerifiedClaim } from "@/lib/types";

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
            onClick={() => onSelect(c)}
            className={`cursor-pointer rounded-lg border p-3 transition ${
              c.flagged
                ? "border-red-400 bg-red-50"
                : "border-emerald-300 bg-emerald-50/40"
            } ${isSelected ? "ring-2 ring-neutral-900" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wide text-neutral-500">{c.type}</span>
              <span className="text-[10px] font-medium">
                {c.flagged ? "⚑ review" : "✓ grounded"}
              </span>
            </div>
            <div className="mt-1 text-sm">{c.text}</div>
            <div className="mt-1 text-xs text-neutral-500">
              {c.verdict} · {(c.confidence * 100).toFixed(0)}% ·{" "}
              {c.verified ? "evidence verified" : "evidence NOT in transcript"}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
