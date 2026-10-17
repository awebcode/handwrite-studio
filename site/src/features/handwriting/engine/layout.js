// layout(doc, images) -> { pages: HTMLElement[], bidPage, textPages }
import { el } from "../../../shared/dom.js";
import { fontOf } from "./constants.js";
import { mulberry } from "./rng.js";
import { gradeOf, fillWords } from "./words.js";
import { blockItems } from "./items.js";
import { marksEl } from "./marks.js";
import { pageShell, nextFrame, offscreen } from "./page.js";
import { measure, pack, usable } from "./paginate.js";
import { A4H } from "./constants.js";

async function loadFonts(st) {
  try {
    await document.fonts.load(`${st.fs}px ${fontOf(st.font).css.split(",")[0]}`);
    await document.fonts.load("20px VT323"); await document.fonts.ready;
  } catch { /* fonts are best-effort */ }
}

function buildPage(doc, items, idx, R, bidPage) {
  const { pg, ink } = pageShell(doc, false);
  items.forEach((it) => { ink.appendChild(it.el); if (it.bid) bidPage[it.bid] = idx; });
  ink.style.transform = `translate(${(R() * 8 - 4).toFixed(1)}px,${(R() * 5 - 2.5).toFixed(1)}px) rotate(${(R() * 0.5 - 0.25).toFixed(2)}deg)`;
  pg.appendChild(marksEl(doc.style, R, doc.style.ink));
  if (doc.style.pageNumbers) { const n = el("div", "pno"); n.textContent = String(idx + 1); pg.appendChild(n); }
  return pg;
}

/** Output screenshots: captioned prints grouped onto their own pages after the answers. */
async function attachedPages(doc, ctx, R, startIdx, bidPage) {
  const { pg, ink } = pageShell(doc, true), dispose = offscreen(pg);
  const heads = [0, 1].map((n) => { const h = el("div", "hdr t2"); fillWords(h, n ? "Output screenshots (contd.)" : "Output screenshots", ctx.g, R, ctx.nine); ink.appendChild(h); return h; });
  ctx.attached.forEach((a) => ink.appendChild(a.el));
  await nextFrame();
  const hh = (e) => e.offsetHeight + 12, avail = usable(doc.style), groups = [];
  let grp = [], used = hh(heads[0]);
  ctx.attached.forEach((a) => { const h = hh(a.el); if (grp.length && used + h > avail) { groups.push(grp); grp = []; used = hh(heads[1]); } grp.push(a); used += h; });
  groups.push(grp);
  const pages = groups.map((g, gi) => buildPage(doc, [{ el: heads[gi ? 1 : 0] }, ...g], startIdx + gi, R, bidPage));
  dispose();
  return pages;
}

async function overflowed(pages) {
  const probe = el("div", "hwmeasure", "position:absolute;left:-12000px;top:0;visibility:hidden");
  pages.forEach((p) => probe.appendChild(p)); document.body.appendChild(probe);
  await nextFrame();
  const bad = pages.some((p) => p.querySelector(".hwink").scrollHeight > A4H + 1);
  pages.forEach((p) => p.remove()); probe.remove();
  return bad;
}

export async function layout(doc, images) {
  const st = doc.style;
  await loadFonts(st);
  const nine = st.fixNine && fontOf(st.font).nine != null ? fontOf(st.font).nine : null;
  let result;
  for (const shrink of [1, 0.88]) {
    const R = mulberry((st.seed | 0) + 1);
    const ctx = { st, meta: doc.meta, images, R, g: gradeOf(st, false), gc: gradeOf(st, true), nine, attached: [] };
    const items = doc.blocks.flatMap((b) => blockItems(b, ctx));
    await measure(items, doc);
    const bidPage = {}, packed = pack(items, st, shrink);
    const pages = packed.map((p, i) => buildPage(doc, p, i, R, bidPage));
    if (ctx.attached.length) pages.push(...(await attachedPages(doc, ctx, R, pages.length, bidPage)));
    result = { pages, bidPage, textPages: packed.length };
    if (!(await overflowed(pages))) break;
  }
  return result;
}
