import { InputError, hint, s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc, preview, exec } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  fieldsFlag,
  jsonFlag,
  parseFields,
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
    v.parse(s.gid("task-gid"), taskGid);

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
      if (flags.name === undefined) {
        throw new InputError(
          "INPUT_MISSING",
          "--name is required when not using --json",
          "Provide --name or use --json with a JSON object containing a name field",
        );
      }
      const name = v.parse(s.nonBlankText("name", 1024), flags.name);
      const notes =
        flags.notes !== undefined
          ? v.parse(s.text("notes"), flags.notes)
          : undefined;
      if (flags.assignee !== undefined) v.parse(s.assignee(), flags.assignee);
      if (flags.due !== undefined) v.parse(s.date("due"), flags.due);

      body = { name };
      if (flags.assignee !== undefined) body["assignee"] = flags.assignee;
      if (flags.due !== undefined) body["due_on"] = flags.due;
      if (notes !== undefined) body["notes"] = notes;
    }

    const path = `/tasks/${taskGid}/subtasks`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.subtasks.create",
        method: "POST",
        path,
        body,
      });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        method: "POST",
        path,
        body,
        optFields: parseFields(flags.fields, ["name", "gid", "permalink_url"]),
      },
      format: (res) => ({ data: { task: res.data } }),
      command: "tasks.subtasks.create",
    });
    hint(`Subtask created under task ${taskGid}`);
  }),
});
