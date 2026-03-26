import { InputError, s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc, exec } from "@/command";
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

    v.parse(s.gid("project"), flags.project);

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        path: `/projects/${flags.project}/sections`,
        query: {
          limit: resolveLimit(flags),
          ...(flags.offset && { offset: flags.offset }),
        },
        optFields: parseFields(flags.fields, ["name", "created_at"]),
      },
      format: (res) => ({
        data: { sections: res.data },
        pagination: paginationMeta(res),
      }),
      command: "sections.list",
    });
  }),
});
