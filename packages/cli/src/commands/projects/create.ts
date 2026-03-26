import {
  AsanaClient,
  InputError,
  formatJSON,
  resolveAuth,
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

export const createCommand = buildCommand({
  docs: { brief: "Create a new project" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      name: {
        kind: "parsed",
        brief: "Project name",
        parse: String,
        optional: true,
      },
      workspace: {
        kind: "parsed",
        brief: "Workspace GID (defaults to stored account workspace)",
        parse: String,
        optional: true,
      },
      team: {
        kind: "parsed",
        brief: "Team GID",
        parse: String,
        optional: true,
      },
      color: {
        kind: "parsed",
        brief: "Project colour",
        parse: String,
        optional: true,
      },
      notes: {
        kind: "parsed",
        brief: "Project description",
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
      defaultView: {
        kind: "parsed",
        brief: "Default view (list, board, calendar, timeline)",
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
        workspace: string | undefined;
        team: string | undefined;
        color: string | undefined;
        notes: string | undefined;
        dueOn: string | undefined;
        startOn: string | undefined;
        defaultView: string | undefined;
      },
  ) {
    const hasValueFlags =
      flags.name !== undefined ||
      flags.workspace !== undefined ||
      flags.team !== undefined ||
      flags.color !== undefined ||
      flags.notes !== undefined ||
      flags.dueOn !== undefined ||
      flags.startOn !== undefined ||
      flags.defaultView !== undefined;

    if (flags.json && hasValueFlags) {
      throw new InputError(
        "INPUT_INVALID",
        "--json is mutually exclusive with value flags (--name, --workspace, --team, --color, --notes, --due-on, --start-on, --default-view)",
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
          "Provide --name or use --json with a JSON object containing a name field",
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
      const notes = flags.notes
        ? sanitizeText(flags.notes, "notes")
        : undefined;
      if (flags.workspace) validateGid(flags.workspace, "workspace");
      if (flags.team) validateGid(flags.team, "team");
      if (flags.dueOn) validateDate(flags.dueOn, "due-on");
      if (flags.startOn) validateDate(flags.startOn, "start-on");

      let workspace = flags.workspace;
      if (!workspace && !flags.dryRun) {
        const auth = resolveAuth({ account: flags.account });
        workspace = auth.workspaceGid;
        if (!workspace) {
          throw new InputError(
            "INPUT_MISSING",
            "No workspace configured",
            "Pass --workspace or set a default with `asx auth add <alias> --workspace <gid>`",
          );
        }
      }

      body = { name };
      if (workspace) body["workspace"] = workspace;
      if (flags.team) body["team"] = flags.team;
      if (flags.color) body["color"] = flags.color;
      if (notes) body["notes"] = notes;
      if (flags.dueOn) body["due_on"] = flags.dueOn;
      if (flags.startOn) body["start_on"] = flags.startOn;
      if (flags.defaultView) body["default_view"] = flags.defaultView;
    }

    if (flags.dryRun) {
      this.process.stdout.write(
        formatJSON(
          { method: "POST", path: "/projects", body },
          { command: "projects.create", dry_run: true },
        ) + "\n",
      );
      return;
    }

    const pat = resolvePat({ account: flags.account });
    const client = new AsanaClient({ pat });
    const res = await client.request({
      method: "POST",
      path: "/projects",
      body,
      optFields: flags.fields?.split(",") ?? ["name", "gid", "permalink_url"],
    });

    this.process.stdout.write(
      formatJSON({ project: res.data }, { command: "projects.create" }) + "\n",
    );
  }),
});
