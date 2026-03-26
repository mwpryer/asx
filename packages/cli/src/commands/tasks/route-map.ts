import { buildRouteMap } from "@stricli/core";

import { commentsRouteMap } from "@/commands/tasks/comments/route-map";
import { completeCommand } from "@/commands/tasks/complete";
import { createCommand } from "@/commands/tasks/create";
import { deleteCommand } from "@/commands/tasks/delete";
import { dependenciesRouteMap } from "@/commands/tasks/dependencies/route-map";
import { duplicateCommand } from "@/commands/tasks/duplicate";
import { followersRouteMap } from "@/commands/tasks/followers/route-map";
import { getCommand } from "@/commands/tasks/get";
import { listCommand } from "@/commands/tasks/list";
import { projectsRouteMap } from "@/commands/tasks/projects/route-map";
import { searchCommand } from "@/commands/tasks/search";
import { storiesRouteMap } from "@/commands/tasks/stories/route-map";
import { subtasksRouteMap } from "@/commands/tasks/subtasks/route-map";
import { tagsRouteMap } from "@/commands/tasks/tags/route-map";
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
    duplicate: duplicateCommand,
    comments: commentsRouteMap,
    stories: storiesRouteMap,
    subtasks: subtasksRouteMap,
    dependencies: dependenciesRouteMap,
    followers: followersRouteMap,
    projects: projectsRouteMap,
    tags: tagsRouteMap,
  },
  docs: { brief: "Manage Asana tasks" },
});
