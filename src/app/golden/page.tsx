"use client";
import { useState } from "react";
import Link from "next/link";
import { StatCard } from "../components/StatCard";

export default function GoldenPage() {
  const [data, setData] = useState<{
    score: { precision: number; recall: number; f1: number };
    n: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/golden");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Meta-eval failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Meta-eval failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight sm:text-base">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent)]" />
          GroundTruthAI
        </div>
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-accent)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/20"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Analyzer
        </Link>
      </header>

      <section className="gt-hero mt-12 sm:mt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Who checks the checker?
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          How often is the checker <span className="gt-glow">right</span>?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-fg-muted)] sm:text-lg">
          The analyzer flags claims an AI summary made up. This runs that same judge against a
          hand-labeled set of calls, where we already know which claims hold up, and scores how
          closely it agrees.
        </p>
        <button
          onClick={run}
          disabled={loading}
          className="mt-8 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#06222a] transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Scoring…" : "Run meta-eval"}
        </button>
      </section>

      {error && (
        <p className="mt-4 rounded-lg border border-[var(--color-flagged)]/40 bg-[var(--color-flagged-bg)] px-3 py-2 text-sm text-[var(--color-flagged)]">
          {error}
        </p>
      )}

      {data && (
        <div className="gt-fade-in mt-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Precision"
              value={`${(data.score.precision * 100).toFixed(0)}%`}
              tone="accent"
              bar={data.score.precision}
            />
            <StatCard
              label="Recall"
              value={`${(data.score.recall * 100).toFixed(0)}%`}
              tone="accent"
              bar={data.score.recall}
            />
            <StatCard
              label="F1"
              value={`${(data.score.f1 * 100).toFixed(0)}%`}
              tone="accent"
              bar={data.score.f1}
            />
          </div>
          <div className="font-mono text-sm text-[var(--color-fg-faint)]">
            n = {data.n} labeled claims
          </div>
          <dl className="space-y-1.5 pt-2 text-sm text-[var(--color-fg-muted)]">
            <div>
              <span className="font-semibold text-[var(--color-fg)]">Precision</span> — when it
              flags a claim, how often that claim really was unsupported.
            </div>
            <div>
              <span className="font-semibold text-[var(--color-fg)]">Recall</span> — of the claims
              it should have flagged, how many it caught.
            </div>
            <div>
              <span className="font-semibold text-[var(--color-fg)]">F1</span> — the balance between
              the two.
            </div>
          </dl>
        </div>
      )}
    </main>
  );
}
