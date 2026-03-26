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
  docs: { brief: "Delete a tag" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [{ brief: "Tag GID", placeholder: "tag-gid", parse: String }],
    },
    flags: {
      account: accountFlag,
      dryRun: dryRunFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & DryRunFlag,
    tagGid: string,
  ) {
    v.parse(s.gid("tag-gid"), tagGid);

    const path = `/tags/${tagGid}`;

    if (flags.dryRun) {
      preview({ ctx: this, command: "tags.delete", method: "DELETE", path });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        method: "DELETE",
        path,
      },
      format: () => ({ data: { deleted: true, gid: tagGid } }),
      command: "tags.delete",
    });
    hint(`Tag ${tagGid} deleted`);
  }),
});
