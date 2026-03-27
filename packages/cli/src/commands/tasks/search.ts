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
    v.parse(s.nonBlankText("query"), query);
    if (flags.workspace !== undefined)
      v.parse(s.gid("workspace"), flags.workspace);
    if (flags.assignee !== undefined) v.parse(s.assignee(), flags.assignee);
    if (flags.project !== undefined) v.parse(s.gid("project"), flags.project);
    if (flags.tag !== undefined) v.parse(s.gid("tag"), flags.tag);
    if (flags.section !== undefined) v.parse(s.gid("section"), flags.section);
    if (flags.dueBefore !== undefined)
      v.parse(s.date("due-before"), flags.dueBefore);
    if (flags.dueAfter !== undefined)
      v.parse(s.date("due-after"), flags.dueAfter);
    if (flags.sortBy !== undefined)
      v.parse(
        s.enumOf("sort-by", [
          "due_date",
          "created_at",
          "completed_at",
          "likes",
          "modified_at",
        ]),
        flags.sortBy,
      );

    const auth = resolveAuth({ account: flags.account });
    const workspace = flags.workspace ?? auth.workspaceGid;
    if (!workspace) {
      throw new InputError(
        "INPUT_MISSING",
        "No workspace configured",
        "Pass --workspace or set a default with `asx auth add <alias> --workspace <gid>`",
      );
    }
    const params: Record<string, string | number | boolean | undefined> = {
      text: query,
      limit: resolveLimit(flags),
      ...(flags.offset && { offset: flags.offset }),
    };
    if (flags.assignee !== undefined) params["assignee.any"] = flags.assignee;
    if (flags.project !== undefined) params["projects.any"] = flags.project;
    if (!flags.completed) params["completed"] = false;
    if (flags.dueBefore !== undefined)
      params["due_on.before"] = flags.dueBefore;
    if (flags.dueAfter !== undefined) params["due_on.after"] = flags.dueAfter;
    if (flags.tag !== undefined) params["tags.any"] = flags.tag;
    if (flags.section !== undefined) params["sections.any"] = flags.section;
    if (flags.isSubtask) params["is_subtask"] = true;
    if (flags.sortBy !== undefined) params["sort_by"] = flags.sortBy;
    if (flags.sortBy !== undefined)
      params["sort_ascending"] = flags.sortAscending;

    await exec({
      ctx: this,
      account: flags.account,
      request: {
        path: `/workspaces/${workspace}/tasks/search`,
        query: params,
        optFields: parseFields(flags.fields, [
          "name",
          "completed",
          "assignee.name",
          "due_on",
          "modified_at",
        ]),
      },
      format: (res) => ({
        data: { tasks: res.data },
        pagination: paginationMeta(res),
      }),
      command: "tasks.search",
    });
  }),
});
