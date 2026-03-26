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

export const addCommand = buildCommand({
  docs: { brief: "Add a dependency to a task" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Task GID", placeholder: "task-gid", parse: String },
        {
          brief: "Dependency task GID",
          placeholder: "dependency-gid",
          parse: String,
        },
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
    depGid: string,
  ) {
    v.parse(s.gid("task-gid"), taskGid);
    v.parse(s.gid("dependency-gid"), depGid);

    const path = `/tasks/${taskGid}/addDependencies`;
    const body = { dependencies: [depGid] };

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "tasks.dependencies.add", dry_run: true },
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
      formatJSON(
        { dependencies: res.data },
        { command: "tasks.dependencies.add" },
      ) + "\n",
    );
    hint(`Dependency ${depGid} added to task ${taskGid}`);
  }),
});
