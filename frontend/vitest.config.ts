import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Disable oxc to fall back to esbuild which respects our jsx transform
    // @ts-ignore
    oxc: false,
  },
  esbuild: {
    jsx: "transform",
  },
});
