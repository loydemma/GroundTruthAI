import type { ModelClient, ModelResponse } from "./client";

export class FakeModelClient implements ModelClient {
  prompts: string[] = [];
  private queue: string[];
  constructor(responses: string[]) {
    this.queue = [...responses];
  }
  async complete(prompt: string): Promise<ModelResponse> {
    this.prompts.push(prompt);
    const text = this.queue.shift() ?? "";
    return { text, promptTokens: prompt.length, completionTokens: text.length };
  }
}
