/* ---------- panel <-> model ---------- */
const rng = (idn, vid, get, set, fmt = (v) => v) => {
  const el = $(idn);
  el.addEventListener("input", () => { set(+el.value); if ($(vid)) $(vid).textContent = fmt(+el.value); renderKeep(); });
};
function renderKeep() { const a = document.activeElement; render(); save(); }
function cur() { return sel ? blockById(sel) : null; }
function syncPanel() {
  const b = cur();
  $("none").hidden = !!b; $("blockctl").hidden = !b;
  if (b) {
    const txt = b.type === "text";
    ["cSize", "cBold", "cItalic", "cUnder", "cColor", "cFont", "cLh", "cLs"].forEach((x) => { $(x).closest(".row").style.display = txt ? "" : "none"; });
    $("cL").closest(".row").style.display = (txt || b.type === "logo") ? "" : "none";
    ["cBold", "cItalic", "cUnder", "cColor"].forEach((x) => { $(x).style.display = txt ? "" : "none"; });
    $("cMt").closest(".row").style.display = b.type === "spacer" || b.type === "divider" ? "none" : "";
    $("cMb").closest(".row").style.display = b.type === "spacer" ? "none" : "";
    $("logoctl").hidden = b.type !== "logo"; $("tblctl").hidden = b.type !== "table";
    if (txt) {
      $("cSize").value = b.size; $("vSize").textContent = b.size; $("cColor").value = b.color || "#000000"; $("cFont").value = b.font || "";
      $("cLh").value = b.lh; $("vLh").textContent = b.lh; $("cLs").value = b.ls; $("vLs").textContent = b.ls;
      $("cBold").classList.toggle("on", b.bold); $("cItalic").classList.toggle("on", b.italic); $("cUnder").classList.toggle("on", b.under);
    }
    ["cL", "cC", "cR"].forEach((x, k) => $(x).classList.toggle("on", b.align === ["left", "center", "right"][k]));
    $("cMt").value = b.mt || 0; $("vMt").textContent = b.mt || 0; $("cMb").value = b.mb || 0; $("vMb").textContent = b.mb || 0;
    if (b.type === "logo") { $("cLogoW").value = b.w; $("vLogoW").textContent = b.w; }
    if (b.type === "table") {
      $("tW").value = b.w; $("vtW").textContent = b.w; $("tRs").value = b.rowSize; $("vtRs").textContent = b.rowSize;
      $("tHs").value = b.headSize; $("vtHs").textContent = b.headSize; $("tRh").value = b.rowH; $("vtRh").textContent = b.rowH; $("tBold").checked = !!b.boldLast;
    }
  }
  const p = S.page;
  $("pFont").value = p.font; $("pScale").value = p.scale; $("vpScale").textContent = p.scale; $("pPadV").value = p.padV; $("vpPadV").textContent = p.padV;
  $("pPadH").value = p.padH; $("vpPadH").textContent = p.padH; $("pJust").value = p.just; $("pFrame").checked = p.frame; $("pFrameW").value = p.frameW;
  $("pFrameC").value = p.frameC; $("pFrameI").value = p.frameI; $("vpFrameI").textContent = p.frameI; $("pAccent").value = p.accent; $("pHead").value = p.head;
  $("pHeadInk").value = p.headInk; $("pRow").value = p.row; $("pGrid").value = p.grid; $("pPaper").value = p.paper; $("zoom").value = p.zoom; $("vzoom").textContent = p.zoom;
  updateBubble();
}
function wirePanel() {
  const setB = (k) => (v) => { const b = cur(); if (b) b[k] = v; };
  rng("cSize", "vSize", 0, setB("size")); rng("cMt", "vMt", 0, setB("mt")); rng("cMb", "vMb", 0, setB("mb"));
  rng("cLh", "vLh", 0, setB("lh")); rng("cLs", "vLs", 0, setB("ls")); rng("cLogoW", "vLogoW", 0, setB("w"));
  rng("tW", "vtW", 0, setB("w")); rng("tRs", "vtRs", 0, setB("rowSize")); rng("tHs", "vtHs", 0, setB("headSize")); rng("tRh", "vtRh", 0, setB("rowH"));
  $("tBold").onchange = () => { const b = cur(); b.boldLast = $("tBold").checked; renderKeep(); };
  const tog = (idn, k) => ($(idn).onclick = () => { const b = cur(); b[k] = !b[k]; renderKeep(); });
  tog("cBold", "bold"); tog("cItalic", "italic"); tog("cUnder", "under");
  [["cL", "left"], ["cC", "center"], ["cR", "right"]].forEach(([x, v]) => ($(x).onclick = () => { cur().align = v; renderKeep(); }));
  $("cColor").oninput = () => { cur().color = $("cColor").value; renderKeep(); };
  $("cFont").onchange = () => { cur().font = $("cFont").value; renderKeep(); };
  $("cDel").onclick = () => { const i = S.blocks.indexOf(cur()); S.blocks.splice(i, 1); sel = null; render(); save(); };
  $("cDup").onclick = () => { const b = cur(), c = JSON.parse(JSON.stringify(b)); c.id = id(); S.blocks.splice(S.blocks.indexOf(b) + 1, 0, c); sel = c.id; render(); save(); };
  const mv = (d) => { const b = cur(), i = S.blocks.indexOf(b), j = i + d; if (j < 0 || j >= S.blocks.length) return; S.blocks.splice(i, 1); S.blocks.splice(j, 0, b); render(); save(); };
  $("cUp").onclick = () => mv(-1); $("cDown").onclick = () => mv(1);
  $("tAddR").onclick = () => { const b = cur(); b.rows.push(b.headers.map(() => "&nbsp;")); renderKeep(); };
  $("tDelR").onclick = () => { const b = cur(); if (b.rows.length > 1) b.rows.pop(); renderKeep(); };
  $("tAddC").onclick = () => { const b = cur(); b.headers.push("Column"); b.rows.forEach((r) => r.push("&nbsp;")); renderKeep(); };
  $("tDelC").onclick = () => { const b = cur(); if (b.headers.length > 1) { b.headers.pop(); b.rows.forEach((r) => r.pop()); } renderKeep(); };
  $("cLogoPick").onclick = () => pickLogo(sel);
  $("cLogoDef").onclick = () => { cur().src = ""; renderKeep(); };
  $("cLogoNone").onclick = () => { cur().src = null; renderKeep(); };
  document.querySelectorAll("[data-add]").forEach((b) => (b.onclick = () => addBlock(b.dataset.add)));
  const pg = (idn, k, conv = (v) => v, vid) => { const el = $(idn); el.addEventListener("input", () => { S.page[k] = conv(el.type === "checkbox" ? el.checked : el.value); if (vid) $(vid).textContent = S.page[k]; renderKeep(); }); };
  pg("pFont", "font"); pg("pScale", "scale", Number, "vpScale"); pg("pPadV", "padV", Number, "vpPadV"); pg("pPadH", "padH", Number, "vpPadH"); pg("pJust", "just");
  pg("pFrame", "frame"); pg("pFrameW", "frameW", Number); pg("pFrameC", "frameC"); pg("pFrameI", "frameI", Number, "vpFrameI");
  pg("pAccent", "accent"); pg("pHead", "head"); pg("pHeadInk", "headInk"); pg("pRow", "row"); pg("pGrid", "grid"); pg("pPaper", "paper"); pg("zoom", "zoom", Number, "vzoom");
  $("pAccent").addEventListener("input", () => { S.blocks.forEach((b) => { if (b.type === "text" && b.color) b.color = S.page.accent; }); });
}
function addBlock(type) {
  let b;
  if (type === "text") b = T("New line", { size: 16, mb: 6 });
  else if (type === "divider") b = { id: id(), type: "divider", th: 1, mt: 8, mb: 8 };
  else if (type === "spacer") b = { id: id(), type: "spacer", h: 30 };
  else if (type === "logo") b = { id: id(), type: "logo", src: "", w: 76, mb: 6, align: "center" };
  else b = { id: id(), type: "table", w: 520, headSize: 13, rowSize: 19, rowH: 8, boldLast: false, mt: 0, mb: 0, headers: ["Column 1", "Column 2"], rows: [["&nbsp;", "&nbsp;"]] };
  const i = sel ? S.blocks.indexOf(cur()) + 1 : S.blocks.length;
  S.blocks.splice(i, 0, b); sel = b.id; render(); save();
}

/* ---------- logo: click or drag and drop ---------- */
let logoTarget = null;
function pickLogo(i) { logoTarget = i; $("fImg").value = ""; $("fImg").click(); }
// Downscale big logos (max 800px, keeps PNG transparency) so saved designs stay small.
function shrink(file) {
  return new Promise((ok, bad) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const k = Math.min(1, 800 / Math.max(im.width, im.height)), c = document.createElement("canvas");
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      ok(c.toDataURL(file.type === "image/jpeg" ? "image/jpeg" : "image/png", 0.9));
    };
    im.onerror = bad; im.src = url;
  });
}
async function setLogo(file, i) {
  if (!file || !file.type.startsWith("image/")) return toast("That is not an image");
  let src; try { src = await shrink(file); } catch (e) { return toast("Could not read that image"); }
  let b = i ? blockById(i) : S.blocks.find((x) => x.type === "logo");
  if (!b || b.type !== "logo") { b = { id: id(), type: "logo", src: "", w: 90, mb: 6, align: "center" }; S.blocks.unshift(b); }
  b.src = src; sel = b.id; render(); save(); toast("Logo updated");
}
$("fImg").onchange = (e) => setLogo(e.target.files[0], logoTarget);
const stage = $("stagewrap");
["dragenter", "dragover"].forEach((ev) => stage.addEventListener(ev, (e) => { if ([...e.dataTransfer.types].includes("Files")) { e.preventDefault(); stage.classList.add("hint-drop"); } }));
stage.addEventListener("dragleave", (e) => { if (e.target === stage) stage.classList.remove("hint-drop"); });
stage.addEventListener("drop", (e) => {
  stage.classList.remove("hint-drop");
  const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (!f) return;
  e.preventDefault();
  if (f.type === "application/json" || f.name.endsWith(".json")) return loadJson(f);
  const blk = e.target.closest && e.target.closest(".blk");
  setLogo(f, blk && blockById(blk.dataset.id)?.type === "logo" ? blk.dataset.id : null);
});
document.addEventListener("paste", (e) => {
  const t = e.target;
  if (t && t.isContentEditable) { e.preventDefault(); document.execCommand("insertText", false, (e.clipboardData || window.clipboardData).getData("text/plain")); }
});

