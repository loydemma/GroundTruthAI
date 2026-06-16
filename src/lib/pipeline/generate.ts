import type { ModelClient, ModelResponse } from "../model/client";
import type { GeneratedClaim } from "../types";

export const GENERATE_PROMPT = `You analyze a customer-call transcript. Extract a structured summary as a JSON object with a "claims" array. Each claim: { "text": string, "type": "summary" | "action_item" | "commitment" | "decision" }. Cover the key summary points, action items, commitments the customer or rep made, and decisions. Output ONLY JSON.`;

export function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : text).trim();
}

export async function generateClaims(
  client: ModelClient,
  transcript: string
): Promise<{ claims: GeneratedClaim[]; response: ModelResponse }> {
  const prompt = `${GENERATE_PROMPT}\n\nTRANSCRIPT:\n${transcript}`;
  const response = await client.complete(prompt, { temperature: 0 });
  const parsed = JSON.parse(extractJson(response.text)) as { claims: GeneratedClaim[] };
  return { claims: parsed.claims ?? [], response };
}
