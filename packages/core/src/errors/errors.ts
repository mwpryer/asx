const EXIT_GENERAL = 1;
export const EXIT_AUTH = 2;
export const EXIT_INPUT = 3;
export const EXIT_API = 4;
export const EXIT_RATE_LIMITED = 5;

export type ErrorCode =
  | "AUTH_REQUIRED"
  | "API_NOT_FOUND"
  | "API_RATE_LIMITED"
  | "API_ERROR"
  | "INPUT_INVALID"
  | "INPUT_MISSING";

export class AsxError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly suggestion?: string,
    readonly exitCode: number = EXIT_GENERAL,
  ) {
    super(message);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.suggestion && { suggestion: this.suggestion }),
      },
    };
  }
}

export class AuthError extends AsxError {
  constructor(code: ErrorCode, message: string, suggestion?: string) {
    super(code, message, suggestion, EXIT_AUTH);
  }
}

export class ApiError extends AsxError {
  readonly status: number;
  readonly retryAfter?: number;
  constructor(
    message: string,
    status: number,
    suggestion?: string,
    retryAfter?: number,
  ) {
    super(
      status === 404
        ? "API_NOT_FOUND"
        : status === 429
          ? "API_RATE_LIMITED"
          : "API_ERROR",
      message,
      suggestion,
      status === 429 ? EXIT_RATE_LIMITED : EXIT_API,
    );
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export class NetworkError extends AsxError {
  constructor(message: string, suggestion?: string) {
    super("API_ERROR", message, suggestion, EXIT_API);
  }
}

export class InputError extends AsxError {
  constructor(
    code: "INPUT_INVALID" | "INPUT_MISSING",
    message: string,
    suggestion?: string,
  ) {
    super(code, message, suggestion, EXIT_INPUT);
  }
}
