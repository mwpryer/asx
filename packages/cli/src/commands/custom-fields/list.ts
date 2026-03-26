import { buildCommand } from "@stricli/core";

import {
  AsanaClient,
  InputError,
  formatJSON,
  resolveAuth,
  validateGid,
} from "@mwp13/asx-core";
import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  resolveLimit,
  fieldsFlag,
  paginationFlags,
  paginationMeta,
  type AccountFlag,
  type FieldsFlag,
  type PaginationFlags,
} from "@/flags";

export const listCommand = buildCommand({
  docs: { brief: "List custom fields in a workspace" },
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
      path: `/workspaces/${workspace}/custom_fields`,
      query: {
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: flags.fields?.split(",") ?? [
        "name",
        "resource_subtype",
        "type",
      ],
    });

    this.process.stdout.write(
      formatJSON(
        { custom_fields: res.data },
        { command: "custom-fields.list", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
