const STAGES = ["Summarize", "Judge", "Verify"] as const;

export function PipelineStages({
  loading,
  latencies,
}: {
  loading?: boolean;
  latencies?: { generateMs: number; judgeMs: number };
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {STAGES.map((stage, i) => {
        const detail =
          latencies && stage === "Summarize"
            ? `${latencies.generateMs} ms`
            : latencies && stage === "Judge"
              ? `${latencies.judgeMs} ms`
              : latencies && stage === "Verify"
                ? "in-code"
                : null;
        return (
          <div key={stage} className="flex items-center gap-2">
            <div
              className={`rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 ${
                loading ? "gt-pulse" : ""
              }`}
            >
              <span className="text-[var(--color-fg)]">{stage}</span>
              {detail && (
                <span className="ml-2 font-mono text-[var(--color-fg-faint)]">{detail}</span>
              )}
            </div>
            {i < STAGES.length - 1 && (
              <span className="text-[var(--color-fg-faint)]">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
