import type { CommandContext } from "@stricli/core";

export interface AsxCliContext extends CommandContext {
  readonly process: Pick<NodeJS.Process, "stderr" | "stdout" | "env">;
}

export function buildCliContext(proc: NodeJS.Process): AsxCliContext {
  return { process: proc };
}
