import { normalize } from "@/lib/pipeline/verify";

export function TranscriptPane({
  transcript,
  highlights,
}: {
  transcript: string;
  highlights: string[];
}) {
  const active = highlights.map(normalize).filter((h) => h.length > 0);
  const lines = transcript.split("\n");
  const anyHit = lines.some((line) => active.some((h) => normalize(line).includes(h)));
  const showNoEvidence = active.length > 0 && !anyHit;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
      {showNoEvidence && (
        <div className="m-2 rounded-lg border border-[var(--color-flagged)]/40 bg-[var(--color-flagged-bg)] px-3 py-2 text-xs text-[var(--color-flagged)]">
          ⚑ No matching evidence for this claim in the transcript.
        </div>
      )}
      <pre className="whitespace-pre-wrap p-3 font-mono text-sm leading-relaxed text-[var(--color-fg-muted)]">
        {lines.map((line, i) => {
          const hit = active.some((h) => normalize(line).includes(h));
          return (
            <div
              key={i}
              className={
                hit
                  ? "gt-fade-in rounded border-l-2 border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 text-[var(--color-fg)]"
                  : "px-2"
              }
            >
              {line}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
