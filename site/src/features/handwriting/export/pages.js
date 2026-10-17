// Page element -> final "scanned" canvas (1240 x 1754 = A4 at 150 dpi).
import { vendor } from "../../../shared/vendor.js";
import { A4W } from "../engine/constants.js";
import { mulberry } from "../engine/rng.js";
import { wobble } from "./wobble.js";
import { scanify } from "./scan.js";

export const OUT_W = 1240, OUT_H = 1754;
const yieldUi = () => new Promise((r) => setTimeout(r, 0));

async function capture(pageEl, paper) {
  const html2canvas = await vendor("html2canvas");
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-12000px;top:0";
  const copy = pageEl.cloneNode(true); copy.style.transform = ""; copy.style.zoom = "";
  holder.appendChild(copy); document.body.appendChild(holder);
  try {
    return await html2canvas(copy, { scale: OUT_W / A4W, backgroundColor: paper, logging: false, useCORS: true });
  } finally { holder.remove(); }
}

export async function finalPage(pageEl, doc, idx) {
  const st = doc.style, R = mulberry((st.seed | 0) * 31 + idx * 7 + 5);
  let canvas = await capture(pageEl, st.paper);
  if (canvas.width !== OUT_W || canvas.height !== OUT_H) { // normalise rounding differences
    const n = document.createElement("canvas"); n.width = OUT_W; n.height = OUT_H;
    n.getContext("2d").drawImage(canvas, 0, 0, OUT_W, OUT_H); canvas = n;
  }
  await yieldUi();
  wobble(canvas, st.wobble * 0.5 * (OUT_W / A4W), st.wobbleFreq / (OUT_W / A4W), R);
  await yieldUi();
  return st.scan.on ? scanify(canvas, st.scan, R) : canvas;
}

export async function finalPages(pageEls, doc, onProgress = () => {}) {
  const out = [];
  for (let i = 0; i < pageEls.length; i++) {
    onProgress(i, pageEls.length);
    out.push(await finalPage(pageEls[i], doc, i));
    await yieldUi();
  }
  onProgress(pageEls.length, pageEls.length);
  return out;
}
