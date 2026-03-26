import { formatJSON, loadAccounts } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";

export const listCommand = buildCommand({
  docs: { brief: "List configured accounts" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {},
  },
  func: asxFunc(async function (this: AsxCliContext) {
    const accounts = loadAccounts();
    const data = {
      accounts: Object.entries(accounts).map(([alias, acct]) => ({
        alias,
        name: acct.name,
        workspace_gid: acct.workspace_gid,
        added_at: acct.added_at,
      })),
    };
    this.process.stdout.write(
      formatJSON(data, { command: "auth.list" }) + "\n",
    );
  }),
});
