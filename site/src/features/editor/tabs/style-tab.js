// Style tab: font, size, ink and the handwriting character (skew, jitter, wobble...).
import { ctl } from "../../../shared/form.js";
import { clone, on as delegate } from "../../../shared/dom.js";
import { FONTS, HAND } from "../../handwriting/engine/constants.js";
import { S, structure } from "../state.js";

const groups = () => Object.fromEntries(["Handwriting", "Standard"].map((g) => [g, FONTS.filter((f) => f.group === g).map((f) => [f.id, f.label])]));
const PRESETS = [["neat", "Neat"], ["natural", "Natural"], ["rough", "Rough"]];

export const html = () => {
  const s = S.doc.style, h = s.hand;
  return ctl.group("Font & paper",
    ctl.select("Font", "style.font", groups(), s.font) + ctl.slider("Size", "style.fs", 11, 30, 0.2, s.fs, "px") +
    ctl.slider("Line height", "style.lh", 1.2, 2.4, 0.02, s.lh) + ctl.color("Ink", "style.ink", s.ink) + ctl.color("Paper", "style.paper", s.paper) +
    ctl.check("Fix upside-down 9", "style.fixNine", s.fixNine)) +
    ctl.group("Handwriting feel",
      ctl.select("Preset", "style.handPreset", PRESETS, s.handPreset) + ctl.slider("Overall amount", "style.amount", 0, 2, 0.05, s.amount, "x") +
      ctl.slider("Skew (slant)", "style.hand.skew", 0, 12, 0.1, h.skew, "°") + ctl.slider("Tilt", "style.hand.rot", 0, 5, 0.05, h.rot, "°") +
      ctl.slider("Up / down wander", "style.hand.dy", 0, 3, 0.05, h.dy, "px") + ctl.slider("Line drift", "style.hand.line", 0, 3, 0.05, h.line, "px") +
      ctl.slider("Letter spacing", "style.hand.ls1", 0, 3, 0.05, h.ls1, "px") + ctl.slider("Code neatness", "style.codeHand", 0, 1, 0.05, s.codeHand) +
      ctl.slider("Wobble", "style.wobble", 0, 8, 0.1, s.wobble, "px") + ctl.slider("Wobble detail", "style.wobbleFreq", 0.02, 0.2, 0.005, s.wobbleFreq));
};

export function init(body) {
  delegate(body, "change", '[data-p="style.handPreset"]', (e, t) => { S.doc.style.hand = clone(HAND[t.value]); structure(); });
}
