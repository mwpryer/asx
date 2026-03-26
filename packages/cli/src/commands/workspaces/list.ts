import { AsanaClient, formatJSON, resolvePat } from "@mwp13/asx-core";
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
  docs: { brief: "List accessible workspaces" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      ...paginationFlags,
      account: accountFlag,
      fields: fieldsFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & FieldsFlag & PaginationFlags,
  ) {
    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: "/workspaces",
      query: {
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: parseFields(flags.fields, ["name", "is_organization"]),
    });

    this.process.stdout.write(
      formatJSON(
        { workspaces: res.data },
        { command: "workspaces.list", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
