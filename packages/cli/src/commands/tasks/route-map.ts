import { buildRouteMap } from "@stricli/core";

import { addProjectCommand } from "@/commands/tasks/add-project";
import { addTagCommand } from "@/commands/tasks/add-tag";
import { commentCommand } from "@/commands/tasks/comment";
import { completeCommand } from "@/commands/tasks/complete";
import { createCommand } from "@/commands/tasks/create";
import { deleteCommand } from "@/commands/tasks/delete";
import { dependenciesCommand } from "@/commands/tasks/dependencies";
import { duplicateCommand } from "@/commands/tasks/duplicate";
import { followersCommand } from "@/commands/tasks/followers";
import { getCommand } from "@/commands/tasks/get";
import { listCommand } from "@/commands/tasks/list";
import { removeProjectCommand } from "@/commands/tasks/remove-project";
import { removeTagCommand } from "@/commands/tasks/remove-tag";
import { searchCommand } from "@/commands/tasks/search";
import { subtasksCommand } from "@/commands/tasks/subtasks";
import { updateCommand } from "@/commands/tasks/update";

export const tasksRouteMap = buildRouteMap({
  routes: {
    search: searchCommand,
    list: listCommand,
    get: getCommand,
    create: createCommand,
    update: updateCommand,
    complete: completeCommand,
    delete: deleteCommand,
    comment: commentCommand,
    subtasks: subtasksCommand,
    dependencies: dependenciesCommand,
    followers: followersCommand,
    "add-project": addProjectCommand,
    "remove-project": removeProjectCommand,
    "add-tag": addTagCommand,
    "remove-tag": removeTagCommand,
    duplicate: duplicateCommand,
  },
  docs: { brief: "Manage Asana tasks" },
});
