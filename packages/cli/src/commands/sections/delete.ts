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
    v.parse(s.gid("section-gid"), sectionGid);

    const path = `/sections/${sectionGid}`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "sections.delete",
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
      format: () => ({ data: { deleted: true, gid: sectionGid } }),
      command: "sections.delete",
    });
    hint(`Section ${sectionGid} deleted`);
  }),
});
