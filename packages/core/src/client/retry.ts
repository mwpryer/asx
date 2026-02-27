import { ApiError } from "../errors/errors.js";

export interface RetryOpts {
  retries?: number;
  baseDelay?: number;
  multiplier?: number;
}

const DEFAULTS: Required<RetryOpts> = {
  retries: 3,
  baseDelay: 1000,
  multiplier: 2,
};

export async function retryAsync<T>(
  fn: () => Promise<T>,
  opts?: RetryOpts,
): Promise<T> {
  const { retries, baseDelay, multiplier } = { ...DEFAULTS, ...opts };
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || attempt === retries) break;
      const jitter = Math.random() * 0.5 + 0.75;
      const delay = baseDelay * Math.pow(multiplier, attempt) * jitter;
      await sleep(delay);
    }
  }
  throw lastError;
}

function isRetryable(err: unknown): boolean {
  if (err instanceof ApiError) {
    return err.status === 429 || err.status >= 500;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
