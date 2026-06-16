"use client";
import { useState } from "react";
import Link from "next/link";

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
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-sm underline">
        ← Analyzer
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">
        Meta-eval: who evaluates the evaluator?
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Runs the faithfulness judge against a hand-labeled golden set and reports how accurately it
        catches unsupported claims.
      </p>
      <button
        onClick={run}
        disabled={loading}
        className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Scoring…" : "Run meta-eval"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {data && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {(["precision", "recall", "f1"] as const).map((k) => (
            <div key={k} className="rounded-lg border border-neutral-200 p-3">
              <div className="text-[10px] uppercase tracking-wide text-neutral-500">{k}</div>
              <div className="mt-1 font-mono text-lg">{(data.score[k] * 100).toFixed(0)}%</div>
            </div>
          ))}
          <div className="col-span-3 text-sm text-neutral-500">n = {data.n} labeled claims</div>
        </div>
      )}
    </main>
  );
}
