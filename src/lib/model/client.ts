import { GoogleGenAI } from "@google/genai";

export interface ModelResponse {
  text: string;
  promptTokens: number;
  completionTokens: number;
}

export interface ModelClient {
  complete(prompt: string, opts?: { temperature?: number }): Promise<ModelResponse>;
}

// Model names are NEVER hardcoded — read from env per ~/CLAUDE.md.
// The Summarizer (drafts the call summary) and the Judge (checks it) are
// deliberately DIFFERENT models so the Judge is independent of the work it grades.
export const MODEL_NAME = process.env.MODEL_NAME ?? "gemini-2.5-flash";
export const JUDGE_MODEL_NAME = process.env.JUDGE_MODEL_NAME ?? "llama-3.3-70b-versatile";

export class GeminiClient implements ModelClient {
  private ai: GoogleGenAI;
  constructor(apiKey: string = process.env.GOOGLE_API_KEY ?? "") {
    this.ai = new GoogleGenAI({ apiKey });
  }
  async complete(prompt: string, opts?: { temperature?: number }): Promise<ModelResponse> {
    const res = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { temperature: opts?.temperature ?? 0 },
    });
    const usage = res.usageMetadata;
    return {
      text: res.text ?? "",
      promptTokens: usage?.promptTokenCount ?? 0,
      completionTokens: usage?.candidatesTokenCount ?? 0,
    };
  }
}

interface GroqChatResponse {
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

// The Judge runs on Groq's free tier (OpenAI-compatible API) so it is a model
// independent of the Gemini Summarizer it grades. Plain fetch — no extra SDK.
export class GroqClient implements ModelClient {
  constructor(
    private apiKey: string = process.env.GROQ_API_KEY ?? "",
    private model: string = JUDGE_MODEL_NAME
  ) {}
  async complete(prompt: string, opts?: { temperature?: number }): Promise<ModelResponse> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: opts?.temperature ?? 0,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      const err = new Error(`Groq request failed (${res.status}): ${body}`) as Error & {
        status?: number;
      };
      err.status = res.status;
      throw err;
    }
    const data = (await res.json()) as GroqChatResponse;
    return {
      text: data.choices?.[0]?.message?.content ?? "",
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
    };
  }
}
