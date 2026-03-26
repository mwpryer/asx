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
  docs: { brief: "Delete a custom field definition" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Custom field GID",
          placeholder: "custom-field-gid",
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
    customFieldGid: string,
  ) {
    validateGid(customFieldGid, "custom-field-gid");

    const path = `/custom_fields/${customFieldGid}`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "DELETE", path },
          { command: "custom-fields.delete", dry_run: true },
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
        { deleted: true, gid: customFieldGid },
        { command: "custom-fields.delete" },
      ) + "\n",
    );
    hint(`Custom field ${customFieldGid} deleted`);
  }),
});
