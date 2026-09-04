/**
 * Shared "call an external provider with a real per-attempt timeout and a
 * bounded retry on transient failures" helper — the idiom ai-v12 already
 * used ad hoc in a few places (`AbortSignal.any([signal, AbortSignal.timeout(ms)])`)
 * factored out so OpenAI, Higgsfield and Cloudinary calls all retry the same way
 * instead of each hand-rolling it (or not retrying at all).
 *
 * Retries on:
 *  - network-level failures that fail fast (DNS, connection reset, etc.)
 *  - retryable HTTP statuses (429 and 5xx by default), which also fail fast
 *  - a per-attempt timeout, but ONLY when `retryOnTimeout` is explicitly
 *    opted into — retrying a request that already used its whole timeout
 *    budget can multiply total latency by `maxAttempts`, which is fine for
 *    a 15-30s poll/upload call but can blow well past a route's own overall
 *    time budget for a multi-minute generation call. Default: off.
 *
 * Never retries once the caller's own `signal` aborts (a real cancellation,
 * e.g. the user stopped generation) — that always propagates immediately.
 *
 * On success (or a non-retryable failure status), returns the `Response` as
 * normal so existing `if (!response.ok)` call sites need no other changes.
 * Only throws once every attempt has failed at the network/timeout level.
 */

const DEFAULT_RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export interface FetchWithRetryOptions {
  /** Per-attempt timeout in ms. A fresh timeout is used for every retry. */
  timeoutMs: number;
  /** Caller's own cancellation signal. Aborting this always wins — no retry. */
  signal?: AbortSignal;
  /** Total attempts including the first. Default 3. */
  maxAttempts?: number;
  /** Base backoff delay in ms; doubles each retry with jitter. Default 400. */
  baseDelayMs?: number;
  /** HTTP statuses worth retrying. Default: 408, 429, 500, 502, 503, 504. */
  retryableStatuses?: Set<number>;
  /**
   * Retry when an attempt hits its own per-attempt timeout. Off by default
   * — only enable this for short (a few seconds to ~30s) timeouts, never for
   * multi-minute generation calls (see file doc comment above).
   */
  retryOnTimeout?: boolean;
  /** Called before each retry (not on the first attempt). */
  onRetry?: (attempt: number, reason: string) => void;
}

function isCallerAbort(error: unknown, callerSignal?: AbortSignal) {
  const looksLikeAbort =
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError");
  return looksLikeAbort && Boolean(callerSignal?.aborted);
}

function isOwnTimeout(error: unknown, callerSignal?: AbortSignal) {
  const looksLikeAbort =
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError");
  return looksLikeAbort && !callerSignal?.aborted;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: FetchWithRetryOptions,
): Promise<Response> {
  const {
    timeoutMs,
    signal: callerSignal,
    maxAttempts = 3,
    baseDelayMs = 400,
    retryableStatuses = DEFAULT_RETRYABLE_STATUSES,
    retryOnTimeout = false,
    onRetry,
  } = options;

  let lastError: unknown;
  let lastResponse: Response | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (callerSignal?.aborted) {
      throw lastError instanceof Error ? lastError : new DOMException("Aborted", "AbortError");
    }

    const attemptSignal = callerSignal
      ? AbortSignal.any([callerSignal, AbortSignal.timeout(timeoutMs)])
      : AbortSignal.timeout(timeoutMs);

    try {
      const response = await fetch(url, { ...init, signal: attemptSignal });

      if (response.ok || !retryableStatuses.has(response.status) || attempt === maxAttempts) {
        return response;
      }

      lastResponse = response;
      onRetry?.(attempt, `HTTP ${response.status}`);
    } catch (error) {
      if (isCallerAbort(error, callerSignal)) throw error;
      if (isOwnTimeout(error, callerSignal) && !retryOnTimeout) throw error;

      lastError = error;
      if (attempt === maxAttempts) {
        throw error instanceof Error
          ? error
          : new Error(`Request to ${url} failed after ${maxAttempts} attempts.`);
      }

      onRetry?.(attempt, error instanceof Error ? error.message : "network error");
    }

    await delay(baseDelayMs * 2 ** (attempt - 1) + Math.random() * 150);
  }

  // Unreachable in practice (the loop always returns or throws above), but
  // keeps TypeScript happy and gives a sane result if maxAttempts <= 0.
  if (lastResponse) return lastResponse;
  throw lastError instanceof Error ? lastError : new Error(`Request to ${url} failed.`);
}
