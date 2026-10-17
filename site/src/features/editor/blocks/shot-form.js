// Screenshots: a terminal window with your output text, or an uploaded / pasted picture.
import { ctl } from "../../../shared/form.js";
import { pickImages } from "../../../shared/images.js";
import { S, blockById, structure } from "../state.js";
import { placeImage } from "../actions.js";

const MODES = [["terminal", "Terminal text"], ["image", "Picture"]];
const STYLES = [["a", "Grey window"], ["b", "Black terminal"]];

function picture(b) {
  const src = S.images[b.imgId];
  return `<div class="drop"><div class="thumb">${src ? `<img src="${src}" alt="">` : "No picture yet"}</div>
    <div class="btns"><button class="btn-sm" data-act="img-pick">Choose picture…</button>${src ? '<button class="btn-sm btn-danger" data-act="img-clear">Remove</button>' : ""}</div>
    <p class="hint">Or drop / paste a picture anywhere on the page. It is resized automatically.</p></div>`;
}

export function shotForm(b) {
  const image = b.type === "image" || b.mode === "image";
  let h = b.type === "shot" ? ctl.select("Show", "b.mode", MODES, b.mode).replace("<select", '<select data-rerender="1"') : "";
  if (image) h += picture(b);
  else h += ctl.select("Look", "b.style", STYLES, b.style) + ctl.area("Terminal text", "b.lines", b.lines, 5, "mono") + ctl.check("Blinking cursor", "b.cursor", b.cursor);
  h += ctl.text("Caption", "b.caption", b.caption || "", "Output of Q1") + ctl.slider("Width", "b.width", 30, 100, 2, b.width ?? 78, "%");
  if (b.type === "shot") h += ctl.check("Put on the output pages at the end", "b.attach", b.attach !== false);
  return h;
}

export const shotActs = {
  async "img-pick"() { const [f] = await pickImages(); if (f) placeImage(f, S.sel); },
  "img-clear"() { const b = blockById(S.sel); b.imgId = null; structure(); },
};
