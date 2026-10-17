import { chromium } from "playwright";
import { existsSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Playwright's own browser if installed, otherwise any Chromium already in the cache.
export function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  try {
    const own = chromium.executablePath();
    if (own && existsSync(own)) return undefined;
  } catch {}
  const cache = path.join(os.homedir(), ".cache/ms-playwright");
  if (existsSync(cache)) {
    const dirs = readdirSync(cache).filter((d) => /^chromium(_headless_shell)?-\d+$/.test(d)).sort().reverse();
    for (const d of dirs) {
      for (const rel of ["chrome-linux/chrome", "chrome-linux64/chrome", "chrome-headless-shell-linux64/chrome-headless-shell"]) {
        const f = path.join(cache, d, rel);
        if (existsSync(f)) return f;
      }
    }
  }
  return undefined;
}
