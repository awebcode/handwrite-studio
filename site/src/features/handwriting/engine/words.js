// The handwriting effect: every word gets its own tilt, rise, size, slant, spacing and ink pressure.
import { el } from "../../../shared/dom.js";
import { range } from "./rng.js";

/** Scale the preset by the "amount" slider (0 = typed text, 1 = preset, 2 = very shaky). */
export function gradeOf(st, code) {
  const h = st.hand, a = st.amount * (code ? st.codeHand : 1);
  return {
    on: a > 0.001, rot: h.rot * a, dy: h.dy * a, skew: h.skew * a, line: h.line * a,
    szLo: 1 + (h.szLo - 1) * a, szHi: 1 + (h.szHi - 1) * a, ls0: h.ls0 * a, ls1: h.ls1 * a,
    mr0: h.mr0 * a, mr1: h.mr1 * a, opLo: 1 - (1 - h.opLo) * a,
  };
}

// The fonts' own "9" looks like a "q"; a turned 6 reads as a real handwritten 9.
function nineSpan(R, shift) {
  const i = el("i", "n9", `transform:rotate(${(180 + range(R, -9, 9)).toFixed(1)}deg) translateY(${(shift + range(R, -0.02, 0.02)).toFixed(3)}em)`);
  i.textContent = "6";
  return i;
}

export function fillWords(node, text, g, R, nine) {
  const mood = range(R, 0.85, 1.15); // each line is a little neater or rushed
  String(text).split("\n").forEach((line, li) => {
    if (li) node.appendChild(document.createElement("br"));
    line.split(/(\s+)/).forEach((p) => {
      if (!p) return;
      if (!p.trim()) return void node.appendChild(document.createTextNode(p));
      const fix = nine != null && p.includes("9");
      if (!g.on && !fix) return void node.appendChild(document.createTextNode(p));
      const sp = el("span", "w");
      p.split(/(9)/).forEach((seg) => {
        if (seg === "9" && nine != null) sp.appendChild(nineSpan(R, nine));
        else if (seg) sp.appendChild(document.createTextNode(seg));
      });
      if (g.on) {
        sp.style.cssText =
          `transform:rotate(${(range(R, -g.rot, g.rot) * mood).toFixed(2)}deg) translateY(${(range(R, -g.dy, g.dy) * mood).toFixed(2)}px) skewX(${(range(R, -g.skew, g.skew) * mood).toFixed(2)}deg);` +
          `font-size:${range(R, g.szLo, g.szHi).toFixed(3)}em;letter-spacing:${range(R, g.ls0, g.ls1).toFixed(2)}px;` +
          `margin-right:${range(R, g.mr0, g.mr1).toFixed(1)}px;opacity:${range(R, g.opLo, 1).toFixed(2)};`;
      }
      node.appendChild(sp);
    });
  });
}

/** Each line sits very slightly off-level. */
export function tiltLine(node, g, R) {
  if (!g.on) return;
  const m = range(R, 0.85, 1.15);
  node.style.transform = `rotate(${(range(R, -g.line, g.line) * m).toFixed(2)}deg) translate(${range(R, -2, 2).toFixed(1)}px,${range(R, -1.4, 1.4).toFixed(1)}px)`;
}
