import {
  AsanaClient,
  formatJSON,
  hint,
  resolvePat,
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
    validateGid(taskGid, "task-gid");

    const body: Record<string, unknown> = flags.json
      ? parseJsonInput(flags.json)
      : { completed: true };

    const path = `/tasks/${taskGid}`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "PUT", path, body },
          { command: "tasks.complete", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "PUT",
      path,
      body,
      optFields: parseFields(flags.fields, ["name", "gid", "completed"]),
    });
    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.complete" }) + "\n",
    );
    hint(`Task ${taskGid} marked complete`);
  }),
});
