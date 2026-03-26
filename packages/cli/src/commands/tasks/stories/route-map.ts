import { buildRouteMap } from "@stricli/core";

import { listCommand } from "@/commands/tasks/stories/list";

export const storiesRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
  },
  defaultCommand: "list",
  docs: { brief: "List all stories on a task" },
});
