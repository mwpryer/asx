import { buildRouteMap } from "@stricli/core";

import { createCommand } from "@/commands/projects/create";
import { deleteCommand } from "@/commands/projects/delete";
import { duplicateCommand } from "@/commands/projects/duplicate";
import { getCommand } from "@/commands/projects/get";
import { listCommand } from "@/commands/projects/list";
import { membershipsCommand } from "@/commands/projects/memberships";
import { sectionsCommand } from "@/commands/projects/sections";
import { statusesCommand } from "@/commands/projects/statuses";
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
    sections: sectionsCommand,
    statuses: statusesCommand,
    memberships: membershipsCommand,
    "task-counts": taskCountsCommand,
  },
  docs: { brief: "Manage Asana projects" },
});
