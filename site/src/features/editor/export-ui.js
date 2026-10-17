// Download flow: render the pages through the scanner pipeline once, then save as PDF / PNG / JPG zip.
import { $ } from "../../shared/dom.js";
import { saveBlob, upperName } from "../../shared/download.js";
import { toast } from "../../shared/toast.js";
import { finalPages } from "../handwriting/export/pages.js";
import { pdfBlob, zipBlob } from "../handwriting/export/files.js";
import { S } from "./state.js";

let cache = { layout: null, canvases: null };

export const fileBase = () => {
  const m = S.doc.meta;
  const parts = [m.roll, m.name, m.batch, m.title].filter(Boolean).map(upperName);
  return parts.join("-") || upperName(S.proj.name);
};

function overlay(html) {
  const o = $("#overlay"); o.innerHTML = `<div class="dialog">${html}</div>`; o.classList.add("open"); return o;
}
const close = () => $("#overlay").classList.remove("open");

async function render() {
  const layout = S.layout;
  if (!layout) throw new Error("Pages are still loading");
  if (cache.layout === layout) return cache.canvases;
  overlay(`<b id="ptxt">Rendering pages…</b><div class="bar"><i id="pbar"></i></div>`);
  const canvases = await finalPages(layout.pages, S.doc, (i, n) => {
    $("#pbar").style.width = (i / n) * 100 + "%"; $("#ptxt").textContent = `Rendering page ${Math.min(i + 1, n)} of ${n}…`;
  });
  cache = { layout, canvases };
  return canvases;
}

async function run(job) {
  try { await job(); } catch (e) { console.error(e); toast("Export failed: " + e.message, 4000); } finally { close(); }
}

export const download = (format) => run(async () => {
  const canvases = await render(), q = S.doc.style.scan.jpeg, base = fileBase();
  overlay(`<b>Packing ${format.toUpperCase()}…</b>`);
  if (format === "pdf") saveBlob(await pdfBlob(canvases, q), base + ".pdf");
  else saveBlob(await zipBlob(canvases, format, q, base), `${base}-${format.toUpperCase()}.zip`);
  toast("Downloaded " + base);
});

/** Modal showing the real scanned result of every page. */
export const finalLook = () => run(async () => {
  const canvases = await render();
  const imgs = canvases.map((c, i) => `<img alt="Page ${i + 1}" src="${c.toDataURL("image/jpeg", 0.6)}">`).join("");
  overlay(`<div class="fl-head"><b>Final look (${canvases.length} pages)</b><button id="flx">Close</button></div><div class="fl">${imgs}</div>`);
  await new Promise((res) => { $("#flx").onclick = res; $("#overlay").onclick = (e) => e.target.id === "overlay" && res(); });
});
