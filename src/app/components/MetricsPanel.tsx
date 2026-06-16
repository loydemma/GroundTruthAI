import type { RunMetrics } from "@/lib/types";

export function MetricsPanel({ m }: { m: RunMetrics }) {
  const items: [string, string][] = [
    ["Total latency", `${m.totalLatencyMs} ms`],
    ["Generate", `${m.generateLatencyMs} ms`],
    ["Judge", `${m.judgeLatencyMs} ms`],
    ["Tokens", `${m.promptTokens + m.completionTokens}`],
    ["Cost if GPT-4o", `$${m.estimatedGpt4oCostUsd.toFixed(5)}`],
    ["Flagged", `${m.flaggedPct.toFixed(0)}%`],
  ];
  return (
    <div className="grid grid-cols-3 gap-3 text-sm sm:grid-cols-6">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-neutral-200 p-3">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
          <div className="mt-1 font-mono text-sm">{value}</div>
        </div>
      ))}
    </div>
  );
}
