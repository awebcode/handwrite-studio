// Measure every item once, then pack them onto A4 pages with a random amount of blank paper at the bottom.
import { A4H } from "./constants.js";
import { mulberry, range } from "./rng.js";
import { pageShell, nextFrame, offscreen } from "./page.js";

export async function measure(items, doc) {
  const { pg, ink } = pageShell(doc, true);
  const dispose = offscreen(pg);
  const live = items.filter((it) => it.el);
  live.forEach((it) => ink.appendChild(it.el));
  await nextFrame();
  const tops = live.map((it) => it.el.offsetTop), total = ink.scrollHeight;
  live.forEach((it, i) => { it.h = Math.max(1, (i + 1 < live.length ? tops[i + 1] : total - doc.style.padBottom) - tops[i]); });
  live.forEach((it) => it.el.remove());
  dispose();
}

export const usable = (st) => A4H - st.padTop - st.padBottom - 8;
const sum = (page) => page.reduce((t, x) => t + (x.h || 0), 0);

/** items (with .h) -> array of pages (arrays of items). `shrink` tightens limits if a page overflowed. */
export function pack(items, st, shrink = 1) {
  const avail = usable(st), gapR = mulberry((st.seed | 0) + 77);
  let limit = 0;
  const nextLimit = () => { limit = Math.max(220, (avail - range(gapR, st.gapMin, st.gapMax)) * shrink); };
  const pages = []; let cur = [], used = 0;
  const flush = () => { pages.push(cur); cur = []; used = 0; nextLimit(); };
  nextLimit();
  for (const it of items) {
    if (it.pagebreak) { if (cur.length) flush(); continue; }
    if (used > 0 && used + it.h > limit) {
      const pulled = []; // never strand a heading at the bottom of a page
      while (cur.length && cur[cur.length - 1].keep) { const x = cur.pop(); used -= x.h; pulled.unshift(x); }
      flush(); pulled.forEach((x) => { cur.push(x); used += x.h; });
    }
    cur.push(it); used += it.h;
  }
  if (cur.length) pages.push(cur);
  while (pages.length > 1 && sum(pages.at(-1)) < 160 && sum(pages.at(-2)) + sum(pages.at(-1)) <= avail * shrink) pages.at(-2).push(...pages.pop());
  return pages.length ? pages : [[]];
}
