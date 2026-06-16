# GroundTruthAI

Faithfulness checking for AI-generated call summaries.

LLMs summarize customer calls well enough, but they occasionally assert things that were never said
(a commitment, a discount, a decision). This tool generates the summary and then checks each claim
in it against the source transcript, marking anything it can't substantiate.

## Pipeline

1. **Generate** — the model returns a structured summary: key points, action items, commitments,
   decisions.
2. **Judge** — a second pass rates each claim (`supported` / `partially` / `unsupported`) and returns
   the transcript spans it relied on.
3. **Verify** — the cited spans are matched back against the transcript in code. A claim the judge
   marked "supported" but whose evidence isn't actually present is downgraded; this catches the judge
   fabricating its own citations.
4. **Route** — unsupported, unverified, or low-confidence claims are surfaced for review.

Each run records latency per stage, token usage, and an estimated cost. `/golden` runs the judge over
a hand-labeled set and reports precision/recall so the judge's accuracy is itself measurable.

## Design notes

The judge-plus-verification step is deliberate. LLM-as-judge on its own is the usual approach and
generalizes to most tasks, but it can't detect its own errors. Transcripts are close to verbatim, so
supporting evidence is normally present as a near-exact span and is cheap to confirm in code. The
verification layer is specific to that property and wouldn't transfer to free-form RAG.

The model sits behind a `ModelClient` interface and is selected by the `MODEL_NAME` env var. The
pipeline is otherwise pure, so it's tested with a fake client and no network access.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind, Drizzle + Neon Postgres, Gemini 2.5 Flash, Vitest.

## Development

```bash
npm install
cp .env.example .env        # set DATABASE_URL and GOOGLE_API_KEY
npx drizzle-kit push        # create tables
npm run dev
```

```bash
npm test
npm run build
```

## Environment

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `GOOGLE_API_KEY` | Google AI Studio key |
| `MODEL_NAME` | Model id, e.g. `gemini-2.5-flash` |
