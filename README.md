# GroundTruthAI

Faithfulness checking for AI-generated call summaries.

AI summarizes customer calls well, but it can occasionally state things the call never said:
a commitment, a discount, or a decision that was never actually made. GroundTruthAI drafts the
summary and then checks every claim in it against the original transcript, flagging anything the
call doesn't support.

## How it works

GroundTruthAI uses two independent AI models — the standard **LLM-as-a-judge** pattern:

1. Paste a call transcript, or load the sample call.
2. **Summarizer** — one model drafts a structured summary of the call.
3. **Judge** — a *different, independent* model traces every claim back to the transcript and
   flags any the call doesn't back up.

Using a second, separate model is deliberate: an AI grading its own work shares its own blind
spots, so a different model does the checking.

## Demo mode

Modern models rarely hallucinate on a clean call, which is good but makes a checker hard to show
off. Turn on **Simulate a hallucination** to plant one known false claim into the real summary and
watch the Judge catch it, while leaving the genuine claims untouched. The planted claim is always
clearly labeled. It is a demonstration, never hidden.

## How accurate is the Judge?

The app includes an accuracy page that scores the Judge against a hand-labeled set of claims and
reports its precision, recall, and F1, so the Judge's own reliability is measurable rather than
just asserted.

## Stack

Next.js (App Router), TypeScript, Tailwind, and Postgres. Two model providers: Google Gemini
(Summarizer) and Meta Llama 3.3 via Groq (Judge).

## Run it locally

```bash
npm install
cp .env.example .env   # add your database URL and the two model API keys
npm run dev
```
