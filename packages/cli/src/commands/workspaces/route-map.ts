import { buildRouteMap } from "@stricli/core";
import { listCommand } from "./list.js";

export const workspacesRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
  },
  docs: { brief: "Manage Asana workspaces" },
});
