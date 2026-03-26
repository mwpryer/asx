import {
  AsanaClient,
  InputError,
  formatJSON,
  resolvePat,
  sanitizeText,
  validateGid,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

import { asxFunc } from "@/command";
import type { AsxCliContext } from "@/context";
import {
  accountFlag,
  dryRunFlag,
  fieldsFlag,
  type AccountFlag,
  type DryRunFlag,
  type FieldsFlag,
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
    },
  },
  func: asxFunc(async function (
    this: AsxCliContext,
    flags: AccountFlag & FieldsFlag & DryRunFlag & { name: string | undefined },
    projectGid: string,
  ) {
    validateGid(projectGid, "project-gid");

    if (!flags.name) {
      throw new InputError(
        "INPUT_MISSING",
        "--name is required",
        "Provide --name for the duplicated project",
      );
    }
    const name = sanitizeText(flags.name, "name", 1024);
    if (!name) {
      throw new InputError(
        "INPUT_INVALID",
        "Invalid name: must not be blank",
        "Provide a non-empty --name",
      );
    }

    const body = { name };
    const path = `/projects/${projectGid}/duplicate`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "projects.duplicate", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "POST",
      path,
      body,
      optFields: flags.fields?.split(",") ?? [
        "new_project",
        "new_project.name",
      ],
    });

    this.process.stdout.write(
      formatJSON({ job: res.data }, { command: "projects.duplicate" }) + "\n",
    );
  }),
});
