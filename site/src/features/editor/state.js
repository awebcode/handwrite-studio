// Single source of truth for the editor, built on a zustand vanilla store.
// Fields: doc, images, proj, sel, tab, zoom, layout, hist + revision counters that drive re-renders.
import { createStore } from "../../../vendor/zustand-vanilla.mjs";
import { createHistory } from "../../shared/history.js";
import { debounce, throttle } from "../../shared/dom.js";
import { saveProject, lsSet } from "../../shared/storage.js";
import { toast } from "../../shared/toast.js";

/** doc = { meta, style, blocks }, images = { imgId: dataUrl }, proj = { id, name } */
export const store = createStore(() => ({
  doc: null, images: {}, proj: null, scrollTo: null, sel: null, tab: "content", zoom: 0.6, layout: null,
  hist: { canUndo: false, canRedo: false }, selSource: null,
  rev: { structure: 0, content: 0, project: 0, saved: 0, layout: 0 },
}));
const set = (p) => store.setState(p);
const bump = (k) => set((s) => ({ rev: { ...s.rev, [k]: s.rev[k] + 1 } }));

/** Read-write view of the store so callers can write `S.zoom` / read `S.doc`. */
export const S = new Proxy({}, { get: (_, k) => store.getState()[k], set: (_, k, v) => (set({ [k]: v }), true) });

const KEYS = { structure: "rev", content: "rev", project: "rev", saved: "rev", layout: "rev", select: "sel", zoom: "zoom", history: "hist" };
/** on("structure" | "content" | "project" | "saved" | "layout" | "select" | "zoom" | "history", fn) */
export function on(kind, fn) {
  const key = KEYS[kind], pick = key === "rev" ? (s) => s.rev[kind] : (s) => s[key];
  return store.subscribe((s, p) => { if (pick(s) !== pick(p)) fn(kind === "select" ? s.selSource : s[key], s); });
}
export const emit = (kind) => { if (kind in store.getState().rev) bump(kind); };

export const history = createHistory({ onChange: (hist) => set({ hist }) });
export const blockById = (id) => S.doc.blocks.find((b) => b.id === id);

const usedImages = () => {
  const ids = new Set(S.doc.blocks.map((b) => b.imgId).filter(Boolean));
  return Object.fromEntries([...ids].filter((i) => S.images[i]).map((i) => [i, S.images[i]]));
};
let savedImages = "";
/** Throttled autosave: at most one write per second; images are rewritten only when they actually changed. */
let warned = false;
async function doSave() {
  if (!S.proj) return;
  const images = usedImages(), sig = Object.keys(images).sort().join();
  const ok = await saveProject({ id: S.proj.id, name: S.proj.name, updated: Date.now(), doc: S.doc, ...(sig !== savedImages ? { images } : {}) });
  if (ok) { savedImages = sig; warned = false; bump("saved"); }
  else if (!warned) { warned = true; toast("Could not save to this browser (storage blocked or full)", 5000); }
}
export const persist = throttle(doSave, 1000);
/** Write everything now (tab closing, switching projects): flush pending edits and history first. */
export async function saveNow() { commitSoon.flush(); persist.cancel(); await doSave(); }

const commitNow = () => { if (history.push(JSON.stringify(S.doc))) persist(); };
const commitSoon = debounce(commitNow, 500);

/** Add / remove / reorder / big changes: record history, rebuild the sidebar and the pages. */
export function structure() { commitNow(); bump("structure"); }
/** Typing and sliders: pages refresh live, history is recorded when you pause. */
export function touch() { commitSoon(); bump("content"); }
export function select(id, source) { if (S.sel !== id) set({ sel: id, selSource: source }); }
export function setZoom(zoom) { set({ zoom }); }

function restore(json) {
  const doc = JSON.parse(json);
  set({ doc, sel: S.sel && doc.blocks.some((b) => b.id === S.sel) ? S.sel : null });
  persist(); bump("structure");
}
export function undo() { commitSoon.flush(); const j = history.undo(); if (j) restore(j); }
export function redo() { commitSoon.flush(); const j = history.redo(); if (j) restore(j); }

export function load(doc, images, proj) {
  set({ doc, images: images || {}, proj, sel: null });
  history.reset(JSON.stringify(doc)); savedImages = Object.keys(usedImages()).sort().join();
  lsSet("hw.current", proj.id);
  bump("structure"); bump("project");
}
