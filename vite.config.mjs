import { defineConfig } from "vite";

// GitHub Pages 配下(ethanjapan.github.io/taiwan-3d-guide/)で動かすための base。
// esbuild charset=utf8: 既定asciiだとCJK文字列が\uXXXXに展開されJSが約6倍に膨らむ(Pages minify台帳の実害)。
export default defineConfig({
  base: "/taiwan-3d-guide/",
  esbuild: { charset: "utf8" },
});
