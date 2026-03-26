import {
  AsanaClient,
  InputError,
  formatJSON,
  resolvePat,
  sanitizeText,
  validateDate,
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
  parseJsonInput,
  type AccountFlag,
  type DryRunFlag,
  type FieldsFlag,
  type JsonFlag,
} from "@/flags";

export const updateCommand = buildCommand({
  docs: { brief: "Update an existing project" },
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
        brief: "New project name",
        parse: String,
        optional: true,
      },
      notes: {
        kind: "parsed",
        brief: "Project description (replaces existing)",
        parse: String,
        optional: true,
      },
      color: {
        kind: "parsed",
        brief: "Project colour",
        parse: String,
        optional: true,
      },
      dueOn: {
        kind: "parsed",
        brief: "Due date (YYYY-MM-DD)",
        parse: String,
        optional: true,
      },
      startOn: {
        kind: "parsed",
        brief: "Start date (YYYY-MM-DD)",
        parse: String,
        optional: true,
      },
      archive: {
        kind: "boolean",
        brief: "Archive the project",
        default: false,
      },
      unarchive: {
        kind: "boolean",
        brief: "Unarchive the project",
        default: false,
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
        notes: string | undefined;
        color: string | undefined;
        dueOn: string | undefined;
        startOn: string | undefined;
        archive: boolean;
        unarchive: boolean;
      },
    projectGid: string,
  ) {
    validateGid(projectGid, "project-gid");

    if (flags.archive && flags.unarchive) {
      throw new InputError(
        "INPUT_INVALID",
        "--archive and --unarchive are mutually exclusive",
        "Use either --archive or --unarchive, not both",
      );
    }

    const hasValueFlags =
      flags.name !== undefined ||
      flags.notes !== undefined ||
      flags.color !== undefined ||
      flags.dueOn !== undefined ||
      flags.startOn !== undefined ||
      flags.archive ||
      flags.unarchive;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --notes, --color, --due-on, --start-on, --archive, --unarchive)",
        "Use either --json or individual flags, not both",
      );
    }

    let body: Record<string, unknown>;

    if (flags.json) {
      body = parseJsonInput(flags.json);
    } else {
      const name = flags.name
        ? sanitizeText(flags.name, "name", 1024)
        : undefined;
      const notes = flags.notes
        ? sanitizeText(flags.notes, "notes")
        : undefined;
      if (flags.dueOn) validateDate(flags.dueOn, "due-on");
      if (flags.startOn) validateDate(flags.startOn, "start-on");

      body = {};
      if (name) body["name"] = name;
      if (notes) body["notes"] = notes;
      if (flags.color) body["color"] = flags.color;
      if (flags.dueOn) body["due_on"] = flags.dueOn;
      if (flags.startOn) body["start_on"] = flags.startOn;
      if (flags.archive) body["archived"] = true;
      if (flags.unarchive) body["archived"] = false;

      if (Object.keys(body).length === 0) {
        throw new InputError(
          "INPUT_MISSING",
          "No update flags provided. Pass at least one of --name, --notes, --color, --due-on, --start-on, --archive, --unarchive, or use --json.",
        );
      }
    }

    const path = `/projects/${projectGid}`;

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "PUT", path, body },
          { command: "projects.update", dry_run: true },
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
      optFields: flags.fields?.split(",") ?? [
        "name",
        "gid",
        "archived",
        "color",
        "notes",
        "due_on",
        "start_on",
        "permalink_url",
      ],
    });

    this.process.stdout.write(
      formatJSON({ project: res.data }, { command: "projects.update" }) + "\n",
    );
  }),
});
