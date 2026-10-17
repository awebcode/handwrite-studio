// One document block -> one or more measurable "items" (elements) with handwriting applied.
import { el } from "../../../shared/dom.js";
import { KCLASS, KEEP_WITH_NEXT } from "./constants.js";
import { fillWords, tiltLine } from "./words.js";
import { tok } from "./rng.js";
import { shotEl } from "./shots.js";

// A very long paragraph is cut at spaces into chunks so it can flow onto the next page like real writing.
const CHUNK = 520;
function pieces(text) {
  const out = [];
  for (const line of String(text ?? "").split("\n")) {
    let rest = line;
    while (rest.length > CHUNK) {
      let cut = rest.lastIndexOf(" ", CHUNK); if (cut < CHUNK / 2) cut = CHUNK;
      out.push(rest.slice(0, cut)); rest = rest.slice(cut).trimStart();
    }
    out.push(rest);
  }
  return out;
}

/** Each written line becomes its own item, so long text breaks across pages instead of pushing the page bottom down. */
function textItem(b, c) {
  return pieces(b.text).map((piece, i) => {
    if (!piece.trim() && i) return { el: el("div", "sp") };
    const e = el("div", (KCLASS[b.kind] || "a") + (b.boxed ? " boxed" : ""));
    fillWords(e, tok(piece, c.meta), c.g, c.R, c.nine);
    if (b.scale && b.scale !== 1) e.style.fontSize = b.scale + "em";
    if (b.color) e.style.color = b.color;
    if (b.align) {
      if (b.kind === "section" || b.boxed) { e.style.display = "table"; e.style.margin = b.align === "center" ? "0 auto" : b.align === "right" ? "0 0 0 auto" : "0 auto 0 0"; }
      else e.style.textAlign = b.align;
    }
    if (b.kind === "question" && !i) e.style.marginTop = (c.st.qGapMin + c.R() * (c.st.qGapMax - c.st.qGapMin)).toFixed(1) + "px";
    if (i) e.style.marginTop = "0";
    tiltLine(e, c.g, c.R);
    return { el: e, keep: !i && KEEP_WITH_NEXT.has(b.kind) };
  });
}

function codeItems(b, c) {
  return String(b.text ?? "").replace(/\s+$/, "").split("\n").map((line) => {
    if (!line.trim()) return { el: el("div", "sp") };
    const e = el("div", "ln" + (/^(\s{2,}|\t)/.test(line) ? " i" : ""));
    fillWords(e, tok(line.trim(), c.meta), c.gc, c.R, c.nine);
    tiltLine(e, c.gc, c.R);
    return { el: e };
  });
}

function tableItem(b, c) {
  const wrap = el("div", "tblwrap"), t = el("table", "tb");
  (b.rows || []).forEach((r, ri) => {
    const tr = document.createElement("tr");
    r.forEach((cell) => {
      const td = document.createElement(ri === 0 && b.header !== false ? "th" : "td");
      fillWords(td, tok(cell, c.meta), c.g, c.R, c.nine); tr.appendChild(td);
    });
    t.appendChild(tr);
  });
  t.style.transform = `rotate(${((c.R() - 0.5) * 0.7).toFixed(2)}deg)`;
  wrap.appendChild(t);
  return [{ el: wrap }];
}

/** Returns the items for a block; attached screenshots are collected in ctx.attached instead. */
export function blockItems(b, c) {
  let items = [];
  switch (b.type) {
    case "text": items = textItem(b, c); break;
    case "code": items = codeItems(b, c); break;
    case "table": items = tableItem(b, c); break;
    case "rule": { const e = el("div", "rule"); tiltLine(e, c.g, c.R); items = [{ el: e }]; break; }
    case "spacer": items = [{ el: el("div", "sp", `height:${b.h ?? 24}px`) }]; break;
    case "pagebreak": return [{ pagebreak: true, bid: b.id }];
    case "shot": case "image": {
      const e = shotEl(b, c);
      if (b.type === "shot" && b.attach !== false) { c.attached.push({ el: e, bid: b.id }); return []; }
      items = [{ el: e }]; break;
    }
  }
  items.forEach((it) => { it.bid = b.id; it.el.dataset.bid = b.id; });
  return items;
}
