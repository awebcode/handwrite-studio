import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2];
if (!name || !/^[\w-]+$/.test(name)) { console.error("usage: npm run hw:new -- <name>"); process.exit(1); }
const dest = path.join(dir, "assignments", name);
if (existsSync(dest)) { console.error("already exists:", dest); process.exit(1); }
cpSync(path.join(dir, "assignments/_template"), dest, { recursive: true });
console.log(`Created ${dest}\nEdit assignment.mjs, then: npm run hw:build -- ${name}`);
