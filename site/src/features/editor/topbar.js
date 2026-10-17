// Top bar: undo / redo, project name, zoom, saved indicator, final look and the download control.
import { $, on as delegate } from "../../shared/dom.js";
import { lsGet, lsSet } from "../../shared/storage.js";
import { S, on, undo, redo, setZoom, store } from "./state.js";
import { download, finalLook } from "./export-ui.js";
import { rename } from "./project.js";

const COVER = { title: "title", course: "course", code: "code", term: "term", batch: "batch", assignment: "title", date: "date", teacher: "teacher", dept: "dept", university: "university", id: "roll", name: "name" };
function coverLink() {
  const m = S.doc.meta, q = new URLSearchParams();
  for (const [k, f] of Object.entries(COVER)) if (m[f]) q.set(k, m[f]);
  q.set("from", "editor");
  $("#bCover").href = "/cover/?" + q;
}

export function initTopbar() {
  const fmt = $("#fmt"), name = $("#pname-top");
  fmt.value = lsGet("hw.fmt", "pdf");
  fmt.onchange = () => lsSet("hw.fmt", fmt.value);
  $("#bUndo").onclick = undo; $("#bRedo").onclick = redo;
  $("#bDownload").onclick = () => download(fmt.value);
  $("#bFinal").onclick = finalLook;
  $("#zoom").oninput = (e) => setZoom(+e.target.value);
  name.oninput = () => rename(name.value);
  on("history", ({ canUndo, canRedo }) => { $("#bUndo").disabled = !canUndo; $("#bRedo").disabled = !canRedo; });
  const h = store.getState().hist; $("#bUndo").disabled = !h.canUndo; $("#bRedo").disabled = !h.canRedo;
  on("content", coverLink); on("structure", coverLink); coverLink();
  on("project", () => { name.value = S.proj.name; $("#zoom").value = S.zoom; });
  on("saved", () => { const s = $("#saved"); s.textContent = "Saved ✓"; clearTimeout(s.t); s.t = setTimeout(() => (s.textContent = ""), 1500); });
  on("layout", () => ($("#bDownload").disabled = false));
  document.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey, typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
    if (mod && k === "z" && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (mod && k === "y" && !typing) { e.preventDefault(); redo(); }
    else if (mod && k === "s") { e.preventDefault(); download(fmt.value); }
  });
}
