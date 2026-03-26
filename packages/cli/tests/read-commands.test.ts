import { describe, it, expect, vi, beforeEach } from "vitest";

import { createMockContext, loadCommand, parseOutput } from "./helpers";

const mockRequest = vi.fn();

vi.mock("@mwp13/asx-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@mwp13/asx-core")>();
  return {
    ...actual,
    resolvePat: () => "fake-pat",
    AsanaClient: class {
      request = mockRequest;
    },
  };
});

const { listCommand: storiesListCommand } =
  await import("@/commands/tasks/stories/list");
const { listCommand: commentsListCommand } =
  await import("@/commands/tasks/comments/list");

beforeEach(() => {
  mockRequest.mockReset();
});

const mixedStories = [
  {
    gid: "1",
    text: "Deployed to staging",
    resource_subtype: "comment_added",
    created_by: { name: "Alice" },
    created_at: "2026-03-01T00:00:00.000Z",
    type: "comment",
  },
  {
    gid: "2",
    text: "",
    resource_subtype: "assigned",
    created_by: { name: "Bob" },
    created_at: "2026-03-02T00:00:00.000Z",
    type: "system",
  },
  {
    gid: "3",
    text: "LGTM",
    resource_subtype: "comment_added",
    created_by: { name: "Charlie" },
    created_at: "2026-03-03T00:00:00.000Z",
    type: "comment",
  },
];

describe("tasks stories", () => {
  it("returns all stories from the API", async () => {
    mockRequest.mockResolvedValue({ data: mixedStories, next_page: null });
    const ctx = createMockContext();
    const func = await loadCommand(storiesListCommand);
    await func.call(
      ctx,
      {
        limit: undefined,
        offset: undefined,
        account: undefined,
        fields: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    expect(out["stories"]).toEqual(mixedStories);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["command"]).toBe("tasks.stories.list");
  });

  it("passes pagination to API request", async () => {
    mockRequest.mockResolvedValue({ data: [], next_page: null });
    const ctx = createMockContext();
    const func = await loadCommand(storiesListCommand);
    await func.call(
      ctx,
      {
        limit: 10,
        offset: "abc123",
        account: undefined,
        fields: undefined,
      },
      "12345",
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/tasks/12345/stories",
        query: expect.objectContaining({ limit: 10, offset: "abc123" }),
      }),
    );
  });

  it("rejects invalid GID", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(storiesListCommand);
    await func.call(
      ctx,
      {
        limit: undefined,
        offset: undefined,
        account: undefined,
        fields: undefined,
      },
      "not-a-gid",
    );
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });
});

describe("tasks comments", () => {
  it("filters to comment_added stories only", async () => {
    mockRequest.mockResolvedValue({ data: mixedStories, next_page: null });
    const ctx = createMockContext();
    const func = await loadCommand(commentsListCommand);
    await func.call(
      ctx,
      {
        limit: undefined,
        offset: undefined,
        account: undefined,
        fields: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const comments = out["comments"] as Array<Record<string, unknown>>;
    expect(comments).toHaveLength(2);
    expect(comments[0]!["gid"]).toBe("1");
    expect(comments[1]!["gid"]).toBe("3");
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["command"]).toBe("tasks.comments.list");
  });

  it("returns empty array when no comments exist", async () => {
    const systemOnly = [mixedStories[1]];
    mockRequest.mockResolvedValue({ data: systemOnly, next_page: null });
    const ctx = createMockContext();
    const func = await loadCommand(commentsListCommand);
    await func.call(
      ctx,
      {
        limit: undefined,
        offset: undefined,
        account: undefined,
        fields: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    expect(out["comments"]).toEqual([]);
  });

  it("rejects invalid GID", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(commentsListCommand);
    await func.call(
      ctx,
      {
        limit: undefined,
        offset: undefined,
        account: undefined,
        fields: undefined,
      },
      "bad",
    );
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });
});
