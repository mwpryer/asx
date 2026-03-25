export interface MockContext {
  chunks: string[];
  stderrChunks: string[];
  process: {
    stdout: { write: (data: string) => boolean };
    stderr: { write: (data: string) => boolean };
    env: Record<string, string>;
  };
}

export function createMockContext(): MockContext {
  const chunks: string[] = [];
  const stderrChunks: string[] = [];
  return {
    chunks,
    stderrChunks,
    process: {
      stdout: {
        write: (data: string) => {
          chunks.push(data);
          return true;
        },
      },
      stderr: {
        write: (data: string) => {
          stderrChunks.push(data);
          return true;
        },
      },
      env: {},
    },
  };
}

export function parseOutput(ctx: MockContext): Record<string, unknown> {
  return JSON.parse(ctx.chunks.join("")) as Record<string, unknown>;
}

export async function loadCommand(cmd: { loader: () => Promise<unknown> }) {
  const loaded = await cmd.loader();
  return (
    typeof loaded === "function"
      ? loaded
      : (loaded as { default: Function }).default
  ) as Function;
}
