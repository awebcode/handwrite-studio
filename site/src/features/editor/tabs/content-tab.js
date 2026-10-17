// Content tab: palette of blocks to add + the draggable list of blocks with inline editors.
import { esc, on as delegate } from "../../../shared/dom.js";
import { KINDS } from "../../handwriting/engine/constants.js";
import { S, select } from "../state.js";
import { addBlock, deleteBlock, duplicateBlock, moveBlock, reorder } from "../actions.js";
import { blockForm } from "../blocks/forms.js";
import { tableActs } from "../blocks/table-form.js";
import { shotActs } from "../blocks/shot-form.js";
import { scrollToBlock } from "../preview.js";

const PALETTE = [
  ["text:question", "Question"], ["text:answer", "Answer"], ["text:point", "Point"], ["text:section", "Section"],
  ["code", "Code"], ["table", "Table"], ["shot", "Screenshot"], ["image", "Image"],
  ["spacer", "Space"], ["rule", "Line"], ["pagebreak", "Page break"], ["text:title", "Title"],
];
const NAMES = { text: "Text", code: "Code", table: "Table", shot: "Screenshot", image: "Image", spacer: "Space", rule: "Line", pagebreak: "Page break" };
const kindLabel = Object.fromEntries(KINDS);

const snippet = (b) => {
  const s = b.type === "text" || b.type === "code" ? b.text : b.type === "shot" ? b.caption || b.lines : b.type === "table" ? b.rows?.[0]?.join(" | ") : b.caption || "";
  return esc(String(s ?? "").replace(/\s+/g, " ").slice(0, 46));
};
const label = (b) => (b.type === "text" ? kindLabel[b.kind] : NAMES[b.type]);

function card(b, i, n) {
  const sel = b.id === S.sel;
  return `<div class="card${sel ? " sel" : ""}" data-id="${b.id}">
    <div class="chead" data-act="pick">
      <span class="grip" draggable="true" title="Drag to reorder">⋮⋮</span><b>${label(b)}</b><span class="snip">${snippet(b)}</span>
      <span class="cacts"><button class="btn-sm btn-ghost" data-act="up" title="Move up"${i ? "" : " disabled"}>↑</button><button class="btn-sm btn-ghost" data-act="down" title="Move down"${i < n - 1 ? "" : " disabled"}>↓</button><button class="btn-sm btn-ghost" data-act="dup" title="Duplicate">⧉</button><button class="btn-sm btn-ghost btn-danger" data-act="del" title="Delete">🗑</button></span>
    </div>${sel ? `<div class="cbody">${blockForm(b)}</div>` : ""}</div>`;
}

export const html = () => `<div class="palette">${PALETTE.map(([k, v]) => `<button class="btn-sm" data-act="add" data-add="${k}">+ ${v}</button>`).join("")}</div>
  <div class="cards" id="cards">${S.doc.blocks.map((b, i) => card(b, i, S.doc.blocks.length)).join("") || '<p class="hint">No blocks yet - add one above.</p>'}</div>`;

const idOf = (t) => t.closest("[data-id]")?.dataset.id;
export const acts = {
  ...tableActs, ...shotActs,
  add(t) { const [type, kind] = t.dataset.add.split(":"); addBlock(type, kind); },
  pick(t, e) { if (e.target.closest("button,.grip")) return; select(idOf(t), "list"); scrollToBlock(idOf(t)); },
  up: (t, e) => (e.stopPropagation(), moveBlock(idOf(t), -1)),
  down: (t, e) => (e.stopPropagation(), moveBlock(idOf(t), 1)),
  dup: (t, e) => (e.stopPropagation(), duplicateBlock(idOf(t))),
  del: (t, e) => (e.stopPropagation(), deleteBlock(idOf(t))),
};

export function init(body) {
  let drag = null;
  body.addEventListener("dragstart", (e) => { const g = e.target.closest?.(".grip"); if (g) { drag = idOf(g); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", drag); } });
  const clear = () => body.querySelectorAll(".dropbefore,.dropafter").forEach((c) => c.classList.remove("dropbefore", "dropafter"));
  delegate(body, "dragover", ".card", (e, c) => {
    if (!drag) return; e.preventDefault(); clear();
    const r = c.getBoundingClientRect(); c.classList.add(e.clientY < r.top + r.height / 2 ? "dropbefore" : "dropafter");
  });
  delegate(body, "drop", ".card", (e, c) => {
    if (!drag) return; e.preventDefault();
    const after = c.classList.contains("dropafter"); clear(); reorder(drag, c.dataset.id, after); drag = null;
  });
  body.addEventListener("dragend", () => { drag = null; clear(); });
}
