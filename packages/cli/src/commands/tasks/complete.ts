import { hint, s } from "@mwp13/asx-core";
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

export const completeCommand = buildCommand({
  docs: { brief: "Mark a task as complete" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      account: accountFlag,
      fields: fieldsFlag,
      dryRun: dryRunFlag,
      json: jsonFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & FieldsFlag & DryRunFlag & JsonFlag,
    taskGid: string,
  ) {
    v.parse(s.gid("task-gid"), taskGid);

    const body: Record<string, unknown> = flags.json
      ? { ...parseJsonInput(flags.json), completed: true }
      : { completed: true };

    const path = `/tasks/${taskGid}`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "tasks.complete",
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
        optFields: parseFields(flags.fields, ["name", "gid", "completed"]),
      },
      format: (res) => ({ data: { task: res.data } }),
      command: "tasks.complete",
    });
    hint(`Task ${taskGid} marked complete`);
  }),
});
