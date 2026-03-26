import {
  AsanaClient,
  InputError,
  formatJSON,
  hint,
  resolvePat,
  sanitizeText,
  validateGid,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  fieldsFlag,
  type AccountFlag,
  type DryRunFlag,
  type FieldsFlag,
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
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag &
      FieldsFlag &
      DryRunFlag & {
        name: string | undefined;
      },
    taskGid: string,
  ) {
    validateGid(taskGid, "task-gid");

    if (!flags.name) {
      throw new InputError(
        "INPUT_MISSING",
        "--name is required",
        "Pass --name <name>",
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

    const path = `/tasks/${taskGid}/duplicate`;
    const body = { name };

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.duplicate", dry_run: true },
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
      optFields: flags.fields?.split(",") ?? [
        "new_task",
        "new_task.name",
        "new_task.permalink_url",
      ],
    });

    this.process.stdout.write(
      formatJSON({ job: res.data }, { command: "tasks.duplicate" }) + "\n",
    );
    hint(`Task ${taskGid} duplicated as "${flags.name}"`);
  }),
});
