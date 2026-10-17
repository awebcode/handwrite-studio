import { esc } from "../../../shared/dom.js";
import { S, blockById, structure } from "../state.js";

const sel = () => blockById(S.sel);

/** Editable grid. Cells are plain inputs bound to b.rows.<r>.<c>. */
export function tableForm(b) {
  const rows = b.rows || [];
  return `<div class="grid-wrap"><table class="grid">${rows.map((r, ri) => `<tr>${r.map((c, ci) => `<td><input type="text" data-p="b.rows.${ri}.${ci}" value="${esc(c)}"></td>`).join("")}</tr>`).join("")}</table></div>
  <div class="btns"><button class="btn-sm" data-act="t-row+">+ Row</button><button class="btn-sm" data-act="t-row-">− Row</button><button class="btn-sm" data-act="t-col+">+ Column</button><button class="btn-sm" data-act="t-col-">− Column</button></div>
  <label class="row"><span>First row is a heading</span><input type="checkbox" data-p="b.header" data-rerender="1"${b.header === false ? "" : " checked"}></label>`;
}

export const tableActs = {
  "t-row+"() { const b = sel(); b.rows.push((b.rows[0] || ["", ""]).map(() => "")); structure(); },
  "t-row-"() { const b = sel(); if (b.rows.length > 1) b.rows.pop(); structure(); },
  "t-col+"() { sel().rows.forEach((r) => r.push("")); structure(); },
  "t-col-"() { const b = sel(); if (b.rows[0]?.length > 1) b.rows.forEach((r) => r.pop()); structure(); },
};
