// Tiny helpers for writing answers. Each returns blocks the page builder understands.
export const P = (t) => ({ k: "a", t });          // normal answer line / paragraph
export const L = (t) => ({ k: "idt", t });        // indented point, e.g. "(i) ..."
export const R = (t) => ({ k: "res", t });        // short boxed-looking note line
export const TABLE = (rows) => ({ k: "table", rows });
export const SHOT = (lines) => ({ k: "shot", lines }); // emulator/terminal screenshot, placed on the last pages
// Raw assembly (4-space indent = instruction line) -> handwritten code lines.
export function code(raw) {
  return raw.replace(/\n$/, "").split("\n").map((line) => {
    if (!line.trim()) return { k: "sp", t: "" };
    if (line.startsWith("    ")) return { k: "ln i", t: line.trim() };
    return { k: "ln", t: line.trim() };
  });
}
export { code as CODE };
