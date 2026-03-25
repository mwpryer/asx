import { ApiError, AuthError } from "@/errors/errors";
import { retryAsync } from "@/client/retry";

export interface AsanaClientOpts {
  pat: string;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

export interface AsanaRequestOpts {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  optFields?: string[];
}

export interface AsanaResponse<T> {
  data: T;
  next_page?: { offset: string; path: string; uri: string } | null;
}

export class AsanaClient {
  private readonly pat: string;
  private readonly baseUrl: string;
  private readonly fetch: typeof globalThis.fetch;

  constructor(opts: AsanaClientOpts) {
    this.pat = opts.pat;
    this.baseUrl = opts.baseUrl ?? "https://app.asana.com/api/1.0";
    this.fetch = opts.fetch ?? globalThis.fetch;
  }

  async request<T>(opts: AsanaRequestOpts): Promise<AsanaResponse<T>> {
    return retryAsync(async () => {
      const method = opts.method ?? "GET";
      const url = new URL(`${this.baseUrl}${opts.path}`);

      if (opts.query) {
        for (const [key, value] of Object.entries(opts.query)) {
          if (value !== undefined) {
            url.searchParams.set(key, String(value));
          }
        }
      }

      if (opts.optFields?.length) {
        url.searchParams.set("opt_fields", opts.optFields.join(","));
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.pat}`,
        Accept: "application/json",
      };

      let bodyStr: string | undefined;
      if (opts.body !== undefined) {
        headers["Content-Type"] = "application/json";
        bodyStr = JSON.stringify({ data: opts.body });
      }

      const res = await this.fetch(url.toString(), {
        method,
        headers,
        body: bodyStr,
      });

      if (!res.ok) {
        const text = await res.text();
        let message = `Asana API ${method} ${opts.path}: ${res.status}`;
        let help: string | undefined;
        try {
          const json = JSON.parse(text) as {
            errors?: Array<{ message: string; help?: string }>;
          };
          if (json.errors?.[0]?.message) {
            message = json.errors[0].message;
            help = json.errors[0].help;
          }
        } catch {
          // Use default message
        }

        if (res.status === 401 || res.status === 403) {
          throw new AuthError(
            "AUTH_REQUIRED",
            message,
            help ?? "Check your PAT is valid",
          );
        }

        const retryAfter =
          res.status === 429
            ? Number(res.headers.get("Retry-After")) || undefined
            : undefined;
        throw new ApiError(message, res.status, help, retryAfter);
      }

      if (res.status === 204) {
        return { data: {} as T };
      }

      return (await res.json()) as AsanaResponse<T>;
    });
  }
}
