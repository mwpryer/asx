import {
  AsanaClient,
  InputError,
  STATUS_COLOURS,
  formatJSON,
  hint,
  resolvePat,
  sanitizeText,
  validateEnum,
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
  docs: { brief: "Create a project status update" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Project GID", placeholder: "project-gid", parse: String },
      ],
    },
    flags: {
      title: {
        kind: "parsed",
        brief: "Status title",
        parse: String,
        optional: true,
      },
      color: {
        kind: "parsed",
        brief:
          "Status colour (on_track, at_risk, off_track, on_hold, complete)",
        parse: String,
        optional: true,
      },
      text: {
        kind: "parsed",
        brief: "Status body text",
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
        title: string | undefined;
        color: string | undefined;
        text: string | undefined;
      },
    projectGid: string,
  ) {
    validateGid(projectGid, "project-gid");

    const hasValueFlags =
      flags.title !== undefined ||
      flags.color !== undefined ||
      flags.text !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--title, --color, --text)",
        "Use either --json or individual flags, not both",
      );
    }

    let body: Record<string, unknown>;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      if (!flags.title) {
        throw new InputError(
          "INPUT_MISSING",
          "--title is required when not using --json",
          "Provide --title or use --json with a JSON object containing a title field",
        );
      }
      const title = sanitizeText(flags.title, "title", 1024);
      if (!title) {
        throw new InputError(
          "INPUT_INVALID",
          "Invalid title: must not be blank",
          "Provide a non-empty --title",
        );
      }
      if (flags.color) validateEnum(flags.color, "color", STATUS_COLOURS);
      const text = flags.text ? sanitizeText(flags.text, "text") : undefined;

      body = { title };
      if (flags.color) body["color"] = flags.color;
      if (text) body["text"] = text;
    }

    const path = `/projects/${projectGid}/project_statuses`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path, body },
          { command: "projects.statuses.create", dry_run: true },
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
      optFields: parseFields(flags.fields, [
        "gid",
        "title",
        "color",
        "text",
        "created_by.name",
        "created_at",
      ]),
    });

    this.process.stdout.write(
      formatJSON(
        { status: res.data },
        { command: "projects.statuses.create" },
      ) + "\n",
    );
    hint(`Status update created for project ${projectGid}`);
  }),
});
