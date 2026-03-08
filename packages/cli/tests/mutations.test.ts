import { describe, it, expect } from "vitest";
import { InputError } from "@mwp13/asx-core";
import { parseJsonInput } from "../src/flags.js";
import { createCommand } from "../src/commands/tasks/create.js";
import { updateCommand } from "../src/commands/tasks/update.js";
import { completeCommand } from "../src/commands/tasks/complete.js";
import { commentCommand } from "../src/commands/tasks/comment.js";

interface MockContext {
  chunks: string[];
  process: {
    stdout: { write: (data: string) => boolean };
    stderr: { write: (data: string) => boolean };
    env: Record<string, string>;
  };
}

function createMockContext(): MockContext {
  const chunks: string[] = [];
  return {
    chunks,
    process: {
      stdout: {
        write: (data: string) => {
          chunks.push(data);
          return true;
        },
      },
      stderr: { write: () => true },
      env: {},
    },
  };
}

function parseOutput(ctx: MockContext): Record<string, unknown> {
  return JSON.parse(ctx.chunks.join("")) as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// parseJsonInput
// ---------------------------------------------------------------------------

describe("parseJsonInput", () => {
  it("returns parsed object for valid JSON", () => {
    const result = parseJsonInput('{"name": "Test task"}');
    expect(result).toEqual({ name: "Test task" });
  });

  it("parses nested objects and arrays", () => {
    const result = parseJsonInput('{"name": "T", "tags": [1, 2]}');
    expect(result).toEqual({ name: "T", tags: [1, 2] });
  });

  it("throws InputError for invalid JSON syntax", () => {
    try {
      parseJsonInput("{bad}");
      expect.fail("should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
    }
  });

  it("throws InputError for JSON array", () => {
    try {
      parseJsonInput("[1,2]");
      expect.fail("should throw");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).message).toContain("array");
    }
  });

  it("throws InputError for JSON string", () => {
    expect(() => parseJsonInput('"hello"')).toThrow(InputError);
  });

  it("throws InputError for JSON number", () => {
    expect(() => parseJsonInput("42")).toThrow(InputError);
  });

  it("throws InputError for JSON null", () => {
    expect(() => parseJsonInput("null")).toThrow(InputError);
  });

  it("throws InputError for JSON boolean", () => {
    expect(() => parseJsonInput("true")).toThrow(InputError);
  });
});

// ---------------------------------------------------------------------------
// --dry-run output format
// ---------------------------------------------------------------------------

describe("--dry-run output", () => {
  it("tasks create outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await createCommand.loader();
    await func.call(ctx, {
      name: "My task",
      dryRun: true,
      account: undefined,
      fields: undefined,
      json: undefined,
      project: undefined,
      assignee: undefined,
      due: undefined,
      notes: undefined,
    });
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(meta["command"]).toBe("tasks.create");
    expect(out["method"]).toBe("POST");
    expect(out["path"]).toBe("/tasks");
    expect(out["body"]).toEqual({ name: "My task" });
  });

  it("tasks update outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await updateCommand.loader();
    await func.call(
      ctx,
      {
        name: "Updated",
        dryRun: true,
        account: undefined,
        fields: undefined,
        json: undefined,
        assignee: undefined,
        due: undefined,
        notes: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["method"]).toBe("PUT");
    expect(out["path"]).toBe("/tasks/12345");
    expect(out["body"]).toEqual({ name: "Updated" });
  });

  it("tasks complete outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await completeCommand.loader();
    await func.call(
      ctx,
      {
        dryRun: true,
        account: undefined,
        fields: undefined,
        json: undefined,
      },
      "99999",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["method"]).toBe("PUT");
    expect(out["path"]).toBe("/tasks/99999");
    expect(out["body"]).toEqual({ completed: true });
  });

  it("tasks comment outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await commentCommand.loader();
    await func.call(
      ctx,
      {
        dryRun: true,
        account: undefined,
        fields: undefined,
        json: undefined,
      },
      "55555",
      "Hello world",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["method"]).toBe("POST");
    expect(out["path"]).toBe("/tasks/55555/stories");
    expect(out["body"]).toEqual({ text: "Hello world" });
  });
});

// ---------------------------------------------------------------------------
// --json and value flags mutual exclusivity
// ---------------------------------------------------------------------------

describe("--json and value flags mutual exclusivity", () => {
  it("tasks create throws InputError when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await createCommand.loader();
    await expect(
      func.call(ctx, {
        name: "Conflict",
        json: '{"name": "Other"}',
        dryRun: false,
        account: undefined,
        fields: undefined,
        project: undefined,
        assignee: undefined,
        due: undefined,
        notes: undefined,
      }),
    ).rejects.toThrow(InputError);
  });

  it("tasks update throws InputError when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await updateCommand.loader();
    await expect(
      func.call(
        ctx,
        {
          name: "Conflict",
          json: '{"name": "Other"}',
          dryRun: false,
          account: undefined,
          fields: undefined,
          assignee: undefined,
          due: undefined,
          notes: undefined,
        },
        "12345",
      ),
    ).rejects.toThrow(InputError);
  });

  it("tasks comment throws InputError when --json and text both provided", async () => {
    const ctx = createMockContext();
    const func = await commentCommand.loader();
    await expect(
      func.call(
        ctx,
        {
          json: '{"text": "Other"}',
          dryRun: false,
          account: undefined,
          fields: undefined,
        },
        "12345",
        "Conflicting text",
      ),
    ).rejects.toThrow(InputError);
  });
});

// ---------------------------------------------------------------------------
// --json and --dry-run coexistence
// ---------------------------------------------------------------------------

describe("--json and --dry-run coexistence", () => {
  it("tasks create preview shows the raw JSON payload", async () => {
    const ctx = createMockContext();
    const func = await createCommand.loader();
    await func.call(ctx, {
      json: '{"name": "From JSON", "custom_field": "value"}',
      dryRun: true,
      account: undefined,
      fields: undefined,
      name: undefined,
      project: undefined,
      assignee: undefined,
      due: undefined,
      notes: undefined,
    });
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["body"]).toEqual({ name: "From JSON", custom_field: "value" });
  });

  it("tasks update preview shows the raw JSON payload", async () => {
    const ctx = createMockContext();
    const func = await updateCommand.loader();
    await func.call(
      ctx,
      {
        json: '{"notes": "Updated via JSON"}',
        dryRun: true,
        account: undefined,
        fields: undefined,
        name: undefined,
        assignee: undefined,
        due: undefined,
        notes: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["body"]).toEqual({ notes: "Updated via JSON" });
  });

  it("tasks complete preview shows the raw JSON payload", async () => {
    const ctx = createMockContext();
    const func = await completeCommand.loader();
    await func.call(
      ctx,
      {
        json: '{"completed": true, "custom": 1}',
        dryRun: true,
        account: undefined,
        fields: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["body"]).toEqual({ completed: true, custom: 1 });
  });

  it("tasks comment preview shows the raw JSON payload", async () => {
    const ctx = createMockContext();
    const func = await commentCommand.loader();
    await func.call(
      ctx,
      {
        json: '{"text": "Comment via JSON"}',
        dryRun: true,
        account: undefined,
        fields: undefined,
      },
      "12345",
      "",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["body"]).toEqual({ text: "Comment via JSON" });
  });
});
