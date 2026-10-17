// Margin lines and ruled lines are real elements (not gradients) so they render the same everywhere.
import { el } from "../../../shared/dom.js";
import { A4H } from "./constants.js";

export function rulesEl(st) {
  const m = st.margin, box = el("div", "hwrules");
  const add = (css) => box.appendChild(el("i", "", css));
  if (m.ruled) for (let y = m.y + 36; y < A4H - 20; y += 30) add(`left:0;right:0;top:${y}px;height:1px;background:rgba(80,110,170,.32)`);
  for (let i = 0; i < m.left; i++) add(`top:0;bottom:0;left:${m.x + i * 7}px;width:${m.width}px;background:${m.color};opacity:.72`);
  if (m.top) add(`left:0;right:0;top:${m.y}px;height:${m.width}px;background:${m.color};opacity:.72`);
  return box;
}
