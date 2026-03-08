import { buildCommand } from "@stricli/core";
import {
  AsanaClient,
  InputError,
  formatJSON,
  resolvePat,
  sanitizeText,
  validateDate,
  validateGid,
} from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
import {
  accountFlag,
  dryRunFlag,
  fieldsFlag,
  jsonFlag,
  parseJsonInput,
  type AccountFlag,
  type DryRunFlag,
  type FieldsFlag,
  type JsonFlag,
} from "../../flags.js";

export const createCommand = buildCommand({
  docs: { brief: "Create a new task" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      name: {
        kind: "parsed",
        brief: "Task name",
        parse: String,
        optional: true,
      },
      project: {
        kind: "parsed",
        brief: "Project GID",
        parse: String,
        optional: true,
      },
      assignee: {
        kind: "parsed",
        brief: "Assignee GID or 'me'",
        parse: String,
        optional: true,
      },
      due: {
        kind: "parsed",
        brief: "Due date (YYYY-MM-DD)",
        parse: String,
        optional: true,
      },
      notes: {
        kind: "parsed",
        brief: "Task description",
        parse: String,
        optional: true,
      },
      account: accountFlag,
      fields: fieldsFlag,
      dryRun: dryRunFlag,
      json: jsonFlag,
    },
  },
  func: async function (
    this: AsxCliContext,
    flags: AccountFlag &
      FieldsFlag &
      DryRunFlag &
      JsonFlag & {
        name: string | undefined;
        project: string | undefined;
        assignee: string | undefined;
        due: string | undefined;
        notes: string | undefined;
      },
  ) {
    const hasValueFlags =
      flags.name !== undefined ||
      flags.project !== undefined ||
      flags.assignee !== undefined ||
      flags.due !== undefined ||
      flags.notes !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --project, --assignee, --due, --notes)",
        "Use either --json or individual flags, not both",
      );
    }

    let body: Record<string, unknown>;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      if (!flags.name) {
        throw new InputError(
          "INPUT_MISSING",
          "--name is required when not using --json",
          "Provide --name or use --json with a JSON object containing a name field",
        );
      }
      sanitizeText(flags.name, "name", 1024);
      if (flags.notes) sanitizeText(flags.notes, "notes");
      if (flags.project) validateGid(flags.project, "project");
      if (flags.assignee && flags.assignee !== "me")
        validateGid(flags.assignee, "assignee");
      if (flags.due) validateDate(flags.due, "due");

      body = { name: flags.name };
      if (flags.project) body["projects"] = [flags.project];
      if (flags.assignee) body["assignee"] = flags.assignee;
      if (flags.due) body["due_on"] = flags.due;
      if (flags.notes) body["notes"] = flags.notes;
    }

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path: "/tasks", body },
          { command: "tasks.create", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "POST",
      path: "/tasks",
      body,
      optFields: flags.fields?.split(",") ?? ["name", "gid", "permalink_url"],
    });

    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.create" }) + "\n",
    );
  },
});
