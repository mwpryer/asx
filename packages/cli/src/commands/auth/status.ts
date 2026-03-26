import { AsanaClient, formatJSON, resolvePat } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import { accountFlag, type AccountFlag } from "@/flags";

export const statusCommand = buildCommand({
  docs: { brief: "Check authentication status (calls /users/me)" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      account: accountFlag,
    },
  },
  func: asxFunc(async function (this: AsxCliContext, flags: AccountFlag) {
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request<{
      gid: string;
      name: string;
      email: string;
      workspaces: Array<{ gid: string; name: string }>;
    }>({
      path: "/users/me",
      optFields: ["name", "email", "workspaces.name"],
    });

    this.process.stdout.write(
      formatJSON({ user: res.data }, { command: "auth.status" }) + "\n",
    );
  }),
});
