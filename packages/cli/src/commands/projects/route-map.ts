import { buildRouteMap } from "@stricli/core";

import { createCommand } from "@/commands/projects/create";
import { deleteCommand } from "@/commands/projects/delete";
import { duplicateCommand } from "@/commands/projects/duplicate";
import { getCommand } from "@/commands/projects/get";
import { listCommand } from "@/commands/projects/list";
import { membershipsRouteMap } from "@/commands/projects/memberships/route-map";
import { statusesRouteMap } from "@/commands/projects/statuses/route-map";
import { taskCountsCommand } from "@/commands/projects/task-counts";
import { updateCommand } from "@/commands/projects/update";

export const projectsRouteMap = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
    create: createCommand,
    update: updateCommand,
    delete: deleteCommand,
    duplicate: duplicateCommand,
    statuses: statusesRouteMap,
    memberships: membershipsRouteMap,
    "task-counts": taskCountsCommand,
  },
  docs: { brief: "Manage Asana projects" },
});
