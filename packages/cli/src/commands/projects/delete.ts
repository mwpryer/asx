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

export const deleteCommand = buildCommand({
  docs: { brief: "Delete a project" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Project GID", placeholder: "project-gid", parse: String },
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
  ) {
    v.parse(s.gid("project-gid"), projectGid);

    const path = `/projects/${projectGid}`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "projects.delete",
        method: "DELETE",
        path,
      });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        method: "DELETE",
        path,
      },
      format: () => ({ data: { deleted: true, gid: projectGid } }),
      command: "projects.delete",
    });
    hint(`Project ${projectGid} deleted`);
  }),
});
