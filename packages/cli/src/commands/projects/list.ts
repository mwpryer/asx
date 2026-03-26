import {
  AsanaClient,
  InputError,
  formatJSON,
  resolveAuth,
  validateGid,
} from "@mwp13/asx-core";
import { buildCommand } from "@stricli/core";

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
  docs: { brief: "List projects in a workspace" },
  parameters: {
    positional: { kind: "tuple", parameters: [] },
    flags: {
      ...paginationFlags,
      workspace: {
        kind: "parsed",
        brief: "Workspace GID (defaults to stored account workspace)",
        parse: String,
        optional: true,
      },
      team: {
        kind: "parsed",
        brief: "Team GID (list projects for a specific team)",
        parse: String,
        optional: true,
      },
      archived: {
        kind: "boolean",
        brief: "Include archived projects (default: false)",
        default: false,
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
        workspace: string | undefined;
        team: string | undefined;
        archived: boolean;
      },
  ) {
    if (flags.workspace) validateGid(flags.workspace, "workspace");
    if (flags.team) validateGid(flags.team, "team");

    const auth = resolveAuth({ account: flags.account });

    let path: string;
    if (flags.team) {
      path = `/teams/${flags.team}/projects`;
    } else {
      const workspace = flags.workspace ?? auth.workspaceGid;
      if (!workspace) {
        throw new InputError(
          "INPUT_MISSING",
          "No workspace configured",
          "Pass --workspace, --team, or set a default with `asx auth add <alias> --workspace <gid>`",
        );
      }
      path = `/workspaces/${workspace}/projects`;
    }

    const client = new AsanaClient({ pat: auth.pat });
    const res = await client.request({
      path,
      query: {
        archived: flags.archived,
        limit: resolveLimit(flags),
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: flags.fields?.split(",") ?? [
        "name",
        "archived",
        "color",
        "owner.name",
        "due_on",
        "modified_at",
        "team.name",
      ],
    });

    this.process.stdout.write(
      formatJSON(
        { projects: res.data },
        { command: "projects.list", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
