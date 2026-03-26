import { describe, it, expect } from "vitest";

import { getCommand } from "@/commands/custom-fields/get";
import { listCommand } from "@/commands/custom-fields/list";
import { createMockContext, loadCommand, parseOutput } from "./helpers";

describe("custom-fields get", () => {
  it("rejects non-numeric GID", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(getCommand);
    await func.call(ctx, { account: undefined, fields: undefined }, "abc");
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });

  it("rejects empty GID", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(getCommand);
    await func.call(ctx, { account: undefined, fields: undefined }, "");
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });

  it("rejects GID starting with zero", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(getCommand);
    await func.call(ctx, { account: undefined, fields: undefined }, "0123");
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });
});

describe("custom-fields list", () => {
  it("rejects non-numeric workspace GID", async () => {
    const ctx = createMockContext();
    const func = await loadCommand(listCommand);
    await func.call(ctx, {
      account: undefined,
      fields: undefined,
      workspace: "bad",
      limit: undefined,
      offset: undefined,
    });
    const out = parseOutput(ctx);
    expect(out["error"]).toBeDefined();
    expect((out["error"] as Record<string, unknown>)["code"]).toBe(
      "INPUT_INVALID",
    );
  });
});
