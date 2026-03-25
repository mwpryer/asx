import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function configDir(): string {
  const platform = process.platform;
  if (platform === "win32") {
    const localAppData = process.env["LOCALAPPDATA"];
    return localAppData
      ? path.join(localAppData, "asx")
      : path.join(os.homedir(), "AppData", "Local", "asx");
  }
  const xdg = process.env["XDG_CONFIG_HOME"];
  return xdg
    ? path.join(xdg, "asx")
    : path.join(os.homedir(), ".config", "asx");
}

export function accountsPath(): string {
  return path.join(configDir(), "accounts.json");
}

export function ensureConfigDir(): string {
  const dir = configDir();
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}
