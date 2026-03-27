import { InputError, s } from "@mwp13/asx-core";
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

export const updateCommand = buildCommand({
  docs: { brief: "Update an existing task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      name: {
        kind: "parsed",
        brief: "New task name",
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
        brief: "Task description (replaces existing)",
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
        assignee: string | undefined;
        due: string | undefined;
        notes: string | undefined;
        startOn: string | undefined;
      },
    taskGid: string,
  ) {
    v.parse(s.gid("task-gid"), taskGid);

    const hasValueFlags =
      flags.name !== undefined ||
      flags.assignee !== undefined ||
      flags.due !== undefined ||
      flags.notes !== undefined ||
      flags.startOn !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --assignee, --due, --notes, --start-on)",
        "Use either --json or individual flags, not both",
      );
    }

    let body: Record<string, unknown>;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      const name =
        flags.name !== undefined
          ? v.parse(s.nonBlankText("name", 1024), flags.name)
          : undefined;
      const notes =
        flags.notes !== undefined
          ? v.parse(s.text("notes"), flags.notes)
          : undefined;
      if (flags.assignee !== undefined) v.parse(s.assignee(), flags.assignee);
      if (flags.due !== undefined) v.parse(s.date("due"), flags.due);
      if (flags.startOn !== undefined)
        v.parse(s.date("start-on"), flags.startOn);

      body = {};
      if (name !== undefined) body["name"] = name;
      if (flags.assignee !== undefined) body["assignee"] = flags.assignee;
      if (flags.due !== undefined) body["due_on"] = flags.due;
      if (flags.startOn !== undefined) body["start_on"] = flags.startOn;
      if (notes !== undefined) body["notes"] = notes;

      if (Object.keys(body).length === 0) {
        throw new InputError(
          "INPUT_MISSING",
          "No update flags provided. Pass at least one of --name, --assignee, --due, --start-on, --notes, or use --json.",
        );
      }
    }

    const path = `/tasks/${taskGid}`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.update",
        method: "PUT",
        path,
        body,
      });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        method: "PUT",
        path,
        body,
        optFields: parseFields(flags.fields, [
          "name",
          "gid",
          "completed",
          "assignee.name",
          "due_on",
          "notes",
          "permalink_url",
        ]),
      },
      format: (res) => ({ data: { task: res.data } }),
      command: "tasks.update",
    });
  }),
});
