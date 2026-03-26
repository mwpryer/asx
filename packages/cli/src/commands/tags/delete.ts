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
    validateGid(tagGid, "tag-gid");

    const path = `/tags/${tagGid}`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "DELETE", path },
          { command: "tags.delete", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    await client.request({
      method: "DELETE",
      path,
    });

    this.process.stdout.write(
      formatJSON({ deleted: true, gid: tagGid }, { command: "tags.delete" }) +
        "\n",
    );
    hint(`Tag ${tagGid} deleted`);
  }),
});
