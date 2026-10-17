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
  });
  return opening;
}
async function run(mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode), r = fn(t.objectStore(STORE));
    t.oncomplete = () => res(r && r.result);
    t.onerror = () => rej(t.error);
  });
}
const safe = async (fn, fallback) => { try { return await fn(); } catch { return fallback(); } };

export const saveProject = (rec) => safe(() => run("readwrite", (s) => s.put(rec)), () => void mem.set(rec.id, rec));
export const loadProject = (id) => safe(() => run("readonly", (s) => s.get(id)), () => mem.get(id));
export const listProjects = () => safe(() => run("readonly", (s) => s.getAll()), () => [...mem.values()]);
export const deleteProject = (id) => safe(() => run("readwrite", (s) => s.delete(id)), () => void mem.delete(id));

export const lsGet = (k, d = null) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
export const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } };
