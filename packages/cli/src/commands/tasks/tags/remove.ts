import { AsanaClient, formatJSON, hint, resolvePat, s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  type AccountFlag,
  type DryRunFlag,
} from "@/flags";

export const removeCommand = buildCommand({
  docs: { brief: "Remove a tag from a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
        { brief: "Tag GID", placeholder: "tag-gid", parse: String },
      ],
    },
    flags: {
      account: accountFlag,
      dryRun: dryRunFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & DryRunFlag,
    taskGid: string,
    tagGid: string,
  ) {
    v.parse(s.gid("task-gid"), taskGid);
    v.parse(s.gid("tag-gid"), tagGid);

    const path = `/tasks/${taskGid}/removeTag`;
    const body = { tag: tagGid };

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.tags.remove", dry_run: true },
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
      formatJSON({ task: res.data }, { command: "tasks.tags.remove" }) + "\n",
    );
    hint(`Tag ${tagGid} removed from task ${taskGid}`);
  }),
});
