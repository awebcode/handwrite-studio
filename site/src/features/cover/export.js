/* ---------- export ---------- */
function exportHtml() {
  const sh = $("sheet").cloneNode(true);
  sh.querySelectorAll(".ui").forEach((e) => e.remove());
  sh.querySelectorAll("[contenteditable]").forEach((e) => e.removeAttribute("contenteditable"));
  sh.querySelectorAll(".blk").forEach((e) => e.classList.remove("sel", "dropbefore", "dropafter"));
  sh.querySelectorAll(".grip").forEach((e) => e.remove());
  sh.style.transform = "none"; sh.style.boxShadow = "none"; sh.style.overflow = "hidden"; sh.id = "sheet";
  const css = $("sheetcss").textContent;
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}${css}.blk:hover{outline:0!important}</style></head><body>${sh.outerHTML}</body></html>`;
}
const H2C = "/vendor/html2canvas.min.js";
const JSPDF = "/vendor/jspdf.umd.min.js";
const loadScript = (src) => new Promise((ok, bad) => { const x = document.createElement("script"); x.src = src; x.onload = ok; x.onerror = bad; document.head.appendChild(x); });
async function sheetCanvas() {
  if (!window.html2canvas) await loadScript(H2C);
  const holder = document.createElement("div"); holder.style.cssText = "position:fixed;left:-10000px;top:0";
  const sh = $("sheet").cloneNode(true); sh.removeAttribute("id");
  sh.querySelectorAll(".ui,.grip").forEach((e) => e.remove());
  sh.querySelectorAll("[contenteditable]").forEach((e) => e.removeAttribute("contenteditable"));
  sh.querySelectorAll(".blk").forEach((e) => e.classList.remove("sel"));
  sh.style.transform = "none"; sh.style.boxShadow = "none"; sh.style.overflow = "hidden";
  holder.appendChild(sh); document.body.appendChild(holder);
  try { return await window.html2canvas(sh, { scale: 2, backgroundColor: S.page.paper, useCORS: true }); } finally { holder.remove(); }
}
async function clientExport(kind) {
  const canvas = await sheetCanvas();
  if (kind === "png") return canvas.toBlob((b) => download(b, fileBase() + ".png"));
  if (!window.jspdf) await loadScript(JSPDF);
  const pdf = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, 210, 297);
  pdf.save(fileBase() + ".pdf");
}
const fileBase = () => ($("fname").value || "cover-page").replace(/[^\w.-]+/g, "_");
function download(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
// The local preview server can render with real Chromium; static hosting (Cloudflare Pages) cannot, so it uses the in-browser export.
const hasServer = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
async function serverExport(kind) {
  if (!hasServer) throw new Error("no server");
  const r = await fetch("/api/cover/" + kind, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ html: exportHtml() }) });
  if (!r.ok) throw new Error("export failed " + r.status);
  download(await r.blob(), fileBase() + "." + kind);
}
const doPdf = async () => {
  toast("Rendering PDF…");
  try { await serverExport("pdf"); toast("PDF downloaded"); }
  catch (e) {
    try { await clientExport("pdf"); toast("PDF downloaded"); }
    catch (e2) { toast("Opening print dialog - choose Save as PDF"); setTimeout(() => window.print(), 600); }
  }
};
const doPng = async () => {
  toast("Rendering PNG…");
  try { await serverExport("png"); toast("PNG downloaded"); }
  catch (e) { try { await clientExport("png"); toast("PNG downloaded"); } catch (e2) { toast("PNG export failed (offline?)"); } }
};
$("bUndo").onclick = undo; $("bRedo").onclick = redo;
$("bDownload").onclick = () => { try { localStorage.setItem("cover.fmt", $("fmt").value); } catch (e) {} return $("fmt").value === "pdf" ? doPdf() : doPng(); };
try { const f = localStorage.getItem("cover.fmt"); if (f === "pdf" || f === "png") $("fmt").value = f; } catch (e) {}
document.addEventListener("click", (e) => { const d = $("more"); if (d.open && !d.contains(e.target)) d.open = false; });
$("bPrint").onclick = () => window.print();
$("bSave").onclick = () => download(new Blob([JSON.stringify(S, null, 2)], { type: "application/json" }), fileBase() + ".json");
$("bLoad").onclick = () => $("fJson").click();
$("fJson").onchange = (e) => e.target.files[0] && loadJson(e.target.files[0]);
function loadJson(f) { const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.blocks || !d.page) throw 0; S = d; sel = null; render(); save(); toast("Design loaded"); } catch (e) { toast("Not a valid design file"); } }; r.readAsText(f); }
$("bReset").onclick = () => { if (confirm("Reset the cover page to the default design?")) { S = defaults(); sel = null; render(); save(); } };
$("bLink").onclick = () => {
  const t = (n) => (S.blocks.find((b) => b.key === n) || {}).html || "";
  const strip = (h) => String(h).replace(/<br>/g, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
  const tb = S.blocks.find((b) => b.type === "table");
  const q = new URLSearchParams();
  q.set("title", strip(t("title"))); q.set("term", strip(t("term"))); q.set("batch", strip(t("batch")).replace(/^Batch\s*/, ""));
  const course = strip(t("course")).split("\n"); q.set("course", (course[0] || "").replace(/^Course Title:\s*/, "")); q.set("code", (course[1] || "").replace(/^Course code:\s*/, ""));
  q.set("assignment", strip(t("assignment")).replace(/^Assignment:\s*/, "")); q.set("date", strip(t("date")).replace(/^Date of Submission:\s*/, ""));
  ["teacher", "role", "dept", "university", "city"].forEach((k) => q.set(k, strip(t(k))));
  if (tb) tb.rows.forEach((r, i) => { q.set(i ? "id" + (i + 1) : "id", strip(r[0])); q.set(i ? "name" + (i + 1) : "name", strip(r[1])); });
  const u = location.origin + location.pathname + "?" + q.toString();
  (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => toast("Link copied"), () => prompt("Copy this link", u));
};
let tt; function toast(m) { const t = $("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2600); }

/* ---------- boot: saved design > local preset > defaults ---------- */
(async function boot() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  if (saved && saved.blocks && saved.page) S = saved;
  else if (fromUrl) S = defaults(urlVals());
  else {
    try { const r = await fetch("/cover/preset.local.json"); if (r.ok) { const d = await r.json(); if (d.blocks && d.page) S = d; } } catch (e) {}
  }
  if (!S) S = defaults();
  if (QP.get("file")) $("fname").value = QP.get("file");
  wirePanel(); render();
  snap(); document.body.dataset.ready = "1";
  const auto = QP.get("download");
  if (auto === "pdf" || auto === "png") { $("fmt").value = auto; setTimeout(() => $("bDownload").click(), 700); }
})();
document.addEventListener("click", (e) => { if (!e.composedPath().some((n) => n.id === "bubble" || n.id === "panel" || n.id === "topbar" || (n.classList && n.classList.contains("blk")))) { sel = null; document.querySelectorAll(".blk.sel").forEach((x) => x.classList.remove("sel")); syncPanel(); } });
