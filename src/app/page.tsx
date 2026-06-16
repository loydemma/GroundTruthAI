"use client";
import { useState } from "react";
import Link from "next/link";
import { SAMPLE_TRANSCRIPTS } from "@/samples/transcripts";
import { MetricsPanel } from "./components/MetricsPanel";
import { ClaimList } from "./components/ClaimList";
import { TranscriptPane } from "./components/TranscriptPane";
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
    <main className="mx-auto max-w-6xl p-6">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GroundTruthAI</h1>
          <p className="text-sm text-neutral-600">
            Summarize a customer call — and catch the AI when it invents a claim.
          </p>
        </div>
        <Link href="/golden" className="text-sm underline">
          Meta-eval →
        </Link>
      </header>

      <div className="mt-5 flex flex-wrap gap-2">
        {SAMPLE_TRANSCRIPTS.map((s) => (
          <button
            key={s.title}
            onClick={() => setTranscript(s.text)}
            className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100"
          >
            {s.title}
          </button>
        ))}
      </div>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste a customer-call transcript…"
        className="mt-3 h-40 w-full rounded-lg border border-neutral-300 p-3 font-mono text-sm"
      />
      <button
        onClick={analyze}
        disabled={loading || !transcript.trim()}
        className="mt-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Analyzing…" : "Analyze"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
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
