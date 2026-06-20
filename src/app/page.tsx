"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SAMPLE_TRANSCRIPTS } from "@/samples/transcripts";
import { injectSimulatedClaim } from "@/lib/sim/inject";
import { MAX_TRANSCRIPT_CHARS } from "@/lib/limits";
import { SummaryGroups } from "./components/SummaryGroups";
import { CheckedSummary } from "./components/CheckedSummary";
import { Collapsible } from "./components/Collapsible";
import { JudgePromptCaseStudy } from "./components/JudgePromptCaseStudy";
import { VerdictBanner } from "./components/VerdictBanner";
import { PipelineStages } from "./components/PipelineStages";
import type { AnalysisResult, GeneratedClaim, StageMetrics } from "@/lib/types";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState<GeneratedClaim[] | null>(null);
  const [genStage, setGenStage] = useState<StageMetrics | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulate, setSimulate] = useState(false);
  const [simClaimText, setSimClaimText] = useState<string | undefined>(undefined);
  const [remaining, setRemaining] = useState<number | null>(null);
  // Synchronous lock: blocks re-entry instantly (spam-click, held Enter) before
  // the disabled-button re-render lands.
  const inFlight = useRef(false);

  // Show remaining daily tries on load without spending one.
  useEffect(() => {
    fetch("/api/summarize")
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining ?? null))
      .catch(() => {});
  }, []);

  // Editing the call invalidates any summary/result drafted from the old text.
  function changeTranscript(text: string, simulatedClaim?: string) {
    setTranscript(text);
    setSimClaimText(simulatedClaim);
    setSummary(null);
    setGenStage(null);
    setResult(null);
    setError(null);
  }

  // Step 1: the model under test drafts the summary.
  async function generate() {
    if (inFlight.current || !transcript.trim()) return;
    inFlight.current = true;
    setGenerating(true);
    setSummary(null);
    setGenStage(null);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not generate the summary");
      const claims = data.claims as GeneratedClaim[];
      if (!claims?.length) {
        setError(
          "Insufficient data to summarize. Please paste a call transcript, or click Load sample call.",
        );
        return;
      }
      setSummary(simulate ? injectSimulatedClaim(claims, simClaimText) : claims);
      setGenStage(data.generate);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the summary");
    } finally {
      setGenerating(false);
      inFlight.current = false;
    }
  }

  // Step 2: judge the summary against the call and verify the evidence.
  async function check() {
    if (inFlight.current || !summary) return;
    inFlight.current = true;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "manual", transcript, claims: summary, generate: genStage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not check the summary");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not check the summary");
    } finally {
      setChecking(false);
      inFlight.current = false;
    }
  }

  const charsLeft = MAX_TRANSCRIPT_CHARS - transcript.length;
  const overLimit = charsLeft < 0;
  const hasSimulated = !!summary?.some((c) => c.simulated);

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
          title="See how accurate the Judge is on a hand-labeled test set: precision, recall, F1."
        >
          How accurate is the Judge?
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </header>

      <section className="gt-hero mt-10 sm:mt-12">
        <p className="gt-eyebrow text-[var(--color-accent)]">
          Faithfulness check for AI call summaries
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          Catch the claims your AI summary <span className="gt-glow">made up</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-fg-muted)] sm:text-xl">
          Paste a customer call. The <span className="font-semibold text-[var(--color-fg)]">Summarizer</span>{" "}
          drafts the summary. A separate, independent model called the{" "}
          <span className="font-semibold text-[var(--color-fg)]">Judge</span> then checks every claim
          against the transcript and flags the ones the call never backed up.
        </p>

        <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-[var(--color-fg-muted)]">
          {["Add a call transcript", "Generate the summary", "Check it against the call"].map(
            (label, i) => (
              <li key={label} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden className="text-[var(--color-fg-faint)]">→</span>}
                <span className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-[var(--color-accent)]">{i + 1}</span>
                  {label}
                </span>
              </li>
            ),
          )}
        </ol>
      </section>

      <div className="mt-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <div>
          <span className="gt-step text-[var(--color-fg-muted)]">
            <span className="text-[var(--color-accent)]">1</span> · Add a call transcript
          </span>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--color-fg-muted)]">
            No transcript handy? Click{" "}
            <span className="font-semibold text-[var(--color-fg)]">Load sample call</span> below to
            drop a ready-made call into the box, or paste your own.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {SAMPLE_TRANSCRIPTS.map((s) => (
              <button
                key={s.title}
                onClick={() => changeTranscript(s.text, s.simulatedClaim)}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-3 text-base font-semibold text-[#06222a] shadow-[0_0_24px_-6px_var(--color-accent)] transition hover:bg-[var(--color-accent-strong)]"
              >
                <span aria-hidden className="text-lg leading-none">↓</span>
                Load sample call
              </button>
            ))}
            <span className="text-sm text-[var(--color-fg-faint)]">← start here</span>
          </div>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => changeTranscript(e.target.value)}
          placeholder="Paste your call transcript here, or load the sample above…"
          className="mt-4 h-44 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 font-mono text-sm text-[var(--color-fg)] outline-none transition placeholder:text-[var(--color-fg-faint)] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]"
        />
        <p
          className={`mt-2 text-right font-mono text-sm ${
            charsLeft <= 0 ? "text-[var(--color-flagged)]" : "text-[var(--color-fg-faint)]"
          }`}
        >
          {overLimit
            ? `${(-charsLeft).toLocaleString()} over the ${MAX_TRANSCRIPT_CHARS.toLocaleString()}-character max`
            : `${charsLeft.toLocaleString()} characters left · ${MAX_TRANSCRIPT_CHARS.toLocaleString()} max`}
        </p>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/5 p-4 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10">
          <input
            type="checkbox"
            checked={simulate}
            onChange={(e) => setSimulate(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
          <span>
            <span className="block text-base font-semibold text-[var(--color-fg)]">
              ★ Check this box to simulate a hallucination
            </span>
            <span className="mt-1.5 block max-w-2xl text-base leading-relaxed text-[var(--color-fg-muted)]">
              Modern AI rarely hallucinates on a clean call, which is good, but it makes a
              detector hard to prove. So plant a known false claim and watch the Judge catch
              it. In short: inject a known defect to prove it works.
            </span>
          </span>
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={generate}
            disabled={generating || checking || !transcript.trim() || overLimit}
            className="rounded-xl bg-[var(--color-accent)] px-5 py-3 text-base font-semibold text-[#06222a] transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {generating ? "Generating summary…" : summary ? "Regenerate summary" : "2. Generate summary"}
          </button>
          {generating && <PipelineStages loading />}
          {remaining !== null && (
            <span className="ml-auto font-mono text-sm text-[var(--color-fg-faint)]">
              {remaining} {remaining === 1 ? "try" : "tries"} left today
            </span>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-[var(--color-flagged)]/40 bg-[var(--color-flagged-bg)] px-3 py-2 text-sm text-[var(--color-flagged)]">
          {error}
        </p>
      )}

      {summary && !result && (
        <div className="gt-fade-in mt-8 space-y-4">
          <span className="block gt-step text-[var(--color-fg-muted)]">
            AI summary
            <span className="text-[var(--color-fg-faint)]">
              {" · "}
              {summary.length} {summary.length === 1 ? "claim" : "claims"}
            </span>
            {hasSimulated && <span className="text-[var(--color-partial)]"> · 1 planted</span>}
          </span>

          <Collapsible summary="How does the Judge work?">
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-fg-muted)]">
              The <span className="font-semibold text-[var(--color-fg)]">Summarizer</span>{" "}
              (Google&apos;s Gemini) drafted this. A different, independent model — the{" "}
              <span className="font-semibold text-[var(--color-fg)]">Judge</span> (Meta&apos;s Llama
              3.3, via Groq) — now checks every line against the call. Two models on purpose: an AI
              grading its own work shares its own blind spots, so a separate model does the checking.
            </p>
          </Collapsible>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <SummaryGroups claims={summary} />
          </div>

          {hasSimulated && (
            <p className="text-sm text-[var(--color-fg-faint)]">
              The Judge hasn&apos;t been told which one is planted.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={check}
              disabled={checking || generating}
              className="rounded-xl bg-[var(--color-accent)] px-5 py-3 text-base font-semibold text-[#06222a] shadow-[0_0_24px_-6px_var(--color-accent)] transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {checking
                ? "Checking…"
                : hasSimulated
                  ? "Run the Judge → catch the plant"
                  : "Run the Judge →"}
            </button>
            {checking && <PipelineStages loading />}
          </div>
        </div>
      )}

      {result && (
        <div className="gt-fade-in mt-8 space-y-5">
          <VerdictBanner claims={result.claims} />
          <Collapsible
            summary={
              <span className="gt-eyebrow text-[var(--color-accent)]">
                All {result.claims.length} statements from the call
              </span>
            }
          >
            <CheckedSummary claims={result.claims} />
          </Collapsible>
          <JudgePromptCaseStudy />
          <Link
            href="/golden"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-3 text-base font-semibold text-[#06222a] transition hover:bg-[var(--color-accent-strong)]"
          >
            See the Judge&apos;s accuracy
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </main>
  );
}
