import { buildCommand } from "@stricli/core";
import {
  AsanaClient,
  InputError,
  formatJSON,
  resolveAuth,
} from "@mwp13/asx-core";
import type { AsxCliContext } from "../../context.js";
import {
  accountFlag,
  DEFAULT_PAGE_LIMIT,
  paginationFlags,
  paginationMeta,
  type AccountFlag,
  type PaginationFlags,
} from "../../flags.js";

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
      archived: {
        kind: "boolean",
        brief: "Include archived projects (default: false)",
        default: false,
      },
      account: accountFlag,
    },
  },
  func: async function (
    this: AsxCliContext,
    flags: AccountFlag &
      PaginationFlags & {
        workspace: string | undefined;
        archived: boolean;
      },
  ) {
    const auth = resolveAuth({ account: flags.account });
    const workspace = flags.workspace ?? auth.workspaceGid;
    if (!workspace) {
      throw new InputError(
        "INPUT_MISSING",
        "No workspace configured",
        "Pass --workspace or set a default with `asx auth add <alias> --workspace <gid>`",
      );
    }
    const client = new AsanaClient({ pat: auth.pat });
    const res = await client.request({
      path: `/workspaces/${workspace}/projects`,
      query: {
        archived: flags.archived,
        limit: flags.limit ?? DEFAULT_PAGE_LIMIT,
        ...(flags.offset && { offset: flags.offset }),
      },
      optFields: ["name", "archived", "color", "owner.name"],
    });

    this.process.stdout.write(
      formatJSON(
        { projects: res.data },
        { command: "projects.list", pagination: paginationMeta(res) },
      ) + "\n",
    );
  },
});
