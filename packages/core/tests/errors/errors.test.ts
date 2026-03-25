import { describe, it, expect } from "vitest";

import {
  AuthError,
  ApiError,
  InputError,
  EXIT_AUTH,
  EXIT_API,
  EXIT_RATE_LIMITED,
  EXIT_INPUT,
} from "@/errors/errors";

describe("AuthError", () => {
  it("sets code, message, suggestion, exitCode", () => {
    const err = new AuthError("AUTH_REQUIRED", "No token", "Add a PAT");
    expect(err.code).toBe("AUTH_REQUIRED");
    expect(err.message).toBe("No token");
    expect(err.suggestion).toBe("Add a PAT");
    expect(err.exitCode).toBe(EXIT_AUTH);
  });

  it("toJSON includes suggestion when present", () => {
    const err = new AuthError("AUTH_REQUIRED", "No token", "Add a PAT");
    expect(err.toJSON()).toEqual({
      error: {
        code: "AUTH_REQUIRED",
        message: "No token",
        suggestion: "Add a PAT",
      },
    });
  });

  it("toJSON omits suggestion when absent", () => {
    const err = new AuthError("AUTH_REQUIRED", "No token");
    expect(err.toJSON()).toEqual({
      error: { code: "AUTH_REQUIRED", message: "No token" },
    });
  });
});

describe("ApiError", () => {
  it("status 404 -> API_NOT_FOUND, exitCode 4", () => {
    const err = new ApiError("not found", 404);
    expect(err.code).toBe("API_NOT_FOUND");
    expect(err.exitCode).toBe(EXIT_API);
    expect(err.status).toBe(404);
  });

  it("status 429 -> API_RATE_LIMITED, exitCode 5", () => {
    const err = new ApiError("slow down", 429);
    expect(err.code).toBe("API_RATE_LIMITED");
    expect(err.exitCode).toBe(EXIT_RATE_LIMITED);
    expect(err.status).toBe(429);
  });

  it("status 500 -> API_ERROR, exitCode 4", () => {
    const err = new ApiError("server error", 500);
    expect(err.code).toBe("API_ERROR");
    expect(err.exitCode).toBe(EXIT_API);
    expect(err.status).toBe(500);
  });

  it("toJSON serialises correctly", () => {
    const err = new ApiError("not found", 404, "Check the GID");
    expect(err.toJSON()).toEqual({
      error: {
        code: "API_NOT_FOUND",
        message: "not found",
        suggestion: "Check the GID",
      },
    });
  });
});

describe("InputError", () => {
  it("sets code, message, exitCode", () => {
    const err = new InputError("INPUT_INVALID", "bad input");
    expect(err.code).toBe("INPUT_INVALID");
    expect(err.message).toBe("bad input");
    expect(err.exitCode).toBe(EXIT_INPUT);
  });

  it("toJSON includes suggestion when present", () => {
    const err = new InputError("INPUT_INVALID", "bad input", "Try again");
    expect(err.toJSON()).toEqual({
      error: {
        code: "INPUT_INVALID",
        message: "bad input",
        suggestion: "Try again",
      },
    });
  });

  it("toJSON omits suggestion when absent", () => {
    const err = new InputError("INPUT_INVALID", "bad input");
    expect(err.toJSON()).toEqual({
      error: { code: "INPUT_INVALID", message: "bad input" },
    });
  });

  it("supports INPUT_MISSING code", () => {
    const err = new InputError("INPUT_MISSING", "name is required");
    expect(err.code).toBe("INPUT_MISSING");
    expect(err.exitCode).toBe(EXIT_INPUT);
  });
});
