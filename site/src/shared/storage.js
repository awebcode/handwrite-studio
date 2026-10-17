// Per-browser persistence. Projects live in IndexedDB (falls back to memory if blocked).
const DB = "handwrite-studio", STORE = "projects";
const mem = new Map();
let opening;

function open() {
  opening ??= new Promise((res, rej) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  }).catch((e) => { opening = null; throw e; });
  return opening;
}
async function run(mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode), r = fn(t.objectStore(STORE));
    t.oncomplete = () => res(r && r.result);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error || new Error("transaction aborted"));
  });
}
const safe = async (fn, fallback) => { try { return await fn(); } catch { return fallback(); } };

const IMG = ":img"; // images live in their own record so text edits never rewrite them
const hasDoc = (r) => r && r.doc;
/** Saves the project (meta + optional images in ONE transaction). Resolves true when it reached IndexedDB. */
export async function saveProject(rec) {
  const { images, ...meta } = rec;
  try {
    await run("readwrite", (s) => { const r = s.put(meta); if (images) s.put({ id: rec.id + IMG, images }); return r; });
    return true;
  } catch {
    mem.set(meta.id, meta); if (images) mem.set(rec.id + IMG, { images });
    return false;
  }
}
export async function loadProject(id) {
  const [meta, im] = await Promise.all([safe(() => run("readonly", (s) => s.get(id)), () => mem.get(id)), safe(() => run("readonly", (s) => s.get(id + IMG)), () => mem.get(id + IMG))]);
  return meta && { ...meta, images: im?.images || meta.images || {} };
}
export const listProjects = async () => (await safe(() => run("readonly", (s) => s.getAll()), () => [...mem.values()])).filter(hasDoc);
export const deleteProject = async (id) => {
  await safe(() => run("readwrite", (s) => s.delete(id)), () => void mem.delete(id));
  await safe(() => run("readwrite", (s) => s.delete(id + IMG)), () => void mem.delete(id + IMG));
};

export const lsGet = (k, d = null) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
export const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } };
