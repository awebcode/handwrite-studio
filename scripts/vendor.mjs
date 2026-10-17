// Copies the browser libraries used for client-side export into site/vendor (committed, so deploys need no build).
import { cpSync, mkdirSync } from "node:fs";
mkdirSync("site/vendor", { recursive: true });
for (const [from, to] of [
  ["node_modules/html2canvas/dist/html2canvas.min.js", "html2canvas.min.js"],
  ["node_modules/jspdf/dist/jspdf.umd.min.js", "jspdf.umd.min.js"],
  ["node_modules/jszip/dist/jszip.min.js", "jszip.min.js"],
  ["node_modules/zustand/esm/vanilla.mjs", "zustand-vanilla.mjs"],
]) cpSync(from, "site/vendor/" + to);
console.log("vendor files updated");

// dnd-kit's framework-free packages are several modules; bundle them once into a single file.
import { build } from "esbuild";
await build({ entryPoints: ["scripts/dnd-entry.mjs"], bundle: true, format: "esm", minify: true, target: "es2022", outfile: "site/vendor/dnd-kit.js", legalComments: "none" });
console.log("bundled dnd-kit");
