type Tone = "default" | "accent" | "grounded" | "flagged";

const toneText: Record<Tone, string> = {
  default: "text-[var(--color-fg)]",
  accent: "text-[var(--color-accent)]",
  grounded: "text-[var(--color-grounded)]",
  flagged: "text-[var(--color-flagged)]",
};

const toneBar: Record<Tone, string> = {
  default: "bg-[var(--color-fg-muted)]",
  accent: "bg-[var(--color-accent)]",
  grounded: "bg-[var(--color-grounded)]",
  flagged: "bg-[var(--color-flagged)]",
};

export function StatCard({
  label,
  value,
  tone = "default",
  bar,
}: {
  label: string;
  value: string;
  tone?: Tone;
  bar?: number; // 0..1, optional
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
        {label}
      </div>
      <div className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${toneText[tone]}`}>
        {value}
      </div>
      {bar !== undefined && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className={`h-full rounded-full ${toneBar[tone]}`}
            style={{ width: `${Math.max(0, Math.min(1, bar)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
