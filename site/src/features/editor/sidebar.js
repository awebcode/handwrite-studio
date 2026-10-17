// Left column: tab strip + the active tab, wired once with the shared form binder.
import { $, on as delegate } from "../../shared/dom.js";
import { bindForm } from "../../shared/form.js";
import { S, on, blockById, touch, structure } from "./state.js";
import * as content from "./tabs/content-tab.js";
import * as info from "./tabs/info-tab.js";
import * as style from "./tabs/style-tab.js";
import * as page from "./tabs/page-tab.js";
import * as files from "./tabs/files-tab.js";

const TABS = { content, info, style, page, files };
const LABELS = { content: "Content", info: "Info", style: "Style", page: "Page", files: "Files" };

async function renderBody() {
  const body = $("#sidebody"), top = body.scrollTop;
  body.innerHTML = await TABS[S.tab].html();
  body.scrollTop = top;
  TABS[S.tab].after?.(body);
  $("#tabs").innerHTML = Object.entries(LABELS).map(([k, v]) => `<button data-tab="${k}" class="${k === S.tab ? "on" : ""}">${v}</button>`).join("");
}

export function showTab(name) { S.tab = name; renderBody(); }

function resolve(el) {
  const p = el.dataset.p;
  if (p.startsWith("b.")) {
    const b = blockById(el.closest("[data-id]")?.dataset.id);
    return b && { obj: b, path: p.slice(2) };
  }
  return { obj: S.doc, path: p };
}

export function initSidebar() {
  const body = $("#sidebody");
  bindForm(body, resolve, ({ el }) => (el.dataset.rerender ? structure() : touch()));
  delegate(body, "click", "[data-act]", (e, t) => { for (const m of Object.values(TABS)) m.acts?.[t.dataset.act]?.(t, e); });
  delegate($("#tabs"), "click", "[data-tab]", (e, t) => showTab(t.dataset.tab));
  on("structure", renderBody); on("select", (src) => { if (S.tab === "content" && src !== "form") renderBody(); });
  for (const m of Object.values(TABS)) m.init?.(body);
  renderBody();
}
