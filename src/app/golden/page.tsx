"use client";
import { useState } from "react";
import Link from "next/link";
import { Collapsible } from "../components/Collapsible";
import type { GoldenEvaluation, GoldenItemResult } from "@/lib/golden/evaluate";

function verdictLabel(unsupported: boolean) {
  return unsupported ? (
    <span className="font-medium text-[var(--color-flagged)]">Made up</span>
  ) : (
    <span className="font-medium text-[var(--color-grounded)]">Real</span>
  );
}

// One transcript per scenario, in first-seen order, for the expandable list.
function transcriptsByScenario(items: GoldenItemResult[]) {
  const seen = new Map<string, string>();
  for (const it of items) if (!seen.has(it.scenario)) seen.set(it.scenario, it.transcript);
  return [...seen.entries()].map(([scenario, transcript]) => ({ scenario, transcript }));
}

export default function GoldenPage() {
  const [data, setData] = useState<GoldenEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/golden");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "The check failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The check failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
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
          How often is the judge <span className="gt-glow">right</span>?
        </h1>
        <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-[var(--color-fg-muted)] sm:text-lg">
          <p>
            Normal software is predictable. The same input always gives the same output, so you
            can test it. AI is not. Ask it the same question twice and you can get two different
            answers, which makes it hard to trust.
          </p>
          <p>
            A <span className="font-semibold text-[var(--color-fg)]">golden set</span> is how
            teams test AI anyway. It is a fixed set of example inputs, each paired with the answer
            we expect and the rule for judging a response. You run the AI against the set and
            measure how often it gets it right.
          </p>
          <p>
            That is what this page does for the judge. We wrote three support calls with claims we
            already know the answer for, most of them built to trip it up, and the judge has no
            idea which is which. Press the button and see how it does.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="mt-8 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#06222a] transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Grading the judge…" : "Grade the judge"}
        </button>
      </section>

      {error && (
        <p className="mt-4 rounded-lg border border-[var(--color-flagged)]/40 bg-[var(--color-flagged-bg)] px-3 py-2 text-sm text-[var(--color-flagged)]">
          {error}
        </p>
      )}

      {data && (
        <div className="gt-fade-in mt-8 space-y-6">
          <div className="rounded-2xl border border-[var(--color-grounded)]/40 bg-[var(--color-grounded-bg)] p-5 sm:p-6">
            <div className="text-xl font-semibold tracking-tight text-[var(--color-grounded)] sm:text-2xl">
              The judge got {data.correctCount} of {data.total} right.
            </div>
            <p className="mt-1.5 text-base text-[var(--color-fg-muted)]">
              It caught {data.score.tp} of {data.score.tp + data.score.fn} made-up claims, and
              correctly cleared {data.score.tn} of {data.score.tn + data.score.fp} real ones.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              Every case, and how the judge ruled
            </h2>
            <p className="mt-1.5 max-w-2xl text-base text-[var(--color-fg-muted)]">
              The judge saw only the call and the claim. It was never told which claims we planted
              or what the right answer was.
            </p>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--color-border)]">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[11px] uppercase tracking-wider text-[var(--color-fg-muted)]">
                    <th className="px-3 py-2.5 font-semibold">Call</th>
                    <th className="px-3 py-2.5 font-semibold">The claim</th>
                    <th className="px-3 py-2.5 font-semibold">Why it&apos;s a trap</th>
                    <th className="px-3 py-2.5 font-semibold">Should be</th>
                    <th className="px-3 py-2.5 font-semibold">Judge said</th>
                    <th className="px-3 py-2.5 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((it, i) => (
                    <tr
                      key={i}
                      className={`border-b border-[var(--color-border)] align-top last:border-0 ${
                        it.correct ? "" : "bg-[var(--color-flagged-bg)]"
                      }`}
                    >
                      <td className="whitespace-nowrap px-3 py-3 text-[var(--color-fg-muted)]">
                        {it.scenario}
                      </td>
                      <td className="px-3 py-3 font-medium text-[var(--color-fg)]">
                        {it.claimText}
                      </td>
                      <td className="px-3 py-3 text-[var(--color-fg-muted)]">{it.whyTrap}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {verdictLabel(it.expectedUnsupported)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {verdictLabel(it.predictedUnsupported)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {it.correct ? (
                          <span className="font-semibold text-[var(--color-grounded)]">✓</span>
                        ) : (
                          <span className="font-semibold text-[var(--color-flagged)]">✗ missed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Collapsible summary="Read the 3 call transcripts">
            <div className="space-y-4">
              {transcriptsByScenario(data.items).map((g) => (
                <div key={g.scenario}>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                    {g.scenario}
                  </div>
                  <pre className="mt-1.5 whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--color-fg)]">
                    {g.transcript}
                  </pre>
                </div>
              ))}
            </div>
          </Collapsible>
        </div>
      )}
    </main>
  );
}
