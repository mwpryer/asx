import { buildRouteMap } from "@stricli/core";

import { createCommand } from "@/commands/projects/statuses/create";
import { listCommand } from "@/commands/projects/statuses/list";

export const statusesRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    create: createCommand,
  },
  defaultCommand: "list",
  docs: { brief: "List or create project status updates" },
});
