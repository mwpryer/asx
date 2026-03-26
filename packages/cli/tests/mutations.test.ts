import { describe, it, expect } from "vitest";

import { InputError } from "@mwp13/asx-core";
import { parseJsonInput } from "@/flags";
import { commentsCommand } from "@/commands/tasks/comments";
import { completeCommand } from "@/commands/tasks/complete";
import { createCommand } from "@/commands/tasks/create";
import { updateCommand } from "@/commands/tasks/update";
import { createMockContext, loadCommand, parseOutput } from "./helpers";

// parseJsonInput
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
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InputError);
      expect((err as InputError).code).toBe("INPUT_INVALID");
      expect((err as InputError).suggestion).toBeTruthy();
    }
  });

  it("throws InputError for JSON array", () => {
    try {
      parseJsonInput("[1,2]");
      expect.unreachable("should have thrown");
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

// --dry-run output format
describe("--dry-run output", () => {
  it("tasks create outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(createCommand);
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
      parent: undefined,
      startOn: undefined,
    });
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(meta["command"]).toBe("tasks.create");
    expect(out["method"]).toBe("POST");
    expect(out["path"]).toBe("/tasks");
    expect(out["body"]).toEqual(expect.objectContaining({ name: "My task" }));
  });

  it("tasks update outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(updateCommand);
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
    const func = await loadCommand(completeCommand);
    await func.call(
      ctx,
      {
        dryRun: true,
        account: undefined,
        fields: undefined,
        json: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["method"]).toBe("PUT");
    expect(out["path"]).toBe("/tasks/12345");
    expect(out["body"]).toEqual({ completed: true });
  });

  it("tasks comments outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(commentsCommand);
    await func.call(
      ctx,
      {
        text: "Hello world",
        dryRun: true,
        account: undefined,
        fields: undefined,
        json: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["method"]).toBe("POST");
    expect(out["path"]).toBe("/tasks/12345/stories");
    expect(out["body"]).toEqual({ text: "Hello world" });
  });
});

// --json and value flags mutual exclusivity
describe("--json and value flags mutual exclusivity", () => {
  it("tasks create writes INPUT_INVALID to stdout when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(createCommand);
    await func.call(ctx, {
      name: "Conflict",
      json: '{"name": "Other"}',
      dryRun: false,
      account: undefined,
      fields: undefined,
      project: undefined,
      assignee: undefined,
      due: undefined,
      notes: undefined,
      parent: undefined,
      startOn: undefined,
    });
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });

  it("tasks update writes INPUT_INVALID to stdout when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(updateCommand);
    await func.call(
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
    );
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });

  it("tasks comments writes INPUT_INVALID to stdout when --json and text both provided", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(commentsCommand);
    await func.call(
      ctx,
      {
        text: "Conflicting text",
        json: '{"text": "Other"}',
        dryRun: false,
        account: undefined,
        fields: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });
});

// --json and --dry-run coexistence
describe("--json and --dry-run coexistence", () => {
  it("tasks create preview shows the raw JSON payload", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(createCommand);
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
      parent: undefined,
      startOn: undefined,
    });
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["body"]).toEqual({ name: "From JSON", custom_field: "value" });
  });

  it("tasks update preview shows the raw JSON payload", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(updateCommand);
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
    const func = await loadCommand(completeCommand);
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

  it("tasks comments preview shows the raw JSON payload", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(commentsCommand);
    await func.call(
      ctx,
      {
        json: '{"text": "Comment via JSON"}',
        dryRun: true,
        account: undefined,
        fields: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["body"]).toEqual({ text: "Comment via JSON" });
  });
});
