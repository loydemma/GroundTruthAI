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
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-[var(--color-accent)] transition hover:underline">
        ← Analyzer
      </Link>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Meta-eval: who evaluates the evaluator?
      </h1>
      <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
        Runs the faithfulness judge against a hand-labeled golden set and reports how accurately it
        catches unsupported claims.
      </p>
      <button
        onClick={run}
        disabled={loading}
        className="mt-6 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#06222a] transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Scoring…" : "Run meta-eval"}
      </button>

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
        </div>
      )}
    </main>
  );
}
