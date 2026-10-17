// Saved projects (per browser): create, open, duplicate, delete, export and import.
import { uid, clone } from "../../shared/dom.js";
import { saveProject, loadProject, listProjects, deleteProject, lsGet } from "../../shared/storage.js";
import { S, load, persist, saveNow } from "./state.js";
import { newStyle, newMeta } from "../handwriting/defaults.js";
import { TEMPLATES } from "./templates.js";

export const listAll = async () => (await listProjects()).sort((a, b) => b.updated - a.updated);

export async function createFrom(templateId = "blank", name) {
  await saveNow();
  const t = TEMPLATES.find((x) => x.id === templateId) || TEMPLATES[0];
  const proj = { id: uid("p"), name: name || t.name };
  const doc = t.make();
  load(doc, {}, proj);
  await saveProject({ id: proj.id, name: proj.name, updated: Date.now(), doc, images: {} });
}

export async function open(id) {
  if (S.proj) await saveNow();
  const rec = await loadProject(id);
  if (!rec) return false;
  load(rec.doc, rec.images, { id: rec.id, name: rec.name });
  return true;
}

export async function duplicate(id) {
  if (S.proj?.id === id) await saveNow();
  const rec = await loadProject(id); if (!rec) return;
  const copy = { ...clone({ ...rec, images: {} }), images: rec.images, id: uid("p"), name: rec.name + " (copy)", updated: Date.now() };
  await saveProject(copy);
}
export const remove = (id) => deleteProject(id);

export function rename(name) { if (S.proj) { S.proj.name = name || "Untitled"; persist(); } }

export const exportJson = () => JSON.stringify({ app: "handwrite-studio", v: 1, name: S.proj.name, doc: S.doc, images: S.images });

const merge = (base, over) => Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v && typeof v === "object" && !Array.isArray(v) ? { ...v, ...(over?.[k] || {}) } : over?.[k] ?? v]));

/** Only trusted shapes get in: defaults are merged, blocks get ids and a known type, images must be data URLs. */
function normalise(d) {
  const blocks = (d.doc.blocks || []).filter((b) => b && typeof b === "object" && typeof b.type === "string")
    .map((b) => ({ ...b, id: typeof b.id === "string" ? b.id : uid() }));
  const images = Object.fromEntries(Object.entries(d.images || {}).filter(([, v]) => typeof v === "string" && v.startsWith("data:image/")));
  return { doc: { v: 1, meta: { ...newMeta(), ...(d.doc.meta || {}) }, style: merge(newStyle(), d.doc.style), blocks }, images };
}

export async function importJson(text) {
  const d = JSON.parse(text);
  if (d.app !== "handwrite-studio" || !Array.isArray(d.doc?.blocks)) throw new Error("Not a Handwrite Studio file");
  await saveNow();
  const { doc, images } = normalise(d), proj = { id: uid("p"), name: String(d.name || "Imported project").slice(0, 80) };
  await saveProject({ id: proj.id, name: proj.name, updated: Date.now(), doc, images });
  load(doc, images, proj);
}

/** Open the last project, or the template named in ?template=, or a fresh example. */
export async function boot() {
  const q = new URLSearchParams(location.search), want = q.get("template");
  if (want) {
    await createFrom(want);
    history.replaceState(null, "", location.pathname);
    return;
  }
  const last = lsGet("hw.current");
  if (last && (await open(last))) return;
  const all = await listAll();
  if (all[0] && (await open(all[0].id))) return;
  await createFrom("example");
}
