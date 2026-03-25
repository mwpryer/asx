import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  entry: ["src/bin/cli.ts"],
  format: ["esm"],
  splitting: true,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  define: {
    __ASX_VERSION__: JSON.stringify(pkg.version),
  },
});
