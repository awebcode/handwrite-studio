// Tiny dependency-free preview server: node tools/hwbuild/preview.mjs  (PORT=8080 by default)
import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync, statSync, createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const pub = path.join(root, "public");
const port = Number(process.env.PORT || 8080);
const types = { ".html": "text/html", ".jpg": "image/jpeg", ".pdf": "application/pdf", ".json": "application/json" };

function manifests() {
  if (!existsSync(pub)) return [];
  return readdirSync(pub)
    .map((d) => path.join(pub, d, "manifest.json"))
    .filter(existsSync)
    .map((f) => JSON.parse(readFileSync(f, "utf8")));
}

createServer((req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  if (url === "/api/manifests") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify(manifests()));
  }
  const file = url === "/" ? path.join(root, "preview/index.html") : path.join(pub, url);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404);
    return res.end("not found");
  }
  res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(port, "0.0.0.0", () => console.log(`Preview on http://localhost:${port}`));
