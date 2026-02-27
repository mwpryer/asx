import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin/cli.ts"],
  format: ["esm"],
  splitting: true,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
