// The centre column: paginated handwritten pages, live zoom, click-to-select and drop/paste of images.
import { $, debounce, el } from "../../shared/dom.js";
import { acceptImages } from "../../shared/images.js";
import { A4W, A4H } from "../handwriting/engine/constants.js";
import { layout } from "../handwriting/engine/layout.js";
import { S, on, select, emit } from "./state.js";
import { placeImage } from "./actions.js";

let token = 0, host;

function frame(page, i, n) {
  const w = el("div", "pgwrap"), z = S.zoom;
  w.innerHTML = `<div class="plabel">Page ${i + 1} of ${n}</div><div class="pgbox" style="width:${A4W * z}px;height:${A4H * z}px"><div class="pgscale" style="transform:scale(${z})"></div></div>`;
  w.querySelector(".pgscale").appendChild(page);
  return w;
}

function highlight() {
  host.querySelectorAll(".selhl").forEach((e) => e.classList.remove("selhl"));
  if (S.sel) host.querySelectorAll(`[data-bid="${S.sel}"]`).forEach((e) => e.classList.add("selhl"));
}

function rezoom() {
  host.querySelectorAll(".pgbox").forEach((b) => { b.style.width = A4W * S.zoom + "px"; b.style.height = A4H * S.zoom + "px"; b.firstChild.style.transform = `scale(${S.zoom})`; });
}

async function render() {
  const mine = ++token;
  $("#busy-dot").hidden = false;
  const res = await layout(S.doc, S.images);
  if (mine !== token) return;
  S.layout = res;
  host.replaceChildren(...res.pages.map((p, i) => frame(p, i, res.pages.length)));
  highlight(); $("#busy-dot").hidden = true;
  emit("layout");
}

export function scrollToBlock(id) {
  const page = S.layout?.bidPage[id];
  const target = host.querySelector(`[data-bid="${id}"]`) || host.children[page];
  target?.scrollIntoView({ block: "center", behavior: "smooth" });
}

export function initPreview() {
  host = $("#pages");
  const soon = debounce(render, 160);
  on("structure", soon); on("content", soon); on("select", highlight); on("zoom", rezoom);
  host.addEventListener("click", (e) => { const t = e.target.closest("[data-bid]"); if (t) select(t.dataset.bid, "preview"); });
  acceptImages($("#stage"), (files) => files.forEach((f) => placeImage(f)));
  soon.flush();
}
