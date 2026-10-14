import { defineConfig } from "tsup";
import { copyFile } from "node:fs/promises";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    server: "src/server-index.ts",
    headless: "src/headless-index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["react", "react-dom"],
  loader: { ".css": "copy" },
  onSuccess: async () => {
    await copyFile("src/styles.css", "dist/styles.css");
  },
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  }
});
