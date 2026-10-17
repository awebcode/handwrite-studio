// Declarative form controls. Each control carries its target path in data-p; bindForm applies edits.
import { esc } from "./dom.js";

const opt = (v, cur) => (o) => { const [val, label] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}"${String(val) === String(cur) ? " selected" : ""}>${esc(label)}</option>`; };

export const ctl = {
  slider: (label, p, min, max, step, v, unit = "") =>
    `<label class="row"><span>${label}</span><input type="range" data-p="${p}" min="${min}" max="${max}" step="${step}" value="${v}"><output>${v}${unit}</output></label>`,
  select: (label, p, options, v) => {
    const body = Array.isArray(options)
      ? options.map(opt(null, v)).join("") : Object.entries(options).map(([g, list]) => `<optgroup label="${g}">${list.map(opt(null, v)).join("")}</optgroup>`).join("");
    return `<label class="row"><span>${label}</span><select data-p="${p}">${body}</select></label>`;
  },
  check: (label, p, v) => `<label class="row"><span>${label}</span><input type="checkbox" data-p="${p}"${v ? " checked" : ""}></label>`,
  color: (label, p, v) => `<label class="row"><span>${label}</span><input type="color" data-p="${p}" value="${v || "#000000"}"></label>`,
  text: (label, p, v, ph = "") => `<label class="row"><span>${label}</span><input type="text" data-p="${p}" value="${esc(v)}" placeholder="${esc(ph)}"></label>`,
  area: (label, p, v, rows = 3, cls = "") => `<label class="col"><span>${label}</span><textarea data-p="${p}" rows="${rows}" class="${cls}" spellcheck="false">${esc(v)}</textarea></label>`,
  group: (title, body, open = true) => `<details class="grp"${open ? " open" : ""}><summary>${title}</summary>${body}</details>`,
};

const read = (e) => (e.type === "checkbox" ? e.checked : e.dataset.num ? +e.value : e.type === "range" || e.type === "number" ? +e.value : e.value);

/**
 * bindForm(root, resolve, onChange)
 *   resolve(el) -> { obj, path } where the edit should be written (default: none)
 *   onChange({ el, obj, path, value, live })
 */
export function bindForm(root, resolve, onChange) {
  const handle = (e, live) => {
    const el = e.target.closest("[data-p]");
    if (!el || !root.contains(el)) return;
    if (live && (el.tagName === "SELECT" || el.type === "checkbox" || el.type === "color")) return;
    const r = resolve(el); if (!r) return;
    const value = read(el);
    r.obj[r.path] !== undefined || r.path.includes(".") ? setDeep(r.obj, r.path, value) : (r.obj[r.path] = value);
    const out = el.nextElementSibling; if (out && out.tagName === "OUTPUT") out.textContent = value + (out.dataset.unit || "");
    onChange({ el, obj: r.obj, path: r.path, value, live });
  };
  root.addEventListener("input", (e) => handle(e, true));
  root.addEventListener("change", (e) => handle(e, false));
}
function setDeep(o, path, v) { const ks = path.split("."), last = ks.pop(); ks.reduce((a, k) => (a[k] ??= {}), o)[last] = v; }
