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

export const searchCommand = buildCommand({
  docs: { brief: "Search tasks in a workspace" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        { brief: "Search query text", placeholder: "query", parse: String },
      ],
    },
    flags: {
      ...paginationFlags,
      workspace: {
        kind: "parsed",
        brief: "Workspace GID (defaults to stored account workspace)",
        parse: String,
        optional: true,
      },
      assignee: {
        kind: "parsed",
        brief: "Assignee GID or 'me'",
        parse: String,
        optional: true,
      },
      project: {
        kind: "parsed",
        brief: "Project GID to filter by",
        parse: String,
        optional: true,
      },
      completed: {
        kind: "boolean",
        brief: "Include completed tasks",
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
        assignee: string | undefined;
        project: string | undefined;
        completed: boolean;
      },
    query: string,
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
    const params: Record<string, string | number | boolean | undefined> = {
      text: query,
      limit: flags.limit ?? DEFAULT_PAGE_LIMIT,
      ...(flags.offset && { offset: flags.offset }),
    };
    if (flags.assignee) params["assignee.any"] = flags.assignee;
    if (flags.project) params["projects.any"] = flags.project;
    if (flags.completed) params["completed"] = true;

    const res = await client.request({
      path: `/workspaces/${workspace}/tasks/search`,
      query: params,
      optFields: [
        "name",
        "completed",
        "assignee.name",
        "due_on",
        "modified_at",
      ],
    });

    this.process.stdout.write(
      formatJSON(
        { tasks: res.data },
        { command: "tasks.search", pagination: paginationMeta(res) },
      ) + "\n",
    );
  },
});
