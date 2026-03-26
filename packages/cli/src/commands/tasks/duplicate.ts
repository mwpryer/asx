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

export const duplicateCommand = buildCommand({
  docs: { brief: "Duplicate a task" },
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
        brief: "Name for the duplicated task",
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
      },
    taskGid: string,
  ) {
    v.parse(s.gid("task-gid"), taskGid);

    if (flags.json && flags.name !== undefined) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name)",
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
          "Pass --name <name> or use --json",
        );
      }
      const name = v.parse(s.nonBlankText("name", 1024), flags.name);
      body = { name };
    }

    const path = `/tasks/${taskGid}/duplicate`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.duplicate",
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
        optFields: parseFields(flags.fields, [
          "new_task",
          "new_task.name",
          "new_task.permalink_url",
        ]),
      },
      format: (res) => ({ data: { job: res.data } }),
      command: "tasks.duplicate",
    });
    hint(`Task ${taskGid} duplicated`);
  }),
});
