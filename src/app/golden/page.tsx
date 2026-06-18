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

export default function GoldenPage() {
  const [data, setData] = useState<GoldenEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openRows, setOpenRows] = useState<Set<number>>(new Set());

  function toggleRow(i: number) {
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function run() {
    setLoading(true);
    setError(null);
    setOpenRows(new Set());
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
          Check a call
        </Link>
      </header>

      <section className="gt-hero mt-12 sm:mt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Who checks the Judge?
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          How often is the Judge <span className="gt-glow">right</span>?
        </h1>
        <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-[var(--color-fg-muted)] sm:text-lg">
          <p>
            Normal software is{" "}
            <span className="font-semibold text-[var(--color-fg)]">deterministic</span>: the same
            input always gives the same output, so you can test it. AI is{" "}
            <span className="font-semibold text-[var(--color-fg)]">non-deterministic</span>. Ask it
            the same question twice and you can get two different answers, which makes it hard to
            trust.
          </p>
          <p>
            A <span className="font-semibold text-[var(--color-fg)]">golden set</span> is how teams
            test AI: a fixed set of inputs, each paired with the answer we expect and the rule for
            judging a response. You run the AI against it and measure how often it gets it right.
          </p>
          <p>
            That is what this page does for the{" "}
            <span className="font-semibold text-[var(--color-fg)]">Judge</span>. The Judge (Meta&apos;s
            Llama 3.3, via Groq) is a different model from the one that writes the summaries (Gemini),
            because the right way to grade an AI is with an independent one. This golden set has three
            support calls and five claims I already know the verdict for, most built to trip it up, and
            the Judge has no idea which is which. Press the button and see how it does.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="mt-8 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#06222a] transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Grading the Judge…" : "Grade the Judge"}
        </button>
      </section>

      <section className="mt-12 sm:mt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          The mechanics
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          What happens when you press the button
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-fg-muted)] sm:text-lg">
          The Judge reads five claims taken from three real support calls. Some claims are true to the
          call, some are made up. I already know the right answer for each, so the page can show how
          many the Judge got right.
        </p>
        <div className="mt-5 max-w-2xl">
          <Collapsible summary="Under the hood (for the curious)">
            <ol className="space-y-3 text-sm leading-relaxed text-[var(--color-fg-muted)]">
              <li>
                <span className="font-semibold text-[var(--color-fg)]">1. Every click starts
                fresh.</span> The request is force-dynamic with no caching, so each press re-runs the
                whole set. The score is for that run, not a saved result.
              </li>
              <li>
                <span className="font-semibold text-[var(--color-fg)]">2. The set is 3 calls and 5
                claims:</span> Double charge (2 claims, 1 real and 1 made-up), Login help (2 claims, 1
                real and 1 made-up), and Cancellation (1 made-up claim). Each claim has a hidden right
                answer labeled ahead of time.
              </li>
              <li>
                <span className="font-semibold text-[var(--color-fg)]">3. One request to the
                Judge.</span> All 5 claims and their transcripts are bundled into a single prompt and
                sent to the Judge (Meta&apos;s Llama 3.3, via Groq) in one call. It sees only each call
                and its claim, never the right answers.
              </li>
              <li>
                <span className="font-semibold text-[var(--color-fg)]">4. A verdict per claim.</span>{" "}
                The Judge returns supported, partially, or unsupported for each of the 5 claims.
              </li>
              <li>
                <span className="font-semibold text-[var(--color-fg)]">5. Compare and score.</span> A
                scoring function checks each verdict against the hidden right answer and tallies how
                many of the 5 it got right, plus precision, recall, and F1.
              </li>
            </ol>
          </Collapsible>
        </div>
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
              The Judge got {data.correctCount} of {data.total} right.
            </div>
            <p className="mt-1.5 text-base text-[var(--color-fg-muted)]">
              It caught {data.score.tp} of {data.score.tp + data.score.fn} made-up claims, and
              correctly cleared {data.score.tn} of {data.score.tn + data.score.fp} real ones.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              Every case, and how the Judge ruled
            </h2>
            <p className="mt-1.5 max-w-2xl text-base text-[var(--color-fg-muted)]">
              The Judge saw only the call and the claim. It was never told which claims we planted
              or what the right answer was. Click any row to read the full call it judged.
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
                  {data.items.map((it: GoldenItemResult, i) => {
                    const open = openRows.has(i);
                    return (
                      <FragmentRow
                        key={i}
                        it={it}
                        i={i}
                        open={open}
                        onToggle={() => toggleRow(i)}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FragmentRow({
  it,
  i,
  open,
  onToggle,
}: {
  it: GoldenItemResult;
  i: number;
  open: boolean;
  onToggle: () => void;
}) {
  const tone = it.correct ? "" : "bg-[var(--color-flagged-bg)]";
  return (
    <>
      <tr className={`border-b border-[var(--color-border)] align-top ${open ? "" : "last:border-0"} ${tone}`}>
        <td className="whitespace-nowrap px-3 py-3 text-[var(--color-fg-muted)]">
          <button
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={`transcript-${i}`}
            className="flex items-center gap-1.5 text-left transition hover:text-[var(--color-fg)]"
          >
            <span
              aria-hidden
              className={`text-[var(--color-fg-faint)] transition-transform ${open ? "rotate-90" : ""}`}
            >
              ▸
            </span>
            {it.scenario}
          </button>
        </td>
        <td className="px-3 py-3 font-medium text-[var(--color-fg)]">{it.claimText}</td>
        <td className="px-3 py-3 text-[var(--color-fg-muted)]">{it.whyTrap}</td>
        <td className="whitespace-nowrap px-3 py-3">{verdictLabel(it.expectedUnsupported)}</td>
        <td className="whitespace-nowrap px-3 py-3">{verdictLabel(it.predictedUnsupported)}</td>
        <td className="whitespace-nowrap px-3 py-3">
          {it.correct ? (
            <span className="font-semibold text-[var(--color-grounded)]">✓</span>
          ) : (
            <span className="font-semibold text-[var(--color-flagged)]">✗ missed</span>
          )}
        </td>
      </tr>
      {open && (
        <tr id={`transcript-${i}`} className={`border-b border-[var(--color-border)] last:border-0 ${tone}`}>
          <td colSpan={6} className="px-3 pb-4 pt-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              {it.scenario} — full call the Judge saw
            </div>
            <pre className="mt-1.5 whitespace-pre-wrap font-mono text-sm leading-relaxed text-[var(--color-fg)]">
              {it.transcript}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}
