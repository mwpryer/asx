import {
  AsanaClient,
  InputError,
  formatJSON,
  hint,
  resolvePat,
  s,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";
import * as v from "valibot";

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

export const updateCommand = buildCommand({
  docs: { brief: "Update an existing section" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Section GID", placeholder: "section-gid", parse: String },
      ],
    },
    flags: {
      name: {
        kind: "parsed",
        brief: "New section name",
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
      },
    sectionGid: string,
  ) {
    v.parse(s.gid("section-gid"), sectionGid);

    const hasValueFlags = flags.name !== undefined;

    if (flags.json && hasValueFlags) {
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
      const name =
        flags.name !== undefined
          ? v.parse(s.nonBlankText("name", 1024), flags.name)
          : undefined;

      body = {};
      if (name !== undefined) body["name"] = name;

      if (Object.keys(body).length === 0) {
        throw new InputError(
          "INPUT_MISSING",
          "No update flags provided. Pass --name or use --json.",
        );
      }
    }

    const path = `/sections/${sectionGid}`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "PUT", path, body },
          { command: "sections.update", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "PUT",
      path,
      body,
      optFields: parseFields(flags.fields, ["name", "gid"]),
    });

    this.process.stdout.write(
      formatJSON({ section: res.data }, { command: "sections.update" }) + "\n",
    );
    hint(`Section ${sectionGid} updated`);
  }),
});
