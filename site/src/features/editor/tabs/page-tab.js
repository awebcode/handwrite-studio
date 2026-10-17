// Page tab: margins, spacing, random pen marks, the scanner look and the random seed.
import { ctl } from "../../../shared/form.js";
import { S } from "../state.js";
import { newSeed } from "../actions.js";

const MARGIN = [[2, "Double line"], [1, "Single line"], [0, "None"]];

export const html = () => {
  const s = S.doc.style, m = s.margin, k = s.marks, c = s.scan;
  return ctl.group("Margins & ruling",
    ctl.select("Left margin", "style.margin.left", MARGIN, m.left).replace("<select", '<select data-num="1"') + ctl.slider("Margin x", "style.margin.x", 20, 140, 1, m.x, "px") +
    ctl.check("Top line", "style.margin.top", m.top) + ctl.check("Ruled lines", "style.margin.ruled", m.ruled) +
    ctl.slider("Top gap", "style.padTop", 40, 220, 2, s.padTop, "px") + ctl.slider("Left padding", "style.padLeft", 40, 160, 2, s.padLeft, "px") +
    ctl.slider("Bottom gap min", "style.gapMin", 10, 200, 2, s.gapMin, "px") + ctl.slider("Bottom gap max", "style.gapMax", 10, 300, 2, s.gapMax, "px") +
    ctl.check("Page numbers", "style.pageNumbers", s.pageNumbers)) +
    ctl.group("Pen marks",
      ctl.slider("Random dots", "style.marks.dots", 0, 20, 1, k.dots) + ctl.slider("Ticks", "style.marks.ticks", 0, 3, 0.1, k.ticks) +
      ctl.slider("Scribbles", "style.marks.scribble", 0, 3, 0.1, k.scribble) + ctl.slider("Ink blots", "style.marks.blots", 0, 3, 0.1, k.blots) +
      ctl.slider("Doodles", "style.marks.doodles", 0, 3, 0.1, k.doodles) + ctl.check("Margin marks", "style.marks.margin", k.margin)) +
    ctl.group("Scanner look",
      ctl.check("Enable scan effect", "style.scan.on", c.on) + ctl.slider("Flash", "style.scan.flash", 0, 0.3, 0.01, c.flash) +
      ctl.slider("Vignette", "style.scan.vignette", 0, 0.3, 0.005, c.vignette) + ctl.slider("Grain", "style.scan.grain", 0, 6, 0.1, c.grain) +
      ctl.slider("Blur", "style.scan.blur", 0, 1.5, 0.02, c.blur) + ctl.slider("Rotate", "style.scan.rotate", 0, 2, 0.05, c.rotate, "°") +
      ctl.slider("JPEG quality", "style.scan.jpeg", 0.4, 0.95, 0.01, c.jpeg)) +
    ctl.group("Randomness", `<p class="hint">Seed ${s.seed}: the same seed always gives the same page.</p><div class="btns"><button class="btn-sm" data-act="seed">🎲 New random layout</button></div>`);
};
export const acts = { seed: () => newSeed() };
