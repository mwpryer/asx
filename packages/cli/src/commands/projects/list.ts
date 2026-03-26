import { InputError, resolveAuth, s } from "@mwp13/asx-core";
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
    if (flags.workspace) v.parse(s.gid("workspace"), flags.workspace);
    if (flags.team) v.parse(s.gid("team"), flags.team);

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

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        path,
        query: {
          archived: flags.archived,
          limit: resolveLimit(flags),
          ...(flags.offset && { offset: flags.offset }),
        },
        optFields: parseFields(flags.fields, [
          "name",
          "archived",
          "color",
          "owner.name",
          "due_on",
          "modified_at",
          "team.name",
        ]),
      },
      format: (res) => ({
        data: { projects: res.data },
        pagination: paginationMeta(res),
      }),
      command: "projects.list",
    });
  }),
});
