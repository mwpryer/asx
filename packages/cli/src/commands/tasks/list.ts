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
  docs: { brief: "List tasks in a project or section" },
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
      section: {
        kind: "parsed",
        brief: "Section GID",
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
        section: string | undefined;
      },
  ) {
    if (flags.project !== undefined && flags.section !== undefined) {
      throw new InputError(
        "INPUT_INVALID",
        "Cannot specify both --project and --section",
        "Use exactly one of --project or --section",
      );
    }
    if (flags.project === undefined && flags.section === undefined) {
      throw new InputError(
        "INPUT_MISSING",
        "One of --project or --section is required",
        "Pass --project <gid> or --section <gid>",
      );
    }

    if (flags.project !== undefined) v.parse(s.gid("project"), flags.project);
    if (flags.section !== undefined) v.parse(s.gid("section"), flags.section);

    const path =
      flags.project !== undefined
        ? `/projects/${flags.project}/tasks`
        : `/sections/${flags.section}/tasks`;

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        path,
        query: {
          limit: resolveLimit(flags),
          ...(flags.offset && { offset: flags.offset }),
        },
        optFields: parseFields(flags.fields, [
          "name",
          "completed",
          "assignee.name",
          "due_on",
          "modified_at",
        ]),
      },
      format: (res) => ({
        data: { tasks: res.data },
        pagination: paginationMeta(res),
      }),
      command: "tasks.list",
    });
  }),
});
