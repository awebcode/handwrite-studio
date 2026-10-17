// Page shells: the real A4 page, and the auto-height clone used to measure blocks.
import { el } from "../../../shared/dom.js";
import { fontOf } from "./constants.js";
import { rulesEl } from "./rules.js";

export function pageShell(doc, measure = false) {
  const st = doc.style, f = fontOf(st.font);
  const pg = el("div", "hwpage" + (measure ? " measure" : ""));
  pg.style.setProperty("--font", f.css); pg.style.setProperty("--fs", st.fs + "px");
  pg.style.setProperty("--lh", st.lh); pg.style.setProperty("--ink", st.ink);
  pg.style.background = st.paper;
  if (!measure) pg.appendChild(rulesEl(st));
  const ink = el("div", "hwink", `padding:${st.padTop}px ${st.padRight}px ${st.padBottom}px ${st.padLeft}px`);
  pg.appendChild(ink);
  return { pg, ink };
}

export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/** Mount `node` in a hidden, laid-out holder (so offsetTop/offsetHeight work); returns a dispose function. */
export function offscreen(node) {
  const h = el("div", "hwmeasure", "position:absolute;left:-12000px;top:0;visibility:hidden");
  h.appendChild(node); document.body.appendChild(h);
  return () => h.remove();
}
