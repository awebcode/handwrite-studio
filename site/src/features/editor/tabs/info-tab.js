// Info tab: student / course details used by {placeholders}, and the header layout presets.
import { ctl } from "../../../shared/form.js";
import { S } from "../state.js";
import { applyHeader } from "../actions.js";
import { HEADER_PRESETS } from "../../handwriting/defaults.js";

const FIELDS = [
  ["name", "Full name"], ["roll", "Roll"], ["section", "Section"], ["batch", "Batch"], ["date", "Date"],
  ["university", "University"], ["dept", "Department"], ["course", "Course"], ["code", "Course code"],
  ["term", "Semester"], ["title", "Assignment title"], ["teacher", "Teacher"],
];

export const html = () => {
  const m = S.doc.meta;
  return ctl.group("Header layout", `<p class="hint">Replaces the header blocks at the top of the page.</p><div class="btns">${
    Object.entries(HEADER_PRESETS).map(([k, v]) => `<button class="btn-sm" data-act="header" data-preset="${k}">${v}</button>`).join("")}</div>`) +
    ctl.group("Details", FIELDS.map(([k, label]) => ctl.text(label, `meta.${k}`, m[k] ?? "")).join("") +
      `<p class="hint">Use these in text as {name}, {roll}, {date} ...</p>`);
};
export const acts = { header: (t) => applyHeader(t.dataset.preset) };
