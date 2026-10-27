import { parseArgs } from "node:util";
import {
  defineCommand,
  type ArgsDef,
  type CommandDef,
  type SubCommandsDef,
} from "citty";

import { buildArgMap, GLOBAL_FLAG_DEFS } from "@/args";
import { resolveAccountToken } from "@/auth";
import { executeAsanaRequest } from "@/client";
import type { EndpointSpec } from "@/compiler";
import { printSuccess } from "@/output";
import type { RouteMap } from "@/router";
import { buildHttpRequest, collectInput, validateInput } from "@/validation";

function defineActionCommand(
  entity: string,
  action: string,
  endpoint: EndpointSpec,
): CommandDef {
  const args: ArgsDef = {
    ...buildArgMap(endpoint),
    ...GLOBAL_FLAG_DEFS,
  };
  const options: Record<string, { type: "string" | "boolean" }> = {};
  for (const [name, def] of Object.entries(args)) {
    if (def.type !== "positional") {
      options[name] = { type: def.type === "boolean" ? "boolean" : "string" };
    }
  }

  return defineCommand({
    meta: { name: action, description: endpoint.summary },
    args,
    run: async () => {
      // Citty parses loosely and drops flags placed before the action
      const { values, positionals } = parseArgs({
        args: process.argv.slice(2),
        options,
        strict: true,
        allowPositionals: true,
        allowNegative: true,
      });
      // First two positionals are the entity and action
      const collected = collectInput(endpoint, values, positionals.slice(2));
      const validated = validateInput(endpoint, collected);
      const httpRequest = buildHttpRequest(endpoint, validated);
      const command = `${entity}.${action}`;

      if (values["dry-run"]) {
        printSuccess(
          command,
          {
            method: httpRequest.method,
            path: httpRequest.path,
            query: httpRequest.query ?? null,
            body: httpRequest.body ?? null,
          },
          { dryRun: true },
        );
        return;
      }

      const account =
        typeof values.account === "string" ? values.account : undefined;
      const token = resolveAccountToken(account);
      const response = await executeAsanaRequest(httpRequest, token);
      printSuccess(command, response.data, {
        status: response.status,
        nextPage: response.nextPage,
      });
    },
  });
}

export function buildEntityCommands(routes: RouteMap): SubCommandsDef {
  const commands: SubCommandsDef = {};

  for (const [entity, actions] of routes) {
    const subs: SubCommandsDef = {};

    for (const [action, endpoint] of actions) {
      subs[action] = defineActionCommand(entity, action, endpoint);
    }

    commands[entity] = defineCommand({
      meta: { name: entity, description: `${actions.size} commands` },
      subCommands: subs,
    });
  }

  return commands;
}
