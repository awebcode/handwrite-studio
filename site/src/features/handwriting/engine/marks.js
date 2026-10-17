// Pen dots, ticks, pen-test scribbles, thinking blots and margin doodles.
import { el } from "../../../shared/dom.js";
import { A4W, A4H } from "./constants.js";
import { range } from "./rng.js";

const DOODLES = [
  "M0 -6 L1.8 -1.9 L6 -1.9 L2.6 .8 L3.8 5 L0 2.5 L-3.8 5 L-2.6 .8 L-6 -1.9 L-1.8 -1.9Z",
  "M0 0 q10 -7 22 0 M16 -5 l6 5 l-7 3",
  "M0 0 q4 -7 8 0 t8 0 t8 0 t8 0",
  "M0 0 c0 -6 8 -6 8 0 c0 7 -12 7 -12 -2 c0 -11 18 -11 18 2",
  "M-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M0 6 l0 9",
  "M0 0 l12 0 M6 -5 l0 10",
];

export function marksEl(st, R, ink) {
  const mk = st.marks, rr = (a, b) => range(R, a, b), parts = [];
  const mx = st.margin.x, margin = mk.margin !== false;
  const stroke = (d, w, a, extra = "") => parts.push(`<path d="${d}" fill="none" stroke="${ink}" stroke-opacity="${a.toFixed(2)}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" ${extra}/>`);
  const blot = (cx, cy, rx, ry, a) => parts.push(`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="${ink}" fill-opacity="${a.toFixed(2)}"/>`);

  for (let i = 0, n = Math.max(0, Math.round(mk.dots * (0.5 + R()))); i < n; i++)
    blot(margin && R() < 0.4 ? rr(12, Math.max(16, mx - 8)) : rr(90, 740), rr(100, 1030), rr(0.6, 2), rr(0.5, 1.7), rr(0.35, 0.85));
  if (R() < mk.blots) for (let i = 0, n = 1 + Math.floor(R() * 2); i < n; i++) blot(rr(96, 736), rr(110, 1010), rr(1.6, 3.4), rr(1.4, 3), rr(0.6, 0.9));
  if (margin && R() < mk.ticks) {
    const x = rr(18, Math.max(24, mx - 12)), y = rr(110, 990);
    stroke(`M${x} ${y} l${rr(5, 8)} ${rr(6, 9)} l${rr(9, 15)} ${-rr(13, 19)}`, rr(1.1, 1.7), rr(0.55, 0.85));
  }
  if (margin && R() < mk.scribble) {
    let d = `M${rr(8, Math.max(14, mx - 30))} ${rr(120, 980)}`;
    for (let j = 0; j < 5; j++) d += ` l${rr(6, 16).toFixed(1)} ${rr(-1.5, 1.5).toFixed(1)} l${-rr(4, 12).toFixed(1)} ${rr(1, 4).toFixed(1)}`;
    stroke(d, rr(0.9, 1.4), rr(0.4, 0.7));
  }
  if (R() < mk.doodles) {
    const d = DOODLES[Math.floor(R() * DOODLES.length)], zone = Math.floor(R() * 3);
    const [x, y] = zone === 0 ? [rr(110, 700), rr(18, Math.max(26, Math.min(70, st.margin.y - 16)))]
      : zone === 1 ? [rr(10, Math.max(16, mx - 22)), rr(150, 1000)] : [rr(120, 700), rr(A4H - 30, A4H - 14)];
    stroke(d, 1.3, rr(0.45, 0.75), `transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rr(-25, 25).toFixed(0)})" stroke-linejoin="round"`);
  }
  const box = el("div", "hwmarks");
  box.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${A4W}" height="${A4H}" viewBox="0 0 ${A4W} ${A4H}">${parts.join("")}</svg>`;
  return box;
}
