// Terminal-style output screenshots and pasted / uploaded images, drawn as paper-friendly elements.
import { el } from "../../../shared/dom.js";
import { fillWords } from "./words.js";
import { tok } from "./rng.js";

function terminal(b) {
  const gray = b.style !== "b";
  const win = el("div", "win " + (gray ? "wa" : "wb"), `width:${b.width || 78}%`);
  win.innerHTML = (gray ? `<div class="wt"><span>screen</span><i>_</i><i>[]</i><i>X</i></div>` : `<div class="wbar">EMU8086 emulator</div>`) + `<div class="scr"></div>`;
  const scr = win.querySelector(".scr");
  scr.textContent = String(b.lines ?? "");
  if (b.cursor) scr.appendChild(el("span", "cur"));
  return win;
}

function picture(b, ctx) {
  const box = el("div", "shotimg", `width:${b.width || 78}%`);
  const src = ctx.images[b.imgId];
  if (src) { const im = el("img"); im.src = src; im.alt = ""; box.appendChild(im); }
  else { box.classList.add("ph"); box.textContent = "Add an image"; }
  return box;
}

/** A captioned screenshot (mode "terminal" or "image"), slightly rotated like a pasted print-out. */
export function shotEl(b, ctx) {
  const wrap = el("div", "shot");
  wrap.dataset.bid = b.id;
  if (b.caption) {
    const cap = el("div", "cap");
    fillWords(cap, tok(b.caption, ctx.meta), ctx.g, ctx.R, ctx.nine);
    wrap.appendChild(cap);
  }
  const body = b.mode === "image" || b.type === "image" ? picture(b, ctx) : terminal(b);
  body.style.transform = `rotate(${((ctx.R() - 0.5) * 0.9).toFixed(2)}deg)`;
  wrap.appendChild(body);
  return wrap;
}
