import { buildCommand } from "@stricli/core";

import {
  AsanaClient,
  InputError,
  formatJSON,
  resolvePat,
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
    if (flags.project && flags.section) {
      throw new InputError(
        "INPUT_INVALID",
        "Cannot specify both --project and --section",
        "Use exactly one of --project or --section",
      );
    }
    if (!flags.project && !flags.section) {
      throw new InputError(
        "INPUT_MISSING",
        "One of --project or --section is required",
        "Pass --project <gid> or --section <gid>",
      );
    }

    if (flags.project) validateGid(flags.project, "project");
    if (flags.section) validateGid(flags.section, "section");

    const path = flags.project
      ? `/projects/${flags.project}/tasks`
      : `/sections/${flags.section}/tasks`;

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      path,
      query: {
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: flags.fields?.split(",") ?? [
        "name",
        "completed",
        "assignee.name",
        "due_on",
        "modified_at",
      ],
    });

    this.process.stdout.write(
      formatJSON(
        { tasks: res.data },
        { command: "tasks.list", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
