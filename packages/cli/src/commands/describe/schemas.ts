// Command schemas for CLI introspection
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
  "custom-fields.get": {
    brief: "Get custom field definition details",
    positional: [
      {
        name: "custom-field-gid",
        type: "string",
        brief: "Custom field GID",
      },
    ],
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
  "custom-fields.create": {
    brief: "Create a custom field definition",
    positional: [],
    flags: [
      {
        name: "name",
        type: "string",
        required: false,
        brief: "Custom field name",
      },
      {
        name: "resource-subtype",
        type: "string",
        required: false,
        brief: "Field type (text, number, enum)",
      },
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Workspace GID (defaults to stored account workspace)",
      },
      {
        name: "description",
        type: "string",
        required: false,
        brief: "Custom field description",
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
  "custom-fields.delete": {
    brief: "Delete a custom field definition",
    positional: [
      {
        name: "custom-field-gid",
        type: "string",
        brief: "Custom field GID",
      },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "custom-fields.list": {
    brief: "List custom fields in a workspace",
    positional: [],
    flags: [
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Workspace GID (defaults to stored account workspace)",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "custom-fields.update": {
    brief: "Update a custom field definition",
    positional: [
      {
        name: "custom-field-gid",
        type: "string",
        brief: "Custom field GID",
      },
    ],
    flags: [
      {
        name: "name",
        type: "string",
        required: false,
        brief: "New custom field name",
      },
      {
        name: "description",
        type: "string",
        required: false,
        brief: "New custom field description",
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
        name: "due-before",
        type: "string",
        required: false,
        brief: "Tasks due before this date (YYYY-MM-DD)",
      },
      {
        name: "due-after",
        type: "string",
        required: false,
        brief: "Tasks due after this date (YYYY-MM-DD)",
      },
      {
        name: "sort-by",
        type: "string",
        required: false,
        brief:
          "Sort results by: due_date, created_at, completed_at, likes, modified_at",
      },
      {
        name: "sort-ascending",
        type: "boolean",
        required: false,
        brief: "Sort in ascending order",
      },
      {
        name: "tag",
        type: "string",
        required: false,
        brief: "Tag GID to filter by",
      },
      {
        name: "section",
        type: "string",
        required: false,
        brief: "Section GID to filter by",
      },
      {
        name: "is-subtask",
        type: "boolean",
        required: false,
        brief: "Filter to subtasks only",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
        name: "parent",
        type: "string",
        required: false,
        brief: "Parent task GID (create as subtask)",
      },
      {
        name: "start-on",
        type: "string",
        required: false,
        brief: "Start date (YYYY-MM-DD)",
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
        name: "start-on",
        type: "string",
        required: false,
        brief: "Start date (YYYY-MM-DD)",
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
  "tasks.comments.list": {
    brief: "List comments on a task",
    positional: [{ name: "task-gid", type: "string", brief: "Task GID" }],
    flags: [
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "tasks.comments.add": {
    brief: "Add a comment to a task",
    positional: [{ name: "task-gid", type: "string", brief: "Task GID" }],
    flags: [
      { name: "text", type: "string", required: false, brief: "Comment text" },
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
        brief: "Raw JSON request body (mutually exclusive with --text)",
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
  "tasks.comments.remove": {
    brief: "Remove a comment from a task",
    positional: [{ name: "story-gid", type: "string", brief: "Story GID" }],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.stories.list": {
    brief: "List all stories on a task",
    positional: [{ name: "task-gid", type: "string", brief: "Task GID" }],
    flags: [
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "projects.list": {
    brief: "List projects in a workspace or team",
    positional: [],
    flags: [
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Workspace GID (defaults to stored account workspace)",
      },
      {
        name: "team",
        type: "string",
        required: false,
        brief: "Team GID (list projects for a specific team)",
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
  "workspaces.get": {
    brief: "Get workspace details",
    positional: [
      { name: "workspace-gid", type: "string", brief: "Workspace GID" },
    ],
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
  "tasks.delete": {
    brief: "Delete a task",
    positional: [{ name: "task-gid", type: "string", brief: "Task GID" }],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.list": {
    brief: "List tasks in a project or section",
    positional: [],
    flags: [
      {
        name: "project",
        type: "string",
        required: false,
        brief: "Project GID",
      },
      {
        name: "section",
        type: "string",
        required: false,
        brief: "Section GID",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "tasks.subtasks.list": {
    brief: "List subtasks of a task",
    positional: [{ name: "task-gid", type: "string", brief: "Task GID" }],
    flags: [
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "tasks.subtasks.create": {
    brief: "Create a subtask",
    positional: [
      { name: "task-gid", type: "string", brief: "Parent task GID" },
    ],
    flags: [
      { name: "name", type: "string", required: false, brief: "Subtask name" },
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
        brief: "Subtask description",
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
  "tasks.dependencies.list": {
    brief: "List task dependencies",
    positional: [{ name: "task-gid", type: "string", brief: "Task GID" }],
    flags: [
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "tasks.dependencies.add": {
    brief: "Add a dependency to a task",
    positional: [
      { name: "task-gid", type: "string", brief: "Task GID" },
      { name: "dependency-gid", type: "string", brief: "Dependency task GID" },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.dependencies.remove": {
    brief: "Remove a dependency from a task",
    positional: [
      { name: "task-gid", type: "string", brief: "Task GID" },
      { name: "dependency-gid", type: "string", brief: "Dependency task GID" },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.followers.list": {
    brief: "List followers of a task",
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
  "tasks.followers.add": {
    brief: "Add a follower to a task",
    positional: [
      { name: "task-gid", type: "string", brief: "Task GID" },
      { name: "user-gid", type: "string", brief: "User GID" },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.followers.remove": {
    brief: "Remove a follower from a task",
    positional: [
      { name: "task-gid", type: "string", brief: "Task GID" },
      { name: "user-gid", type: "string", brief: "User GID" },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.projects.list": {
    brief: "List projects a task belongs to",
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
  "tasks.projects.add": {
    brief: "Add a task to a project",
    positional: [
      { name: "task-gid", type: "string", brief: "Task GID" },
      { name: "project-gid", type: "string", brief: "Project GID" },
    ],
    flags: [
      {
        name: "section",
        type: "string",
        required: false,
        brief: "Section GID (optional placement)",
      },
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.projects.remove": {
    brief: "Remove a task from a project",
    positional: [
      { name: "task-gid", type: "string", brief: "Task GID" },
      { name: "project-gid", type: "string", brief: "Project GID" },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.tags.list": {
    brief: "List tags on a task",
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
  "tasks.tags.add": {
    brief: "Add a tag to a task",
    positional: [
      { name: "task-gid", type: "string", brief: "Task GID" },
      { name: "tag-gid", type: "string", brief: "Tag GID" },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.tags.remove": {
    brief: "Remove a tag from a task",
    positional: [
      { name: "task-gid", type: "string", brief: "Task GID" },
      { name: "tag-gid", type: "string", brief: "Tag GID" },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tasks.duplicate": {
    brief: "Duplicate a task",
    positional: [{ name: "task-gid", type: "string", brief: "Task GID" }],
    flags: [
      {
        name: "name",
        type: "string",
        required: true,
        brief: "New task name (required unless --json)",
      },
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
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
  "projects.delete": {
    brief: "Delete a project",
    positional: [{ name: "project-gid", type: "string", brief: "Project GID" }],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "projects.create": {
    brief: "Create a new project",
    positional: [],
    flags: [
      { name: "name", type: "string", required: false, brief: "Project name" },
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Workspace GID (defaults to stored account workspace)",
      },
      {
        name: "team",
        type: "string",
        required: false,
        brief: "Team GID",
      },
      {
        name: "color",
        type: "string",
        required: false,
        brief: "Project colour",
      },
      {
        name: "notes",
        type: "string",
        required: false,
        brief: "Project description",
      },
      {
        name: "due-on",
        type: "string",
        required: false,
        brief: "Due date (YYYY-MM-DD)",
      },
      {
        name: "start-on",
        type: "string",
        required: false,
        brief: "Start date (YYYY-MM-DD)",
      },
      {
        name: "default-view",
        type: "string",
        required: false,
        brief: "Default view (list, board, calendar, timeline)",
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
  "projects.update": {
    brief: "Update an existing project",
    positional: [{ name: "project-gid", type: "string", brief: "Project GID" }],
    flags: [
      {
        name: "name",
        type: "string",
        required: false,
        brief: "New project name",
      },
      {
        name: "notes",
        type: "string",
        required: false,
        brief: "Project description",
      },
      {
        name: "color",
        type: "string",
        required: false,
        brief: "Project colour",
      },
      {
        name: "due-on",
        type: "string",
        required: false,
        brief: "Due date (YYYY-MM-DD)",
      },
      {
        name: "start-on",
        type: "string",
        required: false,
        brief: "Start date (YYYY-MM-DD)",
      },
      {
        name: "archive",
        type: "boolean",
        required: false,
        brief: "Archive the project",
      },
      {
        name: "unarchive",
        type: "boolean",
        required: false,
        brief: "Unarchive the project",
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
  "projects.duplicate": {
    brief: "Duplicate a project",
    positional: [{ name: "project-gid", type: "string", brief: "Project GID" }],
    flags: [
      {
        name: "name",
        type: "string",
        required: true,
        brief: "New project name (required unless --json)",
      },
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
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
  "projects.task-counts": {
    brief: "Get task counts for a project",
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
  "projects.statuses.create": {
    brief: "Create a project status update",
    positional: [{ name: "project-gid", type: "string", brief: "Project GID" }],
    flags: [
      {
        name: "title",
        type: "string",
        required: false,
        brief: "Status title",
      },
      {
        name: "color",
        type: "string",
        required: false,
        brief:
          "Status colour (on_track, at_risk, off_track, on_hold, complete)",
      },
      {
        name: "text",
        type: "string",
        required: false,
        brief: "Status body text",
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
  "projects.statuses.list": {
    brief: "List status updates for a project",
    positional: [{ name: "project-gid", type: "string", brief: "Project GID" }],
    flags: [
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "projects.memberships.list": {
    brief: "List project memberships",
    positional: [{ name: "project-gid", type: "string", brief: "Project GID" }],
    flags: [
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "projects.memberships.add": {
    brief: "Add a member to a project",
    positional: [
      { name: "project-gid", type: "string", brief: "Project GID" },
      { name: "user-gid", type: "string", brief: "User GID" },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "projects.memberships.remove": {
    brief: "Remove a member from a project",
    positional: [
      { name: "project-gid", type: "string", brief: "Project GID" },
      { name: "user-gid", type: "string", brief: "User GID" },
    ],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "users.list": {
    brief: "List users in a workspace",
    positional: [],
    flags: [
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Workspace GID (defaults to stored account workspace)",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "users.get": {
    brief: "Get user details",
    positional: [{ name: "user-gid", type: "string", brief: "User GID" }],
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
  "sections.list": {
    brief: "List sections in a project",
    positional: [],
    flags: [
      {
        name: "project",
        type: "string",
        required: true,
        brief: "Project GID",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "sections.get": {
    brief: "Get section details",
    positional: [{ name: "section-gid", type: "string", brief: "Section GID" }],
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
  "sections.create": {
    brief: "Create a new section",
    positional: [],
    flags: [
      {
        name: "name",
        type: "string",
        required: false,
        brief: "Section name",
      },
      {
        name: "project",
        type: "string",
        required: false,
        brief: "Project GID",
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
  "sections.update": {
    brief: "Update a section",
    positional: [{ name: "section-gid", type: "string", brief: "Section GID" }],
    flags: [
      {
        name: "name",
        type: "string",
        required: false,
        brief: "New section name",
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
  "sections.delete": {
    brief: "Delete a section",
    positional: [{ name: "section-gid", type: "string", brief: "Section GID" }],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "tags.list": {
    brief: "List tags in a workspace",
    positional: [],
    flags: [
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Workspace GID (defaults to stored account workspace)",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "tags.get": {
    brief: "Get tag details",
    positional: [{ name: "tag-gid", type: "string", brief: "Tag GID" }],
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
  "tags.create": {
    brief: "Create a new tag",
    positional: [],
    flags: [
      { name: "name", type: "string", required: false, brief: "Tag name" },
      {
        name: "color",
        type: "string",
        required: false,
        brief: "Tag colour",
      },
      {
        name: "notes",
        type: "string",
        required: false,
        brief: "Tag description",
      },
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Workspace GID (defaults to stored account workspace)",
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
  "tags.update": {
    brief: "Update a tag",
    positional: [{ name: "tag-gid", type: "string", brief: "Tag GID" }],
    flags: [
      { name: "name", type: "string", required: false, brief: "New tag name" },
      {
        name: "color",
        type: "string",
        required: false,
        brief: "Tag colour",
      },
      {
        name: "notes",
        type: "string",
        required: false,
        brief: "Tag description",
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
  "tags.delete": {
    brief: "Delete a tag",
    positional: [{ name: "tag-gid", type: "string", brief: "Tag GID" }],
    flags: [
      {
        name: "dry-run",
        type: "boolean",
        required: false,
        brief: "Preview the request without sending it",
      },
      {
        name: "account",
        type: "string",
        required: false,
        brief: "Account alias to use",
      },
    ],
  },
  "teams.list": {
    brief: "List teams in an organisation",
    positional: [],
    flags: [
      {
        name: "workspace",
        type: "string",
        required: false,
        brief: "Workspace GID (defaults to stored account workspace)",
      },
      {
        name: "limit",
        type: "number",
        required: false,
        brief: "Max results to return (1-100)",
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
  "teams.get": {
    brief: "Get team details",
    positional: [{ name: "team-gid", type: "string", brief: "Team GID" }],
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
};
