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
  return (
    <pre className="whitespace-pre-wrap rounded-lg border border-neutral-200 p-4 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const hit = active.some((h) => normalize(line).includes(h));
        return (
          <div key={i} className={hit ? "rounded bg-yellow-200 px-1" : ""}>
            {line}
          </div>
        );
      })}
    </pre>
  );
}
