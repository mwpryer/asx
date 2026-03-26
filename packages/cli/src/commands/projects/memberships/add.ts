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

export const addCommand = buildCommand({
  docs: { brief: "Add a member to a project" },
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

    const path = `/projects/${projectGid}/addMembers`;
    const body = { members: [userGid] };

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "projects.memberships.add",
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
      command: "projects.memberships.add",
    });
    hint(`Member ${userGid} added to project ${projectGid}`);
  }),
});
