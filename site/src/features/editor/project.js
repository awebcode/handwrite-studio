// Saved projects (per browser): create, open, duplicate, delete, export and import.
import { uid, clone } from "../../shared/dom.js";
import { saveProject, loadProject, listProjects, deleteProject, lsGet } from "../../shared/storage.js";
import { S, load, persist } from "./state.js";
import { TEMPLATES } from "./templates.js";

export const listAll = async () => (await listProjects()).sort((a, b) => b.updated - a.updated);

export async function createFrom(templateId = "blank", name) {
  const t = TEMPLATES.find((x) => x.id === templateId) || TEMPLATES[0];
  const proj = { id: uid("p"), name: name || t.name };
  const doc = t.make();
  load(doc, {}, proj);
  await saveProject({ id: proj.id, name: proj.name, updated: Date.now(), doc, images: {} });
}

export async function open(id) {
  const rec = await loadProject(id);
  if (!rec) return false;
  load(rec.doc, rec.images, { id: rec.id, name: rec.name });
  return true;
}

export async function duplicate(id) {
  const rec = await loadProject(id); if (!rec) return;
  const copy = { ...clone({ ...rec, images: {} }), images: rec.images, id: uid("p"), name: rec.name + " (copy)", updated: Date.now() };
  await saveProject(copy);
}
export const remove = (id) => deleteProject(id);

export function rename(name) { if (S.proj) { S.proj.name = name || "Untitled"; persist(); } }

export const exportJson = () => JSON.stringify({ app: "handwrite-studio", v: 1, name: S.proj.name, doc: S.doc, images: S.images });

export async function importJson(text) {
  const d = JSON.parse(text);
  if (d.app !== "handwrite-studio" || !d.doc?.blocks) throw new Error("Not a Handwrite Studio file");
  const proj = { id: uid("p"), name: d.name || "Imported project" };
  load(d.doc, d.images || {}, proj);
  await saveProject({ id: proj.id, name: proj.name, updated: Date.now(), doc: d.doc, images: d.images || {} });
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
