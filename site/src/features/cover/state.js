/* ---------- state ---------- */
let S = null, sel = null;
const QP = new URLSearchParams(location.search);
const FIELD_KEYS = ["title", "course", "code", "term", "batch", "assignment", "date", "teacher", "role", "dept", "university", "city", "id", "name", "logo", "id2", "name2"];
const fromUrl = FIELD_KEYS.some((k) => QP.has(k));
const KEY = "cover.v1" + (fromUrl ? ":" + location.search : "");
const urlVals = () => Object.fromEntries([...QP.entries()]);
const H = { stack: [], i: -1 };
function snap() {
  const j = JSON.stringify(S);
  if (H.stack[H.i] === j) return;
  H.stack = H.stack.slice(0, H.i + 1); H.stack.push(j);
  if (H.stack.length > 120) H.stack.shift();
  H.i = H.stack.length - 1; histUi();
}
function histUi() { const u = $("bUndo"), r = $("bRedo"); if (u) { u.disabled = H.i <= 0; r.disabled = H.i >= H.stack.length - 1; } }
function flushSave() { clearTimeout(saveT); save(); }
function undo() { flushSave(); if (H.i <= 0) return; H.i--; S = JSON.parse(H.stack[H.i]); sel = sel && blockById(sel) ? sel : null; render(); try { localStorage.setItem(KEY, H.stack[H.i]); } catch (e) {} histUi(); toast("Undo"); }
function redo() { flushSave(); if (H.i >= H.stack.length - 1) return; H.i++; S = JSON.parse(H.stack[H.i]); sel = sel && blockById(sel) ? sel : null; render(); try { localStorage.setItem(KEY, H.stack[H.i]); } catch (e) {} histUi(); toast("Redo"); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} snap(); };
let saveT; const saveSoon = () => { clearTimeout(saveT); saveT = setTimeout(() => { save(); checkOverflow(); }, 250); };
const blockById = (i) => S.blocks.find((b) => b.id === i);

