import { buildCommand } from "@stricli/core";

import { AsanaClient, hint, setAccount } from "@mwp13/asx-core";
import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";

export const addCommand = buildCommand({
  docs: { brief: "Add an Asana account with a Personal Access Token" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "Account alias (e.g. 'work')",
          placeholder: "alias",
          parse: String,
        },
      ],
    },
    flags: {
      pat: {
        kind: "parsed",
        brief: "Personal Access Token",
        placeholder: "token",
        parse: String,
      },
      workspace: {
        kind: "parsed",
        brief:
          "Default workspace GID (used when --workspace is omitted on other commands)",
        parse: String,
        optional: true,
      },
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: { pat: string; workspace: string | undefined },
    alias: string,
  ) {
    const client = new AsanaClient({ pat: flags.pat });
    const res = await client.request<{
      gid: string;
      name: string;
      email: string;
      workspaces: { gid: string; name: string }[];
    }>({
      path: "/users/me",
      optFields: ["name", "email", "workspaces", "workspaces.name"],
    });

    let workspaceGid = flags.workspace;
    const workspaces = res.data.workspaces ?? [];

    if (!workspaceGid && workspaces.length === 1) {
      workspaceGid = workspaces[0]!.gid;
      hint(
        `Auto-selected workspace "${workspaces[0]!.name}" (${workspaceGid})`,
      );
    } else if (!workspaceGid && workspaces.length > 1) {
      hint(
        `Multiple workspaces found. Use --workspace <gid> to set a default. Available: ${workspaces.map((w) => `${w.name} (${w.gid})`).join(", ")}`,
      );
    }

    setAccount(alias, {
      pat: flags.pat,
      name: res.data.name,
      workspace_gid: workspaceGid,
      added_at: new Date().toISOString(),
    });

    hint(`Account "${alias}" added (${res.data.name}, ${res.data.email})`);
  }),
});
