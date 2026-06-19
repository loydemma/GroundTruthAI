export interface PromptSegment {
  text: string;
  highlight: boolean;
}

// Splits `text` into segments, marking each given phrase as highlighted so the UI
// can call out the parts of a prompt that matter. The segments always concatenate
// back to the original text, so the displayed prompt cannot drift from its source.
// Throws if a phrase is absent — a changed prompt fails loudly instead of silently
// rendering the wrong highlight. Phrases must not overlap.
export function markPhrases(text: string, phrases: string[]): PromptSegment[] {
  const ranges = phrases.map((p) => {
    const start = text.indexOf(p);
    if (start === -1) throw new Error(`phrase not found in prompt: ${p}`);
    return { start, end: start + p.length };
  });
  ranges.sort((a, b) => a.start - b.start);

  const segments: PromptSegment[] = [];
  let cursor = 0;
  for (const { start, end } of ranges) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), highlight: false });
    segments.push({ text: text.slice(start, end), highlight: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), highlight: false });
  return segments;
}
