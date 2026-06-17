// build.mjs — inlinet CSS en JS-modules in één bestand
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const css = readFileSync("src/styles.css", "utf8");
// Modules in afhankelijkheidsvolgorde; strip import/export voor inline-bundel
const order = ["logic", "content", "storage", "app"];
let js = "";
for (const name of order) {
  let src = readFileSync(`src/${name}.js`, "utf8");
  src = src.replace(/^\s*import[^;]*;\s*$/gm, "");
  src = src.replace(/^export\s+/gm, "");
  js += `\n// --- ${name}.js ---\n` + src + "\n";
}
let html = readFileSync("index.html", "utf8");
html = html.replace(/<link rel="stylesheet"[^>]*>/, `<style>\n${css}\n</style>`);
html = html.replace(/<script type="module"[^>]*><\/script>/, `<script>\n${js}\n</script>`);
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", html);
console.log("dist/index.html gebouwd:", html.length, "tekens");
