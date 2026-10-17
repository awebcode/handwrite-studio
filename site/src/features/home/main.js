// Home page: live handwriting demo, template gallery and "continue project".
import { esc } from "../../shared/dom.js";
import { lsGet, listProjects } from "../../shared/storage.js";
import { TEMPLATES } from "../editor/templates.js";

const FEATURES = [
  ["✍️", "Natural handwriting", "Per-word tilt, skew, wobble, pen dots and scanner grain. Pick from 9 handwriting fonts."],
  ["🧩", "Drag-and-drop blocks", "Questions, answers, code, tables, screenshots, images, spacing and page breaks."],
  ["↶", "Undo / redo everywhere", "Every change is recorded. Ctrl+Z works like you expect."],
  ["🖼️", "Paste or drop images", "Pictures are resized automatically so pages stay sharp and light."],
  ["⬇️", "PDF, PNG or JPG", "Rendered on your device. File names follow ROLL-NAME-BATCH-TITLE."],
  ["💾", "Saved per browser", "Projects autosave to your browser. Export or import as a file."],
];
const LINES = ["Q1. What is an operating system?", "Ans. It manages hardware and software resources.", "MOV AX, BX  ; copy BX into AX"];

function typeDemo(node) {
  let l = 0, c = 0, done = "";
  const tick = () => {
    node.textContent = done + LINES[l].slice(0, c++);
    if (c > LINES[l].length) { done += LINES[l] + "\n"; l = (l + 1) % LINES.length; c = 0; if (!l) done = ""; return setTimeout(tick, 1200); }
    setTimeout(tick, 55);
  };
  tick();
}

document.getElementById("tplgrid").innerHTML = TEMPLATES.map((t) =>
  `<a class="card tpl" href="/editor/?template=${encodeURIComponent(t.id)}"><b>${esc(t.name)}</b><span>${esc(t.desc)}</span><em>Use this template →</em></a>`).join("");
document.getElementById("featgrid").innerHTML = FEATURES.map(([i, h, p]) => `<div class="card"><span class="ico">${i}</span><b>${h}</b><span>${p}</span></div>`).join("");
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) typeDemo(document.getElementById("demo"));
else document.getElementById("demo").textContent = LINES.join("\n");

(async () => {
  const all = await listProjects().catch(() => []), last = lsGet("hw.current");
  if (all.length || last) document.getElementById("continue").hidden = false;
})();
