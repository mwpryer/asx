import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { resolveAuth, resolvePat } from "@/auth/resolve";
import { setAccount } from "@/auth/token-store";
import { AuthError } from "@/errors/errors";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "asx-test-"));
  vi.stubEnv("XDG_CONFIG_HOME", tmpDir);
});

afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("resolvePat", () => {
  it("uses --account flag to look up stored account", () => {
    setAccount("work", { pat: "tok", added_at: "2026-01-01" });
    expect(resolvePat({ account: "work" })).toBe("tok");
  });

  it("throws for unknown --account", () => {
    expect(() => resolvePat({ account: "nope" })).toThrow(AuthError);
  });

  it("auto-selects single stored account", () => {
    setAccount("only", { pat: "tok", added_at: "2026-01-01" });
    expect(resolvePat()).toBe("tok");
  });

  it("throws when multiple accounts and no flag", () => {
    setAccount("a", { pat: "tok-1", added_at: "2026-01-01" });
    setAccount("b", { pat: "tok-2", added_at: "2026-01-01" });
    expect(() => resolvePat()).toThrow(AuthError);
  });

  it("throws when no credentials at all", () => {
    expect(() => resolvePat()).toThrow(AuthError);
  });
});

describe("resolveAuth", () => {
  it("returns workspaceGid from --account lookup", () => {
    setAccount("work", {
      pat: "tok",
      workspace_gid: "ws-123",
      added_at: "2026-01-01",
    });
    const auth = resolveAuth({ account: "work" });
    expect(auth.pat).toBe("tok");
    expect(auth.workspaceGid).toBe("ws-123");
  });

  it("returns workspaceGid from auto-selected single account", () => {
    setAccount("only", {
      pat: "tok",
      workspace_gid: "ws-456",
      added_at: "2026-01-01",
    });
    const auth = resolveAuth();
    expect(auth.workspaceGid).toBe("ws-456");
  });

  it("returns undefined workspaceGid when account has none", () => {
    setAccount("bare", { pat: "tok", added_at: "2026-01-01" });
    const auth = resolveAuth({ account: "bare" });
    expect(auth.workspaceGid).toBeUndefined();
  });
});
