import {
  AsanaClient,
  InputError,
  formatJSON,
  resolvePat,
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
  type AccountFlag,
  type FieldsFlag,
  type PaginationFlags,
} from "@/flags";

export const listCommand = buildCommand({
  docs: { brief: "List sections in a project" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      ...paginationFlags,
      project: {
        kind: "parsed",
        brief: "Project GID",
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
      PaginationFlags & {
        project: string | undefined;
      },
  ) {
    if (!flags.project) {
      throw new InputError(
        "INPUT_MISSING",
        "--project is required",
        "Provide --project <gid> to specify which project's sections to list",
      );
    }

    validateGid(flags.project, "project");

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path: `/projects/${flags.project}/sections`,
      query: {
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: flags.fields?.split(",") ?? ["name", "created_at"],
    });

    this.process.stdout.write(
      formatJSON(
        { sections: res.data },
        { command: "sections.list", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
