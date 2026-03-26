import { InputError, s } from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

import { asxFunc, preview, exec } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  fieldsFlag,
  jsonFlag,
  parseFields,
  parseJsonInput,
  type AccountFlag,
  type DryRunFlag,
  type FieldsFlag,
  type JsonFlag,
} from "@/flags";

export const duplicateCommand = buildCommand({
  docs: { brief: "Duplicate a project" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Project GID", placeholder: "project-gid", parse: String },
      ],
    },
    flags: {
      name: {
        kind: "parsed",
        brief: "Name for the duplicated project",
        parse: String,
        optional: true,
      },
      account: accountFlag,
      fields: fieldsFlag,
      dryRun: dryRunFlag,
      json: jsonFlag,
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag &
      FieldsFlag &
      DryRunFlag &
      JsonFlag & { name: string | undefined },
    projectGid: string,
  ) {
    v.parse(s.gid("project-gid"), projectGid);

    if (flags.json && flags.name !== undefined) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name)",
        "Use either --json or individual flags, not both",
      );
    }

    let body: Record<string, unknown>;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      if (!flags.name) {
        throw new InputError(
          "INPUT_MISSING",
          "--name is required when not using --json",
          "Provide --name or use --json",
        );
      }
      const name = v.parse(s.nonBlankText("name", 1024), flags.name);
      body = { name };
    }
    const path = `/projects/${projectGid}/duplicate`;

    if (flags.dryRun) {
      preview({
        ctx: this,
        command: "projects.duplicate",
        method: "POST",
        path,
        body,
      });
      return;
    }

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        method: "POST",
        path,
        body,
        optFields: parseFields(flags.fields, [
          "new_project",
          "new_project.name",
        ]),
      },
      format: (res) => ({ data: { job: res.data } }),
      command: "projects.duplicate",
    });
  }),
});
