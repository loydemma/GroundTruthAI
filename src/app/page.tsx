"use client";
import { useState } from "react";
import Link from "next/link";
import { SAMPLE_TRANSCRIPTS } from "@/samples/transcripts";
import { MetricsPanel } from "./components/MetricsPanel";
import { ClaimList } from "./components/ClaimList";
import { TranscriptPane } from "./components/TranscriptPane";
import { VerdictBanner } from "./components/VerdictBanner";
import { PipelineStages } from "./components/PipelineStages";
import type { AnalysisResult, VerifiedClaim } from "@/lib/types";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selected, setSelected] = useState<VerifiedClaim | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setSelected(null);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "manual", transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent)]" />
            GroundTruthAI
          </h1>
          <p className="mt-2 max-w-prose text-sm text-[var(--color-fg-muted)] sm:text-base">
            Summarize a customer call, then catch the AI when it invents a claim.
          </p>
        </div>
        <Link
          href="/golden"
          className="self-start rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition hover:border-[var(--color-accent)] sm:self-auto"
        >
          Meta-eval →
        </Link>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        {SAMPLE_TRANSCRIPTS.map((s) => (
          <button
            key={s.title}
            onClick={() => setTranscript(s.text)}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-fg-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-fg)]"
          >
            {s.title}
          </button>
        ))}
      </div>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste a customer-call transcript…"
        className="mt-4 h-44 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-mono text-sm text-[var(--color-fg)] outline-none transition placeholder:text-[var(--color-fg-faint)] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={analyze}
          disabled={loading || !transcript.trim()}
          className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#06222a] transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
        {loading && <PipelineStages loading />}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-[var(--color-flagged)]/40 bg-[var(--color-flagged-bg)] px-3 py-2 text-sm text-[var(--color-flagged)]">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <VerdictBanner claims={result.claims} />
          <MetricsPanel m={result.metrics} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TranscriptPane transcript={transcript} highlights={selected?.citedSpans ?? []} />
            <ClaimList claims={result.claims} selected={selected} onSelect={setSelected} />
          </div>
        </div>
      )}
    </main>
  );
}
