import {
  AsanaClient,
  AsxError,
  formatJSON,
  resolvePat,
  type AsanaRequestOpts,
  type AsanaResponse,
} from "@mwp13/asx-core";

import type { AsxCliContext } from "@/context";

let capturedExitCode: number | undefined;

// Return captured exit code
export function getCapturedExitCode(): number | undefined {
  return capturedExitCode;
}

// Resolve auth, execute API request, format and write output
export async function exec<T>(opts: {
  ctx: AsxCliContext;
  account: string | undefined;
  request: AsanaRequestOpts;
  format: (res: AsanaResponse<T>) => {
    data: Record<string, unknown>;
    pagination?: { next_offset: string };
  };
  command: string;
}): Promise<void> {
  const pat = resolvePat({ account: opts.account });
  const client = new AsanaClient({ pat });
  const res = await client.request<T>(opts.request);
  const { data, pagination } = opts.format(res);
  opts.ctx.process.stdout.write(
    formatJSON(data, { command: opts.command, pagination }) + "\n",
  );
}

// Write dry-run preview output
export function preview(opts: {
  ctx: AsxCliContext;
  command: string;
  method: string;
  path: string;
  body?: unknown;
}): void {
  opts.ctx.process.stdout.write(
    formatJSON(
      {
        method: opts.method,
        path: opts.path,
        ...(opts.body !== undefined && { body: opts.body }),
      },
      { command: opts.command, dry_run: true },
    ) + "\n",
  );
}

// Catch AsxError, write JSON (piped) or text (TTY) to stdout, stash exit code
export function asxFunc<
  T extends (this: AsxCliContext, ...args: never[]) => Promise<void>,
>(fn: T): T {
  const wrapped = async function (this: AsxCliContext, ...args: unknown[]) {
    try {
      await fn.apply(this, args as never);
    } catch (err) {
      if (err instanceof AsxError) {
        const isTTY = process.stdout.isTTY === true;
        const output = isTTY
          ? err.message + (err.suggestion ? `\nhint: ${err.suggestion}` : "")
          : JSON.stringify(err.toJSON(), null, 2);
        this.process.stdout.write(output + "\n");
        capturedExitCode = err.exitCode;
        return;
      }
      throw err;
    }
  };
  return wrapped as unknown as T;
}
