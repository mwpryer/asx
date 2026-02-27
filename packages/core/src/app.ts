import { buildApplication, text_en } from "@stricli/core";
import type { CommandContext, RouteMap, Application } from "@stricli/core";
import { AsxError } from "./errors/errors.js";

function formatAsxError(exc: unknown): string {
  if (exc instanceof AsxError) {
    if (process.stdout.isTTY !== true) {
      return JSON.stringify(exc.toJSON(), null, 2);
    }
    const lines = [exc.message];
    if (exc.suggestion) lines.push(`hint: ${exc.suggestion}`);
    return lines.join("\n");
  }
  return `Command failed: ${exc instanceof Error ? exc.message : String(exc)}`;
}

export function buildAsxApp<C extends CommandContext>(
  routes: RouteMap<C>,
  opts: { name: string; version: string },
): Application<C> {
  return buildApplication(routes, {
    name: opts.name,
    versionInfo: { currentVersion: opts.version },
    determineExitCode: (err) => (err instanceof AsxError ? err.exitCode : 1),
    localization: {
      loadText: () => ({
        ...text_en,
        exceptionWhileRunningCommand: (err: unknown) => formatAsxError(err),
        commandErrorResult: (err: unknown) => formatAsxError(err),
      }),
    },
  });
}
