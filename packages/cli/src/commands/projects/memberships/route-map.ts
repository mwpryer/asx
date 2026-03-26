import { buildRouteMap } from "@stricli/core";

import { addCommand } from "@/commands/projects/memberships/add";
import { listCommand } from "@/commands/projects/memberships/list";
import { removeCommand } from "@/commands/projects/memberships/remove";

export const membershipsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    add: addCommand,
    remove: removeCommand,
  },
  defaultCommand: "list",
  docs: { brief: "List, add, or remove project members" },
});
