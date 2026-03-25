import { describe, it, expect } from "vitest";

import { AuthError, ApiError } from "@/errors/errors";
import { AsanaClient } from "@/client/asana-client";

interface CapturedRequest {
  url: string;
  init: RequestInit;
}

function fakeFetch(
  response:
    | {
        data?: unknown;
        next_page?: unknown;
        errors?: Array<{ message: string }>;
      }
    | undefined,
  status = 200,
  captured?: CapturedRequest[],
): typeof globalThis.fetch {
  return async (input, init?) => {
    captured?.push({ url: String(input), init: init ?? {} });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: () =>
        response !== undefined
          ? Promise.resolve(response)
          : Promise.reject(new Error("no body")),
      text: () => Promise.resolve(JSON.stringify(response ?? "")),
    } as Response;
  };
}

function makeClient(fetch: typeof globalThis.fetch) {
  return new AsanaClient({ pat: "test-pat", fetch });
}

describe("AsanaClient", () => {
  it("returns parsed data from GET request", async () => {
    const client = makeClient(fakeFetch({ data: { gid: "1", name: "Task" } }));
    const res = await client.request({ path: "/tasks/1" });
    expect(res.data).toEqual({ gid: "1", name: "Task" });
  });

  it("sends Authorization header with PAT", async () => {
    const captured: CapturedRequest[] = [];
    const client = makeClient(fakeFetch({ data: {} }, 200, captured));
    await client.request({ path: "/tasks/1" });
    expect(captured[0]!.init.headers).toEqual(
      expect.objectContaining({ Authorization: "Bearer test-pat" }),
    );
  });

  it("wraps POST body in { data: ... }", async () => {
    const captured: CapturedRequest[] = [];
    const client = makeClient(fakeFetch({ data: { gid: "2" } }, 200, captured));
    await client.request({
      method: "POST",
      path: "/tasks",
      body: { name: "New task" },
    });
    expect(JSON.parse(captured[0]!.init.body as string)).toEqual({
      data: { name: "New task" },
    });
  });

  it("includes query params in URL", async () => {
    const captured: CapturedRequest[] = [];
    const client = makeClient(fakeFetch({ data: [] }, 200, captured));
    await client.request({
      path: "/tasks",
      query: { workspace: "123", completed_since: "now" },
    });
    const url = new URL(captured[0]!.url);
    expect(url.searchParams.get("workspace")).toBe("123");
    expect(url.searchParams.get("completed_since")).toBe("now");
  });

  it("omits undefined query params", async () => {
    const captured: CapturedRequest[] = [];
    const client = makeClient(fakeFetch({ data: [] }, 200, captured));
    await client.request({
      path: "/tasks",
      query: { workspace: "123", assignee: undefined },
    });
    const url = new URL(captured[0]!.url);
    expect(url.searchParams.has("workspace")).toBe(true);
    expect(url.searchParams.has("assignee")).toBe(false);
  });

  it("includes opt_fields in URL", async () => {
    const captured: CapturedRequest[] = [];
    const client = makeClient(fakeFetch({ data: [] }, 200, captured));
    await client.request({
      path: "/tasks",
      optFields: ["name", "completed"],
    });
    const url = new URL(captured[0]!.url);
    expect(url.searchParams.get("opt_fields")).toBe("name,completed");
  });

  it("sends DELETE request", async () => {
    const captured: CapturedRequest[] = [];
    const client = makeClient(fakeFetch(undefined, 204, captured));
    await client.request({ method: "DELETE", path: "/tasks/1" });
    expect(captured[0]!.init.method).toBe("DELETE");
  });

  it("returns empty data for 204 No Content", async () => {
    const client = makeClient(fakeFetch(undefined, 204));
    const res = await client.request({ method: "DELETE", path: "/tasks/1" });
    expect(res.data).toEqual({});
  });

  it("returns next_page when present in response", async () => {
    const client = makeClient(
      fakeFetch({
        data: [{ gid: "1" }],
        next_page: {
          offset: "abc",
          path: "/tasks?offset=abc",
          uri: "https://example.com",
        },
      }),
    );
    const res = await client.request({ path: "/tasks" });
    expect(res.next_page).toEqual({
      offset: "abc",
      path: "/tasks?offset=abc",
      uri: "https://example.com",
    });
  });

  it("throws AuthError on 401", async () => {
    const client = makeClient(
      fakeFetch({ errors: [{ message: "Not Authorized" }] }, 401),
    );
    await expect(client.request({ path: "/tasks/1" })).rejects.toThrow(
      AuthError,
    );
  });

  it("throws AuthError on 403", async () => {
    const client = makeClient(
      fakeFetch({ errors: [{ message: "Forbidden" }] }, 403),
    );
    await expect(client.request({ path: "/tasks/1" })).rejects.toThrow(
      AuthError,
    );
  });

  it("throws ApiError on 404", async () => {
    const client = makeClient(
      fakeFetch({ errors: [{ message: "Not Found" }] }, 404),
    );
    await expect(client.request({ path: "/tasks/999" })).rejects.toThrow(
      ApiError,
    );
  });

  it("uses fallback message when error response is not JSON", async () => {
    const fetch: typeof globalThis.fetch = async () =>
      ({
        ok: false,
        status: 400,
        text: () => Promise.resolve("not json"),
        json: () => Promise.reject(new Error("invalid json")),
      }) as Response;
    const client = makeClient(fetch);
    await expect(client.request({ path: "/tasks/1" })).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof ApiError &&
        err.message.includes("400") &&
        err.status === 400,
    );
  });

  it("throws on network error", async () => {
    const fetch: typeof globalThis.fetch = async () => {
      throw new TypeError("fetch failed");
    };
    const client = makeClient(fetch);
    await expect(client.request({ path: "/tasks/1" })).rejects.toThrow(
      TypeError,
    );
  });
});
