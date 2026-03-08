/**
 * Static command schema metadata for CLI introspection.
 * Used by the `describe` command to expose command capabilities.
 */

export interface FlagSchema {
  readonly name: string;
  readonly type: "string" | "boolean" | "number";
  readonly required: boolean;
  readonly brief: string;
}

export interface PositionalSchema {
  readonly name: string;
  readonly type: "string";
  readonly brief: string;
}

export interface CommandSchema {
  readonly brief: string;
  readonly flags: readonly FlagSchema[];
  readonly positional: readonly PositionalSchema[];
}

export const COMMAND_SCHEMAS: Record<string, CommandSchema> = {
  "auth.add": {
    brief: "Add an Asana account with a Personal Access Token",
    positional: [
      { name: "alias", type: "string", brief: "Account alias (e.g. 'work')" },
    ],
    flags: [
      {
        name: "pat",
        type: "string",
        required: true,
        brief: "Personal Access Token",
      },
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Default workspace GID",
      },
    ],
  },
  "auth.list": {
    brief: "List configured accounts",
    positional: [],
    flags: [],
  },
  "auth.remove": {
    brief: "Remove a stored account",
    positional: [
      { name: "alias", type: "string", brief: "Account alias to remove" },
    ],
    flags: [],
  },
  "auth.status": {
    brief: "Check authentication status",
    positional: [],
    flags: [
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.search": {
    brief: "Search tasks in a workspace",
    positional: [{ name: "query", type: "string", brief: "Search query text" }],
    flags: [
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Workspace GID (defaults to stored account workspace)",
      },
      {
        name: "assignee",
        type: "string",
        required: false,
        brief: "Assignee GID or 'me'",
      },
      {
        name: "project",
        type: "string",
        required: false,
        brief: "Project GID to filter by",
      },
      {
        name: "completed",
        type: "boolean",
        required: false,
        brief: "Include completed tasks",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return",
      },
      {
        name: "offset",
        type: "string",
        required: false,
        brief: "Pagination offset from a previous response",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        brief: "Comma-separated field names to return (overrides defaults)",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.get": {
    brief: "Get full details of a task",
    positional: [{ name: "task-gid", type: "string", brief: "Task GID" }],
    flags: [
      {
        name: "fields",
        type: "string",
        required: false,
        brief: "Comma-separated field names to return (overrides defaults)",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.create": {
    brief: "Create a new task",
    positional: [],
    flags: [
      { name: "name", type: "string", required: false, brief: "Task name" },
      {
        name: "project",
        type: "string",
        required: false,
        brief: "Project GID",
      },
      {
        name: "assignee",
        type: "string",
        required: false,
        brief: "Assignee GID or 'me'",
      },
      {
        name: "due",
        type: "string",
        required: false,
        brief: "Due date (YYYY-MM-DD)",
      },
      {
        name: "notes",
        type: "string",
        required: false,
        brief: "Task description",
      },
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "json",
        type: "string",
        required: false,
        brief: "Raw JSON request body (mutually exclusive with value flags)",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        brief: "Comma-separated field names to return (overrides defaults)",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.update": {
    brief: "Update an existing task",
    positional: [{ name: "task-gid", type: "string", brief: "Task GID" }],
    flags: [
      { name: "name", type: "string", required: false, brief: "New task name" },
      {
        name: "assignee",
        type: "string",
        required: false,
        brief: "Assignee GID or 'me'",
      },
      {
        name: "due",
        type: "string",
        required: false,
        brief: "Due date (YYYY-MM-DD)",
      },
      {
        name: "notes",
        type: "string",
        required: false,
        brief: "Task description (replaces existing)",
      },
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "json",
        type: "string",
        required: false,
        brief: "Raw JSON request body (mutually exclusive with value flags)",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        brief: "Comma-separated field names to return (overrides defaults)",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.complete": {
    brief: "Mark a task as complete",
    positional: [{ name: "task-gid", type: "string", brief: "Task GID" }],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "json",
        type: "string",
        required: false,
        brief: "Raw JSON request body (mutually exclusive with value flags)",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        brief: "Comma-separated field names to return (overrides defaults)",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.comment": {
    brief: "Add a comment to a task",
    positional: [
      { name: "task-gid", type: "string", brief: "Task GID" },
      { name: "text", type: "string", brief: "Comment text" },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "json",
        type: "string",
        required: false,
        brief: "Raw JSON request body (mutually exclusive with value flags)",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        brief: "Comma-separated field names to return (overrides defaults)",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "projects.list": {
    brief: "List projects in a workspace",
    positional: [],
    flags: [
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Workspace GID (defaults to stored account workspace)",
      },
      {
        name: "archived",
        type: "boolean",
        required: false,
        brief: "Include archived projects",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return",
      },
      {
        name: "offset",
        type: "string",
        required: false,
        brief: "Pagination offset from a previous response",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        brief: "Comma-separated field names to return (overrides defaults)",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "projects.get": {
    brief: "Get project details",
    positional: [{ name: "project-gid", type: "string", brief: "Project GID" }],
    flags: [
      {
        name: "fields",
        type: "string",
        required: false,
        brief: "Comma-separated field names to return (overrides defaults)",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "projects.sections": {
    brief: "List sections in a project",
    positional: [{ name: "project-gid", type: "string", brief: "Project GID" }],
    flags: [
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return",
      },
      {
        name: "offset",
        type: "string",
        required: false,
        brief: "Pagination offset from a previous response",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        brief: "Comma-separated field names to return (overrides defaults)",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "workspaces.list": {
    brief: "List accessible workspaces",
    positional: [],
    flags: [
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return",
      },
      {
        name: "offset",
        type: "string",
        required: false,
        brief: "Pagination offset from a previous response",
      },
      {
        name: "fields",
        type: "string",
        required: false,
        brief: "Comma-separated field names to return (overrides defaults)",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
};
