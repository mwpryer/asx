<h1 align="center">asx</h1>

**Asana from the command line - built for humans and AI agents.**<br>
Tasks, projects, workspaces, and comments. Zero boilerplate. Structured JSON output. MCP-ready.

<p>
  <a href="https://www.npmjs.com/package/@mwp13/asx"><img src="https://img.shields.io/npm/v/@mwp13/asx" alt="npm version"></a>
  <a href="https://github.com/mwp13/asx/blob/main/LICENSE"><img src="https://img.shields.io/github/license/mwp13/asx" alt="licence"></a>
  <a href="https://github.com/mwp13/asx/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/mwp13/asx/ci.yml?branch=main&label=CI" alt="CI status"></a>
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
- [Agent Context](#agent-context)
- [Packages](#packages)
- [Development](#development)

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
asx auth add work --pat xoxp-...          # store a PAT
asx workspaces list                       # list your workspaces
asx tasks search "launch prep" --workspace 123456
asx tasks create --name "Write docs" --project 789 --due 2026-03-10
```

## Authentication

asx uses Asana Personal Access Tokens (PATs). Store them with `asx auth add`.

### Storing accounts

```bash
asx auth add work --pat xoxp-...                    # add an account
asx auth add work --pat xoxp-... --workspace 123    # with default workspace (auto-used when --workspace is omitted)
asx auth list                                       # list stored accounts
asx auth status                                     # show current user info
asx auth remove work                                # remove an account
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

| Flag               | Applies to                                                              | Description                                        |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------------- |
| `--account <alias>`| All commands that call the API                                          | Account to use (see [Resolution order](#resolution-order)) |
| `--fields <fields>`| All resource-returning commands (`tasks`, `projects`, `workspaces`)     | Comma-separated field names to return (overrides defaults) |
| `--dry-run`        | Mutating commands (`tasks create/update/complete/comment`)              | Preview the request without sending it             |
| `--json <json>`    | Mutating commands (`tasks create/update/complete/comment`)              | Raw JSON request body (mutually exclusive with value flags) |

### `asx describe` - Schema introspection

| Command                  | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `asx describe`           | List all commands and resource types            |
| `asx describe <command>` | Show command schema (flags, args, types)        |
| `asx describe <resource>`| Show available fields for a resource type       |

```bash
# List everything
asx describe

# Inspect a command's flags and args
asx describe tasks.create

# Discover available fields for a resource type
asx describe task
```

### `asx auth` - Manage authentication and accounts

| Command                                                  | Description                                                      |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| `asx auth add <alias> --pat <token> [--workspace <gid>]` | Store a PAT under an alias (optionally with a default workspace) |
| `asx auth list`                                          | List stored accounts                                             |
| `asx auth status [--account <alias>]`                    | Show current user info (name, email, workspaces)                 |
| `asx auth remove <alias>`                                | Remove a stored account                                          |

```bash
asx auth add work --pat xoxp-abc123 --workspace 456
asx auth status --account work
```

### `asx tasks` - Manage Asana tasks

| Command                                      | Description              |
| -------------------------------------------- | ------------------------ |
| `asx tasks search <query> --workspace <gid>` | Search tasks by text     |
| `asx tasks get <gid>`                        | Get full task details    |
| `asx tasks create --name <name>`             | Create a new task        |
| `asx tasks update <gid>`                     | Update a task            |
| `asx tasks complete <gid>`                   | Mark a task as completed |
| `asx tasks comment <gid> <text>`             | Add a comment to a task  |

```bash
# Search with filters
asx tasks search "bug" --workspace 123 --assignee me --project 456

# Create a task
asx tasks create --name "Fix login" --project 789 --assignee me --due 2026-03-15 --notes "See ticket #42"

# Update and complete
asx tasks update 111 --name "Fix login flow" --due 2026-03-20
asx tasks complete 111
asx tasks comment 111 "Done, deployed to staging"
```

#### tasks search flags

| Flag                   | Required | Description                              |
| ---------------------- | -------- | ---------------------------------------- |
| `--workspace <gid>`    | Yes      | Workspace to search in                   |
| `--assignee <gid\|me>` | No       | Filter by assignee                       |
| `--project <gid>`      | No       | Filter by project                        |
| `--completed`          | No       | Include completed tasks (default: false) |
| `--fields <fields>`    | No       | Comma-separated fields to return         |
| `--account <alias>`    | No       | Account to use                           |

#### tasks create flags

| Flag                   | Required | Description                                         |
| ---------------------- | -------- | --------------------------------------------------- |
| `--name <text>`        | Yes      | Task name                                           |
| `--project <gid>`      | No       | Add to project                                      |
| `--assignee <gid\|me>` | No       | Assign to user                                      |
| `--due <YYYY-MM-DD>`   | No       | Due date                                            |
| `--notes <text>`       | No       | Task description                                    |
| `--fields <fields>`    | No       | Comma-separated fields to return                    |
| `--json <json>`        | No       | Raw JSON body (mutually exclusive with value flags) |
| `--dry-run`            | No       | Preview request without sending                     |
| `--account <alias>`    | No       | Account to use                                      |

#### tasks update flags

| Flag                   | Required | Description                                         |
| ---------------------- | -------- | --------------------------------------------------- |
| `--name <text>`        | No       | New task name                                       |
| `--assignee <gid\|me>` | No       | New assignee                                        |
| `--due <YYYY-MM-DD>`   | No       | New due date                                        |
| `--notes <text>`       | No       | New description                                     |
| `--fields <fields>`    | No       | Comma-separated fields to return                    |
| `--json <json>`        | No       | Raw JSON body (mutually exclusive with value flags) |
| `--dry-run`            | No       | Preview request without sending                     |
| `--account <alias>`    | No       | Account to use                                      |

### `asx projects` - Manage Asana projects

| Command                               | Description                  |
| ------------------------------------- | ---------------------------- |
| `asx projects list --workspace <gid>` | List projects in a workspace |
| `asx projects get <gid>`              | Get project details          |
| `asx projects sections <gid>`         | List sections in a project   |

```bash
asx projects list --workspace 123
asx projects list --workspace 123 --archived    # include archived
asx projects get 456
asx projects sections 456
```

#### projects list flags

| Flag                | Required | Description                                |
| ------------------- | -------- | ------------------------------------------ |
| `--workspace <gid>` | Yes      | Workspace GID                              |
| `--archived`        | No       | Include archived projects (default: false) |
| `--fields <fields>` | No       | Comma-separated fields to return           |
| `--account <alias>` | No       | Account to use                             |

### `asx workspaces` - Manage Asana workspaces

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `asx workspaces list` | List all accessible workspaces |

```bash
asx workspaces list
asx workspaces list --account work
```

#### workspaces list flags

| Flag                | Required | Description                                                |
| ------------------- | -------- | ---------------------------------------------------------- |
| `--fields <fields>` | No       | Comma-separated fields to return                           |
| `--account <alias>` | No       | Account to use (see [Resolution order](#resolution-order)) |

## Output Format

All commands produce structured JSON with a `_meta` envelope:

```json
{
  "_meta": {
    "command": "tasks.search",
    "version": "0.0.0",
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
    "message": "No credentials found",
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
asx tasks get abc    # exit 3: "Invalid GID: must be numeric"
```

### Field selection (`--fields`)

Control which fields are returned to keep responses small and context windows lean. Available on all resource-returning commands.

```bash
asx tasks get 123 --fields name,due_on
asx tasks search "bug" --workspace 456 --fields name,assignee.name
```

Use `asx describe task` to discover available fields for a resource type.

### Dry-run mode (`--dry-run`)

Preview mutation requests without sending them. No auth required. Available on `tasks create`, `tasks update`, `tasks complete`, and `tasks comment`.

```bash
asx tasks create --name "Deploy v2" --project 789 --dry-run
```

### Raw JSON input (`--json`)

Pass a raw JSON request body for complex payloads. Mutually exclusive with value flags (`--name`, `--notes`, etc.). Combine with `--dry-run` to preview.

```bash
asx tasks create --json '{"name":"Deploy v2","custom_fields":{"12345":"high"}}' --dry-run
```

### Schema introspection (`asx describe`)

Discover commands, flags, and fields at runtime — no docs needed.

```bash
asx describe                # list all commands and resource types
asx describe tasks.create   # show flags, args, and types for a command
asx describe task           # show available fields for a resource type
```

## Agent Context

asx ships with context files for AI agents and tool frameworks:

- **`AGENTS.md`** — Agent integration guide covering auth, pagination, error handling, field selection, dry-run, raw JSON, rate limiting, schema introspection, and input validation.
- **`skills/*.md`** — Per-command-group skill files (`tasks.md`, `projects.md`, `auth.md`, `workspaces.md`) with YAML frontmatter declaring requirements. These provide focused context that agents can load on demand.

## Packages

asx is a monorepo with two packages:

| Package         | npm                                                                | Description                               |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `packages/core` | [`@mwp13/asx-core`](https://www.npmjs.com/package/@mwp13/asx-core) | Asana client, auth, errors, output, types |
| `packages/cli`  | [`@mwp13/asx`](https://www.npmjs.com/package/@mwp13/asx)           | CLI binary (`asx`)                        |

### Using the core library

```typescript
import { AsanaClient, resolvePat, collectAll } from "@mwp13/asx-core";

const pat = await resolvePat({ process, account: "work" });
const client = new AsanaClient({ pat });

// Single request
const task = await client.request({
  path: "/tasks/123",
  optFields: ["name", "completed", "assignee.name"],
});

// Paginated
const allTasks = await collectAll(client, {
  path: "/workspaces/456/tasks/search",
  method: "POST",
  body: { text: "launch" },
});
```

## Development

```bash
pnpm install                      # install dependencies
pnpm build                        # build all packages
pnpm typecheck                    # type check
pnpm test                         # run tests
pnpm lint                         # lint with oxlint
pnpm format                       # check formatting with oxfmt
```

### Stack

- **Monorepo**: turborepo + pnpm workspaces
- **Build**: tsup (ESM)
- **Types**: TypeScript 5.9 (strict)
- **Test**: vitest
- **Lint**: oxlint + oxfmt
- **CLI framework**: stricli
- **Versioning**: changesets

## Licence

MIT
