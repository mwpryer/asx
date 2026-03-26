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

## Installation

Requires **Node.js 18+** and an **Asana account** with a [Personal Access Token](https://developers.asana.com/docs/personal-access-token) (PAT).

```bash
npm install -g @mwp13/asx
```

Or try without installing:

```bash
npx @mwp13/asx --help
```

## Quick Start

```bash
# store a PAT
asx auth add work --pat 1/1206789012345678:a1b2c3d4e5f6a1b2...
# with default workspace
asx auth add work --pat ... --workspace 1209876543210987
# list your workspaces
asx workspaces list
asx tasks search "launch prep" --workspace 1209876543210987
asx tasks create --name "Write docs" --project 1201234567890123 --due 2026-01-01
```

Accounts are stored in `~/.config/asx/accounts.json` (respects `XDG_CONFIG_HOME`; Windows: `%LOCALAPPDATA%\asx\`) with file permissions `0600`. Uses `--account` flag if given, otherwise auto-selects when only one account is stored.

> **Default workspace:** If you pass `--workspace <workspace-gid>` when adding an account, that workspace is used automatically by commands that require `--workspace` (e.g. `tasks search`, `projects list`) so you can omit it.

## Agent Skill

asx ships with an [agent skill](https://skills.sh) (`skills/asx/SKILL.md`) that gives AI coding agents full context on every command, flag, and workflow.

```bash
npx skills add mwpryer/asx
```

## Commands

API commands output structured JSON to stdout. Logs and hints go to stderr. Auth management commands (`add`, `remove`) only emit stderr hints.

The CLI is self-documenting: run `asx describe` to discover commands, flags, and resource fields at runtime.

```bash
# list all commands and resource types
asx describe
# show flags, args, and types for a command
asx describe tasks.create
# show available fields for a resource type
asx describe task
```

### Global flags

| Flag           | Description                        |
| -------------- | ---------------------------------- |
| `-h --help`    | Print help information and exit    |
| `-v --version` | Print version information and exit |

### Shared flags

These flags appear on multiple commands:

| Flag                | Applies to                                        | Description                                      |
| ------------------- | ------------------------------------------------- | ------------------------------------------------ |
| `--account <alias>` | All API commands                                  | Account to use                                   |
| `--fields <fields>` | All resource-returning commands                   | Comma-separated field names to return            |
| `--dry-run`         | All mutating commands                             | Preview the request without sending it           |
| `--json <json>`     | Create, update, duplicate, complete, comments add | Raw JSON request body (replaces all value flags) |

### `asx auth`

| Command                                                            | Description                                                      |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `asx auth add <alias> --pat <token> [--workspace <workspace-gid>]` | Store a PAT under an alias (optionally with a default workspace) |
| `asx auth list`                                                    | List stored accounts                                             |
| `asx auth status [--account <alias>]`                              | Show current user info (name, email, workspaces)                 |
| `asx auth remove <alias>`                                          | Remove a stored account                                          |

### `asx tasks`

| Command                                        | Description                                      |
| ---------------------------------------------- | ------------------------------------------------ |
| `asx tasks search <query>`                     | Search tasks in a workspace                      |
| `asx tasks list`                               | List tasks (requires `--project` or `--section`) |
| `asx tasks get <task-gid>`                     | Get full task details                            |
| `asx tasks create --name <name>`               | Create a new task                                |
| `asx tasks update <task-gid>`                  | Update a task                                    |
| `asx tasks complete <task-gid>`                | Mark a task as completed                         |
| `asx tasks delete <task-gid>`                  | Delete a task                                    |
| `asx tasks duplicate <task-gid> --name <name>` | Duplicate a task                                 |
| `asx tasks subtasks [list\|create] <task-gid>` | List or create subtasks                          |
| `asx tasks comments [list\|add] <task-gid>`    | List or add comments                             |
| `asx tasks comments remove <story-gid>`        | Remove a comment (by story GID)                  |
| `asx tasks stories [list] <task-gid>`          | List all stories on a task                       |

Tasks also have `dependencies`, `followers`, `projects`, and `tags` sub-resources, each supporting `list`, `add`, and `remove` (e.g. `asx tasks dependencies add <task-gid> <dep-gid>`).

`[list]` is the default subcommand and can be omitted.

```bash
asx tasks search "bug" --workspace 1209876543210987 --assignee me --project 1201234567890123
asx tasks list --project 1201234567890123
asx tasks create --name "Fix login" --project 1201234567890123 --assignee me --due 2026-03-15
asx tasks update 1205678901234567 --name "Fix login flow" --due 2026-03-20
asx tasks complete 1205678901234567
asx tasks comments add 1205678901234567 --text "Deployed"
asx tasks dependencies add 1205678901234567 9876543210
asx tasks projects add 1205678901234567 1201234567890456 --section 1203456789012345
# see all available flags
asx describe tasks.search
```

### `asx projects`

| Command                                                      | Description                   |
| ------------------------------------------------------------ | ----------------------------- |
| `asx projects list`                                          | List projects in a workspace  |
| `asx projects get <project-gid>`                             | Get project details           |
| `asx projects create --name <name>`                          | Create a new project          |
| `asx projects update <project-gid>`                          | Update a project              |
| `asx projects delete <project-gid>`                          | Delete a project              |
| `asx projects duplicate <project-gid> --name <name>`         | Duplicate a project           |
| `asx projects statuses [list\|create] <project-gid>`         | List or create status updates |
| `asx projects memberships [list\|add\|remove] <project-gid>` | List, add, or remove members  |
| `asx projects task-counts <project-gid>`                     | Get task counts for a project |

```bash
asx projects list --workspace 1209876543210987 --team 1204567890123456 --archived
asx projects create --name "Q2 Launch" --workspace 1209876543210987 --team 1204567890123456
asx projects update 1201234567890123 --name "Q2 Launch (v2)" --color "light-green"
# see all available flags
asx describe projects.create
```

### `asx workspaces` / `asx users` / `asx teams`

Read-only resources with `list` and `get <resource-gid>` commands. `users` and `teams` accept `--workspace`. List commands are paginated (default 20; use `--limit` and `--offset`).

### `asx custom-fields`

Full CRUD: `list`, `get`, `create`, `update`, `delete`. Premium Asana feature; free workspaces may return empty results.

### `asx tags`

Full CRUD: `list`, `get`, `create`, `update`, `delete`.

### `asx sections`

Full CRUD: `list`, `get`, `create`, `update`, `delete`. `--project` is required for `list` and `create`.

## Output Format

API commands produce structured JSON with a `_meta` envelope:

```json
{
  "_meta": {
    "command": "tasks.search",
    "timestamp": "2026-03-05T10:00:00.000Z"
  },
  "tasks": [ ... ]
}
```

The resource key matches the command (e.g. `tasks`, `task`, `project`, `section`).

Errors return `{ error: { code, message, suggestion } }` when piped; in a TTY they print plain text.

### Exit codes

| Code | Meaning              |
| ---- | -------------------- |
| 0    | Success              |
| 1    | General error        |
| 2    | Authentication error |
| 3    | Input error          |
| 4    | API error            |
| 5    | Rate limited         |

## Licence

MIT
