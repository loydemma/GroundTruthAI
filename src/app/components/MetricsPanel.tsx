import type { RunMetrics } from "@/lib/types";
import { StatCard } from "./StatCard";
import { PipelineStages } from "./PipelineStages";

export function MetricsPanel({ m }: { m: RunMetrics }) {
  return (
    <div className="gt-fade-in space-y-4">
      <PipelineStages latencies={{ generateMs: m.generateLatencyMs, judgeMs: m.judgeLatencyMs }} />
      <p className="text-xs leading-relaxed text-[var(--color-fg-muted)]">
        Two independent models (an <span className="font-medium text-[var(--color-fg)]">LLM-as-a-judge</span>{" "}
        setup): the <span className="font-medium text-[var(--color-fg)]">Summarizer</span> is Google
        Gemini; the <span className="font-medium text-[var(--color-fg)]">Judge</span> is Meta Llama 3.3
        on Groq. A model checking its own work shares its own blind spots, so the Judge is a different
        model.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Tokens" value={`${m.promptTokens + m.completionTokens}`} />
        <StatCard label="Cost if GPT-4o" value={`$${m.estimatedGpt4oCostUsd.toFixed(5)}`} />
      </div>
    </div>
  );
}
