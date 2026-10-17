// Files tab: project name, saved projects in this browser, new-from-template, import / export.
import { esc, on as delegate } from "../../../shared/dom.js";
import { saveBlob, safeName } from "../../../shared/download.js";
import { toast } from "../../../shared/toast.js";
import { S } from "../state.js";
import { TEMPLATES } from "../templates.js";
import * as P from "../project.js";

const ago = (t) => new Date(t).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
let list = [];

export async function html() {
  list = await P.listAll();
  return `<div class="grp"><label class="col"><span>Project name</span><input type="text" id="pname" value="${esc(S.proj.name)}"></label>
    <div class="btns"><button class="btn-sm" data-act="export">Export .json</button><button class="btn-sm" data-act="import">Import…</button></div></div>
    <div class="grp"><b>New from template</b><div class="tpls">${TEMPLATES.map((t) => `<button class="tpl" data-act="new" data-tpl="${t.id}"><b>${esc(t.name)}</b><small>${esc(t.desc)}</small></button>`).join("")}</div></div>
    <div class="grp"><b>Saved in this browser</b>${list.map((p) => `<div class="proj${p.id === S.proj.id ? " cur" : ""}" data-pid="${p.id}"><div><b>${esc(p.name)}</b><small>${ago(p.updated)}</small></div>
      <span><button class="btn-sm" data-act="open">Open</button><button class="btn-sm btn-ghost" data-act="copy" title="Duplicate">⧉</button><button class="btn-sm btn-ghost btn-danger" data-act="rm" title="Delete">🗑</button></span></div>`).join("")}</div>`;
}

const pid = (t) => t.closest("[data-pid]").dataset.pid;
const refresh = () => document.querySelector('#tabs [data-tab="files"]').click();
export const acts = {
  new: async (t) => { await P.createFrom(t.dataset.tpl); toast("New project created"); },
  open: async (t) => { await P.open(pid(t)); },
  copy: async (t) => { await P.duplicate(pid(t)); toast("Duplicated"); refresh(); },
  rm: async (t) => { if (pid(t) === S.proj.id) return toast("Open another project first"); if (confirm("Delete this project?")) { await P.remove(pid(t)); refresh(); } },
  export: () => saveBlob(new Blob([P.exportJson()], { type: "application/json" }), safeName(S.proj.name) + ".handwrite.json"),
  import: () => {
    const i = Object.assign(document.createElement("input"), { type: "file", accept: ".json,application/json" });
    i.onchange = async () => { try { await P.importJson(await i.files[0].text()); toast("Imported"); } catch (e) { toast(e.message); } };
    i.click();
  },
};
export function init(body) { delegate(body, "input", "#pname", (e, t) => P.rename(t.value)); }
