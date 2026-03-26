import { buildAsxApp } from "@mwp13/asx-core";
import { buildRouteMap } from "@stricli/core";

import { authRouteMap } from "@/commands/auth/route-map";
import { customFieldsRouteMap } from "@/commands/custom-fields/route-map";
import { describeCommand } from "@/commands/describe/describe";
import { projectsRouteMap } from "@/commands/projects/route-map";
import { sectionsRouteMap } from "@/commands/sections/route-map";
import { tagsRouteMap } from "@/commands/tags/route-map";
import { tasksRouteMap } from "@/commands/tasks/route-map";
import { teamsRouteMap } from "@/commands/teams/route-map";
import { usersRouteMap } from "@/commands/users/route-map";
import { workspacesRouteMap } from "@/commands/workspaces/route-map";

const rootRouteMap = buildRouteMap({
  routes: {
    auth: authRouteMap,
    tasks: tasksRouteMap,
    projects: projectsRouteMap,
    sections: sectionsRouteMap,
    tags: tagsRouteMap,
    workspaces: workspacesRouteMap,
    users: usersRouteMap,
    teams: teamsRouteMap,
    "custom-fields": customFieldsRouteMap,
    describe: describeCommand,
  },
  docs: {
    brief: "Asana CLI toolkit",
  },
});

export const app = buildAsxApp(rootRouteMap, {
  name: "asx",
  version: __ASX_VERSION__,
});
