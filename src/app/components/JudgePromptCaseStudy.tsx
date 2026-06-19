import { Collapsible } from "./Collapsible";
import { judgePromptV1Segments, judgePromptV2Segments } from "@/lib/ui/judgePromptDiff";
import type { PromptSegment } from "@/lib/ui/promptHighlight";

function PromptText({ segments, tone }: { segments: PromptSegment[]; tone: "problem" | "added" }) {
  const mark =
    tone === "added"
      ? "rounded bg-[var(--color-grounded)]/15 px-0.5 text-[var(--color-grounded)]"
      : "rounded bg-[var(--color-flagged)]/15 px-0.5 text-[var(--color-flagged)]";
  return (
    <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--color-fg-muted)]">
      {segments.map((s, i) =>
        s.highlight ? (
          <mark key={i} className={mark}>
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </p>
  );
}

// Static home-page case study: why v1 of the Judge prompt produced false positives
// and how v2 fixed it. The prompt text comes straight from the live constants.
export function JudgePromptCaseStudy() {
  const v1 = judgePromptV1Segments();
  const v2 = judgePromptV2Segments();
  return (
    <Collapsible
      summary={
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Where the Judge got it wrong, and how I fixed it
        </span>
      }
    >
      <div className="space-y-5">
        <div className="space-y-3 text-base leading-relaxed text-[var(--color-fg-muted)]">
          <p>
            Early on, the Judge made a mistake because the prompt, the instructions sent to it, was
            too rigid. The customer said “I’ll refund one today,” the summary said “Refund one charge
            today,” and the Judge flagged it as not in the call.
          </p>
          <p>
            That’s a <span className="font-semibold text-[var(--color-fg)]">false positive</span>: a
            false alarm on something that was actually fine.
          </p>
          <p>
            The fix was to tell the Judge that rewording still counts, and to flag a claim only when
            nothing in the call backs it up. This is why it matters to not just have a judge, but to
            evaluate the prompt you send it and keep refining it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-flagged)]/30 bg-[var(--color-bg)] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-flagged)]">
              Prompt v1 <span className="font-normal text-[var(--color-fg-faint)]">before</span>
            </div>
            <PromptText segments={v1} tone="problem" />
          </div>
          <div className="rounded-xl border border-[var(--color-grounded)]/30 bg-[var(--color-bg)] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-grounded)]">
              Prompt v2 <span className="font-normal text-[var(--color-fg-faint)]">after</span>
            </div>
            <PromptText segments={v2} tone="added" />
          </div>
        </div>
      </div>
    </Collapsible>
  );
}
