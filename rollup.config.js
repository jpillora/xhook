import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import { version } from "./package.json";

const year = new Date().getFullYear();

const banner =
  `//XHook - v${version} - ` +
  "https://github.com/jpillora/xhook\n" +
  `//Jaime Pillora <dev@jpillora.com> - ` +
  `MIT Copyright ${year}`;

const baseIifeConfig = {
  banner,
  format: "iife",
  name: "xhook",
  sourcemap: true,
};

export default defineConfig({
  input: "src/main.js",
  output: [
    {
      ...baseIifeConfig,
      file: "dist/xhook.js",
    },
    {
      ...baseIifeConfig,
      file: "dist/xhook.min.js",
      plugins: [
        terser({
          format: {
            comments: /^(XHook|Jaime)/,
          },
        }),
      ],
    },
    {
      dir: "lib",
      format: "cjs",
      exports: "auto",
    },
    {
      dir: "es",
      format: "esm",
    },
  ],
  plugins: [typescript()],
});
