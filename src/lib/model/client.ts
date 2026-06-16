import { GoogleGenAI } from "@google/genai";

export interface ModelResponse {
  text: string;
  promptTokens: number;
  completionTokens: number;
}

export interface ModelClient {
  complete(prompt: string, opts?: { temperature?: number }): Promise<ModelResponse>;
}

// Model name is NEVER hardcoded — read from env per ~/CLAUDE.md.
export const MODEL_NAME = process.env.MODEL_NAME ?? "gemini-2.5-flash";

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
