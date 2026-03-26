import { InputError } from "@mwp13/asx-core";
import { describe, it, expect } from "vitest";

import { createCommand as customFieldsCreateCommand } from "@/commands/custom-fields/create";
import { deleteCommand as customFieldsDeleteCommand } from "@/commands/custom-fields/delete";
import { updateCommand as customFieldsUpdateCommand } from "@/commands/custom-fields/update";
import { addCommand as membershipsAddCommand } from "@/commands/projects/memberships/add";
import { removeCommand as membershipsRemoveCommand } from "@/commands/projects/memberships/remove";
import { createCommand as statusesCreateCommand } from "@/commands/projects/statuses/create";
import { createCommand as sectionsCreateCommand } from "@/commands/sections/create";
import { deleteCommand as sectionsDeleteCommand } from "@/commands/sections/delete";
import { updateCommand as sectionsUpdateCommand } from "@/commands/sections/update";
import { createCommand as tagsCreateCommand } from "@/commands/tags/create";
import { deleteCommand as tagsDeleteCommand } from "@/commands/tags/delete";
import { updateCommand as tagsUpdateCommand } from "@/commands/tags/update";
import { addCommand as commentsAddCommand } from "@/commands/tasks/comments/add";
import { removeCommand as commentsRemoveCommand } from "@/commands/tasks/comments/remove";
import { completeCommand } from "@/commands/tasks/complete";
import { createCommand } from "@/commands/tasks/create";
import { createCommand as subtasksCreateCommand } from "@/commands/tasks/subtasks/create";
import { updateCommand } from "@/commands/tasks/update";
import { parseJsonInput } from "@/flags";
import { createMockContext, loadCommand, parseOutput } from "./helpers";

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

  it("tasks comments add outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(commentsAddCommand);
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

  it("tasks comments remove outputs _meta.dry_run, method, path", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(commentsRemoveCommand);
    await func.call(
      ctx,
      {
        dryRun: true,
        account: undefined,
      },
      "99999",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(meta["command"]).toBe("tasks.comments.remove");
    expect(out["method"]).toBe("DELETE");
    expect(out["path"]).toBe("/stories/99999");
  });

  it("tasks subtasks create outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(subtasksCreateCommand);
    await func.call(
      ctx,
      {
        name: "My subtask",
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
    expect(meta["command"]).toBe("tasks.subtasks.create");
    expect(out["method"]).toBe("POST");
    expect(out["path"]).toBe("/tasks/12345/subtasks");
    expect(out["body"]).toEqual(
      expect.objectContaining({ name: "My subtask" }),
    );
  });

  it("projects memberships add outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(membershipsAddCommand);
    await func.call(
      ctx,
      {
        dryRun: true,
        account: undefined,
      },
      "12345",
      "99999",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(meta["command"]).toBe("projects.memberships.add");
    expect(out["method"]).toBe("POST");
    expect(out["path"]).toBe("/projects/12345/addMembers");
    expect(out["body"]).toEqual({ members: ["99999"] });
  });

  it("projects memberships remove outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(membershipsRemoveCommand);
    await func.call(
      ctx,
      {
        dryRun: true,
        account: undefined,
      },
      "12345",
      "99999",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(meta["command"]).toBe("projects.memberships.remove");
    expect(out["method"]).toBe("POST");
    expect(out["path"]).toBe("/projects/12345/removeMembers");
    expect(out["body"]).toEqual({ members: ["99999"] });
  });

  it("projects statuses create outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(statusesCreateCommand);
    await func.call(
      ctx,
      {
        title: "On track",
        color: "on_track",
        text: undefined,
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
    expect(meta["command"]).toBe("projects.statuses.create");
    expect(out["method"]).toBe("POST");
    expect(out["path"]).toBe("/projects/12345/project_statuses");
    expect(out["body"]).toEqual({ title: "On track", color: "on_track" });
  });

  it("custom-fields create outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(customFieldsCreateCommand);
    await func.call(ctx, {
      name: "Priority",
      resourceSubtype: "enum",
      workspace: "99999",
      description: undefined,
      dryRun: true,
      account: undefined,
      fields: undefined,
      json: undefined,
    });
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(meta["command"]).toBe("custom-fields.create");
    expect(out["method"]).toBe("POST");
    expect(out["path"]).toBe("/workspaces/99999/custom_fields");
    expect(out["body"]).toEqual({
      name: "Priority",
      resource_subtype: "enum",
    });
  });

  it("custom-fields update outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(customFieldsUpdateCommand);
    await func.call(
      ctx,
      {
        name: "Renamed",
        description: undefined,
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
    expect(meta["command"]).toBe("custom-fields.update");
    expect(out["method"]).toBe("PUT");
    expect(out["path"]).toBe("/custom_fields/12345");
    expect(out["body"]).toEqual({ name: "Renamed" });
  });

  it("custom-fields delete outputs _meta.dry_run, method, path", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(customFieldsDeleteCommand);
    await func.call(
      ctx,
      {
        dryRun: true,
        account: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(meta["command"]).toBe("custom-fields.delete");
    expect(out["method"]).toBe("DELETE");
    expect(out["path"]).toBe("/custom_fields/12345");
  });

  it("tags create outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(tagsCreateCommand);
    await func.call(ctx, {
      name: "My tag",
      dryRun: true,
      account: undefined,
      fields: undefined,
      json: undefined,
      color: undefined,
      notes: undefined,
      workspace: undefined,
    });
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(meta["command"]).toBe("tags.create");
    expect(out["method"]).toBe("POST");
    expect(out["body"]).toEqual(expect.objectContaining({ name: "My tag" }));
  });

  it("tags update outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(tagsUpdateCommand);
    await func.call(
      ctx,
      {
        name: "Updated tag",
        dryRun: true,
        account: undefined,
        fields: undefined,
        json: undefined,
        color: undefined,
        notes: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["method"]).toBe("PUT");
    expect(out["path"]).toBe("/tags/12345");
    expect(out["body"]).toEqual({ name: "Updated tag" });
  });

  it("tags delete outputs _meta.dry_run, method, path", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(tagsDeleteCommand);
    await func.call(
      ctx,
      {
        dryRun: true,
        account: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(out["method"]).toBe("DELETE");
    expect(out["path"]).toBe("/tags/12345");
  });

  it("sections create outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(sectionsCreateCommand);
    await func.call(ctx, {
      name: "Backlog",
      project: "12345",
      dryRun: true,
      account: undefined,
      fields: undefined,
      json: undefined,
    });
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(meta["command"]).toBe("sections.create");
    expect(out["method"]).toBe("POST");
    expect(out["path"]).toBe("/projects/12345/sections");
    expect(out["body"]).toEqual(expect.objectContaining({ name: "Backlog" }));
  });

  it("sections update outputs _meta.dry_run, method, path, body", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(sectionsUpdateCommand);
    await func.call(
      ctx,
      {
        name: "Done",
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
    expect(meta["command"]).toBe("sections.update");
    expect(out["method"]).toBe("PUT");
    expect(out["path"]).toBe("/sections/12345");
    expect(out["body"]).toEqual({ name: "Done" });
  });

  it("sections delete outputs _meta.dry_run, method, path", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(sectionsDeleteCommand);
    await func.call(
      ctx,
      {
        dryRun: true,
        account: undefined,
      },
      "12345",
    );
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta["dry_run"]).toBe(true);
    expect(meta["command"]).toBe("sections.delete");
    expect(out["method"]).toBe("DELETE");
    expect(out["path"]).toBe("/sections/12345");
  });
});

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

  it("tasks comments add writes INPUT_INVALID to stdout when --json and text both provided", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(commentsAddCommand);
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

  it("tasks subtasks create writes INPUT_INVALID to stdout when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(subtasksCreateCommand);
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

  it("projects statuses create writes INPUT_INVALID to stdout when --json and --title both set", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(statusesCreateCommand);
    await func.call(
      ctx,
      {
        title: "Conflict",
        color: undefined,
        text: undefined,
        json: '{"title": "Other"}',
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

  it("custom-fields create writes INPUT_INVALID to stdout when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(customFieldsCreateCommand);
    await func.call(ctx, {
      name: "Conflict",
      resourceSubtype: "text",
      workspace: undefined,
      description: undefined,
      json: '{"name": "Other"}',
      dryRun: false,
      account: undefined,
      fields: undefined,
    });
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });

  it("custom-fields update writes INPUT_INVALID to stdout when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(customFieldsUpdateCommand);
    await func.call(
      ctx,
      {
        name: "Conflict",
        description: undefined,
        json: '{"name": "Other"}',
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

  it("tags create writes INPUT_INVALID to stdout when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(tagsCreateCommand);
    await func.call(ctx, {
      name: "Conflict",
      json: '{"name": "Other"}',
      dryRun: false,
      account: undefined,
      fields: undefined,
      color: undefined,
      notes: undefined,
      workspace: undefined,
    });
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });

  it("tags update writes INPUT_INVALID to stdout when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(tagsUpdateCommand);
    await func.call(
      ctx,
      {
        name: "Conflict",
        json: '{"name": "Other"}',
        dryRun: false,
        account: undefined,
        fields: undefined,
        color: undefined,
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

  it("sections create writes INPUT_INVALID to stdout when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(sectionsCreateCommand);
    await func.call(ctx, {
      name: "Conflict",
      project: "12345",
      json: '{"name": "Other"}',
      dryRun: false,
      account: undefined,
      fields: undefined,
    });
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });

  it("sections update writes INPUT_INVALID to stdout when --json and --name both set", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(sectionsUpdateCommand);
    await func.call(
      ctx,
      {
        name: "Conflict",
        json: '{"name": "Other"}',
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

  it("tasks comments add preview shows the raw JSON payload", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(commentsAddCommand);
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

  it("tasks subtasks create preview shows the raw JSON payload", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(subtasksCreateCommand);
    await func.call(
      ctx,
      {
        json: '{"name": "Subtask via JSON", "notes": "details"}',
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
    expect(out["body"]).toEqual({ name: "Subtask via JSON", notes: "details" });
  });
});
