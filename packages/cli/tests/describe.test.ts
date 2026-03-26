import {
  TASK_FIELDS,
  PROJECT_FIELDS,
  WORKSPACE_FIELDS,
  SECTION_FIELDS,
  USER_FIELDS,
  CUSTOM_FIELD_FIELDS,
  TAG_FIELDS,
  TEAM_FIELDS,
} from "@mwp13/asx-core";
import { describe, it, expect } from "vitest";

import { describeCommand } from "@/commands/describe/describe";
import { COMMAND_SCHEMAS } from "@/commands/describe/schemas";
import { createMockContext, loadCommand, parseOutput } from "./helpers";

describe("COMMAND_SCHEMAS completeness", () => {
  const expectedCommands = [
    "auth.add",
    "auth.list",
    "auth.remove",
    "auth.status",
    "custom-fields.create",
    "custom-fields.delete",
    "custom-fields.get",
    "custom-fields.list",
    "custom-fields.update",
    "projects.create",
    "projects.delete",
    "projects.duplicate",
    "projects.get",
    "projects.list",
    "projects.memberships.add",
    "projects.memberships.list",
    "projects.memberships.remove",
    "projects.statuses.create",
    "projects.statuses.list",
    "projects.task-counts",
    "projects.update",
    "sections.create",
    "sections.delete",
    "sections.get",
    "sections.list",
    "sections.update",
    "tags.create",
    "tags.delete",
    "tags.get",
    "tags.list",
    "tags.update",
    "tasks.comments.add",
    "tasks.comments.list",
    "tasks.comments.remove",
    "tasks.complete",
    "tasks.create",
    "tasks.delete",
    "tasks.dependencies.add",
    "tasks.dependencies.list",
    "tasks.dependencies.remove",
    "tasks.duplicate",
    "tasks.followers.add",
    "tasks.followers.list",
    "tasks.followers.remove",
    "tasks.get",
    "tasks.list",
    "tasks.projects.add",
    "tasks.projects.list",
    "tasks.projects.remove",
    "tasks.search",
    "tasks.stories.list",
    "tasks.subtasks.create",
    "tasks.subtasks.list",
    "tasks.tags.add",
    "tasks.tags.list",
    "tasks.tags.remove",
    "tasks.update",
    "teams.get",
    "teams.list",
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

describe("field registries", () => {
  const resourceFields: Record<string, readonly string[]> = {
    task: TASK_FIELDS,
    project: PROJECT_FIELDS,
    workspace: WORKSPACE_FIELDS,
    section: SECTION_FIELDS,
    user: USER_FIELDS,
    custom_field: CUSTOM_FIELD_FIELDS,
    tag: TAG_FIELDS,
    team: TEAM_FIELDS,
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

  it("unknown target outputs InputError as JSON", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(describeCommand);
    await func.call(ctx, {}, "nonexistent.thing");
    const out = parseOutput(ctx);
    const error = out["error"] as Record<string, unknown>;
    expect(error).toBeDefined();
    expect(error["code"]).toBe("INPUT_INVALID");
    expect(error["message"]).toContain("nonexistent.thing");
  });
});
