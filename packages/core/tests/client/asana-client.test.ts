import { describe, it, expect } from "vitest";
import { AsanaClient } from "../../src/client/asana-client.js";
import { AuthError, ApiError } from "../../src/errors/errors.js";

function fakeFetch(
  response: { data?: unknown; errors?: Array<{ message: string }> },
  status = 200,
): typeof globalThis.fetch {
  return async () =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    }) as Response;
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

  it("sends body and returns data for POST", async () => {
    const client = makeClient(fakeFetch({ data: { gid: "2" } }));
    const res = await client.request({
      method: "POST",
      path: "/tasks",
      body: { name: "New task" },
    });
    expect(res.data).toEqual({ gid: "2" });
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

  it("includes opt_fields in request", async () => {
    const client = makeClient(fakeFetch({ data: [{ gid: "1" }] }));
    const res = await client.request({
      path: "/tasks",
      optFields: ["name", "completed"],
    });
    expect(res.data).toEqual([{ gid: "1" }]);
  });
});
