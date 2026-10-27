import { defineCommand, runCommand, runMain, type SubCommandsDef } from "citty";

import { hasCachedSchema, loadCachedSchema } from "@/cache";
import { buildEntityCommands } from "@/commands/api";
import { authCommand } from "@/commands/auth";
import { describeCommand } from "@/commands/describe";
import { schemaCommand } from "@/commands/schema";
import { CliError, exitWithError } from "@/errors";
import { buildRoutes } from "@/router";

declare const __ASX_VERSION__: string;
declare const __ASX_DESCRIPTION__: string;
const VERSION =
  typeof __ASX_VERSION__ === "string" ? __ASX_VERSION__ : "0.0.0-dev";
const DESCRIPTION =
  typeof __ASX_DESCRIPTION__ === "string"
    ? __ASX_DESCRIPTION__
    : "Agent-first Asana CLI with schema introspection";

const rawArgs = process.argv.slice(2);

const main = defineCommand({
  meta: {
    name: "asx",
    version: VERSION,
    description: DESCRIPTION,
  },
  subCommands: () => {
    const commands: SubCommandsDef = {
      auth: authCommand,
      describe: describeCommand,
      schema: schemaCommand,
    };
    // Mirror citty's subcommand resolution: first arg not starting with "-"
    const topLevel = rawArgs.find((arg) => !arg.startsWith("-"));

    // Bootstrap commands stay usable before schema cache exists
    if (topLevel && topLevel in commands) {
      return commands;
    }
    if (!hasCachedSchema()) {
      // Explain the missing cache instead of citty's bare unknown-command error
      if (topLevel) {
        exitWithError(
          new CliError({
            kind: "config",
            message: `Unknown command "${topLevel}".`,
            help: "No cached schema found. Run `asx schema update` first.",
          }),
        );
      }
      return commands;
    }

    try {
      // Build entity commands from cached schema
      return {
        ...commands,
        ...buildEntityCommands(buildRoutes(loadCachedSchema())),
      };
    } catch (err) {
      exitWithError(err);
    }
  },
});

// runMain prints usage errors as text, so it only handles help and version
if (
  rawArgs.some((arg) => arg === "--help" || arg === "-h") ||
  (rawArgs.length === 1 && (rawArgs[0] === "--version" || rawArgs[0] === "-v"))
) {
  await runMain(main);
} else {
  try {
    await runCommand(main, { rawArgs });
  } catch (err) {
    exitWithError(err);
  }
}
