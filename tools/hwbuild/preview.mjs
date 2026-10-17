// Tiny preview server (no framework):  node tools/hwbuild/preview.mjs     PORT=8080 HOST=127.0.0.1
//   /             Handwrite Studio (site/): home, /editor/, /cover/
//   /generated/   pages made by the Node generator (student tabs, Download as PDF)
import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync, statSync, createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { findChrome } from "./lib/chrome.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const pub = path.join(root, "public");
const site = path.join(root, "site");
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "127.0.0.1";
const types = { ".html": "text/html; charset=utf-8", ".jpg": "image/jpeg", ".pdf": "application/pdf", ".json": "application/json", ".png": "image/png",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8" };

function manifests() {
  if (!existsSync(pub)) return [];
  return readdirSync(pub)
    .map((d) => path.join(pub, d, "manifest.json"))
    .filter(existsSync)
    .map((f) => JSON.parse(readFileSync(f, "utf8")));
}

// Render the cover page HTML in headless Chromium. Scripts are off and only data: URLs load.
async function renderCover(html, kind) {
  const exe = findChrome();
  const browser = await chromium.launch({ ...(exe ? { executablePath: exe } : {}), args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  try {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 794, height: 1122 }, deviceScaleFactor: kind === "png" ? 2 : 1 });
    const page = await ctx.newPage();
    await page.route("**/*", (r) => (r.request().url().startsWith("data:") || r.request().url() === "about:blank" ? r.continue() : r.abort()));
    await page.setContent(html, { waitUntil: "load" });
    if (kind === "png") return await page.locator("#sheet").screenshot({ type: "png" });
    return await page.pdf({ width: "794px", height: "1122px", printBackground: true, pageRanges: "1", margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  } finally {
    await browser.close();
  }
}

function readBody(req, limit = 40 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on("data", (c) => { n += c.length; if (n > limit) { reject(new Error("too large")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendFile(res, file) {
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
}

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || "/").split("?")[0]);
  try {
    if (req.method === "POST" && /^\/api\/cover\/(pdf|png)$/.test(url)) {
      const kind = url.endsWith("pdf") ? "pdf" : "png";
      const { html } = JSON.parse(await readBody(req));
      const buf = await renderCover(String(html || ""), kind);
      res.writeHead(200, { "content-type": kind === "pdf" ? "application/pdf" : "image/png" });
      return res.end(buf);
    }
    if (url === "/api/manifests") { res.writeHead(200, { "content-type": "application/json" }); return res.end(JSON.stringify(manifests())); }
    if (url === "/cover/preset.local.json") return sendFile(res, path.join(root, "local/cover-preset.json"));
    if (url === "/api/ping") { res.writeHead(200, { "content-type": "application/json" }); return res.end('{"ok":true}'); }
    if (url === "/generated" || url === "/generated/") return sendFile(res, path.join(root, "preview/index.html"));
    const inSite = path.join(site, url);
    if (existsSync(inSite)) return sendFile(res, inSite);
    return sendFile(res, path.join(pub, url));
  } catch (e) {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(String(e.message || e));
  }
}).listen(port, host, () => console.log(`Preview on http://localhost:${port}   (editor: /editor/  cover: /cover/  generated: /generated/)`));
