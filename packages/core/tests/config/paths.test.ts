import { describe, it, expect, vi, afterEach } from "vitest";
import { configDir, accountsPath } from "../../src/config/paths.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("configDir", () => {
  it("uses XDG_CONFIG_HOME when set", () => {
    vi.stubEnv("XDG_CONFIG_HOME", "/custom/config");
    const dir = configDir();
    expect(dir).toBe("/custom/config/asx");
  });

  it("falls back to ~/.config/asx", () => {
    delete process.env["XDG_CONFIG_HOME"];
    const dir = configDir();
    expect(dir).toContain(".config/asx");
  });
});

describe("accountsPath", () => {
  it("ends with accounts.json", () => {
    expect(accountsPath()).toMatch(/accounts\.json$/);
  });
});
