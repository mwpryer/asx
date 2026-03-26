import {
  AsanaClient,
  InputError,
  formatJSON,
  hint,
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
  jsonFlag,
  parseFields,
  parseJsonInput,
  type AccountFlag,
  type DryRunFlag,
  type FieldsFlag,
  type JsonFlag,
} from "@/flags";

export const createCommand = buildCommand({
  docs: { brief: "Create a new section" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      name: {
        kind: "parsed",
        brief: "Section name",
        parse: String,
        optional: true,
      },
      project: {
        kind: "parsed",
        brief: "Project GID",
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
      JsonFlag & {
        name: string | undefined;
        project: string | undefined;
      },
  ) {
    if (flags.json && flags.name !== undefined) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name)",
        "Use either --json or individual flags, not both",
      );
    }

    if (flags.project) validateGid(flags.project, "project");
    const projectGid: string | undefined = flags.project;

    let body: Record<string, unknown>;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      if (!flags.name) {
        throw new InputError(
          "INPUT_MISSING",
          "--name is required when not using --json",
          "Provide --name or use --json with a JSON object containing a name field",
        );
      }
      if (!flags.project) {
        throw new InputError(
          "INPUT_MISSING",
          "--project is required when not using --json",
          "Provide --project <gid> to specify which project to add the section to",
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

      body = { name };
    }

    const path = projectGid ? `/projects/${projectGid}/sections` : "/sections";

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "sections.create", dry_run: true },
        ) + "\n",
      );
      return;
    }

    if (!projectGid) {
      throw new InputError(
        "INPUT_MISSING",
        "--project is required",
        "Provide --project <gid> to specify which project to add the section to",
      );
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "POST",
      path,
      body,
      optFields: parseFields(flags.fields, ["name", "gid"]),
    });

    this.process.stdout.write(
      formatJSON({ section: res.data }, { command: "sections.create" }) + "\n",
    );
    hint(`Section created in project ${projectGid}`);
  }),
});
