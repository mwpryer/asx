<h1 align="center">asx</h1>

**A fast Asana CLI with first-class AI agent support.**<br>
Structured JSON output, schema introspection, dry-run mode, and field selection.

<p>
  <a href="https://www.npmjs.com/package/@mwp13/asx"><img src="https://img.shields.io/npm/v/@mwp13/asx" alt="npm version"></a>
</p>
<br>

```bash
npm install -g @mwp13/asx
```

> [!IMPORTANT]
> This project is under active development. Expect breaking changes before v1.0.

## Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Commands](#commands)
- [Output Format](#output-format)
- [Agent Features](#agent-features)
- [Agent Skill](#agent-skill)

## Prerequisites

- **Node.js 18+**
- **An Asana account** with a [Personal Access Token](https://developers.asana.com/docs/personal-access-token) (PAT)

## Installation

```bash
npm install -g @mwp13/asx
```

Or with pnpm:

```bash
pnpm add -g @mwp13/asx
```

## Quick Start

```bash
asx auth add work --pat 1/1206789012345678:a1b2c3d4e5f6a1b2... # store a PAT
asx workspaces list # list your workspaces
asx tasks search "launch prep" --workspace 1209876543210987
asx tasks create --name "Write docs" --project 1201234567890123 --due 2026-01-01
```

## Authentication

asx uses Asana Personal Access Tokens (PATs). Store them with `asx auth add`.

### Storing accounts

```bash
asx auth add work --pat 1/1206789012345678:a1b2c3d4e5f6a1b2... # add an account
asx auth add work --pat 1/1206789012345678:a1b2c3d4e5f6a1b2... --workspace 1209876543210987 # with default workspace
asx auth list # list stored accounts
asx auth status # show current user info
asx auth remove work # remove an account
```

Accounts are stored in `~/.config/asx/accounts.json` (respects `XDG_CONFIG_HOME`; Windows: `%LOCALAPPDATA%\asx\`) with file permissions `0600`.

> **Default workspace:** If you pass `--workspace <gid>` when adding an account, that workspace is used automatically by commands that require `--workspace` (e.g. `tasks search`, `projects list`) so you can omit it.

### Resolution order

| Priority | Source                | Set via                            |
| -------- | --------------------- | ---------------------------------- |
| 1        | `--account` flag      | Per-command override               |
| 2        | Single stored account | Auto-selected when only one exists |

If multiple accounts are stored and no `--account` flag is given, asx returns an error asking you to specify one.

## Commands

Every command outputs structured JSON to stdout. Logs and hints go to stderr.

### Shared flags

These flags appear on multiple commands:

| Flag                | Applies to                                                           | Description                                                 |
| ------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| `--account <alias>` | All commands that call the API                                       | Account to use (see [Resolution order](#resolution-order))  |
| `--fields <fields>` | All resource-returning commands (`tasks`, `projects`, `workspaces`)  | Comma-separated field names to return (overrides defaults)  |
| `--dry-run`         | Mutating commands (create, update, delete, duplicate, etc.)          | Preview the request without sending it                      |
| `--json <json>`     | Mutating commands that accept a body (`create`, `update`, `comment`) | Raw JSON request body (mutually exclusive with value flags) |

### `asx describe` - Schema introspection

| Command                   | Description                               |
| ------------------------- | ----------------------------------------- |
| `asx describe`            | List all commands and resource types      |
| `asx describe <command>`  | Show command schema (flags, args, types)  |
| `asx describe <resource>` | Show available fields for a resource type |

```bash
asx describe # list all commands and resource types
asx describe tasks.create # show flags, args, and types for a command
asx describe task # show available fields for a resource type
```

### `asx auth` - Manage authentication and accounts

| Command                                                  | Description                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| `asx auth add <alias> --pat <token> [--workspace <gid>]` | Store a PAT under an alias (optionally with a default workspace) |
| `asx auth list`                                          | List stored accounts                                             |
| `asx auth status [--account <alias>]`                    | Show current user info (name, email, workspaces)                 |
| `asx auth remove <alias>`                                | Remove a stored account                                          |

```bash
asx auth add work --pat 1/1206789012345678:a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4 --workspace 1209876543210987
asx auth status --account work
```

### `asx tasks` - Manage Asana tasks

| Command                                         | Description                        |
| ----------------------------------------------- | ---------------------------------- |
| `asx tasks search <query>`                      | Search tasks in a workspace        |
| `asx tasks list`                                | List tasks in a project or section |
| `asx tasks get <gid>`                           | Get full task details              |
| `asx tasks create --name <name>`                | Create a new task                  |
| `asx tasks update <gid>`                        | Update a task                      |
| `asx tasks complete <gid>`                      | Mark a task as completed           |
| `asx tasks delete <gid>`                        | Delete a task                      |
| `asx tasks comment <gid> --text <text>`         | Add a comment to a task            |
| `asx tasks subtasks <gid>`                      | List subtasks of a task            |
| `asx tasks duplicate <gid> --name <name>`       | Duplicate a task                   |
| `asx tasks dependencies <gid>`                  | List, add, or remove dependencies  |
| `asx tasks followers <gid>`                     | Add or remove followers            |
| `asx tasks add-project <gid> --project <id>`    | Add a task to a project            |
| `asx tasks remove-project <gid> --project <id>` | Remove a task from a project       |
| `asx tasks add-tag <gid> --tag <id>`            | Add a tag to a task                |
| `asx tasks remove-tag <gid> --tag <id>`         | Remove a tag from a task           |

```bash
asx tasks search "bug" --workspace 1209876543210987 --assignee me --project 1201234567890123 # search with filters
asx tasks list --project 1201234567890123 # list tasks in a project
asx tasks create --name "Fix login" --project 1201234567890123 --assignee me --due 2026-03-15 --notes "See ticket #42"
asx tasks update 1205678901234567 --name "Fix login flow" --due 2026-03-20
asx tasks complete 1205678901234567
asx tasks comment 1205678901234567 --text "Done, deployed to staging"
asx tasks add-project 1205678901234567 --project 1201234567890456 --section 1203456789012345
asx tasks add-tag 1205678901234567 --tag 1207890123456789
```

#### tasks search flags

| Flag                   | Required | Description                                                     |
| ---------------------- | -------- | --------------------------------------------------------------- |
| `--workspace <gid>`    | No       | Workspace to search in (defaults to stored account workspace)   |
| `--assignee <gid\|me>` | No       | Filter by assignee                                              |
| `--project <gid>`      | No       | Filter by project                                               |
| `--completed`          | No       | Include completed tasks (default: false)                        |
| `--due-before <date>`  | No       | Tasks due before this date (YYYY-MM-DD)                         |
| `--due-after <date>`   | No       | Tasks due after this date (YYYY-MM-DD)                          |
| `--sort-by <field>`    | No       | Sort by: due_date, created_at, completed_at, likes, modified_at |
| `--sort-ascending`     | No       | Sort in ascending order                                         |
| `--tag <gid>`          | No       | Filter by tag                                                   |
| `--section <gid>`      | No       | Filter by section                                               |
| `--is-subtask`         | No       | Filter to subtasks only                                         |
| `--limit <n>`          | No       | Max results to return (1-100)                                   |
| `--offset <token>`     | No       | Pagination offset from a previous response                      |
| `--fields <fields>`    | No       | Comma-separated fields to return                                |
| `--account <alias>`    | No       | Account to use                                                  |

#### tasks create flags

| Flag                      | Required | Description                                         |
| ------------------------- | -------- | --------------------------------------------------- |
| `--name <text>`           | Yes      | Task name                                           |
| `--project <gid>`         | No       | Add to project                                      |
| `--parent <gid>`          | No       | Parent task GID (create as subtask)                 |
| `--assignee <gid\|me>`    | No       | Assign to user                                      |
| `--due <YYYY-MM-DD>`      | No       | Due date                                            |
| `--start-on <YYYY-MM-DD>` | No       | Start date                                          |
| `--notes <text>`          | No       | Task description                                    |
| `--fields <fields>`       | No       | Comma-separated fields to return                    |
| `--json <json>`           | No       | Raw JSON body (mutually exclusive with value flags) |
| `--dry-run`               | No       | Preview request without sending                     |
| `--account <alias>`       | No       | Account to use                                      |

#### tasks update flags

| Flag                      | Required | Description                                         |
| ------------------------- | -------- | --------------------------------------------------- |
| `--name <text>`           | No       | New task name                                       |
| `--assignee <gid\|me>`    | No       | New assignee                                        |
| `--due <YYYY-MM-DD>`      | No       | New due date                                        |
| `--start-on <YYYY-MM-DD>` | No       | New start date                                      |
| `--notes <text>`          | No       | New description                                     |
| `--fields <fields>`       | No       | Comma-separated fields to return                    |
| `--json <json>`           | No       | Raw JSON body (mutually exclusive with value flags) |
| `--dry-run`               | No       | Preview request without sending                     |
| `--account <alias>`       | No       | Account to use                                      |

### `asx projects` - Manage Asana projects

| Command                                      | Description                   |
| -------------------------------------------- | ----------------------------- |
| `asx projects list`                          | List projects in a workspace  |
| `asx projects get <gid>`                     | Get project details           |
| `asx projects create --name <name>`          | Create a new project          |
| `asx projects update <gid>`                  | Update a project              |
| `asx projects delete <gid>`                  | Delete a project              |
| `asx projects duplicate <gid> --name <name>` | Duplicate a project           |
| `asx projects sections <gid>`                | List sections in a project    |
| `asx projects statuses <gid>`                | List status updates           |
| `asx projects memberships <gid>`             | List project memberships      |
| `asx projects task-counts <gid>`             | Get task counts for a project |

```bash
asx projects list --workspace 1209876543210987
asx projects list --workspace 1209876543210987 --team 1204567890123456 --archived
asx projects get 1201234567890123
asx projects create --name "Q2 Launch" --workspace 1209876543210987 --team 1204567890123456
asx projects update 1201234567890123 --name "Q2 Launch (v2)" --color "light-green"
asx projects sections 1201234567890123
```

#### projects list flags

| Flag                | Required | Description                                          |
| ------------------- | -------- | ---------------------------------------------------- |
| `--workspace <gid>` | No       | Workspace GID (defaults to stored account workspace) |
| `--team <gid>`      | No       | Team GID (list projects for a specific team)         |
| `--archived`        | No       | Include archived projects (default: false)           |
| `--limit <n>`       | No       | Max results to return                                |
| `--offset <token>`  | No       | Pagination offset from a previous response           |
| `--fields <fields>` | No       | Comma-separated fields to return                     |
| `--account <alias>` | No       | Account to use                                       |

#### projects create flags

| Flag                      | Required | Description                                          |
| ------------------------- | -------- | ---------------------------------------------------- |
| `--name <text>`           | Yes      | Project name                                         |
| `--workspace <gid>`       | No       | Workspace GID (defaults to stored account workspace) |
| `--team <gid>`            | No       | Team GID                                             |
| `--color <colour>`        | No       | Project colour                                       |
| `--notes <text>`          | No       | Project description                                  |
| `--due-on <YYYY-MM-DD>`   | No       | Due date                                             |
| `--start-on <YYYY-MM-DD>` | No       | Start date                                           |
| `--default-view <view>`   | No       | Default view (list, board, calendar, timeline)       |
| `--json <json>`           | No       | Raw JSON body (mutually exclusive with value flags)  |
| `--dry-run`               | No       | Preview request without sending                      |
| `--account <alias>`       | No       | Account to use                                       |

### `asx workspaces` - Manage Asana workspaces

| Command                    | Description                    |
| -------------------------- | ------------------------------ |
| `asx workspaces list`      | List all accessible workspaces |
| `asx workspaces get <gid>` | Get workspace details          |

```bash
asx workspaces list
asx workspaces get 1209876543210987
```

### `asx users` - Manage Asana users

| Command               | Description               |
| --------------------- | ------------------------- |
| `asx users list`      | List users in a workspace |
| `asx users get <gid>` | Get user details          |

```bash
asx users list --workspace 1209876543210987
asx users get 1206789012345678
```

## Output Format

All commands produce structured JSON with a `_meta` envelope:

```json
{
  "_meta": {
    "command": "tasks.search",
    "account": "work",
    "timestamp": "2026-03-05T10:00:00.000Z"
  },
  "data": [ ... ]
}
```

Errors also return JSON:

```json
{
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "No Asana credentials found",
    "suggestion": "Run `asx auth add <alias>` to add an account"
  }
}
```

### Exit codes

| Code | Meaning              |
| ---- | -------------------- |
| 0    | Success              |
| 1    | General error        |
| 2    | Authentication error |
| 3    | Input error          |
| 4    | API error            |
| 5    | Rate limited         |

## Agent Features

asx is designed for AI agent use. These features help agents interact safely and efficiently.

### Input validation

GIDs, dates, and text are validated before any API call. Invalid input returns `INPUT_INVALID` (exit 3) with a `suggestion` field — no wasted API calls.

```bash
asx tasks get abc # exit 3: "Invalid GID: must be numeric"
```

### Field selection (`--fields`)

Control which fields are returned to keep responses small and context windows lean. Available on all resource-returning commands.

```bash
asx tasks get 1205678901234567 --fields name,due_on
asx tasks search "bug" --workspace 1209876543210987 --fields name,assignee.name
```

Use `asx describe task` to discover available fields for a resource type.

### Dry-run mode (`--dry-run`)

Preview mutation requests without sending them. No auth required. Available on all mutating commands (create, update, delete, duplicate, complete, comment, add-project, etc.).

```bash
asx tasks create --name "Deploy v2" --project 1201234567890123 --dry-run
```

### Raw JSON input (`--json`)

Pass a raw JSON request body for complex payloads. Mutually exclusive with value flags (`--name`, `--notes`, etc.). Combine with `--dry-run` to preview.

```bash
asx tasks create --json '{"name":"Deploy v2","custom_fields":{"1208901234567890":"high"}}' --dry-run
```

### Schema introspection (`asx describe`)

Discover commands, flags, and fields at runtime — no docs needed.

```bash
asx describe # list all commands and resource types
asx describe tasks.create # show flags, args, and types for a command
asx describe task # show available fields for a resource type
```

## Agent Skill

asx ships with an [agent skill](https://skills.sh) (`skills/asx/SKILL.md`) that gives AI coding agents full context on every command, flag, and workflow.

```bash
npx skills add mwpryer/asx
```

## Licence

MIT
