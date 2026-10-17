// Content tab: palette of blocks to add + the draggable list of blocks with inline editors.
import { esc } from "../../../shared/dom.js";
import { KINDS } from "../../handwriting/engine/constants.js";
import { S, select } from "../state.js";
import { addBlock, deleteBlock, duplicateBlock, moveBlock, moveTo, insertBlocks } from "../actions.js";
import { createDnd } from "../../../shared/dnd.js";
import { blockForm } from "../blocks/forms.js";
import { tableActs } from "../blocks/table-form.js";
import { shotActs } from "../blocks/shot-form.js";
import { scrollToBlock } from "../preview.js";
import { parseRaw } from "../raw-text.js";
import { toast } from "../../../shared/toast.js";

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
      <span class="grip" title="Drag the card to reorder" aria-hidden="true">⋮⋮</span><b>${label(b)}</b><span class="snip">${snippet(b)}</span>
      <span class="cacts"><button class="btn-sm btn-ghost" data-act="up" title="Move up"${i ? "" : " disabled"}>↑</button><button class="btn-sm btn-ghost" data-act="down" title="Move down"${i < n - 1 ? "" : " disabled"}>↓</button><button class="btn-sm btn-ghost" data-act="dup" title="Duplicate">⧉</button><button class="btn-sm btn-ghost btn-danger" data-act="del" title="Delete">🗑</button></span>
    </div>${sel ? `<div class="cbody">${blockForm(b)}</div>` : ""}</div>`;
}

const rawBox = `<details class="grp raw"><summary>Paste raw text</summary>
  <p class="hint">Paste plain notes. <b>Q1.</b> question · <b>Ans.</b> answer · <b>- item</b> point · <b># Heading</b> section · <b>\`\`\`</b> code fence · <b>---</b> line · blank line = gap.</p>
  <textarea id="rawtext" rows="7" class="mono" spellcheck="false" placeholder="# Part A&#10;Q1. What is an OS?&#10;Ans. It manages hardware.&#10;- Process management&#10;\`\`\`&#10;MOV AX, BX&#10;\`\`\`"></textarea>
  <div class="btns"><button class="btn-sm btn-pri" data-act="raw-add">Add to document</button><button class="btn-sm" data-act="raw-body">Replace body (keep header)</button></div></details>`;

export const html = () => `${rawBox}<div class="palette">${PALETTE.map(([k, v]) => `<button class="btn-sm" data-act="add" data-add="${k}">+ ${v}</button>`).join("")}</div>
  <div class="cards" id="cards">${S.doc.blocks.map((b, i) => card(b, i, S.doc.blocks.length)).join("") || '<p class="hint">No blocks yet - add one above.</p>'}</div>`;

const idOf = (t) => t.closest("[data-id]")?.dataset.id;
export const acts = {
  ...tableActs, ...shotActs,
  "raw-add"() { const n = addParsed(false); n && toast(`Added ${n} blocks`); },
  "raw-body"() { const n = addParsed(true); n && toast(`Body replaced with ${n} blocks`); },
  add(t) { const [type, kind] = t.dataset.add.split(":"); addBlock(type, kind); },
  pick(t, e) { if (e.target.closest("button,.grip")) return; select(idOf(t), "list"); scrollToBlock(idOf(t)); },
  up: (t, e) => (e.stopPropagation(), moveBlock(idOf(t), -1)),
  down: (t, e) => (e.stopPropagation(), moveBlock(idOf(t), 1)),
  dup: (t, e) => (e.stopPropagation(), duplicateBlock(idOf(t))),
  del: (t, e) => (e.stopPropagation(), deleteBlock(idOf(t))),
};

function addParsed(replace) {
  const box = document.querySelector("#rawtext"), blocks = parseRaw(box?.value);
  if (!blocks.length) return toast("Paste some text first") && 0;
  insertBlocks(blocks, replace); return blocks.length;
}

let dnd;
/** (Re)attach drag and drop after every render: grips reorder the cards, palette chips can be dropped between them. */
export function after(body) {
  dnd ||= createDnd({
    onReorder: (from, to) => moveTo(from, to),
    onDropNew: (data, at) => { const [type, kind] = data.add.split(":"); addBlock(type, kind, at); },
    onStart: () => body.classList.add("dragging"), onEnd: () => { body.classList.remove("dragging"); document.dispatchEvent(new Event("dnd-end")); },
  });
  dnd.reset();
  body.querySelectorAll(".card").forEach((c, i) => dnd.sortable(c, { id: c.dataset.id, index: i }));
  body.querySelectorAll(".palette [data-add]").forEach((b) => dnd.draggable(b, { id: "pal:" + b.dataset.add, data: { add: b.dataset.add } }));
}
