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
  docs: { brief: "Delete a section" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Section GID", placeholder: "section-gid", parse: String },
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
    sectionGid: string,
  ) {
    validateGid(sectionGid, "section-gid");

    const path = `/sections/${sectionGid}`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "DELETE", path },
          { command: "sections.delete", dry_run: true },
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
      formatJSON(
        { deleted: true, gid: sectionGid },
        { command: "sections.delete" },
      ) + "\n",
    );
    hint(`Section ${sectionGid} deleted`);
  }),
});
