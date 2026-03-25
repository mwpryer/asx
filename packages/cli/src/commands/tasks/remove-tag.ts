import { buildCommand } from "@stricli/core";

import {
  AsanaClient,
  InputError,
  formatJSON,
  hint,
  resolvePat,
  validateGid,
} from "@mwp13/asx-core";
import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  type AccountFlag,
  type DryRunFlag,
} from "@/flags";

export const removeTagCommand = buildCommand({
  docs: { brief: "Remove a tag from a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
      ],
    },
    flags: {
      tag: {
        kind: "parsed",
        brief: "Tag GID",
        parse: String,
        optional: true,
      },
      account: accountFlag,
      dryRun: dryRunFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag &
      DryRunFlag & {
        tag: string | undefined;
      },
    taskGid: string,
  ) {
    validateGid(taskGid, "task-gid");

    if (!flags.tag) {
      throw new InputError(
        "INPUT_MISSING",
        "--tag is required",
        "Pass --tag <gid>",
      );
    }
    validateGid(flags.tag, "tag");

    const path = `/tasks/${taskGid}/removeTag`;
    const body = { tag: flags.tag };

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.remove-tag", dry_run: true },
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
    });

    this.process.stdout.write(
      formatJSON({ task: res.data }, { command: "tasks.remove-tag" }) + "\n",
    );
    hint(`Tag ${flags.tag} removed from task ${taskGid}`);
  }),
});
