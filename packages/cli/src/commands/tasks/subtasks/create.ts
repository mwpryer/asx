import {
  AsanaClient,
  InputError,
  formatJSON,
  hint,
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
  docs: { brief: "Create a subtask" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Parent task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      name: {
        kind: "parsed",
        brief: "Subtask name",
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
        brief: "Subtask description",
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
        assignee: string | undefined;
        due: string | undefined;
        notes: string | undefined;
      },
    taskGid: string,
  ) {
    validateGid(taskGid, "task-gid");

    const hasValueFlags =
      flags.name !== undefined ||
      flags.assignee !== undefined ||
      flags.due !== undefined ||
      flags.notes !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --assignee, --due, --notes)",
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
      if (flags.assignee && flags.assignee !== "me")
        validateGid(flags.assignee, "assignee");
      if (flags.due) validateDate(flags.due, "due");

      body = { name };
      if (flags.assignee) body["assignee"] = flags.assignee;
      if (flags.due) body["due_on"] = flags.due;
      if (notes) body["notes"] = notes;
    }

    const path = `/tasks/${taskGid}/subtasks`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.subtasks.create", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "POST",
      path,
      body,
      optFields: flags.fields?.split(",") ?? ["name", "gid", "permalink_url"],
    });

    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.subtasks.create" }) +
        "\n",
    );
    hint(`Subtask created under task ${taskGid}`);
  }),
});
