import {
  AsanaClient,
  InputError,
  formatJSON,
  resolveAuth,
  validateDate,
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
  parseFields,
  type AccountFlag,
  type FieldsFlag,
  type PaginationFlags,
} from "@/flags";

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
      dueBefore: {
        kind: "parsed",
        brief: "Tasks due before this date (YYYY-MM-DD)",
        parse: String,
        optional: true,
      },
      dueAfter: {
        kind: "parsed",
        brief: "Tasks due after this date (YYYY-MM-DD)",
        parse: String,
        optional: true,
      },
      sortBy: {
        kind: "parsed",
        brief:
          "Sort results by: due_date, created_at, completed_at, likes, modified_at",
        parse: String,
        optional: true,
      },
      sortAscending: {
        kind: "boolean",
        brief: "Sort in ascending order (default: false)",
        default: false,
      },
      tag: {
        kind: "parsed",
        brief: "Tag GID to filter by",
        parse: String,
        optional: true,
      },
      section: {
        kind: "parsed",
        brief: "Section GID to filter by",
        parse: String,
        optional: true,
      },
      isSubtask: {
        kind: "boolean",
        brief: "Filter to subtasks only",
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
        assignee: string | undefined;
        project: string | undefined;
        completed: boolean;
        dueBefore: string | undefined;
        dueAfter: string | undefined;
        sortBy: string | undefined;
        sortAscending: boolean;
        tag: string | undefined;
        section: string | undefined;
        isSubtask: boolean;
      },
    query: string,
  ) {
    if (flags.workspace) validateGid(flags.workspace, "workspace");
    if (flags.assignee && flags.assignee !== "me")
      validateGid(flags.assignee, "assignee");
    if (flags.project) validateGid(flags.project, "project");
    if (flags.tag) validateGid(flags.tag, "tag");
    if (flags.section) validateGid(flags.section, "section");
    if (flags.dueBefore) validateDate(flags.dueBefore, "due-before");
    if (flags.dueAfter) validateDate(flags.dueAfter, "due-after");
    const validSortValues = [
      "due_date",
      "created_at",
      "completed_at",
      "likes",
      "modified_at",
    ];
    if (flags.sortBy && !validSortValues.includes(flags.sortBy)) {
      throw new InputError(
        "INPUT_INVALID",
        `Invalid --sort-by value: "${flags.sortBy}"`,
        `Must be one of: ${validSortValues.join(", ")}`,
      );
    }

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
      limit: resolveLimit(flags),
      ...(flags.offset && { offset: flags.offset }),
    };
    if (flags.assignee) params["assignee.any"] = flags.assignee;
    if (flags.project) params["projects.any"] = flags.project;
    if (!flags.completed) params["completed"] = false;
    if (flags.dueBefore) params["due_on.before"] = flags.dueBefore;
    if (flags.dueAfter) params["due_on.after"] = flags.dueAfter;
    if (flags.tag) params["tags.any"] = flags.tag;
    if (flags.section) params["sections.any"] = flags.section;
    if (flags.isSubtask) params["is_subtask"] = true;
    if (flags.sortBy) params["sort_by"] = flags.sortBy;
    if (flags.sortBy) params["sort_ascending"] = flags.sortAscending;

    const res = await client.request({
      path: `/workspaces/${workspace}/tasks/search`,
      query: params,
      optFields: parseFields(flags.fields, [
        "name",
        "completed",
        "assignee.name",
        "due_on",
        "modified_at",
      ]),
    });

    this.process.stdout.write(
      formatJSON(
        { tasks: res.data },
        { command: "tasks.search", pagination: paginationMeta(res) },
      ) + "\n",
    );
  }),
});
