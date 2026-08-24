import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

const port = Number(process.env.PORT ?? 5733);
const sourcemapEnv = process.env.T3CODE_WEB_SOURCEMAP?.trim().toLowerCase();

const buildSourcemap =
  sourcemapEnv === "0" || sourcemapEnv === "false"
    ? false
    : sourcemapEnv === "hidden"
      ? "hidden"
      : true;

export default defineConfig({
  plugins: [
    tanstackRouter(),
    react(),
    babel({
      // We need to be explicit about the parser options after moving to @vitejs/plugin-react v6.0.0
      // This is because the babel plugin only automatically parses typescript and jsx based on relative paths (e.g. "**/*.ts")
      // whereas the previous version of the plugin parsed all files with a .ts extension.
      // This is causing our packages/ directory to fail to parse, as they are not relative to the CWD.
      parserOpts: { plugins: ["typescript", "jsx"] },
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
  ],
  optimizeDeps: {
    // The editor is loaded from source and imports Basis transcoder assets with
    // `?url`. Vite's dev pre-bundler cannot resolve those assets through the
    // Git dependency symlink, so leave the editor to Vite's normal transform.
    exclude: [
      "@blueprint-foundry/factorio-editor",
      "@factorio-editor-runtime",
      "@factorio-editor-globals",
    ],
    include: [
      "@pierre/diffs",
      "@pierre/diffs/react",
      "@pierre/diffs/worker/worker.js",
      // Vite does not crawl dependencies of source-linked packages. Explicitly
      // pre-bundle the editor's runtime dependencies so CommonJS packages and
      // their transitive imports receive browser-compatible ESM wrappers.
      "ajv",
      "buffer",
      "delaunator",
      "eventemitter3",
      "pako",
      "pathfinding",
      "pixi.js",
      "pixi.js/app",
      "pixi.js/basis",
      "pixi.js/events",
      "pixi.js/filters",
      "pixi.js/graphics",
      "pixi.js/sprite-tiling",
      "pixi.js/text",
      "pixi.js > gifuct-js",
      "pixi.js > ismobilejs",
      "pixi.js > parse-svg-path",
    ],
  },
  define: {
    __DATA_URL__: JSON.stringify("https://trisiak.github.io/factorio-pack-data"),
    // In dev mode, tell the web app where the WebSocket server lives
    "import.meta.env.VITE_WS_URL": JSON.stringify(process.env.VITE_WS_URL ?? ""),
    "import.meta.env.APP_VERSION": JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      "@factorio-editor-runtime": resolve(
        import.meta.dirname,
        "node_modules/@blueprint-foundry/factorio-editor/packages/editor/src/index.ts",
      ),
      "@factorio-editor-globals": resolve(
        import.meta.dirname,
        "node_modules/@blueprint-foundry/factorio-editor/packages/editor/src/common/globals.ts",
      ),
    },
    tsconfigPaths: true,
  },
  server: {
    port,
    strictPort: true,
    hmr: {
      // Explicit config so Vite's HMR WebSocket connects reliably
      // inside Electron's BrowserWindow. Vite 8 uses console.debug for
      // connection logs — enable "Verbose" in DevTools to see them.
      protocol: "ws",
      host: "localhost",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: buildSourcemap,
  },
});
