# GroundTruthAI

Faithfulness checking for AI-generated call summaries.

AI summarizes customer calls well, but it can occasionally state things the call never said:
a commitment, a discount, or a decision that was never actually made. GroundTruthAI drafts the
summary and then checks every claim in it against the original transcript, flagging anything the
call doesn't support.

## How it works

1. Paste a call transcript, or load the sample call.
2. **Generate** — the AI drafts a structured summary of the call.
3. **Check** — every claim is traced back to the transcript, and any the call doesn't back up
   are flagged for review.

## Demo mode

Modern models rarely hallucinate on a clean call, which is good but makes a checker hard to show
off. Turn on **Simulate a hallucination** to plant one known false claim into the real summary and
watch the checker catch it, while leaving the genuine claims untouched. The planted claim is always
clearly labeled. It is a demonstration, never hidden.

## How accurate is the checker?

The app includes an accuracy page that scores the checker against a hand-labeled set of claims and
reports its precision, recall, and F1, so the checker's own reliability is measurable rather than
just asserted.

## Stack

Next.js (App Router), TypeScript, Tailwind, Postgres, and Google Gemini.

## Run it locally

```bash
npm install
cp .env.example .env   # add your database URL and Google API key
npm run dev
```
