// Tiny DOM + object helpers shared by every feature.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const clone = (o) => JSON.parse(JSON.stringify(o));
export const uid = (p = "b") => p + Math.random().toString(36).slice(2, 9);

export function el(tag, cls = "", css = "") {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (css) e.style.cssText = css;
  return e;
}

export function debounce(fn, ms = 250) {
  let t;
  const run = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  run.flush = (...a) => { clearTimeout(t); fn(...a); };
  run.cancel = () => clearTimeout(t);
  return run;
}

/** Run at most once per `ms` while calls keep coming (trailing edge), so long edits still save regularly. */
export function throttle(fn, ms = 1000) {
  let t = null, last = 0, args;
  const fire = () => { t = null; last = Date.now(); fn(...args); };
  const run = (...a) => { args = a; const wait = ms - (Date.now() - last); if (wait <= 0) { clearTimeout(t); fire(); } else if (!t) t = setTimeout(fire, wait); };
  run.flush = () => { if (t) { clearTimeout(t); fire(); } };
  run.cancel = () => { clearTimeout(t); t = null; };
  return run;
}

/** Delegated event: on(root, "click", "[data-act]", (event, matchedElement) => ...) */
export function on(root, type, selector, fn) {
  root.addEventListener(type, (e) => {
    const t = e.target.closest ? e.target.closest(selector) : null;
    if (t && root.contains(t)) fn(e, t);
  });
}

export const getPath = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
export function setPath(o, path, v) {
  const ks = path.split("."), last = ks.pop();
  const t = ks.reduce((a, k) => (a[k] ??= {}), o);
  t[last] = v;
}
