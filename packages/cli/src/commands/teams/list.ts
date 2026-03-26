import {
  AsanaClient,
  InputError,
  formatJSON,
  resolveAuth,
  validateGid,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  resolveLimit,
  fieldsFlag,
  paginationFlags,
  paginationMeta,
  parseFields,
  type AccountFlag,
  type FieldsFlag,
  type PaginationFlags,
} from "@/flags";

export const listCommand = buildCommand({
  docs: { brief: "List teams in an organisation" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      ...paginationFlags,
      workspace: {
        kind: "parsed",
        brief: "Workspace GID (defaults to stored account workspace)",
        parse: String,
        optional: true,
      },
      account: accountFlag,
      fields: fieldsFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag &
      FieldsFlag &
      PaginationFlags & { workspace: string | undefined },
  ) {
    if (flags.workspace) validateGid(flags.workspace, "workspace");

    const auth = resolveAuth({ account: flags.account });
    const workspace = flags.workspace ?? auth.workspaceGid;
    if (!workspace) {
      throw new InputError(
        "INPUT_MISSING",
        "No workspace configured",
        "Pass --workspace or set a default with `asx auth add <alias> --workspace <gid>`",
      );
    }

    const client = new AsanaClient({ pat: auth.pat });
    const res = await client.request({
      path: `/organizations/${workspace}/teams`,
      query: {
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: parseFields(flags.fields, ["name"]),
    });

    this.process.stdout.write(
      formatJSON(
        { teams: res.data },
        { command: "teams.list", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
