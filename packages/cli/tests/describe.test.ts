import { describe, it, expect } from "vitest";

import {
  TASK_FIELDS,
  PROJECT_FIELDS,
  WORKSPACE_FIELDS,
  SECTION_FIELDS,
  USER_FIELDS,
  CUSTOM_FIELD_FIELDS,
} from "@mwp13/asx-core";
import { describeCommand } from "@/commands/describe/describe";
import { COMMAND_SCHEMAS } from "@/commands/describe/schemas";
import { createMockContext, loadCommand, parseOutput } from "./helpers";

// COMMAND_SCHEMAS completeness
describe("COMMAND_SCHEMAS completeness", () => {
  const expectedCommands = [
    "auth.add",
    "auth.list",
    "auth.remove",
    "auth.status",
    "custom-fields.get",
    "custom-fields.list",
    "projects.create",
    "projects.delete",
    "projects.duplicate",
    "projects.get",
    "projects.list",
    "projects.memberships",
    "projects.sections",
    "projects.statuses",
    "projects.task-counts",
    "projects.update",
    "tasks.add-project",
    "tasks.add-tag",
    "tasks.comment",
    "tasks.complete",
    "tasks.create",
    "tasks.delete",
    "tasks.dependencies",
    "tasks.duplicate",
    "tasks.followers",
    "tasks.get",
    "tasks.list",
    "tasks.remove-project",
    "tasks.remove-tag",
    "tasks.search",
    "tasks.subtasks",
    "tasks.update",
    "users.get",
    "users.list",
    "workspaces.get",
    "workspaces.list",
  ];

  for (const cmd of expectedCommands) {
    it(`has schema entry for ${cmd}`, () => {
      const schema = COMMAND_SCHEMAS[cmd];
      expect(schema).toBeDefined();
      expect(schema!.brief).toBeTruthy();
      expect(Array.isArray(schema!.flags)).toBe(true);
      expect(Array.isArray(schema!.positional)).toBe(true);
    });
  }

  it("has no extra unexpected entries", () => {
    const schemaKeys = Object.keys(COMMAND_SCHEMAS).sort();
    expect(schemaKeys).toEqual([...expectedCommands].sort());
  });
});

// Field registries completeness
describe("field registries", () => {
  const resourceFields: Record<string, readonly string[]> = {
    task: TASK_FIELDS,
    project: PROJECT_FIELDS,
    workspace: WORKSPACE_FIELDS,
    section: SECTION_FIELDS,
    user: USER_FIELDS,
    custom_field: CUSTOM_FIELD_FIELDS,
  };

  for (const [resource, fields] of Object.entries(resourceFields)) {
    it(`${resource} has a non-empty field list`, () => {
      expect(fields.length).toBeGreaterThan(0);
    });

    it(`${resource} fields are all strings`, () => {
      for (const field of fields) {
        expect(typeof field).toBe("string");
      }
    });
  }
});

// Describe command output format
describe("describe command output", () => {
  it("no args outputs commands and resources with _meta envelope", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(describeCommand);
    await func.call(ctx, {});
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta).toBeDefined();
    expect(meta["command"]).toBe("describe");
    expect(meta["timestamp"]).toBeTruthy();
    expect(Array.isArray(out["commands"])).toBe(true);
    expect(Array.isArray(out["resources"])).toBe(true);
    expect((out["commands"] as string[]).length).toBeGreaterThan(0);
    expect((out["resources"] as string[]).length).toBeGreaterThan(0);
  });

  it("command arg outputs schema with _meta envelope", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(describeCommand);
    await func.call(ctx, {}, "tasks.create");
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta).toBeDefined();
    expect(meta["command"]).toBe("describe");
    expect(out["command"]).toBe("tasks.create");
    expect(out["schema"]).toBeDefined();
    const schema = out["schema"] as Record<string, unknown>;
    expect(schema["brief"]).toBeTruthy();
    expect(Array.isArray(schema["flags"])).toBe(true);
    expect(Array.isArray(schema["positional"])).toBe(true);
  });

  it("resource arg outputs fields with _meta envelope", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(describeCommand);
    await func.call(ctx, {}, "task");
    const out = parseOutput(ctx);
    const meta = out["_meta"] as Record<string, unknown>;
    expect(meta).toBeDefined();
    expect(meta["command"]).toBe("describe");
    expect(out["resource"]).toBe("task");
    expect(Array.isArray(out["fields"])).toBe(true);
    expect((out["fields"] as string[]).length).toBeGreaterThan(0);
  });
});
