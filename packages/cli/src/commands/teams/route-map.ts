import { buildRouteMap } from "@stricli/core";

import { getCommand } from "@/commands/teams/get";
import { listCommand } from "@/commands/teams/list";

export const teamsRouteMap = buildRouteMap({
  routes: { list: listCommand, get: getCommand },
  docs: { brief: "Manage Asana teams" },
});
