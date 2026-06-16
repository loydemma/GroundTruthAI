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

  // Lead with the hallucination-bait sample — it's the demo that proves the point.
  const orderedSamples = [...SAMPLE_TRANSCRIPTS].sort(
    (a, b) =>
      Number(b.title.toLowerCase().includes("bait")) -
      Number(a.title.toLowerCase().includes("bait")),
  );

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
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight sm:text-base">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent)]" />
          GroundTruthAI
        </div>
        <Link
          href="/golden"
          className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-accent)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/20"
          title="See the checker scored against a hand-labeled set: precision, recall, F1."
        >
          How accurate is it?
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </header>

      <section className="gt-hero mt-10 sm:mt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Faithfulness check for AI call summaries
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          Catch the claims your AI summary <span className="gt-glow">made up</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-fg-muted)] sm:text-lg">
          Paste a customer call. GroundTruthAI drafts the summary, then checks every claim
          against the transcript and flags the ones the call never backed up.
        </p>

        <ol className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--color-fg-muted)]">
          {["Paste or pick a call", "AI writes the summary", "We verify each claim"].map(
            (label, i) => (
              <li key={label} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden className="text-[var(--color-fg-faint)]">→</span>}
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[var(--color-accent)]">{i + 1}</span>
                  {label}
                </span>
              </li>
            ),
          )}
        </ol>
      </section>

      <div className="mt-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
            Try a sample
          </span>
          <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
            Pick a call and hit Analyze. Start with the hallucination-bait call: it&apos;s vague
            enough that the AI tends to overstate it, so you can watch the checker catch the
            invented claim.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {orderedSamples.map((s) => {
              const isBait = s.title.toLowerCase().includes("bait");
              return (
                <button
                  key={s.title}
                  onClick={() => setTranscript(s.text)}
                  className={
                    isBait
                      ? "rounded-full bg-[var(--color-accent)] px-3.5 py-1.5 text-sm font-semibold text-[#06222a] transition hover:bg-[var(--color-accent-strong)]"
                      : "rounded-full border border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 px-3.5 py-1.5 text-sm font-medium text-[var(--color-accent)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/20"
                  }
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste a customer-call transcript…"
          className="mt-4 h-44 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 font-mono text-sm text-[var(--color-fg)] outline-none transition placeholder:text-[var(--color-fg-faint)] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={analyze}
            disabled={loading || !transcript.trim()}
            className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#06222a] transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Analyzing…" : "Analyze the summary"}
          </button>
          {loading && <PipelineStages loading />}
        </div>
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
          <Link
            href="/golden"
            className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 px-4 py-3 text-sm transition hover:bg-[var(--color-accent)]/10"
          >
            <span className="text-[var(--color-fg)]">
              But can you trust the checker itself? See its precision, recall, and F1 on a
              hand-labeled set.
            </span>
            <span
              aria-hidden
              className="text-[var(--color-accent)] transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      )}
    </main>
  );
}
