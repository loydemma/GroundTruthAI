export type HighlightKind = "problem" | "added" | "security";

export interface PromptSegment {
  text: string;
  kind: HighlightKind | null;
}

export interface PhraseGroup {
  phrases: string[];
  kind: HighlightKind;
}

// Splits `text` into segments, tagging each given phrase with its group's kind so
// the UI can color different changes differently (e.g. the meaning fix vs. the
// security hardening). The segments always concatenate back to the original text,
// so the displayed prompt cannot drift from its source. Throws if a phrase is
// absent — a changed prompt fails loudly instead of silently rendering the wrong
// highlight. Phrases must not overlap.
export function markPhrases(text: string, groups: PhraseGroup[]): PromptSegment[] {
  const ranges = groups.flatMap((g) =>
    g.phrases.map((p) => {
      const start = text.indexOf(p);
      if (start === -1) throw new Error(`phrase not found in prompt: ${p}`);
      return { start, end: start + p.length, kind: g.kind };
    }),
  );
  ranges.sort((a, b) => a.start - b.start);

  const segments: PromptSegment[] = [];
  let cursor = 0;
  for (const { start, end, kind } of ranges) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), kind: null });
    segments.push({ text: text.slice(start, end), kind });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), kind: null });
  return segments;
}
