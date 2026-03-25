import { buildRouteMap } from "@stricli/core";

import { buildAsxApp } from "@mwp13/asx-core";
import { authRouteMap } from "@/commands/auth/route-map";
import { describeCommand } from "@/commands/describe/describe";
import { projectsRouteMap } from "@/commands/projects/route-map";
import { tasksRouteMap } from "@/commands/tasks/route-map";
import { usersRouteMap } from "@/commands/users/route-map";
import { workspacesRouteMap } from "@/commands/workspaces/route-map";

const rootRouteMap = buildRouteMap({
  routes: {
    auth: authRouteMap,
    tasks: tasksRouteMap,
    projects: projectsRouteMap,
    workspaces: workspacesRouteMap,
    users: usersRouteMap,
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
