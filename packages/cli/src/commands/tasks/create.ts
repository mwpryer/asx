import {
  AsanaClient,
  InputError,
  formatJSON,
  resolveAuth,
  resolvePat,
  sanitizeText,
  validateDate,
  validateGid,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
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
} from "@/flags";

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
      parent: {
        kind: "parsed",
        brief: "Parent task GID (create as subtask)",
        parse: String,
        optional: true,
      },
      startOn: {
        kind: "parsed",
        brief: "Start date (YYYY-MM-DD)",
        parse: String,
        optional: true,
      },
      account: accountFlag,
      fields: fieldsFlag,
      dryRun: dryRunFlag,
      json: jsonFlag,
    },
  },
  func: asxFunc(async function (
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
        parent: string | undefined;
        startOn: string | undefined;
      },
  ) {
    const hasValueFlags =
      flags.name !== undefined ||
      flags.project !== undefined ||
      flags.assignee !== undefined ||
      flags.due !== undefined ||
      flags.notes !== undefined ||
      flags.parent !== undefined ||
      flags.startOn !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --project, --assignee, --due, --notes, --parent, --start-on)",
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
      const name = sanitizeText(flags.name, "name", 1024);
      if (!name) {
        throw new InputError(
          "INPUT_INVALID",
          "Invalid name: must not be blank",
          "Provide a non-empty --name",
        );
      }
      const notes = flags.notes
        ? sanitizeText(flags.notes, "notes")
        : undefined;
      if (flags.project) validateGid(flags.project, "project");
      if (flags.parent) validateGid(flags.parent, "parent");
      if (flags.assignee && flags.assignee !== "me")
        validateGid(flags.assignee, "assignee");
      if (flags.due) validateDate(flags.due, "due");
      if (flags.startOn) validateDate(flags.startOn, "start-on");

      body = { name };
      if (flags.parent) {
        body["parent"] = flags.parent;
      } else if (flags.project) {
        body["projects"] = [flags.project];
      } else if (!flags.dryRun) {
        const auth = resolveAuth({ account: flags.account });
        if (auth.workspaceGid) {
          body["workspace"] = auth.workspaceGid;
        } else {
          throw new InputError(
            "INPUT_MISSING",
            "--project or --parent is required when no default workspace is configured",
            "Pass --project, --parent, or set a default workspace with `asx auth add <alias> --workspace <gid>`",
          );
        }
      }
      if (flags.assignee) body["assignee"] = flags.assignee;
      if (flags.due) body["due_on"] = flags.due;
      if (flags.startOn) body["start_on"] = flags.startOn;
      if (notes) body["notes"] = notes;
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
  }),
});
