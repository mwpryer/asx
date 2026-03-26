import { hint, s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc, preview, exec } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  type AccountFlag,
  type DryRunFlag,
} from "@/flags";

export const removeCommand = buildCommand({
  docs: { brief: "Remove a member from a project" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Project GID", placeholder: "project-gid", parse: String },
        { brief: "User GID", placeholder: "user-gid", parse: String },
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
    projectGid: string,
    userGid: string,
  ) {
    v.parse(s.gid("project-gid"), projectGid);
    v.parse(s.gid("user-gid"), userGid);

    const path = `/projects/${projectGid}/removeMembers`;
    const body = { members: [userGid] };

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "projects.memberships.remove",
        method: "POST",
        path,
        body,
      });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: { method: "POST", path, body },
      format: () => ({ data: { members: {} } }),
      command: "projects.memberships.remove",
    });
    hint(`Member ${userGid} removed from project ${projectGid}`);
  }),
});
