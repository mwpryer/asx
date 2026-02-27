import { buildRouteMap } from "@stricli/core";
import { searchCommand } from "./search.js";
import { getCommand } from "./get.js";
import { createCommand } from "./create.js";
import { updateCommand } from "./update.js";
import { completeCommand } from "./complete.js";
import { commentCommand } from "./comment.js";

export const tasksRouteMap = buildRouteMap({
  routes: {
    search: searchCommand,
    get: getCommand,
    create: createCommand,
    update: updateCommand,
    complete: completeCommand,
    comment: commentCommand,
  },
  docs: { brief: "Manage Asana tasks" },
});
