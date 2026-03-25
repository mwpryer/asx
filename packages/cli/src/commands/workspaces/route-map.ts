import { buildRouteMap } from "@stricli/core";

import { getCommand } from "@/commands/workspaces/get";
import { listCommand } from "@/commands/workspaces/list";

export const workspacesRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
  },
  docs: { brief: "Manage Asana workspaces" },
});
