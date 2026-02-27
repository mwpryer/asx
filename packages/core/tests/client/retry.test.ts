import { describe, it, expect, vi } from "vitest";
import { retryAsync } from "../../src/client/retry.js";
import { ApiError } from "../../src/errors/errors.js";

describe("retryAsync", () => {
  it("returns on first success", async () => {
    const fn = vi.fn().mockResolvedValueOnce("ok");
    const result = await retryAsync(fn, { retries: 3, baseDelay: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on 429 and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("rate limited", 429))
      .mockResolvedValueOnce("ok");

    const result = await retryAsync(fn, { retries: 3, baseDelay: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on 500 and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("server error", 500))
      .mockResolvedValueOnce("ok");

    const result = await retryAsync(fn, { retries: 3, baseDelay: 1 });
    expect(result).toBe("ok");
  });

  it("does not retry on 404", async () => {
    const fn = vi.fn().mockRejectedValue(new ApiError("not found", 404));
    await expect(retryAsync(fn, { retries: 3, baseDelay: 1 })).rejects.toThrow(
      "not found",
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not retry non-ApiError exceptions", async () => {
    const fn = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    await expect(retryAsync(fn, { retries: 3, baseDelay: 1 })).rejects.toThrow(
      TypeError,
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("gives up after max retries", async () => {
    const fn = vi.fn().mockRejectedValue(new ApiError("down", 500));
    await expect(retryAsync(fn, { retries: 2, baseDelay: 1 })).rejects.toThrow(
      "down",
    );
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });
});
