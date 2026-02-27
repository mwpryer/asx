import { buildRouteMap } from "@stricli/core";
import { buildAsxApp } from "@mwp13/asx-core";
import { authRouteMap } from "./commands/auth/route-map.js";
import { tasksRouteMap } from "./commands/tasks/route-map.js";
import { projectsRouteMap } from "./commands/projects/route-map.js";
import { workspacesRouteMap } from "./commands/workspaces/route-map.js";

const rootRouteMap = buildRouteMap({
  routes: {
    auth: authRouteMap,
    tasks: tasksRouteMap,
    projects: projectsRouteMap,
    workspaces: workspacesRouteMap,
  },
  docs: {
    brief: "Asana CLI toolkit",
  },
});

export const app = buildAsxApp(rootRouteMap, {
  name: "asx",
  version: "0.0.0",
});
