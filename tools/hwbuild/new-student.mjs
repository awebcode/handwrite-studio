import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const id = process.argv[2];
if (!id || !/^[a-z0-9_-]+$/.test(id)) { console.error("usage: npm run hw:new-student -- <id>   (lowercase)"); process.exit(1); }
const dest = path.join(dir, "profiles", id + ".mjs");
if (existsSync(dest)) { console.error("already exists:", dest); process.exit(1); }
writeFileSync(dest, readFileSync(path.join(dir, "profiles/_template.mjs"), "utf8").replace('"newstudent"', `"${id}"`));
console.log(`Created ${dest}\nEdit it, then add an answer under "${id}" (or "default") in each question of your assignment.`);
