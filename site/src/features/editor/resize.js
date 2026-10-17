// Drag handle on the selected picture / screenshot in the preview: resize it like a design tool.
import { clamp } from "../../shared/dom.js";
import { S, blockById, touch } from "./state.js";

const RESIZABLE = (b) => b && (b.type === "image" || b.type === "shot");

/** Call after the pages are rendered / selection changes. */
export function attachResize(host) {
  host.querySelectorAll(".rzh").forEach((h) => h.remove());
  const b = blockById(S.sel);
  if (!RESIZABLE(b)) return;
  const box = host.querySelector(`[data-bid="${b.id}"] .shotimg, [data-bid="${b.id}"] .win`);
  if (!box) return;
  box.style.position = "relative";
  const h = document.createElement("i");
  h.className = "rzh"; h.title = "Drag to resize"; h.setAttribute("data-html2canvas-ignore", "true");
  h.addEventListener("pointerdown", (e) => start(e, b));
  box.appendChild(h);
}

function syncSlider(w) {
  const input = document.querySelector('#sidebody .card.sel [data-p="b.width"]');
  if (!input) return;
  input.value = w; if (input.nextElementSibling?.tagName === "OUTPUT") input.nextElementSibling.textContent = w + "%";
}

function start(e, b) {
  e.preventDefault(); e.stopPropagation();
  const x0 = e.clientX, w0 = b.width ?? 78, st = S.doc.style, content = 794 - st.padLeft - st.padRight;
  const move = (ev) => {
    const w = clamp(Math.round(w0 + (((ev.clientX - x0) / S.zoom) / content) * 100), 20, 100);
    if (w !== b.width) { b.width = w; syncSlider(w); touch(); }
  };
  const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); };
  addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);
}
