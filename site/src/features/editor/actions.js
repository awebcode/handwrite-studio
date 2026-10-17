// Everything that changes the document structure: add, move, copy, delete, images, header presets.
import { clone, uid } from "../../shared/dom.js";
import { resizeImage } from "../../shared/images.js";
import { toast } from "../../shared/toast.js";
import { block, text, headerBlocks } from "../handwriting/defaults.js";
import { S, blockById, structure, select } from "./state.js";

const FACTORY = {
  text: (kind = "answer") => text(kind, kind === "question" ? "Q. New question" : "New text"),
  code: () => block("code", { text: "MOV AX, BX\n    ADD AX, 1" }),
  table: () => block("table", { rows: [["Heading 1", "Heading 2"], ["", ""]] }),
  shot: () => block("shot", { mode: "terminal", style: "a", lines: "Output goes here", cursor: true, caption: "Output", attach: true, width: 78 }),
  image: () => block("image", { imgId: null, caption: "", width: 70 }),
  spacer: () => block("spacer", { h: 30 }),
  rule: () => block("rule"),
  pagebreak: () => block("pagebreak"),
};

const indexOf = (id) => S.doc.blocks.findIndex((b) => b.id === id);

export function addBlock(type, kind) {
  const b = FACTORY[type](kind);
  const at = S.sel ? indexOf(S.sel) + 1 : S.doc.blocks.length;
  S.doc.blocks.splice(at, 0, b);
  S.sel = b.id; structure();
  return b;
}
export function deleteBlock(id) {
  const i = indexOf(id); if (i < 0) return;
  S.doc.blocks.splice(i, 1);
  S.sel = S.doc.blocks[Math.min(i, S.doc.blocks.length - 1)]?.id ?? null; structure();
}
export function duplicateBlock(id) {
  const b = blockById(id); if (!b) return;
  const c = clone(b); c.id = uid(); S.doc.blocks.splice(indexOf(id) + 1, 0, c);
  S.sel = c.id; structure();
}
export function moveBlock(id, delta) {
  const i = indexOf(id), j = i + delta;
  if (i < 0 || j < 0 || j >= S.doc.blocks.length) return;
  const [b] = S.doc.blocks.splice(i, 1); S.doc.blocks.splice(j, 0, b); structure();
}
export function reorder(fromId, toId, after) {
  const from = blockById(fromId), to = blockById(toId);
  if (!from || !to || from === to) return;
  S.doc.blocks.splice(indexOf(fromId), 1);
  S.doc.blocks.splice(indexOf(toId) + (after ? 1 : 0), 0, from); structure();
}

export function applyHeader(preset) {
  S.doc.blocks = [...headerBlocks(preset), ...S.doc.blocks.filter((b) => !b.hdr)];
  structure(); toast("Header layout applied");
}

/** Store a resized picture; returns its id. */
export async function storeImage(file, max = 1600) {
  const { src } = await resizeImage(file, { max });
  const id = uid("i"); S.images[id] = src; return id;
}

/** Picture dropped, pasted or chosen: replace the selected image block, or add a new one. */
export async function placeImage(file, targetId) {
  const id = await storeImage(file);
  const cur = blockById(targetId ?? S.sel);
  if (cur && (cur.type === "image" || (cur.type === "shot" && cur.mode === "image"))) cur.imgId = id;
  else {
    const b = FACTORY.image(); b.imgId = id;
    const at = S.sel ? indexOf(S.sel) + 1 : S.doc.blocks.length;
    S.doc.blocks.splice(at, 0, b); S.sel = b.id;
  }
  structure(); toast("Image added and resized");
}

export function newSeed() { S.doc.style.seed = Math.floor(Math.random() * 1e6); structure(); }
export { select };
