import type { ModelResponse } from "./types";

type CacheEntry = {
  expiresAt: number;
  response: ModelResponse;
};

const DEFAULT_TTL_MS = 10 * 60 * 1000;

export class PromptCache {
  private readonly entries = new Map<string, CacheEntry>();

  get(key: string) {
    const entry = this.entries.get(key);
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      this.entries.delete(key);
      return null;
    }

    return {
      ...entry.response,
      cached: true,
    };
  }

  set(key: string, response: ModelResponse, ttlMs = DEFAULT_TTL_MS) {
    this.entries.set(key, {
      expiresAt: Date.now() + ttlMs,
      response,
    });
  }
}

export const promptCache = new PromptCache();
