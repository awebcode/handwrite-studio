// Block type -> inline editor markup. Fields use data-p="b.<field>" (see sidebar.js resolve()).
import { ctl } from "../../../shared/form.js";
import { KINDS } from "../../handwriting/engine/constants.js";
import { tableForm } from "./table-form.js";
import { shotForm } from "./shot-form.js";

const ALIGN = [["", "Auto"], ["left", "Left"], ["center", "Centre"], ["right", "Right"]];

const textForm = (b) =>
  ctl.select("Style", "b.kind", KINDS, b.kind) + ctl.area("Text", "b.text", b.text, 4) +
  `<p class="hint">Use {name}, {roll}, {date}... to insert student info. A new line starts a new line of handwriting.</p>` +
  ctl.select("Align", "b.align", ALIGN, b.align || "") + ctl.slider("Size", "b.scale", 0.7, 1.8, 0.05, b.scale ?? 1, "x") +
  ctl.color("Colour", "b.color", b.color || "#161616") + ctl.check("Box around it", "b.boxed", b.boxed);

const codeForm = (b) =>
  ctl.area("Code", "b.text", b.text, 10, "mono") + `<p class="hint">Indent with spaces or a tab; blank lines leave a gap. Written a little more neatly than prose.</p>`;

const spacerForm = (b) => ctl.slider("Height", "b.h", 4, 300, 2, b.h ?? 24, "px");

const none = (msg) => () => `<p class="hint">${msg}</p>`;
const FORMS = {
  text: textForm, code: codeForm, table: tableForm, shot: shotForm, image: shotForm, spacer: spacerForm,
  rule: none("A hand-drawn horizontal line."), pagebreak: none("Starts a new page here."),
};

export const blockForm = (b) => (FORMS[b.type] || none(""))(b);
