import type { RunMetrics } from "@/lib/types";
import { StatCard } from "./StatCard";
import { PipelineStages } from "./PipelineStages";

export function MetricsPanel({ m }: { m: RunMetrics }) {
  return (
    <div className="gt-fade-in space-y-4">
      <PipelineStages latencies={{ generateMs: m.generateLatencyMs, judgeMs: m.judgeLatencyMs }} />
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Tokens" value={`${m.promptTokens + m.completionTokens}`} />
        <StatCard label="Cost if GPT-4o" value={`$${m.estimatedGpt4oCostUsd.toFixed(5)}`} />
      </div>
    </div>
  );
}
